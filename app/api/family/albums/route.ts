// GET /api/family/albums?weddingId=
// Returns all albums + photos for the family vault.
// Both admin and family roles can access.

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { DEMO_WEDDING_ID } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/family")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const weddingId = request.nextUrl.searchParams.get("weddingId") ?? DEMO_WEDDING_ID;
  const client    = getConfiguredSupabaseClient(true);

  if (!client) {
    return NextResponse.json({ success: true, albums: [], photos: [], demoMode: true });
  }

  const [{ data: albums, error: albumErr }, { data: photos, error: photoErr }] = await Promise.all([
    client
      .from("photo_albums" as never)
      .select("*")
      .eq("wedding_id", weddingId)
      .order("sort_order"),
    client
      .from("photos")
      .select("id, image_url, uploaded_by, category, created_at, is_approved, album_id")
      .eq("wedding_id", weddingId)
      .eq("is_approved", true)
      .not("album_id" as never, "is", null)
      .order("created_at", { ascending: false }),
  ]);

  if (albumErr && !shouldFallbackToDemoData(albumErr)) {
    return NextResponse.json({ success: false, message: albumErr.message }, { status: 500 });
  }
  if (photoErr && !shouldFallbackToDemoData(photoErr)) {
    return NextResponse.json({ success: false, message: photoErr.message }, { status: 500 });
  }

  // Enrich albums with photo count
  const photoList = (photos ?? []) as Array<{ album_id: string | null }>;
  const countMap: Record<string, number> = {};
  for (const p of photoList) {
    if (p.album_id) countMap[p.album_id] = (countMap[p.album_id] ?? 0) + 1;
  }

  const enrichedAlbums = ((albums ?? []) as Array<Record<string, unknown>>).map(a => ({
    ...a,
    photo_count: countMap[a.id as string] ?? 0,
  }));

  return NextResponse.json({ success: true, albums: enrichedAlbums, photos: photos ?? [] });
}
