import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { NextRequest } from "next/server";
import { env, isProduction } from "@/lib/env";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { FamilyUserRow } from "@/lib/types";

export type AuthRole = "family" | "admin";

export interface AuthSession {
  userId: string;
  email: string;
  role: AuthRole;
  expiresAt: number;
}

interface DemoAccount {
  id: string;
  email: string;
  password: string;
  role: AuthRole;
}

const HASH_PREFIX = "pbkdf2_sha256";
const HASH_ITERATIONS = 120000;
const HASH_KEY_BITS = 256;

export const AUTH_COOKIE_NAME = "surihana_session";
export const SESSION_MAX_AGE = 60 * 60 * 10;
export const LOGIN_PATH = "/login";

const encoder = new TextEncoder();

// ─────────────────────────────────────────────────────────────────────────────
// Auth secret — NO hardcoded fallback. In development, an empty AUTH_SECRET
// produces a warning and uses an empty-string key (sessions are non-persistent
// across restarts, which is acceptable for local dev). In production,
// validateEnvironment() will have already thrown if AUTH_SECRET is missing or
// matches a known insecure default.
// ─────────────────────────────────────────────────────────────────────────────
function getAuthSecret(): string {
  if (!env.AUTH_SECRET) {
    if (isProduction()) {
      // This should never be reached because validateEnvironment() runs first,
      // but we guard here as a last line of defence.
      throw new Error(
        "[surihana] AUTH_SECRET is not set. Sessions cannot be signed in production."
      );
    }
    console.warn(
      "[surihana] AUTH_SECRET is not set. Using an empty key for local development. " +
      "Sessions will not survive server restarts. Set AUTH_SECRET in .env.local."
    );
    return "";
  }
  return env.AUTH_SECRET;
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo / fallback accounts — only used when Supabase is not configured or the
// family_users table is empty. These accounts are disabled in production when
// FAMILY_LOGIN_PASSWORD / ADMIN_LOGIN_PASSWORD are not set (env returns "").
// ─────────────────────────────────────────────────────────────────────────────
function getAccounts(): DemoAccount[] {
  const familyPassword = env.FAMILY_LOGIN_PASSWORD ?? "";
  const adminPassword = env.ADMIN_LOGIN_PASSWORD ?? "";

  // Do not expose demo accounts in production if passwords are not configured
  if (isProduction() && (!familyPassword || !adminPassword)) {
    return [];
  }

  return [
    {
      id: "demo-family-user",
      email: env.FAMILY_LOGIN_EMAIL.toLowerCase(),
      password: familyPassword,
      role: "family"
    },
    {
      id: "demo-admin-user",
      email: env.ADMIN_LOGIN_EMAIL.toLowerCase(),
      password: adminPassword,
      role: "admin"
    }
  ];
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(value: string) {
  const pairs = value.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((pair) => Number.parseInt(pair, 16)));
}

function constantTimeEqual(left: string, right: string) {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const max = Math.max(leftBytes.length, rightBytes.length);
  let result = leftBytes.length === rightBytes.length ? 0 : 1;

  for (let index = 0; index < max; index += 1) {
    result |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return result === 0;
}

async function signPayload(payload: string) {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(signature);
}

async function derivePasswordHash(password: string, saltHex: string, iterations: number) {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromHex(saltHex),
      iterations
    },
    passwordKey,
    HASH_KEY_BITS
  );

  return toHex(bits);
}

function createSaltHex(length = 16) {
  const salt = new Uint8Array(length);
  crypto.getRandomValues(salt);
  return toHex(salt.buffer);
}

function normalizeRole(role: string | null | undefined): AuthRole | null {
  return role === "admin" || role === "family" ? role : null;
}

async function findFamilyUserByEmail(email: string): Promise<FamilyUserRow | null> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("family_users")
    .select("id, email, role, password_hash, created_at")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return null;
    }

    throw new Error(error.message);
  }

  return (data ?? null) as FamilyUserRow | null;
}

async function findFamilyUserById(id: string): Promise<FamilyUserRow | null> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("family_users")
    .select("id, email, role, password_hash, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return null;
    }

    throw new Error(error.message);
  }

  return (data ?? null) as FamilyUserRow | null;
}

async function validateSessionAgainstDataStore(session: AuthSession) {
  const databaseUser = await findFamilyUserById(session.userId);

  if (databaseUser) {
    const role = normalizeRole(databaseUser.role);
    if (!role || databaseUser.email.toLowerCase() !== session.email.toLowerCase() || role !== session.role) {
      return null;
    }

    return {
      ...session,
      email: databaseUser.email.toLowerCase(),
      role
    };
  }

  const demoAccount = getAccounts().find(
    (account) =>
      account.id === session.userId &&
      account.email === session.email &&
      account.role === session.role
  );

  return demoAccount ? session : null;
}

export async function hashPassword(password: string) {
  const salt = createSaltHex();
  const hash = await derivePasswordHash(password, salt, HASH_ITERATIONS);
  return `${HASH_PREFIX}$${HASH_ITERATIONS}$${salt}$${hash}`;
}

export async function verifyPasswordHash(password: string, storedHash?: string | null) {
  if (!storedHash) {
    return false;
  }

  const [prefix, iterationsText, saltHex, expectedHash] = storedHash.split("$");
  if (prefix !== HASH_PREFIX || !iterationsText || !saltHex || !expectedHash) {
    return false;
  }

  const iterations = Number.parseInt(iterationsText, 10);
  if (!Number.isFinite(iterations)) {
    return false;
  }

  const actualHash = await derivePasswordHash(password, saltHex, iterations);
  return constantTimeEqual(actualHash, expectedHash);
}

export async function createAuthToken(session: Omit<AuthSession, "expiresAt"> & { expiresAt?: number }) {
  const expiresAt = session.expiresAt ?? Date.now() + SESSION_MAX_AGE * 1000;
  const payload = encodeURIComponent(JSON.stringify({ ...session, expiresAt }));
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

export async function verifyAuthToken(token?: string | null): Promise<AuthSession | null> {
  if (!token) {
    return null;
  }

  // Split on the LAST dot only — the payload may contain dots (e.g. email addresses)
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) {
    return null;
  }

  const payload   = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);

  if (!payload || !signature) {
    return null;
  }
  const expectedSignature = await signPayload(payload);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const session = JSON.parse(decodeURIComponent(payload)) as AuthSession;
    if (session.expiresAt < Date.now()) {
      return null;
    }

    if (!session.userId || (session.role !== "family" && session.role !== "admin")) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const databaseUser = await findFamilyUserByEmail(normalizedEmail);

  if (databaseUser?.password_hash) {
    const role = normalizeRole(databaseUser.role);
    if (!role) {
      return null;
    }

    const isValid = await verifyPasswordHash(normalizedPassword, databaseUser.password_hash);
    if (!isValid) {
      return null;
    }

    return {
      userId: databaseUser.id,
      email: databaseUser.email.toLowerCase(),
      role
    };
  }

  const demoAccount = getAccounts().find(
    (candidate) =>
      candidate.email === normalizedEmail &&
      candidate.password === normalizedPassword
  );

  if (!demoAccount) {
    return null;
  }

  return {
    userId: demoAccount.id,
    email: demoAccount.email,
    role: demoAccount.role
  };
}

export async function getSessionFromRequest(request: NextRequest) {
  const session = await verifyAuthToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  return session ? validateSessionAgainstDataStore(session) : null;
}

export async function getSessionFromCookieStore(cookieStore: Pick<ReadonlyRequestCookies, "get">) {
  const session = await verifyAuthToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  return session ? validateSessionAgainstDataStore(session) : null;
}

export async function getAuthorizedSessionFromRequest(request: NextRequest, path = request.nextUrl.pathname) {
  const session = await getSessionFromRequest(request);
  if (!session || !roleCanAccess(session.role, path)) {
    return null;
  }

  return session;
}

export function getDefaultPathForRole(role: AuthRole) {
  return role === "admin" ? "/admin" : "/family";
}

export function getSafeRedirectPath(value?: string | null, fallback = "/family") {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed === LOGIN_PATH || trimmed.startsWith(`${LOGIN_PATH}?`) || trimmed.startsWith(`${LOGIN_PATH}/`)) {
    return fallback;
  }

  return trimmed;
}

export function getPostLoginRedirect(
  session: Pick<AuthSession, "role">,
  requestedPath?: string | null
) {
  const safePath = getSafeRedirectPath(requestedPath, getDefaultPathForRole(session.role));

  if (!roleCanAccess(session.role, safePath)) {
    return getDefaultPathForRole(session.role);
  }

  return safePath;
}

export function roleCanAccess(role: AuthRole, path: string) {
  if (path.startsWith("/api/admin") || path.startsWith("/admin")) {
    return role === "admin";
  }

  if (path.startsWith("/family")) {
    return role === "family" || role === "admin";
  }

  return true;
}
