"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { PenLine, Send, Loader2 } from "lucide-react";

interface FamilyPostFormProps { weddingId: string; authorEmail: string; }
interface PostResponse { success: boolean; message?: string; }

export function FamilyPostForm({ weddingId, authorEmail }: FamilyPostFormProps) {
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"memory"|"blessing"|"milestone"|"anniversary">("memory");
  const [status, setStatus]   = useState<PostResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSubmitting(true); setStatus(null);
    try {
      const res = await fetch("/api/family/post", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingId, title: title.trim(), content: content.trim(), postType, postedBy: authorEmail }),
      });
      const data = (await res.json()) as PostResponse;
      setStatus(data);
      if (data.success) { setTitle(""); setContent(""); }
    } catch { setStatus({ success: false, message: "Unable to save. Please try again." }); }
    finally { setSubmitting(false); }
  }

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

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl overflow-hidden space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, var(--color-accent-soft), transparent)", margin: "0 -1.5rem 0.25rem" }} />

      <div className="flex items-center gap-3">
        <PenLine className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent-soft)" }} />
        <div>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>Add to the archive</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Your name will be attached to this entry.</p>
        </div>
      </div>

      {/* Type selector */}
      <div>
        <label style={labelStyle}>Type</label>
        <div className="flex flex-wrap gap-2">
          {(["memory","blessing","milestone","anniversary"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setPostType(t)} className="rounded-full px-3.5 py-1.5 text-xs uppercase transition" style={{ letterSpacing: "0.18em", background: postType === t ? "var(--color-accent)" : "var(--color-surface-muted)", border: `1px solid ${postType === t ? "var(--color-accent)" : "var(--color-border)"}`, color: postType === t ? "#fff" : "var(--color-text-secondary)" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Title *</label>
        <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A memory from the wedding day" required />
      </div>

      <div>
        <label style={labelStyle}>Your message *</label>
        <textarea style={{ ...inputStyle, minHeight: 110, resize: "none" }} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write something for the family archive..." required />
      </div>

      {status && (
        <p className="rounded-xl px-4 py-3 text-sm" style={status.success ? { background: "rgba(167,243,208,0.3)", color: "#065f46", border: "1px solid rgba(110,231,183,0.4)" } : { background: "rgba(220,38,38,0.06)", color: "#b91c1c", border: "1px solid rgba(220,38,38,0.15)" }}>
          {status.success ? "Your memory has been added to the vault." : (status.message ?? "Something went wrong.")}
        </p>
      )}

      <button type="submit" disabled={submitting || !title.trim() || !content.trim()} className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm uppercase font-medium transition" style={{ letterSpacing: "0.26em", background: "var(--color-accent)", color: "#fff", boxShadow: submitting ? "none" : "0 8px 24px rgba(138,90,68,0.25)", opacity: submitting ? 0.7 : 1 }}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? "Saving..." : "Add to vault"}
      </button>
    </form>
  );
}

export default FamilyPostForm;
