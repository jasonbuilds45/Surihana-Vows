"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { CheckCircle2, X, ArrowRight } from "lucide-react";
import { RSVPConfirmation } from "@/components/rsvp/RSVPConfirmation";

interface RSVPFormProps {
  guest?: { id: string; guestName: string; familyName?: string | null; inviteCode: string } | null;
  weddingId: string;
  className?: string;
}

const ROSE   = "#C0364A";
const ROSE_H = "#A82C3E";
const INK    = "#1A1012";
const INK2   = "#3D2530";
const INK3   = "#7A5460";
const BDR    = "#D0C0BC";
const BF     = "var(--font-body), -apple-system, system-ui, sans-serif";
const DF     = "var(--font-display), Georgia, serif";

export function RSVPForm({ guest, weddingId, className }: RSVPFormProps) {
  const [inviteCode, setInviteCode] = useState(guest?.inviteCode ?? "");
  const [attending,  setAttending]  = useState(true);
  const [guestCount, setGuestCount] = useState(guest ? 2 : 1);
  const [message,    setMessage]    = useState("");
  const [status,     setStatus]     = useState<{ success: boolean; message: string; demoMode?: boolean } | null>(null);
  const [loading,    setLoading]    = useState(false);

  const guestLabel = useMemo(
    () => guest ? `${guest.guestName}${guest.familyName ? ` ${guest.familyName}` : ""}` : null,
    [guest]
  );

  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setStatus(null);
    try {
      const res = await fetch("/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestId: guest?.id, inviteCode, guestName: guestLabel, weddingId, attending, guestCount, message }) });
      setStatus(await res.json());
    } catch (err) {
      setStatus({ success: false, message: err instanceof Error ? err.message : "Unable to submit." });
    } finally { setLoading(false); }
  }

  if (status?.success) return <RSVPConfirmation attending={attending} demoMode={status.demoMode} guestCount={guestCount} guestName={guestLabel ?? undefined} message={message} />;

  const stripe = { height: 3, background: `linear-gradient(90deg, #D94F62 0%, ${ROSE} 30%, #B8820A 60%, ${ROSE} 85%, #D94F62 100%)`, flexShrink: 0 } as const;

  const inp: React.CSSProperties = {
    display: "block", width: "100%",
    background: "#FFFFFF", border: `1.5px solid ${BDR}`,
    borderRadius: 12, padding: "0.9375rem 1.25rem",
    color: INK, fontSize: "0.9375rem", fontFamily: BF,
    outline: "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };
  const fi = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = ROSE; e.target.style.boxShadow = "0 0 0 3px rgba(192,54,74,0.12)"; };
  const fo = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = BDR; e.target.style.boxShadow = "none"; };

  const LBL = ({ text }: { text: string }) => (
    <label style={{ display: "block", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: INK3, marginBottom: "0.5rem", fontFamily: BF }}>
      {text}
    </label>
  );

  const toggleSt = (active: boolean, isYes: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderRadius: 14,
    border: `1.5px solid ${active ? (isYes ? ROSE : "#9A8090") : BDR}`,
    background: active ? (isYes ? "#FDEAEC" : "#FAF8F6") : "#FFFFFF",
    color: active ? (isYes ? ROSE : INK) : INK3,
    fontFamily: BF, fontSize: "0.875rem", fontWeight: active ? 700 : 500,
    cursor: "pointer", transition: "all 0.18s ease", flex: 1,
  });

  const numSt = (active: boolean): React.CSSProperties => ({
    width: 44, height: 44, borderRadius: 12,
    border: `1.5px solid ${active ? ROSE : BDR}`,
    background: active ? ROSE : "#FFFFFF",
    color: active ? "#FFFFFF" : INK2,
    fontFamily: BF, fontSize: "0.9rem", fontWeight: active ? 700 : 500,
    cursor: "pointer", transition: "all 0.15s ease",
  });

  return (
    <form onSubmit={submit} className={className}
      style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E4D8D4", boxShadow: "0 4px 24px rgba(80,20,30,0.09)", overflow: "hidden" }}
    >
      <div style={stripe} />
      <div style={{ padding: "2.5rem" }}>
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: ROSE, marginBottom: "0.625rem", fontFamily: BF }}>RSVP</p>
        <h3 style={{ fontFamily: DF, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.02em", color: INK, marginBottom: "2rem" }}>
          {guestLabel ? `Reply for ${guestLabel.split(" ")[0]}` : "Confirm attendance"}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {!guest && (
            <div>
              <LBL text="Invite code" />
              <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="e.g. john-family" required style={inp} onFocus={fi} onBlur={fo} />
            </div>
          )}

          <div>
            <LBL text="Will you attend?" />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {([{ value: true as const, text: "Joyfully attending", icon: CheckCircle2 }, { value: false as const, text: "Sending love", icon: X }]).map(({ value, text, icon: Icon }) => (
                <button key={String(value)} type="button" onClick={() => setAttending(value)} style={toggleSt(attending === value, value)}>
                  <Icon size={15} />{text}
                </button>
              ))}
            </div>
          </div>

          <div>
            <LBL text="Party size" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {[1,2,3,4,5,6].map((n) => (
                <button key={n} type="button" onClick={() => setGuestCount(n)} style={numSt(guestCount === n)}>{n}</button>
              ))}
              <button type="button" onClick={() => setGuestCount((v) => Math.min(10, v + 1))} style={{ ...numSt(guestCount > 6), width: "auto", padding: "0 1rem" }}>
                {guestCount > 6 ? guestCount : "7+"}
              </button>
            </div>
          </div>

          <div>
            <LBL text="Message (optional)" />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="A blessing, song request, or note…" style={{ ...inp, resize: "none" }} onFocus={fi} onBlur={fo} />
          </div>

          {status && !status.success && (
            <p style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: "0.875rem", color: "#B91C1C", fontFamily: BF }}>{status.message}</p>
          )}

          <button type="submit" disabled={loading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "15px", borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#D0C0BC" : ROSE, color: "#FFFFFF", fontSize: "0.9375rem", fontWeight: 700, fontFamily: BF, transition: "all 0.2s ease", boxShadow: loading ? "none" : "0 6px 24px rgba(192,54,74,0.22)", opacity: loading ? 0.8 : 1 }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = ROSE_H; }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = ROSE; }}
          >
            {loading ? (
              <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : <>Submit RSVP <ArrowRight size={16} /></>}
          </button>
        </div>
      </div>
    </form>
  );
}

export default RSVPForm;
