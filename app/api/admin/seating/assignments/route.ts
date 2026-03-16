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

// POST /api/admin/seating/assignments — assign a guest to a table
export async function POST(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const body = await request.json() as { guestId?: string; tableId?: string };
  const { guestId, tableId } = body;
  if (!guestId || !tableId) return NextResponse.json({ success: false, message: "guestId and tableId required." }, { status: 400 });

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  // Upsert: if guest already assigned, move to new table
  const payload = {
    id: crypto.randomUUID(),
    guest_id: guestId,
    table_id: tableId,
    created_at: new Date().toISOString(),
  };

  const { error } = await client
    .from("seating_assignments" as never)
    .upsert(payload as never, { onConflict: "guest_id" });

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true }, { status: 201 });
}
