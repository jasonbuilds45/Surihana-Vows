"use client";

/**
 * SquadCinematicIntro
 *
 * A private cinematic trailer shown to a bridesmaid / groomsman before they
 * see the sealed proposal letter.
 *
 * FLOW
 *   Phase 1 · TRAILER  — 5 scenes on a dark canvas, auto-advance ~14s
 *                         Each scene is role-specific (rose palette for
 *                         bridesmaid, gold palette for groomsman).
 *                         A "Skip" button is always visible after scene 1.
 *   Phase 2 · HANDOFF  — Full dark screen, couple names large, a single
 *                         glowing CTA: "Open your letter". Clicking it calls
 *                         onEnter() which the parent uses to unmount this
 *                         component and reveal SquadProposalClient.
 *
 * SCENES
 *   0  — The name (recipient), left-anchored, large
 *   1  — The couple's names split left/right across a divider
 *   2  — The date + both venue chips
 *   3  — Role-specific emotional statement (italic serif, centred)
 *   4  — "Something is waiting for you."  + letter icon fade-in
 *
 * DESIGN LANGUAGE
 *   — Same tokens and animation primitives as CinematicIntro.
 *   — Dark canvas (#0A0608) throughout — this is night before the ceremony.
 *   — Bridesmaid: rose accents. Groomsman: gold accents.
 *   — No audio (keeps it simple and always-safe).
 *   — Session-storage keyed to proposal_code so returning visitors skip
 *     straight to the proposal without replaying the trailer.
 */

import { useEffect, useRef, useState } from "react";
import { SkipForward } from "lucide-react";
import type { SquadProposal } from "@/modules/squad/squad-system";

// ── Tokens ────────────────────────────────────────────────────────────────
const ROSE      = "#BE2D45";
const ROSE_L    = "#D44860";
const ROSE_MID  = "#F0BEC6";
const GOLD      = "#A87808";
const GOLD_L    = "#C9960A";
const GOLD_MID  = "#E8C45A";
const INK_4     = "#A88888";
const VOID      = "#0A0608";
const VOID_2    = "#120608";

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

// ── Scene timing ──────────────────────────────────────────────────────────
const SCENE_HOLD  = [2800, 3000, 3200, 3000, 2800]; // ms per scene
const CROSSFADE   = 550;

interface Props {
  proposal:  SquadProposal;
  brideName: string;
  groomName: string;
  onEnter:   () => void; // called when guest taps "Open your letter"
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export function SquadCinematicIntro({ proposal, brideName, groomName, onEnter }: Props) {
  const cfg = proposal.squad_role === "bridesmaid"
    ? { accent: ROSE, accentL: ROSE_L, accentMid: ROSE_MID, accentRgb: "190,45,69",
        statement: "She chose you for a reason.\nSome roles are more than roles.",
        roleLabel: "Bridesmaid" }
    : { accent: GOLD, accentL: GOLD_L, accentMid: GOLD_MID, accentRgb: "168,120,8",
        statement: "He chose you for a reason.\nSome bonds are more than friendship.",
        roleLabel: "Groomsman" };

  const firstName  = proposal.name.split(" ")[0]!;
  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;

  type Phase = "trailer" | "handoff";
  const [mounted,   setMounted]   = useState(false);
  const [phase,     setPhase]     = useState<Phase>("trailer");
  const [scene,     setScene]     = useState(0);
  const [sceneVis,  setSceneVis]  = useState(true);
  const [leaving,   setLeaving]   = useState(false);
  const [handoffVis, setHandoffVis] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageKey = `surihana-squad-intro:${proposal.proposal_code}`;

  // ── Mount + session check ─────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem(storageKey) === "seen") {
        // Returning visitor — skip straight to proposal
        onEnter();
        return;
      }
      // Lock scroll for the duration of the trailer
      document.body.style.overflow    = "hidden";
      document.body.style.touchAction = "none";
    }
    return () => {
      document.body.style.overflow    = "";
      document.body.style.touchAction = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scene auto-advance ────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || phase !== "trailer") return;
    const hold = SCENE_HOLD[scene] ?? 2800;
    timer.current = setTimeout(() => {
      setSceneVis(false);
      setTimeout(() => {
        if (scene < SCENE_HOLD.length - 1) {
          setScene(s => s + 1);
          setSceneVis(true);
        } else {
          goToHandoff();
        }
      }, CROSSFADE);
    }, hold);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, phase, mounted]);

  // ── Transitions ───────────────────────────────────────────────────────
  function fadeOut(cb: () => void, ms = 900) {
    setLeaving(true);
    setTimeout(() => { setLeaving(false); cb(); }, ms);
  }

  function goToHandoff() {
    if (timer.current) clearTimeout(timer.current);
    setSceneVis(false);
    fadeOut(() => {
      setPhase("handoff");
      requestAnimationFrame(() => requestAnimationFrame(() => setHandoffVis(true)));
    }, 700);
  }

  function skipToHandoff() {
    if (timer.current) clearTimeout(timer.current);
    setSceneVis(false);
    fadeOut(goToHandoff, 500);
  }

  function handleEnter() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "seen");
      document.body.style.overflow    = "";
      document.body.style.touchAction = "";
    }
    onEnter();
  }

  if (!mounted) return <div style={{ minHeight: "100dvh", background: VOID }} />;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ── Keyframes ── */
        @keyframes sq-fade     {from{opacity:0}to{opacity:1}}
        @keyframes sq-in-left  {from{opacity:0;transform:translateX(-7vw)}to{opacity:1;transform:translateX(0)}}
        @keyframes sq-in-right {from{opacity:0;transform:translateX(7vw)} to{opacity:1;transform:translateX(0)}}
        @keyframes sq-in-up    {from{opacity:0;transform:translateY(2.5rem)}to{opacity:1;transform:translateY(0)}}
        @keyframes sq-line-x   {from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes sq-line-y   {from{transform:scaleY(0)}to{transform:scaleY(1)}}
        @keyframes sq-letter-float {
          0%,100%{transform:translateY(0) rotate(-1deg)}
          50%    {transform:translateY(-10px) rotate(1deg)}
        }
        @keyframes sq-letter-glow {
          0%,100%{box-shadow:0 0 0 0 rgba(${cfg.accentRgb},0),0 8px 32px rgba(0,0,0,.45)}
          50%    {box-shadow:0 0 0 18px rgba(${cfg.accentRgb},.10),0 12px 40px rgba(0,0,0,.55)}
        }
        @keyframes sq-cta-sweep {
          0%  {background-position:220% 0}
          42% {background-position:-220% 0}
          100%{background-position:-220% 0}
        }
        @keyframes sq-prog-fill {from{width:0}to{width:100%}}

        /* ── Phase transitions ── */
        .sq-phase   {transition:opacity .9s cubic-bezier(.4,0,.2,1)}
        .sq-leaving {opacity:0!important;pointer-events:none}

        /* ── Controls ── */
        .sq-ctrl {
          display:inline-flex;align-items:center;gap:5px;
          padding:6px 14px;border:none;background:transparent;
          color:rgba(255,255,255,.32);
          font-family:${BF};font-size:.58rem;font-weight:500;
          letter-spacing:.22em;text-transform:uppercase;cursor:pointer;
          transition:color .2s;
        }
        .sq-ctrl:hover{color:rgba(255,255,255,.72)}

        /* ── Enter button ── */
        .sq-enter-btn {
          display:inline-flex;align-items:center;justify-content:center;gap:10px;
          padding:18px 48px;border-radius:999px;border:none;cursor:pointer;
          font-family:${BF};font-size:.78rem;font-weight:700;
          letter-spacing:.24em;text-transform:uppercase;color:#fff;
          background:linear-gradient(135deg,${cfg.accentL} 0%,${cfg.accent} 52%,${cfg.accent} 100%);
          box-shadow:0 8px 32px rgba(${cfg.accentRgb},.35),0 2px 8px rgba(${cfg.accentRgb},.20);
          transition:filter .2s,transform .2s;position:relative;overflow:hidden;
        }
        .sq-enter-btn:hover{filter:brightness(1.10);transform:translateY(-2px)}
        .sq-enter-btn::after{
          content:'';position:absolute;inset:0;border-radius:999px;
          background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.20) 50%,transparent 65%);
          background-size:220% 100%;background-position:220% 0;
          animation:sq-cta-sweep 3s 1.2s ease infinite;pointer-events:none;
        }

        /* ── Letter icon ── */
        .sq-letter-icon {
          animation:sq-letter-float 5s ease-in-out infinite, sq-letter-glow 4s 1s ease-in-out infinite;
        }

        /* ── Handoff stagger ── */
        .hov .hq0{opacity:0;animation:sq-fade   .7s .0s ease forwards}
        .hov .hq1{opacity:0;animation:sq-in-up  1.0s .14s cubic-bezier(.16,1,.3,1) forwards}
        .hov .hq2{opacity:0;animation:sq-fade   .7s .30s ease forwards}
        .hov .hq3{opacity:0;animation:sq-in-up  1.0s .44s cubic-bezier(.16,1,.3,1) forwards}
        .hov .hq4{opacity:0;animation:sq-in-up  .9s  .60s cubic-bezier(.22,1,.36,1) forwards}
        .hov .hq5{opacity:0;animation:sq-in-up  .85s .78s cubic-bezier(.34,1.56,.64,1) forwards}

        @media(max-width:520px){
          .sq-name-solo { font-size:clamp(4rem,18vw,7rem)!important; }
          .sq-name-pair { font-size:clamp(3rem,14vw,6rem)!important; }
          .sq-scene2-divider { display:none!important; }
          .sq-scene2-grid { flex-direction:column!important;align-items:center!important }
          .sq-statement { font-size:clamp(1.4rem,7vw,2.5rem)!important; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════════════
          PHASE 1 · TRAILER
      ════════════════════════════════════════════════════════════════ */}
      {phase === "trailer" && (
        <div
          className={`sq-phase${leaving ? " sq-leaving" : ""}`}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: VOID, overflow: "hidden",
          }}
        >
          {/* Ambient glow — role colour, very subtle */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(ellipse 65% 55% at 50% 50%, rgba(${cfg.accentRgb},.055) 0%, transparent 70%)`,
          }} />

          {/* Grain texture overlay */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none", opacity: .035,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
          }} />

          {/* Skip control */}
          {scene >= 1 && (
            <div style={{
              position: "absolute", top: 16, right: 16, zIndex: 10,
              opacity: 0, animation: "sq-fade .6s .2s ease forwards",
            }}>
              <button type="button" onClick={skipToHandoff} className="sq-ctrl">
                <SkipForward size={10} /> Skip
              </button>
            </div>
          )}

          {/* Scene stage */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(36px,7vh,88px) clamp(24px,6vw,80px)",
            opacity: sceneVis ? 1 : 0,
            transition: `opacity ${CROSSFADE}ms cubic-bezier(.4,0,.2,1)`,
          }}>

            {/* ── Scene 0: Recipient name ── */}
            {scene === 0 && (
              <div>
                <p style={{
                  fontFamily: BF, fontSize: ".5rem",
                  letterSpacing: ".52em", textTransform: "uppercase",
                  color: `rgba(${cfg.accentRgb},.60)`, fontWeight: 700,
                  marginBottom: "clamp(1.25rem,3.5vh,2.75rem)",
                  opacity: 0, animation: "sq-fade .7s .1s ease forwards",
                }}>
                  A private message
                </p>
                <h1 className="sq-name-solo" style={{
                  fontFamily: DF,
                  fontSize: "clamp(5.5rem,16vw,13rem)",
                  fontWeight: 300, lineHeight: .88, letterSpacing: "-.03em",
                  color: "#FFFFFF", margin: 0,
                  opacity: 0, animation: "sq-in-left 1.0s .2s cubic-bezier(.16,1,.3,1) forwards",
                }}>
                  {firstName}.
                </h1>
                <div style={{
                  marginTop: "clamp(1.25rem,3.5vh,2.75rem)",
                  width: "min(80px,18%)", height: 1,
                  background: `linear-gradient(to right, ${cfg.accent}, transparent)`,
                  transformOrigin: "left",
                  opacity: 0, animation: "sq-line-x .9s .9s ease forwards",
                }} />
              </div>
            )}

            {/* ── Scene 1: Both names — side by side ── */}
            {scene === 1 && (
              <div style={{ position: "relative" }}>
                {/* Vertical divider */}
                <div className="sq-scene2-divider" aria-hidden style={{
                  position: "absolute",
                  left: "calc(50% - .5px)", top: 0, bottom: 0, width: 1,
                  background: `linear-gradient(to bottom, transparent, ${cfg.accent} 20%, rgba(${cfg.accentRgb},.5) 50%, transparent)`,
                  transformOrigin: "center top",
                  opacity: 0, animation: "sq-line-y 1.0s .6s ease forwards",
                }} />

                {/* Ampersand */}
                <p style={{
                  position: "absolute", left: "50%", top: "50%",
                  transform: "translate(-50%,-50%)",
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1rem,3vw,2rem)",
                  color: `rgba(${cfg.accentRgb},.70)`,
                  letterSpacing: ".06em", lineHeight: 1, zIndex: 2,
                  opacity: 0, animation: "sq-fade .7s .85s ease forwards",
                }}>
                  &amp;
                </p>

                <div className="sq-scene2-grid" style={{ display: "flex", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, paddingRight: "clamp(1.5rem,4vw,3.5rem)", textAlign: "right" }}>
                    <h1 className="sq-name-pair" style={{
                      fontFamily: DF, fontSize: "clamp(4rem,11vw,10rem)",
                      fontWeight: 300, lineHeight: .86, letterSpacing: "-.03em",
                      color: "#FFFFFF",
                      opacity: 0, animation: "sq-in-left 1.0s .1s cubic-bezier(.16,1,.3,1) forwards",
                    }}>
                      {brideFirst}
                    </h1>
                  </div>
                  <div style={{ flex: 1, paddingLeft: "clamp(1.5rem,4vw,3.5rem)" }}>
                    <h1 className="sq-name-pair" style={{
                      fontFamily: DF, fontSize: "clamp(4rem,11vw,10rem)",
                      fontWeight: 300, lineHeight: .86, letterSpacing: "-.03em",
                      color: "rgba(232,188,20,.88)",
                      opacity: 0, animation: "sq-in-right 1.0s .22s cubic-bezier(.16,1,.3,1) forwards",
                    }}>
                      {groomFirst}
                    </h1>
                  </div>
                </div>
                <p style={{
                  marginTop: "clamp(1.5rem,4vh,3rem)",
                  fontFamily: BF, fontSize: ".50rem",
                  letterSpacing: ".44em", textTransform: "uppercase",
                  color: "rgba(255,255,255,.22)", fontWeight: 500, textAlign: "center",
                  opacity: 0, animation: "sq-fade .7s 1.0s ease forwards",
                }}>
                  Are getting married · 20 May 2026 · Chennai
                </p>
              </div>
            )}

            {/* ── Scene 2: Date + venues ── */}
            {scene === 2 && (
              <div>
                <p style={{
                  fontFamily: BF, fontSize: ".5rem",
                  letterSpacing: ".52em", textTransform: "uppercase",
                  color: "rgba(255,255,255,.25)", fontWeight: 500,
                  marginBottom: "clamp(1.75rem,4.5vh,3.5rem)",
                  opacity: 0, animation: "sq-fade .6s .1s ease forwards",
                }}>
                  The day
                </p>

                {/* Date */}
                <div style={{
                  display: "flex", alignItems: "baseline", gap: "clamp(.5rem,2vw,1.5rem)",
                  flexWrap: "wrap", marginBottom: "clamp(1.5rem,4vh,2.5rem)",
                  opacity: 0, animation: "sq-in-up 1.0s .2s cubic-bezier(.16,1,.3,1) forwards",
                }}>
                  {["Wednesday,", "20", "May", "2026"].map((word, i) => (
                    <span key={i} style={{
                      fontFamily: DF, fontWeight: 300,
                      fontSize: "clamp(2.4rem,8vw,7.5rem)",
                      letterSpacing: "-.02em", lineHeight: .9,
                      color: i === 1 ? "#FFFFFF" : "rgba(255,255,255,.32)",
                    }}>
                      {word}
                    </span>
                  ))}
                </div>

                {/* Venue chips */}
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: ".75rem",
                  opacity: 0, animation: "sq-fade .7s .85s ease forwards",
                }}>
                  {[
                    { label: "Divine Mercy Church", time: "3 PM", color: ROSE_L, bg: "rgba(190,45,69,.12)", bd: "rgba(190,45,69,.28)" },
                    { label: "Blue Bay Beach Resort", time: "6 PM", color: GOLD_L, bg: "rgba(168,120,8,.12)", bd: "rgba(168,120,8,.28)" },
                  ].map(({ label, time, color, bg, bd }) => (
                    <span key={label} style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "6px 16px", borderRadius: 999,
                      background: bg, border: `1px solid ${bd}`,
                      fontFamily: BF, fontSize: ".62rem", fontWeight: 600,
                      color: "#fff", letterSpacing: ".04em",
                    }}>
                      <span style={{ color, fontWeight: 700 }}>{time}</span>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Scene 3: Emotional statement ── */}
            {scene === 3 && (
              <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
                <div style={{
                  width: "min(48px,12%)", height: 1, margin: "0 auto",
                  background: `linear-gradient(to right, transparent, ${cfg.accent}, transparent)`,
                  transformOrigin: "center",
                  opacity: 0, animation: "sq-line-x .9s .1s ease forwards",
                  marginBottom: "clamp(1.75rem,4vh,3rem)",
                }} />
                <h2 className="sq-statement" style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1.75rem,5.5vw,4rem)",
                  lineHeight: 1.25, letterSpacing: "-.01em",
                  color: "rgba(255,255,255,.90)",
                  whiteSpace: "pre-line",
                  opacity: 0, animation: "sq-in-up 1.1s .3s cubic-bezier(.16,1,.3,1) forwards",
                }}>
                  {cfg.statement}
                </h2>
                <div style={{
                  marginTop: "clamp(1.75rem,4vh,3rem)",
                  width: "min(48px,12%)", height: 1, margin: "clamp(1.75rem,4vh,3rem) auto 0",
                  background: `linear-gradient(to right, transparent, ${cfg.accent}, transparent)`,
                  transformOrigin: "center",
                  opacity: 0, animation: "sq-line-x .9s .8s ease forwards",
                }} />
              </div>
            )}

            {/* ── Scene 4: "Something is waiting for you" ── */}
            {scene === 4 && (
              <div style={{ textAlign: "center" }}>
                {/* Envelope / letter icon */}
                <div style={{
                  display: "flex", justifyContent: "center",
                  marginBottom: "clamp(2rem,5vh,3.5rem)",
                  opacity: 0, animation: "sq-fade .8s .1s ease forwards",
                }}>
                  <div className="sq-letter-icon" style={{
                    width: 72, height: 72, borderRadius: 18,
                    background: `rgba(${cfg.accentRgb},.14)`,
                    border: `1.5px solid rgba(${cfg.accentRgb},.30)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect x="2" y="4" width="20" height="16" rx="2"
                        stroke={cfg.accentL} strokeWidth="1.5" fill="none" />
                      <path d="M2 7l10 7 10-7"
                        stroke={cfg.accentL} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <h2 style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1.75rem,5vw,3.5rem)",
                  lineHeight: 1.2, letterSpacing: "-.01em",
                  color: "rgba(255,255,255,.88)", marginBottom: ".75em",
                  opacity: 0, animation: "sq-in-up 1.0s .3s cubic-bezier(.16,1,.3,1) forwards",
                }}>
                  Something is waiting for you.
                </h2>

                <p style={{
                  fontFamily: BF, fontSize: ".52rem",
                  letterSpacing: ".36em", textTransform: "uppercase",
                  color: `rgba(${cfg.accentRgb},.65)`, fontWeight: 600,
                  opacity: 0, animation: "sq-fade .7s .85s ease forwards",
                }}>
                  A private letter · sealed
                </p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div style={{
            position: "absolute",
            bottom: "clamp(28px,4.5vh,48px)",
            left: "clamp(24px,6vw,80px)", right: "clamp(24px,6vw,80px)",
            height: 1, background: "rgba(255,255,255,.07)", borderRadius: 1,
          }}>
            <div style={{
              position: "absolute", inset: "0 auto 0 0",
              background: cfg.accent, borderRadius: 1,
              animation: `sq-prog-fill ${SCENE_HOLD[scene] ?? 2800}ms linear forwards`,
            }} />
          </div>

          {/* Scene counter */}
          <div style={{
            position: "absolute",
            bottom: "clamp(24px,4vh,44px)", right: "clamp(24px,6vw,80px)",
            fontFamily: BF, fontSize: ".42rem", letterSpacing: ".28em",
            color: "rgba(255,255,255,.16)", textTransform: "uppercase",
          }}>
            {pad(scene + 1)} / {pad(SCENE_HOLD.length)}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          PHASE 2 · HANDOFF
          Dark screen, couple names, glowing CTA.
      ════════════════════════════════════════════════════════════════ */}
      {phase === "handoff" && (
        <div
          className={`sq-phase${leaving ? " sq-leaving" : ""}${handoffVis ? " hov" : ""}`}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: VOID_2, overflow: "hidden",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center",
            padding: "clamp(3rem,8vh,6rem) clamp(1.5rem,5vw,4rem)",
          }}
        >
          {/* Role-tinted ambient */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(${cfg.accentRgb},.07) 0%, transparent 65%)`,
          }} />

          {/* Grain */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none", opacity: .03,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }} />

          <div style={{ position: "relative", maxWidth: 560, width: "100%" }}>

            {/* Eyebrow */}
            <div className="hq0" style={{
              display: "flex", alignItems: "center", gap: 12,
              justifyContent: "center", marginBottom: "2.5rem",
            }}>
              <div style={{ width: 28, height: 1, background: `linear-gradient(to right, transparent, rgba(${cfg.accentRgb},.50))` }} />
              <span style={{
                fontFamily: BF, fontSize: ".44rem", letterSpacing: ".52em",
                textTransform: "uppercase", color: cfg.accentL, fontWeight: 700,
              }}>
                {brideFirst} &amp; {groomFirst}
              </span>
              <div style={{ width: 28, height: 1, background: `linear-gradient(to left, transparent, rgba(${cfg.accentRgb},.50))` }} />
            </div>

            {/* Couple names — large */}
            <h1 className="hq1" style={{
              fontFamily: DF, fontWeight: 300,
              fontSize: "clamp(3.5rem,12vw,9rem)",
              lineHeight: .84, letterSpacing: "-.04em",
              color: "#FFFFFF", marginBottom: ".04em",
            }}>
              {brideFirst}
            </h1>
            <p className="hq2" style={{
              fontFamily: DF, fontStyle: "italic", fontWeight: 300,
              fontSize: "clamp(1rem,3vw,2rem)",
              color: cfg.accentL,
              letterSpacing: ".12em", lineHeight: 1.2, marginBottom: ".04em",
            }}>
              &amp;
            </p>
            <h1 className="hq3" style={{
              fontFamily: DF, fontWeight: 300,
              fontSize: "clamp(3.5rem,12vw,9rem)",
              lineHeight: .84, letterSpacing: "-.04em",
              color: "rgba(232,188,20,.88)", marginBottom: "3rem",
            }}>
              {groomFirst}
            </h1>

            {/* Divider */}
            <div className="hq4" style={{
              width: "min(160px,36%)", height: 1, margin: "0 auto 3rem",
              background: `linear-gradient(90deg, transparent, ${cfg.accentL}, transparent)`,
            }} />

            {/* Role badge */}
            <div className="hq4" style={{ marginBottom: "2.5rem" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "6px 20px", borderRadius: 999,
                background: `rgba(${cfg.accentRgb},.14)`,
                border: `1px solid rgba(${cfg.accentRgb},.30)`,
                fontFamily: BF, fontSize: ".60rem", fontWeight: 700,
                letterSpacing: ".18em", textTransform: "uppercase",
                color: cfg.accentL,
              }}>
                ✦ {cfg.roleLabel} Proposal
              </span>
            </div>

            {/* Addressed to */}
            <p className="hq4" style={{
              fontFamily: DF, fontStyle: "italic", fontWeight: 300,
              fontSize: "clamp(.95rem,2.4vw,1.15rem)",
              color: "rgba(255,255,255,.50)", lineHeight: 1.7,
              marginBottom: "3rem",
            }}>
              {proposal.squad_role === "bridesmaid" ? brideFirst : groomFirst} has written{" "}
              {firstName} a private letter.
            </p>

            {/* CTA */}
            <div className="hq5">
              <button
                type="button"
                className="sq-enter-btn"
                onClick={handleEnter}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="2" y="4" width="20" height="16" rx="2"
                    stroke="rgba(255,255,255,.90)" strokeWidth="1.6" fill="rgba(255,255,255,.10)" />
                  <path d="M2 7l10 7 10-7"
                    stroke="rgba(255,255,255,.90)" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Open your letter
              </button>
              <p style={{
                marginTop: "1.25rem",
                fontFamily: BF, fontSize: ".46rem",
                letterSpacing: ".32em", textTransform: "uppercase",
                color: "rgba(255,255,255,.22)", fontWeight: 500,
              }}>
                Sealed · just for you
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SquadCinematicIntro;
