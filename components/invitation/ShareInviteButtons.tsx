"use client";

/**
 * ShareInviteButtons — Step 10
 * Guest-facing share panel for WhatsApp, Telegram, SMS, and Copy Link.
 * Extends the existing SharePanel without modifying it.
 */

import { useState } from "react";
import { Copy, MessageCircle, Send, Smartphone, Check } from "lucide-react";

interface ShareInviteButtonsProps {
  inviteUrl:    string;   // the guest's own personalised link (shown in URL bar)
  generalUrl?:  string;   // the common invite URL shared with the outside world
  brideName:    string;
  groomName:    string;
  guestName?:   string;
}

const BF = "var(--font-body), system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";

export function ShareInviteButtons({ inviteUrl, generalUrl, brideName, groomName, guestName }: ShareInviteButtonsProps) {
  const [copied, setCopied] = useState(false);

  const bf = brideName.split(" ")[0]!;
  const gf = groomName.split(" ")[0]!;

  // When sharing outward, always use the general URL so recipients
  // don't land on someone else's personalised invitation.
  const shareUrl = generalUrl ?? inviteUrl;
  const msg = `You're invited to ${bf} & ${gf}'s wedding! View the invitation here: ${shareUrl}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = inviteUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const PLATFORMS = [
    {
      label:   "WhatsApp",
      icon:    MessageCircle,
      color:   "#25D366",
      bg:      "rgba(37,211,102,0.1)",
      border:  "rgba(37,211,102,0.3)",
      href:    `https://wa.me/?text=${encodeURIComponent(msg)}`,
    },
    {
      label:   "Telegram",
      icon:    Send,
      color:   "#229ED9",
      bg:      "rgba(34,158,217,0.1)",
      border:  "rgba(34,158,217,0.3)",
      href:    `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${bf} & ${gf}'s wedding invitation`)}`,
    },
    {
      label:   "SMS",
      icon:    Smartphone,
      color:   "#6B7280",
      bg:      "rgba(107,114,128,0.1)",
      border:  "rgba(107,114,128,0.25)",
      href:    `sms:?body=${encodeURIComponent(msg)}`,
    },
  ];

  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, var(--color-accent-soft), transparent)" }} />

      <div style={{ padding: "1.5rem" }}>
        <p style={{ fontSize: ".58rem", letterSpacing: ".42em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: BF, marginBottom: ".375rem" }}>
          Share this invitation
        </p>
        <p style={{ fontSize: ".875rem", color: "var(--color-text-secondary)", fontFamily: BF, marginBottom: "1.25rem" }}>
          {guestName
          ? `Sharing forwards the general wedding invitation — not your personal link.`
          : "Share the wedding with your family and friends."}
        </p>

        {/* Platform buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".625rem", marginBottom: "1rem" }}>
          {PLATFORMS.map(({ label, icon: Icon, color, bg, border, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{
                display:     "inline-flex",
                alignItems:  "center",
                gap:         7,
                padding:     "9px 18px",
                borderRadius: 999,
                background:  bg,
                border:      `1.5px solid ${border}`,
                color,
                fontSize:    ".78rem",
                fontWeight:  700,
                fontFamily:  BF,
                letterSpacing: ".1em",
                textDecoration: "none",
                transition:  "transform .15s, box-shadow .15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
            >
              <Icon size={14} />
              {label}
            </a>
          ))}

          {/* Copy link */}
          <button
            type="button"
            onClick={handleCopy}
            style={{
              display:     "inline-flex",
              alignItems:  "center",
              gap:         7,
              padding:     "9px 18px",
              borderRadius: 999,
              background:  copied ? "rgba(107,142,110,0.1)" : "var(--color-surface-muted)",
              border:      `1.5px solid ${copied ? "rgba(107,142,110,0.3)" : "var(--color-border)"}`,
              color:       copied ? "#166534" : "var(--color-text-secondary)",
              fontSize:    ".78rem",
              fontWeight:  700,
              fontFamily:  BF,
              letterSpacing: ".1em",
              cursor:      "pointer",
              transition:  "all .15s",
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>

        {/* URL display — shows which URL is being shared */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {generalUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(190,45,69,.04)", border: "1px solid rgba(190,45,69,.12)", borderRadius: 10 }}>
              <span style={{ fontSize: ".56rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 700, flexShrink: 0 }}>Sharing</span>
              <p style={{ flex: 1, fontSize: ".72rem", color: "var(--color-text-secondary)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {generalUrl}
              </p>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: "10px 14px", background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", borderRadius: 12 }}>
            <p style={{ flex: 1, fontSize: ".75rem", color: "var(--color-text-muted)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {inviteUrl}
            </p>
            {generalUrl && (
              <span style={{ fontSize: ".52rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--color-text-muted)", flexShrink: 0 }}>your link</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareInviteButtons;
