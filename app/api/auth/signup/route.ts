import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE,
  createAuthToken,
} from "@/lib/auth";
import { completeFamilySignupInvite } from "@/lib/family-signup";

export const runtime = "nodejs";

function buildInviteRedirect(request: NextRequest, token: string, reason: string) {
  return NextResponse.redirect(
    new URL(`/family/signup/${encodeURIComponent(token)}?error=${encodeURIComponent(reason)}`, request.url),
    303
  );
}

function buildLoginRedirect(request: NextRequest, reason: string) {
  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(reason)}`, request.url),
    303
  );
}

// POST /api/auth/signup
// Invite-only account activation for family access.
export async function POST(request: NextRequest) {
  let token = "";

  try {
    const formData = await request.formData();
    token = String(formData.get("token") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const password2 = String(formData.get("password2") ?? "").trim();

    if (!token) return buildLoginRedirect(request, "invite-only");
    if (password.length < 8) return buildInviteRedirect(request, token, "weak-password");
    if (password !== password2) return buildInviteRedirect(request, token, "password-mismatch");

    const result = await completeFamilySignupInvite(token, password);

    if (result.status !== "ready" || !result.session) {
      const reason =
        result.status === "claimed"
          ? "invite-claimed"
          : result.status === "expired"
            ? "invite-expired"
            : "invite-invalid";

      return buildInviteRedirect(request, token, reason);
    }

    const sessionToken = await createAuthToken(result.session);
    const destination = new URL(result.destination ?? "/family", request.url);
    destination.searchParams.set("_t", sessionToken);

    const response = NextResponse.redirect(destination, 303);
    response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: false,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    console.error("[auth/signup] Unexpected error:", error);
    return token
      ? buildInviteRedirect(request, token, "server-error")
      : buildLoginRedirect(request, "server-error");
  }
}
