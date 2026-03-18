"use client";

/**
 * SquadProposalClient
 *
 * The entire proposal experience — sealed letter, personal message,
 * the ask, and the accept/decline interaction.
 *
 * Design language: "The Private Letter"
 * — Not a wedding invitation. Not a platform. A note from one person to another.
 * — Cream paper, left-border rule, italic serif, a wax seal as the gating element.
 * — Three states: sealed → opened → responded
 */

import { useState } from "react";
import type { SquadProposal } from "@/modules/squad/squad-system";

// ── Platform tokens ─────────────────────────────────────────────────────────
const ROSE      = "#BE2D45";
const ROSE_H    = "#A42539";
const ROSE_L    = "#D44860";
const ROSE_PALE = "#FBEBEE";
const ROSE_MID  = "#F0BEC6";
const GOLD      = "#A87808";
const GOLD_L    = "#C9960A";
const GOLD_PALE = "#FBF2DC";
const INK       = "#120B0E";
const INK_2     = "#362030";
const INK_3     = "#72504A";
const INK_4     = "#A88888";
const BG        = "#FDFAF7";
const BG_LINEN  = "#F1E9E0";
const BG_WARM   = "#F8F3EE";

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

// Role display config
const ROLE_CONFIG = {
  bridesmaid: {
    label:      "Bridesmaid",
    from:       "bride",
    icon:       "✦",
    accent:     ROSE,
    accentPale: ROSE_PALE,
    accentMid:  ROSE_MID,
    accentBd:   "rgba(190,45,69,.22)",
    ask:        "Will you be my bridesmaid?",
    duty:       "Stand beside the bride on the most sacred day of her life. Walk down the aisle. Hold the bouquet. Be the steady presence when words fail.",
    gradient:   "linear-gradient(135deg, #1A0308 0%, #2C0910 55%, #180408 100%)",
  },
  groomsman: {
    label:      "Groomsman",
    from:       "groom",
    icon:       "✦",
    accent:     GOLD,
    accentPale: GOLD_PALE,
    accentMid:  "rgba(168,120,8,.35)",
    accentBd:   "rgba(168,120,8,.22)",
    ask:        "Will you be my groomsman?",
    duty:       "Stand with the groom as he makes the most important promise of his life. Walk in. Hold the rings. Be the calm in the ceremony.",
    gradient:   "linear-gradient(135deg, #0D0A00 0%, #1C1500 55%, #0A0800 100%)",
  },
} as const;

interface Props {
  proposal: SquadProposal;
  brideName: string;
  groomName: string;
}

type State = "sealed" | "opened" | "accepted" | "declined" | "submitting";

export function SquadProposalClient({ proposal, brideName, groomName }: Props) {
  const [state, setState] = useState<State>(
    proposal.accepted === true  ? "accepted" :
    proposal.accepted === false ? "declined" :
    "sealed"
  );
  const [sealBurst,    setSealBurst]    = useState(false);
  const [responseNote, setResponseNote] = useState("");
  const [error,        setError]        = useState<string | null>(null);

  const cfg = ROLE_CONFIG[proposal.squad_role];
  const firstName = proposal.name.split(" ")[0]!;
  const senderFirst = (proposal.squad_role === "bridesmaid" ? brideName : groomName).split(" ")[0]!;
  const brideFirst  = brideName.split(" ")[0]!;
  const groomFirst  = groomName.split(" ")[0]!;
  const initials    = `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase();

  // ── Open the seal ──────────────────────────────────────────────────────────
  async function handleOpen() {
    setSealBurst(true);
    // Mark opened in DB (fire-and-forget)
    fetch(`/api/squad/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: proposal.proposal_code, response: "opened" }),
    }).catch(() => undefined);

    setTimeout(() => setState("opened"), 640);
  }

  // ── Accept ─────────────────────────────────────────────────────────────────
  async function handleAccept() {
    setState("submitting");
    setError(null);
    try {
      const res = await fetch("/api/squad/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: proposal.proposal_code,
          response: "accept",
          note: responseNote || undefined,
        }),
      });
      const json = (await res.json()) as { success: boolean; message?: string };
      if (!json.success) throw new Error(json.message ?? "Something went wrong.");
      setState("accepted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("opened");
    }
  }

  // ── Decline ────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes sp-fade    {from{opacity:0}to{opacity:1}}
        @keyframes sp-rise    {from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sp-sinkIn  {from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sp-scale   {from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
        @keyframes sp-lineGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes sp-burst   {0%{transform:scale(1);opacity:1}30%{transform:scale(1.18) rotate(-4deg);opacity:.85}60%{transform:scale(.75) rotate(8deg);opacity:.4}100%{transform:scale(0) rotate(22deg);opacity:0}}
        @keyframes sp-ring1   {0%{transform:scale(0);opacity:.65}100%{transform:scale(3.4);opacity:0}}
        @keyframes sp-ring2   {0%{transform:scale(0);opacity:.40}100%{transform:scale(5.0);opacity:0}}
        @keyframes sp-pulse   {0%,100%{box-shadow:0 0 0 0 rgba(168,120,8,0),0 8px 28px rgba(60,30,0,.28)}50%{box-shadow:0 0 0 14px rgba(168,120,8,.12),0 12px 36px rgba(60,30,0,.35)}}
        @keyframes sp-confetti-fall {
          0%  {transform:translateY(-20px) rotate(0deg);opacity:1}
          100%{transform:translateY(120vh) rotate(720deg);opacity:0}
        }
        @keyframes sp-celebrate{0%,100%{transform:scale(1)}40%{transform:scale(1.04)}70%{transform:scale(.98)}}

        .sp-seal-idle  {animation:sp-pulse 3.8s 1s ease-in-out infinite}
        .sp-seal-burst {animation:sp-burst .55s ease forwards}

        .sp-in-0{opacity:0;animation:sp-fade .7s .0s ease forwards}
        .sp-in-1{opacity:0;animation:sp-rise .9s .12s cubic-bezier(.16,1,.3,1) forwards}
        .sp-in-2{opacity:0;animation:sp-rise .9s .26s cubic-bezier(.16,1,.3,1) forwards}
        .sp-in-3{opacity:0;animation:sp-rise .9s .40s cubic-bezier(.16,1,.3,1) forwards}
        .sp-in-4{opacity:0;animation:sp-rise .8s .56s cubic-bezier(.16,1,.3,1) forwards}
        .sp-in-5{opacity:0;animation:sp-rise .8s .70s cubic-bezier(.16,1,.3,1) forwards}
        .sp-in-6{opacity:0;animation:sp-rise .8s .84s cubic-bezier(.16,1,.3,1) forwards}
        .sp-in-7{opacity:0;animation:sp-rise .75s 1.00s cubic-bezier(.16,1,.3,1) forwards}
        .sp-line {opacity:0;animation:sp-lineGrow .9s .48s ease forwards;transform-origin:center}

        .sp-accept-btn {
          display:inline-flex;align-items:center;justify-content:center;gap:10px;
          padding:16px 36px;border-radius:999px;border:none;cursor:pointer;
          font-family:${BF};font-size:.78rem;font-weight:700;
          letter-spacing:.24em;text-transform:uppercase;
          transition:filter .2s ease,transform .2s ease,box-shadow .2s ease;
          position:relative;overflow:hidden;
        }
        .sp-accept-btn:hover{filter:brightness(1.08);transform:translateY(-2px)}
        .sp-accept-btn::after{
          content:'';position:absolute;inset:0;border-radius:999px;
          background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.22) 50%,transparent 65%);
          background-size:220% 100%;background-position:220% 0;
          animation:sp-sweep 3s 1.5s ease infinite;pointer-events:none;
        }
        @keyframes sp-sweep{0%{background-position:220% 0}42%{background-position:-220% 0}100%{background-position:-220% 0}}

        .sp-decline-btn {
          display:inline-flex;align-items:center;justify-content:center;
          padding:12px 28px;border-radius:999px;cursor:pointer;
          font-family:${BF};font-size:.68rem;font-weight:500;
          letter-spacing:.18em;text-transform:uppercase;
          background:transparent;border:1.5px solid rgba(18,11,14,.14);
          color:${INK_4};transition:all .2s ease;
        }
        .sp-decline-btn:hover{border-color:rgba(190,45,69,.28);color:${ROSE}}

        .sp-textarea {
          width:100%;padding:14px 16px;
          background:${BG_WARM};border:1.5px solid rgba(190,45,69,.16);
          border-radius:14px;resize:vertical;min-height:100px;
          font-family:${DF};font-style:italic;font-size:1rem;
          color:${INK};line-height:1.8;outline:none;
          transition:border-color .2s ease;
        }
        .sp-textarea:focus{border-color:${ROSE}}
        .sp-textarea::placeholder{color:${INK_4}}
      `}</style>

      {/* ════════════════════════════════════════════════════════════════════
          FULL-PAGE WRAPPER
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        minHeight: "100dvh",
        background: BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(2rem,6vh,5rem) clamp(1rem,4vw,2rem)",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Background ambient blooms */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 48% at 12% 18%, rgba(190,45,69,.04) 0%, transparent 55%),
            radial-gradient(ellipse 50% 44% at 90% 84%, rgba(168,120,8,.04) 0%, transparent 50%)
          `,
        }} />

        {/* ── STATE: SEALED ── */}
        {state === "sealed" && (
          <div style={{ width: "100%", maxWidth: 520, textAlign: "center" }}>

            {/* Eyebrow */}
            <div className="sp-in-0" style={{
              display: "flex", alignItems: "center", gap: 12,
              justifyContent: "center", marginBottom: "2.5rem",
            }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${ROSE_MID})` }} />
              <span style={{
                fontFamily: BF, fontSize: ".46rem", letterSpacing: ".52em",
                textTransform: "uppercase", color: ROSE, fontWeight: 700,
              }}>
                {brideFirst} &amp; {groomFirst}
              </span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${ROSE_MID})` }} />
            </div>

            {/* Addressed to */}
            <div className="sp-in-1" style={{ marginBottom: "clamp(2rem,4vh,3.5rem)" }}>
              <p style={{
                fontFamily: BF, fontSize: ".5rem", letterSpacing: ".44em",
                textTransform: "uppercase", color: INK_3, fontWeight: 600,
                marginBottom: ".5rem",
              }}>
                A private letter for
              </p>
              <p style={{
                fontFamily: DF, fontWeight: 600,
                fontSize: "clamp(2rem,6vw,2.75rem)",
                color: INK, letterSpacing: ".02em", lineHeight: 1.1,
              }}>
                {proposal.name}
              </p>
            </div>

            {/* WAX SEAL */}
            <div className="sp-in-2" style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "1.25rem",
              marginBottom: "clamp(2rem,4vh,3rem)",
            }}>
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>

                {/* Burst rings */}
                {sealBurst && (
                  <>
                    <div aria-hidden style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      border: `1.5px solid ${cfg.accent}`,
                      animation: "sp-ring1 .55s ease forwards", pointerEvents: "none",
                    }} />
                    <div aria-hidden style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      border: `1px solid rgba(168,120,8,.5)`,
                      animation: "sp-ring2 .68s .08s ease forwards", pointerEvents: "none",
                    }} />
                  </>
                )}

                {!sealBurst && (
                  <div
                    className="sp-seal-idle"
                    onClick={handleOpen}
                    style={{
                      width: "clamp(140px,26vw,188px)",
                      height: "clamp(140px,26vw,188px)",
                      cursor: "pointer", position: "relative",
                    }}
                  >
                    {/* SVG wax seal */}
                    <svg
                      viewBox="0 0 160 160"
                      style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
                      aria-hidden
                    >
                      <defs>
                        <radialGradient id="spGold" cx="38%" cy="34%" r="68%">
                          <stop offset="0%"   stopColor="#F5D47A" />
                          <stop offset="35%"  stopColor="#C9960A" />
                          <stop offset="68%"  stopColor="#9E7205" />
                          <stop offset="100%" stopColor="#5C3D01" />
                        </radialGradient>
                        <radialGradient id="spSheen" cx="34%" cy="28%" r="52%">
                          <stop offset="0%"   stopColor="rgba(255,248,210,.32)" />
                          <stop offset="100%" stopColor="rgba(255,248,210,0)" />
                        </radialGradient>
                      </defs>
                      <g style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,.55)) drop-shadow(0 3px 8px rgba(0,0,0,.35))" }}>
                        <circle cx="80" cy="80" r="74" fill="url(#spGold)" />
                        {Array.from({ length: 16 }, (_, i) => {
                          const a = (i / 16) * Math.PI * 2;
                          return (
                            <line key={i}
                              x1={80 + 64 * Math.cos(a)} y1={80 + 64 * Math.sin(a)}
                              x2={80 + 74 * Math.cos(a)} y2={80 + 74 * Math.sin(a)}
                              stroke="rgba(60,35,0,.28)" strokeWidth="1.4"
                            />
                          );
                        })}
                        <circle cx="80" cy="80" r="73" fill="none" stroke="rgba(255,240,170,.20)" strokeWidth="1" />
                        <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(60,35,0,.26)" strokeWidth="1.3" />
                        <circle cx="80" cy="80" r="53" fill="none" stroke="rgba(60,35,0,.16)" strokeWidth=".8" />
                        <circle cx="80" cy="80" r="74" fill="url(#spSheen)" />
                      </g>
                    </svg>
                    {/* Initials */}
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{
                        fontFamily: DF, fontWeight: 600,
                        fontSize: "clamp(2.4rem,6vw,4rem)",
                        letterSpacing: ".14em", color: "rgba(28,14,0,.80)",
                        lineHeight: 1, marginLeft: ".14em",
                        textShadow: "0 1px 0 rgba(255,240,160,.45), 0 -1px 3px rgba(0,0,0,.28)",
                      }}>
                        {initials}
                      </span>
                    </div>
                  </div>
                )}

                {sealBurst && (
                  <div
                    className="sp-seal-burst"
                    style={{
                      width: "clamp(140px,26vw,188px)",
                      height: "clamp(140px,26vw,188px)",
                      position: "relative",
                    }}
                  >
                    <svg viewBox="0 0 160 160" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden>
                      <defs>
                        <radialGradient id="spGold2" cx="38%" cy="34%" r="68%">
                          <stop offset="0%" stopColor="#F5D47A" />
                          <stop offset="100%" stopColor="#5C3D01" />
                        </radialGradient>
                      </defs>
                      <circle cx="80" cy="80" r="74" fill="url(#spGold2)" />
                    </svg>
                  </div>
                )}
              </div>

              <p style={{
                fontFamily: BF, fontSize: ".48rem", letterSpacing: ".32em",
                textTransform: "uppercase", color: INK_4, fontWeight: 500,
              }}>
                {sealBurst ? "Opening…" : "Press the seal to open"}
              </p>
            </div>

            {/* Subtitle */}
            <p className="sp-in-3" style={{
              fontFamily: DF, fontStyle: "italic", fontWeight: 300,
              fontSize: "clamp(.95rem,2.2vw,1.1rem)",
              color: INK_3, letterSpacing: ".02em", lineHeight: 1.75,
            }}>
              {senderFirst} has written you a private letter.
            </p>

          </div>
        )}

        {/* ── STATE: OPENED ── */}
        {(state === "opened" || state === "submitting") && (
          <div style={{ width: "100%", maxWidth: 600 }}>

            {/* ─── THE LETTER ─── */}
            <article style={{
              background: "#FFFFFF",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: `
                0 1px 3px rgba(18,11,14,.04),
                0 4px 16px rgba(18,11,14,.07),
                0 24px 60px rgba(18,11,14,.09),
                0 4px 20px rgba(190,45,69,.05)
              `,
              border: `1px solid rgba(190,45,69,.08)`,
            }}>

              {/* Dark header — role identity */}
              <div style={{
                position: "relative", overflow: "hidden",
                background: cfg.gradient,
                padding: "clamp(2rem,5vw,2.75rem)",
              }}>
                {/* Subtle motif overlay for bridesmaid (arch) */}
                {proposal.squad_role === "bridesmaid" && (
                  <svg aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} width="100%" height="52" viewBox="0 0 500 52" preserveAspectRatio="none">
                    <path d="M0 52 Q250 0 500 52" fill="none" stroke="rgba(240,190,198,.07)" strokeWidth="2"/>
                  </svg>
                )}
                {/* Wave motif for groomsman */}
                {proposal.squad_role === "groomsman" && (
                  <svg aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} width="100%" height="52" viewBox="0 0 500 52" preserveAspectRatio="none">
                    <path d="M0 36 Q62 20 125 36 Q188 52 250 36 Q312 20 375 36 Q438 52 500 36 L500 52 L0 52Z" fill="rgba(232,196,80,.05)"/>
                  </svg>
                )}

                {/* Top hairline */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, transparent, ${cfg.accent} 30%, ${cfg.accent} 70%, transparent)`,
                }} />

                {/* Role label + icon */}
                <div className="sp-in-0" style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `rgba(${proposal.squad_role === "bridesmaid" ? "190,45,69" : "168,120,8"},.18)`,
                    border: `1px solid rgba(${proposal.squad_role === "bridesmaid" ? "190,45,69" : "168,120,8"},.28)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {proposal.squad_role === "bridesmaid" ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                        <circle cx="10" cy="5" r="3" stroke="rgba(240,190,198,.80)" strokeWidth="1.5" fill="none"/>
                        <path d="M4 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="rgba(240,190,198,.80)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                        <circle cx="10" cy="5" r="3" stroke="rgba(232,196,80,.80)" strokeWidth="1.5" fill="none"/>
                        <path d="M4 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="rgba(232,196,80,.80)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                        <path d="M14 8l3-3m0 0l-2 0m2 0l0 2" stroke="rgba(232,196,80,.60)" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p style={{
                      fontFamily: BF, fontSize: ".48rem", letterSpacing: ".40em",
                      textTransform: "uppercase",
                      color: `rgba(${proposal.squad_role === "bridesmaid" ? "240,190,198" : "232,196,80"},.65)`,
                      fontWeight: 700, marginBottom: ".25rem",
                    }}>
                      A personal proposal from {senderFirst}
                    </p>
                    <h2 style={{
                      fontFamily: DF, fontWeight: 600,
                      fontSize: "clamp(1.6rem,5vw,2.2rem)",
                      color: "rgba(255,252,248,.94)", lineHeight: 1.1,
                      letterSpacing: "-.01em",
                    }}>
                      For {firstName}
                    </h2>
                  </div>
                </div>

                {/* The ask — large */}
                <p className="sp-in-1" style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1.75rem,5vw,2.75rem)",
                  color: "rgba(255,252,248,.88)",
                  lineHeight: 1.2, letterSpacing: ".01em",
                }}>
                  {cfg.ask}
                </p>
              </div>

              {/* ── LETTER BODY ── */}
              <div style={{ padding: "clamp(1.75rem,5vw,2.5rem)" }}>

                {/* Personal note — the heart of the proposal */}
                <div className="sp-in-2" style={{
                  borderLeft: `3px solid rgba(190,45,69,.25)`,
                  paddingLeft: "clamp(1.125rem,3vw,1.875rem)",
                  marginBottom: "2rem",
                }}>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(.95rem,2.2vw,1.1rem)",
                    color: INK, lineHeight: 1.95,
                    marginBottom: ".5em",
                  }}>
                    Dear {firstName},
                  </p>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(.95rem,2.2vw,1.1rem)",
                    color: INK_2, lineHeight: 1.95,
                    whiteSpace: "pre-line",
                  }}>
                    {proposal.personal_note}
                  </p>
                </div>

                {/* Gold rule */}
                <div className="sp-line" style={{
                  height: 1, marginBottom: "1.75rem",
                  background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)`,
                }} />

                {/* What the role means */}
                <div className="sp-in-3" style={{
                  padding: "1rem 1.25rem",
                  borderRadius: 14,
                  background: cfg.accentPale,
                  border: `1px solid ${cfg.accentBd}`,
                  marginBottom: "2rem",
                }}>
                  <p style={{
                    fontFamily: BF, fontSize: ".50rem", letterSpacing: ".28em",
                    textTransform: "uppercase", color: cfg.accent,
                    fontWeight: 700, marginBottom: ".5rem",
                  }}>
                    What this means
                  </p>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(.9rem,2vw,1rem)",
                    color: INK_2, lineHeight: 1.80,
                  }}>
                    {cfg.duty}
                  </p>
                </div>

                {/* Wedding details chips */}
                <div className="sp-in-4" style={{
                  display: "flex", flexWrap: "wrap", gap: ".5rem",
                  marginBottom: "2rem",
                }}>
                  {[
                    { label: `${brideFirst} & ${groomFirst}`, rose: true  },
                    { label: "20 May 2026",                   rose: false },
                    { label: "Chennai",                       rose: false },
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
                <div className="sp-in-5" style={{
                  display: "flex", alignItems: "center",
                  gap: "clamp(.75rem,2vw,1.25rem)",
                  marginBottom: "2.5rem",
                }}>
                  <div style={{
                    width: "min(36px,9%)", height: 1,
                    background: `linear-gradient(to right, rgba(190,45,69,.38), transparent)`,
                    flexShrink: 0,
                  }} />
                  <p style={{
                    fontFamily: DF, fontStyle: "italic", fontWeight: 400,
                    fontSize: "clamp(.9rem,2vw,1.05rem)",
                    color: INK_3, letterSpacing: ".02em",
                  }}>
                    With love, {senderFirst}
                  </p>
                </div>

                {/* Optional response note */}
                <div className="sp-in-6" style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block", marginBottom: ".625rem",
                    fontFamily: BF, fontSize: ".50rem", letterSpacing: ".28em",
                    textTransform: "uppercase", color: INK_3, fontWeight: 600,
                  }}>
                    Your reply <span style={{ color: INK_4, fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    className="sp-textarea"
                    placeholder={`Dear ${senderFirst}, I would be honoured…`}
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
                    color: "#b91c1c", fontSize: ".8rem", fontFamily: BF,
                  }}>
                    {error}
                  </p>
                )}

                {/* CTA buttons */}
                <div className="sp-in-7" style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "1rem",
                }}>
                  <button
                    type="button"
                    className="sp-accept-btn"
                    onClick={handleAccept}
                    disabled={state === "submitting"}
                    style={{
                      width: "100%",
                      background: `linear-gradient(135deg, ${ROSE_L} 0%, ${ROSE} 52%, ${ROSE_H} 100%)`,
                      color: "#fff",
                      boxShadow: "0 8px 28px rgba(190,45,69,.32), 0 2px 8px rgba(190,45,69,.18)",
                      opacity: state === "submitting" ? .7 : 1,
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>✦</span>
                    {state === "submitting" ? "Sending…" : "Yes — I'm honoured to say yes"}
                  </button>

                  <button
                    type="button"
                    className="sp-decline-btn"
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
                background: "linear-gradient(90deg, transparent, rgba(190,45,69,.40) 30%, rgba(201,150,10,.50) 50%, rgba(190,45,69,.40) 70%, transparent)",
              }} />
            </article>
          </div>
        )}

        {/* ── STATE: ACCEPTED ── */}
        {state === "accepted" && (
          <div style={{ width: "100%", maxWidth: 520, textAlign: "center" }}>
            {/* Confetti dots — purely CSS */}
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} aria-hidden style={{
                position: "fixed",
                left: `${5 + (i * 5.5) % 92}%`,
                top: "-20px",
                width: `${6 + (i % 4) * 2}px`,
                height: `${6 + (i % 4) * 2}px`,
                borderRadius: i % 2 === 0 ? "50%" : "2px",
                background: i % 3 === 0 ? ROSE : i % 3 === 1 ? GOLD_L : ROSE_MID,
                animation: `sp-confetti-fall ${2.5 + (i % 5) * .4}s ${i * .12}s ease-in forwards`,
                pointerEvents: "none", zIndex: 20,
              }} />
            ))}

            {/* Eyebrow */}
            <div className="sp-in-0" style={{
              display: "flex", alignItems: "center", gap: 12,
              justifyContent: "center", marginBottom: "2.5rem",
            }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${ROSE_MID})` }} />
              <span style={{
                fontFamily: BF, fontSize: ".46rem", letterSpacing: ".52em",
                textTransform: "uppercase", color: ROSE, fontWeight: 700,
              }}>
                {brideFirst} &amp; {groomFirst}
              </span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${ROSE_MID})` }} />
            </div>

            {/* Celebratory mark */}
            <div className="sp-in-1" style={{
              fontSize: "4rem", marginBottom: "1.5rem", lineHeight: 1,
              animation: "sp-celebrate 1.2s .3s ease infinite",
              display: "inline-block",
            }}>
              ✦
            </div>

            <h1 className="sp-in-2" style={{
              fontFamily: DF, fontWeight: 600,
              fontSize: "clamp(2rem,7vw,3.25rem)",
              color: INK, lineHeight: 1.1,
              letterSpacing: "-.02em", marginBottom: "1rem",
            }}>
              Welcome to the squad.
            </h1>

            <p className="sp-in-3" style={{
              fontFamily: DF, fontStyle: "italic",
              fontSize: "clamp(1rem,2.4vw,1.2rem)",
              color: INK_2, lineHeight: 1.85,
              marginBottom: "2rem",
            }}>
              {firstName}, you&apos;ve said yes — and that means everything.{" "}
              {senderFirst} will be in touch soon with everything you need to know.
              Until then, know that your place beside them on 20 May is sealed.
            </p>

            <div className="sp-in-4" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 20px", borderRadius: 999,
              background: ROSE_PALE, border: `1px solid rgba(190,45,69,.18)`,
              fontFamily: BF, fontSize: ".66rem", fontWeight: 600,
              color: ROSE, letterSpacing: ".12em", textTransform: "uppercase",
            }}>
              {cfg.label} · {brideFirst} &amp; {groomFirst}
            </div>
          </div>
        )}

        {/* ── STATE: DECLINED ── */}
        {state === "declined" && (
          <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
            <div className="sp-in-0" style={{ marginBottom: "2rem", fontSize: "3rem" }}>🕊️</div>
            <h2 className="sp-in-1" style={{
              fontFamily: DF, fontWeight: 600,
              fontSize: "clamp(1.75rem,5vw,2.5rem)",
              color: INK, lineHeight: 1.1, marginBottom: "1rem",
            }}>
              Thank you for your honesty.
            </h2>
            <p className="sp-in-2" style={{
              fontFamily: DF, fontStyle: "italic",
              fontSize: "clamp(.95rem,2.2vw,1.1rem)",
              color: INK_2, lineHeight: 1.85,
            }}>
              {senderFirst} understands, and holds no less love for you.
              Your presence at the wedding as a guest is gift enough.
            </p>
          </div>
        )}

      </div>
    </>
  );
}
