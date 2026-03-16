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

interface RouteProps { params: { id: string } }

// PATCH — update album name / description / visibility / cover
export async function PATCH(request: NextRequest, { params }: RouteProps) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  const update: Record<string, unknown> = {};
  if ("albumName"   in body) update.album_name  = String(body.albumName);
  if ("description" in body) update.description = body.description ?? null;
  if ("isPublic"    in body) update.is_public   = Boolean(body.isPublic);
  if ("coverPhoto"  in body) update.cover_photo = body.coverPhoto ?? null;
  if ("sortOrder"   in body) update.sort_order  = Number(body.sortOrder);

  const { error } = await client.from("photo_albums" as never).update(update as never).eq("id", params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE — delete album (photos become unassigned via ON DELETE SET NULL)
export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  const { error } = await client.from("photo_albums" as never).delete().eq("id", params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
