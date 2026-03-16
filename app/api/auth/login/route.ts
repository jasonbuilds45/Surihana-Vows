import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE,
  authenticateUser,
  createAuthToken,
  getDefaultPathForRole,
} from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/auth/login
// Authenticates the user, sets the session cookie, and redirects — all in
// ONE response so the cookie is guaranteed to arrive before the next request.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email    = String(formData.get("email")    ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const hint     = String(formData.get("hint")     ?? "");

    if (!email || !password) {
      return NextResponse.redirect(
        new URL(`/login?error=invalid&hint=${encodeURIComponent(hint)}`, request.url),
        303
      );
    }

    const result = await authenticateUser(email, password);

    if (!result) {
      return NextResponse.redirect(
        new URL(`/login?error=invalid&hint=${encodeURIComponent(hint)}`, request.url),
        303
      );
    }

    const token       = await createAuthToken(result);
    const destination = getDefaultPathForRole(result.role); // /admin or /family

    const response = NextResponse.redirect(new URL(destination, request.url), 303);
    response.cookies.delete(AUTH_COOKIE_NAME);
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: false,   // Must be false so JS can read it for the Authorization header fallback
      maxAge:   SESSION_MAX_AGE,
      path:     "/",
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
    });
    // Also embed token in redirect URL fragment so client can store it
    // regardless of cookie domain restrictions on Vercel preview URLs
    const dest = new URL(destination, request.url);
    dest.searchParams.set("_t", token);
    const finalResponse = NextResponse.redirect(dest, 303);
    finalResponse.cookies.delete(AUTH_COOKIE_NAME);
    finalResponse.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: false,
      maxAge:   SESSION_MAX_AGE,
      path:     "/",
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
    });
    return finalResponse;
  } catch (err) {
    console.error("[auth/login] Unexpected error:", err);
    return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
  }
}
