"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Clock, Lock, Loader2 } from "lucide-react";
import type { TimeCapsulePostType } from "@/lib/types";

interface TimeCapsuleFormProps {
  weddingDate: string;
  brideName: string;
  groomName: string;
}

function anniversaryDate(weddingDate: string, years: number) {
  const d = new Date(weddingDate);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

const TYPES: { value: TimeCapsulePostType; label: string; hint: string }[] = [
  { value: "timed",       label: "Specific date",   hint: "Opens on a date you choose." },
  { value: "anniversary", label: "Anniversary",      hint: "Opens on a wedding anniversary." },
  { value: "life_event",  label: "Life milestone",   hint: "Opens on a milestone date." },
  { value: "video",       label: "Video message",    hint: "Paste a YouTube or Vimeo URL in your message." },
];

export function TimeCapsuleForm({ weddingDate, brideName, groomName }: TimeCapsuleFormProps) {
  const [authorName, setAuthorName]   = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [message, setMessage]         = useState("");
  const [postType, setPostType]       = useState<TimeCapsulePostType>("timed");
  const [unlockDate, setUnlockDate]   = useState("");
  const [status, setStatus]           = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().slice(0, 10);

  const inputStyle: React.CSSProperties = {
    background: "var(--color-surface-muted)",
    border: "1px solid var(--color-border)",
    borderRadius: "0.75rem",
    color: "var(--color-text-primary)",
    padding: "0.8125rem 1rem",
    width: "100%",
    outline: "none",
    fontSize: "0.9375rem",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase",
    color: "var(--color-text-muted)", display: "block", marginBottom: "0.375rem",
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setIsSubmitting(true); setStatus(null);
    try {
      const res = await fetch("/api/time-capsule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, authorEmail: authorEmail || null, message, postType, unlockDate: new Date(unlockDate).toISOString() }),
      });
      const data = (await res.json()) as { success: boolean; message: string };
      setStatus(data);
      if (data.success) { setAuthorName(""); setAuthorEmail(""); setMessage(""); setUnlockDate(""); }
    } catch { setStatus({ success: false, message: "Unable to seal your message. Please try again." }); }
    finally { setIsSubmitting(false); }
  }

  if (status?.success) return (
    <div className="rounded-2xl p-7 text-center space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: "rgba(138,90,68,0.08)", border: "1px solid rgba(212,179,155,0.4)" }}>
        <Lock className="h-6 w-6" style={{ color: "var(--color-accent-soft)" }} />
      </div>
      <h3 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>Message sealed.</h3>
      <p className="text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>{status.message}</p>
      <button onClick={() => setStatus(null)} type="button" className="rounded-full px-5 py-2 text-xs uppercase transition" style={{ letterSpacing: "0.22em", background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
        Seal another message
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl overflow-hidden space-y-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, var(--color-accent-soft), transparent)", margin: "0 -1.5rem 0.25rem" }} />

      <div className="flex items-center gap-3">
        <Clock className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent-soft)" }} />
        <div>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>Time capsule</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Write a message for {brideFirst} &amp; {groomFirst} to open in the future.
          </p>
        </div>
      </div>

      {/* Name + email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label style={labelStyle}>Your name *</label><input required minLength={2} style={inputStyle} value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="How the couple knows you" /></div>
        <div><label style={labelStyle}>Email (optional)</label><input type="email" style={inputStyle} value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)} placeholder="you@example.com" /></div>
      </div>

      {/* Type */}
      <div>
        <label style={labelStyle}>Type of memory</label>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <label
              key={t.value}
              className="flex items-start gap-2.5 rounded-xl p-3.5 cursor-pointer transition"
              style={{ background: postType === t.value ? "rgba(138,90,68,0.07)" : "var(--color-surface-muted)", border: `1px solid ${postType === t.value ? "rgba(212,179,155,0.5)" : "var(--color-border)"}` }}
            >
              <input type="radio" checked={postType === t.value} onChange={() => setPostType(t.value)} className="mt-0.5 shrink-0" value={t.value} />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{t.label}</p>
                <p className="text-xs leading-5 mt-0.5" style={{ color: "var(--color-text-muted)" }}>{t.hint}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Unlock date */}
      <div className="space-y-2">
        <label style={labelStyle}>Unlock date *</label>
        <input required type="date" min={minDateStr} style={inputStyle} value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} />
        {(postType === "anniversary" || postType === "timed") && (
          <div className="flex flex-wrap gap-2 pt-1">
            <span style={{ fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--color-text-muted)", alignSelf: "center" }}>Quick set:</span>
            {[1, 5, 10, 25].map((yr) => (
              <button key={yr} type="button" onClick={() => setUnlockDate(anniversaryDate(weddingDate, yr))} className="rounded-full px-3 py-1.5 text-xs uppercase transition" style={{ letterSpacing: "0.18em", background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
                {yr === 1 ? "1st" : yr === 5 ? "5th" : yr === 10 ? "10th" : "25th"} anniversary
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message */}
      <div>
        <label style={labelStyle}>Your message *</label>
        <textarea
          required minLength={10}
          style={{ ...inputStyle, minHeight: 160, resize: "none" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Dear ${brideFirst} & ${groomFirst},\n\nWrite your sealed message here...`}
        />
      </div>

      {status && !status.success && (
        <p className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(220,38,38,0.06)", color: "#b91c1c", border: "1px solid rgba(220,38,38,0.15)" }}>
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !authorName || !message || !unlockDate}
        className="w-full flex items-center justify-center gap-2 rounded-full py-4 text-sm uppercase font-medium transition"
        style={{ letterSpacing: "0.26em", background: "var(--color-accent)", color: "#fff", boxShadow: isSubmitting ? "none" : "0 8px 24px rgba(138,90,68,0.25)", opacity: isSubmitting ? 0.7 : 1 }}
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {isSubmitting ? "Sealing..." : "Seal this message"}
      </button>
    </form>
  );
}

export default TimeCapsuleForm;
