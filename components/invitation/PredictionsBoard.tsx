"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, Loader2, RefreshCw, Trophy } from "lucide-react";
import type { PredictionQuestion, PredictionResult } from "@/lib/types";
import { Card, SectionLabel, Field, Btn } from "@/components/ui";

interface PredictionsBoardProps {
  questions: PredictionQuestion[];
  revealAfter: string;
  brideName: string;
  groomName: string;
}

type VoteMap = Record<string, string>;

interface BoardData { 
  results: PredictionResult[]; 
  revealed: boolean; 
  revealAfter: string; 
}

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
      if (data.success) {
        setBoardData({ 
          results: data.data, 
          revealed: data.revealed, 
          revealAfter: data.revealAfter 
        });
      }
    } catch { 
      setError("Unable to load predictions. Please refresh the page."); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    void fetchResults();
    // If the results are already revealed, poll for updates to keep the board live
    if (isNowRevealed) { 
      pollRef.current = setInterval(() => void fetchResults(), 20000); 
    }
    return () => { 
      if (pollRef.current) clearInterval(pollRef.current); 
    };
  }, [fetchResults, isNowRevealed]);

  async function handleVote(questionId: string, answer: string) {
    if (!nameEntered || !guestName.trim() || submitting) return;
    
    setSubmitting(questionId);
    try {
      const res = await fetch("/api/predictions", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ questionId, answer, guestName: guestName.trim() }) 
      });
      
      const data = (await res.json()) as { success: boolean; message?: string };
      if (data.success || res.status === 409) { 
        setVotes((v) => ({ ...v, [questionId]: answer })); 
        // If results are visible, refresh immediately to show the new vote count
        if (boardData?.revealed) void fetchResults(); 
      }
    } catch { 
      /* Silent fail for UX; the locked state remains locally */ 
    } finally { 
      setSubmitting(null); 
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-stone-300" />
      <p className="text-xs uppercase tracking-widest text-stone-500">Curating predictions...</p>
    </div>
  );

  if (error) return (
    <Card className="text-center space-y-4 py-12">
      <p className="text-sm text-red-600">{error}</p>
      <Btn type="button" variant="ghost" size="sm" onClick={() => { setError(null); setLoading(true); void fetchResults(); }}>
        <RefreshCw className="h-3.5 w-3.5 mr-2" /> Try again
      </Btn>
    </Card>
  );

  // ── PRE-REVEAL: Voting & Name Entry ──
  if (!boardData?.revealed) {
    return (
      <div className="space-y-8">
        {!nameEntered && (
          <Card className="space-y-5 max-w-lg mx-auto border-stone-200 bg-stone-50/50">
            <div>
              <SectionLabel>Identify yourself</SectionLabel>
              <h2 className="font-display text-3xl mt-1 text-stone-950">Who is predicting?</h2>
              <p className="text-sm mt-2 text-stone-600">
                Enter your name so {brideFirst} &amp; {groomFirst} know who has the best intuition.
              </p>
            </div>
            <div className="flex gap-3">
              <Field
                className="flex-1"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && guestName.trim().length >= 2) setNameEntered(true); }}
                placeholder="Enter your name"
              />
              <Btn 
                type="button" 
                variant="primary" 
                size="sm" 
                disabled={guestName.trim().length < 2} 
                onClick={() => setNameEntered(true)}
              >
                Enter <ChevronRight className="h-4 w-4" />
              </Btn>
            </div>
          </Card>
        )}

        <div className={`grid gap-6 sm:grid-cols-2 ${!nameEntered ? 'opacity-40 pointer-events-none grayscale-[0.5]' : ''}`}>
          {questions.map((q) => {
            const voted = votes[q.id];
            return (
              <Card key={q.id} className="space-y-5">
                <div className="flex items-start gap-3">
                  <span className="text-3xl" role="img" aria-hidden="true">{q.emoji}</span>
                  <p className="font-display text-xl leading-tight text-stone-950">{q.question}</p>
                </div>
                <div className="space-y-2.5">
                  {q.options.map((opt) => {
                    const isVoted = voted === opt.value;
                    const isOther = voted && voted !== opt.value;
                    return (
                      <button 
                        key={opt.value} 
                        type="button" 
                        disabled={!!voted || submitting === q.id || !nameEntered}
                        onClick={() => handleVote(q.id, opt.value)}
                        className="w-full flex items-center gap-3 rounded-xl p-4 text-left text-sm transition-all"
                        style={{
                          background: isVoted ? "rgba(107,142,110,0.08)" : "var(--color-surface)",
                          border: `1.5px solid ${isVoted ? "var(--color-sage)" : "var(--color-border)"}`,
                          color: isVoted ? "var(--color-sage)" : isOther ? "var(--color-text-muted)" : "var(--color-text-primary)",
                          cursor: !!voted || !nameEntered ? "default" : "pointer",
                        }}
                      >
                        {submitting === q.id && !voted ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        ) : (
                          <span 
                            className="h-4 w-4 shrink-0 rounded-full border-2 transition-colors" 
                            style={{ 
                              borderColor: isVoted ? "var(--color-sage)" : "var(--color-border-medium)", 
                              background: isVoted ? "var(--color-sage)" : "transparent" 
                            }} 
                          />
                        )}
                        <span className="font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                {voted && (
                  <p className="text-xs italic text-stone-400">Locked in. Let&apos;s see if you&apos;re right!</p>
                )}
              </Card>
            );
          })}
        </div>
        <p className="text-center text-xs tracking-widest uppercase text-stone-400">
          Polls close &amp; reveal on {new Date(revealAfter).toLocaleDateString("en-US", { day: "numeric", month: "long" })}.
        </p>
      </div>
    );
  }

  // ── POST-REVEAL: Results Display ──
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-stone-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 p-2 rounded-lg">
            <Trophy className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-stone-950">The Crowd&apos;s Verdict</h2>
            <p className="text-xs text-stone-500 uppercase tracking-tighter">Live from the guestbook</p>
          </div>
        </div>
        <Btn type="button" variant="ghost" size="sm" onClick={() => void fetchResults()}>
          <RefreshCw className="h-3.5 w-3.5 mr-2" /> Refresh stats
        </Btn>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {boardData.results.map((result) => {
          const myVote = votes[result.questionId];
          return (
            <Card key={result.questionId} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{result.emoji}</span>
                  <p className="font-display text-xl leading-tight text-stone-950">{result.question}</p>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400">
                  {result.totalVotes} total responses
                </p>
              </div>

              <div className="space-y-4">
                {result.options.sort((a, b) => b.votes - a.votes).map((opt) => (
                  <div key={opt.value} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-stone-700">
                        {opt.isLeading && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
                        <span className={opt.isLeading ? "font-bold" : "font-normal"}>{opt.label}</span>
                        {myVote === opt.value && (
                          <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 uppercase font-bold">You</span>
                        )}
                      </span>
                      <span className="text-xs tabular-nums font-semibold text-stone-900">{opt.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ 
                          width: `${opt.percentage}%`, 
                          background: opt.isLeading ? "var(--color-gold)" : "var(--color-champagne)" 
                        }} 
                      />
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
