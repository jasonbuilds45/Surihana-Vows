"use client";

import type { RitualItem } from "@/lib/types";

interface RitualGuideProps {
  rituals: RitualItem[];
  brideName: string;
  groomName: string;
}

const DF = "'Cormorant Garamond',var(--font-display),Georgia,serif";
const BF = "'Manrope',var(--font-body),system-ui,sans-serif";
const ROSE = "var(--rose,#BE2D45)";
const GOLD = "var(--gold,#A87808)";

export function RitualGuide({ rituals, brideName, groomName }: RitualGuideProps) {
  if (!rituals?.length) return null;
  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];

  return (
    <section>

      {/* ── Section header ── */}
      <div style={{ marginBottom: "clamp(1.75rem,4vh,2.5rem)" }}>
        <p style={{
          fontFamily: BF, fontSize: ".52rem", letterSpacing: ".42em",
          textTransform: "uppercase", color: ROSE,
          fontWeight: 700, marginBottom: ".5rem",
        }}>
          Ceremony guide
        </p>
        <h2 style={{
          fontFamily: DF, fontWeight: 300,
          fontSize: "clamp(1.75rem,4vw,2.75rem)",
          color: "var(--ink,#120B0E)",
          lineHeight: 1.05, letterSpacing: "-.02em",
          marginBottom: ".625rem",
        }}>
          The rituals that unite them.
        </h2>
        <p style={{
          fontFamily: BF, fontSize: ".875rem",
          color: "var(--ink-3,#72504A)",
          lineHeight: 1.72, maxWidth: "38rem",
        }}>
          {brideFirst} and {groomFirst}&apos;s wedding follows Christian tradition.
          A brief guide to help you follow along and appreciate each sacred moment.
        </p>
      </div>

      {/* ── Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))",
        gap: "1rem",
      }}>
        {rituals.map((ritual, i) => {
          // Alternate rose / gold accent per card
          const accentColor  = i % 2 === 0 ? ROSE : GOLD;
          const accentRaw    = i % 2 === 0 ? "#BE2D45" : "#A87808";
          const accentPale   = i % 2 === 0 ? "var(--rose-pale,#FBEBEE)" : "var(--gold-pale,#FBF2DC)";
          const accentBorder = i % 2 === 0
            ? "rgba(190,45,69,.18)"
            : "rgba(168,120,8,.20)";

          return (
            <article key={ritual.title} style={{
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid rgba(190,45,69,.08)",
              boxShadow: "0 2px 12px rgba(15,10,11,.05), 0 1px 3px rgba(15,10,11,.03)",
              background: "var(--bg,#FDFAF7)",
              display: "flex",
              flexDirection: "column",
              transition: "box-shadow .20s ease, transform .20s ease",
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                if (window.matchMedia("(hover:hover)").matches) {
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow = "0 6px 24px rgba(15,10,11,.08), 0 2px 6px rgba(15,10,11,.04)";
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "";
                el.style.boxShadow = "0 2px 12px rgba(15,10,11,.05), 0 1px 3px rgba(15,10,11,.03)";
              }}
            >
              {/* Accent top stripe */}
              <div style={{
                height: 3,
                background: `linear-gradient(90deg,${accentRaw},transparent)`,
              }} />

              {/* Card body */}
              <div style={{ padding: "1.375rem 1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>

                {/* Step number + emoji */}
                <div style={{ display: "flex", alignItems: "center", gap: ".875rem" }}>
                  {/* Step badge */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: accentPale,
                    border: `1px solid ${accentBorder}`,
                    fontFamily: BF, fontSize: ".58rem", fontWeight: 800,
                    color: accentColor, letterSpacing: ".04em",
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Emoji */}
                  {ritual.emoji && (
                    <span style={{ fontSize: "1.5rem", lineHeight: 1 }} aria-hidden>
                      {ritual.emoji}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: DF, fontWeight: 600,
                  fontSize: "clamp(1.1rem,2.5vw,1.3rem)",
                  color: "var(--ink,#120B0E)",
                  lineHeight: 1.15,
                }}>
                  {ritual.title}
                </h3>

                {/* Hairline */}
                <div style={{
                  height: 1, width: "min(48px,30%)",
                  background: `linear-gradient(to right,${accentRaw},transparent)`,
                }} />

                {/* Description */}
                <p style={{
                  fontFamily: BF, fontSize: ".84rem",
                  color: "var(--ink-3,#72504A)",
                  lineHeight: 1.75, flex: 1,
                }}>
                  {ritual.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RitualGuide;
