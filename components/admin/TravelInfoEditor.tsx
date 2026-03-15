"use client";

import { useState } from "react";
import { Plus, Trash2, Save, CheckCircle2, Loader2, X } from "lucide-react";

const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BDR  = "#D0C0BC";
const BG   = "#FAF8F6";
const W    = "#FFFFFF";
const BF   = "var(--font-body), system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";

interface Section { id: string; title: string; description: string; link: string; }
interface FAQ      { question: string; answer: string; }

interface TravelEditorProps {
  initialSections:    Section[];
  initialFaq:         FAQ[];
  initialArrivalTips: string[];
}

function inp(extra: React.CSSProperties = {}): React.CSSProperties {
  return { display: "block", width: "100%", background: W, border: `1.5px solid ${BDR}`, borderRadius: 10, padding: ".75rem 1rem", color: INK, fontSize: ".9rem", fontFamily: BF, outline: "none", ...extra };
}

const LBL = (text: string) => (
  <label style={{ display: "block", fontSize: ".6rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" as const, color: INK3, marginBottom: ".375rem", fontFamily: BF }}>{text}</label>
);

export function TravelInfoEditor({ initialSections, initialFaq, initialArrivalTips }: TravelEditorProps) {
  const [sections,    setSections]    = useState<Section[]>(initialSections);
  const [faq,         setFaq]         = useState<FAQ[]>(initialFaq);
  const [tips,        setTips]        = useState<string[]>(initialArrivalTips);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function save() {
    setSaving(true); setError(null); setSaved(false);
    try {
      const res = await fetch("/api/admin/travel", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ sections, faq, arrivalTips: tips }),
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
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: ROSE, fontFamily: BF }}>Travel info editor</p>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 700, color: INK, marginTop: ".25rem" }}>Edit travel guide</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
          {saved && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: ".8rem", color: "#059669", fontFamily: BF }}><CheckCircle2 size={16} /> Saved</span>}
          <button onClick={save} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 22px", borderRadius: 999, background: ROSE, color: W, fontSize: ".82rem", fontWeight: 700, fontFamily: BF, cursor: saving ? "not-allowed" : "pointer", border: "none", opacity: saving ? .75 : 1 }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving…" : "Save all"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, fontSize: ".875rem", color: "#B91C1C", fontFamily: BF }}>
          {error}<button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#B91C1C" }}><X size={16} /></button>
        </div>
      )}

      {/* ── Travel Sections ── */}
      <div style={{ background: W, border: "1px solid #E4D8D4", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.75rem", background: BG, borderBottom: "1px solid #E4D8D4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontFamily: DF, fontSize: "1.125rem", fontWeight: 700, color: INK }}>Travel sections</p>
          <button onClick={() => setSections((p) => [...p, { id: `s-${Date.now()}`, title: "", description: "", link: "" }])} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 999, background: W, border: `1.5px solid ${BDR}`, color: INK, fontSize: ".78rem", fontWeight: 600, fontFamily: BF, cursor: "pointer" }}>
            <Plus size={14} /> Add section
          </button>
        </div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {sections.map((s, i) => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "1.25rem", background: BG, borderRadius: 14 }}>
              <div><span>{LBL("Title")}</span><input value={s.title} onChange={(e) => setSections((p) => p.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} placeholder="Section title" style={inp()} /></div>
              <div><span>{LBL("Link URL")}</span><input value={s.link} onChange={(e) => setSections((p) => p.map((x, j) => j === i ? { ...x, link: e.target.value } : x))} placeholder="https://…" style={inp()} /></div>
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: ".75rem", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}><span>{LBL("Description")}</span><textarea value={s.description} onChange={(e) => setSections((p) => p.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} rows={2} style={{ ...inp(), resize: "none" }} /></div>
                <button onClick={() => setSections((p) => p.filter((_, j) => j !== i))} style={{ marginTop: "1.5rem", padding: 8, borderRadius: 10, border: "1px solid #FECACA", background: "#FEF2F2", cursor: "pointer", color: "#B91C1C", flexShrink: 0 }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
          {sections.length === 0 && <p style={{ color: INK3, fontFamily: BF, fontSize: ".875rem" }}>No sections yet.</p>}
        </div>
      </div>

      {/* ── Arrival Tips ── */}
      <div style={{ background: W, border: "1px solid #E4D8D4", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.75rem", background: BG, borderBottom: "1px solid #E4D8D4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontFamily: DF, fontSize: "1.125rem", fontWeight: 700, color: INK }}>Arrival tips</p>
          <button onClick={() => setTips((p) => [...p, ""])} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 999, background: W, border: `1.5px solid ${BDR}`, color: INK, fontSize: ".78rem", fontWeight: 600, fontFamily: BF, cursor: "pointer" }}>
            <Plus size={14} /> Add tip
          </button>
        </div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: ".75rem" }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: ".75rem", alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FDEAEC", border: "1px solid #F5C5CB", display: "grid", placeItems: "center", flexShrink: 0, fontFamily: DF, fontSize: ".85rem", fontWeight: 700, color: ROSE, marginTop: ".125rem" }}>{i + 1}</div>
              <textarea value={tip} onChange={(e) => setTips((p) => p.map((t, j) => j === i ? e.target.value : t))} rows={2} style={{ ...inp({ flex: "1" }), resize: "none" }} />
              <button onClick={() => setTips((p) => p.filter((_, j) => j !== i))} style={{ padding: 8, borderRadius: 10, border: "1px solid #FECACA", background: "#FEF2F2", cursor: "pointer", color: "#B91C1C", flexShrink: 0, marginTop: ".125rem" }}><Trash2 size={15} /></button>
            </div>
          ))}
          {tips.length === 0 && <p style={{ color: INK3, fontFamily: BF, fontSize: ".875rem" }}>No tips yet.</p>}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ background: W, border: "1px solid #E4D8D4", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.75rem", background: BG, borderBottom: "1px solid #E4D8D4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontFamily: DF, fontSize: "1.125rem", fontWeight: 700, color: INK }}>FAQ</p>
          <button onClick={() => setFaq((p) => [...p, { question: "", answer: "" }])} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 999, background: W, border: `1.5px solid ${BDR}`, color: INK, fontSize: ".78rem", fontWeight: 600, fontFamily: BF, cursor: "pointer" }}>
            <Plus size={14} /> Add FAQ
          </button>
        </div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {faq.map((f, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "1.25rem", background: BG, borderRadius: 14 }}>
              <div><span>{LBL("Question")}</span><input value={f.question} onChange={(e) => setFaq((p) => p.map((x, j) => j === i ? { ...x, question: e.target.value } : x))} placeholder="Question…" style={inp()} /></div>
              <div style={{ display: "flex", gap: ".75rem", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}><span>{LBL("Answer")}</span><textarea value={f.answer} onChange={(e) => setFaq((p) => p.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))} rows={2} style={{ ...inp(), resize: "none" }} /></div>
                <button onClick={() => setFaq((p) => p.filter((_, j) => j !== i))} style={{ marginTop: "1.5rem", padding: 8, borderRadius: 10, border: "1px solid #FECACA", background: "#FEF2F2", cursor: "pointer", color: "#B91C1C", flexShrink: 0 }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
          {faq.length === 0 && <p style={{ color: INK3, fontFamily: BF, fontSize: ".875rem" }}>No FAQ items yet.</p>}
        </div>
      </div>
    </div>
  );
}
