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

// GET /api/admin/insights?weddingId=
export async function GET(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const weddingId = request.nextUrl.searchParams.get("weddingId") ?? DEMO_WEDDING_ID;
  const client = getConfiguredSupabaseClient(true);

  const empty = { photoStats: [], messageStats: [], hourlyUploads: [], predictionRate: 0, totalPredictions: 0 };
  if (!client) return NextResponse.json({ success: true, ...empty, demoMode: true });

  const [
    { data: photos,      error: photoErr },
    { data: messages,    error: msgErr },
    { data: guests,      error: guestErr },
    { data: predictions },
  ] = await Promise.all([
    client.from("photos").select("uploaded_by, created_at").eq("wedding_id", weddingId).eq("is_approved", true),
    client.from("guest_messages").select("guest_name").eq("wedding_id", weddingId),
    client.from("guests").select("id").eq("wedding_id", weddingId),
    client.from("guest_predictions").select("guest_identifier, created_at").eq("wedding_id", weddingId),
  ]);

  if (photoErr && !shouldFallbackToDemoData(photoErr)) {
    return NextResponse.json({ success: false, message: photoErr.message }, { status: 500 });
  }

  // Photo stats — count by uploaded_by
  const photoCountMap: Record<string, number> = {};
  for (const p of (photos ?? []) as Array<{ uploaded_by: string }>) {
    photoCountMap[p.uploaded_by] = (photoCountMap[p.uploaded_by] ?? 0) + 1;
  }
  const photoStats = Object.entries(photoCountMap)
    .map(([guestName, count]) => ({ guestName, count }))
    .sort((a, b) => b.count - a.count);

  // Message stats — count by guest_name
  const msgCountMap: Record<string, number> = {};
  for (const m of (messages ?? []) as Array<{ guest_name: string }>) {
    msgCountMap[m.guest_name] = (msgCountMap[m.guest_name] ?? 0) + 1;
  }
  const messageStats = Object.entries(msgCountMap)
    .map(([guestName, count]) => ({ guestName, count }))
    .sort((a, b) => b.count - a.count);

  // Hourly uploads for photos (0–23 hour buckets)
  const hourlyCounts: Record<number, number> = {};
  for (const p of (photos ?? []) as Array<{ created_at: string }>) {
    const h = new Date(p.created_at).getHours();
    hourlyCounts[h] = (hourlyCounts[h] ?? 0) + 1;
  }
  const hourlyUploads = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, "0")}:00`,
    count: hourlyCounts[h] ?? 0,
  })).filter(h => h.count > 0);

  // Prediction participation rate
  const totalGuests     = ((guests ?? []) as unknown[]).length;
  const uniquePredictors = new Set(((predictions ?? []) as Array<{ guest_identifier: string }>).map(p => p.guest_identifier)).size;
  const predictionRate  = totalGuests > 0 ? Math.round((uniquePredictors / totalGuests) * 100) : 0;
  const totalPredictions = ((predictions ?? []) as unknown[]).length;

  return NextResponse.json({
    success: true,
    photoStats,
    messageStats,
    hourlyUploads,
    predictionRate,
    totalPredictions,
  });
}
