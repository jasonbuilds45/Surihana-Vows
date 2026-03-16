import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyAuthToken } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { DEMO_WEDDING_ID } from "@/lib/demo-data";
import { eventsConfig } from "@/lib/config";

export const runtime = "nodejs";

async function adminSession(req: NextRequest) {
  const token = extractToken(req);
  if (!token) return null;
  const s = await verifyAuthToken(token);
  return s?.role === "admin" ? s : null;
}

// GET /api/admin/command-center?weddingId=
export async function GET(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const weddingId = request.nextUrl.searchParams.get("weddingId") ?? DEMO_WEDDING_ID;
  const client = getConfiguredSupabaseClient(true);

  // Determine next event from config
  const now = new Date();
  const nextEvent = eventsConfig.find(e => new Date(`${e.date}T${e.time}`) > now) ?? null;

  const emptyMetrics = {
    photosToday: 0, messagesToday: 0, activeGuests: 0, liveViewers: 0,
    currentStage: "invitation",
    nextEvent: nextEvent?.eventName ?? null,
    nextEventTime: nextEvent ? `${nextEvent.date} at ${nextEvent.time}` : null,
  };

  if (!client) {
    return NextResponse.json({ success: true, metrics: emptyMetrics, activity: [], demoMode: true });
  }

  const todayStart = new Date(now.toISOString().slice(0, 10) + "T00:00:00.000Z").toISOString();

  // Run all queries in parallel — count queries are awaited directly (no cast needed)
  const [
    photosResult,
    messagesResult,
    analyticsResult,
    stageResult,
  ] = await Promise.all([
    client.from("photos").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId).gte("created_at", todayStart),
    client.from("guest_messages").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId).gte("created_at", todayStart),
    client.from("invite_analytics").select("guest_id, action, device, timestamp").eq("wedding_id" as never, weddingId).gte("timestamp", todayStart).order("timestamp", { ascending: false }).limit(50),
    client.from("wedding_stage_overrides").select("stage").eq("wedding_id", weddingId).maybeSingle(),
  ]);

  // Determine current stage
  let currentStage = "invitation";
  const stageData = stageResult.data as { stage?: string } | null;
  if (stageData?.stage) {
    currentStage = stageData.stage;
  } else {
    const weddingDate = new Date(eventsConfig[0]?.date ?? now);
    const dayAfter    = new Date(weddingDate);
    dayAfter.setDate(dayAfter.getDate() + 1);
    if (now >= weddingDate && now < dayAfter) currentStage = "live";
    else if (now >= dayAfter) currentStage = "vault";
  }

  // Active guests today (unique guest_ids from analytics)
  const analyticsRows = (analyticsResult.data ?? []) as Array<{
    guest_id: string;
    action: string;
    timestamp: string;
    device: string | null;
  }>;
  const activeGuestIds = new Set(analyticsRows.map(a => a.guest_id));

  // Build activity feed
  const activity = analyticsRows.slice(0, 20).map((a, i) => ({
    id: `${a.guest_id}-${i}`,
    type: a.action.includes("photo")   ? "photo"         as const
        : a.action.includes("message") ? "message"       as const
        : a.action.includes("rsvp")    ? "rsvp"          as const
        : "invite_opened"              as const,
    actor:     `Guest ${a.guest_id.slice(0, 6)}`,
    detail:    a.action.replace(/_/g, " "),
    timestamp: a.timestamp,
  }));

  if (shouldFallbackToDemoData(photosResult.error ?? null)) {
    return NextResponse.json({ success: true, metrics: emptyMetrics, activity: [], demoMode: true });
  }

  return NextResponse.json({
    success: true,
    metrics: {
      photosToday:   photosResult.count   ?? 0,
      messagesToday: messagesResult.count ?? 0,
      activeGuests:  activeGuestIds.size,
      liveViewers:   0,
      currentStage,
      nextEvent:     nextEvent?.eventName ?? null,
      nextEventTime: nextEvent ? `${nextEvent.date} at ${nextEvent.time}` : null,
    },
    activity,
  });
}
