import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

type CliArgs = Record<string, string>;

interface GuestCsvRow {
  guestName: string;
  familyName: string;
  phone: string;
}

function parseArgs(argv: string[]) {
  return argv.reduce<CliArgs>((accumulator, current, index, values) => {
    if (!current.startsWith("--")) {
      return accumulator;
    }

    const key = current.slice(2);
    const next = values[index + 1];

    if (!next || next.startsWith("--")) {
      accumulator[key] = "true";
      return accumulator;
    }

    accumulator[key] = next;
    return accumulator;
  }, {});
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildInviteCode(guestName: string, familyName?: string) {
  return slugify([guestName, familyName].filter(Boolean).join(" "));
}

function generateInviteCode(guestName: string, familyName: string, existingCodes: Set<string>) {
  const base = buildInviteCode(guestName, familyName) || crypto.randomUUID().split("-")[0];

  if (!existingCodes.has(base)) {
    existingCodes.add(base);
    return base;
  }

  const next = `${base}-${crypto.randomUUID().split("-")[0]}`;
  existingCodes.add(next);
  return next;
}

async function parseCsvFile(filePath: string): Promise<GuestCsvRow[]> {
  const contents = await readFile(filePath, "utf8");
  const lines = contents.split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const guestNameIndex = headers.findIndex((header) => ["guestname", "guest_name", "name"].includes(header));
  const familyNameIndex = headers.findIndex((header) => ["familyname", "family_name", "family"].includes(header));
  const phoneIndex = headers.findIndex((header) => header === "phone");

  if (guestNameIndex === -1) {
    throw new Error("CSV must include a guestName or guest_name column.");
  }

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCsvLine(line);
      return {
        guestName: values[guestNameIndex] ?? "",
        familyName: familyNameIndex >= 0 ? values[familyNameIndex] ?? "" : "",
        phone: phoneIndex >= 0 ? values[phoneIndex] ?? "" : ""
      };
    })
    .filter((row) => row.guestName.trim().length > 0);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const filePath = args.file;
  const weddingId = args.weddingId;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  if (!filePath || !weddingId) {
    throw new Error("Usage: node --experimental-strip-types scripts/import-guests.ts --file guests.csv --weddingId <id>");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  const rows = await parseCsvFile(filePath);
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const existingResult = await supabase.from("guests").select("invite_code").eq("wedding_id", weddingId);

  if (existingResult.error) {
    throw new Error(existingResult.error.message);
  }

  const existingCodes = new Set((existingResult.data ?? []).map((row) => row.invite_code));

  const payload = rows.map((row) => {
    const inviteCode = generateInviteCode(row.guestName, row.familyName, existingCodes);

    return {
      id: crypto.randomUUID(),
      wedding_id: weddingId,
      guest_name: row.guestName.trim(),
      family_name: row.familyName.trim() || null,
      phone: row.phone.trim() || null,
      invite_code: inviteCode,
      invite_opened: false,
      device_type: null,
      opened_at: null
    };
  });

  const { error } = await supabase.from("guests").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  console.log("");
  console.log(`Imported ${payload.length} guests for wedding ${weddingId}.`);
  console.log("");

  payload.forEach((guest) => {
    console.log(`${guest.guest_name}${guest.family_name ? ` ${guest.family_name}` : ""}`);
    console.log(`  ${siteUrl}/invite/${guest.invite_code}`);
  });
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
