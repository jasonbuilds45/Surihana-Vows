// =============================================================================
// scripts/create-wedding.ts
//
// Scaffolds all 5 config files and inserts the wedding row into Supabase.
//
// Usage:
//   node --experimental-strip-types scripts/create-wedding.ts \
//     --bride "Hana Mirza" \
//     --groom "Suriya Raman" \
//     --date 2026-12-18 \
//     --venue "The Glasshouse Courtyard" \
//     [--city "Jaipur, Rajasthan"] \
//     [--address "Raj Vilas Estate, Amber Road"] \
//     [--time "18:30"] \
//     [--title "Surihana Vows"] \
//     [--mapLink "https://maps.google.com/?q=..."] \
//     [--dressCode "Jewel tones and evening elegance."] \
//     [--contactEmail "family@surihana.vows"] \
//     [--thankYouMessage "Thank you for being with us."] \
//     [--id "uuid-override"]
//
// Config files generated:
//   config/wedding.json   — core wedding details
//   config/events.json    — 3 default events (Welcome Dinner, Ceremony, Reception)
//   config/travel.json    — placeholder travel sections, FAQ, arrival tips
//   config/gallery.json   — placeholder categories, slideshow, downloadUrl
//   config/theme.json     — navigation links, brand, stage descriptions
// =============================================================================

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

type CliArgs = Record<string, string>;

// ── Utilities ─────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]) {
  return argv.reduce<CliArgs>((acc, cur, idx, arr) => {
    if (!cur.startsWith("--")) return acc;
    const key = cur.slice(2);
    const next = arr[idx + 1];
    acc[key] = !next || next.startsWith("--") ? "true" : next;
    return acc;
  }, {});
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getRequired(args: CliArgs, key: string) {
  const val = args[key];
  if (!val) throw new Error(`Missing required argument --${key}`);
  return val;
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const bride       = getRequired(args, "bride");
  const groom       = getRequired(args, "groom");
  const weddingDate = getRequired(args, "date");
  const venueName   = getRequired(args, "venue");

  const id          = args.id         ?? crypto.randomUUID();
  const weddingTime = args.time        ?? "18:30";
  const venueCity   = args.city        ?? "Jaipur, Rajasthan";
  const venueAddress = args.address    ?? venueName;
  const siteName    = args.title       ?? `${bride.split(" ")[0]}${groom.split(" ")[0]} Vows`;
  const brideFirst  = bride.split(" ")[0];
  const groomFirst  = groom.split(" ")[0];

  const configDir = path.resolve(process.cwd(), "config");
  await mkdir(configDir, { recursive: true });

  // ── wedding.json ────────────────────────────────────────────────────────
  const weddingConfig = {
    id,
    brideName: bride,
    groomName: groom,
    celebrationTitle: siteName,
    heroTitle: `A cinematic celebration of ${brideFirst} and ${groomFirst}.`,
    heroSubtitle: `Join us in ${venueCity} for a celebration designed like a love letter in motion.`,
    introQuote: "Some stories begin quietly. The best ones echo for generations.",
    weddingDate,
    weddingTime,
    venueName,
    venueAddress,
    venueCity,
    mapLink:
      args.mapLink ??
      `https://maps.google.com/?q=${encodeURIComponent(`${venueName} ${venueCity}`)}`,
    dressCode: args.dressCode ?? "Evening elegance and jewel tones.",
    contactEmail: args.contactEmail ?? "family@surihana.vows",
    thankYouMessage:
      args.thankYouMessage ??
      `Thank you for celebrating with us. Your presence made this day everything we hoped for. With love, ${brideFirst} & ${groomFirst}.`,
    palette: {
      background: "#f8f1e7",
      surface: "#fffaf5",
      accent: "#8a5a44",
      accentSoft: "#d4b39b"
    },
    highlights: [
      "Guest-specific invitation pages with cinematic storytelling",
      "A live celebration hub with uploads, messages, and schedule updates",
      "A private family archive that opens after the wedding"
    ],
    story: [
      {
        year: new Date(weddingDate).getFullYear() - 2,
        title: "How they met",
        description: `${brideFirst} and ${groomFirst} crossed paths in a moment worth retelling for decades.`,
        imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
      },
      {
        year: new Date(weddingDate).getFullYear() - 1,
        title: "Journey together",
        description: "What began as timing became ritual, distance became rhythm, and rhythm became home.",
        imageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80"
      },
      {
        year: new Date(weddingDate).getFullYear(),
        title: "Proposal story",
        description: "The proposal arrived under lantern light, with family close and the future already in view.",
        imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    stages: [
      { title: "Invitation Website",          description: "A tailored story-driven invitation for every guest." },
      { title: "Wedding Day Live Hub",        description: "A real-time celebration layer for the ceremony and reception." },
      { title: "Private Family Memory Vault", description: "A protected archive that preserves the celebration for years ahead." }
    ]
  };

  // ── events.json ─────────────────────────────────────────────────────────
  const eventsConfig = [
    {
      id: crypto.randomUUID(),
      eventName: "Welcome Dinner",
      date: weddingDate,
      time: "17:00",
      venue: venueName,
      mapLink: weddingConfig.mapLink,
      description: "An opening gathering for family, close friends, and out-of-town guests.",
      dressCode: weddingConfig.dressCode
    },
    {
      id: crypto.randomUUID(),
      eventName: "Ceremony",
      date: weddingDate,
      time: weddingTime,
      venue: venueName,
      mapLink: weddingConfig.mapLink,
      description: "The vows and the ceremony itself.",
      dressCode: weddingConfig.dressCode
    },
    {
      id: crypto.randomUUID(),
      eventName: "Reception",
      date: weddingDate,
      time: "21:00",
      venue: venueName,
      mapLink: weddingConfig.mapLink,
      description: "Dinner, speeches, and the first dance.",
      dressCode: weddingConfig.dressCode
    }
  ];

  // ── travel.json ─────────────────────────────────────────────────────────
  const travelConfig = {
    sections: [
      {
        title: "Hotel Blocks",
        description: "Preferred rates for family and destination guests.",
        link: "https://example.com/hotel-blocks",
        linkLabel: "View hotels"
      },
      {
        title: "Airport Transfers",
        description: "Private transfer scheduling for arrivals and departures.",
        link: "https://example.com/transfers",
        linkLabel: "Arrange transfers"
      },
      {
        title: "City Guide",
        description: `Favorite local places for guests arriving early or staying longer in ${venueCity}.`,
        link: "https://example.com/city-guide",
        linkLabel: "Open guide"
      }
    ],
    faq: [
      {
        question: "Which airport should guests use?",
        answer: `Use the nearest major airport to ${venueCity}.`
      },
      {
        question: "Is parking available at the venue?",
        answer: `Parking details for ${venueName} will be shared closer to the wedding date.`
      }
    ],
    arrivalTips: [
      "Pack one extra formal layer for evening celebrations.",
      "Keep your invite link bookmarked for check-in and live updates.",
      "Arrive at least 30 minutes before the ceremony start time."
    ]
  };

  // ── gallery.json — Phase 5.2: now generated by this script ──────────────
  const galleryConfig = {
    featuredCategories: [
      {
        title: "Engagement Portraits",
        category: "portraits",
        coverImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
        description: `Editorial frames from ${brideFirst} and ${groomFirst}'s engagement session.`
      },
      {
        title: "Family Moments",
        category: "family",
        coverImage: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
        description: "Quiet behind-the-scenes moments with parents, siblings, cousins, and inherited rituals."
      },
      {
        title: "Wedding Weekend",
        category: "weekend",
        coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
        description: "The full weekend in motion, from first arrivals to the final dance."
      }
    ],
    slideshow: [
      {
        title: `${brideFirst} & ${groomFirst}`,
        caption: "The beginning of the story.",
        imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80",
        category: "portraits"
      },
      {
        title: "The Journey",
        caption: "The moments between then and now.",
        imageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=80",
        category: "story"
      },
      {
        title: "Family",
        caption: "The people who make this celebration what it is.",
        imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
        category: "family"
      },
      {
        title: venueName,
        caption: `${venueCity} — the setting for this celebration.`,
        imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80",
        category: "weekend"
      }
    ],
    // Set this to a Google Drive / Dropbox share link after the wedding
    // to enable the album download button on /gallery.
    downloadUrl: ""
  };

  // ── theme.json — Phase 5.2: now generated by this script ────────────────
  const themeConfig = {
    brand: {
      siteName: siteName,
      tagline: `The celebration of ${brideFirst} and ${groomFirst} — invitation, live hub, and family archive in one.`
    },
    navigation: [
      { label: "Home",      href: "/" },
      { label: "Story",     href: "/story" },
      { label: "Events",    href: "/events" },
      { label: "Travel",    href: "/travel" },
      { label: "Gallery",   href: "/gallery" },
      { label: "Guestbook", href: "/guestbook" },
      { label: "Live",      href: "/live" }
    ],
    stages: [
      {
        stage: "Stage 1",
        headline: "Personalized invitation journeys",
        description: "Every guest receives a tailored link with RSVP, schedule, and a polished cinematic entrance."
      },
      {
        stage: "Stage 2",
        headline: "Real-time wedding day storytelling",
        description: "The experience transforms into a live event hub for streaming, updates, and guest participation."
      },
      {
        stage: "Stage 3",
        headline: "A private archive for the family",
        description: "After the wedding, the same platform becomes a protected memory vault with posts, albums, and milestones."
      }
    ]
  };

  // ── Write all config files ───────────────────────────────────────────────
  await writeJson(path.join(configDir, "wedding.json"), weddingConfig);
  await writeJson(path.join(configDir, "events.json"),  eventsConfig);
  await writeJson(path.join(configDir, "travel.json"),  travelConfig);
  await writeJson(path.join(configDir, "gallery.json"), galleryConfig);
  await writeJson(path.join(configDir, "theme.json"),   themeConfig);

  // ── Supabase upsert ──────────────────────────────────────────────────────
  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { error } = await supabase.from("weddings").upsert({
      id,
      bride_name:    bride,
      groom_name:    groom,
      wedding_date:  weddingDate,
      venue_name:    venueName,
      venue_address: venueAddress || null,
      venue_city:    venueCity    || null,
      contact_email: weddingConfig.contactEmail || null
    });

    if (error) throw new Error(`Supabase insert failed: ${error.message}`);

    console.log("\n  ✓  Wedding row upserted to Supabase");
  } else {
    console.log("\n  ⚠  Supabase not configured — skipping DB insert (demo mode)");
  }

  // ── Output ───────────────────────────────────────────────────────────────
  const siteUrl  = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const guestUrl = `${siteUrl}/invite/${slugify(`${brideFirst} family`)}`;

  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Surihana Vows — Wedding scaffold created");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Wedding ID     : ${id}`);
  console.log(`  Couple         : ${brideFirst} & ${groomFirst}`);
  console.log(`  Date           : ${weddingDate} at ${weddingTime}`);
  console.log(`  Venue          : ${venueName}, ${venueCity}`);
  console.log(`  Sample invite  : ${guestUrl}`);
  console.log(`  Thank-you page : ${siteUrl}/thank-you`);
  console.log("");
  console.log("  Config files written:");
  console.log("    config/wedding.json");
  console.log("    config/events.json");
  console.log("    config/travel.json");
  console.log("    config/gallery.json   ← new");
  console.log("    config/theme.json     ← new");
  console.log("");
  console.log("───────────────────────────────────────────────────────");
  console.log("  MANUAL STEPS REMAINING");
  console.log("───────────────────────────────────────────────────────");
  console.log("");
  console.log("  [ ] 1. Audio file");
  console.log("         Add your wedding theme track to:");
  console.log("           public/audio/wedding-theme.mp3");
  console.log("         (Supported: .mp3, .ogg, .wav)");
  console.log("");
  console.log("  [ ] 2. Supabase database tables (all 16 tables)");
  console.log("         Run:  node --experimental-strip-types scripts/setup-database.ts");
  console.log("         This runs all 008 migration files in order — idempotent, safe to re-run.");
  console.log("");
  console.log("  [ ] 3. Supabase storage buckets");
  console.log("         Run:  node --experimental-strip-types scripts/setup-storage.ts");
  console.log("");
  console.log("  [ ] 4. Import guests");
  console.log(`         Run:  node --experimental-strip-types scripts/import-guests.ts \\`);
  console.log(`                 --file guests.csv --weddingId ${id}`);
  console.log("");
  console.log("  [ ] 5. Environment secrets");
  console.log("         Copy .env.example to .env.local and fill in:");
  console.log("           AUTH_SECRET              (generate: openssl rand -hex 32)");
  console.log("           FAMILY_LOGIN_PASSWORD     (strong unique password)");
  console.log("           ADMIN_LOGIN_PASSWORD      (strong unique password)");
  console.log("           RESEND_API_KEY            (from resend.com)");
  console.log("           EMAIL_FROM               (verified sender domain)");
  console.log("           NEXT_PUBLIC_LIVESTREAM_URL (YouTube embed URL for the big day)");
  console.log("");
  console.log("  [ ] 6. Invite family vault members");
  console.log("         Open the admin dashboard → Family Vault Access panel.");
  console.log("         Add family member emails — they receive a one-tap /vault/[token] link.");
  console.log("         No password required. Test the link yourself before the wedding.");
  console.log("");
  console.log("  [ ] 7. Gallery album download link (post-wedding)");
  console.log("         Edit config/gallery.json → set downloadUrl to your Google Drive /");
  console.log("         Dropbox share link after the photographer delivers the album.");
  console.log("");
  console.log("  [ ] 8. Verify and deploy");
  console.log("         Run:  powershell -ExecutionPolicy Bypass -File scripts/verify-deploy.ps1");
  console.log("         Then: vercel --prod");
  console.log("");
  console.log("  See DEPLOY.md for the complete step-by-step guide.");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
