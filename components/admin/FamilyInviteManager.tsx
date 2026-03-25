"use client";

import type { FormEvent } from "react";
import { startTransition, useState } from "react";
import { Mail, Plus, RefreshCcw, Trash2, Users } from "lucide-react";
import { Card, SectionLabel, Btn, Badge, EmptyState } from "@/components/ui";

export interface FamilyMemberRow {
  id: string;
  email: string;
  role: "family" | "squad" | "admin";
}

interface FamilyInviteManagerProps {
  initialMembers: FamilyMemberRow[];
  weddingId: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: FamilyMemberRow;
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  background: "var(--color-surface-soft)",
  border: "1.5px solid var(--color-border-medium)",
  borderRadius: "12px",
  padding: "0.75rem 1rem",
  color: "var(--color-text-primary)",
  fontSize: "0.9375rem",
  outline: "none",
  fontFamily: "var(--font-body), sans-serif",
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

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite", email: trimmed, role, weddingId }),
      });
      const payload = (await res.json()) as ApiResponse;
      if (!res.ok || !payload.success) throw new Error(payload.message ?? "Error");

      if (payload.data) {
        startTransition(() => {
          setMembers((current) => {
            const exists = current.some((member) => member.email === payload.data!.email);
            return exists ? current : [...current, payload.data!];
          });
        });
      }

      setEmail("");
      setStatus({ success: true, message: `Setup link sent to ${trimmed}.` });
    } catch (error) {
      setStatus({ success: false, message: error instanceof Error ? error.message : "Error." });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(memberEmail: string) {
    setResending(memberEmail);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend", email: memberEmail, weddingId }),
      });
      const payload = (await res.json()) as ApiResponse;
      if (!res.ok || !payload.success) throw new Error(payload.message ?? "Error");
      setStatus({ success: true, message: `Fresh setup link sent to ${memberEmail}.` });
    } catch (error) {
      setStatus({ success: false, message: error instanceof Error ? error.message : "Error." });
    } finally {
      setResending(null);
    }
  }

  async function handleRemove(member: FamilyMemberRow) {
    if (!window.confirm(`Remove ${member.email}? They will lose access immediately.`)) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", userId: member.id, weddingId }),
      });
      const payload = (await res.json()) as ApiResponse;
      if (!res.ok || !payload.success) throw new Error(payload.message ?? "Error");

      startTransition(() => {
        setMembers((current) => current.filter((entry) => entry.id !== member.id));
      });
      setStatus({ success: true, message: `${member.email} removed.` });
    } catch (error) {
      setStatus({ success: false, message: error instanceof Error ? error.message : "Error." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <SectionLabel>Family vault access</SectionLabel>
          <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>
            Invite family members
          </h2>
          <p className="text-sm leading-6 max-w-lg" style={{ color: "var(--color-text-secondary)" }}>
            Family members receive a private setup link by email. They create their password once, then sign in normally from the app.
          </p>
        </div>
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase"
          style={{ letterSpacing: "0.2em", background: "var(--color-surface-dark)", color: "#fff" }}
        >
          <Users className="h-3.5 w-3.5" /> {members.length} {members.length === 1 ? "member" : "members"}
        </span>
      </div>

      <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-[1fr,0.4fr,auto]">
        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold uppercase"
            style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}
          >
            Email address
          </label>
          <input
            type="email"
            required
            placeholder="nani@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            style={inputStyle}
          />
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold uppercase"
            style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}
          >
            Role
          </label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as "family" | "squad" | "admin")}
            disabled={loading}
            style={inputStyle}
          >
            <option value="family">Family - spectator (view, capsules, polls)</option>
            <option value="squad">Squad - bridesmaid / groomsman (full vault + squad hub)</option>
            <option value="admin">Admin - full access</option>
          </select>
        </div>
        <div className="flex items-end">
          <Btn type="submit" variant="primary" size="sm" loading={loading} disabled={!email.trim()}>
            <Plus className="h-3.5 w-3.5" /> Add and send invite
          </Btn>
        </div>
      </form>

      {status && (
        <p
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: status.success ? "rgba(107,142,110,0.1)" : "#fef2f2",
            color: status.success ? "var(--color-sage)" : "#b91c1c",
            border: `1px solid ${status.success ? "rgba(107,142,110,0.2)" : "#fca5a5"}`,
          }}
        >
          {status.message}
        </p>
      )}

      {members.length === 0 ? (
        <EmptyState
          icon={<Users className="h-9 w-9" />}
          title="No family members yet"
          description="Add one above to send their private setup link."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid var(--color-border)" }}>
          <table className="min-w-full text-left text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: "var(--color-surface-soft)" }}>
                {["Email", "Role", "Actions"].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3.5"
                    style={{
                      fontSize: "0.6rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--color-text-muted)",
                      fontWeight: 600,
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr
                  key={member.id}
                  style={{ background: index % 2 === 0 ? "#ffffff" : "var(--color-surface-soft)" }}
                >
                  <td
                    className="px-5 py-4 font-medium"
                    style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}
                  >
                    {member.email}
                  </td>
                  <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <Badge variant={member.role === "admin" ? "accent" : member.role === "squad" ? "sage" : "neutral"}>
                      {member.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={resending === member.email || loading}
                        onClick={() => handleResend(member.email)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase font-semibold transition"
                        style={{
                          letterSpacing: "0.16em",
                          background: "var(--color-surface-soft)",
                          border: "1.5px solid var(--color-border-medium)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {resending === member.email ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                        {resending === member.email ? "Sending..." : "Resend invite"}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleRemove(member)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase font-semibold transition"
                        style={{
                          letterSpacing: "0.16em",
                          background: "#fef2f2",
                          border: "1.5px solid #fca5a5",
                          color: "#b91c1c",
                        }}
                      >
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
