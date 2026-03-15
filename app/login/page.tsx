import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { GoldStripe, SectionLabel } from "@/components/ui";
import {
  AUTH_COOKIE_NAME, SESSION_MAX_AGE, authenticateUser, createAuthToken,
  getPostLoginRedirect, getSafeRedirectPath, getSessionFromCookieStore
} from "@/lib/auth";
import { authenticateInviteAccessCode, issueFamilyMagicLink } from "@/lib/magicLink";

interface LoginPageProps {
  searchParams?: { redirect?: string | string[]; error?: string | string[]; magic?: string | string[]; hint?: string | string[] };
}

function readParam(v?: string | string[]) { return typeof v === "string" ? v : v?.[0]; }

function errorMessage(v?: string | null) {
  if (v === "access-code") return "That access code is invalid or has expired.";
  if (v === "magic-link")  return "That magic link is invalid or has expired.";
  if (v) return "Invalid credentials. Please check your email and password and try again.";
  return null;
}

const inputStyle = {
  display: "block",
  width: "100%",
  background: "var(--color-surface-soft)",
  border: "1.5px solid var(--color-border-medium)",
  borderRadius: "12px",
  padding: "0.875rem 1rem",
  color: "var(--color-text-primary)",
  fontSize: "0.9375rem",
  outline: "none",
  fontFamily: "var(--font-body), sans-serif",
} as React.CSSProperties;

const subCardStyle = {
  background: "var(--color-surface-soft)",
  border: "1px solid var(--color-border)",
  borderRadius: "16px",
  padding: "1.25rem",
} as React.CSSProperties;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = cookies();
  const redirectTarget = getSafeRedirectPath(readParam(searchParams?.redirect), "/family");
  const errorVal   = readParam(searchParams?.error);
  const magicStatus = readParam(searchParams?.magic);
  const hint        = readParam(searchParams?.hint);
  const session     = await getSessionFromCookieStore(cookieStore);

  if (session) redirect(getPostLoginRedirect(session, redirectTarget));

  async function passwordLoginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const redir = getSafeRedirectPath(String(formData.get("redirectTo") ?? "/family"), "/family");
    const result = await authenticateUser(email, password);
    if (!result) redirect(`/login?error=invalid&redirect=${encodeURIComponent(redir)}`);
    const token = await createAuthToken(result);
    cookies().set(AUTH_COOKIE_NAME, token, { httpOnly: true, maxAge: SESSION_MAX_AGE, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    redirect(getPostLoginRedirect(result, redir));
  }

  async function magicLinkAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const redir = getSafeRedirectPath(String(formData.get("redirectTo") ?? "/family"), "/family");
    await issueFamilyMagicLink(email, redir);
    redirect(`/login?${new URLSearchParams({ redirect: redir, magic: "sent" }).toString()}`);
  }

  async function accessCodeAction(formData: FormData) {
    "use server";
    const accessCode = String(formData.get("accessCode") ?? "");
    const redir = getSafeRedirectPath(String(formData.get("redirectTo") ?? "/family"), "/family");
    const result = await authenticateInviteAccessCode(accessCode);
    if (!result) redirect(`/login?error=access-code&redirect=${encodeURIComponent(redir)}`);
    const token = await createAuthToken(result);
    cookies().set(AUTH_COOKIE_NAME, token, { httpOnly: true, maxAge: SESSION_MAX_AGE, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    redirect(getPostLoginRedirect(result, redir));
  }

  const err = errorMessage(errorVal);

  return (
    <div style={{ background: "#ffffff", minHeight: "calc(100dvh - 4rem)" }}>
      <GoldStripe />

      <Container className="py-12 lg:py-16">
        <div
          className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl grid lg:grid-cols-[5fr,7fr]"
          style={{ border: "1px solid var(--color-border)", boxShadow: "var(--shadow-2xl)" }}
        >

          {/* ── Left — dark context panel ── */}
          <div
            className="p-8 lg:p-10 flex flex-col gap-6"
            style={{ background: "linear-gradient(160deg, var(--color-surface-dark) 0%, #2d1510 100%)" }}
          >
            <div>
              <GoldStripe />
            </div>
            <div className="space-y-3">
              <SectionLabel style={{ color: "var(--color-champagne)" }}>Private access</SectionLabel>
              <h1 className="font-display text-3xl sm:text-4xl" style={{ color: "#ffffff", lineHeight: 1.2 }}>
                {hint === "vault" ? "Your vault link is missing." : "Enter the family archive."}
              </h1>
              <p className="text-sm leading-7" style={{ color: "rgba(255,255,255,0.55)" }}>
                {hint === "vault"
                  ? "Your family vault access link didn't include a token. Request a fresh one using the magic link form."
                  : "Family and admin access are issued through signed sessions, private access codes, or one-tap magic links."}
              </p>
            </div>

            {magicStatus === "sent" && (
              <div className="rounded-xl p-4 text-sm space-y-1" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="font-semibold" style={{ color: "#ffffff" }}>Magic link sent.</p>
                <p style={{ color: "rgba(255,255,255,0.55)" }}>Check your inbox. The link will sign you in instantly.</p>
              </div>
            )}

            <div className="mt-auto">
              <Link
                href="/story"
                className="text-xs uppercase font-medium"
                style={{ letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
              >
                ← Back to wedding
              </Link>
            </div>
          </div>

          {/* ── Right — forms ── */}
          <div className="p-8 lg:p-10 space-y-7" style={{ background: "#ffffff" }}>

            {/* Password login */}
            <form action={passwordLoginAction} className="space-y-5">
              <input name="redirectTo" type="hidden" value={redirectTarget} />
              <div className="space-y-1">
                <SectionLabel>Sign in with password</SectionLabel>
                <h2 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>
                  Continue to your destination
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-secondary)" }}>Email</label>
                  <input name="email" type="email" required placeholder="your@email.com" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-secondary)" }}>Password</label>
                  <input name="password" type="password" required placeholder="Your password" style={inputStyle} />
                </div>
              </div>

              {err && <p className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>{err}</p>}

              <button
                type="submit"
                className="w-full rounded-full py-3.5 text-sm uppercase font-semibold transition-all"
                style={{ letterSpacing: "0.2em", background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))", color: "#ffffff", boxShadow: "0 6px 20px rgba(184,84,58,0.3)" }}
              >
                Continue with password
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
              <span className="text-xs uppercase" style={{ letterSpacing: "0.22em", color: "var(--color-text-muted)" }}>Or</span>
              <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
            </div>

            <div className="space-y-4">
              {/* Magic link */}
              <form action={magicLinkAction} className="space-y-3" style={subCardStyle}>
                <input name="redirectTo" type="hidden" value={redirectTarget} />
                <div>
                  <p className="text-xs font-semibold uppercase" style={{ letterSpacing: "0.2em", color: "var(--color-text-secondary)" }}>Magic link</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Send a one-time sign-in link to your email.</p>
                </div>
                <input name="email" type="email" required placeholder="your@email.com" style={inputStyle} />
                <button
                  type="submit"
                  className="w-full rounded-full py-3 text-xs uppercase font-semibold transition-all"
                  style={{ letterSpacing: "0.2em", background: "var(--color-surface)", border: "1.5px solid var(--color-border-medium)", color: "var(--color-text-secondary)" }}
                >
                  Send magic link
                </button>
              </form>

              {/* Access code */}
              <form action={accessCodeAction} className="space-y-3" style={subCardStyle}>
                <input name="redirectTo" type="hidden" value={redirectTarget} />
                <div>
                  <p className="text-xs font-semibold uppercase" style={{ letterSpacing: "0.2em", color: "var(--color-text-secondary)" }}>Access code</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Enter a private code if your account was provisioned without a password.</p>
                </div>
                <input name="accessCode" type="text" required placeholder="Enter private code" style={{ ...inputStyle, textTransform: "uppercase" }} />
                <button
                  type="submit"
                  className="w-full rounded-full py-3 text-xs uppercase font-semibold transition-all"
                  style={{ letterSpacing: "0.2em", background: "var(--color-surface)", border: "1.5px solid var(--color-border-medium)", color: "var(--color-text-secondary)" }}
                >
                  Continue with access code
                </button>
              </form>
            </div>
          </div>
        </div>
      </Container>

      <GoldStripe thin />
    </div>
  );
}
