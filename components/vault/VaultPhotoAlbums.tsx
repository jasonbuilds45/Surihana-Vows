"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Download, Globe, Images, Lock, Play } from "lucide-react";
import { LightBox } from "@/components/gallery/LightBox";
import type { PhotoRow } from "@/lib/types";

export interface VaultAlbum {
  id: string;
  album_name: string;
  description: string | null;
  cover_photo: string | null;
  is_public: boolean;
  sort_order: number;
  photo_count: number;
}

interface VaultPhotoAlbumsProps {
  albums: VaultAlbum[];
  photos: PhotoRow[];
}

const BF = "var(--font-body), system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";
const ROSE = "#BE2D45";
const INK = "#1A1012";
const INK3 = "#7A5460";
const GOLD = "#B8820A";
const BG = "#FAF7F3";
const CARD = "#FFFFFF";
const BDR = "rgba(190,45,69,.10)";

function formatPhotoDate(value?: string | null) {
  if (!value) return "Saved recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved recently";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

async function downloadPhoto(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function AlbumPhotoGrid({ album, photos, onBack }: { album: VaultAlbum; photos: PhotoRow[]; onBack: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const heroImage = album.cover_photo ?? photos[0]?.image_url ?? null;

  if (!photos.length) {
    return (
      <div style={{ display: "grid", gap: "1.2rem" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            color: ROSE,
            cursor: "pointer",
            fontFamily: BF,
            fontSize: ".78rem",
            fontWeight: 700,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            padding: 0,
          }}
        >
          <ArrowLeft size={15} /> Back to albums
        </button>

        <div style={{ borderRadius: 28, padding: "3rem 1.5rem", textAlign: "center", background: BG, border: `1px dashed ${BDR}` }}>
          <div style={{ width: 54, height: 54, borderRadius: 18, display: "grid", placeItems: "center", margin: "0 auto 1rem", background: "rgba(190,45,69,.06)", color: ROSE }}>
            <Images size={24} />
          </div>
          <p className="font-display" style={{ fontSize: "1.7rem", color: INK }}>This album is ready for photos.</p>
          <p style={{ fontSize: ".9rem", color: INK3, fontFamily: BF, marginTop: ".65rem" }}>Once the couple curates images into this chapter, they will appear here in a richer gallery view.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "none",
          border: "none",
          color: ROSE,
          cursor: "pointer",
          fontFamily: BF,
          fontSize: ".78rem",
          fontWeight: 700,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          padding: 0,
        }}
      >
        <ArrowLeft size={15} /> Back to albums
      </button>

      <section style={{ borderRadius: 30, overflow: "hidden", background: CARD, border: `1px solid ${BDR}`, boxShadow: "0 20px 44px rgba(26,12,14,.08)" }}>
        <div style={{ position: "relative", minHeight: 280 }}>
          {heroImage ? (
            <>
              <Image alt={album.album_name} src={heroImage} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 65vw" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(18,10,12,.84), rgba(18,10,12,.1))" }} />
            </>
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(190,45,69,.10), rgba(212,184,150,.14))" }} />
          )}

          <div style={{ position: "absolute", inset: "auto 0 0 0", padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "8px 12px", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.14)", color: "rgba(255,245,241,.86)", fontSize: ".62rem", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: ".75rem" }}>
                  {album.is_public ? <Globe size={12} /> : <Lock size={12} />}
                  {album.is_public ? "Public album" : "Family-only album"}
                </div>
                <h3 className="font-display" style={{ fontSize: "clamp(1.9rem,4vw,3rem)", color: "#fff", lineHeight: 1 }}>{album.album_name}</h3>
                {album.description ? <p style={{ fontSize: ".95rem", lineHeight: 1.7, color: "rgba(255,242,238,.72)", marginTop: ".6rem", maxWidth: 620 }}>{album.description}</p> : null}
              </div>

              <button
                type="button"
                onClick={() => photos.forEach((photo, index) => window.setTimeout(() => downloadPhoto(photo.image_url, `${album.album_name}-${index + 1}.jpg`), index * 180))}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,.16)",
                  background: "rgba(255,255,255,.12)",
                  color: "#fff",
                  fontFamily: BF,
                  fontSize: ".72rem",
                  fontWeight: 700,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                <Download size={14} /> Download all
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: "1rem", padding: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: ".75rem" }}>
            {[
              { label: "Photos in chapter", value: photos.length },
              { label: "Visibility", value: album.is_public ? "Public" : "Private" },
              { label: "Last added", value: formatPhotoDate(photos[0]?.created_at) },
            ].map((item) => (
              <div key={item.label} style={{ borderRadius: 22, padding: "1rem", background: BG, border: `1px solid ${BDR}` }}>
                <p style={{ fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: INK3 }}>{item.label}</p>
                <p className="font-display" style={{ fontSize: "1.4rem", color: INK, marginTop: ".45rem", lineHeight: 1.05 }}>{item.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: ".8rem" }}>
            {photos.map((photo, index) => {
              const aspectRatio = index % 5 === 0 ? "4 / 5" : index % 3 === 0 ? "3 / 4" : "1 / 1";

              return (
                <article key={photo.id} style={{ position: "relative", borderRadius: 22, overflow: "hidden", background: BG, aspectRatio, border: `1px solid ${BDR}` }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                    style={{ position: "absolute", inset: 0, border: "none", padding: 0, cursor: "pointer", background: "none" }}
                    className="album-photo-trigger"
                  >
                    <Image
                      src={photo.image_url}
                      alt={photo.uploaded_by}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 48vw, (max-width: 1024px) 33vw, 180px"
                      style={{ transition: "transform .8s ease" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(18,10,12,.82), rgba(18,10,12,.08) 62%)" }} />
                    <div style={{ position: "absolute", inset: "auto 0 0 0", padding: ".8rem" }}>
                      <p style={{ fontSize: ".56rem", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,238,233,.58)", marginBottom: ".3rem" }}>{formatPhotoDate(photo.created_at)}</p>
                      <p style={{ fontSize: ".8rem", color: "#fff", fontFamily: BF, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photo.uploaded_by}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadPhoto(photo.image_url, `${album.album_name}-${index + 1}.jpg`)}
                    title="Download photo"
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,.18)",
                      background: "rgba(0,0,0,.46)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <Download size={14} />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <LightBox
        photos={photos}
        activeIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setLightboxIndex((index) => (index + 1) % photos.length)}
        onPrevious={() => setLightboxIndex((index) => (index - 1 + photos.length) % photos.length)}
      />
    </div>
  );
}

export function VaultPhotoAlbums({ albums, photos }: VaultPhotoAlbumsProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  const albumPhotoMap = useMemo(() => {
    const map = new Map<string, PhotoRow[]>();

    for (const photo of photos) {
      const albumId = (photo as PhotoRow & { album_id?: string | null }).album_id;
      if (!albumId) continue;
      const existing = map.get(albumId) ?? [];
      existing.push(photo);
      map.set(albumId, existing);
    }

    return map;
  }, [photos]);

  if (!albums.length) {
    return (
      <div style={{ borderRadius: 28, padding: "3rem 1.5rem", textAlign: "center", background: BG, border: `1px dashed ${BDR}` }}>
        <div style={{ width: 60, height: 60, borderRadius: 20, display: "grid", placeItems: "center", margin: "0 auto 1rem", background: "rgba(190,45,69,.06)", color: ROSE }}>
          <Images size={28} />
        </div>
        <p className="font-display" style={{ fontSize: "1.9rem", color: INK }}>The album shelf is waiting for its first chapter.</p>
        <p style={{ fontSize: ".92rem", color: INK3, fontFamily: BF, maxWidth: 420, margin: ".75rem auto 0" }}>
          Once the couple curates wedding photos into albums, this part of the vault will feel like a polished social gallery instead of a plain file list.
        </p>
      </div>
    );
  }

  const selectedAlbumItem = selectedAlbum ? albums.find((item) => item.id === selectedAlbum) ?? null : null;

  if (selectedAlbumItem) {
    return <AlbumPhotoGrid album={selectedAlbumItem} photos={albumPhotoMap.get(selectedAlbumItem.id) ?? []} onBack={() => setSelectedAlbum(null)} />;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
      {albums.map((album, index) => {
        const previewPhotos = (albumPhotoMap.get(album.id) ?? []).slice(0, 3);

        return (
          <button
            key={album.id}
            type="button"
            onClick={() => setSelectedAlbum(album.id)}
            style={{
              display: "grid",
              gap: 0,
              background: CARD,
              border: `1px solid ${BDR}`,
              borderRadius: 28,
              overflow: "hidden",
              textAlign: "left",
              cursor: "pointer",
              boxShadow: "0 18px 40px rgba(26,12,14,.06)",
              transition: "transform .22s ease, box-shadow .22s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = "translateY(-3px)";
              event.currentTarget.style.boxShadow = "0 28px 52px rgba(26,12,14,.12)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "none";
              event.currentTarget.style.boxShadow = "0 18px 40px rgba(26,12,14,.06)";
            }}
          >
            <div style={{ position: "relative", minHeight: 250 }}>
              {album.cover_photo ? (
                <>
                  <Image alt={album.album_name} src={album.cover_photo} fill className="object-cover" sizes="(max-width: 768px) 100vw, 26vw" />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(18,10,12,.86), rgba(18,10,12,.08) 58%)" }} />
                </>
              ) : (
                <div style={{ position: "absolute", inset: 0, background: index % 2 === 0 ? "linear-gradient(135deg, rgba(190,45,69,.12), rgba(212,184,150,.18))" : "linear-gradient(135deg, rgba(212,184,150,.22), rgba(190,45,69,.10))" }} />
              )}

              <div style={{ position: "absolute", inset: 0, padding: "1rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".75rem" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 11px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,.12)",
                      border: "1px solid rgba(255,255,255,.14)",
                      color: "#fff",
                      fontFamily: BF,
                      fontSize: ".62rem",
                      fontWeight: 700,
                      letterSpacing: ".16em",
                      textTransform: "uppercase",
                    }}
                  >
                    {album.is_public ? <Globe size={11} /> : <Lock size={11} />}
                    {album.is_public ? "Public" : "Private"}
                  </span>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 11px",
                      borderRadius: 999,
                      background: "rgba(12,8,8,.36)",
                      border: "1px solid rgba(255,255,255,.10)",
                      color: "#fff",
                      fontFamily: BF,
                      fontSize: ".62rem",
                      fontWeight: 700,
                      letterSpacing: ".16em",
                      textTransform: "uppercase",
                    }}
                  >
                    <Images size={11} /> {album.photo_count}
                  </span>
                </div>

                <div>
                  <p style={{ fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,234,228,.58)", marginBottom: ".35rem" }}>
                    {previewPhotos.length ? `${previewPhotos.length} previews ready` : "Chapter ready"}
                  </p>
                  <h3 className="font-display" style={{ fontSize: "1.8rem", lineHeight: 1.02, color: "#fff" }}>{album.album_name}</h3>
                  {album.description ? (
                    <p style={{ fontSize: ".88rem", lineHeight: 1.7, color: "rgba(255,242,238,.72)", marginTop: ".5rem" }}>
                      {album.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".75rem", padding: "1rem 1.1rem" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {previewPhotos.length ? previewPhotos.map((photo, previewIndex) => (
                  <div
                    key={photo.id}
                    style={{
                      position: "relative",
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "2px solid #fff",
                      marginLeft: previewIndex === 0 ? 0 : -10,
                      boxShadow: "0 8px 16px rgba(26,12,14,.12)",
                    }}
                  >
                    <Image alt={photo.uploaded_by} src={photo.image_url} fill className="object-cover" sizes="42px" />
                  </div>
                )) : (
                  <div style={{ width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", background: BG, border: `1px solid ${BDR}`, color: GOLD }}>
                    <Images size={18} />
                  </div>
                )}
              </div>

              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: ROSE, fontFamily: BF, fontSize: ".72rem", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase" }}>
                Open album <Play size={13} fill={ROSE} />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default VaultPhotoAlbums;
