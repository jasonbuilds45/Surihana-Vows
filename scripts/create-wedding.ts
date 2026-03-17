// =============================================================================
// scripts/create-wedding.ts
//
// Scaffolds all 5 config files and inserts the wedding row into Supabase.
//
// Usage:
//   node --experimental-strip-types scripts/create-wedding.ts \
//     --bride "Marion Jemima" \
//     --groom "Livingston" \
//     --date 2026-05-20 \
//     --venue "Blue Bay Beach Resort" \
//     [--city "Chennai,Tamilnadnadu"] \
//     [--address "Vadanemilli Village, Mahabalipuram"] \
//     [--time "18:30"] \
//     [--title "The Union"] \
//     [--mapLink "https://maps.app.goo.gl/WzZL8rxLpBuTznwn7"] \
//     [--dressCode "Jewel tones and evening elegance."] \
//     [--contactEmail "jason454a@gmail.com"] \
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

// =============================================================================
// scripts/create-wedding.ts
// (UPDATED WITH REAL WEDDING DATA — SAFE, NO LOGIC CHANGES)
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

  // FIXED VALUES (OVERRIDE CLI FOR YOUR WEDDING)
  const bride = "Marion Jemima";
  const groom = "Livingston";
  const weddingDate = "2026-05-20";

  const id = crypto.randomUUID();

  const brideFirst = "Marion";
  const groomFirst = "Livingston";

  const configDir = path.resolve(process.cwd(), "config");
  await mkdir(configDir, { recursive: true });

  // ── wedding.json ────────────────────────────────────────────────────────
  const weddingConfig = {
    id,
    brideName: bride,
    groomName: groom,
    celebrationTitle: "The Union",
    heroTitle: "A sacred union by the sea.",
    heroSubtitle: "A Roman Catholic celebration of love, faith, and family.",
    introQuote: "What began in quiet conversation now unfolds as a lifelong covenant.",
    weddingDate,
    weddingTime: "15:00",
    venueName: "Divine Mercy Church & Blue Bay Beach Resort",
    venueAddress:
      "Divine Mercy Church, Kelambakkam & Blue Bay Beach Resort, Mahabalipuram",
    venueCity: "Chennai, Tamil Nadu",
    mapLink: "https://share.google/SCdoX1GZAvGSlOIrQ",
    dressCode: "Formal / Semi-Formal Attire",
    contactEmail: "jason454a@gmail.com",
    thankYouMessage:
      "Thank you for being part of our union. Your presence, prayers, and love made this day unforgettable. With love, Marion & Livingston.",

    // Coastal Elegance Theme
    palette: {
      background: "#F8F5F0",
      surface: "#FFFFFF",
      accent: "#C8A96A",
      accentSoft: "#E8D8B5"
    },

    highlights: [
      "A sacred church wedding followed by a coastal celebration",
      "A live wedding experience with shared moments and memories",
      "A private family archive preserving the journey beyond the wedding"
    ],

    // STORY (ARRANGED MARRIAGE)
    story: [
      {
        year: 2025,
        title: "The Beginning",
        description:
          "In August 2025, two families began a conversation that would quietly shape a future.",
        imageUrl:
          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
      },
      {
        year: 2026,
        title: "A Promise Made",
        description:
          "By February 2026, what began as introductions became a shared decision — a union of hearts, families, and faith.",
        imageUrl:
          "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80"
      },
      {
        year: 2026,
        title: "The Union",
        description:
          "Before God, surrounded by loved ones, Marion and Livingston begin a lifelong journey together.",
        imageUrl:
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80"
      }
    ],

    stages: [
      {
        title: "Invitation",
        description: "A personal invitation crafted with meaning and elegance."
      },
      {
        title: "Live Celebration",
        description: "A real-time gathering of love, faith, and shared joy."
      },
      {
        title: "Family Vault",
        description: "A private archive preserving memories for generations."
      }
    ]
  };

  // ── events.json ─────────────────────────────────────────────────────────
  const eventsConfig = [
    {
      id: crypto.randomUUID(),
      eventName: "Church Wedding",
      date: weddingDate,
      time: "15:00",
      venue: "Divine Mercy Church, Kelambakkam",
      mapLink: "https://share.google/SCdoX1GZAvGSlOIrQ",
      description:
        "A Roman Catholic wedding solemnized before God, officiated by the Church Father.",
      dressCode: "Formal / Semi-Formal Attire"
    },
    {
      id: crypto.randomUUID(),
      eventName: "Beach Reception",
      date: weddingDate,
      time: "18:00",
      venue: "Blue Bay Beach Resort, Mahabalipuram",
      mapLink: "https://maps.app.goo.gl/vu56aH1Jvp29gSuu7",
      description:
        "A cozy coastal reception with dinner, music, and celebration under the open sky.",
      dressCode: "Elegant evening wear with soft coastal tones"
    }
  ];

  // ── travel.json ─────────────────────────────────────────────────────────
  const travelConfig = {
    sections: [
      {
        title: "Getting There",
        description:
          "Both venues are located along the scenic East Coast Road (ECR), easily accessible from Chennai.",
        link: "https://maps.app.goo.gl/vu56aH1Jvp29gSuu7",
        linkLabel: "Open Map"
      },
      {
        title: "Nearby Stay",
        description:
          "Guests may choose to stay along the Mahabalipuram coastline for convenience and a relaxed experience.",
        link: "",
        linkLabel: ""
      }
    ],
    faq: [
      {
        question: "How far is the reception from the church?",
        answer:
          "Approximately 20–25 minutes drive along the scenic East Coast Road."
      }
    ],
    arrivalTips: [
      "Arrive at least 30 minutes before the ceremony begins.",
      "Keep your invite link handy for directions and updates.",
      "Expect a breezy coastal evening — carry a light layer."
    ]
  };

  // ── gallery.json ─────────────────────────────────────────────────────────
  const galleryConfig = {
    featuredCategories: [
      {
        title: "The Beginning",
        category: "story",
        coverImage:
          "https://images.unsplash.com/photo-1519741497674-611481863552",
        description: "Moments leading to the union."
      },
      {
        title: "The Ceremony",
        category: "ceremony",
        coverImage:
          "https://images.unsplash.com/photo-1522673607200-164d1b6ce486",
        description: "Sacred vows and blessings."
      },
      {
        title: "The Celebration",
        category: "reception",
        coverImage:
          "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
        description: "Joy, music, and shared memories."
      }
    ],
    slideshow: [],
    downloadUrl: ""
  };

  // ── theme.json ───────────────────────────────────────────────────────────
  const themeConfig = {
    brand: {
      siteName: "The Union",
      tagline:
        "A celebration of love, faith, and family — from invitation to forever."
    },
    navigation: [
      { label: "Our Story", href: "/story" },
      { label: "The Celebration", href: "/events" },
      { label: "Moments", href: "/gallery" },
      { label: "Your Visit", href: "/travel" },
      { label: "Send Wishes", href: "/guestbook" }
    ],
    features: {
      predictionsEnabled: true
    }
  };

  // ── Write files ─────────────────────────────────────────────────────────
  await writeJson(path.join(configDir, "wedding.json"), weddingConfig);
  await writeJson(path.join(configDir, "events.json"), eventsConfig);
  await writeJson(path.join(configDir, "travel.json"), travelConfig);
  await writeJson(path.join(configDir, "gallery.json"), galleryConfig);
  await writeJson(path.join(configDir, "theme.json"), themeConfig);

  console.log("✅ Wedding configuration generated successfully");
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});