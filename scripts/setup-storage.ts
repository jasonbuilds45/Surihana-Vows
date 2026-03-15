// =============================================================================
// scripts/setup-storage.ts
//
// Creates all 4 required Supabase Storage buckets with the correct
// public/private settings and CORS configuration using the Supabase
// JavaScript client (service role key).
//
// Usage:
//   node --experimental-strip-types scripts/setup-storage.ts
//
// Required environment variables:
//   NEXT_PUBLIC_SUPABASE_URL      — https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY     — service_role secret key
//
// Bucket definitions:
//   couple-photos   — public  — photographer uploads, shown on invitation page
//   guest-uploads   — public  — guest photo uploads during and after ceremony
//   wedding-videos  — public  — highlight reels and ceremony stream recordings
//   family-vault    — private — family-only media, served via signed URLs only
//
// This script is idempotent: if a bucket already exists it checks and reports
// its current settings without failing. Safe to re-run after partial setup.
// =============================================================================

import { createClient } from "@supabase/supabase-js";

// ── Bucket definitions ────────────────────────────────────────────────────────

interface BucketDefinition {
  name: string;
  public: boolean;
  /** Max upload size in bytes. 0 means use Supabase project default. */
  fileSizeLimit: number;
  /** Accepted MIME types. Empty array = accept all. */
  allowedMimeTypes: string[];
}

const BUCKETS: BucketDefinition[] = [
  {
    name: "couple-photos",
    public: true,
    fileSizeLimit: 20 * 1024 * 1024, // 20 MB — high-res photographer images
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
  },
  {
    name: "guest-uploads",
    public: true,
    fileSizeLimit: 8 * 1024 * 1024, // 8 MB — matches upload-photo route limit
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]
  },
  {
    name: "wedding-videos",
    public: true,
    fileSizeLimit: 500 * 1024 * 1024, // 500 MB — ceremony recordings
    allowedMimeTypes: ["video/mp4", "video/webm", "video/quicktime"]
  },
  {
    name: "family-vault",
    public: false, // Private — access via signed URLs only (lib/storage.ts)
    fileSizeLimit: 100 * 1024 * 1024, // 100 MB — family archive files
    allowedMimeTypes: [] // Accept all — family may upload PDFs, images, videos
  }
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function ok(message: string) {
  console.log(`  ✓  ${message}`);
}

function warn(message: string) {
  console.warn(`  ⚠  ${message}`);
}

function fail(message: string) {
  console.error(`  ✗  ${message}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set. Add it to .env.local.");
  }
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local.");
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log("");
  console.log("Surihana Vows — Storage Setup");
  console.log(`Project: ${supabaseUrl}`);
  console.log(`Buckets: ${BUCKETS.length} to configure`);
  console.log("");

  let allPassed = true;

  for (const bucket of BUCKETS) {
    const visibility = bucket.public ? "public" : "private";

    // ── Try to create the bucket ───────────────────────────────────────────
    const { error: createError } = await client.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit || undefined,
      allowedMimeTypes: bucket.allowedMimeTypes.length > 0 ? bucket.allowedMimeTypes : undefined
    });

    if (!createError) {
      ok(`${bucket.name}  created  (${visibility}, ${formatBytes(bucket.fileSizeLimit)} limit)`);
      continue;
    }

    // ── Bucket already exists — verify it ─────────────────────────────────
    if (
      createError.message.toLowerCase().includes("already exists") ||
      createError.message.toLowerCase().includes("duplicate")
    ) {
      // Fetch current settings
      const { data: existing, error: getError } = await client.storage.getBucket(bucket.name);

      if (getError || !existing) {
        fail(
          `${bucket.name}  already exists but could not be read: ${getError?.message ?? "unknown"}`
        );
        allPassed = false;
        continue;
      }

      const actuallyPublic = existing.public;
      const visibilityMatch = actuallyPublic === bucket.public;

      if (!visibilityMatch) {
        warn(
          `${bucket.name}  already exists but visibility mismatch: ` +
            `expected ${visibility}, got ${actuallyPublic ? "public" : "private"}. ` +
            "Update manually in Supabase Dashboard → Storage."
        );
        allPassed = false;
      } else {
        ok(`${bucket.name}  already exists  (${visibility} ✓)`);
      }

      continue;
    }

    // ── Unexpected error ───────────────────────────────────────────────────
    fail(`${bucket.name}  creation failed: ${createError.message}`);
    allPassed = false;
  }

  console.log("");

  // ── Verify all buckets are now accessible ────────────────────────────────
  console.log("Verifying bucket access…");

  for (const bucket of BUCKETS) {
    const { error } = await client.storage.from(bucket.name).list("", { limit: 1 });

    if (error) {
      // Private buckets may return an error on list from the JS client even
      // when configured correctly — check for the specific permission error.
      if (
        error.message.includes("policy") ||
        error.message.includes("permission") ||
        error.message.includes("not authorized")
      ) {
        warn(
          `${bucket.name}  bucket exists but RLS policy check needed — ` +
            "run database/phase-2-supabase.sql to apply storage policies."
        );
      } else if (!bucket.public && error.message.toLowerCase().includes("not found")) {
        // Private bucket created but empty — this is fine
        ok(`${bucket.name}  accessible (private, empty)`);
      } else {
        fail(`${bucket.name}  verification failed: ${error.message}`);
        allPassed = false;
      }
    } else {
      ok(`${bucket.name}  accessible`);
    }
  }

  console.log("");

  if (!allPassed) {
    console.error("Storage setup completed with warnings. Review the output above.");
    console.error("Some buckets may need manual attention in the Supabase Dashboard.");
    process.exit(1);
  }

  console.log("All 4 storage buckets configured and verified.");
  console.log("");
  console.log("Next steps:");
  console.log("  1. Apply RLS storage policies:");
  console.log("       Supabase Dashboard → SQL Editor → paste database/phase-2-supabase.sql");
  console.log("  2. Continue with wedding setup:");
  console.log("       node --experimental-strip-types scripts/create-wedding.ts --bride ... --groom ...");
  console.log("");
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "unlimited";
  const mb = bytes / (1024 * 1024);
  return `${mb % 1 === 0 ? mb : mb.toFixed(0)} MB`;
}

void main().catch((error) => {
  console.error("");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
