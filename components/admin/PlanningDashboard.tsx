"use client";

/**
 * PlanningDashboard
 * Self-contained planning layer for the couple/admin dashboard.
 * Contains 10 planning modules in its own sub-tab navigation.
 * Admin-only — guests and family never see this.
 */

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { authFetch } from "@/lib/client/token";
import {
  DollarSign, ShoppingBag, BedDouble, Car, Users,
  UtensilsCrossed, Music, Palette, CheckSquare, Gift,
  FileText, MapPin,
  Plus, Trash2, Edit2, Check, X, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { weddingConfig } from "@/lib/config";

// ─────────────────────────────────────────────────────────────────────────────
// Shared style tokens
// ─────────────────────────────────────────────────────────────────────────────
const BF   = "var(--font-body), system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";
const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BG   = "#FAF8F6";
const W    = "#FFFFFF";
const BDR  = "#D0C0BC";

const inp: React.CSSProperties = {
  display: "block", width: "100%", background: W,
  border: `1.5px solid ${BDR}`, borderRadius: 10,
  padding: ".7rem 1rem", color: INK, fontSize: ".875rem",
  fontFamily: BF, outline: "none",
};

// ─────────────────────────────────────────────────────────────────────────────
// Planning sub-tabs
// ─────────────────────────────────────────────────────────────────────────────
type PlanTab =
  | "budget" | "shopping" | "accommodation" | "travel"
  | "party" | "catering" | "music" | "decor" | "tasks" | "gifts"
  | "legal" | "honeymoon";

const PLAN_TABS: Array<{ id: PlanTab; label: string; icon: React.ElementType; module: string }> = [
  { id: "budget",        label: "Budget",        icon: DollarSign,      module: "budget_items" },
  { id: "shopping",      label: "Shopping",      icon: ShoppingBag,     module: "shopping_items" },
  { id: "accommodation", label: "Accommodation", icon: BedDouble,       module: "guest_accommodations" },
  { id: "travel",        label: "Travel",        icon: Car,             module: "guest_travel" },
  { id: "party",         label: "Wedding party", icon: Users,           module: "wedding_party_members" },
  { id: "catering",      label: "Catering",      icon: UtensilsCrossed, module: "catering_menu" },
  { id: "music",         label: "Music",         icon: Music,           module: "wedding_music" },
  { id: "decor",         label: "Decor board",   icon: Palette,         module: "decor_ideas" },
  { id: "tasks",         label: "Tasks",         icon: CheckSquare,     module: "planning_tasks" },
  { id: "gifts",         label: "Gifts",         icon: Gift,            module: "gifts" },
  { id: "legal",         label: "Legal docs",    icon: FileText,        module: "legal_documents" },
  { id: "honeymoon",     label: "Honeymoon",     icon: MapPin,          module: "honeymoon_itinerary" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <p style={{ fontSize: ".58rem", fontWeight: 700, letterSpacing: ".38em", textTransform: "uppercase", color: ROSE, fontFamily: BF, marginBottom: ".375rem" }}>{eyebrow}</p>
      <h2 style={{ fontFamily: DF, fontSize: "clamp(1.25rem,3vw,1.875rem)", color: INK, lineHeight: 1.2 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF, marginTop: ".375rem" }}>{subtitle}</p>}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    green:  { bg: "rgba(107,142,110,0.1)",  text: "#166534", border: "rgba(107,142,110,0.3)"  },
    amber:  { bg: "rgba(217,119,6,0.1)",    text: "#92400E", border: "rgba(217,119,6,0.3)"    },
    red:    { bg: "#fef2f2",                text: "#b91c1c", border: "#fca5a5"                 },
    blue:   { bg: "rgba(59,130,246,0.1)",   text: "#1e40af", border: "rgba(59,130,246,0.3)"   },
    purple: { bg: "rgba(139,92,246,0.1)",   text: "#5b21b6", border: "rgba(139,92,246,0.3)"   },
    gray:   { bg: BG,                       text: INK3,      border: BDR                       },
  };
  const c = map[color] ?? map.gray!;
  return (
    <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 999, fontSize: ".65rem", fontWeight: 700, fontFamily: BF, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {label}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: W, border: `1px solid ${BDR}`, borderRadius: 14, padding: "1.125rem 1.25rem" }}>
      <p style={{ fontSize: ".68rem", color: INK3, fontFamily: BF, marginBottom: ".25rem" }}>{label}</p>
      <p style={{ fontFamily: DF, fontSize: "1.625rem", fontWeight: 700, color: INK, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, marginTop: ".25rem" }}>{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic CRUD hook
// ─────────────────────────────────────────────────────────────────────────────
function usePlanning<T extends Record<string, unknown>>(module: string) {
  const [rows,    setRows]    = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const weddingId = weddingConfig.id;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await authFetch(`/api/admin/planning?module=${module}&weddingId=${encodeURIComponent(weddingId)}`);
      const data = await res.json() as { success: boolean; data?: T[] };
      if (data.success) setRows(data.data ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [module, weddingId]);

  useEffect(() => { void fetch(); }, [fetch]);

  async function create(fields: Omit<T, "id" | "created_at">): Promise<T | null> {
    setSaving(true); setError(null);
    try {
      const res  = await authFetch("/api/admin/planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, wedding_id: weddingId, ...fields }),
      });
      const data = await res.json() as { success: boolean; data?: T; message?: string };
      if (!data.success) throw new Error(data.message ?? "Failed");
      if (data.data) setRows(r => [...r, data.data!]);
      return data.data ?? null;
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); return null; }
    finally { setSaving(false); }
  }

  async function update(id: string, fields: Partial<T>) {
    setSaving(true); setError(null);
    try {
      const res  = await authFetch("/api/admin/planning", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, id, ...fields }),
      });
      const data = await res.json() as { success: boolean; message?: string };
      if (!data.success) throw new Error(data.message ?? "Failed");
      setRows(r => r.map(x => x.id === id ? { ...x, ...fields } : x));
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  }

  async function remove(id: string) {
    setSaving(true); setError(null);
    try {
      const res  = await authFetch("/api/admin/planning", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, id }),
      });
      const data = await res.json() as { success: boolean; message?: string };
      if (!data.success) throw new Error(data.message ?? "Failed");
      setRows(r => r.filter(x => x.id !== id));
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  }

  return { rows, loading, saving, error, setError, create, update, remove };
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic table row with inline edit
// ─────────────────────────────────────────────────────────────────────────────
interface ColDef<T> {
  key:      string;
  label:    string;
  render?:  (row: T) => React.ReactNode;
  editable?: boolean;
  type?:    "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  options?: Array<{ value: string; label: string }>;
  width?:   string;
}

function PlanTable<T extends Record<string, unknown>>({
  rows, cols, saving, error, onUpdate, onDelete, setError,
  emptyLabel,
}: {
  rows:       T[];
  cols:       ColDef<T>[];
  saving:     boolean;
  error:      string | null;
  onUpdate:   (id: string, fields: Partial<T>) => Promise<void>;
  onDelete:   (id: string) => Promise<void>;
  setError:   (e: string | null) => void;
  emptyLabel: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm,  setEditForm]  = useState<Record<string, unknown>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startEdit(row: T) {
    setEditingId(row.id as string);
    setEditForm({ ...row });
    setError(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    await onUpdate(editingId, editForm as Partial<T>);
    setEditingId(null);
    setEditForm({});
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  }

  if (rows.length === 0) {
    return (
      <div style={{ padding: "2.5rem", textAlign: "center", background: BG, borderRadius: 14, border: `1.5px dashed ${BDR}` }}>
        <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", borderRadius: 14, border: `1px solid ${BDR}` }}>
      {error && (
        <div style={{ padding: "10px 14px", background: "#fef2f2", borderBottom: `1px solid #fca5a5`, fontSize: ".85rem", color: "#b91c1c", fontFamily: BF, display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b91c1c" }}><X size={14} /></button>
        </div>
      )}
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 640 }}>
        <thead>
          <tr style={{ background: BG }}>
            {cols.map(c => (
              <th key={c.key} style={{ padding: "10px 14px", fontSize: ".6rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, fontFamily: BF, textAlign: "left", borderBottom: `1px solid ${BDR}`, whiteSpace: "nowrap", width: c.width }}>
                {c.label}
              </th>
            ))}
            <th style={{ padding: "10px 14px", borderBottom: `1px solid ${BDR}`, width: 90 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const id        = row.id as string;
            const isEditing = editingId === id;
            const isSaving  = saving && isEditing;
            const isDeleting = deletingId === id;
            return (
              <tr key={id} style={{ background: i % 2 === 0 ? W : BG }}>
                {cols.map(c => (
                  <td key={c.key} style={{ padding: "10px 14px", borderBottom: `1px solid ${BDR}`, fontSize: ".85rem", color: INK, fontFamily: BF, verticalAlign: "top" }}>
                    {isEditing && c.editable !== false ? (
                      c.type === "select" ? (
                        <select
                          value={String(editForm[c.key] ?? "")}
                          onChange={e => setEditForm(f => ({ ...f, [c.key]: e.target.value }))}
                          style={{ ...inp, padding: ".4rem .75rem", fontSize: ".82rem" }}
                        >
                          {c.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : c.type === "checkbox" ? (
                        <input
                          type="checkbox"
                          checked={Boolean(editForm[c.key])}
                          onChange={e => setEditForm(f => ({ ...f, [c.key]: e.target.checked }))}
                        />
                      ) : c.type === "textarea" ? (
                        <textarea
                          value={String(editForm[c.key] ?? "")}
                          onChange={e => setEditForm(f => ({ ...f, [c.key]: e.target.value }))}
                          rows={2}
                          style={{ ...inp, resize: "none", padding: ".4rem .75rem", fontSize: ".82rem" }}
                        />
                      ) : (
                        <input
                          type={c.type ?? "text"}
                          value={String(editForm[c.key] ?? "")}
                          onChange={e => setEditForm(f => ({ ...f, [c.key]: c.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
                          style={{ ...inp, padding: ".4rem .75rem", fontSize: ".82rem" }}
                        />
                      )
                    ) : (
                      c.render ? c.render(row) : String(row[c.key] ?? "—")
                    )}
                  </td>
                ))}
                <td style={{ padding: "10px 14px", borderBottom: `1px solid ${BDR}`, verticalAlign: "top" }}>
                  <div style={{ display: "flex", gap: ".375rem" }}>
                    {isEditing ? (
                      <>
                        <button onClick={saveEdit} disabled={isSaving} style={{ padding: 6, borderRadius: 8, background: "rgba(107,142,110,0.1)", border: "1px solid rgba(107,142,110,0.3)", color: "#166534", cursor: "pointer", display: "grid", placeItems: "center" }}>
                          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        </button>
                        <button onClick={() => { setEditingId(null); setEditForm({}); }} style={{ padding: 6, borderRadius: 8, background: BG, border: `1px solid ${BDR}`, color: INK3, cursor: "pointer", display: "grid", placeItems: "center" }}>
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(row)} style={{ padding: 6, borderRadius: 8, background: BG, border: `1px solid ${BDR}`, color: INK3, cursor: "pointer", display: "grid", placeItems: "center" }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(id)} disabled={isDeleting} style={{ padding: 6, borderRadius: 8, background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", cursor: "pointer", display: "grid", placeItems: "center" }}>
                          {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add form wrapper
// ─────────────────────────────────────────────────────────────────────────────
function AddForm({ fields, onSubmit, saving, label }: {
  fields:   Array<{ key: string; label: string; type?: "text"|"number"|"date"|"select"|"textarea"|"checkbox"; options?: Array<{value:string;label:string}>; placeholder?: string; required?: boolean }>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  saving:   boolean;
  label:    string;
}) {
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState<Record<string, unknown>>({});
  const [err,  setErr]    = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    await onSubmit(form);
    setForm({});
    setOpen(false);
  }

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 999, background: open ? BG : ROSE, color: open ? INK : W, border: `1.5px solid ${open ? BDR : ROSE}`, fontSize: ".78rem", fontWeight: 700, fontFamily: BF, cursor: "pointer" }}
      >
        {open ? <><X size={14} /> Cancel</> : <><Plus size={14} /> {label}</>}
      </button>

      {open && (
        <form onSubmit={handleSubmit} style={{ marginTop: "1rem", background: BG, border: `1px solid ${BDR}`, borderRadius: 16, padding: "1.25rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          {fields.map(f => (
            <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: ".375rem", gridColumn: f.type === "textarea" ? "1 / -1" : undefined }}>
              <label style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, fontFamily: BF }}>
                {f.label}{f.required && " *"}
              </label>
              {f.type === "select" ? (
                <select
                  required={f.required}
                  value={String(form[f.key] ?? "")}
                  onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                  style={inp}
                >
                  <option value="">Select…</option>
                  {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  placeholder={f.placeholder}
                  required={f.required}
                  rows={2}
                  value={String(form[f.key] ?? "")}
                  onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                  style={{ ...inp, resize: "none" }}
                />
              ) : f.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={Boolean(form[f.key])}
                  onChange={e => setForm(x => ({ ...x, [f.key]: e.target.checked }))}
                  style={{ width: 18, height: 18, marginTop: ".375rem" }}
                />
              ) : (
                <input
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  required={f.required}
                  value={String(form[f.key] ?? "")}
                  onChange={e => setForm(x => ({ ...x, [f.key]: f.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
                  style={inp}
                />
              )}
            </div>
          ))}

          {err && <p style={{ gridColumn: "1/-1", padding: "8px 12px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: ".82rem", color: "#b91c1c", fontFamily: BF }}>{err}</p>}

          <div style={{ gridColumn: "1/-1" }}>
            <button type="submit" disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 999, background: ROSE, color: W, border: "none", fontSize: ".78rem", fontWeight: 700, fontFamily: BF, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BUDGET TRACKER
// ─────────────────────────────────────────────────────────────────────────────
type BudgetItem = { id: string; category: string; vendor: string; estimated_cost: number; actual_cost: number; deposit_paid: number; balance_remaining: number; due_date: string; notes: string; created_at: string };

const BUDGET_CATEGORIES = ["Venue","Catering","Decor","Photography","Videography","Clothing","Jewelry","Entertainment","Miscellaneous"];

function BudgetTracker() {
  const { rows, loading, saving, error, setError, create, update, remove } = usePlanning<BudgetItem>("budget_items");

  const totalEstimated = rows.reduce((a, r) => a + (r.estimated_cost || 0), 0);
  const totalActual    = rows.reduce((a, r) => a + (r.actual_cost || 0), 0);
  const totalDeposit   = rows.reduce((a, r) => a + (r.deposit_paid || 0), 0);
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const cols: ColDef<BudgetItem>[] = [
    { key: "category",       label: "Category",      type: "select", options: BUDGET_CATEGORIES.map(c => ({ value: c, label: c })), render: r => <Badge label={r.category} color="blue" /> },
    { key: "vendor",         label: "Vendor",        type: "text" },
    { key: "estimated_cost", label: "Estimated",     type: "number", render: r => fmt(r.estimated_cost) },
    { key: "actual_cost",    label: "Actual",        type: "number", render: r => fmt(r.actual_cost) },
    { key: "deposit_paid",   label: "Deposit paid",  type: "number", render: r => fmt(r.deposit_paid) },
    { key: "balance_remaining", label: "Balance",    editable: false, render: r => <span style={{ color: r.balance_remaining > 0 ? ROSE : "#166534", fontWeight: 600 }}>{fmt(r.balance_remaining)}</span> },
    { key: "due_date",       label: "Due date",      type: "date" },
    { key: "notes",          label: "Notes",         type: "text" },
  ];

  return (
    <div>
      <SectionHeader eyebrow="Planning" title="Budget tracker" subtitle="Track spending across all wedding categories." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard label="Total estimated" value={fmt(totalEstimated)} />
        <StatCard label="Total spent"     value={fmt(totalActual)} />
        <StatCard label="Total deposits"  value={fmt(totalDeposit)} />
      </div>
      <AddForm
        label="Add budget item"
        saving={saving}
        onSubmit={async (data) => { await create(data as never); }}
        fields={[
          { key: "category",       label: "Category",    type: "select",  options: BUDGET_CATEGORIES.map(c => ({value:c,label:c})), required: true },
          { key: "vendor",         label: "Vendor",      type: "text",    placeholder: "Studio Lumiere", required: true },
          { key: "estimated_cost", label: "Estimated ₹", type: "number",  placeholder: "50000" },
          { key: "actual_cost",    label: "Actual ₹",    type: "number",  placeholder: "0" },
          { key: "deposit_paid",   label: "Deposit ₹",   type: "number",  placeholder: "0" },
          { key: "due_date",       label: "Due date",    type: "date" },
          { key: "notes",          label: "Notes",       type: "textarea" },
        ]}
      />
      {loading ? <Loader2 size={20} className="animate-spin" style={{ color: ROSE }} /> : (
        <PlanTable rows={rows} cols={cols} saving={saving} error={error} setError={setError} onUpdate={update} onDelete={remove} emptyLabel="No budget items yet. Add your first item above." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SHOPPING TRACKER
// ─────────────────────────────────────────────────────────────────────────────
type ShoppingItem = { id: string; category: string; item_name: string; store: string; cost: number; status: string; notes: string; created_at: string };
const SHOP_CATS = ["Bride","Groom","Decor","Accessories","Gifts"];

function ShoppingTracker() {
  const { rows, loading, saving, error, setError, create, update, remove } = usePlanning<ShoppingItem>("shopping_items");
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const totalCost   = rows.reduce((a, r) => a + (r.cost || 0), 0);
  const purchased   = rows.filter(r => r.status === "purchased").length;

  const cols: ColDef<ShoppingItem>[] = [
    { key: "category",  label: "Category", type: "select", options: SHOP_CATS.map(c => ({value:c,label:c})), render: r => <Badge label={r.category} color="purple" /> },
    { key: "item_name", label: "Item",     type: "text" },
    { key: "store",     label: "Store",    type: "text" },
    { key: "cost",      label: "Cost",     type: "number", render: r => fmt(r.cost) },
    { key: "status",    label: "Status",   type: "select", options: [{value:"planned",label:"Planned"},{value:"purchased",label:"Purchased"}],
      render: r => <Badge label={r.status === "purchased" ? "Purchased" : "Planned"} color={r.status === "purchased" ? "green" : "amber"} /> },
    { key: "notes",     label: "Notes",    type: "text" },
  ];

  return (
    <div>
      <SectionHeader eyebrow="Planning" title="Shopping tracker" subtitle="Track all wedding purchases." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard label="Total items"  value={String(rows.length)} />
        <StatCard label="Purchased"    value={String(purchased)} />
        <StatCard label="Total cost"   value={fmt(totalCost)} />
      </div>
      <AddForm label="Add item" saving={saving} onSubmit={async d => { await create(d as never); }} fields={[
        { key: "category",  label: "Category",  type: "select", options: SHOP_CATS.map(c => ({value:c,label:c})), required: true },
        { key: "item_name", label: "Item name", type: "text",   required: true, placeholder: "Bridal saree" },
        { key: "store",     label: "Store",     type: "text",   placeholder: "Nalli Silks" },
        { key: "cost",      label: "Cost ₹",    type: "number" },
        { key: "status",    label: "Status",    type: "select", options: [{value:"planned",label:"Planned"},{value:"purchased",label:"Purchased"}] },
        { key: "notes",     label: "Notes",     type: "textarea" },
      ]} />
      {loading ? <Loader2 size={20} className="animate-spin" style={{ color: ROSE }} /> : (
        <PlanTable rows={rows} cols={cols} saving={saving} error={error} setError={setError} onUpdate={update} onDelete={remove} emptyLabel="No shopping items yet." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ACCOMMODATION MANAGER
// ─────────────────────────────────────────────────────────────────────────────
type AccommodationRow = { id: string; guest_name: string; hotel: string; room_number: string; check_in: string; check_out: string; notes: string; created_at: string };

function AccommodationManager() {
  const { rows, loading, saving, error, setError, create, update, remove } = usePlanning<AccommodationRow>("guest_accommodations");
  const cols: ColDef<AccommodationRow>[] = [
    { key: "guest_name",  label: "Guest",       type: "text" },
    { key: "hotel",       label: "Hotel",       type: "text" },
    { key: "room_number", label: "Room",        type: "text" },
    { key: "check_in",   label: "Check-in",    type: "date" },
    { key: "check_out",  label: "Check-out",   type: "date" },
    { key: "notes",      label: "Notes",       type: "text" },
  ];
  return (
    <div>
      <SectionHeader eyebrow="Planning" title="Accommodation manager" subtitle="Track hotel room assignments for guests." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard label="Total rooms"    value={String(rows.length)} />
        <StatCard label="Unique hotels"  value={String(new Set(rows.map(r => r.hotel)).size)} />
      </div>
      <AddForm label="Add accommodation" saving={saving} onSubmit={async d => { await create(d as never); }} fields={[
        { key: "guest_name",  label: "Guest name",   type: "text",  required: true, placeholder: "John & Family" },
        { key: "hotel",       label: "Hotel",        type: "text",  required: true, placeholder: "Blue Bay Beach Resort" },
        { key: "room_number", label: "Room number",  type: "text",  placeholder: "204" },
        { key: "check_in",   label: "Check-in",     type: "date" },
        { key: "check_out",  label: "Check-out",    type: "date" },
        { key: "notes",      label: "Notes",        type: "textarea" },
      ]} />
      {loading ? <Loader2 size={20} className="animate-spin" style={{ color: ROSE }} /> : (
        <PlanTable rows={rows} cols={cols} saving={saving} error={error} setError={setError} onUpdate={update} onDelete={remove} emptyLabel="No accommodations added yet." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TRAVEL MANAGER
// ─────────────────────────────────────────────────────────────────────────────
type TravelRow = { id: string; guest_name: string; arrival_mode: string; arrival_date: string; arrival_time: string; pickup_required: boolean; driver: string; notes: string; created_at: string };
const ARRIVAL_MODES = [{value:"flight",label:"Flight"},{value:"train",label:"Train"},{value:"car",label:"Car"},{value:"other",label:"Other"}];

function TravelManager() {
  const { rows, loading, saving, error, setError, create, update, remove } = usePlanning<TravelRow>("guest_travel");
  const needsPickup = rows.filter(r => r.pickup_required).length;
  const cols: ColDef<TravelRow>[] = [
    { key: "guest_name",      label: "Guest",    type: "text" },
    { key: "arrival_mode",    label: "Mode",     type: "select", options: ARRIVAL_MODES, render: r => <Badge label={r.arrival_mode} color="blue" /> },
    { key: "arrival_date",    label: "Date",     type: "date" },
    { key: "arrival_time",    label: "Time",     type: "text" },
    { key: "pickup_required", label: "Pickup",   type: "checkbox", render: r => <Badge label={r.pickup_required ? "Yes" : "No"} color={r.pickup_required ? "amber" : "gray"} /> },
    { key: "driver",          label: "Driver",   type: "text" },
    { key: "notes",           label: "Notes",    type: "text" },
  ];
  return (
    <div>
      <SectionHeader eyebrow="Planning" title="Travel arrangements" subtitle="Track arrivals and transport logistics." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard label="Total arrivals" value={String(rows.length)} />
        <StatCard label="Need pickup"    value={String(needsPickup)} />
      </div>
      <AddForm label="Add travel entry" saving={saving} onSubmit={async d => { await create(d as never); }} fields={[
        { key: "guest_name",      label: "Guest name",      type: "text",   required: true },
        { key: "arrival_mode",    label: "Arrival mode",    type: "select", options: ARRIVAL_MODES, required: true },
        { key: "arrival_date",    label: "Arrival date",    type: "date" },
        { key: "arrival_time",    label: "Arrival time",    type: "text",   placeholder: "14:30" },
        { key: "pickup_required", label: "Pickup required", type: "checkbox" },
        { key: "driver",          label: "Driver",          type: "text" },
        { key: "notes",           label: "Notes",           type: "textarea" },
      ]} />
      {loading ? <Loader2 size={20} className="animate-spin" style={{ color: ROSE }} /> : (
        <PlanTable rows={rows} cols={cols} saving={saving} error={error} setError={setError} onUpdate={update} onDelete={remove} emptyLabel="No travel entries yet." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. WEDDING PARTY MANAGER
// ─────────────────────────────────────────────────────────────────────────────
type PartyMember = { id: string; name: string; role: string; phone: string; outfit_status: string; assigned_tasks: string; notes: string; created_at: string };
const PARTY_ROLES   = [{value:"bridesmaid",label:"Bridesmaid"},{value:"groomsman",label:"Groomsman"},{value:"best_man",label:"Best man"},{value:"maid_of_honor",label:"Maid of honor"},{value:"flower_girl",label:"Flower girl"},{value:"ring_bearer",label:"Ring bearer"}];
const OUTFIT_STATUS = [{value:"pending",label:"Pending"},{value:"ordered",label:"Ordered"},{value:"fitted",label:"Fitted"},{value:"confirmed",label:"Confirmed"}];
const OUTFIT_COLORS: Record<string, string> = { pending: "amber", ordered: "blue", fitted: "purple", confirmed: "green" };

function WeddingPartyManager() {
  const { rows, loading, saving, error, setError, create, update, remove } = usePlanning<PartyMember>("wedding_party_members");
  const bridalCount  = rows.filter(r => ["bridesmaid","maid_of_honor"].includes(r.role)).length;
  const groomCount   = rows.filter(r => ["groomsman","best_man"].includes(r.role)).length;
  const cols: ColDef<PartyMember>[] = [
    { key: "name",           label: "Name",          type: "text" },
    { key: "role",           label: "Role",          type: "select", options: PARTY_ROLES, render: r => <Badge label={PARTY_ROLES.find(x => x.value === r.role)?.label ?? r.role} color="purple" /> },
    { key: "phone",          label: "Phone",         type: "text" },
    { key: "outfit_status",  label: "Outfit",        type: "select", options: OUTFIT_STATUS, render: r => <Badge label={OUTFIT_STATUS.find(x => x.value === r.outfit_status)?.label ?? r.outfit_status} color={OUTFIT_COLORS[r.outfit_status] ?? "gray"} /> },
    { key: "assigned_tasks", label: "Tasks",         type: "textarea" },
    { key: "notes",          label: "Notes",         type: "text" },
  ];
  return (
    <div>
      <SectionHeader eyebrow="Planning" title="Wedding party" subtitle="Manage bridesmaids, groomsmen, and key roles." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard label="Total members"  value={String(rows.length)} />
        <StatCard label="Bride's squad"  value={String(bridalCount)} />
        <StatCard label="Groom's squad"  value={String(groomCount)} />
      </div>
      <AddForm label="Add member" saving={saving} onSubmit={async d => { await create(d as never); }} fields={[
        { key: "name",           label: "Full name",     type: "text",   required: true },
        { key: "role",           label: "Role",          type: "select", options: PARTY_ROLES, required: true },
        { key: "phone",          label: "Phone",         type: "text" },
        { key: "outfit_status",  label: "Outfit status", type: "select", options: OUTFIT_STATUS },
        { key: "assigned_tasks", label: "Tasks",         type: "textarea" },
        { key: "notes",          label: "Notes",         type: "textarea" },
      ]} />
      {loading ? <Loader2 size={20} className="animate-spin" style={{ color: ROSE }} /> : (
        <PlanTable rows={rows} cols={cols} saving={saving} error={error} setError={setError} onUpdate={update} onDelete={remove} emptyLabel="No wedding party members yet." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CATERING PLANNER
// ─────────────────────────────────────────────────────────────────────────────
type CateringRow = { id: string; dish_name: string; category: string; vendor: string; status: string; notes: string; created_at: string };
const CATERING_CATS   = [{value:"starters",label:"Starters"},{value:"main_course",label:"Main course"},{value:"desserts",label:"Desserts"},{value:"drinks",label:"Drinks"}];
const CATERING_STATUS = [{value:"considering",label:"Considering"},{value:"tasting",label:"Tasting"},{value:"finalized",label:"Finalized"}];
const CATERING_STATUS_COLORS: Record<string,string> = { considering: "gray", tasting: "amber", finalized: "green" };

function CateringPlanner() {
  const { rows, loading, saving, error, setError, create, update, remove } = usePlanning<CateringRow>("catering_menu");
  const finalized = rows.filter(r => r.status === "finalized").length;
  const cols: ColDef<CateringRow>[] = [
    { key: "dish_name", label: "Dish",     type: "text" },
    { key: "category",  label: "Category", type: "select", options: CATERING_CATS, render: r => <Badge label={CATERING_CATS.find(x => x.value === r.category)?.label ?? r.category} color="blue" /> },
    { key: "vendor",    label: "Vendor",   type: "text" },
    { key: "status",    label: "Status",   type: "select", options: CATERING_STATUS, render: r => <Badge label={CATERING_STATUS.find(x => x.value === r.status)?.label ?? r.status} color={CATERING_STATUS_COLORS[r.status] ?? "gray"} /> },
    { key: "notes",     label: "Notes",    type: "text" },
  ];
  return (
    <div>
      <SectionHeader eyebrow="Planning" title="Catering menu" subtitle="Plan and finalise your wedding menu." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard label="Total dishes"  value={String(rows.length)} />
        <StatCard label="Finalized"     value={String(finalized)} />
        <StatCard label="Still deciding" value={String(rows.length - finalized)} />
      </div>
      <AddForm label="Add dish" saving={saving} onSubmit={async d => { await create(d as never); }} fields={[
        { key: "dish_name", label: "Dish name",  type: "text",   required: true },
        { key: "category",  label: "Category",   type: "select", options: CATERING_CATS, required: true },
        { key: "vendor",    label: "Caterer",    type: "text" },
        { key: "status",    label: "Status",     type: "select", options: CATERING_STATUS },
        { key: "notes",     label: "Notes",      type: "textarea" },
      ]} />
      {loading ? <Loader2 size={20} className="animate-spin" style={{ color: ROSE }} /> : (
        <PlanTable rows={rows} cols={cols} saving={saving} error={error} setError={setError} onUpdate={update} onDelete={remove} emptyLabel="No menu items yet." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MUSIC PLANNER
// ─────────────────────────────────────────────────────────────────────────────
type MusicRow = { id: string; song_title: string; artist: string; moment: string; media_link: string; created_at: string };
const MOMENTS = [
  {value:"bride_entry",label:"Bride entry"},
  {value:"groom_entry",label:"Groom entry"},
  {value:"first_dance",label:"First dance"},
  {value:"ceremony_background",label:"Ceremony background"},
  {value:"reception_party",label:"Reception party"},
  {value:"closing_song",label:"Closing song"},
];

function MusicPlanner() {
  const { rows, loading, saving, error, setError, create, update, remove } = usePlanning<MusicRow>("wedding_music");
  const cols: ColDef<MusicRow>[] = [
    { key: "song_title",  label: "Song",      type: "text" },
    { key: "artist",      label: "Artist",    type: "text" },
    { key: "moment",      label: "Moment",    type: "select", options: MOMENTS, render: r => <Badge label={MOMENTS.find(m => m.value === r.moment)?.label ?? r.moment} color="purple" /> },
    { key: "media_link",  label: "Link",      type: "text",  render: r => r.media_link ? <a href={r.media_link} target="_blank" rel="noreferrer" style={{ color: ROSE, fontSize: ".78rem" }}>Play ↗</a> : <>—</> },
  ];
  return (
    <div>
      <SectionHeader eyebrow="Planning" title="Music & song selection" subtitle="Choose songs for every wedding moment." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard label="Songs selected" value={String(rows.length)} />
        <StatCard label="Moments covered" value={String(new Set(rows.map(r => r.moment)).size)} sub={`of ${MOMENTS.length} moments`} />
      </div>
      <AddForm label="Add song" saving={saving} onSubmit={async d => { await create(d as never); }} fields={[
        { key: "song_title",  label: "Song title",  type: "text",   required: true },
        { key: "artist",      label: "Artist",      type: "text" },
        { key: "moment",      label: "Moment",      type: "select", options: MOMENTS, required: true },
        { key: "media_link",  label: "Spotify/YouTube link", type: "text", placeholder: "https://open.spotify.com/…" },
      ]} />
      {loading ? <Loader2 size={20} className="animate-spin" style={{ color: ROSE }} /> : (
        <PlanTable rows={rows} cols={cols} saving={saving} error={error} setError={setError} onUpdate={update} onDelete={remove} emptyLabel="No songs added yet." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. DECOR MOOD BOARD
// ─────────────────────────────────────────────────────────────────────────────
type DecorRow = { id: string; category: string; image_url: string; note: string; created_at: string };
const DECOR_CATS = [
  {value:"ceremony_stage",label:"Ceremony stage"},
  {value:"reception_stage",label:"Reception stage"},
  {value:"lighting",label:"Lighting"},
  {value:"table_decor",label:"Table decor"},
  {value:"entrance",label:"Entrance"},
];

function DecorMoodBoard() {
  const { rows, loading, saving, error, setError, create, remove } = usePlanning<DecorRow>("decor_ideas");

  const [open,    setOpen]    = useState(false);
  const [form,    setForm]    = useState({ category: "", image_url: "", note: "" });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("uploadedBy", "Admin Decor Board");
      fd.append("category", "decor");
      fd.append("weddingId", weddingConfig.id);
      const res  = await authFetch("/api/upload-photo", { method: "POST", body: fd });
      const data = await res.json() as { success: boolean; url?: string };
      if (data.success && data.url) setForm(f => ({ ...f, image_url: data.url! }));
    } catch { /* silent */ }
    finally { setUploading(false); }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await create({ wedding_id: weddingConfig.id, ...form } as never);
    setForm({ category: "", image_url: "", note: "" });
    setOpen(false);
  }

  const grouped = DECOR_CATS.map(cat => ({
    ...cat,
    items: rows.filter(r => r.category === cat.value),
  }));

  return (
    <div>
      <SectionHeader eyebrow="Planning" title="Decor mood board" subtitle="Collect decor inspiration for every space." />

      {/* Add form */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 999, background: open ? BG : ROSE, color: open ? INK : W, border: `1.5px solid ${open ? BDR : ROSE}`, fontSize: ".78rem", fontWeight: 700, fontFamily: BF, cursor: "pointer" }}>
          {open ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add inspiration</>}
        </button>
        {open && (
          <form onSubmit={handleSubmit} style={{ marginTop: "1rem", background: BG, border: `1px solid ${BDR}`, borderRadius: 16, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: ".6rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, fontFamily: BF, marginBottom: ".375rem" }}>Section *</label>
                <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp}>
                  <option value="">Select…</option>
                  {DECOR_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: ".6rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, fontFamily: BF, marginBottom: ".375rem" }}>Image URL or Pinterest link</label>
                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://pin.it/… or paste URL" style={inp} />
              </div>
            </div>
            <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 999, background: BG, border: `1px solid ${BDR}`, fontSize: ".75rem", fontFamily: BF, cursor: "pointer" }}>
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Upload image
              </button>
              {form.image_url && <span style={{ fontSize: ".75rem", color: INK3, fontFamily: BF }}>✓ Image set</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
            <div>
              <label style={{ display: "block", fontSize: ".6rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, fontFamily: BF, marginBottom: ".375rem" }}>Note</label>
              <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} placeholder="Love the lighting here…" style={{ ...inp, resize: "none" }} />
            </div>
            <button type="submit" disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 999, background: ROSE, color: W, border: "none", fontSize: ".78rem", fontWeight: 700, fontFamily: BF, cursor: "pointer", alignSelf: "flex-start" }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
            </button>
          </form>
        )}
      </div>

      {/* Mood board grid by category */}
      {loading ? <Loader2 size={20} className="animate-spin" style={{ color: ROSE }} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {grouped.map(cat => cat.items.length > 0 && (
            <div key={cat.value}>
              <p style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: INK3, fontFamily: BF, marginBottom: ".875rem" }}>{cat.label}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: ".875rem" }}>
                {cat.items.map(item => (
                  <div key={item.id} style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${BDR}`, background: W, position: "relative" }}>
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.note || cat.label} loading="lazy" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", aspectRatio: "4/3", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Palette size={24} style={{ color: BDR }} />
                      </div>
                    )}
                    {item.note && <div style={{ padding: ".625rem .875rem" }}><p style={{ fontSize: ".78rem", color: INK3, fontFamily: BF }}>{item.note}</p></div>}
                    <button onClick={() => remove(item.id)} style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,.45)", border: "none", display: "grid", placeItems: "center", cursor: "pointer" }}>
                      <X size={12} style={{ color: W }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div style={{ padding: "3rem", textAlign: "center", background: BG, borderRadius: 14, border: `1.5px dashed ${BDR}` }}>
              <Palette size={32} style={{ color: BDR, margin: "0 auto 1rem" }} />
              <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>No decor ideas yet. Add your first inspiration above.</p>
            </div>
          )}
        </div>
      )}
      {error && <p style={{ marginTop: "1rem", fontSize: ".85rem", color: "#b91c1c", fontFamily: BF }}>{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. TASK MANAGER
// ─────────────────────────────────────────────────────────────────────────────
type TaskRow = { id: string; task_title: string; assigned_to: string; priority: string; due_date: string; status: string; notes: string; created_at: string };
const PRIORITIES    = [{value:"low",label:"Low"},{value:"medium",label:"Medium"},{value:"high",label:"High"}];
const TASK_STATUSES = [{value:"pending",label:"Pending"},{value:"in_progress",label:"In progress"},{value:"completed",label:"Completed"}];
const PRIORITY_COLORS: Record<string,string> = { low: "green", medium: "amber", high: "red" };
const STATUS_COLORS:   Record<string,string> = { pending: "gray", in_progress: "amber", completed: "green" };

function WeddingTaskManager() {
  const { rows, loading, saving, error, setError, create, update, remove } = usePlanning<TaskRow>("planning_tasks");
  const completed  = rows.filter(r => r.status === "completed").length;
  const highPriority = rows.filter(r => r.priority === "high" && r.status !== "completed").length;
  const cols: ColDef<TaskRow>[] = [
    { key: "task_title",   label: "Task",       type: "text" },
    { key: "assigned_to",  label: "Assigned to", type: "text" },
    { key: "priority",     label: "Priority",   type: "select", options: PRIORITIES, render: r => <Badge label={PRIORITIES.find(p => p.value === r.priority)?.label ?? r.priority} color={PRIORITY_COLORS[r.priority] ?? "gray"} /> },
    { key: "due_date",     label: "Due date",   type: "date" },
    { key: "status",       label: "Status",     type: "select", options: TASK_STATUSES, render: r => <Badge label={TASK_STATUSES.find(s => s.value === r.status)?.label ?? r.status} color={STATUS_COLORS[r.status] ?? "gray"} /> },
    { key: "notes",        label: "Notes",      type: "text" },
  ];
  return (
    <div>
      <SectionHeader eyebrow="Planning" title="Task manager" subtitle="Track every planning task and deadline." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard label="Total tasks"   value={String(rows.length)} />
        <StatCard label="Completed"     value={String(completed)} />
        <StatCard label="High priority" value={String(highPriority)} sub="outstanding" />
      </div>
      <AddForm label="Add task" saving={saving} onSubmit={async d => { await create(d as never); }} fields={[
        { key: "task_title",   label: "Task title",   type: "text",   required: true },
        { key: "assigned_to",  label: "Assigned to",  type: "text",   placeholder: "Marion / Livingston" },
        { key: "priority",     label: "Priority",     type: "select", options: PRIORITIES },
        { key: "due_date",     label: "Due date",     type: "date" },
        { key: "status",       label: "Status",       type: "select", options: TASK_STATUSES },
        { key: "notes",        label: "Notes",        type: "textarea" },
      ]} />
      {loading ? <Loader2 size={20} className="animate-spin" style={{ color: ROSE }} /> : (
        <PlanTable rows={rows} cols={cols} saving={saving} error={error} setError={setError} onUpdate={update} onDelete={remove} emptyLabel="No tasks yet. Add your first planning task above." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. GIFT TRACKER
// ─────────────────────────────────────────────────────────────────────────────
type GiftRow = { id: string; guest_name: string; gift_description: string; gift_category: string; thank_you_sent: boolean; notes: string; created_at: string };
const GIFT_CATS = ["Cash","Jewelry","Home","Experience","Electronics","Clothes","Other"];

function GiftTracker() {
  const { rows, loading, saving, error, setError, create, update, remove } = usePlanning<GiftRow>("gifts");
  const thankYouSent = rows.filter(r => r.thank_you_sent).length;
  const cols: ColDef<GiftRow>[] = [
    { key: "guest_name",       label: "Guest",        type: "text" },
    { key: "gift_description", label: "Gift",         type: "text" },
    { key: "gift_category",    label: "Category",     type: "select", options: GIFT_CATS.map(c => ({value:c,label:c})), render: r => <Badge label={r.gift_category || "—"} color="blue" /> },
    { key: "thank_you_sent",   label: "Thank you",    type: "checkbox", render: r => <Badge label={r.thank_you_sent ? "Sent ✓" : "Pending"} color={r.thank_you_sent ? "green" : "amber"} /> },
    { key: "notes",            label: "Notes",        type: "text" },
  ];
  return (
    <div>
      <SectionHeader eyebrow="Planning" title="Gift tracker" subtitle="Track gifts received and thank-you notes." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard label="Total gifts"       value={String(rows.length)} />
        <StatCard label="Thank-you sent"    value={String(thankYouSent)} />
        <StatCard label="Still to thank"    value={String(rows.length - thankYouSent)} />
      </div>
      <AddForm label="Add gift" saving={saving} onSubmit={async d => { await create(d as never); }} fields={[
        { key: "guest_name",       label: "Guest name",    type: "text",   required: true },
        { key: "gift_description", label: "Gift",          type: "text",   required: true, placeholder: "Gold necklace set" },
        { key: "gift_category",    label: "Category",      type: "select", options: GIFT_CATS.map(c => ({value:c,label:c})) },
        { key: "thank_you_sent",   label: "Thank-you sent", type: "checkbox" },
        { key: "notes",            label: "Notes",         type: "textarea" },
      ]} />
      {loading ? <Loader2 size={20} className="animate-spin" style={{ color: ROSE }} /> : (
        <PlanTable rows={rows} cols={cols} saving={saving} error={error} setError={setError} onUpdate={update} onDelete={remove} emptyLabel="No gifts recorded yet." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PlanningDashboard — root export
// ─────────────────────────────────────────────────────────────────────────────
export function PlanningDashboard() {
  const [activeTab, setActiveTab] = useState<PlanTab>("tasks");

  const tabStyle = (id: PlanTab): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 9999, cursor: "pointer",
    fontSize: ".72rem", fontWeight: activeTab === id ? 700 : 500,
    letterSpacing: ".1em", textTransform: "uppercase",
    fontFamily: BF,
    background: activeTab === id ? ROSE : "transparent",
    color:      activeTab === id ? W : INK3,
    border:     activeTab === id ? `1.5px solid ${ROSE}` : "1.5px solid transparent",
    transition: "all .15s",
    whiteSpace: "nowrap",
  });

  const COMPONENTS: Record<PlanTab, React.ReactNode> = {
    budget:        <BudgetTracker />,
    shopping:      <ShoppingTracker />,
    accommodation: <AccommodationManager />,
    travel:        <TravelManager />,
    party:         <WeddingPartyManager />,
    catering:      <CateringPlanner />,
    music:         <MusicPlanner />,
    decor:         <DecorMoodBoard />,
    tasks:         <WeddingTaskManager />,
    gifts:         <GiftTracker />,
  };

  return (
    <div>
      {/* Sub-tab navigation */}
      <div style={{ marginBottom: "2rem", overflowX: "auto", scrollbarWidth: "none" }}>
        <div style={{ display: "flex", gap: ".25rem", minWidth: "max-content", paddingBottom: ".25rem" }}>
          {PLAN_TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)} style={tabStyle(id)}>
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Active module */}
      {COMPONENTS[activeTab]}
    </div>
  );
}

export default PlanningDashboard;
