-- ==============================================================================
-- ROLLBACK SCRIPT FOR NYUMBAGO LEGAL & COMPLIANCE LAYER
-- Migration Version: 20261027000001_legal_compliance_rollback.sql
-- ==============================================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.user_blocks CASCADE;
DROP TABLE IF EXISTS public.admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.data_requests CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.user_consents CASCADE;
DROP TABLE IF EXISTS public.legal_documents CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Revert columns from listings table
ALTER TABLE IF EXISTS public.listings
  DROP COLUMN IF EXISTS last_confirmed_available_at,
  DROP COLUMN IF EXISTS is_stale,
  DROP COLUMN IF EXISTS reported_count;

-- Confirm completion
SELECT 'Rollback of legal and compliance migration completed successfully.' as status;
