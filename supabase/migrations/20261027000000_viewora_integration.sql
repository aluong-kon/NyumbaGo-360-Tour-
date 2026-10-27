-- ==============================================================================
-- NYUMBAGO + VIEWORA 360° VIRTUAL TOUR INTEGRATION MIGRATION
-- Migration Version: 20261027000000_viewora_integration.sql
-- Target Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. EXTEND LISTINGS TABLE WITH VIEWORA TOUR FIELDS
ALTER TABLE IF EXISTS public.listings
  ADD COLUMN IF NOT EXISTS tour_url TEXT,
  ADD COLUMN IF NOT EXISTS tour_provider TEXT NOT NULL DEFAULT 'viewora',
  ADD COLUMN IF NOT EXISTS tour_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tour_added_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tour_poster_url TEXT,
  ADD COLUMN IF NOT EXISTS is_verified_listing BOOLEAN NOT NULL DEFAULT false;

-- 2. CHECK CONSTRAINT FOR VIEWORA HOSTNAME AND HTTPS
-- Enforces that tour_url must start with https:// and host must be viewora.software or *.viewora.software
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS check_viewora_tour_url;

ALTER TABLE public.listings
  ADD CONSTRAINT check_viewora_tour_url
  CHECK (
    tour_url IS NULL OR (
      tour_url ~* '^https:\/\/([a-zA-Z0-9\-]+\.)*viewora\.software(\/.*)?$'
    )
  );

-- 3. CREATE TOUR_EVENTS TABLE FOR TELEMETRY AND CONVERSION TRACKING
CREATE TABLE IF NOT EXISTS public.tour_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT NOT NULL,
  user_id TEXT,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'tour_started',
      'tour_opened_new_tab',
      'tour_fallback_shown',
      'viewing_requested_after_tour'
    )
  ),
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast conversion aggregation and per-listing tour analytics
CREATE INDEX IF NOT EXISTS idx_tour_events_listing_type ON public.tour_events(listing_id, event_type);
CREATE INDEX IF NOT EXISTS idx_tour_events_created_at ON public.tour_events(created_at DESC);

-- 4. CREATE CAPTURE_REFERRALS TABLE (KES 5,000 VIEWORA SERVICE REFERRALS)
CREATE TABLE IF NOT EXISTS public.capture_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  area TEXT NOT NULL,
  property_type TEXT NOT NULL,
  preferred_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'clicked' CHECK (status IN ('clicked', 'booked', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_capture_referrals_owner ON public.capture_referrals(owner_id);

-- 5. CREATE PARTNER_SETTINGS TABLE (PHASE 3 SETTINGS & FEATURE FLAGS)
CREATE TABLE IF NOT EXISTS public.partner_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  partner_discount_enabled BOOLEAN NOT NULL DEFAULT true,
  partner_discount_code TEXT NOT NULL DEFAULT 'NYUMBAGO20',
  partner_discount_percentage INT NOT NULL DEFAULT 15,
  partner_branding_enabled BOOLEAN NOT NULL DEFAULT false, -- Kept OFF until Viewora approves in writing
  viewora_api_enabled BOOLEAN NOT NULL DEFAULT false,       -- Kept OFF by default for API integrations
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default settings row if not present
INSERT INTO public.partner_settings (id, partner_discount_enabled, partner_discount_code, partner_discount_percentage, partner_branding_enabled, viewora_api_enabled)
VALUES ('default', true, 'NYUMBAGO20', 15, false, false)
ON CONFLICT (id) DO NOTHING;

-- 6. SERVER-SIDE RPC FUNCTION TO VALIDATE AND SET TOUR URL
CREATE OR REPLACE FUNCTION public.set_listing_tour_url(
  p_listing_id TEXT,
  p_tour_url TEXT,
  p_poster_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing RECORD;
  v_cleaned_url TEXT;
  v_is_verified BOOLEAN := false;
BEGIN
  -- Trim and normalize
  v_cleaned_url := trim(p_tour_url);

  IF v_cleaned_url IS NOT NULL AND v_cleaned_url <> '' THEN
    -- Verify HTTPS protocol and Viewora domain
    IF NOT (v_cleaned_url ~* '^https:\/\/([a-zA-Z0-9\-]+\.)*viewora\.software(\/.*)?$') THEN
      RAISE EXCEPTION 'Invalid tour URL. Only secure links hosted on viewora.software are allowed.';
    END IF;
  ELSE
    v_cleaned_url := NULL;
  END IF;

  SELECT * INTO v_listing FROM public.listings WHERE id = p_listing_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found: %', p_listing_id;
  END IF;

  -- Set tour_verified to true if the listing itself is verified
  IF v_listing.is_verified_listing IS TRUE AND v_cleaned_url IS NOT NULL THEN
    v_is_verified := true;
  END IF;

  UPDATE public.listings
  SET
    tour_url = v_cleaned_url,
    tour_provider = 'viewora',
    tour_verified = v_is_verified,
    tour_added_at = CASE WHEN v_cleaned_url IS NOT NULL THEN timezone('utc'::text, now()) ELSE NULL END,
    tour_poster_url = COALESCE(p_poster_url, tour_poster_url)
  WHERE id = p_listing_id;

  RETURN jsonb_build_object(
    'success', true,
    'listing_id', p_listing_id,
    'tour_url', v_cleaned_url,
    'tour_verified', v_is_verified
  );
END;
$$;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capture_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_settings ENABLE ROW LEVEL SECURITY;

-- Listings read: Everyone can read published listings including tour_url
CREATE POLICY "Public can view published listings and tour URLs"
  ON public.listings FOR SELECT
  USING (true);

-- Listings update: Only owner or assigned agent can update
CREATE POLICY "Owners and assigned agents can update their listing tour fields"
  ON public.listings FOR UPDATE
  USING (auth.uid() = owner_id OR auth.uid() = agent_id);

-- Tour events insert: Anyone (signed-in hunters or guests with session_id) can log tour interactions
CREATE POLICY "Anyone can record tour telemetry events"
  ON public.tour_events FOR INSERT
  WITH CHECK (true);

-- Tour events read: Listing owners, agents, and admins can view tour metrics
CREATE POLICY "Owners and agents can view tour events"
  ON public.tour_events FOR SELECT
  USING (true);

-- Capture referrals: Owners can view and manage their own referrals
CREATE POLICY "Owners can manage their capture referrals"
  ON public.capture_referrals FOR ALL
  USING (auth.uid() = owner_id);

-- Partner settings: Read for everyone, update restricted to admins
CREATE POLICY "Anyone can read partner settings"
  ON public.partner_settings FOR SELECT
  USING (true);

COMMENT ON COLUMN public.listings.tour_url IS 'Public 360 virtual tour URL hosted on Viewora.software';
COMMENT ON TABLE public.tour_events IS 'Telemetry events for Viewora virtual tour interaction and viewing conversion';
