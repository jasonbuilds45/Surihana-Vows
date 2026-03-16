"use client";

import { type FormEvent, useState } from "react";
import { authFetch } from "@/lib/client/token";
import { Plus, Trash2, Edit2, Star, Globe, Lock, Loader2, X, Check } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface PhotoAlbum {
  id:          string;
  album_name:  string;
  description: string | null;
  cover_photo: string | null;
  is_public:   boolean;
  sort_order:  number;
  photo_count: number;
}

export interface AdminPhoto {
  id:         string;
  image_url:  string;
  uploaded_by: string;
  category:   string;
  created_at: string;
  album_id:   string | null;
}

interface PhotoAlbumManagerProps {
  initialAlbums: PhotoAlbum[];
  initialPhotos: AdminPhoto[];
  weddingId:     string;
}

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
  padding: ".7rem 1rem", color: INK, fontSize: ".9rem",
  fontFamily: BF, outline: "none",
};

// ─────────────────────────────────────────────────────────────────────────────
export function PhotoAlbumManager({ initialAlbums, initialPhotos, weddingId }: PhotoAlbumManagerProps) {
  const [albums,       setAlbums]       = useState<PhotoAlbum[]>(initialAlbums);
  const [photos,       setPhotos]       = useState<AdminPhoto[]>(initialPhotos);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [adding,       setAdding]       = useState(false);
  const [editing,      setEditing]      = useState<string | null>(null);
  const [saving,       setSaving]       = useState<string | null>(null);
  const [statusMsg,    setStatusMsg]    = useState<string | null>(null);
  const [newAlbum,     setNewAlbum]     = useState({ album_name: "", description: "", is_public: true });
  const [editForm,     setEditForm]     = useState({ album_name: "", description: "", is_public: true });

  function flash(msg: string) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  // ── Create album ───────────────────────────────────────────────────────────
  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newAlbum.album_name.trim()) return;
    setSaving("new");
    try {
      const res = await authFetch("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingId, albumName: newAlbum.album_name.trim(), description: newAlbum.description.trim() || null, isPublic: newAlbum.is_public }),
      });
      const data = await res.json() as { success: boolean; data?: PhotoAlbum };
      if (!res.ok || !data.success || !data.data) throw new Error();
      setAlbums(prev => [...prev, { ...data.data!, photo_count: 0 }]);
      setNewAlbum({ album_name: "", description: "", is_public: true });
      setAdding(false);
      flash("Album created ✓");
    } catch { flash("Failed to create album."); }
    finally { setSaving(null); }
  }

  // ── Save edit ──────────────────────────────────────────────────────────────
  async function handleSaveEdit(albumId: string) {
    setSaving(albumId);
    try {
      const res = await authFetch(`/api/admin/albums/${albumId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumName: editForm.album_name, description: editForm.description || null, isPublic: editForm.is_public }),
      });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error();
      setAlbums(prev => prev.map(a => a.id === albumId ? { ...a, album_name: editForm.album_name, description: editForm.description || null, is_public: editForm.is_public } : a));
      setEditing(null);
      flash("Album updated ✓");
    } catch { flash("Failed to update."); }
    finally { setSaving(null); }
  }

  // ── Delete album ───────────────────────────────────────────────────────────
  async function handleDelete(albumId: string, albumName: string) {
    if (!window.confirm(`Delete "${albumName}"? Photos will become unassigned.`)) return;
    setSaving(albumId);
    try {
      const res = await authFetch(`/api/admin/albums/${albumId}`, { method: "DELETE" });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error();
      setAlbums(prev => prev.filter(a => a.id !== albumId));
      setPhotos(prev => prev.map(p => p.album_id === albumId ? { ...p, album_id: null } : p));
      if (selectedAlbum === albumId) setSelectedAlbum(null);
      flash("Album deleted.");
    } catch { flash("Failed to delete."); }
    finally { setSaving(null); }
  }

  // ── Assign photo to album ──────────────────────────────────────────────────
  async function assignPhotoToAlbum(photoId: string, albumId: string | null) {
    setSaving(`photo-${photoId}`);
    try {
      const res = await authFetch(`/api/admin/albums/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, albumId }),
      });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error();
      setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, album_id: albumId } : p));
    } catch { flash("Failed to update photo."); }
    finally { setSaving(null); }
  }

  // ── Set cover photo ────────────────────────────────────────────────────────
  async function setCover(albumId: string, imageUrl: string) {
    setSaving(`cover-${albumId}`);
    try {
      const res = await authFetch(`/api/admin/albums/${albumId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPhoto: imageUrl }),
      });
      const data = await res.json() as { success: boolean };
      if (!res.ok || !data.success) throw new Error();
      setAlbums(prev => prev.map(a => a.id === albumId ? { ...a, cover_photo: imageUrl } : a));
      flash("Cover photo updated ✓");
    } catch { flash("Failed to set cover."); }
    finally { setSaving(null); }
  }

  const albumPhotos = selectedAlbum ? photos.filter(p => p.album_id === selectedAlbum) : [];
  const unassigned  = photos.filter(p => !p.album_id);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: ROSE, fontFamily: BF }}>Photo albums</p>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 700, color: INK, marginTop: ".2rem" }}>Manage photo albums</h2>
          <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF, marginTop: ".375rem" }}>
            {albums.length} album{albums.length !== 1 ? "s" : ""} · {photos.length} total photos · {unassigned.length} unassigned
          </p>
        </div>
        <button onClick={() => setAdding(a => !a)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 999, background: adding ? BG : ROSE, color: adding ? INK : W, border: `1.5px solid ${adding ? BDR : ROSE}`, fontSize: ".82rem", fontWeight: 700, fontFamily: BF, cursor: "pointer" }}>
          {adding ? <><X size={15} /> Cancel</> : <><Plus size={15} /> New album</>}
        </button>
      </div>

      {/* Create form */}
      {adding && (
        <form onSubmit={handleCreate} style={{ background: BG, border: `1px solid ${BDR}`, borderRadius: 18, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontFamily: DF, fontSize: "1rem", fontWeight: 700, color: INK }}>New album</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: ".58rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".375rem", fontFamily: BF }}>Album name *</label>
              <input value={newAlbum.album_name} onChange={e => setNewAlbum(a => ({ ...a, album_name: e.target.value }))} required placeholder="Ceremony, Reception…" style={inp} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".58rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".375rem", fontFamily: BF }}>Visibility</label>
              <select value={newAlbum.is_public ? "public" : "private"} onChange={e => setNewAlbum(a => ({ ...a, is_public: e.target.value === "public" }))} style={inp}>
                <option value="public">Public (guest gallery)</option>
                <option value="private">Private (family vault)</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: ".58rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: INK3, marginBottom: ".375rem", fontFamily: BF }}>Description</label>
            <input value={newAlbum.description} onChange={e => setNewAlbum(a => ({ ...a, description: e.target.value }))} placeholder="Optional description" style={inp} />
          </div>
          <button type="submit" disabled={saving === "new"} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 22px", borderRadius: 999, background: ROSE, color: W, border: "none", fontSize: ".82rem", fontWeight: 700, fontFamily: BF, cursor: "pointer", alignSelf: "flex-start" }}>
            {saving === "new" ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Create album
          </button>
        </form>
      )}

      {statusMsg && (
        <p style={{ padding: "10px 16px", borderRadius: 12, background: "rgba(107,142,110,0.1)", color: "#166534", border: "1px solid rgba(107,142,110,0.3)", fontSize: ".875rem", fontFamily: BF }}>
          {statusMsg}
        </p>
      )}

      {/* Albums grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
        {albums.map(album => {
          const isEditing = editing === album.id;
          const isSaving  = saving === album.id;
          return (
            <div key={album.id} style={{ background: W, border: `1px solid ${selectedAlbum === album.id ? ROSE : BDR}`, borderRadius: 16, overflow: "hidden", cursor: "pointer" }}
              onClick={() => setSelectedAlbum(s => s === album.id ? null : album.id)}>
              {/* Cover */}
              <div style={{ height: 140, background: album.cover_photo ? `url(${album.cover_photo}) center/cover` : BG, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {!album.cover_photo && <p style={{ fontSize: ".875rem", color: "#C0A8A0", fontFamily: BF }}>No cover photo</p>}
                <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: ".375rem" }} onClick={e => e.stopPropagation()}>
                  <span style={{ padding: "3px 8px", borderRadius: 999, background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)", fontSize: ".65rem", color: W, fontFamily: BF, display: "flex", alignItems: "center", gap: 4 }}>
                    {album.is_public ? <Globe size={10} /> : <Lock size={10} />}
                    {album.is_public ? "Public" : "Private"}
                  </span>
                </div>
              </div>

              <div style={{ padding: "1rem 1.125rem" }}>
                {isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: ".625rem" }} onClick={e => e.stopPropagation()}>
                    <input value={editForm.album_name} onChange={e => setEditForm(f => ({ ...f, album_name: e.target.value }))} style={{ ...inp, padding: ".5rem .75rem", fontSize: ".875rem" }} />
                    <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" style={{ ...inp, padding: ".5rem .75rem", fontSize: ".875rem" }} />
                    <select value={editForm.is_public ? "public" : "private"} onChange={e => setEditForm(f => ({ ...f, is_public: e.target.value === "public" }))} style={{ ...inp, padding: ".5rem .75rem", fontSize: ".875rem" }}>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                    <div style={{ display: "flex", gap: ".5rem" }}>
                      <button onClick={() => handleSaveEdit(album.id)} disabled={isSaving} style={{ flex: 1, padding: "6px", borderRadius: 9999, background: ROSE, color: W, border: "none", fontSize: ".78rem", fontWeight: 700, fontFamily: BF, cursor: "pointer" }}>
                        {isSaving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => setEditing(null)} style={{ flex: 1, padding: "6px", borderRadius: 9999, background: BG, border: `1px solid ${BDR}`, fontSize: ".78rem", fontFamily: BF, cursor: "pointer" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".5rem" }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: ".9375rem", color: INK, fontFamily: BF, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{album.album_name}</p>
                        {album.description && <p style={{ fontSize: ".78rem", color: INK3, fontFamily: BF, marginTop: ".125rem" }}>{album.description}</p>}
                        <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, marginTop: ".375rem" }}>{album.photo_count} photo{album.photo_count !== 1 ? "s" : ""}</p>
                      </div>
                      <div style={{ display: "flex", gap: ".375rem", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setEditing(album.id); setEditForm({ album_name: album.album_name, description: album.description ?? "", is_public: album.is_public }); }} style={{ padding: 6, borderRadius: 9999, background: BG, border: `1px solid ${BDR}`, cursor: "pointer", display: "grid", placeItems: "center" }}>
                          <Edit2 size={13} style={{ color: INK3 }} />
                        </button>
                        <button onClick={() => handleDelete(album.id, album.album_name)} disabled={isSaving} style={{ padding: 6, borderRadius: 9999, background: "#fef2f2", border: "1px solid #fca5a5", cursor: "pointer", display: "grid", placeItems: "center", color: "#b91c1c" }}>
                          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected album photos */}
      {selectedAlbum && (
        <div style={{ background: BG, border: `1px solid ${BDR}`, borderRadius: 18, padding: "1.5rem" }}>
          <p style={{ fontFamily: DF, fontSize: "1.125rem", fontWeight: 700, color: INK, marginBottom: "1rem" }}>
            Photos in "{albums.find(a => a.id === selectedAlbum)?.album_name}"
          </p>
          {albumPhotos.length === 0 ? (
            <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>No photos in this album yet. Assign photos from below.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: ".75rem" }}>
              {albumPhotos.map(p => (
                <div key={p.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt={p.uploaded_by} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: ".5rem", background: "linear-gradient(transparent, rgba(0,0,0,.55))", display: "flex", gap: ".375rem" }}>
                    <button onClick={() => setCover(selectedAlbum, p.image_url)} title="Set as cover" style={{ flex: 1, padding: "4px", borderRadius: 7, background: "rgba(255,255,255,.2)", border: "none", color: W, fontSize: ".65rem", cursor: "pointer", backdropFilter: "blur(4px)" }}>
                      <Star size={11} style={{ display: "inline", marginRight: 3 }} /> Cover
                    </button>
                    <button onClick={() => assignPhotoToAlbum(p.id, null)} title="Remove from album" style={{ flex: 1, padding: "4px", borderRadius: 7, background: "rgba(255,255,255,.2)", border: "none", color: W, fontSize: ".65rem", cursor: "pointer", backdropFilter: "blur(4px)" }}>
                      <X size={11} style={{ display: "inline", marginRight: 3 }} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Unassigned photos to add */}
          {unassigned.length > 0 && (
            <div style={{ marginTop: "1.25rem" }}>
              <p style={{ fontFamily: BF, fontWeight: 600, fontSize: ".8rem", color: INK3, marginBottom: ".75rem" }}>Add unassigned photos</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: ".625rem" }}>
                {unassigned.map(p => (
                  <div key={p.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: `2px solid transparent` }}
                    onClick={() => assignPhotoToAlbum(p.id, selectedAlbum)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url} alt={p.uploaded_by} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", filter: "brightness(.85)" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.25)" }}>
                      <Plus size={22} style={{ color: W }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default PhotoAlbumManager;
