// GET  /api/family/polls  — list active polls for a wedding
// POST /api/family/polls  — create a new poll (admin only)

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/family")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const weddingId = request.nextUrl.searchParams.get("weddingId");
  if (!weddingId) {
    return NextResponse.json({ success: false, message: "weddingId required." }, { status: 400 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return NextResponse.json({ success: true, data: [], demoMode: true });
  }

  const { data, error } = await client
    .from("family_polls")
    .select("*, family_poll_votes(answer, voter_email)")
    .eq("wedding_id", weddingId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: true, data: [], demoMode: true });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/api/admin")) {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 401 });
  }

  let body: { weddingId?: string; question?: string; options?: string[] };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  const { weddingId, question, options } = body;
  if (!weddingId || !question?.trim() || !options?.length || options.length < 2) {
    return NextResponse.json(
      { success: false, message: "weddingId, question, and at least 2 options are required." },
      { status: 400 }
    );
  }

  const payload = {
    id: crypto.randomUUID(),
    wedding_id: weddingId,
    question: question.trim(),
    options: options.map((o) => o.trim()).filter(Boolean),
    is_active: true,
    created_at: new Date().toISOString()
  };

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return NextResponse.json({ success: true, data: payload, demoMode: true });
  }

  const { data, error } = await client.from("family_polls").insert(payload).select("*").maybeSingle();
  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: true, data: payload, demoMode: true });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
