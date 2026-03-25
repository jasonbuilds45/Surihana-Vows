import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import {
  getDefaultPathForRole,
  getSafeRedirectPath,
  hashPassword,
  type AuthRole,
  type AuthSession,
} from "@/lib/auth";
import { buildFamilySignupEmail, sendEmail } from "@/lib/emailSender";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

const FAMILY_SIGNUP_EXPIRES_HOURS = 72;

interface FamilySignupUser {
  id: string;
  email: string;
  role: AuthRole;
  password_hash: string | null;
}

interface SignupInviteRow {
  id: string;
  email: string | null;
  role: AuthRole | null;
  family_user_id: string | null;
  expires_at: string | null;
}

export interface FamilySignupInviteState {
  status: "ready" | "claimed" | "expired" | "invalid";
  email?: string;
  role?: AuthRole;
  destination?: string;
}

export interface FamilySignupCompletion extends FamilySignupInviteState {
  session?: Omit<AuthSession, "expiresAt">;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function buildRawInviteToken() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

function getPostSignupDestination(role: AuthRole) {
  return getSafeRedirectPath(getDefaultPathForRole(role), "/family");
}

export function buildFamilySignupUrl(rawToken: string) {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  return `${siteUrl}/family/signup/${encodeURIComponent(rawToken)}`;
}

async function findFamilyUserByEmail(email: string): Promise<FamilySignupUser | null> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return null;

  const { data, error } = await client
    .from("family_users")
    .select("id, email, role, password_hash")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) return null;
    throw new Error(error.message);
  }

  return (data ?? null) as FamilySignupUser | null;
}

async function findInviteRow(rawToken: string): Promise<SignupInviteRow | null> {
  const normalizedToken = rawToken.trim();
  if (!normalizedToken) return null;

  const client = getConfiguredSupabaseClient(true);
  if (!client) return null;

  const { data, error } = await client
    .from("invite_access_codes")
    .select("id, email, role, family_user_id, expires_at")
    .eq("code_hash", sha256(normalizedToken))
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) return null;
    throw new Error(error.message);
  }

  return (data ?? null) as SignupInviteRow | null;
}

async function dispatchFamilySignupInviteEmail(
  recipientEmail: string,
  signupLink: string
) {
  const result = await sendEmail({
    to: recipientEmail,
    ...buildFamilySignupEmail({
      signupLink,
      recipientEmail,
      expiresInHours: FAMILY_SIGNUP_EXPIRES_HOURS,
    }),
  });

  if (!result.success) {
    console.error(
      `[family-signup] Email delivery failed for ${recipientEmail}: ${result.error ?? "unknown error"}`
    );
  }
}

export async function issueFamilySignupInvite(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return;

  const client = getConfiguredSupabaseClient(true);
  if (!client) return;

  const user = await findFamilyUserByEmail(normalizedEmail);
  if (!user) return;

  const rawToken = buildRawInviteToken();
  const { error } = await client.from("invite_access_codes").insert({
    id: crypto.randomUUID(),
    code_hash: sha256(rawToken),
    family_user_id: null,
    email: user.email.toLowerCase(),
    role: null,
    expires_at: new Date(
      Date.now() + FAMILY_SIGNUP_EXPIRES_HOURS * 60 * 60 * 1000
    ).toISOString(),
    created_at: new Date().toISOString(),
  });

  if (error) {
    if (shouldFallbackToDemoData(error)) return;
    throw new Error(error.message);
  }

  await dispatchFamilySignupInviteEmail(
    user.email.toLowerCase(),
    buildFamilySignupUrl(rawToken)
  );
}

export async function getFamilySignupInviteState(
  rawToken: string
): Promise<FamilySignupInviteState> {
  const invite = await findInviteRow(rawToken);

  if (!invite || !invite.email || invite.role !== null || invite.family_user_id !== null) {
    return { status: "invalid" };
  }

  const user = await findFamilyUserByEmail(invite.email);
  if (!user) {
    return { status: "invalid" };
  }

  const destination = getPostSignupDestination(user.role);

  if (user.password_hash) {
    return {
      status: "claimed",
      email: user.email.toLowerCase(),
      role: user.role,
      destination,
    };
  }

  if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
    return {
      status: "expired",
      email: user.email.toLowerCase(),
      role: user.role,
      destination,
    };
  }

  return {
    status: "ready",
    email: user.email.toLowerCase(),
    role: user.role,
    destination,
  };
}

export async function completeFamilySignupInvite(
  rawToken: string,
  password: string
): Promise<FamilySignupCompletion> {
  const invite = await findInviteRow(rawToken);

  if (!invite || !invite.email || invite.role !== null || invite.family_user_id !== null) {
    return { status: "invalid" };
  }

  const user = await findFamilyUserByEmail(invite.email);
  if (!user) {
    return { status: "invalid" };
  }

  const destination = getPostSignupDestination(user.role);

  if (user.password_hash) {
    return {
      status: "claimed",
      email: user.email.toLowerCase(),
      role: user.role,
      destination,
    };
  }

  if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
    return {
      status: "expired",
      email: user.email.toLowerCase(),
      role: user.role,
      destination,
    };
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return { status: "invalid" };
  }

  const passwordHash = await hashPassword(password);
  const nowIso = new Date().toISOString();

  const updateUserResult = await client
    .from("family_users")
    .update({ password_hash: passwordHash })
    .eq("id", user.id);

  if (updateUserResult.error) {
    if (!shouldFallbackToDemoData(updateUserResult.error)) {
      throw new Error(updateUserResult.error.message);
    }
    return { status: "invalid" };
  }

  const expireInviteResult = await client
    .from("invite_access_codes")
    .update({ expires_at: nowIso })
    .eq("id", invite.id);

  if (expireInviteResult.error && !shouldFallbackToDemoData(expireInviteResult.error)) {
    throw new Error(expireInviteResult.error.message);
  }

  return {
    status: "ready",
    email: user.email.toLowerCase(),
    role: user.role,
    destination,
    session: {
      userId: user.id,
      email: user.email.toLowerCase(),
      role: user.role,
    },
  };
}
