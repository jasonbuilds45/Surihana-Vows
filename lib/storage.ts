import { getSupabaseAdminClient } from "@/lib/supabaseClient";

export const STORAGE_BUCKETS = [
  "couple-photos",
  "guest-uploads",
  "wedding-videos",
  "family-vault"
] as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

// ─────────────────────────────────────────────────────────────────────────────
// Signed URL expiry for the family-vault bucket — 7 days.
// See original comment for long-term refresh strategy.
// ─────────────────────────────────────────────────────────────────────────────
const FAMILY_VAULT_SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

const DEMO_UPLOAD_PLACEHOLDER =
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400&q=80";

function sanitizeFileName(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-");
}

function isAllowedBucket(bucket: string): bucket is StorageBucket {
  return STORAGE_BUCKETS.includes(bucket as StorageBucket);
}

function shouldFallbackToDemoStorage(message?: string | null) {
  const normalized = (message ?? "").toLowerCase();
  return normalized.includes("bucket") && normalized.includes("not found");
}

// ─────────────────────────────────────────────────────────────────────────────
// getTransformedImageUrl  (Phase 6.1)
//
// Appends Supabase Storage image transformation query parameters to any
// Supabase public URL so the CDN delivers a resized, recompressed version.
//
// Only operates on URLs that belong to this project's Supabase Storage — all
// other URLs (Unsplash demo images, external CDNs) are returned unchanged so
// demo mode and fallback images continue to work without modification.
//
// Supabase transform params:
//   width   — resize to this pixel width (height scales proportionally)
//   quality — JPEG/WebP quality 1–100 (default 80 is a good production value)
//   format  — "origin" preserves the source format; "webp" for max compression
//
// Usage:
//   const thumb = getTransformedImageUrl(photo.image_url, { width: 400, quality: 75 })
//   <Image src={thumb} … />
//
// Note: Supabase image transformations require the Pro plan or higher. On the
// free tier the params are silently ignored — images still load, just at full
// resolution. This function is therefore safe to call unconditionally; it
// degrades gracefully on any plan.
// ─────────────────────────────────────────────────────────────────────────────

export interface ImageTransformOptions {
  /** Resize to this pixel width. Height scales proportionally. */
  width?: number;
  /** JPEG/WebP quality, 1–100. Defaults to 80. */
  quality?: number;
  /** Output format. "origin" = keep source format. Default: "origin". */
  format?: "origin" | "webp" | "avif";
  /** Resize mode. Default: "cover". */
  resize?: "cover" | "contain" | "fill";
}

const SUPABASE_STORAGE_PATTERN = /\/storage\/v1\/object\/public\//;
const SUPABASE_STORAGE_RENDER   = "/storage/v1/render/image/public/";

export function getTransformedImageUrl(
  url: string,
  options: ImageTransformOptions = {}
): string {
  // Only transform genuine Supabase Storage public URLs
  if (!url || !SUPABASE_STORAGE_PATTERN.test(url)) {
    return url;
  }

  const { width, quality = 80, format = "origin", resize = "cover" } = options;

  // Swap /object/public/ → /render/image/public/ to activate the transform API
  let transformedUrl = url.replace(
    "/storage/v1/object/public/",
    SUPABASE_STORAGE_RENDER
  );

  // Strip any existing transform params before re-applying
  const [base] = transformedUrl.split("?");
  const params = new URLSearchParams();

  if (width)  params.set("width",  String(width));
  if (quality !== 80) params.set("quality", String(quality));
  if (format !== "origin") params.set("format", format);
  if (resize !== "cover") params.set("resize",  resize);

  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
}

// Preset helpers so call sites stay readable
export const ImageTransforms = {
  /** 400 px thumbnail used in gallery grid and live photo feed */
  gridThumb:   (url: string) => getTransformedImageUrl(url, { width: 400, quality: 75 }),
  /** 800 px medium — lightbox opening frame, live feed enlarged view */
  medium:      (url: string) => getTransformedImageUrl(url, { width: 800, quality: 82 }),
  /** 1600 px large — lightbox full view */
  large:       (url: string) => getTransformedImageUrl(url, { width: 1600, quality: 88 }),
  /** 200 px micro — admin pending approval thumbnail */
  adminThumb:  (url: string) => getTransformedImageUrl(url, { width: 200, quality: 70 }),
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// uploadFileToBucket
// ─────────────────────────────────────────────────────────────────────────────
export async function uploadFileToBucket(params: {
  bucket: StorageBucket;
  file: File;
  folder?: string;
}) {
  const { bucket, file, folder = "uploads" } = params;

  if (!isAllowedBucket(bucket)) {
    throw new Error(`Unsupported bucket: ${bucket}`);
  }

  const adminClient = getSupabaseAdminClient();

  if (!adminClient) {
    return {
      success: true,
      demoMode: true,
      path: `${folder}/${sanitizeFileName(file.name)}`,
      publicUrl: DEMO_UPLOAD_PLACEHOLDER
    };
  }

  const filePath = `${folder}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const bytes = await file.arrayBuffer();
  const { error } = await adminClient.storage.from(bucket).upload(filePath, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });

  if (error) {
    if (shouldFallbackToDemoStorage(error.message)) {
      return {
        success: true,
        demoMode: true,
        path: filePath,
        publicUrl: DEMO_UPLOAD_PLACEHOLDER
      };
    }
    throw new Error(error.message);
  }

  if (bucket === "family-vault") {
    const signed = await adminClient.storage
      .from(bucket)
      .createSignedUrl(filePath, FAMILY_VAULT_SIGNED_URL_EXPIRY_SECONDS);

    if (signed.error) {
      if (shouldFallbackToDemoStorage(signed.error.message)) {
        return { success: true, demoMode: true, path: filePath, publicUrl: DEMO_UPLOAD_PLACEHOLDER };
      }
      throw new Error(signed.error.message);
    }

    return { success: true, demoMode: false, path: filePath, publicUrl: signed.data.signedUrl };
  }

  const publicUrl = adminClient.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
  return { success: true, demoMode: false, path: filePath, publicUrl };
}

/**
 * Re-sign a path from any bucket on demand (call from server action / API route only).
 */
export async function createSignedMediaUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn = 3600
) {
  const adminClient = getSupabaseAdminClient();
  if (!adminClient) return null;

  const { data, error } = await adminClient.storage.from(bucket).createSignedUrl(path, expiresIn);

  if (error) {
    if (shouldFallbackToDemoStorage(error.message)) return null;
    throw new Error(error.message);
  }

  return data.signedUrl;
}

export { FAMILY_VAULT_SIGNED_URL_EXPIRY_SECONDS };
