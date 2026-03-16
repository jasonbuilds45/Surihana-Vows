/**
 * /api/admin/planning
 * Unified planning API for all 10 planning modules.
 * GET  ?module=budget_items&weddingId=   → list rows
 * POST { module, weddingId, ...fields }  → create row
 * PATCH { module, id, ...fields }        → update row
 * DELETE { module, id }                  → delete row
 *
 * Admin-only. Uses service-role client (bypasses RLS).
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyAuthToken } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

export const runtime = "nodejs";

const ALLOWED_MODULES = new Set([
  "budget_items",
  "shopping_items",
  "guest_accommodations",
  "guest_travel",
  "wedding_party_members",
  "catering_menu",
  "wedding_music",
  "decor_ideas",
  "planning_tasks",
  "gifts",
]);

async function adminSession(req: NextRequest) {
  const token = extractToken(req);
  if (!token) return null;
  const s = await verifyAuthToken(token);
  return s?.role === "admin" ? s : null;
}

// ── GET — list all rows for a module ──────────────────────────────────────────
export async function GET(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const module    = searchParams.get("module") ?? "";
  const weddingId = searchParams.get("weddingId") ?? "";

  if (!ALLOWED_MODULES.has(module)) {
    return NextResponse.json({ success: false, message: "Invalid module." }, { status: 400 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, data: [], demoMode: true });

  const { data, error } = await client
    .from(module as never)
    .select("*")
    .eq("wedding_id" as never, weddingId)
    .order("created_at" as never, { ascending: true });

  if (error) {
    if (shouldFallbackToDemoData(error)) return NextResponse.json({ success: true, data: [], demoMode: true });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: data ?? [] });
}

// ── POST — create a row ───────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const { module, ...fields } = body;

  if (typeof module !== "string" || !ALLOWED_MODULES.has(module)) {
    return NextResponse.json({ success: false, message: "Invalid module." }, { status: 400 });
  }

  const payload = { id: crypto.randomUUID(), ...fields, created_at: new Date().toISOString() };

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, data: payload, demoMode: true });

  const { data, error } = await client
    .from(module as never)
    .insert(payload as never)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}

// ── PATCH — update a row ──────────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const { module, id, ...fields } = body;

  if (typeof module !== "string" || !ALLOWED_MODULES.has(module) || !id) {
    return NextResponse.json({ success: false, message: "Invalid module or missing id." }, { status: 400 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  const { error } = await client
    .from(module as never)
    .update(fields as never)
    .eq("id" as never, id);

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// ── DELETE — delete a row ─────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const { module, id } = body;

  if (typeof module !== "string" || !ALLOWED_MODULES.has(module) || !id) {
    return NextResponse.json({ success: false, message: "Invalid module or missing id." }, { status: 400 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  const { error } = await client
    .from(module as never)
    .delete()
    .eq("id" as never, id);

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
