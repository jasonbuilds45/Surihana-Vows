import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { getConfiguredSupabaseClient } from "@/lib/supabaseClient";

const VALID_REACTIONS = new Set(["❤️","🙏","😂","🥹","🎉","✨"]);

interface ReactBody { postId?: string; emoji?: string }

/**
 * POST /api/family/react
 * Toggles an emoji reaction on a family post (add / remove).
 */
export async function POST(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/family")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: ReactBody;
  try   { body = await request.json() as ReactBody; }
  catch { return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 }); }

  const { postId, emoji } = body;
  if (!postId || !emoji || !VALID_REACTIONS.has(emoji)) {
    return NextResponse.json({ success: false, message: "postId and valid emoji required." }, { status: 400 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return NextResponse.json({ success: true, action: "added", demoMode: true });
  }

  // Check for existing reaction (unique: post_id + emoji + reacted_by)
  const { data: existing } = await client
    .from("family_post_reactions")
    .select("id")
    .eq("post_id",    postId)
    .eq("emoji",      emoji)
    .eq("reacted_by", session.email)
    .maybeSingle();

  if (existing) {
    // Toggle OFF
    await client
      .from("family_post_reactions")
      .delete()
      .eq("id", (existing as { id: string }).id);
    return NextResponse.json({ success: true, action: "removed" });
  }

  // Toggle ON
  const { error } = await client
    .from("family_post_reactions")
    .insert({
      id:         crypto.randomUUID(),
      post_id:    postId,
      emoji,
      reacted_by: session.email,
      created_at: new Date().toISOString(),
    });

  if (error) {
    // 23505 = unique violation (race condition) — treat as already-reacted
    if (error.code === "23505") {
      return NextResponse.json({ success: true, action: "added" });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, action: "added" });
}

/**
 * GET /api/family/react?postId=xxx
 * Returns reaction counts for a single post.
 */
export async function GET(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/family")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const postId = request.nextUrl.searchParams.get("postId");
  if (!postId) return NextResponse.json({ success: false, message: "postId required." }, { status: 400 });

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, data: [], demoMode: true });

  const { data } = await client
    .from("family_post_reactions")
    .select("emoji, reacted_by")
    .eq("post_id", postId);

  const rows = (data ?? []) as Array<{ emoji: string; reacted_by: string }>;
  const grouped = new Map<string, { count: number; mine: boolean }>();

  for (const row of rows) {
    const cur = grouped.get(row.emoji) ?? { count: 0, mine: false };
    grouped.set(row.emoji, {
      count: cur.count + 1,
      mine:  cur.mine || row.reacted_by === session.email,
    });
  }

  return NextResponse.json({
    success: true,
    data: [...grouped.entries()].map(([emoji, v]) => ({ emoji, ...v })),
  });
}
