"use client";

import { useMemo, useState } from "react";
import { Copy, Mail, MessageCircle, QrCode } from "lucide-react";

interface SharePanelProps {
  inviteUrl: string;
  coupleLabel: string;
  guestLabel: string;
}

export function SharePanel({ inviteUrl, coupleLabel, guestLabel }: SharePanelProps) {
  const [copied, setCopied] = useState(false);

  const whatsappUrl = useMemo(
    () => `https://wa.me/?text=${encodeURIComponent(`${guestLabel}, your invitation to ${coupleLabel} is ready: ${inviteUrl}`)}`,
    [coupleLabel, guestLabel, inviteUrl]
  );
  const emailUrl = useMemo(
    () => `mailto:?subject=${encodeURIComponent(`${coupleLabel} Wedding Invitation`)}&body=${encodeURIComponent(`${guestLabel},\n\nYour invitation is ready.\n\nOpen it here: ${inviteUrl}`)}`,
    [coupleLabel, guestLabel, inviteUrl]
  );
  const qrCodeUrl = useMemo(
    () => `https://quickchart.io/qr?size=200&dark=1c1917&light=fffaf5&text=${encodeURIComponent(inviteUrl)}`,
    [inviteUrl]
  );

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, var(--color-accent-soft), transparent)" }} />

      <div className="p-5 space-y-4">
        <div>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>
            Share this invitation
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Send your personalised invite link to family and friends.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* WhatsApp — primary CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs uppercase font-medium transition"
            style={{ letterSpacing: "0.22em", background: "var(--color-accent)", color: "#fff", boxShadow: "0 4px 16px rgba(138,90,68,0.3)" }}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={emailUrl}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs uppercase transition"
            style={{ letterSpacing: "0.22em", background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs uppercase transition"
            style={{
              letterSpacing: "0.22em",
              background: copied ? "rgba(138,90,68,0.08)" : "var(--color-surface-muted)",
              border: `1px solid ${copied ? "rgba(212,179,155,0.5)" : "var(--color-border)"}`,
              color: copied ? "var(--color-accent)" : "var(--color-text-secondary)",
            }}
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>

        {/* QR + URL */}
        <div
          className="flex items-center gap-4 rounded-xl p-4"
          style={{ background: "var(--color-surface-muted)", border: "1px solid var(--color-border)" }}
        >
          <div className="overflow-hidden rounded-lg shrink-0" style={{ border: "1px solid var(--color-border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="QR code for invite link" className="h-16 w-16 block" src={qrCodeUrl} />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <QrCode className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-accent-soft)" }} />
              <p style={{ fontSize: "0.55rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                Scan to open
              </p>
            </div>
            <p className="break-all text-xs leading-5" style={{ color: "var(--color-text-muted)" }}>
              {inviteUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharePanel;
