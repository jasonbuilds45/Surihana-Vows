import type { AnalyticsSnapshot, InviteActivityItem } from "@/lib/types";
import { StatCard, Card, CardDark, SectionLabel, EmptyState } from "@/components/ui";
import { Activity } from "lucide-react";
import { formatRelativeDate } from "@/utils/formatDate";

interface RSVPStatsProps {
  stats: AnalyticsSnapshot;
  recentActivity: InviteActivityItem[];
}

function pct(val: number, total: number) {
  return total > 0 ? `${Math.round((val / total) * 100)}%` : "0%";
}

export function RSVPStats({ stats, recentActivity }: RSVPStatsProps) {
  const responseSegments = [
    { label: "Attending", value: stats.attendingCount, color: "var(--color-sage)" },
    { label: "Declined",  value: stats.declinedCount,  color: "var(--color-blush)" },
    { label: "Pending",   value: stats.pendingCount,   color: "var(--color-champagne-deep)" },
  ];

  return (
    <div className="space-y-5">

      {/* ── Top stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Guest list",       value: stats.totalGuests,       color: "var(--color-accent)" },
          { label: "Invites opened",   value: stats.openedInvites,     color: "var(--color-gold)" },
          { label: "RSVPs received",   value: stats.totalResponses,    color: "var(--color-sage)" },
          { label: "Attending parties",value: stats.attendingCount,    color: "var(--color-rose)" },
          { label: "Confirmed seats",  value: stats.attendanceGuests,  color: "var(--color-plum)" },
        ].map(({ label, value, color }) => (
          <StatCard key={label} label={label} value={value} accentColor={color} />
        ))}
      </div>

      {/* ── Progress + recent activity ── */}
      <div className="grid gap-5 xl:grid-cols-[1fr,1fr,1.2fr]">

        {/* Invite open rate */}
        <Card className="space-y-4">
          <SectionLabel>Invites opened</SectionLabel>
          <p className="font-display text-4xl" style={{ color: "var(--color-text-primary)" }}>
            {pct(stats.openedInvites, stats.totalGuests)}
          </p>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-muted)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: pct(stats.openedInvites, stats.totalGuests), background: "var(--color-gold)" }}
            />
          </div>
          <div className="flex justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
            <span>{stats.openedInvites} opened</span>
            <span>{stats.unopenedInvites} unopened</span>
          </div>
        </Card>

        {/* RSVP breakdown — dark card */}
        <CardDark noPad>
          <div className="p-6 space-y-4">
            <SectionLabel style={{ color: "var(--color-champagne)" }}>RSVP breakdown</SectionLabel>
            <p className="font-display text-4xl" style={{ color: "#ffffff" }}>
              {pct(stats.totalResponses, stats.totalGuests)}
            </p>
            <div className="space-y-3">
              {responseSegments.map((seg) => (
                <div key={seg.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                    <span>{seg.label}</span>
                    <span>{seg.value}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: pct(seg.value, stats.totalGuests),
                        background: seg.color,
                        minWidth: seg.value > 0 ? "8px" : "0",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-1 space-y-1">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                Avg party size: {stats.averagePartySize.toFixed(1)}
              </p>
            </div>
          </div>
        </CardDark>

        {/* Recent activity */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" style={{ color: "var(--color-accent-soft)" }} />
            <SectionLabel>Recent activity</SectionLabel>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No invite activity yet.</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-xl px-4 py-3"
                  style={{ background: "var(--color-surface-soft)", border: "1px solid var(--color-border)" }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                      {item.guestName}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {item.action.replace(/_/g, " ")}
                    </p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: "var(--color-text-muted)" }}>
                    {item.timestamp ? formatRelativeDate(item.timestamp) : "now"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Device mix ── */}
      {Object.keys(stats.devices).length > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <SectionLabel>Device mix</SectionLabel>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Invite interactions grouped by last known device.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.devices).map(([device, count]) => (
              <span
                key={device}
                className="rounded-full px-3.5 py-1.5 text-xs capitalize font-medium"
                style={{
                  background: "var(--color-surface-soft)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {device}: {count}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default RSVPStats;
