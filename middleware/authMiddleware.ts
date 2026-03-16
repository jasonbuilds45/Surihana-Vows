import { NextResponse, type NextRequest } from "next/server";
import { getDefaultPathForRole, getSessionFromRequest, getSafeRedirectPath, roleCanAccess } from "@/lib/auth";

const PROTECTED_PREFIXES = ["/family", "/admin", "/api/admin", "/api/auth/login"] as const;

// API routes that require auth but are called from client — allow admin role too
const ADMIN_API_PREFIXES = ["/api/admin"] as const;

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

function buildRequestedPath(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required."
        },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", getSafeRedirectPath(buildRequestedPath(request), "/family"));
    return NextResponse.redirect(loginUrl);
  }

  if (!roleCanAccess(session.role, pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to access this resource."
        },
        { status: 403 }
      );
    }

    return NextResponse.redirect(new URL(getDefaultPathForRole(session.role), request.url));
  }

  return NextResponse.next();
}

export const authMiddlewareConfig = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
