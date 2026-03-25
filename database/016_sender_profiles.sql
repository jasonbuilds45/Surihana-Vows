-- ─────────────────────────────────────────────────────────────────────────────
-- 016_sender_profiles.sql
-- Sender Profile system — allows parents and siblings to send wedding
-- invitations (both generic and personalised) under their own name.
--
-- Two changes:
--   1. New table: sender_profiles
--   2. New nullable column on guests: sender_id → sender_profiles(id)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Table ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sender_profiles (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id    UUID        NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,

  -- What appears as the host name at the top of the invite
  -- e.g. "Mr & Mrs Philip Jemima"
  display_title TEXT        NOT NULL,

  -- The line below the host name
  -- e.g. "request the honour of your presence at the marriage of their daughter"
  sub_text      TEXT        NOT NULL DEFAULT 'joyfully invite you to celebrate',

  -- Which side of the family this sender belongs to
  side          TEXT        NOT NULL DEFAULT 'both'
                CHECK (side IN ('bride', 'groom', 'both')),

  -- The sender type — used for admin UI grouping only
  sender_type   TEXT        NOT NULL DEFAULT 'parents'
                CHECK (sender_type IN ('parents', 'sibling', 'joint', 'other')),

  -- URL-safe slug used in ?from= query parameter
  -- e.g. "brides-parents", "grooms-brother"
  -- Must be unique per wedding
  sender_code   TEXT        NOT NULL,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT sender_profiles_code_unique UNIQUE (wedding_id, sender_code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sender_profiles_wedding_id
  ON sender_profiles(wedding_id);

CREATE INDEX IF NOT EXISTS idx_sender_profiles_sender_code
  ON sender_profiles(sender_code);

-- RLS
ALTER TABLE sender_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sender_profiles_read"
  ON sender_profiles FOR SELECT USING (true);

CREATE POLICY "sender_profiles_insert"
  ON sender_profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "sender_profiles_update"
  ON sender_profiles FOR UPDATE USING (true);

CREATE POLICY "sender_profiles_delete"
  ON sender_profiles FOR DELETE USING (true);


-- ── Add sender_id to guests ───────────────────────────────────────────────────
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS sender_id UUID
  REFERENCES sender_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_guests_sender_id
  ON guests(sender_id);


-- ── Seed data for Marion & Livingston's wedding ───────────────────────────────
-- Replace the wedding_id value with your actual wedding UUID from Supabase.
-- Run the SELECT below first to get it:
--   SELECT id FROM weddings LIMIT 1;
--
-- Then uncomment and run the INSERT below, substituting your real wedding id.

-- INSERT INTO sender_profiles (id, wedding_id, display_title, sub_text, side, sender_type, sender_code) VALUES
--   (gen_random_uuid(), 'YOUR-WEDDING-UUID-HERE', 'Mr & Mrs Philip Jemima',       'request the honour of your presence at the marriage of their daughter', 'bride', 'parents',  'brides-parents'),
--   (gen_random_uuid(), 'YOUR-WEDDING-UUID-HERE', 'Mr & Mrs Samuel Livingston',   'request the honour of your presence at the marriage of their son',      'groom', 'parents',  'grooms-parents'),
--   (gen_random_uuid(), 'YOUR-WEDDING-UUID-HERE', 'The families of Marion & Livingston', 'together joyfully invite you to celebrate their union',          'both',  'joint',    'both-families');
