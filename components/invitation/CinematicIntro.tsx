"use client";

/**
 * CinematicIntro — Ultra-Luxury Edition
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  EXPERIENCE PHILOSOPHY: "The Atelier Invitation"
 *
 *  This is what you receive when a Michelin-starred chef hand-delivers your
 *  menu card, or a fashion house sends its show invitation in a lacquered box.
 *  Every micro-interaction has weight. Every transition has breath.
 *  Nothing is instant. Everything is considered.
 *
 *  LUXURY EXPERIENCE PILLARS IMPLEMENTED:
 *  ① Custom cursor — a soft rose glow that follows the pointer and expands on
 *    hover over interactive elements. Signals: "this world responds to you."
 *  ② Character-by-character name reveal — not a word fade, each letter of the
 *    bride's and groom's first name lands with a spring, staggered 40ms apart.
 *    Like hand-stamped letterpress, not a laser printer.
 *  ③ Cinematic silk canvas — Phase 1 opens on a near-black deep-ink surface
 *    with a animated diagonal silk-weave SVG texture. The contrast with the
 *    warm envelope phase creates a deliberate "reveal" moment.
 *  ④ Gold thread draw — an animated SVG path traces an ornamental border
 *    around the scene, as if drawn by a calligrapher in real time.
 *  ⑤ Envelope ceremonial break — when the guest clicks "Open", the wax seal
 *    cracks (scale + opacity split), the card doesn't just fade — it performs
 *    a 3D perspective unfold before dissolving.
 *  ⑥ Magnetic CTA — the Open button follows the cursor within its bounds,
 *    creating a physical pull that makes clicking feel inevitable.
 *  ⑦ Parallax hero — the background photo and the text layer move at different
 *    rates on scroll, creating depth without any library.
 *  ⑧ Ambient sound visualiser — when audio is active, three bars pulse next to
 *    the mute button, confirming the atmosphere is live.
 *  ⑨ Countdown presence — a live days/hours ticker is embedded in Phase 1's
 *    final scene and in the Hero, treating time as part of the invitation.
 *  ⑩ Staggered page curtain open — hero names don't fade in, they're revealed
 *    by a rising mask (clip-path inset), like velvet being drawn back.
 *
 *  PHASE FLOW:
 *    Phase 1 · CEREMONY  — Dark silk canvas, 6 scenes, ~18 s
 *    Phase 2 · ATELIER   — Warm ivory card, seal break, magnetic CTA
 *    Phase 3 · UNVEIL    — Light photo hero, parallax, curtain-reveal names
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { ReactNode } from "react";
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { ChevronDown, SkipForward, Volume2, VolumeX } from "lucide-react";

// ── Platform tokens ────────────────────────────────────────────────────────
const ROSE      = "#BE2D45";
const ROSE_H    = "#A42539";
const ROSE_L    = "#D44860";
const ROSE_PALE = "#FBEBEE";
const ROSE_MID  = "#F0BEC6";
const GOLD      = "#A87808";
const GOLD_L    = "#C9960A";
const GOLD_B    = "#E8B40C";
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

// ── Ceremony phase (dark silk) palette ────────────────────────────────────
const SILK      = "#0C0709";  // near-black warm
const SILK_2    = "#1A0F12";
const SILK_GOLD = "rgba(201,150,10,0.80)";
const SILK_ROSE = "rgba(190,45,69,0.70)";
const SILK_CREAM= "rgba(253,250,247,0.88)";
const SILK_DIM  = "rgba(253,250,247,0.38)";

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

const NOISE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

// ── Props ──────────────────────────────────────────────────────────────────
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

type Phase = "ceremony" | "atelier" | "unveil";

// ── Deterministic particles ────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id:    i,
  left:  `${4 + (i * 3.4) % 92}%`,
  size:  1.2 + (i % 5) * 0.5,
  dur:   16 + (i % 8) * 2.5,
  delay: (i * 1.3) % 12,
  gold:  i % 3 !== 0,
}));

// Scene durations ms — 6 scenes in ceremony phase
const SCENE_HOLD: number[] = [3200, 2800, 2800, 2600, 2800, 3200];
const CROSSFADE  = 750;

// Character stagger ms
const CHAR_STAGGER = 42;

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Splits a word into individually animated character spans */
function CharReveal({
  word, color, style, delay = 0,
}: {
  word: string; color: string; style?: React.CSSProperties; delay?: number;
}) {
  return (
    <span style={{ display: "inline-block", ...style }}>
      {word.split("").map((ch, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: 0,
            animation: `ci-charDrop .9s ${delay + i * CHAR_STAGGER}ms cubic-bezier(.34,1.56,.64,1) forwards`,
            color,
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

/** Live countdown to a target date */
function Countdown({ target, style }: { target: string; style?: React.CSSProperties }) {
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    function tick() {
      const ms = new Date(target).getTime() - Date.now();
      if (ms <= 0) { setLabel("Today"); return; }
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      if (d > 1) setLabel(`${d} days away`);
      else if (d === 1) setLabel(`Tomorrow · ${h}h ${m}m`);
      else setLabel(`${h}h ${m}m remaining`);
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [target]);

  if (!label) return null;
  return <span style={style}>{label}</span>;
}

// ═══════════════════════════════════════════════════════════════════════════
export function CinematicIntro({
  inviteCode, guestLabel, brideName, groomName,
  title, subtitle, weddingDate, venueName, venueCity,
  heroPhotoUrl, audioSrc = "/audio/wedding-theme.mp3", children,
}: CinematicIntroProps) {

  const [isMounted,    setIsMounted]    = useState(false);
  const [phase,        setPhase]        = useState<Phase>("ceremony");
  const [scene,        setScene]        = useState(0);
  const [sceneVis,     setSceneVis]     = useState(true);
  const [phaseLeaving, setPhaseLeaving] = useState(false);
  const [unveilVis,    setUnveilVis]    = useState(false);
  const [isMuted,      setIsMuted]      = useState(true);
  const [audioAvail,   setAudioAvail]   = useState<boolean | null>(audioSrc ? null : false);
  const [sealBroken,   setSealBroken]   = useState(false);
  const [cardLifting,  setCardLifting]  = useState(false);

  // Custom cursor
  const [cursor,       setCursor]       = useState({ x: -100, y: -100, big: false });

  // Magnetic CTA
  const ctaRef   = useRef<HTMLButtonElement | null>(null);
  const [ctaMag, setCtaMag] = useState({ x: 0, y: 0 });

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const sceneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroRef    = useRef<HTMLElement | null>(null);
  const storageKey = `surihana-intro:${inviteCode}`;
  const cookieName = `invite_intro_seen_${inviteCode}`;

  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;
  const initials   = useMemo(() =>
    `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase(),
    [brideName, groomName]
  );

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === "undefined") return;
    const hasCookie  = document.cookie.split(";").some(c => c.trim().startsWith(`${cookieName}=`));
    const hasSession = sessionStorage.getItem(storageKey) === "entered";
    if (hasCookie || hasSession) {
      setPhase("unveil");
      setTimeout(() => setUnveilVis(true), 80);
    }
  }, [cookieName, storageKey]);

  // ── Custom cursor tracking ─────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const move = (e: MouseEvent) => setCursor(c => ({ ...c, x: e.clientX, y: e.clientY }));
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // ── Parallax hero on scroll ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "unveil" || typeof window === "undefined") return;
    const onScroll = () => {
      const el = heroRef.current;
      if (!el) return;
      const photo = el.querySelector<HTMLElement>(".ci-parallax-photo");
      if (photo) photo.style.transform = `translateY(${window.scrollY * 0.28}px) scale(1.07)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase]);

  // ── Scene auto-advance ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "ceremony") return;
    const hold = SCENE_HOLD[scene] ?? 3000;
    sceneTimer.current = setTimeout(() => {
      setSceneVis(false);
      setTimeout(() => {
        if (scene < SCENE_HOLD.length - 1) {
          setScene(s => s + 1);
          setSceneVis(true);
        } else {
          goToAtelier();
        }
      }, CROSSFADE);
    }, hold);
    return () => { if (sceneTimer.current) clearTimeout(sceneTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, phase]);

  // ── Magnetic CTA ──────────────────────────────────────────────────────────
  function handleMagMove(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = ctaRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * 0.28;
    const y = (e.clientY - r.top  - r.height / 2) * 0.28;
    setCtaMag({ x, y });
  }
  function handleMagLeave() { setCtaMag({ x: 0, y: 0 }); }

  // ── Audio ──────────────────────────────────────────────────────────────────
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

  // ── Phase transitions ──────────────────────────────────────────────────────
  function fadeOut(cb: () => void, ms = 900) {
    setPhaseLeaving(true);
    setTimeout(() => { setPhaseLeaving(false); cb(); }, ms);
  }

  function goToAtelier() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    fadeOut(() => setPhase("atelier"));
  }

  function skipToAtelier() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    setSceneVis(false);
    fadeOut(() => setPhase("atelier"), 700);
  }

  function openInvitation() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "entered");
      const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${cookieName}=1; expires=${exp}; path=/; SameSite=Lax`;
    }
    if (audioRef.current) audioRef.current.pause();
    // Seal cracks, then card lifts
    setSealBroken(true);
    setTimeout(() => setCardLifting(true), 350);
    setTimeout(() => {
      fadeOut(() => {
        setPhase("unveil");
        requestAnimationFrame(() => requestAnimationFrame(() => setUnveilVis(true)));
      }, 900);
    }, 500);
  }

  if (!isMounted) {
    return <div style={{ minHeight: "100dvh", background: SILK }}>{children}</div>;
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          GLOBAL KEYFRAMES + COMPONENT CSS
      ══════════════════════════════════════════════════════════════════ */}
      <style>{`
        /* ── primitives ── */
        @keyframes ci-fadeIn   {from{opacity:0}to{opacity:1}}
        @keyframes ci-riseIn   {from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ci-sinkIn   {from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ci-scaleIn  {from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
        @keyframes ci-lineGrow {from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:1}}

        /* ── letter drop (spring) — luxury name reveal ── */
        @keyframes ci-charDrop {
          0%   {opacity:0;transform:translateY(-40px) rotate(-4deg) scale(.7)}
          60%  {opacity:1;transform:translateY(5px) rotate(1deg) scale(1.04)}
          80%  {transform:translateY(-2px) rotate(0deg) scale(.99)}
          100% {opacity:1;transform:translateY(0) rotate(0deg) scale(1)}
        }

        /* ── curtain reveal — luxury name lift ── */
        @keyframes ci-curtain {
          0%   {clip-path:inset(100% 0 0 0)}
          100% {clip-path:inset(0% 0 0 0)}
        }

        /* ── SVG gold thread draw — ceremony border ── */
        @keyframes ci-drawPath {
          from{stroke-dashoffset:var(--path-len,2000)}
          to  {stroke-dashoffset:0}
        }

        /* ── atmosphere ── */
        @keyframes ci-breathe  {0%,100%{opacity:.75;transform:scale(1)}50%{opacity:1;transform:scale(1.025)}}
        @keyframes ci-slowZoom {0%{transform:translateY(0) scale(1.07)}100%{transform:translateY(var(--py,0px)) scale(1.14)}}
        @keyframes ci-silkShimmer {
          0%  {background-position:200% 50%}
          100%{background-position:-200% 50%}
        }

        /* ── particles ── */
        @keyframes ci-float {
          0%  {transform:translateY(110vh) translateX(0)    rotate(0deg);opacity:0}
          4%  {opacity:.6}
          80% {opacity:.12}
          100%{transform:translateY(-10vh) translateX(20px) rotate(480deg);opacity:0}
        }
        @keyframes ci-floatL {
          0%  {transform:translateY(110vh) translateX(0)    rotate(0deg);opacity:0}
          4%  {opacity:.5}
          80% {opacity:.10}
          100%{transform:translateY(-10vh) translateX(-20px) rotate(-480deg);opacity:0}
        }

        /* ── seal crack ── */
        @keyframes ci-sealCrack {
          0%  {transform:scale(1) rotate(0deg);opacity:1}
          30% {transform:scale(1.15) rotate(-3deg);opacity:.9}
          60% {transform:scale(.85) rotate(6deg);opacity:.6}
          100%{transform:scale(0) rotate(20deg);opacity:0}
        }
        @keyframes ci-sealPulse {
          0%,100%{box-shadow:0 0 0 0 rgba(168,120,8,0),0 8px 32px rgba(10,6,8,.45)}
          50%    {box-shadow:0 0 0 14px rgba(168,120,8,.10),0 8px 32px rgba(10,6,8,.55)}
        }

        /* ── card lift (3-D unfold) ── */
        @keyframes ci-cardLift {
          0%  {transform:perspective(1200px) rotateX(0) translateY(0) scale(1);opacity:1;filter:brightness(1)}
          40% {transform:perspective(1200px) rotateX(-8deg) translateY(-20px) scale(.98);opacity:.9;filter:brightness(1.08)}
          100%{transform:perspective(1200px) rotateX(-18deg) translateY(-80px) scale(.93);opacity:0;filter:brightness(1.2)}
        }

        /* ── unveil / hero reveals (curtain) ── */
        .ci-h0,.ci-h1,.ci-h2,.ci-h3,.ci-h4,.ci-h5,.ci-h6,.ci-h7,.ci-h8{opacity:0}
        .ci-vis .ci-h0{animation:ci-fadeIn  .7s .00s ease forwards}
        .ci-vis .ci-h1{animation:ci-curtain 1.1s .18s cubic-bezier(.16,1,.30,1) forwards;clip-path:inset(100% 0 0 0);opacity:1}
        .ci-vis .ci-h2{animation:ci-fadeIn  .8s .30s ease forwards}
        .ci-vis .ci-h3{animation:ci-curtain 1.1s .44s cubic-bezier(.16,1,.30,1) forwards;clip-path:inset(100% 0 0 0);opacity:1}
        .ci-vis .ci-h4{animation:ci-riseIn  .9s .62s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h5{animation:ci-riseIn  .9s .78s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h6{animation:ci-riseIn  .85s .94s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h7{animation:ci-riseIn  .80s 1.10s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h8{animation:ci-riseIn  .75s 1.24s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-hl{transform-origin:center;animation:ci-lineGrow 1.0s .50s ease forwards}

        /* ── scroll bounce ── */
        @keyframes ci-bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)}}

        /* ── phase ── */
        .ci-phase{transition:opacity .9s cubic-bezier(.4,0,.2,1)}
        .ci-leaving{opacity:0!important;pointer-events:none}

        /* ── sound visualiser bars ── */
        @keyframes ci-bar1{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
        @keyframes ci-bar2{0%,100%{transform:scaleY(.7)}50%{transform:scaleY(.3)}}
        @keyframes ci-bar3{0%,100%{transform:scaleY(.5)}50%{transform:scaleY(.9)}}

        /* ── shimmer sweep (atelier CTA button) ── */
        @keyframes ci-sweep{0%{background-position:200% 0}45%{background-position:-200% 0}100%{background-position:-200% 0}}

        /* ── custom cursor ── */
        .ci-cursor {
          position:fixed;
          top:0;left:0;
          width:14px;height:14px;
          border-radius:50%;
          background:rgba(190,45,69,.55);
          pointer-events:none;
          z-index:99999;
          transform:translate(-50%,-50%);
          transition:width .18s ease,height .18s ease,background .18s ease,opacity .18s ease;
          mix-blend-mode:multiply;
        }
        .ci-cursor.big{width:40px;height:40px;background:rgba(190,45,69,.18)}

        /* ── atelier CTA button ── */
        .ci-cta {
          display:flex;align-items:center;justify-content:center;gap:12px;
          width:100%;padding:18px 24px;
          background:linear-gradient(135deg, ${ROSE_L} 0%, ${ROSE} 50%, ${ROSE_H} 100%);
          border:none;border-radius:16px;color:#fff;
          font-family:${BF};font-size:.82rem;font-weight:700;
          letter-spacing:.24em;text-transform:uppercase;cursor:none;
          box-shadow:0 12px 40px rgba(190,45,69,.32),0 4px 12px rgba(190,45,69,.16);
          transition:box-shadow .25s ease,filter .15s ease;
          position:relative;overflow:hidden;
          will-change:transform;
        }
        .ci-cta::after{
          content:'';position:absolute;inset:0;
          background:linear-gradient(105deg,transparent 36%,rgba(255,255,255,.22) 50%,transparent 64%);
          background-size:200% 100%;background-position:200% 0;
          animation:ci-sweep 3s 1.8s ease infinite;pointer-events:none;
        }
        .ci-cta:hover{filter:brightness(1.06);box-shadow:0 20px 52px rgba(190,45,69,.40),0 6px 16px rgba(190,45,69,.22)}

        /* ── chip ── */
        .ci-chip{
          display:inline-flex;align-items:center;gap:5px;
          padding:6px 14px;background:rgba(255,255,255,.09);
          border:1px solid rgba(255,255,255,.16);border-radius:999px;
          color:rgba(255,255,255,.52);
          font-family:${BF};font-size:.6rem;font-weight:600;
          letter-spacing:.16em;text-transform:uppercase;cursor:pointer;
          backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
          transition:background .18s ease,border-color .18s ease,color .18s ease;
        }
        .ci-chip:hover{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.32);color:rgba(255,255,255,.88)}
        .ci-chip-light{
          display:inline-flex;align-items:center;gap:5px;
          padding:6px 14px;background:rgba(255,255,255,.72);
          border:1px solid ${BDR_MD};border-radius:999px;
          color:${INK_3};
          font-family:${BF};font-size:.6rem;font-weight:600;
          letter-spacing:.16em;text-transform:uppercase;cursor:pointer;
          backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
          transition:background .18s ease,border-color .18s ease,color .18s ease;
        }
        .ci-chip-light:hover{background:${ROSE_PALE};border-color:rgba(190,45,69,.28);color:${ROSE}}

        /* ── hero view link ── */
        .ci-view-btn{
          display:inline-flex;align-items:center;gap:9px;
          padding:14px 38px;
          background:rgba(255,255,255,.10);
          border:1.5px solid rgba(190,45,69,.28);
          border-radius:999px;color:${INK};
          font-family:${BF};font-size:.72rem;font-weight:600;
          letter-spacing:.18em;text-transform:uppercase;
          text-decoration:none;
          backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
          transition:all .30s cubic-bezier(.22,1,.36,1);
        }
        .ci-view-btn:hover{
          background:rgba(190,45,69,.07);border-color:${ROSE};color:${ROSE};
          transform:translateY(-2px);box-shadow:0 10px 28px rgba(190,45,69,.14);
        }

        /* ── mobile ── */
        @media(max-width:480px){
          .ci-n-lg  {font-size:clamp(3.6rem,18vw,6.5rem)!important}
          .ci-n-pair{font-size:clamp(2.8rem,13vw,4.8rem)!important}
          .ci-card-p{padding:1.5rem!important}
          .ci-h-name{font-size:clamp(3rem,13vw,7rem)!important}
        }
      `}</style>

      {/* ── Custom cursor (ceremony + atelier phases only) ── */}
      {(phase === "ceremony" || phase === "atelier") && (
        <div
          className={`ci-cursor${cursor.big ? " big" : ""}`}
          style={{ left: cursor.x, top: cursor.y }}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 1 · CEREMONY — dark silk canvas
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "ceremony" && (
        <div
          className={`ci-phase${phaseLeaving ? " ci-leaving" : ""}`}
          onMouseMove={() => setCursor(c => ({ ...c, big: false }))}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: SILK,
            backgroundImage: NOISE_BG,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            overflow: "hidden", cursor: "none",
          }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* Silk weave animated gradient */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `
              repeating-linear-gradient(
                45deg,
                rgba(255,255,255,0) 0px,
                rgba(255,255,255,0) 18px,
                rgba(255,255,255,.012) 18px,
                rgba(255,255,255,.012) 19px
              ),
              repeating-linear-gradient(
                -45deg,
                rgba(255,255,255,0) 0px,
                rgba(255,255,255,0) 18px,
                rgba(255,255,255,.010) 18px,
                rgba(255,255,255,.010) 19px
              )
            `,
          }} />

          {/* Atmospheric glows */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `
              radial-gradient(ellipse 72% 52% at 22% 32%, rgba(190,45,69,.10) 0%, transparent 62%),
              radial-gradient(ellipse 60% 48% at 82% 72%, rgba(168,120,8,.09) 0%, transparent 58%),
              radial-gradient(ellipse 50% 40% at 50% 50%, rgba(30,12,18,.40) 0%, transparent 70%)
            `,
            animation: "ci-breathe 14s ease-in-out infinite",
          }} />

          {/* Letterbox bars — cinematic 2.35:1 */}
          <div aria-hidden style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: "clamp(44px,8.5vh,84px)", zIndex: 6,
            background: `linear-gradient(to bottom, rgba(5,3,4,.98), rgba(5,3,4,.50))`,
          }} />
          <div aria-hidden style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: "clamp(44px,8.5vh,84px)", zIndex: 6,
            background: `linear-gradient(to top, rgba(5,3,4,.98), rgba(5,3,4,.50))`,
          }} />

          {/* Radial vignette */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,.70) 100%)",
            zIndex: 3,
          }} />

          {/* Floating particles */}
          {PARTICLES.map(p => (
            <div key={p.id} aria-hidden style={{
              position: "absolute", bottom: "-12px", left: p.left,
              width: p.size, height: p.size * 1.5,
              borderRadius: "50% 50% 48% 52% / 60% 60% 40% 40%",
              background: p.gold
                ? `rgba(201,150,10,${0.20 + (p.id % 4) * 0.06})`
                : `rgba(190,45,69,${0.16 + (p.id % 5) * 0.05})`,
              opacity: 0,
              animation: `${p.id % 2 === 0 ? "ci-float" : "ci-floatL"} ${p.dur}s ${p.delay}s linear infinite`,
              filter: "blur(.4px)",
            }} />
          ))}

          {/* SVG ornamental border — gold thread draw */}
          <svg
            aria-hidden
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              zIndex: 4, pointerEvents: "none", overflow: "visible",
            }}
            preserveAspectRatio="none"
          >
            <rect
              x="32" y="32"
              width="calc(100% - 64px)" height="calc(100% - 64px)"
              rx="6" ry="6"
              fill="none"
              stroke={GOLD_L}
              strokeWidth="0.6"
              strokeOpacity="0.4"
              strokeDasharray="2000"
              style={{
                strokeDashoffset: 0,
                animation: "ci-drawPath 4s .4s ease forwards",
                "--path-len": "2000",
              } as React.CSSProperties}
            />
            <rect
              x="40" y="40"
              width="calc(100% - 80px)" height="calc(100% - 80px)"
              rx="4" ry="4"
              fill="none"
              stroke={ROSE}
              strokeWidth="0.3"
              strokeOpacity="0.25"
              strokeDasharray="1800"
              style={{
                strokeDashoffset: 0,
                animation: "ci-drawPath 4.5s .8s ease forwards",
                "--path-len": "1800",
              } as React.CSSProperties}
            />
          </svg>

          {/* Corner ornaments */}
          {[
            { top: 52, left: 52 },
            { top: 52, right: 52 },
            { bottom: 52, left: 52 },
            { bottom: 52, right: 52 },
          ].map((pos, i) => (
            <div key={i} aria-hidden style={{
              position: "absolute", ...pos, zIndex: 5,
              width: 18, height: 18,
              opacity: 0, animation: `ci-fadeIn .6s ${1.5 + i * 0.15}s ease forwards`,
            }}>
              <svg viewBox="0 0 18 18" fill="none">
                <path d="M9 1 L9 17 M1 9 L17 9" stroke={GOLD_L} strokeWidth="0.5" strokeOpacity="0.5" />
                <path d="M9 1 L9 5 M9 13 L9 17 M1 9 L5 9 M13 9 L17 9" stroke={GOLD_L} strokeWidth="1.2" strokeOpacity="0.35" />
              </svg>
            </div>
          ))}

          {/* Controls (from scene 1) */}
          {scene >= 1 && (
            <div style={{
              position: "absolute", top: "clamp(50px,10vh,94px)", right: 20, zIndex: 10,
              display: "flex", gap: 8,
              opacity: 0, animation: "ci-fadeIn .7s .3s ease forwards",
            }}>
              {audioAvail === true && (
                <button
                  type="button"
                  onClick={toggleMusic}
                  className="ci-chip"
                  onMouseEnter={() => setCursor(c => ({ ...c, big: true }))}
                  onMouseLeave={() => setCursor(c => ({ ...c, big: false }))}
                >
                  {/* Sound visualiser */}
                  {!isMuted ? (
                    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: 12 }}>
                      {[{ a: "ci-bar1", h: 10 }, { a: "ci-bar2", h: 8 }, { a: "ci-bar3", h: 12 }].map((b, i) => (
                        <span key={i} style={{
                          width: 2, height: b.h, borderRadius: 1,
                          background: GOLD_L, transformOrigin: "bottom",
                          animation: `${b.a} .8s ${i * 0.12}s ease-in-out infinite`,
                        }} />
                      ))}
                    </span>
                  ) : (
                    <VolumeX size={11} />
                  )}
                  {isMuted ? "Music" : "Live"}
                </button>
              )}
              <button
                type="button"
                onClick={skipToAtelier}
                className="ci-chip"
                onMouseEnter={() => setCursor(c => ({ ...c, big: true }))}
                onMouseLeave={() => setCursor(c => ({ ...c, big: false }))}
              >
                <SkipForward size={11} /> Skip
              </button>
            </div>
          )}

          {/* ── SCENE STAGE ── */}
          <div style={{
            position: "relative", zIndex: 5,
            textAlign: "center",
            padding: "0 clamp(24px,8vw,100px)",
            width: "100%", maxWidth: 760,
            opacity: sceneVis ? 1 : 0,
            transition: `opacity ${CROSSFADE}ms cubic-bezier(.4,0,.2,1)`,
          }}>

            {/* Scene 0 — Atelier eyebrow */}
            {scene === 0 && (
              <div style={{ opacity: 0, animation: "ci-scaleIn 1.2s .2s cubic-bezier(.22,1,.36,1) forwards" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 16,
                  justifyContent: "center", marginBottom: "2.25rem",
                }}>
                  {[
                    { from: "transparent", to: GOLD_L, origin: "right" },
                    { from: GOLD_L, to: "transparent", origin: "left" },
                  ].map((l, i) => (
                    <div key={i} style={{
                      flex: 1, maxWidth: 100, height: 1,
                      background: `linear-gradient(to ${i === 0 ? "right" : "left"}, ${l.from}, ${l.to})`,
                      transformOrigin: l.origin,
                      opacity: 0, animation: `ci-lineGrow 1.4s ${.6 + i * .1}s ease forwards`,
                    }} />
                  ))}
                  <span style={{
                    color: GOLD_L, fontSize: 16, lineHeight: 1,
                    opacity: 0, animation: "ci-fadeIn .6s 1.1s ease forwards",
                    filter: "drop-shadow(0 0 6px rgba(201,150,10,.6))",
                  }}>✦</span>
                </div>
                <p style={{
                  fontFamily: BF, fontSize: "clamp(.48rem,1.4vw,.60rem)",
                  letterSpacing: ".55em", textTransform: "uppercase",
                  color: SILK_GOLD, fontWeight: 700, marginBottom: "2rem",
                  opacity: 0, animation: "ci-riseIn .9s .4s ease forwards",
                }}>
                  {title}
                </p>
                <p style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1.1rem,3.2vw,1.6rem)",
                  color: SILK_DIM, letterSpacing: ".05em", lineHeight: 1.6,
                  opacity: 0, animation: "ci-riseIn 1s .7s ease forwards",
                }}>
                  A love story sealed in time
                </p>
                {/* Double rules */}
                <div style={{
                  display: "flex", flexDirection: "column", gap: 5,
                  alignItems: "center", marginTop: "2.25rem",
                  opacity: 0, animation: "ci-fadeIn .8s 1.1s ease forwards",
                }}>
                  <div style={{ width: "min(220px,44%)", height: 1, background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)` }} />
                  <div style={{ width: "min(120px,24%)", height: 1, background: `linear-gradient(90deg, transparent, rgba(201,150,10,.3), transparent)` }} />
                </div>
              </div>
            )}

            {/* Scene 1 — The Bride (char reveal) */}
            {scene === 1 && (
              <div>
                <p style={{
                  fontFamily: BF, fontSize: "clamp(.44rem,1.1vw,.56rem)",
                  letterSpacing: ".46em", textTransform: "uppercase",
                  color: SILK_ROSE, fontWeight: 700, marginBottom: "1.25rem",
                  opacity: 0, animation: "ci-sinkIn .9s .05s ease forwards",
                }}>
                  The bride
                </p>
                <CharReveal
                  word={brideFirst}
                  color={SILK_CREAM}
                  style={{
                    fontFamily: DF,
                    fontSize: "clamp(4.5rem,14vw,10rem)",
                    fontWeight: 700, lineHeight: .84,
                    letterSpacing: "-0.035em",
                    textShadow: `0 4px 60px rgba(0,0,0,.70), 0 0 120px rgba(190,45,69,.12)`,
                  }}
                  delay={150}
                />
                <div style={{
                  width: "min(220px,46%)", height: 2, margin: "1.75rem auto 0",
                  background: `linear-gradient(90deg, transparent, ${ROSE}, transparent)`,
                  transformOrigin: "center", borderRadius: 2,
                  opacity: 0, animation: "ci-lineGrow 1.1s .9s ease forwards",
                  boxShadow: `0 0 12px rgba(190,45,69,.45)`,
                }} />
              </div>
            )}

            {/* Scene 2 — The Groom (char reveal) */}
            {scene === 2 && (
              <div>
                <p style={{
                  fontFamily: BF, fontSize: "clamp(.44rem,1.1vw,.56rem)",
                  letterSpacing: ".46em", textTransform: "uppercase",
                  color: SILK_GOLD, fontWeight: 700, marginBottom: "1.25rem",
                  opacity: 0, animation: "ci-sinkIn .9s .05s ease forwards",
                }}>
                  &amp; the groom
                </p>
                <CharReveal
                  word={groomFirst}
                  color={`rgba(232,180,12,0.90)`}
                  style={{
                    fontFamily: DF,
                    fontSize: "clamp(4.5rem,14vw,10rem)",
                    fontWeight: 700, lineHeight: .84,
                    letterSpacing: "-0.035em",
                    textShadow: `0 4px 60px rgba(0,0,0,.60), 0 0 100px rgba(168,120,8,.25)`,
                  }}
                  delay={150}
                />
                <div style={{
                  width: "min(220px,46%)", height: 2, margin: "1.75rem auto 0",
                  background: `linear-gradient(90deg, transparent, ${GOLD_B}, transparent)`,
                  transformOrigin: "center", borderRadius: 2,
                  opacity: 0, animation: "ci-lineGrow 1.1s .9s ease forwards",
                  boxShadow: `0 0 12px rgba(201,150,10,.50)`,
                }} />
              </div>
            )}

            {/* Scene 3 — Together */}
            {scene === 3 && (
              <div>
                <p style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(.9rem,2.4vw,1.25rem)",
                  color: SILK_DIM, letterSpacing: ".06em", marginBottom: "1.5rem",
                  opacity: 0, animation: "ci-fadeIn 1.2s .1s ease forwards",
                }}>
                  Two lives. One promise.
                </p>
                <div style={{
                  display: "inline-flex", flexDirection: "column", alignItems: "center",
                  opacity: 0, animation: "ci-riseIn 1.0s .3s cubic-bezier(.22,1,.36,1) forwards",
                }}>
                  <span className="ci-n-pair" style={{
                    fontFamily: DF, fontSize: "clamp(3.5rem,11vw,7.5rem)",
                    fontWeight: 700, lineHeight: .88, letterSpacing: "-0.03em",
                    color: SILK_CREAM,
                    textShadow: "0 2px 40px rgba(0,0,0,.60)",
                  }}>
                    {brideFirst}
                  </span>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14, margin: ".35em 0",
                    opacity: 0, animation: "ci-fadeIn .7s .85s ease forwards",
                  }}>
                    <div style={{
                      width: 36, height: 1,
                      background: `linear-gradient(to right, transparent, ${GOLD_L})`,
                      boxShadow: `0 0 6px rgba(201,150,10,.5)`,
                    }} />
                    <span style={{
                      fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                      fontSize: "clamp(1.4rem,4vw,2.5rem)",
                      color: ROSE_L, letterSpacing: ".10em",
                      filter: "drop-shadow(0 0 8px rgba(190,45,69,.5))",
                    }}>
                      &amp;
                    </span>
                    <div style={{
                      width: 36, height: 1,
                      background: `linear-gradient(to left, transparent, ${GOLD_L})`,
                      boxShadow: `0 0 6px rgba(201,150,10,.5)`,
                    }} />
                  </div>
                  <span className="ci-n-pair" style={{
                    fontFamily: DF, fontSize: "clamp(3.5rem,11vw,7.5rem)",
                    fontWeight: 700, lineHeight: .88, letterSpacing: "-0.03em",
                    color: `rgba(232,180,12,0.88)`,
                    textShadow: "0 2px 40px rgba(0,0,0,.55), 0 0 60px rgba(168,120,8,.20)",
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
                  fontSize: "clamp(.9rem,2.2vw,1.15rem)",
                  color: SILK_DIM, letterSpacing: ".04em", marginBottom: "1.5rem",
                  opacity: 0, animation: "ci-fadeIn 1.2s .1s ease forwards",
                }}>
                  invite you to witness their union
                </p>
                {weddingDate && (
                  <p style={{
                    fontFamily: DF, fontWeight: 600,
                    fontSize: "clamp(1.8rem,6.5vw,4rem)",
                    color: SILK_CREAM, letterSpacing: ".04em", lineHeight: 1.15,
                    marginBottom: ".75rem",
                    opacity: 0, animation: "ci-riseIn 1.0s .3s cubic-bezier(.22,1,.36,1) forwards",
                    textShadow: "0 4px 40px rgba(0,0,0,.60)",
                  }}>
                    {weddingDate}
                  </p>
                )}
                {(venueName || venueCity) && (
                  <p style={{
                    fontFamily: BF, fontSize: "clamp(.76rem,1.8vw,.9rem)",
                    color: SILK_GOLD, letterSpacing: ".12em", fontWeight: 500,
                    marginBottom: "1.5rem",
                    opacity: 0, animation: "ci-riseIn .9s .55s ease forwards",
                  }}>
                    {[venueName, venueCity].filter(Boolean).join("  ·  ")}
                  </p>
                )}
                <div style={{
                  display: "flex", flexDirection: "column", gap: 5,
                  alignItems: "center",
                  opacity: 0, animation: "ci-fadeIn .8s .9s ease forwards",
                }}>
                  <div style={{ width: "min(200px,44%)", height: 1, background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)` }} />
                  <div style={{ width: "min(120px,24%)", height: 1, background: `linear-gradient(90deg, transparent, rgba(201,150,10,.30), transparent)` }} />
                </div>
              </div>
            )}

            {/* Scene 5 — Countdown (final ceremony scene) */}
            {scene === 5 && (
              <div>
                <p style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1rem,2.8vw,1.4rem)",
                  color: SILK_DIM, letterSpacing: ".04em", marginBottom: "1.75rem",
                  opacity: 0, animation: "ci-fadeIn 1.0s .1s ease forwards",
                }}>
                  The time draws near
                </p>
                <p style={{
                  fontFamily: DF, fontWeight: 300,
                  fontSize: "clamp(2rem,7vw,4.5rem)",
                  color: SILK_CREAM, letterSpacing: ".06em", lineHeight: 1.1,
                  marginBottom: ".5rem",
                  opacity: 0, animation: "ci-riseIn 1.0s .3s cubic-bezier(.22,1,.36,1) forwards",
                  textShadow: "0 4px 50px rgba(0,0,0,.65)",
                }}>
                  {weddingDate && (
                    <Countdown
                      target={weddingDate}
                      style={{ color: SILK_CREAM }}
                    />
                  )}
                </p>
                <div style={{
                  display: "flex", alignItems: "center", gap: 14,
                  justifyContent: "center", margin: "2rem 0 0",
                  opacity: 0, animation: "ci-fadeIn .8s .9s ease forwards",
                }}>
                  <div style={{ width: 60, height: 1, background: `linear-gradient(to right, transparent, ${ROSE_L})` }} />
                  <span style={{
                    fontFamily: BF, fontSize: ".48rem", letterSpacing: ".42em",
                    textTransform: "uppercase", color: "rgba(190,45,69,.65)", fontWeight: 700,
                  }}>
                    {brideFirst} &amp; {groomFirst}
                  </span>
                  <div style={{ width: 60, height: 1, background: `linear-gradient(to left, transparent, ${ROSE_L})` }} />
                </div>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          <div style={{
            position: "absolute",
            bottom: "clamp(52px,10vh,96px)", left: "50%",
            transform: "translateX(-50%)",
            display: "flex", gap: 7, zIndex: 7,
          }}>
            {SCENE_HOLD.map((_, i) => (
              <div key={i} style={{
                height: 2, borderRadius: 1,
                width: i === scene ? 28 : (i < scene ? 10 : 6),
                background: i <= scene ? (i < 3 ? ROSE : GOLD_L) : "rgba(255,255,255,.18)",
                transition: "all .5s cubic-bezier(.22,1,.36,1)",
                opacity: i < scene ? .45 : 1,
                boxShadow: i === scene ? `0 0 8px ${i < 3 ? ROSE : GOLD_L}` : "none",
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 2 · ATELIER — ivory card, seal ceremony
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "atelier" && (
        <div
          className={`ci-phase${phaseLeaving ? " ci-leaving" : ""}`}
          onMouseMove={() => setCursor(c => ({ ...c, big: false }))}
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
            cursor: "none",
          }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* Ambient warm blooms */}
          <div aria-hidden style={{
            position: "fixed", inset: 0, pointerEvents: "none",
            background: `
              radial-gradient(ellipse 65% 50% at 12% 16%, rgba(190,45,69,.05) 0%, transparent 58%),
              radial-gradient(ellipse 55% 45% at 90% 86%, rgba(168,120,8,.04) 0%, transparent 52%)
            `,
          }} />

          {/* Skip */}
          <button
            type="button"
            onClick={openInvitation}
            className="ci-chip-light"
            style={{
              position: "fixed", top: 14, right: 14, zIndex: 10,
              opacity: 0, animation: "ci-fadeIn .6s .5s ease forwards",
            }}
            onMouseEnter={() => setCursor(c => ({ ...c, big: true }))}
            onMouseLeave={() => setCursor(c => ({ ...c, big: false }))}
          >
            <SkipForward size={11} /> Skip
          </button>

          {/* Card + addressed-to */}
          <div style={{
            width: "100%", maxWidth: 460,
            animation: cardLifting
              ? "ci-cardLift .70s .0s cubic-bezier(.22,1,.36,1) forwards"
              : "ci-scaleIn .95s .1s cubic-bezier(.22,1,.36,1) forwards",
            opacity: cardLifting ? undefined : 0,
          }}>

            {/* Addressed-to */}
            <div style={{
              textAlign: "center", marginBottom: "1.625rem",
              opacity: 0, animation: "ci-fadeIn .8s .42s ease forwards",
            }}>
              <p style={{
                fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                fontSize: "clamp(.85rem,2.4vw,1rem)",
                color: INK_3, letterSpacing: ".03em",
              }}>
                A personal invitation, prepared for
              </p>
              <p style={{
                fontFamily: DF, fontWeight: 600,
                fontSize: "clamp(1.5rem,5.5vw,2rem)",
                color: INK, letterSpacing: ".02em", lineHeight: 1.15, marginTop: ".3rem",
              }}>
                {guestLabel}
              </p>
            </div>

            {/* THE CARD */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: `1px solid ${BDR}`,
              boxShadow: `
                0 2px 4px rgba(60,20,30,.04),
                0 8px 24px rgba(60,20,30,.08),
                0 28px 72px rgba(60,20,30,.12),
                inset 0 1px 0 rgba(255,255,255,.80)
              `,
              overflow: "hidden",
            }}>
              {/* Top stripe */}
              <div style={{
                height: 4,
                background: `linear-gradient(90deg, transparent 0%, ${ROSE_L} 16%, ${ROSE} 32%, ${GOLD_L} 50%, ${ROSE} 68%, ${ROSE_L} 84%, transparent 100%)`,
              }} />

              <div className="ci-card-p" style={{ padding: "clamp(1.75rem,5.5vw,2.5rem)" }}>

                {/* Brand eyebrow */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  justifyContent: "center", marginBottom: "2rem",
                  opacity: 0, animation: "ci-fadeIn .7s .7s ease forwards",
                }}>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${BDR_MD})` }} />
                  <span style={{
                    fontFamily: BF, fontSize: ".5rem", letterSpacing: ".46em",
                    textTransform: "uppercase", color: ROSE, fontWeight: 700,
                  }}>
                    {title}
                  </span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${BDR_MD})` }} />
                </div>

                {/* WAX SEAL — cracks on click */}
                <div style={{
                  display: "flex", justifyContent: "center", marginBottom: "2rem",
                  opacity: 0, animation: "ci-scaleIn .95s .85s cubic-bezier(.34,1.56,.64,1) forwards",
                }}>
                  <div
                    style={{
                      position: "relative",
                      width: "clamp(76px,18vw,92px)", height: "clamp(76px,18vw,92px)",
                      animation: sealBroken
                        ? "ci-sealCrack .55s .0s cubic-bezier(.22,1,.36,1) forwards"
                        : "ci-sealPulse 3.5s 1.6s ease-in-out infinite",
                    }}
                  >
                    {/* Outer wax */}
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      background: `radial-gradient(circle at 35% 32%, ${GOLD_PALE} 0%, ${GOLD_L} 45%, ${GOLD} 80%, #8A6006 100%)`,
                    }} />
                    {/* Inner ring */}
                    <div style={{
                      position: "absolute", inset: 7, borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,.45)",
                    }} />
                    {/* Secondary ring */}
                    <div style={{
                      position: "absolute", inset: 13, borderRadius: "50%",
                      border: "0.5px solid rgba(255,255,255,.25)",
                    }} />
                    {/* Initials */}
                    <span style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: DF, fontSize: "clamp(1.2rem,3.2vw,1.55rem)",
                      color: "#FFFDF9", fontWeight: 700, letterSpacing: ".08em",
                    }}>
                      {initials}
                    </span>
                    {/* Crack line SVG (visible only when broken) */}
                    {sealBroken && (
                      <svg style={{ position: "absolute", inset: 0 }} viewBox="0 0 92 92">
                        <path
                          d="M46 20 L42 40 L50 46 L38 72"
                          stroke="rgba(255,255,255,.7)" strokeWidth="1.2" fill="none"
                          style={{ opacity: 0, animation: "ci-fadeIn .15s .1s ease forwards" }}
                        />
                        <path
                          d="M46 20 L52 42 L44 46 L56 70"
                          stroke="rgba(255,255,255,.4)" strokeWidth=".7" fill="none"
                          style={{ opacity: 0, animation: "ci-fadeIn .15s .18s ease forwards" }}
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Names */}
                <div style={{
                  textAlign: "center", marginBottom: "1.375rem",
                  opacity: 0, animation: "ci-riseIn .95s 1.0s cubic-bezier(.22,1,.36,1) forwards",
                }}>
                  <h1 style={{
                    fontFamily: DF, fontWeight: 700, lineHeight: .88,
                    fontSize: "clamp(2rem,7.5vw,3.25rem)",
                    letterSpacing: "-0.025em", color: INK,
                  }}>
                    {brideFirst}
                  </h1>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                    fontSize: "clamp(1.15rem,4vw,1.85rem)",
                    color: ROSE, lineHeight: 1.3, margin: ".14em 0", letterSpacing: ".07em",
                  }}>
                    &amp;
                  </p>
                  <h1 style={{
                    fontFamily: DF, fontWeight: 700, lineHeight: .88,
                    fontSize: "clamp(2rem,7.5vw,3.25rem)",
                    letterSpacing: "-0.025em", color: INK_2,
                  }}>
                    {groomFirst}
                  </h1>
                </div>

                {/* Gold rule */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  justifyContent: "center", margin: "1.375rem 0",
                  opacity: 0, animation: "ci-fadeIn .7s 1.1s ease forwards",
                }}>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, rgba(168,120,8,.38))` }} />
                  <span style={{ color: GOLD, fontSize: 13, lineHeight: 1 }}>✦</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, rgba(168,120,8,.38))` }} />
                </div>

                {/* Detail chips */}
                <div style={{
                  display: "flex", flexWrap: "wrap", justifyContent: "center",
                  gap: ".5rem", marginBottom: "1.625rem",
                  opacity: 0, animation: "ci-fadeIn .7s 1.2s ease forwards",
                }}>
                  {[
                    { text: weddingDate,  rose: true  },
                    { text: venueName,    rose: false },
                    { text: venueCity,    rose: false },
                  ].filter(x => x.text).map(({ text, rose: r }, i) => (
                    <span key={i} style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "5px 15px", borderRadius: 999,
                      background: r ? "rgba(190,45,69,.06)" : "rgba(168,120,8,.06)",
                      border: `1px solid ${r ? "rgba(190,45,69,.16)" : "rgba(168,120,8,.16)"}`,
                      color: r ? ROSE : GOLD,
                      fontSize: ".73rem", fontFamily: BF, fontWeight: 600, letterSpacing: ".04em",
                    }}>
                      {text}
                    </span>
                  ))}
                </div>

                {/* Countdown chip */}
                {weddingDate && (
                  <div style={{
                    display: "flex", justifyContent: "center", marginBottom: "1.625rem",
                    opacity: 0, animation: "ci-fadeIn .7s 1.3s ease forwards",
                  }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "6px 18px", borderRadius: 999,
                      background: BG_LINEN, border: `1px solid ${BDR}`,
                      fontFamily: BF, fontSize: ".7rem", color: INK_3,
                      letterSpacing: ".04em", fontWeight: 500,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: ROSE, flexShrink: 0,
                        animation: "ci-breathe 2s ease-in-out infinite",
                        boxShadow: `0 0 6px ${ROSE}`,
                      }} />
                      <Countdown target={weddingDate} />
                    </span>
                  </div>
                )}

                {/* Personal greeting */}
                <div style={{
                  background: BG_LINEN,
                  border: `1px solid ${BDR}`,
                  borderRadius: 16,
                  padding: "1.125rem 1.25rem",
                  marginBottom: "1.875rem",
                  opacity: 0, animation: "ci-riseIn .9s 1.38s ease forwards",
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
                    color: INK, lineHeight: 1.85,
                  }}>
                    Dear {guestLabel},
                  </p>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(.875rem,2.2vw,1rem)",
                    color: INK_2, lineHeight: 1.85, marginTop: ".35rem",
                  }}>
                    {brideFirst} and {groomFirst} warmly invite you to witness
                    and celebrate their union. You are not just a guest —
                    you are part of the story that brought them here.
                  </p>
                </div>

                {/* ═══ MAGNETIC CTA ═══ */}
                <div style={{
                  opacity: 0, animation: "ci-riseIn .9s 1.58s cubic-bezier(.22,1,.36,1) forwards",
                }}>
                  <button
                    ref={ctaRef}
                    type="button"
                    className="ci-cta"
                    onMouseMove={handleMagMove}
                    onMouseLeave={handleMagLeave}
                    onMouseEnter={() => setCursor(c => ({ ...c, big: true }))}
                    onClick={openInvitation}
                    style={{
                      transform: `translate(${ctaMag.x}px, ${ctaMag.y}px)`,
                      transition: `transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease, filter .15s ease`,
                    }}
                  >
                    <span style={{ fontSize: "1rem", filter: "drop-shadow(0 0 4px rgba(255,255,255,.4))" }}>
                      ✉
                    </span>
                    Open your invitation
                  </button>

                  <p style={{
                    marginTop: "1rem", textAlign: "center",
                    fontFamily: BF, fontSize: ".62rem",
                    color: INK_4, letterSpacing: ".04em", lineHeight: 1.7,
                  }}>
                    {subtitle}
                  </p>
                </div>
              </div>

              {/* Bottom stripe */}
              <div style={{
                height: 4,
                background: `linear-gradient(90deg, transparent 0%, ${ROSE_L} 16%, ${ROSE} 32%, ${GOLD_L} 50%, ${ROSE} 68%, ${ROSE_L} 84%, transparent 100%)`,
              }} />
            </div>

            {/* Below card */}
            <p style={{
              marginTop: "1.375rem", textAlign: "center",
              fontFamily: BF, fontSize: ".48rem", letterSpacing: ".38em",
              textTransform: "uppercase", color: INK_4,
              opacity: 0, animation: "ci-fadeIn .7s 1.85s ease forwards",
            }}>
              {brideFirst} &amp; {groomFirst} · {weddingDate ?? ""}
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 3 · UNVEIL — light photo hero, parallax, curtain names
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "unveil" && (
        <div className={unveilVis ? "ci-vis" : ""}>

          <section
            ref={heroRef}
            style={{
              position: "relative",
              minHeight: "100dvh",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              textAlign: "center",
              overflow: "hidden",
              background: BG,
            }}
          >
            {/* Parallax photo */}
            {heroPhotoUrl && (
              <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
                <div
                  className="ci-parallax-photo"
                  style={{
                    position: "absolute", inset: "-10%",
                    backgroundImage: `url(${heroPhotoUrl})`,
                    backgroundSize: "cover", backgroundPosition: "center center",
                    filter: "saturate(.40) brightness(.70)",
                    willChange: "transform",
                    transform: "translateY(0) scale(1.07)",
                  }}
                />
              </div>
            )}

            {/* Warm cream wash — light, editorial */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 1,
              background: `
                linear-gradient(to bottom,
                  rgba(253,250,247,.92) 0%,
                  rgba(253,250,247,.60) 16%,
                  rgba(253,250,247,.50) 40%,
                  rgba(253,250,247,.72) 64%,
                  rgba(253,250,247,.97) 100%
                )
              `,
            }} />

            {/* Side vignette */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 2,
              background: "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 40%, rgba(241,233,224,.50) 100%)",
            }} />

            {/* Ambient blooms */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
              background: `
                radial-gradient(ellipse 58% 48% at 14% 20%, rgba(190,45,69,.045) 0%, transparent 56%),
                radial-gradient(ellipse 48% 44% at 88% 80%, rgba(168,120,8,.040) 0%, transparent 50%)
              `,
            }} />

            {/* Top edge fade */}
            <div aria-hidden style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 80,
              background: `linear-gradient(to bottom, ${BG}, transparent)`, zIndex: 3,
            }} />

            {/* Content */}
            <div style={{
              position: "relative", zIndex: 5,
              padding: "6rem 1.5rem 8rem",
              maxWidth: 700, width: "100%",
            }}>

              {/* Eyebrow */}
              <div className="ci-h0" style={{
                display: "flex", alignItems: "center", gap: 14,
                justifyContent: "center", marginBottom: "2.25rem",
              }}>
                <div style={{ width: 38, height: 1, background: `linear-gradient(to right, transparent, ${ROSE_MID})` }} />
                <span style={{
                  fontFamily: BF, fontSize: ".5rem", letterSpacing: ".52em",
                  textTransform: "uppercase", color: ROSE, fontWeight: 700,
                }}>
                  {title}
                </span>
                <div style={{ width: 38, height: 1, background: `linear-gradient(to left, transparent, ${ROSE_MID})` }} />
              </div>

              {/* Bride — curtain reveal */}
              <h1 className="ci-h1 ci-h-name" style={{
                fontFamily: DF,
                fontSize: "clamp(3.8rem,13vw,9rem)",
                fontWeight: 700, lineHeight: .86, letterSpacing: "-0.03em",
                color: INK, marginBottom: ".04em",
              }}>
                {brideFirst}
              </h1>

              {/* & */}
              <p className="ci-h2" style={{
                fontFamily: DF, fontSize: "clamp(1.4rem,4.2vw,3rem)",
                fontWeight: 300, fontStyle: "italic",
                color: ROSE, letterSpacing: ".09em", lineHeight: 1.25,
                marginBottom: ".04em",
              }}>
                &amp;
              </p>

              {/* Groom — curtain reveal */}
              <h1 className="ci-h3 ci-h-name" style={{
                fontFamily: DF,
                fontSize: "clamp(3.8rem,13vw,9rem)",
                fontWeight: 700, lineHeight: .86, letterSpacing: "-0.03em",
                color: INK_2, marginBottom: "1.875rem",
              }}>
                {groomFirst}
              </h1>

              {/* Gold rule */}
              <div className="ci-hl" style={{
                width: "min(250px,54%)", height: 1, margin: "0 auto 1.875rem",
                background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)`,
                opacity: 0,
              }} />

              {/* Date · Venue · City */}
              <div className="ci-h4" style={{
                display: "flex", flexWrap: "wrap", alignItems: "center",
                justifyContent: "center", gap: ".65rem", marginBottom: "1.25rem",
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

              {/* Countdown (hero) */}
              {weddingDate && (
                <div className="ci-h5" style={{ marginBottom: "1.375rem" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "7px 20px", borderRadius: 999,
                    background: BG_LINEN, border: `1px solid ${BDR_MD}`,
                    fontFamily: BF, fontSize: ".72rem", color: INK_3,
                    letterSpacing: ".04em", fontWeight: 500,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: ROSE, flexShrink: 0,
                      boxShadow: `0 0 5px ${ROSE}`,
                    }} />
                    <Countdown target={weddingDate} />
                  </span>
                </div>
              )}

              {/* Personal tag */}
              <div className="ci-h6" style={{ marginBottom: "2.5rem" }}>
                <span style={{
                  display: "inline-block", padding: "7px 22px",
                  border: `1px solid ${BDR_MD}`, borderRadius: 999,
                  fontFamily: DF, fontStyle: "italic",
                  fontSize: "clamp(.82rem,2vw,.96rem)",
                  color: ROSE, letterSpacing: ".03em",
                  background: ROSE_PALE,
                }}>
                  A personal invitation for {guestLabel}
                </span>
              </div>

              {/* View CTA */}
              <div className="ci-h7">
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
                width: 1, height: 32,
                background: `linear-gradient(to bottom, ${ROSE_MID}, transparent)`,
              }} />
              <ChevronDown size={12} style={{ color: ROSE_MID, marginTop: -5 }} />
            </div>
          </section>

          <div id="invite-content">{children}</div>
        </div>
      )}
    </>
  );
}

export default CinematicIntro;
