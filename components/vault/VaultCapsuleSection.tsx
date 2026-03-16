"use client";

/**
 * VaultCapsuleSection
 * Replaces the inline capsule rendering in app/family/page.tsx.
 *
 * Features:
 *  - Search by author name or message content
 *  - Filter tabs: All / Revealed / Sealed / Unlocking soon (≤30 days)
 *  - Live count badges on each filter tab
 *  - Renders TimeCapsuleCardComponent for each result
 *  - Empty states per filter
 */

import { useMemo, useState } from "react";
import { Search, Clock, Lock, LockOpen, Sparkles, X } from "lucide-react";
import { TimeCapsuleCardComponent } from "@/components/vault/TimeCapsuleCard";
import type { TimeCapsuleCard } from "@/lib/types";

interface VaultCapsuleSectionProps {
  capsules: TimeCapsuleCard[];
}

type FilterType = "all" | "revealed" | "sealed" | "soon";

const BF   = "var(--font-body), system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";
const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BG   = "#FAF8F6";
const W    = "#FFFFFF";
const BDR  = "#D0C0BC";

export function VaultCapsuleSection({ capsules }: VaultCapsuleSectionProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  // ── Counts for badges ──────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all:      capsules.length,
    revealed: capsules.filter(c => c.isRevealed).length,
    sealed:   capsules.filter(c => !c.isRevealed).length,
    soon:     capsules.filter(c => !c.isRevealed && c.daysRemaining <= 30).length,
  }), [capsules]);

  // ── Filter + search ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = capsules;
    if (filter === "revealed") list = list.filter(c => c.isRevealed);
    if (filter === "sealed")   list = list.filter(c => !c.isRevealed);
    if (filter === "soon")     list = list.filter(c => !c.isRevealed && c.daysRemaining <= 30);

    const q = search.trim().toLowerCase();
    if (q) list = list.filter(c =>
      c.authorName.toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q) ||
      c.unlockLabel.toLowerCase().includes(q)
    );

    return list;
  }, [capsules, filter, search]);

  const tabStyle = (id: FilterType): React.CSSProperties => ({
    display:       "inline-flex",
    alignItems:    "center",
    gap:           6,
    padding:       "7px 14px",
    borderRadius:  999,
    cursor:        "pointer",
    fontSize:      ".75rem",
    fontWeight:    filter === id ? 700 : 500,
    letterSpacing: ".1em",
    textTransform: "uppercase" as const,
    fontFamily:    BF,
    background:    filter === id ? ROSE : W,
    color:         filter === id ? W : INK3,
    border:        `1.5px solid ${filter === id ? ROSE : BDR}`,
    transition:    "all .15s",
  });

  const TAB_ICONS: Record<FilterType, React.ElementType> = {
    all:      Sparkles,
    revealed: LockOpen,
    sealed:   Lock,
    soon:     Clock,
  };

  const TAB_LABELS: Record<FilterType, string> = {
    all:      "All",
    revealed: "Revealed",
    sealed:   "Sealed",
    soon:     "Unlocking soon",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Search + filters row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>

        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 0 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: INK3, pointerEvents: "none" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or message…"
            style={{ width: "100%", padding: "9px 36px 9px 34px", borderRadius: 999, border: `1.5px solid ${BDR}`, background: W, color: INK, fontSize: ".875rem", fontFamily: BF, outline: "none" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: INK3 }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: ".375rem", flexWrap: "wrap" }}>
          {(["all", "revealed", "sealed", "soon"] as FilterType[]).map(f => {
            const Icon = TAB_ICONS[f];
            return (
              <button key={f} type="button" onClick={() => setFilter(f)} style={tabStyle(f)}>
                <Icon size={12} />
                {TAB_LABELS[f]}
                {counts[f] > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, borderRadius: 999, background: filter === f ? "rgba(255,255,255,.25)" : BG, border: `1px solid ${filter === f ? "rgba(255,255,255,.3)" : BDR}`, fontSize: ".65rem", fontWeight: 700, color: filter === f ? W : INK3, padding: "0 4px" }}>
                    {counts[f]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results info */}
      {search && (
        <p style={{ fontSize: ".8rem", color: INK3, fontFamily: BF }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Capsule grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", background: BG, borderRadius: 18, border: `1.5px dashed ${BDR}` }}>
          {search
            ? <><Search size={28} style={{ color: BDR, margin: "0 auto .875rem" }} /><p style={{ fontFamily: DF, fontSize: "1.125rem", color: INK }}>No capsules match your search.</p><button onClick={() => setSearch("")} style={{ marginTop: ".875rem", padding: "7px 18px", borderRadius: 999, background: ROSE, color: W, border: "none", fontSize: ".78rem", fontWeight: 700, fontFamily: BF, cursor: "pointer" }}>Clear search</button></>
            : <><Clock size={28} style={{ color: BDR, margin: "0 auto .875rem" }} /><p style={{ fontFamily: DF, fontSize: "1.125rem", color: INK }}>No capsules in this view.</p></>
          }
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(capsule => (
            <TimeCapsuleCardComponent key={capsule.id} capsule={capsule} />
          ))}
        </div>
      )}
    </div>
  );
}

export default VaultCapsuleSection;
