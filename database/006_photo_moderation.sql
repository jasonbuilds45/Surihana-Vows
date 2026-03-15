-- =============================================================================
-- 006_photo_moderation.sql
-- Adds the is_approved flag to the photos table.
-- Guest-uploaded photos default to false (unapproved).
-- Admin-uploaded photos (via UploadManager) default to true (pre-approved).
-- The application layer filters WHERE is_approved = true for all public queries.
-- Run AFTER 001–005.
-- =============================================================================

ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;

-- Backfill: photos that already exist in the DB (uploaded before this migration)
-- are assumed to have been reviewed and are approved retroactively.
-- Remove this UPDATE if you want to manually review all existing photos instead.
UPDATE public.photos
  SET is_approved = true
  WHERE is_approved = false
    AND created_at < now();

-- ── Verify ───────────────────────────────────────────────────────────────────
SELECT
  COUNT(*) FILTER (WHERE is_approved = true)  AS approved,
  COUNT(*) FILTER (WHERE is_approved = false) AS pending,
  COUNT(*)                                    AS total
FROM public.photos;
