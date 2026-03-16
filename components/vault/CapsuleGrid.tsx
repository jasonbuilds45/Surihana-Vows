"use client";

import { useMemo, useState } from "react";
import { Search, Filter, Lock, Unlock, Clock, X } from "lucide-react";
import { TimeCapsuleCardComponent } from "@/components/vault/TimeCapsuleCard";
import type { TimeCapsuleCard } from "@/lib/types";

interface CapsuleGridProps {
  capsules: TimeCapsuleCard[];
}

type FilterType = "all" | "revealed" | "locked";

const BF = "var(--font-body), system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";

export function CapsuleGrid({ capsules }: CapsuleGridProps) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<FilterType>("all");

  const filtered = useMemo(() => {
    let list = capsules;
    if (filter === "revealed") list = list.filter(c => c.isRevealed);
    if (filter === "locked")   list = list.filter(c => !c.isRevealed);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.authorName.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q) ||
        c.unlockLabel.toLowerCase().includes(q)
      );
    }
    return list;
  }, [capsules, filter, search]);

  const total    = capsules.length;
  const locked   = capsules.filter(c => !c.isRevealed).length;
  const revealed = capsules.filter(c => c.isRevealed).length;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "6px 14px", borderRadius: 9999, cursor: "pointer",
    fontSize: "0.72rem", fontWeight: active ? 700 : 500,
    letterSpacing: "0.12em", textTransform: "uppercase",
    fontFamily: BF,
    background:   active ? "var(--color-accent)" : "var(--color-surface)",
    color:        active ? "#fff" : "var(--color-text-muted)",
    border:       active ? "1.5px solid var(--color-accent)" : "1.5px solid var(--color-border)",
    transition:   "all .15s ease",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Search + filter bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>

        {/* Search input */}
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or message…"
            style={{
              width: "100%", paddingLeft: 34, paddingRight: search ? 34 : 14,
              paddingTop: 9, paddingBottom: 9,
              borderRadius: 9999, border: "1.5px solid var(--color-border)",
              background: "var(--color-surface)", color: "var(--color-text-primary)",
              fontSize: "0.875rem", fontFamily: BF, outline: "none",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--color-text-muted)" }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
          <Filter size={13} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          <button onClick={() => setFilter("all")}      style={tabStyle(filter === "all")}>All ({total})</button>
          <button onClick={() => setFilter("revealed")} style={tabStyle(filter === "revealed")}>
            <Unlock size={11} /> Open ({revealed})
          </button>
          <button onClick={() => setFilter("locked")}   style={tabStyle(filter === "locked")}>
            <Lock size={11} /> Sealed ({locked})
          </button>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", background: "var(--color-surface)", border: "1px dashed var(--color-border)", borderRadius: "1rem" }}>
          <Clock style={{ margin: "0 auto 0.75rem", color: "var(--color-accent-soft)" }} size={32} />
          <p style={{ fontFamily: DF, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
            {search ? "No capsules match your search." : "No capsules in this view."}
          </p>
          {search && (
            <button onClick={() => setSearch("")} style={{ fontSize: "0.8rem", color: "var(--color-accent)", fontFamily: BF, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {filtered.map(capsule => (
            <TimeCapsuleCardComponent key={capsule.id} capsule={capsule} />
          ))}
        </div>
      )}
    </div>
  );
}
