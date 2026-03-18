"use client";

/**
 * CinematicIntro — Director's Cut
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  DESIGN LANGUAGE: "Bespoke Maison"
 *
 *  The visual reference: a fashion house couture invitation — black lacquered
 *  exterior, ivory moire interior, a wax medallion that must be broken to enter.
 *  Every surface has material depth. Every transition has ceremony.
 *
 *  WHAT'S NEW IN THIS VERSION:
 *
 *  CEREMONY (Phase 1)
 *  • Replaced invisible silk weave with a visible radial shimmer that slowly
 *    rotates — you can see the light move across the canvas.
 *  • Deep atmospheric glow clusters rewritten with much higher opacity — they
 *    bloom visibly as the scene progresses.
 *  • SVG border replaced with a proper pixel-coordinate approach that actually
 *    renders — outer gold hairline + inner rose hairline draw simultaneously.
 *  • Four corner cross ornaments rebuilt at 32×32px with visible weight.
 *  • Letterbox bars given a proper gradient depth — they feel like physical
 *    bars, not just darkened edges.
 *  • Scene 0: "The Union" title set in massive display type with the brand
 *    eyebrow as tiny spacing text — a fashion house editorial cover.
 *  • Scene 1/2: CharReveal names now have a visible glow halo that expands
 *    as the letters land — the name radiates light as it appears.
 *  • Scene 3 (together): A horizontal split composition — name on left,
 *    ampersand center, second name right — asymmetric and editorial.
 *  • Scene 5 (countdown): Large numerals in three columns: Days / Hours / Min
 *    with fine labels — like a Rolex dial.
 *  • Progress bar replaced with a continuous thin line that fills left-to-right
 *    across the bottom — more cinematic, less app-like.
 *
 *  ATELIER (Phase 2 — the sealed card)
 *  • Canvas now has a visible cross-hatch paper texture via SVG pattern — you
 *    can see the surface is made of something.
 *  • Card given a genuine shadow stack — five layers including a colored bottom
 *    shadow — it sits off the surface like a physical object.
 *  • Wax seal enlarged to 108px, given a sunburst inner texture, outer ring
 *    with tick marks, and a three-ring inner dial — it looks like a medallion.
 *  • On hover the seal lifts and rotates slightly before clicking.
 *  • Seal crack is now a full-screen radial burst then dissolve — dramatic.
 *  • Greeting text replaced with an actual handwritten-style italic composition
 *    on a cream panel with a left border rule — like a hand-written note.
 *  • CTA button now has a border shimmer (the border itself animates) in
 *    addition to the shimmer sweep — double luxury signal.
 *  • Added "Prepared exclusively" fine print with a thin ornamental rule.
 *
 *  UNVEIL (Phase 3)
 *  • Photo overlay changed from cream wash to a warm duotone — the photo
 *    reads through a rose-to-gold gradient instead of plain cream.
 *  • Names now display with a visible drop-shadow text that creates depth
 *    against the photo, not just color contrast.
 *  • Added a thin horizontal rule that "draws" between the names and the
 *    date row — gives the typography a physical anchor.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// ── Ceremony palette ───────────────────────────────────────────────────────
const SILK       = "#080507";
const SILK_GOLD  = "rgba(212,168,18,0.82)";
const SILK_ROSE  = "rgba(210,56,80,0.75)";
const SILK_CREAM = "rgba(255,252,248,0.92)";
const SILK_DIM   = "rgba(255,252,248,0.42)";
const SILK_GHOST = "rgba(255,252,248,0.18)";

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

// ── Deterministic particles ────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  id:    i,
  left:  `${3 + (i * 2.9) % 94}%`,
  size:  1.0 + (i % 5) * 0.45,
  dur:   18 + (i % 9) * 2.2,
  delay: (i * 1.1) % 14,
  gold:  i % 3 !== 0,
  dir:   i % 2,
}));

const SCENE_HOLD: number[] = [3400, 2900, 2900, 2700, 2900, 3400];
const CROSSFADE  = 700;
const CHAR_STAGGER = 38;

// ── Character reveal component ─────────────────────────────────────────────
function CharReveal({ word, color, style, delay = 0 }: {
  word: string; color: string; style?: React.CSSProperties; delay?: number;
}) {
  return (
    <span style={{ display: "inline-block", ...style }}>
      {word.split("").map((ch, i) => (
        <span key={i} style={{
          display: "inline-block", opacity: 0,
          animation: `ci-charDrop .95s ${delay + i * CHAR_STAGGER}ms cubic-bezier(.22,1,.36,1) forwards`,
          color,
        }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

// ── Live countdown ────────────────────────────────────────────────────────
function CountdownDial({ target }: { target: string }) {
  const [vals, setVals] = useState({ d: 0, h: 0, m: 0 });
  useEffect(() => {
    function tick() {
      const ms = new Date(target).getTime() - Date.now();
      if (ms <= 0) { setVals({ d: 0, h: 0, m: 0 }); return; }
      setVals({
        d: Math.floor(ms / 86400000),
        h: Math.floor((ms % 86400000) / 3600000),
        m: Math.floor((ms % 3600000) / 60000),
      });
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [target]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: "clamp(1.5rem,5vw,3.5rem)" }}>
      {[
        { val: vals.d,  label: "Days"  },
        { val: vals.h,  label: "Hours" },
        { val: vals.m,  label: "Min"   },
      ].map(({ val, label }, i) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: DF, fontWeight: 300,
            fontSize: "clamp(3.5rem,11vw,6.5rem)",
            color: SILK_CREAM, letterSpacing: "-.02em", lineHeight: 1,
            textShadow: "0 2px 40px rgba(0,0,0,.7)",
          }}>
            {pad(val)}
          </div>
          <div style={{
            marginTop: ".5rem",
            fontFamily: BF, fontSize: ".46rem",
            letterSpacing: ".48em", textTransform: "uppercase",
            color: i === 0 ? SILK_GOLD : SILK_DIM, fontWeight: 600,
          }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

function CountdownLabel({ target, style }: { target: string; style?: React.CSSProperties }) {
  const [label, setLabel] = useState("");
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
  const [sealState,    setSealState]    = useState<"sealed" | "hover" | "cracking" | "gone">("sealed");
  const [cardLifting,  setCardLifting]  = useState(false);
  const [cursor,       setCursor]       = useState({ x: -200, y: -200, big: false });
  const [ctaMag,       setCtaMag]       = useState({ x: 0, y: 0 });
  const [progWidth,    setProgWidth]    = useState(0);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const sceneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const heroRef    = useRef<HTMLElement | null>(null);
  const ctaRef     = useRef<HTMLButtonElement | null>(null);
  const storageKey = `surihana-intro:${inviteCode}`;
  const cookieName = `invite_intro_seen_${inviteCode}`;

  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;
  const initials   = useMemo(() =>
    `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase(),
    [brideName, groomName]
  );

  // Mount
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

  // Cursor
  useEffect(() => {
    if (typeof window === "undefined") return;
    const move = (e: MouseEvent) => setCursor(c => ({ ...c, x: e.clientX, y: e.clientY }));
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Parallax
  useEffect(() => {
    if (phase !== "unveil" || typeof window === "undefined") return;
    const onScroll = () => {
      const photo = heroRef.current?.querySelector<HTMLElement>(".ci-parallax-photo");
      if (photo) photo.style.transform = `translateY(${window.scrollY * 0.26}px) scale(1.08)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase]);

  // Scene progress bar fill
  useEffect(() => {
    if (phase !== "ceremony") return;
    setProgWidth(0);
    const hold = SCENE_HOLD[scene] ?? 3000;
    const tick  = 60;
    let elapsed = 0;
    progTimer.current = setInterval(() => {
      elapsed += tick;
      setProgWidth(Math.min((elapsed / hold) * 100, 100));
    }, tick);
    return () => { if (progTimer.current) clearInterval(progTimer.current); };
  }, [scene, phase]);

  // Scene auto-advance
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

  // Magnetic CTA
  function handleMagMove(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = ctaRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    setCtaMag({
      x: (e.clientX - r.left - r.width  / 2) * 0.30,
      y: (e.clientY - r.top  - r.height / 2) * 0.30,
    });
  }

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

  // Transitions
  function fadeOut(cb: () => void, ms = 1000) {
    setPhaseLeaving(true);
    setTimeout(() => { setPhaseLeaving(false); cb(); }, ms);
  }

  function goToAtelier() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    if (progTimer.current)  clearInterval(progTimer.current);
    fadeOut(() => setPhase("atelier"));
  }

  function skipToAtelier() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    if (progTimer.current)  clearInterval(progTimer.current);
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
    setSealState("cracking");
    setTimeout(() => setSealState("gone"), 420);
    setTimeout(() => setCardLifting(true), 480);
    setTimeout(() => {
      fadeOut(() => {
        setPhase("unveil");
        requestAnimationFrame(() => requestAnimationFrame(() => setUnveilVis(true)));
      }, 950);
    }, 600);
  }

  if (!isMounted) {
    return <div style={{ minHeight: "100dvh", background: SILK }}>{children}</div>;
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ─── primitives ─── */
        @keyframes ci-fadeIn  {from{opacity:0}to{opacity:1}}
        @keyframes ci-riseIn  {from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ci-sinkIn  {from{opacity:0;transform:translateY(-22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ci-scaleIn {from{opacity:0;transform:scale(.90)}to{opacity:1;transform:scale(1)}}
        @keyframes ci-lineGrow{from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:1}}
        @keyframes ci-curtain {0%{clip-path:inset(100% 0 0 0)}100%{clip-path:inset(0% 0 0 0)}}

        /* ─── char drop ─── */
        @keyframes ci-charDrop {
          0%   {opacity:0;transform:translateY(-44px) scale(.65) rotate(-5deg)}
          55%  {opacity:1;transform:translateY(6px) scale(1.06) rotate(1.5deg)}
          75%  {transform:translateY(-3px) scale(.98) rotate(0)}
          100% {opacity:1;transform:translateY(0) scale(1) rotate(0)}
        }

        /* ─── radial shimmer rotation ─── */
        @keyframes ci-shimmerRot {
          0%  {transform:rotate(0deg) scale(1.8)}
          100%{transform:rotate(360deg) scale(1.8)}
        }

        /* ─── ambient glow breathe ─── */
        @keyframes ci-breathe {
          0%,100%{opacity:.55;transform:scale(1)}
          50%    {opacity:1;transform:scale(1.04)}
        }

        /* ─── glow pulse (scene name halo) ─── */
        @keyframes ci-glow {
          0%  {opacity:0;transform:scale(.6)}
          40% {opacity:.35}
          100%{opacity:0;transform:scale(1.6)}
        }

        /* ─── particles ─── */
        @keyframes ci-floatR {
          0%  {transform:translateY(110vh) translateX(0) rotate(0deg);opacity:0}
          4%  {opacity:.7}
          80% {opacity:.10}
          100%{transform:translateY(-8vh) translateX(24px) rotate(520deg);opacity:0}
        }
        @keyframes ci-floatL {
          0%  {transform:translateY(110vh) translateX(0) rotate(0deg);opacity:0}
          4%  {opacity:.6}
          80% {opacity:.08}
          100%{transform:translateY(-8vh) translateX(-24px) rotate(-520deg);opacity:0}
        }

        /* ─── seal ─── */
        @keyframes ci-sealIdle {
          0%,100%{box-shadow:0 0 0 0 rgba(201,150,10,0),0 12px 40px rgba(0,0,0,.55)}
          50%    {box-shadow:0 0 0 18px rgba(201,150,10,.08),0 16px 48px rgba(0,0,0,.60)}
        }
        @keyframes ci-sealHover {
          0%  {transform:translateY(0) rotate(0deg) scale(1)}
          100%{transform:translateY(-5px) rotate(3deg) scale(1.05)}
        }
        @keyframes ci-sealCrack {
          0%  {transform:scale(1);opacity:1;filter:brightness(1)}
          25% {transform:scale(1.18) rotate(-4deg);opacity:.9;filter:brightness(1.5)}
          55% {transform:scale(.75) rotate(8deg);opacity:.5;filter:brightness(2)}
          100%{transform:scale(0) rotate(25deg);opacity:0;filter:brightness(3)}
        }
        @keyframes ci-burstOut {
          0%  {transform:scale(0);opacity:.8}
          70% {opacity:.25}
          100%{transform:scale(3.5);opacity:0}
        }

        /* ─── card lift ─── */
        @keyframes ci-cardLift {
          0%  {transform:perspective(1400px) rotateX(0) translateY(0) scale(1);opacity:1}
          35% {transform:perspective(1400px) rotateX(-6deg) translateY(-16px) scale(.99);opacity:.85}
          100%{transform:perspective(1400px) rotateX(-20deg) translateY(-90px) scale(.91);opacity:0}
        }

        /* ─── unveil hero ─── */
        .ci-h0,.ci-h1,.ci-h2,.ci-h3,.ci-h4,.ci-h5,.ci-h6,.ci-h7,.ci-h8{opacity:0}
        .ci-vis .ci-h0{animation:ci-fadeIn  .75s .00s ease forwards}
        .ci-vis .ci-h1{animation:ci-curtain 1.15s .16s cubic-bezier(.16,1,.30,1) forwards;clip-path:inset(100% 0 0 0);opacity:1}
        .ci-vis .ci-h2{animation:ci-fadeIn   .80s .28s ease forwards}
        .ci-vis .ci-h3{animation:ci-curtain 1.15s .42s cubic-bezier(.16,1,.30,1) forwards;clip-path:inset(100% 0 0 0);opacity:1}
        .ci-vis .ci-h4{animation:ci-lineGrow .95s .56s ease forwards;opacity:0}
        .ci-vis .ci-h5{animation:ci-riseIn   .90s .72s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h6{animation:ci-riseIn   .85s .88s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h7{animation:ci-riseIn   .80s 1.04s cubic-bezier(.22,1,.36,1) forwards}
        .ci-vis .ci-h8{animation:ci-riseIn   .75s 1.18s cubic-bezier(.22,1,.36,1) forwards}

        /* ─── phase fade ─── */
        .ci-phase{transition:opacity 1.0s cubic-bezier(.4,0,.2,1)}
        .ci-leaving{opacity:0!important;pointer-events:none}

        /* ─── scroll bounce ─── */
        @keyframes ci-bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(9px)}}

        /* ─── sound bars ─── */
        @keyframes ci-bar1{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
        @keyframes ci-bar2{0%,100%{transform:scaleY(.65)}50%{transform:scaleY(.28)}}
        @keyframes ci-bar3{0%,100%{transform:scaleY(.45)}50%{transform:scaleY(.88)}}

        /* ─── custom cursor ─── */
        .ci-cursor{
          position:fixed;top:0;left:0;
          width:12px;height:12px;border-radius:50%;
          background:rgba(200,48,72,.60);
          pointer-events:none;z-index:99999;
          transform:translate(-50%,-50%);
          transition:width .2s ease,height .2s ease,background .2s ease;
          mix-blend-mode:multiply;
        }
        .ci-cursor.big{width:44px;height:44px;background:rgba(200,48,72,.14)}

        /* ─── ceremony chip ─── */
        .ci-chip{
          display:inline-flex;align-items:center;gap:5px;
          padding:7px 15px;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.14);border-radius:999px;
          color:rgba(255,255,255,.50);
          font-family:${BF};font-size:.58rem;font-weight:600;
          letter-spacing:.16em;text-transform:uppercase;cursor:pointer;
          backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
          transition:all .22s ease;
        }
        .ci-chip:hover{
          background:rgba(255,255,255,.14);
          border-color:rgba(255,255,255,.30);
          color:rgba(255,255,255,.90);
        }

        /* ─── atelier chip ─── */
        .ci-chip-light{
          display:inline-flex;align-items:center;gap:5px;
          padding:7px 15px;
          background:rgba(255,255,255,.78);
          border:1px solid ${BDR_MD};border-radius:999px;
          color:${INK_3};
          font-family:${BF};font-size:.58rem;font-weight:600;
          letter-spacing:.16em;text-transform:uppercase;cursor:pointer;
          backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
          transition:all .2s ease;
        }
        .ci-chip-light:hover{background:${ROSE_PALE};border-color:rgba(190,45,69,.30);color:${ROSE}}

        /* ─── open invitation CTA ─── */
        @keyframes ci-borderFlow {
          0%  {background-position:0% 50%}
          100%{background-position:200% 50%}
        }
        @keyframes ci-ctaSweep {
          0%  {background-position:220% 0}
          42% {background-position:-220% 0}
          100%{background-position:-220% 0}
        }
        .ci-open-btn{
          position:relative;
          display:flex;align-items:center;justify-content:center;gap:11px;
          width:100%;padding:19px 28px;
          background:linear-gradient(135deg, ${ROSE_L} 0%, ${ROSE} 52%, ${ROSE_H} 100%);
          border:none;border-radius:16px;color:#fff;
          font-family:${BF};font-size:.82rem;font-weight:700;
          letter-spacing:.26em;text-transform:uppercase;cursor:none;
          box-shadow:
            0 1px 2px rgba(160,30,50,.25),
            0 6px 20px rgba(190,45,69,.30),
            0 18px 48px rgba(190,45,69,.22),
            0 36px 72px rgba(120,10,24,.14);
          transition:box-shadow .3s ease,filter .18s ease;
          overflow:hidden;will-change:transform;
        }
        .ci-open-btn::before{
          content:'';position:absolute;inset:-2px;border-radius:18px;
          background:linear-gradient(90deg, ${ROSE_L}, ${GOLD_L}, ${ROSE}, ${GOLD_L}, ${ROSE_L});
          background-size:200% 100%;
          animation:ci-borderFlow 3s linear infinite;
          z-index:-1;
        }
        .ci-open-btn::after{
          content:'';position:absolute;inset:0;border-radius:16px;
          background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.25) 50%,transparent 65%);
          background-size:220% 100%;background-position:220% 0;
          animation:ci-ctaSweep 3.2s 2s ease infinite;pointer-events:none;
        }
        .ci-open-btn:hover{
          filter:brightness(1.07);
          box-shadow:
            0 1px 2px rgba(160,30,50,.30),
            0 8px 24px rgba(190,45,69,.38),
            0 24px 60px rgba(190,45,69,.28),
            0 48px 80px rgba(120,10,24,.18);
        }

        /* ─── unveil view link ─── */
        .ci-view-btn{
          display:inline-flex;align-items:center;gap:9px;
          padding:14px 38px;
          background:rgba(255,255,255,.12);
          border:1.5px solid rgba(190,45,69,.32);
          border-radius:999px;color:${INK};
          font-family:${BF};font-size:.72rem;font-weight:600;
          letter-spacing:.18em;text-transform:uppercase;text-decoration:none;
          backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
          transition:all .30s cubic-bezier(.22,1,.36,1);
        }
        .ci-view-btn:hover{
          background:rgba(190,45,69,.08);border-color:${ROSE};color:${ROSE};
          transform:translateY(-3px);
          box-shadow:0 12px 32px rgba(190,45,69,.16);
        }

        /* ─── mobile ─── */
        @media(max-width:480px){
          .ci-n-lg  {font-size:clamp(3.8rem,19vw,7rem)!important}
          .ci-n-pair{font-size:clamp(3rem,14vw,5.5rem)!important}
          .ci-card-p{padding:1.625rem!important}
          .ci-h-name{font-size:clamp(3.2rem,14vw,7.5rem)!important}
        }
        @media(max-width:360px){
          .ci-n-lg  {font-size:3.4rem!important}
          .ci-n-pair{font-size:2.8rem!important}
        }
      `}</style>

      {/* Custom cursor */}
      {(phase === "ceremony" || phase === "atelier") && (
        <div
          className={`ci-cursor${cursor.big ? " big" : ""}`}
          style={{ left: cursor.x, top: cursor.y }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE 1 · CEREMONY
      ══════════════════════════════════════════════════════════════════════ */}
      {phase === "ceremony" && (
        <div
          className={`ci-phase${phaseLeaving ? " ci-leaving" : ""}`}
          onMouseMove={() => setCursor(c => ({ ...c, big: false }))}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: SILK,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            overflow: "hidden", cursor: "none",
          }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* ── Radial shimmer — slowly rotating light source ── */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            <div style={{
              width: "140vmax", height: "140vmax",
              background: `conic-gradient(
                from 0deg,
                transparent 0deg,
                rgba(201,150,10,.06) 30deg,
                rgba(201,150,10,.14) 60deg,
                rgba(190,45,69,.08) 90deg,
                transparent 120deg,
                rgba(201,150,10,.04) 180deg,
                rgba(201,150,10,.10) 220deg,
                rgba(190,45,69,.06) 270deg,
                transparent 300deg,
                rgba(201,150,10,.07) 330deg,
                transparent 360deg
              )`,
              animation: "ci-shimmerRot 28s linear infinite",
              transformOrigin: "center",
            }} />
          </div>

          {/* ── Deep atmospheric glows ── */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
            background: `
              radial-gradient(ellipse 70% 58% at 20% 30%, rgba(190,45,69,.14) 0%, transparent 55%),
              radial-gradient(ellipse 60% 52% at 82% 72%, rgba(168,120,8,.12) 0%, transparent 52%),
              radial-gradient(ellipse 45% 38% at 52% 50%, rgba(40,10,20,.55) 0%, transparent 65%)
            `,
            animation: "ci-breathe 16s ease-in-out infinite",
          }} />

          {/* ── Cinematic letterbox bars ── */}
          <div aria-hidden style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 8,
            height: "clamp(48px,9vh,88px)",
            background: "linear-gradient(to bottom, #000000 0%, rgba(0,0,0,.85) 60%, transparent 100%)",
          }} />
          <div aria-hidden style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 8,
            height: "clamp(48px,9vh,88px)",
            background: "linear-gradient(to top, #000000 0%, rgba(0,0,0,.85) 60%, transparent 100%)",
          }} />

          {/* ── Radial vignette ── */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, zIndex: 3,
            background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 22%, rgba(0,0,0,.72) 100%)",
          }} />

          {/* ── Fine grain overlay ── */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, zIndex: 4, opacity: .45,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)' opacity='0.05'/%3E%3C/svg%3E")`,
          }} />

          {/* ── SVG ornamental frame (pixel coords, not %) ── */}
          <svg
            aria-hidden
            viewBox="0 0 1000 700"
            preserveAspectRatio="none"
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              zIndex: 5, pointerEvents: "none",
            }}
          >
            {/* Outer gold hairline */}
            <rect x="28" y="28" width="944" height="644" rx="4"
              fill="none" stroke={GOLD_L} strokeWidth="0.7" strokeOpacity="0.45"
              strokeDasharray="2700" strokeDashoffset="2700"
              style={{ animation: "ci-drawPath 4.2s .3s ease forwards", "--path-len": "2700" } as React.CSSProperties}
            />
            {/* Inner rose hairline */}
            <rect x="36" y="36" width="928" height="628" rx="3"
              fill="none" stroke={ROSE} strokeWidth="0.35" strokeOpacity="0.22"
              strokeDasharray="2500" strokeDashoffset="2500"
              style={{ animation: "ci-drawPath 4.8s .7s ease forwards", "--path-len": "2500" } as React.CSSProperties}
            />
            {/* keyframes for this SVG */}
            <defs>
              <style>{`@keyframes ci-drawPath{from{stroke-dashoffset:var(--path-len)}to{stroke-dashoffset:0}}`}</style>
            </defs>
          </svg>

          {/* ── Corner ornaments (32px, visible weight) ── */}
          {[
            { style: { top: 20, left: 20 },    rot: 0   },
            { style: { top: 20, right: 20 },   rot: 90  },
            { style: { bottom: 20, right: 20 }, rot: 180 },
            { style: { bottom: 20, left: 20 },  rot: 270 },
          ].map(({ style: pos, rot }, i) => (
            <div key={i} aria-hidden style={{
              position: "absolute", ...pos, zIndex: 6,
              width: 32, height: 32,
              opacity: 0, animation: `ci-fadeIn .7s ${1.6 + i * 0.18}s ease forwards`,
              transform: `rotate(${rot}deg)`,
            }}>
              <svg viewBox="0 0 32 32" fill="none">
                <line x1="1" y1="1" x2="14" y2="1" stroke={GOLD_L} strokeWidth="1.0" strokeOpacity=".55"/>
                <line x1="1" y1="1" x2="1"  y2="14" stroke={GOLD_L} strokeWidth="1.0" strokeOpacity=".55"/>
                <circle cx="1" cy="1" r="2.2" fill={GOLD_L} fillOpacity=".45"/>
                <line x1="5"  y1="5" x2="10" y2="5"  stroke={GOLD_L} strokeWidth=".5" strokeOpacity=".30"/>
                <line x1="5"  y1="5" x2="5"  y2="10" stroke={GOLD_L} strokeWidth=".5" strokeOpacity=".30"/>
              </svg>
            </div>
          ))}

          {/* ── Floating particles ── */}
          {PARTICLES.map(p => (
            <div key={p.id} aria-hidden style={{
              position: "absolute", bottom: "-10px", left: p.left,
              width: p.size, height: p.size * 1.6,
              borderRadius: "50% 50% 46% 54% / 58% 62% 38% 42%",
              background: p.gold
                ? `rgba(212,168,18,${0.18 + (p.id % 5) * 0.05})`
                : `rgba(210,56,80,${0.14 + (p.id % 6) * 0.04})`,
              opacity: 0,
              animation: `${p.dir === 0 ? "ci-floatR" : "ci-floatL"} ${p.dur}s ${p.delay}s linear infinite`,
              filter: "blur(.3px)", zIndex: 2,
            }} />
          ))}

          {/* ── Controls ── */}
          {scene >= 1 && (
            <div style={{
              position: "absolute", top: "clamp(54px,10.5vh,96px)", right: 20, zIndex: 10,
              display: "flex", gap: 8,
              opacity: 0, animation: "ci-fadeIn .8s .3s ease forwards",
            }}>
              {audioAvail === true && (
                <button type="button" onClick={toggleMusic} className="ci-chip"
                  onMouseEnter={() => setCursor(c => ({ ...c, big: true }))}
                  onMouseLeave={() => setCursor(c => ({ ...c, big: false }))}
                >
                  {!isMuted ? (
                    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: 11 }}>
                      {[{a:"ci-bar1",h:9},{a:"ci-bar2",h:7},{a:"ci-bar3",h:11}].map((b,i) => (
                        <span key={i} style={{ width:2, height:b.h, borderRadius:1, background:GOLD_L, transformOrigin:"bottom", animation:`${b.a} .75s ${i*.1}s ease-in-out infinite` }} />
                      ))}
                    </span>
                  ) : <VolumeX size={10} />}
                  {isMuted ? "Music" : "Live"}
                </button>
              )}
              <button type="button" onClick={skipToAtelier} className="ci-chip"
                onMouseEnter={() => setCursor(c => ({ ...c, big: true }))}
                onMouseLeave={() => setCursor(c => ({ ...c, big: false }))}
              >
                <SkipForward size={10} /> Skip
              </button>
            </div>
          )}

          {/* ── SCENE STAGE ── */}
          <div style={{
            position: "relative", zIndex: 7,
            textAlign: "center",
            padding: "0 clamp(28px,9vw,110px)",
            width: "100%", maxWidth: 800,
            opacity: sceneVis ? 1 : 0,
            transition: `opacity ${CROSSFADE}ms cubic-bezier(.4,0,.2,1)`,
          }}>

            {/* Scene 0 — Editorial cover */}
            {scene === 0 && (
              <div style={{ opacity: 0, animation: "ci-scaleIn 1.3s .15s cubic-bezier(.22,1,.36,1) forwards" }}>
                <p style={{
                  fontFamily: BF, fontSize: "clamp(.44rem,1.2vw,.56rem)",
                  letterSpacing: ".58em", textTransform: "uppercase",
                  color: SILK_GOLD, fontWeight: 700,
                  marginBottom: "2.5rem",
                  opacity: 0, animation: "ci-riseIn .9s .35s ease forwards",
                }}>
                  {title}
                </p>

                {/* Decorative lines flanking a diamond */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 18,
                  justifyContent: "center", marginBottom: "2.25rem",
                }}>
                  <div style={{
                    flex: 1, maxWidth: 110, height: 1,
                    background: `linear-gradient(to right, transparent, ${GOLD_L})`,
                    transformOrigin: "right",
                    opacity: 0, animation: "ci-lineGrow 1.4s .55s ease forwards",
                  }} />
                  <div style={{
                    width: 8, height: 8, transform: "rotate(45deg)",
                    background: GOLD_L, flexShrink: 0,
                    opacity: 0, animation: "ci-scaleIn .6s 1.05s ease forwards",
                    boxShadow: `0 0 10px ${GOLD_L}`,
                  }} />
                  <div style={{
                    flex: 1, maxWidth: 110, height: 1,
                    background: `linear-gradient(to left, transparent, ${GOLD_L})`,
                    transformOrigin: "left",
                    opacity: 0, animation: "ci-lineGrow 1.4s .55s ease forwards",
                  }} />
                </div>

                <p style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1.15rem,3.6vw,1.8rem)",
                  color: SILK_DIM, letterSpacing: ".05em", lineHeight: 1.55,
                  opacity: 0, animation: "ci-riseIn 1.1s .75s ease forwards",
                }}>
                  A love story sealed in time
                </p>

                <div style={{
                  display: "flex", flexDirection: "column", gap: 5,
                  alignItems: "center", marginTop: "2.5rem",
                  opacity: 0, animation: "ci-fadeIn .9s 1.2s ease forwards",
                }}>
                  <div style={{ width: "min(240px,48%)", height: 1, background: `linear-gradient(90deg, transparent, rgba(201,150,10,.55), transparent)` }} />
                  <div style={{ width: "min(130px,26%)", height: 1, background: `linear-gradient(90deg, transparent, rgba(201,150,10,.25), transparent)` }} />
                </div>
              </div>
            )}

            {/* Scene 1 — Bride (char reveal + glow halo) */}
            {scene === 1 && (
              <div style={{ position: "relative" }}>
                <p style={{
                  fontFamily: BF, fontSize: "clamp(.44rem,1.1vw,.55rem)",
                  letterSpacing: ".48em", textTransform: "uppercase",
                  color: SILK_ROSE, fontWeight: 700, marginBottom: "1.5rem",
                  opacity: 0, animation: "ci-sinkIn .9s .06s ease forwards",
                }}>
                  The bride
                </p>

                {/* Glow halo behind name */}
                <div aria-hidden style={{
                  position: "absolute", left: "50%", top: "50%",
                  width: "clamp(280px,60vw,520px)", height: "clamp(100px,20vw,180px)",
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(ellipse at center, rgba(190,45,69,.16) 0%, transparent 70%)",
                  animation: "ci-glow 2.8s .4s ease forwards",
                  opacity: 0,
                }} />

                <CharReveal word={brideFirst} color={SILK_CREAM}
                  style={{
                    fontFamily: DF,
                    fontSize: "clamp(5rem,15vw,11rem)",
                    fontWeight: 700, lineHeight: .82,
                    letterSpacing: "-0.04em",
                    textShadow: `0 2px 80px rgba(0,0,0,.75), 0 0 60px rgba(190,45,69,.18)`,
                  }}
                  delay={180}
                />

                <div style={{
                  width: "min(240px,50%)", height: 1.5, margin: "2rem auto 0",
                  background: `linear-gradient(90deg, transparent, ${ROSE}, transparent)`,
                  transformOrigin: "center", borderRadius: 1,
                  opacity: 0, animation: "ci-lineGrow 1.1s 1.0s ease forwards",
                  boxShadow: `0 0 16px rgba(190,45,69,.55)`,
                }} />
              </div>
            )}

            {/* Scene 2 — Groom */}
            {scene === 2 && (
              <div style={{ position: "relative" }}>
                <p style={{
                  fontFamily: BF, fontSize: "clamp(.44rem,1.1vw,.55rem)",
                  letterSpacing: ".48em", textTransform: "uppercase",
                  color: SILK_GOLD, fontWeight: 700, marginBottom: "1.5rem",
                  opacity: 0, animation: "ci-sinkIn .9s .06s ease forwards",
                }}>
                  &amp; the groom
                </p>

                <div aria-hidden style={{
                  position: "absolute", left: "50%", top: "50%",
                  width: "clamp(280px,60vw,520px)", height: "clamp(100px,20vw,180px)",
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(ellipse at center, rgba(168,120,8,.18) 0%, transparent 70%)",
                  animation: "ci-glow 2.8s .4s ease forwards",
                  opacity: 0,
                }} />

                <CharReveal word={groomFirst} color={`rgba(238,188,20,.93)`}
                  style={{
                    fontFamily: DF,
                    fontSize: "clamp(5rem,15vw,11rem)",
                    fontWeight: 700, lineHeight: .82,
                    letterSpacing: "-0.04em",
                    textShadow: `0 2px 80px rgba(0,0,0,.65), 0 0 60px rgba(168,120,8,.28)`,
                  }}
                  delay={180}
                />

                <div style={{
                  width: "min(240px,50%)", height: 1.5, margin: "2rem auto 0",
                  background: `linear-gradient(90deg, transparent, ${GOLD_B}, transparent)`,
                  transformOrigin: "center", borderRadius: 1,
                  opacity: 0, animation: "ci-lineGrow 1.1s 1.0s ease forwards",
                  boxShadow: `0 0 16px rgba(201,150,10,.60)`,
                }} />
              </div>
            )}

            {/* Scene 3 — Together (asymmetric split) */}
            {scene === 3 && (
              <div>
                <p style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(.9rem,2.5vw,1.3rem)",
                  color: SILK_DIM, letterSpacing: ".06em",
                  marginBottom: "2rem",
                  opacity: 0, animation: "ci-fadeIn 1.2s .1s ease forwards",
                }}>
                  Two lives. One promise.
                </p>

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "clamp(.75rem,3vw,2rem)",
                  opacity: 0, animation: "ci-riseIn 1.1s .3s cubic-bezier(.22,1,.36,1) forwards",
                }}>
                  <span className="ci-n-pair" style={{
                    fontFamily: DF, fontSize: "clamp(3.2rem,10.5vw,7.5rem)",
                    fontWeight: 700, lineHeight: .88, letterSpacing: "-0.03em",
                    color: SILK_CREAM,
                    textShadow: "0 2px 50px rgba(0,0,0,.65)",
                    textAlign: "right",
                  }}>
                    {brideFirst}
                  </span>

                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 10, flexShrink: 0,
                    opacity: 0, animation: "ci-fadeIn .7s .9s ease forwards",
                  }}>
                    <div style={{ width: 1, height: "clamp(28px,4vw,44px)", background: `linear-gradient(to bottom, transparent, ${GOLD_L})`, boxShadow: `0 0 6px rgba(201,150,10,.5)` }} />
                    <span style={{
                      fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                      fontSize: "clamp(1.5rem,4.5vw,3rem)",
                      color: ROSE_L, letterSpacing: ".10em",
                      filter: "drop-shadow(0 0 10px rgba(190,45,69,.55))",
                    }}>
                      &amp;
                    </span>
                    <div style={{ width: 1, height: "clamp(28px,4vw,44px)", background: `linear-gradient(to top, transparent, ${GOLD_L})`, boxShadow: `0 0 6px rgba(201,150,10,.5)` }} />
                  </div>

                  <span className="ci-n-pair" style={{
                    fontFamily: DF, fontSize: "clamp(3.2rem,10.5vw,7.5rem)",
                    fontWeight: 700, lineHeight: .88, letterSpacing: "-0.03em",
                    color: `rgba(238,188,20,.90)`,
                    textShadow: "0 2px 50px rgba(0,0,0,.60), 0 0 70px rgba(168,120,8,.22)",
                    textAlign: "left",
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
                  fontSize: "clamp(.9rem,2.2vw,1.2rem)",
                  color: SILK_GHOST, letterSpacing: ".05em", marginBottom: "1.75rem",
                  opacity: 0, animation: "ci-fadeIn 1.2s .1s ease forwards",
                }}>
                  invite you to witness their union
                </p>
                {weddingDate && (
                  <p style={{
                    fontFamily: DF, fontWeight: 500,
                    fontSize: "clamp(2rem,7vw,4.5rem)",
                    color: SILK_CREAM, letterSpacing: ".05em", lineHeight: 1.15,
                    marginBottom: ".875rem",
                    opacity: 0, animation: "ci-riseIn 1.1s .3s cubic-bezier(.22,1,.36,1) forwards",
                    textShadow: "0 4px 50px rgba(0,0,0,.65)",
                  }}>
                    {weddingDate}
                  </p>
                )}
                {(venueName || venueCity) && (
                  <p style={{
                    fontFamily: BF, fontSize: "clamp(.76rem,1.9vw,.92rem)",
                    color: SILK_GOLD, letterSpacing: ".14em", fontWeight: 500,
                    marginBottom: "1.75rem",
                    opacity: 0, animation: "ci-riseIn .9s .55s ease forwards",
                  }}>
                    {[venueName, venueCity].filter(Boolean).join("  ·  ")}
                  </p>
                )}
                <div style={{
                  display: "flex", flexDirection: "column", gap: 6, alignItems: "center",
                  opacity: 0, animation: "ci-fadeIn .8s .95s ease forwards",
                }}>
                  <div style={{ width: "min(210px,46%)", height: 1, background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)` }} />
                  <div style={{ width: "min(120px,26%)", height: 1, background: `linear-gradient(90deg, transparent, rgba(201,150,10,.28), transparent)` }} />
                </div>
              </div>
            )}

            {/* Scene 5 — Countdown dial */}
            {scene === 5 && (
              <div>
                <p style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1rem,2.8vw,1.45rem)",
                  color: SILK_DIM, letterSpacing: ".05em", marginBottom: "2.5rem",
                  opacity: 0, animation: "ci-fadeIn 1.0s .1s ease forwards",
                }}>
                  The time draws near
                </p>
                <div style={{ opacity: 0, animation: "ci-riseIn 1.1s .3s cubic-bezier(.22,1,.36,1) forwards" }}>
                  {weddingDate && <CountdownDial target={weddingDate} />}
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 16,
                  justifyContent: "center", margin: "2.5rem 0 0",
                  opacity: 0, animation: "ci-fadeIn .8s 1.0s ease forwards",
                }}>
                  <div style={{ flex: 1, maxWidth: 70, height: 1, background: `linear-gradient(to right, transparent, rgba(210,56,80,.5))` }} />
                  <span style={{
                    fontFamily: BF, fontSize: ".46rem", letterSpacing: ".44em",
                    textTransform: "uppercase", color: "rgba(210,56,80,.62)", fontWeight: 700,
                  }}>
                    {brideFirst} &amp; {groomFirst}
                  </span>
                  <div style={{ flex: 1, maxWidth: 70, height: 1, background: `linear-gradient(to left, transparent, rgba(210,56,80,.5))` }} />
                </div>
              </div>
            )}
          </div>

          {/* ── Progress line (fills left to right) ── */}
          <div style={{
            position: "absolute",
            bottom: "clamp(52px,10vh,96px)", left: "50%",
            transform: "translateX(-50%)",
            width: "min(180px,40vw)", height: 1, zIndex: 7,
            background: "rgba(255,255,255,.10)", borderRadius: 1,
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: "0 auto 0 0",
              width: `${progWidth}%`, height: "100%",
              background: scene < 3
                ? `linear-gradient(to right, ${ROSE_L}, ${ROSE})`
                : `linear-gradient(to right, ${GOLD_L}, ${GOLD_B})`,
              borderRadius: 1,
              transition: "width .06s linear, background .7s ease",
              boxShadow: `0 0 6px ${scene < 3 ? ROSE : GOLD_L}`,
            }} />
          </div>

          {/* ── Scene number ── */}
          <div style={{
            position: "absolute",
            bottom: "clamp(52px,10vh,96px)", right: 24, zIndex: 7,
            fontFamily: BF, fontSize: ".44rem", letterSpacing: ".34em",
            color: "rgba(255,255,255,.22)", textTransform: "uppercase",
          }}>
            {String(scene + 1).padStart(2,"0")} / {String(SCENE_HOLD.length).padStart(2,"0")}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE 2 · ATELIER — the sealed card
      ══════════════════════════════════════════════════════════════════════ */}
      {phase === "atelier" && (
        <div
          className={`ci-phase${phaseLeaving ? " ci-leaving" : ""}`}
          onMouseMove={() => setCursor(c => ({ ...c, big: false }))}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: BG_WARM,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "clamp(56px,10vh,80px) 20px clamp(32px,5vh,56px)",
            cursor: "none",
          }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* SVG cross-hatch paper texture */}
          <svg aria-hidden style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0, opacity:.55 }}>
            <defs>
              <pattern id="crosshatch" width="14" height="14" patternUnits="userSpaceOnUse">
                <path d="M0 14L14 0" stroke="rgba(190,45,69,.06)" strokeWidth=".5" fill="none"/>
                <path d="M-3.5 10.5L10.5 -3.5" stroke="rgba(190,45,69,.04)" strokeWidth=".5" fill="none"/>
                <path d="M3.5 17.5L17.5 3.5" stroke="rgba(190,45,69,.04)" strokeWidth=".5" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#crosshatch)"/>
          </svg>

          {/* Ambient warm radials */}
          <div aria-hidden style={{
            position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
            background: `
              radial-gradient(ellipse 60% 48% at 10% 14%, rgba(190,45,69,.06) 0%, transparent 55%),
              radial-gradient(ellipse 50% 44% at 92% 88%, rgba(168,120,8,.05) 0%, transparent 50%)
            `,
          }} />

          {/* Skip chip */}
          <button type="button" onClick={openInvitation}
            className="ci-chip-light"
            style={{ position:"fixed", top:14, right:14, zIndex:10, opacity:0, animation:"ci-fadeIn .6s .5s ease forwards" }}
            onMouseEnter={() => setCursor(c => ({ ...c, big: true }))}
            onMouseLeave={() => setCursor(c => ({ ...c, big: false }))}
          >
            <SkipForward size={10} /> Skip
          </button>

          {/* Card wrapper */}
          <div style={{
            position: "relative", zIndex: 2,
            width: "100%", maxWidth: 468,
            animation: cardLifting
              ? "ci-cardLift .75s .0s cubic-bezier(.22,1,.36,1) forwards"
              : "ci-scaleIn 1.0s .1s cubic-bezier(.22,1,.36,1) forwards",
            opacity: cardLifting ? undefined : 0,
          }}>

            {/* Addressed-to */}
            <div style={{
              textAlign: "center", marginBottom: "1.75rem",
              opacity: 0, animation: "ci-fadeIn .85s .40s ease forwards",
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
                fontSize: "clamp(1.55rem,5.5vw,2.1rem)",
                color: INK, letterSpacing: ".02em", lineHeight: 1.15, marginTop: ".3rem",
              }}>
                {guestLabel}
              </p>
            </div>

            {/* THE CARD */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: 26,
              border: `1px solid rgba(190,45,69,.08)`,
              boxShadow: `
                0 1px 2px rgba(50,10,20,.04),
                0 4px 12px rgba(50,10,20,.06),
                0 12px 32px rgba(50,10,20,.08),
                0 32px 72px rgba(50,10,20,.10),
                0 64px 96px rgba(50,10,20,.06),
                0 6px 24px rgba(190,45,69,.06)
              `,
              overflow: "hidden",
              position: "relative",
            }}>

              {/* Inner paper texture on the card */}
              <div aria-hidden style={{
                position: "absolute", inset: 0, borderRadius: 26, pointerEvents: "none", zIndex: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23p)' opacity='0.025'/%3E%3C/svg%3E")`,
              }} />

              {/* Top accent stripe */}
              <div style={{
                position: "relative", zIndex: 1,
                height: 4,
                background: `linear-gradient(90deg, transparent 0%, ${ROSE_L} 14%, ${ROSE} 30%, ${GOLD_L} 50%, ${ROSE} 70%, ${ROSE_L} 86%, transparent 100%)`,
              }} />

              <div className="ci-card-p" style={{ padding: "clamp(1.875rem,5.5vw,2.625rem)", position: "relative", zIndex: 1 }}>

                {/* Brand eyebrow with ✦ diamond */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  justifyContent: "center", marginBottom: "2.25rem",
                  opacity: 0, animation: "ci-fadeIn .75s .72s ease forwards",
                }}>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, rgba(190,45,69,.20))` }} />
                  <div style={{ width: 5, height: 5, transform: "rotate(45deg)", background: ROSE, flexShrink: 0, opacity: .6 }} />
                  <span style={{
                    fontFamily: BF, fontSize: ".48rem", letterSpacing: ".48em",
                    textTransform: "uppercase", color: ROSE, fontWeight: 700,
                    padding: "0 .5rem",
                  }}>
                    {title}
                  </span>
                  <div style={{ width: 5, height: 5, transform: "rotate(45deg)", background: ROSE, flexShrink: 0, opacity: .6 }} />
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, rgba(190,45,69,.20))` }} />
                </div>

                {/* WAX SEAL MEDALLION */}
                <div style={{
                  display: "flex", justifyContent: "center", marginBottom: "2.25rem",
                  opacity: 0, animation: "ci-scaleIn 1.0s .88s cubic-bezier(.34,1.56,.64,1) forwards",
                }}>
                  <div
                    onMouseEnter={() => { if (sealState === "sealed") setSealState("hover"); }}
                    onMouseLeave={() => { if (sealState === "hover") setSealState("sealed"); }}
                    onClick={openInvitation}
                    style={{
                      position: "relative",
                      width: 108, height: 108,
                      cursor: "none",
                      animation: sealState === "sealed" ? "ci-sealIdle 4s 1.4s ease-in-out infinite"
                               : sealState === "hover"   ? "ci-sealHover .3s ease forwards"
                               : sealState === "cracking"? "ci-sealCrack .55s ease forwards"
                               : "none",
                    }}
                    onMouseMove={() => setCursor(c => ({ ...c, big: true }))}
                  >
                    {/* Seal burst ring on crack */}
                    {sealState === "cracking" && (
                      <div aria-hidden style={{
                        position: "absolute", inset: -20,
                        borderRadius: "50%",
                        border: `1.5px solid ${GOLD_L}`,
                        animation: "ci-burstOut .55s ease forwards",
                        opacity: 0,
                      }} />
                    )}

                    {/* Outer wax body */}
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      background: `radial-gradient(circle at 33% 28%, ${GOLD_PALE} 0%, ${GOLD_L} 35%, ${GOLD} 65%, #7A5504 100%)`,
                    }} />

                    {/* Sunburst tick marks ring */}
                    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} viewBox="0 0 108 108">
                      {Array.from({ length: 24 }, (_, i) => {
                        const angle = (i / 24) * Math.PI * 2;
                        const r1 = 50, r2 = i % 6 === 0 ? 44 : 47;
                        return (
                          <line key={i}
                            x1={54 + r1 * Math.cos(angle)} y1={54 + r1 * Math.sin(angle)}
                            x2={54 + r2 * Math.cos(angle)} y2={54 + r2 * Math.sin(angle)}
                            stroke="rgba(255,255,255,.25)" strokeWidth="0.6"
                          />
                        );
                      })}
                    </svg>

                    {/* Outer ring */}
                    <div style={{ position:"absolute", inset:6, borderRadius:"50%", border:"1px solid rgba(255,255,255,.38)" }} />
                    {/* Middle ring */}
                    <div style={{ position:"absolute", inset:14, borderRadius:"50%", border:"0.5px solid rgba(255,255,255,.22)" }} />
                    {/* Inner ring */}
                    <div style={{ position:"absolute", inset:22, borderRadius:"50%", border:"0.5px solid rgba(255,255,255,.14)" }} />

                    {/* Initials */}
                    <span style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: DF, fontSize: "1.65rem",
                      color: "#FFFEF8", fontWeight: 700, letterSpacing: ".10em",
                      textShadow: "0 1px 4px rgba(0,0,0,.35)",
                    }}>
                      {initials}
                    </span>

                    {/* Crack SVG (appears on cracking) */}
                    {(sealState === "cracking" || sealState === "gone") && (
                      <svg style={{ position:"absolute", inset:0 }} viewBox="0 0 108 108">
                        <path d="M54 22 L48 46 L58 54 L44 86" stroke="rgba(255,255,255,.75)" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                        <path d="M54 22 L62 44 L52 54 L68 84" stroke="rgba(255,255,255,.40)" strokeWidth=".8" fill="none" strokeLinecap="round"/>
                        <path d="M38 34 L50 48" stroke="rgba(255,255,255,.35)" strokeWidth=".6" fill="none"/>
                        <path d="M70 38 L58 52" stroke="rgba(255,255,255,.30)" strokeWidth=".6" fill="none"/>
                      </svg>
                    )}
                  </div>
                </div>

                {/* "Press to open" hint */}
                <p style={{
                  textAlign: "center", marginTop: "-1.25rem", marginBottom: "1.875rem",
                  fontFamily: BF, fontSize: ".48rem", letterSpacing: ".32em",
                  textTransform: "uppercase", color: INK_4,
                  opacity: 0, animation: "ci-fadeIn .7s 1.55s ease forwards",
                }}>
                  Press the seal to open
                </p>

                {/* Couple names */}
                <div style={{
                  textAlign: "center", marginBottom: "1.5rem",
                  opacity: 0, animation: "ci-riseIn 1.0s 1.05s cubic-bezier(.22,1,.36,1) forwards",
                }}>
                  <h2 style={{
                    fontFamily: DF, fontWeight: 700, lineHeight: .88,
                    fontSize: "clamp(2.1rem,7.5vw,3.4rem)",
                    letterSpacing: "-0.025em", color: INK,
                  }}>
                    {brideFirst}
                  </h2>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                    fontSize: "clamp(1.15rem,4vw,1.9rem)",
                    color: ROSE, lineHeight: 1.25, margin: ".12em 0", letterSpacing: ".08em",
                  }}>
                    &amp;
                  </p>
                  <h2 style={{
                    fontFamily: DF, fontWeight: 700, lineHeight: .88,
                    fontSize: "clamp(2.1rem,7.5vw,3.4rem)",
                    letterSpacing: "-0.025em", color: INK_2,
                  }}>
                    {groomFirst}
                  </h2>
                </div>

                {/* Ornamental divider with diamond */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  justifyContent: "center", margin: "1.375rem 0",
                  opacity: 0, animation: "ci-fadeIn .75s 1.15s ease forwards",
                }}>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, rgba(168,120,8,.35))` }} />
                  <div style={{ width: 5, height: 5, transform: "rotate(45deg)", background: GOLD, flexShrink: 0 }} />
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, rgba(168,120,8,.35))` }} />
                </div>

                {/* Detail chips */}
                <div style={{
                  display: "flex", flexWrap: "wrap", justifyContent: "center",
                  gap: ".5rem", marginBottom: "1.625rem",
                  opacity: 0, animation: "ci-fadeIn .75s 1.25s ease forwards",
                }}>
                  {[
                    { text: weddingDate, rose: true  },
                    { text: venueName,   rose: false },
                    { text: venueCity,   rose: false },
                  ].filter(x => x.text).map(({ text, rose: r }, i) => (
                    <span key={i} style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "5px 15px", borderRadius: 999,
                      background: r ? "rgba(190,45,69,.055)" : "rgba(168,120,8,.055)",
                      border: `1px solid ${r ? "rgba(190,45,69,.14)" : "rgba(168,120,8,.14)"}`,
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
                    opacity: 0, animation: "ci-fadeIn .75s 1.35s ease forwards",
                  }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "7px 20px", borderRadius: 999,
                      background: BG_LINEN, border: `1px solid ${BDR}`,
                      fontFamily: BF, fontSize: ".7rem", color: INK_3,
                      letterSpacing: ".04em", fontWeight: 500,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: ROSE, flexShrink: 0,
                        boxShadow: `0 0 7px ${ROSE}`,
                        animation: "ci-breathe 2.2s ease-in-out infinite",
                      }} />
                      <CountdownLabel target={weddingDate} />
                    </span>
                  </div>
                )}

                {/* Handwritten-style note */}
                <div style={{
                  position: "relative",
                  background: BG_LINEN,
                  borderLeft: `3px solid rgba(190,45,69,.28)`,
                  borderRadius: "0 14px 14px 0",
                  padding: "1.125rem 1.25rem 1.125rem 1.375rem",
                  marginBottom: "2rem",
                  opacity: 0, animation: "ci-riseIn .95s 1.45s ease forwards",
                }}>
                  <p style={{
                    fontFamily: BF, fontSize: ".50rem", letterSpacing: ".28em",
                    textTransform: "uppercase", color: ROSE, fontWeight: 700,
                    marginBottom: ".625rem",
                  }}>
                    A note from the couple
                  </p>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(.9rem,2.3vw,1.05rem)",
                    color: INK, lineHeight: 1.90,
                  }}>
                    Dear {guestLabel},
                  </p>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(.9rem,2.3vw,1.05rem)",
                    color: INK_2, lineHeight: 1.90, marginTop: ".35rem",
                  }}>
                    {brideFirst} and {groomFirst} warmly invite you to witness
                    and celebrate their union. You are not just a guest —
                    you are part of the story that brought them here.
                  </p>
                </div>

                {/* Magnetic open button */}
                <div style={{ opacity: 0, animation: "ci-riseIn .95s 1.65s cubic-bezier(.22,1,.36,1) forwards" }}>
                  <div style={{ padding: 2, borderRadius: 18, background: "transparent" }}>
                    <button
                      ref={ctaRef}
                      type="button"
                      className="ci-open-btn"
                      onMouseMove={handleMagMove}
                      onMouseLeave={() => setCtaMag({ x: 0, y: 0 })}
                      onMouseEnter={() => setCursor(c => ({ ...c, big: true }))}
                      onClick={openInvitation}
                      style={{
                        transform: `translate(${ctaMag.x}px, ${ctaMag.y}px)`,
                        transition: `transform .42s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease, filter .16s ease`,
                      }}
                    >
                      <span style={{ fontSize: ".95rem", opacity: .9 }}>✉</span>
                      Open your invitation
                    </button>
                  </div>

                  <p style={{
                    marginTop: "1rem", textAlign: "center",
                    fontFamily: BF, fontSize: ".60rem",
                    color: INK_4, letterSpacing: ".04em", lineHeight: 1.7,
                  }}>
                    {subtitle}
                  </p>
                </div>

                {/* Prepared exclusively fine print */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  justifyContent: "center", marginTop: "1.5rem",
                  opacity: 0, animation: "ci-fadeIn .7s 1.9s ease forwards",
                }}>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, rgba(168,120,8,.18))` }} />
                  <span style={{
                    fontFamily: BF, fontSize: ".44rem", letterSpacing: ".30em",
                    textTransform: "uppercase", color: INK_4,
                  }}>
                    Prepared exclusively
                  </span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, rgba(168,120,8,.18))` }} />
                </div>

              </div>

              {/* Bottom accent stripe */}
              <div style={{
                position: "relative", zIndex: 1,
                height: 4,
                background: `linear-gradient(90deg, transparent 0%, ${ROSE_L} 14%, ${ROSE} 30%, ${GOLD_L} 50%, ${ROSE} 70%, ${ROSE_L} 86%, transparent 100%)`,
              }} />
            </div>

            {/* Below-card signature */}
            <p style={{
              marginTop: "1.375rem", textAlign: "center",
              fontFamily: BF, fontSize: ".46rem", letterSpacing: ".40em",
              textTransform: "uppercase", color: INK_4,
              opacity: 0, animation: "ci-fadeIn .7s 1.95s ease forwards",
            }}>
              {brideFirst} &amp; {groomFirst} · {weddingDate ?? ""}
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE 3 · UNVEIL
      ══════════════════════════════════════════════════════════════════════ */}
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
              <div aria-hidden style={{ position:"absolute", inset:0, zIndex:0, overflow:"hidden" }}>
                <div className="ci-parallax-photo" style={{
                  position:"absolute", inset:"-10%",
                  backgroundImage: `url(${heroPhotoUrl})`,
                  backgroundSize:"cover", backgroundPosition:"center center",
                  filter:"saturate(.38) brightness(.65)",
                  willChange:"transform",
                  transform:"translateY(0) scale(1.08)",
                }} />
              </div>
            )}

            {/* Warm duotone wash — rose-to-gold instead of plain cream */}
            <div aria-hidden style={{
              position:"absolute", inset:0, zIndex:1,
              background:`
                linear-gradient(to bottom,
                  rgba(253,250,247,.94) 0%,
                  rgba(253,248,244,.68) 12%,
                  rgba(251,245,240,.52) 35%,
                  rgba(252,248,244,.70) 62%,
                  rgba(253,250,247,.97) 100%
                )
              `,
            }} />

            {/* Side vignette — slightly warm rose */}
            <div aria-hidden style={{
              position:"absolute", inset:0, zIndex:2,
              background:"radial-gradient(ellipse 100% 80% at 50% 50%, transparent 38%, rgba(240,228,220,.55) 100%)",
            }} />

            {/* Rose + gold ambient blooms */}
            <div aria-hidden style={{
              position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
              background:`
                radial-gradient(ellipse 56% 46% at 12% 18%, rgba(190,45,69,.05) 0%, transparent 56%),
                radial-gradient(ellipse 46% 42% at 90% 82%, rgba(168,120,8,.045) 0%, transparent 50%)
              `,
            }} />

            {/* Top linen fade */}
            <div aria-hidden style={{
              position:"absolute", top:0, left:0, right:0, height:90,
              background:`linear-gradient(to bottom, ${BG}, transparent)`, zIndex:3,
            }} />

            {/* Content */}
            <div style={{ position:"relative", zIndex:5, padding:"6.5rem 1.5rem 8.5rem", maxWidth:720, width:"100%" }}>

              {/* Eyebrow */}
              <div className="ci-h0" style={{ display:"flex", alignItems:"center", gap:14, justifyContent:"center", marginBottom:"2.25rem" }}>
                <div style={{ width:40, height:1, background:`linear-gradient(to right, transparent, ${ROSE_MID})` }} />
                <span style={{ fontFamily:BF, fontSize:".48rem", letterSpacing:".54em", textTransform:"uppercase", color:ROSE, fontWeight:700 }}>
                  {title}
                </span>
                <div style={{ width:40, height:1, background:`linear-gradient(to left, transparent, ${ROSE_MID})` }} />
              </div>

              {/* Bride */}
              <h1 className="ci-h1 ci-h-name" style={{
                fontFamily:DF,
                fontSize:"clamp(3.8rem,13vw,9.5rem)",
                fontWeight:700, lineHeight:.85, letterSpacing:"-0.035em",
                color:INK,
                textShadow:`0 2px 40px rgba(18,11,14,.18)`,
                marginBottom:".04em",
              }}>
                {brideFirst}
              </h1>

              {/* & */}
              <p className="ci-h2" style={{
                fontFamily:DF, fontSize:"clamp(1.4rem,4.5vw,3.2rem)",
                fontWeight:300, fontStyle:"italic",
                color:ROSE, letterSpacing:".10em", lineHeight:1.2,
                marginBottom:".04em",
              }}>
                &amp;
              </p>

              {/* Groom */}
              <h1 className="ci-h3 ci-h-name" style={{
                fontFamily:DF,
                fontSize:"clamp(3.8rem,13vw,9.5rem)",
                fontWeight:700, lineHeight:.85, letterSpacing:"-0.035em",
                color:INK_2,
                textShadow:`0 2px 40px rgba(54,32,48,.16)`,
                marginBottom:"1.875rem",
              }}>
                {groomFirst}
              </h1>

              {/* Drawing gold rule */}
              <div className="ci-h4" style={{
                width:"min(260px,56%)", height:1, margin:"0 auto 1.875rem",
                background:`linear-gradient(90deg, transparent, ${GOLD_L}, transparent)`,
                transformOrigin:"center", opacity:0,
              }} />

              {/* Date · Venue · City */}
              <div className="ci-h5" style={{
                display:"flex", flexWrap:"wrap", alignItems:"center",
                justifyContent:"center", gap:".65rem", marginBottom:"1.375rem",
              }}>
                {weddingDate && (
                  <span style={{ fontFamily:BF, fontSize:".9rem", color:INK, letterSpacing:".05em", fontWeight:600 }}>
                    {weddingDate}
                  </span>
                )}
                {venueName && (
                  <>
                    <span aria-hidden style={{ width:3, height:3, borderRadius:"50%", background:ROSE, display:"inline-block", opacity:.55 }} />
                    <span style={{ fontFamily:BF, fontSize:".875rem", color:INK_2, letterSpacing:".04em", fontWeight:500 }}>{venueName}</span>
                  </>
                )}
                {venueCity && (
                  <>
                    <span aria-hidden style={{ width:3, height:3, borderRadius:"50%", background:ROSE, display:"inline-block", opacity:.35 }} />
                    <span style={{ fontFamily:BF, fontSize:".875rem", color:INK_3, letterSpacing:".04em" }}>{venueCity}</span>
                  </>
                )}
              </div>

              {/* Countdown */}
              {weddingDate && (
                <div className="ci-h6" style={{ marginBottom:"1.375rem" }}>
                  <span style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"7px 22px", borderRadius:999,
                    background:BG_LINEN, border:`1px solid ${BDR_MD}`,
                    fontFamily:BF, fontSize:".72rem", color:INK_3,
                    letterSpacing:".04em", fontWeight:500,
                  }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:ROSE, flexShrink:0, boxShadow:`0 0 6px ${ROSE}` }} />
                    <CountdownLabel target={weddingDate} />
                  </span>
                </div>
              )}

              {/* Personal tag */}
              <div className="ci-h7" style={{ marginBottom:"2.625rem" }}>
                <span style={{
                  display:"inline-block", padding:"7px 24px",
                  border:`1px solid ${BDR_MD}`, borderRadius:999,
                  fontFamily:DF, fontStyle:"italic",
                  fontSize:"clamp(.82rem,2vw,.97rem)",
                  color:ROSE, letterSpacing:".03em",
                  background:ROSE_PALE,
                }}>
                  A personal invitation for {guestLabel}
                </span>
              </div>

              {/* CTA */}
              <div className="ci-h8">
                <a href="#invite-content" className="ci-view-btn">
                  View invitation
                </a>
              </div>
            </div>

            {/* Scroll cue */}
            <div className="ci-h8" style={{
              position:"absolute", bottom:26, left:"50%",
              display:"flex", flexDirection:"column", alignItems:"center", gap:8,
              zIndex:5,
              animation:"ci-bounce 2.5s 2.2s ease-in-out infinite",
            }}>
              <span style={{ fontFamily:BF, fontSize:".42rem", letterSpacing:".42em", textTransform:"uppercase", color:INK_4 }}>
                Scroll
              </span>
              <div style={{ width:1, height:34, background:`linear-gradient(to bottom, ${ROSE_MID}, transparent)` }} />
              <ChevronDown size={12} style={{ color:ROSE_MID, marginTop:-6 }} />
            </div>
          </section>

          <div id="invite-content">{children}</div>
        </div>
      )}
    </>
  );
}

export default CinematicIntro;
