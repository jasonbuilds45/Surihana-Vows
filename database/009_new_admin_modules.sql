-- =============================================================================
-- 009_new_admin_modules.sql
-- New tables for: Prediction Manager, Seating, Photo Albums, Command Center
-- Run in Supabase Dashboard → SQL Editor
-- All statements are idempotent
-- =============================================================================

-- ── 1. Prediction questions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prediction_questions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id     UUID NOT NULL,
  question       TEXT NOT NULL,
  emoji          TEXT NOT NULL DEFAULT '🎯',
  options        JSONB NOT NULL DEFAULT '[]',
  is_active      BOOLEAN NOT NULL DEFAULT true,
  reveal_results BOOLEAN NOT NULL DEFAULT false,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_pred_questions_wedding
    FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_pred_questions_wedding
  ON public.prediction_questions(wedding_id);

-- ── 2. Seating tables ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seating_tables (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  capacity   INTEGER NOT NULL DEFAULT 8,
  notes      TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_seating_tables_wedding
    FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_seating_tables_wedding
  ON public.seating_tables(wedding_id);

-- ── 3. Seating assignments ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seating_assignments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id   UUID NOT NULL,
  table_id   UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_seating_assignment_guest
    FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE,
  CONSTRAINT fk_seating_assignment_table
    FOREIGN KEY (table_id) REFERENCES public.seating_tables(id) ON DELETE CASCADE,
  CONSTRAINT seating_assignments_guest_unique UNIQUE (guest_id)
);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_table
  ON public.seating_assignments(table_id);

-- ── 4. Photo albums ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.photo_albums (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id  UUID NOT NULL,
  album_name  TEXT NOT NULL,
  description TEXT,
  cover_photo TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_photo_albums_wedding
    FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_photo_albums_wedding
  ON public.photo_albums(wedding_id);

-- ── 5. Add album_id to photos ─────────────────────────────────────────────────
ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS album_id UUID
    REFERENCES public.photo_albums(id) ON DELETE SET NULL;

-- ── 6. RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.prediction_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_tables       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_albums         ENABLE ROW LEVEL SECURITY;

-- Drop before recreate to keep this script idempotent
DROP POLICY IF EXISTS "public read active prediction questions" ON public.prediction_questions;
DROP POLICY IF EXISTS "public read public albums"              ON public.photo_albums;

CREATE POLICY "public read active prediction questions"
  ON public.prediction_questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "public read public albums"
  ON public.photo_albums FOR SELECT
  USING (is_public = true);

-- ── 7. Verify ─────────────────────────────────────────────────────────────────
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'prediction_questions',
    'seating_tables',
    'seating_assignments',
    'photo_albums'
  )
ORDER BY table_name;
