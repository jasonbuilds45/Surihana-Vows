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

  const photos = [
    slides[0]?.imageUrl ?? "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85",
    slides[1]?.imageUrl ?? "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=85",
    slides[2]?.imageUrl ?? "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85",
  ];

  const bf   = weddingConfig.brideName.split(" ")[0]!;
  const gf   = weddingConfig.groomName.split(" ")[0]!;
  const date = formatDate(weddingConfig.weddingDate);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; background: #0A0608; }

        /* ── Keyframes ── */
        @keyframes drift  { 0%{transform:scale(1.00) translate(0,0)} 40%{transform:scale(1.07) translate(-1%,0.5%)} 100%{transform:scale(1.00) translate(0,0)} }
        @keyframes driftB { 0%{transform:scale(1.00) translate(0,0)} 55%{transform:scale(1.06) translate(0.8%,-0.6%)} 100%{transform:scale(1.00) translate(0,0)} }
        @keyframes driftC { 0%{transform:scale(1.00) translate(0,0)} 45%{transform:scale(1.05) translate(-0.4%,0.8%)} 100%{transform:scale(1.00) translate(0,0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes fadeLeft { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes lineGrow { from{width:0;opacity:0} to{width:100%;opacity:1} }
        @keyframes ticker   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulse    { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes shimmer  { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes floatUp  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

        /* ── Photo panels ── */
        .pa { animation: drift  32s ease-in-out infinite; }
        .pb { animation: driftB 38s ease-in-out infinite; }
        .pc { animation: driftC 28s ease-in-out infinite; }

        /* ── Staggered reveals ── */
        .r1  { animation: fadeIn   1.0s 0.0s ease both; }
        .r2  { animation: fadeLeft 0.8s 0.2s cubic-bezier(.22,1,.36,1) both; }
        .r3  { animation: fadeUp   0.9s 0.4s cubic-bezier(.22,1,.36,1) both; }
        .r4  { animation: fadeUp   0.9s 0.55s cubic-bezier(.22,1,.36,1) both; }
        .r5  { animation: fadeUp   0.8s 0.7s cubic-bezier(.22,1,.36,1) both; }
        .r6  { animation: fadeUp   0.8s 0.85s cubic-bezier(.22,1,.36,1) both; }
        .r7  { animation: fadeUp   0.8s 1.0s cubic-bezier(.22,1,.36,1) both; }
        .r8  { animation: fadeUp   0.8s 1.15s cubic-bezier(.22,1,.36,1) both; }
        .r9  { animation: fadeUp   0.8s 1.3s cubic-bezier(.22,1,.36,1) both; }
        .r10 { animation: fadeUp   0.8s 1.45s cubic-bezier(.22,1,.36,1) both; }

        /* ── Divider line ── */
        .divider-line {
          height: 1px;
          width: 0;
          background: linear-gradient(90deg, rgba(212,170,58,0.7) 0%, rgba(245,197,203,0.5) 50%, transparent 100%);
          animation: lineGrow 1s 0.9s ease forwards;
        }

        /* ── Login buttons ── */
        .login-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border-radius: 20px;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s ease;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .login-btn-couple {
          background: linear-gradient(135deg, rgba(192,54,74,0.45) 0%, rgba(140,30,50,0.35) 100%);
          border: 1px solid rgba(245,197,203,0.35);
          box-shadow: 0 8px 32px rgba(192,54,74,0.20), inset 0 1px 0 rgba(245,197,203,0.15);
        }
        .login-btn-couple:hover {
          transform: translateY(-4px) scale(1.015);
          background: linear-gradient(135deg, rgba(192,54,74,0.60) 0%, rgba(140,30,50,0.50) 100%);
          box-shadow: 0 16px 48px rgba(192,54,74,0.35), inset 0 1px 0 rgba(245,197,203,0.25);
        }
        .login-btn-family {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .login-btn-family:hover {
          transform: translateY(-4px) scale(1.015);
          background: rgba(255,255,255,0.13);
          border-color: rgba(255,255,255,0.28);
          box-shadow: 0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12);
        }

        /* ── Shimmer border on buttons ── */
        .login-btn::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 21px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,170,58,0.4) 30%, rgba(245,197,203,0.5) 50%, rgba(212,170,58,0.4) 70%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 3.5s linear infinite;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .login-btn:hover::after { opacity: 1; }

        /* ── Dot pulse ── */
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #C0364A;
          box-shadow: 0 0 0 0 rgba(192,54,74,0.5);
          animation: pulse 2s ease-in-out infinite;
        }

        /* ── Responsive ── */
        @media (max-width: 720px) {
          .triptych { display: none !important; }
          .names-h  { font-size: clamp(4rem, 17vw, 6.5rem) !important; }
          .btn-stack { flex-direction: column !important; }
          .login-btn { width: 100%; }
          .pad { padding: 0 1.75rem 3.5rem !important; }
        }
        @media (max-width: 960px) {
          .tri-grid { grid-template-columns: 1fr 1fr !important; }
          .tri-grid > div:last-child { display: none; }
        }
      `}</style>

      {/* ══ BASE ══ */}
      <div aria-hidden style={{ position:"fixed", inset:0, zIndex:0, background:"#0A0608" }} />

      {/* Warm atmospheric bloom */}
      <div aria-hidden style={{
        position:"fixed", inset:0, zIndex:1,
        background:`
          radial-gradient(ellipse 65% 55% at 22% 65%, rgba(130,30,50,0.40) 0%, transparent 65%),
          radial-gradient(ellipse 45% 45% at 70% 35%, rgba(100,65,10,0.25) 0%, transparent 60%),
          radial-gradient(ellipse 80% 40% at 50% 100%, rgba(70,10,20,0.45) 0%, transparent 55%)
        `,
      }} />

      {/* ══ TRIPTYCH — right 40%, three vertical photo columns ══ */}
      <div className="triptych" style={{
        position:"fixed", top:0, right:0, bottom:0, width:"40%", zIndex:2, overflow:"hidden",
      }}>
        {/* Left edge feather */}
        <div aria-hidden style={{
          position:"absolute", inset:0, zIndex:10,
          background:"linear-gradient(90deg, #0A0608 0%, rgba(10,6,8,0.85) 12%, rgba(10,6,8,0.40) 30%, transparent 55%), linear-gradient(to bottom, rgba(10,6,8,0.55) 0%, transparent 18%, transparent 78%, rgba(10,6,8,0.70) 100%)",
        }} />

        <div className="tri-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", height:"100%", gap:0 }}>
          {photos.map((url, i) => (
            <div key={i} style={{ overflow:"hidden", position:"relative" }}>
              <div className={["pa","pb","pc"][i]} style={{
                position:"absolute", inset:"-18%",
                backgroundImage:`url(${url})`,
                backgroundSize:"cover",
                backgroundPosition:"center",
                /* Brighter — old was 0.55, now 0.78 with stronger saturation */
                filter:"saturate(0.80) brightness(0.78) contrast(1.05)",
              }} />
              {i < 2 && (
                <div aria-hidden style={{
                  position:"absolute", right:0, top:"8%", bottom:"8%", width:1, zIndex:2,
                  background:"linear-gradient(to bottom, transparent 0%, rgba(212,170,58,0.25) 50%, transparent 100%)",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Very light grain over photos only */}
        <div aria-hidden style={{
          position:"absolute", inset:0, zIndex:11, pointerEvents:"none",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity:0.5,
        }} />
      </div>

      {/* ══ TOP TICKER STRIPE ══ */}
      <div className="r1" style={{ position:"fixed", top:0, left:0, right:0, zIndex:30 }}>
        {/* Gold-rose rule */}
        <div style={{ height:2, background:"linear-gradient(90deg, transparent 0%, #C0364A 20%, #D4AA3A 50%, #C0364A 80%, transparent 100%)" }} />
        {/* Ticker bar */}
        <div style={{
          overflow:"hidden", padding:"7px 0",
          background:"rgba(10,6,8,0.70)", backdropFilter:"blur(14px)",
          borderBottom:"1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display:"flex", gap:"4rem", whiteSpace:"nowrap", width:"max-content", animation:"ticker 60s linear infinite" }}>
            {Array(14).fill(null).map((_, i) => (
              <span key={i} style={{
                fontSize:"0.52rem", letterSpacing:"0.38em", textTransform:"uppercase",
                /* Much brighter ticker — was 0.22, now 0.55 */
                color:"rgba(245,197,203,0.55)",
                fontFamily:"var(--font-body), system-ui, sans-serif",
              }}>
                {weddingConfig.celebrationTitle}&nbsp;&nbsp;✦&nbsp;&nbsp;{date}&nbsp;&nbsp;✦&nbsp;&nbsp;{weddingConfig.venueName}&nbsp;&nbsp;✦&nbsp;&nbsp;{weddingConfig.venueCity}&nbsp;&nbsp;✦&nbsp;&nbsp;{bf} &amp; {gf}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="pad" style={{
        position:"relative", zIndex:20,
        minHeight:"100dvh",
        display:"flex", flexDirection:"column", justifyContent:"flex-end",
        padding:"0 clamp(2.5rem, 7vw, 8rem) clamp(3.5rem, 6vh, 6.5rem)",
        width:"min(100%, 700px)",
      }}>

        {/* Celebration label */}
        <div className="r2" style={{ display:"flex", alignItems:"center", gap:14, marginBottom:"2rem" }}>
          <div style={{ width:32, height:1, background:"rgba(212,170,58,0.70)" }} />
          <span style={{
            fontSize:"0.58rem", letterSpacing:"0.44em", textTransform:"uppercase",
            /* Was 0.60, now fully opaque gold */
            color:"rgba(212,170,58,0.90)",
            fontFamily:"var(--font-body), system-ui, sans-serif", fontWeight:700,
          }}>
            {weddingConfig.celebrationTitle}
          </span>
          <div style={{ width:32, height:1, background:"rgba(212,170,58,0.30)" }} />
        </div>

        {/* ── BRIDE name ── */}
        <h1 className="names-h r3" style={{
          fontFamily:"var(--font-display), Georgia, serif",
          fontSize:"clamp(4.5rem, 10.5vw, 9rem)",
          fontWeight:700,
          lineHeight:0.87,
          letterSpacing:"-0.03em",
          /* Pure white with a warm luminous glow */
          color:"#FFFFFF",
          textShadow:"0 2px 0 rgba(0,0,0,0.5), 0 0 80px rgba(245,197,203,0.22)",
          marginBottom:"0.04em",
        }}>
          {bf}
        </h1>

        {/* ── & GROOM name ── */}
        <div className="r4" style={{ display:"flex", alignItems:"baseline", gap:"0.15em", marginBottom:"0.55em" }}>
          <span style={{
            fontFamily:"var(--font-display), Georgia, serif",
            fontSize:"clamp(1.8rem, 3.8vw, 3.5rem)",
            fontWeight:300, fontStyle:"italic",
            /* Was 0.60, now a clear warm rose */
            color:"rgba(245,197,203,0.75)",
            letterSpacing:"0.06em",
            lineHeight:1,
          }}>&amp;</span>
          <h1 className="names-h" style={{
            fontFamily:"var(--font-display), Georgia, serif",
            fontSize:"clamp(4.5rem, 10.5vw, 9rem)",
            fontWeight:700,
            lineHeight:0.87,
            letterSpacing:"-0.03em",
            /* Warm rose, fully readable — was #F5C5CB at 100%, keep but add strong glow */
            color:"#F5A0AA",
            textShadow:"0 2px 0 rgba(0,0,0,0.4), 0 0 80px rgba(192,54,74,0.40)",
          }}>
            {gf}
          </h1>
        </div>

        {/* Date · Venue · City — clearly readable */}
        <div className="r5" style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:"0.75rem", marginBottom:"1.75rem" }}>
          {[
            { text: date,                       opacity: 0.90 },
            { dot: true },
            { text: weddingConfig.venueName,    opacity: 0.72 },
            { dot: true },
            { text: weddingConfig.venueCity,    opacity: 0.55 },
          ].map((item, i) =>
            "dot" in item ? (
              <span key={i} style={{ width:3, height:3, borderRadius:"50%", background:"rgba(212,170,58,0.55)", display:"inline-block", flexShrink:0 }} />
            ) : (
              <span key={i} style={{
                fontSize:"0.875rem",
                /* Was 0.55/0.40/0.30 — bumped significantly */
                color:`rgba(255,255,255,${item.opacity})`,
                fontFamily:"var(--font-body), system-ui, sans-serif",
                letterSpacing:"0.05em",
              }}>
                {item.text}
              </span>
            )
          )}
        </div>

        {/* Gold divider rule */}
        <div className="r6" style={{ marginBottom:"1.5rem" }}>
          <div className="divider-line" style={{ maxWidth:400 }} />
        </div>

        {/* Quote — much brighter, larger */}
        <p className="r7" style={{
          fontFamily:"var(--font-display), Georgia, serif",
          fontStyle:"italic",
          fontSize:"clamp(0.95rem, 1.55vw, 1.15rem)",
          /* Was 0.32 — now 0.62, clearly readable */
          color:"rgba(255,245,240,0.62)",
          maxWidth:"36rem",
          lineHeight:1.85,
          marginBottom:"2.25rem",
          /* Subtle left border accent */
          paddingLeft:"1rem",
          borderLeft:"2px solid rgba(212,170,58,0.35)",
        }}>
          &ldquo;{weddingConfig.introQuote}&rdquo;
        </p>

        {/* Private access label */}
        <div className="r8" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1.125rem" }}>
          <div className="live-dot" />
          <span style={{
            fontSize:"0.56rem", letterSpacing:"0.40em", textTransform:"uppercase",
            /* Was 0.22 — now 0.55, clearly visible */
            color:"rgba(255,255,255,0.55)",
            fontFamily:"var(--font-body), system-ui, sans-serif", fontWeight:600,
          }}>
            Private access
          </span>
          <div style={{ flex:1, maxWidth:100, height:1, background:"linear-gradient(90deg, rgba(255,255,255,0.12), transparent)" }} />
        </div>

        {/* ══ BUTTONS ══ */}
        <div className="btn-stack r9" style={{ display:"flex", gap:"0.875rem", flexWrap:"wrap" }}>

          {/* Couple login */}
          <a href="/login?hint=couple&redirect=/admin" className="login-btn login-btn-couple">
            <div style={{
              width:46, height:46, borderRadius:13, flexShrink:0,
              background:"rgba(192,54,74,0.35)",
              border:"1px solid rgba(245,197,203,0.30)",
              display:"grid", placeItems:"center", fontSize:"1.3rem",
              boxShadow:"inset 0 1px 0 rgba(255,255,255,0.10)",
            }}>💍</div>
            <div style={{ minWidth:0 }}>
              <p style={{
                fontSize:"0.54rem", letterSpacing:"0.30em", textTransform:"uppercase",
                /* Was 0.55 — now brighter */
                color:"rgba(245,197,203,0.80)",
                fontFamily:"var(--font-body), system-ui, sans-serif", fontWeight:700, marginBottom:"0.3rem",
              }}>The couple</p>
              <p style={{
                fontSize:"0.975rem", fontWeight:700,
                /* Pure white */
                color:"#FFFFFF",
                fontFamily:"var(--font-body), system-ui, sans-serif", lineHeight:1.2, whiteSpace:"nowrap",
              }}>{bf} &amp; {gf}</p>
            </div>
            <svg style={{ marginLeft:"auto", flexShrink:0, color:"rgba(245,197,203,0.70)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>

          {/* Family login */}
          <a href="/login?hint=vault&redirect=/family" className="login-btn login-btn-family">
            <div style={{
              width:46, height:46, borderRadius:13, flexShrink:0,
              background:"rgba(255,255,255,0.09)",
              border:"1px solid rgba(255,255,255,0.18)",
              display:"grid", placeItems:"center", fontSize:"1.3rem",
              boxShadow:"inset 0 1px 0 rgba(255,255,255,0.08)",
            }}>🫂</div>
            <div style={{ minWidth:0 }}>
              <p style={{
                fontSize:"0.54rem", letterSpacing:"0.30em", textTransform:"uppercase",
                /* Was 0.30 — now 0.65 */
                color:"rgba(255,255,255,0.65)",
                fontFamily:"var(--font-body), system-ui, sans-serif", fontWeight:700, marginBottom:"0.3rem",
              }}>Family vault</p>
              <p style={{
                fontSize:"0.975rem", fontWeight:700,
                /* Was 0.78 — now full white */
                color:"rgba(255,255,255,0.95)",
                fontFamily:"var(--font-body), system-ui, sans-serif", lineHeight:1.2, whiteSpace:"nowrap",
              }}>Family of the couple</p>
            </div>
            <svg style={{ marginLeft:"auto", flexShrink:0, color:"rgba(255,255,255,0.50)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>

        </div>

        {/* Guest footnote */}
        <p className="r10" style={{
          marginTop:"1.25rem",
          fontSize:"0.68rem",
          /* Was 0.16 — now 0.38, actually readable */
          color:"rgba(255,255,255,0.38)",
          fontFamily:"var(--font-body), system-ui, sans-serif",
          fontStyle:"italic", letterSpacing:"0.02em",
        }}>
          Guests — open the personal invitation link sent to you by {bf} &amp; {gf}.
        </p>

      </div>

      {/* ══ BOTTOM STRIPE ══ */}
      <div aria-hidden style={{
        position:"fixed", bottom:0, left:0, right:0, height:2, zIndex:30,
        background:"linear-gradient(90deg, transparent 0%, #C0364A 20%, #D4AA3A 50%, #C0364A 80%, transparent 100%)",
      }} />
    </>
  );
}
