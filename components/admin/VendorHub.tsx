"use client";

import { type FormEvent, useState } from "react";
import classNames from "classnames";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Phone,
  Plus,
  Trash2,
  Truck,
  UserCheck,
  X
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type VendorStatus = "pending" | "confirmed" | "arrived" | "done";

export interface VendorRow {
  id: string;
  wedding_id: string;
  vendor_name: string;
  role: string;
  contact_phone: string | null;
  contact_email: string | null;
  arrival_time: string | null;
  setup_notes: string | null;
  status: VendorStatus;
  created_at: string;
}

interface VendorHubProps {
  weddingId: string;
  initialVendors: VendorRow[];
}

interface VendorApiResponse {
  success: boolean;
  message?: string;
  data?: VendorRow;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<VendorStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "Pending",   color: "bg-stone-100 text-stone-600 border-stone-200",     icon: Clock       },
  confirmed: { label: "Confirmed", color: "bg-amber-50  text-amber-800  border-amber-200",    icon: CheckCircle2 },
  arrived:   { label: "Arrived",   color: "bg-blue-50   text-blue-800   border-blue-200",     icon: UserCheck   },
  done:      { label: "Done",      color: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: CheckCircle2 }
};

const VENDOR_STATUSES: VendorStatus[] = ["pending", "confirmed", "arrived", "done"];

const EMPTY_FORM = {
  vendorName: "",
  role: "",
  contactPhone: "",
  contactEmail: "",
  arrivalTime: "",
  setupNotes: ""
};

// ─────────────────────────────────────────────────────────────────────────────
// VendorCard
// ─────────────────────────────────────────────────────────────────────────────
function VendorCard({
  vendor,
  onStatusChange,
  onDelete,
  updating
}: {
  vendor: VendorRow;
  onStatusChange: (id: string, status: VendorStatus) => void;
  onDelete: (id: string, name: string) => void;
  updating: string | null;
}) {
  const cfg = STATUS_CONFIG[vendor.status];
  const StatusIcon = cfg.icon;
  const isUpdating = updating === vendor.id;

  return (
    <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-stone-950 truncate">{vendor.vendor_name}</p>
          <p className="mt-0.5 text-xs uppercase tracking-[0.24em] text-stone-500">{vendor.role}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] ${cfg.color}`}>
            <StatusIcon className="h-3 w-3" />
            {cfg.label}
          </span>
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onDelete(vendor.id, vendor.vendor_name)}
            className="rounded-full border border-rose-200 bg-rose-50 p-1.5 text-rose-500 transition hover:bg-rose-100 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-2 text-xs text-stone-500">
        {vendor.arrival_time ? (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Arrives {vendor.arrival_time}</span>
          </div>
        ) : null}
        {vendor.contact_phone ? (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <a href={`tel:${vendor.contact_phone}`} className="hover:text-stone-800 transition">
              {vendor.contact_phone}
            </a>
          </div>
        ) : null}
        {vendor.setup_notes ? (
          <p className="leading-5 text-stone-400 italic">{vendor.setup_notes}</p>
        ) : null}
      </div>

      {/* Status cycle buttons */}
      <div className="flex flex-wrap gap-2">
        {VENDOR_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={isUpdating || vendor.status === s}
            onClick={() => onStatusChange(vendor.id, s)}
            className={classNames(
              "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition",
              vendor.status === s
                ? `${STATUS_CONFIG[s].color} cursor-default`
                : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:text-stone-700 disabled:opacity-40"
            )}
          >
            {isUpdating && vendor.status !== s ? (
              <Loader2 className="inline h-3 w-3 animate-spin" />
            ) : null}
            {STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VendorHub — main component
// ─────────────────────────────────────────────────────────────────────────────
export function VendorHub({ weddingId, initialVendors }: VendorHubProps) {
  const [vendors, setVendors] = useState<VendorRow[]>(initialVendors);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  function setField(key: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── Add vendor ──────────────────────────────────────────────────────────
  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.vendorName.trim() || !form.role.trim()) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weddingId,
          vendorName: form.vendorName.trim(),
          role: form.role.trim(),
          contactPhone: form.contactPhone.trim() || null,
          contactEmail: form.contactEmail.trim() || null,
          arrivalTime: form.arrivalTime.trim() || null,
          setupNotes: form.setupNotes.trim() || null
        })
      });
      const payload = (await res.json()) as VendorApiResponse;
      if (!res.ok || !payload.success) throw new Error(payload.message ?? "Failed to add vendor.");
      if (payload.data) {
        setVendors((prev) => [...prev, payload.data!].sort((a, b) => (a.arrival_time ?? "").localeCompare(b.arrival_time ?? "")));
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      setStatusMsg("Vendor added.");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add vendor.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Update status ────────────────────────────────────────────────────────
  async function handleStatusChange(id: string, status: VendorStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const payload = (await res.json()) as VendorApiResponse;
      if (!res.ok || !payload.success) throw new Error(payload.message ?? "Update failed.");
      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status } : v))
      );
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setUpdating(null);
    }
  }

  // ── Delete vendor ────────────────────────────────────────────────────────
  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Remove ${name} from the vendor list?`)) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, { method: "DELETE" });
      const payload = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !payload.success) throw new Error(payload.message ?? "Delete failed.");
      setVendors((prev) => prev.filter((v) => v.id !== id));
      setStatusMsg("Vendor removed.");
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setUpdating(null);
    }
  }

  // Group vendors by status for the board view
  const grouped = {
    pending:   vendors.filter((v) => v.status === "pending"),
    confirmed: vendors.filter((v) => v.status === "confirmed"),
    arrived:   vendors.filter((v) => v.status === "arrived"),
    done:      vendors.filter((v) => v.status === "done")
  };

  const totalVendors = vendors.length;
  const arrivedCount = grouped.arrived.length + grouped.done.length;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-stone-500" />
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Vendor coordination</p>
          </div>
          <h2 className="mt-2 font-display text-4xl text-stone-950">
            Wedding day vendor hub
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-7 text-stone-600">
            Track every vendor — photographer, caterer, florist, DJ — from confirmation to setup complete.
          </p>
          {totalVendors > 0 ? (
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-stone-500">
              {totalVendors} vendors · {arrivedCount} on site
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((s) => !s); setFormError(null); }}
          className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2.5 text-xs uppercase tracking-[0.28em] text-white transition hover:bg-stone-800"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add vendor"}
        </button>
      </div>

      {/* Add form */}
      {showForm ? (
        <form
          onSubmit={handleAdd}
          className="rounded-[2rem] border border-stone-200 bg-stone-50 p-6 space-y-4"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">New vendor</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-stone-700">
              Vendor name *
              <input
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-400"
                value={form.vendorName}
                onChange={(e) => setField("vendorName", e.target.value)}
                placeholder="Studio Lumiere"
                required
              />
            </label>
            <label className="grid gap-2 text-sm text-stone-700">
              Role *
              <input
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-400"
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                placeholder="Photographer"
                required
              />
            </label>
            <label className="grid gap-2 text-sm text-stone-700">
              Contact phone
              <input
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-400"
                value={form.contactPhone}
                onChange={(e) => setField("contactPhone", e.target.value)}
                placeholder="+91 98765 43210"
                type="tel"
              />
            </label>
            <label className="grid gap-2 text-sm text-stone-700">
              Arrival time
              <input
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-400"
                value={form.arrivalTime}
                onChange={(e) => setField("arrivalTime", e.target.value)}
                placeholder="09:00 AM"
              />
            </label>
            <label className="grid gap-2 text-sm text-stone-700 sm:col-span-2">
              Setup notes
              <input
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-400"
                value={form.setupNotes}
                onChange={(e) => setField("setupNotes", e.target.value)}
                placeholder="Set up in the east garden by 8:30 AM"
              />
            </label>
          </div>
          {formError ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p>
          ) : null}
          <button
            type="submit"
            disabled={submitting || !form.vendorName.trim() || !form.role.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-xs uppercase tracking-[0.28em] text-white transition hover:bg-stone-800 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add vendor
          </button>
        </form>
      ) : null}

      {/* Status toast */}
      {statusMsg ? (
        <div className="flex items-center justify-between rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-700">
          {statusMsg}
          <button type="button" onClick={() => setStatusMsg(null)}>
            <X className="h-4 w-4 text-stone-400" />
          </button>
        </div>
      ) : null}

      {/* Empty state */}
      {vendors.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-stone-200 bg-white/50 py-12 text-center">
          <Truck className="mx-auto h-8 w-8 text-stone-300" />
          <p className="mt-4 text-sm text-stone-500">
            No vendors added yet. Add your photographer, caterer, florist, and others above.
          </p>
        </div>
      ) : (
        /* Board: 4 columns by status */
        <div className="grid gap-6 lg:grid-cols-4">
          {(["pending", "confirmed", "arrived", "done"] as VendorStatus[]).map((status) => {
            const cfg = STATUS_CONFIG[status];
            const StatusIcon = cfg.icon;
            const group = grouped[status];
            return (
              <div key={status} className="space-y-3">
                <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 ${cfg.color}`}>
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.26em] font-medium">{cfg.label}</span>
                  <span className="ml-auto text-xs font-medium">{group.length}</span>
                </div>
                {group.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    updating={updating}
                  />
                ))}
                {group.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-stone-200 py-6 text-center">
                    <p className="text-xs text-stone-400">None</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default VendorHub;
