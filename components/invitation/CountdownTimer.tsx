"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  target: string;
  label?: string;
}

function calc(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, isPast: true };
  const total = Math.floor(diff / 1000);
  return { hours: Math.floor(total / 3600), minutes: Math.floor((total % 3600) / 60), seconds: total % 60, isPast: false };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export function CountdownTimer({ target, label = "Until ceremony" }: CountdownTimerProps) {
  const [time, setTime] = useState(() => calc(target));
  useEffect(() => {
    const id = setInterval(() => setTime(calc(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (time.isPast) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl px-4 py-2.5"
        style={{ background: "rgba(138,90,68,0.08)", border: "1px solid rgba(212,179,155,0.35)" }}
      >
        <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-accent)" }} />
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--color-accent)" }}>
          {label} · Celebration is live
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl px-4 py-3 space-y-2"
      style={{ background: "var(--color-surface-muted)", border: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center gap-1.5">
        <Clock className="h-3 w-3" style={{ color: "var(--color-accent)" }} />
        <p style={{ fontSize: "0.55rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "var(--color-accent)" }}>
          {label}
        </p>
      </div>
      <div className="flex items-end gap-2">
        {[
          { v: time.hours,   l: "hrs" },
          { v: time.minutes, l: "min" },
          { v: time.seconds, l: "sec" },
        ].map(({ v, l }, i) => (
          <div key={l} className="flex items-end gap-2">
            {i > 0 && (
              <span className="pb-3 text-lg font-display" style={{ color: "var(--color-accent-soft)", opacity: 0.5 }}>:</span>
            )}
            <div className="text-center">
              <p className="font-display text-2xl tabular-nums" style={{ color: "var(--color-text-primary)", letterSpacing: "0.02em" }}>
                {pad(v)}
              </p>
              <p style={{ fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--color-text-muted)", marginTop: 2 }}>
                {l}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CountdownTimer;
