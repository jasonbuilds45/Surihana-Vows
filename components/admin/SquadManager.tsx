"use client";

import type { FormEvent } from "react";
import { startTransition, useState } from "react";
import { authFetch } from "@/lib/client/token";
import { Check, Copy, ExternalLink, Plus, Trash2, Users, X, Heart, Clock } from "lucide-react";
import { Card, SectionLabel, Btn } from "@/components/ui";
import type { SquadProposal } from "@/modules/squad/squad-system";

interface SquadManagerProps {
  initialProposals: SquadProposal[];
  weddingId: string;
}

const SITE_URL = (typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL ?? "")) .replace(/\/$/, "");

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%",
  background: "var(--color-surface-soft)",
  border: "1.5px solid var(--color-border-medium)",
  borderRadius: "12px", padding: "0.75rem 1rem",
  color: "var(--color-text-primary)", fontSize: "0.9375rem",
  outline: "none", fontFamily: "var(--font-body), sans-serif",
};

const btnSm: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  borderRadius: "9999px", padding: "6px 14px",
  fontSize: "0.6rem", letterSpacing: "0.18em",
  textTransform: "uppercase", fontWeight: 600, cursor: "pointer",
  border: "1.5px solid var(--color-border-medium)",
  background: "#fff", color: "var(--color-text-secondary)",
};

const btnDanger: React.CSSProperties = {
  ...btnSm, border: "1.5px solid #fca5a5",
  background: "#fef2f2", color: "#b91c1c",
};

// Role colours
const ROLE_STYLE = {
  bridesmaid: { bg: "rgba(190,45,69,.07)", border: "rgba(190,45,69,.20)", color: "#BE2D45", label: "Bridesmaid" },
  groomsman:  { bg: "rgba(168,120,8,.07)", border: "rgba(168,120,8,.20)", color: "#A87808", label: "Groomsman"  },
} as const;

const STATUS_STYLE = {
  pending:  { bg: "rgba(107,114,128,.08)", border: "rgba(107,114,128,.20)", color: "#6b7280", label: "Pending"  },
  accepted: { bg: "rgba(107,142,110,.10)", border: "rgba(107,142,110,.25)", color: "#16a34a", label: "Accepted" },
  declined: { bg: "#fef2f2",              border: "#fca5a5",               color: "#b91c1c", label: "Declined" },
} as const;

function statusOf(p: SquadProposal): "pending" | "accepted" | "declined" {
  if (p.accepted === true)  return "accepted";
  if (p.accepted === false) return "declined";
  return "pending";
}

export function SquadManager({ initialProposals }: SquadManagerProps) {
  const [proposals, setProposals] = useState<SquadProposal[]>(initialProposals);
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [role,         setRole]         = useState<"bridesmaid" | "groomsman">("bridesmaid");
  const [personalNote, setPersonalNote] = useState("");
  const [status, setStatus]   = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState<string | null>(null);

  // Template notes so the couple doesn't start from a blank page
  const NOTE_TEMPLATES = {
    bridesmaid: `You have been one of the most important people in my life — through every season, every laugh, every quiet moment. I cannot imagine standing at that altar without you beside me.\n\nWill you be my bridesmaid?`,
    groomsman:  `You have been my brother in every sense of the word. I would be honoured to have you standing next to me on the most important day of my life.\n\nWill you be my groomsman?`,
  };

  function handleRoleChange(r: "bridesmaid" | "groomsman") {
    setRole(r);
    if (!personalNote || personalNote === NOTE_TEMPLATES[role === "bridesmaid" ? "groomsman" : "bridesmaid"]) {
      setPersonalNote(NOTE_TEMPLATES[r]);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !personalNote.trim()) return;
    setLoading(true); setStatus(null);
    try {
      const res = await authFetch("/api/admin/squad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: name.trim(),
          email: email.trim() || null,
          squad_role: role,
          personal_note: personalNote.trim(),
        }),
      });
      const json = (await res.json()) as { success: boolean; data?: SquadProposal; message?: string };
      if (!res.ok || !json.success) throw new Error(json.message ?? "Error.");
      if (json.data) {
        startTransition(() => setProposals(cur => [json.data!, ...cur]));
      }
      setName(""); setEmail(""); setPersonalNote("");
      setStatus({ success: true, message: `Proposal created for ${name.trim()}.` });
    } catch (err) {
      setStatus({ success: false, message: err instanceof Error ? err.message : "Error." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(proposal: SquadProposal) {
    if (!window.confirm(`Delete ${proposal.name}'s proposal? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await authFetch("/api/admin/squad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: proposal.id }),
      });
      startTransition(() => setProposals(cur => cur.filter(p => p.id !== proposal.id)));
      setStatus({ success: true, message: "Proposal deleted." });
    } catch (err) {
      setStatus({ success: false, message: err instanceof Error ? err.message : "Error." });
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(code: string, name: string) {
    const url = `${SITE_URL}/squad/${code}`;
    try { await navigator.clipboard.writeText(url); } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el); el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(code);
    setStatus({ success: true, message: `Copied proposal link for ${name}.` });
    setTimeout(() => setCopied(null), 2000);
  }

  // Stats
  const bridesmaids = proposals.filter(p => p.squad_role === "bridesmaid");
  const groomsmen   = proposals.filter(p => p.squad_role === "groomsman");
  const accepted    = proposals.filter(p => p.accepted === true);
  const pending     = proposals.filter(p => p.accepted === null);

  return (
    <div className="space-y-6">
      <Card noPad>
        <div className="p-6 space-y-6">

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <SectionLabel>Squad proposals</SectionLabel>
              <h2 className="font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>
                Bridesmaid &amp; Groomsmen
              </h2>
              <p className="text-sm leading-6 max-w-lg" style={{ color: "var(--color-text-secondary)" }}>
                Create a personal proposal for each member of your squad. They receive a private
                sealed-letter experience at their own unique link — separate from the wedding invitation.
              </p>
            </div>

            {/* Stat chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Bridesmaids", value: bridesmaids.length, color: "#BE2D45" },
                { label: "Groomsmen",   value: groomsmen.length,   color: "#A87808" },
                { label: "Accepted",    value: accepted.length,    color: "#16a34a" },
                { label: "Pending",     value: pending.length,     color: "#6b7280" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 14px", borderRadius: 999,
                  background: "var(--color-surface-soft)",
                  border: "1px solid var(--color-border)",
                }}>
                  <span style={{ fontFamily: "var(--font-display,'Cormorant Garamond',serif)", fontSize: "1.15rem", color, lineHeight: 1 }}>{value}</span>
                  <span style={{ fontSize: ".55rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Create form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>
                  Name *
                </label>
                <input
                  style={inputStyle} value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Sarah" required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>
                  Email <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional — for your records)</span>
                </label>
                <input
                  type="email" style={inputStyle} value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sarah@example.com"
                />
              </div>
            </div>

            {/* Role selector — visual toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>
                Role *
              </label>
              <div style={{ display: "flex", gap: ".625rem" }}>
                {(["bridesmaid", "groomsman"] as const).map(r => {
                  const rs = ROLE_STYLE[r];
                  const active = role === r;
                  return (
                    <button
                      key={r} type="button"
                      onClick={() => handleRoleChange(r)}
                      style={{
                        flex: 1, padding: "10px 0",
                        borderRadius: 12, cursor: "pointer",
                        fontFamily: "var(--font-body),sans-serif",
                        fontSize: ".72rem", fontWeight: 700,
                        letterSpacing: ".18em", textTransform: "uppercase",
                        background: active ? rs.bg : "var(--color-surface-soft)",
                        border: `1.5px solid ${active ? rs.border : "var(--color-border-medium)"}`,
                        color: active ? rs.color : "var(--color-text-muted)",
                        transition: "all .18s ease",
                      }}
                    >
                      {rs.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>
                Personal note * <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(this is what they read when they open their proposal)</span>
              </label>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: 140, resize: "vertical",
                  fontFamily: "var(--font-display,'Cormorant Garamond',serif)",
                  fontStyle: "italic", fontSize: "1rem", lineHeight: 1.8,
                }}
                value={personalNote}
                onChange={e => setPersonalNote(e.target.value)}
                placeholder="Write something personal…"
                required
              />
              <p style={{ fontSize: ".62rem", color: "var(--color-text-muted)", fontFamily: "var(--font-body),sans-serif" }}>
                Write in your own voice. This appears inside a sealed letter that only they can open.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Btn type="submit" variant="primary" size="sm" loading={loading} disabled={!name.trim() || !personalNote.trim()}>
                <Plus className="h-3.5 w-3.5" /> Create proposal &amp; generate link
              </Btn>
              {(name || personalNote) && (
                <button type="button" style={btnSm} onClick={() => { setName(""); setEmail(""); setPersonalNote(""); }}>
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </form>

          {/* Status */}
          {status && (
            <p className="rounded-xl px-4 py-3 text-sm" style={{
              background: status.success ? "rgba(107,142,110,0.1)" : "#fef2f2",
              color:      status.success ? "var(--color-sage)"      : "#b91c1c",
              border:     `1px solid ${status.success ? "rgba(107,142,110,0.2)" : "#fca5a5"}`,
              fontFamily: "var(--font-body),sans-serif",
            }}>
              {status.message}
            </p>
          )}
        </div>

        {/* ── Proposals table ── */}
        <div style={{ borderTop: "1px solid var(--color-border)" }}>
          {proposals.length === 0 ? (
            <div className="py-12 text-center space-y-2" style={{ color: "var(--color-text-muted)" }}>
              <Heart className="h-8 w-8 mx-auto" style={{ color: "var(--color-accent-soft)" }} />
              <p className="text-sm" style={{ fontFamily: "var(--font-body),sans-serif" }}>
                No proposals yet. Create one above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: "var(--color-surface-soft)" }}>
                    {["Person", "Role", "Status", "Opened", "Proposal link", "Actions"].map(h => (
                      <th key={h} className="px-5 py-3.5" style={{
                        fontSize: "0.58rem", letterSpacing: "0.20em",
                        textTransform: "uppercase", color: "var(--color-text-muted)",
                        fontWeight: 600, borderBottom: "1px solid var(--color-border)",
                        fontFamily: "var(--font-body),sans-serif",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((p, i) => {
                    const st  = statusOf(p);
                    const rs  = ROLE_STYLE[p.squad_role];
                    const ss  = STATUS_STYLE[st];
                    const url = `${SITE_URL}/squad/${p.proposal_code}`;

                    return (
                      <tr key={p.id} style={{ background: i % 2 === 0 ? "#ffffff" : "var(--color-surface-soft)" }}>

                        {/* Person */}
                        <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display,'Cormorant Garamond',serif)", fontSize: "1.1rem" }}>
                            {p.name}
                          </p>
                          {p.email && (
                            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body),sans-serif" }}>{p.email}</p>
                          )}
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <span style={{
                            display: "inline-block", padding: "4px 12px", borderRadius: 999,
                            background: rs.bg, border: `1px solid ${rs.border}`, color: rs.color,
                            fontSize: ".60rem", fontWeight: 700,
                            letterSpacing: ".18em", textTransform: "uppercase",
                            fontFamily: "var(--font-body),sans-serif",
                          }}>
                            {rs.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "4px 12px", borderRadius: 999,
                            background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color,
                            fontSize: ".60rem", fontWeight: 700,
                            letterSpacing: ".18em", textTransform: "uppercase",
                            fontFamily: "var(--font-body),sans-serif",
                          }}>
                            {st === "accepted" ? <Check className="h-3 w-3" /> :
                             st === "declined" ? <X className="h-3 w-3" /> :
                             <Clock className="h-3 w-3" />}
                            {ss.label}
                          </span>
                          {p.response_note && (
                            <p className="text-xs mt-1 italic max-w-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-display,'Cormorant Garamond',serif)", fontStyle: "italic" }}>
                              &ldquo;{p.response_note}&rdquo;
                            </p>
                          )}
                        </td>

                        {/* Opened */}
                        <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                          {p.opened_at ? (
                            <span style={{
                              fontSize: ".60rem", fontWeight: 600, color: "var(--color-sage)",
                              fontFamily: "var(--font-body),sans-serif",
                              letterSpacing: ".12em", textTransform: "uppercase",
                            }}>
                              Opened
                            </span>
                          ) : (
                            <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>—</span>
                          )}
                          {/* Vault flag — accepted with no email needs manual grant */}
                          {p.accepted === true && !p.email && (
                            <p style={{
                              marginTop: 3,
                              fontSize: ".56rem", letterSpacing: ".18em",
                              textTransform: "uppercase", fontWeight: 700,
                              color: "#A87808",
                              fontFamily: "var(--font-body),sans-serif",
                            }}>
                              ⚠️ Grant vault access
                            </p>
                          )}
                        </td>

                        {/* Link */}
                        <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)", maxWidth: 240 }}>
                          <p className="font-mono text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>
                            /squad/{p.proposal_code}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => handleCopy(p.proposal_code, p.name)}
                              style={{
                                fontSize: "0.65rem", border: "none", background: "none",
                                cursor: "pointer", padding: 0,
                                color: copied === p.proposal_code ? "var(--color-sage)" : "var(--color-accent)",
                                fontFamily: "var(--font-body),sans-serif",
                              }}
                            >
                              {copied === p.proposal_code ? "✓ Copied" : "Copy link"}
                            </button>
                            <a
                              href={url} target="_blank" rel="noreferrer"
                              style={{
                                fontSize: "0.65rem", color: "var(--color-accent)",
                                textDecoration: "underline",
                                fontFamily: "var(--font-body),sans-serif",
                                display: "inline-flex", alignItems: "center", gap: 3,
                              }}
                            >
                              Preview <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <button
                            type="button"
                            style={btnDanger}
                            onClick={() => handleDelete(p)}
                            disabled={loading}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default SquadManager;
