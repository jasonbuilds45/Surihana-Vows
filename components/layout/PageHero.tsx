import type { ReactNode } from "react";

const ROSE   = "#C0364A";
const INK    = "#1A1012";
const INK2   = "#3D2530";
const INK3   = "#7A5460";
const BF     = "var(--font-body), -apple-system, system-ui, sans-serif";
const DF     = "var(--font-display), Georgia, serif";
const STRIPE = { height: 3, background: "linear-gradient(90deg, #D94F62 0%, #C0364A 25%, #B8820A 50%, #C0364A 75%, #D94F62 100%)", position: "absolute" as const, top: 0, left: 0, right: 0 };

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  /** "rose" = rose accent bg · "warm" = warm linen · "white" (default) */
  variant?: "white" | "warm" | "rose";
  aside?: ReactNode;
  /** legacy compat */
  accent?: string;
  accent2?: string;
}

export function PageHero({ eyebrow, title, subtitle, actions, variant = "white", aside }: PageHeroProps) {
  const isRose = variant === "rose";
  const bg     = isRose ? ROSE : variant === "warm" ? "#F4EFE9" : "#FFFFFF";
  const bdBot  = isRose ? "none" : "1px solid #E4D8D4";

  return (
    <div style={{ background: bg, borderBottom: bdBot, padding: "5rem clamp(1.25rem,5vw,4rem) 4rem", overflow: "hidden", position: "relative" }}>
      {/* Subtle radial tint on light backgrounds */}
      {!isRose && (
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(192,54,74,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
      )}
      {/* Top accent stripe */}
      <div style={STRIPE} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1280px", margin: "0 auto" }}>
        {aside ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2.5rem", alignItems: "flex-end" }}>
            <HeroText eyebrow={eyebrow} title={title} subtitle={subtitle} actions={actions} isRose={isRose} />
            <div>{aside}</div>
          </div>
        ) : (
          <HeroText eyebrow={eyebrow} title={title} subtitle={subtitle} actions={actions} isRose={isRose} />
        )}
      </div>
    </div>
  );
}

function HeroText({ eyebrow, title, subtitle, actions, isRose }: {
  eyebrow?: string; title: ReactNode; subtitle?: string; actions?: ReactNode; isRose: boolean;
}) {
  return (
    <div style={{ maxWidth: "52rem" }}>
      {eyebrow && (
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: isRose ? "rgba(255,255,255,0.72)" : ROSE, marginBottom: "1.25rem", fontFamily: BF }}>
          {eyebrow}
        </p>
      )}
      <h1 style={{ fontFamily: DF, fontSize: "clamp(2.5rem, 7vw, 6rem)", fontWeight: 700, lineHeight: 0.90, letterSpacing: "-0.03em", color: isRose ? "#FFFFFF" : INK, marginBottom: subtitle || actions ? "1.25rem" : 0 }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: "clamp(0.9rem, 2vw, 1.125rem)", color: isRose ? "rgba(255,255,255,0.72)" : INK2, maxWidth: "40rem", lineHeight: 1.75, fontFamily: BF, marginBottom: actions ? "1.75rem" : 0 }}>
          {subtitle}
        </p>
      )}
      {actions && <div style={{ display: "flex", flexWrap: "wrap", gap: "0.875rem" }}>{actions}</div>}
    </div>
  );
}
