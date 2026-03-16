import type { Metadata } from "next";
import { weddingConfig } from "@/lib/config";
import { getSlideshowPhotos } from "@/modules/premium/photo-gallery";
import { formatDate } from "@/utils/formatDate";

export const metadata: Metadata = {
  title: `${weddingConfig.brideName} & ${weddingConfig.groomName} | ${weddingConfig.celebrationTitle}`,
  description: weddingConfig.heroSubtitle,
};

const DF = "var(--font-display), Georgia, serif";
const BF = "var(--font-body), system-ui, sans-serif";

export default function HomePage() {
  const slides = getSlideshowPhotos();
  const hero =
    slides[0]?.imageUrl ??
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85";

  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; background: #0c0808; }

        @keyframes slowZoom {
          from { transform: scale(1.00); }
          to   { transform: scale(1.06); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lineDraw {
          from { width: 0; }
          to   { width: 48px; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .bg-img {
          animation: slowZoom 22s ease-in-out infinite alternate;
        }

        .c1 { animation: fadeIn  1.2s 0.2s ease both; }
        .c2 { animation: fadeUp  0.9s 0.6s ease both; }
        .c3 { animation: fadeUp  0.9s 0.9s ease both; }
        .c4 { animation: fadeUp  0.9s 1.1s ease both; }
        .c5 { animation: fadeUp  0.9s 1.3s ease both; }
        .c6 { animation: fadeUp  0.9s 1.5s ease both; }
        .c7 { animation: fadeUp  0.9s 1.7s ease both; }

        .line-ornament {
          display: inline-block;
          width: 0;
          height: 1px;
          background: rgba(245,197,203,0.60);
          vertical-align: middle;
          animation: lineDraw 1s 1.4s ease forwards;
        }

        .btn-login {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 15px 22px;
          border-radius: 14px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
          cursor: pointer;
        }
        .btn-login:hover {
          background: rgba(255,255,255,0.11);
          border-color: rgba(255,255,255,0.24);
          transform: translateY(-2px);
        }
        .btn-login-primary {
          background: rgba(192,54,74,0.75);
          border-color: rgba(245,197,203,0.25);
        }
        .btn-login-primary:hover {
          background: rgba(192,54,74,0.92);
          border-color: rgba(245,197,203,0.40);
        }

        .detail-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          font-size: 0.75rem;
          color: rgba(255,255,255,0.55);
          font-family: ${BF};
          letter-spacing: 0.04em;
        }

        @media (max-width: 600px) {
          .btn-row { flex-direction: column !important; }
          .btn-login { width: 100%; }
          .names-h1 { font-size: clamp(3.2rem, 17vw, 5rem) !important; }
        }
      `}</style>

      {/* ── Hero image — slow zoom ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }} aria-hidden>
        <div
          className="bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${hero})`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />
      </div>

      {/* ── Layered overlays ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(12,8,8,0.42) 0%, rgba(12,8,8,0.10) 28%, rgba(12,8,8,0.05) 50%, rgba(12,8,8,0.60) 75%, rgba(12,8,8,0.97) 100%)" }} />
      {/* Warm vignette sides */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 1, background: "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, rgba(12,8,8,0.50) 100%)" }} />

      {/* ── Ornamental top border ── */}
      <div className="c1" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 20 }}>
        {/* Rose-gold stripe */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent 0%, #C0364A 20%, #B8820A 50%, #C0364A 80%, transparent 100%)" }} />
        {/* Ticker */}
        <div style={{ overflow: "hidden", padding: "7px 0", background: "rgba(12,8,8,0.30)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", gap: "3rem", whiteSpace: "nowrap", width: "max-content", animation: "ticker 50s linear infinite" }}>
            {Array(12).fill(
              `${weddingConfig.celebrationTitle}  ✦  ${formatDate(weddingConfig.weddingDate)}  ✦  ${weddingConfig.venueName}  ✦  ${weddingConfig.venueCity}`
            ).map((t, i) => (
              <span key={i} style={{ fontSize: "0.54rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", fontFamily: BF }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          position: "relative", zIndex: 10,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 clamp(2rem, 8vw, 7rem) clamp(3.5rem, 6vh, 6rem)",
        }}
      >
        {/* ── Ornamental label ── */}
        <div className="c2" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "1.75rem" }}>
          <span className="line-ornament" />
          <span style={{ fontSize: "0.58rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "rgba(245,197,203,0.65)", fontFamily: BF, fontWeight: 600 }}>
            {weddingConfig.celebrationTitle}
          </span>
          <span className="line-ornament" />
        </div>

        {/* ── Couple names ── */}
        <h1
          className="names-h1 c3"
          style={{
            fontFamily: DF,
            fontSize: "clamp(4rem, 12vw, 9rem)",
            fontWeight: 700,
            lineHeight: 0.88,
            letterSpacing: "-0.03em",
            color: "#fff",
            textShadow: "0 2px 40px rgba(0,0,0,0.50)",
            marginBottom: "0.12em",
          }}
        >
          {bf}
        </h1>
        <div className="c3" style={{ display: "flex", alignItems: "center", gap: "0.6em", marginBottom: "0.55em" }}>
          <h1
            className="names-h1"
            style={{
              fontFamily: DF,
              fontSize: "clamp(4rem, 12vw, 9rem)",
              fontWeight: 700,
              lineHeight: 0.88,
              letterSpacing: "-0.03em",
              color: "#F5C5CB",
              textShadow: "0 2px 40px rgba(0,0,0,0.50)",
            }}
          >
            &amp; {gf}
          </h1>
        </div>

        {/* ── Quote ── */}
        <p
          className="c4"
          style={{
            fontFamily: DF,
            fontStyle: "italic",
            fontSize: "clamp(0.9rem, 1.6vw, 1.1rem)",
            color: "rgba(255,255,255,0.45)",
            maxWidth: "38rem",
            lineHeight: 1.85,
            marginBottom: "1.75rem",
          }}
        >
          &ldquo;{weddingConfig.introQuote}&rdquo;
        </p>

        {/* ── Detail chips ── */}
        <div className="c5" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2.5rem" }}>
          {[
            { icon: "📅", text: formatDate(weddingConfig.weddingDate) },
            { icon: "📍", text: weddingConfig.venueName },
            { icon: "✨", text: weddingConfig.dressCode.split(",")[0]! },
          ].map(({ icon, text }) => (
            <span key={text} className="detail-chip">
              <span>{icon}</span>
              {text}
            </span>
          ))}
        </div>

        {/* ── Thin divider ── */}
        <div
          className="c6"
          style={{
            width: "min(480px, 100%)",
            height: 1,
            background: "linear-gradient(90deg, rgba(245,197,203,0.25), rgba(255,255,255,0.06))",
            marginBottom: "1.875rem",
          }}
        />

        {/* ── Section label ── */}
        <p
          className="c6"
          style={{
            fontSize: "0.58rem",
            letterSpacing: "0.30em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
            fontFamily: BF,
            fontWeight: 600,
            marginBottom: "0.875rem",
          }}
        >
          Private access
        </p>

        {/* ── Login buttons ── */}
        <div className="btn-row c7" style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>

          {/* Couple */}
          <a href="/login?hint=couple&redirect=/admin" className="btn-login btn-login-primary">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "grid", placeItems: "center", fontSize: "1.1rem", flexShrink: 0 }}>
              💍
            </div>
            <div>
              <p style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.50)", fontFamily: BF, fontWeight: 600, marginBottom: 3 }}>
                Couple
              </p>
              <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", fontFamily: BF, lineHeight: 1.2 }}>
                Are you getting married?
              </p>
            </div>
            <svg style={{ marginLeft: "auto", color: "rgba(255,255,255,0.45)", flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>

          {/* Family */}
          <a href="/login?hint=vault&redirect=/family" className="btn-login">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.08)", display: "grid", placeItems: "center", fontSize: "1.1rem", flexShrink: 0 }}>
              🫂
            </div>
            <div>
              <p style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: BF, fontWeight: 600, marginBottom: 3 }}>
                Family
              </p>
              <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.82)", fontFamily: BF, lineHeight: 1.2 }}>
                Are you family of the couple?
              </p>
            </div>
            <svg style={{ marginLeft: "auto", color: "rgba(255,255,255,0.28)", flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>

        </div>

        {/* ── Guest footnote ── */}
        <p
          className="c7"
          style={{
            marginTop: "1.25rem",
            fontSize: "0.68rem",
            color: "rgba(255,255,255,0.18)",
            fontFamily: BF,
            fontStyle: "italic",
            letterSpacing: "0.02em",
          }}
        >
          Guests — open the personal invitation link sent to you by {bf} &amp; {gf}.
        </p>

      </div>

      {/* ── Bottom ornament ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent 0%, #C0364A 20%, #B8820A 50%, #C0364A 80%, transparent 100%)", zIndex: 20 }} />
    </>
  );
}
