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

// PATCH — update is_active or reveal_results
export async function PATCH(request: NextRequest, { params }: RouteProps) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  const allowed: Record<string, unknown> = {};
  if ("is_active"      in body) allowed.is_active      = Boolean(body.is_active);
  if ("reveal_results" in body) allowed.reveal_results = Boolean(body.reveal_results);
  if ("sort_order"     in body) allowed.sort_order     = Number(body.sort_order);

  const { error } = await client.from("prediction_questions" as never).update(allowed as never).eq("id", params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE
export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  const { error } = await client.from("prediction_questions" as never).delete().eq("id", params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
