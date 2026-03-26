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
        html, body { height: 100%; }

        /* ── Keyframes ── */
        @keyframes slowZoom {
          0%   { transform: scale(1.00); }
          100% { transform: scale(1.07); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes pulseRing {
          0%, 100% { opacity: .5; transform: scale(1); }
          50%       { opacity: .9; transform: scale(1.04); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }

        /* ── Stagger reveals ── */
        .r1  { animation: fadeIn  1.0s 0.0s ease both; }
        .r2  { animation: fadeUp  0.9s 0.2s cubic-bezier(.22,1,.36,1) both; }
        .r3  { animation: fadeUp  1.0s 0.35s cubic-bezier(.22,1,.36,1) both; }
        .r4  { animation: fadeUp  1.0s 0.5s cubic-bezier(.22,1,.36,1) both; }
        .r5  { animation: fadeUp  1.0s 0.62s cubic-bezier(.22,1,.36,1) both; }
        .r6  { animation: fadeUp  0.9s 0.75s cubic-bezier(.22,1,.36,1) both; }
        .r7  { animation: fadeUp  0.9s 0.9s cubic-bezier(.22,1,.36,1) both; }
        .r8  { animation: fadeUp  0.9s 1.05s cubic-bezier(.22,1,.36,1) both; }
        .r9  { animation: fadeUp  0.9s 1.18s cubic-bezier(.22,1,.36,1) both; }
        .r10 { animation: fadeUp  0.8s 1.32s cubic-bezier(.22,1,.36,1) both; }

        .line-anim {
          transform-origin: center;
          animation: lineGrow 1.0s 0.8s ease both;
        }

        .hero-bg {
          animation: slowZoom 28s ease-in-out infinite alternate;
        }

        /* ── Ticker ── */
        .ticker-track {
          display: flex;
          gap: 3.5rem;
          white-space: nowrap;
          width: max-content;
          animation: ticker 60s linear infinite;
        }

        /* ── Access cards ── */
        .access-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 22px;
          border-radius: 20px;
          text-decoration: none;
          cursor: pointer;
          transition:
            transform 0.24s cubic-bezier(.22,1,.36,1),
            box-shadow 0.24s ease,
            background 0.18s ease,
            border-color 0.18s ease;
          flex: 1 1 230px;
          min-width: 0;
        }
        .card-couple {
          background: linear-gradient(135deg, #C0364A, #8C2436);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow:
            0 8px 32px rgba(192,54,74,0.40),
            0 2px 8px rgba(0,0,0,0.20),
            inset 0 1px 0 rgba(255,255,255,0.10);
        }
        .card-couple:hover {
          background: linear-gradient(135deg, #D0405A, #9C2846);
          transform: translateY(-4px) scale(1.015);
          box-shadow:
            0 18px 48px rgba(192,54,74,0.52),
            0 6px 16px rgba(0,0,0,0.22),
            inset 0 1px 0 rgba(255,255,255,0.14);
        }
        .card-family {
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.20);
          box-shadow: 0 6px 28px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .card-family:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(192,54,74,0.45);
          transform: translateY(-4px) scale(1.015);
          box-shadow: 0 18px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.10);
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .names-h1 { font-size: clamp(3.8rem, 17vw, 5.5rem) !important; }
          .ampersand { font-size: clamp(1.5rem, 6vw, 2.2rem) !important; }
          .content-pad { padding: 6rem 1.5rem 3rem !important; }
          .cards-row { flex-direction: column !important; }
          .detail-row { flex-direction: column !important; align-items: center !important; gap: 0.35rem !important; }
          .dot-sep { display: none !important; }
          .quote-block { display: none !important; }
          .footer-info { flex-direction: column !important; gap: 0.35rem !important; }
          .footer-dot { display: none !important; }
        }
        @media (min-width: 641px) and (max-width: 960px) {
          .names-h1 { font-size: clamp(4.5rem, 11vw, 7rem) !important; }
          .content-pad { padding: 7rem 3rem 3rem !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#0A0608",
        fontFamily: "var(--font-body), 'Manrope', system-ui, sans-serif",
      }}>

        {/* ── TICKER ── */}
        <div className="r1" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
          <div style={{
            height: 2,
            background: "linear-gradient(90deg, transparent 0%, #C0364A 20%, #D4AA3A 50%, #C0364A 80%, transparent 100%)",
          }} />
          <div style={{
            overflow: "hidden",
            padding: "7px 0",
            background: "rgba(10,6,8,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(192,54,74,0.16)",
          }}>
            <div className="ticker-track">
              {Array(14).fill(null).map((_, i) => (
                <span key={i} style={{
                  fontSize: "0.48rem",
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "rgba(212,170,58,0.72)",
                  fontWeight: 600,
                }}>
                  {weddingConfig.celebrationTitle}&nbsp;&nbsp;✦&nbsp;&nbsp;{date}&nbsp;&nbsp;✦&nbsp;&nbsp;{weddingConfig.venueName}&nbsp;&nbsp;✦&nbsp;&nbsp;{weddingConfig.venueCity}&nbsp;&nbsp;✦&nbsp;&nbsp;{bf} &amp; {gf}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════
            HERO
        ═══════════════════════════════════ */}
        <section style={{
          position: "relative",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>

          {/* Photo */}
          <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
            <div className="hero-bg" style={{
              position: "absolute",
              inset: "-5%",
              backgroundImage: `url(${heroPhoto})`,
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              filter: "saturate(0.35) brightness(0.38) contrast(1.08)",
            }} />
          </div>

          {/* Layered overlays — creates depth, not blankness */}
          {/* Base darkening — lets photo texture breathe */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, zIndex: 1,
            background: "linear-gradient(170deg, rgba(8,4,6,0.72) 0%, rgba(8,4,6,0.42) 40%, rgba(8,4,6,0.58) 70%, rgba(8,4,6,0.92) 100%)",
          }} />

          {/* Rose bloom — top-left atmospheric light */}
          <div aria-hidden style={{
            position: "absolute", zIndex: 2,
            top: "-10%", left: "-8%",
            width: "55%", height: "65%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(192,54,74,0.09) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          {/* Gold bloom — bottom right */}
          <div aria-hidden style={{
            position: "absolute", zIndex: 2,
            bottom: "-5%", right: "-6%",
            width: "50%", height: "55%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,170,58,0.07) 0%, transparent 62%)",
            pointerEvents: "none",
          }} />

          {/* Edge vignette */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, zIndex: 3,
            background: "radial-gradient(ellipse 85% 75% at 50% 44%, transparent 30%, rgba(6,3,5,0.62) 100%)",
          }} />

          {/* Top rose-gold stripe */}
          <div aria-hidden style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 4,
            background: "linear-gradient(90deg, transparent 5%, rgba(192,54,74,0.55) 28%, rgba(212,170,58,0.80) 50%, rgba(192,54,74,0.55) 72%, transparent 95%)",
          }} />

          {/* ── CONTENT ── */}
          <div className="content-pad" style={{
            position: "relative", zIndex: 10,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "8rem 2.5rem 5rem",
          }}>

            {/* Eyebrow */}
            <div className="r2" style={{
              display: "flex", alignItems: "center", gap: 14,
              marginBottom: "2rem",
            }}>
              <div style={{ width: 40, height: 1, background: "rgba(192,54,74,0.60)" }} />
              <span style={{
                fontSize: "0.52rem",
                letterSpacing: "0.50em",
                textTransform: "uppercase",
                color: "rgba(212,170,58,0.92)",
                fontWeight: 700,
              }}>
                {weddingConfig.celebrationTitle}
              </span>
              <div style={{ width: 40, height: 1, background: "rgba(192,54,74,0.60)" }} />
            </div>

            {/* Bride name */}
            <h1 className="names-h1 r3" style={{
              fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(4.5rem, 13vw, 9.5rem)",
              fontWeight: 300,
              lineHeight: 0.86,
              letterSpacing: "-0.03em",
              color: "rgba(255,248,242,0.96)",
              marginBottom: "0.06em",
              textShadow: "0 2px 40px rgba(0,0,0,0.40)",
            }}>
              {bf}
            </h1>

            {/* & */}
            <p className="ampersand r4" style={{
              fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.6rem, 4.5vw, 3.2rem)",
              fontWeight: 300,
              fontStyle: "italic",
              color: "rgba(192,54,74,0.85)",
              letterSpacing: "0.08em",
              lineHeight: 1.2,
              marginBottom: "0.04em",
            }}>
              &amp;
            </p>

            {/* Groom name */}
            <h1 className="names-h1 r5" style={{
              fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(4.5rem, 13vw, 9.5rem)",
              fontWeight: 300,
              lineHeight: 0.86,
              letterSpacing: "-0.03em",
              color: "rgba(232,220,196,0.88)",
              marginBottom: "1.75rem",
              textShadow: "0 2px 40px rgba(0,0,0,0.40)",
            }}>
              {gf}
            </h1>

            {/* Gold rule */}
            <div className="r6 line-anim" style={{
              width: "min(300px, 58%)", height: 1,
              background: "linear-gradient(90deg, transparent, rgba(212,170,58,0.80), transparent)",
              marginBottom: "1.75rem",
            }} />

            {/* Date · Venue · City */}
            <div className="detail-row r6" style={{
              display: "flex", alignItems: "center",
              flexWrap: "wrap", justifyContent: "center",
              gap: "0.875rem",
              marginBottom: "1.4rem",
            }}>
              <span style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "rgba(255,248,240,0.95)",
                letterSpacing: "0.05em",
              }}>
                {date}
              </span>
              <span className="dot-sep" style={{
                width: 4, height: 4, borderRadius: "50%",
                background: "rgba(192,54,74,0.80)",
                display: "inline-block", flexShrink: 0,
              }} />
              <span style={{
                fontSize: "0.9rem",
                color: "rgba(255,235,220,0.78)",
                fontWeight: 500,
                letterSpacing: "0.03em",
              }}>
                {weddingConfig.venueName}
              </span>
              <span className="dot-sep" style={{
                width: 4, height: 4, borderRadius: "50%",
                background: "rgba(212,170,58,0.60)",
                display: "inline-block", flexShrink: 0,
              }} />
              <span style={{
                fontSize: "0.9rem",
                color: "rgba(255,235,220,0.65)",
                fontWeight: 500,
                letterSpacing: "0.03em",
              }}>
                {weddingConfig.venueCity}
              </span>
            </div>

            {/* Quote */}
            <blockquote className="quote-block r7" style={{
              fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(0.95rem, 1.7vw, 1.1rem)",
              color: "rgba(255,235,218,0.68)",
              maxWidth: "36rem",
              lineHeight: 1.9,
              marginBottom: "3rem",
              padding: "0 1rem",
              borderLeft: "none",
            }}>
              &ldquo;{weddingConfig.introQuote}&rdquo;
            </blockquote>

            {/* Private access label */}
            <div className="r8" style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: "1.125rem",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#C0364A",
                animation: "floatDot 2.8s ease-in-out infinite",
                boxShadow: "0 0 8px rgba(192,54,74,0.60)",
              }} />
              <span style={{
                fontSize: "0.50rem",
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "rgba(255,220,210,0.70)",
                fontWeight: 700,
              }}>
                Private access
              </span>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#C0364A",
                animation: "floatDot 2.8s 1.4s ease-in-out infinite",
                boxShadow: "0 0 8px rgba(192,54,74,0.60)",
              }} />
            </div>

            {/* Access cards */}
            <div className="cards-row r9" style={{
              display: "flex",
              gap: "0.875rem",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "100%",
              maxWidth: 540,
            }}>

              {/* Couple */}
              <a href="/login?hint=couple&redirect=/admin" className="access-card card-couple">
                <div style={{
                  width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                  background: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  display: "grid", placeItems: "center",
                  fontSize: "1.25rem",
                }}>💍</div>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <p style={{
                    fontSize: "0.50rem", letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "rgba(255,200,200,0.80)",
                    fontWeight: 700, marginBottom: "0.3rem",
                  }}>The couple</p>
                  <p style={{
                    fontSize: "0.95rem", fontWeight: 700,
                    color: "#FFFFFF", lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}>{bf} &amp; {gf}</p>
                </div>
                <svg style={{ flexShrink: 0, color: "rgba(255,255,255,0.60)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>

              {/* Family */}
              <a href="/login?hint=vault&redirect=/family" className="access-card card-family">
                <div style={{
                  width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                  background: "rgba(192,54,74,0.14)",
                  border: "1px solid rgba(192,54,74,0.28)",
                  display: "grid", placeItems: "center",
                  fontSize: "1.25rem",
                }}>🫂</div>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <p style={{
                    fontSize: "0.50rem", letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "rgba(255,180,180,0.70)",
                    fontWeight: 700, marginBottom: "0.3rem",
                  }}>Family vault</p>
                  <p style={{
                    fontSize: "0.95rem", fontWeight: 700,
                    color: "rgba(255,245,240,0.95)", lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}>Family of the couple</p>
                </div>
                <svg style={{ flexShrink: 0, color: "rgba(192,54,74,0.80)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>

            </div>

            {/* Guest footnote */}
            <p className="r10" style={{
              marginTop: "1.75rem",
              fontSize: "0.76rem",
              color: "rgba(255,230,220,0.50)",
              fontStyle: "italic",
              letterSpacing: "0.02em",
              maxWidth: "38rem",
              textAlign: "center",
              lineHeight: 1.7,
              padding: "0 1rem",
            }}>
              Are you a guest? Open the personal invitation link that {bf} &amp; {gf} sent directly to you.
            </p>

          </div>

          {/* ── FOOTER INFO BAR ── */}
          <div style={{
            position: "relative", zIndex: 10,
            padding: "1rem 2.5rem 1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(8,4,6,0.70)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}>
            <div className="footer-info" style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "0.875rem",
            }}>
              {/* Venue 1 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="12" height="12" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <line x1="9" y1="1" x2="9" y2="17" stroke="rgba(192,54,74,0.75)" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="3" y1="6" x2="15" y2="6" stroke="rgba(192,54,74,0.75)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span style={{
                  fontSize: "0.68rem", fontWeight: 600,
                  color: "rgba(255,240,235,0.82)",
                  letterSpacing: "0.04em",
                }}>
                  Divine Mercy Church &middot; 3 PM
                </span>
              </div>

              <span className="footer-dot" style={{
                width: 3, height: 3, borderRadius: "50%",
                background: "rgba(212,170,58,0.55)",
                display: "inline-block", flexShrink: 0,
              }} />

              {/* Venue 2 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="18" height="10" viewBox="0 0 22 12" fill="none" aria-hidden>
                  <path d="M1 6 Q4 2 7 6 Q10 10 13 6 Q16 2 19 6" stroke="rgba(212,170,58,0.75)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                </svg>
                <span style={{
                  fontSize: "0.68rem", fontWeight: 600,
                  color: "rgba(255,240,225,0.68)",
                  letterSpacing: "0.04em",
                }}>
                  Blue Bay Beach Resort &middot; 6 PM
                </span>
              </div>

              <span className="footer-dot" style={{
                width: 3, height: 3, borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                display: "inline-block", flexShrink: 0,
              }} />

              {/* Date */}
              <span style={{
                fontSize: "0.68rem", fontWeight: 600,
                color: "rgba(255,248,240,0.50)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                {date}
              </span>

              <span className="footer-dot" style={{
                width: 3, height: 3, borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                display: "inline-block", flexShrink: 0,
              }} />

              {/* Couples names */}
              <span style={{
                fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                fontSize: "0.82rem", fontWeight: 400,
                fontStyle: "italic",
                color: "rgba(255,240,230,0.42)",
                letterSpacing: "0.06em",
              }}>
                {bf} &amp; {gf}
              </span>
            </div>
          </div>

        </section>

        {/* Bottom rule */}
        <div aria-hidden style={{
          position: "fixed", bottom: 0, left: 0, right: 0, height: 2, zIndex: 50,
          background: "linear-gradient(90deg, transparent 0%, #C0364A 20%, #D4AA3A 50%, #C0364A 80%, transparent 100%)",
        }} />

      </div>
    </>
  );
}
