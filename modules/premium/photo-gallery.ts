import { galleryConfig, weddingConfig } from "@/lib/config";
import { demoPhotos } from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { PhotoRow } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// getGalleryPhotos
//
// Strategy (in order):
//  1. Try Supabase with service-role key (bypasses RLS)
//  2. If DB returns rows → merge DB rows + seed photos (dedup by image_url)
//  3. If DB errors with schema fault → fall back to seed photos only
//  4. If DB succeeds but returns 0 rows → still merge with seed photos so
//     gallery is never completely empty before the wedding
//  5. If no Supabase configured → seed photos only (dev/demo mode)
// ─────────────────────────────────────────────────────────────────────────────
export async function getGalleryPhotos(
  weddingId = weddingConfig.id,
  category?: string,
  includeUnapproved = false
): Promise<PhotoRow[]> {
  // Seed photos — always used as baseline so gallery is never empty.
  // They are pre-approved and use the same weddingId as the config.
  const seedPhotos = demoPhotos.filter(p => p.wedding_id === weddingId);

  // Service-role client bypasses RLS; the is_approved filter enforces visibility.
  const client = getConfiguredSupabaseClient(true);

  if (client) {
    try {
      let query = client
        .from("photos")
        .select("*")
        .eq("wedding_id", weddingId)
        .order("created_at", { ascending: false });

      if (category) query = query.eq("category", category);
      if (!includeUnapproved) query = query.eq("is_approved", true);

      const { data, error } = await query;

      if (error) {
        // Schema / table missing — silently fall back to seed photos
        if (shouldFallbackToDemoData(error)) {
          return category ? seedPhotos.filter(p => p.category === category) : seedPhotos;
        }
        // Real error — surface it
        throw new Error(error.message);
      }

      const dbPhotos = (data as PhotoRow[] | null) ?? [];

      // Merge: real DB photos first, seed photos fill the gaps.
      // Dedup by image_url so slideshow photos don't appear twice.
      const dbUrls = new Set(dbPhotos.map(p => p.image_url));
      const merged = [
        ...dbPhotos,
        ...seedPhotos.filter(p => !dbUrls.has(p.image_url)),
      ];

      return category ? merged.filter(p => p.category === category) : merged;
    } catch (err) {
      // Unexpected error — fall back to seed so gallery never crashes
      console.error("[getGalleryPhotos] DB error, falling back to seed photos:", err);
      return category ? seedPhotos.filter(p => p.category === category) : seedPhotos;
    }
  }

  // No Supabase client — dev / demo mode
  return category ? seedPhotos.filter(p => p.category === category) : seedPhotos;
}

export function getGalleryCategories() {
  return galleryConfig.featuredCategories;
}

export function getSlideshowPhotos() {
  return galleryConfig.slideshow;
}
