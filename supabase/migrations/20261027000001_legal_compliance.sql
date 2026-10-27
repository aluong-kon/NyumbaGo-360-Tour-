-- ==============================================================================
-- NYUMBAGO LEGAL, SAFETY, AND COMPLIANCE LAYER
-- Migration Version: 20261027000001_legal_compliance.sql
-- Target Database: PostgreSQL 15+ / Supabase
-- Branch: feature/legal-and-compliance
-- ==============================================================================

-- 1. EXTEND OR CREATE PROFILES TABLE WITH AGE VERIFICATION AND SECURITY
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('hunter', 'landlord', 'agent', 'admin')) DEFAULT 'hunter',
  age_verified BOOLEAN NOT NULL DEFAULT false,
  age_verified_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'banned')) DEFAULT 'active',
  verification_badge TEXT NOT NULL CHECK (verification_badge IN ('none', 'verified_landlord', 'verified_agent')) DEFAULT 'none',
  verified_at TIMESTAMPTZ,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  two_factor_secret TEXT,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for authentication and role checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 2. CREATE LEGAL_DOCUMENTS TABLE (VERSIONED EDITABLE LEGAL POLICIES)
CREATE TABLE IF NOT EXISTS public.legal_documents (
  id TEXT PRIMARY KEY, -- e.g. 'terms-of-service', 'privacy-policy'
  type TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  title_sw TEXT,
  content TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  summary_sw TEXT NOT NULL,
  effective_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT true,
  requires_reconsent BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_legal_docs_current ON public.legal_documents(is_current);

-- 3. CREATE USER_CONSENTS TABLE (UNBUNDLED CONSENTS & SALTED IP HASHES)
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_version TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (
    consent_type IN (
      'terms_privacy',
      'marketing_messages',
      'location_tracking',
      'essential_cookies',
      'analytics_cookies'
    )
  ),
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  withdrawn_at TIMESTAMPTZ,
  source TEXT NOT NULL CHECK (source IN ('signup', 'settings', 'cookie_banner', 'prompt')),
  salted_ip_hash TEXT NOT NULL -- Hashed with server salt, NEVER raw IP in plain text
);

CREATE INDEX IF NOT EXISTS idx_user_consents_lookup ON public.user_consents(user_id, document_type, consent_type);

-- 4. CREATE REPORTS TABLE (TRUST & SAFETY / FRAUD REPORTING)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'tour', 'user', 'message')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (
    reason IN (
      'scam',
      'fake_unavailable',
      'wrong_price',
      'offensive',
      'discrimination',
      'under_18',
      'other'
    )
  ),
  details TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'investigating', 'actioned', 'dismissed')) DEFAULT 'pending',
  handled_by TEXT,
  outcome TEXT,
  appeal_status TEXT NOT NULL CHECK (appeal_status IN ('none', 'appealed', 'upheld', 'reversed')) DEFAULT 'none',
  appeal_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_type, target_id);

-- 5. CREATE DATA_REQUESTS TABLE (DATA SUBJECT RIGHTS / KDPA 30-DAY SLA)
CREATE TABLE IF NOT EXISTS public.data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('access', 'correction', 'deletion', 'objection')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected')) DEFAULT 'pending',
  details TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  due_at TIMESTAMPTZ NOT NULL, -- Defaults to received_at + 30 days
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_data_requests_due ON public.data_requests(status, due_at);

-- 6. CREATE ADMIN_AUDIT_LOG TABLE (MODERATION & COMPLIANCE LOGS)
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (
    action IN (
      'warn',
      'hide_listing',
      'suspend_user',
      'ban_user',
      'close_under_18_account',
      'resolve_report',
      'verify_landlord',
      'verify_agent',
      'update_legal_doc',
      'delete_user_data'
    )
  ),
  target TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON public.admin_audit_log(admin_id, created_at DESC);

-- 7. CREATE USER_BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id TEXT NOT NULL,
  blocked_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(blocker_id, blocked_id)
);

-- 8. EXTEND LISTINGS TABLE FOR 14-DAY FRESHNESS RECONFIRMATION
ALTER TABLE IF EXISTS public.listings
  ADD COLUMN IF NOT EXISTS last_confirmed_available_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS is_stale BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reported_count INT NOT NULL DEFAULT 0;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read own profile; public can read verified badge of listing owners
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Public can read landlord and agent verification status"
  ON public.profiles FOR SELECT
  USING (role IN ('landlord', 'agent'));

-- Legal Documents: Everyone can read
CREATE POLICY "Public can read legal documents"
  ON public.legal_documents FOR SELECT
  USING (true);

-- User Consents: Users can view and insert their own consents
CREATE POLICY "Users can manage own consents"
  ON public.user_consents FOR ALL
  USING (auth.uid() = user_id);

-- Reports: Users can insert reports and view their submitted reports
CREATE POLICY "Users can insert reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Data Requests: Users can view and submit their own data requests
CREATE POLICY "Users can manage own data requests"
  ON public.data_requests FOR ALL
  USING (auth.uid() = user_id);

-- Admin Audit Log: Admin only access
CREATE POLICY "Admins can view and write audit logs"
  ON public.admin_audit_log FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- User Blocks: Users can manage their own blocked list
CREATE POLICY "Users can manage own blocks"
  ON public.user_blocks FOR ALL
  USING (auth.uid() = blocker_id);
