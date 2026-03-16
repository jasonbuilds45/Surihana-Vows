-- =============================================================================
-- fix_family_users.sql
-- Run this in Supabase Dashboard → SQL Editor
-- Adds missing columns to family_users and other tables that may be incomplete
-- All statements are safe to re-run (IF NOT EXISTS / IF NOT EXISTS guards)
-- =============================================================================

-- ── 1. Add password_hash to family_users (the immediate auth fix) ─────────────
ALTER TABLE public.family_users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- ── 2. Add other columns that may be missing from partial migrations ──────────

-- guests: guest_role, city, country (added in later migrations)
ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS guest_role TEXT CHECK (guest_role IN ('family','friends','bride_side','groom_side','vip')),
  ADD COLUMN IF NOT EXISTS city       TEXT,
  ADD COLUMN IF NOT EXISTS country    TEXT;

-- family_users: ensure role column has correct constraint
-- (safe no-op if already correct)
ALTER TABLE public.family_users
  DROP CONSTRAINT IF EXISTS family_users_role_check;
ALTER TABLE public.family_users
  ADD CONSTRAINT family_users_role_check CHECK (role IN ('family', 'admin'));

-- family_posts: add missing columns
ALTER TABLE public.family_posts
  ADD COLUMN IF NOT EXISTS posted_by  TEXT,
  ADD COLUMN IF NOT EXISTS post_type  TEXT;

-- photos: add is_approved column
ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true;

-- travel_info: add icon and category columns
ALTER TABLE public.travel_info
  ADD COLUMN IF NOT EXISTS icon     TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT;

-- weddings: add extra columns
ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS venue_address  TEXT,
  ADD COLUMN IF NOT EXISTS venue_city     TEXT,
  ADD COLUMN IF NOT EXISTS contact_email  TEXT,
  ADD COLUMN IF NOT EXISTS dress_code     TEXT;

-- events: add description and dress_code
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS dress_code  TEXT;

-- ── 3. Create missing tables if they don't exist ──────────────────────────────

-- family_magic_links
CREATE TABLE IF NOT EXISTS public.family_magic_links (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT NOT NULL,
  token_hash  TEXT NOT NULL,
  redirect_to TEXT NOT NULL DEFAULT '/family',
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT family_magic_links_token_hash_unique UNIQUE (token_hash)
);

-- invite_access_codes
CREATE TABLE IF NOT EXISTS public.invite_access_codes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_hash   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'family',
  used        BOOLEAN NOT NULL DEFAULT false,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invite_access_codes_code_hash_unique UNIQUE (code_hash)
);

-- wedding_stage_overrides
CREATE TABLE IF NOT EXISTS public.wedding_stage_overrides (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id      UUID NOT NULL,
  stage           TEXT CHECK (stage IN ('invitation','live','vault')),
  private_mode    BOOLEAN NOT NULL DEFAULT false,
  live_starts_at  TIMESTAMPTZ,
  live_ends_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wedding_stage_overrides_wedding_id_unique UNIQUE (wedding_id)
);

-- time_capsules
CREATE TABLE IF NOT EXISTS public.time_capsules (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id    UUID NOT NULL,
  author_name   TEXT NOT NULL,
  author_email  TEXT,
  message       TEXT NOT NULL,
  media_url     TEXT,
  post_type     TEXT NOT NULL DEFAULT 'timed'
                  CHECK (post_type IN ('anniversary','life_event','timed','video')),
  unlock_date   TIMESTAMPTZ NOT NULL,
  is_revealed   BOOLEAN NOT NULL DEFAULT false,
  notify_sent   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- guest_predictions
CREATE TABLE IF NOT EXISTS public.guest_predictions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id        UUID NOT NULL,
  question_id       TEXT NOT NULL,
  answer            TEXT NOT NULL,
  guest_name        TEXT NOT NULL,
  guest_identifier  TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT guest_predictions_unique UNIQUE (wedding_id, question_id, guest_identifier)
);

-- vendors
CREATE TABLE IF NOT EXISTS public.vendors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id      UUID NOT NULL,
  vendor_name     TEXT NOT NULL,
  role            TEXT NOT NULL,
  contact_phone   TEXT,
  contact_email   TEXT,
  arrival_time    TEXT,
  setup_notes     TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','arrived','done')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- family_polls
CREATE TABLE IF NOT EXISTS public.family_polls (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id  UUID NOT NULL,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL DEFAULT '[]',
  created_by  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- family_poll_votes
CREATE TABLE IF NOT EXISTS public.family_poll_votes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id    UUID NOT NULL,
  voter      TEXT NOT NULL,
  option_idx INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT family_poll_votes_unique UNIQUE (poll_id, voter)
);

-- ── 4. Verify family_users now has password_hash ──────────────────────────────
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'family_users'
ORDER BY ordinal_position;
