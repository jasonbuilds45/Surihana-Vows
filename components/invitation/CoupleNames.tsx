"use client";

import { useEffect, useRef } from "react";
import { animateCoupleNames } from "@/animations/elegant/nameAnimation";

interface CoupleNamesProps {
  brideName: string;
  groomName: string;
  className?: string;
}

export function CoupleNames({ brideName, groomName, className }: CoupleNamesProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const anim = animateCoupleNames(ref.current);
    return () => anim?.kill();
  }, []);

  return (
    <h1
      ref={ref}
      className={className}
      style={{
        fontFamily: "var(--font-display), serif",
        fontSize: "clamp(2rem, 9vw, 3.5rem)",
        letterSpacing: "0.05em",
        lineHeight: 1.15,
        color: "var(--color-text-primary)",
      }}
    >
      {brideName}
      <span
        style={{ color: "var(--color-accent-soft)", margin: "0 0.35em", fontSize: "0.75em" }}
      >
        &amp;
      </span>
      {groomName}
    </h1>
  );
}

export default CoupleNames;
