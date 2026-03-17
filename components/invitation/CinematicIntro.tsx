"use client";

/**
 * CinematicIntro — 2026 Redesign
 *
 * Design philosophy: "A letter arriving in morning light"
 * Everything is warm, luminous, and intimate — not dark cinema.
 * The platform IS light. The invitation should feel like crème paper
 * held up to a window, not a red-carpet velvet roped event.
 *
 * ═══ FLOW ════════════════════════════════════════════════════════════════════
 *
 *  PHASE 1 · REVEAL   (~13 s, five scenes, auto-advance)
 *    Full warm-cream canvas. No dark backgrounds. No heavy vignettes.
 *    Each scene is a typographic composition — editorial, not dark-cinema.
 *    Scene 0 → Celebration eyebrow + ornamental flourish draw
 *    Scene 1 → Bride name in display serif, large, with a rose underline
 *    Scene 2 → Groom name in gold-tinted display, with a gold underline
 *    Scene 3 → Both names together in a stacked pair + italic ampersand
 *    Scene 4 → Date · Venue · City
 *    Progress dots at bottom. Skip chip top-right from scene 1.
 *
 *  PHASE 2 · ENVELOPE CARD  (warm linen surface, light & breathable)
 *    Sealed card on cream canvas.
 *    Gold wax monogram seal with gentle pulse animation.
 *    Guest name addressed above.
 *    One rose CTA button — "Open your invitation"
 *    Card lifts and dissolves on click.
 *
 *  PHASE 3 · HERO  (light, photo-accented, editorial layout)
 *    Photo behind a warm cream wash — NOT a dark overlay.
 *    Staggered reveal of names, date, venue, tag, CTA.
 *    Vertical scroll cue at bottom.
 *
 *  RETURNING GUESTS
 *    30-day cookie + sessionStorage → skip straight to Phase 3.
 *
 * ═════════════════════════════════════════════════════════════════════════════
 */

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SkipForward, Volume2, VolumeX } from "lucide-react";

// ── Platform design tokens (from styles/globals.css) ──────────────────────
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
const BG_WARM   = "#F8F3EE";
const BG_LINEN  = "#F1E9E0";
const BDR       = "rgba(190,45,69,0.10)";
const BDR_MD    = "rgba(190,45,69,0.18)";

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

// Inline noise texture (matches --noise in globals.css)
const NOISE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;

// ── Types ──────────────────────────────────────────────────────────────────
interface CinematicIntroProps {
  inviteCode:    string;
  guestLabel:    string;
  brideName:     string;
  groomName:     string;
  title:         string;
  subtitle:      string;
  weddingDate?:  string;
  venueName?:    string;
  venueCity?:    string;
  heroPhotoUrl?: string;
  audioSrc?:     string | null;
  children:      ReactNode;
}

type Phase = "reveal" | "envelope" | "hero";

// ── Deterministic floating petals (stable across SSR/CSR) ─────────────────
const PETALS = Array.from({ length: 18 }, (_, i) => ({
  id:    i,
  left:  `${6 + (i * 5.1) % 88}%`,
  size:  2 + (i % 3) * 1.2,
  dur:   14 + (i % 6) * 2,
  delay: (i * 1.7) % 10,
  drift: (i % 2 === 0) ? 1 : -1,
}));

// Scene durations in ms
const SCENE_HOLD: number[] = [2800, 2600, 2600, 2600, 3000];
const CROSSFADE = 700;

// ═══════════════════════════════════════════════════════════════════════════
export function CinematicIntro({
  inviteCode, guestLabel, brideName, groomName,
  title, subtitle, weddingDate, venueName, venueCity,
  heroPhotoUrl, audioSrc = "/audio/wedding-theme.mp3", children,
}: CinematicIntroProps) {

  const [isMounted,    setIsMounted]    = useState(false);
  const [phase,        setPhase]        = useState<Phase>("reveal");
  const [scene,        setScene]        = useState(0);
  const [sceneVis,     setSceneVis]     = useState(true);
  const [phaseLeaving, setPhaseLeaving] = useState(false);
  const [heroVis,      setHeroVis]      = useState(false);
  const [isMuted,      setIsMuted]      = useState(true);
  const [audioAvail,   setAudioAvail]   = useState<boolean | null>(audioSrc ? null : false);
  const [envOpen,      setEnvOpen]      = useState(false);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const sceneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageKey = `surihana-intro:${inviteCode}`;
  const cookieName = `invite_intro_seen_${inviteCode}`;

  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;
  const initials   = useMemo(() =>
    `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase(),
    [brideName, groomName]
  );

  // Mount — returning visitor check
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === "undefined") return;
    const hasCookie  = document.cookie.split(";").some(c => c.trim().startsWith(`${cookieName}=`));
    const hasSession = sessionStorage.getItem(storageKey) === "entered";
    if (hasCookie || hasSession) {
      setPhase("hero");
      setTimeout(() => setHeroVis(true), 80);
    }
  }, [cookieName, storageKey]);

  // Scene auto-advance
  useEffect(() => {
    if (phase !== "reveal") return;
    const hold = SCENE_HOLD[scene] ?? 3000;
    sceneTimer.current = setTimeout(() => {
      setSceneVis(false);
      setTimeout(() => {
        if (scene < SCENE_HOLD.length - 1) {
          setScene(s => s + 1);
          setSceneVis(true);
        } else {
          goToEnvelope();
        }
      }, CROSSFADE);
    }, hold);
    return () => { if (sceneTimer.current) clearTimeout(sceneTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, phase]);

  // Audio
  const setAudioRef = useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el;
    if (!el) return;
    el.addEventListener("canplaythrough", () => setAudioAvail(true), { once: true });
    el.addEventListener("error",          () => setAudioAvail(false), { once: true });
    if (el.readyState >= 3) setAudioAvail(true);
  }, []);

  function toggleMusic() {
    if (!audioRef.current || !audioAvail) return;
    setIsMuted(v => {
      const next = !v;
      if (audioRef.current) {
        audioRef.current.muted = next;
        if (!next) void audioRef.current.play().catch(() => undefined);
      }
      return next;
    });
  }

  // Phase transitions
  function fadeOut(cb: () => void) {
    setPhaseLeaving(true);
    setTimeout(() => { setPhaseLeaving(false); cb(); }, 800);
  }

  function goToEnvelope() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    fadeOut(() => setPhase("envelope"));
  }

  function skipToEnvelope() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    setSceneVis(false);
    fadeOut(() => setPhase("envelope"));
  }

  function openInvitation() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "entered");
      const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${cookieName}=1; expires=${exp}; path=/; SameSite=Lax`;
    }
    if (audioRef.current) audioRef.current.pause();
    setEnvOpen(true);
    setTimeout(() => {
      fadeOut(() => {
        setPhase("hero");
        requestAnimationFrame(() => requestAnimationFrame(() => setHeroVis(true)));
      });
    }, 550);
  }

  // SSR guard
  if (!isMounted) {
    return <div style={{ minHeight: "100dvh", background: BG }}>{children}</div>;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ═══ KEYFRAMES ═══════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes ci-fadeIn   { from{opacity:0}                             to{opacity:1} }
        @keyframes ci-riseIn   { from{opacity:0;transform:translateY(28px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes ci-sinkIn   { from{opacity:0;transform:translateY(-18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ci-scaleIn  { from{opacity:0;transform:scale(.94)}        to{opacity:1;transform:scale(1)} }
        @keyframes ci-lineGrow { from{transform:scaleX(0);opacity:0}         to{transform:scaleX(1);opacity:1} }

        @keyframes ci-breathe  { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.03)} }
        @keyframes ci-slowZoom { 0%{transform:scale(1)} 100%{transform:scale(1.07)} }

        @keyframes ci-petalRise {
          0%  {transform:translateY(110vh) rotate(0deg) translateX(0px);opacity:0}
          5%  {opacity:.6}
          85% {opacity:.15}
          100%{transform:translateY(-8vh) rotate(360deg) translateX(30px);opacity:0}
        }
        @keyframes ci-petalLeft {
          0%  {transform:translateY(110vh) rotate(0deg) translateX(0px);opacity:0}
          5%  {opacity:.5}
          85% {opacity:.10}
          100%{transform:translateY(-8vh) rotate(-360deg) translateX(-30px);opacity:0}
        }

        @keyframes ci-envLift {
          0%  {transform:perspective(900px) rotateX(0) translateY(0) scale(1);opacity:1}
          100%{transform:perspective(900px) rotateX(-10deg) translateY(-40px) scale(.96);opacity:0}
        }
        @keyframes ci-sealPulse {
          0%,100%{box-shadow:0 0 0 0 rgba(168,120,8,0),0 8px 28px rgba(60,20,30,.16)}
          50%    {box-shadow:0 0 0 10px rgba(168,120,8,.10),0 8px 28px rgba(60,20,30,.22)}
        }

        .ci-h0,.ci-h1,.ci-h2,.ci-h3,.ci-h4,.ci-h5,.ci-h6,.ci-h7,.ci-h8{opacity:0}
        .ci-vis .ci-h0{animation:ci-riseIn .85s .00s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h1{animation:ci-riseIn .90s .16s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h2{animation:ci-riseIn .90s .30s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h3{animation:ci-riseIn .90s .44s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h4{animation:ci-riseIn .85s .58s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h5{animation:ci-riseIn .85s .72s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h6{animation:ci-riseIn .80s .86s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h7{animation:ci-riseIn .80s 1.0s  cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h8{animation:ci-riseIn .75s 1.14s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-hl{transform-origin:center;animation:ci-lineGrow .9s .38s ease forwards}

        @keyframes ci-bounce {
          0%,100%{transform:translateX(-50%) translateY(0)}
          50%    {transform:translateX(-50%) translateY(7px)}
        }

        .ci-phase{transition:opacity .8s ease}
        .ci-leaving{opacity:0!important;pointer-events:none}

        .ci-cta{
          width:100%;padding:16px;
          background:linear-gradient(135deg,${ROSE_L} 0%,${ROSE} 55%,${ROSE_H} 100%);
          border:none;border-radius:14px;color:#fff;
          font-family:${BF};font-size:.8rem;font-weight:700;
          letter-spacing:.22em;text-transform:uppercase;cursor:pointer;
          box-shadow:0 10px 32px rgba(190,45,69,.28),0 2px 8px rgba(190,45,69,.14);
          transition:transform .2s cubic-bezier(.22,1,.36,1),box-shadow .2s ease,filter .15s ease;
          position:relative;overflow:hidden;
        }
        .ci-cta::after{
          content:'';position:absolute;inset:0;
          background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.20) 50%,transparent 62%);
          background-size:200% 100%;background-position:200% 0;
          animation:ci-shimmer 2.6s 1.4s ease infinite;pointer-events:none;
        }
        @keyframes ci-shimmer{
          0%  {background-position:200% 0}
          40% {background-position:-200% 0}
          100%{background-position:-200% 0}
        }
        .ci-cta:hover{transform:translateY(-2px) scale(1.01);filter:brightness(1.04);box-shadow:0 16px 40px rgba(190,45,69,.34),0 4px 12px rgba(190,45,69,.18)}
        .ci-cta:active{transform:translateY(0) scale(.99)}

        .ci-chip{
          display:inline-flex;align-items:center;gap:5px;
          padding:6px 14px;background:rgba(255,255,255,.68);
          border:1px solid ${BDR_MD};border-radius:999px;
          color:${INK_3};font-family:${BF};font-size:.62rem;
          font-weight:600;letter-spacing:.16em;text-transform:uppercase;
          cursor:pointer;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
          transition:background .18s ease,border-color .18s ease,color .18s ease;
        }
        .ci-chip:hover{background:${ROSE_PALE};border-color:rgba(190,45,69,.28);color:${ROSE}}

        .ci-view-btn{
          display:inline-flex;align-items:center;gap:9px;
          padding:13px 34px;
          background:rgba(255,255,255,.14);
          border:1.5px solid rgba(190,45,69,.30);
          border-radius:999px;color:${INK};
          font-family:${BF};font-size:.72rem;font-weight:600;
          letter-spacing:.18em;text-transform:uppercase;
          text-decoration:none;cursor:pointer;
          backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
          transition:all .28s cubic-bezier(.22,1,.36,1);
        }
        .ci-view-btn:hover{
          background:rgba(190,45,69,.08);
          border-color:${ROSE};color:${ROSE};
          transform:translateY(-2px);
          box-shadow:0 8px 24px rgba(190,45,69,.14);
        }

        @media(max-width:480px){
          .ci-name-lg  {font-size:clamp(3.4rem,17vw,6.5rem)!important}
          .ci-name-pair{font-size:clamp(2.8rem,13vw,5rem)!important}
          .ci-card-p   {padding:1.5rem!important}
          .ci-hero-name{font-size:clamp(3rem,13vw,7.5rem)!important}
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 1 · REVEAL — warm cream canvas
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "reveal" && (
        <div
          className={`ci-phase${phaseLeaving ? " ci-leaving" : ""}`}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: BG,
            backgroundImage: NOISE_BG,
            backgroundAttachment: "fixed",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* Warm mesh radials */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `
              radial-gradient(ellipse 75% 55% at 18% 28%, rgba(190,45,69,.06) 0%, transparent 62%),
              radial-gradient(ellipse 65% 50% at 84% 74%, rgba(168,120,8,.05) 0%, transparent 58%),
              radial-gradient(ellipse 55% 40% at 50% 52%, rgba(248,243,238,.70) 0%, transparent 68%)
            `,
            animation: "ci-breathe 12s ease-in-out infinite",
          }} />

          {/* Top + bottom linen fades (no black) */}
          <div aria-hidden style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: "clamp(40px,7vh,72px)",
            background: `linear-gradient(to bottom, ${BG_WARM}, transparent)`,
            zIndex: 4,
          }} />
          <div aria-hidden style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: "clamp(48px,9vh,88px)",
            background: `linear-gradient(to top, ${BG_LINEN}, transparent)`,
            zIndex: 4,
          }} />

          {/* Floating petal particles */}
          {PETALS.map(p => (
            <div key={p.id} aria-hidden style={{
              position: "absolute", bottom: "-12px", left: p.left,
              width: p.size + 1, height: p.size * 1.6,
              borderRadius: "50% 50% 48% 52% / 58% 60% 40% 42%",
              background: p.id % 3 === 0
                ? `rgba(190,45,69,${0.14 + (p.id % 4) * 0.05})`
                : p.id % 3 === 1
                  ? `rgba(168,120,8,${0.12 + (p.id % 3) * 0.04})`
                  : `rgba(240,190,198,${0.28 + (p.id % 3) * 0.08})`,
              opacity: 0,
              animation: `${p.drift === 1 ? "ci-petalRise" : "ci-petalLeft"} ${p.dur}s ${p.delay}s linear infinite`,
              filter: "blur(.3px)",
            }} />
          ))}

          {/* Controls — from scene 1 */}
          {scene >= 1 && (
            <div style={{
              position: "absolute", top: 16, right: 16, zIndex: 10,
              display: "flex", gap: 8,
              opacity: 0, animation: "ci-fadeIn .7s .2s ease forwards",
            }}>
              {audioAvail === true && (
                <button type="button" onClick={toggleMusic} className="ci-chip">
                  {isMuted ? <VolumeX size={11} /> : <Volume2 size={11} />}
                  {isMuted ? "Music" : "Mute"}
                </button>
              )}
              <button type="button" onClick={skipToEnvelope} className="ci-chip">
                <SkipForward size={11} /> Skip
              </button>
            </div>
          )}

          {/* Scene stage */}
          <div style={{
            position: "relative", zIndex: 5,
            textAlign: "center",
            padding: "0 clamp(20px,7vw,96px)",
            width: "100%", maxWidth: 720,
            opacity: sceneVis ? 1 : 0,
            transition: `opacity ${CROSSFADE}ms cubic-bezier(.4,0,.6,1)`,
          }}>

            {/* Scene 0 — Title & ornamental flourish */}
            {scene === 0 && (
              <div style={{ opacity: 0, animation: "ci-scaleIn 1.1s .1s cubic-bezier(.22,1,.36,1) forwards" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 14,
                  justifyContent: "center", marginBottom: "2rem",
                }}>
                  <div style={{
                    flex: 1, maxWidth: 80, height: 1,
                    background: `linear-gradient(to right, transparent, ${ROSE_MID})`,
                    transformOrigin: "right",
                    opacity: 0, animation: "ci-lineGrow 1.1s .5s ease forwards",
                  }} />
                  <span style={{
                    color: ROSE, fontSize: 14, lineHeight: 1,
                    opacity: 0, animation: "ci-fadeIn .6s .9s ease forwards",
                  }}>✦</span>
                  <div style={{
                    flex: 1, maxWidth: 80, height: 1,
                    background: `linear-gradient(to left, transparent, ${ROSE_MID})`,
                    transformOrigin: "left",
                    opacity: 0, animation: "ci-lineGrow 1.1s .5s ease forwards",
                  }} />
                </div>

                <p style={{
                  fontFamily: BF, fontSize: "clamp(.5rem,1.5vw,.62rem)",
                  letterSpacing: ".50em", textTransform: "uppercase",
                  color: ROSE, fontWeight: 700, marginBottom: "1.5rem",
                  opacity: 0, animation: "ci-riseIn .9s .3s ease forwards",
                }}>
                  {title}
                </p>

                <p style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1.1rem,3.5vw,1.75rem)",
                  color: INK_3, letterSpacing: ".04em", lineHeight: 1.5,
                  opacity: 0, animation: "ci-riseIn 1s .65s ease forwards",
                }}>
                  A love story worth witnessing
                </p>

                {/* Double gold rule */}
                <div style={{
                  display: "flex", flexDirection: "column", gap: 4,
                  alignItems: "center", marginTop: "2rem",
                  opacity: 0, animation: "ci-fadeIn .8s 1.0s ease forwards",
                }}>
                  <div style={{ width: "min(200px,42%)", height: 1, background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)` }} />
                  <div style={{ width: "min(120px,26%)", height: 1, background: `linear-gradient(90deg, transparent, rgba(168,120,8,.35), transparent)` }} />
                </div>
              </div>
            )}

            {/* Scene 1 — Bride */}
            {scene === 1 && (
              <div>
                <p style={{
                  fontFamily: BF, fontSize: "clamp(.46rem,1.2vw,.58rem)",
                  letterSpacing: ".44em", textTransform: "uppercase",
                  color: ROSE, fontWeight: 700, marginBottom: "1rem",
                  opacity: 0, animation: "ci-sinkIn .8s .05s ease forwards",
                }}>
                  The bride
                </p>
                <h1 className="ci-name-lg" style={{
                  fontFamily: DF,
                  fontSize: "clamp(4.5rem,14vw,9.5rem)",
                  fontWeight: 700, lineHeight: .86,
                  letterSpacing: "-0.03em", color: INK,
                  opacity: 0, animation: "ci-riseIn 1.1s .15s cubic-bezier(.22,1,.36,1) forwards",
                }}>
                  {brideFirst}
                </h1>
                <div style={{
                  width: "min(200px,44%)", height: 2, margin: "1.5rem auto 0",
                  background: `linear-gradient(90deg, transparent, ${ROSE}, transparent)`,
                  transformOrigin: "center", borderRadius: 2,
                  opacity: 0, animation: "ci-lineGrow 1s .75s ease forwards",
                }} />
              </div>
            )}

            {/* Scene 2 — Groom */}
            {scene === 2 && (
              <div>
                <p style={{
                  fontFamily: BF, fontSize: "clamp(.46rem,1.2vw,.58rem)",
                  letterSpacing: ".44em", textTransform: "uppercase",
                  color: GOLD, fontWeight: 700, marginBottom: "1rem",
                  opacity: 0, animation: "ci-sinkIn .8s .05s ease forwards",
                }}>
                  &amp; the groom
                </p>
                <h1 className="ci-name-lg" style={{
                  fontFamily: DF,
                  fontSize: "clamp(4.5rem,14vw,9.5rem)",
                  fontWeight: 700, lineHeight: .86,
                  letterSpacing: "-0.03em", color: INK_2,
                  opacity: 0, animation: "ci-riseIn 1.1s .15s cubic-bezier(.22,1,.36,1) forwards",
                }}>
                  {groomFirst}
                </h1>
                <div style={{
                  width: "min(200px,44%)", height: 2, margin: "1.5rem auto 0",
                  background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)`,
                  transformOrigin: "center", borderRadius: 2,
                  opacity: 0, animation: "ci-lineGrow 1s .75s ease forwards",
                }} />
              </div>
            )}

            {/* Scene 3 — Together (stacked editorial pair) */}
            {scene === 3 && (
              <div>
                <p style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(.9rem,2.6vw,1.3rem)",
                  color: INK_3, letterSpacing: ".05em", marginBottom: "1.25rem",
                  opacity: 0, animation: "ci-fadeIn 1.2s .1s ease forwards",
                }}>
                  Together forever
                </p>
                <div style={{
                  display: "inline-flex", flexDirection: "column", alignItems: "center",
                  opacity: 0, animation: "ci-riseIn 1s .3s cubic-bezier(.22,1,.36,1) forwards",
                }}>
                  <span className="ci-name-pair" style={{
                    fontFamily: DF, fontSize: "clamp(3.2rem,10vw,7rem)",
                    fontWeight: 700, lineHeight: .9, letterSpacing: "-0.025em", color: INK,
                  }}>
                    {brideFirst}
                  </span>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12, margin: ".3em 0",
                    opacity: 0, animation: "ci-fadeIn .6s .8s ease forwards",
                  }}>
                    <div style={{ width: 32, height: 1, background: `linear-gradient(to right, transparent, ${GOLD_L})` }} />
                    <span style={{
                      fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                      fontSize: "clamp(1.2rem,3.5vw,2.2rem)",
                      color: ROSE, letterSpacing: ".08em",
                    }}>
                      &amp;
                    </span>
                    <div style={{ width: 32, height: 1, background: `linear-gradient(to left, transparent, ${GOLD_L})` }} />
                  </div>
                  <span className="ci-name-pair" style={{
                    fontFamily: DF, fontSize: "clamp(3.2rem,10vw,7rem)",
                    fontWeight: 700, lineHeight: .9, letterSpacing: "-0.025em", color: INK_2,
                  }}>
                    {groomFirst}
                  </span>
                </div>
              </div>
            )}

            {/* Scene 4 — Date & Venue */}
            {scene === 4 && (
              <div>
                <p style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(.9rem,2.4vw,1.2rem)",
                  color: INK_4, letterSpacing: ".04em", marginBottom: "1.25rem",
                  opacity: 0, animation: "ci-fadeIn 1.2s .1s ease forwards",
                }}>
                  invite you to witness their union
                </p>
                {weddingDate && (
                  <p style={{
                    fontFamily: DF, fontWeight: 600,
                    fontSize: "clamp(1.75rem,6vw,3.5rem)",
                    color: INK, letterSpacing: ".03em", lineHeight: 1.15,
                    marginBottom: ".75rem",
                    opacity: 0, animation: "ci-riseIn 1s .3s cubic-bezier(.22,1,.36,1) forwards",
                  }}>
                    {weddingDate}
                  </p>
                )}
                {(venueName || venueCity) && (
                  <p style={{
                    fontFamily: BF, fontSize: "clamp(.75rem,1.8vw,.88rem)",
                    color: INK_3, letterSpacing: ".10em", fontWeight: 500,
                    marginBottom: "1.5rem",
                    opacity: 0, animation: "ci-riseIn .9s .55s ease forwards",
                  }}>
                    {[venueName, venueCity].filter(Boolean).join("  ·  ")}
                  </p>
                )}
                <div style={{
                  display: "flex", flexDirection: "column", gap: 4, alignItems: "center",
                  opacity: 0, animation: "ci-fadeIn .8s .85s ease forwards",
                }}>
                  <div style={{ width: "min(200px,42%)", height: 1, background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)` }} />
                  <div style={{ width: "min(120px,26%)", height: 1, background: `linear-gradient(90deg, transparent, rgba(168,120,8,.35), transparent)` }} />
                </div>
              </div>
            )}
          </div>

          {/* Progress dots */}
          <div style={{
            position: "absolute",
            bottom: "clamp(48px,9vh,88px)", left: "50%",
            transform: "translateX(-50%)",
            display: "flex", gap: 7, zIndex: 6,
          }}>
            {SCENE_HOLD.map((_, i) => (
              <div key={i} style={{
                height: 3, borderRadius: 2,
                width: i === scene ? 26 : (i < scene ? 10 : 7),
                background: i <= scene
                  ? (i < 2 ? ROSE : GOLD_L)
                  : BDR_MD,
                transition: "all .5s cubic-bezier(.22,1,.36,1)",
                opacity: i < scene ? .5 : 1,
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 2 · ENVELOPE CARD
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "envelope" && (
        <div
          className={`ci-phase${phaseLeaving ? " ci-leaving" : ""}`}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: BG_WARM,
            backgroundImage: NOISE_BG,
            backgroundAttachment: "fixed",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "clamp(52px,9vh,72px) 20px clamp(28px,5vh,48px)",
          }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* Ambient blooms */}
          <div aria-hidden style={{
            position: "fixed", inset: 0, pointerEvents: "none",
            background: `
              radial-gradient(ellipse 65% 50% at 14% 18%, rgba(190,45,69,.05) 0%, transparent 58%),
              radial-gradient(ellipse 55% 45% at 88% 84%, rgba(168,120,8,.04) 0%, transparent 52%)
            `,
          }} />

          {/* Skip chip */}
          <button type="button" onClick={openInvitation} className="ci-chip" style={{
            position: "fixed", top: 14, right: 14, zIndex: 10,
            opacity: 0, animation: "ci-fadeIn .6s .5s ease forwards",
          }}>
            <SkipForward size={11} /> Skip
          </button>

          {/* Card wrapper — lifts on open */}
          <div style={{
            width: "100%", maxWidth: 448,
            ...(envOpen
              ? { animation: "ci-envLift .55s .0s cubic-bezier(.22,1,.36,1) forwards" }
              : { opacity: 0, animation: "ci-scaleIn .9s .1s cubic-bezier(.22,1,.36,1) forwards" }
            ),
          }}>

            {/* Addressed-to */}
            <div style={{
              textAlign: "center", marginBottom: "1.5rem",
              opacity: 0, animation: "ci-fadeIn .8s .38s ease forwards",
            }}>
              <p style={{
                fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                fontSize: "clamp(.85rem,2.4vw,1rem)",
                color: INK_3, letterSpacing: ".03em",
              }}>
                A personal invitation for
              </p>
              <p style={{
                fontFamily: DF, fontWeight: 600,
                fontSize: "clamp(1.4rem,5vw,1.9rem)",
                color: INK, letterSpacing: ".02em", lineHeight: 1.15,
                marginTop: ".25rem",
              }}>
                {guestLabel}
              </p>
            </div>

            {/* Card */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: 22,
              border: `1px solid ${BDR}`,
              boxShadow: "0 20px 60px rgba(60,20,30,.12), 0 4px 16px rgba(60,20,30,.06)",
              overflow: "hidden",
            }}>
              {/* Top accent stripe */}
              <div style={{
                height: 3,
                background: `linear-gradient(90deg, transparent 0%, ${ROSE_L} 18%, ${ROSE} 35%, ${GOLD_L} 50%, ${ROSE} 65%, ${ROSE_L} 82%, transparent 100%)`,
              }} />

              <div className="ci-card-p" style={{ padding: "clamp(1.5rem,5vw,2.25rem)" }}>

                {/* Brand eyebrow */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  justifyContent: "center", marginBottom: "1.75rem",
                  opacity: 0, animation: "ci-fadeIn .7s .65s ease forwards",
                }}>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${BDR_MD})` }} />
                  <span style={{
                    fontFamily: BF, fontSize: ".5rem", letterSpacing: ".44em",
                    textTransform: "uppercase", color: ROSE, fontWeight: 700,
                  }}>
                    {title}
                  </span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${BDR_MD})` }} />
                </div>

                {/* Wax seal monogram */}
                <div style={{
                  display: "flex", justifyContent: "center", marginBottom: "1.75rem",
                  opacity: 0, animation: "ci-scaleIn .9s .80s cubic-bezier(.34,1.56,.64,1) forwards",
                }}>
                  <div style={{
                    width: "clamp(70px,17vw,86px)", height: "clamp(70px,17vw,86px)",
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 38% 36%, ${GOLD_PALE}, ${GOLD_L} 60%, ${GOLD} 100%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "ci-sealPulse 3.2s 1.4s ease-in-out infinite",
                    position: "relative",
                  }}>
                    {/* Inner ring */}
                    <div style={{
                      position: "absolute", inset: 6, borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,.50)",
                    }} />
                    <span style={{
                      fontFamily: DF, fontSize: "clamp(1.15rem,3vw,1.5rem)",
                      color: "#FFFDF9", fontWeight: 700, letterSpacing: ".08em",
                      position: "relative", zIndex: 1,
                    }}>
                      {initials}
                    </span>
                  </div>
                </div>

                {/* Couple names */}
                <div style={{
                  textAlign: "center", marginBottom: "1.25rem",
                  opacity: 0, animation: "ci-riseIn .9s .95s cubic-bezier(.22,1,.36,1) forwards",
                }}>
                  <h1 style={{
                    fontFamily: DF, fontWeight: 700, lineHeight: .9,
                    fontSize: "clamp(1.9rem,7vw,3rem)",
                    letterSpacing: "-0.025em", color: INK,
                  }}>
                    {brideFirst}
                  </h1>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                    fontSize: "clamp(1.1rem,3.5vw,1.7rem)",
                    color: ROSE, lineHeight: 1.3, margin: ".12em 0", letterSpacing: ".06em",
                  }}>
                    &amp;
                  </p>
                  <h1 style={{
                    fontFamily: DF, fontWeight: 700, lineHeight: .9,
                    fontSize: "clamp(1.9rem,7vw,3rem)",
                    letterSpacing: "-0.025em", color: INK_2,
                  }}>
                    {groomFirst}
                  </h1>
                </div>

                {/* Gold ornamental rule */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  justifyContent: "center", margin: "1.25rem 0",
                  opacity: 0, animation: "ci-fadeIn .7s 1.05s ease forwards",
                }}>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, rgba(168,120,8,.40))` }} />
                  <span style={{ color: GOLD, fontSize: 12, lineHeight: 1 }}>✦</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, rgba(168,120,8,.40))` }} />
                </div>

                {/* Date + venue chips */}
                <div style={{
                  display: "flex", flexWrap: "wrap", justifyContent: "center",
                  gap: ".45rem", marginBottom: "1.5rem",
                  opacity: 0, animation: "ci-fadeIn .7s 1.15s ease forwards",
                }}>
                  {[
                    { text: weddingDate, r: true },
                    { text: venueName,   r: false },
                    { text: venueCity,   r: false },
                  ].filter(x => x.text).map(({ text, r }, i) => (
                    <span key={i} style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "5px 14px", borderRadius: 999,
                      background: r ? "rgba(190,45,69,.06)" : "rgba(168,120,8,.06)",
                      border: `1px solid ${r ? "rgba(190,45,69,.16)" : "rgba(168,120,8,.16)"}`,
                      color: r ? ROSE : GOLD,
                      fontSize: ".73rem", fontFamily: BF, fontWeight: 600, letterSpacing: ".04em",
                    }}>
                      {text}
                    </span>
                  ))}
                </div>

                {/* Personal greeting */}
                <div style={{
                  background: BG_LINEN,
                  border: `1px solid ${BDR}`,
                  borderRadius: 14,
                  padding: "1rem 1.125rem",
                  marginBottom: "1.75rem",
                  opacity: 0, animation: "ci-riseIn .9s 1.28s ease forwards",
                }}>
                  <p style={{
                    fontFamily: BF, fontSize: ".52rem", letterSpacing: ".30em",
                    textTransform: "uppercase", color: ROSE, fontWeight: 700,
                    marginBottom: ".5rem",
                  }}>
                    A personal welcome
                  </p>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(.875rem,2.2vw,1rem)",
                    color: INK, lineHeight: 1.8,
                  }}>
                    Dear {guestLabel},
                  </p>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(.875rem,2.2vw,1rem)",
                    color: INK_2, lineHeight: 1.8, marginTop: ".35rem",
                  }}>
                    {brideFirst} and {groomFirst} warmly invite you to witness
                    and celebrate their union. You are not just a guest —
                    you are part of the story that brought them here.
                  </p>
                </div>

                {/* CTA */}
                <div style={{ opacity: 0, animation: "ci-riseIn .9s 1.50s cubic-bezier(.22,1,.36,1) forwards" }}>
                  <button type="button" className="ci-cta" onClick={openInvitation}>
                    Open your invitation
                  </button>
                  <p style={{
                    marginTop: ".875rem", textAlign: "center",
                    fontFamily: BF, fontSize: ".62rem",
                    color: INK_4, letterSpacing: ".04em", lineHeight: 1.6,
                  }}>
                    {subtitle}
                  </p>
                </div>

              </div>

              {/* Bottom accent stripe */}
              <div style={{
                height: 3,
                background: `linear-gradient(90deg, transparent 0%, ${ROSE_L} 18%, ${ROSE} 35%, ${GOLD_L} 50%, ${ROSE} 65%, ${ROSE_L} 82%, transparent 100%)`,
              }} />
            </div>

            {/* Below-card caption */}
            <p style={{
              marginTop: "1.25rem", textAlign: "center",
              fontFamily: BF, fontSize: ".48rem", letterSpacing: ".38em",
              textTransform: "uppercase", color: INK_4,
              opacity: 0, animation: "ci-fadeIn .7s 1.75s ease forwards",
            }}>
              {brideFirst} &amp; {groomFirst} · {weddingDate ?? ""}
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 3 · HERO — light cream photo wash, editorial
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "hero" && (
        <div className={heroVis ? "ci-vis" : ""}>

          <section style={{
            position: "relative",
            minHeight: "100dvh",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center",
            overflow: "hidden",
            background: BG,
          }}>
            {/* Photo — desaturated, medium brightness */}
            {heroPhotoUrl && (
              <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
                <div style={{
                  position: "absolute", inset: "-7%",
                  backgroundImage: `url(${heroPhotoUrl})`,
                  backgroundSize: "cover", backgroundPosition: "center center",
                  filter: "saturate(.42) brightness(.72)",
                  animation: "ci-slowZoom 36s ease-in-out infinite alternate",
                }} />
              </div>
            )}

            {/* Warm cream wash — light, not dark */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 1,
              background: `
                linear-gradient(to bottom,
                  rgba(253,250,247,.90) 0%,
                  rgba(253,250,247,.62) 18%,
                  rgba(253,250,247,.52) 42%,
                  rgba(253,250,247,.74) 66%,
                  rgba(253,250,247,.97) 100%
                )
              `,
            }} />

            {/* Side vignette */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 2,
              background: "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 42%, rgba(241,233,224,.48) 100%)",
            }} />

            {/* Ambient blooms */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
              background: `
                radial-gradient(ellipse 60% 50% at 15% 22%, rgba(190,45,69,.04) 0%, transparent 58%),
                radial-gradient(ellipse 50% 45% at 86% 78%, rgba(168,120,8,.04) 0%, transparent 52%)
              `,
            }} />

            {/* Top linen fade */}
            <div aria-hidden style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 72,
              background: `linear-gradient(to bottom, ${BG}, transparent)`, zIndex: 3,
            }} />

            {/* Content */}
            <div style={{
              position: "relative", zIndex: 5,
              padding: "6rem 1.5rem 8rem",
              maxWidth: 680, width: "100%",
            }}>

              {/* Eyebrow */}
              <div className="ci-h0" style={{
                display: "flex", alignItems: "center", gap: 14,
                justifyContent: "center", marginBottom: "2rem",
              }}>
                <div style={{ width: 36, height: 1, background: `linear-gradient(to right, transparent, ${ROSE_MID})` }} />
                <span style={{
                  fontFamily: BF, fontSize: ".5rem", letterSpacing: ".50em",
                  textTransform: "uppercase", color: ROSE, fontWeight: 700,
                }}>
                  {title}
                </span>
                <div style={{ width: 36, height: 1, background: `linear-gradient(to left, transparent, ${ROSE_MID})` }} />
              </div>

              {/* Bride */}
              <h1 className="ci-h1 ci-hero-name" style={{
                fontFamily: DF,
                fontSize: "clamp(3.5rem,12vw,8.5rem)",
                fontWeight: 700, lineHeight: .87, letterSpacing: "-0.03em",
                color: INK,
                marginBottom: ".04em",
              }}>
                {brideFirst}
              </h1>

              {/* & */}
              <p className="ci-h2" style={{
                fontFamily: DF, fontSize: "clamp(1.4rem,4vw,2.8rem)",
                fontWeight: 300, fontStyle: "italic",
                color: ROSE, letterSpacing: ".08em", lineHeight: 1.25,
                marginBottom: ".04em",
              }}>
                &amp;
              </p>

              {/* Groom */}
              <h1 className="ci-h3 ci-hero-name" style={{
                fontFamily: DF,
                fontSize: "clamp(3.5rem,12vw,8.5rem)",
                fontWeight: 700, lineHeight: .87, letterSpacing: "-0.03em",
                color: INK_2,
                marginBottom: "1.75rem",
              }}>
                {groomFirst}
              </h1>

              {/* Gold rule */}
              <div className="ci-hl" style={{
                width: "min(240px,52%)", height: 1, margin: "0 auto 1.75rem",
                background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)`,
                opacity: 0,
              }} />

              {/* Date · Venue · City */}
              <div className="ci-h4" style={{
                display: "flex", flexWrap: "wrap", alignItems: "center",
                justifyContent: "center", gap: ".6rem", marginBottom: "1.25rem",
              }}>
                {weddingDate && (
                  <span style={{ fontFamily: BF, fontSize: ".9rem", color: INK, letterSpacing: ".05em", fontWeight: 600 }}>
                    {weddingDate}
                  </span>
                )}
                {venueName && (
                  <>
                    <span aria-hidden style={{ width: 3, height: 3, borderRadius: "50%", background: ROSE, display: "inline-block", opacity: .55 }} />
                    <span style={{ fontFamily: BF, fontSize: ".875rem", color: INK_2, letterSpacing: ".04em", fontWeight: 500 }}>
                      {venueName}
                    </span>
                  </>
                )}
                {venueCity && (
                  <>
                    <span aria-hidden style={{ width: 3, height: 3, borderRadius: "50%", background: ROSE, display: "inline-block", opacity: .35 }} />
                    <span style={{ fontFamily: BF, fontSize: ".875rem", color: INK_3, letterSpacing: ".04em" }}>
                      {venueCity}
                    </span>
                  </>
                )}
              </div>

              {/* Personal tag */}
              <div className="ci-h5" style={{ marginBottom: "2.5rem" }}>
                <span style={{
                  display: "inline-block", padding: "6px 20px",
                  border: `1px solid ${BDR_MD}`, borderRadius: 999,
                  fontFamily: DF, fontStyle: "italic",
                  fontSize: "clamp(.8rem,1.9vw,.94rem)",
                  color: ROSE, letterSpacing: ".03em",
                  background: ROSE_PALE,
                }}>
                  A personal invitation for {guestLabel}
                </span>
              </div>

              {/* View invitation CTA */}
              <div className="ci-h6">
                <a href="#invite-content" className="ci-view-btn">
                  View invitation
                </a>
              </div>
            </div>

            {/* Scroll hint */}
            <div className="ci-h8" style={{
              position: "absolute", bottom: 24, left: "50%",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
              zIndex: 5,
              animation: "ci-bounce 2.4s 2s ease-in-out infinite",
            }}>
              <span style={{
                fontFamily: BF, fontSize: ".44rem", letterSpacing: ".40em",
                textTransform: "uppercase", color: INK_4,
              }}>
                Scroll
              </span>
              <div style={{
                width: 1, height: 30,
                background: `linear-gradient(to bottom, ${ROSE_MID}, transparent)`,
              }} />
              <ChevronDown size={12} style={{ color: ROSE_MID, marginTop: -5 }} />
            </div>
          </section>

          {/* Invite page content */}
          <div id="invite-content">{children}</div>
        </div>
      )}
    </>
  );
}

export default CinematicIntro;
