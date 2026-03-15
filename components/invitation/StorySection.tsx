"use client";

import Image from "next/image";
import type { StoryBeat } from "@/lib/types";
import { ScrollReveal } from "@/components/interactive/ScrollReveal";

interface StorySectionProps {
  story: StoryBeat[];
  quote?: string;
}

export function StorySection({ story, quote }: StorySectionProps) {
  return (
    <section className="space-y-16">

      {/* Section header */}
      <div className="space-y-5 max-w-3xl">

        <p
          style={{
            fontSize: "0.6rem",
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            fontWeight: 600,
          }}
        >
          Our story
        </p>

        <h2
          className="font-display"
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            color: "var(--color-text-primary)",
            lineHeight: 1.15,
          }}
        >
          A love story told in quiet moments and brave timing.
        </h2>

        {quote && (
          <p
            className="text-lg leading-9 italic max-w-2xl"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-display), serif",
            }}
          >
            &ldquo;{quote}&rdquo;
          </p>
        )}
      </div>

      {/* Story grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

        {story.map((beat, i) => (
          <ScrollReveal
            key={`${beat.year}-${beat.title}`}
            variant="scale"
            delay={(Math.min(i + 1, 6)) as 1 | 2 | 3 | 4 | 5 | 6}
          >

            <article
              className="group overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-2"
              style={{
                background: "#ffffff",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {/* Image */}
              {beat.imageUrl && (
                <div className="relative h-60 overflow-hidden">

                  <Image
                    src={beat.imageUrl}
                    alt={beat.title}
                    fill
                    className="object-cover transition-transform duration-[900ms] group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Soft overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(18,8,4,0.65) 0%, transparent 55%)",
                    }}
                  />

                  {/* Year badge */}
                  <div
                    className="absolute bottom-4 left-4 rounded-full px-4 py-1.5"
                    style={{
                      background: "rgba(18,8,4,0.65)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.55rem",
                        letterSpacing: "0.35em",
                        textTransform: "uppercase",
                        color: "rgba(232,212,168,0.95)",
                      }}
                    >
                      {beat.year}
                    </p>
                  </div>

                </div>
              )}

              {/* Text content */}
              <div className="p-6 space-y-3">

                {!beat.imageUrl && (
                  <p
                    style={{
                      fontSize: "0.6rem",
                      letterSpacing: "0.38em",
                      textTransform: "uppercase",
                      color: "var(--color-accent)",
                      fontWeight: 600,
                    }}
                  >
                    {beat.year}
                  </p>
                )}

                <h3
                  className="font-display"
                  style={{
                    fontSize: "1.35rem",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {beat.title}
                </h3>

                <p
                  className="text-sm leading-7"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {beat.description}
                </p>

              </div>

            </article>

          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

export default StorySection;
