"use client";

import { useMemo, useState } from "react";
import type { PhotoRow } from "@/lib/types";
import { LightBox } from "@/components/gallery/LightBox";
import { TiltCard } from "@/components/interactive/TiltCard";

interface PhotoGridProps { photos: PhotoRow[]; }

const DF = "'Cormorant Garamond',Georgia,serif";
const BF = "'Manrope',system-ui,sans-serif";
const ROSE = "#BE2D45";

const CAT_LABELS: Record<string, string> = {
  ceremony:  "Ceremony",
  reception: "Reception",
  family:    "Family",
  candid:    "Candid",
  snap:      "Guest Snaps",
  live:      "Live Feed",
};

function catLabel(cat: string) {
  return CAT_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
}

/* Broken-image placeholder — shown when a URL fails to load */
function ImgWithFallback({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-linen,#F1E9E0)", color: "var(--ink-4,#A88888)", fontSize: ".65rem", fontFamily: BF }}>
        Image unavailable
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
    />
  );
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [activeIndex,       setActiveIndex]       = useState(0);
  const [selectedCategory,  setSelectedCategory]  = useState<string>("all");
  const [open,              setOpen]              = useState(false);

  const categories = useMemo(
    () => ["all", ...new Set(photos.map(p => p.category).filter(Boolean))],
    [photos]
  );

  const filtered = useMemo(
    () => selectedCategory === "all" ? photos : photos.filter(p => p.category === selectedCategory),
    [photos, selectedCategory]
  );

  /* ── Empty state ── */
  if (!photos.length) {
    return (
      <div style={{
        padding: "clamp(3.5rem,9vh,6rem) 1rem",
        textAlign: "center",
        border: "1px dashed rgba(190,45,69,.18)",
        borderRadius: 20,
        background: "rgba(190,45,69,.02)",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(190,45,69,.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.25rem",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="4" stroke={ROSE} strokeWidth="1.5"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill={ROSE} opacity=".6"/>
            <path d="M3 16l5-5 4 4 3-3 6 6" stroke={ROSE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
          </svg>
        </div>
        <p style={{ fontFamily: DF, fontStyle: "italic", fontWeight: 300, fontSize: "clamp(1.1rem,2.5vw,1.5rem)", color: "var(--ink-3,#72504A)", marginBottom: ".625rem" }}>
          The album is being curated.
        </p>
        <p style={{ fontFamily: BF, fontSize: ".78rem", color: "var(--ink-4,#A88888)", lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>
          Guest snaps and professional photos will appear here once approved. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <section>

      {/* ── Category filter pills ── */}
      {categories.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginBottom: "clamp(1.25rem,3vh,2rem)" }}>
          {categories.map(cat => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat} type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 16px", borderRadius: 999,
                  fontSize: ".58rem", fontWeight: 600,
                  letterSpacing: ".16em", textTransform: "uppercase",
                  fontFamily: BF, cursor: "pointer",
                  transition: "all .18s ease",
                  background: active ? ROSE : "var(--bg-warm,#F8F3EE)",
                  border: `1px solid ${active ? ROSE : "var(--bdr,rgba(190,45,69,.10))"}`,
                  color: active ? "#fff" : "var(--ink-3,#72504A)",
                  boxShadow: active ? "0 4px 14px rgba(190,45,69,.22)" : "none",
                }}
              >
                {cat === "all" ? `All (${photos.length})` : `${catLabel(cat)} (${photos.filter(p => p.category === cat).length})`}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filtered empty ── */}
      {filtered.length === 0 && (
        <p style={{ fontFamily: BF, fontSize: ".85rem", color: "var(--ink-4,#A88888)", padding: "2rem 0", textAlign: "center" }}>
          No photos in this category yet.
        </p>
      )}

      {/* ── Grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "clamp(.5rem,1.5vw,.875rem)",
      }}
        className="sm:grid-cols-3 lg:grid-cols-4"
      >
        {filtered.map((photo, index) => (
          <TiltCard key={photo.id}>
            <button
              type="button"
              onClick={() => { setActiveIndex(index); setOpen(true); }}
              style={{
                position: "relative", aspectRatio: "1/1",
                display: "block", width: "100%",
                borderRadius: "clamp(12px,2vw,20px)",
                overflow: "hidden", cursor: "pointer",
                border: "1px solid var(--bdr,rgba(190,45,69,.10))",
                boxShadow: "0 1px 4px rgba(15,10,11,.05)",
                background: "var(--bg-linen,#F1E9E0)",
                transition: "box-shadow .25s ease, transform .25s ease",
              }}
              className="group"
            >
              <ImgWithFallback
                src={photo.image_url}
                alt={`${catLabel(photo.category)} — ${photo.uploaded_by}`}
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  transition: "transform 1.0s ease",
                }}
                className="group-hover:scale-110"
              />

              {/* Hover overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(18,8,4,.78) 0%, transparent 55%)",
                opacity: 0, transition: "opacity .3s ease",
              }}
                className="group-hover:opacity-100"
              />

              {/* Caption on hover */}
              <div style={{
                position: "absolute", inset: "auto 0 0 0",
                padding: "clamp(.5rem,2vw,.875rem)",
                transform: "translateY(6px)", opacity: 0,
                transition: "all .3s ease",
              }}
                className="group-hover:translate-y-0 group-hover:opacity-100"
              >
                <p style={{
                  fontSize: ".48rem", letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: "rgba(255,240,220,.75)", fontFamily: BF,
                  marginBottom: 2,
                }}>
                  {catLabel(photo.category)}
                </p>
                <p style={{
                  fontSize: ".72rem", color: "rgba(255,255,255,.90)",
                  fontFamily: BF, fontWeight: 500,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {photo.uploaded_by}
                </p>
              </div>
            </button>
          </TiltCard>
        ))}
      </div>

      <LightBox
        open={open}
        activeIndex={activeIndex}
        photos={filtered}
        onClose={() => setOpen(false)}
        onNext={() => setActiveIndex(v => (v + 1) % filtered.length)}
        onPrevious={() => setActiveIndex(v => (v - 1 + filtered.length) % filtered.length)}
      />
    </section>
  );
}

export default PhotoGrid;
