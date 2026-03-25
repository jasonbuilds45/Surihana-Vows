import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE,
  authenticateUser,
  createAuthToken,
  getDefaultPathForRole,
  getSafeRedirectPath,
} from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/auth/login
// Authenticates the user, sets the session cookie, and redirects.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email    = String(formData.get("email")    ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const hint     = String(formData.get("hint")     ?? "");
    const redirect = String(formData.get("redirect") ?? "").trim();

    const fail = (reason = "invalid") =>
      NextResponse.redirect(
        new URL(`/login?error=${reason}&hint=${encodeURIComponent(hint)}`, request.url),
        303
      );

    if (!email || !password) return fail();

    const result = await authenticateUser(email, password);
    if (!result) return fail();

    const token       = await createAuthToken(result);
    const defaultDest = getDefaultPathForRole(result.role);
    const destination = getSafeRedirectPath(redirect, defaultDest);

    const dest = new URL(destination, request.url);
    dest.searchParams.set("_t", token);

    const response = NextResponse.redirect(dest, 303);
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: false,  // Must stay false — client reads it for Authorization header fallback
      maxAge:   SESSION_MAX_AGE,
      path:     "/",
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
    });
    return response;
  } catch (err) {
    console.error("[auth/login] Unexpected error:", err);
    return NextResponse.redirect(new URL("/login?error=server-error", request.url), 303);
  }
}
