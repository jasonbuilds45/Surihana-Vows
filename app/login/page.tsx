import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getDefaultPathForRole,
  getSessionFromCookieStore,
} from "@/lib/auth";
import type { Metadata } from "next";
import { weddingConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Sign in — ${weddingConfig.celebrationTitle}`,
  robots: { index: false },
};

interface LoginPageProps {
  searchParams?: {
    error?: string | string[];
    magic?: string | string[];
    hint?:  string | string[];
  };
}

function readParam(v?: string | string[]) {
  return typeof v === "string" ? v : v?.[0];
}

const DF     = "var(--font-display), Georgia, serif";
const BF     = "var(--font-body), system-ui, sans-serif";
const STRIPE = "linear-gradient(90deg,#D94F62 0%,#C0364A 30%,#B8820A 55%,#C0364A 80%,#D94F62 100%)";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Already logged in → skip straight to their home
  const existing = await getSessionFromCookieStore(cookies());
  if (existing) redirect(getDefaultPathForRole(existing.role));

  const hint       = readParam(searchParams?.hint) ?? "";
  const errorVal   = readParam(searchParams?.error);
  const magicStatus = readParam(searchParams?.magic);
  const isCouple   = hint === "couple";
  const accentColor = isCouple ? "#C0364A" : "#8A5A44";

  const errorMsg =
    errorVal === "access-code" ? "That access code is invalid or has expired." :
    errorVal === "magic-link"  ? "That magic link is invalid or has expired." :
    errorVal                   ? "Invalid email or password. Please try again." :
    null;

  const inp: React.CSSProperties = {
    display: "block", width: "100%",
    background: "#F9F5F2",
    border: "1.5px solid #E4D8D0",
    borderRadius: 12,
    padding: "13px 16px",
    color: "#1A1012",
    fontSize: "0.9375rem",
    outline: "none",
    fontFamily: BF,
  };

  return (
    <>
      <style>{`
        html,body { margin:0; padding:0; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .lf { animation: fadeIn .55s ease both; }
        .lf2 { animation: fadeIn .55s .12s ease both; }
        .btn-submit { transition: all .18s ease; cursor:pointer; border:none; }
        .btn-submit:hover { opacity:.90; transform:translateY(-1px); }
        .btn-sm { transition: all .18s ease; cursor:pointer; border:none; }
        .btn-sm:hover { opacity:.88; }
        .back { transition: color .18s; text-decoration:none; }
        .back:hover { color:rgba(255,255,255,.80) !important; }
        @media(max-width:700px){
          .login-wrap { flex-direction:column !important; }
          .login-left { width:100% !important; min-height:auto !important; padding:2rem !important; }
          .login-right { padding:2rem !important; }
        }
      `}</style>

      {/* Gold stripe top */}
      <div style={{ position:"fixed", top:0, left:0, right:0, height:3, background:STRIPE, zIndex:20 }} />

      <div className="login-wrap" style={{ minHeight:"100dvh", display:"flex", background:"#0E0809" }}>

        {/* ── Left dark panel ── */}
        <div
          className="login-left lf"
          style={{
            width:"38%", minWidth:280,
            background:"linear-gradient(160deg,#1A0C10 0%,#2A1218 60%,#1A0C10 100%)",
            borderRight:"1px solid rgba(255,255,255,.07)",
            padding:"clamp(2.5rem,6vh,5rem) clamp(2rem,4vw,3.5rem)",
            display:"flex", flexDirection:"column", justifyContent:"space-between",
          }}
        >
          <div>
            {/* Monogram */}
            <div style={{ width:46, height:46, borderRadius:"50%", border:`1.5px solid ${accentColor}`, display:"grid", placeItems:"center", marginBottom:"2rem", background:"rgba(255,255,255,.06)" }}>
              <span style={{ fontFamily:DF, fontSize:"1rem", fontWeight:700, color: isCouple ? "#F5C5CB" : "#D4B39B" }}>
                {weddingConfig.brideName[0]}{weddingConfig.groomName[0]}
              </span>
            </div>

            <p style={{ fontSize:".56rem", letterSpacing:".30em", textTransform:"uppercase", color:"rgba(255,255,255,.28)", fontFamily:BF, marginBottom:".625rem" }}>
              {weddingConfig.celebrationTitle}
            </p>
            <h1 style={{ fontFamily:DF, fontSize:"clamp(1.6rem,3.5vw,2.6rem)", fontWeight:700, color:"#fff", lineHeight:1.1, marginBottom:"1.25rem" }}>
              {isCouple ? <>Welcome back,<br/>lovely couple 💍</> : <>Welcome,<br/>dear family 🫂</>}
            </h1>
            <p style={{ fontSize:".875rem", color:"rgba(255,255,255,.40)", fontFamily:BF, lineHeight:1.78, maxWidth:270 }}>
              {isCouple
                ? "Sign in to manage your guest list, send invitations, and track RSVPs."
                : "Sign in to access private photos, family memories, and time capsules."}
            </p>

            {magicStatus === "sent" && (
              <div style={{ marginTop:"2rem", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.10)", borderRadius:14, padding:"1rem 1.25rem" }}>
                <p style={{ fontSize:".875rem", fontWeight:600, color:"#fff", marginBottom:3 }}>Magic link sent ✓</p>
                <p style={{ fontSize:".82rem", color:"rgba(255,255,255,.42)", fontFamily:BF }}>Check your inbox and click the link to sign in instantly.</p>
              </div>
            )}
          </div>

          <a href="/" className="back" style={{ fontSize:".68rem", letterSpacing:".22em", textTransform:"uppercase", color:"rgba(255,255,255,.22)", fontFamily:BF }}>
            ← Back to wedding
          </a>
        </div>

        {/* ── Right form panel ── */}
        <div
          className="login-right lf2"
          style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center",
            padding:"clamp(2rem,5vh,5rem) clamp(2rem,5vw,5rem)",
            background:"#fff",
          }}
        >
          <div style={{ width:"100%", maxWidth:420 }}>

            <p style={{ fontSize:".56rem", letterSpacing:".26em", textTransform:"uppercase", color:accentColor, fontFamily:BF, fontWeight:700, marginBottom:".5rem" }}>
              Sign in
            </p>
            <h2 style={{ fontFamily:DF, fontSize:"clamp(1.4rem,2.8vw,1.875rem)", fontWeight:700, color:"#1A1012", marginBottom:"1.75rem", lineHeight:1.2 }}>
              Continue with password
            </h2>

            {/* ── Password form — posts to API route so cookie+redirect are atomic ── */}
            <form method="POST" action="/api/auth/login" style={{ marginBottom:"1.75rem" }}>
              <input type="hidden" name="hint" value={hint} />

              <div style={{ display:"flex", flexDirection:"column", gap:"1rem", marginBottom:"1.125rem" }}>
                <div>
                  <label style={{ display:"block", fontSize:".58rem", fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", color:"#7A5460", marginBottom:6, fontFamily:BF }}>
                    Email address
                  </label>
                  <input name="email" type="email" required autoComplete="email" placeholder="your@email.com" style={inp} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:".58rem", fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", color:"#7A5460", marginBottom:6, fontFamily:BF }}>
                    Password
                  </label>
                  <input name="password" type="password" required autoComplete="current-password" placeholder="Your password" style={inp} />
                </div>
              </div>

              {errorMsg && (
                <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"10px 14px", marginBottom:"1rem" }}>
                  <p style={{ fontSize:".875rem", color:"#B91C1C", fontFamily:BF, margin:0 }}>{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                className="btn-submit"
                style={{
                  width:"100%", padding:"14px", borderRadius:999,
                  background: isCouple
                    ? "linear-gradient(135deg,#C0364A,#A82C3E)"
                    : "linear-gradient(135deg,#8A5A44,#6D4535)",
                  color:"#fff",
                  fontSize:".875rem", fontWeight:700, fontFamily:BF,
                  letterSpacing:".12em", textTransform:"uppercase",
                  boxShadow: isCouple
                    ? "0 6px 22px rgba(192,54,74,.30)"
                    : "0 6px 22px rgba(138,90,68,.28)",
                }}
              >
                Sign in →
              </button>
            </form>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.25rem" }}>
              <div style={{ flex:1, height:1, background:"#EDE8E4" }} />
              <span style={{ fontSize:".62rem", letterSpacing:".18em", textTransform:"uppercase", color:"#B0A0A0", fontFamily:BF }}>or</span>
              <div style={{ flex:1, height:1, background:"#EDE8E4" }} />
            </div>

            {/* Magic link */}
            <div style={{ background:"#FAF7F5", border:"1px solid #EDE0D8", borderRadius:16, padding:"1.125rem", marginBottom:".875rem" }}>
              <form method="POST" action="/api/auth/magic-link-form">
                <input type="hidden" name="hint" value={hint} />
                <p style={{ fontSize:".72rem", fontWeight:700, color:"#7A5460", fontFamily:BF, marginBottom:3 }}>Magic link</p>
                <p style={{ fontSize:".8rem", color:"#A08080", fontFamily:BF, marginBottom:".75rem", lineHeight:1.6 }}>
                  We&apos;ll email you a one-click sign-in link — no password needed.
                </p>
                <div style={{ display:"flex", gap:8 }}>
                  <input name="email" type="email" required placeholder="your@email.com"
                    style={{ ...inp, flex:1, padding:"9px 12px", fontSize:".875rem" }} />
                  <button type="submit" className="btn-sm"
                    style={{ padding:"9px 16px", borderRadius:10, background:accentColor, color:"#fff", fontSize:".78rem", fontWeight:700, fontFamily:BF, whiteSpace:"nowrap" }}>
                    Send
                  </button>
                </div>
              </form>
            </div>

            {/* Access code */}
            <div style={{ background:"#FAF7F5", border:"1px solid #EDE0D8", borderRadius:16, padding:"1.125rem" }}>
              <form method="POST" action="/api/auth/access-code-form">
                <input type="hidden" name="hint" value={hint} />
                <p style={{ fontSize:".72rem", fontWeight:700, color:"#7A5460", fontFamily:BF, marginBottom:3 }}>Private access code</p>
                <p style={{ fontSize:".8rem", color:"#A08080", fontFamily:BF, marginBottom:".75rem", lineHeight:1.6 }}>
                  Use the code shared with you by the couple.
                </p>
                <div style={{ display:"flex", gap:8 }}>
                  <input name="accessCode" type="text" required placeholder="ENTER CODE"
                    style={{ ...inp, flex:1, padding:"9px 12px", fontSize:".875rem", textTransform:"uppercase", letterSpacing:".12em" }} />
                  <button type="submit" className="btn-sm"
                    style={{ padding:"9px 16px", borderRadius:10, background:accentColor, color:"#fff", fontSize:".78rem", fontWeight:700, fontFamily:BF, whiteSpace:"nowrap" }}>
                    Enter
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Gold stripe bottom */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, height:2, background:STRIPE, zIndex:20 }} />
    </>
  );
}
