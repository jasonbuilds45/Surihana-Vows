"use client";

/**
 * ShareInviteButtons — Step 10
 * Guest-facing share panel for WhatsApp, Telegram, SMS, and Copy Link.
 * Extends the existing SharePanel without modifying it.
 */

import { useState } from "react";
import { Copy, MessageCircle, Send, Smartphone, Check } from "lucide-react";

interface ShareInviteButtonsProps {
  inviteUrl:   string;
  brideName:   string;
  groomName:   string;
  guestName?:  string;
}

const BF = "var(--font-body), system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";

export function ShareInviteButtons({ inviteUrl, brideName, groomName, guestName }: ShareInviteButtonsProps) {
  const [copied, setCopied] = useState(false);

  const bf = brideName.split(" ")[0]!;
  const gf = groomName.split(" ")[0]!;
  const msg = `You're invited to ${bf} & ${gf}'s wedding. View your personal invitation here: ${inviteUrl}`;

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
      href:    `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(`${bf} & ${gf}'s wedding invitation`)}`,
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
          {guestName ? `Forward your invite, ${guestName.split(" ")[0]}.` : "Forward your personal invite link."}
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

        {/* URL display */}
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: "10px 14px", background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", borderRadius: 12 }}>
          <p style={{ flex: 1, fontSize: ".75rem", color: "var(--color-text-muted)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {inviteUrl}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ShareInviteButtons;
