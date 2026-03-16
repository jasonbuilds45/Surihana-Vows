"use client";

/**
 * GuestMessageForm — Step 7
 * Enhanced with optional media upload (photo, video, voice).
 * Media is uploaded to Supabase Storage bucket "guest-messages".
 * Falls back gracefully if upload fails.
 * Existing text-only flow is fully preserved.
 */

import type { FormEvent } from "react";
import { useState, useRef } from "react";
import { ArrowRight, CheckCircle, Image as ImageIcon, Video, Mic, X, Loader2, Upload } from "lucide-react";

const ROSE   = "#C0364A";
const ROSE_H = "#A82C3E";
const BF     = "var(--font-body), -apple-system, system-ui, sans-serif";
const DF     = "var(--font-display), Georgia, serif";

const ACCEPTED_IMAGES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_VIDEOS = ["video/mp4", "video/quicktime"];
const ACCEPTED_AUDIO  = ["audio/mpeg", "audio/mp4", "audio/x-m4a"];
const ALL_ACCEPTED    = [...ACCEPTED_IMAGES, ...ACCEPTED_VIDEOS, ...ACCEPTED_AUDIO];

type MediaType = "image" | "video" | "audio" | null;

function detectMediaType(file: File): MediaType {
  if (ACCEPTED_IMAGES.includes(file.type)) return "image";
  if (ACCEPTED_VIDEOS.includes(file.type)) return "video";
  if (ACCEPTED_AUDIO.includes(file.type))  return "audio";
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function GuestMessageForm({ weddingId }: { weddingId: string }) {
  const [name,      setName]      = useState("");
  const [msg,       setMsg]       = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status,    setStatus]    = useState<{ success: boolean; message: string } | null>(null);
  const [loading,   setLoading]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const type = detectMediaType(file);
    if (!type) {
      setStatus({ success: false, message: "Unsupported file type. Please upload an image, video, or voice message." });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setStatus({ success: false, message: "File too large. Maximum size is 50 MB." });
      return;
    }

    setMediaFile(file);
    setMediaType(type);
    setStatus(null);

    if (type === "image") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }

  function clearMedia() {
    setMediaFile(null);
    setMediaType(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      let mediaUrl: string | null = null;
      let finalMediaType: string | null = null;

      // Upload media first if present
      if (mediaFile && mediaType) {
        const fd = new FormData();
        fd.append("file",      mediaFile);
        fd.append("mediaType", mediaType);
        fd.append("weddingId", weddingId);

        const uploadRes  = await fetch("/api/guestbook/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json() as { success: boolean; url?: string; message?: string };

        if (uploadData.success && uploadData.url) {
          mediaUrl       = uploadData.url;
          finalMediaType = mediaType;
        } else {
          // Non-fatal: proceed with text-only if upload fails
          console.warn("[GuestMessageForm] Media upload failed:", uploadData.message);
        }
      }

      // Submit the message
      const res  = await fetch("/api/guestbook", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ guestName: name, message: msg, weddingId, mediaUrl, mediaType: finalMediaType }),
      });
      const data = await res.json() as { success: boolean; message: string };
      setStatus(data);
      if (data.success) {
        setName(""); setMsg("");
        clearMedia();
      }
    } catch (err) {
      setStatus({ success: false, message: err instanceof Error ? err.message : "Unable to send." });
    } finally {
      setLoading(false);
    }
  }

  const stripe = { height: 3, background: `linear-gradient(90deg, #D94F62 0%, ${ROSE} 30%, #B8820A 60%, ${ROSE} 85%, #D94F62 100%)` } as const;

  const inp: React.CSSProperties = {
    display: "block", width: "100%",
    background: "#FFFFFF", border: "1.5px solid #D0C0BC",
    borderRadius: 12, padding: "0.9375rem 1.25rem",
    color: "#1A1012", fontSize: "0.9375rem", fontFamily: BF,
    outline: "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };
  const fi = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = ROSE; e.target.style.boxShadow = "0 0 0 3px rgba(192,54,74,0.12)"; };
  const fo = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = "#D0C0BC"; e.target.style.boxShadow = "none"; };

  if (status?.success) return (
    <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E4D8D4", boxShadow: "0 4px 24px rgba(80,20,30,0.09)", overflow: "hidden" }}>
      <div style={stripe} />
      <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FDEAEC", border: `1.5px solid #F5C5CB`, display: "grid", placeItems: "center", margin: "0 auto 1.25rem" }}>
          <CheckCircle size={28} style={{ color: ROSE }} />
        </div>
        <p style={{ fontFamily: DF, fontSize: "1.75rem", fontWeight: 700, color: "#1A1012", marginBottom: "0.625rem" }}>Blessing received.</p>
        <p style={{ fontSize: "0.9rem", color: "#7A5460", marginBottom: "1.5rem", fontFamily: BF }}>Your message is now woven into their story forever.</p>
        <button onClick={() => setStatus(null)} style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase", color: ROSE, background: "none", border: "none", cursor: "pointer", fontFamily: BF }}>
          Write another
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E4D8D4", boxShadow: "0 4px 24px rgba(80,20,30,0.09)", overflow: "hidden" }}>
      <div style={stripe} />
      <div style={{ padding: "2rem" }}>
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: ROSE, marginBottom: "0.5rem", fontFamily: BF }}>
          Leave a blessing
        </p>
        <p style={{ fontSize: "0.875rem", color: "#7A5460", marginBottom: "1.75rem", fontFamily: BF, lineHeight: 1.6 }}>
          Your message will live with the couple forever.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7A5460", marginBottom: "0.5rem", fontFamily: BF }}>Your name</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="How the couple knows you" style={inp} onFocus={fi} onBlur={fo} />
          </div>

          {/* Message */}
          <div>
            <label style={{ display: "block", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7A5460", marginBottom: "0.5rem", fontFamily: BF }}>Your blessing</label>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} required rows={5} placeholder="A blessing, memory, or wish…" style={{ ...inp, resize: "none" }} onFocus={fi} onBlur={fo} />
          </div>

          {/* Media upload */}
          <div>
            <label style={{ display: "block", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7A5460", marginBottom: "0.5rem", fontFamily: BF }}>
              Attach a photo, video, or voice note <span style={{ color: "#B0A0A8", fontWeight: 400 }}>(optional)</span>
            </label>

            {!mediaFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px dashed #D0C0BC", background: "#FAF8F6", cursor: "pointer", color: "#7A5460", fontFamily: BF, fontSize: ".875rem" }}
              >
                <Upload size={16} style={{ color: ROSE }} />
                <span>Upload photo, video, or voice message</span>
                <span style={{ marginLeft: "auto", fontSize: ".72rem", color: "#B0A0A8" }}>Max 50 MB</span>
              </button>
            ) : (
              <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #E4D8D4", background: "#FAF8F6", display: "flex", alignItems: "center", gap: 10 }}>
                {/* Icon */}
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "#FDEAEC", border: "1px solid #F5C5CB", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {mediaType === "image" && <ImageIcon size={16} style={{ color: ROSE }} />}
                  {mediaType === "video" && <Video    size={16} style={{ color: ROSE }} />}
                  {mediaType === "audio" && <Mic      size={16} style={{ color: ROSE }} />}
                </div>

                {/* Image preview */}
                {previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: ".875rem", color: "#1A1012", fontFamily: BF, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mediaFile.name}</p>
                  <p style={{ fontSize: ".72rem", color: "#7A5460", fontFamily: BF }}>{formatBytes(mediaFile.size)}</p>
                </div>

                <button type="button" onClick={clearMedia} style={{ padding: 6, borderRadius: "50%", background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <X size={13} />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ALL_ACCEPTED.join(",")}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {/* Type hints */}
            <div style={{ display: "flex", gap: ".5rem", marginTop: ".5rem", flexWrap: "wrap" }}>
              {[
                { icon: ImageIcon, label: "JPG, PNG, WEBP" },
                { icon: Video,     label: "MP4, MOV" },
                { icon: Mic,       label: "MP3, M4A" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: ".65rem", color: "#B0A0A8", fontFamily: BF }}>
                  <Icon size={10} /> {label}
                </span>
              ))}
            </div>
          </div>

          {status && !status.success && (
            <p style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: "0.875rem", color: "#B91C1C", fontFamily: BF }}>
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#D0C0BC" : ROSE, color: "#FFFFFF", fontSize: "0.9375rem", fontWeight: 700, fontFamily: BF, transition: "all 0.2s ease", boxShadow: loading ? "none" : "0 6px 24px rgba(192,54,74,0.22)" }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = ROSE_H; }}
            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = ROSE; }}
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Sending…</>
              : <>Publish blessing <ArrowRight size={16} /></>
            }
          </button>
        </div>
      </div>
    </form>
  );
}

export default GuestMessageForm;
