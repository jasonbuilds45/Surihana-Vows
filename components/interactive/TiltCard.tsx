"use client";

/**
 * TiltCard — Apple TV / Framer-style 3D tilt on hover.
 * Uses CSS perspective + JS mouse tracking.
 * Pure CSS fallback for mobile (no tilt, standard card).
 */

import { type ReactNode, useRef } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  intensity?: number; // default 12 degrees max tilt
  glare?: boolean;
  dark?: boolean;
}

export function TiltCard({
  children,
  className = "",
  style,
  intensity = 12,
  glare = true,
  dark = false,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -intensity;
    const rotY = ((x - cx) / cx) * intensity;

    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;

    if (glare && glareRef.current) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${dark ? 0.07 : 0.18}) 0%, transparent 60%)`;
      glareRef.current.style.opacity = "1";
    }
  }

  function handleLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    if (glareRef.current) glareRef.current.style.opacity = "0";
  }

  return (
    <div
      ref={cardRef}
      className={`luxury-card ${className}`}
      style={{
        transition: "transform 0.1s ease, box-shadow 0.3s ease",
        willChange: "transform",
        background: dark
          ? "linear-gradient(135deg, var(--color-surface-dark) 0%, #2a1208 100%)"
          : "#ffffff",
        border: dark ? "none" : "1px solid var(--color-border)",
        boxShadow: dark ? "var(--shadow-2xl)" : "var(--shadow-md)",
        ...style,
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* Glare layer */}
      {glare && (
        <div
          ref={glareRef}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 0.2s",
            zIndex: 1,
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
