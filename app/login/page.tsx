import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_COOKIE_NAME, SESSION_MAX_AGE, authenticateUser, createAuthToken,
  getDefaultPathForRole, getSafeRedirectPath, getSessionFromCookieStore
} from "@/lib/auth";
import { authenticateInviteAccessCode, issueFamilyMagicLink } from "@/lib/magicLink";
import type { Metadata } from "next";
import { weddingConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Sign in — ${weddingConfig.celebrationTitle}`,
  robots: { index: false },
};

interface LoginPageProps {
  searchParams?: {
    redirect?: string | string[];
    error?:    string | string[];
    magic?:    string | string[];
    hint?:     string | string[];
  };
}

function readParam(v?: string | string[]) {
  return typeof v === "string" ? v : v?.[0];
}

const DF = "var(--font-display), Georgia, serif";
const BF = "var(--font-body), system-ui, sans-serif";
const STRIPE = "linear-gradient(90deg,#D94F62 0%,#C0364A 30%,#B8820A 55%,#C0364A 80%,#D94F62 100%)";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const cookieStore   = cookies();
  const hint          = readParam(searchParams?.hint);
  const errorVal      = readParam(searchParams?.error);
  const magicStatus   = readParam(searchParams?.magic);

  // Default redirect based on hint
  const defaultRedirect = hint === "couple" ? "/admin" : "/family";
  const redirectTarget  = getSafeRedirectPath(readParam(searchParams?.redirect), defaultRedirect);

  // Already logged in → go straight to destination
  const existing = await getSessionFromCookieStore(cookieStore);
  if (existing) {
    redirect(getDefaultPathForRole(existing.role));
  }

  // ── Server actions ─────────────────────────────────────────────────────────

  async function passwordLoginAction(formData: FormData) {
    "use server";
    const email    = String(formData.get("email")    ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const redir    = getSafeRedirectPath(String(formData.get("redirectTo") ?? ""), "/family");

    const result = await authenticateUser(email, password);
    if (!result) {
      redirect(`/login?error=invalid&hint=${encodeURIComponent(String(formData.get("hint") ?? ""))}&redirect=${encodeURIComponent(redir)}`);
    }

    const token = await createAuthToken(result);
    cookies().set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      maxAge:   SESSION_MAX_AGE,
      path:     "/",
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
    });

    // Always redirect to the correct home for the role
    redirect(getDefaultPathForRole(result.role));
  }

  async function magicLinkAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    const redir = getSafeRedirectPath(String(formData.get("redirectTo") ?? ""), "/family");
    await issueFamilyMagicLink(email, redir);
    redirect(`/login?magic=sent&hint=${encodeURIComponent(String(formData.get("hint") ?? ""))}&redirect=${encodeURIComponent(redir)}`);
  }

  async function accessCodeAction(formData: FormData) {
    "use server";
    const code  = String(formData.get("accessCode") ?? "").trim();
    const redir = getSafeRedirectPath(String(formData.get("redirectTo") ?? ""), "/family");

    const result = await authenticateInviteAccessCode(code);
    if (!result) {
      redirect(`/login?error=access-code&hint=${encodeURIComponent(String(formData.get("hint") ?? ""))}&redirect=${encodeURIComponent(redir)}`);
    }

    const token = await createAuthToken(result);
    cookies().set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      maxAge:   SESSION_MAX_AGE,
      path:     "/",
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
    });

    redirect(getDefaultPathForRole(result.role));
  }

  // ── Error message ──────────────────────────────────────────────────────────
  const errorMsg =
    errorVal === "access-code" ? "That access code is invalid or has expired." :
    errorVal === "magic-link"  ? "That magic link is invalid or has expired." :
    errorVal                   ? "Invalid email or password. Please try again." :
    null;

  const isCouple = hint === "couple";
  const accentColor = isCouple ? "#C0364A" : "#8A5A44";

  const inputStyle: React.CSSProperties = {
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
        html, body { margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .login-fade { animation: fadeIn .6s ease both; }
        .login-submit:hover { opacity: .92; transform: translateY(-1px); }
        .login-submit { transition: all .18s ease; cursor: pointer; }
        .back-link { transition: color .18s; }
        .back-link:hover { color: rgba(255,255,255,.80) !important; }
      `}</style>

      <div style={{ minHeight:"100dvh", display:"flex", background:"#0E0809" }}>

        {/* ── Gold stripe top ── */}
        <div style={{ position:"fixed", top:0, left:0, right:0, height:3, background:STRIPE, zIndex:20 }} />

        {/* ── Left panel — dark branding ── */}
        <div
          style={{
            width: "38%",
            minWidth: 300,
            background: "linear-gradient(160deg,#1A0C10 0%,#2A1218 60%,#1A0C10 100%)",
            borderRight: "1px solid rgba(255,255,255,.07)",
            padding: "clamp(2rem,5vh,4rem) clamp(2rem,4vw,3.5rem)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          className="login-fade"
        >
          {/* Top: brand */}
          <div>
            <div style={{ marginBottom:"3rem" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", border:`1.5px solid ${accentColor}`, display:"grid", placeItems:"center", marginBottom:"1.25rem", background:"rgba(255,255,255,.06)" }}>
                <span style={{ fontFamily:DF, fontSize:"1rem", fontWeight:700, color: isCouple ? "#F5C5CB" : "#D4B39B" }}>
                  {weddingConfig.brideName[0]}{weddingConfig.groomName[0]}
                </span>
              </div>
              <p style={{ fontSize:".58rem", letterSpacing:".30em", textTransform:"uppercase", color:"rgba(255,255,255,.30)", fontFamily:BF, marginBottom:".5rem" }}>
                {weddingConfig.celebrationTitle}
              </p>
              <h1 style={{ fontFamily:DF, fontSize:"clamp(1.75rem,3.5vw,2.75rem)", fontWeight:700, color:"#fff", lineHeight:1.1, marginBottom:"1rem" }}>
                {isCouple
                  ? <>Welcome back,<br />lovely couple 💍</>
                  : <>Welcome,<br />dear family 🫂</>
                }
              </h1>
              <p style={{ fontSize:".875rem", color:"rgba(255,255,255,.42)", fontFamily:BF, lineHeight:1.75, maxWidth:280 }}>
                {isCouple
                  ? "Sign in to your wedding dashboard to manage guests, track RSVPs, and send invitations."
                  : "Sign in to access the private family vault — photos, memories, and time capsules for your loved ones."
                }
              </p>
            </div>

            {magicStatus === "sent" && (
              <div style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.10)", borderRadius:14, padding:"1rem 1.25rem" }}>
                <p style={{ fontSize:".875rem", fontWeight:600, color:"#fff", marginBottom:4 }}>Magic link sent ✓</p>
                <p style={{ fontSize:".82rem", color:"rgba(255,255,255,.45)", fontFamily:BF }}>Check your inbox — click the link to sign in instantly.</p>
              </div>
            )}
          </div>

          {/* Bottom: back link */}
          <a
            href="/"
            className="back-link"
            style={{ fontSize:".7rem", letterSpacing:".22em", textTransform:"uppercase", color:"rgba(255,255,255,.25)", textDecoration:"none", fontFamily:BF }}
          >
            ← Back to wedding
          </a>
        </div>

        {/* ── Right panel — forms ── */}
        <div
          style={{
            flex:1,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            padding:"clamp(2rem,5vh,5rem) clamp(2rem,5vw,5rem)",
            background:"#fff",
          }}
          className="login-fade"
          // slight delay
        >
          <div style={{ width:"100%", maxWidth:440 }}>

            {/* ── Password form ── */}
            <form action={passwordLoginAction} style={{ marginBottom:"2rem" }}>
              <input type="hidden" name="redirectTo" value={redirectTarget} />
              <input type="hidden" name="hint" value={hint ?? ""} />

              <p style={{ fontSize:".58rem", letterSpacing:".26em", textTransform:"uppercase", color: accentColor, fontFamily:BF, fontWeight:700, marginBottom:".5rem" }}>
                Sign in
              </p>
              <h2 style={{ fontFamily:DF, fontSize:"clamp(1.5rem,3vw,2rem)", fontWeight:700, color:"#1A1012", marginBottom:"1.75rem", lineHeight:1.15 }}>
                Continue with password
              </h2>

              <div style={{ display:"flex", flexDirection:"column", gap:"1rem", marginBottom:"1.25rem" }}>
                <div>
                  <label style={{ display:"block", fontSize:".6rem", fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", color:"#7A5460", marginBottom:6, fontFamily:BF }}>
                    Email address
                  </label>
                  <input name="email" type="email" required placeholder="your@email.com" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:".6rem", fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", color:"#7A5460", marginBottom:6, fontFamily:BF }}>
                    Password
                  </label>
                  <input name="password" type="password" required placeholder="Your password" style={inputStyle} />
                </div>
              </div>

              {errorMsg && (
                <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"10px 14px", marginBottom:"1rem" }}>
                  <p style={{ fontSize:".875rem", color:"#B91C1C", fontFamily:BF }}>{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                style={{
                  width:"100%",
                  padding:"14px",
                  borderRadius:999,
                  border:"none",
                  background: isCouple
                    ? "linear-gradient(135deg,#C0364A,#A82C3E)"
                    : "linear-gradient(135deg,#8A5A44,#6D4535)",
                  color:"#fff",
                  fontSize:".875rem",
                  fontWeight:700,
                  fontFamily:BF,
                  letterSpacing:".12em",
                  textTransform:"uppercase",
                  boxShadow: isCouple
                    ? "0 6px 22px rgba(192,54,74,.30)"
                    : "0 6px 22px rgba(138,90,68,.28)",
                }}
              >
                Sign in →
              </button>
            </form>

            {/* ── Divider ── */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.5rem" }}>
              <div style={{ flex:1, height:1, background:"#F0E8E4" }} />
              <span style={{ fontSize:".65rem", letterSpacing:".20em", textTransform:"uppercase", color:"#B0A0A0", fontFamily:BF }}>or</span>
              <div style={{ flex:1, height:1, background:"#F0E8E4" }} />
            </div>

            {/* ── Magic link form ── */}
            <div style={{ background:"#FAF7F5", border:"1px solid #EDE0D8", borderRadius:16, padding:"1.25rem", marginBottom:"1rem" }}>
              <form action={magicLinkAction}>
                <input type="hidden" name="redirectTo" value={redirectTarget} />
                <input type="hidden" name="hint" value={hint ?? ""} />
                <p style={{ fontSize:".72rem", fontWeight:700, color:"#7A5460", fontFamily:BF, marginBottom:4 }}>Send a magic link</p>
                <p style={{ fontSize:".8rem", color:"#A08080", fontFamily:BF, marginBottom:"0.875rem", lineHeight:1.6 }}>
                  We&apos;ll email you a one-click sign-in link.
                </p>
                <div style={{ display:"flex", gap:8 }}>
                  <input name="email" type="email" required placeholder="your@email.com" style={{ ...inputStyle, flex:1, padding:"10px 14px", fontSize:".875rem" }} />
                  <button
                    type="submit"
                    className="login-submit"
                    style={{ padding:"10px 18px", borderRadius:10, border:"none", background: accentColor, color:"#fff", fontSize:".78rem", fontWeight:700, fontFamily:BF, whiteSpace:"nowrap" }}
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>

            {/* ── Access code form ── */}
            <div style={{ background:"#FAF7F5", border:"1px solid #EDE0D8", borderRadius:16, padding:"1.25rem" }}>
              <form action={accessCodeAction}>
                <input type="hidden" name="redirectTo" value={redirectTarget} />
                <input type="hidden" name="hint" value={hint ?? ""} />
                <p style={{ fontSize:".72rem", fontWeight:700, color:"#7A5460", fontFamily:BF, marginBottom:4 }}>Private access code</p>
                <p style={{ fontSize:".8rem", color:"#A08080", fontFamily:BF, marginBottom:"0.875rem", lineHeight:1.6 }}>
                  Use the code shared with you by the couple.
                </p>
                <div style={{ display:"flex", gap:8 }}>
                  <input name="accessCode" type="text" required placeholder="ENTER CODE" style={{ ...inputStyle, flex:1, padding:"10px 14px", fontSize:".875rem", textTransform:"uppercase", letterSpacing:".12em" }} />
                  <button
                    type="submit"
                    className="login-submit"
                    style={{ padding:"10px 18px", borderRadius:10, border:"none", background: accentColor, color:"#fff", fontSize:".78rem", fontWeight:700, fontFamily:BF, whiteSpace:"nowrap" }}
                  >
                    Enter
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>

        {/* ── Gold stripe bottom ── */}
        <div style={{ position:"fixed", bottom:0, left:0, right:0, height:2, background:STRIPE, zIndex:20 }} />
      </div>
    </>
  );
}
