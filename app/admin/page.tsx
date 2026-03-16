import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { weddingConfig, eventsConfig, predictionsConfig } from "@/lib/config";
import { listGuestLinks } from "@/modules/elegant/guest-links";
import { getAnalyticsSnapshot, getRecentInviteActivity } from "@/modules/premium/analytics";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { DEMO_WEDDING_ID } from "@/lib/demo-data";
import type { FamilyMemberRow } from "@/components/admin/FamilyInviteManager";
import type { GuestMessageRow, WeddingStageOverrideRow } from "@/lib/types";
import type { VendorRow } from "@/components/admin/VendorHub";
import type { TimeCapsuleRow } from "@/components/admin/TimeCapsuleManager";
import type { SeatingTable } from "@/components/admin/SeatingManager";
import type { PhotoAlbum, AdminPhoto } from "@/components/admin/PhotoAlbumManager";

export default async function AdminPage() {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/admin")) {
    redirect("/login?hint=couple&redirect=%2Fadmin");
  }

  const client = getConfiguredSupabaseClient(true);
  const wId = weddingConfig.id;

  // ── Existing fetches ────────────────────────────────────────────────────────
  async function getFamilyMembers(): Promise<FamilyMemberRow[]> {
    if (!client) return [
      { id: "demo-family-user", email: process.env.FAMILY_LOGIN_EMAIL ?? "family@demo.com", role: "family" },
      { id: "demo-admin-user",  email: process.env.ADMIN_LOGIN_EMAIL  ?? "admin@demo.com",  role: "admin"  },
    ];
    const { data, error } = await client.from("family_users").select("id, email, role").order("created_at", { ascending: true });
    if (error && !shouldFallbackToDemoData(error)) return [];
    return (data ?? []) as FamilyMemberRow[];
  }

  async function getLifecycleOverride(): Promise<WeddingStageOverrideRow | null> {
    if (!client) return null;
    const { data, error } = await client.from("wedding_stage_overrides").select("*").eq("wedding_id", wId).maybeSingle();
    if (error) return null;
    return (data ?? null) as WeddingStageOverrideRow | null;
  }

  async function getVendors(): Promise<VendorRow[]> {
    if (!client) return [];
    const { data, error } = await client.from("vendors").select("*").eq("wedding_id", wId).order("arrival_time", { ascending: true, nullsFirst: false });
    if (error) return [];
    return (data ?? []) as VendorRow[];
  }

  async function getGuestMessages(): Promise<GuestMessageRow[]> {
    if (!client) return [];
    const { data, error } = await client.from("guest_messages").select("*").order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as GuestMessageRow[];
  }

  // ── New module fetches ──────────────────────────────────────────────────────

  async function getPredictionQuestions() {
    if (!client) {
      return predictionsConfig.questions.map((q, i) => ({
        id: q.id, question: q.question, emoji: q.emoji, options: q.options,
        is_active: true, reveal_results: new Date() > new Date(predictionsConfig.revealAfter),
        sort_order: i, vote_counts: {} as Record<string, number>, total_votes: 0,
      }));
    }
    const { data: questions, error } = await (client as ReturnType<typeof getConfiguredSupabaseClient>)!
      .from("prediction_questions" as never)
      .select("*")
      .eq("wedding_id", wId)
      .order("sort_order");

    if (error) {
      if (shouldFallbackToDemoData(error)) return predictionsConfig.questions.map((q, i) => ({ id: q.id, question: q.question, emoji: q.emoji, options: q.options, is_active: true, reveal_results: false, sort_order: i, vote_counts: {} as Record<string, number>, total_votes: 0 }));
      return [];
    }

    const { data: votes } = await client.from("guest_predictions").select("question_id, answer").eq("wedding_id", wId);
    const voteCounts: Record<string, Record<string, number>> = {};
    for (const v of (votes ?? []) as Array<{ question_id: string; answer: string }>) {
      voteCounts[v.question_id] ??= {};
      voteCounts[v.question_id][v.answer] = (voteCounts[v.question_id][v.answer] ?? 0) + 1;
    }

    return ((questions ?? []) as Array<Record<string, unknown>>).map(q => ({
      ...q,
      vote_counts: voteCounts[q.id as string] ?? {},
      total_votes: Object.values(voteCounts[q.id as string] ?? {}).reduce((a: number, b) => a + (b as number), 0),
    }));
  }

  async function getTimeCapsules(): Promise<TimeCapsuleRow[]> {
    if (!client) return [];
    const { data, error } = await client.from("time_capsules").select("*").eq("wedding_id", wId).order("unlock_date");
    if (error) return [];
    return (data ?? []) as TimeCapsuleRow[];
  }

  async function getSeatingTables(): Promise<SeatingTable[]> {
    if (!client) return [];
    const { data: tables, error } = await (client as ReturnType<typeof getConfiguredSupabaseClient>)!
      .from("seating_tables" as never)
      .select("*")
      .eq("wedding_id", wId)
      .order("sort_order");
    if (error) return [];

    const tableIds = ((tables ?? []) as Array<{ id: string }>).map(t => t.id);
    const { data: assignments } = tableIds.length > 0
      ? await (client as ReturnType<typeof getConfiguredSupabaseClient>)!.from("seating_assignments" as never).select("guest_id, table_id").in("table_id", tableIds)
      : { data: [] };

    const assignMap: Record<string, string[]> = {};
    for (const a of (assignments ?? []) as Array<{ guest_id: string; table_id: string }>) {
      assignMap[a.table_id] ??= [];
      assignMap[a.table_id].push(a.guest_id);
    }

    return ((tables ?? []) as Array<Record<string, unknown>>).map(t => ({
      id:         t.id as string,
      table_name: t.table_name as string,
      capacity:   t.capacity as number,
      notes:      (t.notes as string) ?? null,
      sort_order: t.sort_order as number,
      guests:     assignMap[t.id as string] ?? [],
    }));
  }

  async function getAlbumsAndPhotos(): Promise<{ albums: PhotoAlbum[]; photos: AdminPhoto[] }> {
    if (!client) return { albums: [], photos: [] };

    const [{ data: albums }, { data: photos }] = await Promise.all([
      (client as ReturnType<typeof getConfiguredSupabaseClient>)!.from("photo_albums" as never).select("*").eq("wedding_id", wId).order("sort_order"),
      client.from("photos").select("id, image_url, uploaded_by, category, created_at, album_id, is_approved").eq("wedding_id", wId).eq("is_approved", true).order("created_at", { ascending: false }),
    ]);

    const countMap: Record<string, number> = {};
    for (const p of (photos ?? []) as Array<{ album_id: string | null }>) {
      if (p.album_id) countMap[p.album_id] = (countMap[p.album_id] ?? 0) + 1;
    }

    return {
      albums: ((albums ?? []) as Array<Record<string, unknown>>).map(a => ({
        id:          a.id as string,
        album_name:  a.album_name as string,
        description: (a.description as string) ?? null,
        cover_photo: (a.cover_photo as string) ?? null,
        is_public:   a.is_public as boolean,
        sort_order:  a.sort_order as number,
        photo_count: countMap[a.id as string] ?? 0,
      })),
      photos: (photos ?? []) as AdminPhoto[],
    };
  }

  async function getInsights() {
    if (!client) return { photoStats: [], messageStats: [], hourlyUploads: [], predictionRate: 0, totalPredictions: 0 };

    const [{ data: photos }, { data: messages }, { data: guests }, { data: predictions }] = await Promise.all([
      client.from("photos").select("uploaded_by, created_at").eq("wedding_id", wId).eq("is_approved", true),
      client.from("guest_messages").select("guest_name").eq("wedding_id", wId),
      client.from("guests").select("id").eq("wedding_id", wId),
      client.from("guest_predictions").select("guest_identifier, created_at").eq("wedding_id", wId),
    ]);

    const photoCountMap: Record<string, number> = {};
    for (const p of (photos ?? []) as Array<{ uploaded_by: string }>) {
      photoCountMap[p.uploaded_by] = (photoCountMap[p.uploaded_by] ?? 0) + 1;
    }
    const photoStats = Object.entries(photoCountMap).map(([guestName, count]) => ({ guestName, count })).sort((a, b) => b.count - a.count);

    const msgCountMap: Record<string, number> = {};
    for (const m of (messages ?? []) as Array<{ guest_name: string }>) {
      msgCountMap[m.guest_name] = (msgCountMap[m.guest_name] ?? 0) + 1;
    }
    const messageStats = Object.entries(msgCountMap).map(([guestName, count]) => ({ guestName, count })).sort((a, b) => b.count - a.count);

    const hourlyCounts: Record<number, number> = {};
    for (const p of (photos ?? []) as Array<{ created_at: string }>) {
      const h = new Date(p.created_at).getHours();
      hourlyCounts[h] = (hourlyCounts[h] ?? 0) + 1;
    }
    const hourlyUploads = Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, count: hourlyCounts[h] ?? 0 })).filter(h => h.count > 0);

    const totalGuests      = ((guests ?? []) as unknown[]).length;
    const uniquePredictors = new Set(((predictions ?? []) as Array<{ guest_identifier: string }>).map(p => p.guest_identifier)).size;
    const predictionRate   = totalGuests > 0 ? Math.round((uniquePredictors / totalGuests) * 100) : 0;
    const totalPredictions = ((predictions ?? []) as unknown[]).length;

    return { photoStats, messageStats, hourlyUploads, predictionRate, totalPredictions };
  }

  async function getCommandMetrics() {
    const now = new Date();
    const nextEvent = eventsConfig.find(e => new Date(`${e.date}T${e.time}`) > now) ?? null;

    if (!client) return {
      photosToday: 0, messagesToday: 0, activeGuests: 0, liveViewers: 0,
      currentStage: "invitation",
      nextEvent: nextEvent?.eventName ?? null,
      nextEventTime: nextEvent ? `${nextEvent.date} at ${nextEvent.time}` : null,
    };

    const todayStart = new Date(now.toISOString().slice(0, 10) + "T00:00:00.000Z").toISOString();

    const [{ count: photosToday }, { count: messagesToday }, { data: override }] = await Promise.all([
      client.from("photos").select("id", { count: "exact", head: true }).eq("wedding_id", wId).gte("created_at", todayStart),
      client.from("guest_messages").select("id", { count: "exact", head: true }).eq("wedding_id", wId).gte("created_at", todayStart),
      client.from("wedding_stage_overrides").select("stage").eq("wedding_id", wId).maybeSingle(),
    ]);

    let currentStage = "invitation";
    if (override && (override as { stage?: string }).stage) {
      currentStage = (override as { stage: string }).stage;
    } else {
      const weddingDate = new Date(eventsConfig[0]?.date ?? now);
      const dayAfter    = new Date(weddingDate); dayAfter.setDate(dayAfter.getDate() + 1);
      if (now >= weddingDate && now < dayAfter) currentStage = "live";
      else if (now >= dayAfter) currentStage = "vault";
    }

    return {
      photosToday: photosToday ?? 0, messagesToday: messagesToday ?? 0,
      activeGuests: 0, liveViewers: 0, currentStage,
      nextEvent: nextEvent?.eventName ?? null,
      nextEventTime: nextEvent ? `${nextEvent.date} at ${nextEvent.time}` : null,
    };
  }

  // ── Fetch everything in parallel ────────────────────────────────────────────
  const [
    stats, guests, recentActivity,
    familyMembers, lifecycleOverride, guestMessages, vendors,
    predictionQuestions, timeCapsules, seatingTables,
    { albums, photos }, insights, commandMetrics,
  ] = await Promise.all([
    getAnalyticsSnapshot(wId),
    listGuestLinks(wId),
    getRecentInviteActivity(wId, 8),
    getFamilyMembers(),
    getLifecycleOverride(),
    getGuestMessages(),
    getVendors(),
    getPredictionQuestions(),
    getTimeCapsules(),
    getSeatingTables(),
    getAlbumsAndPhotos(),
    getInsights(),
    getCommandMetrics(),
  ]);

  const rows = guests.map(g => ({
    id:           g.id,
    guestName:    g.guest_name,
    familyName:   g.family_name,
    phone:        g.phone,
    inviteCode:   g.invite_code,
    inviteLink:   g.inviteLink,
    inviteOpened: g.invite_opened,
    deviceType:   g.device_type,
    attending:    g.attending,
    guestCount:   g.guestCount,
    city:         (g as typeof g & { city?: string | null }).city    ?? null,
    country:      (g as typeof g & { country?: string | null }).country ?? null,
  }));

  return (
    <AdminDashboard
      initialActivity={recentActivity}
      initialFamilyMembers={familyMembers}
      initialRows={rows}
      initialStats={stats}
      guestMessages={guestMessages}
      initialVendors={vendors}
      lifecycleOverride={lifecycleOverride?.stage ?? null}
      weddingId={wId}
      // New modules
      initialPredictions={predictionQuestions as never}
      initialTimeCapsules={timeCapsules}
      initialSeatingTables={seatingTables}
      initialAlbums={albums}
      initialPhotos={photos}
      initialInsights={insights}
      initialCommandMetrics={commandMetrics}
    />
  );
}
