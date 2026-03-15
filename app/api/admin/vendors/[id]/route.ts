// PATCH /api/admin/vendors/[id] — update vendor status or details
// DELETE /api/admin/vendors/[id] — remove a vendor

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { VendorStatus } from "@/components/admin/VendorHub";

const VALID_STATUSES = new Set<VendorStatus>(["pending", "confirmed", "arrived", "done"]);

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/api/admin")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ success: false, message: "Vendor ID required." }, { status: 400 });
  }

  let body: {
    status?: string;
    vendorName?: string;
    role?: string;
    contactPhone?: string | null;
    arrivalTime?: string | null;
    setupNotes?: string | null;
  };

  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  // Build update object — only include defined fields
  const updates: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!VALID_STATUSES.has(body.status as VendorStatus)) {
      return NextResponse.json({ success: false, message: "Invalid status value." }, { status: 400 });
    }
    updates["status"] = body.status;
  }
  if (body.vendorName !== undefined) updates["vendor_name"] = body.vendorName.trim();
  if (body.role !== undefined) updates["role"] = body.role.trim();
  if (body.contactPhone !== undefined) updates["contact_phone"] = body.contactPhone?.trim() || null;
  if (body.arrivalTime !== undefined) updates["arrival_time"] = body.arrivalTime?.trim() || null;
  if (body.setupNotes !== undefined) updates["setup_notes"] = body.setupNotes?.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, message: "No fields to update." }, { status: 400 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return NextResponse.json({ success: true, data: { id, ...updates }, demoMode: true });
  }

  const { data, error } = await client
    .from("vendors")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: true, data: { id, ...updates }, demoMode: true });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/api/admin")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ success: false, message: "Vendor ID required." }, { status: 400 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return NextResponse.json({ success: true, demoMode: true });
  }

  const { error } = await client.from("vendors").delete().eq("id", id);

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: true, demoMode: true });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
