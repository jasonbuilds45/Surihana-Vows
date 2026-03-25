import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE,
  createAuthToken,
  hashPassword,
} from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

export const runtime = "nodejs";

// POST /api/auth/signup
// Creates a new family_users row with a hashed password, then immediately
// signs the user in (sets the session cookie) and redirects to /family.
export async function POST(request: NextRequest) {
  try {
    const formData  = await request.formData();
    const email     = String(formData.get("email")     ?? "").trim().toLowerCase();
    const password  = String(formData.get("password")  ?? "").trim();
    const password2 = String(formData.get("password2") ?? "").trim();
    const redirect  = String(formData.get("redirect")  ?? "/family");

    const fail = (reason: string) =>
      NextResponse.redirect(
        new URL(`/login?tab=signup&error=${encodeURIComponent(reason)}`, request.url),
        303
      );

    if (!email || !email.includes("@")) return fail("invalid-email");
    if (password.length < 8)            return fail("weak-password");
    if (password !== password2)         return fail("password-mismatch");

    const client = getConfiguredSupabaseClient(true);

    // Demo mode — no Supabase configured
    if (!client) return fail("no-supabase");

    // Check for existing user
    const { data: existing } = await client
      .from("family_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) return fail("email-taken");

    const passwordHash = await hashPassword(password);
    const userId       = crypto.randomUUID();

    const { error } = await client.from("family_users").insert({
      id:            userId,
      email,
      role:          "family",
      password_hash: passwordHash,
      created_at:    new Date().toISOString(),
    });

    if (error) {
      if (shouldFallbackToDemoData(error)) return fail("no-supabase");
      console.error("[auth/signup]", error.message);
      return fail("server-error");
    }

    // Auto-sign-in after successful registration
    const token = await createAuthToken({ userId, email, role: "family" });

    const dest = new URL(redirect.startsWith("/") ? redirect : "/family", request.url);
    dest.searchParams.set("_t", token);
    const response = NextResponse.redirect(dest, 303);
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: false,
      maxAge:   SESSION_MAX_AGE,
      path:     "/",
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
    });
    return response;
  } catch (err) {
    console.error("[auth/signup] Unexpected error:", err);
    return NextResponse.redirect(
      new URL("/login?tab=signup&error=server-error", request.url),
      303
    );
  }
}
