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

const HASH_PREFIX     = "pbkdf2_sha256";
const HASH_ITERATIONS = 120000;
const HASH_KEY_BITS   = 256;

export const AUTH_COOKIE_NAME = "surihana_session";
export const SESSION_MAX_AGE  = 60 * 60 * 10; // 10 hours
export const LOGIN_PATH        = "/login";

const encoder = new TextEncoder();

// ─────────────────────────────────────────────────────────────────────────────
// Auth secret
// ─────────────────────────────────────────────────────────────────────────────
function getAuthSecret(): string {
  if (!env.AUTH_SECRET) {
    if (isProduction()) {
      throw new Error("[surihana] AUTH_SECRET is not set in production.");
    }
    console.warn("[surihana] AUTH_SECRET not set — using empty key for local dev.");
    return "";
  }
  return env.AUTH_SECRET;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback demo accounts (only used when Supabase is not configured OR
// the family_users table has no matching user)
// ─────────────────────────────────────────────────────────────────────────────
function getDemoAccounts() {
  const accounts = [];
  if (env.FAMILY_LOGIN_EMAIL && env.FAMILY_LOGIN_PASSWORD) {
    accounts.push({
      id:       "demo-family-user",
      email:    env.FAMILY_LOGIN_EMAIL.toLowerCase(),
      password: env.FAMILY_LOGIN_PASSWORD,
      role:     "family" as AuthRole,
    });
  }
  if (env.ADMIN_LOGIN_EMAIL && env.ADMIN_LOGIN_PASSWORD) {
    accounts.push({
      id:       "demo-admin-user",
      email:    env.ADMIN_LOGIN_EMAIL.toLowerCase(),
      password: env.ADMIN_LOGIN_PASSWORD,
      role:     "admin" as AuthRole,
    });
  }
  return accounts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Crypto helpers
// ─────────────────────────────────────────────────────────────────────────────
async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(value: string) {
  const pairs = value.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((p) => parseInt(p, 16)));
}

function constantTimeEqual(a: string, b: string) {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const max = Math.max(aBytes.length, bBytes.length);
  let result = aBytes.length === bBytes.length ? 0 : 1;
  for (let i = 0; i < max; i++) {
    result |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return result === 0;
}

async function signPayload(payload: string): Promise<string> {
  const key = await getSigningKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(sig);
}

async function derivePasswordHash(password: string, saltHex: string, iterations: number) {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromHex(saltHex), iterations },
    key,
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

// ─────────────────────────────────────────────────────────────────────────────
// Database lookups
// ─────────────────────────────────────────────────────────────────────────────
async function findFamilyUserByEmail(email: string): Promise<FamilyUserRow | null> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return null;

  const { data, error } = await client
    .from("family_users")
    .select("id, email, role, password_hash, created_at")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) return null;
    throw new Error(error.message);
  }
  return (data ?? null) as FamilyUserRow | null;
}

async function findFamilyUserById(id: string): Promise<FamilyUserRow | null> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return null;

  const { data, error } = await client
    .from("family_users")
    .select("id, email, role, password_hash, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) return null;
    throw new Error(error.message);
  }
  return (data ?? null) as FamilyUserRow | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session validation
// ─────────────────────────────────────────────────────────────────────────────
async function validateSessionAgainstDataStore(session: AuthSession): Promise<AuthSession | null> {
  // Try to verify against real DB user first
  const dbUser = await findFamilyUserById(session.userId);

  if (dbUser) {
    const role = normalizeRole(dbUser.role);
    if (!role) return null;
    if (dbUser.email.toLowerCase() !== session.email.toLowerCase()) return null;
    if (role !== session.role) return null;
    return { ...session, email: dbUser.email.toLowerCase(), role };
  }

  // Fall back to demo accounts
  const demo = getDemoAccounts().find(
    (a) => a.id === session.userId &&
           a.email === session.email.toLowerCase() &&
           a.role === session.role
  );
  return demo ? session : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = createSaltHex();
  const hash = await derivePasswordHash(password, salt, HASH_ITERATIONS);
  return `${HASH_PREFIX}$${HASH_ITERATIONS}$${salt}$${hash}`;
}

export async function verifyPasswordHash(password: string, storedHash?: string | null): Promise<boolean> {
  if (!storedHash) return false;

  const parts = storedHash.split("$");
  const [prefix, iterStr, saltHex, expectedHash] = parts;

  if (prefix !== HASH_PREFIX || !iterStr || !saltHex || !expectedHash) return false;

  const iterations = parseInt(iterStr, 10);
  if (!Number.isFinite(iterations)) return false;

  const actualHash = await derivePasswordHash(password, saltHex, iterations);
  return constantTimeEqual(actualHash, expectedHash);
}

export async function createAuthToken(
  session: Omit<AuthSession, "expiresAt"> & { expiresAt?: number }
): Promise<string> {
  const expiresAt = session.expiresAt ?? Date.now() + SESSION_MAX_AGE * 1000;
  const payload   = encodeURIComponent(JSON.stringify({ ...session, expiresAt }));
  const signature = await signPayload(payload);
  // Use "|" as separator instead of "." to avoid confusion with dots in email
  return `${payload}|${signature}`;
}

export async function verifyAuthToken(token?: string | null): Promise<AuthSession | null> {
  if (!token) return null;

  // Support both "|" separator (new) and "." last-dot (old/migration)
  let payload: string;
  let signature: string;

  const pipeIdx = token.indexOf("|");
  if (pipeIdx !== -1) {
    // New format: payload|signature
    payload   = token.slice(0, pipeIdx);
    signature = token.slice(pipeIdx + 1);
  } else {
    // Legacy format: split on last dot
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return null;
    payload   = token.slice(0, lastDot);
    signature = token.slice(lastDot + 1);
  }

  if (!payload || !signature) return null;

  const expectedSignature = await signPayload(payload);
  if (!constantTimeEqual(signature, expectedSignature)) return null;

  try {
    const session = JSON.parse(decodeURIComponent(payload)) as AuthSession;
    if (session.expiresAt < Date.now()) return null;
    if (!session.userId) return null;
    if (session.role !== "family" && session.role !== "admin") return null;
    return session;
  } catch {
    return null;
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ userId: string; email: string; role: AuthRole } | null> {
  const normalizedEmail    = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  // 1. Try database user with hashed password
  const dbUser = await findFamilyUserByEmail(normalizedEmail);
  if (dbUser) {
    if (!dbUser.password_hash) {
      // User exists but no password set — deny login
      console.warn(`[auth] User ${normalizedEmail} has no password_hash set.`);
      return null;
    }
    const role = normalizeRole(dbUser.role);
    if (!role) return null;

    const valid = await verifyPasswordHash(normalizedPassword, dbUser.password_hash);
    if (!valid) return null;

    return { userId: dbUser.id, email: dbUser.email.toLowerCase(), role };
  }

  // 2. Fall back to demo/env accounts (plain text password comparison)
  const demo = getDemoAccounts().find(
    (a) => a.email === normalizedEmail && a.password === normalizedPassword
  );
  if (demo) {
    return { userId: demo.id, email: demo.email, role: demo.role };
  }

  return null;
}

export async function getSessionFromRequest(request: NextRequest): Promise<AuthSession | null> {
  const token   = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifyAuthToken(token);
  return session ? validateSessionAgainstDataStore(session) : null;
}

export async function getSessionFromCookieStore(
  cookieStore: Pick<ReadonlyRequestCookies, "get">
): Promise<AuthSession | null> {
  const token   = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifyAuthToken(token);
  return session ? validateSessionAgainstDataStore(session) : null;
}

export async function getAuthorizedSessionFromRequest(
  request: NextRequest,
  path = request.nextUrl.pathname
): Promise<AuthSession | null> {
  const session = await getSessionFromRequest(request);
  if (!session || !roleCanAccess(session.role, path)) return null;
  return session;
}

export function getDefaultPathForRole(role: AuthRole): string {
  return role === "admin" ? "/admin" : "/family";
}

export function getSafeRedirectPath(value?: string | null, fallback = "/family"): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed === LOGIN_PATH || trimmed.startsWith(`${LOGIN_PATH}?`) || trimmed.startsWith(`${LOGIN_PATH}/`)) {
    return fallback;
  }
  return trimmed;
}

export function getPostLoginRedirect(
  session: Pick<AuthSession, "role">,
  requestedPath?: string | null
): string {
  const safePath = getSafeRedirectPath(requestedPath, getDefaultPathForRole(session.role));
  if (!roleCanAccess(session.role, safePath)) return getDefaultPathForRole(session.role);
  return safePath;
}

export function roleCanAccess(role: AuthRole, path: string): boolean {
  if (path.startsWith("/api/admin") || path.startsWith("/admin")) {
    return role === "admin";
  }
  if (path.startsWith("/family")) {
    return role === "family" || role === "admin";
  }
  return true;
}
