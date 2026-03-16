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
  return {
    hours:   Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    isPast:  false,
  };
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
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 12,
          padding: "10px 16px",
          background: "rgba(138,90,68,0.08)",
          border: "1px solid rgba(212,179,155,0.35)",
        }}
      >
        <Clock style={{ width: 14, height: 14, flexShrink: 0, color: "var(--color-accent)" }} />
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: "var(--font-body), sans-serif" }}>
          {label} · Live now
        </p>
      </div>
    );
  }

  const units = [
    { v: time.hours,   l: "hrs" },
    { v: time.minutes, l: "min" },
    { v: time.seconds, l: "sec" },
  ];

  return (
    <div
      style={{
        borderRadius: 16,
        padding: "14px 18px",
        background: "var(--color-surface-muted)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Label row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Clock style={{ width: 12, height: 12, color: "var(--color-accent)", flexShrink: 0 }} />
        <p style={{ fontSize: "0.52rem", letterSpacing: "0.36em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: "var(--font-body), sans-serif", fontWeight: 600 }}>
          {label}
        </p>
      </div>

      {/* Timer row — always single line */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {units.map(({ v, l }, i) => (
          <div key={l} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-display), Georgia, serif",
                  fontSize: "1.25rem",
                  color: "var(--color-accent-soft)",
                  opacity: 0.45,
                  padding: "0 4px",
                  lineHeight: 1,
                  alignSelf: "center",
                  marginBottom: 12,
                }}
              >
                :
              </span>
            )}
            <div style={{ textAlign: "center", minWidth: 38 }}>
              <p
                style={{
                  fontFamily: "var(--font-display), Georgia, serif",
                  fontSize: "1.625rem",
                  fontWeight: 700,
                  lineHeight: 1,
                  color: "var(--color-text-primary)",
                  letterSpacing: "0.02em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {pad(v)}
              </p>
              <p
                style={{
                  fontSize: "0.46rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  marginTop: 3,
                  fontFamily: "var(--font-body), sans-serif",
                  fontWeight: 600,
                }}
              >
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
