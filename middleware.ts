import type { NextRequest } from "next/server";
import { authMiddleware } from "@/middleware/authMiddleware";

export const config = {
  matcher: [
    // Match all pages but skip static files, images, and API routes
    // API routes handle their own auth inside the Node.js runtime
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/).*)",
  ],
};

export function middleware(request: NextRequest) {
  return authMiddleware(request);
}
