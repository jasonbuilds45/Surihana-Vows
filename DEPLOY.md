# Surihana Vows — Deployment Guide

A complete step-by-step guide for deploying a new wedding on the Surihana Vows platform.
Follow these steps in order for every new client wedding.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20 or later | https://nodejs.org |
| npm | 9 or later | bundled with Node.js |
| Git | any | https://git-scm.com |
| Vercel CLI | latest | `npm i -g vercel` |
| PowerShell | 5.1+ (Windows) or 7+ (cross-platform) | bundled on Windows |

---

## Step 1 — Clone and install

```bash
git clone https://github.com/your-org/surihana-vows-template.git
cd surihana-vows-template
npm install
```

Verify the dev server starts:

```bash
npm run dev
# Open http://localhost:3000 — should show the demo invitation page
```

---

## Step 2 — Set up a Supabase project

1. Go to https://supabase.com/dashboard and click **New project**.
2. Choose a name (e.g. `surihana-vows`), set a strong database password, and select a region close to your guests.
3. Wait for the project to finish provisioning (~60 seconds).
4. Navigate to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`
5. Navigate to https://supabase.com/dashboard/account/tokens and create a **Personal Access Token** → `SUPABASE_ACCESS_TOKEN`

---

## Step 3 — Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value. Key ones:

| Variable | How to generate |
|---|---|
| `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `FAMILY_LOGIN_PASSWORD` | Use a password manager — minimum 20 characters |
| `ADMIN_LOGIN_PASSWORD` | Use a password manager — minimum 20 characters |
| `RESEND_API_KEY` | Sign up at https://resend.com (free tier: 100 emails/day) |
| `EMAIL_FROM` | A sender address on a domain you've verified with Resend |
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens |

> **Never commit `.env.local` to version control.** It is gitignored by default.

---

## Step 4 — Run database migrations

This step creates all 14 tables, indexes, and foreign key constraints in Supabase.

```bash
node --experimental-strip-types scripts/setup-database.ts
```

Expected output: each of the 6 SQL files reported as `✓`, followed by all 14 tables verified.

If a file fails, fix the reported error and re-run — all migration files use `IF NOT EXISTS` guards and are safe to re-run.

**Alternative (manual):** Open Supabase Dashboard → SQL Editor and paste each file from `database/` in order:
1. `001_initial_schema.sql`
2. `002_missing_tables.sql`
3. `003_indexes.sql`
4. `004_constraints.sql`
5. `005_schema_additions.sql`
6. `006_photo_moderation.sql`
7. `007_time_capsule.sql`
8. `008_guest_predictions.sql`
9. `011_missing_features.sql` — vendors, family polls, column additions
10. `phase-2-supabase.sql` — storage buckets, RLS policies, realtime

---

## Step 5 — Create storage buckets

```bash
node --experimental-strip-types scripts/setup-storage.ts
```

Creates four buckets:

| Bucket | Access | Purpose |
|---|---|---|
| `couple-photos` | Public | Photographer uploads, shown on invitation page |
| `guest-uploads` | Public | Guest photo uploads during and after ceremony |
| `wedding-videos` | Public | Highlight reels and ceremony recordings |
| `family-vault` | **Private** | Family-only archive, served via signed URLs |

Then apply the RLS storage policies (if not already done via `phase-2-supabase.sql`):

Supabase Dashboard → SQL Editor → paste `database/phase-2-supabase.sql`

---

## Step 6 — Scaffold the wedding

```bash
node --experimental-strip-types scripts/create-wedding.ts \
  --bride "Hana Mirza" \
  --groom "Suriya Raman" \
  --date 2026-12-18 \
  --venue "The Glasshouse Courtyard" \
  --city "Jaipur, Rajasthan" \
  --address "Raj Vilas Estate, Amber Road" \
  --time "18:30" \
  --title "Surihana Vows" \
  --dressCode "Jewel tones, modern Indian formal, and evening elegance." \
  --contactEmail "family@surihana.vows"
```

This writes all 5 config files (`wedding.json`, `events.json`, `travel.json`, `gallery.json`, `theme.json`) and upserts the wedding row into Supabase.

Copy the **Wedding ID** from the output — you'll need it for the next step.

Then customize the generated files for this couple:
- `config/wedding.json` — edit the story beats, intro quote, hero copy
- `config/events.json` — adjust times, add or remove events (e.g. mehendi, sangeet)
- `config/travel.json` — add real hotel block links, airport, city guide
- `config/theme.json` — no changes usually needed; update `siteName` if desired

---

## Step 7 — Import the guest list

Prepare a CSV file with columns `guestName`, `familyName` (optional), `phone` (optional):

```csv
guestName,familyName,phone
Priya,Sharma,+91 98765 43210
Aisha,and Omar,
Daniel,Harper,+1 555 0104
```

Then run:

```bash
node --experimental-strip-types scripts/import-guests.ts \
  --file guests.csv \
  --weddingId YOUR_WEDDING_ID_HERE
```

The script prints every guest's personalized invite URL — share these directly with each guest.

---

## Step 8 — Add the audio file

Copy the couple's chosen wedding theme track to:

```
public/audio/wedding-theme.mp3
```

Supported formats: `.mp3`, `.ogg`, `.wav`. Keep the file under 5 MB for fast loading.
The cinematic intro component will gracefully hide the music toggle if the file is missing.

---

## Step 9 — Run pre-deployment verification

```bash
powershell -ExecutionPolicy Bypass -File scripts/verify-deploy.ps1
```

This checks:
- All required environment variables are set and not using placeholder values
- All 16 database tables exist
- All 4 storage buckets are accessible
- `npm run build` passes with no errors

Fix any reported failures before proceeding to deployment.

---

## Step 10 — Deploy to Vercel

### First deployment

```bash
vercel
```

Follow the prompts to link your project to a Vercel account and team.

### Add environment variables to Vercel

In the Vercel dashboard → your project → **Settings → Environment Variables**, add every variable from `.env.local`. Or use the CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add AUTH_SECRET production
vercel env add FAMILY_LOGIN_EMAIL production
vercel env add FAMILY_LOGIN_PASSWORD production
vercel env add ADMIN_LOGIN_EMAIL production
vercel env add ADMIN_LOGIN_PASSWORD production
vercel env add RESEND_API_KEY production
vercel env add EMAIL_FROM production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_LIVESTREAM_URL production
```

> Set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g. `https://surihana.vows`).

### Deploy to production

```bash
vercel --prod
```

---

## Post-wedding checklist

After the ceremony:

- [ ] **Album download link** — upload the photographer's album ZIP to Supabase Storage at `guest-uploads/{weddingId}/album.zip`, or paste the Google Drive / Dropbox share link into `config/gallery.json → downloadUrl` and redeploy.
- [ ] **Thank-you page** — verify `/thank-you` looks correct. Update `thankYouMessage` in `config/wedding.json` and redeploy if needed.
- [ ] **Family vault** — add post-wedding family posts via the admin dashboard or the family vault post form to populate the anniversary timeline.
- [ ] **Photo moderation** — review pending guest uploads in the admin dashboard → Upload Manager → Pending Approval.
- [ ] **Stage transition** — the platform automatically transitions `invitation → live → vault` based on the wedding date. Override immediately from Admin Dashboard → Lifecycle Control without touching Supabase directly.
- [ ] **Family vault access** — invite family members via Admin Dashboard → Family Vault Access panel. They receive a one-tap `/vault/[token]` link by email — no password required.
- [ ] **Verify vault entry flow** — test the `/vault/[token]` link before the wedding. It should land on `/family` after a single click.
- [ ] **Predictions reveal** — update `revealAfter` in `config/predictions.json` to the actual reception end time. Results go live automatically once that timestamp is in the past.
- [ ] **Time capsule pg_cron job** — enable `pg_cron` in Supabase Dashboard → Database → Extensions. Paste the cron block from `database/007_time_capsule.sql` into the SQL editor. This ensures capsules unlock automatically.
- [ ] **Vendor hub** — on the wedding day, use Admin Dashboard → Vendor Hub to track arrival and setup status for every vendor in real time.
- [ ] **Family polls** — create polls from the family vault (admin view) for anniversary votes, music choices, or memory favourites.
- [ ] **Message moderation** — review the guestbook message list in Admin Dashboard → Guest Messages and remove any inappropriate entries before archiving.

---

## Per-client config checklist (new wedding deployment)

Every file you must update for a new client before deploying:

| File | What to update |
|---|---|
| `config/wedding.json` | Names, date, time, venue, city, address, mapLink, dressCode, contactEmail, story beats, introQuote, rituals |
| `config/events.json` | Event names, dates, times, venues, mapLinks, descriptions, dressCodes |
| `config/travel.json` | Hotel blocks, transport info, essentials (hospital, pharmacy, police, bus), FAQ, arrivalTips |
| `config/gallery.json` | Photo slideshow URLs, category descriptions, downloadUrl (post-wedding) |
| `config/predictions.json` | Questions, options, revealAfter timestamp |
| `config/theme.json` | siteName, navigation labels |
| `public/audio/wedding-theme.mp3` | Replace with client's chosen background track |
| `.env.local` | Fresh Supabase project keys, new AUTH_SECRET, client email credentials |

---

## Troubleshooting

### Magic link emails not arriving
1. Confirm `RESEND_API_KEY` is set in Vercel environment variables.
2. Confirm `EMAIL_FROM` is a sender address on a domain verified in your Resend account.
3. Check Resend dashboard logs for delivery errors.

### "Table not found" errors
Run `scripts/setup-database.ts` again — all migrations are idempotent.

### Storage bucket 403 / permission errors
Run `database/phase-2-supabase.sql` in the Supabase SQL Editor to apply RLS policies.

### Build fails with TypeScript errors
Ensure you are using Node.js 20+ and have run `npm install`. Run `npx tsc --noEmit` to see type errors.

### Guests getting 404 on invite links
Verify `NEXT_PUBLIC_SITE_URL` is set to the production domain (not `localhost`) in Vercel environment variables.

---

## Script reference

| Script | Command | Purpose |
|---|---|---|
| `setup-database.ts` | `node --experimental-strip-types scripts/setup-database.ts` | Run all SQL migrations against Supabase |
| `setup-storage.ts` | `node --experimental-strip-types scripts/setup-storage.ts` | Create all 4 storage buckets |
| `create-wedding.ts` | `node --experimental-strip-types scripts/create-wedding.ts --bride ... --groom ...` | Scaffold all config files, upsert wedding row |
| `import-guests.ts` | `node --experimental-strip-types scripts/import-guests.ts --file guests.csv --weddingId ...` | Import guest CSV, generate invite codes |
| `verify-deploy.ps1` | `powershell -ExecutionPolicy Bypass -File scripts/verify-deploy.ps1` | Pre-deployment health check |
