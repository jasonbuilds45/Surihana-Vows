import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyAuthToken } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { DEMO_WEDDING_ID } from "@/lib/demo-data";

export const runtime = "nodejs";

async function adminSession(req: NextRequest) {
  const token = extractToken(req);
  if (!token) return null;
  const s = await verifyAuthToken(token);
  return s?.role === "admin" ? s : null;
}

// GET /api/admin/albums?weddingId= — list albums with photo counts
export async function GET(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const weddingId = request.nextUrl.searchParams.get("weddingId") ?? DEMO_WEDDING_ID;
  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, albums: [], photos: [], demoMode: true });

  const [{ data: albums, error: albumErr }, { data: photos, error: photoErr }] = await Promise.all([
    client.from("photo_albums" as never).select("*").eq("wedding_id", weddingId).order("sort_order"),
    client.from("photos").select("id, image_url, uploaded_by, category, created_at, album_id, is_approved").eq("wedding_id", weddingId).eq("is_approved", true).order("created_at", { ascending: false }),
  ]);

  if (albumErr && !shouldFallbackToDemoData(albumErr)) {
    return NextResponse.json({ success: false, message: albumErr.message }, { status: 500 });
  }

  // Count photos per album
  const countMap: Record<string, number> = {};
  for (const p of (photos ?? []) as Array<{ album_id: string | null }>) {
    if (p.album_id) countMap[p.album_id] = (countMap[p.album_id] ?? 0) + 1;
  }

  const enrichedAlbums = ((albums ?? []) as Array<Record<string, unknown>>).map(a => ({
    ...a,
    photo_count: countMap[a.id as string] ?? 0,
  }));

  return NextResponse.json({ success: true, albums: enrichedAlbums, photos: photos ?? [] });
}

// POST — create album
export async function POST(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const body = await request.json() as { weddingId?: string; albumName?: string; description?: string | null; isPublic?: boolean };
  const { weddingId = DEMO_WEDDING_ID, albumName, description = null, isPublic = true } = body;
  if (!albumName?.trim()) return NextResponse.json({ success: false, message: "albumName required." }, { status: 400 });

  const client = getConfiguredSupabaseClient(true);
  const payload = {
    id: crypto.randomUUID(), wedding_id: weddingId,
    album_name: albumName.trim(), description: description ?? null,
    cover_photo: null, is_public: isPublic, sort_order: 0,
    created_at: new Date().toISOString(),
  };

  if (!client) return NextResponse.json({ success: true, data: { ...payload, photo_count: 0 }, demoMode: true });

  const { data, error } = await client.from("photo_albums" as never).insert(payload as never).select("*").maybeSingle();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { ...(data as Record<string, unknown> ?? {}), photo_count: 0 } }, { status: 201 });
}
