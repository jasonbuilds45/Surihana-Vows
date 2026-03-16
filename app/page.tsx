import Link from "next/link";
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
const STRIPE = "linear-gradient(90deg,#D94F62 0%,#C0364A 25%,#B8820A 50%,#C0364A 75%,#D94F62 100%)";

export default function HomePage() {
  const slides = getSlideshowPhotos();
  const hero =
    slides[0]?.imageUrl ??
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80";

  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;
  const story = weddingConfig.story[weddingConfig.story.length - 1];

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) scale(1.00); }
          50%       { transform: translateY(-8px) scale(1.015); }
        }

        .hero-bg {
          animation: floatSlow 18s ease-in-out infinite;
        }
        .fade-up-1 { animation: fadeUp .9s .15s ease both; }
        .fade-up-2 { animation: fadeUp .9s .35s ease both; }
        .fade-up-3 { animation: fadeUp .9s .55s ease both; }
        .fade-up-4 { animation: fadeUp .9s .75s ease both; }
        .fade-up-5 { animation: fadeUp .9s .95s ease both; }
        .fade-in   { animation: fadeIn 1.2s .2s ease both; }

        .login-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 28px;
          border-radius: 20px;
          text-decoration: none;
          text-align: left;
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
          cursor: pointer;
        }
        .login-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,.30);
        }
        .login-btn-couple {
          background: rgba(192,54,74,.85);
          border: 1.5px solid rgba(245,197,203,.30);
          backdrop-filter: blur(16px);
        }
        .login-btn-couple:hover {
          background: rgba(192,54,74,1);
        }
        .login-btn-family {
          background: rgba(255,255,255,.10);
          border: 1.5px solid rgba(255,255,255,.22);
          backdrop-filter: blur(16px);
        }
        .login-btn-family:hover {
          background: rgba(255,255,255,.16);
        }

        .story-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 18px;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(12px);
        }

        .detail-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }

        @media (max-width: 640px) {
          .login-row {
            flex-direction: column !important;
          }
          .login-btn {
            width: 100%;
          }
        }
      `}</style>

      {/* ── Fixed background image ── */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          overflow: "hidden",
        }}
        aria-hidden
      >
        <div
          className="hero-bg"
          style={{
            position: "absolute",
            inset: "-5%",
            backgroundImage: `url(${hero})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
      </div>

      {/* ── Layered gradient overlay ── */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 1,
          background: [
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(14,8,9,.15) 0%, transparent 70%)",
            "linear-gradient(to bottom, rgba(14,8,9,.20) 0%, rgba(14,8,9,.05) 30%, rgba(14,8,9,.50) 65%, rgba(14,8,9,.97) 100%)",
          ].join(", "),
        }}
        aria-hidden
      />

      {/* ── Gold stripe top ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: STRIPE, zIndex: 20 }} />

      {/* ── Scrollable content ── */}
      <div
        style={{
          position: "relative", zIndex: 10,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 clamp(1.5rem,6vw,5rem) 4rem",
        }}
      >
        {/* ── Top floating marquee ── */}
        <div
          className="fade-in"
          style={{
            position: "fixed", top: 3, left: 0, right: 0,
            overflow: "hidden",
            padding: "9px 0",
            background: "rgba(14,8,9,.18)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "3rem",
              whiteSpace: "nowrap",
              animation: "marquee 40s linear infinite",
              width: "max-content",
            }}
          >
            {Array(10).fill(
              `${weddingConfig.celebrationTitle}  ·  ${formatDate(weddingConfig.weddingDate)}  ·  ${weddingConfig.venueName}  ·  ${weddingConfig.venueCity}`
            ).map((t, i) => (
              <span
                key={i}
                style={{
                  fontSize: ".58rem",
                  letterSpacing: ".30em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.40)",
                  fontFamily: BF,
                }}
              >
                {t} &nbsp;&nbsp;✦&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* ── Main content block (bottom-aligned) ── */}
        <div style={{ maxWidth: 700 }}>

          {/* Story pill */}
          {story && (
            <div className="story-pill fade-up-1" style={{ marginBottom: "2rem" }}>
              <span style={{ fontSize: ".58rem", letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(255,255,255,.60)", fontFamily: BF, fontWeight: 600 }}>
                {story.year}
              </span>
              <span style={{ width: 1, height: 10, background: "rgba(255,255,255,.20)" }} />
              <span style={{ fontSize: ".75rem", color: "rgba(255,255,255,.65)", fontFamily: BF, fontStyle: "italic" }}>
                {story.title}
              </span>
            </div>
          )}

          {/* Couple names */}
          <h1
            className="fade-up-2"
            style={{
              fontFamily: DF,
              fontSize: "clamp(3.8rem, 13vw, 9rem)",
              fontWeight: 700,
              lineHeight: .88,
              letterSpacing: "-.03em",
              color: "#fff",
              marginBottom: ".12em",
              textShadow: "0 2px 30px rgba(0,0,0,.40)",
            }}
          >
            {bf}
          </h1>
          <h1
            className="fade-up-2"
            style={{
              fontFamily: DF,
              fontSize: "clamp(3.8rem, 13vw, 9rem)",
              fontWeight: 700,
              lineHeight: .88,
              letterSpacing: "-.03em",
              color: "#F5C5CB",
              marginBottom: ".55em",
              textShadow: "0 2px 30px rgba(0,0,0,.40)",
            }}
          >
            &amp; {gf}
          </h1>

          {/* Tagline */}
          <p
            className="fade-up-3"
            style={{
              fontSize: "clamp(.875rem,1.6vw,1.05rem)",
              color: "rgba(255,255,255,.58)",
              maxWidth: "32rem",
              lineHeight: 1.80,
              marginBottom: "1.25rem",
              fontFamily: BF,
              fontStyle: "italic",
            }}
          >
            &ldquo;{weddingConfig.introQuote}&rdquo;
          </p>

          {/* Date · Venue chips */}
          <div
            className="fade-up-3"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: ".625rem",
              marginBottom: "3rem",
            }}
          >
            {[
              { emoji: "📅", text: formatDate(weddingConfig.weddingDate) },
              { emoji: "📍", text: weddingConfig.venueName },
              { emoji: "✨", text: weddingConfig.dressCode.split(",")[0]! },
            ].map(({ emoji, text }) => (
              <span
                key={text}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 16px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.14)",
                  fontSize: ".78rem",
                  color: "rgba(255,255,255,.72)",
                  fontFamily: BF,
                  fontWeight: 500,
                  backdropFilter: "blur(8px)",
                }}
              >
                <span>{emoji}</span> {text}
              </span>
            ))}
          </div>

          {/* ── Divider ── */}
          <div
            className="fade-up-4"
            style={{
              height: 1,
              background: "linear-gradient(90deg, rgba(255,255,255,.18), rgba(255,255,255,.04))",
              marginBottom: "2.25rem",
              maxWidth: 480,
            }}
          />

          {/* ── LOGIN BUTTONS ── */}
          <p
            className="fade-up-4"
            style={{
              fontSize: ".6rem",
              letterSpacing: ".28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.35)",
              fontFamily: BF,
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            Are you part of this celebration?
          </p>

          <div
            className="login-row fade-up-5"
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {/* Couple button */}
            <Link href="/login?hint=couple&redirect=/admin" className="login-btn login-btn-couple">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(255,255,255,.15)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  fontSize: "1.25rem",
                }}
              >
                💍
              </div>
              <div>
                <p style={{ fontSize: ".65rem", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.60)", fontFamily: BF, fontWeight: 600, marginBottom: 3 }}>
                  Sign in
                </p>
                <p style={{ fontSize: ".9375rem", fontWeight: 700, color: "#fff", fontFamily: BF, lineHeight: 1.2 }}>
                  Are you the couple<br />getting married?
                </p>
              </div>
              <div style={{ marginLeft: "auto", color: "rgba(255,255,255,.50)", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* Family button */}
            <Link href="/login?hint=vault&redirect=/family" className="login-btn login-btn-family">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(255,255,255,.10)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  fontSize: "1.25rem",
                }}
              >
                🫂
              </div>
              <div>
                <p style={{ fontSize: ".65rem", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", fontFamily: BF, fontWeight: 600, marginBottom: 3 }}>
                  Family access
                </p>
                <p style={{ fontSize: ".9375rem", fontWeight: 700, color: "rgba(255,255,255,.88)", fontFamily: BF, lineHeight: 1.2 }}>
                  Are you family of<br />the lovely couple?
                </p>
              </div>
              <div style={{ marginLeft: "auto", color: "rgba(255,255,255,.35)", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          </div>

          {/* Footnote */}
          <p
            className="fade-up-5"
            style={{
              marginTop: "1.5rem",
              fontSize: ".72rem",
              color: "rgba(255,255,255,.22)",
              fontFamily: BF,
              fontStyle: "italic",
            }}
          >
            Guests — check your personal invitation link sent by the couple.
          </p>
        </div>
      </div>

      {/* ── Gold stripe bottom ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 2, background: STRIPE, zIndex: 20 }} />
    </>
  );
}
