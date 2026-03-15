"use client";

/**
 * CountdownDisplay — animated flip-style countdown.
 * Shows days, hours, minutes, seconds with spring animations.
 */

import { useEffect, useMemo, useState } from "react";

interface CountdownDisplayProps {
  targetDate: string;
  targetTime?: string;
  dark?: boolean;
}

function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  const s = Math.floor(diff / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    past:    false,
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

interface DigitProps { value: number; label: string; dark?: boolean; }

function Digit({ value, label, dark = false }: DigitProps) {
  const [prev, setPrev] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setFlipping(true);
      const t = setTimeout(() => { setPrev(value); setFlipping(false); }, 300);
      return () => clearTimeout(t);
    }
  }, [value, prev]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          width: 64,
          height: 72,
          background: dark
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.95)",
          border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid var(--color-border)",
          boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.25)" : "var(--shadow-md)",
        }}
      >
        {/* Top half */}
        <div
          style={{
            position: "absolute",
            inset: "0 0 50% 0",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 2,
            borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <span
            className="font-display tabular-nums"
            style={{
              fontSize: "1.75rem",
              lineHeight: 1,
              color: dark ? "#ffffff" : "var(--color-text-primary)",
              transform: flipping ? "translateY(-4px)" : "none",
              opacity: flipping ? 0 : 1,
              transition: "transform 0.2s ease, opacity 0.15s ease",
            }}
          >
            {pad(value)}
          </span>
        </div>
        {/* Bottom half */}
        <div
          style={{
            position: "absolute",
            inset: "50% 0 0 0",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 2,
          }}
        >
          <span
            className="font-display tabular-nums"
            style={{
              fontSize: "1.75rem",
              lineHeight: 1,
              color: dark ? "#ffffff" : "var(--color-text-primary)",
              transform: flipping ? "translateY(4px)" : "none",
              opacity: flipping ? 0 : 1,
              transition: "transform 0.2s ease, opacity 0.15s ease",
            }}
          >
            {pad(flipping ? prev : value)}
          </span>
        </div>
        {/* Fold line */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: dark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.08)" }} />
      </div>
      <p
        style={{
          fontSize: "0.55rem",
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: dark ? "rgba(255,255,255,0.45)" : "var(--color-text-muted)",
        }}
      >
        {label}
      </p>
    </div>
  );
}

export function CountdownDisplay({ targetDate, targetTime = "18:30", dark = false }: CountdownDisplayProps) {
  const target = useMemo(() => {
    const [h, m] = targetTime.split(":").map(Number);
    const d = new Date(`${targetDate}T00:00:00`);
    d.setHours(h ?? 18, m ?? 30, 0, 0);
    return d.toISOString();
  }, [targetDate, targetTime]);

  const [time, setTime] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (time.past) return (
    <div
      className="rounded-2xl px-6 py-4 text-center"
      style={{
        background: dark ? "rgba(255,255,255,0.08)" : "var(--color-accent-light)",
        border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(181,82,58,0.25)"}`,
      }}
    >
      <p
        className="font-display text-xl"
        style={{ color: dark ? "var(--color-champagne)" : "var(--color-accent)" }}
      >
        The celebration is live ✦
      </p>
    </div>
  );

  return (
    <div className="flex items-start gap-3 sm:gap-4 justify-center flex-wrap">
      <Digit value={time.days}    label="Days"    dark={dark} />
      <div className="font-display text-4xl mt-3" style={{ color: dark ? "rgba(255,255,255,0.25)" : "var(--color-border-medium)" }}>:</div>
      <Digit value={time.hours}   label="Hours"   dark={dark} />
      <div className="font-display text-4xl mt-3" style={{ color: dark ? "rgba(255,255,255,0.25)" : "var(--color-border-medium)" }}>:</div>
      <Digit value={time.minutes} label="Minutes" dark={dark} />
      <div className="font-display text-4xl mt-3" style={{ color: dark ? "rgba(255,255,255,0.25)" : "var(--color-border-medium)" }}>:</div>
      <Digit value={time.seconds} label="Seconds" dark={dark} />
    </div>
  );
}
