-- =============================================================================
-- 007_time_capsule.sql
--
-- The Wedding Time Capsule system.
--
-- Guests and family members write messages that are locked until a future
-- unlock_date. On the family vault page, locked capsules show a countdown;
-- revealed capsules display the full message.
--
-- post_type values:
--   'anniversary'  — tied to a specific anniversary year
--   'life_event'   — "when your first child is born", "when you move", etc.
--   'timed'        — simply opens on a calendar date
--   'video'        — media_url points to an embed URL (YouTube / Vimeo)
--
-- The pg_cron job at the bottom of this file runs daily at 07:00 UTC and
-- marks capsules as revealed when unlock_date <= now(). Enable the pg_cron
-- extension in Supabase Dashboard → Database → Extensions first.
-- =============================================================================

-- ── time_capsules ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.time_capsules (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id    UUID NOT NULL,
  author_name   TEXT NOT NULL,
  -- author_email receives the "a memory is waiting" notification email when
  -- the capsule unlocks. Optional — guests without email still leave capsules.
  author_email  TEXT,
  message       TEXT NOT NULL,
  -- media_url: optional image (Supabase family-vault bucket) or video embed URL
  media_url     TEXT,
  -- post_type drives the label shown in the vault UI
  post_type     TEXT NOT NULL DEFAULT 'timed'
                  CHECK (post_type IN ('anniversary', 'life_event', 'timed', 'video')),
  -- unlock_date: the UTC timestamp when the capsule becomes visible.
  -- Storing as TIMESTAMPTZ means timezone-safe comparisons.
  unlock_date   TIMESTAMPTZ NOT NULL,
  -- is_revealed: set to true by the daily pg_cron job OR on vault page load
  -- when unlock_date <= now(). Treated as a cache — never go backwards.
  is_revealed   BOOLEAN NOT NULL DEFAULT false,
  -- notify_sent: prevents duplicate "memory waiting" emails
  notify_sent   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_time_capsules_wedding_id
    FOREIGN KEY (wedding_id) REFERENCES public.weddings (id) ON DELETE CASCADE
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_time_capsules_wedding_id
  ON public.time_capsules (wedding_id);

CREATE INDEX IF NOT EXISTS idx_time_capsules_unlock_date
  ON public.time_capsules (unlock_date)
  WHERE is_revealed = false;

CREATE INDEX IF NOT EXISTS idx_time_capsules_notify
  ON public.time_capsules (unlock_date)
  WHERE is_revealed = true AND notify_sent = false;

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;

-- Public can INSERT (guests leave capsules without auth)
CREATE POLICY "public can insert time capsules"
  ON public.time_capsules FOR INSERT
  WITH CHECK (true);

-- Only revealed capsules are readable by the anon role (family vault page
-- queries via the service role key, so it bypasses RLS and sees everything)
CREATE POLICY "anon can read revealed capsules"
  ON public.time_capsules FOR SELECT
  USING (is_revealed = true);

-- ── pg_cron: daily reveal job ─────────────────────────────────────────────────
-- Requires the pg_cron extension (Supabase Dashboard → Database → Extensions).
-- This job runs at 07:00 UTC every day and reveals any capsules whose
-- unlock_date has passed but are not yet marked as revealed.
--
-- To enable, paste this block separately in the Supabase SQL editor AFTER
-- enabling the pg_cron extension:
--
-- SELECT cron.schedule(
--   'surihana-reveal-capsules',
--   '0 7 * * *',
--   $$
--     UPDATE public.time_capsules
--     SET is_revealed = true
--     WHERE unlock_date <= now()
--       AND is_revealed = false;
--   $$
-- );
--
-- To view scheduled jobs:   SELECT * FROM cron.job;
-- To remove the job:        SELECT cron.unschedule('surihana-reveal-capsules');
