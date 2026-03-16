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

// PATCH — update unlock_date or is_revealed
export async function PATCH(request: NextRequest, { params }: RouteProps) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  const update: Record<string, unknown> = {};
  if ("is_revealed"  in body) update.is_revealed  = Boolean(body.is_revealed);
  if ("unlock_date"  in body) update.unlock_date  = String(body.unlock_date);

  const { error } = await client.from("time_capsules").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE
export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  const { error } = await client.from("time_capsules").delete().eq("id", params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
