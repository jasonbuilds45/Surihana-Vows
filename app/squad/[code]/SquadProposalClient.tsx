"use client";

/**
 * SquadProposalClient — Enhanced
 *
 * The sealed letter proposal experience.
 * Design language: "A Letter Worth Keeping"
 * — Feels like receiving a beautifully crafted physical letter.
 * — Every state has its own emotional register and visual identity.
 */

import { useState } from "react";
import type { SquadProposal } from "@/modules/squad/squad-system";

// ── Design tokens ─────────────────────────────────────────────────────────
const ROSE      = "#BE2D45";
const ROSE_H    = "#A42539";
const ROSE_L    = "#D44860";
const ROSE_PALE = "#FBEBEE";
const ROSE_MID  = "#F0BEC6";
const GOLD      = "#A87808";
const GOLD_L    = "#C9960A";
const GOLD_PALE = "#FBF2DC";
const GOLD_MID  = "#E8C45A";
const INK       = "#120B0E";
const INK_2     = "#2E1A1F";
const INK_3     = "#72504A";
const INK_4     = "#A88888";
const CREAM     = "#FDFAF7";
const PAPER     = "#F8F3EE";
const PAPER_2   = "#F1E9E0";
const PARCHMENT = "#EDE0D0";

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

// ── Role config ───────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  bridesmaid: {
    label:      "Bridesmaid",
    accent:     ROSE,
    accentPale: ROSE_PALE,
    accentMid:  ROSE_MID,
    accentBd:   "rgba(190,45,69,.22)",
    ask:        "Will you be my bridesmaid?",
    duty:       "Stand beside Marion on her most sacred day. Walk down the aisle at Divine Mercy Church, hold her bouquet, and be beside her as the sun sets over the Bay of Bengal at the Shoreline Reception.",
    gradient:   "linear-gradient(155deg, #1A0308 0%, #2C0910 45%, #1A0308 100%)",
    sealColor1: "#F5C5CB",
    sealColor2: "#BE2D45",
    sealColor3: "#7A1525",
    lightRgb:   "240,190,198",
    from:       "Marion",
  },
  groomsman: {
    label:      "Groomsman",
    accent:     GOLD,
    accentPale: GOLD_PALE,
    accentMid:  GOLD_MID,
    accentBd:   "rgba(168,120,8,.22)",
    ask:        "Will you be my groomsman?",
    duty:       "Stand beside Livingston as he makes the most important promise of his life. Walk into Divine Mercy Church at 3 PM, hold the rings, and celebrate with him at the Shoreline Reception as the evening unfolds.",
    gradient:   "linear-gradient(155deg, #0D0A00 0%, #1C1500 45%, #0D0A00 100%)",
    sealColor1: "#F5D47A",
    sealColor2: "#A87808",
    sealColor3: "#5C3D01",
    lightRgb:   "232,196,80",
    from:       "Livingston",
  },
} as const;

interface Props {
  proposal: SquadProposal;
  brideName: string;
  groomName: string;
}

type State = "sealed" | "opening" | "opened" | "accepted" | "declined" | "submitting";
type AcceptResponse = { success: boolean; message?: string; vaultUrl?: string | null; needsManualGrant?: boolean };

export function SquadProposalClient({ proposal, brideName, groomName }: Props) {
  const [state,        setState]        = useState<State>(
    proposal.accepted === true  ? "accepted" :
    proposal.accepted === false ? "declined" :
    "sealed"
  );
  const [responseNote, setResponseNote] = useState("");
  const [error,        setError]        = useState<string | null>(null);
  const [vaultUrl,     setVaultUrl]     = useState<string | null>(null);

  const cfg        = ROLE_CONFIG[proposal.squad_role];
  const firstName  = proposal.name.split(" ")[0]!;
  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;
  const initials   = `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase();

  async function handleOpen() {
    setState("opening");
    fetch("/api/squad/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: proposal.proposal_code, response: "opened" }),
    }).catch(() => undefined);
    setTimeout(() => setState("opened"), 800);
  }

  async function handleAccept() {
    setState("submitting");
    setError(null);
    try {
      const res  = await fetch("/api/squad/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: proposal.proposal_code, response: "accept", note: responseNote || undefined }),
      });
      const json = (await res.json()) as AcceptResponse;
      if (!json.success) throw new Error(json.message ?? "Something went wrong.");
      setVaultUrl(json.vaultUrl ?? null);
      setState("accepted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("opened");
    }
  }

  async function handleDecline() {
    if (!window.confirm("Are you sure? You can always reach out to change your answer.")) return;
    setState("submitting");
    try {
      await fetch("/api/squad/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: proposal.proposal_code, response: "decline" }),
      });
      setState("declined");
    } catch {
      setState("opened");
    }
  }

  // ── Wax seal SVG — role-coloured ─────────────────────────────────────────
  // Shadow lives inside SVG <defs> as a proper feDropShadow filter applied
  // only to the disc group — never on the <svg> element itself. This prevents
  // the browser from creating a rectangular compositing region that shows as
  // a visible square before GPU compositing, which was the previous bug.
  const WaxSeal = ({ size = 200, burst = false }: { size?: number; burst?: boolean }) => {
    const shadowId = `sp-shadow-${proposal.squad_role}`;
    return (
    <svg
      viewBox="0 0 200 200"
      width={size} height={size}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      <defs>
        {/* Shadow filter — applied to the disc group, not the SVG element */}
        {!burst && (
          <filter id={shadowId} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor="rgba(0,0,0,.50)" />
            <feDropShadow dx="0" dy="3"  stdDeviation="5"  floodColor="rgba(0,0,0,.30)" />
          </filter>
        )}
        <radialGradient id={`sg-${proposal.squad_role}`} cx="36%" cy="32%" r="70%">
          <stop offset="0%"   stopColor={cfg.sealColor1} />
          <stop offset="40%"  stopColor={cfg.sealColor2} />
          <stop offset="100%" stopColor={cfg.sealColor3} />
        </radialGradient>
        <radialGradient id={`sh-${proposal.squad_role}`} cx="32%" cy="26%" r="55%">
          <stop offset="0%"   stopColor="rgba(255,255,255,.28)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)"   />
        </radialGradient>
      </defs>

      {/* Everything in one <g> so the shadow filter is scoped to the
          circular disc — the browser composites the shadow from the
          actual painted pixels of this group, which are all circular,
          so the shadow is always perfectly round from first paint. */}
      <g filter={burst ? undefined : `url(#${shadowId})`}>

        {/* Outer decorative ring — 24 tick marks */}
        {Array.from({ length: 24 }, (_, i) => {
          const a  = (i / 24) * Math.PI * 2 - Math.PI / 2;
          const r1 = 90, r2 = 98;
          return (
            <line key={i}
              x1={100 + r1 * Math.cos(a)} y1={100 + r1 * Math.sin(a)}
              x2={100 + r2 * Math.cos(a)} y2={100 + r2 * Math.sin(a)}
              stroke="rgba(255,255,255,.18)" strokeWidth="1.5"
            />
          );
        })}

        {/* Main disc */}
        <circle cx="100" cy="100" r="90" fill={`url(#sg-${proposal.squad_role})`} />

        {/* Concentric rings */}
        <circle cx="100" cy="100" r="89" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="1" />
        <circle cx="100" cy="100" r="66" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".8" />

        {/* Sheen */}
        <circle cx="100" cy="100" r="90" fill={`url(#sh-${proposal.squad_role})`} />

        {/* Initials */}
        <text
          x="100" y="115"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond',Georgia,serif"
          fontSize="52" fontWeight="600"
          letterSpacing="6"
          fill="rgba(255,255,255,.88)"
        >
          {initials}
        </text>

        {/* Small decorative diamonds */}
        {[[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dy], i) => (
          <polygon key={i}
            points={`${100 + dx! * 82},${100 + dy! * 82} ${100 + dx! * 82 - 3},${100 + dy! * 82 + 3} ${100 + dx! * 82},${100 + dy! * 82 + 6} ${100 + dx! * 82 + 3},${100 + dy! * 82 + 3}`}
            fill="rgba(255,255,255,.22)"
            transform={`rotate(${i * 90}, 100, 100)`}
          />
        ))}

      </g>
    </svg>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ── Keyframes ── */
        @keyframes sp-fade   {from{opacity:0}to{opacity:1}}
        @keyframes sp-rise   {from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sp-riseL  {from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes sp-riseR  {from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes sp-scale  {from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
        @keyframes sp-grow   {from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes sp-unfold {from{opacity:0;transform:scaleY(0) translateY(-20px);transform-origin:top}to{opacity:1;transform:scaleY(1) translateY(0)}}
        @keyframes sp-burst  {0%{transform:scale(1) rotate(0);opacity:1}25%{transform:scale(1.18) rotate(-5deg);opacity:.9}60%{transform:scale(.7) rotate(12deg);opacity:.4}100%{transform:scale(0) rotate(30deg);opacity:0}}
        @keyframes sp-ring   {0%{transform:scale(1);opacity:.7}100%{transform:scale(4);opacity:0}}
        @keyframes sp-pulse  {0%,100%{box-shadow:0 0 0 0 rgba(${cfg.lightRgb},.0),0 10px 36px rgba(0,0,0,.38)}50%{box-shadow:0 0 0 16px rgba(${cfg.lightRgb},.15),0 14px 44px rgba(0,0,0,.45)}}
        @keyframes sp-float  {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes sp-glow   {0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes sp-confetti{0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(760deg);opacity:0}}
        @keyframes sp-stamp  {0%{transform:scale(1.4) rotate(-8deg);opacity:0}60%{transform:scale(.95) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes sp-sweep  {0%{background-position:220% 0}42%{background-position:-220% 0}100%{background-position:-220% 0}}
        @keyframes sp-celebrate{0%,100%{transform:scale(1)}35%{transform:scale(1.05)}70%{transform:scale(.97)}}

        /* ── Entrance classes ── */
        .sp-0{opacity:0;animation:sp-fade .7s .0s ease forwards}
        .sp-1{opacity:0;animation:sp-rise .9s .1s cubic-bezier(.16,1,.3,1) forwards}
        .sp-2{opacity:0;animation:sp-rise .9s .22s cubic-bezier(.16,1,.3,1) forwards}
        .sp-3{opacity:0;animation:sp-rise .9s .34s cubic-bezier(.16,1,.3,1) forwards}
        .sp-4{opacity:0;animation:sp-rise .8s .46s cubic-bezier(.16,1,.3,1) forwards}
        .sp-5{opacity:0;animation:sp-rise .8s .58s cubic-bezier(.16,1,.3,1) forwards}
        .sp-6{opacity:0;animation:sp-rise .8s .70s cubic-bezier(.16,1,.3,1) forwards}
        .sp-7{opacity:0;animation:sp-rise .75s .84s cubic-bezier(.16,1,.3,1) forwards}
        .sp-8{opacity:0;animation:sp-rise .75s .98s cubic-bezier(.16,1,.3,1) forwards}
        .sp-L{opacity:0;animation:sp-riseL .8s .3s cubic-bezier(.16,1,.3,1) forwards}
        .sp-R{opacity:0;animation:sp-riseR .8s .3s cubic-bezier(.16,1,.3,1) forwards}
        .sp-line{opacity:0;animation:sp-grow .9s .4s ease forwards;transform-origin:center}
        .sp-unfold{opacity:0;animation:sp-unfold .65s .2s cubic-bezier(.16,1,.3,1) forwards}

        /* ── Seal states ── */
        .sp-seal-idle { animation:sp-pulse 4s 1.2s ease-in-out infinite, sp-float 6s 0s ease-in-out infinite; }
        .sp-seal-burst{ animation:sp-burst .6s ease forwards; }

        /* ── Accept button ── */
        .sp-accept {
          display:flex;align-items:center;justify-content:center;gap:10px;
          width:100%;padding:18px 24px;border-radius:999px;border:none;cursor:pointer;
          font-family:${BF};font-size:.80rem;font-weight:700;
          letter-spacing:.22em;text-transform:uppercase;color:#fff;
          background:linear-gradient(135deg,${ROSE_L} 0%,${ROSE} 52%,${ROSE_H} 100%);
          box-shadow:0 8px 32px rgba(190,45,69,.34),0 2px 8px rgba(190,45,69,.18);
          transition:filter .2s,transform .2s;position:relative;overflow:hidden;
        }
        .sp-accept:hover:not(:disabled){filter:brightness(1.09);transform:translateY(-2px)}
        .sp-accept:disabled{opacity:.65;cursor:not-allowed}
        .sp-accept::after{
          content:'';position:absolute;inset:0;border-radius:999px;
          background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.20) 50%,transparent 65%);
          background-size:220% 100%;background-position:220% 0;
          animation:sp-sweep 3.5s 2s ease infinite;pointer-events:none;
        }

        /* ── Decline button ── */
        .sp-decline {
          display:flex;align-items:center;justify-content:center;
          width:100%;padding:13px;border-radius:999px;cursor:pointer;
          font-family:${BF};font-size:.68rem;font-weight:500;letter-spacing:.18em;
          text-transform:uppercase;background:transparent;
          border:1.5px solid rgba(18,11,14,.12);color:${INK_4};
          transition:all .2s;
        }
        .sp-decline:hover{border-color:rgba(190,45,69,.30);color:${ROSE}}

        /* ── Response textarea ── */
        .sp-textarea{
          width:100%;padding:14px 16px;
          background:${PAPER};border:1.5px solid rgba(190,45,69,.14);
          border-radius:14px;resize:vertical;min-height:96px;
          font-family:${DF};font-style:italic;font-size:1rem;
          color:${INK};line-height:1.85;outline:none;
          transition:border-color .18s,box-shadow .18s;
        }
        .sp-textarea:focus{border-color:${ROSE};box-shadow:0 0 0 3px rgba(190,45,69,.08)}
        .sp-textarea::placeholder{color:${INK_4};font-style:italic}

        /* ── Background paper texture ── */
        .sp-paper-bg {
          background:
            radial-gradient(ellipse 70% 55% at 15% 20%, rgba(190,45,69,.035) 0%, transparent 55%),
            radial-gradient(ellipse 55% 50% at 88% 85%, rgba(168,120,8,.035) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 50% 50%, rgba(190,45,69,.02) 0%, transparent 60%),
            ${CREAM};
        }

        /* ── Envelope decoration ── */
        .sp-env-line {
          position:absolute;pointer-events:none;
        }

        /* ── Letter paper ── */
        .sp-letter {
          background:#FFFFFF;
          background-image:
            repeating-linear-gradient(
              transparent,
              transparent 31px,
              rgba(190,45,69,.04) 31px,
              rgba(190,45,69,.04) 32px
            );
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          PAGE WRAPPER
      ══════════════════════════════════════════════════════════════════ */}
      <div className="sp-paper-bg" style={{
        minHeight: "100dvh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "clamp(2rem,6vh,5rem) clamp(1rem,4vw,2rem)",
        position: "relative", overflow: "hidden",
      }}>

        {/* Decorative corner lines — envelope feel */}
        <svg aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: .35 }} preserveAspectRatio="none">
          <line x1="0" y1="0" x2="120" y2="120" stroke={ROSE_MID} strokeWidth=".8" />
          <line x1="0" y1="0" x2="0" y2="80" stroke={ROSE_MID} strokeWidth=".5" />
          <line x1="0" y1="0" x2="80" y2="0" stroke={ROSE_MID} strokeWidth=".5" />
          <line x1="100%" y1="100%" x2="calc(100% - 120px)" y2="calc(100% - 120px)" stroke={GOLD_MID} strokeWidth=".8" />
          <line x1="100%" y1="100%" x2="100%" y2="calc(100% - 80px)" stroke={GOLD_MID} strokeWidth=".5" />
          <line x1="100%" y1="100%" x2="calc(100% - 80px)" y2="100%" stroke={GOLD_MID} strokeWidth=".5" />
        </svg>

        {/* ══════════════════════════════════════════════════════════════
            STATE: SEALED
        ══════════════════════════════════════════════════════════════ */}
        {(state === "sealed" || state === "opening") && (
          <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>

            {/* Postmark / couple header */}
            <div className="sp-0" style={{
              display: "flex", alignItems: "center", gap: 14,
              justifyContent: "center", marginBottom: "2.25rem",
            }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${ROSE_MID})` }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  display: "inline-block", width: 20, height: 20, borderRadius: "50%",
                  border: `1.5px solid ${ROSE}`, position: "relative",
                }}>
                  <span style={{ position: "absolute", inset: 3, borderRadius: "50%", background: ROSE }} />
                </span>
                <span style={{
                  fontFamily: BF, fontSize: ".46rem", letterSpacing: ".54em",
                  textTransform: "uppercase", color: ROSE, fontWeight: 700,
                }}>
                  {brideFirst} &amp; {groomFirst}
                </span>
                <span style={{
                  display: "inline-block", width: 20, height: 20, borderRadius: "50%",
                  border: `1.5px solid ${GOLD}`, position: "relative",
                }}>
                  <span style={{ position: "absolute", inset: 3, borderRadius: "50%", background: GOLD }} />
                </span>
              </div>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${ROSE_MID})` }} />
            </div>

            {/* Addressed to — handwritten feel */}
            <div className="sp-1" style={{ marginBottom: "clamp(1.75rem,4vh,3rem)" }}>
              <p style={{
                fontFamily: BF, fontSize: ".48rem", letterSpacing: ".42em",
                textTransform: "uppercase", color: INK_3, fontWeight: 600,
                marginBottom: ".625rem",
              }}>
                A private letter for
              </p>
              <p style={{
                fontFamily: DF, fontWeight: 600,
                fontSize: "clamp(2.25rem,7vw,3.25rem)",
                color: INK, letterSpacing: ".01em", lineHeight: 1.05,
              }}>
                {proposal.name}
              </p>
              {/* Underline flourish */}
              <div style={{
                margin: ".875rem auto 0",
                width: "min(240px,70%)",
                height: 1,
                background: `linear-gradient(90deg, transparent, ${ROSE_MID}, transparent)`,
              }} />
            </div>

            {/* Wax seal */}
            <div className="sp-2" style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "1.375rem",
              marginBottom: "clamp(1.75rem,4vh,2.75rem)",
            }}>
              <div style={{ position: "relative" }}>
                {/* Pulse rings behind the seal */}
                {state === "sealed" && (
                  <>
                    <div aria-hidden style={{
                      position: "absolute", inset: -20, borderRadius: "50%",
                      border: `1px solid rgba(${cfg.lightRgb},.18)`,
                      animation: "sp-glow 3s 1s ease-in-out infinite",
                    }} />
                    <div aria-hidden style={{
                      position: "absolute", inset: -36, borderRadius: "50%",
                      border: `1px solid rgba(${cfg.lightRgb},.10)`,
                      animation: "sp-glow 3s 1.8s ease-in-out infinite",
                    }} />
                  </>
                )}

                {state === "opening" && (
                  <>
                    <div aria-hidden style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      border: `2px solid ${cfg.accent}`,
                      animation: "sp-ring .5s ease forwards",
                    }} />
                    <div aria-hidden style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      border: `1px solid rgba(${cfg.lightRgb},.5)`,
                      animation: "sp-ring .65s .1s ease forwards",
                    }} />
                  </>
                )}

                <div
                  className={state === "sealed" ? "sp-seal-idle" : "sp-seal-burst"}
                  onClick={state === "sealed" ? handleOpen : undefined}
                  style={{
                    cursor: state === "sealed" ? "pointer" : "default",
                    display: "block",
                  }}
                >
                  <WaxSeal size={clamp(160, 200)} burst={state === "opening"} />
                </div>
              </div>

              {/* Hint text */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, height: 1, background: `linear-gradient(to right, transparent, ${INK_4})` }} />
                <p style={{
                  fontFamily: BF, fontSize: ".47rem", letterSpacing: ".32em",
                  textTransform: "uppercase", color: INK_4, fontWeight: 500,
                }}>
                  {state === "opening" ? "Opening…" : "Press the seal to open"}
                </p>
                <div style={{ width: 20, height: 1, background: `linear-gradient(to left, transparent, ${INK_4})` }} />
              </div>
            </div>

            {/* Teaser */}
            <p className="sp-3" style={{
              fontFamily: DF, fontStyle: "italic", fontWeight: 300,
              fontSize: "clamp(1rem,2.5vw,1.15rem)",
              color: INK_3, letterSpacing: ".01em", lineHeight: 1.78,
            }}>
              {cfg.from} has written you something personal.
            </p>

            {/* Wedding date postmark */}
            <div className="sp-4" style={{ marginTop: "2rem" }}>
              <p style={{
                fontFamily: BF, fontSize: ".46rem", letterSpacing: ".28em",
                textTransform: "uppercase", color: INK_4, fontWeight: 500,
              }}>
                20 · 05 · 2026 · Chennai
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STATE: OPENED
        ══════════════════════════════════════════════════════════════ */}
        {(state === "opened" || state === "submitting") && (
          <div style={{ width: "100%", maxWidth: 620 }}>

            {/* ── The Letter ── */}
            <article className="sp-unfold" style={{
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: `
                0 2px 4px rgba(18,11,14,.04),
                0 8px 24px rgba(18,11,14,.08),
                0 32px 72px rgba(18,11,14,.10),
                0 0 0 1px rgba(190,45,69,.07)
              `,
            }}>

              {/* ── Dark header — the envelope flap ── */}
              <header style={{
                position: "relative", overflow: "hidden",
                background: cfg.gradient,
                padding: "clamp(2rem,5.5vw,3rem) clamp(1.75rem,5vw,2.5rem)",
              }}>
                {/* Top colour stripe */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, transparent 5%, ${cfg.accent} 30%, ${cfg.accent} 70%, transparent 95%)`,
                }} />

                {/* Role-specific decorative motif */}
                {proposal.squad_role === "bridesmaid" ? (
                  // Arch / church motif
                  <svg aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, opacity: .06 }}
                    width="100%" height="80" viewBox="0 0 600 80" preserveAspectRatio="none">
                    <path d="M0 80 Q150 0 300 30 Q450 60 600 80 Z" fill="rgba(240,190,198,1)" />
                    <path d="M0 80 Q300 10 600 80" fill="none" stroke="rgba(240,190,198,1)" strokeWidth="2" />
                  </svg>
                ) : (
                  // Wave / sea motif
                  <svg aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, opacity: .06 }}
                    width="100%" height="80" viewBox="0 0 600 80" preserveAspectRatio="none">
                    <path d="M0 50 Q75 20 150 50 Q225 80 300 50 Q375 20 450 50 Q525 80 600 50 L600 80 L0 80Z" fill="rgba(232,196,80,1)" />
                  </svg>
                )}

                {/* Sender label */}
                <p style={{
                  fontFamily: BF, fontSize: ".48rem", letterSpacing: ".42em",
                  textTransform: "uppercase",
                  color: `rgba(${cfg.lightRgb},.60)`,
                  fontWeight: 700, marginBottom: "1.25rem",
                }}>
                  A personal proposal from {cfg.from}
                </p>

                {/* The big ask */}
                <h1 className="sp-1" style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(2rem,5.5vw,3.25rem)",
                  color: "rgba(255,252,248,.92)",
                  lineHeight: 1.15, letterSpacing: "-.01em",
                  marginBottom: "1.5rem",
                }}>
                  {cfg.ask}
                </h1>

                {/* Addressed to — in header */}
                <div className="sp-2" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: `rgba(${cfg.lightRgb},.14)`,
                    border: `1px solid rgba(${cfg.lightRgb},.24)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="8" r="4" stroke={`rgba(${cfg.lightRgb},.80)`} strokeWidth="1.6" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={`rgba(${cfg.lightRgb},.80)`} strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p style={{
                      fontFamily: BF, fontSize: ".44rem", letterSpacing: ".30em",
                      textTransform: "uppercase",
                      color: `rgba(${cfg.lightRgb},.50)`,
                      fontWeight: 600, marginBottom: ".2rem",
                    }}>
                      For
                    </p>
                    <p style={{
                      fontFamily: DF, fontSize: "clamp(1.2rem,3vw,1.6rem)",
                      color: "rgba(255,252,248,.88)", fontWeight: 600, lineHeight: 1,
                    }}>
                      {proposal.name}
                    </p>
                  </div>
                </div>
              </header>

              {/* ── Letter body — on paper ── */}
              <div className="sp-letter" style={{
                padding: "clamp(1.75rem,5.5vw,2.75rem)",
              }}>

                {/* Personal note */}
                <div className="sp-3" style={{
                  borderLeft: `3px solid rgba(190,45,69,.22)`,
                  paddingLeft: "clamp(1.25rem,3.5vw,2rem)",
                  marginBottom: "2.25rem",
                }}>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(1rem,2.4vw,1.125rem)",
                    color: INK_2, lineHeight: 1.95,
                    marginBottom: ".6em",
                  }}>
                    Dear {firstName},
                  </p>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(1rem,2.4vw,1.125rem)",
                    color: INK_2, lineHeight: 1.95,
                    whiteSpace: "pre-line",
                  }}>
                    {proposal.personal_note}
                  </p>
                </div>

                {/* Gold divider with diamond */}
                <div className="sp-line" style={{
                  position: "relative", height: 1, marginBottom: "2.25rem",
                  background: `linear-gradient(90deg, transparent, ${GOLD_L} 40%, ${GOLD_L} 60%, transparent)`,
                }}>
                  <div aria-hidden style={{
                    position: "absolute", left: "50%", top: "50%",
                    transform: "translate(-50%,-50%) rotate(45deg)",
                    width: 8, height: 8, background: GOLD_L,
                  }} />
                </div>

                {/* What this means — two event cards */}
                <div className="sp-4" style={{ marginBottom: "2.25rem" }}>
                  <p style={{
                    fontFamily: BF, fontSize: ".50rem", letterSpacing: ".30em",
                    textTransform: "uppercase", color: cfg.accent,
                    fontWeight: 700, marginBottom: "1rem",
                  }}>
                    What this means for you
                  </p>

                  {/* Duty statement */}
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(.92rem,2.1vw,1.05rem)",
                    color: INK_2, lineHeight: 1.85,
                    marginBottom: "1.25rem",
                  }}>
                    {cfg.duty}
                  </p>

                  {/* Two event chips */}
                  <div style={{ display: "grid", gap: ".75rem", gridTemplateColumns: "1fr 1fr" }}>
                    {[
                      {
                        time: "3:00 PM",
                        name: "Holy Matrimony",
                        venue: "Divine Mercy Church",
                        color: ROSE,
                        bg: "rgba(190,45,69,.05)",
                        bd: "rgba(190,45,69,.14)",
                        icon: (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ROSE} strokeWidth="1.6" aria-hidden>
                            <path d="M12 2v4M8 6l4-4 4 4M3 12h18M5 12v8a2 2 0 002 2h10a2 2 0 002-2v-8"/>
                          </svg>
                        ),
                      },
                      {
                        time: "6:00 PM",
                        name: "Shoreline Reception",
                        venue: "Blue Bay Beach Resort",
                        color: GOLD,
                        bg: "rgba(168,120,8,.05)",
                        bd: "rgba(168,120,8,.14)",
                        icon: (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" aria-hidden>
                            <path d="M2 14s1-1 4-1 5 2 8 2 4-1 4-1v6H2z"/>
                            <path d="M2 10s3-2 6-1 4 2 7 1 5-2 7-1"/>
                          </svg>
                        ),
                      },
                    ].map(({ time, name, venue, color, bg, bd, icon }) => (
                      <div key={name} style={{
                        padding: ".875rem 1rem", borderRadius: 14,
                        background: bg, border: `1px solid ${bd}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: ".4rem" }}>
                          {icon}
                          <p style={{ fontFamily: BF, fontSize: ".56rem", fontWeight: 700, color, letterSpacing: ".14em", textTransform: "uppercase" }}>
                            {time}
                          </p>
                        </div>
                        <p style={{ fontFamily: DF, fontSize: ".95rem", fontWeight: 600, color: INK, lineHeight: 1.2, marginBottom: ".2rem" }}>
                          {name}
                        </p>
                        <p style={{ fontFamily: BF, fontSize: ".68rem", color: INK_3, lineHeight: 1.4 }}>
                          {venue}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date + city chips */}
                <div className="sp-5" style={{
                  display: "flex", flexWrap: "wrap", gap: ".5rem",
                  marginBottom: "2.25rem",
                }}>
                  {[
                    { label: `${brideFirst} & ${groomFirst}`, rose: true  },
                    { label: "20 May 2026",                   rose: false },
                    { label: "Chennai, India",                rose: false },
                  ].map(({ label, rose }) => (
                    <span key={label} style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "5px 14px", borderRadius: 999,
                      background: rose ? "rgba(190,45,69,.06)" : "rgba(168,120,8,.06)",
                      border: `1px solid ${rose ? "rgba(190,45,69,.14)" : "rgba(168,120,8,.14)"}`,
                      fontFamily: BF, fontSize: ".68rem", fontWeight: 600,
                      color: rose ? ROSE : GOLD, letterSpacing: ".04em",
                    }}>
                      {label}
                    </span>
                  ))}
                </div>

                {/* Signature */}
                <div className="sp-6" style={{
                  display: "flex", alignItems: "center",
                  gap: "clamp(.75rem,2vw,1.25rem)",
                  marginBottom: "2.5rem", paddingBottom: "2rem",
                  borderBottom: `1px solid ${PAPER_2}`,
                }}>
                  {/* Flourish */}
                  <svg aria-hidden width="32" height="20" viewBox="0 0 32 20" fill="none">
                    <path d="M2 18 C8 8, 16 2, 30 10" stroke="rgba(190,45,69,.35)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  </svg>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic", fontWeight: 400,
                    fontSize: "clamp(.95rem,2.2vw,1.1rem)",
                    color: INK_3, letterSpacing: ".01em",
                  }}>
                    With all my love, {cfg.from}
                  </p>
                </div>

                {/* Response note */}
                <div className="sp-7" style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block", marginBottom: ".625rem",
                    fontFamily: BF, fontSize: ".50rem", letterSpacing: ".28em",
                    textTransform: "uppercase", color: INK_3, fontWeight: 700,
                  }}>
                    Your reply <span style={{ fontWeight: 400, color: INK_4 }}>(optional)</span>
                  </label>
                  <textarea
                    className="sp-textarea"
                    placeholder={`Dear ${cfg.from}, I would be honoured…`}
                    value={responseNote}
                    onChange={e => setResponseNote(e.target.value)}
                    disabled={state === "submitting"}
                  />
                </div>

                {/* Error */}
                {error && (
                  <p style={{
                    padding: "10px 16px", borderRadius: 12, marginBottom: "1.25rem",
                    background: "#fef2f2", border: "1px solid #fca5a5",
                    color: "#b91c1c", fontSize: ".82rem", fontFamily: BF,
                  }}>
                    {error}
                  </p>
                )}

                {/* CTAs */}
                <div className="sp-8" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <button
                    type="button"
                    className="sp-accept"
                    onClick={handleAccept}
                    disabled={state === "submitting"}
                    style={{ opacity: state === "submitting" ? .7 : 1 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="rgba(255,255,255,.90)" strokeWidth="1.8" fill="rgba(255,255,255,.15)" />
                    </svg>
                    {state === "submitting" ? "Sending your answer…" : "Yes — with all my heart"}
                  </button>

                  <button
                    type="button"
                    className="sp-decline"
                    onClick={handleDecline}
                    disabled={state === "submitting"}
                  >
                    I need to respectfully decline
                  </button>
                </div>

              </div>

              {/* Bottom stripe */}
              <div style={{
                height: 3,
                background: `linear-gradient(90deg, transparent, rgba(190,45,69,.42) 30%, rgba(201,150,10,.52) 50%, rgba(190,45,69,.42) 70%, transparent)`,
              }} />
            </article>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STATE: ACCEPTED
        ══════════════════════════════════════════════════════════════ */}
        {state === "accepted" && (
          <div style={{ width: "100%", maxWidth: 540, textAlign: "center" }}>

            {/* Confetti */}
            {Array.from({ length: 28 }, (_, i) => (
              <div key={i} aria-hidden style={{
                position: "fixed",
                left: `${4 + (i * 3.4) % 92}%`,
                top: `${-20 - (i % 5) * 12}px`,
                width: `${5 + (i % 5) * 2}px`,
                height: `${5 + (i % 5) * 2}px`,
                borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0",
                background: i % 4 === 0 ? ROSE : i % 4 === 1 ? GOLD_L : i % 4 === 2 ? ROSE_MID : GOLD_PALE,
                animation: `sp-confetti ${2.2 + (i % 6) * .35}s ${i * .07}s ease-in forwards`,
                pointerEvents: "none", zIndex: 30,
              }} />
            ))}

            {/* Couple eyebrow */}
            <div className="sp-0" style={{
              display: "flex", alignItems: "center", gap: 14,
              justifyContent: "center", marginBottom: "2.5rem",
            }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${ROSE_MID})` }} />
              <span style={{
                fontFamily: BF, fontSize: ".44rem", letterSpacing: ".54em",
                textTransform: "uppercase", color: ROSE, fontWeight: 700,
              }}>
                {brideFirst} &amp; {groomFirst}
              </span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${ROSE_MID})` }} />
            </div>

            {/* The celebratory seal — smaller, stamped feel */}
            <div className="sp-1" style={{
              display: "flex", justifyContent: "center",
              marginBottom: "1.75rem",
              animation: "sp-stamp .65s .1s cubic-bezier(.34,1.56,.64,1) both",
            }}>
              <WaxSeal size={100} />
            </div>

            {/* Headline */}
            <h1 className="sp-2" style={{
              fontFamily: DF, fontWeight: 600,
              fontSize: "clamp(2.25rem,7vw,3.5rem)",
              color: INK, lineHeight: 1.05,
              letterSpacing: "-.02em", marginBottom: ".875rem",
            }}>
              Welcome to the squad.
            </h1>

            {/* Subline */}
            <p className="sp-3" style={{
              fontFamily: DF, fontStyle: "italic",
              fontSize: "clamp(1rem,2.5vw,1.2rem)",
              color: INK_2, lineHeight: 1.88,
              marginBottom: "2rem",
            }}>
              {firstName}, you&apos;ve said yes — and that means the world to {cfg.from}.
              Your place beside them on 20 May is now sealed.
            </p>

            {/* What happens next — timeline */}
            <div className="sp-4" style={{
              background: "#FFFFFF",
              border: "1px solid rgba(190,45,69,.09)",
              borderRadius: 18,
              padding: "1.375rem 1.625rem",
              marginBottom: "2rem",
              textAlign: "left",
              boxShadow: "0 2px 16px rgba(18,11,14,.06)",
            }}>
              <p style={{
                fontFamily: BF, fontSize: ".50rem", letterSpacing: ".30em",
                textTransform: "uppercase", color: cfg.accent,
                fontWeight: 700, marginBottom: "1.125rem",
              }}>
                What happens next
              </p>
              {[
                { step: "1", text: `Complete your profile — a 2-minute form for ${cfg.from} to know everything needed for the day.`, done: false },
                { step: "2", text: "Access the private vault — your Squad Hub, day timeline, and all wedding details.", done: false },
                { step: "3", text: `Walk beside ${proposal.squad_role === "bridesmaid" ? brideFirst : groomFirst} on 20 May 2026.`, done: false },
              ].map(({ step, text }) => (
                <div key={step} style={{
                  display: "flex", gap: ".875rem", alignItems: "flex-start",
                  marginBottom: step === "3" ? 0 : ".875rem",
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: ROSE_PALE, border: `1.5px solid rgba(190,45,69,.22)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: BF, fontSize: ".62rem", fontWeight: 700, color: ROSE,
                  }}>
                    {step}
                  </div>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(.88rem,2vw,.98rem)",
                    color: INK_2, lineHeight: 1.7, paddingTop: 3,
                  }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>

            {/* Profile CTA — primary */}
            <div className="sp-5">
              <a
                href={`/squad/${proposal.proposal_code}/signup`}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 10,
                  width: "100%", padding: "18px 24px",
                  borderRadius: 999, textDecoration: "none", color: "#fff",
                  background: `linear-gradient(135deg,${ROSE_L} 0%,${ROSE} 52%,${ROSE_H} 100%)`,
                  fontFamily: BF, fontSize: ".82rem",
                  fontWeight: 700, letterSpacing: ".22em",
                  textTransform: "uppercase",
                  boxShadow: "0 8px 32px rgba(190,45,69,.32),0 2px 8px rgba(190,45,69,.16)",
                  transition: "filter .2s,transform .2s",
                  marginBottom: ".875rem",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.cssText += "filter:brightness(1.09);transform:translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.filter = ""; (e.currentTarget as HTMLAnchorElement).style.transform = ""; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,.9)" strokeWidth="1.8" fill="none" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(255,255,255,.9)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                </svg>
                Complete your profile
              </a>

              {/* Skip link if vault URL available */}
              {vaultUrl && (
                <a
                  href={vaultUrl}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "100%", padding: "12px",
                    borderRadius: 999, textDecoration: "none",
                    background: "transparent",
                    border: `1.5px solid rgba(190,45,69,.16)`,
                    fontFamily: BF, fontSize: ".68rem",
                    fontWeight: 500, letterSpacing: ".16em",
                    textTransform: "uppercase", color: INK_4,
                    transition: "border-color .2s,color .2s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(190,45,69,.36)"; (e.currentTarget as HTMLAnchorElement).style.color = ROSE; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(190,45,69,.16)"; (e.currentTarget as HTMLAnchorElement).style.color = INK_4; }}
                >
                  Skip for now — go straight to the vault
                </a>
              )}
            </div>

            {/* Role badge */}
            <div className="sp-6" style={{ marginTop: "2rem" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 20px", borderRadius: 999,
                background: cfg.accentPale, border: `1px solid ${cfg.accentBd}`,
                fontFamily: BF, fontSize: ".64rem", fontWeight: 700,
                color: cfg.accent, letterSpacing: ".14em", textTransform: "uppercase",
              }}>
                ✦ {cfg.label} · {brideFirst} &amp; {groomFirst}
              </span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STATE: DECLINED
        ══════════════════════════════════════════════════════════════ */}
        {state === "declined" && (
          <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
            <div className="sp-0" style={{ marginBottom: "1.75rem" }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden style={{ margin: "0 auto" }}>
                <circle cx="32" cy="32" r="30" stroke={ROSE_MID} strokeWidth="1.5" fill={ROSE_PALE} />
                <path d="M20 32 Q32 22 44 32" stroke={ROSE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="sp-1" style={{
              fontFamily: DF, fontWeight: 600,
              fontSize: "clamp(1.75rem,5vw,2.5rem)",
              color: INK, lineHeight: 1.1, marginBottom: "1rem",
            }}>
              Thank you for your honesty.
            </h2>
            <p className="sp-2" style={{
              fontFamily: DF, fontStyle: "italic",
              fontSize: "clamp(.95rem,2.2vw,1.1rem)",
              color: INK_2, lineHeight: 1.88,
            }}>
              {cfg.from} understands, and holds no less love for you.
              Your presence at the wedding as a guest is gift enough.
            </p>
          </div>
        )}

      </div>
    </>
  );
}

// Helper — CSS clamp values without CSS string (just uses min/max for SSR safety)
function clamp(min: number, max: number) {
  return typeof window !== "undefined" ? Math.min(Math.max(window.innerWidth * 0.26, min), max) : max;
}
