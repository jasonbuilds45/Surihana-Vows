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

// GET /api/admin/time-capsules?weddingId=
export async function GET(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const weddingId = request.nextUrl.searchParams.get("weddingId") ?? DEMO_WEDDING_ID;
  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, data: [], demoMode: true });

  const { data, error } = await client
    .from("time_capsules")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("unlock_date", { ascending: true });

  if (error) {
    if (shouldFallbackToDemoData(error)) return NextResponse.json({ success: true, data: [], demoMode: true });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: data ?? [] });
}
