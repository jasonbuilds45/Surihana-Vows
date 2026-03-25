import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getDefaultPathForRole, getSessionFromCookieStore } from "@/lib/auth";
import { weddingConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Sign in - ${weddingConfig.celebrationTitle}`,
  robots: { index: false },
};

interface LoginPageProps {
  searchParams?: {
    error?: string | string[];
    redirect?: string | string[];
    hint?: string | string[];
    tab?: string | string[];
  };
}

function param(value?: string | string[]) {
  return typeof value === "string" ? value : (value?.[0] ?? "");
}

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

const ROSE = "#BE2D45";
const ROSE_D = "#A82C3E";
const ROSE_L = "#D44860";
const GOLD = "#B8860A";
const INK = "#1A0C0E";
const INK_3 = "#7A5460";
const INK_4 = "#A88888";
const CREAM = "#FAF6F1";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSessionFromCookieStore(cookies());
  if (session) redirect(getDefaultPathForRole(session.role));

  const errorCode = param(searchParams?.error);
  const hint = param(searchParams?.hint);
  const redirectTo = param(searchParams?.redirect) || (hint === "couple" ? "/admin" : "/family");

  const errorMessages: Record<string, string> = {
    invalid: "Incorrect email or password. Please try again.",
    "server-error": "Something went wrong. Please try again.",
    "invite-only": "Family accounts can only be created from a private invite link sent by the couple.",
  };
  const errorMsg = errorCode ? (errorMessages[errorCode] ?? "Something went wrong.") : null;

  const brideInitial = weddingConfig.brideName[0] ?? "M";
  const groomInitial = weddingConfig.groomName[0] ?? "L";
  const brideFirst = weddingConfig.brideName.split(" ")[0];
  const groomFirst = weddingConfig.groomName.split(" ")[0];
  const isCoupleLogin = hint === "couple";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { min-height: 100%; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .lp-panel-l { animation: fadeUp .65s ease both; }
        .lp-panel-r { animation: fadeUp .65s .10s ease both; }

        .lp-inp {
          display: block;
          width: 100%;
          background: #FFFFFF;
          border: 1.5px solid #DDD0CC;
          border-radius: 14px;
          padding: 13px 16px;
          color: ${INK};
          font-size: .9375rem;
          font-family: ${BF};
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
        }

        .lp-inp:focus {
          border-color: ${ROSE};
          box-shadow: 0 0 0 3px rgba(190,45,69,.12);
        }

        .lp-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          background: linear-gradient(135deg, ${ROSE_L}, ${ROSE}, ${ROSE_D});
          color: #fff;
          font-family: ${BF};
          font-size: .875rem;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          box-shadow: 0 6px 24px rgba(190,45,69,.30);
          transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
        }

        .lp-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(190,45,69,.38);
          filter: brightness(1.04);
        }

        .lp-back {
          font-family: ${BF};
          font-size: .58rem;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: rgba(255,255,255,.28);
          text-decoration: none;
          transition: color .18s;
        }

        .lp-back:hover { color: rgba(255,255,255,.70); }
        .lp-seal { animation: float 6s ease-in-out infinite; }

        @media (max-width: 700px) {
          .lp-wrap { flex-direction: column !important; }
          .lp-left { width: 100% !important; min-height: 220px !important; padding: 2rem 1.75rem !important; }
          .lp-right { padding: 2rem 1.5rem !important; }
        }
      `}</style>

      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 50,
          background: `linear-gradient(90deg, transparent 0%, ${ROSE_L} 20%, ${GOLD} 50%, ${ROSE_L} 80%, transparent 100%)`,
        }}
      />

      <div className="lp-wrap" style={{ minHeight: "100dvh", display: "flex", background: INK }}>
        <div
          className="lp-left lp-panel-l"
          style={{
            width: "42%",
            minWidth: 300,
            background: "linear-gradient(160deg, #1A0C0E 0%, #2A1218 55%, #1C0E12 100%)",
            borderRight: "1px solid rgba(255,255,255,.06)",
            padding: "clamp(2.5rem,6vh,5rem) clamp(2rem,4vw,3.5rem)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "-20%",
              right: "-10%",
              width: "70%",
              height: "60%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(190,45,69,.10) 0%, transparent 65%)",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "-15%",
              left: "-8%",
              width: "55%",
              height: "50%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(184,134,10,.07) 0%, transparent 65%)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              className="lp-seal"
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #F5D47A 0%, #C9960A 40%, #9E7205 75%, #5C3D01 100%)",
                display: "grid",
                placeItems: "center",
                marginBottom: "2.25rem",
                boxShadow: "0 8px 28px rgba(0,0,0,.40), 0 2px 6px rgba(0,0,0,.22)",
                border: "1px solid rgba(255,220,100,.25)",
              }}
            >
              <span
                style={{
                  fontFamily: DF,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "rgba(28,14,0,.82)",
                  letterSpacing: ".12em",
                }}
              >
                {brideInitial}
                {groomInitial}
              </span>
            </div>

            <p
              style={{
                fontFamily: BF,
                fontSize: ".50rem",
                letterSpacing: ".42em",
                textTransform: "uppercase",
                color: "rgba(190,45,69,.65)",
                fontWeight: 700,
                marginBottom: ".75rem",
              }}
            >
              {weddingConfig.celebrationTitle}
            </p>

            <h1
              style={{
                fontFamily: DF,
                fontWeight: 300,
                fontSize: "clamp(2rem,4.5vw,3.25rem)",
                lineHeight: .88,
                letterSpacing: "-.02em",
                color: "#FFFFFF",
                marginBottom: "2rem",
              }}
            >
              <span>{brideFirst}</span>
              <span style={{ color: "rgba(190,45,69,.55)", fontStyle: "italic", margin: "0 .35em", fontSize: ".7em" }}>
                &
              </span>
              <span style={{ color: "#D4B896" }}>{groomFirst}</span>
            </h1>

            <div
              style={{
                width: "min(72px,40%)",
                height: 1,
                marginBottom: "1.75rem",
                background: "linear-gradient(to right, rgba(190,45,69,.55), rgba(184,134,10,.45), transparent)",
              }}
            />

            <p
              style={{
                fontFamily: DF,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(.95rem,1.8vw,1.15rem)",
                color: "rgba(255,255,255,.42)",
                lineHeight: 1.85,
                maxWidth: 320,
              }}
            >
              {isCoupleLogin
                ? "Sign in to reach the private control room that manages your wedding platform."
                : "Sign in to reach the private family vault, albums, memories, and post-wedding archive."}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginTop: "2rem" }}>
              {[weddingConfig.weddingDate, weddingConfig.venueCity || null]
                .filter((chip): chip is string => Boolean(chip))
                .map((chip) => (
                  <span
                    key={chip}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "4px 12px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.09)",
                      fontFamily: BF,
                      fontSize: ".52rem",
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,.35)",
                    }}
                  >
                    {chip}
                  </span>
                ))}
            </div>
          </div>

          <a href="/" className="lp-back">
            Back to wedding
          </a>
        </div>

        <div
          className="lp-right lp-panel-r"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(2rem,5vh,5rem) clamp(2rem,5vw,5rem)",
            background: CREAM,
          }}
        >
          <div style={{ width: "100%", maxWidth: 400 }}>
            <p
              style={{
                fontFamily: BF,
                fontSize: ".58rem",
                letterSpacing: ".26em",
                textTransform: "uppercase",
                color: INK_4,
                fontWeight: 700,
                marginBottom: ".8rem",
              }}
            >
              {isCoupleLogin ? "Couple sign in" : "Private sign in"}
            </p>

            <p
              style={{
                fontFamily: DF,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(1.4rem,3vw,2rem)",
                color: INK,
                marginBottom: "1rem",
                lineHeight: 1.15,
              }}
            >
              Welcome back.
            </p>

            <p style={{ fontFamily: BF, fontSize: ".9rem", color: INK_3, lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Use the credentials already created for you. Public self-signup is disabled.
            </p>

            {errorMsg && (
              <div
                style={{
                  padding: "11px 16px",
                  borderRadius: 12,
                  marginBottom: "1.25rem",
                  background: "rgba(190,45,69,.07)",
                  border: "1px solid rgba(190,45,69,.22)",
                }}
              >
                <p style={{ fontFamily: BF, fontSize: ".875rem", color: ROSE }}>{errorMsg}</p>
              </div>
            )}

            <form method="POST" action="/api/auth/login">
              <input type="hidden" name="hint" value={hint} />
              <input type="hidden" name="redirect" value={redirectTo} />

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: BF,
                      fontSize: ".56rem",
                      fontWeight: 700,
                      letterSpacing: ".18em",
                      textTransform: "uppercase",
                      color: INK_3,
                      marginBottom: 7,
                    }}
                  >
                    Email address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="your@email.com"
                    className="lp-inp"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: BF,
                      fontSize: ".56rem",
                      fontWeight: 700,
                      letterSpacing: ".18em",
                      textTransform: "uppercase",
                      color: INK_3,
                      marginBottom: 7,
                    }}
                  >
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Your password"
                    className="lp-inp"
                  />
                </div>
              </div>

              <button type="submit" className="lp-btn">
                Sign in
              </button>
            </form>

            <div
              style={{
                marginTop: "1.35rem",
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(184,134,10,.08)",
                border: "1px solid rgba(184,134,10,.18)",
              }}
            >
              <p style={{ fontFamily: BF, fontSize: ".84rem", color: "#6B4A18", lineHeight: 1.7 }}>
                Need family access? The couple must send you a private setup link first. Once you finish setup from that invite, you can sign in here any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 50,
          background: `linear-gradient(90deg, transparent 0%, ${ROSE} 30%, ${GOLD} 50%, ${ROSE} 70%, transparent 100%)`,
        }}
      />
    </>
  );
}
