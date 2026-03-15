"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap } from "gsap";

interface Slide { imageUrl: string; title: string; caption?: string; }

export function SlideShow({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const imgRef = useRef<HTMLDivElement | null>(null);
  const active = useMemo(() => slides[index]!, [index, slides]);

  useEffect(() => {
    if (!imgRef.current) return;
    const anim = gsap.fromTo(imgRef.current, { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 0.85, ease: "power3.out" });
    return () => { anim.kill(); };
  }, [index]);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((v) => (v + 1) % slides.length), 5500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const navBtn: React.CSSProperties = {
    background: "rgba(255,250,245,0.88)",
    border: "1px solid rgba(138,90,68,0.15)",
    borderRadius: "9999px",
    padding: "0.5rem",
    backdropFilter: "blur(8px)",
    color: "var(--color-text-secondary)",
    display: "flex",
  };

  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      style={{ border: "1px solid var(--color-border)", boxShadow: "var(--shadow-lg)" }}
    >
      <div ref={imgRef} className="relative" style={{ paddingTop: "56.25%" /* 16:9 */ }}>
        <Image
          src={active.imageUrl}
          alt={active.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(28,25,23,0.72) 0%, rgba(28,25,23,0.1) 40%, transparent 65%)" }}
        />

        {/* Caption */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p style={{ fontSize: "0.55rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(212,179,155,0.85)", marginBottom: 6 }}>
            Gallery
          </p>
          <h3 className="font-display" style={{ fontSize: "clamp(1.125rem, 4vw, 1.75rem)", color: "#fff", letterSpacing: "0.03em", lineHeight: 1.2 }}>
            {active.title}
          </h3>
          {active.caption && (
            <p className="mt-1.5 text-sm" style={{ color: "rgba(245,237,224,0.75)", lineHeight: 1.6 }}>
              {active.caption}
            </p>
          )}
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-4 right-5 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width: i === index ? 18 : 5,
                height: 5,
                background: i === index ? "rgba(255,250,245,0.9)" : "rgba(255,250,245,0.35)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Prev / Next */}
      <div className="absolute inset-y-0 left-3 flex items-center">
        <button type="button" aria-label="Previous" onClick={() => setIndex((v) => (v - 1 + slides.length) % slides.length)} style={navBtn}>
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-3 flex items-center">
        <button type="button" aria-label="Next" onClick={() => setIndex((v) => (v + 1) % slides.length)} style={navBtn}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

export default SlideShow;
