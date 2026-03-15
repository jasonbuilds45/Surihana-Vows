import { DEMO_WEDDING_ID, demoFamilyPosts, demoWedding } from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { FamilyPostRow, FamilyVaultBundle, WeddingRow } from "@/lib/types";
import { getAnniversaryTimeline } from "@/modules/luxury/anniversary-timeline";
import { getMediaArchive } from "@/modules/luxury/media-archive";

export async function getFamilyVaultBundle(weddingId = DEMO_WEDDING_ID): Promise<FamilyVaultBundle> {
  const client = getConfiguredSupabaseClient();
  const mediaArchive = await getMediaArchive(weddingId);
  let posts = demoFamilyPosts.filter((post) => post.wedding_id === weddingId);

  if (client) {
    const [weddingResult, postsResult] = await Promise.all([
      client.from("weddings").select("*").eq("id", weddingId).maybeSingle(),
      client
        .from("family_posts")
        .select("*")
        .eq("wedding_id", weddingId)
        .order("created_at", { ascending: false })
    ]);

    if (weddingResult.error) {
      if (shouldFallbackToDemoData(weddingResult.error)) {
        return {
          wedding: demoWedding,
          posts,
          photos: mediaArchive.photos,
          videos: mediaArchive.videos,
          // Phase 4.4: pass demo posts so timeline uses real content in demo mode
          timeline: getAnniversaryTimeline(demoWedding, posts)
        };
      }

      throw new Error(weddingResult.error.message);
    }

    const wedding = (weddingResult.data as WeddingRow | null) ?? demoWedding;

    if (postsResult.error) {
      if (shouldFallbackToDemoData(postsResult.error)) {
        return {
          wedding,
          posts,
          photos: mediaArchive.photos,
          videos: mediaArchive.videos,
          // Phase 4.4: fall back to demo posts for timeline when posts query fails
          timeline: getAnniversaryTimeline(wedding, posts)
        };
      }

      throw new Error(postsResult.error.message);
    }

    // Use real posts from Supabase; fall back to demo posts only if the query
    // returned nothing (empty table on first deploy).
    posts = (postsResult.data as FamilyPostRow[] | null) ?? posts;

    return {
      wedding,
      posts,
      photos: mediaArchive.photos,
      videos: mediaArchive.videos,
      // Phase 4.4: timeline now driven by real post content, not demo data
      timeline: getAnniversaryTimeline(wedding, posts)
    };
  }

  return {
    wedding: demoWedding,
    posts,
    photos: mediaArchive.photos,
    videos: mediaArchive.videos,
    timeline: getAnniversaryTimeline(demoWedding, posts)
  };
}
