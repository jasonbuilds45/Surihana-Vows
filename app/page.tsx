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
        html, body { height: 100%; overflow-x: hidden; background: #F7F2EA; }

        /* ── Palette ─────────────────────────────────────────────────────── */
        :root {
          --ivory:  #F7F2EA;
          --cream:  #EDE5D8;
          --maroon: #6E1423;
          --gold:   #A8882A;
          --ink:    #1C1008;
          --stone:  #5C4A3A;
          --border: rgba(168,136,42,0.22);
          --df: var(--font-display), 'Cormorant Garamond', Georgia, serif;
          --bf: var(--font-body), 'Manrope', system-ui, sans-serif;
        }

        /* ── Keyframes ───────────────────────────────────────────────────── */
        @keyframes slowZoom {
          from { transform: scale(1.00); }
          to   { transform: scale(1.06); }
        }
        @keyframes tickerMove {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes nameReveal {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(24px); }
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

        /* ── Reveals ─────────────────────────────────────────────────────── */
        .fade     { animation: fadeIn    1.2s 0.00s ease both; }
        .rise-0   { animation: riseIn   0.9s 0.10s cubic-bezier(.16,1,.3,1) both; }
        .name-a   { animation: nameReveal 1.1s 0.28s cubic-bezier(.16,1,.3,1) both; }
        .name-amp { animation: nameReveal 0.8s 0.50s cubic-bezier(.16,1,.3,1) both; }
        .name-b   { animation: nameReveal 1.1s 0.44s cubic-bezier(.16,1,.3,1) both; }
        .rise-2   { animation: riseIn   0.9s 0.60s cubic-bezier(.16,1,.3,1) both; }
        .rise-3   { animation: riseIn   0.9s 0.74s cubic-bezier(.16,1,.3,1) both; }
        .rise-4   { animation: riseIn   0.9s 0.88s cubic-bezier(.16,1,.3,1) both; }
        .rise-5   { animation: riseIn   0.9s 1.02s cubic-bezier(.16,1,.3,1) both; }
        .rise-6   { animation: riseIn   0.9s 1.16s cubic-bezier(.16,1,.3,1) both; }
        .rule-anim {
          transform-origin: center;
          animation: ruleExpand 1.0s 0.58s ease both;
        }

        /* ── Ticker ──────────────────────────────────────────────────────── */
        .ticker-shell {
          position: fixed; top: 0; left: 0; right: 0; z-index: 60;
        }
        .ticker-line {
          height: 1px;
          background: linear-gradient(90deg,
            transparent, var(--maroon) 25%, var(--gold) 50%, var(--maroon) 75%, transparent);
        }
        .ticker-bar {
          overflow: hidden;
          padding: 6px 0;
          background: rgba(247,242,234,0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .ticker-track {
          display: flex; gap: 3rem;
          white-space: nowrap; width: max-content;
          animation: tickerMove 68s linear infinite;
        }
        .ticker-item {
          font-family: var(--bf);
          font-size: 0.47rem;
          letter-spacing: 0.44em;
          text-transform: uppercase;
          color: var(--stone);
          font-weight: 600;
        }
        .t-gold { color: var(--gold); }

        /* ── Photo band ──────────────────────────────────────────────────── */
        .hero-bg { animation: slowZoom 26s ease-in-out infinite alternate; }

        /* ── Name sizes — the hero centrepiece ───────────────────────────── */
        /* Desktop: up to 11rem. Tablet: ~8rem. Mobile: 3.6rem floor.        */
        .name-hero {
          font-family: var(--df);
          font-size: clamp(3.6rem, 11vw, 11rem);
          font-weight: 300;
          line-height: 0.90;
          letter-spacing: -0.02em;
          display: block;
          text-align: center;
        }

        /* ── Event grid ──────────────────────────────────────────────────── */
        .event-grid {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          width: 100%;
          max-width: 460px;
        }
        .event-divider { background: var(--border); align-self: stretch; }
        .event-cell    { padding: 18px 20px; text-align: center; }

        /* ── Buttons ─────────────────────────────────────────────────────── */
        .btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 22px; border-radius: 3px;
          text-decoration: none; cursor: pointer;
          font-family: var(--bf);
          transition: transform 0.2s cubic-bezier(.16,1,.3,1), box-shadow 0.2s ease;
        }
        .btn-solid {
          background: var(--maroon);
          border: 1px solid rgba(110,20,35,0.35);
          box-shadow: 0 4px 18px rgba(110,20,35,0.24);
        }
        .btn-solid:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(110,20,35,0.34);
        }
        .btn-outline {
          background: transparent;
          border: 1px solid rgba(110,20,35,0.55);
        }
        .btn-outline:hover {
          transform: translateY(-2px);
          background: rgba(110,20,35,0.04);
        }

        /* ── Bottom rule ─────────────────────────────────────────────────── */
        .foot-rule {
          position: fixed; bottom: 0; left: 0; right: 0;
          height: 1px; z-index: 60;
          background: linear-gradient(90deg,
            transparent, var(--maroon) 25%, var(--gold) 50%, var(--maroon) 75%, transparent);
        }

        /* ────────────────────────────────────────────────────────────────────
           MOBILE — ≤600px
           Everything explicit. No clamp() that collapses at small sizes.
        ──────────────────────────────────────────────────────────────────── */
        @media (max-width: 600px) {

          /* Names: bold and commanding on a phone */
          .name-hero { font-size: 13vw !important; letter-spacing: -0.015em !important; }

          /* Photo band: shorter on mobile so content is visible below fold */
          .photo-band { height: 60vw !important; min-height: 220px !important; max-height: 320px !important; }

          /* Eyebrow above names */
          .hero-eyebrow { margin-bottom: 0.75rem !important; }
          .hero-eyebrow span { font-size: 0.42rem !important; letter-spacing: 0.32em !important; }

          /* Ampersand */
          .name-amp-elem { font-size: 8vw !important; }

          /* Content shell */
          .content-shell { padding: 0 1.25rem 3.5rem !important; }

          /* Gold rule */
          .top-rule { margin-bottom: 1.25rem !important; }

          /* Event cards — stay 2-col but smaller */
          .event-cell { padding: 12px 10px !important; }
          .ev-label   { font-size: 0.38rem !important; letter-spacing: 0.28em !important; margin-bottom: 0.3rem !important; }
          .ev-venue   { font-size: 0.82rem !important; line-height: 1.25 !important; margin-bottom: 0.2rem !important; }
          .ev-time    { font-size: 0.66rem !important; }

          /* Rule between cards and quote */
          .cards-rule { margin-bottom: 1.25rem !important; }

          /* Quote */
          .quote-text {
            font-size: 0.88rem !important;
            line-height: 1.80 !important;
            padding: 0.9rem 1rem !important;
            margin-bottom: 1.5rem !important;
          }

          /* Private access divider */
          .access-label span { font-size: 0.40rem !important; letter-spacing: 0.30em !important; }
          .access-label { margin-bottom: 0.9rem !important; }

          /* Buttons — full width stacked */
          .btn-row   { flex-direction: column !important; gap: 0.6rem !important; }
          .btn       { padding: 13px 18px !important; width: 100% !important; justify-content: space-between !important; }
          .btn-label-top   { font-size: 0.40rem !important; }
          .btn-label-name  { font-size: 0.82rem !important; }

          /* Footnote */
          .footnote { font-size: 0.70rem !important; margin-top: 1.25rem !important; }
        }

        /* ── Tablet ───────────────────────────────────────────────────────── */
        @media (min-width: 601px) and (max-width: 960px) {
          .name-hero  { font-size: clamp(4rem, 10vw, 7.5rem) !important; }
          .photo-band { height: 55vh !important; }
          .content-shell { padding: 0 2rem 4rem !important; }
        }
      `}</style>

      {/* ── TICKER ───────────────────────────────────────────────────────── */}
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

      {/* ══════════════════════════════════════════════════════════════════
          PAGE
      ══════════════════════════════════════════════════════════════════ */}
      <main style={{
        minHeight: "100dvh",
        background: "var(--ivory)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "var(--bf)",
        overflowX: "hidden",
      }}>

        {/* ── PHOTO BAND with names ─────────────────────────────────────── */}
        <div className="photo-band" style={{
          position: "relative",
          width: "100%",
          height: "clamp(300px, 78vh, 700px)",
          overflow: "hidden",
          marginTop: "clamp(2rem, 4.5vh, 3.5rem)",
        }}>

          {/* Photo — more visible now: brightness 0.88, saturate 0.50 */}
          {/* Enough warmth and texture that it feels atmospheric,        */}
          {/* not so washed it looks blank.                               */}
          <div className="hero-bg" style={{
            position: "absolute", inset: "-6%",
            backgroundImage: `url(${heroPhoto})`,
            backgroundSize: "cover",
            backgroundPosition: "center 28%",
            filter: "saturate(0.50) brightness(0.88) sepia(0.10)",
          }} />

          {/* Ivory overlay — only top 18% and bottom 22% fade to page bg  */}
          {/* Centre is open so the photo is clearly visible               */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to bottom,
              var(--ivory) 0%,
              rgba(247,242,234,0.10) 18%,
              rgba(247,242,234,0.10) 75%,
              var(--ivory) 100%
            )`,
          }} />

          {/* Very light centre brightener — keeps names readable without   */}
          {/* killing the photo. White at 35% opacity only in the middle.   */}
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(
              ellipse 70% 55% at 50% 46%,
              rgba(247,242,234,0.42) 0%,
              transparent 100%
            )`,
          }} />

          {/* ── Names centred over photo ─────────────────────────────── */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center",
            padding: "0 1.5rem",
          }}>

            {/* Eyebrow label */}
            <div className="rise-0 hero-eyebrow" style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: "clamp(1rem, 2.5vh, 1.75rem)",
            }}>
              <div style={{ width: 26, height: 1, background: "var(--gold)" }} />
              <span style={{
                fontFamily: "var(--bf)",
                fontSize: "0.47rem",
                letterSpacing: "0.48em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 700,
              }}>
                {weddingConfig.celebrationTitle}
              </span>
              <div style={{ width: 26, height: 1, background: "var(--gold)" }} />
            </div>

            {/* MARION */}
            <span className="name-hero name-a" style={{
              color: "var(--ink)",
              /* Subtle text shadow so name reads over any photo brightness */
              textShadow: "0 2px 32px rgba(247,242,234,0.60)",
            }}>
              {bf}
            </span>

            {/* & */}
            <span className="name-amp name-amp-elem" style={{
              fontFamily: "var(--df)",
              fontSize: "clamp(1.6rem, 4.5vw, 3.2rem)",
              fontWeight: 300,
              fontStyle: "italic",
              color: "var(--maroon)",
              letterSpacing: "0.14em",
              lineHeight: 1.1,
              display: "block",
              marginTop: "0.05em",
              marginBottom: "0.05em",
            }}>
              &amp;
            </span>

            {/* LIVINGSTON */}
            <span className="name-hero name-b" style={{
              color: "var(--maroon)",
              textShadow: "0 2px 32px rgba(247,242,234,0.55)",
            }}>
              {gf}
            </span>

          </div>
        </div>

        {/* ── CONTENT BELOW PHOTO ──────────────────────────────────────── */}
        <div className="content-shell" style={{
          width: "100%",
          maxWidth: "560px",
          padding: "0 2.25rem 5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>

          {/* Hairline gold rule */}
          <div className="rule-anim top-rule" style={{
            width: "min(180px, 50%)", height: 1,
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            marginBottom: "clamp(1.5rem, 3vh, 2rem)",
          }} />

          {/* Event cards */}
          <div className="event-grid rise-2">
            <div className="event-cell">
              <p className="ev-label" style={{
                fontFamily: "var(--bf)",
                fontSize: "0.44rem",
                letterSpacing: "0.40em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 700,
                marginBottom: "0.45rem",
              }}>
                Ceremony
              </p>
              <p className="ev-venue" style={{
                fontFamily: "var(--df)",
                fontSize: "0.90rem",
                fontWeight: 600,
                color: "var(--ink)",
                lineHeight: 1.3,
                marginBottom: "0.3rem",
              }}>
                {weddingConfig.venueName}
              </p>
              <p className="ev-time" style={{
                fontFamily: "var(--bf)",
                fontSize: "0.70rem",
                color: "var(--stone)",
                lineHeight: 1.5,
              }}>
                {date} &middot; 3:00 pm
              </p>
            </div>

            <div className="event-divider" />

            <div className="event-cell">
              <p className="ev-label" style={{
                fontFamily: "var(--bf)",
                fontSize: "0.44rem",
                letterSpacing: "0.40em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 700,
                marginBottom: "0.45rem",
              }}>
                Reception
              </p>
              <p className="ev-venue" style={{
                fontFamily: "var(--df)",
                fontSize: "0.90rem",
                fontWeight: 600,
                color: "var(--ink)",
                lineHeight: 1.3,
                marginBottom: "0.3rem",
              }}>
                {weddingConfig.receptionVenueName}
              </p>
              <p className="ev-time" style={{
                fontFamily: "var(--bf)",
                fontSize: "0.70rem",
                color: "var(--stone)",
                lineHeight: 1.5,
              }}>
                {date} &middot; 6:00 pm
              </p>
            </div>
          </div>

          {/* Rule below cards */}
          <div className="cards-rule" style={{
            width: "100%", height: 1,
            background: "var(--border)",
            marginBottom: "clamp(1.5rem, 3vh, 2rem)",
          }} />

          {/* Quote */}
          <blockquote className="rise-3 quote-text" style={{
            fontFamily: "var(--df)",
            fontStyle: "italic",
            fontSize: "clamp(0.90rem, 1.6vw, 1.0rem)",
            color: "var(--stone)",
            lineHeight: 1.92,
            textAlign: "center",
            width: "100%",
            marginBottom: "clamp(1.75rem, 3vh, 2.25rem)",
            padding: "1rem 1.25rem",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}>
            &ldquo;{weddingConfig.introQuote}&rdquo;
          </blockquote>

          {/* Private access label */}
          <div className="rise-4 access-label" style={{
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: "1.1rem", width: "100%",
          }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{
              fontFamily: "var(--bf)",
              fontSize: "0.44rem",
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "var(--stone)",
              fontWeight: 600,
            }}>
              Private access
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Buttons */}
          <div className="btn-row rise-5" style={{
            display: "flex", gap: "0.75rem",
            flexWrap: "wrap", justifyContent: "center",
            width: "100%",
          }}>

            {/* Couple */}
            <a href="/login?hint=couple&redirect=/admin"
              className="btn btn-solid"
              style={{ flex: "1 1 195px" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                <span className="btn-label-top" style={{
                  fontSize: "0.42rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.58)",
                  fontWeight: 600,
                }}>
                  The couple
                </span>
                <span className="btn-label-name" style={{
                  fontSize: "0.86rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  whiteSpace: "nowrap",
                }}>
                  {bf} &amp; {gf}
                </span>
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.48)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>

            {/* Family */}
            <a href="/login?hint=vault&redirect=/family"
              className="btn btn-outline"
              style={{ flex: "1 1 195px" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                <span className="btn-label-top" style={{
                  fontSize: "0.42rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "var(--stone)",
                  fontWeight: 600,
                }}>
                  Family vault
                </span>
                <span className="btn-label-name" style={{
                  fontSize: "0.86rem",
                  fontWeight: 700,
                  color: "var(--maroon)",
                  whiteSpace: "nowrap",
                }}>
                  Family of the couple
                </span>
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="var(--maroon)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, opacity: 0.60 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>

          </div>

          {/* Guest footnote */}
          <p className="rise-6 footnote" style={{
            marginTop: "1.5rem",
            fontFamily: "var(--df)",
            fontStyle: "italic",
            fontSize: "0.70rem",
            color: "var(--stone)",
            textAlign: "center",
            lineHeight: 1.75,
            opacity: 0.72,
          }}>
            Are you a guest? Open the personal link that {bf} &amp; {gf} sent directly to you.
          </p>

        </div>
      </main>

      <div className="foot-rule" aria-hidden />
    </>
  );
}
