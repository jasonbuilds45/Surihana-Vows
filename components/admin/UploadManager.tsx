"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Loader2, UploadCloud, XCircle } from "lucide-react";
import { Card, SectionLabel, Field, Btn, EmptyState } from "@/components/ui";
import { authFetch } from "@/lib/client/token";

interface UploadManagerProps { weddingId: string; }
interface UploadResponse { success: boolean; message: string; url?: string; demoMode?: boolean; }
interface PendingPhoto { id: string; image_url: string; uploaded_by: string; category: string; created_at: string; is_approved: boolean; }
type ActiveTab = "upload" | "pending";

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: "0.875rem 1.5rem",
  fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase",
  color: active ? "var(--color-accent)" : "var(--color-text-muted)",
  borderBottom: active ? `2px solid var(--color-accent)` : "2px solid transparent",
  background: "transparent", cursor: "pointer", transition: "all 0.2s",
});

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", background: "var(--color-surface-soft)",
  border: "1.5px solid var(--color-border-medium)", borderRadius: "12px",
  padding: "0.75rem 1rem", color: "var(--color-text-primary)", fontSize: "0.9375rem",
  outline: "none", fontFamily: "var(--font-body), sans-serif",
};

export function UploadManager({ weddingId }: UploadManagerProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [uploadedBy, setUploadedBy] = useState("Event Team");
  const [category, setCategory] = useState("weekend");
  const [uploadStatus, setUploadStatus] = useState<UploadResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setPendingLoading(true); setPendingError(null);
    try {
      const res = await authFetch(`/api/admin/photos?weddingId=${encodeURIComponent(weddingId)}&approved=false`);
      if (!res.ok) throw new Error("Failed to load.");
      const json = (await res.json()) as { data: PendingPhoto[] };
      setPending(json.data ?? []);
    } catch (err) { setPendingError(err instanceof Error ? err.message : "Error."); }
    finally { setPendingLoading(false); }
  }, [weddingId]);

  useEffect(() => { if (activeTab === "pending") void fetchPending(); }, [activeTab, fetchPending]);

  async function moderate(photoId: string, approve: boolean) {
    setActionId(photoId);
    try {
      const res = await authFetch("/api/admin/photos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photoId, isApproved: approve }) });
      if (!res.ok) throw new Error("Action failed.");
      setPending((cur) => cur.filter((p) => p.id !== photoId));
    } catch (err) { setPendingError(err instanceof Error ? err.message : "Error."); }
    finally { setActionId(null); }
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) { setUploadStatus({ success: false, message: "Choose a photo." }); return; }
    setIsSubmitting(true); setUploadStatus(null);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("uploadedBy", uploadedBy); fd.append("category", category); fd.append("weddingId", weddingId);
      // authFetch adds Authorization header so the server recognises admin session
      // Do NOT set Content-Type — browser must set it with the multipart boundary
      const res = await authFetch("/api/upload-photo", { method: "POST", body: fd });
      if (!res.ok && res.headers.get("content-type")?.includes("text/")) {
        throw new Error(await res.text());
      }
      const data = (await res.json()) as UploadResponse;
      setUploadStatus(data);
      if (data.success) setFile(null);
    } catch (err) { setUploadStatus({ success: false, message: err instanceof Error ? err.message : "Upload failed." }); }
    finally { setIsSubmitting(false); }
  }

  return (
    <Card noPad>
      {/* Tabs */}
      <div className="flex" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <button type="button" style={tabStyle(activeTab === "upload")} onClick={() => setActiveTab("upload")}>Upload</button>
        <button type="button" style={tabStyle(activeTab === "pending")} onClick={() => setActiveTab("pending")}>
          Pending approval
          {pending.length > 0 && (
            <span className="ml-2 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-xs text-white" style={{ background: "var(--color-accent)", fontSize: "0.6rem" }}>
              {pending.length}
            </span>
          )}
        </button>
      </div>

      {/* Upload tab */}
      {activeTab === "upload" && (
        <form className="p-6 space-y-5" onSubmit={handleUpload}>
          <div className="space-y-1">
            <SectionLabel>Photo upload</SectionLabel>
            <h3 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>Add to the archive</h3>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Admin uploads are automatically approved and visible immediately.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>Uploaded by</label>
              <input style={inputStyle} value={uploadedBy} onChange={(e) => setUploadedBy(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>Category</label>
              <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="portraits">Portraits</option>
                <option value="family">Family</option>
                <option value="weekend">Wedding weekend</option>
                <option value="live">Live feed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase" style={{ letterSpacing: "0.15em", color: "var(--color-text-secondary)" }}>Photo file</label>
            <input
              type="file" accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl px-4 py-4 text-sm"
              style={{ background: "var(--color-surface-soft)", border: "1.5px dashed var(--color-border-medium)", color: "var(--color-text-secondary)" }}
            />
          </div>

          {uploadStatus && (
            <p className="rounded-xl px-4 py-3 text-sm" style={{ background: uploadStatus.success ? "rgba(107,142,110,0.1)" : "#fef2f2", color: uploadStatus.success ? "var(--color-sage)" : "#b91c1c", border: `1px solid ${uploadStatus.success ? "rgba(107,142,110,0.2)" : "#fca5a5"}` }}>
              {uploadStatus.message}
              {uploadStatus.url && <a href={uploadStatus.url} target="_blank" rel="noreferrer" className="ml-2 underline text-xs">View asset</a>}
            </p>
          )}

          <Btn type="submit" variant="primary" size="md" loading={isSubmitting} className="w-full">
            <UploadCloud className="h-4 w-4" />
            {isSubmitting ? "Uploading..." : "Upload photo"}
          </Btn>
        </form>
      )}

      {/* Pending tab */}
      {activeTab === "pending" && (
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <SectionLabel>Photo moderation</SectionLabel>
            <h3 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>Guest uploads awaiting review</h3>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Hidden from the public gallery until approved.</p>
          </div>

          {pendingLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-accent-soft)" }} /></div>
          ) : pendingError ? (
            <p className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" }}>
              {pendingError} <button className="ml-2 underline" onClick={() => void fetchPending()} type="button">Retry</button>
            </p>
          ) : pending.length === 0 ? (
            <EmptyState icon={<UploadCloud className="h-9 w-9" />} title="No photos awaiting approval" description="Guest uploads will appear here for review." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pending.map((photo) => (
                <div key={photo.id} className="overflow-hidden rounded-2xl" style={{ border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={`Uploaded by ${photo.uploaded_by}`} className="aspect-video w-full object-cover" src={photo.image_url} />
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{photo.uploaded_by}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{photo.category} · {new Date(photo.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Btn type="button" variant="primary" size="sm" loading={actionId === photo.id} className="flex-1" onClick={() => void moderate(photo.id, true)} style={{ background: "linear-gradient(135deg, var(--color-sage), #4d7a50)" }}>
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </Btn>
                      <button
                        type="button"
                        disabled={actionId === photo.id}
                        onClick={() => void moderate(photo.id, false)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-xs uppercase font-semibold transition"
                        style={{ letterSpacing: "0.15em", background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#b91c1c" }}
                      >
                        {actionId === photo.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
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
    </Card>
  );
}

export default UploadManager;
