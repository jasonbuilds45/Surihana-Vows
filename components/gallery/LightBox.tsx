"use client";

import { ChevronLeft, ChevronRight, X, Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { PhotoRow } from "@/lib/types";

interface LightBoxProps {
  photos: PhotoRow[];
  activeIndex: number;
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const BF = "'Manrope',system-ui,sans-serif";
const DF = "'Cormorant Garamond',Georgia,serif";

const CAT_LABELS: Record<string, string> = {
  ceremony: "Ceremony", reception: "Reception", family: "Family",
  candid: "Candid", snap: "Guest Snaps", live: "Live Feed",
};

export function LightBox({ photos, activeIndex, open, onClose, onNext, onPrevious }: LightBoxProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError,  setImgError]  = useState(false);

  // Reset load state whenever the photo changes
  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [activeIndex]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape")     onClose();
    if (e.key === "ArrowRight") onNext();
    if (e.key === "ArrowLeft")  onPrevious();
  }, [onClose, onNext, onPrevious]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handleKey]);

  if (!open || !photos[activeIndex]) return null;
  const photo = photos[activeIndex]!;
  const catLabel = CAT_LABELS[photo.category] ?? photo.category;

  const btnStyle: React.CSSProperties = {
    background: "rgba(255,255,255,.92)",
    border: "1px solid rgba(138,90,68,.18)",
    borderRadius: "9999px",
    padding: ".625rem",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color: "#3D1F26",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all .18s ease",
    flexShrink: 0,
  };

  return (
    <>
      <style>{`@keyframes lbSpin{to{transform:rotate(360deg)}}`}</style>
      <div
        role="dialog" aria-modal aria-label="Photo viewer"
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          display: "flex", flexDirection: "column",
          background: "rgba(10,5,8,.96)",
          backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
        }}
      >
        {/* ── Top bar ── */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "clamp(1rem,2.5vh,1.5rem) clamp(1rem,3vw,2rem)",
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontFamily: BF, fontSize: ".48rem", letterSpacing: ".32em", textTransform: "uppercase", color: "rgba(212,184,150,.72)", marginBottom: 4 }}>
              {catLabel}
            </p>
            <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: "clamp(.9rem,2vw,1.1rem)", color: "rgba(245,237,224,.80)" }}>
              {photo.uploaded_by}
            </p>
          </div>

          <div style={{ display: "flex", gap: ".5rem" }}>
            {/* Download */}
            <a href={photo.image_url} download target="_blank" rel="noreferrer"
              title="Download full resolution"
              style={{ ...btnStyle, textDecoration: "none" }}>
              <Download size={16} />
            </a>
            {/* Close */}
            <button type="button" onClick={onClose} aria-label="Close lightbox" style={btnStyle}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Image area ── */}
        <div style={{
          flex: 1, position: "relative",
          margin: "0 clamp(.75rem,3vw,1.5rem)",
          borderRadius: "clamp(12px,2vw,24px)",
          overflow: "hidden",
          background: "rgba(255,255,255,.03)",
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: 0,
        }}>
          {/* Loading spinner */}
          {!imgLoaded && !imgError && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden
                style={{ opacity: .4, animation: "lbSpin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" stroke="rgba(212,184,150,.6)" strokeWidth="2" strokeDasharray="40 20" />
              </svg>
            </div>
          )}

          {/* Error state */}
          {imgError && (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,.35)", fontFamily: BF, fontSize: ".8rem" }}>
              <p>Image unavailable</p>
            </div>
          )}

          {/* Photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={photo.id}
            src={photo.image_url}
            alt={`${catLabel} — ${photo.uploaded_by}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
            style={{
              maxWidth: "100%", maxHeight: "100%",
              width: "auto", height: "auto",
              objectFit: "contain",
              display: "block",
              opacity: imgLoaded && !imgError ? 1 : 0,
              transition: "opacity .35s ease",
              borderRadius: "inherit",
            }}
          />

          {/* Prev button */}
          {photos.length > 1 && (
            <button type="button" onClick={onPrevious} aria-label="Previous photo" style={{
              ...btnStyle,
              position: "absolute", left: "clamp(.625rem,2vw,1.25rem)", top: "50%",
              transform: "translateY(-50%)",
            }}>
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Next button */}
          {photos.length > 1 && (
            <button type="button" onClick={onNext} aria-label="Next photo" style={{
              ...btnStyle,
              position: "absolute", right: "clamp(.625rem,2vw,1.25rem)", top: "50%",
              transform: "translateY(-50%)",
            }}>
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* ── Counter + thumbnail strip ── */}
        <div style={{
          flexShrink: 0,
          padding: "clamp(.75rem,2vh,1.25rem) clamp(1rem,3vw,2rem)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: ".625rem",
        }}>
          <p style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".32em", textTransform: "uppercase", color: "rgba(212,184,150,.55)" }}>
            {activeIndex + 1} / {photos.length}
          </p>

          {/* Thumbnail strip — clicking jumps directly to that photo */}
          {photos.length > 1 && (
            <div style={{
              display: "flex", gap: ".375rem",
              maxWidth: "100%", overflowX: "auto",
              paddingBottom: ".25rem",
            }}>
              {photos.map((p, i) => {
                const isActive = i === activeIndex;
                const diff = i - activeIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (diff === 0) return;
                      setImgLoaded(false);
                      setImgError(false);
                      // Navigate step-by-step to reach the target index
                      // PhotoGrid controls activeIndex via onNext/onPrevious
                      if (diff > 0) { for (let j = 0; j < diff; j++) onNext(); }
                      else          { for (let j = 0; j < -diff; j++) onPrevious(); }
                    }}
                    aria-label={`Go to photo ${i + 1}`}
                    aria-current={isActive ? "true" : undefined}
                    style={{
                      width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                      overflow: "hidden", cursor: isActive ? "default" : "pointer",
                      padding: 0, border: "none",
                      outline: isActive ? "2px solid rgba(190,45,69,.80)" : "2px solid transparent",
                      outlineOffset: 1,
                      opacity: isActive ? 1 : 0.42,
                      transition: "all .18s ease",
                      background: "rgba(255,255,255,.06)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url} alt="" aria-hidden
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LightBox;
