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

// GET /api/admin/seating/tables?weddingId= — list tables with guest assignments
export async function GET(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const weddingId = request.nextUrl.searchParams.get("weddingId") ?? DEMO_WEDDING_ID;
  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, data: [], demoMode: true });

  const { data: tables, error } = await client
    .from("seating_tables" as never)
    .select("*")
    .eq("wedding_id", weddingId)
    .order("sort_order");

  if (error) {
    if (shouldFallbackToDemoData(error)) return NextResponse.json({ success: true, data: [], demoMode: true });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  // Get all assignments for this wedding's tables
  const tableIds = (tables as Array<{ id: string }>).map(t => t.id);
  const { data: assignments } = tableIds.length > 0
    ? await client.from("seating_assignments" as never).select("guest_id, table_id").in("table_id", tableIds)
    : { data: [] };

  // Group assignment guest_ids by table_id
  const assignMap: Record<string, string[]> = {};
  for (const a of (assignments ?? []) as Array<{ guest_id: string; table_id: string }>) {
    assignMap[a.table_id] ??= [];
    assignMap[a.table_id].push(a.guest_id);
  }

  const enriched = (tables as Array<Record<string, unknown>>).map(t => ({
    ...t,
    guests: assignMap[t.id as string] ?? [],
  }));

  return NextResponse.json({ success: true, data: enriched });
}

// POST — create a new seating table
export async function POST(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const body = await request.json() as { weddingId?: string; tableName?: string; capacity?: number; notes?: string | null };
  const { weddingId = DEMO_WEDDING_ID, tableName, capacity = 8, notes = null } = body;
  if (!tableName?.trim()) return NextResponse.json({ success: false, message: "tableName required." }, { status: 400 });

  const client = getConfiguredSupabaseClient(true);
  const payload = {
    id: crypto.randomUUID(), wedding_id: weddingId,
    table_name: tableName.trim(), capacity, notes: notes ?? null,
    sort_order: 0, created_at: new Date().toISOString(),
  };

  if (!client) return NextResponse.json({ success: true, data: { ...payload, guests: [] }, demoMode: true });

  const { data, error } = await client.from("seating_tables" as never).insert(payload as never).select("*").maybeSingle();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}
