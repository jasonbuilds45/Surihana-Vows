// ─────────────────────────────────────────────────────────────────────────────
// lib/env.ts — Environment variable management
// ─────────────────────────────────────────────────────────────────────────────

const requiredInProduction = ["AUTH_SECRET"] as const;

const supabasePublicKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value : "";
}

export const env = {
  NODE_ENV:                    readEnv("NODE_ENV") || "development",
  NEXT_PUBLIC_SUPABASE_URL:    readEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY:   readEnv("SUPABASE_SERVICE_ROLE_KEY"),
  NEXT_PUBLIC_SITE_URL:        readEnv("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000",
  NEXT_PUBLIC_LIVESTREAM_URL:  readEnv("NEXT_PUBLIC_LIVESTREAM_URL"),
  AUTH_SECRET:                 readEnv("AUTH_SECRET"),
  FAMILY_LOGIN_EMAIL:          readEnv("FAMILY_LOGIN_EMAIL"),
  FAMILY_LOGIN_PASSWORD:       readEnv("FAMILY_LOGIN_PASSWORD"),
  ADMIN_LOGIN_EMAIL:           readEnv("ADMIN_LOGIN_EMAIL"),
  ADMIN_LOGIN_PASSWORD:        readEnv("ADMIN_LOGIN_PASSWORD"),
} as const;

export function isProduction() {
  return env.NODE_ENV === "production";
}

export function isSupabaseEnvConfigured() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasSupabaseServiceRoleKey() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getMissingEnvironmentVariables() {
  const missing: string[] = [];

  if (isProduction()) {
    for (const key of requiredInProduction) {
      if (!env[key]) missing.push(key);
    }
  } else {
    if (!env.AUTH_SECRET) missing.push("AUTH_SECRET");
  }

  const hasSome = supabasePublicKeys.some((k) => Boolean(env[k]));
  const hasAll  = supabasePublicKeys.every((k) => Boolean(env[k]));
  if (hasSome && !hasAll) {
    missing.push(...supabasePublicKeys.filter((k) => !env[k]));
  }

  return Array.from(new Set(missing));
}

export function validateEnvironment() {
  const missing = getMissingEnvironmentVariables();

  if (missing.length > 0) {
    if (isProduction()) {
      throw new Error(
        `[surihana] Missing required environment variables: ${missing.join(", ")}. ` +
        "See .env.example for the full list of required variables."
      );
    }
    console.warn(`[surihana] Missing optional environment variables: ${missing.join(", ")}`);
  }
}
