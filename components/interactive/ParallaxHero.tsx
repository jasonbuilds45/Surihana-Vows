"use client";

/**
 * ParallaxHero
 *
 * Cinematic full-screen hero section with smooth parallax scrolling.
 * Designed to feel like the opening frame of a luxury wedding film.
 *
 * Improvements:
 * • smoother parallax movement
 * • deeper cinematic overlay
 * • safer animation loop
 * • better mobile visual balance
 */

import { type ReactNode, useEffect, useRef } from "react";

interface ParallaxHeroProps {
  backgroundSrc: string;
  children: ReactNode;
  minHeight?: string;
  speed?: number;
  overlay?: string;
}

export function ParallaxHero({
  backgroundSrc,
  children,
  minHeight = "100vh",
  speed = 0.35,
  overlay = "linear-gradient(to bottom, rgba(18,8,4,0.45) 0%, rgba(18,8,4,0.25) 40%, rgba(10,4,2,0.75) 70%, rgba(8,3,1,0.95) 100%)",
}: ParallaxHeroProps) {

  const bgRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {

    let lastScroll = -1;

    const update = () => {
      const y = window.scrollY;

      if (y !== lastScroll && bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${y * speed}px, 0)`;
        lastScroll = y;
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    return () => cancelAnimationFrame(rafRef.current);

  }, [speed]);

  return (
    <section
      className="relative overflow-hidden flex flex-col"
      style={{ minHeight }}
    >

      {/* Background image */}
      <div
        ref={bgRef}
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage: `url(${backgroundSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          top: "-15%",
          bottom: "-15%",
        }}
      />

      {/* Cinematic overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: overlay,
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col flex-1 justify-center">
        {children}
      </div>

    </section>
  );
}
