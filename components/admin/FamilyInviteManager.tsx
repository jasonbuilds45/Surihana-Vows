"use client";

import type { FormEvent } from "react";
import { startTransition, useState } from "react";
import { Mail, Plus, RefreshCcw, Trash2, Users } from "lucide-react";
import { Card, SectionLabel, Btn, Badge, EmptyState } from "@/components/ui";

export interface FamilyMemberRow {
  id: string;
  email: string;
  role: "family" | "admin";
}

interface FamilyInviteManagerProps {
  initialMembers: FamilyMemberRow[];
  weddingId: string;
}

interface ApiResponse { success: boolean; message?: string; data?: FamilyMemberRow; }

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", background: "var(--color-surface-soft)",
  border: "1.5px solid var(--color-border-medium)", borderRadius: "12px",
  padding: "0.75rem 1rem", color: "var(--color-text-primary)", fontSize: "0.9375rem",
  outline: "none", fontFamily: "var(--font-body), sans-serif",
};

export function FamilyInviteManager({ initialMembers, weddingId }: FamilyInviteManagerProps) {
  const [members, setMembers] = useState<FamilyMemberRow[]>(initialMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"family" | "squad" | "admin">("family");
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true); setStatus(null);
    try {
      const res = await fetch("/api/admin/family", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "invite", email: trimmed, role, weddingId }) });
      const p = (await res.json()) as ApiResponse;
      if (!res.ok || !p.success) throw new Error(p.message ?? "Error");
      if (p.data) { startTransition(() => { setMembers((cur) => { const exists = cur.some((m) => m.email === p.data!.email); return exists ? cur : [...cur, p.data!]; }); }); }
      setEmail(""); setStatus({ success: true, message: `Invite link sent to ${trimmed}.` });
    } catch (err) { setStatus({ success: false, message: err instanceof Error ? err.message : "Error." }); }
    finally { setLoading(false); }
  }

  async function handleResend(memberEmail: string) {
    setResending(memberEmail); setStatus(null);
    try {
      const res = await fetch("/api/admin/family", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "resend", email: memberEmail, weddingId }) });
      const p = (await res.json()) as ApiResponse;
      if (!res.ok || !p.success) throw new Error(p.message ?? "Error");
      setStatus({ success: true, message: `Fresh vault link sent to ${memberEmail}.` });
    } catch (err) { setStatus({ success: false, message: err instanceof Error ? err.message : "Error." }); }
    finally { setResending(null); }
  }

  async function handleRemove(member: FamilyMemberRow) {
    if (!window.confirm(`Remove ${member.email}? They will lose access immediately.`)) return;
    setLoading(true); setStatus(null);
    try {
      const res = await fetch("/api/admin/family", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "remove", userId: member.id, weddingId }) });
      const p = (await res.json()) as ApiResponse;
      if (!res.ok || !p.success) throw new Error(p.message ?? "Error");
      startTransition(() => { setMembers((cur) => cur.filter((m) => m.id !== member.id)); });
      setStatus({ success: true, message: `${member.email} removed.` });
    } catch (err) { setStatus({ success: false, message: err instanceof Error ? err.message : "Error." }); }
    finally { setLoading(false); }
  }

  return (
    <Card className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <SectionLabel>Family vault access</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>Invite family members</h2>
          <p className="text-sm leading-6 max-w-lg" style={{ color: "var(--color-text-secondary)" }}>
            Family members receive a one-tap vault link by email — no password required.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase" style={{ letterSpacing: "0.2em", background: "var(--color-surface-dark)", color: "#fff" }}>
          <Users className="h-3.5 w-3.5" /> {members.length} {members.length === 1 ? "member" : "members"}
        </span>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-[1fr,0.4fr,auto]">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>Email address</label>
          <input type="email" required placeholder="nani@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} style={inputStyle} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as "family" | "squad" | "admin")} disabled={loading} style={inputStyle}>
            <option value="family">Family — spectator (view, capsules, polls)</option>
            <option value="squad">Squad — bridesmaid / groomsman (full vault + squad hub)</option>
            <option value="admin">Admin — full access</option>
          </select>
        </div>
        <div className="flex items-end">
          <Btn type="submit" variant="primary" size="sm" loading={loading} disabled={!email.trim()}>
            <Plus className="h-3.5 w-3.5" /> Add &amp; send
          </Btn>
        </div>
      </form>

      {/* Status */}
      {status && (
        <p className="rounded-xl px-4 py-3 text-sm" style={{ background: status.success ? "rgba(107,142,110,0.1)" : "#fef2f2", color: status.success ? "var(--color-sage)" : "#b91c1c", border: `1px solid ${status.success ? "rgba(107,142,110,0.2)" : "#fca5a5"}` }}>
          {status.message}
        </p>
      )}

      {/* Member table */}
      {members.length === 0 ? (
        <EmptyState icon={<Users className="h-9 w-9" />} title="No family members yet" description="Add one above to send them a vault access link." />
      ) : (
        <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid var(--color-border)" }}>
          <table className="min-w-full text-left text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: "var(--color-surface-soft)" }}>
                {["Email", "Role", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5" style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600, borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id} style={{ background: i % 2 === 0 ? "#ffffff" : "var(--color-surface-soft)" }}>
                  <td className="px-5 py-4 font-medium" style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}>{m.email}</td>
                  <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <Badge variant={m.role === "admin" ? "accent" : "neutral"}>{m.role}</Badge>
                  </td>
                  <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <div className="flex gap-2">
                      <button type="button" disabled={resending === m.email || loading} onClick={() => handleResend(m.email)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase font-semibold transition"
                        style={{ letterSpacing: "0.16em", background: "var(--color-surface-soft)", border: "1.5px solid var(--color-border-medium)", color: "var(--color-text-secondary)" }}>
                        {resending === m.email ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                        {resending === m.email ? "Sending…" : "Resend"}
                      </button>
                      <button type="button" disabled={loading} onClick={() => handleRemove(m)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase font-semibold transition"
                        style={{ letterSpacing: "0.16em", background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#b91c1c" }}>
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default FamilyInviteManager;
