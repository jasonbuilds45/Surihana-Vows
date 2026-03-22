import { galleryConfig } from "@/lib/config";
import { DEMO_WEDDING_ID, demoPhotos } from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { PhotoRow } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// getGalleryPhotos
// Public-facing gallery query. Only returns approved photos (is_approved = true).
// Guest uploads start as unapproved (Phase 3.4); admin approves via UploadManager.
//
// Strategy:
//   - Always try to load from DB first (service-role client bypasses RLS)
//   - Merge real DB photos with seed/demo photos so gallery is never empty
//   - Seed photos with image_urls already in DB are deduplicated
//   - Pass includeUnapproved = true from admin routes to see pending photos
// ─────────────────────────────────────────────────────────────────────────────
export async function getGalleryPhotos(
  weddingId = DEMO_WEDDING_ID,
  category?: string,
  includeUnapproved = false
): Promise<PhotoRow[]> {
  // Service-role client bypasses RLS so approved photos always read correctly.
  const client = getConfiguredSupabaseClient(true);

  // Seed photos — used as a baseline so the gallery is never completely empty.
  const seedPhotos = demoPhotos.filter((p) => p.wedding_id === weddingId);

  if (client) {
    let query = client
      .from("photos")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (!includeUnapproved) {
      query = query.eq("is_approved", true);
    }

    const { data, error } = await query;

    if (error) {
      if (shouldFallbackToDemoData(error)) {
        // Table missing / schema error — fall back to seed photos only
        return category ? seedPhotos.filter((p) => p.category === category) : seedPhotos;
      }
      throw new Error(error.message);
    }

    const dbPhotos = (data as PhotoRow[] | null) ?? [];

    // Merge: real DB photos first, then seed photos whose image_url doesn't
    // already appear in the DB set. This avoids duplicates while ensuring
    // the gallery has content from day one.
    const dbUrls = new Set(dbPhotos.map((p) => p.image_url));
    const merged = [
      ...dbPhotos,
      ...seedPhotos.filter((p) => !dbUrls.has(p.image_url)),
    ];

    return category ? merged.filter((p) => p.category === category) : merged;
  }

  // No Supabase client configured — demo/dev mode, return seed photos only
  return category ? seedPhotos.filter((p) => p.category === category) : seedPhotos;
}

export function getGalleryCategories() {
  return galleryConfig.featuredCategories;
}

export function getSlideshowPhotos() {
  return galleryConfig.slideshow;
}
