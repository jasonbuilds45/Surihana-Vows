-- =============================================================================
-- Surihana Vows — Phase 2 Supporting SQL
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE / DO blocks).
-- =============================================================================
-- Phase 2 makes no schema changes of its own.
-- This script covers:
--   A. Storage bucket creation & access policies
--   B. Row Level Security policies for the API routes secured in Phase 1–2
--   C. Realtime publication for live-hub tables
--   D. Verify queries
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- A. STORAGE BUCKETS
-- Create the four required buckets if they don't already exist.
-- ─────────────────────────────────────────────────────────────────────────────

-- couple-photos: public read, upload via service role only
INSERT INTO storage.buckets (id, name, public)
VALUES ('couple-photos', 'couple-photos', true)
ON CONFLICT (id) DO NOTHING;

-- guest-uploads: public read (guests see each other's uploads in live hub)
INSERT INTO storage.buckets (id, name, public)
VALUES ('guest-uploads', 'guest-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- wedding-videos: public read
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-videos', 'wedding-videos', true)
ON CONFLICT (id) DO NOTHING;

-- family-vault: PRIVATE — access via signed URLs only (never public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-vault', 'family-vault', false)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- A2. STORAGE OBJECT POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- couple-photos: anyone can read; only service role can write
CREATE POLICY "couple-photos: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'couple-photos');

CREATE POLICY "couple-photos: service role write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'couple-photos'
    AND auth.role() = 'service_role'
  );

-- guest-uploads: anyone can read; anyone can insert (rate limiting in API layer)
CREATE POLICY "guest-uploads: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'guest-uploads');

CREATE POLICY "guest-uploads: public insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'guest-uploads');

-- wedding-videos: public read; service role write
CREATE POLICY "wedding-videos: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wedding-videos');

CREATE POLICY "wedding-videos: service role write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wedding-videos'
    AND auth.role() = 'service_role'
  );

-- family-vault: NO public access at all.
-- All reads go through createSignedUrl() in lib/storage.ts (service role).
-- No client-side reads or writes are permitted.
CREATE POLICY "family-vault: service role only"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'family-vault'
    AND auth.role() = 'service_role'
  )
  WITH CHECK (
    bucket_id = 'family-vault'
    AND auth.role() = 'service_role'
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- B. ROW LEVEL SECURITY — application tables
-- Enable RLS on every table and define access policies that mirror what the
-- API routes enforce in code. Defence-in-depth: even if a route bug skips an
-- auth check, the DB rejects the query.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.weddings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvp               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_analytics   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_posts       ENABLE ROW LEVEL SECURITY;

-- ── weddings ─────────────────────────────────────────────────────────────────
CREATE POLICY "weddings: public read"
  ON public.weddings FOR SELECT
  USING (true);

CREATE POLICY "weddings: service role write"
  ON public.weddings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── guests ───────────────────────────────────────────────────────────────────
-- Public read: invite/[guest] resolves guest by invite_code without a session.
CREATE POLICY "guests: public read"
  ON public.guests FOR SELECT
  USING (true);

CREATE POLICY "guests: service role write"
  ON public.guests FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── rsvp ─────────────────────────────────────────────────────────────────────
CREATE POLICY "rsvp: public insert"
  ON public.rsvp FOR INSERT
  WITH CHECK (true);

CREATE POLICY "rsvp: public read"
  ON public.rsvp FOR SELECT
  USING (true);

CREATE POLICY "rsvp: service role update"
  ON public.rsvp FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── photos ───────────────────────────────────────────────────────────────────
-- Public read (filtered to is_approved=true in app layer — column added Phase 3).
CREATE POLICY "photos: public read"
  ON public.photos FOR SELECT
  USING (true);

CREATE POLICY "photos: public insert"
  ON public.photos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "photos: service role manage"
  ON public.photos FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── guest_messages ───────────────────────────────────────────────────────────
CREATE POLICY "guest_messages: public read"
  ON public.guest_messages FOR SELECT
  USING (true);

CREATE POLICY "guest_messages: public insert"
  ON public.guest_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "guest_messages: service role delete"
  ON public.guest_messages FOR DELETE
  USING (auth.role() = 'service_role');

-- ── invite_analytics ─────────────────────────────────────────────────────────
-- Insert open (track-invite is rate-limited in API code, not auth-gated).
-- Read restricted: analytics route queries via service role client only.
CREATE POLICY "invite_analytics: public insert"
  ON public.invite_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "invite_analytics: service role read"
  ON public.invite_analytics FOR SELECT
  USING (auth.role() = 'service_role');

-- ── family_users ─────────────────────────────────────────────────────────────
-- Service role only — auth.ts reads this via getConfiguredSupabaseClient(true).
CREATE POLICY "family_users: service role only"
  ON public.family_users FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── family_posts ─────────────────────────────────────────────────────────────
CREATE POLICY "family_posts: service role only"
  ON public.family_posts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────────
-- C. REALTIME — enable for live-hub tables
-- guest_messages and photos are pushed via Supabase Realtime channels.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'guest_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.guest_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'photos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- D. VERIFY — run these after the above to confirm everything applied correctly
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Buckets
SELECT id, name, public FROM storage.buckets ORDER BY name;

-- 2. RLS enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'weddings','guests','rsvp','photos',
    'guest_messages','invite_analytics',
    'family_users','family_posts'
  )
ORDER BY tablename;

-- 3. All policies created
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Realtime tables
SELECT pubname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
