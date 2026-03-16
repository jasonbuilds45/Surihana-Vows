import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const raw = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;

  let parseResult = "no cookie";
  let sessionInfo: object | null = null;
  let errorDetail = "";

  if (raw) {
    try {
      const session = await verifyAuthToken(raw);
      if (session) {
        parseResult = "VALID ✓";
        sessionInfo = {
          userId: session.userId,
          email: session.email,
          role: session.role,
          expiresAt: new Date(session.expiresAt).toISOString(),
        };
      } else {
        parseResult = "INVALID — verifyAuthToken returned null";
      }
    } catch (e) {
      parseResult = "ERROR";
      errorDetail = e instanceof Error ? e.message : String(e);
    }
  }

  // Log to Vercel function logs too
  console.log("[auth/debug]", {
    cookiePresent: !!raw,
    cookieLength: raw?.length,
    parseResult,
    errorDetail,
  });

  return NextResponse.json({
    cookiePresent: !!raw,
    cookieLength: raw?.length ?? 0,
    cookieFirst80: raw ? raw.slice(0, 80) : null,
    containsPipe: raw?.includes("|") ?? false,
    containsPercent: raw?.includes("%") ?? false,
    pipeIndex: raw ? raw.indexOf("|") : -1,
    lastDotIndex: raw ? raw.lastIndexOf(".") : -1,
    parseResult,
    errorDetail: errorDetail || undefined,
    session: sessionInfo,
  });
}
