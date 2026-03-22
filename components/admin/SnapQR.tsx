"use client";

/**
 * SnapQR — Admin widget that generates and displays the QR code
 * for the /snap page. Drop it into the admin overview or planning tab.
 *
 * Uses the qrserver.com API (no npm package needed).
 * The QR encodes: https://<your-domain>/snap
 */

import { useEffect, useState } from "react";

const BF   = "'Manrope',system-ui,sans-serif";
const DF   = "'Cormorant Garamond',Georgia,serif";
const ROSE = "#BE2D45";
const INK  = "#1A0D0A";
const INK3 = "#7A5460";
const BG   = "#FAF8F6";
const BDR  = "#D0C0BC";
const W    = "#FFFFFF";

export function SnapQR() {
  const [url, setUrl]       = useState("");
  const [copied, setCopied] = useState(false);
  const [size,  setSize]    = useState(280);

  useEffect(() => {
    // Build the absolute URL for /snap using the current origin
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setUrl(`${origin}/snap`);
  }, []);

  const qrSrc = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=1A0D0A&bgcolor=FAF6F0&margin=12&format=png`
    : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* ignore */ }
  }

  function downloadQR() {
    if (!qrSrc) return;
    const a = document.createElement("a");
    a.href     = qrSrc;
    a.download = "wedding-snap-qr.png";
    a.click();
  }

  function printQR() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Wedding Snap QR</title>
      <style>
        body { margin:0; display:flex; flex-direction:column; align-items:center;
               justify-content:center; min-height:100vh; background:#FAF6F0;
               font-family:'Cormorant Garamond',Georgia,serif; }
        h1   { font-size:2.5rem; font-weight:300; color:#1A0D0A; margin:0 0 .5rem; }
        p    { font-size:1rem; color:#7A5460; margin:0 0 2rem; }
        img  { width:300px; height:300px; }
        small{ font-family:Manrope,sans-serif; font-size:.65rem; letter-spacing:.18em;
               text-transform:uppercase; color:#9A8880; margin-top:1.5rem; }
        @media print { @page { size: A4; margin: 2cm } }
      </style></head>
      <body>
        <h1>Share a moment</h1>
        <p>Scan to upload your photo from the wedding</p>
        <img src="${qrSrc}" alt="QR code"/>
        <small>${url}</small>
      </body></html>
    `);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 600);
  }

  return (
    <div style={{
      background: W, border: `1px solid ${BDR}`,
      borderRadius: 20, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(15,10,11,.05)",
    }}>
      {/* Header */}
      <div style={{
        padding: "1.25rem 1.5rem",
        borderBottom: `1px solid ${BDR}`,
        background: BG,
        display: "flex", alignItems: "center", gap: "1rem",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: "rgba(190,45,69,.10)", border: "1px solid rgba(190,45,69,.20)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={ROSE} strokeWidth="1.8" strokeLinecap="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
        <div>
          <p style={{ fontFamily: BF, fontSize: ".52rem", letterSpacing: ".32em",
            textTransform: "uppercase", color: ROSE, fontWeight: 700, marginBottom: ".2rem" }}>
            Guest photo QR
          </p>
          <p style={{ fontFamily: BF, fontSize: ".82rem", color: INK3 }}>
            Print or display at the venue — guests scan to upload instantly
          </p>
        </div>
      </div>

      {/* QR + controls */}
      <div style={{ padding: "1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* QR code */}
        <div style={{
          background: "#FAF6F0", borderRadius: 16,
          padding: "1rem", border: `1px solid ${BDR}`,
          display: "inline-flex", flexShrink: 0,
        }}>
          {qrSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrSrc} alt="Snap QR code" width={size} height={size}
              style={{ display: "block", borderRadius: 8 }} />
          ) : (
            <div style={{ width: size, height: size, display: "flex",
              alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%",
                border: `2px solid ${ROSE}`, borderTopColor: "transparent",
                animation: "spin 1s linear infinite" }} />
            </div>
          )}
        </div>

        {/* Info + actions */}
        <div style={{ flex: 1, minWidth: 220 }}>

          {/* URL pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: ".625rem",
            padding: ".625rem 1rem", borderRadius: 999,
            background: BG, border: `1px solid ${BDR}`,
            marginBottom: "1.25rem",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke={INK3} strokeWidth="2" strokeLinecap="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span style={{ fontFamily: BF, fontSize: ".72rem", color: INK3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {url || "Loading…"}
            </span>
          </div>

          {/* How it works */}
          <div style={{ marginBottom: "1.25rem" }}>
            {[
              "Guest scans QR at the venue",
              "Optional: enter their name",
              "Tap the camera — photo uploads instantly",
              "Appears in gallery after your approval",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start",
                gap: ".625rem", marginBottom: ".5rem" }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(190,45,69,.10)", border: "1px solid rgba(190,45,69,.22)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 1,
                }}>
                  <span style={{ fontFamily: BF, fontSize: ".48rem",
                    fontWeight: 700, color: ROSE }}>{i+1}</span>
                </div>
                <p style={{ fontFamily: BF, fontSize: ".80rem", color: INK3, lineHeight: 1.5 }}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
            <button onClick={copyLink} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 999,
              background: copied ? "rgba(107,142,110,.12)" : ROSE,
              color: copied ? "#166534" : W,
              border: copied ? "1px solid rgba(107,142,110,.30)" : `1px solid ${ROSE}`,
              cursor: "pointer", fontFamily: BF,
              fontSize: ".62rem", fontWeight: 700, letterSpacing: ".12em",
              transition: "all .18s",
            }}>
              {copied ? (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>Copied!</>
              ) : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy link</>
              )}
            </button>

            <button onClick={downloadQR} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 999,
              background: BG, border: `1px solid ${BDR}`,
              cursor: "pointer", fontFamily: BF,
              fontSize: ".62rem", fontWeight: 700, letterSpacing: ".12em", color: INK3,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download QR
            </button>

            <button onClick={printQR} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 999,
              background: BG, border: `1px solid ${BDR}`,
              cursor: "pointer", fontFamily: BF,
              fontSize: ".62rem", fontWeight: 700, letterSpacing: ".12em", color: INK3,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>

            <a href="/snap" target="_blank" rel="noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 999,
              background: BG, border: `1px solid ${BDR}`,
              textDecoration: "none", fontFamily: BF,
              fontSize: ".62rem", fontWeight: 700, letterSpacing: ".12em", color: INK3,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Preview page
            </a>
          </div>

          {/* Size slider */}
          <div style={{ marginTop: "1.25rem" }}>
            <label style={{ fontFamily: BF, fontSize: ".60rem",
              letterSpacing: ".18em", textTransform: "uppercase",
              color: INK3, display: "block", marginBottom: ".375rem" }}>
              QR size: {size}×{size}px
            </label>
            <input type="range" min={160} max={420} step={20}
              value={size} onChange={e => setSize(Number(e.target.value))}
              style={{ width: "100%", accentColor: ROSE }} />
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
