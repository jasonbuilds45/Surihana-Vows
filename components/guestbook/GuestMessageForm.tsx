"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";

const ROSE   = "#C0364A";
const ROSE_H = "#A82C3E";
const BF     = "var(--font-body), -apple-system, system-ui, sans-serif";
const DF     = "var(--font-display), Georgia, serif";

export function GuestMessageForm({ weddingId }: { weddingId: string }) {
  const [name,    setName]    = useState("");
  const [msg,     setMsg]     = useState("");
  const [status,  setStatus]  = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestName: name, message: msg, weddingId }) });
      const data = await res.json();
      setStatus(data);
      if (data.success) { setName(""); setMsg(""); }
    } catch (err) {
      setStatus({ success: false, message: err instanceof Error ? err.message : "Unable to send." });
    } finally { setLoading(false); }
  }

  const stripe = { height: 3, background: `linear-gradient(90deg, #D94F62 0%, ${ROSE} 30%, #B8820A 60%, ${ROSE} 85%, #D94F62 100%)`, flexShrink: 0 } as const;

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
        <p style={{ fontFamily: DF, fontSize: "1.75rem", fontWeight: 700, color: "#1A1012", marginBottom: "0.625rem" }}>
          Blessing received.
        </p>
        <p style={{ fontSize: "0.9rem", color: "#7A5460", marginBottom: "1.5rem", fontFamily: BF }}>
          Your message is now woven into their story forever.
        </p>
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
          <div>
            <label style={{ display: "block", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7A5460", marginBottom: "0.5rem", fontFamily: BF }}>Your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="How the couple knows you" style={inp} onFocus={fi} onBlur={fo} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7A5460", marginBottom: "0.5rem", fontFamily: BF }}>Your blessing</label>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} required rows={5} placeholder="A blessing, memory, or wish…" style={{ ...inp, resize: "none" }} onFocus={fi} onBlur={fo} />
          </div>

          {status && !status.success && (
            <p style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: "0.875rem", color: "#B91C1C", fontFamily: BF }}>
              {status.message}
            </p>
          )}

          <button type="submit" disabled={loading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#D0C0BC" : ROSE, color: "#FFFFFF", fontSize: "0.9375rem", fontWeight: 700, fontFamily: BF, transition: "all 0.2s ease", boxShadow: loading ? "none" : "0 6px 24px rgba(192,54,74,0.22)" }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = ROSE_H; }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = ROSE; }}
          >
            {loading ? (
              <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              <>Publish blessing <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default GuestMessageForm;
