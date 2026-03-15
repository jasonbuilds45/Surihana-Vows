"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, XCircle, Database, Server, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Check  { label: string; ok: boolean; detail: string; }

const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK2 = "#3D2530";
const INK3 = "#7A5460";
const BF   = "var(--font-body), system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";

const TABLE_LABELS: Record<string, string> = {
  guests:            "Guests",
  rsvp:              "RSVPs",
  guest_messages:    "Guestbook messages",
  photos:            "Photos",
  vendors:           "Vendors",
  family_polls:      "Family polls",
  time_capsules:     "Time capsules",
  guest_predictions: "Predictions",
};

export function PlatformMonitorClient({
  checks,
  tableCounts,
  weddingId,
}: {
  checks:      Check[];
  tableCounts: Record<string, number>;
  weddingId:   string;
}) {
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    window.location.reload();
  }

  const allOk = checks.every((c) => c.ok);
  const now   = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#FAF8F6", borderBottom: "1px solid #E4D8D4", padding: "2.5rem clamp(1.25rem,5vw,4rem)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: ROSE, marginBottom: ".625rem", fontFamily: BF }}>Admin · Monitoring</p>
              <h1 style={{ fontFamily: DF, fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 700, color: INK, marginBottom: ".5rem" }}>Platform health</h1>
              <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>Last checked: {now} IST</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
              <button onClick={refresh} disabled={refreshing} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 999, background: ROSE, color: "#FFF", fontSize: ".82rem", fontWeight: 700, fontFamily: BF, cursor: refreshing ? "not-allowed" : "pointer", border: "none", opacity: refreshing ? .75 : 1 }}>
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
              <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 999, background: "#FFF", border: "1px solid #E4D8D4", color: INK, fontSize: ".82rem", fontWeight: 600, fontFamily: BF, textDecoration: "none" }}>
                <ArrowLeft size={14} /> Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem clamp(1.25rem,5vw,4rem) 6rem", display: "flex", flexDirection: "column", gap: "3rem" }}>

        {/* Overall status banner */}
        <div style={{ padding: "1.25rem 2rem", borderRadius: 16, background: allOk ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${allOk ? "#86EFAC" : "#FECACA"}`, display: "flex", alignItems: "center", gap: "1rem" }}>
          {allOk ? <CheckCircle2 size={24} style={{ color: "#16A34A", flexShrink: 0 }} /> : <XCircle size={24} style={{ color: "#DC2626", flexShrink: 0 }} />}
          <div>
            <p style={{ fontFamily: DF, fontSize: "1.125rem", fontWeight: 700, color: allOk ? "#15803D" : "#B91C1C" }}>
              {allOk ? "All systems operational" : "One or more checks failed"}
            </p>
            <p style={{ fontSize: ".82rem", color: allOk ? "#166534" : "#991B1B", fontFamily: BF }}>
              {allOk ? "Database, auth, and environment variables are all healthy." : "Review the checks below for details."}
            </p>
          </div>
        </div>

        {/* System checks */}
        <div>
          <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: ROSE, marginBottom: "1.25rem", fontFamily: BF }}>System checks</p>
          <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
            {checks.map(({ label, ok, detail }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem 1.5rem", background: ok ? "#FFFFFF" : "#FEF2F2", border: `1px solid ${ok ? "#E4D8D4" : "#FECACA"}`, borderRadius: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".875rem" }}>
                  {ok ? <CheckCircle2 size={18} style={{ color: "#16A34A", flexShrink: 0 }} /> : <XCircle size={18} style={{ color: "#DC2626", flexShrink: 0 }} />}
                  <p style={{ fontSize: ".9rem", fontWeight: 600, color: INK, fontFamily: BF }}>{label}</p>
                </div>
                <span style={{ fontSize: ".78rem", color: ok ? "#166534" : "#B91C1C", fontFamily: BF, background: ok ? "#F0FDF4" : "#FEF2F2", padding: "3px 12px", borderRadius: 999, border: `1px solid ${ok ? "#86EFAC" : "#FECACA"}`, whiteSpace: "nowrap" }}>
                  {detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Database table counts */}
        {Object.keys(tableCounts).length > 0 && (
          <div>
            <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: ROSE, marginBottom: "1.25rem", fontFamily: BF }}>Database record counts</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem" }}>
              {Object.entries(tableCounts).map(([table, count]) => (
                <div key={table} style={{ background: "#FAF8F6", border: "1px solid #E4D8D4", borderRadius: 16, padding: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: ".625rem", marginBottom: ".625rem" }}>
                    <Database size={16} style={{ color: ROSE }} />
                    <p style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, fontFamily: BF }}>{table}</p>
                  </div>
                  <p style={{ fontFamily: DF, fontSize: "2rem", fontWeight: 700, color: count < 0 ? "#DC2626" : INK }}>
                    {count < 0 ? "—" : count}
                  </p>
                  <p style={{ fontSize: ".78rem", color: INK3, fontFamily: BF }}>{TABLE_LABELS[table] ?? table}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div>
          <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: ROSE, marginBottom: "1.25rem", fontFamily: BF }}>Quick actions</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem" }}>
            {[
              { label: "Admin dashboard",       href: "/admin",                icon: "🏠" },
              { label: "Content editors",       href: "/admin/editors",        icon: "✏️" },
              { label: "Guest management",      href: "/admin",                icon: "👥" },
              { label: "Live hub",              href: "/live",                  icon: "📡" },
              { label: "Family vault",          href: "/family",               icon: "🔒" },
              { label: "RSVP export",           href: `/api/admin/rsvp-export?weddingId=${weddingId}`, icon: "📥" },
            ].map(({ label, href, icon }) => (
              <a key={label} href={href} style={{ display: "flex", alignItems: "center", gap: ".875rem", padding: "1rem 1.25rem", background: "#FFFFFF", border: "1px solid #E4D8D4", borderRadius: 14, textDecoration: "none", transition: "box-shadow .18s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(80,20,30,.09)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "none")}
              >
                <span style={{ fontSize: "1.25rem" }}>{icon}</span>
                <p style={{ fontSize: ".875rem", fontWeight: 600, color: INK2, fontFamily: BF }}>{label}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
