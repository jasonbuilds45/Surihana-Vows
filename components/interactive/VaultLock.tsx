"use client";

/**
 * VaultLock — Signature micro-animated vault mechanism
 *
 * States:
 *  locked  → hasp raised, ring spins slowly, faint glow
 *  tapping → hasp shakes, ring accelerates, click haptic
 *  opening → hasp drops, ring flashes, vault opens
 *  open    → hasp down, ring solid, doors animate apart
 */

import { useCallback, useEffect, useRef, useState } from "react";

type LockState = "locked" | "tapping" | "opening" | "open";

interface VaultLockProps {
  initials?: string;
  onOpen: () => void;
  label?: string;
}

export function VaultLock({ initials = "SV", onOpen, label = "Tap to open your invitation" }: VaultLockProps) {
  const [state, setState] = useState<LockState>("locked");
  const [tapCount, setTapCount] = useState(0);
  const ringRef   = useRef<HTMLDivElement>(null);
  const boltRef   = useRef<HTMLDivElement>(null);
  const haspRef   = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Animate ring speed based on state */
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const duration = state === "tapping" ? "0.8s" : state === "opening" ? "0.3s" : "3s";
    ring.style.animationDuration = duration;
  }, [state]);

  const handleTap = useCallback(() => {
    if (state === "open" || state === "opening") return;

    setTapCount((c) => {
      const next = c + 1;
      if (next >= 3) {
        /* Three taps triggers the full opening sequence */
        setState("opening");
        setTimeout(() => {
          setState("open");
          setTimeout(onOpen, 800);
        }, 1200);
      } else {
        setState("tapping");
        /* Brief shake, then return to locked ready state */
        setTimeout(() => setState("locked"), 400);
      }
      return next;
    });
  }, [state, onOpen]);

  /* Ripple effect on click */
  function createRipple(e: React.MouseEvent) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement("div");
    const size = 80;
    ripple.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      border-radius:50%;
      background: radial-gradient(circle, oklch(58% 0.22 10 / 0.35) 0%, transparent 70%);
      animation: rippleOut 0.6s ease-out forwards;
      pointer-events:none;
      z-index:10;
    `;
    el.style.position = "relative";
    el.style.overflow = "hidden";
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  return (
    <>
      <style>{`
        @keyframes rippleOut {
          from { transform: scale(0); opacity: 1; }
          to   { transform: scale(3); opacity: 0; }
        }
        @keyframes boltBounce {
          0%,100% { transform: translateY(0); }
          25%     { transform: translateY(-4px); }
          75%     { transform: translateY(2px); }
        }
        @keyframes haspShake {
          0%,100% { transform: translateX(0) rotate(0); }
          25%     { transform: translateX(-3px) rotate(-2deg); }
          75%     { transform: translateX(3px) rotate(2deg); }
        }
        @keyframes haspDrop {
          0%   { transform: translateY(-20px) rotate(-15deg); opacity: 0; }
          60%  { transform: translateY(4px) rotate(2deg); }
          100% { transform: translateY(0) rotate(0); opacity: 1; }
        }
        @keyframes lockGlowPulse {
          0%,100% { box-shadow: 6px 6px 18px oklch(6% 0.015 290 / 0.70), -4px -4px 12px oklch(30% 0.035 295 / 0.30), inset 0 1px 0 oklch(40% 0.035 295 / 0.30); }
          50%     { box-shadow: 6px 6px 18px oklch(6% 0.015 290 / 0.70), -4px -4px 12px oklch(30% 0.035 295 / 0.30), 0 0 32px oklch(58% 0.22 10 / 0.35), inset 0 1px 0 oklch(40% 0.035 295 / 0.30); }
        }
      `}</style>

      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
          cursor: state === "open" ? "default" : "pointer",
          userSelect: "none",
        }}
        onClick={(e) => { createRipple(e); handleTap(); }}
      >
        {/* Lock body */}
        <div
          style={{
            position: "relative",
            width: 96,
            height: 96,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Spinning gradient ring */}
          <div
            ref={ringRef}
            className="vault-lock-ring"
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "2.5px solid transparent",
              background: "linear-gradient(in oklch, var(--c-primary), var(--c-violet), var(--c-gold), var(--c-primary)) border-box",
              mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              animationName: "vaultRingSpin",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationDuration: "3s",
              transition: "animation-duration 0.5s ease",
            }}
          />

          {/* Hasp / shackle */}
          <div
            ref={haspRef}
            style={{
              width: 36,
              height: 24,
              borderRadius: "18px 18px 0 0",
              border: "4px solid",
              borderColor: state === "open"
                ? "oklch(72% 0.15 75)"
                : "oklch(60% 0.025 290)",
              borderBottom: "none",
              marginBottom: -2,
              animation: state === "tapping"
                ? "haspShake 0.3s ease-in-out"
                : state === "opening"
                  ? "haspDrop 1.0s var(--ease-spring) forwards"
                  : "none",
              transition: "border-color 0.4s ease",
              position: "relative",
              zIndex: 1,
            }}
          />

          {/* Lock body disc */}
          <div
            style={{
              width: 80,
              height: 68,
              borderRadius: 16,
              background: state === "open"
                ? "linear-gradient(145deg, oklch(22% 0.035 300), oklch(30% 0.040 295))"
                : "linear-gradient(145deg, var(--c-dark-surface), var(--c-dark-1))",
              boxShadow: state === "opening" || state === "open"
                ? `6px 6px 18px oklch(6% 0.015 290 / 0.70), -4px -4px 12px oklch(30% 0.035 295 / 0.30), 0 0 40px oklch(72% 0.15 75 / 0.40), inset 0 1px 0 oklch(40% 0.035 295 / 0.30)`
                : `6px 6px 18px oklch(6% 0.015 290 / 0.70), -4px -4px 12px oklch(30% 0.035 295 / 0.30), inset 0 1px 0 oklch(40% 0.035 295 / 0.30)`,
              display: "grid",
              placeItems: "center",
              position: "relative",
              overflow: "hidden",
              transition: "background 0.5s ease, box-shadow 0.5s ease",
              animation: state === "locked" ? "lockGlowPulse 4s ease-in-out infinite" : "none",
            }}
          >
            {/* Keyhole / bolt */}
            <div ref={boltRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: state === "open"
                    ? "linear-gradient(135deg, oklch(72% 0.15 75), oklch(84% 0.13 85))"
                    : "oklch(55% 0.030 290)",
                  animation: state === "tapping" ? "boltBounce 0.3s ease-in-out" : "none",
                  transition: "background 0.4s ease",
                  boxShadow: state === "open" ? "0 0 12px oklch(72% 0.15 75 / 0.60)" : "none",
                }}
              />
              <div
                style={{
                  width: 8,
                  height: 14,
                  borderRadius: "0 0 4px 4px",
                  background: state === "open"
                    ? "linear-gradient(180deg, oklch(72% 0.15 75), oklch(62% 0.12 70))"
                    : "oklch(55% 0.030 290)",
                  transition: "background 0.4s ease, height 0.3s ease",
                  height: state === "opening" || state === "open" ? 20 : 14,
                }}
              />
            </div>

            {/* Initials watermark */}
            <div
              style={{
                position: "absolute",
                bottom: 6,
                fontSize: "0.6rem",
                fontFamily: "var(--font-display), serif",
                letterSpacing: "0.08em",
                color: state === "open" ? "oklch(72% 0.15 75 / 0.80)" : "oklch(45% 0.028 290 / 0.70)",
                transition: "color 0.4s ease",
              }}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: tapCount > i
                  ? "linear-gradient(in oklch, var(--c-primary), var(--c-gold))"
                  : "oklch(75% 0.020 290 / 0.40)",
                transition: "background 0.3s ease",
                boxShadow: tapCount > i ? `0 0 8px var(--c-primary-glow)` : "none",
              }}
            />
          ))}
        </div>

        {/* Label */}
        {state !== "open" && (
          <p
            style={{
              fontSize: "0.625rem",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: state === "opening"
                ? "oklch(72% 0.15 75)"
                : "var(--c-ink-3)",
              fontWeight: 700,
              transition: "color 0.4s ease",
              fontFamily: "var(--font-body), sans-serif",
            }}
          >
            {state === "opening" ? "Opening vault…" : label}
          </p>
        )}
      </div>
    </>
  );
}
