import type { ReactNode } from "react";

/**
 * LuxuryPageHero — unified rich maroon editorial header
 *
 * Used across all public pages: Story, Events, Gallery, Travel,
 * Guestbook, Predictions.
 *
 * Visual language:
 *   — Rich maroon rose gradient base (the guestbook colour)
 *   — Layered radial light blooms for depth
 *   — Subtle noise grain for texture
 *   — Gold→rose accent stripe at the very top
 *   — Large decorative letterform watermark (faint, right-aligned)
 *   — Eyebrow: small white uppercase label
 *   — Headline: large display serif, pure white, light weight
 *   — Subline: italic serif, soft white
 *   — Optional right aside slot (stat card, reveal date, etc.)
 *   — Optional below slot (boarding pass, stat chips, etc.)
 */

const DF = "'Cormorant Garamond',var(--font-display),Georgia,serif";
const BF = "'Manrope',var(--font-body),system-ui,sans-serif";

interface LuxuryPageHeroProps {
  eyebrow:   string;
  title:     ReactNode;
  subtitle?: string;
  /** Single capital letter shown as a faint background ornament */
  letter?:   string;
  /** Optional card/widget rendered to the right on desktop */
  aside?:    ReactNode;
  /** Extra content below the headline block (e.g. stat chips) */
  below?:    ReactNode;
}

export function LuxuryPageHero({
  eyebrow, title, subtitle, letter = "&", aside, below,
}: LuxuryPageHeroProps) {
  return (
    <div style={{
      position: "relative",
      background: "linear-gradient(135deg,#D44860 0%,#BE2D45 45%,#8B1A2C 80%,#6E1220 100%)",
      overflow: "hidden",
      borderBottom: "1px solid rgba(100,10,20,.25)",
    }}>

      {/* ── Light radial blooms — give depth to the flat gradient ──────── */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 65% 75% at 95% 5%,  rgba(255,255,255,.10) 0%, transparent 55%),
          radial-gradient(ellipse 45% 55% at 0%  95%,  rgba(0,0,0,.18)        0%, transparent 50%),
          radial-gradient(ellipse 35% 50% at 50% 50%, rgba(255,180,160,.06)  0%, transparent 60%)
        `,
      }} />

      {/* ── Gold accent stripe at the very top ─────────────────────────── */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg,transparent 4%,rgba(232,196,80,.60) 28%,rgba(255,220,100,.90) 50%,rgba(232,196,80,.60) 72%,transparent 96%)",
      }} />

      {/* ── Bottom fade to page ─────────────────────────────────────────── */}
      <div aria-hidden style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg,transparent 5%,rgba(100,10,20,.35) 35%,rgba(80,5,15,.50) 50%,rgba(100,10,20,.35) 65%,transparent 95%)",
      }} />

      {/* ── Decorative letterform watermark ────────────────────────────── */}
      <div aria-hidden style={{
        position: "absolute",
        right: "clamp(1rem,6vw,5rem)",
        top: "50%", transform: "translateY(-50%)",
        fontFamily: DF,
        fontSize: "clamp(12rem,28vw,26rem)",
        fontWeight: 300, lineHeight: 1,
        color: "rgba(255,255,255,.06)",
        letterSpacing: "-.04em",
        userSelect: "none", pointerEvents: "none",
      }}>
        {letter}
      </div>

      {/* ── Noise grain texture ─────────────────────────────────────────── */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: .35,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E")`,
      }} />

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: "var(--max-w,1320px)", margin: "0 auto",
        padding: "clamp(5rem,10vh,7.5rem) var(--pad-x,clamp(1.25rem,5vw,5rem)) clamp(3.5rem,7vh,5.5rem)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: aside ? "1fr auto" : "1fr",
          gap: "clamp(2rem,4vw,4rem)",
          alignItems: "end",
        }}>

          {/* Left — headline block */}
          <div style={{ maxWidth: "54rem" }}>

            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.625rem" }}>
              <div style={{ width: 22, height: 1, background: "rgba(255,255,255,.50)" }} />
              <span style={{
                fontFamily: BF, fontSize: ".44rem", letterSpacing: ".50em",
                textTransform: "uppercase", color: "rgba(255,255,255,.72)", fontWeight: 700,
              }}>
                {eyebrow}
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: DF, fontWeight: 300,
              fontSize: "clamp(2.75rem,7.5vw,6.5rem)",
              lineHeight: .90, letterSpacing: "-.032em",
              color: "#FFFFFF",
              marginBottom: subtitle ? "clamp(1rem,2.5vh,1.625rem)" : below ? "clamp(1.25rem,3vh,2rem)" : 0,
            }}>
              {title}
            </h1>

            {/* Hairline rule below headline */}
            {subtitle && (
              <div style={{
                width: "min(80px,18%)", height: 1, marginBottom: "clamp(.875rem,2vh,1.375rem)",
                background: "linear-gradient(to right,rgba(255,220,120,.70),transparent)",
              }} />
            )}

            {/* Subtitle */}
            {subtitle && (
              <p style={{
                fontFamily: DF, fontStyle: "italic",
                fontSize: "clamp(.95rem,1.8vw,1.15rem)",
                color: "rgba(255,255,255,.72)",
                lineHeight: 1.80, maxWidth: "40rem",
                marginBottom: below ? "clamp(1.25rem,3vh,2rem)" : 0,
              }}>
                {subtitle}
              </p>
            )}

            {/* Optional below slot */}
            {below}
          </div>

          {/* Right — optional aside */}
          {aside && (
            <div style={{ flexShrink: 0 }}>
              {aside}
            </div>
          )}
        </div>
      </div>

      {/* Responsive: aside stacks on narrow viewports */}
      <style>{`
        @media(max-width:680px){
          .lph-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}

export default LuxuryPageHero;
