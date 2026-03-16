"use client";

/**
 * VaultPhotoAlbums
 * Surfaces photo albums (created in admin) inside the family vault.
 * Public albums are also visible in the guest gallery.
 * Private albums appear here only.
 *
 * Features:
 *  - Album grid with cover photo, name, description, photo count, visibility badge
 *  - Click album → full-screen photo grid for that album
 *  - Download button on every photo (opens image in new tab for native save)
 *  - Falls back gracefully when no albums exist
 */

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Download, Globe, Lock, Images } from "lucide-react";
import { LightBox } from "@/components/gallery/LightBox";
import type { PhotoRow } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface VaultAlbum {
  id:          string;
  album_name:  string;
  description: string | null;
  cover_photo: string | null;
  is_public:   boolean;
  sort_order:  number;
  photo_count: number;
}

interface VaultPhotoAlbumsProps {
  albums: VaultAlbum[];
  photos: PhotoRow[];
}

const BF   = "var(--font-body), system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";
const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BG   = "#FAF8F6";
const W    = "#FFFFFF";
const BDR  = "#D0C0BC";

// ─────────────────────────────────────────────────────────────────────────────
// Download helper — opens image URL in new tab (triggers native save dialog)
// ─────────────────────────────────────────────────────────────────────────────
async function downloadPhoto(url: string, filename: string) {
  try {
    const res  = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
  } catch {
    // Fallback: open in new tab if CORS blocks direct download
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AlbumPhotoGrid — full album view after clicking an album card
// ─────────────────────────────────────────────────────────────────────────────
function AlbumPhotoGrid({ album, photos, onBack }: { album: VaultAlbum; photos: PhotoRow[]; onBack: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen,  setLightboxOpen]  = useState(false);

  if (photos.length === 0) {
    return (
      <div>
        <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "1.5rem", background: "none", border: "none", cursor: "pointer", color: ROSE, fontSize: ".875rem", fontFamily: BF, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to albums
        </button>
        <div style={{ padding: "3rem", textAlign: "center", background: BG, borderRadius: 18, border: `1.5px dashed ${BDR}` }}>
          <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>No photos in this album yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back + header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: ".5rem", background: "none", border: "none", cursor: "pointer", color: ROSE, fontSize: ".8rem", fontFamily: BF, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>
            <ArrowLeft size={14} /> All albums
          </button>
          <h3 style={{ fontFamily: DF, fontSize: "clamp(1.25rem,3vw,1.75rem)", fontWeight: 700, color: INK }}>{album.album_name}</h3>
          {album.description && <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF, marginTop: ".25rem" }}>{album.description}</p>}
          <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, marginTop: ".375rem" }}>{photos.length} photo{photos.length !== 1 ? "s" : ""}</p>
        </div>
        {/* Download all button */}
        <button
          onClick={() => photos.forEach((p, i) => setTimeout(() => downloadPhoto(p.image_url, `${album.album_name}-${i + 1}.jpg`), i * 200))}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 999, background: BG, border: `1.5px solid ${BDR}`, color: INK3, fontSize: ".78rem", fontWeight: 600, fontFamily: BF, cursor: "pointer", letterSpacing: ".12em", textTransform: "uppercase" }}
        >
          <Download size={14} /> Download all
        </button>
      </div>

      {/* Photo grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: ".75rem" }}>
        {photos.map((photo, index) => (
          <div key={photo.id} style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: BG, aspectRatio: "1" }}>
            <button
              type="button"
              onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
              style={{ display: "block", width: "100%", height: "100%", padding: 0, border: "none", cursor: "pointer", position: "relative" }}
            >
              <Image
                src={photo.image_url}
                alt={photo.uploaded_by}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 200px"
                style={{ transition: "transform .4s ease" }}
              />
            </button>
            {/* Download button overlay */}
            <button
              onClick={() => downloadPhoto(photo.image_url, `${album.album_name}-${index + 1}.jpg`)}
              style={{ position: "absolute", bottom: 6, right: 6, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.2)", display: "grid", placeItems: "center", cursor: "pointer" }}
              title="Download photo"
            >
              <Download size={13} style={{ color: W }} />
            </button>
          </div>
        ))}
      </div>

      <LightBox
        photos={photos}
        activeIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setLightboxIndex(i => (i + 1) % photos.length)}
        onPrevious={() => setLightboxIndex(i => (i - 1 + photos.length) % photos.length)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VaultPhotoAlbums — main export
// ─────────────────────────────────────────────────────────────────────────────
export function VaultPhotoAlbums({ albums, photos }: VaultPhotoAlbumsProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  if (albums.length === 0) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", background: BG, borderRadius: 20, border: `1.5px dashed ${BDR}` }}>
        <Images size={36} style={{ color: BDR, margin: "0 auto 1rem" }} />
        <p style={{ fontFamily: DF, fontSize: "1.125rem", color: INK, marginBottom: ".5rem" }}>No albums yet.</p>
        <p style={{ fontSize: ".875rem", color: INK3, fontFamily: BF }}>The couple will publish photo albums here after the wedding.</p>
      </div>
    );
  }

  // Selected album view
  if (selectedAlbum) {
    const album       = albums.find(a => a.id === selectedAlbum)!;
    const albumPhotos = photos.filter(p => (p as PhotoRow & { album_id?: string | null }).album_id === selectedAlbum);
    return <AlbumPhotoGrid album={album} photos={albumPhotos} onBack={() => setSelectedAlbum(null)} />;
  }

  // Album grid
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem" }}>
      {albums.map(album => (
        <button
          key={album.id}
          type="button"
          onClick={() => setSelectedAlbum(album.id)}
          style={{ background: W, border: `1px solid ${BDR}`, borderRadius: 18, overflow: "hidden", textAlign: "left", cursor: "pointer", transition: "box-shadow .2s, transform .2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(0,0,0,.1)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}
        >
          {/* Cover */}
          <div style={{ height: 160, background: album.cover_photo ? `url(${album.cover_photo}) center/cover` : BG, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!album.cover_photo && <Images size={28} style={{ color: BDR }} />}
            {/* Visibility badge */}
            <span style={{ position: "absolute", top: 10, right: 10, display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)", fontSize: ".62rem", color: W, fontFamily: BF, fontWeight: 600 }}>
              {album.is_public ? <Globe size={10} /> : <Lock size={10} />}
              {album.is_public ? "Public" : "Private"}
            </span>
          </div>
          {/* Info */}
          <div style={{ padding: "1rem 1.125rem" }}>
            <p style={{ fontWeight: 700, fontSize: ".9375rem", color: INK, fontFamily: BF, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{album.album_name}</p>
            {album.description && <p style={{ fontSize: ".78rem", color: INK3, fontFamily: BF, marginTop: ".125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{album.description}</p>}
            <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, marginTop: ".5rem" }}>{album.photo_count} photo{album.photo_count !== 1 ? "s" : ""}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default VaultPhotoAlbums;
