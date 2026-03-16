import { DEMO_WEDDING_ID, demoFamilyPosts, demoWedding } from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { FamilyPostRow, FamilyVaultBundle, PhotoRow, WeddingRow } from "@/lib/types";
import { getAnniversaryTimeline } from "@/modules/luxury/anniversary-timeline";
import { getMediaArchive } from "@/modules/luxury/media-archive";

export interface VaultAlbum {
  id:          string;
  album_name:  string;
  description: string | null;
  cover_photo: string | null;
  is_public:   boolean;
  photos:      PhotoRow[];
}

async function getVaultAlbums(weddingId: string, client: ReturnType<typeof getConfiguredSupabaseClient>): Promise<{ albums: VaultAlbum[]; unassigned: PhotoRow[] }> {
  if (!client) return { albums: [], unassigned: [] };

  const [{ data: albumRows }, { data: photoRows }] = await Promise.all([
    (client as NonNullable<typeof client>).from("photo_albums" as never).select("*").eq("wedding_id", weddingId).eq("is_public" as never, true).order("sort_order" as never),
    (client as NonNullable<typeof client>).from("photos").select("*").eq("wedding_id", weddingId).eq("is_approved", true).order("created_at", { ascending: false }),
  ]);

  const photos = (photoRows ?? []) as PhotoRow[];
  const albums = (albumRows ?? []) as Array<Record<string, unknown>>;

  // Group photos by album_id
  const albumMap: Record<string, PhotoRow[]> = {};
  const unassigned: PhotoRow[] = [];
  for (const p of photos) {
    const aid = (p as PhotoRow & { album_id?: string | null }).album_id;
    if (aid) {
      albumMap[aid] ??= [];
      albumMap[aid].push(p);
    } else {
      unassigned.push(p);
    }
  }

  const vaultAlbums: VaultAlbum[] = albums.map(a => ({
    id:          a.id as string,
    album_name:  a.album_name as string,
    description: (a.description as string) ?? null,
    cover_photo: (a.cover_photo as string) ?? null,
    is_public:   a.is_public as boolean,
    photos:      albumMap[a.id as string] ?? [],
  }));

  return { albums: vaultAlbums, unassigned };
}

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
