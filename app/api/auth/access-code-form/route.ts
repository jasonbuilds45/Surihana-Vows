import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE,
  createAuthToken,
  getDefaultPathForRole,
} from "@/lib/auth";
import { authenticateInviteAccessCode } from "@/lib/magicLink";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const code     = String(formData.get("accessCode") ?? "").trim();
    const hint     = String(formData.get("hint")       ?? "");

    const result = await authenticateInviteAccessCode(code);
    if (!result) {
      return NextResponse.redirect(
        new URL(`/login?error=access-code&hint=${encodeURIComponent(hint)}`, request.url),
        303
      );
    }

    const token       = await createAuthToken(result);
    const destination = getDefaultPathForRole(result.role);

    const response = NextResponse.redirect(new URL(destination, request.url), 303);
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      maxAge:   SESSION_MAX_AGE,
      path:     "/",
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=access-code", request.url), 303);
  }
}
