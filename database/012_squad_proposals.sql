-- =============================================================================
-- 012_squad_proposals.sql
--
-- Squad Proposal System for Surihana Vows
--
-- Allows the couple to send personalised "Will you be my bridesmaid/groomsman?"
-- proposals to specific people. Each proposal is a unique, sealed experience
-- at /squad/[code] — separate from the wedding invitation flow.
--
-- New table:
--   squad_proposals  — one row per proposed squad member
--
-- After running this, no app restart is needed. The Next.js API routes
-- and page route will pick up the table automatically.
--
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── squad_proposals ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.squad_proposals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id      UUID NOT NULL,

  -- Who is being proposed to
  name            TEXT NOT NULL,          -- e.g. "Sarah"
  email           TEXT,                   -- optional: for sending notification

  -- Role being offered
  squad_role      TEXT NOT NULL           -- 'bridesmaid' | 'groomsman'
    CHECK (squad_role IN ('bridesmaid', 'groomsman')),

  -- Personal message from bride/groom
  personal_note   TEXT NOT NULL,

  -- The unique code that drives /squad/[code]
  proposal_code   TEXT NOT NULL,

  -- Response tracking
  accepted        BOOLEAN,                -- null = pending, true = accepted, false = declined
  accepted_at     TIMESTAMPTZ,
  response_note   TEXT,                   -- optional note from the person when they accept

  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at       TIMESTAMPTZ,            -- when they first opened the proposal

  CONSTRAINT squad_proposals_code_unique UNIQUE (proposal_code),

  CONSTRAINT fk_squad_proposals_wedding
    FOREIGN KEY (wedding_id) REFERENCES public.weddings (id) ON DELETE CASCADE
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_squad_proposals_wedding_id
  ON public.squad_proposals (wedding_id);

CREATE INDEX IF NOT EXISTS idx_squad_proposals_code
  ON public.squad_proposals (proposal_code);

CREATE INDEX IF NOT EXISTS idx_squad_proposals_role
  ON public.squad_proposals (wedding_id, squad_role);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.squad_proposals ENABLE ROW LEVEL SECURITY;

-- Only the service role (your Next.js backend via the service key) can read/write.
-- The public proposal page fetches via the API route which uses the service key.
CREATE POLICY "squad_proposals: service role only"
  ON public.squad_proposals FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'squad_proposals'
ORDER BY ordinal_position;
