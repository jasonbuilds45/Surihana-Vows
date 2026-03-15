"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, Loader2, RefreshCw, Trophy } from "lucide-react";
import type { PredictionQuestion, PredictionResult } from "@/lib/types";
import { Card, SectionLabel, Field, Btn, EmptyState } from "@/components/ui";

interface PredictionsBoardProps {
  questions: PredictionQuestion[];
  revealAfter: string;
  brideName: string;
  groomName: string;
}

type VoteMap = Record<string, string>;

interface BoardData { results: PredictionResult[]; revealed: boolean; revealAfter: string; }

export function PredictionsBoard({ questions, revealAfter, brideName, groomName }: PredictionsBoardProps) {
  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];

  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<VoteMap>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [nameEntered, setNameEntered] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isNowRevealed = new Date() >= new Date(revealAfter);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch("/api/predictions");
      const data = (await res.json()) as { success: boolean; data: PredictionResult[]; revealed: boolean; revealAfter: string };
      if (data.success) setBoardData({ results: data.data, revealed: data.revealed, revealAfter: data.revealAfter });
    } catch { setError("Unable to load predictions. Please refresh."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void fetchResults();
    if (isNowRevealed) { pollRef.current = setInterval(() => void fetchResults(), 20_000); }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchResults, isNowRevealed]);

  async function handleVote(questionId: string, answer: string) {
    if (!nameEntered || !guestName.trim() || submitting) return;
    setSubmitting(questionId);
    try {
      const res = await fetch("/api/predictions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId, answer, guestName: guestName.trim() }) });
      const data = (await res.json()) as { success: boolean; message?: string };
      if (data.success || res.status === 409) { setVotes((v) => ({ ...v, [questionId]: answer })); if (boardData?.revealed) void fetchResults(); }
    } catch { /* silent */ }
    finally { setSubmitting(null); }
  }

  const cardStyle = { background: "var(--color-surface-soft)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "1rem" };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--color-accent-soft)" }} /></div>;

  if (error) return (
    <Card className="text-center space-y-4">
      <p className="text-sm" style={{ color: "#b91c1c" }}>{error}</p>
      <Btn type="button" variant="ghost" size="sm" onClick={() => { setError(null); setLoading(true); void fetchResults(); }}>
        <RefreshCw className="h-3.5 w-3.5" /> Try again
      </Btn>
    </Card>
  );

  // ── Pre-reveal: voting mode ──
  if (!boardData?.revealed) return (
    <div className="space-y-8">
      {/* Name gate */}
      {!nameEntered && (
        <Card className="space-y-5 max-w-lg">
          <div>
            <SectionLabel>Before you vote</SectionLabel>
            <h2 className="font-display text-3xl mt-1" style={{ color: "var(--color-text-primary)" }}>What's your name?</h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>So {brideFirst} &amp; {groomFirst} know who made the boldest predictions.</p>
          </div>
          <div className="flex gap-3">
            <Field
              className="flex-1"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && guestName.trim().length >= 2) setNameEntered(true); }}
              placeholder="Your name"
            />
            <Btn type="button" variant="primary" size="sm" disabled={guestName.trim().length < 2} onClick={() => setNameEntered(true)}>
              Start <ChevronRight className="h-4 w-4" />
            </Btn>
          </div>
        </Card>
      )}

      {/* Questions grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {questions.map((q) => {
          const voted = votes[q.id];
          return (
            <Card key={q.id} className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{q.emoji}</span>
                <p className="font-display text-xl" style={{ color: "var(--color-text-primary)", lineHeight: 1.25 }}>{q.question}</p>
              </div>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const isVoted = voted === opt.value;
                  const isOther = voted && voted !== opt.value;
                  return (
                    <button key={opt.value} type="button" disabled={!!voted || submitting === q.id || !nameEntered}
                      onClick={() => handleVote(q.id, opt.value)}
                      className="w-full flex items-center gap-3 rounded-xl p-3.5 text-left text-sm transition-all"
                      style={{
                        background: isVoted ? "rgba(107,142,110,0.1)" : isOther ? "var(--color-surface-soft)" : nameEntered ? "var(--color-surface)" : "var(--color-surface-soft)",
                        border: `1.5px solid ${isVoted ? "rgba(107,142,110,0.3)" : "var(--color-border)"}`,
                        color: isVoted ? "var(--color-sage)" : isOther ? "var(--color-text-muted)" : "var(--color-text-primary)",
                        cursor: !!voted || !nameEntered ? "default" : "pointer",
                      }}
                    >
                      {submitting === q.id && !voted ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" /> : <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2" style={{ borderColor: isVoted ? "var(--color-sage)" : "var(--color-border-medium)", background: isVoted ? "var(--color-sage)" : "transparent" }} />}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {voted && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Prediction locked in.</p>}
            </Card>
          );
        })}
      </div>
      <p className="text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
        Results hidden until {new Date(revealAfter).toLocaleDateString("en-US", { day: "numeric", month: "long" })}.
      </p>
    </div>
  );

  // ── Post-reveal: results ──
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-5 w-5" style={{ color: "var(--color-gold)" }} />
          <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>Results are in!</p>
        </div>
        <Btn type="button" variant="ghost" size="sm" onClick={() => void fetchResults()}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Btn>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {boardData.results.map((result) => {
          const myVote = votes[result.questionId];
          return (
            <Card key={result.questionId} className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{result.emoji}</span>
                  <p className="font-display text-xl" style={{ color: "var(--color-text-primary)", lineHeight: 1.2 }}>{result.question}</p>
                </div>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{result.totalVotes} vote{result.totalVotes === 1 ? "" : "s"}</p>
              </div>

              <div className="space-y-3">
                {result.options.sort((a, b) => b.votes - a.votes).map((opt) => (
                  <div key={opt.value} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2" style={{ color: opt.isLeading ? "var(--color-text-primary)" : "var(--color-text-secondary)", fontWeight: opt.isLeading ? 600 : 400 }}>
                        {opt.isLeading && <Trophy className="h-3.5 w-3.5" style={{ color: "var(--color-gold)" }} />}
                        {opt.label}
                        {myVote === opt.value && <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>(you)</span>}
                      </span>
                      <span className="text-xs tabular-nums font-medium" style={{ color: opt.isLeading ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>{opt.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-muted)" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${opt.percentage}%`, background: opt.isLeading ? "var(--color-gold)" : "var(--color-champagne)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default PredictionsBoard;
