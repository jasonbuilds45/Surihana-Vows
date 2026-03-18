-- =============================================================================
-- 014_squad_profile.sql
--
-- Adds profile columns to squad_proposals so bridesmaids and groomsmen
-- can fill in their details after accepting the proposal.
--
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================================

ALTER TABLE public.squad_proposals
  ADD COLUMN IF NOT EXISTS profile_full_name      TEXT,
  ADD COLUMN IF NOT EXISTS profile_phone          TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url      TEXT,
  ADD COLUMN IF NOT EXISTS profile_dress_size     TEXT,
  ADD COLUMN IF NOT EXISTS profile_dietary        TEXT,
  ADD COLUMN IF NOT EXISTS profile_emergency_name TEXT,
  ADD COLUMN IF NOT EXISTS profile_emergency_phone TEXT,
  ADD COLUMN IF NOT EXISTS profile_completed_at   TIMESTAMPTZ;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'squad_proposals'
  AND column_name LIKE 'profile_%'
ORDER BY ordinal_position;
