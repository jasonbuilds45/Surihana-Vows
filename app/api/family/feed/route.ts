// GET /api/family/feed?weddingId=
// Returns family posts (newest first) with aggregated reaction counts.
// Polled every 30s by FamilyFeed for live updates.

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { DEMO_WEDDING_ID, demoFamilyPosts } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/family")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const weddingId = request.nextUrl.searchParams.get("weddingId") ?? DEMO_WEDDING_ID;
  const client    = getConfiguredSupabaseClient(true);

  if (!client) {
    return NextResponse.json({
      success: true,
      data: demoFamilyPosts.map(p => ({ ...p, reactions: [] })),
      demoMode: true,
    });
  }

  // Fetch posts + reactions in parallel
  const [postsResult, reactionsResult] = await Promise.all([
    client
      .from("family_posts")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false }),
    client
      .from("family_post_reactions")
      .select("post_id, emoji, reacted_by")
      .order("created_at", { ascending: true }),
  ]);

  if (postsResult.error) {
    if (shouldFallbackToDemoData(postsResult.error)) {
      return NextResponse.json({
        success: true,
        data: demoFamilyPosts.map(p => ({ ...p, reactions: [] })),
        demoMode: true,
      });
    }
    return NextResponse.json({ success: false, message: postsResult.error.message }, { status: 500 });
  }

  const posts    = postsResult.data ?? [];
  const reactions = (reactionsResult.data ?? []) as Array<{ post_id: string; emoji: string; reacted_by: string }>;

  // Group reactions by post_id → { emoji → { count, mine } }
  type ReactionGroup = Record<string, { count: number; mine: boolean }>;
  const reactionMap = new Map<string, ReactionGroup>();

  for (const r of reactions) {
    const group = reactionMap.get(r.post_id) ?? {};
    const existing = group[r.emoji] ?? { count: 0, mine: false };
    group[r.emoji] = {
      count: existing.count + 1,
      mine:  existing.mine || r.reacted_by === session.email,
    };
    reactionMap.set(r.post_id, group);
  }

  // Attach reactions array to each post
  const enriched = posts.map(post => {
    const group = reactionMap.get(post.id) ?? {};
    return {
      ...post,
      reactions: Object.entries(group).map(([emoji, v]) => ({
        emoji,
        count: v.count,
        mine:  v.mine,
      })),
    };
  });

  return NextResponse.json({ success: true, data: enriched });
}
