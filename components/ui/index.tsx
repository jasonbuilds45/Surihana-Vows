/**
 * components/ui/index.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Surihana Vows — Shared Design System Components
 *
 * Every component here uses only CSS variables from the design token system.
 * Never hardcode colours. All spacing uses Tailwind utilities.
 *
 * Exports:
 *   Buttons    : Btn (primary, secondary, ghost, icon variants)
 *   Cards      : Card, CardDark, CardGlass, CardFeature
 *   Typography : SectionLabel, PageHeader, SectionHeader, BodyText
 *   Layout     : SectionWrapper, SectionDivider, GoldStripe
 *   Badges     : Badge (role / status variants)
 *   Inputs     : Field, TextArea (for use inside forms)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

/* ══════════════════════════════════════════════════════════════════════════════
   GOLD STRIPE — thin metallic ornament
══════════════════════════════════════════════════════════════════════════════ */
export function GoldStripe({ thin = false }: { thin?: boolean }) {
  return (
    <div style={{
      height: thin ? "1px" : "2px",
      background: thin
        ? "linear-gradient(90deg, transparent, var(--color-champagne-deep) 30%, var(--color-gold) 50%, var(--color-champagne-deep) 70%, transparent)"
        : "linear-gradient(90deg, transparent, var(--color-champagne) 15%, var(--color-gold) 35%, #f0c040 50%, var(--color-gold) 65%, var(--color-champagne) 85%, transparent)",
    }} />
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SECTION DIVIDER — ornamental ✦ with ruled lines
══════════════════════════════════════════════════════════════════════════════ */
export function SectionDivider() {
  return (
    <div className="flex items-center gap-4 mx-auto max-w-xs">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--color-champagne-deep))" }} />
      <span className="font-display" style={{ color: "var(--color-champagne-deep)", fontSize: "1rem" }}>✦</span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, var(--color-champagne-deep), transparent)" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   TYPOGRAPHY
══════════════════════════════════════════════════════════════════════════════ */

/** Small all-caps eyebrow label above section headers */
export function SectionLabel({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <p
      className={className}
      style={{
        fontFamily: "var(--font-body), sans-serif",
        fontSize: "0.625rem",
        fontWeight: 600,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--color-accent)",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

/** H1 page-level heading */
export function PageHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h1
      className={`font-display ${className}`}
      style={{
        fontSize: "clamp(2rem, 6vw, 3.5rem)",
        color: "var(--color-text-primary)",
        letterSpacing: "0.02em",
        lineHeight: 1.15,
      }}
    >
      {children}
    </h1>
  );
}

/** H2 section-level heading */
export function SectionHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`font-display ${className}`}
      style={{
        fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
        color: "var(--color-text-primary)",
        letterSpacing: "0.02em",
        lineHeight: 1.2,
      }}
    >
      {children}
    </h2>
  );
}

/** Body/descriptive text under headings */
export function BodyText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`text-sm leading-7 ${className}`}
      style={{ color: "var(--color-text-secondary)" }}
    >
      {children}
    </p>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SECTION WRAPPER — consistent vertical padding + background
══════════════════════════════════════════════════════════════════════════════ */
export function SectionWrapper({
  children,
  className = "",
  dark = false,
  soft = false,
  border = false,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  soft?: boolean;
  border?: boolean;
}) {
  const bg = dark ? "var(--color-surface-dark)" : soft ? "var(--color-surface-soft)" : "#ffffff";
  return (
    <section
      className={`py-16 sm:py-20 ${className}`}
      style={{
        background: bg,
        borderTop: border ? "1px solid var(--color-border)" : undefined,
      }}
    >
      {children}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CARDS
══════════════════════════════════════════════════════════════════════════════ */

/** Standard white card with subtle border + shadow */
export const Card = function Card({
  children,
  className = "",
  hover = false,
  noPad = false,
  ref,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  noPad?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={ref}
      className={`rounded-2xl overflow-hidden ${noPad ? "" : "p-6"} ${hover ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" : ""} ${className}`}
      style={{
        background: "#ffffff",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-md)",
        transition: hover ? "transform 0.3s ease, box-shadow 0.3s ease" : undefined,
      }}
    >
      {children}
    </div>
  );
}

/** Dark card for contrast sections (venue, highlight, etc) */
export function CardDark({ children, className = "", noPad = false }: { children: ReactNode; className?: string; noPad?: boolean }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden relative ${noPad ? "" : "p-6"} ${className}`}
      style={{
        background: "linear-gradient(160deg, var(--color-surface-dark) 0%, #2d1510 100%)",
        boxShadow: "var(--shadow-2xl)",
      }}
    >
      <GoldStripe />
      <div className={noPad ? "" : "px-0"}>{children}</div>
      <div className="absolute bottom-0 left-0 right-0"><GoldStripe /></div>
    </div>
  );
}

/** Glassmorphism card — for overlays, hero elements */
export function CardGlass({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden p-6 ${className}`}
      style={{
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      {children}
    </div>
  );
}

/** Feature card — icon + title + desc, with accent top stripe */
export function CardFeature({
  children,
  className = "",
  accentColor,
}: {
  children: ReactNode;
  className?: string;
  accentColor?: string;
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}
      style={{
        background: "#ffffff",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-md)",
        borderTop: accentColor ? `3px solid ${accentColor}` : "1px solid var(--color-border)",
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   BUTTONS
══════════════════════════════════════════════════════════════════════════════ */

type BtnVariant = "primary" | "secondary" | "ghost" | "dark";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
  children: ReactNode;
  asChild?: boolean;
}

const BTN_SIZES: Record<BtnSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-sm",
};

const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed";

const BTN_VARIANTS: Record<BtnVariant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)",
    color: "#ffffff",
    boxShadow: "0 6px 20px rgba(184,84,58,0.35)",
  },
  secondary: {
    background: "#ffffff",
    color: "var(--color-accent)",
    border: "1.5px solid var(--color-accent-soft)",
    boxShadow: "var(--shadow-sm)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-secondary)",
    border: "1px solid var(--color-border-medium)",
  },
  dark: {
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(12px)",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.2)",
  },
};

export function Btn({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  style,
  ...props
}: BtnProps) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`${BTN_BASE} ${BTN_SIZES[size]} ${props.className ?? ""}`}
      style={{ ...BTN_VARIANTS[variant], letterSpacing: "0.18em", ...style }}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

/** Link-styled version of Btn — renders an <a> */
export function BtnLink({
  variant = "primary",
  size = "md",
  href,
  children,
  target,
  rel,
  className = "",
  style,
}: {
  variant?: BtnVariant;
  size?: BtnSize;
  href: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`${BTN_BASE} ${BTN_SIZES[size]} ${className}`}
      style={{ ...BTN_VARIANTS[variant], letterSpacing: "0.18em", textDecoration: "none", ...style }}
    >
      {children}
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   BADGES
══════════════════════════════════════════════════════════════════════════════ */

type BadgeVariant = "accent" | "gold" | "rose" | "sage" | "blush" | "plum" | "neutral";

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  accent:  { background: "var(--color-accent-light)",  color: "var(--color-accent)",  border: "1px solid rgba(184,84,58,0.18)" },
  gold:    { background: "var(--color-gold-soft)",     color: "var(--color-gold)",    border: "1px solid rgba(184,134,11,0.2)" },
  rose:    { background: "var(--color-rose-soft)",     color: "var(--color-rose)",    border: "1px solid rgba(194,24,91,0.15)" },
  sage:    { background: "var(--color-sage-soft)",     color: "var(--color-sage)",    border: "1px solid rgba(107,142,110,0.2)" },
  blush:   { background: "var(--color-blush-soft)",   color: "var(--color-blush)",   border: "1px solid rgba(212,117,107,0.2)" },
  plum:    { background: "var(--color-plum-soft)",    color: "var(--color-plum)",    border: "1px solid rgba(123,63,110,0.2)" },
  neutral: { background: "var(--color-surface-muted)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" },
};

export function Badge({
  children,
  variant = "accent",
  className = "",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 ${className}`}
      style={{
        fontFamily: "var(--font-body), sans-serif",
        fontSize: "0.6rem",
        fontWeight: 600,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        ...BADGE_STYLES[variant],
      }}
    >
      {children}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   FORM FIELDS
══════════════════════════════════════════════════════════════════════════════ */

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Field({ label, className = "", ...props }: FieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-text-secondary)",
          }}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          display: "block",
          width: "100%",
          background: "var(--color-surface-soft)",
          border: "1.5px solid var(--color-border-medium)",
          borderRadius: "12px",
          padding: "0.875rem 1rem",
          color: "var(--color-text-primary)",
          fontSize: "0.9375rem",
          outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          fontFamily: "var(--font-body), sans-serif",
          ...props.style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--color-accent)";
          e.target.style.boxShadow = "0 0 0 3px var(--color-accent-muted)";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--color-border-medium)";
          e.target.style.boxShadow = "none";
          props.onBlur?.(e);
        }}
        className={`placeholder:text-[var(--color-text-muted)]`}
      />
    </div>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  minRows?: number;
}

export function TextArea({ label, minRows = 4, className = "", ...props }: TextAreaProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-text-secondary)",
          }}
        >
          {label}
        </label>
      )}
      <textarea
        {...props}
        rows={minRows}
        style={{
          display: "block",
          width: "100%",
          background: "var(--color-surface-soft)",
          border: "1.5px solid var(--color-border-medium)",
          borderRadius: "12px",
          padding: "0.875rem 1rem",
          color: "var(--color-text-primary)",
          fontSize: "0.9375rem",
          outline: "none",
          resize: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          fontFamily: "var(--font-body), sans-serif",
          ...props.style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--color-accent)";
          e.target.style.boxShadow = "0 0 0 3px var(--color-accent-muted)";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--color-border-medium)";
          e.target.style.boxShadow = "none";
          props.onBlur?.(e);
        }}
        className="placeholder:text-[var(--color-text-muted)]"
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE HERO HEADER — consistent header for all sub-pages
══════════════════════════════════════════════════════════════════════════════ */
export function PageHero({
  label,
  title,
  subtitle,
  actions,
}: {
  label?: string;
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="py-14 sm:py-20" style={{ background: "var(--color-surface-soft)", borderBottom: "1px solid var(--color-border)" }}>
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, var(--color-champagne) 20%, var(--color-gold) 50%, var(--color-champagne) 80%, transparent)", marginBottom: 0 }} />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <div className="max-w-3xl space-y-5">
          {label && <SectionLabel>{label}</SectionLabel>}
          <PageHeader>{title}</PageHeader>
          {subtitle && <BodyText className="text-base leading-8 max-w-xl">{subtitle}</BodyText>}
          {actions && <div className="flex flex-wrap gap-3 pt-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   STAT CARD — used in admin widgets + vault stats
══════════════════════════════════════════════════════════════════════════════ */
export function StatCard({
  label,
  value,
  sub,
  icon,
  accentColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  accentColor?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{
        background: "#ffffff",
        border: "1px solid var(--color-border)",
        borderTop: accentColor ? `3px solid ${accentColor}` : "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center justify-between">
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>
          {label}
        </p>
        {icon && <div style={{ color: accentColor ?? "var(--color-accent-soft)" }}>{icon}</div>}
      </div>
      <p className="font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   EMPTY STATE — consistent zero-data placeholder
══════════════════════════════════════════════════════════════════════════════ */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="rounded-2xl py-14 px-8 text-center space-y-4"
      style={{ background: "var(--color-surface-soft)", border: "1.5px dashed var(--color-border-medium)" }}
    >
      {icon && <div className="flex justify-center mb-2" style={{ color: "var(--color-accent-soft)" }}>{icon}</div>}
      <p className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>{title}</p>
      {description && <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--color-text-muted)" }}>{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
