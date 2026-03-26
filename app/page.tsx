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

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow-x: hidden; }

        :root {
          --ivory:  #F7F2EA;
          --cream:  #EDE5D8;
          --maroon: #6E1423;
          --gold:   #A8882A;
          --ink:    #1C1008;
          --stone:  #5C4A3A;
          --border: rgba(168,136,42,0.20);
          --df: var(--font-display), 'Cormorant Garamond', Georgia, serif;
          --bf: var(--font-body), 'Manrope', system-ui, sans-serif;
        }

        /* ── Keyframes ─────────────────────────────────────────────────── */
        @keyframes slowZoom {
          from { transform: scale(1.0) translateY(0); }
          to   { transform: scale(1.07) translateY(-8px); }
        }
        @keyframes tickerMove {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ruleExpand {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes nameReveal {
          from { opacity: 0; transform: translateY(40px) skewY(1deg); }
          to   { opacity: 1; transform: translateY(0) skewY(0deg); }
        }

        /* ── Reveal classes ─────────────────────────────────────────────── */
        .fade    { animation: fadeIn  1.4s 0.0s ease both; }
        .rise-0  { animation: riseIn  1.0s 0.1s cubic-bezier(.16,1,.3,1) both; }
        .rise-1  { animation: riseIn  1.0s 0.25s cubic-bezier(.16,1,.3,1) both; }
        .name-a  { animation: nameReveal 1.1s 0.30s cubic-bezier(.16,1,.3,1) both; }
        .name-amp{ animation: nameReveal 0.8s 0.52s cubic-bezier(.16,1,.3,1) both; }
        .name-b  { animation: nameReveal 1.1s 0.46s cubic-bezier(.16,1,.3,1) both; }
        .rise-2  { animation: riseIn  1.0s 0.62s cubic-bezier(.16,1,.3,1) both; }
        .rise-3  { animation: riseIn  1.0s 0.76s cubic-bezier(.16,1,.3,1) both; }
        .rise-4  { animation: riseIn  1.0s 0.90s cubic-bezier(.16,1,.3,1) both; }
        .rise-5  { animation: riseIn  1.0s 1.04s cubic-bezier(.16,1,.3,1) both; }
        .rise-6  { animation: riseIn  1.0s 1.18s cubic-bezier(.16,1,.3,1) both; }
        .rise-7  { animation: riseIn  1.0s 1.32s cubic-bezier(.16,1,.3,1) both; }
        .rule-anim {
          transform-origin: center;
          animation: ruleExpand 1.0s 0.60s ease both;
        }

        /* ── Ticker ─────────────────────────────────────────────────────── */
        .ticker-shell {
          position: fixed; top: 0; left: 0; right: 0; z-index: 60;
        }
        .ticker-line {
          height: 1px;
          background: linear-gradient(90deg,
            transparent, var(--maroon) 25%, var(--gold) 50%, var(--maroon) 75%, transparent);
        }
        .ticker-bar {
          overflow: hidden; padding: 6px 0;
          background: rgba(247,242,234,0.96);
          backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--border);
        }
        .ticker-track {
          display: flex; gap: 3rem; white-space: nowrap; width: max-content;
          animation: tickerMove 70s linear infinite;
        }
        .ticker-item {
          font-family: var(--bf);
          font-size: 0.46rem; letter-spacing: 0.46em;
          text-transform: uppercase; color: var(--stone); font-weight: 600;
        }
        .t-gold { color: var(--gold); }

        /* ── Hero ───────────────────────────────────────────────────────── */
        .hero-bg { animation: slowZoom 26s ease-in-out infinite alternate; }

        /* ── Names — the centrepiece ────────────────────────────────────── */
        .name-hero {
          font-family: var(--df);
          font-size: clamp(5.5rem, 16vw, 12rem);
          font-weight: 300;
          line-height: 0.88;
          letter-spacing: -0.025em;
          display: block;
          text-align: center;
        }

        /* ── Event cards ────────────────────────────────────────────────── */
        .event-grid {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          gap: 0;
          width: 100%;
          max-width: 480px;
        }
        .event-divider {
          background: var(--border);
          align-self: stretch;
        }
        .event-cell {
          padding: 16px 20px;
          text-align: center;
        }

        /* ── Buttons ────────────────────────────────────────────────────── */
        .btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 13px 24px; border-radius: 3px;
          text-decoration: none; cursor: pointer;
          font-family: var(--bf);
          transition: transform 0.2s cubic-bezier(.16,1,.3,1), box-shadow 0.2s ease;
        }
        .btn-solid {
          background: var(--maroon);
          border: 1px solid rgba(110,20,35,0.35);
          box-shadow: 0 4px 18px rgba(110,20,35,0.22);
        }
        .btn-solid:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(110,20,35,0.32);
        }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--maroon);
        }
        .btn-outline:hover {
          transform: translateY(-2px);
          background: rgba(110,20,35,0.04);
        }

        /* ── Bottom rule ─────────────────────────────────────────────────── */
        .foot-rule {
          position: fixed; bottom: 0; left: 0; right: 0; height: 1px; z-index: 60;
          background: linear-gradient(90deg,
            transparent, var(--maroon) 25%, var(--gold) 50%, var(--maroon) 75%, transparent);
        }

        /* ── Mobile ─────────────────────────────────────────────────────── */
        @media (max-width: 600px) {
          .name-hero {
            font-size: clamp(4rem, 18vw, 6.5rem) !important;
          }
          .event-cell { padding: 12px 10px !important; }
          .event-cell .ev-label { font-size: 0.36rem !important; }
          .event-cell .ev-venue { font-size: 0.78rem !important; }
          .event-cell .ev-time  { font-size: 0.64rem !important; }
          .btn { padding: 12px 18px !important; font-size: 0.75rem !important; }
          .btn-row { flex-direction: column !important; align-items: stretch !important; width: 100% !important; }
          .content-shell { padding: 0 1.25rem 3rem !important; }
          .quote-text { font-size: 0.86rem !important; }
          .hero-names-wrap { padding: 0 1rem !important; }
        }
        @media (min-width: 601px) and (max-width: 900px) {
          .name-hero { font-size: clamp(5rem, 13vw, 8rem) !important; }
        }
      `}</style>

      {/* ── TICKER ─────────────────────────────────────────────────────────── */}
      <div className="ticker-shell fade">
        <div className="ticker-line" />
        <div className="ticker-bar">
          <div className="ticker-track">
            {Array(12).fill(null).map((_, i) => (
              <span key={i} className="ticker-item">
                {weddingConfig.celebrationTitle}
                <span className="t-gold"> ✦ </span>
                {date}
                <span className="t-gold"> ✦ </span>
                {weddingConfig.venueName}
                <span className="t-gold"> ✦ </span>
                {weddingConfig.venueCity}
                <span className="t-gold"> ✦ </span>
                {bf} &amp; {gf}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE — one full-height section, ivory background
      ══════════════════════════════════════════════════════════════════════ */}
      <main style={{
        minHeight: "100dvh",
        background: "var(--ivory)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "var(--bf)",
        overflowX: "hidden",
      }}>

        {/* ── FULL-BLEED PHOTO BAND ─────────────────────────────────────── */}
        {/* Sits behind the names, bleeds edge to edge, tinted ivory so it  */}
        {/* reads as atmosphere not as a photo. No split, no overlay seams. */}
        <div style={{
          position: "relative",
          width: "100%",
          height: "clamp(420px, 80vh, 720px)",
          overflow: "hidden",
          marginTop: "clamp(2.5rem, 5vh, 3.5rem)", // clear ticker
        }}>

          {/* Photo */}
          <div className="hero-bg" style={{
            position: "absolute", inset: "-6%",
            backgroundImage: `url(${heroPhoto})`,
            backgroundSize: "cover",
            backgroundPosition: "center 28%",
            // Desaturate and add warm ivory tint — feels editorial not moody
            filter: "saturate(0.30) brightness(0.96) sepia(0.12)",
          }} />

          {/* Full ivory wash — lighter at centre so photo whispers through */}
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(
              ellipse 80% 70% at 50% 42%,
              rgba(247,242,234,0.18) 0%,
              rgba(247,242,234,0.55) 55%,
              rgba(247,242,234,0.92) 100%
            )`,
          }} />

          {/* Top and bottom ivory bleed — merge seamlessly with page bg */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to bottom,
              var(--ivory) 0%,
              transparent 14%,
              transparent 78%,
              var(--ivory) 100%
            )`,
          }} />

          {/* ── Names centred over photo ── */}
          <div className="hero-names-wrap" style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center",
            padding: "0 2rem",
            gap: 0,
          }}>

            {/* Occasion eyebrow */}
            <div className="rise-0" style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: "clamp(1.2rem, 2.5vh, 2rem)",
            }}>
              <div style={{ width: 28, height: 1, background: "var(--gold)", opacity: 0.7 }} />
              <span style={{
                fontFamily: "var(--bf)",
                fontSize: "0.46rem", letterSpacing: "0.52em",
                textTransform: "uppercase", color: "var(--gold)", fontWeight: 700,
              }}>
                {weddingConfig.celebrationTitle}
              </span>
              <div style={{ width: 28, height: 1, background: "var(--gold)", opacity: 0.7 }} />
            </div>

            {/* MARION — near black, commanding */}
            <span className="name-hero name-a" style={{ color: "var(--ink)" }}>
              {bf}
            </span>

            {/* & — italic maroon, sits between names */}
            <span className="name-amp" style={{
              fontFamily: "var(--df)",
              fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
              fontWeight: 300, fontStyle: "italic",
              color: "var(--maroon)",
              letterSpacing: "0.12em",
              lineHeight: 1.1,
              display: "block", textAlign: "center",
              marginTop: "0.06em", marginBottom: "0.06em",
            }}>
              &amp;
            </span>

            {/* LIVINGSTON — maroon, depth and warmth */}
            <span className="name-hero name-b" style={{ color: "var(--maroon)" }}>
              {gf}
            </span>

          </div>
        </div>

        {/* ── CONTENT — centered, ivory bg ─────────────────────────────── */}
        <div className="content-shell" style={{
          width: "100%",
          maxWidth: "600px",
          padding: "0 2rem 4rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}>

          {/* Gold hairline rule */}
          <div className="rule-anim" style={{
            width: "min(200px, 55%)", height: 1,
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            marginBottom: "clamp(1.5rem, 3vh, 2.25rem)",
          }} />

          {/* Event cards — ceremony + reception */}
          <div className="event-grid rise-2">
            {/* Ceremony */}
            <div className="event-cell">
              <p className="ev-label" style={{
                fontFamily: "var(--bf)",
                fontSize: "0.42rem", letterSpacing: "0.40em",
                textTransform: "uppercase", color: "var(--gold)",
                fontWeight: 700, marginBottom: "0.45rem",
              }}>
                Ceremony
              </p>
              <p className="ev-venue" style={{
                fontFamily: "var(--df)",
                fontSize: "0.88rem", fontWeight: 600,
                color: "var(--ink)", lineHeight: 1.3, marginBottom: "0.3rem",
              }}>
                {weddingConfig.venueName}
              </p>
              <p className="ev-time" style={{
                fontFamily: "var(--bf)",
                fontSize: "0.68rem", color: "var(--stone)", lineHeight: 1.5,
              }}>
                {date} &middot; 3:00 pm
              </p>
            </div>

            <div className="event-divider" />

            {/* Reception */}
            <div className="event-cell">
              <p className="ev-label" style={{
                fontFamily: "var(--bf)",
                fontSize: "0.42rem", letterSpacing: "0.40em",
                textTransform: "uppercase", color: "var(--gold)",
                fontWeight: 700, marginBottom: "0.45rem",
              }}>
                Reception
              </p>
              <p className="ev-venue" style={{
                fontFamily: "var(--df)",
                fontSize: "0.88rem", fontWeight: 600,
                color: "var(--ink)", lineHeight: 1.3, marginBottom: "0.3rem",
              }}>
                {weddingConfig.receptionVenueName}
              </p>
              <p className="ev-time" style={{
                fontFamily: "var(--bf)",
                fontSize: "0.68rem", color: "var(--stone)", lineHeight: 1.5,
              }}>
                {date} &middot; 6:00 pm
              </p>
            </div>
          </div>

          {/* Thin rule below cards */}
          <div style={{
            width: "100%", maxWidth: "480px", height: 1,
            background: "var(--border)", marginTop: 0, marginBottom: "clamp(1.5rem, 3vh, 2rem)",
          }} />

          {/* Quote */}
          <blockquote className="rise-3 quote-text" style={{
            fontFamily: "var(--df)",
            fontStyle: "italic",
            fontSize: "clamp(0.86rem, 1.4vw, 0.98rem)",
            color: "var(--stone)",
            lineHeight: 1.95,
            textAlign: "center",
            maxWidth: "32rem",
            marginBottom: "clamp(1.75rem, 3vh, 2.5rem)",
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}>
            &ldquo;{weddingConfig.introQuote}&rdquo;
          </blockquote>

          {/* Private access label */}
          <div className="rise-4" style={{
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: "1.1rem", width: "100%",
          }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{
              fontFamily: "var(--bf)",
              fontSize: "0.43rem", letterSpacing: "0.44em",
              textTransform: "uppercase", color: "var(--stone)", fontWeight: 600,
            }}>
              Private access
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Buttons */}
          <div className="btn-row rise-5" style={{
            display: "flex", gap: "0.7rem",
            flexWrap: "wrap", justifyContent: "center",
            width: "100%",
          }}>
            {/* Couple — primary */}
            <a href="/login?hint=couple&redirect=/admin" className="btn btn-solid" style={{ flex: "1 1 200px" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
                <span style={{
                  fontSize: "0.42rem", letterSpacing: "0.30em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.60)",
                  fontWeight: 600,
                }}>The couple</span>
                <span style={{
                  fontSize: "0.82rem", fontWeight: 700, color: "#fff",
                  whiteSpace: "nowrap",
                }}>
                  {bf} &amp; {gf}
                </span>
              </span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.50)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>

            {/* Family — outline */}
            <a href="/login?hint=vault&redirect=/family" className="btn btn-outline" style={{ flex: "1 1 200px" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
                <span style={{
                  fontSize: "0.42rem", letterSpacing: "0.30em",
                  textTransform: "uppercase", color: "var(--stone)", fontWeight: 600,
                }}>Family vault</span>
                <span style={{
                  fontSize: "0.82rem", fontWeight: 700, color: "var(--maroon)",
                  whiteSpace: "nowrap",
                }}>
                  Family of the couple
                </span>
              </span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="var(--maroon)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, opacity: 0.65 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          {/* Guest footnote */}
          <p className="rise-6" style={{
            marginTop: "1.5rem",
            fontFamily: "var(--df)",
            fontStyle: "italic",
            fontSize: "0.68rem",
            color: "var(--stone)",
            textAlign: "center",
            lineHeight: 1.75,
            opacity: 0.70,
          }}>
            Are you a guest? Open the personal link that {bf} &amp; {gf} sent directly to you.
          </p>

        </div>
      </main>

      <div className="foot-rule" aria-hidden />
    </>
  );
}
