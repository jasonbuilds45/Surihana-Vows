-- =============================================================================
-- 005_schema_additions.sql
-- Adds missing columns to weddings and events tables.
-- All ALTER TABLE statements are safe to re-run (column already exists → no-op).
-- Run AFTER 001–004.
-- =============================================================================

-- ── weddings: venue address, contact, dress code ─────────────────────────────
ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS venue_address TEXT,
  ADD COLUMN IF NOT EXISTS venue_city    TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS dress_code    TEXT;

-- ── events: description, dress code ─────────────────────────────────────────
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS dress_code  TEXT;

-- ── Verify columns were added ────────────────────────────────────────────────
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('weddings', 'events')
  AND column_name IN (
    'venue_address', 'venue_city', 'contact_email', 'dress_code', 'description'
  )
ORDER BY table_name, column_name;
