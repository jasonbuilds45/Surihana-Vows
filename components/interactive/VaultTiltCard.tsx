"use client";

/**
 * VaultTiltCard — 2026 Neumorphism 2.0 card
 *
 * Features:
 *  • Multi-layer shadow depth (ambient + key + fill lights)
 *  • Internal lighting that tracks cursor position
 *  • "Rear data" panel that lifts into view on hover — no flip
 *  • Coloured rim glow tied to card accent colour
 *  • OKLCH CSS variables used throughout
 */

import { type ReactNode, useRef, useState } from "react";

interface VaultTiltCardProps {
  children: ReactNode;
  /** Content shown lifting up on hover (rear data panel) */
  rear?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  intensity?: number;
  accentColor?: string;   // OKLCH or hex colour for the rim glow
  dark?: boolean;
  glare?: boolean;
}

export function VaultTiltCard({
  children,
  rear,
  className = "",
  style,
  intensity = 10,
  accentColor,
  dark = false,
  glare = true,
}: VaultTiltCardProps) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rearRef  = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x  = e.clientX - rect.left;
    const y  = e.clientY - rect.top;
    const cx = rect.width  / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -intensity;
    const rotY = ((x - cx) / cx) *  intensity;
    const pctX = (x / rect.width)  * 100;
    const pctY = (y / rect.height) * 100;

    /* 3D tilt */
    card.style.transform = `perspective(1100px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.018, 1.018, 1.018)`;

    /* Internal light source follows cursor */
    if (glare && glareRef.current) {
      const intensity = dark ? 0.09 : 0.20;
      glareRef.current.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255,255,255,${intensity}) 0%, transparent 58%)`;
      glareRef.current.style.opacity = "1";
    }

    /* Rim glow tilts toward light source */
    if (accentColor) {
      card.style.boxShadow = buildShadow({ rotX, rotY, accentColor, dark });
    }
  }

  function handleEnter() {
    setHovered(true);
  }

  function handleLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
    card.style.boxShadow = "";
    setHovered(false);
  }

  return (
    <div
      ref={cardRef}
      className={`${dark ? "neu-card-dark" : "neu-card"} ${className}`}
      style={{
        transition: "transform 0.08s ease, box-shadow 0.35s ease",
        willChange: "transform",
        position: "relative",
        ...style,
      }}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Internal glare layer — moves with cursor */}
      {glare && (
        <div
          ref={glareRef}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 0.15s ease",
            zIndex: 1,
          }}
        />
      )}

      {/* Rim accent glow border */}
      {accentColor && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            zIndex: 0,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
            background: `linear-gradient(135deg, ${accentColor}18 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>

      {/* Rear data panel — lifts into view on hover, no flip */}
      {rear && (
        <div
          ref={rearRef}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            background: dark
              ? `linear-gradient(to top, rgba(14,6,24,0.96) 0%, rgba(14,6,24,0.70) 50%, transparent 100%)`
              : `linear-gradient(to top, rgba(250,247,244,0.97) 0%, rgba(250,247,244,0.72) 50%, transparent 100%)`,
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            zIndex: 3,
            pointerEvents: hovered ? "auto" : "none",
            borderBottomLeftRadius: "inherit",
            borderBottomRightRadius: "inherit",
          }}
        >
          {rear}
        </div>
      )}
    </div>
  );
}

/** Builds directional rim-glow shadow based on tilt angle */
function buildShadow({ rotX, rotY, accentColor, dark }: {
  rotX: number; rotY: number; accentColor: string; dark: boolean;
}): string {
  const dx = rotY * 0.8;  // horizontal shift from Y-rotation
  const dy = -rotX * 0.8; // vertical shift from X-rotation
  const base = dark
    ? `6px 6px 18px rgba(6,3,12,0.70), -4px -4px 12px rgba(40,20,60,0.30)`
    : `8px 8px 20px rgba(180,160,140,0.45), -6px -6px 16px rgba(255,255,255,0.75)`;
  return `${base}, ${dx}px ${dy}px 28px ${accentColor}44, inset 0 1px 0 rgba(255,255,255,${dark ? 0.12 : 0.55})`;
}
