"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Globe, Lock, ChevronLeft, Images } from "lucide-react";
import { LightBox } from "@/components/gallery/LightBox";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import type { PhotoRow } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface VaultAlbum {
  id:          string;
  album_name:  string;
  description: string | null;
  cover_photo: string | null;
  is_public:   boolean;
  photo_count: number;
}

interface VaultPhotoArchiveProps {
  photos:        PhotoRow[];
  albums:        VaultAlbum[];
}

const BF     = "var(--font-body), system-ui, sans-serif";
const DF     = "var(--font-display), Georgia, serif";
const ACCENT = "var(--color-accent)";

// ─────────────────────────────────────────────────────────────────────────────
// Download helper — creates a temporary <a> and triggers browser download
// ─────────────────────────────────────────────────────────────────────────────
function downloadPhoto(url: string, filename?: string) {
  // Open in new tab as the most reliable cross-origin download
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? "photo.jpg";
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─────────────────────────────────────────────────────────────────────────────
// AlbumGrid — shows album cards, click to enter
// ─────────────────────────────────────────────────────────────────────────────
function AlbumGrid({
  albums,
  unassigned,
  onSelect,
}: {
  albums: VaultAlbum[];
  unassigned: PhotoRow[];
  onSelect: (albumId: string | "unassigned") => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
        {albums.map((album) => (
          <button
            key={album.id}
            onClick={() => onSelect(album.id)}
            style={{
              textAlign: "left", background: "var(--color-surface)",
              border: "1px solid var(--color-border)", borderRadius: "1.25rem",
              overflow: "hidden", cursor: "pointer", transition: "box-shadow .2s, transform .2s",
              boxShadow: "var(--shadow-xs)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-xs)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
          >
            {/* Cover */}
            <div style={{ height: 140, background: album.cover_photo ? `url(${album.cover_photo}) center/cover` : "var(--color-surface-muted)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {!album.cover_photo && <Images size={28} style={{ color: "var(--color-text-muted)" }} />}
              {/* Visibility badge */}
              <span style={{
                position: "absolute", top: 8, right: 8, display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 8px", borderRadius: 999, fontSize: "0.6rem", fontWeight: 600,
                letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: BF,
                background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", color: "#fff",
              }}>
                {album.is_public ? <Globe size={9} /> : <Lock size={9} />}
                {album.is_public ? "Public" : "Family"}
              </span>
            </div>
            <div style={{ padding: "0.875rem 1rem" }}>
              <p style={{ fontFamily: DF, fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                {album.album_name}
              </p>
              {album.description && (
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontFamily: BF, marginBottom: "0.375rem" }}>
                  {album.description}
                </p>
              )}
              <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, fontFamily: BF }}>
                {album.photo_count} photo{album.photo_count !== 1 ? "s" : ""}
              </p>
            </div>
          </button>
        ))}

        {/* Unassigned bucket */}
        {unassigned.length > 0 && (
          <button
            onClick={() => onSelect("unassigned")}
            style={{
              textAlign: "left", background: "var(--color-surface)",
              border: "1px dashed var(--color-border)", borderRadius: "1.25rem",
              overflow: "hidden", cursor: "pointer", transition: "box-shadow .2s",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ height: 140, background: "var(--color-surface-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Images size={28} style={{ color: "var(--color-text-muted)" }} />
            </div>
            <div style={{ padding: "0.875rem 1rem" }}>
              <p style={{ fontFamily: DF, fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                All photos
              </p>
              <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, fontFamily: BF }}>
                {unassigned.length} photo{unassigned.length !== 1 ? "s" : ""}
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AlbumView — shows photos inside an album with download buttons
// ─────────────────────────────────────────────────────────────────────────────
function AlbumView({
  album,
  photos,
  onBack,
}: {
  album: VaultAlbum | "unassigned";
  photos: PhotoRow[];
  onBack: () => void;
}) {
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [activeIndex,   setActiveIndex]   = useState(0);

  const albumName  = album === "unassigned" ? "All photos" : album.album_name;
  const albumDesc  = album === "unassigned" ? null : album.description;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Back + header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <button
          onClick={onBack}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9999, background: "var(--color-surface)", border: "1px solid var(--color-border)", fontSize: "0.75rem", fontFamily: BF, color: "var(--color-text-secondary)", cursor: "pointer", letterSpacing: "0.12em", textTransform: "uppercase" }}
        >
          <ChevronLeft size={14} /> All albums
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: DF, fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{albumName}</p>
          {albumDesc && <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontFamily: BF }}>{albumDesc}</p>}
        </div>
        <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, fontFamily: BF }}>
          {photos.length} photo{photos.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Photo grid with download overlay */}
      {photos.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", borderRadius: "1rem", border: "1px dashed var(--color-border)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", fontFamily: BF }}>No photos in this album yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.625rem" }}>
          {photos.map((photo, i) => (
            <div key={photo.id} style={{ position: "relative", borderRadius: "0.875rem", overflow: "hidden", aspectRatio: "1", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-xs)" }}>
              <button
                onClick={() => { setActiveIndex(i); setLightboxOpen(true); }}
                style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", background: "none", border: "none", padding: 0, cursor: "zoom-in" }}
              >
                <Image
                  src={photo.image_url}
                  alt={photo.uploaded_by}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 200px"
                />
              </button>
              {/* Download button overlay */}
              <button
                onClick={(e) => { e.stopPropagation(); downloadPhoto(photo.image_url, `photo-${photo.id}.jpg`); }}
                title="Download photo"
                style={{
                  position: "absolute", bottom: 6, right: 6,
                  width: 30, height: 30, borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "grid", placeItems: "center", cursor: "pointer",
                  opacity: 0, transition: "opacity .2s",
                }}
                className="photo-download-btn"
              >
                <Download size={13} style={{ color: "#fff" }} />
              </button>
              <style>{`.photo-download-btn { opacity: 0 } *:hover > .photo-download-btn { opacity: 1 }`}</style>
            </div>
          ))}
        </div>
      )}

      <LightBox
        open={lightboxOpen}
        photos={photos}
        activeIndex={activeIndex}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setActiveIndex((v) => (v + 1) % photos.length)}
        onPrevious={() => setActiveIndex((v) => (v - 1 + photos.length) % photos.length)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VaultPhotoArchive — main export
// ─────────────────────────────────────────────────────────────────────────────
export function VaultPhotoArchive({ photos, albums }: VaultPhotoArchiveProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  // Photos by album id
  const albumPhotos = (albumId: string) =>
    photos.filter((p) => (p as PhotoRow & { album_id?: string | null }).album_id === albumId);

  // Unassigned photos (no album_id)
  const unassigned = photos.filter(
    (p) => !(p as PhotoRow & { album_id?: string | null }).album_id
  );

  // Has any albums at all
  const hasAlbums = albums.length > 0;

  // No photos at all
  if (photos.length === 0) return null;

  // No albums — fall back to plain PhotoGrid with no album UI
  if (!hasAlbums) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: ACCENT, fontFamily: BF }}>
            Photo archive
          </p>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", fontFamily: BF }}>
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </span>
        </div>
        <PhotoGrid photos={photos} />
      </div>
    );
  }

  // Album selected — show photos inside it
  if (selectedAlbum) {
    const album = selectedAlbum === "unassigned"
      ? "unassigned" as const
      : albums.find((a) => a.id === selectedAlbum)!;

    const photosInView = selectedAlbum === "unassigned"
      ? unassigned
      : albumPhotos(selectedAlbum);

    return (
      <AlbumView
        album={album}
        photos={photosInView}
        onBack={() => setSelectedAlbum(null)}
      />
    );
  }

  // Album overview
  const enrichedAlbums = albums.map((a) => ({
    ...a,
    photo_count: albumPhotos(a.id).length,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: ACCENT, fontFamily: BF }}>
          Photo archive
        </p>
        <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", fontFamily: BF }}>
          {albums.length} album{albums.length !== 1 ? "s" : ""} · {photos.length} photos
        </span>
      </div>
      <AlbumGrid
        albums={enrichedAlbums}
        unassigned={unassigned}
        onSelect={setSelectedAlbum}
      />
    </div>
  );
}

export default VaultPhotoArchive;
