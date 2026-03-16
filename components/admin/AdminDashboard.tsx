"use client";

import { startTransition, useState, useEffect } from "react";
import { authFetch, storeToken } from "@/lib/client/token";
import type { AnalyticsSnapshot, InviteActivityItem } from "@/lib/types";
import { GuestTable, type GuestTableRow } from "@/components/admin/GuestTable";
import { GuestOriginMap, type GuestOriginRow } from "@/components/admin/GuestOriginMap";
import { LifecycleStageControl } from "@/components/admin/LifecycleStageControl";
import { MessageModeration } from "@/components/admin/MessageModeration";
import { RSVPStats } from "@/components/admin/RSVPStats";
import { UploadManager } from "@/components/admin/UploadManager";
import { FamilyInviteManager, type FamilyMemberRow } from "@/components/admin/FamilyInviteManager";
import { VendorHub, type VendorRow } from "@/components/admin/VendorHub";
import { GuestReminderSystem } from "@/components/admin/GuestReminderSystem";
import { PredictionManager } from "@/components/admin/PredictionManager";
import { TimeCapsuleManager, type TimeCapsuleRow } from "@/components/admin/TimeCapsuleManager";
import { WeddingCommandCenter } from "@/components/admin/WeddingCommandCenter";
import { SeatingManager, type SeatingTable } from "@/components/admin/SeatingManager";
import { PhotoAlbumManager, type PhotoAlbum, type AdminPhoto } from "@/components/admin/PhotoAlbumManager";
import { GuestInsights } from "@/components/admin/GuestInsights";
import { GoldStripe, SectionLabel, BtnLink } from "@/components/ui";
import { Download, LayoutDashboard, Users, Image, Clock, Grid3X3, BarChart3, Zap } from "lucide-react";
import { weddingConfig } from "@/lib/config";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface AdminDashboardProps {
  weddingId:             string;
  initialStats:          AnalyticsSnapshot;
  initialActivity:       InviteActivityItem[];
  initialRows:           GuestTableRow[];
  initialFamilyMembers:  FamilyMemberRow[];
  guestMessages:         import("@/lib/types").GuestMessageRow[];
  initialVendors:        VendorRow[];
  lifecycleOverride?:    "invitation" | "live" | "vault" | null;
  // New modules
  initialPredictions:    import("@/components/admin/PredictionManager").DBQuestion[];
  initialTimeCapsules:   TimeCapsuleRow[];
  initialSeatingTables:  SeatingTable[];
  initialAlbums:         PhotoAlbum[];
  initialPhotos:         AdminPhoto[];
  initialInsights:       InsightsData;
  initialCommandMetrics: CommandMetrics;
}

interface InsightsData {
  photoStats:       Array<{ guestName: string; count: number }>;
  messageStats:     Array<{ guestName: string; count: number }>;
  hourlyUploads:    Array<{ hour: string; count: number }>;
  predictionRate:   number;
  totalPredictions: number;
}

interface CommandMetrics {
  photosToday:    number;
  messagesToday:  number;
  activeGuests:   number;
  liveViewers:    number;
  currentStage:   string;
  nextEvent:      string | null;
  nextEventTime:  string | null;
}

interface AnalyticsResponse {
  success: boolean;
  data?: { stats: AnalyticsSnapshot; recentActivity: InviteActivityItem[] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────────────────────────────────────
type Tab = "overview" | "guests" | "media" | "capsules" | "seating" | "insights" | "command";

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: "overview",  label: "Overview",        icon: LayoutDashboard },
  { id: "guests",    label: "Guest tools",      icon: Users },
  { id: "media",     label: "Media & albums",   icon: Image },
  { id: "capsules",  label: "Capsules & games", icon: Clock },
  { id: "seating",   label: "Seating",          icon: Grid3X3 },
  { id: "insights",  label: "Insights",         icon: BarChart3 },
  { id: "command",   label: "Command center",   icon: Zap },
];

// ─────────────────────────────────────────────────────────────────────────────
// AdminDashboard
// ─────────────────────────────────────────────────────────────────────────────
export function AdminDashboard({
  weddingId, initialStats, initialActivity, initialRows,
  initialFamilyMembers, guestMessages, initialVendors, lifecycleOverride = null,
  initialPredictions, initialTimeCapsules, initialSeatingTables,
  initialAlbums, initialPhotos, initialInsights, initialCommandMetrics,
}: AdminDashboardProps) {
  const [stats,          setStats]         = useState(initialStats);
  const [recentActivity, setRecentActivity] = useState(initialActivity);
  const [activeTab,      setActiveTab]     = useState<Tab>("overview");

  // Capture token from URL on mount
  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get("_t");
      if (t) storeToken(t);
    } catch { /* ignore */ }
  }, []);

  async function refreshAnalytics() {
    const res = await authFetch(`/api/analytics?weddingId=${encodeURIComponent(weddingId)}`, { cache: "no-store" } as RequestInit);
    if (!res.ok) return;
    const payload = (await res.json()) as AnalyticsResponse;
    if (!payload.success || !payload.data) return;
    startTransition(() => { setStats(payload.data!.stats); setRecentActivity(payload.data!.recentActivity); });
  }

  const tabStyle = (id: Tab): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: 9999, cursor: "pointer",
    fontSize: "0.72rem", fontWeight: activeTab === id ? 700 : 500,
    letterSpacing: "0.12em", textTransform: "uppercase",
    fontFamily: "var(--font-body), sans-serif",
    background:   activeTab === id ? "var(--color-accent)" : "transparent",
    color:        activeTab === id ? "#fff" : "var(--color-text-muted)",
    border:       activeTab === id ? "1.5px solid var(--color-accent)" : "1.5px solid transparent",
    transition:   "all .15s ease",
  });

  return (
    <div>
      {/* ── Hero header ── */}
      <div style={{ background: "var(--color-surface-soft)", borderBottom: "1px solid var(--color-border)", marginBottom: 0 }}>
        <GoldStripe />
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="space-y-1">
              <SectionLabel>Wedding control room</SectionLabel>
              <h1 className="font-display" style={{ fontSize: "clamp(1.5rem,4vw,2.5rem)", color: "var(--color-text-primary)", lineHeight: 1.15 }}>
                {weddingConfig.brideName} &amp; {weddingConfig.groomName}
              </h1>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {weddingConfig.venueName} · {weddingConfig.weddingDate}
              </p>
            </div>
            <BtnLink href={`/api/admin/rsvp-export?weddingId=${encodeURIComponent(weddingId)}`} variant="secondary" size="sm">
              <Download className="h-4 w-4" /> Export RSVP CSV
            </BtnLink>
          </div>
        </div>

        {/* ── Tab navigation ── */}
        <div className="px-4 sm:px-6 lg:px-8 pb-0">
          <div style={{ display: "flex", gap: ".25rem", flexWrap: "wrap", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.75rem" }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setActiveTab(id)} style={tabStyle(id)}>
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <RSVPStats recentActivity={recentActivity} stats={stats} />
            <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
              <GuestTable initialRows={initialRows} onRefreshAnalytics={refreshAnalytics} weddingId={weddingId} />
              <UploadManager weddingId={weddingId} />
            </div>
            <GuestOriginMap
              guests={initialRows.map(r => ({
                guest_name: r.guestName,
                city:    (r as GuestTableRow & { city?: string | null }).city    ?? null,
                country: (r as GuestTableRow & { country?: string | null }).country ?? null,
              }))}
            />
            <LifecycleStageControl weddingId={weddingId} currentOverride={lifecycleOverride} />
            {/* Quick links to editor pages */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <a href="/admin/editors" style={{ display:"flex",flexDirection:"column",gap:".75rem",padding:"2rem",background:"#FAF8F6",border:"1px solid #E4D8D4",borderRadius:20,textDecoration:"none" }}>
                <div style={{ width:44,height:44,borderRadius:12,background:"#FDEAEC",border:"1px solid #F5C5CB",display:"grid",placeItems:"center" }}><span style={{ fontSize:"1.25rem" }}>✏️</span></div>
                <div>
                  <p style={{ fontWeight:700,fontSize:"1rem",color:"#1A1012",fontFamily:"var(--font-display),Georgia,serif" }}>Content editors</p>
                  <p style={{ fontSize:".85rem",color:"#7A5460",fontFamily:"var(--font-body),sans-serif",marginTop:".25rem" }}>Edit love story chapters and travel guide sections live.</p>
                </div>
              </a>
              <a href="/admin/monitor" style={{ display:"flex",flexDirection:"column",gap:".75rem",padding:"2rem",background:"#FAF8F6",border:"1px solid #E4D8D4",borderRadius:20,textDecoration:"none" }}>
                <div style={{ width:44,height:44,borderRadius:12,background:"#FDEAEC",border:"1px solid #F5C5CB",display:"grid",placeItems:"center" }}><span style={{ fontSize:"1.25rem" }}>📡</span></div>
                <div>
                  <p style={{ fontWeight:700,fontSize:"1rem",color:"#1A1012",fontFamily:"var(--font-display),Georgia,serif" }}>Platform monitoring</p>
                  <p style={{ fontSize:".85rem",color:"#7A5460",fontFamily:"var(--font-body),sans-serif",marginTop:".25rem" }}>View uptime, error logs, and deployment health.</p>
                </div>
              </a>
            </div>
          </>
        )}

        {/* GUEST TOOLS */}
        {activeTab === "guests" && (
          <>
            <GuestReminderSystem guests={initialRows} weddingDate={weddingConfig.weddingDate} coupleName={`${weddingConfig.brideName} & ${weddingConfig.groomName}`} venueName={weddingConfig.venueName} />
            <VendorHub weddingId={weddingId} initialVendors={initialVendors} />
            <FamilyInviteManager initialMembers={initialFamilyMembers} weddingId={weddingId} />
            <MessageModeration initialMessages={guestMessages} weddingId={weddingId} />
          </>
        )}

        {/* MEDIA & ALBUMS */}
        {activeTab === "media" && (
          <>
            <UploadManager weddingId={weddingId} />
            <PhotoAlbumManager initialAlbums={initialAlbums} initialPhotos={initialPhotos} weddingId={weddingId} />
          </>
        )}

        {/* CAPSULES & GAMES */}
        {activeTab === "capsules" && (
          <>
            <PredictionManager initialQuestions={initialPredictions} />
            <TimeCapsuleManager initialCapsules={initialTimeCapsules} />
          </>
        )}

        {/* SEATING */}
        {activeTab === "seating" && (
          <SeatingManager initialTables={initialSeatingTables} guests={initialRows} weddingId={weddingId} />
        )}

        {/* INSIGHTS */}
        {activeTab === "insights" && (
          <GuestInsights
            guests={initialRows}
            photoStats={initialInsights.photoStats}
            messageStats={initialInsights.messageStats}
            hourlyUploads={initialInsights.hourlyUploads}
            predictionRate={initialInsights.predictionRate}
            totalPredictions={initialInsights.totalPredictions}
          />
        )}

        {/* COMMAND CENTER */}
        {activeTab === "command" && (
          <WeddingCommandCenter
            initialMetrics={initialCommandMetrics}
            initialActivity={[]}
            weddingId={weddingId}
          />
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
