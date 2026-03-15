import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { weddingConfig } from "@/lib/config";
import { getConfiguredSupabaseClient } from "@/lib/supabaseClient";
import { PlatformMonitorClient } from "./PlatformMonitorClient";

export const metadata: Metadata = { title: `Monitoring — ${weddingConfig.celebrationTitle}` };
export const dynamic = "force-dynamic";

async function pingSupabase(): Promise<{ ok: boolean; latencyMs: number }> {
  const client = getConfiguredSupabaseClient();
  if (!client) return { ok: false, latencyMs: 0 };
  const start = Date.now();
  try {
    await client.from("weddings").select("id").limit(1);
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

async function getTableCounts(): Promise<Record<string, number>> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return {};
  const tables = ["guests", "rsvp", "guest_messages", "photos", "vendors", "family_polls", "time_capsules", "guest_predictions"] as const;
  const results: Record<string, number> = {};
  await Promise.all(
    tables.map(async (t) => {
      try {
        const { count } = await client.from(t).select("*", { count: "exact", head: true });
        results[t] = count ?? 0;
      } catch {
        results[t] = -1;
      }
    })
  );
  return results;
}

export default async function MonitorPage() {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/admin")) {
    redirect("/login?redirect=%2Fadmin%2Fmonitor");
  }

  const [db, counts] = await Promise.all([pingSupabase(), getTableCounts()]);

  const checks = [
    { label: "Database (Supabase)",     ok: db.ok,           detail: db.ok ? `${db.latencyMs} ms` : "Connection failed" },
    { label: "Next.js app server",      ok: true,            detail: "Responding"        },
    { label: "Auth system",             ok: !!session,       detail: session ? `Signed in as ${session.email}` : "No session" },
    { label: "Env: NEXT_PUBLIC_SUPABASE_URL",  ok: !!process.env.NEXT_PUBLIC_SUPABASE_URL,  detail: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing" },
    { label: "Env: SUPABASE_SERVICE_ROLE_KEY", ok: !!process.env.SUPABASE_SERVICE_ROLE_KEY, detail: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing" },
  ];

  return (
    <PlatformMonitorClient
      checks={checks}
      tableCounts={counts}
      weddingId={weddingConfig.id}
    />
  );
}
