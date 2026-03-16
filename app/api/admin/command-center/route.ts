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
  const todayStr = now.toISOString().slice(0, 10);
  const nextEvent = eventsConfig.find(e => {
    const eventDate = new Date(`${e.date}T${e.time}`);
    return eventDate > now;
  }) ?? null;

  const emptyMetrics = {
    photosToday: 0, messagesToday: 0, activeGuests: 0, liveViewers: 0,
    currentStage: "invitation",
    nextEvent: nextEvent?.eventName ?? null,
    nextEventTime: nextEvent ? `${nextEvent.date} at ${nextEvent.time}` : null,
  };

  if (!client) {
    return NextResponse.json({ success: true, metrics: emptyMetrics, activity: [], demoMode: true });
  }

  // Run queries in parallel
  const todayStart = new Date(todayStr + "T00:00:00.000Z").toISOString();

  const [
    { data: todayPhotos },
    { data: todayMessages },
    { data: recentAnalytics },
    { data: stageOverride },
  ] = await Promise.all([
    client.from("photos").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId).gte("created_at", todayStart) as Promise<{ data: null; count?: number | null; error: unknown }>,
    client.from("guest_messages").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId).gte("created_at", todayStart) as Promise<{ data: null; count?: number | null; error: unknown }>,
    client.from("invite_analytics").select("guest_id, action, device, timestamp").eq("wedding_id" as never, weddingId).gte("timestamp", todayStart).order("timestamp", { ascending: false }).limit(50),
    client.from("wedding_stage_overrides").select("stage").eq("wedding_id", weddingId).maybeSingle(),
  ]);

  // Determine current stage
  let currentStage = "invitation";
  if (stageOverride?.data && (stageOverride.data as { stage?: string }).stage) {
    currentStage = (stageOverride.data as { stage: string }).stage;
  } else {
    const weddingDate = new Date(eventsConfig[0]?.date ?? now);
    const dayAfter = new Date(weddingDate);
    dayAfter.setDate(dayAfter.getDate() + 1);
    if (now >= weddingDate && now < dayAfter) currentStage = "live";
    else if (now >= dayAfter) currentStage = "vault";
  }

  // Active guests today (unique guest_ids with analytics today)
  const activeGuestIds = new Set(
    ((recentAnalytics ?? []) as Array<{ guest_id: string }>).map(a => a.guest_id)
  );

  // Build activity feed
  const activity = ((recentAnalytics ?? []) as Array<{ guest_id: string; action: string; timestamp: string; device: string | null }>)
    .slice(0, 20)
    .map((a, i) => ({
      id: `${a.guest_id}-${i}`,
      type: a.action.includes("photo") ? "photo" as const
          : a.action.includes("message") ? "message" as const
          : a.action.includes("rsvp") ? "rsvp" as const
          : "invite_opened" as const,
      actor: `Guest ${a.guest_id.slice(0, 6)}`,
      detail: a.action.replace(/_/g, " "),
      timestamp: a.timestamp,
    }));

  return NextResponse.json({
    success: true,
    metrics: {
      photosToday:   (todayPhotos as unknown as { count?: number })?.count ?? 0,
      messagesToday: (todayMessages as unknown as { count?: number })?.count ?? 0,
      activeGuests:  activeGuestIds.size,
      liveViewers:   0, // livestream analytics would go here
      currentStage,
      nextEvent: nextEvent?.eventName ?? null,
      nextEventTime: nextEvent ? `${nextEvent.date} at ${nextEvent.time}` : null,
    },
    activity,
  });
}
