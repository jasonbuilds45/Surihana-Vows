-- 015_family_post_reactions.sql
-- Emoji reactions on family posts.
-- One row per (post_id, emoji, reacted_by) — unique constraint = natural toggle.

CREATE TABLE IF NOT EXISTS family_post_reactions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES family_posts(id) ON DELETE CASCADE,
  emoji       TEXT        NOT NULL,
  reacted_by  TEXT        NOT NULL,   -- email of the family member
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate reactions from the same person with the same emoji
  CONSTRAINT family_post_reactions_unique UNIQUE (post_id, emoji, reacted_by)
);

-- Index for fast lookups by post
CREATE INDEX IF NOT EXISTS idx_family_post_reactions_post_id ON family_post_reactions(post_id);
-- Index for per-user queries (e.g. "did I already react?")
CREATE INDEX IF NOT EXISTS idx_family_post_reactions_reacted_by ON family_post_reactions(reacted_by);

-- RLS: family members can read all reactions, insert/delete their own
ALTER TABLE family_post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "family_reactions_read"   ON family_post_reactions FOR SELECT USING (true);
CREATE POLICY "family_reactions_insert" ON family_post_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "family_reactions_delete" ON family_post_reactions FOR DELETE USING (true);
