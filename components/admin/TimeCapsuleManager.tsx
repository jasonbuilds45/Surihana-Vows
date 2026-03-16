"use client";

import { useState } from "react";
import { authFetch } from "@/lib/client/token";
import { Lock, Unlock, Trash2, Calendar, Filter, Clock, Eye, Loader2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface TimeCapsuleRow {
  id: string;
  author_name: string;
  author_email: string | null;
  message: string;
  media_url: string | null;
  post_type: "anniversary" | "life_event" | "timed" | "video";
  unlock_date: string;
  is_revealed: boolean;
  notify_sent: boolean;
  created_at: string;
}

interface TimeCapsuleManagerProps {
  initialCapsules: TimeCapsuleRow[];
}

type FilterType = "all" | "locked" | "revealed" | "upcoming";

const BF = "var(--font-body), system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";
const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BG   = "#FAF8F6";
const W    = "#FFFFFF";
const BDR  = "#D0C0BC";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const POST_TYPE_LABELS: Record<TimeCapsuleRow["post_type"], string> = {
  anniversary: "Anniversary",
  life_event:  "Life event",
  timed:       "Timed",
  video:       "Video",
};

// ─────────────────────────────────────────────────────────────────────────────
export function TimeCapsuleManager({ initialCapsules }: TimeCapsuleManagerProps) {
  const [capsules,  setCapsules]  = useState<TimeCapsuleRow[]>(initialCapsules);
  const [filter,    setFilter]    = useState<FilterType>("all");
  const [saving,    setSaving]    = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDate,   setNewDate]   = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  function flash(msg: string) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  // ── Filter ─────────────────────────────────────────────────────────────────
  const now = new Date();
  const filtered = capsules.filter(c => {
    if (filter === "locked")    return !c.is_revealed;
    if (filter === "revealed")  return c.is_revealed;
    if (filter === "upcoming")  return !c.is_revealed && new Date(c.unlock_date) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return true;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total    = capsules.length;
  const locked   = capsules.filter(c => !c.is_revealed).length;
  const revealed = capsules.filter(c => c.is_revealed).length;
  const upcoming = capsules.filter(c => !c.is_revealed && daysUntil(c.unlock_date) <= 30 && daysUntil(c.unlock_date) >= 0).length;

  // ── Manually reveal ────────────────────────────────────────────────────────
  async function handleReveal(id: string) {
    if (!window.confirm("Reveal this capsule now? Guests will be able to read it immediately.")) return;
    setSaving(id);
    try {
      const res = await authFetch(`/api/admin/time-capsules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_revealed: true }),
      });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error();
      setCapsules(prev => prev.map(c => c.id === id ? { ...c, is_revealed: true } : c));
      flash("Capsule revealed ✓");
    } catch { flash("Failed to reveal."); }
    finally { setSaving(null); }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(id: string, author: string) {
    if (!window.confirm(`Delete capsule from ${author}? This cannot be undone.`)) return;
    setSaving(id);
    try {
      const res = await authFetch(`/api/admin/time-capsules/${id}`, { method: "DELETE" });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error();
      setCapsules(prev => prev.filter(c => c.id !== id));
      flash("Capsule deleted.");
    } catch { flash("Failed to delete."); }
    finally { setSaving(null); }
  }

  // ── Edit unlock date ───────────────────────────────────────────────────────
  async function handleSaveDate(id: string) {
    if (!newDate) return;
    setSaving(id);
    try {
      const res = await authFetch(`/api/admin/time-capsules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlock_date: new Date(newDate).toISOString() }),
      });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error();
      setCapsules(prev => prev.map(c => c.id === id ? { ...c, unlock_date: new Date(newDate).toISOString() } : c));
      setEditingId(null);
      flash("Unlock date updated ✓");
    } catch { flash("Failed to update date."); }
    finally { setSaving(null); }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px", borderRadius: 999, fontSize: ".78rem", fontWeight: active ? 700 : 500,
    background: active ? ROSE : W, color: active ? W : INK3,
    border: `1px solid ${active ? ROSE : BDR}`,
    cursor: "pointer", fontFamily: BF, transition: "all .15s",
  });

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div>
        <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: ROSE, fontFamily: BF }}>Time capsule vault</p>
        <h2 style={{ fontFamily: DF, fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 700, color: INK, marginTop: ".2rem" }}>Manage time capsules</h2>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
        {[
          { label: "Total",    value: total,    color: INK  },
          { label: "Locked",   value: locked,   color: ROSE },
          { label: "Revealed", value: revealed, color: "#166534" },
          { label: "Unlocking soon", value: upcoming, color: "#92400E" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: "1.125rem", background: W, border: `1px solid ${BDR}`, borderRadius: 14, textAlign: "center" }}>
            <p style={{ fontFamily: DF, fontSize: "1.75rem", fontWeight: 700, color }}>{value}</p>
            <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, marginTop: ".2rem" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}>
        <Filter size={14} style={{ color: INK3 }} />
        {(["all", "locked", "revealed", "upcoming"] as FilterType[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={tabStyle(filter === f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Status flash */}
      {statusMsg && (
        <p style={{ padding: "10px 16px", borderRadius: 12, background: "rgba(107,142,110,0.1)", color: "#166534", border: "1px solid rgba(107,142,110,0.3)", fontSize: ".875rem", fontFamily: BF }}>
          {statusMsg}
        </p>
      )}

      {/* Capsule list */}
      {filtered.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", background: BG, borderRadius: 18, border: `1.5px dashed ${BDR}` }}>
          <Clock size={32} style={{ color: BDR, margin: "0 auto 1rem" }} />
          <p style={{ fontFamily: DF, fontSize: "1.125rem", color: INK }}>No capsules in this view.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".875rem" }}>
          {filtered.map(c => {
            const days    = daysUntil(c.unlock_date);
            const isSaving = saving === c.id;
            const isEditing = editingId === c.id;

            return (
              <div key={c.id} style={{ background: W, border: `1px solid ${c.is_revealed ? "rgba(107,142,110,0.3)" : BDR}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                  {/* Lock icon */}
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: c.is_revealed ? "rgba(107,142,110,0.1)" : "#FDEAEC", border: `1px solid ${c.is_revealed ? "rgba(107,142,110,0.25)" : "#F5C5CB"}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {c.is_revealed ? <Unlock size={16} style={{ color: "#166534" }} /> : <Lock size={16} style={{ color: ROSE }} />}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".625rem", flexWrap: "wrap", marginBottom: ".375rem" }}>
                      <span style={{ fontWeight: 600, fontSize: ".9375rem", color: INK, fontFamily: BF }}>{c.author_name}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 999, background: BG, border: `1px solid ${BDR}`, fontSize: ".65rem", color: INK3, fontFamily: BF }}>{POST_TYPE_LABELS[c.post_type]}</span>
                      {c.is_revealed && <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(107,142,110,0.1)", border: "1px solid rgba(107,142,110,0.25)", fontSize: ".65rem", color: "#166534", fontFamily: BF }}>Revealed</span>}
                    </div>
                    <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF, lineHeight: 1.6, marginBottom: ".5rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {c.message}
                    </p>
                    {/* Unlock date */}
                    {isEditing ? (
                      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${BDR}`, fontFamily: BF, fontSize: ".875rem" }} />
                        <button onClick={() => handleSaveDate(c.id)} disabled={isSaving} style={{ padding: "5px 12px", borderRadius: 999, background: ROSE, color: W, border: "none", fontSize: ".78rem", fontWeight: 700, fontFamily: BF, cursor: "pointer" }}>
                          {isSaving ? "Saving…" : "Save"}
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ padding: "5px 12px", borderRadius: 999, background: BG, border: `1px solid ${BDR}`, fontSize: ".78rem", fontFamily: BF, cursor: "pointer" }}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                        <Calendar size={13} style={{ color: INK3 }} />
                        <span style={{ fontSize: ".8rem", color: INK3, fontFamily: BF }}>
                          {c.is_revealed ? "Revealed" : `Unlocks ${formatDate(c.unlock_date)}`}
                          {!c.is_revealed && days > 0 && ` (${days} days)`}
                          {!c.is_revealed && days <= 0 && " — ready to unlock"}
                        </span>
                        {!c.is_revealed && (
                          <button onClick={() => { setEditingId(c.id); setNewDate(c.unlock_date.slice(0, 10)); }} style={{ padding: "2px 8px", borderRadius: 999, background: "transparent", border: `1px solid ${BDR}`, fontSize: ".65rem", color: INK3, fontFamily: BF, cursor: "pointer" }}>Edit date</button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: ".5rem", flexShrink: 0, alignItems: "center" }}>
                    {!c.is_revealed && (
                      <button onClick={() => handleReveal(c.id)} disabled={isSaving} title="Reveal now" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, background: "#FDEAEC", border: "1px solid #F5C5CB", color: ROSE, fontSize: ".75rem", fontWeight: 600, fontFamily: BF, cursor: "pointer" }}>
                        {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />} Reveal
                      </button>
                    )}
                    <button onClick={() => handleDelete(c.id, c.author_name)} disabled={isSaving} style={{ padding: 7, borderRadius: 999, background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", cursor: "pointer", display: "grid", placeItems: "center" }}>
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default TimeCapsuleManager;
