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
const STRIPE = "linear-gradient(90deg,#D94F62 0%,#C0364A 30%,#B8820A 55%,#C0364A 80%,#D94F62 100%)";

export default function HomePage() {
  const slides = getSlideshowPhotos();
  const hero =
    slides[0]?.imageUrl ??
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80";

  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }

        @keyframes heroDrift {
          0%,100% { transform: scale(1.04) translateY(0px); }
          50%      { transform: scale(1.08) translateY(-6px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .a1 { animation: fadeUp .8s .10s ease both; }
        .a2 { animation: fadeUp .8s .28s ease both; }
        .a3 { animation: fadeUp .8s .44s ease both; }
        .a4 { animation: fadeUp .8s .60s ease both; }
        .a5 { animation: fadeUp .8s .76s ease both; }
        .a6 { animation: fadeUp .8s .92s ease both; }

        .login-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 22px;
          border-radius: 18px;
          text-decoration: none;
          cursor: pointer;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .login-card:hover {
          transform: translateY(-3px);
        }
        .login-card-couple {
          background: rgba(192,54,74,.88);
          border: 1.5px solid rgba(245,197,203,.30);
          backdrop-filter: blur(16px);
        }
        .login-card-couple:hover {
          background: rgba(192,54,74,1);
          box-shadow: 0 14px 36px rgba(192,54,74,.45);
        }
        .login-card-family {
          background: rgba(255,255,255,.10);
          border: 1.5px solid rgba(255,255,255,.20);
          backdrop-filter: blur(16px);
        }
        .login-card-family:hover {
          background: rgba(255,255,255,.16);
          box-shadow: 0 14px 36px rgba(0,0,0,.25);
        }

        @media (max-width: 600px) {
          .login-row { flex-direction: column !important; }
          .login-card { width: 100%; }
          .details-row { flex-wrap: wrap !important; gap: .5rem !important; }
        }
      `}</style>

      {/* ── Fixed background ── */}
      <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden" }} aria-hidden>
        <div
          style={{
            position:"absolute", inset:"-6%",
            backgroundImage:`url(${hero})`,
            backgroundSize:"cover",
            backgroundPosition:"center top",
            animation:"heroDrift 20s ease-in-out infinite",
          }}
        />
      </div>

      {/* ── Gradient overlay ── */}
      <div
        style={{
          position:"fixed", inset:0, zIndex:1,
          background:[
            "linear-gradient(to bottom, rgba(10,5,6,.25) 0%, rgba(10,5,6,.05) 30%, rgba(10,5,6,.55) 68%, rgba(10,5,6,.98) 100%)",
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(10,5,6,.10) 0%, transparent 60%)",
          ].join(", "),
        }}
        aria-hidden
      />

      {/* ── Gold stripe — top ── */}
      <div style={{ position:"fixed", top:0, left:0, right:0, height:3, background:STRIPE, zIndex:20 }} />

      {/* ── Scrollable page ── */}
      <div
        style={{
          position:"relative", zIndex:10,
          minHeight:"100dvh",
          display:"flex",
          flexDirection:"column",
          justifyContent:"flex-end",
          padding:"0 clamp(1.5rem,7vw,5.5rem) clamp(3rem,5vh,5rem)",
        }}
      >
        {/* ── Ticker marquee ── */}
        <div
          className="a1"
          style={{
            position:"fixed", top:3, left:0, right:0, zIndex:15,
            overflow:"hidden",
            padding:"8px 0",
            background:"rgba(10,5,6,.22)",
            backdropFilter:"blur(8px)",
            borderBottom:"1px solid rgba(255,255,255,.06)",
          }}
        >
          <div style={{ display:"flex", gap:"3rem", whiteSpace:"nowrap", width:"max-content", animation:"ticker 45s linear infinite" }}>
            {Array(12).fill(
              `${weddingConfig.celebrationTitle}  ·  ${formatDate(weddingConfig.weddingDate)}  ·  ${weddingConfig.venueName}  ·  ${weddingConfig.venueCity}`
            ).map((t, i) => (
              <span key={i} style={{ fontSize:".57rem", letterSpacing:".30em", textTransform:"uppercase", color:"rgba(255,255,255,.35)", fontFamily:BF }}>
                {t} &nbsp;✦&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* ── Content block ── */}
        <div style={{ maxWidth:680 }}>

          {/* Story year pill */}
          <div
            className="a2"
            style={{
              display:"inline-flex", alignItems:"center", gap:10,
              padding:"5px 16px", borderRadius:999,
              background:"rgba(255,255,255,.08)",
              border:"1px solid rgba(255,255,255,.14)",
              backdropFilter:"blur(10px)",
              marginBottom:"1.75rem",
            }}
          >
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#F5C5CB", display:"inline-block" }} />
            <span style={{ fontSize:".6rem", letterSpacing:".28em", textTransform:"uppercase", color:"rgba(255,255,255,.70)", fontFamily:BF, fontWeight:600 }}>
              {formatDate(weddingConfig.weddingDate)} &nbsp;·&nbsp; {weddingConfig.venueCity}
            </span>
          </div>

          {/* Couple names */}
          <h1
            className="a3"
            style={{
              fontFamily:DF,
              fontSize:"clamp(3.5rem,13vw,8.5rem)",
              fontWeight:700,
              lineHeight:.88,
              letterSpacing:"-.03em",
              color:"#fff",
              marginBottom:".12em",
              textShadow:"0 3px 28px rgba(0,0,0,.45)",
            }}
          >
            {bf}
          </h1>
          <h1
            className="a3"
            style={{
              fontFamily:DF,
              fontSize:"clamp(3.5rem,13vw,8.5rem)",
              fontWeight:700,
              lineHeight:.88,
              letterSpacing:"-.03em",
              color:"#F5C5CB",
              marginBottom:".55em",
              textShadow:"0 3px 28px rgba(0,0,0,.45)",
            }}
          >
            &amp; {gf}
          </h1>

          {/* Quote */}
          <p
            className="a4"
            style={{
              fontSize:"clamp(.875rem,1.5vw,1rem)",
              color:"rgba(255,255,255,.52)",
              maxWidth:"32rem",
              lineHeight:1.82,
              marginBottom:"1.5rem",
              fontFamily:BF,
              fontStyle:"italic",
            }}
          >
            &ldquo;{weddingConfig.introQuote}&rdquo;
          </p>

          {/* Detail chips */}
          <div
            className="a4 details-row"
            style={{ display:"flex", gap:".625rem", flexWrap:"wrap", marginBottom:"2.5rem" }}
          >
            {[
              { emoji:"📅", label: formatDate(weddingConfig.weddingDate) },
              { emoji:"📍", label: weddingConfig.venueName },
              { emoji:"✨", label: weddingConfig.dressCode.split(",")[0]! },
            ].map(({ emoji, label }) => (
              <span
                key={label}
                style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  padding:"6px 14px", borderRadius:999,
                  background:"rgba(255,255,255,.07)",
                  border:"1px solid rgba(255,255,255,.12)",
                  fontSize:".78rem", color:"rgba(255,255,255,.65)",
                  fontFamily:BF, fontWeight:500,
                  backdropFilter:"blur(6px)",
                }}
              >
                <span>{emoji}</span> {label}
              </span>
            ))}
          </div>

          {/* ── Divider ── */}
          <div
            className="a5"
            style={{
              height:1,
              background:"linear-gradient(90deg,rgba(255,255,255,.18),rgba(255,255,255,.03))",
              marginBottom:"2rem",
              maxWidth:480,
            }}
          />

          {/* ── Login section label ── */}
          <p
            className="a5"
            style={{
              fontSize:".58rem",
              letterSpacing:".28em",
              textTransform:"uppercase",
              color:"rgba(255,255,255,.30)",
              fontFamily:BF,
              fontWeight:600,
              marginBottom:"1rem",
            }}
          >
            Are you part of this celebration?
          </p>

          {/* ── Login buttons ── */}
          <div
            className="login-row a6"
            style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}
          >
            {/* Couple */}
            <a href="/login?hint=couple&redirect=/admin" className="login-card login-card-couple">
              <div style={{ width:42, height:42, borderRadius:12, background:"rgba(255,255,255,.15)", display:"grid", placeItems:"center", flexShrink:0, fontSize:"1.25rem" }}>
                💍
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:".6rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.55)", fontFamily:BF, fontWeight:600, marginBottom:3 }}>
                  Sign in
                </p>
                <p style={{ fontSize:".9375rem", fontWeight:700, color:"#fff", fontFamily:BF, lineHeight:1.25 }}>
                  Are you the couple<br />getting married?
                </p>
              </div>
              <svg style={{ color:"rgba(255,255,255,.50)", flexShrink:0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>

            {/* Family */}
            <a href="/login?hint=vault&redirect=/family" className="login-card login-card-family">
              <div style={{ width:42, height:42, borderRadius:12, background:"rgba(255,255,255,.10)", display:"grid", placeItems:"center", flexShrink:0, fontSize:"1.25rem" }}>
                🫂
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:".6rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.40)", fontFamily:BF, fontWeight:600, marginBottom:3 }}>
                  Family access
                </p>
                <p style={{ fontSize:".9375rem", fontWeight:700, color:"rgba(255,255,255,.88)", fontFamily:BF, lineHeight:1.25 }}>
                  Are you family of<br />the lovely couple?
                </p>
              </div>
              <svg style={{ color:"rgba(255,255,255,.32)", flexShrink:0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          {/* Guest footnote */}
          <p
            className="a6"
            style={{
              marginTop:"1.5rem",
              fontSize:".7rem",
              color:"rgba(255,255,255,.20)",
              fontFamily:BF,
              fontStyle:"italic",
            }}
          >
            Guests — open the personalised invitation link sent to you by the couple.
          </p>

        </div>
      </div>

      {/* ── Gold stripe — bottom ── */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, height:2, background:STRIPE, zIndex:20 }} />
    </>
  );
}
