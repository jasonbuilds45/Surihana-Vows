import type { Metadata } from "next";
import { weddingConfig } from "@/lib/config";
import { getSlideshowPhotos } from "@/modules/premium/photo-gallery";
import { formatDate } from "@/utils/formatDate";

export const metadata: Metadata = {
  title: `${weddingConfig.brideName} & ${weddingConfig.groomName} | ${weddingConfig.celebrationTitle}`,
  description: weddingConfig.heroSubtitle,
};

export default function HomePage() {
  const bf   = weddingConfig.brideName.split(" ")[0]!;
  const gf   = weddingConfig.groomName.split(" ")[0]!;
  const date = formatDate(weddingConfig.weddingDate);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow-x: hidden; }

        /* ─── PALETTE ───────────────────────────────────────────────────── */
        :root {
          --ivory:  #F8F3EB;   /* warm parchment — page canvas             */
          --cream:  #EFE7D9;   /* slightly darker parchment — panels        */
          --vellum: #E6DAC8;   /* deepest parchment — borders, hairlines    */
          --maroon: #6B1221;   /* deep crimson — primary                    */
          --claret: #8C1B30;   /* slightly brighter maroon — hover          */
          --gold:   #9C7520;   /* antique gold — rules, accents             */
          --gilded: #C4973A;   /* lighter gold — eyebrows, gems             */
          --ink:    #1A0D0B;   /* near-black — primary text                 */
          --sepia:  #4A3020;   /* warm dark brown — secondary text          */
          --stone:  #7A5C42;   /* mid stone — muted text                    */
          --border: rgba(156,117,32,0.20);
          --bdr-md: rgba(156,117,32,0.32);
          --df: var(--font-display),'Cormorant Garamond',Georgia,serif;
          --bf: var(--font-body),'Manrope',system-ui,sans-serif;
        }

        /* ─── KEYFRAMES ─────────────────────────────────────────────────── */
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes rise {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes nameReveal {
          from { opacity:0; transform:translateY(52px); letter-spacing:-.04em; }
          to   { opacity:1; transform:translateY(0);    letter-spacing:-.025em; }
        }
        @keyframes ruleIn {
          from { opacity:0; transform:scaleX(0); }
          to   { opacity:1; transform:scaleX(1); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes sealPulse {
          0%,100% { opacity:.55; transform:scale(1); }
          50%      { opacity:.80; transform:scale(1.015); }
        }

        /* ─── REVEALS ───────────────────────────────────────────────────── */
        .c-fade { animation: fadeIn    1.0s 0.0s  ease both; }
        .c-r0   { animation: rise      0.9s 0.08s cubic-bezier(.16,1,.3,1) both; }
        .c-na   { animation: nameReveal 1.2s 0.20s cubic-bezier(.16,1,.3,1) both; }
        .c-amp  { animation: rise      0.7s 0.44s cubic-bezier(.16,1,.3,1) both; }
        .c-nb   { animation: nameReveal 1.2s 0.34s cubic-bezier(.16,1,.3,1) both; }
        .c-r1   { animation: rise      0.9s 0.58s cubic-bezier(.16,1,.3,1) both; }
        .c-r2   { animation: rise      0.9s 0.70s cubic-bezier(.16,1,.3,1) both; }
        .c-r3   { animation: rise      0.9s 0.82s cubic-bezier(.16,1,.3,1) both; }
        .c-r4   { animation: rise      0.9s 0.94s cubic-bezier(.16,1,.3,1) both; }
        .c-r5   { animation: rise      0.9s 1.06s cubic-bezier(.16,1,.3,1) both; }
        .c-r6   { animation: rise      0.9s 1.18s cubic-bezier(.16,1,.3,1) both; }
        .c-rule { transform-origin:center; animation: ruleIn 1.0s 0.52s ease both; }

        /* ─── TICKER ────────────────────────────────────────────────────── */
        .tk-shell { position:fixed; top:0; left:0; right:0; z-index:80; }
        .tk-stripe {
          height:2px;
          background: linear-gradient(90deg,
            transparent 0%, var(--maroon) 22%,
            var(--gilded) 50%, var(--maroon) 78%, transparent 100%);
        }
        .tk-bar {
          overflow:hidden; padding:5px 0;
          background: rgba(248,243,235,0.98);
          backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .tk-track {
          display:flex; gap:3rem;
          white-space:nowrap; width:max-content;
          animation: ticker 72s linear infinite;
        }
        .tk-item {
          font-family:var(--bf);
          font-size:.46rem; letter-spacing:.44em;
          text-transform:uppercase; font-weight:600;
          color:var(--stone);
        }
        .tk-gem { color:var(--gilded); margin:0 .06em; }

        /* ─── PAGE BACKGROUND ─────────────────────────────────────────────── */
        /* Annie Spratt — old English church wedding aisle, Unsplash          */
        /* Photo: wooden pews, stone walls, baby's breath, natural daylight    */
        /* Overlay calculation:                                                */
        /*   brightness(0.60) — brings stone/wood into parchment tonal range  */
        /*   saturate(0.38)   — strips grey-green stone, keeps warm honey     */
        /*   sepia(0.18)      — nudges into the ivory-gold family              */
        /* Result: photo reads as warm parchment texture, not a photograph    */
        .page-bg {
          background-color: var(--ivory);
          position: relative;
        }
        .page-bg::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image: url('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1800&q=80');
          background-size: cover;
          background-position: center 30%;
          background-attachment: fixed;
          /* ── Overlay values — engineered for this palette ── */
          /* The photo has warm stone, cream flowers, wooden pews.            */
          /* At these values it becomes an ivory-toned texture layer that     */
          /* whispers through the page without competing with any text.       */
          filter: saturate(0.35) brightness(0.58) sepia(0.20);
          opacity: 1;
        }
        /* Ivory wash sits between photo and content                          */
        /* 78% opacity = photo contributes 22% of visual weight               */
        /* Just enough to feel like textured paper, not a photograph          */
        .page-bg::after {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 1;
          background: rgba(248,243,235,0.78);
          pointer-events: none;
        }
        /* All page content must sit above the two pseudo-element overlays */
        .tk-shell, .tk-shell ~ *, .foot-rule { position: relative; z-index: 2; }

        /* ─── NAMES ZONE — local contrast boost ──────────────────────────── */
        /* Names sit directly over the photo texture. A very subtle cream    */
        /* panel behind them improves contrast without boxing the text.       */
        .names-zone {
          position: relative;
        }
        .names-zone::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 85% 80% at 50% 50%,
            rgba(248,243,235,0.22) 0%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 0;
        }
        .names-zone > * { position: relative; z-index: 1; }

        /* ─── NAMES ─────────────────────────────────────────────────────── */
        .name {
          font-family: var(--df);
          font-size: clamp(4.4rem,13vw,11rem);
          font-weight: 300;
          line-height: .88;
          letter-spacing: -.025em;
          display: block;
          text-align: center;
        }

        /* ─── ORNAMENT SVG ──────────────────────────────────────────────── */
        /* Inline SVG floral divider — rendered at the exact point needed    */
        .ornament { display:block; margin:0 auto; }

        /* ─── EVENT STRIP ───────────────────────────────────────────────── */
        .ev-strip {
          display:grid; grid-template-columns:1fr 1px 1fr;
          width:100%; max-width:420px;
          border:1px solid var(--bdr-md);
          background: var(--cream);
        }
        .ev-col { padding:18px 20px; text-align:center; }
        .ev-sep { background:var(--bdr-md); }

        /* ─── QUOTE ─────────────────────────────────────────────────────── */
        .quote-wrap {
          width:100%; position:relative;
          padding:1.1rem 1.4rem;
          background: var(--cream);
          border-left:2px solid var(--gold);
        }

        /* ─── BUTTONS ───────────────────────────────────────────────────── */
        /* Refined rectangular access buttons — no radius, no gradients,    */
        /* just precise weight and colour. London club-house aesthetic.      */
        .btn-row { display:flex; gap:.875rem; width:100%; }

        .btn {
          flex:1; display:inline-flex;
          align-items:center; justify-content:space-between;
          gap:12px; padding:0; border-radius:0;
          text-decoration:none; cursor:pointer;
          font-family:var(--bf);
          border:1px solid transparent;
          transition:
            transform .22s cubic-bezier(.16,1,.3,1),
            box-shadow .22s ease,
            background .15s ease;
          overflow:hidden;
          position:relative;
        }

        /* Primary — solid maroon, white text, gold left accent */
        .btn-p {
          background:var(--maroon);
          border-color:rgba(107,18,33,.25);
          box-shadow: 0 2px 0 rgba(107,18,33,.35),
                      0 6px 24px rgba(107,18,33,.20);
        }
        .btn-p::before {
          content:'';
          position:absolute; left:0; top:0; bottom:0; width:3px;
          background:var(--gilded);
        }
        .btn-p:hover {
          transform:translateY(-2px);
          background:var(--claret);
          box-shadow: 0 4px 0 rgba(107,18,33,.30),
                      0 12px 36px rgba(107,18,33,.28);
        }
        .btn-p .btn-inner { padding:14px 20px 14px 22px; }

        /* Secondary — ivory bg, maroon border, maroon text */
        .btn-s {
          background:var(--ivory);
          border-color:rgba(107,18,33,.40);
          box-shadow: 0 2px 0 rgba(107,18,33,.12),
                      0 4px 18px rgba(107,18,33,.08);
        }
        .btn-s::before {
          content:'';
          position:absolute; left:0; top:0; bottom:0; width:3px;
          background:var(--bdr-md);
        }
        .btn-s:hover {
          transform:translateY(-2px);
          background:var(--cream);
          border-color:rgba(107,18,33,.65);
          box-shadow: 0 4px 0 rgba(107,18,33,.18),
                      0 10px 28px rgba(107,18,33,.12);
        }
        .btn-s .btn-inner { padding:14px 20px 14px 22px; }

        .btn-inner {
          display:flex; align-items:center;
          justify-content:space-between;
          gap:10px; width:100%;
        }
        .btn-text { display:flex; flex-direction:column; gap:2px; }
        .btn-eyebrow {
          font-family:var(--bf);
          font-size:.38rem; letter-spacing:.32em;
          text-transform:uppercase; font-weight:700;
        }
        .btn-label {
          font-family:var(--df);
          font-size:1.05rem; font-weight:400;
          letter-spacing:.01em; line-height:1;
        }

        /* ─── FOOT RULE ─────────────────────────────────────────────────── */
        .foot-rule {
          position:fixed; bottom:0; left:0; right:0; height:2px; z-index:80;
          background:linear-gradient(90deg,
            transparent 0%, var(--maroon) 22%,
            var(--gilded) 50%, var(--maroon) 78%, transparent 100%);
        }

        /* ─── MOBILE ≤ 600px ────────────────────────────────────────────── */
        @media (max-width:600px) {

          .name { font-size:12.5vw !important; letter-spacing:-.02em !important; }

          .shell { padding:0 1.25rem 3.5rem !important; }
          .names-zone { padding:3.2rem 1.25rem 0 !important; }

          .ev-col { padding:12px 10px !important; }
          .ev-eyebrow { font-size:.34rem !important; letter-spacing:.22em !important; margin-bottom:.28rem !important; }
          .ev-name    { font-size:.84rem !important; }
          .ev-time    { font-size:.64rem !important; }

          .quote-wrap  { padding:.85rem 1rem !important; }
          .quote-text  { font-size:.86rem !important; line-height:1.80 !important; }

          .div-label   { font-size:.36rem !important; letter-spacing:.24em !important; }

          /* Buttons on mobile — compact, no eyebrow */
          .btn-row     { gap:.6rem !important; }
          .btn-p .btn-inner,
          .btn-s .btn-inner { padding:11px 14px 11px 16px !important; }
          .btn-eyebrow { display:none !important; }
          .btn-label   { font-size:.88rem !important; }
          .btn-arr     { display:none !important; }

          .fnote { font-size:.68rem !important; }

          .orn-sm { width:140px !important; }
        }

        /* ─── TABLET ────────────────────────────────────────────────────── */
        @media (min-width:601px) and (max-width:960px) {
          .name { font-size:clamp(4rem,11vw,7.5rem) !important; }
          .shell { padding:0 2rem 4rem !important; }
          .names-zone { padding:5rem 2rem 0 !important; }
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
      <main className="page-bg" style={{
        minHeight:"100dvh",
        display:"flex", flexDirection:"column", alignItems:"center",
        fontFamily:"var(--bf)", overflowX:"hidden",
      }}>

        {/* ─── NAMES ZONE — top of page, generous space ─────────────── */}
        {/* No photo. The names own this space entirely.                 */}
        <div className="names-zone" style={{
          width:"100%", maxWidth:"700px",
          padding:"clamp(4rem,9vh,6.5rem) 2rem 0",
          display:"flex", flexDirection:"column", alignItems:"center",
          textAlign:"center",
        }}>

          {/* Occasion eyebrow */}
          <div className="c-r0" style={{
            display:"flex", alignItems:"center", gap:14,
            marginBottom:"clamp(1.4rem,3vh,2.25rem)",
          }}>
            <div style={{ width:40, height:1, background:"var(--gilded)", opacity:.7 }} />
            <span style={{
              fontFamily:"var(--bf)",
              fontSize:".46rem", letterSpacing:".52em",
              textTransform:"uppercase", color:"var(--gilded)", fontWeight:700,
            }}>
              {weddingConfig.celebrationTitle}
            </span>
            <div style={{ width:40, height:1, background:"var(--gilded)", opacity:.7 }} />
          </div>

          {/* ── MARION — deep ink, enormous, weight 300 ── */}
          {/* On ivory with no photo competing, weight 300  */}
          {/* Cormorant at this size is undeniably commanding */}
          <span className="name c-na" style={{ color:"var(--ink)" }}>
            {bf}
          </span>

          {/* ── & ── gold italic, breathing room either side ── */}
          <span className="c-amp" style={{
            fontFamily:"var(--df)",
            fontSize:"clamp(1.6rem,4.5vw,3.2rem)",
            fontWeight:300, fontStyle:"italic",
            color:"var(--gold)",
            letterSpacing:".18em", lineHeight:1.1,
            display:"block",
            margin:".05em 0",
          }}>
            &amp;
          </span>

          {/* ── LIVINGSTON — deep maroon, same scale ── */}
          <span className="name c-nb" style={{ color:"var(--maroon)" }}>
            {gf}
          </span>

          {/* Floral ornamental divider — SVG inline */}
          {/* Classic engraved-invitation style motif  */}
          <svg className="ornament orn-sm c-r1" style={{
            width:"clamp(160px,36%,260px)",
            marginTop:"clamp(1.6rem,3.5vh,2.75rem)",
            marginBottom:0, overflow:"visible",
          }} viewBox="0 0 260 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            {/* Left arm */}
            <line x1="0" y1="14" x2="100" y2="14" stroke="#9C7520" strokeWidth=".8" opacity=".5"/>
            <line x1="0" y1="14" x2="80"  y2="14" stroke="#9C7520" strokeWidth="1.4" opacity=".25"/>
            {/* Right arm */}
            <line x1="160" y1="14" x2="260" y2="14" stroke="#9C7520" strokeWidth=".8" opacity=".5"/>
            <line x1="180" y1="14" x2="260" y2="14" stroke="#9C7520" strokeWidth="1.4" opacity=".25"/>
            {/* Centre diamond cluster */}
            <polygon points="130,7 136,14 130,21 124,14" fill="none" stroke="#9C7520" strokeWidth="1"/>
            <polygon points="130,10 134,14 130,18 126,14" fill="#9C7520" opacity=".55"/>
            <circle cx="110" cy="14" r="1.5" fill="#9C7520" opacity=".55"/>
            <circle cx="150" cy="14" r="1.5" fill="#9C7520" opacity=".55"/>
            <circle cx="103" cy="14" r="1"   fill="#9C7520" opacity=".35"/>
            <circle cx="157" cy="14" r="1"   fill="#9C7520" opacity=".35"/>
            {/* Small leaves either side of diamond */}
            <path d="M118 14 Q122 9 126 14 Q122 19 118 14Z" fill="#9C7520" opacity=".28"/>
            <path d="M142 14 Q138 9 134 14 Q138 19 142 14Z" fill="#9C7520" opacity=".28"/>
          </svg>

        </div>

        {/* ─── CONTENT SHELL ─────────────────────────────────────────── */}
        <div className="shell" style={{
          width:"100%", maxWidth:"540px",
          padding:"0 2.25rem 5.5rem",
          display:"flex", flexDirection:"column", alignItems:"center",
          marginTop:"clamp(1.4rem,3vh,2.2rem)",
        }}>

          {/* ── Event strip ── */}
          <div className="ev-strip c-r2">
            <div className="ev-col">
              <p className="ev-eyebrow" style={{
                fontFamily:"var(--bf)",
                fontSize:".42rem", letterSpacing:".38em",
                textTransform:"uppercase", color:"var(--gilded)", fontWeight:700,
                marginBottom:".44rem",
              }}>Ceremony</p>
              <p className="ev-name" style={{
                fontFamily:"var(--df)",
                fontSize:".92rem", fontWeight:600,
                color:"var(--ink)", lineHeight:1.28, marginBottom:".28rem",
              }}>{weddingConfig.venueName}</p>
              <p className="ev-time" style={{
                fontFamily:"var(--bf)",
                fontSize:".70rem", color:"var(--stone)", lineHeight:1.5,
              }}>{date} &middot; 3 pm</p>
            </div>
            <div className="ev-sep" />
            <div className="ev-col">
              <p className="ev-eyebrow" style={{
                fontFamily:"var(--bf)",
                fontSize:".42rem", letterSpacing:".38em",
                textTransform:"uppercase", color:"var(--gilded)", fontWeight:700,
                marginBottom:".44rem",
              }}>Reception</p>
              <p className="ev-name" style={{
                fontFamily:"var(--df)",
                fontSize:".92rem", fontWeight:600,
                color:"var(--ink)", lineHeight:1.28, marginBottom:".28rem",
              }}>{weddingConfig.receptionVenueName}</p>
              <p className="ev-time" style={{
                fontFamily:"var(--bf)",
                fontSize:".70rem", color:"var(--stone)", lineHeight:1.5,
              }}>{date} &middot; 6 pm</p>
            </div>
          </div>

          {/* Thin rule under event strip */}
          <div style={{
            width:"100%", height:1,
            background:"linear-gradient(90deg,transparent,var(--bdr-md),transparent)",
            marginBottom:"clamp(1.4rem,2.8vh,2rem)",
          }} />

          {/* ── Quote ── */}
          <div className="quote-wrap c-r3" style={{ marginBottom:"clamp(1.6rem,3vh,2.2rem)" }}>
            {/* Gold bracket — top-left */}
            <svg style={{ position:"absolute", top:10, left:10 }} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M13 1H1V13" stroke="#9C7520" strokeWidth="1.2" strokeLinecap="round" opacity=".55"/>
            </svg>
            {/* Gold bracket — bottom-right */}
            <svg style={{ position:"absolute", bottom:10, right:10 }} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 13H13V1" stroke="#9C7520" strokeWidth="1.2" strokeLinecap="round" opacity=".55"/>
            </svg>
            <blockquote className="quote-text" style={{
              fontFamily:"var(--df)", fontStyle:"italic",
              fontSize:"clamp(.88rem,1.5vw,.98rem)",
              color:"var(--sepia)", lineHeight:1.95,
              textAlign:"center",
              padding:"0 .5rem",
            }}>
              &ldquo;{weddingConfig.introQuote}&rdquo;
            </blockquote>
          </div>

          {/* ── Private access divider ── */}
          <div className="c-r4" style={{
            display:"flex", alignItems:"center", gap:14,
            marginBottom:"1.1rem", width:"100%",
          }}>
            <div style={{ flex:1, height:1,
              background:"linear-gradient(90deg,transparent,var(--bdr-md))" }} />
            <span className="div-label" style={{
              fontFamily:"var(--bf)",
              fontSize:".42rem", letterSpacing:".42em",
              textTransform:"uppercase", color:"var(--stone)", fontWeight:600,
            }}>Private access</span>
            <div style={{ flex:1, height:1,
              background:"linear-gradient(90deg,var(--bdr-md),transparent)" }} />
          </div>

          {/* ── BUTTONS ── */}
          {/* Two distinct, elegant access cards. No border-radius.        */}
          {/* Primary: maroon filled with gilded left accent stripe.       */}
          {/* Secondary: ivory with maroon border and left accent stripe.  */}
          <div className="btn-row c-r5">

            {/* Couple — primary */}
            <a href="/login?hint=couple&redirect=/admin" className="btn btn-p">
              <div className="btn-inner">
                <div className="btn-text">
                  <span className="btn-eyebrow" style={{ color:"rgba(255,255,255,.52)" }}>
                    The couple
                  </span>
                  <span className="btn-label" style={{ color:"#FFFFFF" }}>
                    {bf} &amp; {gf}
                  </span>
                </div>
                <svg className="btn-arr" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </a>

            {/* Family — secondary */}
            <a href="/login?hint=vault&redirect=/family" className="btn btn-s">
              <div className="btn-inner">
                <div className="btn-text">
                  <span className="btn-eyebrow" style={{ color:"var(--stone)" }}>
                    Family vault
                  </span>
                  <span className="btn-label" style={{ color:"var(--maroon)" }}>
                    Family login
                  </span>
                </div>
                <svg className="btn-arr" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="var(--maroon)" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{flexShrink:0,opacity:.55}}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </a>

          </div>

          {/* ── Guest footnote ── */}
          <p className="fnote c-r6" style={{
            marginTop:"1.5rem",
            fontFamily:"var(--df)", fontStyle:"italic",
            fontSize:".70rem", color:"var(--stone)",
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
