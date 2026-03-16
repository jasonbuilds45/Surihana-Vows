// =============================================================================
// scripts/create-user.ts
//
// Creates a user in the family_users table with a properly hashed password.
// This is the ONLY way to add login users to this platform.
// Supabase Auth users will NOT work — this platform uses its own auth system.
//
// Usage:
//   node --experimental-strip-types scripts/create-user.ts \
//     --email admin@yourdomain.com \
//     --password YourPassword123 \
//     --role admin
//
//   node --experimental-strip-types scripts/create-user.ts \
//     --email family@yourdomain.com \
//     --password YourPassword123 \
//     --role family
//
// Required env vars in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ── Load .env.local manually (Node doesn't auto-load it) ────────────────────
function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const lines = readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch {
    // .env.local not found — rely on actual environment variables
  }
}
loadEnvLocal();

// ── Password hashing (matches lib/auth.ts exactly) ──────────────────────────

const HASH_PREFIX   = "pbkdf2_sha256";
const HASH_ITERATIONS = 120000;
const HASH_KEY_BITS   = 256;
const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(value: string) {
  const pairs = value.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((p) => parseInt(p, 16)));
}

function createSaltHex(length = 16) {
  const salt = new Uint8Array(length);
  crypto.getRandomValues(salt);
  return toHex(salt.buffer);
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

async function hashPassword(password: string): Promise<string> {
  const salt = createSaltHex();
  const hash = await derivePasswordHash(password, salt, HASH_ITERATIONS);
  return `${HASH_PREFIX}$${HASH_ITERATIONS}$${salt}$${hash}`;
}

// ── Argument parsing ─────────────────────────────────────────────────────────

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
    process.exit(1);
  }

  const email    = getArg("--email")?.trim().toLowerCase();
  const password = getArg("--password")?.trim();
  const role     = getArg("--role")?.trim();

  if (!email || !password || !role) {
    console.error(`
Usage:
  node --experimental-strip-types scripts/create-user.ts \\
    --email <email> \\
    --password <password> \\
    --role <admin|family>

Example (couple/admin):
  node --experimental-strip-types scripts/create-user.ts \\
    --email admin@surihana.vows \\
    --password MySecurePass123 \\
    --role admin

Example (family member):
  node --experimental-strip-types scripts/create-user.ts \\
    --email family@surihana.vows \\
    --password FamilyPass456 \\
    --role family
`);
    process.exit(1);
  }

  if (role !== "admin" && role !== "family") {
    console.error(`Error: --role must be "admin" or "family". Got: "${role}"`);
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Error: Password must be at least 8 characters.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  console.log("");
  console.log("Surihana Vows — Create User");
  console.log(`  Email : ${email}`);
  console.log(`  Role  : ${role}`);
  console.log("");

  // Check if user already exists
  const { data: existing } = await supabase
    .from("family_users")
    .select("id, email, role")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    console.log(`  User already exists: ${existing.email} (${existing.role})`);
    console.log("  Updating password and role...");

    const password_hash = await hashPassword(password);
    const { error } = await supabase
      .from("family_users")
      .update({ password_hash, role })
      .eq("email", email);

    if (error) {
      console.error(`  Error updating user: ${error.message}`);
      process.exit(1);
    }

    console.log("  ✓ Password and role updated successfully.");
    console.log("");
    console.log(`  Login at: /login`);
    console.log(`  Email   : ${email}`);
    console.log(`  Role    : ${role} → redirects to ${role === "admin" ? "/admin" : "/family"}`);
    console.log("");
    return;
  }

  // Hash password
  console.log("  Hashing password...");
  const password_hash = await hashPassword(password);

  // Insert user
  const { data, error } = await supabase
    .from("family_users")
    .insert({
      id:            crypto.randomUUID(),
      email,
      role,
      password_hash,
      created_at:    new Date().toISOString(),
    })
    .select("id, email, role")
    .single();

  if (error) {
    console.error(`  Error creating user: ${error.message}`);
    process.exit(1);
  }

  console.log(`  ✓ User created successfully!`);
  console.log("");
  console.log(`  ID    : ${data.id}`);
  console.log(`  Email : ${data.email}`);
  console.log(`  Role  : ${data.role}`);
  console.log("");
  console.log(`  Login at : /login`);
  console.log(`  Redirects to: ${role === "admin" ? "/admin (couple dashboard)" : "/family (family vault)"}`);
  console.log("");
}

void main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
