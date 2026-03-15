import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import {
  createAuthToken,
  getDefaultPathForRole,
  getSafeRedirectPath,
  type AuthRole,
  type AuthSession,
  verifyAuthToken
} from "@/lib/auth";
import { buildMagicLinkEmail, sendEmail } from "@/lib/emailSender";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { weddingConfig } from "@/lib/config";

interface DemoMagicAccount {
  id: string;
  email: string;
  password: string;
  role: AuthRole;
}

interface MagicLinkSessionResult {
  session: Omit<AuthSession, "expiresAt">;
  redirectTo: string;
}

interface FamilyUserShape {
  id: string;
  email: string;
  role: AuthRole;
}

const MAGIC_LINK_EXPIRES_MINUTES = 20;

// ─────────────────────────────────────────────────────────────────────────────
// Demo / fallback accounts — mirrors lib/auth.ts getAccounts().
// Used when Supabase is not configured or the family_users table is empty.
// In production the passwords come from env and are never the empty string.
// ─────────────────────────────────────────────────────────────────────────────
const demoAccounts: DemoMagicAccount[] = [
  {
    id: "demo-family-user",
    email: env.FAMILY_LOGIN_EMAIL.toLowerCase(),
    password: env.FAMILY_LOGIN_PASSWORD ?? "",
    role: "family"
  },
  {
    id: "demo-admin-user",
    email: env.ADMIN_LOGIN_EMAIL.toLowerCase(),
    password: env.ADMIN_LOGIN_PASSWORD ?? "",
    role: "admin"
  }
];

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function buildMagicLinkUrl(params: URLSearchParams) {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  return `${siteUrl}/api/auth/magic-link?${params.toString()}`;
}

/**
 * Build a /vault/[token] URL — the user-facing family access link.
 * More memorable and luxury-feeling than the raw API URL.
 * The /vault/[token] page redirects to /api/auth/magic-link internally.
 */
export function buildVaultUrl(rawToken: string, redirectTo = "/family") {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const params = redirectTo !== "/family" ? `?redirect=${encodeURIComponent(redirectTo)}` : "";
  return `${siteUrl}/vault/${encodeURIComponent(rawToken)}${params}`;
}

function normalizeSession(user: FamilyUserShape | DemoMagicAccount) {
  return {
    userId: user.id,
    email: user.email.toLowerCase(),
    role: user.role
  } satisfies Omit<AuthSession, "expiresAt">;
}

// ─────────────────────────────────────────────────────────────────────────────
// dispatchMagicLinkEmail
// Builds the HTML email and calls sendEmail(). Errors are logged but NOT
// re-thrown — a delivery failure must not reveal whether the address exists.
// The caller (route.ts POST) already returns the same response either way.
// ─────────────────────────────────────────────────────────────────────────────
async function dispatchMagicLinkEmail(
  recipientEmail: string,
  magicLink: string
): Promise<void> {
  const emailPayload = buildMagicLinkEmail({
    magicLink,
    recipientEmail,
    expiresInMinutes: MAGIC_LINK_EXPIRES_MINUTES,
    celebrationTitle: weddingConfig.celebrationTitle
  });

  const result = await sendEmail({ to: recipientEmail, ...emailPayload });

  if (!result.success) {
    // Log internally but never surface to caller — prevents email enumeration
    // through response timing or error messages.
    console.error(
      `[magicLink] Email delivery failed for ${recipientEmail}: ${result.error ?? "unknown error"}`
    );
  }
}

export async function issueFamilyMagicLink(email: string, redirectTo?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const safeRedirect = getSafeRedirectPath(redirectTo, "/family");
  const client = getConfiguredSupabaseClient(true);

  if (client) {
    const { data: user, error } = await client
      .from("family_users")
      .select("id, email, role")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      if (!shouldFallbackToDemoData(error)) {
        throw new Error(error.message);
      }
    } else if (user) {
      const rawToken =
        crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      const tokenHash = sha256(rawToken);

      const insertResult = await client.from("family_magic_links").insert({
        id: crypto.randomUUID(),
        family_user_id: user.id,
        email: user.email.toLowerCase(),
        token_hash: tokenHash,
        redirect_to: safeRedirect,
        expires_at: new Date(
          Date.now() + MAGIC_LINK_EXPIRES_MINUTES * 60 * 1000
        ).toISOString(),
        created_at: new Date().toISOString()
      });

      if (insertResult.error) {
        if (!shouldFallbackToDemoData(insertResult.error)) {
          throw new Error(insertResult.error.message);
        }
      } else {
        // ── Phase 4.3: deliver the link via email ─────────────────────────
        // Use the /vault/[token] URL — a luxury-feeling, memorable link that
        // family members can tap directly without seeing the raw API endpoint.
        const link = buildVaultUrl(rawToken, safeRedirect);

        // The link is intentionally NOT returned to the caller here — it must
        // only travel through the email channel.
        await dispatchMagicLinkEmail(normalizedEmail, link);
        return; // undefined — caller discards the return value
      }
    }
  }

  // ── Demo / fallback path ─────────────────────────────────────────────────
  // In demo mode (no Supabase or user not in DB) we generate a direct session
  // token and embed it in the link. In production with a real email provider
  // this path only fires for the two pre-configured demo accounts.
  const demoAccount = demoAccounts.find((account) => account.email === normalizedEmail);

  if (!demoAccount) {
    // Unknown email — return silently (prevents enumeration)
    return;
  }

  const directSessionToken = await createAuthToken(normalizeSession(demoAccount));
  const params = new URLSearchParams({
    session: directSessionToken,
    redirect: safeRedirect
  });
  const link = buildMagicLinkUrl(params);

  // Send to demo account too — works in dev (logs to console), works in
  // production if RESEND_API_KEY is set.
  await dispatchMagicLinkEmail(normalizedEmail, link);
}

export async function authenticateInviteAccessCode(code: string) {
  const normalizedCode = code.trim();
  if (!normalizedCode) {
    return null;
  }

  const demoAccount = demoAccounts.find(
    (account) => account.password.toLowerCase() === normalizedCode.toLowerCase()
  );

  if (demoAccount) {
    return normalizeSession(demoAccount);
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return null;
  }

  const codeHash = sha256(normalizedCode);

  const { data, error } = await client
    .from("invite_access_codes")
    .select("family_user_id, email, role, expires_at")
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return null;
    }

    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return null;
  }

  let user: FamilyUserShape | null = null;

  if (data.family_user_id) {
    const userResult = await client
      .from("family_users")
      .select("id, email, role")
      .eq("id", data.family_user_id)
      .maybeSingle();

    if (userResult.error) {
      if (!shouldFallbackToDemoData(userResult.error)) {
        throw new Error(userResult.error.message);
      }
    } else {
      user = userResult.data as FamilyUserShape | null;
    }
  } else if (data.email) {
    const userResult = await client
      .from("family_users")
      .select("id, email, role")
      .eq("email", data.email.toLowerCase())
      .maybeSingle();

    if (userResult.error) {
      if (!shouldFallbackToDemoData(userResult.error)) {
        throw new Error(userResult.error.message);
      }
    } else {
      user = userResult.data as FamilyUserShape | null;
    }
  }

  if (!user && data.email && data.role) {
    user = {
      id: `access-${codeHash.slice(0, 12)}`,
      email: data.email.toLowerCase(),
      role: data.role === "admin" ? "admin" : "family"
    };
  }

  return user ? normalizeSession(user) : null;
}

export async function resolveMagicLinkQuery(
  params: URLSearchParams
): Promise<MagicLinkSessionResult | null> {
  const redirectTo = getSafeRedirectPath(params.get("redirect"), "/family");
  const directSession = params.get("session");

  if (directSession) {
    const verified = await verifyAuthToken(directSession);

    if (!verified) {
      return null;
    }

    return {
      session: {
        userId: verified.userId,
        email: verified.email,
        role: verified.role
      },
      redirectTo: getSafeRedirectPath(redirectTo, getDefaultPathForRole(verified.role))
    };
  }

  const token = params.get("token");
  if (!token) {
    return null;
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return null;
  }

  const tokenHash = sha256(token);

  const { data, error } = await client
    .from("family_magic_links")
    .select("id, family_user_id, email, redirect_to, expires_at, consumed_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return null;
    }

    throw new Error(error.message);
  }

  if (!data || data.consumed_at) {
    return null;
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return null;
  }

  const userResult = await client
    .from("family_users")
    .select("id, email, role")
    .eq("id", data.family_user_id)
    .maybeSingle();

  if (userResult.error) {
    if (shouldFallbackToDemoData(userResult.error)) {
      return null;
    }

    throw new Error(userResult.error.message);
  }

  if (!userResult.data) {
    return null;
  }

  const updateResult = await client
    .from("family_magic_links")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", data.id);

  if (updateResult.error) {
    if (!shouldFallbackToDemoData(updateResult.error)) {
      throw new Error(updateResult.error.message);
    }
  }

  const session = normalizeSession(userResult.data as FamilyUserShape);

  return {
    session,
    redirectTo: getSafeRedirectPath(
      data.redirect_to,
      getDefaultPathForRole(session.role)
    )
  };
}
