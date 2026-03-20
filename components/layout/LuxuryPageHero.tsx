import type { ReactNode } from "react";

/**
 * LuxuryPageHero — unified rich maroon editorial header
 *
 * COLOUR LOGIC (final):
 *   Background: #C8374F → #B02840 → #7E1628 → #640F1E  (rich maroon rose)
 *
 *   Typography — WHITE ONLY system:
 *     Eyebrow:      rgba(255,255,255,.68)   — restrained, uppercase
 *     Headline:     #FFFFFF                  — full white, commanding
 *     Italic em:    rgba(255,255,255,.88)    — 12% dimmer than headline
 *                   The italic posture of Cormorant Garamond creates all the
 *                   visual contrast needed. No colour shift required.
 *                   This is how luxury print works: white on red, nothing else.
 *     Hairline:     rgba(255,255,255,.28)    — whisper fine
 *     Subtitle:     rgba(255,255,255,.68)    — same as eyebrow, calm
 *     Lead-rule:    rgba(255,255,255,.38)
 *
 *   Structural accents — also white:
 *     Top hairline stripe:  rgba(255,255,255,.55) → .85 → .55
 *     Letterform:           rgba(255,255,255,.06)
 *     Chips/pills:          rgba(255,255,255,.14) bg, .28 border
 *
 *   What NOT to do:
 *     ✗ Gold/yellow tones — green-toned against warm crimson
 *     ✗ Ivory/cream em accents — introduces a "two-colour" problem
 *     ✗ Rose-tinted chips — invisible against the rose background
 */

const DF = "'Cormorant Garamond',var(--font-display),Georgia,serif";
const BF = "'Manrope',var(--font-body),system-ui,sans-serif";

interface LuxuryPageHeroProps {
  eyebrow:   string;
  title:     ReactNode;
  subtitle?: string;
  letter?:   string;
  aside?:    ReactNode;
  below?:    ReactNode;
}

export function LuxuryPageHero({
  eyebrow, title, subtitle, letter = "&", aside, below,
}: LuxuryPageHeroProps) {
  return (
    <div style={{
      position: "relative",
      background: "linear-gradient(135deg,#C8374F 0%,#B02840 45%,#7E1628 80%,#640F1E 100%)",
      overflow: "hidden",
      borderBottom: "1px solid rgba(60,0,10,.30)",
    }}>

      {/* ── Depth blooms ─────────────────────────────────────────────── */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 62% 72% at 96% 4%,  rgba(255,255,255,.10) 0%, transparent 55%),
          radial-gradient(ellipse 48% 58% at 2%  96%,  rgba(0,0,0,.20)       0%, transparent 52%),
          radial-gradient(ellipse 40% 55% at 50% 50%, rgba(255,160,140,.03)  0%, transparent 60%)
        `,
      }} />

      {/* ── Top white hairline ──────────────────────────────────────── */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg,transparent 4%,rgba(255,255,255,.55) 30%,rgba(255,255,255,.85) 50%,rgba(255,255,255,.55) 70%,transparent 96%)",
      }} />

      {/* ── Bottom shadow ───────────────────────────────────────────── */}
      <div aria-hidden style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg,transparent 5%,rgba(60,0,10,.45) 35%,rgba(40,0,8,.65) 50%,rgba(60,0,10,.45) 65%,transparent 95%)",
      }} />

      {/* ── Decorative letterform ───────────────────────────────────── */}
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

      {/* ── Noise grain ─────────────────────────────────────────────── */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: .30,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E")`,
      }} />

      {/* ── Content ─────────────────────────────────────────────────── */}
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

          <div style={{ maxWidth: "54rem" }}>

            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.625rem" }}>
              <div style={{ width: 22, height: 1, background: "rgba(255,255,255,.38)" }} />
              <span style={{
                fontFamily: BF, fontSize: ".44rem", letterSpacing: ".50em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.68)",
                fontWeight: 700,
              }}>
                {eyebrow}
              </span>
            </div>

            {/* Headline — pure white, let italic posture carry the contrast */}
            <h1 style={{
              fontFamily: DF, fontWeight: 300,
              fontSize: "clamp(2.75rem,7.5vw,6.5rem)",
              lineHeight: .90, letterSpacing: "-.032em",
              color: "#FFFFFF",
              marginBottom: (subtitle || below) ? "clamp(1rem,2.5vh,1.625rem)" : 0,
            }}>
              {title}
            </h1>

            {/* Fine hairline rule */}
            {subtitle && (
              <div style={{
                width: "min(72px,16%)", height: 1,
                marginBottom: "clamp(.875rem,2vh,1.375rem)",
                background: "linear-gradient(to right,rgba(255,255,255,.28),transparent)",
              }} />
            )}

            {/* Subtitle */}
            {subtitle && (
              <p style={{
                fontFamily: DF, fontStyle: "italic",
                fontSize: "clamp(.95rem,1.8vw,1.15rem)",
                color: "rgba(255,255,255,.68)",
                lineHeight: 1.80, maxWidth: "40rem",
                marginBottom: below ? "clamp(1.25rem,3vh,2rem)" : 0,
              }}>
                {subtitle}
              </p>
            )}

            {below}
          </div>

          {aside && (
            <div style={{ flexShrink: 0 }}>
              {aside}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media(max-width:680px){
          .lph-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}

export default LuxuryPageHero;
