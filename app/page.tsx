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

  // Use up to 3 photos for the triptych — fallback to one Unsplash image
  const photos = [
    slides[0]?.imageUrl ?? "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85",
    slides[1]?.imageUrl ?? "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=85",
    slides[2]?.imageUrl ?? "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85",
  ];

  const bf  = weddingConfig.brideName.split(" ")[0]!;
  const gf  = weddingConfig.groomName.split(" ")[0]!;
  const date = formatDate(weddingConfig.weddingDate);

  return (
    <>
      <style>{`
        /* ── Reset ─────────────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; background: #080508; }

        /* ── Keyframes ─────────────────────────────────────────────── */
        @keyframes drift {
          0%   { transform: scale(1.00) translate(0, 0); }
          33%  { transform: scale(1.06) translate(-1%, 0.5%); }
          66%  { transform: scale(1.04) translate(0.5%, -0.5%); }
          100% { transform: scale(1.00) translate(0, 0); }
        }
        @keyframes driftB {
          0%   { transform: scale(1.00) translate(0, 0); }
          50%  { transform: scale(1.07) translate(1%, -0.5%); }
          100% { transform: scale(1.00) translate(0, 0); }
        }
        @keyframes driftC {
          0%   { transform: scale(1.00) translate(0, 0); }
          40%  { transform: scale(1.05) translate(-0.5%, 1%); }
          100% { transform: scale(1.00) translate(0, 0); }
        }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes fadeLeft { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes scaleIn  { from { opacity:0; transform:scaleX(0); transform-origin:left; } to { opacity:1; transform:scaleX(1); transform-origin:left; } }
        @keyframes ticker   { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        @keyframes glowPulse {
          0%,100% { opacity: 0.18; }
          50%      { opacity: 0.32; }
        }
        @keyframes borderShimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes btnGlow {
          0%,100% { box-shadow: 0 0 20px rgba(192,54,74,0); }
          50%      { box-shadow: 0 0 36px rgba(192,54,74,0.22); }
        }

        /* ── Photo panels ──────────────────────────────────────────── */
        .photo-a { animation: drift  28s ease-in-out infinite; }
        .photo-b { animation: driftB 34s ease-in-out infinite; }
        .photo-c { animation: driftC 24s ease-in-out infinite; }

        /* ── Staggered reveals ─────────────────────────────────────── */
        .r1  { animation: fadeIn   1.0s 0.0s ease both; }
        .r2  { animation: fadeLeft 0.9s 0.3s ease both; }
        .r3  { animation: fadeUp   0.9s 0.5s ease both; }
        .r4  { animation: fadeUp   0.9s 0.7s ease both; }
        .r5  { animation: fadeUp   0.9s 0.9s ease both; }
        .r6  { animation: scaleIn  0.8s 1.1s ease both; }
        .r7  { animation: fadeUp   0.9s 1.2s ease both; }
        .r8  { animation: fadeUp   0.9s 1.4s ease both; }
        .r9  { animation: fadeUp   0.9s 1.6s ease both; }
        .r10 { animation: fadeUp   0.9s 1.8s ease both; }

        /* ── Login buttons ─────────────────────────────────────────── */
        .login-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 22px;
          border-radius: 18px;
          text-decoration: none;
          overflow: hidden;
          transition: transform 0.22s cubic-bezier(.22,1,.36,1);
          cursor: pointer;
        }
        .login-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          padding: 1.5px;
          background: linear-gradient(135deg, rgba(245,197,203,0.5) 0%, rgba(184,130,10,0.4) 50%, rgba(245,197,203,0.3) 100%);
          background-size: 200% 200%;
          animation: borderShimmer 4s linear infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .login-btn:hover { transform: translateY(-3px) scale(1.01); }
        .login-btn-couple { background: rgba(192,54,74,0.18); }
        .login-btn-couple:hover { background: rgba(192,54,74,0.28); animation: btnGlow 2s ease infinite; }
        .login-btn-family { background: rgba(255,255,255,0.055); }
        .login-btn-family:hover { background: rgba(255,255,255,0.10); }

        /* ── Ornamental divider line ───────────────────────────────── */
        .ornament-line {
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, rgba(245,197,203,0.7), transparent);
          animation: scaleIn 0.9s 1.1s ease forwards;
          transform-origin: left;
        }

        /* ── Responsive ────────────────────────────────────────────── */
        @media (max-width: 700px) {
          .triptych { display: none !important; }
          .names-wrap { font-size: clamp(3.8rem, 18vw, 6rem) !important; }
          .btn-stack { flex-direction: column !important; }
          .login-btn { width: 100%; }
          .content-pad { padding: 0 1.5rem 3rem !important; }
        }
        @media (max-width: 900px) {
          .triptych-inner { grid-template-columns: 1fr 1fr !important; }
          .triptych-inner > div:last-child { display: none !important; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════════
          BACKGROUND — Deep atmospheric base
      ════════════════════════════════════════════════════════════ */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, background: "#080508" }} />

      {/* Radial atmospheric glow */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse 70% 60% at 30% 60%, rgba(100,20,35,0.35) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 75% 40%, rgba(80,50,10,0.20) 0%, transparent 65%)",
        animation: "glowPulse 6s ease-in-out infinite",
      }} />

      {/* ════════════════════════════════════════════════════════════
          TRIPTYCH — Three floating photo panels (right side)
      ════════════════════════════════════════════════════════════ */}
      <div className="triptych" aria-hidden style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "42%", zIndex: 2,
        overflow: "hidden",
      }}>
        {/* Gradient veil over photos */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          background: "linear-gradient(90deg, #080508 0%, transparent 30%), linear-gradient(to bottom, rgba(8,5,8,0.5) 0%, transparent 20%, transparent 80%, rgba(8,5,8,0.7) 100%)",
        }} />

        <div className="triptych-inner" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          height: "100%",
          gap: 0,
        }}>
          {photos.map((url, i) => (
            <div key={i} style={{ overflow: "hidden", position: "relative" }}>
              <div
                className={["photo-a","photo-b","photo-c"][i]}
                style={{
                  position: "absolute", inset: "-15%",
                  backgroundImage: `url(${url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "saturate(0.7) brightness(0.55)",
                }}
              />
              {/* Subtle vertical separator */}
              {i < 2 && (
                <div style={{ position: "absolute", right: 0, top: "10%", bottom: "10%", width: 1, background: "linear-gradient(to bottom, transparent, rgba(245,197,203,0.15), transparent)", zIndex: 2 }} />
              )}
            </div>
          ))}
        </div>

        {/* Fine grain overlay on photos */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 11,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
          opacity: 0.4,
        }} />
      </div>

      {/* ════════════════════════════════════════════════════════════
          TOP STRIPE + TICKER
      ════════════════════════════════════════════════════════════ */}
      <div className="r1" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 30 }}>
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent 0%, #C0364A 25%, #D4AA3A 50%, #C0364A 75%, transparent 100%)" }} />
        <div style={{ overflow: "hidden", padding: "6px 0", background: "rgba(8,5,8,0.65)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", gap: "4rem", whiteSpace: "nowrap", width: "max-content", animation: "ticker 55s linear infinite" }}>
            {Array(14).fill(`${weddingConfig.celebrationTitle}  ✦  ${date}  ✦  ${weddingConfig.venueName}  ✦  ${weddingConfig.venueCity}  ✦  ${bf} & ${gf}`).map((t, i) => (
              <span key={i} style={{ fontSize: "0.5rem", letterSpacing: "0.36em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-body), system-ui, sans-serif" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          MAIN CONTENT — Left-anchored, bottom-weighted
      ════════════════════════════════════════════════════════════ */}
      <div className="content-pad" style={{
        position: "relative", zIndex: 20,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 clamp(2.5rem, 7vw, 8rem) clamp(4rem, 7vh, 7rem)",
        width: "min(100%, 680px)",
      }}>

        {/* ── Wedding label ── */}
        <div className="r2" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
          <div style={{ width: 28, height: 1, background: "rgba(245,197,203,0.55)" }} />
          <span style={{ fontSize: "0.55rem", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(245,197,203,0.60)", fontFamily: "var(--font-body), system-ui, sans-serif", fontWeight: 600 }}>
            {weddingConfig.celebrationTitle}
          </span>
          <div style={{ width: 28, height: 1, background: "rgba(245,197,203,0.20)" }} />
        </div>

        {/* ── Bride name ── */}
        <h1 className="names-wrap r3" style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "clamp(4.5rem, 11vw, 9.5rem)",
          fontWeight: 700,
          lineHeight: 0.86,
          letterSpacing: "-0.035em",
          color: "#FEFAF6",
          textShadow: "0 4px 60px rgba(0,0,0,0.6)",
          marginBottom: "0.05em",
        }}>
          {bf}
        </h1>

        {/* ── & Groom name ── */}
        <div className="r4" style={{ display: "flex", alignItems: "baseline", gap: "0.18em", marginBottom: "0.6em" }}>
          <span style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "clamp(1.5rem, 3.5vw, 3rem)",
            fontWeight: 400,
            color: "rgba(245,197,203,0.60)",
            letterSpacing: "0.08em",
            fontStyle: "italic",
          }}>
            &amp;
          </span>
          <h1 className="names-wrap" style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "clamp(4.5rem, 11vw, 9.5rem)",
            fontWeight: 700,
            lineHeight: 0.86,
            letterSpacing: "-0.035em",
            color: "#F5C5CB",
            textShadow: "0 4px 60px rgba(192,54,74,0.30)",
          }}>
            {gf}
          </h1>
        </div>

        {/* ── Date + Venue row ── */}
        <div className="r5" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.875rem", marginBottom: "2rem" }}>
          <span style={{ fontSize: "0.825rem", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body), system-ui, sans-serif", letterSpacing: "0.06em" }}>
            {date}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(245,197,203,0.4)", display: "inline-block" }} />
          <span style={{ fontSize: "0.825rem", color: "rgba(255,255,255,0.40)", fontFamily: "var(--font-body), system-ui, sans-serif", letterSpacing: "0.04em" }}>
            {weddingConfig.venueName}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(245,197,203,0.25)", display: "inline-block" }} />
          <span style={{ fontSize: "0.825rem", color: "rgba(255,255,255,0.30)", fontFamily: "var(--font-body), system-ui, sans-serif", letterSpacing: "0.04em" }}>
            {weddingConfig.venueCity}
          </span>
        </div>

        {/* ── Ornamental rule ── */}
        <div className="r6" style={{ width: "min(360px, 100%)", height: 1, background: "linear-gradient(90deg, rgba(245,197,203,0.30), rgba(255,255,255,0.04))", marginBottom: "1.625rem" }} />

        {/* ── Quote ── */}
        <p className="r7" style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontStyle: "italic",
          fontSize: "clamp(0.85rem, 1.4vw, 1.05rem)",
          color: "rgba(255,255,255,0.32)",
          maxWidth: "34rem",
          lineHeight: 1.9,
          marginBottom: "2.5rem",
        }}>
          &ldquo;{weddingConfig.introQuote}&rdquo;
        </p>

        {/* ── Access label ── */}
        <div className="r8" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
          <div style={{ width: 18, height: 1, background: "rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize: "0.52rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-body), system-ui, sans-serif" }}>
            Private access
          </span>
        </div>

        {/* ════ TWO LOGIN BUTTONS ════ */}
        <div className="btn-stack r9" style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>

          {/* Couple — primary */}
          <a href="/login?hint=couple&redirect=/admin" className="login-btn login-btn-couple">
            {/* Icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: "rgba(192,54,74,0.30)",
              border: "1px solid rgba(245,197,203,0.20)",
              display: "grid", placeItems: "center",
              fontSize: "1.25rem",
            }}>
              💍
            </div>
            {/* Text */}
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: "0.52rem", letterSpacing: "0.32em", textTransform: "uppercase",
                color: "rgba(245,197,203,0.55)", fontFamily: "var(--font-body), system-ui, sans-serif",
                fontWeight: 700, marginBottom: "0.25rem",
              }}>
                The couple
              </p>
              <p style={{
                fontSize: "0.925rem", fontWeight: 700, color: "#FEFAF6",
                fontFamily: "var(--font-body), system-ui, sans-serif", lineHeight: 1.2, whiteSpace: "nowrap",
              }}>
                {bf} &amp; {gf}
              </p>
            </div>
            {/* Arrow */}
            <svg style={{ marginLeft: "auto", flexShrink: 0, color: "rgba(245,197,203,0.50)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>

          {/* Family */}
          <a href="/login?hint=vault&redirect=/family" className="login-btn login-btn-family">
            {/* Icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.10)",
              display: "grid", placeItems: "center",
              fontSize: "1.25rem",
            }}>
              🫂
            </div>
            {/* Text */}
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: "0.52rem", letterSpacing: "0.32em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.30)", fontFamily: "var(--font-body), system-ui, sans-serif",
                fontWeight: 700, marginBottom: "0.25rem",
              }}>
                Family vault
              </p>
              <p style={{
                fontSize: "0.925rem", fontWeight: 700, color: "rgba(255,255,255,0.78)",
                fontFamily: "var(--font-body), system-ui, sans-serif", lineHeight: 1.2, whiteSpace: "nowrap",
              }}>
                Family of the couple
              </p>
            </div>
            {/* Arrow */}
            <svg style={{ marginLeft: "auto", flexShrink: 0, color: "rgba(255,255,255,0.25)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>

        </div>

        {/* ── Guest footnote ── */}
        <p className="r10" style={{
          marginTop: "1.375rem",
          fontSize: "0.65rem",
          color: "rgba(255,255,255,0.16)",
          fontFamily: "var(--font-body), system-ui, sans-serif",
          fontStyle: "italic",
          letterSpacing: "0.02em",
        }}>
          Guests — open the personal invitation link sent to you by {bf} &amp; {gf}.
        </p>

      </div>

      {/* ════════════════════════════════════════════════════════════
          BOTTOM STRIPE
      ════════════════════════════════════════════════════════════ */}
      <div aria-hidden style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: 2, zIndex: 30,
        background: "linear-gradient(90deg, transparent 0%, #C0364A 25%, #D4AA3A 50%, #C0364A 75%, transparent 100%)",
      }} />
    </>
  );
}
