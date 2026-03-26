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

        /* ── Platform palette — matches globals.css exactly ── */
        :root {
          --bg:     #FDFAF7;
          --bg-w:   #F8F3EE;
          --bg-l:   #F1E9E0;
          --rose:   #BE2D45;
          --rose-h: #A42539;
          --rose-d: rgba(190,45,69,0.55);
          --gold:   #A87808;
          --gold-l: #C9960A;
          --ink:    #120B0E;
          --ink-2:  #362030;
          --ink-3:  #72504A;
          --ink-4:  #A88888;
          --bdr:    rgba(190,45,69,0.10);
          --bdr-md: rgba(190,45,69,0.18);
          --bdr-gd: rgba(168,120,8,0.22);
          --df: var(--font-display),'Cormorant Garamond',Georgia,serif;
          --bf: var(--font-body),'Manrope',system-ui,sans-serif;
          --expo: cubic-bezier(.16,1,.30,1);
          --spring: cubic-bezier(.34,1.56,.64,1);
        }

        /* ── Keyframes ── */
        @keyframes tickerMove {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes rise {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes nameIn {
          from { opacity:0; transform:translateY(44px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ruleIn {
          from { opacity:0; transform:scaleX(0); }
          to   { opacity:1; transform:scaleX(1); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes bgZoom {
          from { transform: scale(1.00); }
          to   { transform: scale(1.05); }
        }

        /* ── Reveals ── */
        .c-fade { animation: fadeIn  1.1s ease both; }
        .c-r0   { animation: rise   .9s .10s var(--expo) both; }
        .c-na   { animation: nameIn 1.1s .22s var(--expo) both; }
        .c-amp  { animation: rise   .7s .44s var(--expo) both; }
        .c-nb   { animation: nameIn 1.1s .36s var(--expo) both; }
        .c-r1   { animation: rise   .9s .58s var(--expo) both; }
        .c-r2   { animation: rise   .9s .70s var(--expo) both; }
        .c-r3   { animation: rise   .9s .82s var(--expo) both; }
        .c-r4   { animation: rise   .9s .94s var(--expo) both; }
        .c-r5   { animation: rise   .9s 1.06s var(--expo) both; }
        .c-r6   { animation: rise   .9s 1.18s var(--expo) both; }
        .c-rule { transform-origin:center; animation: ruleIn 1.0s .55s ease both; }

        /* ── TICKER ── */
        .tk-shell {
          position:fixed; top:0; left:0; right:0; z-index:80;
        }
        .tk-stripe {
          height:2px;
          background: linear-gradient(90deg,
            transparent 0%, var(--rose) 22%,
            var(--gold-l) 50%, var(--rose) 78%, transparent 100%);
        }
        .tk-bar {
          overflow:hidden; padding:5px 0;
          background: rgba(253,250,247,0.97);
          backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
          border-bottom:1px solid var(--bdr);
        }
        .tk-track {
          display:flex; gap:3rem;
          white-space:nowrap; width:max-content;
          animation: tickerMove 72s linear infinite;
        }
        .tk-item {
          font-family:var(--bf);
          font-size:.46rem; letter-spacing:.44em;
          text-transform:uppercase; font-weight:600;
          color:var(--ink-3);
        }
        .tk-gem { color:var(--gold); margin:0 .06em; }

        /* ── PAGE ── */
        .page {
          min-height:100dvh;
          background: var(--bg);
          display:flex; flex-direction:column; align-items:center;
          font-family:var(--bf); overflow-x:hidden;
          /* Subtle warm noise — same as platform globals */
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
        }

        /* ── NAMES ZONE — photo behind names only ── */
        .names-zone {
          position: relative;
          width: 100%;
          overflow: hidden;
          /* Explicit min-height so ::before pseudo-element has a real box */
          min-height: clamp(320px, 72vh, 680px);
          padding: clamp(5rem,10vh,7.5rem) 1.5rem clamp(2.5rem,5vh,4rem);
          display:flex; flex-direction:column; align-items:center;
          text-align:center;
          margin-top: clamp(2rem,4.5vh,3.2rem);
        }

        /* Photo lives only inside names-zone via pseudo-element */
        .names-zone::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1800&q=80');
          background-size: cover;
          background-position: center 35%;
          /* ── Overlay values ──────────────────────────────────────────────
             Photo: church interior, wooden pews, warm stone, soft light
             saturate(0.42) — keeps warm honey tones, removes cool grey    
             brightness(0.72) — darkens to sit behind ivory-tinted text    
             sepia(0.15)     — pushes remaining colour into the --bg family 
             Net result: photo reads as warm parchment depth, not a photo  
          ── */
          filter: saturate(0.50) brightness(0.60) sepia(0.14);
          z-index: 0;
          animation: bgZoom 28s ease-in-out infinite alternate;
        }

        /* Gradient washes over the photo — ivory at edges, open at centre */
        /* Top: fades FROM page background INTO photo */
        /* Bottom: fades FROM photo INTO page background */
        /* Left/right: slight fade to contain the photo within the zone */
        .names-zone::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom,
              var(--bg) 0%,
              rgba(253,250,247,.18) 18%,
              rgba(253,250,247,.18) 72%,
              var(--bg) 100%),
            radial-gradient(ellipse 90% 100% at 50% 50%,
              transparent 40%,
              rgba(253,250,247,.50) 100%);
          z-index: 1;
          pointer-events: none;
        }

        /* All content inside names-zone sits above both pseudo-elements */
        .names-zone > * { position: relative; z-index: 2; }

        /* ── NAMES ── */
        .name {
          font-family: var(--df);
          font-size: clamp(4.2rem,12.5vw,10.5rem);
          font-weight: 600;
          line-height: .88;
          letter-spacing: -.02em;
          display: block;
          text-align: center;
        }

        /* ── ORNAMENT ── */
        .orn { display:block; margin:0 auto; }

        /* ── CONTENT SHELL — pure platform bg, no photo ── */
        .shell {
          width:100%; max-width:540px;
          padding:0 2.25rem 5.5rem;
          display:flex; flex-direction:column; align-items:center;
          /* This area is pure --bg. Clean, matches the rest of the app. */
          background: transparent;
        }

        /* ── EVENT STRIP ── */
        .ev-strip {
          display:grid; grid-template-columns:1fr 1px 1fr;
          width:100%; max-width:420px;
          border:1px solid var(--bdr-md);
          border-radius:2px;
          background: var(--bg-w);
          box-shadow: 0 2px 12px rgba(15,10,11,.04), 0 4px 24px rgba(190,45,69,.03);
        }
        .ev-col { padding:18px 20px; text-align:center; }
        .ev-sep { background:var(--bdr-md); }

        /* ── QUOTE ── */
        .quote-wrap {
          width:100%; position:relative;
          padding:1.1rem 1.5rem;
          background: var(--bg-w);
          border-left:2px solid var(--rose);
          border-radius:0 2px 2px 0;
        }

        /* ── BUTTONS — use platform rose gradient + ghost styles ── */
        .btn-row { display:flex; gap:.75rem; width:100%; }

        /* Primary — rose gradient, matches platform btn-primary */
        .btn-p {
          flex:1;
          display:inline-flex; align-items:center; justify-content:center;
          gap:10px; padding:14px 22px;
          border-radius:999px;
          text-decoration:none; cursor:pointer;
          font-family:var(--bf);
          background: linear-gradient(135deg, var(--rose-h) 0%, var(--rose) 60%);
          border: 1px solid rgba(190,45,69,.25);
          box-shadow: 0 4px 20px rgba(190,45,69,.28), 0 2px 8px rgba(190,45,69,.15);
          position:relative; overflow:hidden;
          transition: transform .22s var(--expo), box-shadow .22s ease, filter .15s ease;
        }
        .btn-p::after {
          content:'';
          position:absolute; inset:0;
          background: linear-gradient(105deg,
            transparent 35%, rgba(255,255,255,.20) 50%, transparent 65%);
          background-size:200% 100%; background-position:200% 0;
          transition: background-position .55s ease;
          pointer-events:none;
        }
        .btn-p:hover {
          transform:translateY(-2px) scale(1.01);
          filter:brightness(1.06);
          box-shadow:0 10px 32px rgba(190,45,69,.38), 0 4px 12px rgba(190,45,69,.20);
        }
        .btn-p:hover::after { background-position:-200% 0; }

        /* Secondary — ghost, matches platform btn-ghost */
        .btn-s {
          flex:1;
          display:inline-flex; align-items:center; justify-content:center;
          gap:10px; padding:14px 22px;
          border-radius:999px;
          text-decoration:none; cursor:pointer;
          font-family:var(--bf);
          background: rgba(253,250,247,.70);
          border: 1px solid var(--bdr-md);
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 12px rgba(15,10,11,.04);
          transition: transform .22s var(--expo), box-shadow .22s ease,
                      border-color .18s ease, background .18s ease;
        }
        .btn-s:hover {
          transform:translateY(-2px);
          border-color: var(--rose);
          background: rgba(190,45,69,.04);
          box-shadow: 0 8px 28px rgba(190,45,69,.12);
        }

        .btn-text { display:flex; flex-direction:column; gap:2px; }
        .btn-ey {
          font-family:var(--bf);
          font-size:.38rem; letter-spacing:.30em;
          text-transform:uppercase; font-weight:700;
        }
        .btn-lb {
          font-family:var(--df);
          font-size:1.0rem; font-weight:400;
          letter-spacing:.01em; line-height:1;
        }

        /* ── FOOT RULE ── */
        .foot-rule {
          position:fixed; bottom:0; left:0; right:0; height:2px; z-index:80;
          background: linear-gradient(90deg,
            transparent 0%, var(--rose) 22%,
            var(--gold-l) 50%, var(--rose) 78%, transparent 100%);
        }

        /* ── MOBILE ── */
        @media (max-width:600px) {
          .names-zone {
            min-height: 58vw !important;
            padding: 3.5rem 1.25rem 2rem !important;
            margin-top: 1.8rem !important;
          }
          .name { font-size:13vw !important; }
          .amp  { font-size:8vw !important; }
          .eyebrow-line span { font-size:.38rem !important; letter-spacing:.28em !important; }

          .shell { padding:0 1.25rem 3.5rem !important; }

          .ev-col { padding:12px 10px !important; }
          .ev-ey  { font-size:.34rem !important; letter-spacing:.22em !important; margin-bottom:.28rem !important; }
          .ev-nm  { font-size:.82rem !important; }
          .ev-tm  { font-size:.64rem !important; }

          .quote-wrap { padding:.85rem 1rem !important; }
          .quote-text { font-size:.86rem !important; line-height:1.80 !important; }

          .div-lbl { font-size:.36rem !important; letter-spacing:.24em !important; }

          .btn-row { gap:.6rem !important; }
          .btn-p, .btn-s { padding:11px 16px !important; }
          .btn-ey { display:none !important; }
          .btn-lb { font-size:.88rem !important; }

          .fnote { font-size:.68rem !important; }
          .orn   { width:130px !important; }
        }

        /* ── TABLET ── */
        @media (min-width:601px) and (max-width:960px) {
          .name { font-size:clamp(4rem,11vw,7.5rem) !important; }
          .shell { padding:0 2rem 4rem !important; }
        }
      `}</style>

      {/* ═══ TICKER ══════════════════════════════════════════════════════ */}
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

      {/* ═══ PAGE ════════════════════════════════════════════════════════ */}
      <main className="page">

        {/* ── NAMES ZONE — photo scoped here only ─────────────────────── */}
        <div className="names-zone">

          {/* Occasion eyebrow */}
          <div className="eyebrow-line c-r0" style={{
            display:"flex", alignItems:"center", gap:14,
            marginBottom:"clamp(1.2rem,2.8vh,2rem)",
          }}>
            <div style={{ width:32, height:1,
              background:"linear-gradient(90deg,transparent,var(--gold))" }} />
            <span style={{
              fontFamily:"var(--bf)",
              fontSize:".46rem", letterSpacing:".50em",
              textTransform:"uppercase", color:"var(--gold-l)", fontWeight:700,
            }}>
              {weddingConfig.celebrationTitle}
            </span>
            <div style={{ width:32, height:1,
              background:"linear-gradient(90deg,var(--gold),transparent)" }} />
          </div>

          {/* MARION — platform name-bride-light on light bg = deep ink */}
          {/* Over photo we use the dark name token — white-adjacent      */}
          <span className="name c-na" style={{
            color:"#FFFFFF",
            textShadow:"0 2px 32px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.28)",
          }}>
            {bf}
          </span>

          {/* & — rose italic — matches platform rose */}
          <span className="amp c-amp" style={{
            fontFamily:"var(--df)",
            fontSize:"clamp(1.5rem,4.2vw,3rem)",
            fontWeight:300, fontStyle:"italic",
            color:"var(--rose)",
            letterSpacing:".16em", lineHeight:1.1,
            display:"block",
            margin:".06em 0",
          }}>
            &amp;
          </span>

          {/* LIVINGSTON — warm gold-brown from platform --name-groom-light */}
          <span className="name c-nb" style={{
            color:"#F2C8A0",
            textShadow:"0 2px 32px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.28)",
          }}>
            {gf}
          </span>

          {/* Ornamental SVG divider — using platform rose and gold tones */}
          <svg className="orn c-r1" style={{
            width:"clamp(150px,34%,240px)",
            marginTop:"clamp(1.5rem,3.2vh,2.5rem)",
            overflow:"visible",
          }} viewBox="0 0 240 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <line x1="0"   y1="14" x2="95"  y2="14" stroke="#A87808" strokeWidth=".8"  opacity=".45"/>
            <line x1="145" y1="14" x2="240" y2="14" stroke="#A87808" strokeWidth=".8"  opacity=".45"/>
            <line x1="0"   y1="14" x2="72"  y2="14" stroke="#A87808" strokeWidth="1.5" opacity=".18"/>
            <line x1="168" y1="14" x2="240" y2="14" stroke="#A87808" strokeWidth="1.5" opacity=".18"/>
            <polygon points="120,6 127,14 120,22 113,14" fill="none" stroke="#A87808" strokeWidth="1" opacity=".65"/>
            <polygon points="120,10 125,14 120,18 115,14" fill="#A87808" opacity=".50"/>
            <circle cx="101" cy="14" r="1.8" fill="#A87808" opacity=".48"/>
            <circle cx="139" cy="14" r="1.8" fill="#A87808" opacity=".48"/>
            <circle cx="93"  cy="14" r="1.1" fill="#A87808" opacity=".28"/>
            <circle cx="147" cy="14" r="1.1" fill="#A87808" opacity=".28"/>
            <path d="M109 14 Q113 9 117 14 Q113 19 109 14Z" fill="#BE2D45" opacity=".25"/>
            <path d="M131 14 Q127 9 123 14 Q127 19 131 14Z" fill="#BE2D45" opacity=".25"/>
          </svg>

        </div>

        {/* ── CONTENT SHELL — pure page bg, no photo ────────────────── */}
        <div className="shell" style={{ marginTop:"clamp(1.2rem,2.5vh,1.8rem)" }}>

          {/* ── Event strip ── */}
          <div className="ev-strip c-r2">
            <div className="ev-col">
              <p className="ev-ey" style={{
                fontFamily:"var(--bf)",
                fontSize:".42rem", letterSpacing:".38em",
                textTransform:"uppercase", color:"var(--gold-l)", fontWeight:700,
                marginBottom:".44rem",
              }}>Ceremony</p>
              <p className="ev-nm" style={{
                fontFamily:"var(--df)",
                fontSize:".92rem", fontWeight:600,
                color:"var(--ink)", lineHeight:1.28, marginBottom:".28rem",
              }}>{weddingConfig.venueName}</p>
              <p className="ev-tm" style={{
                fontFamily:"var(--bf)",
                fontSize:".70rem", color:"var(--ink-3)", lineHeight:1.5,
              }}>{date} &middot; 3 pm</p>
            </div>
            <div className="ev-sep" />
            <div className="ev-col">
              <p className="ev-ey" style={{
                fontFamily:"var(--bf)",
                fontSize:".42rem", letterSpacing:".38em",
                textTransform:"uppercase", color:"var(--gold-l)", fontWeight:700,
                marginBottom:".44rem",
              }}>Reception</p>
              <p className="ev-nm" style={{
                fontFamily:"var(--df)",
                fontSize:".92rem", fontWeight:600,
                color:"var(--ink)", lineHeight:1.28, marginBottom:".28rem",
              }}>{weddingConfig.receptionVenueName}</p>
              <p className="ev-tm" style={{
                fontFamily:"var(--bf)",
                fontSize:".70rem", color:"var(--ink-3)", lineHeight:1.5,
              }}>{date} &middot; 6 pm</p>
            </div>
          </div>

          {/* Thin rose rule */}
          <div style={{
            width:"100%", height:1,
            background:"linear-gradient(90deg,transparent,var(--bdr-md),transparent)",
            marginBottom:"clamp(1.4rem,2.8vh,2rem)",
          }} />

          {/* ── Quote ── */}
          <div className="quote-wrap c-r3" style={{
            marginBottom:"clamp(1.6rem,3vh,2.2rem)",
          }}>
            {/* Rose corner brackets — same as platform accent */}
            <svg style={{position:"absolute",top:8,left:8}} width="13" height="13"
              viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M12 1H1V12" stroke="#BE2D45" strokeWidth="1.2"
                strokeLinecap="round" opacity=".40"/>
            </svg>
            <svg style={{position:"absolute",bottom:8,right:8}} width="13" height="13"
              viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M1 12H12V1" stroke="#BE2D45" strokeWidth="1.2"
                strokeLinecap="round" opacity=".40"/>
            </svg>
            <blockquote className="quote-text" style={{
              fontFamily:"var(--df)", fontStyle:"italic",
              fontSize:"clamp(.88rem,1.5vw,.98rem)",
              color:"var(--ink-2)", lineHeight:1.95,
              textAlign:"center", padding:"0 .5rem",
            }}>
              &ldquo;{weddingConfig.introQuote}&rdquo;
            </blockquote>
          </div>

          {/* ── Private access divider ── */}
          <div className="c-r4" style={{
            display:"flex", alignItems:"center", gap:14,
            marginBottom:"1.1rem", width:"100%",
          }}>
            <div style={{flex:1,height:1,
              background:"linear-gradient(90deg,transparent,var(--bdr-md))"}} />
            <span className="div-lbl" style={{
              fontFamily:"var(--bf)",
              fontSize:".42rem", letterSpacing:".42em",
              textTransform:"uppercase", color:"var(--ink-3)", fontWeight:600,
            }}>Private access</span>
            <div style={{flex:1,height:1,
              background:"linear-gradient(90deg,var(--bdr-md),transparent)"}} />
          </div>

          {/* ── BUTTONS ── */}
          <div className="btn-row c-r5">

            {/* Couple — primary rose pill (platform style) */}
            <a href="/login?hint=couple&redirect=/admin" className="btn-p">
              <div className="btn-text">
                <span className="btn-ey" style={{color:"rgba(255,255,255,.55)"}}>
                  The couple
                </span>
                <span className="btn-lb" style={{color:"#FFFFFF"}}>
                  {bf} &amp; {gf}
                </span>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,.45)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>

            {/* Family — ghost pill (platform style) */}
            <a href="/login?hint=vault&redirect=/family" className="btn-s">
              <div className="btn-text">
                <span className="btn-ey" style={{color:"var(--ink-3)"}}>
                  Family vault
                </span>
                <span className="btn-lb" style={{color:"var(--rose)"}}>
                  Family login
                </span>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="var(--rose)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{flexShrink:0,opacity:.60}}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>

          </div>

          {/* ── Guest footnote ── */}
          <p className="fnote c-r6" style={{
            marginTop:"1.5rem",
            fontFamily:"var(--df)", fontStyle:"italic",
            fontSize:".70rem", color:"var(--ink-3)",
            textAlign:"center", lineHeight:1.80, opacity:.72,
          }}>
            Are you a guest? Open the personal link that {bf} &amp; {gf} sent directly to you.
          </p>

        </div>
      </main>

      <div className="foot-rule" aria-hidden />
    </>
  );
}
