import type { Metadata } from "next";
import { weddingConfig } from "@/lib/config";
import { getSlideshowPhotos } from "@/modules/premium/photo-gallery";
import { formatDate } from "@/utils/formatDate";

export const metadata: Metadata = {
  title: `${weddingConfig.brideName} & ${weddingConfig.groomName} | ${weddingConfig.celebrationTitle}`,
  description: weddingConfig.heroSubtitle,
};

export default function HomePage() {
  const slides = getSlideshowPhotos();

  const heroPhoto =
    slides[0]?.imageUrl ??
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85";

  const bf   = weddingConfig.brideName.split(" ")[0]!;
  const gf   = weddingConfig.groomName.split(" ")[0]!;
  const date = formatDate(weddingConfig.weddingDate);

  // ── Palette ────────────────────────────────────────────────────────────────
  // Ivory   #F7F2EA  — page canvas, parchment warmth
  // Cream   #EDE5D8  — secondary surfaces
  // Maroon  #6E1423  — primary accent, anchors
  // Gold    #A8882A  — secondary accent, rules, separators
  // Ink     #1C1008  — primary text
  // Stone   #5C4A3A  — secondary text

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }

        /* ── Typeface stack ──────────────────────────────────────────────── */
        /* Cormorant Garamond for display — classical, editorial, British old
           money. Manrope/system for body — clean, legible, unobtrusive.     */

        /* ── Palette variables ──────────────────────────────────────────── */
        :root {
          --ivory:  #F7F2EA;
          --cream:  #EDE5D8;
          --maroon: #6E1423;
          --gold:   #A8882A;
          --ink:    #1C1008;
          --stone:  #5C4A3A;
          --border: rgba(168,136,42,0.22);
        }

        /* ── Keyframes ──────────────────────────────────────────────────── */
        @keyframes slowZoom {
          from { transform: scale(1.00); }
          to   { transform: scale(1.06); }
        }
        @keyframes tickerMove {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ruleGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        /* ── Staggered reveal classes ───────────────────────────────────── */
        .fade   { animation: fadeIn 1.2s ease both; }
        .rise-1 { animation: riseIn 1.0s 0.20s cubic-bezier(.16,1,.3,1) both; }
        .rise-2 { animation: riseIn 1.0s 0.38s cubic-bezier(.16,1,.3,1) both; }
        .rise-3 { animation: riseIn 1.0s 0.52s cubic-bezier(.16,1,.3,1) both; }
        .rise-4 { animation: riseIn 1.0s 0.64s cubic-bezier(.16,1,.3,1) both; }
        .rise-5 { animation: riseIn 1.0s 0.76s cubic-bezier(.16,1,.3,1) both; }
        .rise-6 { animation: riseIn 1.0s 0.88s cubic-bezier(.16,1,.3,1) both; }
        .rise-7 { animation: riseIn 1.0s 1.00s cubic-bezier(.16,1,.3,1) both; }
        .rise-8 { animation: riseIn 1.0s 1.12s cubic-bezier(.16,1,.3,1) both; }
        .rise-9 { animation: riseIn 1.0s 1.24s cubic-bezier(.16,1,.3,1) both; }

        .rule-anim {
          transform-origin: center;
          animation: ruleGrow 1.1s 0.9s ease both;
        }

        /* ── Hero photo zoom ─────────────────────────────────────────────── */
        .hero-bg { animation: slowZoom 28s ease-in-out infinite alternate; }

        /* ── Ticker ─────────────────────────────────────────────────────── */
        .ticker-wrap {
          position: fixed; top: 0; left: 0; right: 0; z-index: 60;
        }
        .ticker-rule {
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            var(--maroon) 20%,
            var(--gold) 50%,
            var(--maroon) 80%,
            transparent 100%);
        }
        .ticker-bar {
          overflow: hidden;
          padding: 6px 0;
          background: rgba(247,242,234,0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .ticker-track {
          display: flex;
          gap: 3.5rem;
          white-space: nowrap;
          width: max-content;
          animation: tickerMove 65s linear infinite;
        }
        .ticker-item {
          font-size: 0.47rem;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: var(--stone);
          font-weight: 600;
        }
        .ticker-item .gold-sep { color: var(--gold); margin: 0 0.1em; }

        /* ── Access buttons ──────────────────────────────────────────────── */
        .access-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 22px;
          border-radius: 4px;
          text-decoration: none;
          transition:
            transform 0.22s cubic-bezier(.16,1,.3,1),
            box-shadow 0.22s ease;
          cursor: pointer;
        }
        .btn-primary {
          background: var(--maroon);
          border: 1px solid rgba(110,20,35,0.4);
          box-shadow: 0 4px 20px rgba(110,20,35,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(110,20,35,0.35);
        }
        .btn-secondary {
          background: transparent;
          border: 1px solid var(--maroon);
        }
        .btn-secondary:hover {
          transform: translateY(-2px);
          background: rgba(110,20,35,0.04);
          box-shadow: 0 8px 28px rgba(110,20,35,0.12);
        }

        /* ── Corner ornament ─────────────────────────────────────────────── */
        .corner {
          position: absolute;
          width: 48px; height: 48px;
          pointer-events: none;
        }
        .corner svg { width: 100%; height: 100%; }
        .corner-tl { top: 28px; left: 28px; }
        .corner-tr { top: 28px; right: 28px; transform: scaleX(-1); }
        .corner-bl { bottom: 28px; left: 28px; transform: scaleY(-1); }
        .corner-br { bottom: 28px; right: 28px; transform: scale(-1,-1); }

        /* ── Event cards ─────────────────────────────────────────────────── */
        .event-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          max-width: 480px;
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
        }
        .event-card {
          padding: 18px 22px;
          text-align: left;
          background: rgba(247,242,234,0.60);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .event-card + .event-card {
          border-left: 1px solid var(--border);
        }

        /* ── Footer bottom rule ──────────────────────────────────────────── */
        .bottom-rule {
          position: fixed; bottom: 0; left: 0; right: 0; height: 1px; z-index: 60;
          background: linear-gradient(90deg,
            transparent 0%,
            var(--maroon) 20%,
            var(--gold) 50%,
            var(--maroon) 80%,
            transparent 100%);
        }

        /* ── Responsive ──────────────────────────────────────────────────── */
        @media (max-width: 600px) {
          .name-display {
            font-size: clamp(3.8rem, 18vw, 6rem) !important;
            letter-spacing: -0.03em !important;
          }
          .ampersand-glyph { font-size: clamp(1.4rem, 6vw, 2.5rem) !important; }
          .corner { width: 32px !important; height: 32px !important; }
          .corner-tl { top: 18px !important; left: 18px !important; }
          .corner-tr { top: 18px !important; right: 18px !important; }
          .corner-bl { bottom: 18px !important; left: 18px !important; }
          .corner-br { bottom: 18px !important; right: 18px !important; }
          .event-cards { grid-template-columns: 1fr !important; }
          .event-card + .event-card { border-left: none !important; border-top: 1px solid var(--border) !important; }
          .btn-row { flex-direction: column !important; align-items: stretch !important; }
          .access-btn { justify-content: center !important; }
          .hero-pad { padding: 5.5rem 1.5rem 3rem !important; }
          .quote-block { font-size: 0.9rem !important; padding: 1rem 1.25rem !important; }
          .eyebrow-text { letter-spacing: 0.28em !important; }
        }
        @media (min-width: 601px) and (max-width: 960px) {
          .name-display { font-size: clamp(4.5rem, 12vw, 7rem) !important; }
          .hero-pad { padding: 7rem 3rem 3.5rem !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          TICKER — fixed top
      ══════════════════════════════════════════ */}
      <div className="ticker-wrap fade">
        <div className="ticker-rule" />
        <div className="ticker-bar">
          <div className="ticker-track">
            {Array(14).fill(null).map((_, i) => (
              <span key={i} className="ticker-item">
                {weddingConfig.celebrationTitle}
                <span className="gold-sep"> ✦ </span>
                {date}
                <span className="gold-sep"> ✦ </span>
                {weddingConfig.venueName}
                <span className="gold-sep"> ✦ </span>
                {weddingConfig.venueCity}
                <span className="gold-sep"> ✦ </span>
                {bf} &amp; {gf}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--ivory)",
        overflow: "hidden",
      }}>

        {/* Photo — right two-thirds, portrait crop */}
        <div aria-hidden style={{
          position: "absolute",
          top: 0, bottom: 0,
          right: 0,
          width: "58%",
          zIndex: 0,
          overflow: "hidden",
        }}>
          <div className="hero-bg" style={{
            position: "absolute", inset: "-5%",
            backgroundImage: `url(${heroPhoto})`,
            backgroundSize: "cover",
            backgroundPosition: "center 25%",
            filter: "saturate(0.45) brightness(0.92) sepia(0.08)",
          }} />
          {/* Fade left — blends into the ivory content area */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, var(--ivory) 0%, rgba(247,242,234,0.85) 18%, rgba(247,242,234,0.30) 45%, transparent 70%)",
          }} />
          {/* Subtle bottom fade */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 30%, rgba(247,242,234,0.70) 100%)",
          }} />
        </div>

        {/* Corner ornaments — thin gold lines forming a bracket at each corner */}
        {["tl","tr","bl","br"].map(pos => (
          <div key={pos} className={`corner corner-${pos} rise-1`} aria-hidden>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 44 L4 4 L44 4" stroke="#A8882A" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
        ))}

        {/* ── Main content ── */}
        <div className="hero-pad" style={{
          position: "relative", zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "8rem 5vw 5rem max(5vw, 48px)",
          maxWidth: "660px",
        }}>

          {/* Occasion label */}
          <div className="rise-1" style={{
            display: "flex", alignItems: "center", gap: 14,
            marginBottom: "2.25rem",
          }}>
            <div style={{ width: 32, height: 1, background: "var(--gold)" }} />
            <span className="eyebrow-text" style={{
              fontSize: "0.48rem",
              letterSpacing: "0.50em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontFamily: "var(--font-body), 'Manrope', system-ui, sans-serif",
              fontWeight: 700,
            }}>
              {weddingConfig.celebrationTitle}
            </span>
            <div style={{ width: 32, height: 1, background: "var(--gold)" }} />
          </div>

          {/* Names */}
          <h1 className="name-display rise-2" style={{
            fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(4.5rem, 10vw, 8rem)",
            fontWeight: 300,
            lineHeight: 0.90,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginBottom: "0.04em",
          }}>
            {bf}
          </h1>

          <p className="ampersand-glyph rise-3" style={{
            fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "var(--maroon)",
            lineHeight: 1.1,
            letterSpacing: "0.10em",
            marginBottom: "0.04em",
            paddingLeft: "0.06em",
          }}>
            &amp;
          </p>

          <h1 className="name-display rise-4" style={{
            fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(4.5rem, 10vw, 8rem)",
            fontWeight: 300,
            lineHeight: 0.90,
            letterSpacing: "-0.02em",
            color: "var(--maroon)",
            marginBottom: "2rem",
          }}>
            {gf}
          </h1>

          {/* Gold rule */}
          <div className="rule-anim" style={{
            width: "min(260px, 70%)",
            height: 1,
            background: "linear-gradient(90deg, var(--gold), rgba(168,136,42,0.30))",
            marginBottom: "1.75rem",
          }} />

          {/* Event details — two elegant cards */}
          <div className="event-cards rise-5">
            {/* Ceremony */}
            <div className="event-card">
              <p style={{
                fontSize: "0.46rem", letterSpacing: "0.38em",
                textTransform: "uppercase", color: "var(--gold)",
                fontWeight: 700, marginBottom: "0.5rem",
                fontFamily: "var(--font-body), system-ui, sans-serif",
              }}>
                Ceremony
              </p>
              <p style={{
                fontFamily: "var(--font-display), Georgia, serif",
                fontSize: "0.92rem", fontWeight: 600,
                color: "var(--ink)", lineHeight: 1.35, marginBottom: "0.3rem",
              }}>
                {weddingConfig.venueName}
              </p>
              <p style={{
                fontSize: "0.72rem", color: "var(--stone)",
                fontFamily: "var(--font-body), system-ui, sans-serif",
                lineHeight: 1.5,
              }}>
                {date} · 3:00 pm
              </p>
            </div>
            {/* Reception */}
            <div className="event-card">
              <p style={{
                fontSize: "0.46rem", letterSpacing: "0.38em",
                textTransform: "uppercase", color: "var(--gold)",
                fontWeight: 700, marginBottom: "0.5rem",
                fontFamily: "var(--font-body), system-ui, sans-serif",
              }}>
                Reception
              </p>
              <p style={{
                fontFamily: "var(--font-display), Georgia, serif",
                fontSize: "0.92rem", fontWeight: 600,
                color: "var(--ink)", lineHeight: 1.35, marginBottom: "0.3rem",
              }}>
                {weddingConfig.receptionVenueName}
              </p>
              <p style={{
                fontSize: "0.72rem", color: "var(--stone)",
                fontFamily: "var(--font-body), system-ui, sans-serif",
                lineHeight: 1.5,
              }}>
                {date} · 6:00 pm
              </p>
            </div>
          </div>

          {/* Quote */}
          <blockquote className="quote-block rise-6" style={{
            fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(0.88rem, 1.4vw, 1.0rem)",
            color: "var(--stone)",
            lineHeight: 1.90,
            maxWidth: "34rem",
            margin: "1.75rem 0",
            padding: "1.1rem 1.4rem",
            borderLeft: "2px solid var(--gold)",
            background: "rgba(237,229,216,0.38)",
          }}>
            &ldquo;{weddingConfig.introQuote}&rdquo;
          </blockquote>

          {/* Private access line */}
          <div className="rise-7" style={{
            display: "flex", alignItems: "center", gap: 10,
            marginBottom: "1.25rem",
          }}>
            <div style={{ width: 20, height: 1, background: "var(--border)" }} />
            <span style={{
              fontSize: "0.45rem", letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "var(--stone)",
              fontFamily: "var(--font-body), system-ui, sans-serif",
              fontWeight: 600,
            }}>
              Private access
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Access buttons */}
          <div className="btn-row rise-8" style={{
            display: "flex", gap: "0.75rem", flexWrap: "wrap",
          }}>
            {/* Couple */}
            <a href="/login?hint=couple&redirect=/admin" className="access-btn btn-primary">
              <span style={{
                fontSize: "0.46rem", letterSpacing: "0.30em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
                fontFamily: "var(--font-body), system-ui, sans-serif",
                fontWeight: 600,
              }}>
                The couple
              </span>
              <span style={{ width: 1, height: 20, background: "rgba(255,255,255,0.18)" }} />
              <span style={{
                fontSize: "0.82rem", fontWeight: 700,
                color: "#FFFFFF",
                fontFamily: "var(--font-body), system-ui, sans-serif",
                whiteSpace: "nowrap",
              }}>
                {bf} &amp; {gf}
              </span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>

            {/* Family */}
            <a href="/login?hint=vault&redirect=/family" className="access-btn btn-secondary">
              <span style={{
                fontSize: "0.46rem", letterSpacing: "0.30em",
                textTransform: "uppercase",
                color: "var(--stone)",
                fontFamily: "var(--font-body), system-ui, sans-serif",
                fontWeight: 600,
              }}>
                Family
              </span>
              <span style={{ width: 1, height: 20, background: "var(--border)" }} />
              <span style={{
                fontSize: "0.82rem", fontWeight: 700,
                color: "var(--maroon)",
                fontFamily: "var(--font-body), system-ui, sans-serif",
                whiteSpace: "nowrap",
              }}>
                Family vault
              </span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--maroon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          {/* Guest footnote */}
          <p className="rise-9" style={{
            marginTop: "1.5rem",
            fontSize: "0.68rem",
            color: "var(--stone)",
            fontStyle: "italic",
            fontFamily: "var(--font-display), Georgia, serif",
            lineHeight: 1.7,
            opacity: 0.75,
          }}>
            Are you a guest? Open the personal link {bf} &amp; {gf} sent directly to you.
          </p>

        </div>

        {/* Bottom ivory fade — ensures ticker clears content */}
        <div aria-hidden style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", zIndex: 5,
          background: "linear-gradient(to bottom, transparent, var(--ivory))",
          pointerEvents: "none",
        }} />

      </section>

      <div className="bottom-rule" aria-hidden />
    </>
  );
}
