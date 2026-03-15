import { DEMO_WEDDING_ID, demoPhotos, demoVideos } from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { PhotoRow, VideoRow } from "@/lib/types";

export async function getMediaArchive(
  weddingId = DEMO_WEDDING_ID
): Promise<{ photos: PhotoRow[]; videos: VideoRow[] }> {
  const client = getConfiguredSupabaseClient();

  if (client) {
    const [photosResult, videosResult] = await Promise.all([
      client.from("photos").select("*").eq("wedding_id", weddingId).order("created_at", { ascending: false }),
      client.from("videos").select("*").eq("wedding_id", weddingId).order("created_at", { ascending: false })
    ]);

    if (photosResult.error) {
      if (shouldFallbackToDemoData(photosResult.error)) {
        return { photos: demoPhotos, videos: demoVideos };
      }
      throw new Error(photosResult.error.message);
    }

    if (videosResult.error) {
      if (shouldFallbackToDemoData(videosResult.error)) {
        return {
          photos: (photosResult.data as PhotoRow[] | null) ?? demoPhotos,
          videos: demoVideos
        };
      }
      throw new Error(videosResult.error.message);
    }

    return {
      photos: (photosResult.data as PhotoRow[] | null) ?? [],
      videos: (videosResult.data as VideoRow[] | null) ?? []
    };
  }

  return { photos: demoPhotos, videos: demoVideos };
}

// ─────────────────────────────────────────────────────────────────────────────
// getHighlightVideo  (Phase 6.6)
//
// Returns the VideoRow to feature on the public homepage, or null if no video
// is available (pre-wedding / demo / not yet published).
//
// Priority:
//   1. configUrl — weddingConfig.highlightVideoUrl if set in wedding.json.
//      This is a hardcoded embed URL the couple or admin has pinned; it never
//      changes at runtime and is the recommended production approach.
//   2. First row from the videos table ordered by created_at DESC — lets the
//      couple publish a highlight without a code redeploy by inserting a row
//      in Supabase.
//   3. null — section is hidden on the homepage.
//
// Demo mode: falls back to the first demoVideos entry so the homepage shows
// something meaningful without a real Supabase connection.
// ─────────────────────────────────────────────────────────────────────────────
export async function getHighlightVideo(
  weddingId: string,
  configUrl?: string
): Promise<VideoRow | null> {
  // ── Path 1: config-pinned URL ─────────────────────────────────────────────
  if (configUrl?.trim()) {
    return {
      id: "config-highlight",
      wedding_id: weddingId,
      title: "Wedding Highlight Film",
      video_url: configUrl.trim(),
      created_at: null
    };
  }

  // ── Path 2: first row from the videos table ───────────────────────────────
  const client = getConfiguredSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from("videos")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return demoVideos[0] ?? null;
      }
      // Non-fatal: hide the section rather than breaking the homepage
      console.error("[getHighlightVideo] videos table error:", error.message);
      return null;
    }

    return (data as VideoRow | null) ?? null;
  }

  // ── Path 3: demo fallback ─────────────────────────────────────────────────
  return demoVideos[0] ?? null;
}
