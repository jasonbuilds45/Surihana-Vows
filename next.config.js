/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // ── Unsplash (story images, demo gallery photos) ───────────────────────
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com"
      },

      // ── Supabase Storage (all project buckets) ────────────────────────────
      // Wildcard covers any Supabase project, making the config portable when
      // a new project is created for each wedding.
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**"
      },
      // Explicit entry for the current active project (belt-and-suspenders).
      {
        protocol: "https",
        hostname: "mfiysoiwlrmpipqmpnde.supabase.co"
      }

      // NOTE: dummyimage.com has been intentionally removed.
      // It was a demo-only placeholder. Production images must come from
      // Supabase Storage or Unsplash. If you need a local placeholder during
      // development, add it back here temporarily.
    ]
  }
};

module.exports = nextConfig;
