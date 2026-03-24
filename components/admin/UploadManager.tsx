"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle, Loader2, UploadCloud, XCircle,
  Images, Eye, Trash2, ArrowLeftCircle, RefreshCw, Tag, AlertTriangle,
} from "lucide-react";
import { Card, SectionLabel, Btn, EmptyState } from "@/components/ui";
import { authFetch } from "@/lib/client/token";

/* ── Types ── */
interface UploadManagerProps { weddingId: string; }
interface UploadResponse { success: boolean; message: string; url?: string; demoMode?: boolean; }
interface PhotoRow {
  id:          string;
  image_url:   string;
  uploaded_by: string;
  category:    string;
  created_at:  string;
  is_approved: boolean;
}
type ActiveTab = "upload" | "pending" | "approved";

/* ── Category map — must match gallery.json + DB values ── */
const CATEGORIES = [
  { value: "ceremony",  label: "Ceremony"         },
  { value: "reception", label: "Reception"         },
  { value: "family",    label: "Family & Friends"  },
  { value: "candid",    label: "Candid"            },
  { value: "snap",      label: "Guest Snaps"       },
  { value: "live",      label: "Live Feed"         },
] as const;

const CAT_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.value, c.label])
);
const catLabel = (cat: string) => CAT_LABEL[cat] ?? (cat.charAt(0).toUpperCase() + cat.slice(1));

/* ── Design tokens ── */
const ROSE = "#BE2D45";
const SAGE = "#2E7A5A";

/* ── Shared styles ── */
const inputSt: React.CSSProperties = {
  display: "block", width: "100%",
  background: "var(--color-surface-soft)",
  border: "1.5px solid var(--color-border-medium)",
  borderRadius: 12, padding: "0.75rem 1rem",
  color: "var(--color-text-primary)", fontSize: "0.9375rem",
  outline: "none", fontFamily: "var(--font-body),sans-serif",
};

const tabSt = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: "0.875rem 0.625rem",
  fontSize: "0.56rem", fontWeight: 600, letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: active ? ROSE : "var(--color-text-muted)",
  borderBottom: active ? `2px solid ${ROSE}` : "2px solid transparent",
  background: "transparent", cursor: "pointer",
  whiteSpace: "nowrap", transition: "color .15s",
});

const iconBtn = (danger = false): React.CSSProperties => ({
  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: danger ? "rgba(254,242,242,.92)" : "rgba(255,255,255,.90)",
  border: `1px solid ${danger ? "#fca5a5" : "rgba(0,0,0,.10)"}`,
  color: danger ? "#b91c1c" : "#6B4A30",
  cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.14)",
});

/* ── Toast ── */
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, padding: "10px 24px", borderRadius: 12,
      background: ok ? "#1C1214" : "#7f1d1d",
      color: "#fff", fontSize: ".85rem", fontWeight: 500,
      boxShadow: "0 8px 32px rgba(0,0,0,.30)",
      whiteSpace: "nowrap", pointerEvents: "none",
      animation: "tmFadeUp .2s ease",
    }}>
      {msg}
    </div>
  );
}

/* ── Category breakdown chips ── */
function CatChips({ photos }: { photos: PhotoRow[] }) {
  const byCat = photos.reduce<Record<string, number>>((a, p) => {
    a[p.category] = (a[p.category] ?? 0) + 1;
    return a;
  }, {});
  if (!Object.keys(byCat).length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: ".375rem" }}>
      {Object.entries(byCat).map(([cat, n]) => (
        <span key={cat} style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 10px", borderRadius: 999,
          background: "var(--color-surface-soft)",
          border: "1px solid var(--color-border)",
          fontSize: ".56rem", fontWeight: 600,
          letterSpacing: ".10em", textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}>
          {catLabel(cat)}
          <span style={{ color: ROSE, fontWeight: 700 }}>{n}</span>
        </span>
      ))}
    </div>
  );
}

/* ── Confirm delete modal ── */
function ConfirmDelete({ onConfirm, onCancel, loading }: { onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9990,
      background: "rgba(12,6,8,.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "2rem",
        maxWidth: 360, width: "100%", textAlign: "center",
        boxShadow: "0 24px 72px rgba(0,0,0,.22)",
      }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
          <AlertTriangle size={22} color="#b91c1c" />
        </div>
        <p style={{ fontFamily: "var(--font-display),Georgia,serif", fontSize: "1.15rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: ".5rem" }}>
          Delete photo permanently?
        </p>
        <p style={{ fontSize: ".82rem", color: "var(--color-text-muted)", lineHeight: 1.55, marginBottom: "1.5rem" }}>
          This removes the photo from the database. The file in storage will be cleaned up by the next maintenance job.
        </p>
        <div style={{ display: "flex", gap: ".625rem" }}>
          <button type="button" onClick={onCancel} disabled={loading} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "var(--color-surface-soft)", border: "1px solid var(--color-border)", fontSize: ".82rem", fontWeight: 600, color: "var(--color-text-secondary)", cursor: "pointer" }}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#b91c1c", border: "none", fontSize: ".82rem", fontWeight: 600, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export function UploadManager({ weddingId }: UploadManagerProps) {
  const [activeTab,        setActiveTab]        = useState<ActiveTab>("upload");
  const [file,             setFile]             = useState<File | null>(null);
  const [uploadedBy,       setUploadedBy]       = useState("Event Team");
  const [category,         setCategory]         = useState("ceremony");
  const [uploadStatus,     setUploadStatus]     = useState<UploadResponse | null>(null);
  const [isSubmitting,     setIsSubmitting]     = useState(false);

  const [pending,          setPending]          = useState<PhotoRow[]>([]);
  const [approved,         setApproved]         = useState<PhotoRow[]>([]);
  const [pendingLoading,   setPendingLoading]   = useState(false);
  const [approvedLoading,  setApprovedLoading]  = useState(false);
  const [pendingError,     setPendingError]     = useState<string | null>(null);
  const [approvedError,    setApprovedError]    = useState<string | null>(null);
  const [actionId,         setActionId]         = useState<string | null>(null);
  const [editCatId,        setEditCatId]        = useState<string | null>(null);

  const [toast,            setToast]            = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmDelete,    setConfirmDelete]     = useState<{ id: string; from: "pending" | "approved" } | null>(null);
  const [deleteLoading,    setDeleteLoading]    = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flash(msg: string, ok = true) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  /* ── Fetch ── */
  const fetchPending = useCallback(async () => {
    setPendingLoading(true); setPendingError(null);
    try {
      const res = await authFetch(`/api/admin/photos?weddingId=${encodeURIComponent(weddingId)}&approved=false`);
      if (!res.ok) throw new Error("Failed to load pending photos.");
      const json = (await res.json()) as { data: PhotoRow[] };
      setPending(json.data ?? []);
    } catch (err) { setPendingError(err instanceof Error ? err.message : "Error."); }
    finally { setPendingLoading(false); }
  }, [weddingId]);

  const fetchApproved = useCallback(async () => {
    setApprovedLoading(true); setApprovedError(null);
    try {
      const res = await authFetch(`/api/admin/photos?weddingId=${encodeURIComponent(weddingId)}&approved=true`);
      if (!res.ok) throw new Error("Failed to load approved photos.");
      const json = (await res.json()) as { data: PhotoRow[] };
      setApproved(json.data ?? []);
    } catch (err) { setApprovedError(err instanceof Error ? err.message : "Error."); }
    finally { setApprovedLoading(false); }
  }, [weddingId]);

  useEffect(() => {
    if (activeTab === "pending")  void fetchPending();
    if (activeTab === "approved") void fetchApproved();
  }, [activeTab, fetchPending, fetchApproved]);

  /* ── Approve ── */
  async function approve(photoId: string) {
    setActionId(photoId);
    try {
      const res = await authFetch("/api/admin/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, isApproved: true }),
      });
      if (!res.ok) throw new Error("Approval failed.");
      const photo = pending.find(p => p.id === photoId);
      setPending(cur => cur.filter(p => p.id !== photoId));
      if (photo) setApproved(cur => [{ ...photo, is_approved: true }, ...cur]);
      flash("✓ Approved — photo is now live in gallery.");
    } catch (err) { setPendingError(err instanceof Error ? err.message : "Error."); }
    finally { setActionId(null); }
  }

  /* ── Unpublish (approved → pending) ── */
  async function unpublish(photoId: string) {
    setActionId(photoId);
    try {
      const res = await authFetch("/api/admin/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, isApproved: false }),
      });
      if (!res.ok) throw new Error("Failed.");
      const photo = approved.find(p => p.id === photoId);
      setApproved(cur => cur.filter(p => p.id !== photoId));
      if (photo) setPending(cur => [{ ...photo, is_approved: false }, ...cur]);
      flash("Photo moved back to pending — hidden from gallery.", false);
    } catch (err) { setApprovedError(err instanceof Error ? err.message : "Error."); }
    finally { setActionId(null); }
  }

  /* ── Re-categorise ── */
  async function changeCategory(photoId: string, newCat: string) {
    setActionId(photoId);
    try {
      const res = await authFetch("/api/admin/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, isApproved: true, category: newCat }),
      });
      if (!res.ok) throw new Error("Failed to update category.");
      setApproved(cur => cur.map(p => p.id === photoId ? { ...p, category: newCat } : p));
      setEditCatId(null);
      flash(`Category → ${CAT_LABEL[newCat] ?? newCat}`);
    } catch (err) { setApprovedError(err instanceof Error ? err.message : "Error."); }
    finally { setActionId(null); }
  }

  /* ── Delete (confirmed) ── */
  async function deleteConfirmed() {
    if (!confirmDelete) return;
    const { id, from } = confirmDelete;
    setDeleteLoading(true);
    try {
      const res = await authFetch(`/api/admin/photos?photoId=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      if (from === "pending")  setPending(cur => cur.filter(p => p.id !== id));
      if (from === "approved") setApproved(cur => cur.filter(p => p.id !== id));
      flash("Photo permanently deleted.", false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed.";
      from === "pending" ? setPendingError(msg) : setApprovedError(msg);
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(null);
    }
  }

  /* ── Admin upload ── */
  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) { setUploadStatus({ success: false, message: "Choose a photo first." }); return; }
    setIsSubmitting(true); setUploadStatus(null);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("uploadedBy", uploadedBy);
      fd.append("category", category); fd.append("weddingId", weddingId);
      const res = await authFetch("/api/upload-photo", { method: "POST", body: fd });
      if (!res.ok && res.headers.get("content-type")?.includes("text/")) throw new Error(await res.text());
      const data = (await res.json()) as UploadResponse;
      setUploadStatus(data);
      if (data.success) { setFile(null); void fetchApproved(); }
    } catch (err) {
      setUploadStatus({ success: false, message: err instanceof Error ? err.message : "Upload failed." });
    } finally { setIsSubmitting(false); }
  }

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <Card noPad>
      <style>{`
        @keyframes tmFadeUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .um-photo-card:hover .um-photo-actions{opacity:1!important}
        .um-photo-card:hover img{transform:scale(1.04)}
      `}</style>

      {/* Global toast */}
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <ConfirmDelete
          loading={deleteLoading}
          onConfirm={() => void deleteConfirmed()}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* ── Tabs ── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", overflowX: "auto" }}>
        {(["upload", "pending", "approved"] as ActiveTab[]).map(tab => (
          <button key={tab} type="button" style={tabSt(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            {tab === "upload" ? "Upload" : tab === "pending" ? "Pending" : "Manage Album"}
            {tab === "pending" && pending.length > 0 && (
              <span style={{ marginLeft: 5, display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 17, height: 17, borderRadius: 999, background: ROSE, color: "#fff", fontSize: ".52rem", fontWeight: 700, padding: "0 3px" }}>
                {pending.length}
              </span>
            )}
            {tab === "approved" && approved.length > 0 && (
              <span style={{ marginLeft: 5, display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 17, height: 17, borderRadius: 999, background: SAGE, color: "#fff", fontSize: ".52rem", fontWeight: 700, padding: "0 3px" }}>
                {approved.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════ UPLOAD TAB ══════════ */}
      {activeTab === "upload" && (
        <form className="p-6 space-y-5" onSubmit={handleUpload}>
          <div className="space-y-1">
            <SectionLabel>Photo upload</SectionLabel>
            <h3 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>Add to the archive</h3>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Admin uploads are auto-approved and appear in the gallery immediately.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>Uploaded by</label>
              <input style={inputSt} value={uploadedBy} onChange={e => setUploadedBy(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>Category</label>
              <select style={inputSt} value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>Photo file</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)}
              style={{ width: "100%", borderRadius: 12, padding: "1rem", background: "var(--color-surface-soft)", border: "1.5px dashed var(--color-border-medium)", color: "var(--color-text-secondary)", fontSize: ".85rem" }}
            />
            {file && (
              <p style={{ fontSize: ".72rem", color: "var(--color-text-muted)" }}>
                {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>

          {uploadStatus && (
            <p style={{
              borderRadius: 12, padding: "12px 16px", fontSize: ".85rem",
              background: uploadStatus.success ? "rgba(46,122,90,.08)" : "#fef2f2",
              color:      uploadStatus.success ? SAGE : "#b91c1c",
              border:     `1px solid ${uploadStatus.success ? "rgba(46,122,90,.20)" : "#fca5a5"}`,
            }}>
              {uploadStatus.message}
              {uploadStatus.url && <a href={uploadStatus.url} target="_blank" rel="noreferrer" style={{ marginLeft: 8, textDecoration: "underline", fontSize: ".75rem" }}>View photo</a>}
            </p>
          )}

          <Btn type="submit" variant="primary" size="md" loading={isSubmitting} className="w-full">
            <UploadCloud className="h-4 w-4" />
            {isSubmitting ? "Uploading…" : "Upload photo"}
          </Btn>
        </form>
      )}

      {/* ══════════ PENDING TAB ══════════ */}
      {activeTab === "pending" && (
        <div className="p-6 space-y-5">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div className="space-y-1">
              <SectionLabel>Photo moderation</SectionLabel>
              <h3 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>Awaiting review</h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Hidden from guests until approved. Delete to remove permanently.
              </p>
            </div>
            <button type="button" onClick={() => void fetchPending()}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 999, background: "var(--color-surface-soft)", border: "1px solid var(--color-border)", fontSize: ".70rem", color: "var(--color-text-muted)", cursor: "pointer" }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {pending.length > 0 && <CatChips photos={pending} />}

          {pendingError && (
            <p style={{ borderRadius: 12, padding: "10px 14px", fontSize: ".82rem", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" }}>
              {pendingError}{" "}
              <button style={{ marginLeft: 8, textDecoration: "underline", background: "none", border: "none", color: "inherit", cursor: "pointer" }} onClick={() => void fetchPending()} type="button">Retry</button>
            </p>
          )}

          {pendingLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 0" }}>
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-accent-soft)" }} />
            </div>
          ) : pending.length === 0 ? (
            <EmptyState icon={<CheckCircle className="h-9 w-9" />} title="No photos awaiting approval" description="Guest snaps appear here for review after being uploaded via the Snap page." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pending.map(photo => (
                <div key={photo.id} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", background: "#fff" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={`By ${photo.uploaded_by}`} src={photo.image_url} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "14px 14px 12px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".5rem", marginBottom: "0.75rem" }}>
                      <div>
                        <p style={{ fontSize: ".88rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{photo.uploaded_by}</p>
                        <p style={{ fontSize: ".70rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                          {catLabel(photo.category)} · {new Date(photo.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: ".5rem" }}>
                      <Btn type="button" variant="primary" size="sm" loading={actionId === photo.id} style={{ flex: 1, background: `linear-gradient(135deg,${SAGE},#4d7a50)` }} onClick={() => void approve(photo.id)}>
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </Btn>
                      <button type="button" disabled={actionId === photo.id}
                        onClick={() => setConfirmDelete({ id: photo.id, from: "pending" })}
                        style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 999, fontSize: ".70rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#b91c1c", cursor: "pointer" }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ MANAGE ALBUM TAB ══════════ */}
      {activeTab === "approved" && (
        <div className="p-6 space-y-5">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div className="space-y-1">
              <SectionLabel>Manage album</SectionLabel>
              <h3 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>
                Live in gallery
                {approved.length > 0 && (
                  <span style={{ fontFamily: "var(--font-body),sans-serif", fontSize: ".62rem", fontWeight: 600, letterSpacing: ".08em", color: "var(--color-text-muted)", marginLeft: "0.75rem" }}>
                    {approved.length} photo{approved.length !== 1 ? "s" : ""}
                  </span>
                )}
              </h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Visible at <strong style={{ color: "var(--color-text-primary)" }}>/gallery</strong>.
                Hover a photo to unpublish or permanently delete it.
              </p>
            </div>
            <div style={{ display: "flex", gap: ".5rem", flexShrink: 0, flexWrap: "wrap" }}>
              <button type="button" onClick={() => void fetchApproved()}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 999, background: "var(--color-surface-soft)", border: "1px solid var(--color-border)", fontSize: ".70rem", color: "var(--color-text-muted)", cursor: "pointer" }}>
                <RefreshCw size={12} /> Refresh
              </button>
              <a href="/gallery" target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 999, background: ROSE, color: "#fff", fontSize: ".70rem", fontWeight: 600, textDecoration: "none", letterSpacing: ".06em" }}>
                <Eye size={12} /> View gallery
              </a>
            </div>
          </div>

          {approved.length > 0 && <CatChips photos={approved} />}

          {approvedError && (
            <p style={{ borderRadius: 12, padding: "10px 14px", fontSize: ".82rem", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" }}>
              {approvedError}{" "}
              <button style={{ marginLeft: 8, textDecoration: "underline", background: "none", border: "none", color: "inherit", cursor: "pointer" }} onClick={() => void fetchApproved()} type="button">Retry</button>
            </p>
          )}

          {approvedLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 0" }}>
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-accent-soft)" }} />
            </div>
          ) : approved.length === 0 ? (
            <EmptyState icon={<Images className="h-9 w-9" />} title="No approved photos yet"
              description="Approve guest uploads from the Pending tab, or use the Upload tab to add photos directly. They appear in the gallery immediately." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
              {approved.map(photo => (
                <div key={photo.id} className="um-photo-card" style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--color-border)", background: "#fff", boxShadow: "var(--shadow-xs)", position: "relative" }}>

                  {/* Photo */}
                  <div style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", background: "var(--bg-linen,#F1E9E0)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={`${catLabel(photo.category)} — ${photo.uploaded_by}`} src={photo.image_url}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .35s ease" }} />

                    {/* Hover overlay with action buttons */}
                    <div className="um-photo-actions" style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to bottom, rgba(12,6,8,.55) 0%, rgba(12,6,8,.20) 50%, rgba(12,6,8,.60) 100%)",
                      opacity: 0, transition: "opacity .22s ease",
                      display: "flex", flexDirection: "column", justifyContent: "space-between",
                      padding: 10,
                    }}>
                      {/* Top-right controls */}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: ".375rem" }}>
                        {/* Unpublish */}
                        <button type="button" disabled={actionId === photo.id} onClick={() => void unpublish(photo.id)} title="Unpublish — move back to pending" style={iconBtn(false)}>
                          {actionId === photo.id ? <Loader2 size={12} className="animate-spin" /> : <ArrowLeftCircle size={14} />}
                        </button>
                        {/* Delete */}
                        <button type="button" disabled={actionId === photo.id} onClick={() => setConfirmDelete({ id: photo.id, from: "approved" })} title="Delete permanently" style={iconBtn(true)}>
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Bottom meta */}
                      <div>
                        <p style={{ fontSize: ".48rem", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,240,220,.65)", marginBottom: 2 }}>
                          {catLabel(photo.category)}
                        </p>
                        <p style={{ fontSize: ".75rem", color: "rgba(255,255,255,.88)", fontWeight: 500, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {photo.uploaded_by}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Controls strip */}
                  <div style={{ padding: "8px 10px", background: "var(--color-surface-soft)", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".375rem" }}>
                    {/* Category editor */}
                    {editCatId === photo.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                        <Tag size={10} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                        <select
                          defaultValue={photo.category}
                          disabled={actionId === photo.id}
                          style={{ flex: 1, padding: "3px 6px", borderRadius: 7, fontSize: ".65rem", background: "#fff", border: "1px solid var(--color-border-medium)", color: "var(--color-text-primary)", outline: "none", cursor: "pointer" }}
                          onChange={e => void changeCategory(photo.id, e.target.value)}
                        >
                          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <button type="button" onClick={() => setEditCatId(null)} style={{ fontSize: ".60rem", color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>✕</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setEditCatId(photo.id)} title="Change category"
                        style={{ display: "flex", alignItems: "center", gap: 4, fontSize: ".60rem", color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body),sans-serif", letterSpacing: ".06em", textTransform: "uppercase", flex: 1, minWidth: 0 }}>
                        <Tag size={10} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{catLabel(photo.category)}</span>
                      </button>
                    )}
                    <span style={{ fontSize: ".55rem", color: "var(--color-text-muted)", opacity: .55, flexShrink: 0 }}>
                      {new Date(photo.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default UploadManager;
