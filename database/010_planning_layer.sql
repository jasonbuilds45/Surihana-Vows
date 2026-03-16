-- =============================================================================
-- 010_planning_layer.sql
-- Wedding Planning Layer — all tables for the couple's planning tools
-- Run in Supabase Dashboard → SQL Editor
-- All statements are idempotent
-- =============================================================================

-- ── 1. Budget items ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.budget_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id       UUID NOT NULL,
  category         TEXT NOT NULL,
  vendor           TEXT NOT NULL DEFAULT '',
  estimated_cost   NUMERIC(12,2) NOT NULL DEFAULT 0,
  actual_cost      NUMERIC(12,2) NOT NULL DEFAULT 0,
  deposit_paid     NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_remaining NUMERIC(12,2) GENERATED ALWAYS AS (actual_cost - deposit_paid) STORED,
  due_date         DATE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_budget_wedding FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_budget_items_wedding ON public.budget_items(wedding_id);

-- ── 2. Shopping items ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shopping_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id  UUID NOT NULL,
  category    TEXT NOT NULL,
  item_name   TEXT NOT NULL,
  store       TEXT,
  cost        NUMERIC(12,2) NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','purchased')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_shopping_wedding FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_shopping_items_wedding ON public.shopping_items(wedding_id);

-- ── 3. Guest accommodations ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.guest_accommodations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id   UUID NOT NULL,
  guest_name   TEXT NOT NULL,
  hotel        TEXT NOT NULL DEFAULT '',
  room_number  TEXT,
  check_in     DATE,
  check_out    DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_accommodation_wedding FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_accommodations_wedding ON public.guest_accommodations(wedding_id);

-- ── 4. Guest travel ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.guest_travel (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id       UUID NOT NULL,
  guest_name       TEXT NOT NULL,
  arrival_mode     TEXT NOT NULL DEFAULT 'flight' CHECK (arrival_mode IN ('flight','train','car','other')),
  arrival_date     DATE,
  arrival_time     TEXT,
  pickup_required  BOOLEAN NOT NULL DEFAULT false,
  driver           TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_travel_wedding FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_guest_travel_wedding ON public.guest_travel(wedding_id);

-- ── 5. Wedding party members ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wedding_party_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id      UUID NOT NULL,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'bridesmaid' CHECK (role IN ('bridesmaid','groomsman','best_man','maid_of_honor','flower_girl','ring_bearer')),
  phone           TEXT,
  outfit_status   TEXT NOT NULL DEFAULT 'pending' CHECK (outfit_status IN ('pending','ordered','fitted','confirmed')),
  assigned_tasks  TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_party_wedding FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_party_members_wedding ON public.wedding_party_members(wedding_id);

-- ── 6. Catering menu ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.catering_menu (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id  UUID NOT NULL,
  dish_name   TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'starters' CHECK (category IN ('starters','main_course','desserts','drinks')),
  vendor      TEXT,
  status      TEXT NOT NULL DEFAULT 'considering' CHECK (status IN ('considering','tasting','finalized')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_catering_wedding FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_catering_wedding ON public.catering_menu(wedding_id);

-- ── 7. Wedding music ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wedding_music (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id  UUID NOT NULL,
  song_title  TEXT NOT NULL,
  artist      TEXT,
  moment      TEXT NOT NULL DEFAULT 'ceremony_background',
  media_link  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_music_wedding FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_music_wedding ON public.wedding_music(wedding_id);

-- ── 8. Decor ideas ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.decor_ideas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id  UUID NOT NULL,
  category    TEXT NOT NULL DEFAULT 'ceremony_stage',
  image_url   TEXT,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_decor_wedding FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_decor_wedding ON public.decor_ideas(wedding_id);

-- ── 9. Planning tasks ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.planning_tasks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id   UUID NOT NULL,
  task_title   TEXT NOT NULL,
  assigned_to  TEXT,
  priority     TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  due_date     DATE,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_tasks_wedding FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_planning_tasks_wedding ON public.planning_tasks(wedding_id);

-- ── 10. Gifts ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gifts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id       UUID NOT NULL,
  guest_name       TEXT NOT NULL,
  gift_description TEXT NOT NULL,
  gift_category    TEXT,
  thank_you_sent   BOOLEAN NOT NULL DEFAULT false,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_gifts_wedding FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_gifts_wedding ON public.gifts(wedding_id);

-- ── RLS (admin-only — no public read policies) ────────────────────────────────
ALTER TABLE public.budget_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_accommodations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_travel          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_menu         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_music         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decor_ideas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts                 ENABLE ROW LEVEL SECURITY;

-- ── Verify ───────────────────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('budget_items','shopping_items','guest_accommodations',
                     'guest_travel','wedding_party_members','catering_menu',
                     'wedding_music','decor_ideas','planning_tasks','gifts')
ORDER BY table_name;
