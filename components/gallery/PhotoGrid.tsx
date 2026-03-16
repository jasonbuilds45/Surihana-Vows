"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { PhotoRow } from "@/lib/types";
import { ImageTransforms } from "@/lib/storage";
import { LightBox } from "@/components/gallery/LightBox";
import { TiltCard } from "@/components/interactive/TiltCard";

interface PhotoGridProps {
  photos: PhotoRow[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const categories = useMemo(
    () => ["all", ...new Set(photos.map((p) => p.category))],
    [photos]
  );

  const filtered = useMemo(
    () =>
      selectedCategory === "all"
        ? photos
        : photos.filter((p) => p.category === selectedCategory),
    [photos, selectedCategory]
  );

  if (!photos.length) return null;

  return (
    <section className="space-y-8">

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = selectedCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className="rounded-full px-4 py-2 text-xs uppercase transition-all duration-200"
              style={{
                letterSpacing: "0.18em",
                background: active
                  ? "var(--color-accent)"
                  : "var(--color-surface)",
                border: `1px solid ${
                  active ? "var(--color-accent)" : "var(--color-border)"
                }`,
                color: active ? "#fff" : "var(--color-text-secondary)",
                boxShadow: active
                  ? "0 6px 18px rgba(138,90,68,0.25)"
                  : "var(--shadow-xs)",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

        {filtered.map((photo, index) => (
          <TiltCard key={photo.id}>

            <button
              type="button"
              onClick={() => {
                setActiveIndex(index);
                setOpen(true);
              }}
              className="group relative aspect-square overflow-hidden rounded-2xl transition-all duration-500"
              style={{
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <Image
                alt={`${photo.category} by ${photo.uploaded_by}`}
                src={ImageTransforms.gridThumb(photo.image_url)}
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Soft gradient overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{
                  background:
                    "linear-gradient(to top, rgba(18,8,4,0.75) 0%, transparent 60%)",
                }}
              />

              {/* Photographer / uploader */}
              <div className="absolute inset-x-0 bottom-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                <p
                  className="truncate"
                  style={{
                    fontSize: "0.55rem",
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "rgba(255,240,220,0.9)",
                  }}
                >
                  {photo.uploaded_by}
                </p>
              </div>

            </button>

          </TiltCard>
        ))}

      </div>

      <LightBox
        activeIndex={activeIndex}
        onClose={() => setOpen(false)}
        onNext={() => setActiveIndex((v) => (v + 1) % filtered.length)}
        onPrevious={() =>
          setActiveIndex((v) => (v - 1 + filtered.length) % filtered.length)
        }
        open={open}
        photos={filtered}
      />
    </section>
  );
}

export default PhotoGrid;
