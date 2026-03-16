"use client";

import { useMemo, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { TimeCapsuleCardComponent } from "@/components/vault/TimeCapsuleCard";
import type { TimeCapsuleCard } from "@/lib/types";

type FilterType = "all" | "locked" | "revealed" | "anniversary" | "timed" | "life_event" | "video";

interface CapsuleSearchProps {
  capsules: TimeCapsuleCard[];
}

const BF = "var(--font-body), system-ui, sans-serif";

const FILTER_LABELS: Record<FilterType, string> = {
  all:         "All",
  locked:      "Sealed",
  revealed:    "Revealed",
  anniversary: "Anniversary",
  timed:       "Timed",
  life_event:  "Milestone",
  video:       "Video",
};

export function CapsuleSearch({ capsules }: CapsuleSearchProps) {
  const [query,  setQuery]  = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = useMemo(() => {
    return capsules.filter(c => {
      // Filter
      if (filter === "locked"   && c.isRevealed)         return false;
      if (filter === "revealed" && !c.isRevealed)        return false;
      if (filter !== "all" && filter !== "locked" && filter !== "revealed" && c.postType !== filter) return false;
      // Search
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchAuthor  = c.authorName.toLowerCase().includes(q);
        const matchMessage = c.isRevealed && c.message.toLowerCase().includes(q);
        const matchLabel   = c.unlockLabel.toLowerCase().includes(q);
        if (!matchAuthor && !matchMessage && !matchLabel) return false;
      }
      return true;
    });
  }, [capsules, filter, query]);

  const hasActive = query.trim() !== "" || filter !== "all";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Search + filter row */}
      <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search box */}
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, message, date…"
            style={{
              width: "100%", paddingLeft: 34, paddingRight: query ? 34 : 12, paddingTop: 9, paddingBottom: 9,
              borderRadius: 999, background: "var(--color-surface)", border: "1px solid var(--color-border)",
              fontSize: ".875rem", color: "var(--color-text-primary)", fontFamily: BF, outline: "none",
              boxSizing: "border-box",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "grid", placeItems: "center" }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: ".375rem", flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={13} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          {(Object.keys(FILTER_LABELS) as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "5px 12px", borderRadius: 999, fontSize: ".7rem", fontWeight: filter === f ? 700 : 500,
                background: filter === f ? "var(--color-accent)" : "var(--color-surface)",
                color:      filter === f ? "#fff" : "var(--color-text-secondary)",
                border:     `1px solid ${filter === f ? "var(--color-accent)" : "var(--color-border)"}`,
                cursor: "pointer", fontFamily: BF, transition: "all .15s",
                letterSpacing: ".08em",
              }}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Results count when filtering */}
      {hasActive && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".5rem" }}>
          <p style={{ fontSize: ".78rem", color: "var(--color-text-muted)", fontFamily: BF }}>
            {filtered.length === 0 ? "No capsules match" : `${filtered.length} of ${capsules.length} capsule${capsules.length !== 1 ? "s" : ""}`}
          </p>
          <button onClick={() => { setQuery(""); setFilter("all"); }} style={{ fontSize: ".72rem", color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer", fontFamily: BF, textDecoration: "underline" }}>
            Clear filters
          </button>
        </div>
      )}

      {/* Capsule grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: "2.5rem", textAlign: "center", background: "var(--color-surface-muted)", borderRadius: 16, border: "1px dashed var(--color-border)" }}>
          <p style={{ fontSize: ".875rem", color: "var(--color-text-muted)", fontFamily: BF }}>No capsules match your search.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {filtered.map(c => <TimeCapsuleCardComponent key={c.id} capsule={c} />)}
        </div>
      )}
    </div>
  );
}

export default CapsuleSearch;
