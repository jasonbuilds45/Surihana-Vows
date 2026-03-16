import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyAuthToken } from "@/lib/auth";
import { getConfiguredSupabaseClient } from "@/lib/supabaseClient";

export const runtime = "nodejs";

async function adminSession(req: NextRequest) {
  const token = extractToken(req);
  if (!token) return null;
  const s = await verifyAuthToken(token);
  return s?.role === "admin" ? s : null;
}

// PATCH /api/admin/albums/assign — assign/unassign a photo to an album
export async function PATCH(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const body = await request.json() as { photoId?: string; albumId?: string | null };
  const { photoId, albumId = null } = body;
  if (!photoId) return NextResponse.json({ success: false, message: "photoId required." }, { status: 400 });

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  const { error } = await client
    .from("photos")
    .update({ album_id: albumId } as never)
    .eq("id", photoId);

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
