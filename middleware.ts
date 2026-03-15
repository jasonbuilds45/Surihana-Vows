import type { NextRequest } from "next/server";
import { authMiddleware } from "@/middleware/authMiddleware";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};

export function middleware(request: NextRequest) {
  return authMiddleware(request);
}
