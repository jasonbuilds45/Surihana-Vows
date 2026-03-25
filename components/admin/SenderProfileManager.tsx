"use client";

/**
 * SenderProfileManager
 * Admin panel component for managing sender profiles.
 *
 * Each profile generates two shareable URLs:
 *   Generic:      /invite/general?from=<sender_code>
 *   Personalised: /invite/<guest-code>?from=<sender_code>   (shown as template)
 *
 * Admin workflow:
 *   1. Create profiles (e.g. "Mr & Mrs Philip Jemima" for bride's parents)
 *   2. Copy the generic URL and hand it to the sender
 *   3. For personalised invites: use the guest list to share per-guest links
 */

import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  Check, Copy, Edit2, ExternalLink, Loader2, Plus, Trash2, X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SenderProfile {
  id:            string;
  wedding_id:    string;
  display_title: string;
  sub_text:      string;
  side:          "bride" | "groom" | "both";
  sender_type:   "parents" | "sibling" | "joint" | "other";
  sender_code:   string;
  created_at:    string;
}

interface SenderProfileManagerProps {
  weddingId: string;
}

// ── Tokens ────────────────────────────────────────────────────────────────────
const ROSE  = "#BE2D45";
const INK   = "#1A0D0A";
const INK3  = "rgba(26,13,10,.42)";
const BG    = "#FAF6F0";
const WHITE = "#FFFFFF";
const BDR   = "rgba(190,45,69,.10)";
const BF    = "'Manrope',system-ui,sans-serif";
const DF    = "'Cormorant Garamond',Georgia,serif";

const SIDE_LABELS  = { bride: "Bride's side", groom: "Groom's side", both: "Both sides" };
const TYPE_LABELS  = { parents: "Parents", sibling: "Sibling", joint: "Joint family", other: "Other" };
const SIDE_COLORS: Record<string, string> = {
  bride: "rgba(190,45,69,.10)", groom: "rgba(154,108,6,.10)", both: "rgba(59,130,246,.08)",
};
const SIDE_TEXT: Record<string, string> = {
  bride: "#BE2D45", groom: "#9A6C06", both: "#185FA5",
};

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy link"
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "4px 10px", borderRadius: 999,
        background: copied ? "rgba(34,197,94,.12)" : "rgba(190,45,69,.07)",
        border: `1px solid ${copied ? "rgba(34,197,94,.25)" : "rgba(190,45,69,.15)"}`,
        fontFamily: BF, fontSize: ".60rem", fontWeight: 700,
        color: copied ? "#15803d" : ROSE, cursor: "pointer",
        transition: "all .15s", whiteSpace: "nowrap",
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

// ── Profile card ──────────────────────────────────────────────────────────────
function ProfileCard({
  profile,
  baseUrl,
  onDelete,
  onEdit,
}: {
  profile: SenderProfile;
  baseUrl: string;
  onDelete: (id: string) => void;
  onEdit:   (profile: SenderProfile) => void;
}) {
  const genericUrl = `${baseUrl}/invite/general?from=${encodeURIComponent(profile.sender_code)}`;
  const templateUrl = `${baseUrl}/invite/[guest-code]?from=${encodeURIComponent(profile.sender_code)}`;

  return (
    <div style={{
      background: WHITE, borderRadius: 18,
      border: `1px solid ${BDR}`,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(26,13,10,.05)",
    }}>
      {/* Header */}
      <div style={{
        padding: "1rem 1.25rem .75rem",
        borderBottom: `1px solid ${BDR}`,
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".75rem",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap", marginBottom: ".35rem" }}>
            <span style={{
              padding: "2px 8px", borderRadius: 999,
              background: SIDE_COLORS[profile.side] ?? BG,
              fontFamily: BF, fontSize: ".55rem", fontWeight: 700,
              letterSpacing: ".12em", textTransform: "uppercase",
              color: SIDE_TEXT[profile.side] ?? INK3,
            }}>
              {SIDE_LABELS[profile.side]}
            </span>
            <span style={{
              padding: "2px 8px", borderRadius: 999,
              background: BG,
              fontFamily: BF, fontSize: ".55rem", fontWeight: 700,
              letterSpacing: ".12em", textTransform: "uppercase", color: INK3,
            }}>
              {TYPE_LABELS[profile.sender_type]}
            </span>
          </div>
          <p style={{ fontFamily: DF, fontSize: "1.2rem", color: INK, lineHeight: 1.2 }}>
            {profile.display_title}
          </p>
          <p style={{ fontFamily: BF, fontSize: ".78rem", color: INK3, marginTop: ".2rem", fontStyle: "italic" }}>
            "{profile.sub_text}"
          </p>
        </div>
        <div style={{ display: "flex", gap: ".375rem", flexShrink: 0 }}>
          <button type="button" onClick={() => onEdit(profile)}
            style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${BDR}`, background: BG, display: "grid", placeItems: "center", cursor: "pointer", color: INK3 }}>
            <Edit2 size={12} />
          </button>
          <button type="button" onClick={() => onDelete(profile.id)}
            style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(220,38,38,.18)", background: "rgba(220,38,38,.05)", display: "grid", placeItems: "center", cursor: "pointer", color: "#dc2626" }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* URLs */}
      <div style={{ padding: ".875rem 1.25rem", display: "flex", flexDirection: "column", gap: ".625rem" }}>
        {/* Generic */}
        <div>
          <p style={{ fontFamily: BF, fontSize: ".58rem", letterSpacing: ".14em", textTransform: "uppercase", color: INK3, marginBottom: ".3rem" }}>
            Generic link — share freely
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
            <code style={{
              flex: 1, minWidth: 0,
              fontFamily: "'Menlo','Consolas',monospace", fontSize: ".72rem",
              color: ROSE, background: "rgba(190,45,69,.05)",
              padding: "4px 10px", borderRadius: 8,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              border: `1px solid rgba(190,45,69,.12)`,
            }}>
              {genericUrl}
            </code>
            <CopyButton text={genericUrl} />
            <a href={genericUrl} target="_blank" rel="noreferrer"
              style={{ display: "grid", placeItems: "center", color: INK3 }}>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Personalised template */}
        <div>
          <p style={{ fontFamily: BF, fontSize: ".58rem", letterSpacing: ".14em", textTransform: "uppercase", color: INK3, marginBottom: ".3rem" }}>
            Personalised link — append to any guest link
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
            <code style={{
              flex: 1, minWidth: 0,
              fontFamily: "'Menlo','Consolas',monospace", fontSize: ".72rem",
              color: INK3, background: BG,
              padding: "4px 10px", borderRadius: 8,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              border: `1px solid ${BDR}`,
            }}>
              {templateUrl}
            </code>
            <CopyButton text={`?from=${profile.sender_code}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Form (create / edit) ──────────────────────────────────────────────────────
function ProfileForm({
  weddingId,
  editing,
  onSaved,
  onCancel,
}: {
  weddingId: string;
  editing:   SenderProfile | null;
  onSaved:   (profile: SenderProfile) => void;
  onCancel:  () => void;
}) {
  const [displayTitle, setDisplayTitle] = useState(editing?.display_title ?? "");
  const [subText,      setSubText]      = useState(editing?.sub_text      ?? "joyfully invite you to celebrate");
  const [side,         setSide]         = useState<"bride"|"groom"|"both">(editing?.side ?? "both");
  const [senderType,   setSenderType]   = useState<"parents"|"sibling"|"joint"|"other">(editing?.sender_type ?? "parents");
  const [senderCode,   setSenderCode]   = useState(editing?.sender_code ?? "");
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);

    try {
      const isEdit = !!editing;
      const url    = isEdit
        ? `/api/admin/sender-profiles/${editing.id}`
        : "/api/admin/sender-profiles";

      const res  = await fetch(url, {
        method:  isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingId, displayTitle, subText, side, senderType, senderCode }),
      });
      const data = await res.json() as { success: boolean; data?: SenderProfile; message?: string };
      if (!data.success) throw new Error(data.message ?? "Failed to save.");
      onSaved(data.data!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const inp = (overrides?: React.CSSProperties): React.CSSProperties => ({
    width: "100%", padding: ".65rem .9rem",
    borderRadius: 10, border: `1px solid ${BDR}`,
    background: BG, fontFamily: BF, fontSize: ".88rem",
    color: INK, outline: "none",
    ...overrides,
  });

  const label = (text: string) => (
    <p style={{ fontFamily: BF, fontSize: ".58rem", letterSpacing: ".14em", textTransform: "uppercase", color: INK3, marginBottom: ".3rem" }}>
      {text}
    </p>
  );

  return (
    <form onSubmit={handleSubmit} style={{
      background: WHITE, borderRadius: 18, border: `1px solid ${BDR}`,
      padding: "1.25rem", display: "flex", flexDirection: "column", gap: ".875rem",
      boxShadow: "0 4px 24px rgba(26,13,10,.08)",
    }}>
      <div style={{ height: 2, background: `linear-gradient(90deg,${ROSE},rgba(190,45,69,.2),transparent)`, margin: "0 -1.25rem 0" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontFamily: DF, fontSize: "1.1rem", color: INK }}>
          {editing ? "Edit sender profile" : "New sender profile"}
        </p>
        <button type="button" onClick={onCancel}
          style={{ background: "none", border: "none", cursor: "pointer", color: INK3 }}>
          <X size={16} />
        </button>
      </div>

      {/* Display title */}
      <div>
        {label("Host name *")}
        <input ref={titleRef} required value={displayTitle} onChange={e => setDisplayTitle(e.target.value)}
          placeholder="Mr & Mrs Philip Jemima" style={inp()} />
      </div>

      {/* Sub text */}
      <div>
        {label("Invitation line")}
        <input value={subText} onChange={e => setSubText(e.target.value)}
          placeholder="request the honour of your presence…" style={inp()} />
      </div>

      {/* Side + Type row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
        <div>
          {label("Side")}
          <select value={side} onChange={e => setSide(e.target.value as typeof side)} style={inp()}>
            <option value="bride">Bride's side</option>
            <option value="groom">Groom's side</option>
            <option value="both">Both sides</option>
          </select>
        </div>
        <div>
          {label("Type")}
          <select value={senderType} onChange={e => setSenderType(e.target.value as typeof senderType)} style={inp()}>
            <option value="parents">Parents</option>
            <option value="sibling">Sibling</option>
            <option value="joint">Joint family</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Sender code */}
      <div>
        {label("URL code (auto-generated if blank)")}
        <input value={senderCode} onChange={e => setSenderCode(e.target.value)}
          placeholder="brides-parents" style={inp()}
          pattern="[a-zA-Z0-9\-]+" title="Letters, numbers and hyphens only" />
        <p style={{ fontFamily: BF, fontSize: ".70rem", color: INK3, marginTop: ".25rem" }}>
          Will appear as ?from=<strong>{senderCode || "auto"}</strong> in the invite URL
        </p>
      </div>

      {error && (
        <p style={{ fontFamily: BF, fontSize: ".82rem", color: "#b91c1c", padding: ".65rem .9rem", borderRadius: 10, background: "rgba(220,38,38,.06)", border: "1px solid rgba(220,38,38,.15)" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} style={{
          padding: "8px 16px", borderRadius: 999, cursor: "pointer",
          background: "none", border: `1px solid ${BDR}`,
          fontFamily: BF, fontSize: ".65rem", fontWeight: 700,
          letterSpacing: ".12em", textTransform: "uppercase", color: INK3,
        }}>Cancel</button>
        <button type="submit" disabled={saving || !displayTitle.trim()} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 20px", borderRadius: 999, cursor: "pointer",
          background: ROSE, border: `1px solid ${ROSE}`,
          fontFamily: BF, fontSize: ".65rem", fontWeight: 700,
          letterSpacing: ".12em", textTransform: "uppercase", color: WHITE,
          boxShadow: `0 4px 14px rgba(190,45,69,.28)`,
          opacity: saving || !displayTitle.trim() ? .55 : 1,
        }}>
          {saving ? <Loader2 size={13} style={{ animation: "spin .9s linear infinite" }} /> : <Check size={13} />}
          {saving ? "Saving…" : editing ? "Save changes" : "Create profile"}
        </button>
      </div>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function SenderProfileManager({ weddingId }: SenderProfileManagerProps) {
  const [profiles, setProfiles] = useState<SenderProfile[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<SenderProfile | null>(null);

  const baseUrl = (typeof window !== "undefined")
    ? (process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin).replace(/\/$/, "")
    : "";

  useEffect(() => {
    void fetch(`/api/admin/sender-profiles?weddingId=${weddingId}`)
      .then(r => r.json())
      .then((d: { success: boolean; data?: SenderProfile[] }) => {
        if (d.success) setProfiles(d.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [weddingId]);

  function handleSaved(saved: SenderProfile) {
    setProfiles(prev => {
      const exists = prev.findIndex(p => p.id === saved.id);
      return exists >= 0
        ? prev.map(p => p.id === saved.id ? saved : p)
        : [...prev, saved];
    });
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this sender profile? The invite links using it will fall back to the couple's names.")) return;
    const res  = await fetch(`/api/admin/sender-profiles/${id}`, { method: "DELETE" });
    const data = await res.json() as { success: boolean };
    if (data.success) setProfiles(prev => prev.filter(p => p.id !== id));
  }

  function handleEdit(profile: SenderProfile) {
    setEditing(profile);
    setShowForm(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: BF, fontSize: ".58rem", letterSpacing: ".38em", textTransform: "uppercase", color: ROSE, marginBottom: ".3rem" }}>
            Sender profiles
          </p>
          <h2 style={{ fontFamily: DF, fontSize: "1.8rem", color: INK, lineHeight: 1.05 }}>
            Who is sending the invitation?
          </h2>
          <p style={{ fontFamily: BF, fontSize: ".84rem", color: INK3, marginTop: ".35rem", maxWidth: 480, lineHeight: 1.7 }}>
            Create a profile for each sender — bride's parents, groom's parents, siblings.
            Each profile generates a generic link and a personalised link template.
          </p>
        </div>
        {!showForm && (
          <button type="button" onClick={() => { setEditing(null); setShowForm(true); }} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 18px", borderRadius: 999,
            background: ROSE, border: `1px solid ${ROSE}`,
            fontFamily: BF, fontSize: ".65rem", fontWeight: 700,
            letterSpacing: ".12em", textTransform: "uppercase", color: WHITE,
            cursor: "pointer", boxShadow: `0 4px 14px rgba(190,45,69,.25)`,
          }}>
            <Plus size={14} /> New profile
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <ProfileForm
          weddingId={weddingId}
          editing={editing}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* Profile list */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2.5rem" }}>
          <Loader2 size={20} style={{ animation: "spin .9s linear infinite", color: ROSE }} />
        </div>
      ) : profiles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2.5rem 1.5rem", background: WHITE, borderRadius: 18, border: `1.5px dashed ${BDR}` }}>
          <p style={{ fontFamily: DF, fontSize: "1.4rem", color: INK, marginBottom: ".5rem" }}>
            No sender profiles yet.
          </p>
          <p style={{ fontFamily: BF, fontSize: ".84rem", color: INK3, lineHeight: 1.7 }}>
            Create a profile for the bride's parents, groom's parents, or any sibling
            who will be sending invites under their own name.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {profiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              baseUrl={baseUrl}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default SenderProfileManager;
