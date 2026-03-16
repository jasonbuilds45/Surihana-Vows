"use client";

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

interface UnitProps {
  value: number;
  label: string;
  dark?: boolean;
}

function Unit({ value, label, dark = false }: UnitProps) {
  const [displayed, setDisplayed] = useState(value);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayed) {
      setAnimating(true);
      const t = setTimeout(() => {
        setDisplayed(value);
        setAnimating(false);
      }, 260);
      return () => clearTimeout(t);
    }
  }, [value, displayed]);

  const textColor  = dark ? "#ffffff"                  : "var(--color-text-primary)";
  const labelColor = dark ? "rgba(255,255,255,0.40)"   : "var(--color-text-muted)";
  const cardBg     = dark ? "rgba(255,255,255,0.07)"   : "rgba(255,255,255,0.95)";
  const cardBorder = dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid var(--color-border)";
  const foldLine   = dark ? "rgba(0,0,0,0.28)"         : "rgba(0,0,0,0.07)";
  const shadow     = dark ? "0 4px 20px rgba(0,0,0,0.22)" : "0 2px 12px rgba(0,0,0,0.08)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: "1 1 0" }}>
      {/* Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 68,
          height: 68,
          borderRadius: 14,
          background: cardBg,
          border: cardBorder,
          boxShadow: shadow,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Number */}
        <span
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "clamp(1.35rem, 4vw, 1.75rem)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "0.02em",
            color: textColor,
            transition: animating
              ? "transform 0.13s ease-in, opacity 0.13s ease-in"
              : "transform 0.13s ease-out, opacity 0.13s ease-out",
            transform: animating ? "translateY(-6px)" : "translateY(0)",
            opacity: animating ? 0 : 1,
            userSelect: "none",
          }}
        >
          {pad(displayed)}
        </span>

        {/* Fold line */}
        <div
          style={{
            position: "absolute",
            left: 0, right: 0,
            top: "50%",
            height: 1,
            background: foldLine,
            pointerEvents: "none",
          }}
        />

        {/* Subtle top shine */}
        {!dark && (
          <div
            style={{
              position: "absolute",
              inset: "0 0 50% 0",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.60), transparent)",
              pointerEvents: "none",
              borderRadius: "14px 14px 0 0",
            }}
          />
        )}
      </div>

      {/* Label */}
      <p
        style={{
          fontSize: "0.50rem",
          letterSpacing: "0.30em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: labelColor,
          fontFamily: "var(--font-body), system-ui, sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function Separator({ dark = false }: { dark?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        paddingBottom: 24, // align with card centre, offset for label height
        flexShrink: 0,
      }}
    >
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: dark ? "rgba(255,255,255,0.22)" : "var(--color-border-medium)" }} />
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: dark ? "rgba(255,255,255,0.22)" : "var(--color-border-medium)" }} />
    </div>
  );
}

export function CountdownDisplay({
  targetDate,
  targetTime = "18:30",
  dark = false,
}: CountdownDisplayProps) {
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

  if (time.past) {
    return (
      <div
        style={{
          borderRadius: 14,
          padding: "12px 20px",
          textAlign: "center",
          background: dark ? "rgba(255,255,255,0.07)" : "var(--color-accent-light)",
          border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : "rgba(181,82,58,0.20)"}`,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "1rem",
            color: dark ? "var(--color-champagne)" : "var(--color-accent)",
          }}
        >
          The celebration is live ✦
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "clamp(4px, 1.5vw, 10px)",
        width: "100%",
      }}
    >
      <Unit value={time.days}    label="Days"    dark={dark} />
      <Separator dark={dark} />
      <Unit value={time.hours}   label="Hours"   dark={dark} />
      <Separator dark={dark} />
      <Unit value={time.minutes} label="Mins"    dark={dark} />
      <Separator dark={dark} />
      <Unit value={time.seconds} label="Secs"    dark={dark} />
    </div>
  );
}

export default CountdownDisplay;
