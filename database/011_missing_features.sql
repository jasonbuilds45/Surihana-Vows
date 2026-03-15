-- =============================================================================
-- 011_missing_features.sql
--
-- Adds all tables and column additions from the missing-features build session.
-- Safe to run multiple times — all statements use IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
--
-- New tables:
--   vendors            — wedding day vendor coordination hub
--   family_polls       — couple-created polls for family members
--   family_poll_votes  — one vote per family member per poll
--
-- Column additions:
--   travel_info.category    — categorise rows as hotel/transport/essentials/local/general
--   travel_info.icon        — icon slug for NearbyEssentials UI
--   family_posts.posted_by  — email of the family member who submitted
--   family_posts.post_type  — memory / blessing / milestone / anniversary
--   guests.city             — guest origin city (for GuestOriginMap)
--   guests.country          — guest origin country
-- =============================================================================

-- ── travel_info: category + icon ─────────────────────────────────────────────
ALTER TABLE public.travel_info
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general'
    CHECK (category IN ('hotel', 'transport', 'essentials', 'local', 'general'));

ALTER TABLE public.travel_info
  ADD COLUMN IF NOT EXISTS icon TEXT;

-- ── family_posts: attribution + type ─────────────────────────────────────────
ALTER TABLE public.family_posts
  ADD COLUMN IF NOT EXISTS posted_by TEXT,
  ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'memory'
    CHECK (post_type IN ('memory', 'blessing', 'milestone', 'anniversary'));

-- ── guests: city + country ────────────────────────────────────────────────────
ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS city    TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT;

-- ── vendors ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vendors (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id     UUID NOT NULL,
  vendor_name    TEXT NOT NULL,
  role           TEXT NOT NULL,
  contact_phone  TEXT,
  contact_email  TEXT,
  arrival_time   TEXT,
  setup_notes    TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'arrived', 'done')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_vendors_wedding
    FOREIGN KEY (wedding_id) REFERENCES public.weddings (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vendors_wedding_id
  ON public.vendors (wedding_id);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendors: service role only"
  ON public.vendors FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── family_polls ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.family_polls (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id  UUID NOT NULL,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL DEFAULT '[]',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_family_polls_wedding
    FOREIGN KEY (wedding_id) REFERENCES public.weddings (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_family_polls_wedding_id
  ON public.family_polls (wedding_id);

ALTER TABLE public.family_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "family_polls: service role only"
  ON public.family_polls FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── family_poll_votes ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.family_poll_votes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id      UUID NOT NULL,
  voter_email  TEXT NOT NULL,
  answer       TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT family_poll_votes_unique_vote
    UNIQUE (poll_id, voter_email),
  CONSTRAINT fk_family_poll_votes_poll
    FOREIGN KEY (poll_id) REFERENCES public.family_polls (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_family_poll_votes_poll_id
  ON public.family_poll_votes (poll_id);

ALTER TABLE public.family_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "family_poll_votes: service role only"
  ON public.family_poll_votes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('vendors', 'family_polls', 'family_poll_votes')
ORDER BY table_name;

SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'travel_info'  AND column_name IN ('category', 'icon'))
    OR (table_name = 'family_posts' AND column_name IN ('posted_by', 'post_type'))
    OR (table_name = 'guests'       AND column_name IN ('city', 'country'))
  )
ORDER BY table_name, column_name;
