import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getDefaultPathForRole, getSessionFromCookieStore } from "@/lib/auth";
import { weddingConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Sign in — ${weddingConfig.celebrationTitle}`,
  robots: { index: false },
};

interface LoginPageProps {
  searchParams?: {
    error?:    string | string[];
    redirect?: string | string[];
    hint?:     string | string[];
  };
}

function param(v?: string | string[]) {
  return typeof v === "string" ? v : (v?.[0] ?? "");
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSessionFromCookieStore(cookies());
  if (session) redirect(getDefaultPathForRole(session.role));

  const errorCode  = param(searchParams?.error);
  const hint       = param(searchParams?.hint);
  const redirectTo = param(searchParams?.redirect) || (hint === "couple" ? "/admin" : "/family");

  const errors: Record<string, string> = {
    invalid:       "Incorrect email or password. Please try again.",
    "server-error":"Something went wrong. Please try again.",
    "invite-only": "Family accounts can only be created from a private invite link.",
  };
  const errorMsg    = errorCode ? (errors[errorCode] ?? "Something went wrong.") : null;
  const isCoupleLogin = hint === "couple";

  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;
  const bi = weddingConfig.brideName[0] ?? "M";
  const gi = weddingConfig.groomName[0] ?? "L";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { min-height: 100%; }

        /* ── Platform palette ── */
        :root {
          --bg:     #FDFAF7;
          --bg-w:   #F8F3EE;
          --rose:   #BE2D45;
          --rose-h: #A42539;
          --rose-l: #D44860;
          --gold:   #A87808;
          --gold-l: #C9960A;
          --ink:    #120B0E;
          --ink-2:  #362030;
          --ink-3:  #72504A;
          --ink-4:  #A88888;
          --bdr:    rgba(190,45,69,0.12);
          --bdr-md: rgba(190,45,69,0.22);
          --df: var(--font-display),'Cormorant Garamond',Georgia,serif;
          --bf: var(--font-body),'Manrope',system-ui,sans-serif;
          --expo: cubic-bezier(.16,1,.30,1);
        }

        /* ── Keyframes ── */
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes floatSeal {
          0%,100% { transform:translateY(0) rotate(0deg); }
          50%      { transform:translateY(-5px) rotate(1.5deg); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position:-200% center; }
        }

        /* ── Reveal ── */
        .r-l { animation: fadeUp .7s .00s var(--expo) both; }
        .r-r { animation: fadeUp .7s .10s var(--expo) both; }

        /* ── Seal — clickable, floats gently ── */
        .seal-link {
          display: inline-block;
          text-decoration: none;
          cursor: pointer;
          animation: floatSeal 6s ease-in-out infinite;
          border-radius: 50%;
          transition: transform .2s var(--expo), box-shadow .2s ease;
        }
        .seal-link:hover {
          transform: translateY(-4px) scale(1.06) rotate(2deg) !important;
          animation-play-state: paused;
        }
        .seal-link:hover .seal-disc {
          box-shadow:
            0 12px 36px rgba(0,0,0,.50),
            0 4px 10px rgba(0,0,0,.28),
            0 0 0 3px rgba(201,150,10,.35);
        }

        .seal-disc {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: radial-gradient(circle at 38% 34%,
            #F5D47A 0%, #C9960A 38%, #9E7205 68%, #5C3D01 100%);
          display: grid; place-items: center;
          box-shadow:
            0 8px 28px rgba(0,0,0,.40),
            0 2px 6px rgba(0,0,0,.22),
            inset 0 1px 0 rgba(255,220,100,.22);
          border: 1px solid rgba(255,220,100,.20);
          transition: box-shadow .2s ease;
          position: relative; overflow: hidden;
        }
        /* Wax ridges on seal */
        .seal-disc::before {
          content: '';
          position: absolute; inset: 0; border-radius: 50%;
          background: repeating-conic-gradient(
            rgba(0,0,0,.06) 0deg 10deg,
            transparent 10deg 20deg
          );
        }
        .seal-initials {
          font-family: var(--df);
          font-size: 1.1rem; font-weight: 600;
          color: rgba(28,14,0,.82);
          letter-spacing: .10em;
          position: relative; z-index: 1;
        }

        /* ── Form inputs ── */
        .lp-inp {
          display: block; width: 100%;
          background: #FFFFFF;
          border: 1.5px solid rgba(190,45,69,.18);
          border-radius: 10px;
          padding: 13px 16px;
          color: var(--ink);
          font-size: .9375rem;
          font-family: var(--bf);
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
          -webkit-appearance: none;
        }
        .lp-inp::placeholder { color: var(--ink-4); }
        .lp-inp:focus {
          border-color: var(--rose);
          box-shadow: 0 0 0 3px rgba(190,45,69,.10);
        }

        /* ── Submit button — matches platform btn-primary ── */
        .lp-btn {
          width: 100%;
          padding: 14px;
          border: none; border-radius: 999px;
          cursor: pointer;
          background: linear-gradient(135deg, var(--rose-l), var(--rose), var(--rose-h));
          color: #fff;
          font-family: var(--bf);
          font-size: .875rem; font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          box-shadow: 0 6px 24px rgba(190,45,69,.28);
          position: relative; overflow: hidden;
          transition: transform .18s var(--expo), box-shadow .18s ease, filter .18s ease;
        }
        .lp-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(105deg,
            transparent 35%, rgba(255,255,255,.18) 50%, transparent 65%);
          background-size: 200% 100%; background-position: 200% 0;
          transition: background-position .55s ease;
          pointer-events: none;
        }
        .lp-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(190,45,69,.38);
          filter: brightness(1.04);
        }
        .lp-btn:hover::after { background-position: -200% 0; }

        /* ── Back link ── */
        .lp-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--bf);
          font-size: .52rem; letter-spacing: .26em;
          text-transform: uppercase;
          color: rgba(255,255,255,.28);
          text-decoration: none;
          transition: color .18s ease;
        }
        .lp-back:hover { color: rgba(255,255,255,.70); }

        /* ── Top/bottom rules ── */
        .t-rule, .b-rule {
          position: fixed; left: 0; right: 0; height: 2px; z-index: 60;
          background: linear-gradient(90deg,
            transparent 0%, var(--rose-l) 20%,
            var(--gold-l) 50%, var(--rose-l) 80%, transparent 100%);
        }
        .t-rule { top: 0; }
        .b-rule { bottom: 0; }

        /* ──────────────────────────────────────────
           MOBILE — single column, dark top + light bottom
        ────────────────────────────────────────── */
        @media (max-width: 700px) {
          .lp-wrap { flex-direction: column !important; }

          .lp-left {
            width: 100% !important;
            min-height: auto !important;
            padding: 3rem 1.5rem 2rem !important;
            /* On mobile left panel is the top bar — compact */
          }
          .lp-left-inner { flex-direction: row !important; align-items: center !important; gap: 1.25rem !important; }
          .lp-copy { display: none !important; }
          .lp-chips { display: none !important; }
          .lp-back-wrap { display: none !important; }
          .lp-tagline { font-size: .85rem !important; margin-bottom: 0 !important; max-width: none !important; }
          .lp-names { font-size: 1.5rem !important; margin-bottom: .25rem !important; }
          .lp-eyebrow { font-size: .38rem !important; margin-bottom: .35rem !important; }
          .seal-disc { width: 48px !important; height: 48px !important; }
          .seal-initials { font-size: .88rem !important; }

          .lp-right {
            padding: 2rem 1.5rem 3rem !important;
          }

          /* Show compact back link below form on mobile */
          .lp-back-mobile { display: flex !important; }
        }

        /* ── Hide mobile-only back link on desktop ── */
        .lp-back-mobile { display: none; }

        @media (min-width: 701px) {
          .lp-back-mobile { display: none !important; }
        }
      `}</style>

      {/* ── Top rule ── */}
      <div className="t-rule" aria-hidden />

      {/* ══════════════════════════════════════════
          MAIN WRAP — flex row desktop, col mobile
      ══════════════════════════════════════════ */}
      <div className="lp-wrap" style={{
        minHeight: "100dvh",
        display: "flex",
        background: "#120B0E",
      }}>

        {/* ════════════════════════════════
            LEFT PANEL — dark, branded
        ════════════════════════════════ */}
        <div className="lp-left r-l" style={{
          width: "42%",
          minWidth: 300,
          background: "linear-gradient(160deg, #1A0C0E 0%, #2A1218 55%, #1C0E12 100%)",
          borderRight: "1px solid rgba(255,255,255,.05)",
          padding: "clamp(2.5rem,6vh,5rem) clamp(2rem,4vw,3.5rem)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* Ambient rose bloom — top right */}
          <div aria-hidden style={{
            position:"absolute", top:"-20%", right:"-10%",
            width:"70%", height:"60%", borderRadius:"50%",
            background:"radial-gradient(circle, rgba(190,45,69,.09) 0%, transparent 65%)",
            pointerEvents:"none",
          }} />
          {/* Ambient gold bloom — bottom left */}
          <div aria-hidden style={{
            position:"absolute", bottom:"-15%", left:"-8%",
            width:"55%", height:"50%", borderRadius:"50%",
            background:"radial-gradient(circle, rgba(168,120,8,.06) 0%, transparent 65%)",
            pointerEvents:"none",
          }} />

          {/* ── Left panel content ── */}
          <div className="lp-left-inner" style={{
            position:"relative", zIndex:1,
            display:"flex", flexDirection:"column",
          }}>

            {/* SEAL — links home, floats, wax look */}
            <a href="/" className="seal-link" aria-label="Back to homepage" style={{
              marginBottom: "2.5rem",
              alignSelf: "flex-start",
            }}>
              <div className="seal-disc">
                <span className="seal-initials">{bi}{gi}</span>
              </div>
            </a>

            {/* Eyebrow */}
            <p className="lp-eyebrow" style={{
              fontFamily:"var(--bf)",
              fontSize:".48rem", letterSpacing:".44em",
              textTransform:"uppercase",
              color:"rgba(190,45,69,.65)",
              fontWeight:700, marginBottom:".75rem",
            }}>
              {weddingConfig.celebrationTitle}
            </p>

            {/* Couple names */}
            <h1 className="lp-names" style={{
              fontFamily:"var(--df)",
              fontWeight:300,
              fontSize:"clamp(2rem,4.5vw,3.25rem)",
              lineHeight:.88, letterSpacing:"-.02em",
              color:"#FFFFFF",
              marginBottom:"2rem",
            }}>
              <span style={{ textShadow:"0 0 40px rgba(190,45,69,.30)" }}>{bf}</span>
              <span style={{
                color:"rgba(201,150,10,.80)",
                fontStyle:"italic",
                margin:"0 .35em", fontSize:".7em",
              }}>&amp;</span>
              <span style={{ color:"#D4B896", textShadow:"0 0 40px rgba(201,150,10,.28)" }}>{gf}</span>
            </h1>

            {/* Rule */}
            <div style={{
              width:"min(72px,40%)", height:1,
              marginBottom:"1.75rem",
              background:"linear-gradient(to right, rgba(190,45,69,.55), rgba(168,120,8,.45), transparent)",
            }} />

            {/* Description */}
            <p className="lp-copy" style={{
              fontFamily:"var(--df)",
              fontStyle:"italic", fontWeight:300,
              fontSize:"clamp(.9rem,1.6vw,1.1rem)",
              color:"rgba(255,255,255,.40)",
              lineHeight:1.85, maxWidth:320,
            }}>
              {isCoupleLogin
                ? "Sign in to reach the private control room that manages your wedding platform."
                : "Sign in to reach the private family vault, albums, memories, and post-wedding archive."}
            </p>

            {/* Chips — date + city */}
            <div className="lp-chips" style={{
              display:"flex", flexWrap:"wrap", gap:".5rem", marginTop:"2rem",
            }}>
              {[weddingConfig.weddingDate, weddingConfig.venueCity]
                .filter(Boolean).map(chip => (
                <span key={chip} style={{
                  display:"inline-flex", alignItems:"center",
                  padding:"4px 12px", borderRadius:999,
                  background:"rgba(255,255,255,.05)",
                  border:"1px solid rgba(255,255,255,.08)",
                  fontFamily:"var(--bf)",
                  fontSize:".50rem", letterSpacing:".14em",
                  textTransform:"uppercase", color:"rgba(255,255,255,.30)",
                }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Back link — desktop only */}
          <div className="lp-back-wrap" style={{ position:"relative", zIndex:1 }}>
            <a href="/" className="lp-back">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back to wedding
            </a>
          </div>
        </div>

        {/* ════════════════════════════════
            RIGHT PANEL — light, form
        ════════════════════════════════ */}
        <div className="lp-right r-r" style={{
          flex:1,
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"clamp(2rem,5vh,5rem) clamp(1.5rem,5vw,5rem)",
          background:"var(--bg)",
          /* Same warm noise texture as the rest of the platform */
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
        }}>
          <div style={{ width:"100%", maxWidth:400 }}>

            {/* Form eyebrow */}
            <p style={{
              fontFamily:"var(--bf)",
              fontSize:".56rem", letterSpacing:".26em",
              textTransform:"uppercase", color:"var(--ink-4)",
              fontWeight:700, marginBottom:".75rem",
            }}>
              {isCoupleLogin ? "Couple sign in" : "Private sign in"}
            </p>

            {/* Welcome heading */}
            <p style={{
              fontFamily:"var(--df)",
              fontStyle:"italic", fontWeight:300,
              fontSize:"clamp(1.5rem,3vw,2.1rem)",
              color:"var(--ink)", marginBottom:".75rem",
              lineHeight:1.1,
            }}>
              Welcome back.
            </p>

            {/* Subtitle */}
            <p style={{
              fontFamily:"var(--bf)",
              fontSize:".88rem", color:"var(--ink-3)",
              lineHeight:1.7, marginBottom:"1.5rem",
            }}>
              Use the credentials created for you. Public self-signup is disabled.
            </p>

            {/* Error */}
            {errorMsg && (
              <div style={{
                padding:"11px 16px", borderRadius:10,
                marginBottom:"1.25rem",
                background:"rgba(190,45,69,.07)",
                border:"1px solid rgba(190,45,69,.22)",
              }}>
                <p style={{ fontFamily:"var(--bf)", fontSize:".875rem", color:"var(--rose)" }}>
                  {errorMsg}
                </p>
              </div>
            )}

            {/* Form */}
            <form method="POST" action="/api/auth/login">
              <input type="hidden" name="hint"     value={hint} />
              <input type="hidden" name="redirect" value={redirectTo} />

              <div style={{ display:"flex", flexDirection:"column", gap:"1rem", marginBottom:"1.5rem" }}>

                <div>
                  <label style={{
                    display:"block",
                    fontFamily:"var(--bf)",
                    fontSize:".54rem", fontWeight:700,
                    letterSpacing:".18em", textTransform:"uppercase",
                    color:"var(--ink-3)", marginBottom:7,
                  }}>
                    Email address
                  </label>
                  <input name="email" type="email" required
                    autoComplete="email" placeholder="your@email.com"
                    className="lp-inp" />
                </div>

                <div>
                  <label style={{
                    display:"block",
                    fontFamily:"var(--bf)",
                    fontSize:".54rem", fontWeight:700,
                    letterSpacing:".18em", textTransform:"uppercase",
                    color:"var(--ink-3)", marginBottom:7,
                  }}>
                    Password
                  </label>
                  <input name="password" type="password" required
                    autoComplete="current-password" placeholder="Your password"
                    className="lp-inp" />
                </div>
              </div>

              <button type="submit" className="lp-btn">
                Sign in
              </button>
            </form>

            {/* Info note */}
            <div style={{
              marginTop:"1.35rem",
              padding:"12px 16px", borderRadius:10,
              background:"rgba(168,120,8,.07)",
              border:"1px solid rgba(168,120,8,.18)",
            }}>
              <p style={{
                fontFamily:"var(--bf)",
                fontSize:".84rem", color:"#6B4A18", lineHeight:1.7,
              }}>
                Need family access? The couple must send you a private setup link first.
                Once you finish setup from that invite, you can sign in here any time.
              </p>
            </div>

            {/* Back link — mobile only, shown below form */}
            <div className="lp-back-mobile" style={{
              marginTop:"1.5rem",
              justifyContent:"center",
            }}>
              <a href="/" style={{
                display:"inline-flex", alignItems:"center", gap:6,
                fontFamily:"var(--bf)",
                fontSize:".54rem", letterSpacing:".24em",
                textTransform:"uppercase", color:"var(--ink-4)",
                textDecoration:"none",
                transition:"color .18s",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back to wedding
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom rule ── */}
      <div className="b-rule" aria-hidden />
    </>
  );
}
