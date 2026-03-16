import { NextResponse, type NextRequest } from "next/server";

// The middleware only handles PAGE-level redirects for /admin and /family.
// API routes (/api/admin/*) do their own auth inside the route handler
// using the Node.js runtime where crypto and env vars work reliably.
//
// We deliberately do NOT verify the session token here because:
// 1. Middleware runs on Vercel's Edge Runtime which has limited crypto support
// 2. AUTH_SECRET may not be available in the edge runtime
// 3. API routes handle their own auth in the full Node.js runtime

const PAGE_PROTECTED: Record<string, string> = {
  "/admin":  "admin",
  "/family": "family",
};

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes — always pass through, they auth themselves
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check if this is a protected page
  const requiredRole = Object.entries(PAGE_PROTECTED).find(
    ([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/")
  )?.[1];

  if (!requiredRole) {
    // Not a protected page — pass through
    return NextResponse.next();
  }

  // Read the session cookie
  const cookieValue = request.cookies.get("surihana_session")?.value;

  if (!cookieValue) {
    // No cookie at all — redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "redirect",
      `${pathname}${request.nextUrl.search}`
    );
    loginUrl.searchParams.set(
      "hint",
      requiredRole === "admin" ? "couple" : "vault"
    );
    return NextResponse.redirect(loginUrl);
  }

  // Lightweight cookie presence check only.
  // The actual token signature verification happens in:
  //   - getSessionFromCookieStore() called by page Server Components
  //   - getAuthorizedSessionFromRequest() called by API route handlers
  // Both run in the full Node.js runtime with proper crypto support.
  //
  // The page itself will do the full verification and redirect if the token
  // is invalid/expired — this middleware just prevents the flash of the
  // protected page for users who have no cookie at all.
  return NextResponse.next();
}
