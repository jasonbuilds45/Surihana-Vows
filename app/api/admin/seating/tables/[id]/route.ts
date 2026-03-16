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

// DELETE /api/admin/seating/tables/[id]
export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  // Assignments cascade via FK, but delete them explicitly for safety
  await client.from("seating_assignments" as never).delete().eq("table_id", params.id);

  const { error } = await client.from("seating_tables" as never).delete().eq("id", params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
