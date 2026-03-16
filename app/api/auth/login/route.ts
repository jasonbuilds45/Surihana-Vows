import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE,
  authenticateUser,
  createAuthToken,
  getDefaultPathForRole,
} from "@/lib/auth";

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

    // Set cookie AND redirect in the same HTTP response.
    // Using server actions (cookies().set() then redirect()) has a race condition
    // where the cookie is not flushed before the browser follows the redirect,
    // causing the middleware to see no session and bounce back to /login.
    const response = NextResponse.redirect(new URL(destination, request.url), 303);
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      maxAge:   SESSION_MAX_AGE,
      path:     "/",
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error("[auth/login] Unexpected error:", err);
    return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
  }
}
