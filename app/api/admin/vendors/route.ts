// GET  /api/admin/vendors?weddingId=  — list all vendors for a wedding
// POST /api/admin/vendors             — create a vendor

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { VendorRow } from "@/components/admin/VendorHub";

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/api/admin")) {
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
    .from("vendors")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("arrival_time", { ascending: true, nullsFirst: false });

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
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: {
    weddingId?: string;
    vendorName?: string;
    role?: string;
    contactPhone?: string | null;
    contactEmail?: string | null;
    arrivalTime?: string | null;
    setupNotes?: string | null;
  };

  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  const { weddingId, vendorName, role } = body;
  if (!weddingId || !vendorName?.trim() || !role?.trim()) {
    return NextResponse.json(
      { success: false, message: "weddingId, vendorName, and role are required." },
      { status: 400 }
    );
  }

  const payload: Omit<VendorRow, "created_at"> & { created_at: string } = {
    id: crypto.randomUUID(),
    wedding_id: weddingId,
    vendor_name: vendorName.trim(),
    role: role.trim(),
    contact_phone: body.contactPhone?.trim() || null,
    contact_email: body.contactEmail?.trim() || null,
    arrival_time: body.arrivalTime?.trim() || null,
    setup_notes: body.setupNotes?.trim() || null,
    status: "pending",
    created_at: new Date().toISOString()
  };

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return NextResponse.json({ success: true, data: payload, demoMode: true });
  }

  const { data, error } = await client.from("vendors").insert(payload).select("*").maybeSingle();
  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: true, data: payload, demoMode: true });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
