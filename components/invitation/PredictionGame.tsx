"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronRight, Loader2, Trophy } from "lucide-react";
import type { PredictionQuestion } from "@/lib/types";
import { Card, SectionLabel, BtnLink } from "@/components/ui";

interface PredictionGameProps {
  questions: PredictionQuestion[];
  guestName: string;
  brideName: string;
  groomName: string;
  predictionsPageUrl?: string;
}

type VoteState = "idle" | "submitting" | "voted" | "error" | "already_voted";

interface QuestionState {
  voteState: VoteState;
  selectedAnswer: string | null;
  errorMessage: string | null;
}

const initialState = (): QuestionState => ({ 
  voteState: "idle", 
  selectedAnswer: null, 
  errorMessage: null 
});

export function PredictionGame({ 
  questions, 
  guestName, 
  brideName, 
  groomName, 
  predictionsPageUrl = "/predictions" 
}: PredictionGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [states, setStates] = useState<QuestionState[]>(() => questions.map(() => initialState()));
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];
  const current = questions[currentIndex];
  const currentState = states[currentIndex];
  
  const allVoted = states.every((s) => s.voteState === "voted" || s.voteState === "already_voted");

  // Smooth scroll to the top of the card when moving between questions
  useEffect(() => { 
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" }); 
    }
  }, [currentIndex]);

  const updateState = useCallback((index: number, update: Partial<QuestionState>) => {
    setStates((prev) => { 
      const next = [...prev]; 
      next[index] = { ...next[index], ...update }; 
      return next; 
    });
  }, []);

  async function handleVote(answer: string) {
    if (currentState.voteState !== "idle") return;
    
    updateState(currentIndex, { voteState: "submitting", selectedAnswer: answer });
    
    try {
      const res = await fetch("/api/predictions", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          questionId: current.id, 
          answer, 
          guestName: guestName || "Guest" 
        }) 
      });

      const data = (await res.json()) as { success: boolean; message?: string };
      
      if (res.status === 409) { 
        updateState(currentIndex, { voteState: "already_voted" }); 
      } else if (data.success) { 
        updateState(currentIndex, { voteState: "voted" }); 
      } else { 
        updateState(currentIndex, { 
          voteState: "error", 
          errorMessage: data.message ?? "Unable to save your prediction." 
        }); 
      }
    } catch { 
      updateState(currentIndex, { 
        voteState: "error", 
        errorMessage: "Connection error. Please try again." 
      }); 
    }
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsComplete(true);
    }
  }

  // Completion State
  if (isComplete || allVoted) {
    return (
      <Card className="text-center space-y-5 py-10">
        <div 
          className="mx-auto grid h-16 w-16 place-items-center rounded-full" 
          style={{ background: "var(--color-gold-soft)", border: "1px solid rgba(184,134,11,0.25)" }}
        >
          <Trophy className="h-7 w-7" style={{ color: "var(--color-gold)" }} />
        </div>
        <h3 className="font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>
          All predictions sealed!
        </h3>
        <p className="text-sm leading-7 max-w-sm mx-auto" style={{ color: "var(--color-text-secondary)" }}>
          The results will be revealed during the celebration. Keep an eye on the board to see what others think!
        </p>
        <BtnLink href={predictionsPageUrl} variant="primary" size="md">
          View predictions board <ChevronRight className="h-4 w-4" />
        </BtnLink>
      </Card>
    );
  }

  const isVoted = currentState.voteState === "voted" || currentState.voteState === "already_voted";

  return (
    <Card className="space-y-6" ref={containerRef}>
      {/* Header + progress indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <SectionLabel>Wedding predictions</SectionLabel>
          <h3 className="font-display text-2xl mt-1" style={{ color: "var(--color-text-primary)" }}>
            What do you think for{" "}
            <span style={{ color: "var(--color-text-muted)" }}>{brideFirst} &amp; {groomFirst}?</span>
          </h3>
        </div>
        
        <div className="flex items-center gap-2" aria-label="Prediction progress">
          {questions.map((_, i) => (
            <button 
              key={i} 
              type="button" 
              onClick={() => setCurrentIndex(i)}
              className="rounded-full transition-all"
              style={{ 
                height: 8, 
                width: i === currentIndex ? 24 : 8, 
                background: i === currentIndex 
                  ? "var(--color-accent)" 
                  : states[i].voteState === "voted" || states[i].voteState === "already_voted" 
                    ? "var(--color-sage)" 
                    : "var(--color-border-medium)" 
              }}
              aria-label={`Go to Question ${i + 1}`}
            />
          ))}
          <span className="ml-1 text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Main Question Area */}
      <div 
        className="rounded-2xl p-6 space-y-5" 
        style={{ background: "var(--color-surface-soft)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-start gap-4">
          <span className="text-4xl" role="img" aria-hidden="true">{current.emoji}</span>
          <p className="font-display text-2xl leading-tight" style={{ color: "var(--color-text-primary)" }}>
            {current.question}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {current.options.map((option) => {
            const isSelected = currentState.selectedAnswer === option.value;
            const isDisabled = currentState.voteState === "submitting" || isVoted;
            
            return (
              <button 
                key={option.value} 
                type="button" 
                disabled={isDisabled} 
                onClick={() => handleVote(option.value)}
                className="flex items-center gap-3 rounded-xl p-4 text-left text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: isVoted && isSelected 
                    ? "rgba(107,142,110,0.1)" 
                    : isVoted ? "var(--color-surface-soft)" : "var(--color-surface)",
                  border: `1.5px solid ${isVoted && isSelected ? "var(--color-sage)" : "var(--color-border-medium)"}`,
                  color: isVoted && isSelected 
                    ? "var(--color-sage)" 
                    : isVoted ? "var(--color-text-muted)" : "var(--color-text-primary)",
                  cursor: isDisabled ? "default" : "pointer",
                }}
              >
                {currentState.voteState === "submitting" && isSelected ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : isVoted && isSelected ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--color-sage)" }} />
                ) : (
                  <span 
                    className="h-4 w-4 shrink-0 rounded-full border-2" 
                    style={{ borderColor: "var(--color-border-medium)" }} 
                  />
                )}
                <span className="font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Messages */}
        <div aria-live="polite">
          {currentState.voteState === "error" && (
            <p className="rounded-xl px-4 py-2.5 text-sm" style={{ background: "#fef2f2", color: "#b91c1c" }}>
              {currentState.errorMessage}
            </p>
          )}
          {currentState.voteState === "already_voted" && (
            <p className="text-xs italic" style={{ color: "var(--color-text-muted)" }}>
              Looks like you&apos;ve already shared your thought on this one!
            </p>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      {isVoted && (
        <div className="flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {currentIndex < questions.length - 1 
              ? "Prediction locked. Next question?" 
              : "You're all caught up!"}
          </p>
          <button 
            type="button" 
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs uppercase font-bold shrink-0 transition-all hover:opacity-90 active:scale-95"
            style={{ 
              letterSpacing: "0.15em", 
              background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))", 
              color: "#fff", 
              boxShadow: "0 4px 12px rgba(184,84,58,0.2)" 
            }}
          >
            {currentIndex < questions.length - 1 ? "Next Prediction" : "View Final Board"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </Card>
  );
}

export default PredictionGame;
