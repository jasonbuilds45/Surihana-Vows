import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

interface PostBody {
  weddingId?: string;
  title?: string;
  content?: string;
  postType?: "memory" | "blessing" | "milestone" | "anniversary";
  postedBy?: string;
  mediaUrl?: string | null;
}

const VALID_POST_TYPES = new Set(["memory", "blessing", "milestone", "anniversary"]);

export async function POST(request: NextRequest) {
  // Must be a logged-in family or admin member
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/family")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = await request.json() as PostBody;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  const { weddingId, title, content, postType = "memory", postedBy } = body;

  if (!weddingId || !title?.trim() || !content?.trim()) {
    return NextResponse.json(
      { success: false, message: "weddingId, title, and content are required." },
      { status: 400 }
    );
  }

  if (!VALID_POST_TYPES.has(postType)) {
    return NextResponse.json({ success: false, message: "Invalid post type." }, { status: 400 });
  }

  const payload = {
    id: crypto.randomUUID(),
    wedding_id: weddingId,
    title: title.trim(),
    content: content.trim(),
    media_url: mediaUrl ?? null,
    posted_by: postedBy?.trim() || session.email,
    post_type: postType,
    created_at: new Date().toISOString()
  };

  const client = getConfiguredSupabaseClient(true);

  if (!client) {
    // Demo mode — accept without DB write
    return NextResponse.json({ success: true, data: payload, demoMode: true });
  }

  const { error } = await client.from("family_posts").insert(payload);

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: true, data: payload, demoMode: true });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: payload });
}
