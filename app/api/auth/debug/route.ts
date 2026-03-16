import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

// GET /api/auth/debug
// Shows exactly what cookie the server sees and whether it can verify it.
// DELETE THIS FILE after the auth issue is resolved.
export async function GET(request: NextRequest) {
  const raw = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;

  let parseResult: string = "no cookie";
  let sessionInfo: object | null = null;

  if (raw) {
    try {
      const session = await verifyAuthToken(raw);
      if (session) {
        parseResult = "VALID";
        sessionInfo = { userId: session.userId, email: session.email, role: session.role, expiresAt: new Date(session.expiresAt).toISOString() };
      } else {
        parseResult = "INVALID — verifyAuthToken returned null";
      }
    } catch (e) {
      parseResult = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json({
    cookiePresent: !!raw,
    cookieLength: raw?.length ?? 0,
    cookiePreview: raw ? raw.slice(0, 60) + "..." : null,
    containsPipe: raw?.includes("|") ?? false,
    containsPercent: raw?.includes("%") ?? false,
    lastDotIndex: raw ? raw.lastIndexOf(".") : -1,
    parseResult,
    session: sessionInfo,
  });
}
