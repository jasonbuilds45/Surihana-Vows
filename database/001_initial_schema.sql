-- =============================================================================
-- 001_initial_schema.sql
-- Full CREATE TABLE statements for all 11 typed tables.
-- Derived from lib/supabase.types.ts as of Phase 3.
-- Run AFTER enabling the uuid-ossp extension (first line below).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── weddings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.weddings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bride_name    TEXT NOT NULL,
  groom_name    TEXT NOT NULL,
  wedding_date  DATE NOT NULL,
  venue_name    TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── guests ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.guests (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id     UUID NOT NULL,
  guest_name     TEXT NOT NULL,
  family_name    TEXT,
  phone          TEXT,
  invite_code    TEXT NOT NULL,
  invite_opened  BOOLEAN NOT NULL DEFAULT false,
  device_type    TEXT,
  opened_at      TIMESTAMPTZ,
  CONSTRAINT guests_invite_code_unique UNIQUE (invite_code)
);

-- ── rsvp ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rsvp (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id     UUID NOT NULL,
  attending    BOOLEAN NOT NULL,
  guest_count  INTEGER NOT NULL DEFAULT 1,
  message      TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rsvp_guest_id_unique UNIQUE (guest_id)
);

-- ── events ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id  UUID NOT NULL,
  event_name  TEXT NOT NULL,
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  venue       TEXT NOT NULL,
  map_link    TEXT NOT NULL
);

-- ── guest_messages ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.guest_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name  TEXT NOT NULL,
  message     TEXT NOT NULL,
  wedding_id  UUID NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── photos ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.photos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id   UUID NOT NULL,
  image_url    TEXT NOT NULL,
  uploaded_by  TEXT NOT NULL,
  category     TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── videos ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.videos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id  UUID NOT NULL,
  title       TEXT NOT NULL,
  video_url   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── travel_info ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.travel_info (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id  UUID NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  link        TEXT NOT NULL
);

-- ── invite_analytics ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invite_analytics (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id  UUID NOT NULL,
  action    TEXT NOT NULL,
  device    TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── family_users ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.family_users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('family', 'admin')),
  password_hash TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT family_users_email_unique UNIQUE (email)
);

-- ── family_posts ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.family_posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id  UUID NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  media_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
