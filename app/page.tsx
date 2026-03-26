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

        /* ── Palette ── */
        :root {
          --ivory:   #F5EFE6;
          --parch:   #EDE3D4;
          --maroon:  #6B1221;
          --crimson: #8B1A2E;
          --gold:    #A07828;
          --gold-lt: #C9A84C;
          --ink:     #180C0A;
          --stone:   #5A4030;
          --mist:    rgba(245,239,230,0.96);
          --border:  rgba(160,120,40,0.18);
          --df: var(--font-display),'Cormorant Garamond',Georgia,serif;
          --bf: var(--font-body),'Manrope',system-ui,sans-serif;
        }

        /* ── Keyframes ── */
        @keyframes bgPan {
          0%   { transform: scale(1.06) translate(0,0); }
          100% { transform: scale(1.06) translate(-1%,-1.5%); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes rise {
          from { opacity:0; transform:translateY(30px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes nameIn {
          from { opacity:0; transform:translateY(48px) scaleY(0.96); }
          to   { opacity:1; transform:translateY(0) scaleY(1); }
        }
        @keyframes ruleIn {
          from { opacity:0; transform:scaleX(0); }
          to   { opacity:1; transform:scaleX(1); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }

        /* ── Stagger ── */
        .c-fade { animation: fadeIn .8s ease both; }
        .c-r0  { animation: rise  .9s .10s cubic-bezier(.16,1,.3,1) both; }
        .c-na  { animation: nameIn 1.1s .22s cubic-bezier(.16,1,.3,1) both; }
        .c-amp { animation: rise   .7s .42s cubic-bezier(.16,1,.3,1) both; }
        .c-nb  { animation: nameIn 1.1s .36s cubic-bezier(.16,1,.3,1) both; }
        .c-r1  { animation: rise  .9s .58s cubic-bezier(.16,1,.3,1) both; }
        .c-r2  { animation: rise  .9s .70s cubic-bezier(.16,1,.3,1) both; }
        .c-r3  { animation: rise  .9s .84s cubic-bezier(.16,1,.3,1) both; }
        .c-r4  { animation: rise  .9s .98s cubic-bezier(.16,1,.3,1) both; }
        .c-r5  { animation: rise  .9s 1.12s cubic-bezier(.16,1,.3,1) both; }
        .c-r6  { animation: rise  .9s 1.26s cubic-bezier(.16,1,.3,1) both; }
        .c-rule { transform-origin:center; animation: ruleIn 1.0s .55s ease both; }

        /* ── Ticker ── */
        .tk-shell {
          position:fixed; top:0; left:0; right:0; z-index:80;
        }
        .tk-stripe {
          height:2px;
          background: linear-gradient(90deg,
            transparent 0%, var(--maroon) 20%,
            var(--gold-lt) 50%, var(--maroon) 80%, transparent 100%);
        }
        .tk-bar {
          overflow:hidden; padding:5px 0;
          background: rgba(245,239,230,0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .tk-track {
          display:flex; gap:3.5rem;
          white-space:nowrap; width:max-content;
          animation: ticker 72s linear infinite;
        }
        .tk-item {
          font-family: var(--bf);
          font-size:.45rem; letter-spacing:.44em;
          text-transform:uppercase; font-weight:600;
          color: var(--stone);
        }
        .tk-gem { color: var(--gold); margin:0 .05em; }

        /* ── Name ── */
        .name {
          font-family: var(--df);
          font-size: clamp(4.2rem,12.5vw,10.5rem);
          font-weight: 300;
          line-height: .88;
          letter-spacing: -.02em;
          display: block;
          text-align: center;
        }

        /* ── Event strip ── */
        .ev-strip {
          display:grid;
          grid-template-columns: 1fr 1px 1fr;
          width:100%;
          max-width:420px;
          border: 1px solid var(--border);
          border-radius: 2px;
        }
        .ev-col { padding:16px 18px; text-align:center; }
        .ev-sep { background: var(--border); }

        /* ── Buttons ── */
        .btn-row { display:flex; gap:.75rem; width:100%; }
        .btn {
          flex:1;
          display:inline-flex; align-items:center; justify-content:space-between;
          gap:10px; padding:14px 20px; border-radius:2px;
          text-decoration:none; cursor:pointer;
          font-family:var(--bf);
          transition: transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s ease;
        }
        .btn-p {
          background: var(--maroon);
          border: 1px solid rgba(107,18,33,.30);
          box-shadow: 0 4px 22px rgba(107,18,33,.26),
                      inset 0 1px 0 rgba(255,255,255,.08);
        }
        .btn-p:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(107,18,33,.36); }
        .btn-s {
          background: transparent;
          border: 1px solid rgba(107,18,33,.45);
        }
        .btn-s:hover { transform:translateY(-2px); background:rgba(107,18,33,.04); }

        /* ── Foot rule ── */
        .foot-rule {
          position:fixed; bottom:0; left:0; right:0; height:2px; z-index:80;
          background: linear-gradient(90deg,
            transparent 0%, var(--maroon) 20%,
            var(--gold-lt) 50%, var(--maroon) 80%, transparent 100%);
        }

        /* ─────────────────────────────────────────────
           MOBILE ≤ 600px
        ───────────────────────────────────────────── */
        @media (max-width:600px) {
          .photo-zone {
            height: 56vw !important;
            min-height: 210px !important;
            max-height: 300px !important;
          }
          .name { font-size: 12.5vw !important; }
          .amp  { font-size: 7vw   !important; }
          .c-r0 .eyebrow-lbl { font-size:.38rem !important; letter-spacing:.28em !important; }

          .shell { padding: 0 1.25rem 3.5rem !important; }

          .ev-col { padding: 11px 10px !important; }
          .ev-eyebrow { font-size:.36rem !important; letter-spacing:.26em !important; margin-bottom:.28rem !important; }
          .ev-name    { font-size:.82rem !important; }
          .ev-time    { font-size:.64rem !important; }

          .quote { font-size:.86rem !important; padding:.85rem 1rem !important; }

          .div-label { font-size:.38rem !important; letter-spacing:.28em !important; }

          /* Buttons: compact side-by-side pills, no two-line label */
          .btn { padding: 11px 14px !important; }
          .btn-top { display:none !important; }
          .btn-name { font-size:.80rem !important; }
          .btn-arr  { display:none !important; }

          .fnote { font-size:.68rem !important; }
        }

        /* TABLET */
        @media (min-width:601px) and (max-width:960px) {
          .photo-zone { height:58vh !important; }
          .name { font-size: clamp(4rem,10.5vw,7rem) !important; }
          .shell { padding: 0 2rem 4rem !important; }
        }
      `}</style>

      {/* ═══ TICKER ═══════════════════════════════════════════════════════ */}
      <div className="tk-shell c-fade">
        <div className="tk-stripe" />
        <div className="tk-bar">
          <div className="tk-track">
            {Array(12).fill(null).map((_, i) => (
              <span key={i} className="tk-item">
                {weddingConfig.celebrationTitle}
                <span className="tk-gem"> ✦ </span>
                {date}
                <span className="tk-gem"> ✦ </span>
                {weddingConfig.venueName}
                <span className="tk-gem"> ✦ </span>
                {weddingConfig.venueCity}
                <span className="tk-gem"> ✦ </span>
                {bf} &amp; {gf}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ PAGE ═════════════════════════════════════════════════════════ */}
      <main style={{
        minHeight:"100dvh",
        background:"var(--ivory)",
        display:"flex", flexDirection:"column", alignItems:"center",
        fontFamily:"var(--bf)",
        overflowX:"hidden",
      }}>

        {/* ─── HERO PHOTO ZONE ────────────────────────────────────────── */}
        {/* Full-width, edge-to-edge. Photo is properly dark.             */}
        {/* Names sit centered over it — they are the headline.           */}
        <div className="photo-zone" style={{
          position:"relative",
          width:"100%",
          height:"clamp(280px,75vh,680px)",
          overflow:"hidden",
          /* Top margin just clears the ticker bar */
          marginTop:"clamp(1.8rem,4vh,3rem)",
        }}>

          {/* ── Photo ── dark, desaturated, sepia-warm ── */}
          <div style={{
            position:"absolute", inset:"-5%",
            backgroundImage:`url(${heroPhoto})`,
            backgroundSize:"cover",
            backgroundPosition:"center 30%",
            filter:"saturate(.45) brightness(.62) sepia(.12)",
            animation:"bgPan 30s ease-in-out infinite alternate",
          }} />

          {/* ── Gradient — top & bottom ONLY fade to ivory ── */}
          {/* Centre stays open so photo breathes clearly     */}
          <div style={{
            position:"absolute", inset:0,
            background:`linear-gradient(to bottom,
              var(--ivory) 0%,
              rgba(245,239,230,.08) 16%,
              rgba(245,239,230,.08) 76%,
              var(--ivory) 100%)`,
          }} />

          {/* ── Names ────────────────────────────────────── */}
          <div style={{
            position:"absolute", inset:0,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            textAlign:"center", padding:"0 1.5rem",
          }}>

            {/* Occasion eyebrow */}
            <div className="c-r0" style={{
              display:"flex", alignItems:"center", gap:12,
              marginBottom:"clamp(.9rem,2vh,1.6rem)",
            }}>
              <div style={{ width:24, height:1, background:"var(--gold-lt)" }} />
              <span className="eyebrow-lbl" style={{
                fontFamily:"var(--bf)",
                fontSize:".46rem", letterSpacing:".48em",
                textTransform:"uppercase", color:"var(--gold-lt)", fontWeight:700,
              }}>
                {weddingConfig.celebrationTitle}
              </span>
              <div style={{ width:24, height:1, background:"var(--gold-lt)" }} />
            </div>

            {/* MARION — white, large, commanding */}
            <span className="name c-na" style={{
              color:"#FFFFFF",
              textShadow:"0 1px 0 rgba(0,0,0,.18), 0 4px 28px rgba(0,0,0,.40)",
            }}>
              {bf}
            </span>

            {/* & — italic crimson, smaller */}
            <span className="amp c-amp" style={{
              fontFamily:"var(--df)",
              fontSize:"clamp(1.5rem,4.2vw,3rem)",
              fontWeight:300, fontStyle:"italic",
              color:"var(--gold-lt)",
              letterSpacing:".14em", lineHeight:1.1,
              display:"block",
              margin:".06em 0",
            }}>
              &amp;
            </span>

            {/* LIVINGSTON — warm parchment, slightly lighter so it reads */}
            {/* distinctly from Marion but equally present               */}
            <span className="name c-nb" style={{
              color:"#EDD9BF",
              textShadow:"0 1px 0 rgba(0,0,0,.18), 0 4px 28px rgba(0,0,0,.40)",
            }}>
              {gf}
            </span>

          </div>
        </div>

        {/* ─── CONTENT SHELL ──────────────────────────────────────────── */}
        <div className="shell" style={{
          width:"100%", maxWidth:"540px",
          padding:"0 2.25rem 5rem",
          display:"flex", flexDirection:"column", alignItems:"center",
        }}>

          {/* Gold hairline rule — grows in from centre */}
          <div className="c-rule" style={{
            width:"min(160px,48%)", height:1,
            background:"linear-gradient(90deg,transparent,var(--gold),transparent)",
            marginBottom:"clamp(1.4rem,2.8vh,2rem)",
          }} />

          {/* ── Event strip ── */}
          <div className="ev-strip c-r1">

            {/* Ceremony */}
            <div className="ev-col">
              <p className="ev-eyebrow" style={{
                fontFamily:"var(--bf)",
                fontSize:".42rem", letterSpacing:".38em",
                textTransform:"uppercase", color:"var(--gold)", fontWeight:700,
                marginBottom:".42rem",
              }}>Ceremony</p>
              <p className="ev-name" style={{
                fontFamily:"var(--df)",
                fontSize:".90rem", fontWeight:600,
                color:"var(--ink)", lineHeight:1.28, marginBottom:".25rem",
              }}>{weddingConfig.venueName}</p>
              <p className="ev-time" style={{
                fontFamily:"var(--bf)",
                fontSize:".68rem", color:"var(--stone)", lineHeight:1.5,
              }}>{date} &middot; 3 pm</p>
            </div>

            <div className="ev-sep" />

            {/* Reception */}
            <div className="ev-col">
              <p className="ev-eyebrow" style={{
                fontFamily:"var(--bf)",
                fontSize:".42rem", letterSpacing:".38em",
                textTransform:"uppercase", color:"var(--gold)", fontWeight:700,
                marginBottom:".42rem",
              }}>Reception</p>
              <p className="ev-name" style={{
                fontFamily:"var(--df)",
                fontSize:".90rem", fontWeight:600,
                color:"var(--ink)", lineHeight:1.28, marginBottom:".25rem",
              }}>{weddingConfig.receptionVenueName}</p>
              <p className="ev-time" style={{
                fontFamily:"var(--bf)",
                fontSize:".68rem", color:"var(--stone)", lineHeight:1.5,
              }}>{date} &middot; 6 pm</p>
            </div>

          </div>

          {/* Thin rule under cards */}
          <div style={{
            width:"100%", height:1, background:"var(--border)",
            marginBottom:"clamp(1.4rem,2.8vh,1.9rem)",
          }} />

          {/* ── Quote ── */}
          <blockquote className="quote c-r2" style={{
            fontFamily:"var(--df)", fontStyle:"italic",
            fontSize:"clamp(.88rem,1.5vw,.98rem)",
            color:"var(--stone)", lineHeight:1.95,
            textAlign:"center", width:"100%",
            padding:".95rem 1.2rem",
            borderTop:"1px solid var(--border)",
            borderBottom:"1px solid var(--border)",
            marginBottom:"clamp(1.6rem,3vh,2.2rem)",
          }}>
            &ldquo;{weddingConfig.introQuote}&rdquo;
          </blockquote>

          {/* ── Private access divider ── */}
          <div className="c-r3" style={{
            display:"flex", alignItems:"center", gap:12,
            marginBottom:"1rem", width:"100%",
          }}>
            <div style={{ flex:1, height:1, background:"var(--border)" }} />
            <span className="div-label" style={{
              fontFamily:"var(--bf)",
              fontSize:".42rem", letterSpacing:".40em",
              textTransform:"uppercase", color:"var(--stone)", fontWeight:600,
            }}>Private access</span>
            <div style={{ flex:1, height:1, background:"var(--border)" }} />
          </div>

          {/* ── Buttons ── */}
          <div className="btn-row c-r4">

            {/* Couple */}
            <a href="/login?hint=couple&redirect=/admin" className="btn btn-p">
              <span style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                <span className="btn-top" style={{
                  fontFamily:"var(--bf)",
                  fontSize:".40rem", letterSpacing:".26em",
                  textTransform:"uppercase", color:"rgba(255,255,255,.55)", fontWeight:600,
                }}>The couple</span>
                <span className="btn-name" style={{
                  fontFamily:"var(--bf)",
                  fontSize:".84rem", fontWeight:700,
                  color:"#fff", whiteSpace:"nowrap",
                }}>{bf} &amp; {gf}</span>
              </span>
              <svg className="btn-arr" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>

            {/* Family */}
            <a href="/login?hint=vault&redirect=/family" className="btn btn-s">
              <span style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                <span className="btn-top" style={{
                  fontFamily:"var(--bf)",
                  fontSize:".40rem", letterSpacing:".26em",
                  textTransform:"uppercase", color:"var(--stone)", fontWeight:600,
                }}>Family vault</span>
                <span className="btn-name" style={{
                  fontFamily:"var(--bf)",
                  fontSize:".84rem", fontWeight:700,
                  color:"var(--maroon)", whiteSpace:"nowrap",
                }}>Family login</span>
              </span>
              <svg className="btn-arr" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="var(--maroon)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{flexShrink:0,opacity:.6}}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>

          </div>

          {/* ── Guest footnote ── */}
          <p className="fnote c-r5" style={{
            marginTop:"1.4rem",
            fontFamily:"var(--df)", fontStyle:"italic",
            fontSize:".70rem", color:"var(--stone)",
            textAlign:"center", lineHeight:1.75, opacity:.72,
          }}>
            Are you a guest? Open the personal link that {bf} &amp; {gf} sent directly to you.
          </p>

        </div>
      </main>

      <div className="foot-rule" aria-hidden />
    </>
  );
}
