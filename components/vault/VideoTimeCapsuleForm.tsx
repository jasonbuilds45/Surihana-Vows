"use client";

import { type FormEvent, useRef, useState } from "react";
import { ArrowRight, CheckCircle, Loader2, Upload, Video, X } from "lucide-react";

interface VideoTimeCapsuleFormProps {
  weddingDate: string;
  brideName:   string;
  groomName:   string;
}

const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BDR  = "#D0C0BC";
const W    = "#FFFFFF";
const BF   = "var(--font-body), system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";

function inp(): React.CSSProperties {
  return {
    display: "block", width: "100%", background: W,
    border: `1.5px solid ${BDR}`, borderRadius: 12,
    padding: ".9375rem 1.25rem", color: INK, fontSize: ".9375rem",
    fontFamily: BF, outline: "none", transition: "border-color .2s,box-shadow .2s",
  };
}
function LBL({ text, optional }: { text: string; optional?: boolean }) {
  return (
    <label style={{ display: "block", fontSize: ".62rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" as const, color: INK3, marginBottom: ".5rem", fontFamily: BF }}>
      {text}{optional && <span style={{ fontWeight: 400, marginLeft: ".375rem", textTransform: "none" as const }}>(optional)</span>}
    </label>
  );
}

type InputMode = "url" | "file";

export function VideoTimeCapsuleForm({ weddingDate, brideName, groomName }: VideoTimeCapsuleFormProps) {
  const [mode,       setMode]       = useState<InputMode>("url");
  const [senderName, setSenderName] = useState("");
  const [videoUrl,   setVideoUrl]   = useState("");
  const [videoFile,  setVideoFile]  = useState<File | null>(null);
  const [title,      setTitle]      = useState("");
  const [message,    setMessage]    = useState("");
  const [revealDate, setRevealDate] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [uploadPct,  setUploadPct]  = useState(0);
  const [status,     setStatus]     = useState<{ success: boolean; message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const bf = brideName.split(" ")[0]!;
  const gf = groomName.split(" ")[0]!;
  const STRIPE = { height: 3, background: `linear-gradient(90deg,#D94F62,${ROSE} 30%,#B8820A 60%,${ROSE} 85%,#D94F62)` } as const;

  const fi = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = ROSE;
    e.target.style.boxShadow = "0 0 0 3px rgba(192,54,74,.12)";
  };
  const fo = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = BDR;
    e.target.style.boxShadow = "none";
  };

  async function uploadVideoFile(file: File): Promise<string> {
    // Upload to Supabase Storage via the existing upload-photo endpoint
    // but use the guest-messages bucket for video capsules
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mediaType", "video");
    fd.append("weddingId", "capsule-videos"); // segregated folder

    // Use XMLHttpRequest so we can track progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/guestbook/upload");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText) as { success: boolean; url?: string; message?: string };
            if (data.success && data.url) resolve(data.url);
            else reject(new Error(data.message ?? "Upload failed."));
          } catch { reject(new Error("Invalid server response.")); }
        } else {
          reject(new Error(`Upload failed (${xhr.status}).`));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload."));
      xhr.send(fd);
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (mode === "file" && !videoFile) {
      setStatus({ success: false, message: "Please choose a video file." });
      return;
    }
    if (mode === "url" && !videoUrl.trim()) {
      setStatus({ success: false, message: "Please enter a YouTube or Vimeo URL." });
      return;
    }

    setLoading(true);
    setStatus(null);
    setUploadPct(0);

    try {
      let finalUrl = videoUrl.trim();

      // If file mode — upload first, get URL
      if (mode === "file" && videoFile) {
        finalUrl = await uploadVideoFile(videoFile);
      }

      const res  = await fetch("/api/video-capsule", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ senderName, videoUrl: finalUrl, title, message, revealDate }),
      });
      const data = await res.json() as { success: boolean; message: string };
      setStatus(data);
      if (data.success) {
        setSenderName(""); setVideoUrl(""); setVideoFile(null);
        setTitle(""); setMessage(""); setRevealDate("");
        setUploadPct(0);
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch (err) {
      setStatus({ success: false, message: err instanceof Error ? err.message : "Unable to seal." });
    } finally {
      setLoading(false);
    }
  }

  if (status?.success) return (
    <div style={{ background: W, borderRadius: 20, border: "1px solid #E4D8D4", overflow: "hidden" }}>
      <div style={STRIPE} />
      <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FDEAEC", border: "1.5px solid #F5C5CB", display: "grid", placeItems: "center", margin: "0 auto 1.25rem" }}>
          <CheckCircle size={28} style={{ color: ROSE }} />
        </div>
        <p style={{ fontFamily: DF, fontSize: "1.75rem", fontWeight: 700, color: INK, marginBottom: ".625rem" }}>Video capsule sealed.</p>
        <p style={{ fontSize: ".9rem", color: INK3, marginBottom: "1.5rem", fontFamily: BF }}>Your video message is sealed for {bf} &amp; {gf} and will unlock on the date you chose.</p>
        <button onClick={() => setStatus(null)} style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: ".20em", textTransform: "uppercase", color: ROSE, background: "none", border: "none", cursor: "pointer", fontFamily: BF }}>Seal another</button>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} style={{ background: W, borderRadius: 20, border: "1px solid #E4D8D4", overflow: "hidden" }}>
      <div style={STRIPE} />
      <div style={{ padding: "2rem" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1.5rem" }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FDEAEC", border: "1.5px solid #F5C5CB", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Video size={20} style={{ color: ROSE }} />
          </div>
          <div>
            <p style={{ fontFamily: DF, fontSize: "1.25rem", fontWeight: 700, color: INK, lineHeight: 1.1 }}>Seal a video message</p>
            <p style={{ fontSize: ".8rem", color: INK3, fontFamily: BF }}>Upload a video file or paste a YouTube / Vimeo link</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>

          {/* Name + Title */}
          <div><LBL text="Your name" /><input value={senderName} onChange={e => setSenderName(e.target.value)} required placeholder="How they know you" style={inp()} onFocus={fi} onBlur={fo} /></div>
          <div><LBL text="Video title" /><input value={title} onChange={e => setTitle(e.target.value)} required placeholder="A message for your 5th anniversary" style={inp()} onFocus={fi} onBlur={fo} /></div>

          {/* Mode toggle */}
          <div>
            <LBL text="Video source" />
            <div style={{ display: "flex", gap: ".5rem", marginBottom: ".875rem" }}>
              {(["url", "file"] as InputMode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setVideoUrl(""); setVideoFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                  style={{
                    flex: 1, padding: "9px 16px", borderRadius: 10,
                    border: `1.5px solid ${mode === m ? ROSE : BDR}`,
                    background: mode === m ? "rgba(192,54,74,.06)" : W,
                    color: mode === m ? ROSE : INK3,
                    fontSize: ".78rem", fontWeight: 700, fontFamily: BF,
                    letterSpacing: ".08em", cursor: "pointer", transition: "all .15s",
                  }}
                >
                  {m === "url" ? "🔗  YouTube / Vimeo" : "📁  Upload video file"}
                </button>
              ))}
            </div>

            {mode === "url" ? (
              <div>
                <input
                  value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=… or https://vimeo.com/…"
                  type="url" style={inp()} onFocus={fi} onBlur={fo}
                />
                <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, marginTop: ".375rem" }}>The video will remain private until the reveal date.</p>
              </div>
            ) : (
              <div>
                {!videoFile ? (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "14px 16px",
                      borderRadius: 12, border: `1.5px dashed ${BDR}`,
                      background: "#FAF8F6", cursor: "pointer",
                      color: INK3, fontFamily: BF, fontSize: ".875rem",
                    }}
                  >
                    <Upload size={16} style={{ color: ROSE }} />
                    <span>Choose a video file</span>
                    <span style={{ marginLeft: "auto", fontSize: ".72rem", color: BDR }}>MP4, MOV, WEBM — max 200 MB</span>
                  </button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: `1px solid #E4D8D4`, background: "#FAF8F6" }}>
                    <Video size={16} style={{ color: ROSE, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: ".875rem", color: INK, fontFamily: BF, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{videoFile.name}</p>
                      <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF }}>{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                    </div>
                    <button type="button" onClick={() => { setVideoFile(null); if (fileRef.current) fileRef.current.value = ""; }} style={{ padding: 5, borderRadius: "50%", background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", cursor: "pointer", display: "grid", placeItems: "center" }}>
                      <X size={12} />
                    </button>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm,video/*"
                  style={{ display: "none" }}
                  onChange={e => {
                    const f = e.target.files?.[0] ?? null;
                    if (f && f.size > 200 * 1024 * 1024) {
                      setStatus({ success: false, message: "Video must be under 200 MB." });
                      return;
                    }
                    setVideoFile(f);
                    setStatus(null);
                  }}
                />
                <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, marginTop: ".375rem" }}>Your video will be uploaded securely and sealed until the reveal date.</p>

                {/* Upload progress bar */}
                {loading && mode === "file" && uploadPct > 0 && (
                  <div style={{ marginTop: ".75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".25rem" }}>
                      <span style={{ fontSize: ".72rem", color: INK3, fontFamily: BF }}>Uploading…</span>
                      <span style={{ fontSize: ".72rem", color: ROSE, fontFamily: BF, fontWeight: 700 }}>{uploadPct}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: "#E4D8D4", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${uploadPct}%`, background: `linear-gradient(90deg, ${ROSE}, #D4A020)`, transition: "width .3s ease", borderRadius: 2 }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Written note */}
          <div>
            <LBL text="Written note" optional />
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="A few words to accompany your video…" style={{ ...inp(), resize: "none" }} onFocus={fi} onBlur={fo} />
          </div>

          {/* Reveal date */}
          <div>
            <LBL text="Reveal date" />
            <input value={revealDate} onChange={e => setRevealDate(e.target.value)} required type="date" min={weddingDate} style={inp()} onFocus={fi} onBlur={fo} />
            <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, marginTop: ".375rem" }}>The sealed capsule will unlock on this date.</p>
          </div>

          {status && !status.success && (
            <p style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: ".875rem", color: "#B91C1C", fontFamily: BF }}>{status.message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "14px", borderRadius: 14, border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "#D0C0BC" : ROSE,
              color: W, fontSize: ".9375rem", fontWeight: 700, fontFamily: BF,
              boxShadow: loading ? "none" : "0 6px 24px rgba(192,54,74,.22)",
              opacity: loading ? .8 : 1,
            }}
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> {mode === "file" && uploadPct > 0 && uploadPct < 100 ? `Uploading ${uploadPct}%…` : "Sealing…"}</>
              : <>Seal video capsule <ArrowRight size={16} /></>
            }
          </button>
        </div>
      </div>
    </form>
  );
}

export default VideoTimeCapsuleForm;
