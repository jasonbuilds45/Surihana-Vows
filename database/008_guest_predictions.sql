-- =============================================================================
-- 008_guest_predictions.sql
--
-- The Guest Prediction Game system (Guest Journey feature).
--
-- Couples configure prediction questions in config/predictions.json.
-- Guests vote once per question per wedding. Results are revealed publicly
-- on /predictions after the wedding day.
--
-- Design choices:
--   • guest_predictions stores one row per (question_id, guest_name) pair.
--     No auth required — guests vote by name, which is good enough for a
--     fun game and avoids requiring login.
--   • question_id is a short string key matching config/predictions.json
--     (e.g. "who_cries_first"), not a UUID — simpler to manage in config.
--   • Duplicate prevention: UNIQUE (wedding_id, question_id, guest_identifier)
--     where guest_identifier is a hash of name+IP to prevent stuffing.
-- =============================================================================

-- ── guest_predictions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.guest_predictions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id        UUID NOT NULL,
  -- question_id matches the "id" field in config/predictions.json
  question_id       TEXT NOT NULL,
  -- The answer option chosen (e.g. "bride", "groom", "both")
  answer            TEXT NOT NULL,
  -- Guest's display name (shown on results page)
  guest_name        TEXT NOT NULL,
  -- Hashed identifier (SHA-256 of guest_name + IP) for duplicate prevention
  guest_identifier  TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One vote per guest per question per wedding
  CONSTRAINT guest_predictions_unique_vote
    UNIQUE (wedding_id, question_id, guest_identifier),

  CONSTRAINT fk_guest_predictions_wedding_id
    FOREIGN KEY (wedding_id) REFERENCES public.weddings (id) ON DELETE CASCADE
);

-- ── guests table: add guest_role column ───────────────────────────────────────
-- Used by the Guest Journey to show personalised role badges:
--   "You are part of the Bride's family"
-- Valid values: 'family' | 'friends' | 'bride_side' | 'groom_side' | 'vip'
ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS guest_role TEXT
  CHECK (guest_role IN ('family', 'friends', 'bride_side', 'groom_side', 'vip'));

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_guest_predictions_wedding_id
  ON public.guest_predictions (wedding_id);

CREATE INDEX IF NOT EXISTS idx_guest_predictions_question
  ON public.guest_predictions (wedding_id, question_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.guest_predictions ENABLE ROW LEVEL SECURITY;

-- Anyone can vote (guests aren't logged in)
CREATE POLICY "public can insert predictions"
  ON public.guest_predictions FOR INSERT
  WITH CHECK (true);

-- Results are publicly readable (drives the /predictions page)
CREATE POLICY "public can read predictions"
  ON public.guest_predictions FOR SELECT
  USING (true);
