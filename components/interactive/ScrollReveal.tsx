"use client";

/**
 * ScrollReveal — wraps children and reveals on scroll using IntersectionObserver.
 * Zero dependencies beyond React.
 */

import { type ReactNode, useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "up" | "scale" | "left" | "right" | "fade";
  once?: boolean;
  threshold?: number;
}

const VARIANTS = {
  up:    "translateY(32px)",
  scale: "scale(0.93) translateY(16px)",
  left:  "translateX(-36px)",
  right: "translateX(36px)",
  fade:  "translateY(0px)",
};

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  once = true,
  threshold = 0.12,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const delays = [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8];

    // Set initial hidden state
    el.style.opacity = "0";
    el.style.transform = VARIANTS[variant];
    el.style.transition = `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delays[delay]}s, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delays[delay]}s`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "none";
            if (once) observer.unobserve(el);
          } else if (!once) {
            el.style.opacity = "0";
            el.style.transform = VARIANTS[variant];
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, variant, once, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
