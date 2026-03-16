"use client";

import { useMemo, useState } from "react";
import { Search, Filter, Lock, Unlock, Clock, X } from "lucide-react";
import { TimeCapsuleCardComponent } from "@/components/vault/TimeCapsuleCard";
import type { TimeCapsuleCard } from "@/lib/types";

interface CapsuleVaultProps {
  capsules: TimeCapsuleCard[];
}

type FilterType = "all" | "sealed" | "revealed";

const BF = "var(--font-body), system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";
const ACCENT = "var(--color-accent)";

export function CapsuleVault({ capsules }: CapsuleVaultProps) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<FilterType>("all");

  const revealed = capsules.filter((c) => c.isRevealed);
  const sealed   = capsules.filter((c) => !c.isRevealed);

  const filtered = useMemo(() => {
    let list = capsules;
    if (filter === "sealed")   list = sealed;
    if (filter === "revealed") list = revealed;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.authorName.toLowerCase().includes(q) ||
          c.message.toLowerCase().includes(q) ||
          c.unlockLabel.toLowerCase().includes(q)
      );
    }
    // Revealed first, then sealed sorted by unlock_date asc
    return [
      ...list.filter((c) => c.isRevealed),
      ...list.filter((c) => !c.isRevealed).sort(
        (a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime()
      ),
    ];
  }, [capsules, filter, search, revealed, sealed]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 9999,
    fontSize: "0.7rem", fontWeight: active ? 700 : 500,
    letterSpacing: "0.14em", textTransform: "uppercase",
    fontFamily: BF, cursor: "pointer", transition: "all .15s",
    background: active ? "var(--color-accent)" : "var(--color-surface)",
    color:      active ? "#fff" : "var(--color-text-muted)",
    border:     `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
  });

  if (capsules.length === 0) {
    return (
      <div className="rounded-2xl py-14 text-center"
        style={{ background: "var(--color-surface)", border: "1px dashed var(--color-border)" }}>
        <Clock className="mx-auto h-9 w-9 mb-3" style={{ color: "var(--color-accent-soft)" }} />
        <p className="font-display text-xl mb-2" style={{ color: "var(--color-text-primary)" }}>
          No time capsules yet.
        </p>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Guests can seal messages using the forms below.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Controls row */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>

        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 0 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or message…"
            style={{
              width: "100%", paddingLeft: 34, padding: "0.625rem 0.875rem 0.625rem 34px",
              borderRadius: 9999, border: "1px solid var(--color-border)",
              background: "var(--color-surface)", color: "var(--color-text-primary)",
              fontSize: "0.875rem", fontFamily: BF, outline: "none",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "grid", placeItems: "center" }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
          <button style={tabStyle(filter === "all")}     onClick={() => setFilter("all")}>
            All ({capsules.length})
          </button>
          <button style={tabStyle(filter === "revealed")} onClick={() => setFilter("revealed")}>
            <Unlock size={12} /> Open ({revealed.length})
          </button>
          <button style={tabStyle(filter === "sealed")}  onClick={() => setFilter("sealed")}>
            <Lock size={12} /> Sealed ({sealed.length})
          </button>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl py-10 text-center"
          style={{ background: "var(--color-surface)", border: "1px dashed var(--color-border)" }}>
          <p className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: BF }}>
            No capsules match your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((capsule) => (
            <TimeCapsuleCardComponent key={capsule.id} capsule={capsule} />
          ))}
        </div>
      )}
    </div>
  );
}
