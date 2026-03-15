// =============================================================================
// scripts/setup-database.ts
//
// Reads all SQL migration files from database/ in numeric order and executes
// them against your Supabase project using the Supabase Management API
// (pg_query endpoint). Requires SUPABASE_ACCESS_TOKEN and your project ref.
//
// Usage:
//   node --experimental-strip-types scripts/setup-database.ts
//
// Required environment variables:
//   NEXT_PUBLIC_SUPABASE_URL      — https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY     — service_role secret key
//   SUPABASE_ACCESS_TOKEN         — personal access token from
//                                   https://supabase.com/dashboard/account/tokens
//                                   (needed to call the Management API)
//
// What it does:
//   1. Discovers all *.sql files in database/ sorted by filename
//   2. Executes each file in order via the Supabase Management REST API
//   3. Verifies that all 16 required tables exist after migration
//   4. Reports a pass/fail summary
//
// The Supabase Management API pg_query endpoint wraps each SQL statement in
// an implicit transaction, so a failure in any file halts execution before
// subsequent files are run — exactly the behaviour you want for migrations.
// =============================================================================

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PgQueryResponse {
  // Supabase pg_query returns { data: unknown } on success
  data?: unknown;
  // And { error: string } on failure
  error?: string;
  // HTTP error responses may have a "message" key
  message?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const REQUIRED_TABLES = [
  "weddings",
  "guests",
  "rsvp",
  "events",
  "guest_messages",
  "photos",
  "videos",
  "travel_info",
  "invite_analytics",
  "family_users",
  "family_posts",
  "family_magic_links",
  "invite_access_codes",
  "wedding_stage_overrides",
  // Phase 7 — Time Capsule + Guest Journey
  "time_capsules",
  "guest_predictions",
  // Missing-features additions
  "vendors",
  "family_polls",
  "family_poll_votes"
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getProjectRef(supabaseUrl: string): string {
  // https://<ref>.supabase.co  →  <ref>
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match?.[1]) {
    throw new Error(
      `Cannot extract project ref from NEXT_PUBLIC_SUPABASE_URL: "${supabaseUrl}". ` +
        "Expected format: https://<ref>.supabase.co"
    );
  }
  return match[1];
}

async function pgQuery(
  projectRef: string,
  accessToken: string,
  sql: string
): Promise<PgQueryResponse> {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: sql })
  });

  // The endpoint returns 200 even for SQL errors sometimes, so we parse both
  const text = await response.text();

  let parsed: PgQueryResponse;
  try {
    parsed = JSON.parse(text) as PgQueryResponse;
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} from Management API: ${parsed.message ?? text.slice(0, 300)}`
    );
  }

  if (parsed.error) {
    throw new Error(`SQL error: ${parsed.error}`);
  }

  return parsed;
}

function ok(message: string) {
  console.log(`  ✓  ${message}`);
}

function fail(message: string) {
  console.error(`  ✗  ${message}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set. Add it to .env.local.");
  }
  if (!accessToken) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN is not set.\n" +
        "Generate one at: https://supabase.com/dashboard/account/tokens\n" +
        "Then add SUPABASE_ACCESS_TOKEN=<token> to .env.local."
    );
  }

  const projectRef = getProjectRef(supabaseUrl);
  const databaseDir = path.resolve(process.cwd(), "database");

  // ── Discover SQL files ───────────────────────────────────────────────────
  const allFiles = await readdir(databaseDir);
  const sqlFiles = allFiles
    .filter((f) => f.endsWith(".sql"))
    .sort(); // lexicographic sort: 001_ < 002_ < ... < phase-2-...

  if (sqlFiles.length === 0) {
    throw new Error(`No .sql files found in ${databaseDir}`);
  }

  console.log("");
  console.log("Surihana Vows — Database Setup");
  console.log(`Project: ${projectRef}`);
  console.log(`Files:   ${sqlFiles.length} migration(s) found`);
  console.log("");

  // ── Execute migrations in order ──────────────────────────────────────────
  console.log("Running migrations…");
  for (const file of sqlFiles) {
    const filePath = path.join(databaseDir, file);
    const sql = await readFile(filePath, "utf8");

    // Skip files that are empty after stripping comments
    const stripped = sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();
    if (!stripped) {
      ok(`${file} — skipped (empty after comment stripping)`);
      continue;
    }

    try {
      await pgQuery(projectRef, accessToken, sql);
      ok(file);
    } catch (error) {
      fail(`${file} — ${error instanceof Error ? error.message : String(error)}`);
      console.error("");
      console.error("Migration halted. Fix the error above and re-run this script.");
      console.error("Already-executed files are idempotent (IF NOT EXISTS guards) — safe to re-run.");
      process.exit(1);
    }
  }

  console.log("");

  // ── Verify all required tables exist ────────────────────────────────────
  console.log("Verifying tables…");

  const checkSql = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = ANY(ARRAY[${REQUIRED_TABLES.map((t) => `'${t}'`).join(",")}])
    ORDER BY table_name;
  `;

  let foundTables: string[] = [];
  try {
    const result = await pgQuery(projectRef, accessToken, checkSql);
    // Result shape: { data: [{ table_name: "..." }, ...] }
    const rows = result.data as Array<{ table_name: string }> | undefined;
    foundTables = (rows ?? []).map((r) => r.table_name);
  } catch (error) {
    fail(`Table verification query failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  const foundSet = new Set(foundTables);
  const missing = REQUIRED_TABLES.filter((t) => !foundSet.has(t));

  for (const table of REQUIRED_TABLES) {
    if (foundSet.has(table)) {
      ok(table);
    } else {
      fail(`${table} — NOT FOUND`);
    }
  }

  console.log("");

  if (missing.length > 0) {
    console.error(`Database setup incomplete. Missing tables: ${missing.join(", ")}`);
    console.error("Check the error output above and re-run the script.");
    process.exit(1);
  }

  console.log(`All ${REQUIRED_TABLES.length} required tables verified.`);
  console.log("");
  console.log("Next step:");
  console.log("  node --experimental-strip-types scripts/setup-storage.ts");
  console.log("");
}

void main().catch((error) => {
  console.error("");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
