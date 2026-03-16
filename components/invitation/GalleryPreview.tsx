"use client";

/**
 * GalleryPreview — Step 5
 * Shows the latest 6 approved photos on the invite page with a "View Full Gallery" CTA.
 * Lazy loads photos only when in viewport.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Images, ArrowRight } from "lucide-react";
import type { PhotoRow } from "@/lib/types";

interface GalleryPreviewProps {
  photos: PhotoRow[];
}

const BF = "var(--font-body), system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";

export function GalleryPreview({ photos }: GalleryPreviewProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const preview = photos.slice(0, 6);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (preview.length === 0) return null;

  return (
    <section
      ref={ref}
      style={{ background: "var(--color-surface-muted)", borderTop: "1px solid var(--color-border)", padding: "4rem clamp(1.25rem,5vw,4rem)" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", marginBottom: "1.75rem" }}>
          <div>
            <p style={{ fontSize: ".58rem", letterSpacing: ".42em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: BF, marginBottom: ".375rem" }}>
              Photo gallery
            </p>
            <h2 style={{ fontFamily: DF, fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", color: "var(--color-text-primary)", lineHeight: 1.15 }}>
              Moments captured.
            </h2>
          </div>
          <Link
            href="/gallery"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 999, background: "var(--color-accent)", color: "#fff", fontSize: ".78rem", fontWeight: 700, fontFamily: BF, letterSpacing: ".12em", textTransform: "uppercase", textDecoration: "none" }}
          >
            View full gallery <ArrowRight size={13} />
          </Link>
        </div>

        {/* Photo grid */}
        {visible ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: ".75rem" }}>
            {preview.map(photo => (
              <Link href="/gallery" key={photo.id} style={{ display: "block", aspectRatio: "1", borderRadius: 14, overflow: "hidden", position: "relative", background: "var(--color-surface-soft)", textDecoration: "none" }}>
                <Image
                  src={photo.image_url}
                  alt={photo.uploaded_by}
                  fill
                  className="object-cover"
                  sizes="(max-width:640px) 50vw, 180px"
                  style={{ transition: "transform .4s ease" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,16,18,.4) 0%, transparent 50%)", opacity: 0, transition: "opacity .2s" }} />
              </Link>
            ))}
          </div>
        ) : (
          // Skeleton while not in viewport
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: ".75rem" }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ aspectRatio: "1", borderRadius: 14, background: "var(--color-surface-soft)", animation: "shimmer 1.5s infinite" }} />
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link
            href="/gallery"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-accent)", fontSize: ".875rem", fontFamily: BF, textDecoration: "underline", textUnderlineOffset: 4 }}
          >
            <Images size={14} /> See all {photos.length} photos
          </Link>
        </div>
      </div>

      <style>{`@keyframes shimmer{0%,100%{opacity:.6}50%{opacity:1}}`}</style>
    </section>
  );
}

export default GalleryPreview;
