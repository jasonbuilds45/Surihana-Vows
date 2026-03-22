"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Loader2, UploadCloud, XCircle, Images, Eye } from "lucide-react";
import { Card, SectionLabel, Btn, EmptyState } from "@/components/ui";
import { authFetch } from "@/lib/client/token";

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

const TAB_CATEGORIES: Record<string, string> = {
  ceremony:  "Ceremony",
  reception: "Reception",
  family:    "Family",
  candid:    "Candid",
  snap:      "Guest Snaps",
  live:      "Live Feed",
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: "0.875rem 1rem",
  fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase",
  color: active ? "var(--color-accent)" : "var(--color-text-muted)",
  borderBottom: active ? `2px solid var(--color-accent)` : "2px solid transparent",
  background: "transparent", cursor: "pointer", transition: "all 0.2s",
  whiteSpace: "nowrap",
});

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", background: "var(--color-surface-soft)",
  border: "1.5px solid var(--color-border-medium)", borderRadius: "12px",
  padding: "0.75rem 1rem", color: "var(--color-text-primary)", fontSize: "0.9375rem",
  outline: "none", fontFamily: "var(--font-body), sans-serif",
};

export function UploadManager({ weddingId }: UploadManagerProps) {
  const [activeTab,     setActiveTab]     = useState<ActiveTab>("upload");
  const [file,          setFile]          = useState<File | null>(null);
  const [uploadedBy,    setUploadedBy]    = useState("Event Team");
  const [category,      setCategory]      = useState("ceremony");
  const [uploadStatus,  setUploadStatus]  = useState<UploadResponse | null>(null);
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  const [pending,       setPending]       = useState<PhotoRow[]>([]);
  const [approved,      setApproved]      = useState<PhotoRow[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [pendingError,  setPendingError]  = useState<string | null>(null);
  const [approvedError, setApprovedError] = useState<string | null>(null);
  const [actionId,      setActionId]      = useState<string | null>(null);

  /* ── Fetch pending ── */
  const fetchPending = useCallback(async () => {
    setPendingLoading(true); setPendingError(null);
    try {
      const res = await authFetch(`/api/admin/photos?weddingId=${encodeURIComponent(weddingId)}&approved=false`);
      if (!res.ok) throw new Error("Failed to load pending photos.");
      const json = (await res.json()) as { data: PhotoRow[] };
      setPending(json.data ?? []);
    } catch (err) {
      setPendingError(err instanceof Error ? err.message : "Error loading photos.");
    } finally {
      setPendingLoading(false);
    }
  }, [weddingId]);

  /* ── Fetch approved ── */
  const fetchApproved = useCallback(async () => {
    setApprovedLoading(true); setApprovedError(null);
    try {
      const res = await authFetch(`/api/admin/photos?weddingId=${encodeURIComponent(weddingId)}&approved=true`);
      if (!res.ok) throw new Error("Failed to load approved photos.");
      const json = (await res.json()) as { data: PhotoRow[] };
      setApproved(json.data ?? []);
    } catch (err) {
      setApprovedError(err instanceof Error ? err.message : "Error loading photos.");
    } finally {
      setApprovedLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    if (activeTab === "pending")  void fetchPending();
    if (activeTab === "approved") void fetchApproved();
  }, [activeTab, fetchPending, fetchApproved]);

  /* ── Moderate (approve / reject) ── */
  async function moderate(photoId: string, approve: boolean) {
    setActionId(photoId);
    try {
      const res = await authFetch("/api/admin/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, isApproved: approve }),
      });
      if (!res.ok) throw new Error("Action failed.");
      // Remove from pending list; refresh approved count
      setPending(cur => cur.filter(p => p.id !== photoId));
      if (approve) {
        // Optimistically add to approved list
        const photo = pending.find(p => p.id === photoId);
        if (photo) setApproved(cur => [{ ...photo, is_approved: true }, ...cur]);
      }
    } catch (err) {
      setPendingError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionId(null);
    }
  }

  /* ── Admin upload ── */
  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) { setUploadStatus({ success: false, message: "Choose a photo first." }); return; }
    setIsSubmitting(true); setUploadStatus(null);
    try {
      const fd = new FormData();
      fd.append("file",       file);
      fd.append("uploadedBy", uploadedBy);
      fd.append("category",   category);
      fd.append("weddingId",  weddingId);
      const res = await authFetch("/api/upload-photo", { method: "POST", body: fd });
      if (!res.ok && res.headers.get("content-type")?.includes("text/")) throw new Error(await res.text());
      const data = (await res.json()) as UploadResponse;
      setUploadStatus(data);
      if (data.success) {
        setFile(null);
        // Refresh approved list so newly uploaded photo appears immediately
        void fetchApproved();
      }
    } catch (err) {
      setUploadStatus({ success: false, message: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Category label helper ── */
  const catLabel = (cat: string) => TAB_CATEGORIES[cat] ?? cat;

  /* ── Counts for badge display ── */
  const pendingCount  = pending.length;
  const approvedCount = approved.length;

  return (
    <Card noPad>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", overflowX: "auto" }}>
        <button type="button" style={tabStyle(activeTab === "upload")}   onClick={() => setActiveTab("upload")}>
          Upload
        </button>
        <button type="button" style={tabStyle(activeTab === "pending")}  onClick={() => setActiveTab("pending")}>
          Pending
          {pendingCount > 0 && (
            <span style={{
              marginLeft: 6, display: "inline-flex", alignItems: "center", justifyContent: "center",
              minWidth: 18, height: 18, borderRadius: 999, padding: "0 4px",
              background: "var(--color-accent)", color: "#fff", fontSize: "0.58rem", fontWeight: 700,
            }}>
              {pendingCount}
            </span>
          )}
        </button>
        <button type="button" style={tabStyle(activeTab === "approved")} onClick={() => setActiveTab("approved")}>
          Approved
          {approvedCount > 0 && (
            <span style={{
              marginLeft: 6, display: "inline-flex", alignItems: "center", justifyContent: "center",
              minWidth: 18, height: 18, borderRadius: 999, padding: "0 4px",
              background: "var(--color-sage,#2E7A5A)", color: "#fff", fontSize: "0.58rem", fontWeight: 700,
            }}>
              {approvedCount}
            </span>
          )}
        </button>
      </div>

      {/* ════════════════════════
          UPLOAD TAB
      ════════════════════════ */}
      {activeTab === "upload" && (
        <form className="p-6 space-y-5" onSubmit={handleUpload}>
          <div className="space-y-1">
            <SectionLabel>Photo upload</SectionLabel>
            <h3 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>
              Add to the archive
            </h3>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Admin uploads are automatically approved and visible immediately in the gallery.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase"
                style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>
                Uploaded by
              </label>
              <input style={inputStyle} value={uploadedBy} onChange={e => setUploadedBy(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase"
                style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>
                Category
              </label>
              <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="ceremony">Ceremony</option>
                <option value="reception">Reception</option>
                <option value="family">Family &amp; Friends</option>
                <option value="candid">Candid moments</option>
                <option value="snap">Guest snaps</option>
                <option value="live">Live feed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase"
              style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>
              Photo file
            </label>
            <input
              type="file" accept="image/*"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl px-4 py-4 text-sm"
              style={{
                background: "var(--color-surface-soft)",
                border: "1.5px dashed var(--color-border-medium)",
                color: "var(--color-text-secondary)",
              }}
            />
          </div>

          {uploadStatus && (
            <p className="rounded-xl px-4 py-3 text-sm" style={{
              background: uploadStatus.success ? "rgba(46,122,90,0.08)" : "#fef2f2",
              color:      uploadStatus.success ? "var(--color-sage,#2E7A5A)" : "#b91c1c",
              border:     `1px solid ${uploadStatus.success ? "rgba(46,122,90,0.18)" : "#fca5a5"}`,
            }}>
              {uploadStatus.message}
              {uploadStatus.url && (
                <a href={uploadStatus.url} target="_blank" rel="noreferrer" className="ml-2 underline text-xs">
                  View photo
                </a>
              )}
            </p>
          )}

          <Btn type="submit" variant="primary" size="md" loading={isSubmitting} className="w-full">
            <UploadCloud className="h-4 w-4" />
            {isSubmitting ? "Uploading…" : "Upload photo"}
          </Btn>
        </form>
      )}

      {/* ════════════════════════
          PENDING TAB
      ════════════════════════ */}
      {activeTab === "pending" && (
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <SectionLabel>Photo moderation</SectionLabel>
            <h3 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>
              Guest uploads awaiting review
            </h3>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Hidden from the public gallery until approved. Approving moves them to the gallery immediately.
            </p>
          </div>

          {pendingError && (
            <p className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" }}>
              {pendingError}{" "}
              <button className="ml-2 underline" onClick={() => void fetchPending()} type="button">Retry</button>
            </p>
          )}

          {pendingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-accent-soft)" }} />
            </div>
          ) : pending.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="h-9 w-9" />}
              title="No photos awaiting approval"
              description="Guest uploads will appear here for review. Once approved they appear in the gallery."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pending.map(photo => (
                <div key={photo.id} className="overflow-hidden rounded-2xl"
                  style={{ border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`Uploaded by ${photo.uploaded_by}`}
                    className="aspect-video w-full object-cover"
                    src={photo.image_url}
                  />
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        {photo.uploaded_by}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        {catLabel(photo.category)} · {new Date(photo.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Btn
                        type="button" variant="primary" size="sm"
                        loading={actionId === photo.id} className="flex-1"
                        onClick={() => void moderate(photo.id, true)}
                        style={{ background: "linear-gradient(135deg,#2E7A5A,#4d7a50)" }}
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </Btn>
                      <button
                        type="button"
                        disabled={actionId === photo.id}
                        onClick={() => void moderate(photo.id, false)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-xs uppercase font-semibold transition"
                        style={{ letterSpacing: "0.15em", background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#b91c1c" }}
                      >
                        {actionId === photo.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <XCircle className="h-3.5 w-3.5" />}
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════
          APPROVED TAB
      ════════════════════════ */}
      {activeTab === "approved" && (
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <SectionLabel>Live in gallery</SectionLabel>
            <h3 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>
              Approved photos
            </h3>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              These are publicly visible at <strong>/gallery</strong>. {approvedCount > 0 && `${approvedCount} photo${approvedCount !== 1 ? "s" : ""} live.`}
            </p>
          </div>

          {approvedError && (
            <p className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" }}>
              {approvedError}{" "}
              <button className="ml-2 underline" onClick={() => void fetchApproved()} type="button">Retry</button>
            </p>
          )}

          {approvedLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-accent-soft)" }} />
            </div>
          ) : approved.length === 0 ? (
            <EmptyState
              icon={<Images className="h-9 w-9" />}
              title="No approved photos yet"
              description="Approve guest uploads from the Pending tab, or upload photos directly using the Upload tab."
            />
          ) : (
            <>
              {/* Category breakdown */}
              {(() => {
                const byCat = approved.reduce<Record<string, number>>((acc, p) => {
                  acc[p.category] = (acc[p.category] ?? 0) + 1;
                  return acc;
                }, {});
                return (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginBottom: ".25rem" }}>
                    {Object.entries(byCat).map(([cat, count]) => (
                      <span key={cat} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "4px 12px", borderRadius: 999,
                        background: "var(--color-surface-soft)",
                        border: "1px solid var(--color-border)",
                        fontSize: ".6rem", fontWeight: 600,
                        letterSpacing: ".12em", textTransform: "uppercase",
                        color: "var(--color-text-secondary)",
                      }}>
                        {catLabel(cat)} <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>{count}</span>
                      </span>
                    ))}
                  </div>
                );
              })()}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {approved.map(photo => (
                  <div key={photo.id} className="overflow-hidden rounded-2xl group relative"
                    style={{ border: "1px solid var(--color-border)", boxShadow: "var(--shadow-xs)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={`${photo.category} by ${photo.uploaded_by}`}
                      className="aspect-square w-full object-cover"
                      src={photo.image_url}
                    />
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      padding: "10px 12px",
                      background: "linear-gradient(to top,rgba(12,6,8,.75),transparent)",
                    }}>
                      <p style={{ fontSize: ".55rem", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,240,220,.80)" }}>
                        {catLabel(photo.category)}
                      </p>
                      <p style={{ fontSize: ".72rem", color: "rgba(255,255,255,.85)", fontWeight: 500, marginTop: 1 }}>
                        {photo.uploaded_by}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="/gallery" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium"
                style={{ color: "var(--color-accent)", textDecoration: "none" }}
              >
                <Eye className="h-4 w-4" />
                View public gallery →
              </a>
            </>
          )}
        </div>
      )}

    </Card>
  );
}

export default UploadManager;
