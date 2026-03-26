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
        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #F5EDE4; }

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
          from { opacity: 0; transform: translateY(22px); }
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
        @keyframes shimmerBtn {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }

        /* ── Reveals ── */
        .r1  { animation: fadeIn  1.0s 0.0s ease both; }
        .r2  { animation: fadeUp  0.8s 0.3s cubic-bezier(.22,1,.36,1) both; }
        .r3  { animation: fadeUp  0.9s 0.5s cubic-bezier(.22,1,.36,1) both; }
        .r4  { animation: fadeUp  0.9s 0.65s cubic-bezier(.22,1,.36,1) both; }
        .r5  { animation: fadeUp  0.8s 0.8s cubic-bezier(.22,1,.36,1) both; }
        .r6  { animation: fadeUp  0.8s 0.95s cubic-bezier(.22,1,.36,1) both; }
        .r7  { animation: fadeUp  0.8s 1.1s cubic-bezier(.22,1,.36,1) both; }
        .r8  { animation: fadeUp  0.8s 1.25s cubic-bezier(.22,1,.36,1) both; }
        .r9  { animation: fadeUp  0.8s 1.4s cubic-bezier(.22,1,.36,1) both; }
        .r10 { animation: fadeUp  0.8s 1.55s cubic-bezier(.22,1,.36,1) both; }

        .line-anim {
          transform-origin: left;
          animation: lineGrow 0.9s 1.0s ease both;
        }

        /* ── Photo background ── */
        .hero-bg {
          animation: slowZoom 25s ease-in-out infinite alternate;
        }

        /* ── Buttons ── */
        .login-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          border-radius: 16px;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(.22,1,.36,1),
                      box-shadow 0.22s ease,
                      background 0.2s ease;
        }
        .btn-couple {
          background: #7E1628;
          border: 1px solid rgba(126,22,40,0.30);
          box-shadow: 0 6px 28px rgba(126,22,40,0.35), 0 2px 8px rgba(0,0,0,0.12);
        }
        .btn-couple:hover {
          background: #6B1020;
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 12px 40px rgba(126,22,40,0.45), 0 4px 12px rgba(0,0,0,0.14);
        }
        .btn-family {
          background: rgba(245,237,228,0.88);
          border: 1.5px solid rgba(126,22,40,0.28);
          box-shadow: 0 4px 20px rgba(126,22,40,0.10);
        }
        .btn-family:hover {
          background: rgba(255,252,248,0.96);
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 10px 32px rgba(126,22,40,0.18);
          border-color: rgba(126,22,40,0.48);
        }

        /* ── Desktop: show full cards, hide pills ── */
        .btn-desktop { display: flex !important; }
        .btn-mobile-pill { display: none !important; }

        /* ── Mobile pill buttons ── */
        .btn-mobile-pill {
          display: none;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 999px;
          text-decoration: none;
          font-family: var(--font-body), system-ui, sans-serif;
          font-weight: 700;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          white-space: nowrap;
        }
        .btn-mobile-pill:hover { transform: translateY(-2px); }
        .btn-mobile-couple {
          background: #7E1628;
          border: 1px solid rgba(126,22,40,0.30);
          box-shadow: 0 4px 16px rgba(126,22,40,0.32);
        }
        .btn-mobile-couple:hover { background: #6B1020; }
        .btn-mobile-family {
          background: rgba(245,237,228,0.90);
          border: 1.5px solid rgba(126,22,40,0.28);
          box-shadow: 0 4px 16px rgba(126,22,40,0.10);
          backdrop-filter: blur(10px);
        }
        .btn-mobile-family:hover { background: rgba(255,252,248,0.98); }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .hero-section { min-height: 100dvh !important; }
          .names-h1 { font-size: clamp(3.5rem, 16vw, 5.5rem) !important; }
          .ampersand { font-size: clamp(1.5rem, 6vw, 2.5rem) !important; }
          /* Hide desktop cards, show pills */
          .btn-desktop { display: none !important; }
          .btn-mobile-pill { display: inline-flex !important; }
          /* Pills sit side by side, centred */
          .btn-row { flex-direction: row !important; flex-wrap: nowrap !important; justify-content: center !important; }
          .content-wrap {
            padding: 6rem 1.5rem 2.5rem !important;
            justify-content: flex-start !important;
          }
          .detail-row { flex-wrap: wrap !important; gap: 0.3rem !important; padding: 0.4rem 0.7rem !important; border-radius: 999px !important; }
          .detail-row span, .detail-row div { font-size: 0.62rem !important; }
          .detail-row svg { width: 8px !important; height: 8px !important; }
          .photo-strip { display: none !important; }
          .quote-text { font-size: 0.95rem !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .names-h1 { font-size: clamp(4rem, 10vw, 6.5rem) !important; }
          .content-wrap { padding: 7rem 3rem 3rem !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════
          PAGE SHELL
      ═══════════════════════════════════════════════ */}
      <div style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#F5EDE4",
        fontFamily: "var(--font-body), system-ui, sans-serif",
      }}>

        {/* ── TOP TICKER ── */}
        <div className="r1" style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        }}>
          {/* Rose-gold rule */}
          <div style={{
            height: 2,
            background: "linear-gradient(90deg, transparent 0%, #7E1628 20%, #B8973A 50%, #7E1628 80%, transparent 100%)",
          }} />
          {/* Ticker bar */}
          <div style={{
            overflow: "hidden",
            padding: "7px 0",
            background: "rgba(245,237,228,0.94)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(126,22,40,0.14)",
          }}>
            <div style={{
              display: "flex", gap: "4rem",
              whiteSpace: "nowrap", width: "max-content",
              animation: "ticker 55s linear infinite",
            }}>
              {Array(16).fill(null).map((_, i) => (
                <span key={i} style={{
                  fontSize: "0.5rem",
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  color: "rgba(126,22,40,0.72)",
                  fontFamily: "var(--font-body), system-ui, sans-serif",
                  fontWeight: 600,
                }}>
                  {weddingConfig.celebrationTitle}&nbsp;&nbsp;✦&nbsp;&nbsp;{date}&nbsp;&nbsp;✦&nbsp;&nbsp;{weddingConfig.venueName}&nbsp;&nbsp;✦&nbsp;&nbsp;{weddingConfig.venueCity}&nbsp;&nbsp;✦&nbsp;&nbsp;{bf} &amp; {gf}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════ */}
        <section className="hero-section" style={{
          position: "relative",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>

          {/* ── Hero photo ── */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, zIndex: 0, overflow: "hidden",
          }}>
            <div className="hero-bg" style={{
              position: "absolute", inset: "-5%",
              backgroundImage: `url(${heroPhoto})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              filter: "saturate(0.55) brightness(0.88)",
            }} />
          </div>

          {/* Overlay */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, zIndex: 1,
            background: `
              linear-gradient(to bottom,
                rgba(245,237,228,0.80) 0%,
                rgba(245,237,228,0.60) 22%,
                rgba(245,237,228,0.50) 45%,
                rgba(245,237,228,0.80) 68%,
                rgba(245,237,228,0.97) 100%
              )
            `,
          }} />

          {/* Warm side vignette */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, zIndex: 2,
            background: "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 40%, rgba(245,237,228,0.55) 100%)",
          }} />

          {/* ── Content ── */}
          <div className="content-wrap" style={{
            position: "relative", zIndex: 10,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "8rem 2rem 4rem",
            gap: 0,
          }}>

            {/* ── Brand eyebrow ── */}
            <div className="r2" style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: "1.75rem",
            }}>
              <div style={{ width: 36, height: 1, background: "rgba(184,151,58,0.55)" }} />
              <span style={{
                fontSize: "0.56rem", letterSpacing: "0.44em",
                textTransform: "uppercase",
                color: "#8A6C1C",
                fontWeight: 700,
              }}>
                {weddingConfig.celebrationTitle}
              </span>
              <div style={{ width: 36, height: 1, background: "rgba(184,151,58,0.55)" }} />
            </div>

            {/* ── BRIDE name ── */}
            <h1 className="names-h1 r3" style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: "clamp(4rem, 12vw, 8.5rem)",
              fontWeight: 700,
              lineHeight: 0.88,
              letterSpacing: "-0.035em",
              color: "#1A0D0A",
              marginBottom: "0.06em",
            }}>
              {bf}
            </h1>

            {/* ── & ── */}
            <p className="ampersand r4" style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: "clamp(1.5rem, 4vw, 3rem)",
              fontWeight: 300,
              fontStyle: "italic",
              color: "#7E1628",
              letterSpacing: "0.06em",
              lineHeight: 1.2,
              marginBottom: "0.04em",
            }}>
              &amp;
            </p>

            {/* ── GROOM name ── */}
            <h1 className="names-h1 r4" style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: "clamp(4rem, 12vw, 8.5rem)",
              fontWeight: 700,
              lineHeight: 0.88,
              letterSpacing: "-0.035em",
              color: "#7E1628",
              marginBottom: "1.5rem",
            }}>
              {gf}
            </h1>

            {/* ── Gold rule ── */}
            <div className="r5 line-anim" style={{
              width: "min(280px, 60%)", height: 1,
              background: "linear-gradient(90deg, transparent, rgba(184,151,58,0.85), transparent)",
              marginBottom: "1.5rem",
            }} />

            {/* ── Date · Venue · City ── */}
            <div className="detail-row r6" style={{
              display: "flex", alignItems: "center",
              flexWrap: "wrap", justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "1.25rem",
              padding: "0.6rem 1rem",
              background: "rgba(245,237,228,0.68)",
              borderRadius: "999px",
              border: "1px solid rgba(184,151,58,0.28)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}>
              {/* Date chip */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <rect x="1" y="2" width="12" height="11" rx="2" stroke="#B8973A" strokeWidth="1.4"/>
                  <line x1="1" y1="5" x2="13" y2="5" stroke="#B8973A" strokeWidth="1.4"/>
                  <line x1="4" y1="1" x2="4" y2="4" stroke="#B8973A" strokeWidth="1.4" strokeLinecap="round"/>
                  <line x1="10" y1="1" x2="10" y2="4" stroke="#B8973A" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#3D1018", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
                  {date}
                </span>
              </div>
              {/* Diamond separator */}
              <span style={{ color: "#B8973A", fontSize: "0.55rem", lineHeight: 1, flexShrink: 0 }}>✦</span>
              {/* Venue chip */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <svg width="10" height="12" viewBox="0 0 12 16" fill="none" aria-hidden>
                  <path d="M6 1C3.24 1 1 3.24 1 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5z" stroke="#B8973A" strokeWidth="1.4" fill="none"/>
                  <circle cx="6" cy="6" r="1.5" fill="#B8973A"/>
                </svg>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#5A1A28", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
                  {weddingConfig.venueName}
                </span>
              </div>
              {/* Diamond separator */}
              <span style={{ color: "#B8973A", fontSize: "0.55rem", lineHeight: 1, flexShrink: 0 }}>✦</span>
              {/* City chip */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <svg width="12" height="10" viewBox="0 0 14 12" fill="none" aria-hidden>
                  <path d="M1 11V5l4-4 4 4v6" stroke="#B8973A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <rect x="5" y="7" width="2" height="4" rx="0.5" fill="#B8973A"/>
                  <path d="M9 11V7l3-2v6" stroke="#B8973A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#5A1A28", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
                  {weddingConfig.venueCity}
                </span>
              </div>
            </div>

            {/* ── Quote ── */}
            <p className="quote-text r7" style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontStyle: "italic",
              fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)",
              color: "#1A0D0A",
              maxWidth: "34rem",
              lineHeight: 1.85,
              marginBottom: "2.75rem",
              padding: "0.75rem 1.25rem",
              background: "rgba(245,237,228,0.72)",
              borderRadius: "12px",
              border: "1px solid rgba(184,151,58,0.22)",
            }}>
              &ldquo;{weddingConfig.introQuote}&rdquo;
            </p>

            {/* ── Private access label ── */}
            <div className="r8" style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: "1rem",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#B8973A", animation: "floatDot 2.5s ease-in-out infinite" }} />
              <span style={{ fontSize: "0.54rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#3D1018", fontWeight: 700 }}>
                Private access
              </span>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#B8973A", animation: "floatDot 2.5s 1.25s ease-in-out infinite" }} />
            </div>

            {/* ── TWO BUTTONS ── */}
            <div className="btn-row r9" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 520 }}>

              {/* Couple — desktop */}
              <a href="/login?hint=couple&redirect=/admin" className="login-btn btn-couple btn-desktop" style={{ flex: "1 1 220px" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.30)", display: "grid", placeItems: "center", fontSize: "1.2rem" }}>💍</div>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <p style={{ fontSize: "0.52rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)", fontWeight: 700, marginBottom: "0.25rem" }}>The couple</p>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2, whiteSpace: "nowrap" }}>{bf} &amp; {gf}</p>
                </div>
                <svg style={{ flexShrink: 0, color: "rgba(255,255,255,0.65)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>

              {/* Couple — mobile pill */}
              <a href="/login?hint=couple&redirect=/admin" className="btn-mobile-pill btn-mobile-couple">
                <span style={{ fontSize: "1rem" }}>💍</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>Couple login</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>

              {/* Family — desktop */}
              <a href="/login?hint=vault&redirect=/family" className="login-btn btn-family btn-desktop" style={{ flex: "1 1 220px" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "rgba(126,22,40,0.08)", border: "1px solid rgba(126,22,40,0.22)", display: "grid", placeItems: "center", fontSize: "1.2rem" }}>🫂</div>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <p style={{ fontSize: "0.52rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#7E1628", fontWeight: 700, marginBottom: "0.25rem" }}>Family vault</p>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#3D1018", lineHeight: 1.2, whiteSpace: "nowrap" }}>Family of the couple</p>
                </div>
                <svg style={{ flexShrink: 0, color: "#7E1628" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>

              {/* Family — mobile pill */}
              <a href="/login?hint=vault&redirect=/family" className="btn-mobile-pill btn-mobile-family">
                <span style={{ fontSize: "1rem" }}>🫂</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#3D1018" }}>Family login</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7E1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>

            </div>

            {/* ── Guest footnote ── */}
            <p className="r10" style={{
              marginTop: "1.5rem",
              fontSize: "0.72rem",
              color: "#4A1520",
              fontStyle: "italic",
              letterSpacing: "0.02em",
              maxWidth: "36rem",
              textAlign: "center",
              lineHeight: 1.6,
              padding: "0 1rem",
            }}>
              Are you a guest? Open the personal invitation link that {bf} &amp; {gf} sent directly to you.
            </p>

          </div>
        </section>

        {/* ── BOTTOM RULE ── */}
        <div aria-hidden style={{
          position: "fixed", bottom: 0, left: 0, right: 0, height: 2, zIndex: 50,
          background: "linear-gradient(90deg, transparent 0%, #7E1628 20%, #B8973A 50%, #7E1628 80%, transparent 100%)",
        }} />

      </div>
    </>
  );
}
