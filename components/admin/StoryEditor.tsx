"use client";

import { useState } from "react";
import { Plus, Trash2, Save, ChevronUp, ChevronDown, CheckCircle2, Loader2, X } from "lucide-react";

/* ── Types ── */
interface StoryBeat {
  year:        string;
  title:       string;
  description: string;
  imageUrl:    string;
}

interface StoryEditorProps {
  initialStory: StoryBeat[];
}

const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BDR  = "#D0C0BC";
const BG   = "#FAF8F6";
const W    = "#FFFFFF";
const BF   = "var(--font-body), system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";

const BLANK: StoryBeat = { year: "", title: "", description: "", imageUrl: "" };

function inp(extra: React.CSSProperties = {}): React.CSSProperties {
  return { display: "block", width: "100%", background: W, border: `1.5px solid ${BDR}`, borderRadius: 10, padding: ".75rem 1rem", color: INK, fontSize: ".9rem", fontFamily: BF, outline: "none", ...extra };
}

export function StoryEditor({ initialStory }: StoryEditorProps) {
  const [beats,   setBeats]   = useState<StoryBeat[]>(initialStory.map((b) => ({ ...b })));
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  function update(i: number, field: keyof StoryBeat, val: string) {
    setBeats((prev) => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b));
    setSaved(false);
  }

  function add() {
    setBeats((prev) => [...prev, { ...BLANK }]);
    setSaved(false);
  }

  function remove(i: number) {
    setBeats((prev) => prev.filter((_, idx) => idx !== i));
    setSaved(false);
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...beats];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    setBeats(next);
    setSaved(false);
  }

  async function save() {
    setSaving(true); setError(null); setSaved(false);
    try {
      const res = await fetch("/api/admin/story", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ story: beats }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Save failed.");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: ROSE, fontFamily: BF }}>Story editor</p>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 700, color: INK, marginTop: ".25rem" }}>Edit your love story</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
          {saved && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: ".8rem", color: "#059669", fontFamily: BF }}>
              <CheckCircle2 size={16} /> Saved
            </span>
          )}
          <button onClick={add} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 999, background: BG, border: `1.5px solid ${BDR}`, color: INK, fontSize: ".82rem", fontWeight: 600, fontFamily: BF, cursor: "pointer" }}>
            <Plus size={15} /> Add chapter
          </button>
          <button onClick={save} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 22px", borderRadius: 999, background: ROSE, color: W, fontSize: ".82rem", fontWeight: 700, fontFamily: BF, cursor: saving ? "not-allowed" : "pointer", border: "none", opacity: saving ? .75 : 1 }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving…" : "Save story"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, fontSize: ".875rem", color: "#B91C1C", fontFamily: BF }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#B91C1C", flexShrink: 0 }}><X size={16} /></button>
        </div>
      )}

      {/* Story beats */}
      {beats.map((beat, i) => (
        <div key={i} style={{ background: W, border: `1px solid #E4D8D4`, borderRadius: 20, overflow: "hidden" }}>
          {/* Beat header */}
          <div style={{ padding: "1rem 1.5rem", background: BG, borderBottom: "1px solid #E4D8D4", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <span style={{ fontFamily: DF, fontSize: "1rem", fontWeight: 700, color: INK }}>Chapter {i + 1}{beat.year ? ` · ${beat.year}` : ""}</span>
            <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              <button onClick={() => move(i, -1)} disabled={i === 0} style={{ padding: 6, borderRadius: 8, border: `1px solid #E4D8D4`, background: W, cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? .4 : 1 }}><ChevronUp size={14} /></button>
              <button onClick={() => move(i,  1)} disabled={i === beats.length - 1} style={{ padding: 6, borderRadius: 8, border: `1px solid #E4D8D4`, background: W, cursor: i === beats.length - 1 ? "not-allowed" : "pointer", opacity: i === beats.length - 1 ? .4 : 1 }}><ChevronDown size={14} /></button>
              <button onClick={() => remove(i)} style={{ padding: 6, borderRadius: 8, border: "1px solid #FECACA", background: "#FEF2F2", cursor: "pointer", color: "#B91C1C" }}><Trash2 size={14} /></button>
            </div>
          </div>

          {/* Fields */}
          <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "120px 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: ".6rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".375rem", fontFamily: BF }}>Year</label>
              <input value={beat.year} onChange={(e) => update(i, "year", e.target.value)} placeholder="2021" style={inp()} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".6rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".375rem", fontFamily: BF }}>Title</label>
              <input value={beat.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="Chapter title" style={inp()} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: ".6rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".375rem", fontFamily: BF }}>Story</label>
              <textarea value={beat.description} onChange={(e) => update(i, "description", e.target.value)} rows={3} placeholder="What happened in this chapter…" style={{ ...inp(), resize: "none" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: ".6rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".375rem", fontFamily: BF }}>Photo URL (optional)</label>
              <input value={beat.imageUrl} onChange={(e) => update(i, "imageUrl", e.target.value)} placeholder="https://…" style={inp()} />
            </div>
          </div>
        </div>
      ))}

      {beats.length === 0 && (
        <div style={{ padding: "3rem", textAlign: "center", background: BG, borderRadius: 20, border: `1.5px dashed #D0C0BC` }}>
          <p style={{ color: INK3, fontFamily: BF, marginBottom: "1rem" }}>No story chapters yet.</p>
          <button onClick={add} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 999, background: ROSE, color: W, fontSize: ".85rem", fontWeight: 700, fontFamily: BF, cursor: "pointer", border: "none" }}>
            <Plus size={15} /> Add first chapter
          </button>
        </div>
      )}
    </div>
  );
}
