"use client";

import { type FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Plus, Vote, X } from "lucide-react";

interface Poll {
  id: string; question: string; options: string[]; is_active: boolean; created_at: string;
  family_poll_votes?: Array<{ answer: string; voter_email: string }>;
}
interface FamilyPollsProps { weddingId: string; isAdmin: boolean; voterEmail: string; }

function tally(poll: Poll) {
  const m = new Map<string, number>();
  for (const o of poll.options) m.set(o, 0);
  for (const v of poll.family_poll_votes ?? []) m.set(v.answer, (m.get(v.answer) ?? 0) + 1);
  return m;
}

function PollCard({ poll, voterEmail }: { poll: Poll; voterEmail: string }) {
  const userVote = poll.family_poll_votes?.find((v) => v.voter_email === voterEmail)?.answer ?? null;
  const [voted, setVoted]         = useState<string | null>(userVote);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const votes = tally(poll);
  const total = poll.family_poll_votes?.length ?? 0;

  async function handleVote(answer: string) {
    if (voted || submitting) return;
    setSubmitting(answer); setError(null);
    try {
      const res = await fetch("/api/family/polls/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pollId: poll.id, answer }) });
      const data = (await res.json()) as { success: boolean; message?: string; alreadyVoted?: boolean };
      if (res.status === 409 || data.alreadyVoted) { setVoted(answer); return; }
      if (!data.success) throw new Error(data.message ?? "Vote failed.");
      setVoted(answer); votes.set(answer, (votes.get(answer) ?? 0) + 1);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to submit vote."); }
    finally { setSubmitting(null); }
  }

  return (
    <article className="rounded-2xl p-5 space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-xs)" }}>
      <div className="flex items-start gap-2.5">
        <Vote className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--color-accent-soft)" }} />
        <h3 className="font-display text-lg" style={{ color: "var(--color-text-primary)" }}>{poll.question}</h3>
      </div>

      <div className="space-y-2">
        {poll.options.map((opt) => {
          const count = votes.get(opt) ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isSelected = voted === opt;
          const isLoading = submitting === opt;
          return (
            <button
              key={opt} type="button" disabled={!!voted || !!submitting}
              onClick={() => handleVote(opt)}
              className="relative w-full overflow-hidden rounded-xl text-left transition"
              style={{ background: isSelected ? "rgba(138,90,68,0.08)" : "var(--color-surface-muted)", border: `1px solid ${isSelected ? "rgba(212,179,155,0.5)" : "var(--color-border)"}` }}
            >
              {/* Progress bar fill */}
              {voted && (
                <div className="absolute inset-y-0 left-0 rounded-xl transition-all duration-500" style={{ width: `${pct}%`, background: isSelected ? "rgba(138,90,68,0.1)" : "rgba(138,90,68,0.04)" }} />
              )}
              <div className="relative flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" style={{ color: "var(--color-accent)" }} />
                    : isSelected ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-accent)" }} />
                    : <span className="h-3.5 w-3.5 rounded-full border-2 shrink-0" style={{ borderColor: "var(--color-border)" }} />
                  }
                  <span className="text-sm" style={{ color: isSelected ? "var(--color-accent)" : "var(--color-text-primary)", fontWeight: isSelected ? 500 : 400 }}>{opt}</span>
                </div>
                {voted && <span className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>{pct}% · {count}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="rounded-xl px-4 py-2.5 text-sm" style={{ background: "rgba(220,38,38,0.06)", color: "#b91c1c", border: "1px solid rgba(220,38,38,0.15)" }}>{error}</p>}
      <p style={{ fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
        {total} {total === 1 ? "vote" : "votes"}{voted ? " · your vote is recorded" : ""}
      </p>
    </article>
  );
}

export function FamilyPolls({ weddingId, isAdmin, voterEmail }: FamilyPollsProps) {
  const [polls, setPolls]         = useState<Poll[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion]   = useState("");
  const [options, setOptions]     = useState(["", ""]);
  const [creating, setCreating]   = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`/api/family/polls?weddingId=${encodeURIComponent(weddingId)}`).then((r) => r.json()).then((d: { success: boolean; data?: Poll[] }) => { if (d.success) setPolls(d.data ?? []); }).finally(() => setLoading(false));
  }, [weddingId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const cleanOpts = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || cleanOpts.length < 2) return;
    setCreating(true); setCreateError(null);
    try {
      const res = await fetch("/api/family/polls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weddingId, question: question.trim(), options: cleanOpts }) });
      const data = (await res.json()) as { success: boolean; data?: Poll; message?: string };
      if (!res.ok || !data.success) throw new Error(data.message ?? "Failed.");
      if (data.data) setPolls((prev) => [data.data!, ...prev]);
      setQuestion(""); setOptions(["", ""]); setShowCreate(false);
    } catch (err) { setCreateError(err instanceof Error ? err.message : "Failed."); }
    finally { setCreating(false); }
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--color-surface-muted)", border: "1px solid var(--color-border)",
    borderRadius: "0.75rem", color: "var(--color-text-primary)",
    padding: "0.75rem 1rem", width: "100%", outline: "none", fontSize: "0.9375rem",
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>Family polls</p>
          <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>Have your say.</h2>
          <p className="text-sm max-w-sm" style={{ color: "var(--color-text-secondary)" }}>Vote on questions the couple has opened to the family.</p>
        </div>
        {isAdmin && (
          <button type="button" onClick={() => { setShowCreate((s) => !s); setCreateError(null); }} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs uppercase transition" style={{ letterSpacing: "0.2em", background: showCreate ? "var(--color-surface-muted)" : "var(--color-accent)", border: `1px solid ${showCreate ? "var(--color-border)" : "var(--color-accent)"}`, color: showCreate ? "var(--color-text-secondary)" : "#fff" }}>
            {showCreate ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showCreate ? "Cancel" : "New poll"}
          </button>
        )}
      </div>

      {/* Create form */}
      {isAdmin && showCreate && (
        <form onSubmit={handleCreate} className="rounded-2xl p-5 space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--color-accent)" }}>Create a poll</p>
          <div>
            <label style={{ fontSize: "0.6rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "0.375rem" }}>Question</label>
            <input style={inputStyle} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Which song should open the first dance?" required />
          </div>
          <div className="space-y-2">
            <p style={{ fontSize: "0.6rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Options</p>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input style={{ ...inputStyle, flex: 1 }} value={opt} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} placeholder={`Option ${i + 1}`} />
                {options.length > 2 && <button type="button" onClick={() => setOptions(options.filter((_, j) => j !== i))} className="rounded-xl px-3 text-sm transition" style={{ background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}><X className="h-3.5 w-3.5" /></button>}
              </div>
            ))}
            {options.length < 6 && <button type="button" onClick={() => setOptions([...options, ""])} className="text-xs uppercase" style={{ letterSpacing: "0.22em", color: "var(--color-accent)" }}>+ Add option</button>}
          </div>
          {createError && <p className="rounded-xl px-4 py-2.5 text-sm" style={{ background: "rgba(220,38,38,0.06)", color: "#b91c1c", border: "1px solid rgba(220,38,38,0.15)" }}>{createError}</p>}
          <button type="submit" disabled={creating} className="flex items-center gap-2 rounded-full px-5 py-3 text-xs uppercase transition" style={{ letterSpacing: "0.22em", background: "var(--color-accent)", color: "#fff", opacity: creating ? 0.7 : 1 }}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Vote className="h-4 w-4" />}
            Create poll
          </button>
        </form>
      )}

      {/* Poll list */}
      {loading ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--color-accent-soft)" }} /></div>
      ) : polls.length === 0 ? (
        <div className="rounded-2xl py-10 text-center" style={{ background: "var(--color-surface-muted)", border: "1px dashed var(--color-border)" }}>
          <Vote className="mx-auto h-7 w-7 mb-3" style={{ color: "var(--color-accent-soft)" }} />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {isAdmin ? "No polls yet. Create one above." : "No active polls right now. Check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {polls.map((poll) => <PollCard key={poll.id} poll={poll} voterEmail={voterEmail} />)}
        </div>
      )}
    </section>
  );
}

export default FamilyPolls;
