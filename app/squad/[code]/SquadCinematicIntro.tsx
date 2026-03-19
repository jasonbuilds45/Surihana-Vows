"use client";

/**
 * SquadCinematicIntro
 *
 * A private cinematic trailer shown before the sealed proposal letter.
 *
 * FLOW
 *   5 scenes on a dark canvas, auto-advance ~15s total.
 *   After the final scene the screen fades to black, then onEnter() fires
 *   — the sealed letter page appears. No intermediate handoff screen.
 *   The wax seal IS the reveal moment; we don't add another CTA before it.
 *
 * SCENES
 *   0  — Recipient's name, left-anchored, large
 *   1  — Couple names split left / right across a divider
 *   2  — The date + venue chips
 *   3  — Role-specific emotional statement (italic serif, centred)
 *   4  — Floating envelope icon + "Something is waiting for you."
 *        → fades out → sealed letter appears
 *
 * Session-storage keyed to proposal_code: returning visitors skip straight
 * to the sealed letter without replaying the trailer.
 */

import { useEffect, useRef, useState } from "react";
import { SkipForward } from "lucide-react";
import type { SquadProposal } from "@/modules/squad/squad-system";

// ── Tokens ────────────────────────────────────────────────────────────────
const ROSE   = "#BE2D45";
const ROSE_L = "#D44860";
const ROSE_MID = "#F0BEC6";
const GOLD   = "#A87808";
const GOLD_L = "#C9960A";
const GOLD_MID = "#E8C45A";
const VOID   = "#0A0608";

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

const SCENE_HOLD = [2800, 3000, 3200, 3000, 2800]; // ms per scene
const CROSSFADE  = 550; // ms between scenes
const EXIT_FADE  = 1100; // ms fade-to-black before handing off to sealed letter

interface Props {
  proposal:  SquadProposal;
  brideName: string;
  groomName: string;
  onEnter:   () => void;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export function SquadCinematicIntro({ proposal, brideName, groomName, onEnter }: Props) {
  const isBridesmaid = proposal.squad_role === "bridesmaid";
  const cfg = isBridesmaid
    ? { accent: ROSE, accentL: ROSE_L, accentMid: ROSE_MID, accentRgb: "190,45,69",
        statement: "She chose you for a reason.\nSome roles are more than roles." }
    : { accent: GOLD, accentL: GOLD_L, accentMid: GOLD_MID, accentRgb: "168,120,8",
        statement: "He chose you for a reason.\nSome bonds are more than friendship." };

  const firstName  = proposal.name.split(" ")[0]!;
  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;

  const [mounted,  setMounted]  = useState(false);
  const [scene,    setScene]    = useState(0);
  const [sceneVis, setSceneVis] = useState(true);
  const [exiting,  setExiting]  = useState(false); // final fade-to-black

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageKey = `surihana-squad-intro:${proposal.proposal_code}`;

  // ── Mount ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    // Returning visitor — skip straight to the sealed letter
    if (sessionStorage.getItem(storageKey) === "seen") {
      onEnter();
      return;
    }

    document.body.style.overflow    = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow    = "";
      document.body.style.touchAction = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scene auto-advance ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const hold = SCENE_HOLD[scene] ?? 2800;

    timer.current = setTimeout(() => {
      setSceneVis(false); // fade current scene out

      setTimeout(() => {
        if (scene < SCENE_HOLD.length - 1) {
          // Advance to next scene
          setScene(s => s + 1);
          setSceneVis(true);
        } else {
          // Last scene finished — fade entire screen to black, then hand off
          setExiting(true);
          setTimeout(() => {
            if (typeof window !== "undefined") {
              sessionStorage.setItem(storageKey, "seen");
              document.body.style.overflow    = "";
              document.body.style.touchAction = "";
            }
            onEnter();
          }, EXIT_FADE);
        }
      }, CROSSFADE);
    }, hold);

    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, mounted]);

  // ── Skip — same fade-to-black, just faster ────────────────────────────
  function handleSkip() {
    if (timer.current) clearTimeout(timer.current);
    setSceneVis(false);
    setExiting(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(storageKey, "seen");
        document.body.style.overflow    = "";
        document.body.style.touchAction = "";
      }
      onEnter();
    }, EXIT_FADE);
  }

  if (!mounted) return <div style={{ minHeight: "100dvh", background: VOID }} />;

  return (
    <>
      <style>{`
        @keyframes sq-fade    {from{opacity:0}to{opacity:1}}
        @keyframes sq-in-left {from{opacity:0;transform:translateX(-7vw)}to{opacity:1;transform:translateX(0)}}
        @keyframes sq-in-right{from{opacity:0;transform:translateX(7vw)} to{opacity:1;transform:translateX(0)}}
        @keyframes sq-in-up   {from{opacity:0;transform:translateY(2.5rem)}to{opacity:1;transform:translateY(0)}}
        @keyframes sq-line-x  {from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes sq-line-y  {from{transform:scaleY(0)}to{transform:scaleY(1)}}
        @keyframes sq-prog    {from{width:0}to{width:100%}}
        @keyframes sq-float   {0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-10px) rotate(1deg)}}
        @keyframes sq-glow    {0%,100%{box-shadow:0 0 0 0 rgba(${cfg.accentRgb},0),0 8px 32px rgba(0,0,0,.45)}50%{box-shadow:0 0 0 18px rgba(${cfg.accentRgb},.10),0 12px 40px rgba(0,0,0,.55)}}

        .sq-ctrl{
          display:inline-flex;align-items:center;gap:5px;
          padding:6px 14px;border:none;background:transparent;
          color:rgba(255,255,255,.32);
          font-family:${BF};font-size:.58rem;font-weight:500;
          letter-spacing:.22em;text-transform:uppercase;cursor:pointer;
          transition:color .2s;
        }
        .sq-ctrl:hover{color:rgba(255,255,255,.72)}

        .sq-letter-icon{animation:sq-float 5s ease-in-out infinite,sq-glow 4s 1s ease-in-out infinite}

        @media(max-width:520px){
          .sq-name-solo{font-size:clamp(4rem,18vw,7rem)!important}
          .sq-name-pair{font-size:clamp(3rem,14vw,6rem)!important}
          .sq-divider{display:none!important}
          .sq-names{flex-direction:column!important;align-items:center!important}
          .sq-statement{font-size:clamp(1.4rem,7vw,2.5rem)!important}
        }
      `}</style>

      {/* ── Outer shell — fades to black on exit ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: VOID, overflow: "hidden",
        opacity: exiting ? 0 : 1,
        transition: exiting ? `opacity ${EXIT_FADE}ms cubic-bezier(.4,0,.2,1)` : "none",
      }}>
        {/* Ambient role glow */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 65% 55% at 50% 50%, rgba(${cfg.accentRgb},.055) 0%, transparent 70%)`,
        }} />

        {/* Film-grain texture */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: .035,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }} />

        {/* Skip — appears after scene 1 */}
        {scene >= 1 && !exiting && (
          <div style={{
            position: "absolute", top: 16, right: 16, zIndex: 10,
            opacity: 0, animation: "sq-fade .6s .2s ease forwards",
          }}>
            <button type="button" onClick={handleSkip} className="sq-ctrl">
              <SkipForward size={10} /> Skip
            </button>
          </div>
        )}

        {/* Scene stage */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "clamp(36px,7vh,88px) clamp(24px,6vw,80px)",
          opacity: sceneVis ? 1 : 0,
          transition: `opacity ${CROSSFADE}ms cubic-bezier(.4,0,.2,1)`,
        }}>

          {/* ── SCENE 0: Recipient name ── */}
          {scene === 0 && (
            <div>
              <p style={{
                fontFamily: BF, fontSize: ".5rem", letterSpacing: ".52em",
                textTransform: "uppercase", color: `rgba(${cfg.accentRgb},.60)`,
                fontWeight: 700, marginBottom: "clamp(1.25rem,3.5vh,2.75rem)",
                opacity: 0, animation: "sq-fade .7s .1s ease forwards",
              }}>
                A private message
              </p>
              <h1 className="sq-name-solo" style={{
                fontFamily: DF, fontSize: "clamp(5.5rem,16vw,13rem)",
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

          {/* ── SCENE 1: Couple names ── */}
          {scene === 1 && (
            <div style={{ position: "relative" }}>
              {/* Vertical divider */}
              <div className="sq-divider" aria-hidden style={{
                position: "absolute", left: "calc(50% - .5px)", top: 0, bottom: 0, width: 1,
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
              <div className="sq-names" style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{ flex: 1, paddingRight: "clamp(1.5rem,4vw,3.5rem)", textAlign: "right" }}>
                  <h1 className="sq-name-pair" style={{
                    fontFamily: DF, fontSize: "clamp(4rem,11vw,10rem)",
                    fontWeight: 300, lineHeight: .86, letterSpacing: "-.03em", color: "#FFFFFF",
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
                fontFamily: BF, fontSize: ".50rem", letterSpacing: ".44em",
                textTransform: "uppercase", color: "rgba(255,255,255,.22)",
                fontWeight: 500, textAlign: "center",
                opacity: 0, animation: "sq-fade .7s 1.0s ease forwards",
              }}>
                Are getting married · 20 May 2026 · Chennai
              </p>
            </div>
          )}

          {/* ── SCENE 2: Date + venues ── */}
          {scene === 2 && (
            <div>
              <p style={{
                fontFamily: BF, fontSize: ".5rem", letterSpacing: ".52em",
                textTransform: "uppercase", color: "rgba(255,255,255,.25)",
                fontWeight: 500, marginBottom: "clamp(1.75rem,4.5vh,3.5rem)",
                opacity: 0, animation: "sq-fade .6s .1s ease forwards",
              }}>
                The day
              </p>
              <div style={{
                display: "flex", alignItems: "baseline",
                gap: "clamp(.5rem,2vw,1.5rem)", flexWrap: "wrap",
                marginBottom: "clamp(1.5rem,4vh,2.5rem)",
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
              <div style={{
                display: "flex", flexWrap: "wrap", gap: ".75rem",
                opacity: 0, animation: "sq-fade .7s .85s ease forwards",
              }}>
                {[
                  { label: "Divine Mercy Church",  time: "3 PM", color: ROSE_L, bg: "rgba(190,45,69,.12)", bd: "rgba(190,45,69,.28)" },
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

          {/* ── SCENE 3: Emotional statement ── */}
          {scene === 3 && (
            <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
              <div style={{
                width: "min(48px,12%)", height: 1, margin: "0 auto clamp(1.75rem,4vh,3rem)",
                background: `linear-gradient(to right, transparent, ${cfg.accent}, transparent)`,
                transformOrigin: "center",
                opacity: 0, animation: "sq-line-x .9s .1s ease forwards",
              }} />
              <h2 className="sq-statement" style={{
                fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                fontSize: "clamp(1.75rem,5.5vw,4rem)",
                lineHeight: 1.25, letterSpacing: "-.01em",
                color: "rgba(255,255,255,.90)", whiteSpace: "pre-line",
                opacity: 0, animation: "sq-in-up 1.1s .3s cubic-bezier(.16,1,.3,1) forwards",
              }}>
                {cfg.statement}
              </h2>
              <div style={{
                width: "min(48px,12%)", height: 1, margin: "clamp(1.75rem,4vh,3rem) auto 0",
                background: `linear-gradient(to right, transparent, ${cfg.accent}, transparent)`,
                transformOrigin: "center",
                opacity: 0, animation: "sq-line-x .9s .8s ease forwards",
              }} />
            </div>
          )}

          {/* ── SCENE 4: Something is waiting ── */}
          {scene === 4 && (
            <div style={{ textAlign: "center" }}>
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
          <div key={scene} style={{
            position: "absolute", inset: "0 auto 0 0",
            background: cfg.accent, borderRadius: 1,
            animation: `sq-prog ${SCENE_HOLD[scene] ?? 2800}ms linear forwards`,
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
    </>
  );
}

export default SquadCinematicIntro;
