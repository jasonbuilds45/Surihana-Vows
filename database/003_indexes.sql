-- =============================================================================
-- 003_indexes.sql
-- Performance-critical indexes for all 14 tables.
-- All statements use IF NOT EXISTS — safe to re-run.
-- Run AFTER 001 and 002.
-- =============================================================================

-- ── guests ───────────────────────────────────────────────────────────────────
-- invite_code lookup is the most frequent query (every page load of /invite/[guest]).
-- Already UNIQUE from 001, so the index is created automatically.
-- Explicit declaration here keeps the migration self-documenting.
CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_invite_code
  ON public.guests (invite_code);

-- wedding_id: used to list all guests for a wedding in the admin dashboard.
CREATE INDEX IF NOT EXISTS idx_guests_wedding_id
  ON public.guests (wedding_id);

-- ── rsvp ─────────────────────────────────────────────────────────────────────
-- guest_id: most rsvp queries are keyed by guest_id (check existing RSVP, upsert).
-- Already UNIQUE from 001; explicit here for documentation.
CREATE UNIQUE INDEX IF NOT EXISTS idx_rsvp_guest_id
  ON public.rsvp (guest_id);

-- ── events ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_wedding_id
  ON public.events (wedding_id);

-- ── photos ───────────────────────────────────────────────────────────────────
-- Composite: gallery queries always filter by wedding_id and often by category.
CREATE INDEX IF NOT EXISTS idx_photos_wedding_id_category
  ON public.photos (wedding_id, category);

-- created_at DESC for "latest uploads" ordering in live feed and gallery.
CREATE INDEX IF NOT EXISTS idx_photos_created_at_desc
  ON public.photos (created_at DESC);

-- ── guest_messages ───────────────────────────────────────────────────────────
-- Composite: guestbook queries filter by wedding_id and order by created_at DESC.
CREATE INDEX IF NOT EXISTS idx_guest_messages_wedding_id_created_at
  ON public.guest_messages (wedding_id, created_at DESC);

-- ── invite_analytics ─────────────────────────────────────────────────────────
-- guest_id: analytics joins are always keyed on guest_id.
CREATE INDEX IF NOT EXISTS idx_invite_analytics_guest_id
  ON public.invite_analytics (guest_id);

-- timestamp DESC: recent-activity queries order by timestamp descending.
CREATE INDEX IF NOT EXISTS idx_invite_analytics_timestamp_desc
  ON public.invite_analytics (timestamp DESC);

-- ── videos ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_videos_wedding_id
  ON public.videos (wedding_id);

-- ── travel_info ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_travel_info_wedding_id
  ON public.travel_info (wedding_id);

-- ── family_posts ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_family_posts_wedding_id
  ON public.family_posts (wedding_id);

CREATE INDEX IF NOT EXISTS idx_family_posts_created_at_desc
  ON public.family_posts (created_at DESC);

-- ── family_magic_links ───────────────────────────────────────────────────────
-- token_hash: primary lookup path when validating an incoming magic link click.
-- Already UNIQUE from 002; explicit here for documentation.
CREATE UNIQUE INDEX IF NOT EXISTS idx_family_magic_links_token_hash
  ON public.family_magic_links (token_hash);

-- expires_at: used by cleanup jobs to find and delete expired tokens.
CREATE INDEX IF NOT EXISTS idx_family_magic_links_expires_at
  ON public.family_magic_links (expires_at);

-- ── invite_access_codes ──────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_invite_access_codes_code_hash
  ON public.invite_access_codes (code_hash);

-- ── wedding_stage_overrides ──────────────────────────────────────────────────
-- wedding_id: primary lookup (one override per wedding).
-- Already UNIQUE from 002.
CREATE UNIQUE INDEX IF NOT EXISTS idx_wedding_stage_overrides_wedding_id
  ON public.wedding_stage_overrides (wedding_id);
