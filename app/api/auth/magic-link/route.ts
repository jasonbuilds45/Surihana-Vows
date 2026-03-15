import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE, createAuthToken } from "@/lib/auth";
import { issueFamilyMagicLink, resolveMagicLinkQuery } from "@/lib/magicLink";

function readBodyValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/magic-link
// Issues a magic link for the given email address and delivers it via email
// (lib/emailSender.ts → Resend). The link is never returned in this response.
//
// Security: the response is always identical regardless of whether the email
// is registered — this prevents email enumeration. Email delivery failures
// are logged server-side only.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let email = "";
    let redirectTo = "/family";

    if (contentType.includes("application/json")) {
      const payload = (await request.json()) as Record<string, unknown>;
      email = String(payload.email ?? "");
      redirectTo = String(payload.redirectTo ?? "/family");
    } else {
      const formData = await request.formData();
      email = readBodyValue(formData.get("email"));
      redirectTo = readBodyValue(formData.get("redirectTo")) || "/family";
    }

    // Issue the token, store the hash in DB, and dispatch the email.
    // Return value is intentionally void — the link only travels via email.
    await issueFamilyMagicLink(email, redirectTo);

    // Always return the same message. Do not hint whether the email exists.
    return NextResponse.json({
      success: true,
      message: "If that email address is registered, a sign-in link has been sent."
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process magic link request."
      },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/magic-link?token=...&redirect=...
// Validates the token, marks it consumed, and sets a session cookie.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const result = await resolveMagicLinkQuery(request.nextUrl.searchParams);

    if (!result) {
      return NextResponse.redirect(new URL("/login?error=magic-link", request.url));
    }

    const token = await createAuthToken(result.session);
    const response = NextResponse.redirect(new URL(result.redirectTo, request.url));
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return response;
  } catch (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          error instanceof Error ? error.message : "magic-link"
        )}`,
        request.url
      )
    );
  }
}
