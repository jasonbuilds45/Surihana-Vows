// PATCH /api/admin/sender-profiles/[id]   { displayTitle?, subText?, side?, senderType?, senderCode? }
// DELETE /api/admin/sender-profiles/[id]

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Admin only." }, { status: 401 });
  }

  let body: {
    displayTitle?: string;
    subText?: string;
    side?: string;
    senderType?: string;
    senderCode?: string;
  };
  try { body = await request.json() as typeof body; }
  catch { return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 }); }

  const updates: Record<string, string> = {};
  if (body.displayTitle?.trim()) updates.display_title = body.displayTitle.trim();
  if (body.subText?.trim())      updates.sub_text      = body.subText.trim();
  if (body.side)                 updates.side          = body.side;
  if (body.senderType)           updates.sender_type   = body.senderType;
  if (body.senderCode?.trim())   updates.sender_code   = slugify(body.senderCode.trim());

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, message: "No fields to update." }, { status: 400 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  const { data, error } = await client
    .from("sender_profiles")
    .update(updates)
    .eq("id", params.id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) return NextResponse.json({ success: true, demoMode: true });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Admin only." }, { status: 401 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  const { error } = await client
    .from("sender_profiles")
    .delete()
    .eq("id", params.id);

  if (error) {
    if (shouldFallbackToDemoData(error)) return NextResponse.json({ success: true, demoMode: true });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
