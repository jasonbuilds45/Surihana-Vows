// GET  /api/admin/sender-profiles?weddingId=
// POST /api/admin/sender-profiles           { weddingId, displayTitle, subText, side, senderType, senderCode }

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Admin only." }, { status: 401 });
  }

  const weddingId = request.nextUrl.searchParams.get("weddingId");
  if (!weddingId) {
    return NextResponse.json({ success: false, message: "weddingId required." }, { status: 400 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, data: [], demoMode: true });

  const { data, error } = await client
    .from("sender_profiles")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  if (error) {
    if (shouldFallbackToDemoData(error)) return NextResponse.json({ success: true, data: [], demoMode: true });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Admin only." }, { status: 401 });
  }

  let body: {
    weddingId?: string;
    displayTitle?: string;
    subText?: string;
    side?: string;
    senderType?: string;
    senderCode?: string;
  };
  try { body = await request.json() as typeof body; }
  catch { return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 }); }

  const { weddingId, displayTitle, subText, side, senderType, senderCode } = body;

  if (!weddingId || !displayTitle?.trim()) {
    return NextResponse.json(
      { success: false, message: "weddingId and displayTitle are required." },
      { status: 400 }
    );
  }

  const validSides = ["bride", "groom", "both"];
  const validTypes = ["parents", "sibling", "joint", "other"];
  const resolvedSide = validSides.includes(side ?? "") ? side! : "both";
  const resolvedType = validTypes.includes(senderType ?? "") ? senderType! : "parents";
  const resolvedCode = senderCode?.trim()
    ? slugify(senderCode.trim())
    : slugify(displayTitle.trim());

  const payload = {
    id:            crypto.randomUUID(),
    wedding_id:    weddingId,
    display_title: displayTitle.trim(),
    sub_text:      subText?.trim() || "joyfully invite you to celebrate",
    side:          resolvedSide as "bride" | "groom" | "both",
    sender_type:   resolvedType as "parents" | "sibling" | "joint" | "other",
    sender_code:   resolvedCode,
    created_at:    new Date().toISOString(),
  };

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, data: payload, demoMode: true });

  const { data, error } = await client
    .from("sender_profiles")
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, message: "A sender profile with that code already exists for this wedding." },
        { status: 409 }
      );
    }
    if (shouldFallbackToDemoData(error)) return NextResponse.json({ success: true, data: payload, demoMode: true });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
