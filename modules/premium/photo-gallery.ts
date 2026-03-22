import { galleryConfig } from "@/lib/config";
import { DEMO_WEDDING_ID, demoPhotos } from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { PhotoRow } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// getGalleryPhotos
// Public-facing gallery query. Only returns approved photos (is_approved = true).
// Guest uploads start as unapproved (Phase 3.4); admin approves via UploadManager.
//
// Pass includeUnapproved = true from server-side admin routes to see all photos.
// ─────────────────────────────────────────────────────────────────────────────
export async function getGalleryPhotos(
  weddingId = DEMO_WEDDING_ID,
  category?: string,
  includeUnapproved = false
): Promise<PhotoRow[]> {
  // Use service-role client so RLS never blocks reading approved photos.
  // The is_approved filter itself enforces what guests can see.
  const client = getConfiguredSupabaseClient(true);

  // Demo photos are always treated as approved — no is_approved field in demo data.
  let photos = demoPhotos.filter((photo) => photo.wedding_id === weddingId);

  if (client) {
    let query = client
      .from("photos")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    // Filter to approved photos only for public queries.
    // Admin routes pass includeUnapproved = true to see pending photos.
    if (!includeUnapproved) {
      query = query.eq("is_approved", true);
    }

    const { data, error } = await query;
    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return category ? photos.filter((photo) => photo.category === category) : photos;
      }

      throw new Error(error.message);
    }

    photos = (data as PhotoRow[] | null) ?? photos;
  }

  return category ? photos.filter((photo) => photo.category === category) : photos;
}

export function getGalleryCategories() {
  return galleryConfig.featuredCategories;
}

export function getSlideshowPhotos() {
  return galleryConfig.slideshow;
}
