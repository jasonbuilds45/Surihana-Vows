import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

interface RouteParams {
  params: { id: string };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/api/admin")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ success: false, message: "Message ID is required." }, { status: 400 });
  }

  const client = getConfiguredSupabaseClient(true);

  if (!client) {
    // Demo mode — acknowledge without DB write
    return NextResponse.json({ success: true, demoMode: true });
  }

  const { error } = await client
    .from("guest_messages")
    .delete()
    .eq("id", id);

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: true, demoMode: true });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
