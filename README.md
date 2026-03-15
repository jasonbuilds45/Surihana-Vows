# Surihana Vows

Surihana Vows is a cinematic wedding invitation and digital memory platform built with Next.js 14, TypeScript, Tailwind CSS, GSAP, and Supabase.

## Product stages

1. Invitation website with personalized guest links, story sections, maps, and RSVP.
2. Wedding day live hub with livestream, real-time timeline, countdown, gallery, and guestbook.
3. Private family memory vault with protected albums, posts, and anniversary timeline.

## Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- GSAP
- Supabase and Supabase Storage

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Optional environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_LIVESTREAM_URL=
AUTH_SECRET=
FAMILY_LOGIN_EMAIL=family@surihana.vows
FAMILY_LOGIN_PASSWORD=familyvault
ADMIN_LOGIN_EMAIL=admin@surihana.vows
ADMIN_LOGIN_PASSWORD=adminvault
```

3. Start development:

```bash
npm run dev
```

Without Supabase credentials, the project runs in demo mode using typed fallback data from the local config and demo data modules.

## Routing notes

- `app/api/*` contains the App Router API handlers.
- `middleware/authMiddleware.ts` protects `/family`, `/admin`, and admin-only API routes.
- If Supabase is configured but the schema has not been created yet, the app falls back to demo data so the UI can still load locally.
