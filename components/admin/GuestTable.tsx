"use client";

import type { FormEvent } from "react";
import { startTransition, useRef, useMemo, useState, useEffect } from "react";
import { authFetch, storeToken } from "@/lib/client/token";
import { Copy, Download, FileUp, Link2, MessageCircle, Pencil, Plus, RefreshCcw, Save, Share2, Trash2, X } from "lucide-react";
import { Card, SectionLabel, Btn } from "@/components/ui";

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

interface ImportResult {
  added: number;
  skipped: number;
  errors: string[];
}

interface GuestTableProps {
  initialRows: GuestTableRow[];
  weddingId: string;
  onRefreshAnalytics?: () => Promise<void> | void;
}

interface GuestFormState { guestName: string; familyName: string; phone: string; guestRole: GuestRoleOption | ""; }
const emptyForm: GuestFormState = { guestName: "", familyName: "", phone: "", guestRole: "" };

function normalizeRow(data: NonNullable<GuestApiResponse["data"]>): GuestTableRow {
  return {
    id: data.id, guestName: data.guest_name, familyName: data.family_name,
    phone: data.phone, inviteCode: data.invite_code, inviteLink: data.invite_link,
    inviteOpened: data.invite_opened, deviceType: data.device_type,
    attending: data.attending ?? null, guestCount: data.guest_count ?? null,
  };
}

function sortRows(rows: GuestTableRow[]) {
  return rows.slice().sort((a, b) =>
    `${a.guestName} ${a.familyName ?? ""}`.trim().toLowerCase()
      .localeCompare(`${b.guestName} ${b.familyName ?? ""}`.trim().toLowerCase())
  );
}

function escapeCsv(v: string | null | undefined) {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", background: "var(--color-surface-soft)",
  border: "1.5px solid var(--color-border-medium)", borderRadius: "12px",
  padding: "0.75rem 1rem", color: "var(--color-text-primary)", fontSize: "0.9375rem",
  outline: "none", fontFamily: "var(--font-body), sans-serif",
};

const btnSm: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, borderRadius: "9999px",
  padding: "6px 14px", fontSize: "0.6rem", letterSpacing: "0.18em",
  textTransform: "uppercase", fontWeight: 600, cursor: "pointer",
  border: "1.5px solid var(--color-border-medium)", background: "#fff",
  color: "var(--color-text-secondary)",
};

const btnDanger: React.CSSProperties = {
  ...btnSm, border: "1.5px solid #fca5a5", background: "#fef2f2", color: "#b91c1c",
};

const btnGreen: React.CSSProperties = {
  ...btnSm, border: "1.5px solid rgba(107,142,110,0.35)",
  background: "rgba(107,142,110,0.08)", color: "var(--color-sage)",
};

export function GuestTable({ initialRows, weddingId, onRefreshAnalytics }: GuestTableProps) {
  const [rows, setRows]               = useState(() => sortRows(initialRows));
  const [form, setForm]               = useState<GuestFormState>(emptyForm);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [statusMsg, setStatusMsg]     = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importing, setImporting]     = useState(false);
  const [shareOpenId, setShareOpenId] = useState<string | null>(null);
  const fileInputRef                  = useRef<HTMLInputElement>(null);
  const shareRef                      = useRef<HTMLDivElement>(null);

  // Close share popover on outside click
  useEffect(() => {
    if (!shareOpenId) return;
    function handleOutside(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [shareOpenId]);

  // Share URL builders
  function shareWhatsApp(link: string, name: string) {
    const text = encodeURIComponent(`Hi ${name}! You're invited 🎉 Open your personalised invitation here: ${link}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }
  function shareTelegram(link: string, name: string) {
    const text = encodeURIComponent(`Hi ${name}! You're invited 🎉 Open your personalised invitation: ${link}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`, "_blank", "noopener,noreferrer");
  }
  function shareSms(link: string, name: string) {
    const body = encodeURIComponent(`Hi ${name}! You're invited — open your personalised invitation here: ${link}`);
    window.open(`sms:?&body=${body}`, "_blank", "noopener,noreferrer");
  }

  // On mount: capture token from URL param (set by login route) and store it
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("_t");
      if (t) {
        storeToken(t);
        // Clean the token from the URL without reloading
        params.delete("_t");
        const clean = params.toString();
        const newUrl = window.location.pathname + (clean ? `?${clean}` : "");
        window.history.replaceState({}, "", newUrl);
      }
    } catch { /* ignore */ }
  }, []);

  function setField(k: keyof GuestFormState, v: string) { setForm((f) => ({ ...f, [k]: v })); }
  function resetForm() { setForm(emptyForm); setEditingId(null); }

  // ── Add / Edit guest ──────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const endpoint = editingId ? `/api/admin/guests/${editingId}` : "/api/admin/guests";
      const res = await authFetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingId, guestName: form.guestName, familyName: form.familyName, phone: form.phone, guestRole: form.guestRole || null }),
      });
      const payload = (await res.json()) as GuestApiResponse;
      if (!res.ok || !payload.success || !payload.data) throw new Error(payload.message ?? "Unable to save.");
      const row = normalizeRow(payload.data);
      startTransition(() => {
        setRows((cur) => sortRows(editingId ? cur.map((r) => r.id === editingId ? row : r) : [...cur, row]));
      });
      resetForm();
      setStatusMsg({ success: true, message: editingId ? "Guest updated." : "Guest added." });
      await onRefreshAnalytics?.();
    } catch (err) {
      setStatusMsg({ success: false, message: err instanceof Error ? err.message : "Error." });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Delete guest ──────────────────────────────────────────────────────────
  async function handleDelete(row: GuestTableRow) {
    if (!window.confirm(`Delete ${row.guestName}?`)) return;
    setIsSubmitting(true);
    try {
      const res = await authFetch(`/api/admin/guests/${row.id}`, { method: "DELETE" });
      const p = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !p.success) throw new Error(p.message ?? "Error");
      startTransition(() => { setRows((cur) => cur.filter((r) => r.id !== row.id)); });
      setStatusMsg({ success: true, message: "Guest removed." });
      if (editingId === row.id) resetForm();
      await onRefreshAnalytics?.();
    } catch (err) {
      setStatusMsg({ success: false, message: err instanceof Error ? err.message : "Error." });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Copy invite link ───────────────────────────────────────────────────────
  async function handleCopy(row: GuestTableRow) {
    try {
      await navigator.clipboard.writeText(row.inviteLink);
      setStatusMsg({ success: true, message: `Copied link for ${row.guestName}.` });
    } catch {
      setStatusMsg({ success: false, message: "Cannot copy from this browser." });
    }
  }

  // ── Regenerate invite code ────────────────────────────────────────────────
  async function handleRegenerate(row: GuestTableRow) {
    setIsSubmitting(true);
    try {
      const res = await authFetch(`/api/admin/guests/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingId, guestName: row.guestName, familyName: row.familyName, phone: row.phone, regenerateInviteCode: true }),
      });
      const p = (await res.json()) as GuestApiResponse;
      if (!res.ok || !p.success || !p.data) throw new Error(p.message ?? "Error");
      startTransition(() => { setRows((cur) => sortRows(cur.map((r) => r.id === row.id ? normalizeRow(p.data!) : r))); });
      setStatusMsg({ success: true, message: "Invite link regenerated." });
    } catch (err) {
      setStatusMsg({ success: false, message: err instanceof Error ? err.message : "Error." });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Export RSVP CSV (with credentials) ───────────────────────────────────
  async function handleExportRsvp() {
    try {
      setStatusMsg(null);
      const res = await authFetch(`/api/admin/rsvp-export?weddingId=${encodeURIComponent(weddingId)}`);
      if (!res.ok) throw new Error("Export failed — please try again.");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "surihana-rsvp-export.csv";
      a.click();
      URL.revokeObjectURL(url);
      setStatusMsg({ success: true, message: "RSVP list exported." });
    } catch (err) {
      setStatusMsg({ success: false, message: err instanceof Error ? err.message : "Export failed." });
    }
  }

  // ── Export invite links CSV (client-side, no API needed) ─────────────────
  function handleExportLinks() {
    const header = ["Guest Name", "Family Name", "Phone", "Invite Code", "Invite Link", "Status"].join(",");
    const lines  = rows.map((r) =>
      [
        escapeCsv(r.guestName),
        escapeCsv(r.familyName),
        escapeCsv(r.phone),
        escapeCsv(r.inviteCode),
        escapeCsv(r.inviteLink),
        escapeCsv(r.inviteOpened ? "Opened" : "Not opened"),
      ].join(",")
    );
    const csv  = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "surihana-invite-links.csv";
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ success: true, message: `Exported ${rows.length} invite links.` });
  }

  // ── Import guests from CSV ────────────────────────────────────────────────
  // Expected CSV columns (first row = header, case-insensitive):
  //   guest_name (required), family_name, phone, guest_role
  async function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";

    setImporting(true);
    setStatusMsg(null);

    try {
      const text  = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) throw new Error("CSV must have a header row and at least one guest row.");

      // Parse header
      const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase().replace(/\s+/g, "_"));
      const nameIdx   = headers.indexOf("guest_name");
      const familyIdx = headers.indexOf("family_name");
      const phoneIdx  = headers.indexOf("phone");
      const roleIdx   = headers.indexOf("guest_role");

      if (nameIdx === -1) throw new Error("CSV must have a 'guest_name' column.");

      const validRoles = new Set(["family", "friends", "bride_side", "groom_side", "vip"]);
      const result: ImportResult = { added: 0, skipped: 0, errors: [] };

      for (let i = 1; i < lines.length; i++) {
        // Handle quoted CSV values
        const cols  = lines[i].match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) ?? lines[i].split(",");
        const clean = (idx: number) => (cols[idx] ?? "").replace(/^"|"$/g, "").trim();

        const guestName = clean(nameIdx);
        if (!guestName || guestName.length < 2) {
          result.skipped++;
          continue;
        }

        const familyName = familyIdx !== -1 ? clean(familyIdx) : "";
        const phone      = phoneIdx  !== -1 ? clean(phoneIdx)  : "";
        const rawRole    = roleIdx   !== -1 ? clean(roleIdx).toLowerCase() : "";
        const guestRole  = validRoles.has(rawRole) ? rawRole : null;

        try {
          const res = await authFetch("/api/admin/guests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weddingId, guestName, familyName: familyName || null, phone: phone || null, guestRole }),
          });
          const payload = (await res.json()) as GuestApiResponse;
          if (res.ok && payload.success && payload.data) {
            startTransition(() => {
              setRows((cur) => sortRows([...cur, normalizeRow(payload.data!)]));
            });
            result.added++;
          } else {
            result.errors.push(`Row ${i + 1} (${guestName}): ${payload.message ?? "Failed"}`);
            result.skipped++;
          }
        } catch {
          result.errors.push(`Row ${i + 1} (${guestName}): Network error`);
          result.skipped++;
        }
      }

      await onRefreshAnalytics?.();

      const msg = `Imported ${result.added} guest${result.added !== 1 ? "s" : ""}` +
        (result.skipped > 0 ? `, ${result.skipped} skipped` : "") +
        (result.errors.length > 0 ? `. Errors: ${result.errors.slice(0, 2).join("; ")}` : ".");
      setStatusMsg({ success: result.added > 0, message: msg });
    } catch (err) {
      setStatusMsg({ success: false, message: err instanceof Error ? err.message : "Import failed." });
    } finally {
      setImporting(false);
    }
  }

  // ── Download CSV template ──────────────────────────────────────────────────
  function handleDownloadTemplate() {
    const csv = [
      "guest_name,family_name,phone,guest_role",
      "John,Smith,+91 98765 43210,friends",
      "Priya,Sharma,+91 87654 32109,bride_side",
      "Ahmed,Khan,,family",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "guest-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <Card noPad>
        <div className="p-6 space-y-5">

          {/* ── Header row ── */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <SectionLabel>Guest management</SectionLabel>
              <h2 className="font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>
                Guest list
              </h2>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase"
                style={{ letterSpacing: "0.2em", background: "var(--color-surface-dark)", color: "#fff" }}>
                {rows.length} guests
              </span>

              {/* Import CSV */}
              <button type="button" style={btnSm} onClick={() => fileInputRef.current?.click()} disabled={importing}>
                <FileUp className="h-3.5 w-3.5" />
                {importing ? "Importing…" : "Import CSV"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                onChange={handleImportCsv}
              />

              {/* Download template */}
              <button type="button" style={btnSm} onClick={handleDownloadTemplate}>
                <Download className="h-3.5 w-3.5" /> Template
              </button>

              {/* Export invite links */}
              <button type="button" style={btnGreen} onClick={handleExportLinks}>
                <Link2 className="h-3.5 w-3.5" /> Export Links
              </button>

              {/* Export RSVP CSV */}
              <button type="button" style={btnSm} onClick={handleExportRsvp}>
                <Download className="h-3.5 w-3.5" /> Export RSVP
              </button>
            </div>
          </div>

          {/* ── Import instructions ── */}
          <div style={{ background: "var(--color-surface-soft)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "10px 14px" }}>
            <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", fontFamily: "var(--font-body), sans-serif", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--color-text-secondary)" }}>Import:</strong> Upload a CSV with columns{" "}
              <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: 4, fontSize: "0.7rem" }}>guest_name</code>,{" "}
              <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: 4, fontSize: "0.7rem" }}>family_name</code>,{" "}
              <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: 4, fontSize: "0.7rem" }}>phone</code>,{" "}
              <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: 4, fontSize: "0.7rem" }}>guest_role</code>{" "}
              — download the template to get started.{" "}
              <strong style={{ color: "var(--color-text-secondary)" }}>Export Links:</strong> Downloads all invite links as a CSV you can share.{" "}
              <strong style={{ color: "var(--color-text-secondary)" }}>Export RSVP:</strong> Full RSVP status report.
            </p>
          </div>

          {/* ── Add / Edit form ── */}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Guest name *", field: "guestName" as const, placeholder: "John" },
              { label: "Family name",  field: "familyName" as const, placeholder: "Family" },
              { label: "Phone",        field: "phone" as const,      placeholder: "+91 00000 00000" },
            ].map(({ label, field, placeholder }) => (
              <div key={field} className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase"
                  style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>{label}</label>
                <input style={inputStyle} value={form[field]}
                  onChange={(e) => setField(field, e.target.value)}
                  placeholder={placeholder} required={field === "guestName"} />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase"
                style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>Role</label>
              <select style={inputStyle} value={form.guestRole}
                onChange={(e) => setField("guestRole", e.target.value)}>
                {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-3">
              <Btn type="submit" variant="primary" size="sm" loading={isSubmitting}>
                {editingId
                  ? <><Save className="h-3.5 w-3.5" /> Save guest</>
                  : <><Plus className="h-3.5 w-3.5" /> Add guest</>}
              </Btn>
              {editingId && (
                <Btn type="button" variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-3.5 w-3.5" /> Cancel
                </Btn>
              )}
            </div>
          </form>

          {statusMsg && (
            <p className="rounded-xl px-4 py-3 text-sm" style={{
              background: statusMsg.success ? "rgba(107,142,110,0.1)" : "#fef2f2",
              color:      statusMsg.success ? "var(--color-sage)"      : "#b91c1c",
              border:     `1px solid ${statusMsg.success ? "rgba(107,142,110,0.2)" : "#fca5a5"}`,
            }}>
              {statusMsg.message}
            </p>
          )}
        </div>

        {/* ── Guest table ── */}
        <div className="overflow-x-auto" style={{ borderTop: "1px solid var(--color-border)" }}>
          {rows.length === 0 ? (
            <div className="py-12 text-center" style={{ color: "var(--color-text-muted)" }}>
              <p className="text-sm">No guests yet. Add one above or import a CSV.</p>
            </div>
          ) : (
            <table className="min-w-full text-left text-sm"
              style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: "var(--color-surface-soft)" }}>
                  {["Guest", "Invite link", "Opened", "RSVP", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5" style={{
                      fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
                      color: "var(--color-text-muted)", fontWeight: 600,
                      borderBottom: "1px solid var(--color-border)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? "#ffffff" : "var(--color-surface-soft)" }}>
                    <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
                        {row.guestName}{row.familyName ? ` ${row.familyName}` : ""}
                      </p>
                      {row.phone && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{row.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)", maxWidth: 260 }}>
                      <p className="font-mono text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>
                        {row.inviteLink}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <button type="button" onClick={() => handleCopy(row)}
                          style={{ fontSize: "0.65rem", color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          Copy
                        </button>
                        <a href={row.inviteLink} target="_blank" rel="noreferrer"
                          style={{ fontSize: "0.65rem", color: "var(--color-accent)", textDecoration: "underline" }}>
                          Open
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{
                        background: row.inviteOpened ? "rgba(107,142,110,0.12)" : "var(--color-surface-muted)",
                        color:      row.inviteOpened ? "var(--color-sage)"       : "var(--color-text-muted)",
                        border:     `1px solid ${row.inviteOpened ? "rgba(107,142,110,0.25)" : "var(--color-border)"}`,
                      }}>
                        {row.inviteOpened ? "Opened" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                      {row.attending == null
                        ? <span style={{ color: "var(--color-text-muted)" }}>—</span>
                        : row.attending
                          ? <span className="text-sm font-medium" style={{ color: "var(--color-sage)" }}>Attending ({row.guestCount})</span>
                          : <span className="text-sm" style={{ color: "var(--color-blush)" }}>Declined</span>
                      }
                    </td>
                    <td className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" style={btnSm}
                          onClick={() => { setEditingId(row.id); setForm({ guestName: row.guestName, familyName: row.familyName ?? "", phone: row.phone ?? "", guestRole: "" }); setStatusMsg(null); }}>
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button type="button" style={btnSm}
                          onClick={() => handleRegenerate(row)} disabled={isSubmitting}>
                          <RefreshCcw className="h-3 w-3" /> Regen
                        </button>
                        <button type="button" style={btnDanger}
                          onClick={() => handleDelete(row)} disabled={isSubmitting}>
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>

                        {/* Share button + popover */}
                        <div ref={shareOpenId === row.id ? shareRef : undefined}
                          style={{ position: "relative", display: "inline-block" }}>
                          <button
                            type="button"
                            style={{ ...btnSm, borderColor: "rgba(107,142,110,0.35)", background: "rgba(107,142,110,0.08)", color: "var(--color-sage)" }}
                            onClick={() => setShareOpenId(shareOpenId === row.id ? null : row.id)}
                          >
                            <Share2 className="h-3 w-3" /> Share
                          </button>

                          {shareOpenId === row.id && (
                            <div style={{
                              position: "absolute", bottom: "calc(100% + 8px)", right: 0,
                              zIndex: 50, minWidth: 180,
                              background: "#fff",
                              border: "1.5px solid var(--color-border-medium)",
                              borderRadius: 14,
                              boxShadow: "0 8px 32px rgba(18,11,14,.12), 0 2px 8px rgba(18,11,14,.07)",
                              padding: "8px",
                              display: "flex", flexDirection: "column", gap: 4,
                            }}>
                              {/* Popover arrow */}
                              <div aria-hidden style={{
                                position: "absolute", bottom: -7, right: 14,
                                width: 12, height: 12,
                                background: "#fff",
                                border: "1.5px solid var(--color-border-medium)",
                                borderTop: "none", borderLeft: "none",
                                transform: "rotate(45deg)",
                              }} />

                              <p style={{
                                fontSize: ".55rem", letterSpacing: ".22em",
                                textTransform: "uppercase", fontWeight: 700,
                                color: "var(--color-text-muted)",
                                padding: "4px 8px 2px",
                              }}>
                                Send invite to {row.guestName.split(" ")[0]}
                              </p>

                              {/* WhatsApp */}
                              <button
                                type="button"
                                onClick={() => { shareWhatsApp(row.inviteLink, row.guestName.split(" ")[0]!); setShareOpenId(null); }}
                                style={{
                                  display: "flex", alignItems: "center", gap: 9,
                                  padding: "9px 12px", borderRadius: 10,
                                  border: "none", background: "transparent",
                                  cursor: "pointer", width: "100%", textAlign: "left",
                                  transition: "background .15s ease",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#f0fdf4")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                              >
                                {/* WhatsApp icon */}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                <span style={{ fontSize: ".78rem", fontWeight: 600, color: "#128C7E" }}>WhatsApp</span>
                              </button>

                              {/* Telegram */}
                              <button
                                type="button"
                                onClick={() => { shareTelegram(row.inviteLink, row.guestName.split(" ")[0]!); setShareOpenId(null); }}
                                style={{
                                  display: "flex", alignItems: "center", gap: 9,
                                  padding: "9px 12px", borderRadius: 10,
                                  border: "none", background: "transparent",
                                  cursor: "pointer", width: "100%", textAlign: "left",
                                  transition: "background .15s ease",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#f0f9ff")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                              >
                                {/* Telegram icon */}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#2AABEE" aria-hidden>
                                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.01 9.483c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 14.49l-2.95-.924c-.642-.2-.655-.642.134-.953l11.527-4.448c.535-.194 1.003.13.97.082z"/>
                                </svg>
                                <span style={{ fontSize: ".78rem", fontWeight: 600, color: "#2AABEE" }}>Telegram</span>
                              </button>

                              {/* SMS */}
                              <button
                                type="button"
                                onClick={() => { shareSms(row.inviteLink, row.guestName.split(" ")[0]!); setShareOpenId(null); }}
                                style={{
                                  display: "flex", alignItems: "center", gap: 9,
                                  padding: "9px 12px", borderRadius: 10,
                                  border: "none", background: "transparent",
                                  cursor: "pointer", width: "100%", textAlign: "left",
                                  transition: "background .15s ease",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#faf5ff")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                              >
                                <MessageCircle size={16} style={{ color: "#7c3aed", flexShrink: 0 }} />
                                <span style={{ fontSize: ".78rem", fontWeight: 600, color: "#7c3aed" }}>SMS</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}

export default GuestTable;
