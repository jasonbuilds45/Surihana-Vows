-- =============================================================================
-- 002_missing_tables.sql
-- CREATE TABLE for the 3 tables previously queried with (client as any) casts.
-- Run AFTER 001_initial_schema.sql.
-- =============================================================================

-- ── family_magic_links ───────────────────────────────────────────────────────
-- Stores one-time sign-in tokens for family users.
-- token_hash is a SHA-256 of the raw token (never store raw tokens in the DB).
-- consumed_at is set when the link is clicked — prevents replay attacks.
CREATE TABLE IF NOT EXISTS public.family_magic_links (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_user_id  UUID NOT NULL,
  email           TEXT NOT NULL,
  token_hash      TEXT NOT NULL,
  redirect_to     TEXT NOT NULL DEFAULT '/family',
  expires_at      TIMESTAMPTZ NOT NULL,
  consumed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT family_magic_links_token_hash_unique UNIQUE (token_hash)
);

-- ── invite_access_codes ──────────────────────────────────────────────────────
-- Short-lived codes for guests who don't have a password or magic link.
-- code_hash is a SHA-256 of the raw access code (same reason as above).
-- family_user_id is nullable: if set, looked up from family_users.
-- email + role provide a fallback for synthesised guest accounts.
CREATE TABLE IF NOT EXISTS public.invite_access_codes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_hash       TEXT NOT NULL,
  family_user_id  UUID,
  email           TEXT,
  role            TEXT CHECK (role IN ('family', 'admin')),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invite_access_codes_code_hash_unique UNIQUE (code_hash)
);

-- ── wedding_stage_overrides ──────────────────────────────────────────────────
-- Allows an admin to manually force the lifecycle stage for a wedding,
-- bypassing the timeline-based inference in lifecycle-orchestrator.ts.
-- One row per wedding; insert/upsert to change stage.
CREATE TABLE IF NOT EXISTS public.wedding_stage_overrides (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id    UUID NOT NULL,
  stage         TEXT CHECK (stage IN ('invitation', 'live', 'vault')),
  private_mode  BOOLEAN NOT NULL DEFAULT false,
  live_starts_at TIMESTAMPTZ,
  live_ends_at   TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wedding_stage_overrides_wedding_id_unique UNIQUE (wedding_id)
);
