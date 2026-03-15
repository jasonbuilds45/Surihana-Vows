"use client";

import { type FormEvent, useState } from "react";
import { ArrowRight, CheckCircle, Loader2, Video } from "lucide-react";

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
  return { display: "block", width: "100%", background: W, border: `1.5px solid ${BDR}`, borderRadius: 12, padding: ".9375rem 1.25rem", color: INK, fontSize: ".9375rem", fontFamily: BF, outline: "none", transition: "border-color .2s,box-shadow .2s" };
}

function LBL({ text }: { text: string }) {
  return <label style={{ display: "block", fontSize: ".62rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" as const, color: INK3, marginBottom: ".5rem", fontFamily: BF }}>{text}</label>;
}

export function VideoTimeCapsuleForm({ weddingDate, brideName, groomName }: VideoTimeCapsuleFormProps) {
  const [senderName, setSenderName] = useState("");
  const [videoUrl,   setVideoUrl]   = useState("");
  const [title,      setTitle]      = useState("");
  const [message,    setMessage]    = useState("");
  const [revealDate, setRevealDate] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [status,     setStatus]     = useState<{ success: boolean; message: string } | null>(null);

  const bf = brideName.split(" ")[0]!;
  const gf = groomName.split(" ")[0]!;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch("/api/video-capsule", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ senderName, videoUrl, title, message, revealDate }),
      });
      const data = await res.json();
      setStatus(data);
      if (data.success) { setSenderName(""); setVideoUrl(""); setTitle(""); setMessage(""); setRevealDate(""); }
    } catch (e) {
      setStatus({ success: false, message: e instanceof Error ? e.message : "Unable to seal." });
    } finally {
      setLoading(false);
    }
  }

  const fi = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = ROSE; e.target.style.boxShadow = "0 0 0 3px rgba(192,54,74,.12)"; };
  const fo = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = BDR;  e.target.style.boxShadow = "none"; };

  const STRIPE = { height: 3, background: `linear-gradient(90deg,#D94F62,${ROSE} 30%,#B8820A 60%,${ROSE} 85%,#D94F62)` } as const;

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
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1.5rem" }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FDEAEC", border: "1.5px solid #F5C5CB", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Video size={20} style={{ color: ROSE }} />
          </div>
          <div>
            <p style={{ fontFamily: DF, fontSize: "1.25rem", fontWeight: 700, color: INK, lineHeight: 1.1 }}>Seal a video message</p>
            <p style={{ fontSize: ".8rem", color: INK3, fontFamily: BF }}>Paste a YouTube or Vimeo link — it unlocks on the date you choose</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
          <div><LBL text="Your name" /><input value={senderName} onChange={(e) => setSenderName(e.target.value)} required placeholder="How they know you" style={inp()} onFocus={fi} onBlur={fo} /></div>
          <div><LBL text="Video title" /><input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="A message for your 5th anniversary" style={inp()} onFocus={fi} onBlur={fo} /></div>
          <div>
            <LBL text="Video URL (YouTube or Vimeo)" />
            <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required placeholder="https://youtube.com/watch?v=…" type="url" style={inp()} onFocus={fi} onBlur={fo} />
            <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, marginTop: ".375rem" }}>Paste the full link. The video will remain private until the reveal date.</p>
          </div>
          <div>
            <LBL text="Written note (optional)" />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="A few words to accompany your video…" style={{ ...inp(), resize: "none" }} onFocus={fi} onBlur={fo} />
          </div>
          <div>
            <LBL text="Reveal date" />
            <input value={revealDate} onChange={(e) => setRevealDate(e.target.value)} required type="date" min={weddingDate} style={inp()} onFocus={fi} onBlur={fo} />
            <p style={{ fontSize: ".72rem", color: INK3, fontFamily: BF, marginTop: ".375rem" }}>The sealed capsule will unlock on this date.</p>
          </div>

          {status && !status.success && (
            <p style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: ".875rem", color: "#B91C1C", fontFamily: BF }}>{status.message}</p>
          )}

          <button type="submit" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#D0C0BC" : ROSE, color: W, fontSize: ".9375rem", fontWeight: 700, fontFamily: BF, boxShadow: loading ? "none" : "0 6px 24px rgba(192,54,74,.22)", opacity: loading ? .8 : 1 }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Seal video capsule <ArrowRight size={16} /></>}
          </button>
        </div>
      </div>
    </form>
  );
}
