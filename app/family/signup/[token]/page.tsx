import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getDefaultPathForRole, getSessionFromCookieStore } from "@/lib/auth";
import { getFamilySignupInviteState } from "@/lib/family-signup";
import { weddingConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Complete your access - ${weddingConfig.celebrationTitle}`,
  robots: { index: false, follow: false },
};

interface FamilySignupPageProps {
  params: { token: string };
  searchParams?: {
    error?: string | string[];
  };
}

function param(value?: string | string[]) {
  return typeof value === "string" ? value : (value?.[0] ?? "");
}

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

const ROSE = "#BE2D45";
const ROSE_D = "#A82C3E";
const INK = "#1A0C0E";
const INK_3 = "#7A5460";
const INK_4 = "#A88888";
const CREAM = "#FAF6F1";

export default async function FamilySignupPage({
  params,
  searchParams,
}: FamilySignupPageProps) {
  const session = await getSessionFromCookieStore(cookies());
  if (session) redirect(getDefaultPathForRole(session.role));

  const invite = await getFamilySignupInviteState(params.token);
  const errorCode = param(searchParams?.error);
  const errorMessages: Record<string, string> = {
    "weak-password": "Password must be at least 8 characters.",
    "password-mismatch": "Passwords do not match.",
    "invite-invalid": "This invitation link is invalid or no longer available.",
    "invite-expired": "This invitation link has expired. Ask the couple to send you a fresh one.",
    "invite-claimed": "This invitation has already been used. Sign in with the password you already created.",
    "server-error": "Something went wrong while setting up your account. Please try again.",
  };
  const errorMsg = errorCode ? (errorMessages[errorCode] ?? "Something went wrong.") : null;
  const loginDestination = invite.destination ?? "/family";
  const loginHref = `/login?redirect=${encodeURIComponent(loginDestination)}`;

  const title =
    invite.status === "ready"
      ? "Create your family access"
      : invite.status === "claimed"
        ? "Your account is already active"
        : invite.status === "expired"
          ? "This invitation has expired"
          : "This invitation is not available";

  const subtitle =
    invite.status === "ready"
      ? "Set your password once and you can sign in normally after that."
      : invite.status === "claimed"
        ? "Your setup is complete. Head to the login page and sign in with your email and password."
        : invite.status === "expired"
          ? "The secure setup link has timed out. Ask the couple to send you a new invitation."
          : "The link may be incorrect, removed, or already replaced by a newer invitation.";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { min-height: 100%; }

        .fs-shell {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          padding: 2rem 1.25rem;
          background:
            radial-gradient(circle at top right, rgba(190,45,69,.10), transparent 32%),
            radial-gradient(circle at bottom left, rgba(184,134,10,.08), transparent 30%),
            linear-gradient(160deg, #1A0C0E 0%, #221015 48%, #13080A 100%);
        }

        .fs-card {
          width: min(100%, 960px);
          display: grid;
          grid-template-columns: minmax(280px, 0.95fr) minmax(320px, 1.05fr);
          background: ${CREAM};
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0,0,0,.28);
        }

        .fs-panel-dark {
          padding: clamp(2rem, 5vw, 3.5rem);
          color: #fff;
          background:
            radial-gradient(circle at 20% 20%, rgba(212,72,96,.18), transparent 28%),
            radial-gradient(circle at 80% 75%, rgba(184,134,10,.12), transparent 24%),
            linear-gradient(160deg, #1A0C0E 0%, #2A1218 55%, #1C0E12 100%);
        }

        .fs-panel-light {
          padding: clamp(2rem, 5vw, 3.5rem);
          display: flex;
          align-items: center;
        }

        .fs-mono {
          font-family: ${BF};
          font-size: .62rem;
          letter-spacing: .28em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .fs-input {
          width: 100%;
          border: 1.5px solid #DDD0CC;
          border-radius: 14px;
          padding: 13px 16px;
          font-size: .95rem;
          color: ${INK};
          background: #fff;
          font-family: ${BF};
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
        }

        .fs-input:focus {
          border-color: ${ROSE};
          box-shadow: 0 0 0 3px rgba(190,45,69,.12);
        }

        .fs-btn {
          width: 100%;
          border: none;
          border-radius: 999px;
          padding: 14px 18px;
          background: linear-gradient(135deg, #D44860, ${ROSE}, ${ROSE_D});
          color: #fff;
          cursor: pointer;
          font-family: ${BF};
          font-size: .8rem;
          font-weight: 700;
          letter-spacing: .18em;
          text-transform: uppercase;
          box-shadow: 0 10px 30px rgba(190,45,69,.28);
        }

        .fs-link {
          color: ${ROSE};
          font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 820px) {
          .fs-card { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="fs-shell">
        <div className="fs-card">
          <aside className="fs-panel-dark">
            <p className="fs-mono" style={{ color: "rgba(212,72,96,.72)", marginBottom: ".85rem" }}>
              Invite-only setup
            </p>

            <h1
              style={{
                fontFamily: DF,
                fontSize: "clamp(2rem, 4vw, 3.1rem)",
                lineHeight: 0.92,
                fontWeight: 300,
                marginBottom: "1.5rem",
              }}
            >
              {weddingConfig.brideName.split(" ")[0]}{" "}
              <span style={{ color: "rgba(212,72,96,.72)", fontStyle: "italic" }}>&amp;</span>{" "}
              {weddingConfig.groomName.split(" ")[0]}
            </h1>

            <p
              style={{
                fontFamily: DF,
                fontStyle: "italic",
                fontSize: "1.05rem",
                lineHeight: 1.8,
                color: "rgba(255,255,255,.68)",
                maxWidth: 320,
              }}
            >
              {subtitle}
            </p>

            <div
              style={{
                marginTop: "2rem",
                padding: "1rem 1.1rem",
                borderRadius: 18,
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <p className="fs-mono" style={{ color: "rgba(255,255,255,.38)", marginBottom: ".6rem" }}>
                Access note
              </p>
              <p
                style={{
                  fontFamily: BF,
                  fontSize: ".88rem",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,.72)",
                }}
              >
                The main app no longer allows public self-signup. Family access is activated only through a private invitation from the couple.
              </p>
            </div>
          </aside>

          <section className="fs-panel-light">
            <div style={{ width: "100%", maxWidth: 420 }}>
              <p
                style={{
                  fontFamily: DF,
                  fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
                  fontStyle: "italic",
                  color: INK,
                  marginBottom: "1rem",
                }}
              >
                {title}
              </p>

              {errorMsg && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(190,45,69,.08)",
                    border: "1px solid rgba(190,45,69,.22)",
                  }}
                >
                  <p style={{ fontFamily: BF, fontSize: ".88rem", color: ROSE }}>{errorMsg}</p>
                </div>
              )}

              {invite.status === "ready" ? (
                <>
                  <div
                    style={{
                      marginBottom: "1.25rem",
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "rgba(184,134,10,.08)",
                      border: "1px solid rgba(184,134,10,.20)",
                    }}
                  >
                    <p style={{ fontFamily: BF, fontSize: ".88rem", color: "#6B4A18", lineHeight: 1.65 }}>
                      This invitation is reserved for <strong>{invite.email}</strong>.
                    </p>
                  </div>

                  <form method="POST" action="/api/auth/signup">
                    <input type="hidden" name="token" value={params.token} />

                    <div style={{ display: "grid", gap: "1rem" }}>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: 8,
                            color: INK_3,
                          }}
                          className="fs-mono"
                        >
                          Email
                        </label>
                        <input className="fs-input" value={invite.email ?? ""} readOnly />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: 8,
                            color: INK_3,
                          }}
                          className="fs-mono"
                        >
                          Password
                        </label>
                        <input
                          className="fs-input"
                          name="password"
                          type="password"
                          minLength={8}
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                          required
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: 8,
                            color: INK_3,
                          }}
                          className="fs-mono"
                        >
                          Confirm password
                        </label>
                        <input
                          className="fs-input"
                          name="password2"
                          type="password"
                          minLength={8}
                          autoComplete="new-password"
                          placeholder="Repeat your password"
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="fs-btn" style={{ marginTop: "1.5rem" }}>
                      Create account
                    </button>
                  </form>

                  <p style={{ marginTop: "1rem", fontFamily: BF, fontSize: ".84rem", color: INK_4 }}>
                    Already set up?{" "}
                    <a href={loginHref} className="fs-link">
                      Sign in here
                    </a>
                  </p>
                </>
              ) : (
                <div
                  style={{
                    padding: "1.1rem 0 0",
                    display: "grid",
                    gap: ".95rem",
                  }}
                >
                  <p style={{ fontFamily: BF, fontSize: ".95rem", color: INK_3, lineHeight: 1.8 }}>
                    {invite.status === "claimed" && invite.email
                      ? `This invitation was already completed for ${invite.email}.`
                      : "If you still need access, ask the couple to send you a fresh invite."}
                  </p>

                  <a href={loginHref} className="fs-link" style={{ fontFamily: BF, fontSize: ".92rem" }}>
                    Go to sign in
                  </a>
                </div>
              )}

              <p style={{ marginTop: "1.5rem", fontFamily: BF, fontSize: ".78rem", color: INK_4 }}>
                Need help? Contact the couple directly for a new invitation.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
