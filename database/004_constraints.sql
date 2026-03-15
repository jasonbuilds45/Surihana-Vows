-- =============================================================================
-- 004_constraints.sql
-- Foreign key constraints and the UNIQUE constraint on rsvp.guest_id.
-- Each ADD CONSTRAINT is wrapped in a DO block so re-runs are safe.
-- Run AFTER 001, 002, and 003.
-- =============================================================================

DO $$ BEGIN

  -- ── guests.wedding_id → weddings.id ────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_guests_wedding_id'
      AND table_name = 'guests'
  ) THEN
    ALTER TABLE public.guests
      ADD CONSTRAINT fk_guests_wedding_id
      FOREIGN KEY (wedding_id)
      REFERENCES public.weddings (id)
      ON DELETE CASCADE;
  END IF;

  -- ── rsvp.guest_id → guests.id ──────────────────────────────────────────────
  -- ON DELETE CASCADE: deleting a guest also removes their RSVP.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_rsvp_guest_id'
      AND table_name = 'rsvp'
  ) THEN
    ALTER TABLE public.rsvp
      ADD CONSTRAINT fk_rsvp_guest_id
      FOREIGN KEY (guest_id)
      REFERENCES public.guests (id)
      ON DELETE CASCADE;
  END IF;

  -- ── events.wedding_id → weddings.id ────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_events_wedding_id'
      AND table_name = 'events'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT fk_events_wedding_id
      FOREIGN KEY (wedding_id)
      REFERENCES public.weddings (id)
      ON DELETE CASCADE;
  END IF;

  -- ── photos.wedding_id → weddings.id ────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_photos_wedding_id'
      AND table_name = 'photos'
  ) THEN
    ALTER TABLE public.photos
      ADD CONSTRAINT fk_photos_wedding_id
      FOREIGN KEY (wedding_id)
      REFERENCES public.weddings (id)
      ON DELETE CASCADE;
  END IF;

  -- ── guest_messages.wedding_id → weddings.id ────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_guest_messages_wedding_id'
      AND table_name = 'guest_messages'
  ) THEN
    ALTER TABLE public.guest_messages
      ADD CONSTRAINT fk_guest_messages_wedding_id
      FOREIGN KEY (wedding_id)
      REFERENCES public.weddings (id)
      ON DELETE CASCADE;
  END IF;

  -- ── videos.wedding_id → weddings.id ────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_videos_wedding_id'
      AND table_name = 'videos'
  ) THEN
    ALTER TABLE public.videos
      ADD CONSTRAINT fk_videos_wedding_id
      FOREIGN KEY (wedding_id)
      REFERENCES public.weddings (id)
      ON DELETE CASCADE;
  END IF;

  -- ── travel_info.wedding_id → weddings.id ───────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_travel_info_wedding_id'
      AND table_name = 'travel_info'
  ) THEN
    ALTER TABLE public.travel_info
      ADD CONSTRAINT fk_travel_info_wedding_id
      FOREIGN KEY (wedding_id)
      REFERENCES public.weddings (id)
      ON DELETE CASCADE;
  END IF;

  -- ── invite_analytics.guest_id → guests.id ──────────────────────────────────
  -- ON DELETE CASCADE: deleting a guest removes their analytics trail.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_invite_analytics_guest_id'
      AND table_name = 'invite_analytics'
  ) THEN
    ALTER TABLE public.invite_analytics
      ADD CONSTRAINT fk_invite_analytics_guest_id
      FOREIGN KEY (guest_id)
      REFERENCES public.guests (id)
      ON DELETE CASCADE;
  END IF;

  -- ── family_posts.wedding_id → weddings.id ──────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_family_posts_wedding_id'
      AND table_name = 'family_posts'
  ) THEN
    ALTER TABLE public.family_posts
      ADD CONSTRAINT fk_family_posts_wedding_id
      FOREIGN KEY (wedding_id)
      REFERENCES public.weddings (id)
      ON DELETE CASCADE;
  END IF;

  -- ── family_magic_links.family_user_id → family_users.id ────────────────────
  -- ON DELETE CASCADE: deleting a user invalidates all their outstanding links.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_family_magic_links_family_user_id'
      AND table_name = 'family_magic_links'
  ) THEN
    ALTER TABLE public.family_magic_links
      ADD CONSTRAINT fk_family_magic_links_family_user_id
      FOREIGN KEY (family_user_id)
      REFERENCES public.family_users (id)
      ON DELETE CASCADE;
  END IF;

  -- ── invite_access_codes.family_user_id → family_users.id ───────────────────
  -- NULLABLE FK: family_user_id is optional (synthesised guest accounts omit it).
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_invite_access_codes_family_user_id'
      AND table_name = 'invite_access_codes'
  ) THEN
    ALTER TABLE public.invite_access_codes
      ADD CONSTRAINT fk_invite_access_codes_family_user_id
      FOREIGN KEY (family_user_id)
      REFERENCES public.family_users (id)
      ON DELETE SET NULL;
  END IF;

  -- ── wedding_stage_overrides.wedding_id → weddings.id ───────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_wedding_stage_overrides_wedding_id'
      AND table_name = 'wedding_stage_overrides'
  ) THEN
    ALTER TABLE public.wedding_stage_overrides
      ADD CONSTRAINT fk_wedding_stage_overrides_wedding_id
      FOREIGN KEY (wedding_id)
      REFERENCES public.weddings (id)
      ON DELETE CASCADE;
  END IF;

END $$;


-- ── Verify all constraints were applied ──────────────────────────────────────
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name  AS references_table,
  ccu.column_name AS references_column,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;
