"use client";

import { startTransition, useState } from "react";
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
import { GoldStripe, SectionLabel, BtnLink } from "@/components/ui";
import { Download } from "lucide-react";
import { weddingConfig } from "@/lib/config";

interface AdminDashboardProps {
  weddingId: string;
  initialStats: AnalyticsSnapshot;
  initialActivity: InviteActivityItem[];
  initialRows: GuestTableRow[];
  initialFamilyMembers: FamilyMemberRow[];
  guestMessages: import("@/lib/types").GuestMessageRow[];
  initialVendors: VendorRow[];
  lifecycleOverride?: "invitation" | "live" | "vault" | null;
}

interface AnalyticsResponse {
  success: boolean;
  data?: { stats: AnalyticsSnapshot; recentActivity: InviteActivityItem[] };
}

export function AdminDashboard({
  weddingId, initialStats, initialActivity, initialRows,
  initialFamilyMembers, guestMessages, initialVendors, lifecycleOverride = null
}: AdminDashboardProps) {
  const [stats, setStats] = useState(initialStats);
  const [recentActivity, setRecentActivity] = useState(initialActivity);

  async function refreshAnalytics() {
    const res = await fetch(`/api/analytics?weddingId=${encodeURIComponent(weddingId)}`, { cache: "no-store" });
    if (!res.ok) return;
    const payload = (await res.json()) as AnalyticsResponse;
    if (!payload.success || !payload.data) return;
    startTransition(() => { setStats(payload.data!.stats); setRecentActivity(payload.data!.recentActivity); });
  }

  return (
    <div>
      {/* ── Admin hero header ── */}
      <div style={{ background: "var(--color-surface-soft)", borderBottom: "1px solid var(--color-border)", marginBottom: "2rem" }}>
        <GoldStripe />
        <div className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="space-y-2">
              <SectionLabel>Wedding control room</SectionLabel>
              <h1 className="font-display" style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)", color: "var(--color-text-primary)", lineHeight: 1.15 }}>
                Operations at a glance.
              </h1>
              <p className="text-sm leading-7 max-w-xl" style={{ color: "var(--color-text-secondary)" }}>
                Track invite opens, manage guests, moderate messages, and upload media — all in one place.
              </p>
            </div>
            <BtnLink
              href={`/api/admin/rsvp-export?weddingId=${encodeURIComponent(weddingId)}`}
              variant="secondary"
              size="sm"
            >
              <Download className="h-4 w-4" />
              Export RSVP CSV
            </BtnLink>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
        <RSVPStats recentActivity={recentActivity} stats={stats} />

        <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <GuestTable initialRows={initialRows} onRefreshAnalytics={refreshAnalytics} weddingId={weddingId} />
          <UploadManager weddingId={weddingId} />
        </div>

        <GuestReminderSystem
          guests={initialRows}
          weddingDate={weddingConfig.weddingDate}
          coupleName={`${weddingConfig.brideName} & ${weddingConfig.groomName}`}
          venueName={weddingConfig.venueName}
        />

        <VendorHub weddingId={weddingId} initialVendors={initialVendors} />
        <FamilyInviteManager initialMembers={initialFamilyMembers} weddingId={weddingId} />
        <MessageModeration initialMessages={guestMessages} weddingId={weddingId} />

        <GuestOriginMap
          guests={initialRows.map((r) => ({
            guest_name: r.guestName,
            city: (r as GuestTableRow & { city?: string | null }).city ?? null,
            country: (r as GuestTableRow & { country?: string | null }).country ?? null,
          }))}
        />

        <LifecycleStageControl weddingId={weddingId} currentOverride={lifecycleOverride} />

        {/* ── Content Editors + Platform Monitoring links ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <a href="/admin/editors" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "2rem", background: "#FAF8F6", border: "1px solid #E4D8D4", borderRadius: 20, textDecoration: "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FDEAEC", border: "1px solid #F5C5CB", display: "grid", placeItems: "center" }}>
              <span style={{ fontSize: "1.25rem" }}>✏️</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "1rem", color: "#1A1012", fontFamily: "var(--font-display),Georgia,serif" }}>Content editors</p>
              <p style={{ fontSize: "0.85rem", color: "#7A5460", fontFamily: "var(--font-body),sans-serif", marginTop: "0.25rem" }}>Edit love story chapters and travel guide sections live.</p>
            </div>
          </a>
          <a href="/admin/monitor" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "2rem", background: "#FAF8F6", border: "1px solid #E4D8D4", borderRadius: 20, textDecoration: "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FDEAEC", border: "1px solid #F5C5CB", display: "grid", placeItems: "center" }}>
              <span style={{ fontSize: "1.25rem" }}>📡</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "1rem", color: "#1A1012", fontFamily: "var(--font-display),Georgia,serif" }}>Platform monitoring</p>
              <p style={{ fontSize: "0.85rem", color: "#7A5460", fontFamily: "var(--font-body),sans-serif", marginTop: "0.25rem" }}>View uptime, error logs, and deployment health.</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
