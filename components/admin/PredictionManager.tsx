"use client";

import { type FormEvent, useState } from "react";
import { authFetch } from "@/lib/client/token";
import { Plus, Trash2, Eye, EyeOff, ToggleLeft, ToggleRight, BarChart2, Loader2, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { weddingConfig } from "@/lib/config";
import type { PredictionQuestion, PredictionOption } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface DBQuestion {
  id: string;
  question: string;
  emoji: string;
  options: PredictionOption[];
  is_active: boolean;
  reveal_results: boolean;
  sort_order: number;
  vote_counts?: Record<string, number>;
  total_votes?: number;
}

interface PredictionManagerProps {
  initialQuestions: DBQuestion[];
}

const BF = "var(--font-body), system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";
const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BG   = "#FAF8F6";
const W    = "#FFFFFF";
const BDR  = "#D0C0BC";

const inp: React.CSSProperties = {
  display: "block", width: "100%", background: W,
  border: `1.5px solid ${BDR}`, borderRadius: 10,
  padding: ".7rem 1rem", color: INK, fontSize: ".9rem",
  fontFamily: BF, outline: "none",
};

// ─────────────────────────────────────────────────────────────────────────────
// PredictionManager
// ─────────────────────────────────────────────────────────────────────────────
export function PredictionManager({ initialQuestions }: PredictionManagerProps) {
  const [questions, setQuestions] = useState<DBQuestion[]>(initialQuestions);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [saving,    setSaving]    = useState<string | null>(null);
  const [adding,    setAdding]    = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  // New question form state
  const [newQ, setNewQ] = useState({ question: "", emoji: "🎯", options: ["", "", "", ""] });

  function flash(id: string, ok: boolean, msg: string) {
    setStatusMsg({ id, ok, msg });
    setTimeout(() => setStatusMsg(null), 3000);
  }

  // ── Toggle active ──────────────────────────────────────────────────────────
  async function toggleActive(q: DBQuestion) {
    setSaving(q.id);
    try {
      const res = await authFetch(`/api/admin/predictions/${q.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !q.is_active }),
      });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error("Failed");
      setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, is_active: !q.is_active } : x));
      flash(q.id, true, q.is_active ? "Question hidden from guests." : "Question shown to guests.");
    } catch {
      flash(q.id, false, "Failed to update.");
    } finally { setSaving(null); }
  }

  // ── Toggle reveal results ──────────────────────────────────────────────────
  async function toggleReveal(q: DBQuestion) {
    setSaving(q.id);
    try {
      const res = await authFetch(`/api/admin/predictions/${q.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reveal_results: !q.reveal_results }),
      });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error("Failed");
      setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, reveal_results: !q.reveal_results } : x));
      flash(q.id, true, q.reveal_results ? "Results hidden from guests." : "Results revealed to guests! 🎉");
    } catch {
      flash(q.id, false, "Failed to update.");
    } finally { setSaving(null); }
  }

  // ── Delete question ────────────────────────────────────────────────────────
  async function deleteQuestion(id: string) {
    if (!window.confirm("Delete this prediction question? All votes will be lost.")) return;
    setSaving(id);
    try {
      const res = await authFetch(`/api/admin/predictions/${id}`, { method: "DELETE" });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error("Failed");
      setQuestions(prev => prev.filter(x => x.id !== id));
    } catch {
      flash(id, false, "Failed to delete.");
    } finally { setSaving(null); }
  }

  // ── Add new question ───────────────────────────────────────────────────────
  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const opts = newQ.options.filter(o => o.trim());
    if (opts.length < 2) return;
    setSaving("new");
    try {
      const res = await authFetch("/api/admin/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weddingId: weddingConfig.id,
          question: newQ.question.trim(),
          emoji: newQ.emoji.trim() || "🎯",
          options: opts.map((o, i) => ({ value: `option_${i}`, label: o.trim() })),
        }),
      });
      const data = await res.json() as { success: boolean; data?: DBQuestion };
      if (!res.ok || !data.success || !data.data) throw new Error("Failed");
      setQuestions(prev => [...prev, data.data!]);
      setNewQ({ question: "", emoji: "🎯", options: ["", "", "", ""] });
      setAdding(false);
      flash("new", true, "Question added!");
    } catch {
      flash("new", false, "Failed to add.");
    } finally { setSaving(null); }
  }

  const totalVotes = questions.reduce((acc, q) => acc + (q.total_votes ?? 0), 0);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: ROSE, fontFamily: BF }}>Prediction game</p>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 700, color: INK, marginTop: ".2rem" }}>Manage predictions</h2>
          <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF, marginTop: ".375rem" }}>
            {questions.length} question{questions.length !== 1 ? "s" : ""} · {totalVotes} total votes
          </p>
        </div>
        <button
          onClick={() => setAdding(a => !a)}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 999, background: adding ? BG : ROSE, color: adding ? INK : W, border: `1.5px solid ${adding ? BDR : ROSE}`, fontSize: ".82rem", fontWeight: 700, fontFamily: BF, cursor: "pointer" }}
        >
          {adding ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add question</>}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={handleAdd} style={{ background: BG, border: `1px solid ${BDR}`, borderRadius: 18, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontFamily: DF, fontSize: "1rem", fontWeight: 700, color: INK }}>New prediction question</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: ".58rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".375rem", fontFamily: BF }}>Question</label>
              <input value={newQ.question} onChange={e => setNewQ(q => ({ ...q, question: e.target.value }))} required placeholder="Who will cry first?" style={inp} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".58rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".375rem", fontFamily: BF }}>Emoji</label>
              <input value={newQ.emoji} onChange={e => setNewQ(q => ({ ...q, emoji: e.target.value }))} placeholder="🎯" style={{ ...inp, textAlign: "center", fontSize: "1.25rem" }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: ".58rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".625rem", fontFamily: BF }}>Options (min 2)</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".625rem" }}>
              {newQ.options.map((o, i) => (
                <input key={i} value={o} onChange={e => setNewQ(q => { const opts = [...q.options]; opts[i] = e.target.value; return { ...q, options: opts }; })} placeholder={`Option ${i + 1}`} style={inp} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: ".75rem" }}>
            <button type="submit" disabled={saving === "new"} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 22px", borderRadius: 999, background: ROSE, color: W, border: "none", fontSize: ".82rem", fontWeight: 700, fontFamily: BF, cursor: "pointer" }}>
              {saving === "new" ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save question
            </button>
            <button type="button" onClick={() => setAdding(false)} style={{ padding: "9px 18px", borderRadius: 999, background: W, border: `1.5px solid ${BDR}`, color: INK3, fontSize: ".82rem", fontFamily: BF, cursor: "pointer" }}>Cancel</button>
          </div>
        </form>
      )}

      {statusMsg?.id === "new" && (
        <p style={{ padding: "10px 16px", borderRadius: 12, background: statusMsg.ok ? "rgba(107,142,110,0.1)" : "#fef2f2", color: statusMsg.ok ? "#166534" : "#b91c1c", border: `1px solid ${statusMsg.ok ? "rgba(107,142,110,0.3)" : "#fca5a5"}`, fontSize: ".875rem", fontFamily: BF }}>
          {statusMsg.msg}
        </p>
      )}

      {/* Questions list */}
      {questions.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", background: BG, borderRadius: 18, border: `1.5px dashed ${BDR}` }}>
          <BarChart2 size={32} style={{ color: BDR, margin: "0 auto 1rem" }} />
          <p style={{ fontFamily: DF, fontSize: "1.125rem", color: INK, marginBottom: ".5rem" }}>No prediction questions yet.</p>
          <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>Add your first question above to start the game.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {questions.map(q => {
            const isExpanded = expanded === q.id;
            const isSaving   = saving === q.id;
            const thisFlash  = statusMsg?.id === q.id ? statusMsg : null;
            const totalQ     = q.total_votes ?? 0;

            return (
              <div key={q.id} style={{ background: W, border: `1px solid ${q.is_active ? BDR : "#E8E0DC"}`, borderRadius: 18, overflow: "hidden", opacity: q.is_active ? 1 : 0.65 }}>
                {/* Question header */}
                <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{q.emoji}</span>
                  <p style={{ fontFamily: BF, fontWeight: 600, color: INK, flex: 1, fontSize: ".9375rem" }}>{q.question}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexShrink: 0, flexWrap: "wrap" }}>
                    {/* Vote count badge */}
                    <span style={{ padding: "3px 10px", borderRadius: 999, background: BG, border: `1px solid ${BDR}`, fontSize: ".72rem", color: INK3, fontFamily: BF }}>
                      {totalQ} vote{totalQ !== 1 ? "s" : ""}
                    </span>
                    {/* Active toggle */}
                    <button onClick={() => toggleActive(q)} disabled={isSaving} title={q.is_active ? "Hide from guests" : "Show to guests"} style={{ padding: "5px 10px", borderRadius: 9999, background: q.is_active ? "rgba(107,142,110,0.1)" : BG, border: `1px solid ${q.is_active ? "rgba(107,142,110,0.3)" : BDR}`, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, fontSize: ".7rem", color: q.is_active ? "#166534" : INK3, fontFamily: BF, fontWeight: 600 }}>
                      {q.is_active ? <><ToggleRight size={14} /> Active</> : <><ToggleLeft size={14} /> Hidden</>}
                    </button>
                    {/* Reveal toggle */}
                    <button onClick={() => toggleReveal(q)} disabled={isSaving} title={q.reveal_results ? "Hide results" : "Reveal results to guests"} style={{ padding: "5px 10px", borderRadius: 9999, background: q.reveal_results ? "#FDEAEC" : BG, border: `1px solid ${q.reveal_results ? "#F5C5CB" : BDR}`, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, fontSize: ".7rem", color: q.reveal_results ? ROSE : INK3, fontFamily: BF, fontWeight: 600 }}>
                      {q.reveal_results ? <><Eye size={14} /> Results live</> : <><EyeOff size={14} /> Results hidden</>}
                    </button>
                    {/* Expand */}
                    <button onClick={() => setExpanded(e => e === q.id ? null : q.id)} style={{ padding: 6, borderRadius: 9999, background: BG, border: `1px solid ${BDR}`, cursor: "pointer", display: "grid", placeItems: "center" }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {/* Delete */}
                    <button onClick={() => deleteQuestion(q.id)} disabled={isSaving} style={{ padding: 6, borderRadius: 9999, background: "#fef2f2", border: "1px solid #fca5a5", cursor: "pointer", display: "grid", placeItems: "center", color: "#b91c1c" }}>
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                {/* Flash message */}
                {thisFlash && (
                  <div style={{ padding: "8px 1.25rem", background: thisFlash.ok ? "rgba(107,142,110,0.08)" : "#fef2f2", borderTop: `1px solid ${thisFlash.ok ? "rgba(107,142,110,0.2)" : "#fca5a5"}`, fontSize: ".8rem", color: thisFlash.ok ? "#166534" : "#b91c1c", fontFamily: BF }}>
                    {thisFlash.msg}
                  </div>
                )}

                {/* Vote bars */}
                {isExpanded && (
                  <div style={{ padding: "1rem 1.25rem", borderTop: `1px solid ${BDR}`, background: BG, display: "flex", flexDirection: "column", gap: ".75rem" }}>
                    <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: INK3, fontFamily: BF, marginBottom: ".25rem" }}>Vote breakdown</p>
                    {q.options.map(opt => {
                      const votes = q.vote_counts?.[opt.value] ?? 0;
                      const pct   = totalQ > 0 ? Math.round((votes / totalQ) * 100) : 0;
                      return (
                        <div key={opt.value}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".375rem" }}>
                            <span style={{ fontSize: ".875rem", color: INK, fontFamily: BF }}>{opt.label}</span>
                            <span style={{ fontSize: ".8rem", color: INK3, fontFamily: BF }}>{votes} ({pct}%)</span>
                          </div>
                          <div style={{ height: 8, borderRadius: 999, background: "#E8E0DC", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: ROSE, borderRadius: 999, transition: "width .5s ease", minWidth: votes > 0 ? 8 : 0 }} />
                          </div>
                        </div>
                      );
                    })}
                    {totalQ === 0 && <p style={{ fontSize: ".8rem", color: INK3, fontFamily: BF }}>No votes yet.</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PredictionManager;
