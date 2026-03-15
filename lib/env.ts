// ─────────────────────────────────────────────────────────────────────────────
// Known insecure default values that must not be used in production.
// If any of these are detected in a production environment, startup is aborted.
// ─────────────────────────────────────────────────────────────────────────────
const INSECURE_DEFAULTS = [
  "surihana-vows-demo-secret",
  "familyvault",
  "adminvault",
  "REPLACE_WITH_A_SECURE_RANDOM_64_CHAR_HEX_STRING",
  "REPLACE_WITH_A_STRONG_UNIQUE_PASSWORD"
] as const;

const requiredInProduction = [
  "AUTH_SECRET",
  "FAMILY_LOGIN_EMAIL",
  "FAMILY_LOGIN_PASSWORD",
  "ADMIN_LOGIN_EMAIL",
  "ADMIN_LOGIN_PASSWORD"
] as const;

const supabasePublicKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value : "";
}

export const env = {
  NODE_ENV: readEnv("NODE_ENV") || "development",
  NEXT_PUBLIC_SUPABASE_URL: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
  NEXT_PUBLIC_SITE_URL: readEnv("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000",
  NEXT_PUBLIC_LIVESTREAM_URL: readEnv("NEXT_PUBLIC_LIVESTREAM_URL"),
  AUTH_SECRET: readEnv("AUTH_SECRET"),
  FAMILY_LOGIN_EMAIL: readEnv("FAMILY_LOGIN_EMAIL") || "family@surihana.vows",
  FAMILY_LOGIN_PASSWORD: readEnv("FAMILY_LOGIN_PASSWORD"),
  ADMIN_LOGIN_EMAIL: readEnv("ADMIN_LOGIN_EMAIL") || "admin@surihana.vows",
  ADMIN_LOGIN_PASSWORD: readEnv("ADMIN_LOGIN_PASSWORD")
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

function isInsecureDefault(value: string) {
  return INSECURE_DEFAULTS.includes(value as (typeof INSECURE_DEFAULTS)[number]);
}

export function getMissingEnvironmentVariables() {
  const missing: string[] = [];

  // In production, all auth variables are strictly required
  if (isProduction()) {
    for (const key of requiredInProduction) {
      if (!env[key]) {
        missing.push(key);
      }
    }
  } else {
    // In development, only AUTH_SECRET is flagged if missing
    if (!env.AUTH_SECRET) {
      missing.push("AUTH_SECRET");
    }
  }

  const hasSomeSupabaseKeys = supabasePublicKeys.some((key) => Boolean(env[key]));
  const hasAllSupabaseKeys = supabasePublicKeys.every((key) => Boolean(env[key]));

  if (hasSomeSupabaseKeys && !hasAllSupabaseKeys) {
    missing.push(...supabasePublicKeys.filter((key) => !env[key]));
  }

  return Array.from(new Set(missing));
}

function getInsecureProductionValues() {
  const insecure: string[] = [];

  if (env.AUTH_SECRET && isInsecureDefault(env.AUTH_SECRET)) {
    insecure.push("AUTH_SECRET");
  }
  if (env.FAMILY_LOGIN_PASSWORD && isInsecureDefault(env.FAMILY_LOGIN_PASSWORD)) {
    insecure.push("FAMILY_LOGIN_PASSWORD");
  }
  if (env.ADMIN_LOGIN_PASSWORD && isInsecureDefault(env.ADMIN_LOGIN_PASSWORD)) {
    insecure.push("ADMIN_LOGIN_PASSWORD");
  }

  return insecure;
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

  // Block startup if known insecure defaults are used in production
  if (isProduction()) {
    const insecure = getInsecureProductionValues();
    if (insecure.length > 0) {
      throw new Error(
        `[surihana] Insecure default values detected in production for: ${insecure.join(", ")}. ` +
        "Replace these with strong, unique values before deploying. See .env.example for guidance."
      );
    }
  }
}
