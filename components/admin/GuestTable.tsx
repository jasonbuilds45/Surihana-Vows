"use client";

import type { FormEvent } from "react";
import { startTransition, useMemo, useState } from "react";
import { Copy, Link2, Pencil, Plus, RefreshCcw, Save, Trash2, X } from "lucide-react";
import { Card, SectionLabel, Field, Btn, EmptyState } from "@/components/ui";

export interface GuestTableRow {
  id: string;
  guestName: string;
  familyName?: string | null;
  phone?: string | null;
  inviteCode: string;
  inviteLink: string;
  inviteOpened: boolean;
  deviceType?: string | null;
  attending?: boolean | null;
  guestCount?: number | null;
}

type GuestRoleOption = "family" | "friends" | "bride_side" | "groom_side" | "vip";

const ROLE_OPTIONS: { value: GuestRoleOption | ""; label: string }[] = [
  { value: "",           label: "No role" },
  { value: "bride_side", label: "Bride's side" },
  { value: "groom_side", label: "Groom's side" },
  { value: "family",     label: "Family" },
  { value: "friends",    label: "Friends" },
  { value: "vip",        label: "VIP" },
];

interface GuestApiResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string; guest_name: string; family_name: string | null; phone: string | null;
    invite_code: string; invite_link: string; invite_opened: boolean;
    device_type: string | null; attending?: boolean | null; guest_count?: number | null;
    guest_role?: GuestRoleOption | null;
  };
}

interface GuestTableProps {
  initialRows: GuestTableRow[];
  weddingId: string;
  onRefreshAnalytics?: () => Promise<void> | void;
}

interface GuestFormState { guestName: string; familyName: string; phone: string; guestRole: GuestRoleOption | ""; }
const emptyForm: GuestFormState = { guestName: "", familyName: "", phone: "", guestRole: "" };

function normalizeRow(data: NonNullable<GuestApiResponse["data"]>): GuestTableRow {
  return { id: data.id, guestName: data.guest_name, familyName: data.family_name, phone: data.phone, inviteCode: data.invite_code, inviteLink: data.invite_link, inviteOpened: data.invite_opened, deviceType: data.device_type, attending: data.attending ?? null, guestCount: data.guest_count ?? null };
}
function sortRows(rows: GuestTableRow[]) {
  return rows.slice().sort((a, b) => `${a.guestName} ${a.familyName ?? ""}`.trim().toLowerCase().localeCompare(`${b.guestName} ${b.familyName ?? ""}`.trim().toLowerCase()));
}

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", background: "var(--color-surface-soft)",
  border: "1.5px solid var(--color-border-medium)", borderRadius: "12px",
  padding: "0.75rem 1rem", color: "var(--color-text-primary)", fontSize: "0.9375rem",
  outline: "none", fontFamily: "var(--font-body), sans-serif",
};

export function GuestTable({ initialRows, weddingId, onRefreshAnalytics }: GuestTableProps) {
  const [rows, setRows] = useState(() => sortRows(initialRows));
  const [form, setForm] = useState<GuestFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField(k: keyof GuestFormState, v: string) { setForm((f) => ({ ...f, [k]: v })); }
  function resetForm() { setForm(emptyForm); setEditingId(null); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setIsSubmitting(true); setStatusMsg(null);
    try {
      const endpoint = editingId ? `/api/admin/guests/${editingId}` : "/api/admin/guests";
      const res = await fetch(endpoint, { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weddingId, guestName: form.guestName, familyName: form.familyName, phone: form.phone, guestRole: form.guestRole || null }) });
      const payload = (await res.json()) as GuestApiResponse;
      if (!res.ok || !payload.success || !payload.data) throw new Error(payload.message ?? "Unable to save.");
      const row = normalizeRow(payload.data);
      startTransition(() => { setRows((cur) => sortRows(editingId ? cur.map((r) => r.id === editingId ? row : r) : [...cur, row])); });
      resetForm(); setStatusMsg({ success: true, message: editingId ? "Guest updated." : "Guest added." });
      await onRefreshAnalytics?.();
    } catch (err) { setStatusMsg({ success: false, message: err instanceof Error ? err.message : "Error." }); }
    finally { setIsSubmitting(false); }
  }

  async function handleDelete(row: GuestTableRow) {
    if (!window.confirm(`Delete ${row.guestName}?`)) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/guests/${row.id}`, { method: "DELETE" });
      const p = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !p.success) throw new Error(p.message ?? "Error");
      startTransition(() => { setRows((cur) => cur.filter((r) => r.id !== row.id)); });
      setStatusMsg({ success: true, message: "Guest removed." });
      if (editingId === row.id) resetForm();
      await onRefreshAnalytics?.();
    } catch (err) { setStatusMsg({ success: false, message: err instanceof Error ? err.message : "Error." }); }
    finally { setIsSubmitting(false); }
  }

  async function handleCopy(row: GuestTableRow) {
    try { await navigator.clipboard.writeText(row.inviteLink); setStatusMsg({ success: true, message: `Copied link for ${row.guestName}.` }); }
    catch { setStatusMsg({ success: false, message: "Cannot copy from this browser." }); }
  }

  async function handleRegenerate(row: GuestTableRow) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/guests/${row.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weddingId, guestName: row.guestName, familyName: row.familyName, phone: row.phone, regenerateInviteCode: true }) });
      const p = (await res.json()) as GuestApiResponse;
      if (!res.ok || !p.success || !p.data) throw new Error(p.message ?? "Error");
      startTransition(() => { setRows((cur) => sortRows(cur.map((r) => r.id === row.id ? normalizeRow(p.data!) : r))); });
      setStatusMsg({ success: true, message: "Invite link regenerated." });
    } catch (err) { setStatusMsg({ success: false, message: err instanceof Error ? err.message : "Error." }); }
    finally { setIsSubmitting(false); }
  }

  const btnSm: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: "9999px", padding: "6px 14px", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", border: "1.5px solid var(--color-border-medium)", background: "#fff", color: "var(--color-text-secondary)" };
  const btnDanger: React.CSSProperties = { ...btnSm, border: "1.5px solid #fca5a5", background: "#fef2f2", color: "#b91c1c" };

  return (
    <div className="space-y-5">

      {/* Add / edit form */}
      <Card noPad>
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <SectionLabel>Guest management</SectionLabel>
              <h2 className="font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>Guest list</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase" style={{ letterSpacing: "0.2em", background: "var(--color-surface-dark)", color: "#fff" }}>
                {rows.length} guests
              </span>
              <a href={`/api/admin/rsvp-export?weddingId=${encodeURIComponent(weddingId)}`} style={btnSm}>
                <Link2 className="h-3.5 w-3.5" /> Export CSV
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Guest name *", field: "guestName" as const, placeholder: "John" },
              { label: "Family name",  field: "familyName" as const, placeholder: "Family" },
              { label: "Phone",        field: "phone" as const,       placeholder: "+91 00000 00000" },
            ].map(({ label, field, placeholder }) => (
              <div key={field} className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>{label}</label>
                <input style={inputStyle} value={form[field]} onChange={(e) => setField(field, e.target.value)} placeholder={placeholder} required={field === "guestName"} />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>Role</label>
              <select style={inputStyle} value={form.guestRole} onChange={(e) => setField("guestRole", e.target.value)}>
                {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-3">
              <Btn type="submit" variant="primary" size="sm" loading={isSubmitting}>
                {editingId ? <><Save className="h-3.5 w-3.5" /> Save guest</> : <><Plus className="h-3.5 w-3.5" /> Add guest</>}
              </Btn>
              {editingId && <Btn type="button" variant="ghost" size="sm" onClick={resetForm}><X className="h-3.5 w-3.5" /> Cancel</Btn>}
            </div>
          </form>

          {statusMsg && (
            <p className="rounded-xl px-4 py-3 text-sm" style={{ background: statusMsg.success ? "rgba(107,142,110,0.1)" : "#fef2f2", color: statusMsg.success ? "var(--color-sage)" : "#b91c1c", border: `1px solid ${statusMsg.success ? "rgba(107,142,110,0.2)" : "#fca5a5"}` }}>
              {statusMsg.message}
            </p>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto" style={{ borderTop: "1px solid var(--color-border)" }}>
          <table className="min-w-full text-left text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: "var(--color-surface-soft)" }}>
                {["Guest", "Invite code", "Opened", "RSVP", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5" style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600, borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} style={{ background: i % 2 === 0 ? "#ffffff" : "var(--color-surface-soft)" }}>
                  <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>{row.guestName}{row.familyName ? ` ${row.familyName}` : ""}</p>
                    {row.phone && <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{row.phone}</p>}
                  </td>
                  <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <p className="font-mono text-xs" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.1em" }}>{row.inviteCode}</p>
                    <a href={row.inviteLink} target="_blank" rel="noreferrer" className="text-xs mt-0.5 block" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>Open invite</a>
                  </td>
                  <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ background: row.inviteOpened ? "rgba(107,142,110,0.12)" : "var(--color-surface-muted)", color: row.inviteOpened ? "var(--color-sage)" : "var(--color-text-muted)", border: `1px solid ${row.inviteOpened ? "rgba(107,142,110,0.25)" : "var(--color-border)"}` }}>
                      {row.inviteOpened ? "Opened" : "Pending"}
                    </span>
                    {row.deviceType && <p className="text-xs mt-1 capitalize" style={{ color: "var(--color-text-muted)" }}>{row.deviceType}</p>}
                  </td>
                  <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {row.attending == null ? <span style={{ color: "var(--color-text-muted)" }} className="text-sm">—</span>
                      : row.attending ? <span className="text-sm font-medium" style={{ color: "var(--color-sage)" }}>Attending ({row.guestCount})</span>
                      : <span className="text-sm" style={{ color: "var(--color-blush)" }}>Declined</span>
                    }
                  </td>
                  <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <div className="flex flex-wrap gap-1.5">
                      <button style={btnSm} onClick={() => { setEditingId(row.id); setForm({ guestName: row.guestName, familyName: row.familyName ?? "", phone: row.phone ?? "", guestRole: "" }); setStatusMsg(null); }} type="button"><Pencil className="h-3 w-3" /> Edit</button>
                      <button style={btnSm} onClick={() => handleCopy(row)} type="button"><Copy className="h-3 w-3" /> Copy</button>
                      <button style={btnSm} onClick={() => handleRegenerate(row)} disabled={isSubmitting} type="button"><RefreshCcw className="h-3 w-3" /> Regen</button>
                      <button style={btnDanger} onClick={() => handleDelete(row)} disabled={isSubmitting} type="button"><Trash2 className="h-3 w-3" /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default GuestTable;
