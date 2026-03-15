"use client";

import { useMemo } from "react";
import { Globe } from "lucide-react";
import { Card, SectionLabel, EmptyState } from "@/components/ui";

export interface GuestOriginRow { city?: string | null; country?: string | null; guest_name: string; }
interface GuestOriginMapProps { guests: GuestOriginRow[]; }
interface LocationCount { label: string; count: number; percentage: number; }

const BAR_COLORS = [
  "var(--color-accent)", "var(--color-gold)", "var(--color-rose)",
  "var(--color-sage)", "var(--color-blush)", "var(--color-plum)",
];

export function GuestOriginMap({ guests }: GuestOriginMapProps) {
  const origins = useMemo<LocationCount[]>(() => {
    const counts = new Map<string, number>();
    for (const g of guests) {
      const label = g.city && g.country ? `${g.city}, ${g.country}` : g.country ?? g.city ?? null;
      if (!label) continue;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count, percentage: Math.round((count / total) * 100) }));
  }, [guests]);

  const withOrigin = guests.filter((g) => g.city || g.country).length;

  if (guests.length === 0) return null;

  return (
    <Card className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--color-accent-light)", border: "1px solid rgba(184,84,58,0.18)" }}>
            <Globe className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
          </div>
          <div>
            <SectionLabel>Guest origins</SectionLabel>
            <h2 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>Where guests are travelling from</h2>
          </div>
        </div>
        <span className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase" style={{ letterSpacing: "0.2em", background: "var(--color-surface-dark)", color: "#fff" }}>
          {origins.length} {origins.length === 1 ? "location" : "locations"}
        </span>
      </div>

      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        {withOrigin} of {guests.length} guests have location data · {guests.length - withOrigin} without
      </p>

      {origins.length === 0 ? (
        <EmptyState
          icon={<Globe className="h-9 w-9" />}
          title="No location data yet"
          description="Add city and country when importing guests to see where they're travelling from."
        />
      ) : (
        <div className="space-y-3">
          {origins.map((origin, i) => (
            <div key={origin.label}>
              <div className="flex items-center justify-between gap-4 mb-2">
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{origin.label}</p>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {origin.count} {origin.count === 1 ? "guest" : "guests"}
                  </span>
                  <span className="w-9 text-right text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                    {origin.percentage}%
                  </span>
                </div>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-muted)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${origin.percentage}%`,
                    background: BAR_COLORS[i % BAR_COLORS.length],
                    minWidth: origin.count > 0 ? "8px" : "0",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default GuestOriginMap;
