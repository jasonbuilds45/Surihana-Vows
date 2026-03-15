"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";
import type { PhotoRow } from "@/lib/types";
import { ImageTransforms } from "@/lib/storage";

interface LightBoxProps {
  photos: PhotoRow[];
  activeIndex: number;
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function LightBox({
  photos,
  activeIndex,
  open,
  onClose,
  onNext,
  onPrevious,
}: LightBoxProps) {

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrevious();
    }

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onNext, onPrevious]);

  if (!open || !photos[activeIndex]) return null;

  const photo = photos[activeIndex];

  const btnStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(138,90,68,0.18)",
    borderRadius: "9999px",
    padding: "0.7rem",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color: "var(--color-text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{
        background: "rgba(18,8,4,0.94)",
        backdropFilter: "blur(14px)",
      }}
      role="dialog"
      aria-modal
    >

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 flex-shrink-0">

        <div>
          <p
            style={{
              fontSize: "0.55rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(212,179,155,0.8)",
            }}
          >
            {photo.category}
          </p>

          <p
            className="text-sm mt-1"
            style={{ color: "rgba(245,237,224,0.75)" }}
          >
            {photo.uploaded_by}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={btnStyle}
        >
          <X className="h-5 w-5" />
        </button>

      </div>

      {/* Image area */}
      <div className="relative flex-1 mx-6 mb-6 overflow-hidden rounded-3xl">

        <Image
          src={ImageTransforms.large(photo.image_url)}
          alt={photo.category}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />

        {/* Left nav */}
        <button
          type="button"
          onClick={onPrevious}
          aria-label="Previous photo"
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={btnStyle}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Right nav */}
        <button
          type="button"
          onClick={onNext}
          aria-label="Next photo"
          className="absolute right-4 top-1/2 -translate-y-1/2"
          style={btnStyle}
        >
          <ChevronRight className="h-6 w-6" />
        </button>

      </div>

      {/* Photo counter */}
      <div className="flex-shrink-0 pb-6 text-center">

        <p
          style={{
            fontSize: "0.55rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(212,179,155,0.65)",
          }}
        >
          {activeIndex + 1} / {photos.length}
        </p>

      </div>

    </div>
  );
}

export default LightBox;
