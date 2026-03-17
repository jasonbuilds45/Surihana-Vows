import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow?:  string;
  title:     ReactNode;
  subtitle?: string;
  actions?:  ReactNode;
  /** "rose" · "warm" · "white" (default) · "dark" */
  variant?:  "white" | "warm" | "rose" | "dark";
  aside?:    ReactNode;
  accent?:   string;
  accent2?:  string;
}

const DF = "'Cormorant Garamond', var(--font-display), Georgia, serif";
const BF = "'Manrope', var(--font-body), system-ui, sans-serif";

export function PageHero({
  eyebrow, title, subtitle, actions, variant = "white", aside,
}: PageHeroProps) {

  const isDark = variant === "dark";
  const isRose = variant === "rose";
  const isWarm = variant === "warm";

  const bg = isDark
    ? "#0F0A0B"
    : isRose
    ? "linear-gradient(135deg, #D44860 0%, #BE2D45 60%, #A42539 100%)"
    : isWarm
    ? "#F1E9E0"
    : "#FDFAF7";

  const meshOverlay = isDark
    ? `radial-gradient(ellipse 70% 55% at 20% 30%, rgba(190,45,69,0.14) 0%, transparent 60%),
       radial-gradient(ellipse 55% 45% at 82% 72%, rgba(168,120,8,0.10) 0%, transparent 55%)`
    : isRose
    ? `radial-gradient(ellipse 60% 70% at 85% 10%, rgba(255,255,255,0.12) 0%, transparent 55%),
       radial-gradient(ellipse 50% 60% at 10% 90%, rgba(0,0,0,0.10) 0%, transparent 50%)`
    : `radial-gradient(ellipse 65% 80% at 55% 0%, rgba(190,45,69,0.07) 0%, transparent 65%),
       radial-gradient(ellipse 40% 55% at 5% 100%, rgba(168,120,8,0.05) 0%, transparent 50%)`;

  const eyebrowColor = isDark
    ? "rgba(240,190,198,0.60)"
    : isRose
    ? "rgba(255,255,255,0.72)"
    : "var(--rose, #BE2D45)";

  const titleColor = isDark || isRose
    ? "#FDFAF7"
    : "var(--ink, #120B0E)";

  const subtitleColor = isDark
    ? "rgba(255,255,255,0.55)"
    : isRose
    ? "rgba(255,255,255,0.78)"
    : "var(--ink-2, #362030)";

  const borderBottom = isDark || isRose
    ? "none"
    : isWarm
    ? "1px solid rgba(190,45,69,0.10)"
    : "1px solid rgba(190,45,69,0.08)";

  return (
    <div style={{
      background: bg,
      borderBottom,
      padding: "6rem var(--pad-x, 5rem) 5rem",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Mesh gradient atmosphere */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: meshOverlay,
      }} />

      {/* Noise grain */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      }} />

      {/* Top accent stripe */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: isDark || isRose
          ? "linear-gradient(90deg, transparent, rgba(168,120,8,0.6), transparent)"
          : "linear-gradient(90deg, transparent, rgba(190,45,69,0.45), rgba(168,120,8,0.55), rgba(190,45,69,0.45), transparent)",
      }} />

      {/* Large decorative letter — background ornament */}
      <div aria-hidden style={{
        position: "absolute",
        right: "var(--pad-x, 5rem)",
        top: "50%",
        transform: "translateY(-50%)",
        fontFamily: DF,
        fontSize: "clamp(12rem, 28vw, 26rem)",
        fontWeight: 700,
        lineHeight: 1,
        color: isDark
          ? "rgba(255,255,255,0.025)"
          : isRose
          ? "rgba(255,255,255,0.07)"
          : "rgba(190,45,69,0.04)",
        letterSpacing: "-0.04em",
        userSelect: "none",
        pointerEvents: "none",
        zIndex: 0,
      }}>
        {/* First char of title — extracted from ReactNode if string, else "&" */}
        &
      </div>

      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: 1,
        maxWidth: "var(--max-w, 1320px)",
        margin: "0 auto",
      }}>
        {aside ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "2.5rem",
            alignItems: "flex-end",
          }}>
            <HeroText
              eyebrow={eyebrow} title={title} subtitle={subtitle} actions={actions}
              eyebrowColor={eyebrowColor} titleColor={titleColor} subtitleColor={subtitleColor}
            />
            <div style={{ flexShrink: 0 }}>{aside}</div>
          </div>
        ) : (
          <HeroText
            eyebrow={eyebrow} title={title} subtitle={subtitle} actions={actions}
            eyebrowColor={eyebrowColor} titleColor={titleColor} subtitleColor={subtitleColor}
          />
        )}
      </div>
    </div>
  );
}

function HeroText({
  eyebrow, title, subtitle, actions,
  eyebrowColor, titleColor, subtitleColor,
}: {
  eyebrow?: string; title: ReactNode; subtitle?: string; actions?: ReactNode;
  eyebrowColor: string; titleColor: string; subtitleColor: string;
}) {
  return (
    <div style={{ maxWidth: "56rem" }}>

      {eyebrow && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.375rem" }}>
          <div style={{ width: 24, height: 1, background: eyebrowColor, opacity: 0.6 }} />
          <p style={{
            fontFamily: BF,
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.30em",
            textTransform: "uppercase",
            color: eyebrowColor,
          }}>
            {eyebrow}
          </p>
          <div style={{ width: 24, height: 1, background: eyebrowColor, opacity: 0.3 }} />
        </div>
      )}

      <h1 style={{
        fontFamily: DF,
        fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)",
        fontWeight: 700,
        lineHeight: 0.90,
        letterSpacing: "-0.032em",
        color: titleColor,
        marginBottom: subtitle || actions ? "1.375rem" : 0,
      }}>
        {title}
      </h1>

      {subtitle && (
        <p style={{
          fontFamily: BF,
          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
          color: subtitleColor,
          maxWidth: "42rem",
          lineHeight: 1.78,
          fontWeight: 400,
          marginBottom: actions ? "2rem" : 0,
        }}>
          {subtitle}
        </p>
      )}

      {actions && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.875rem" }}>
          {actions}
        </div>
      )}
    </div>
  );
}
