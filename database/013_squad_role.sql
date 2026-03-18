-- =============================================================================
-- 013_squad_role.sql
--
-- Adds the "squad" role to the family_users table.
--
-- "squad" sits between "family" and "admin":
--   family  — spectator: view vault, capsules, polls. Cannot post memories.
--   squad   — bridesmaid / groomsman: everything family can do, plus
--             write memory posts, upload photos, and access the Squad Hub.
--   admin   — full access including the admin dashboard.
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================================

-- ── 1. Drop the old CHECK constraint ─────────────────────────────────────────
-- The existing constraint only allows 'family' | 'admin'.
-- We need to recreate it to include 'squad'.
-- The constraint name comes from the initial schema — adjust if yours differs.

ALTER TABLE public.family_users
  DROP CONSTRAINT IF EXISTS family_users_role_check;

-- ── 2. Add the new CHECK constraint ──────────────────────────────────────────
ALTER TABLE public.family_users
  ADD CONSTRAINT family_users_role_check
    CHECK (role IN ('family', 'squad', 'admin'));

-- ── 3. Verify ─────────────────────────────────────────────────────────────────
-- Should return: family_users_role_check | CHECK ((role = ANY (ARRAY[...
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.family_users'::regclass
  AND contype = 'c';
