"use client";

/**
 * CinematicInvite — Cinematic Trailer Edition
 *
 * TRAILER PHASES (~15s total, auto-advances to hero):
 *  Scene 0 · BLACK OPEN   — Pure black. Gold letterbox bars slide in. Title breathes in.
 *  Scene 1 · BRIDE        — Her name typewriter-reveals letter by letter. Rose light bloom.
 *  Scene 2 · GROOM        — His name. Gold light bloom opposite corner.
 *  Scene 3 · TOGETHER     — Both names split screen. Vertical rule draws. Date types in.
 *  Scene 4 · VENUES       — Cinematic poster bottom-anchor. Church + resort with timestamps.
 *  → HERO  — Full-bleed dark photo. Wax seal CTA.
 *
 * CINEMATIC TECHNIQUES (CSS-only, no Three.js):
 *  · Canvas particle field — 400 floating gold dust motes
 *  · Film grain overlay — SVG feTurbulence noise animated via CSS
 *  · Letterbox bars — top + bottom 10vh black bars (CinemaScope feel)
 *  · Typewriter effect — letter-by-letter reveal with blinking cursor
 *  · Atmospheric radial blooms — per-scene coloured radial gradients
 *  · Gold scan-line wipe between scenes
 *  · CSS filter: blur + brightness on hero photo (no JS needed)
 */

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SkipForward } from "lucide-react";

/* ── Palette ─────────────────────────────────────────────────────────────── */
const FILM   = "#050305";
const ROSE   = "#BE2D45";
const ROSE_L = "#D44860";
const ROSE_M = "#F0BEC6";
const GOLD   = "#C9960A";
const GOLD_L = "#E8BC20";
const INK    = "#120B0E";
const INK_3  = "#72504A";
const INK_4  = "#A88888";

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

const SCENE_HOLD = [2000, 2600, 2600, 3000, 3000] as const;
const SCENES     = SCENE_HOLD.length;
const CROSSFADE  = 600;

/* ── Props ───────────────────────────────────────────────────────────────── */
interface CinematicIntroProps {
  inviteCode:   string;
  guestLabel:   string;
  brideName:    string;
  groomName:    string;
  title:        string;
  subtitle:     string;
  weddingDate?: string;
  venueName?:   string;
  venueCity?:   string;
  heroPhotoUrl?:string;
  audioSrc?:    string | null;
  children:     ReactNode;
}
type Phase = "title" | "hero";

/* ── Countdown ───────────────────────────────────────────────────────────── */
function useCountdown(target?: string) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const ms = new Date(target).getTime() - Date.now();
      if (ms <= 0) { setLabel("Today"); return; }
      const d = Math.floor(ms / 86400000);
      setLabel(d > 1 ? `${d} days to go` : d === 1 ? "Tomorrow" : "Today");
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [target]);
  return label;
}

/* ── Typewriter hook ─────────────────────────────────────────────────────── */
function useTypewriter(text: string, startMs = 0, charDelay = 55) {
  const [displayed, setDisplayed] = useState("");
  const [done,      setDone]      = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let idx = 0;
    const start = setTimeout(() => {
      const id = setInterval(() => {
        idx++;
        setDisplayed(text.slice(0, idx));
        if (idx >= text.length) { clearInterval(id); setDone(true); }
      }, charDelay);
      return () => clearInterval(id);
    }, startMs);
    return () => clearTimeout(start);
  }, [text, startMs, charDelay]);
  return { displayed, done };
}

/* ── Floating particle canvas ────────────────────────────────────────────── */
function ParticleCanvas({ color = "rgba(201,150,10,0.55)", count = 380 }: { color?: string; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* Seed particles */
    const pts = Array.from({ length: count }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      o:  Math.random() * 0.6 + 0.15,
      phase: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    let t   = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const alpha = p.o * (0.5 + 0.5 * Math.sin(t + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${alpha.toFixed(2)})`);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [color, count]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export function CinematicInvite({
  inviteCode    = "preview",
  guestLabel    = "Our Dearest Guest",
  brideName     = "Marion Jemima",
  groomName     = "Livingston",
  title         = "Surihana Vows",
  subtitle      = "A celebration of love, family, and forever.",
  weddingDate,
  venueName,
  venueCity,
  heroPhotoUrl,
  audioSrc      = null,
  children      = <div />,
}: CinematicIntroProps) {

  const [mounted,   setMounted]   = useState(false);
  const [phase,     setPhase]     = useState<Phase>("title");
  const [scene,     setScene]     = useState(0);
  const [vis,       setVis]       = useState(true);
  const [scan,      setScan]      = useState(false);
  const [leaving,   setLeaving]   = useState(false);
  const [heroVis,   setHeroVis]   = useState(false);
  const [sealState, setSealState] = useState<"idle"|"hover"|"burst"|"gone">("idle");

  const sceneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroRef    = useRef<HTMLElement | null>(null);

  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;
  const initials   = useMemo(() => `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase(), [brideName, groomName]);
  const cdLabel    = useCountdown(weddingDate);

  const storageKey = `surihana-intro:${inviteCode}`;
  const cookieName = `invite_intro_seen_${inviteCode}`;

  /* Typewriter lines — only active on their scene */
  const tw1 = useTypewriter(brideFirst.toUpperCase(), scene === 1 ? 300  : 99999, 70);
  const tw2 = useTypewriter(groomFirst.toUpperCase(), scene === 2 ? 300  : 99999, 70);
  const tw3b = useTypewriter(brideFirst.toUpperCase(), scene === 3 ? 200  : 99999, 65);
  const tw3g = useTypewriter(groomFirst.toUpperCase(), scene === 3 ? 900  : 99999, 65);
  const twDate = useTypewriter(weddingDate ?? "", scene === 3 ? 1800 : 99999, 45);

  /* ── Scroll lock ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow    = "hidden";
    document.body.style.touchAction = "none";
    return () => { document.body.style.overflow = ""; document.body.style.touchAction = ""; };
  }, []);

  /* ── Mount ── */
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const seen = document.cookie.split(";").some(c => c.trim().startsWith(`${cookieName}=`))
               || sessionStorage.getItem(storageKey) === "entered";
    if (seen) { setPhase("hero"); setTimeout(() => setHeroVis(true), 80); }
  }, [cookieName, storageKey]);

  /* ── Parallax ── */
  useEffect(() => {
    if (phase !== "hero" || typeof window === "undefined") return;
    const fn = () => {
      const el = heroRef.current?.querySelector<HTMLElement>(".ci-par");
      if (el) el.style.transform = `scale(1.08) translateY(${window.scrollY * 0.18}px)`;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [phase]);

  /* ── Auto-advance ── */
  useEffect(() => {
    if (phase !== "title") return;
    const hold = SCENE_HOLD[scene] ?? 2800;
    sceneTimer.current = setTimeout(() => {
      setVis(false);
      setTimeout(() => {
        setScan(true);
        setTimeout(() => {
          setScan(false);
          if (scene < SCENES - 1) { setScene(s => s + 1); setVis(true); }
          else goToHero();
        }, CROSSFADE);
      }, 180);
    }, hold);
    return () => { if (sceneTimer.current) clearTimeout(sceneTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, phase]);

  function markVisited() {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(storageKey, "entered");
    const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${cookieName}=1; expires=${exp}; path=/; SameSite=Lax`;
  }

  function goToHero() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    markVisited();
    setLeaving(true);
    setTimeout(() => {
      setLeaving(false);
      setPhase("hero");
      requestAnimationFrame(() => requestAnimationFrame(() => setHeroVis(true)));
    }, 900);
  }

  function skipToHero() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    setVis(false); markVisited(); setLeaving(true);
    setTimeout(() => {
      setLeaving(false); setPhase("hero");
      requestAnimationFrame(() => requestAnimationFrame(() => setHeroVis(true)));
    }, 650);
  }

  function handleSealClick() {
    if (sealState !== "idle" && sealState !== "hover") return;
    setSealState("burst");
    setTimeout(() => {
      setSealState("gone");
      document.body.style.overflow = ""; document.body.style.touchAction = "";
      document.getElementById("invite-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 520);
  }

  if (!mounted) return <div style={{ minHeight: "100dvh", background: FILM }}>{children}</div>;

  /* ─── Shared scene wrapper styles ─── */
  const sceneWrap: React.CSSProperties = {
    position: "absolute", inset: 0,
    display: "flex", flexDirection: "column", justifyContent: "center",
    padding: "clamp(48px,9vh,110px) clamp(28px,7vw,96px)",
    opacity: vis ? 1 : 0,
    transition: `opacity ${vis ? 150 : 200}ms ease`,
    pointerEvents: vis ? "auto" : "none",
    zIndex: 5,
  };

  /* ─── Letterbox bar height ─── */
  const LB = "clamp(52px,8.5vh,88px)";

  return (
    <>
      <style>{`
        @keyframes ci-fade    { from{opacity:0}                             to{opacity:1} }
        @keyframes ci-up      { from{opacity:0;transform:translateY(2rem)}  to{opacity:1;transform:none} }
        @keyframes ci-left    { from{opacity:0;transform:translateX(-5vw)} to{opacity:1;transform:none} }
        @keyframes ci-right   { from{opacity:0;transform:translateX(5vw)}  to{opacity:1;transform:none} }
        @keyframes ci-line-x  { from{transform:scaleX(0)}                   to{transform:scaleX(1)} }
        @keyframes ci-line-y  { from{transform:scaleY(0)}                   to{transform:scaleY(1)} }
        @keyframes ci-grow    { from{width:0}                               to{width:100%} }
        @keyframes ci-lb-top  { from{transform:translateY(-100%)}           to{transform:translateY(0)} }
        @keyframes ci-lb-bot  { from{transform:translateY(100%)}            to{transform:translateY(0)} }
        @keyframes ci-scan    { 0%{left:-2px;opacity:1} 96%{left:100%;opacity:1} 100%{left:100%;opacity:0} }
        @keyframes ci-grain   { 0%{transform:translate(0,0)}50%{transform:translate(-2%,-1%)}100%{transform:translate(1%,2%)} }
        @keyframes ci-blink   { 0%,48%{opacity:1} 52%,100%{opacity:0} }
        @keyframes ci-bounce  { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(9px)} }

        /* hero stagger */
        .hv .h0{opacity:0;animation:ci-fade  .8s .00s ease           forwards}
        .hv .h1{opacity:0;animation:ci-up    1.1s .12s cubic-bezier(.16,1,.3,1) forwards}
        .hv .h2{opacity:0;animation:ci-fade  .7s .26s ease           forwards}
        .hv .h3{opacity:0;animation:ci-up    1.1s .38s cubic-bezier(.16,1,.3,1) forwards}
        .hv .h4{opacity:0;animation:ci-fade  .8s .52s ease           forwards}
        .hv .h5{opacity:0;animation:ci-up    .9s .66s cubic-bezier(.22,1,.36,1) forwards}
        .hv .h6{opacity:0;animation:ci-fade  .8s .80s ease           forwards}
        .hv .h7{opacity:0;animation:ci-up    .8s 1.05s cubic-bezier(.34,1.56,.64,1) forwards}

        /* seal */
        @keyframes ci-seal-pulse {
          0%,100%{box-shadow:0 12px 36px rgba(0,0,0,.52),0 0 0 0 rgba(168,120,8,0)}
          50%    {box-shadow:0 14px 44px rgba(0,0,0,.58),0 0 0 18px rgba(168,120,8,.12)}
        }
        @keyframes ci-seal-hover { to{transform:translateY(-5px) scale(1.06) rotate(2deg)} }
        @keyframes ci-seal-burst {
          0%  {transform:scale(1);opacity:1}
          30% {transform:scale(1.24) rotate(-5deg);opacity:.85}
          60% {transform:scale(.68) rotate(10deg);opacity:.35}
          100%{transform:scale(0) rotate(22deg);opacity:0}
        }
        @keyframes ci-ring1 { to{transform:scale(3.0);opacity:0} }
        @keyframes ci-ring2 { to{transform:scale(4.2);opacity:0} }

        /* cursor */
        .ci-cursor {
          display:inline-block;width:3px;height:.85em;vertical-align:middle;
          background:currentColor;margin-left:3px;
          animation:ci-blink .95s step-end infinite;
        }

        /* mobile */
        @media(max-width:520px){
          .ci-tw  { font-size:clamp(3.8rem,17vw,7rem)!important }
          .ci-tw2 { font-size:clamp(2.8rem,13vw,5.5rem)!important }
          .ci-date{ font-size:clamp(1.6rem,7.5vw,2.8rem)!important }
          .ci-ven { font-size:clamp(1.4rem,6.5vw,2.6rem)!important }
          .ci-split{ flex-direction:column!important;align-items:center!important }
          .ci-sa,.ci-sb{ text-align:center!important;padding:0!important }
          .ci-vdiv{ display:none!important }
          .ci-amp { position:static!important;transform:none!important;
                    display:block;text-align:center;font-size:clamp(.9rem,4vw,1.5rem)!important;margin:.1em 0!important }
          .h-name { font-size:clamp(3rem,13vw,7.5rem)!important }
          .ci-seal-wrap{ width:clamp(110px,28vw,150px)!important;height:clamp(110px,28vw,150px)!important }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          TITLE TRAILER
      ══════════════════════════════════════════════════════════════════ */}
      {phase === "title" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: FILM, overflow: "hidden",
          opacity: leaving ? 0 : 1,
          transition: leaving ? "opacity .9s cubic-bezier(.4,0,.2,1)" : "none",
        }}>

          {/* ── Floating gold particle field ── */}
          <ParticleCanvas
            color={scene <= 1 ? "rgba(190,45,69,0.50)" : "rgba(201,150,10,0.55)"}
            count={360}
          />

          {/* ── Film grain overlay ── */}
          <svg aria-hidden style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            zIndex: 2, pointerEvents: "none", opacity: .28,
            animation: "ci-grain 0.18s steps(1) infinite",
          }}>
            <filter id="grain">
              <feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain)" opacity=".07" />
          </svg>

          {/* ── CinemaScope letterbox bars ── */}
          <div aria-hidden style={{
            position: "absolute", top: 0, left: 0, right: 0, height: LB, zIndex: 10,
            background: "#000",
            animation: "ci-lb-top .7s .05s cubic-bezier(.16,1,.3,1) both",
          }} />
          <div aria-hidden style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: LB, zIndex: 10,
            background: "#000",
            animation: "ci-lb-bot .7s .05s cubic-bezier(.16,1,.3,1) both",
          }} />

          {/* ── Gold top accent line (inside top letterbox) ── */}
          <div aria-hidden style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 11,
            background: `linear-gradient(90deg, transparent 5%, rgba(190,45,69,.45) 28%, rgba(201,150,10,.72) 50%, rgba(190,45,69,.45) 72%, transparent 95%)`,
            opacity: 0, animation: "ci-fade .6s .8s ease forwards",
          }} />

          {/* ── Skip ── */}
          {scene >= 1 && (
            <button type="button" onClick={skipToHero} style={{
              position: "absolute", top: 20, right: 20, zIndex: 12,
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 16px", background: "transparent", border: "none",
              fontFamily: BF, fontSize: ".50rem", fontWeight: 500,
              letterSpacing: ".26em", textTransform: "uppercase",
              color: "rgba(255,255,255,.24)", cursor: "pointer",
              opacity: 0, animation: "ci-fade .5s .15s ease forwards",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,.70)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.24)")}
            >
              <SkipForward size={10} /> Skip
            </button>
          )}

          {/* ── Scene scan-line wipe ── */}
          {scan && (
            <div aria-hidden style={{
              position: "absolute", top: 0, bottom: 0, width: 2, zIndex: 9,
              background: `linear-gradient(to bottom, transparent, ${GOLD} 20%, rgba(232,188,20,.9) 50%, ${GOLD} 80%, transparent)`,
              boxShadow: `0 0 20px 4px rgba(232,188,20,.30)`,
              animation: `ci-scan ${CROSSFADE}ms linear forwards`,
            }} />
          )}

          {/* ── Progress — 1px at very bottom edge (above letterbox) ── */}
          <div style={{
            position: "absolute", bottom: `calc(${LB} - 1px)`, left: 0, right: 0,
            height: 1, background: "rgba(255,255,255,.06)", zIndex: 11,
          }}>
            <div style={{
              position: "absolute", inset: "0 auto 0 0",
              background: scene <= 1
                ? `linear-gradient(to right,${ROSE},${ROSE_L})`
                : `linear-gradient(to right,${GOLD},${GOLD_L})`,
              animation: `ci-grow ${SCENE_HOLD[scene] ?? 2800}ms linear forwards`,
            }} />
          </div>

          {/* ══════════════════════════════════════════════════
              SCENE 0 · OVERTURE
          ══════════════════════════════════════════════════ */}
          {scene === 0 && (
            <div style={{ ...sceneWrap, alignItems: "center", textAlign: "center" }}>
              {/* Central gold bloom */}
              <div aria-hidden style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
                background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(168,120,8,.10) 0%, transparent 65%)",
              }} />

              {/* Top gold rule draws in */}
              <div style={{
                width: "min(180px,32%)", height: 1,
                background: `linear-gradient(to right,transparent,${GOLD},rgba(232,188,20,.5),${GOLD},transparent)`,
                transformOrigin: "center",
                marginBottom: "clamp(1.75rem,4.5vh,3.5rem)",
                opacity: 0, animation: "ci-line-x .9s .12s ease forwards",
              }} />

              {/* Title — gold shimmer */}
              <p style={{
                fontFamily: BF, fontSize: "clamp(.55rem,1.2vw,.72rem)",
                fontWeight: 700, letterSpacing: ".70em", textTransform: "uppercase",
                background: `linear-gradient(90deg,rgba(201,150,10,.45),rgba(232,188,20,.98) 50%,rgba(201,150,10,.45))`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                opacity: 0, animation: "ci-fade 1.0s .65s ease forwards",
              }}>
                {title}
              </p>

              {/* Subtitle */}
              <p style={{
                fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                fontSize: "clamp(.95rem,2.2vw,1.3rem)",
                color: "rgba(255,255,255,.24)", letterSpacing: ".06em", lineHeight: 1.55,
                marginTop: "clamp(.75rem,2vh,1.25rem)",
                opacity: 0, animation: "ci-fade .8s 1.05s ease forwards",
              }}>
                {subtitle}
              </p>

              {/* Bottom rose rule */}
              <div style={{
                width: "min(100px,20%)", height: 1, marginTop: "clamp(1.75rem,4.5vh,3.5rem)",
                background: `linear-gradient(to right,transparent,rgba(190,45,69,.55),transparent)`,
                transformOrigin: "center",
                opacity: 0, animation: "ci-line-x .7s 1.35s ease forwards",
              }} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              SCENE 1 · BRIDE
          ══════════════════════════════════════════════════ */}
          {scene === 1 && (
            <div style={sceneWrap}>
              {/* Rose bloom — top-left */}
              <div aria-hidden style={{
                position: "absolute", top: "-18%", left: "-8%",
                width: "62%", height: "75%", borderRadius: "50%", zIndex: 0, pointerEvents: "none",
                background: "radial-gradient(circle, rgba(190,45,69,.14) 0%, transparent 62%)",
              }} />
              {/* Subtle vignette boost to left */}
              <div aria-hidden style={{
                position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 55% 65% at 0% 50%, rgba(190,45,69,.06) 0%, transparent 65%)",
              }} />

              {/* Eyebrow */}
              <p style={{
                fontFamily: BF, fontSize: ".44rem", fontWeight: 700,
                letterSpacing: ".55em", textTransform: "uppercase",
                color: "rgba(190,45,69,.58)", marginBottom: "clamp(.875rem,2.2vh,1.75rem)",
                opacity: 0, animation: "ci-fade .6s .08s ease forwards", position: "relative", zIndex: 3,
              }}>
                Bride
              </p>

              {/* Typewriter name */}
              <h1 className="ci-tw" style={{
                fontFamily: DF, fontWeight: 300,
                fontSize: "clamp(4.5rem,14vw,12rem)",
                lineHeight: .86, letterSpacing: "-.04em",
                color: "#FFFFFF", margin: 0, position: "relative", zIndex: 3,
              }}>
                {tw1.displayed}
                {!tw1.done && <span className="ci-cursor" style={{ color: ROSE }} />}
              </h1>

              {/* Full name fades in after typewriter done */}
              <p style={{
                fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                fontSize: "clamp(.9rem,2vw,1.35rem)",
                color: "rgba(255,255,255,.26)", letterSpacing: ".06em",
                marginTop: "clamp(.5rem,1.2vh,.875rem)",
                opacity: tw1.done ? 1 : 0,
                transition: "opacity .6s ease",
                position: "relative", zIndex: 3,
              }}>
                {brideName}
              </p>

              {/* Rose rule */}
              <div style={{
                marginTop: "clamp(1.25rem,3vh,2.5rem)",
                width: "min(68px,14%)", height: 1,
                background: `linear-gradient(to right,${ROSE},transparent)`,
                transformOrigin: "left",
                opacity: 0, animation: "ci-line-x .8s .95s ease forwards",
                position: "relative", zIndex: 3,
              }} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              SCENE 2 · GROOM
          ══════════════════════════════════════════════════ */}
          {scene === 2 && (
            <div style={{ ...sceneWrap, alignItems: "flex-end", textAlign: "right" }}>
              {/* Gold bloom — bottom-right */}
              <div aria-hidden style={{
                position: "absolute", bottom: "-14%", right: "-6%",
                width: "58%", height: "72%", borderRadius: "50%", zIndex: 0, pointerEvents: "none",
                background: "radial-gradient(circle, rgba(168,120,8,.16) 0%, transparent 62%)",
              }} />
              <div aria-hidden style={{
                position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 55% 65% at 100% 50%, rgba(168,120,8,.06) 0%, transparent 65%)",
              }} />

              <p style={{
                fontFamily: BF, fontSize: ".44rem", fontWeight: 700,
                letterSpacing: ".55em", textTransform: "uppercase",
                color: "rgba(201,150,10,.58)", marginBottom: "clamp(.875rem,2.2vh,1.75rem)",
                opacity: 0, animation: "ci-fade .6s .08s ease forwards", position: "relative", zIndex: 3,
              }}>
                Groom
              </p>

              <h1 className="ci-tw" style={{
                fontFamily: DF, fontWeight: 300,
                fontSize: "clamp(4.5rem,14vw,12rem)",
                lineHeight: .86, letterSpacing: "-.04em",
                color: `rgba(232,188,20,.92)`, margin: 0, position: "relative", zIndex: 3,
              }}>
                {!tw2.done && <span className="ci-cursor" style={{ color: GOLD }} />}
                {tw2.displayed}
              </h1>

              <p style={{
                fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                fontSize: "clamp(.9rem,2vw,1.35rem)",
                color: "rgba(232,188,20,.24)", letterSpacing: ".06em",
                marginTop: "clamp(.5rem,1.2vh,.875rem)",
                opacity: tw2.done ? 1 : 0, transition: "opacity .6s ease",
                position: "relative", zIndex: 3,
              }}>
                {groomName}
              </p>

              <div style={{
                marginTop: "clamp(1.25rem,3vh,2.5rem)",
                width: "min(68px,14%)", height: 1, marginLeft: "auto",
                background: `linear-gradient(to left,${GOLD},transparent)`,
                transformOrigin: "right",
                opacity: 0, animation: "ci-line-x .8s .95s ease forwards",
                position: "relative", zIndex: 3,
              }} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              SCENE 3 · TOGETHER + DATE
          ══════════════════════════════════════════════════ */}
          {scene === 3 && (
            <div style={{ ...sceneWrap, justifyContent: "center" }}>
              {/* Dual bloom */}
              <div aria-hidden style={{
                position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
                background: `
                  radial-gradient(ellipse 40% 55% at  2% 50%, rgba(190,45,69,.09) 0%, transparent 65%),
                  radial-gradient(ellipse 40% 55% at 98% 50%, rgba(168,120,8,.09) 0%, transparent 65%)
                `,
              }} />

              {/* Vertical bisector */}
              <div className="ci-vdiv" aria-hidden style={{
                position: "absolute", left: "calc(50% - .5px)", top: 0, bottom: 0,
                width: 1, zIndex: 4,
                background: `linear-gradient(to bottom,transparent,rgba(190,45,69,.38) 18%,rgba(201,150,10,.32) 50%,rgba(190,45,69,.38) 82%,transparent)`,
                transformOrigin: "center top",
                opacity: 0, animation: "ci-line-y 1.0s .75s ease forwards",
              }} />

              {/* Ampersand */}
              <p className="ci-amp" style={{
                position: "absolute", left: "50%", top: "42%",
                transform: "translate(-50%,-50%)",
                fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                fontSize: "clamp(.85rem,2.4vw,1.7rem)",
                color: "rgba(190,45,69,.62)", lineHeight: 1, zIndex: 5,
                opacity: 0, animation: "ci-fade .7s .9s ease forwards",
              }}>
                &amp;
              </p>

              {/* Split */}
              <div className="ci-split" style={{ display: "flex", alignItems: "flex-end", position: "relative", zIndex: 3 }}>
                <div className="ci-sa" style={{ flex: 1, paddingRight: "clamp(1.5rem,4vw,3.5rem)", textAlign: "right" }}>
                  <h1 className="ci-tw2" style={{
                    fontFamily: DF, fontWeight: 300,
                    fontSize: "clamp(3rem,9.5vw,9rem)",
                    lineHeight: .88, letterSpacing: "-.035em",
                    color: "rgba(255,255,255,.94)", margin: 0,
                  }}>
                    {tw3b.displayed}
                    {!tw3b.done && <span className="ci-cursor" style={{ color: ROSE }} />}
                  </h1>
                </div>
                <div className="ci-sb" style={{ flex: 1, paddingLeft: "clamp(1.5rem,4vw,3.5rem)", textAlign: "left" }}>
                  <h1 className="ci-tw2" style={{
                    fontFamily: DF, fontWeight: 300,
                    fontSize: "clamp(3rem,9.5vw,9rem)",
                    lineHeight: .88, letterSpacing: "-.035em",
                    color: "rgba(232,188,20,.90)", margin: 0,
                  }}>
                    {tw3g.displayed}
                    {!tw3g.done && tw3b.done && <span className="ci-cursor" style={{ color: GOLD }} />}
                  </h1>
                </div>
              </div>

              {/* Date block */}
              {weddingDate && (
                <div style={{
                  marginTop: "clamp(1.5rem,3.5vh,3rem)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: "clamp(.625rem,1.5vh,1.25rem)",
                  position: "relative", zIndex: 3,
                  opacity: tw3b.done ? 1 : 0, transition: "opacity .5s ease",
                }}>
                  {/* Diamond rule */}
                  <div style={{ display: "flex", alignItems: "center", gap: "clamp(.75rem,2vw,1.5rem)", width: "min(380px,60%)" }}>
                    <div style={{ flex: 1, height: 1, background: "linear-gradient(to right,transparent,rgba(255,255,255,.12))" }} />
                    <span style={{ color: "rgba(201,150,10,.50)", fontSize: ".52rem" }}>◆</span>
                    <div style={{ flex: 1, height: 1, background: "linear-gradient(to left,transparent,rgba(255,255,255,.12))" }} />
                  </div>
                  {/* Typewritten date */}
                  <p className="ci-date" style={{
                    fontFamily: DF, fontWeight: 300,
                    fontSize: "clamp(1.5rem,4.5vw,4rem)",
                    letterSpacing: ".06em", lineHeight: 1,
                    color: "rgba(255,255,255,.80)", textAlign: "center",
                  }}>
                    {twDate.displayed}
                    {!twDate.done && <span className="ci-cursor" style={{ color: "rgba(255,255,255,.55)" }} />}
                  </p>
                  {cdLabel && (
                    <span style={{
                      fontFamily: BF, fontSize: ".44rem", fontWeight: 600,
                      letterSpacing: ".42em", textTransform: "uppercase",
                      color: "rgba(201,150,10,.50)",
                      opacity: twDate.done ? 1 : 0, transition: "opacity .5s .2s ease",
                    }}>
                      {cdLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              SCENE 4 · VENUES — cinematic poster bottom anchor
          ══════════════════════════════════════════════════ */}
          {scene === 4 && (
            <div style={{
              position: "absolute",
              bottom: `calc(${LB} + clamp(32px,6vh,64px))`,
              left: "clamp(28px,7vw,96px)",
              right: "clamp(28px,7vw,96px)",
              zIndex: 5,
            }}>
              {/* City eyebrow */}
              <p style={{
                fontFamily: BF, fontSize: ".44rem", fontWeight: 700,
                letterSpacing: ".50em", textTransform: "uppercase",
                color: "rgba(255,255,255,.18)",
                marginBottom: "clamp(1.25rem,3vh,2.5rem)",
                opacity: 0, animation: "ci-fade .6s .08s ease forwards",
              }}>
                {venueCity ?? "Chennai, Tamil Nadu"}
              </p>

              {/* Church row */}
              <div style={{
                display: "flex", alignItems: "center",
                gap: "clamp(.625rem,2vw,1.5rem)",
                marginBottom: "clamp(.5rem,1.2vh,.875rem)",
                opacity: 0, animation: "ci-up 1.0s .20s cubic-bezier(.16,1,.3,1) forwards",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexShrink: 0 }}>
                  <span style={{
                    fontFamily: BF, fontSize: "clamp(.46rem,1vw,.60rem)",
                    fontWeight: 700, letterSpacing: ".14em",
                    color: "rgba(212,72,96,.82)", whiteSpace: "nowrap",
                  }}>3 PM</span>
                  <div style={{ width: "clamp(14px,2.2vw,26px)", height: 1, background: "rgba(212,72,96,.36)" }} />
                </div>
                <p className="ci-ven" style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1.5rem,5vw,4.8rem)",
                  lineHeight: 1, color: "rgba(255,255,255,.90)",
                }}>
                  Divine Mercy Church
                </p>
              </div>

              {/* "then" separator */}
              <div style={{
                display: "flex", alignItems: "center", gap: ".5rem",
                marginBottom: "clamp(.5rem,1.2vh,.875rem)",
                paddingLeft: "clamp(2rem,4.5vw,4.5rem)",
                opacity: 0, animation: "ci-fade .5s .72s ease forwards",
              }}>
                <div style={{ width: 22, height: 1, background: "linear-gradient(to right,rgba(255,255,255,.08),transparent)" }} />
                <span style={{ fontFamily: BF, fontSize: ".38rem", letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(255,255,255,.14)", fontWeight: 500 }}>then</span>
                <div style={{ width: 22, height: 1, background: "linear-gradient(to left,rgba(255,255,255,.08),transparent)" }} />
              </div>

              {/* Beach resort row */}
              <div style={{
                display: "flex", alignItems: "center",
                gap: "clamp(.625rem,2vw,1.5rem)",
                opacity: 0, animation: "ci-up 1.0s .44s cubic-bezier(.16,1,.3,1) forwards",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexShrink: 0 }}>
                  <span style={{
                    fontFamily: BF, fontSize: "clamp(.46rem,1vw,.60rem)",
                    fontWeight: 700, letterSpacing: ".14em",
                    color: "rgba(201,150,10,.82)", whiteSpace: "nowrap",
                  }}>6 PM</span>
                  <div style={{ width: "clamp(14px,2.2vw,26px)", height: 1, background: "rgba(201,150,10,.36)" }} />
                </div>
                <p className="ci-ven" style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1.5rem,5vw,4.8rem)",
                  lineHeight: 1, color: "rgba(232,188,20,.88)",
                }}>
                  Blue Bay Beach Resort
                </p>
              </div>

              {/* Bottom gold hairline */}
              <div style={{
                marginTop: "clamp(1.5rem,3.5vh,3rem)",
                width: "min(260px,40%)", height: 1,
                background: `linear-gradient(to right,${ROSE},rgba(201,150,10,.55),transparent)`,
                opacity: 0, animation: "ci-line-x .9s .85s ease forwards",
              }} />
            </div>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          HERO PHASE
      ══════════════════════════════════════════════════════════════════ */}
      {phase === "hero" && (
        <div className={heroVis ? "hv" : ""}>
          <section ref={heroRef} style={{
            position: "relative", minHeight: "100dvh",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center", overflow: "hidden",
            background: "#080406",
          }}>
            {/* Photo */}
            {heroPhotoUrl && (
              <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
                <div className="ci-par" style={{
                  position: "absolute", inset: "-10%",
                  backgroundImage: `url(${heroPhotoUrl})`,
                  backgroundSize: "cover", backgroundPosition: "center top",
                  filter: "saturate(.15) brightness(.24) contrast(1.16)",
                  willChange: "transform", transform: "scale(1.08) translateY(0)",
                }} />
              </div>
            )}

            {/* Film grain on hero too */}
            <svg aria-hidden style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              zIndex: 1, pointerEvents: "none", opacity: .20,
              animation: "ci-grain 0.22s steps(1) infinite",
            }}>
              <use href="#grain" />
              <filter id="grain2">
                <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#grain2)" opacity=".07" />
            </svg>

            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 2,
              background: "linear-gradient(to bottom,rgba(5,2,6,.52) 0%,rgba(5,2,6,.16) 36%,rgba(5,2,6,.50) 70%,rgba(3,1,4,.95) 100%)",
            }} />
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 3,
              background: "radial-gradient(ellipse 78% 72% at 50% 46%,transparent 24%,rgba(3,1,4,.68) 100%)",
            }} />
            {/* Rose TL bloom */}
            <div aria-hidden style={{
              position: "absolute", top: "-14%", left: "-8%",
              width: "54%", height: "66%", borderRadius: "50%",
              background: "radial-gradient(circle,rgba(190,45,69,.07) 0%,transparent 65%)",
              zIndex: 3, pointerEvents: "none",
            }} />
            {/* Gold BR bloom */}
            <div aria-hidden style={{
              position: "absolute", bottom: "-8%", right: "-5%",
              width: "46%", height: "54%", borderRadius: "50%",
              background: "radial-gradient(circle,rgba(168,120,8,.07) 0%,transparent 65%)",
              zIndex: 3, pointerEvents: "none",
            }} />
            {/* Top stripe */}
            <div aria-hidden style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 4,
              background: "linear-gradient(90deg,transparent 5%,rgba(190,45,69,.45) 28%,rgba(201,150,10,.70) 50%,rgba(190,45,69,.45) 72%,transparent 95%)",
            }} />

            {/* Hero content */}
            <div style={{
              position: "relative", zIndex: 5,
              padding: "clamp(4.5rem,8vh,7rem) clamp(1.25rem,5vw,3rem) clamp(3.5rem,6vh,5rem)",
              maxWidth: 860, width: "100%",
            }}>
              {/* Title tag */}
              <div className="h0" style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", marginBottom: "clamp(1.25rem,3vh,2.5rem)" }}>
                <div style={{ flex: 1, maxWidth: 52, height: 1, background: "linear-gradient(to right,transparent,rgba(190,45,69,.52))" }} />
                <span style={{ fontFamily: BF, fontSize: ".42rem", fontWeight: 700, letterSpacing: ".54em", textTransform: "uppercase", color: "rgba(190,45,69,.82)" }}>
                  {title}
                </span>
                <div style={{ flex: 1, maxWidth: 52, height: 1, background: "linear-gradient(to left,transparent,rgba(190,45,69,.52))" }} />
              </div>

              <h1 className="h1 h-name" style={{ fontFamily: DF, fontWeight: 300, fontSize: "clamp(3.5rem,14vw,11.5rem)", lineHeight: .84, letterSpacing: "-.04em", color: "rgba(255,252,248,.96)", marginBottom: ".04em" }}>
                {brideFirst}
              </h1>
              <p className="h2" style={{ fontFamily: DF, fontStyle: "italic", fontWeight: 300, fontSize: "clamp(1rem,3vw,2.2rem)", color: "rgba(190,45,69,.68)", letterSpacing: ".14em", lineHeight: 1.2, marginBottom: ".04em" }}>
                &amp;
              </p>
              <h1 className="h3 h-name" style={{ fontFamily: DF, fontWeight: 300, fontSize: "clamp(3.5rem,14vw,11.5rem)", lineHeight: .84, letterSpacing: "-.04em", color: "rgba(232,220,200,.78)", marginBottom: "clamp(1rem,2.5vh,2.5rem)" }}>
                {groomFirst}
              </h1>

              {/* Gold hairline */}
              <div className="h4" style={{ width: "min(200px,44%)", height: 1, margin: "0 auto clamp(.875rem,2vh,2.25rem)", background: "linear-gradient(90deg,transparent,rgba(201,150,10,.65) 38%,rgba(201,150,10,.65) 62%,transparent)" }} />

              {weddingDate && (
                <p className="h5" style={{ fontFamily: BF, fontSize: ".72rem", fontWeight: 600, letterSpacing: ".38em", textTransform: "uppercase", color: "rgba(201,150,10,.82)", marginBottom: "clamp(.75rem,1.5vh,1.375rem)" }}>
                  {weddingDate}
                </p>
              )}

              {/* Venue pills */}
              <div className="h5" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: ".625rem", marginBottom: "clamp(1.25rem,3vh,3rem)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 18px", borderRadius: 999, background: "rgba(190,45,69,.13)", border: "1px solid rgba(190,45,69,.34)", backdropFilter: "blur(8px)", fontFamily: BF, fontSize: ".62rem", fontWeight: 600, color: "rgba(255,255,255,.80)", letterSpacing: ".04em" }}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden><line x1="5" y1="0" x2="5" y2="10" stroke="rgba(190,45,69,.88)" strokeWidth="1.8" strokeLinecap="round"/><line x1="1" y1="3.5" x2="9" y2="3.5" stroke="rgba(190,45,69,.88)" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  Divine Mercy Church <span style={{ color: "rgba(190,45,69,.80)", fontWeight: 700 }}>· 3 PM</span>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 18px", borderRadius: 999, background: "rgba(168,120,8,.13)", border: "1px solid rgba(168,120,8,.40)", backdropFilter: "blur(8px)", fontFamily: BF, fontSize: ".62rem", fontWeight: 600, color: "rgba(255,255,255,.80)", letterSpacing: ".04em" }}>
                  <svg width="14" height="7" viewBox="0 0 14 7" fill="none" aria-hidden><path d="M0.5 4 Q2 1 3.5 4 Q5 7 6.5 4 Q8 1 9.5 4 Q11 7 12.5 4" stroke="rgba(201,150,10,.88)" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                  Blue Bay Beach Resort <span style={{ color: "rgba(201,150,10,.82)", fontWeight: 700 }}>· 6 PM</span>
                </span>
              </div>

              {/* Guest tag */}
              <div className="h6" style={{ marginBottom: "clamp(1.25rem,3vh,3.5rem)" }}>
                <span style={{ display: "inline-block", padding: "8px 26px", borderRadius: 999, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.055)", backdropFilter: "blur(12px)", fontFamily: DF, fontStyle: "italic", fontSize: "clamp(.78rem,1.9vw,.92rem)", color: "rgba(255,252,248,.65)", letterSpacing: ".04em" }}>
                  A personal invitation for {guestLabel}
                </span>
              </div>

              {/* Wax seal */}
              <div className="h7" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {sealState === "burst" && (
                    <>
                      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1.5px solid ${ROSE_L}`, animation: "ci-ring1 .52s ease forwards", pointerEvents: "none" }} />
                      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(201,150,10,.55)", animation: "ci-ring2 .65s .08s ease forwards", pointerEvents: "none" }} />
                    </>
                  )}
                  {sealState !== "gone" && (
                    <div
                      className="ci-seal-wrap"
                      onClick={handleSealClick}
                      onMouseEnter={() => { if (sealState === "idle") setSealState("hover"); }}
                      onMouseLeave={() => { if (sealState === "hover") setSealState("idle"); }}
                      style={{
                        position: "relative", width: "clamp(130px,22vw,172px)", height: "clamp(130px,22vw,172px)",
                        borderRadius: "50%", overflow: "hidden", cursor: "pointer",
                        boxShadow: sealState === "burst" ? "none" : "0 12px 36px rgba(0,0,0,.52),0 4px 10px rgba(0,0,0,.30)",
                        animation:
                          sealState === "idle"  ? "ci-seal-pulse 3.8s 1.2s ease-in-out infinite" :
                          sealState === "hover" ? "ci-seal-hover .3s ease forwards" :
                          sealState === "burst" ? "ci-seal-burst .52s ease forwards" : "none",
                      }}
                    >
                      <svg viewBox="0 0 160 160" width="100%" height="100%" style={{ display: "block" }} aria-hidden>
                        <defs>
                          <radialGradient id="sg2" cx="38%" cy="34%" r="68%">
                            <stop offset="0%"   stopColor="#F5D47A"/>
                            <stop offset="35%"  stopColor="#C9960A"/>
                            <stop offset="68%"  stopColor="#9E7205"/>
                            <stop offset="100%" stopColor="#5C3D01"/>
                          </radialGradient>
                          <radialGradient id="ss2" cx="34%" cy="28%" r="52%">
                            <stop offset="0%"   stopColor="rgba(255,248,210,.30)"/>
                            <stop offset="100%" stopColor="rgba(255,248,210,0)"/>
                          </radialGradient>
                        </defs>
                        <circle cx="80" cy="80" r="80" fill="url(#sg2)"/>
                        {Array.from({ length: 16 }, (_, i) => {
                          const a = (i / 16) * Math.PI * 2;
                          return <line key={i} x1={80+64*Math.cos(a)} y1={80+64*Math.sin(a)} x2={80+79*Math.cos(a)} y2={80+79*Math.sin(a)} stroke="rgba(60,35,0,.28)" strokeWidth="1.4"/>;
                        })}
                        <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(60,35,0,.26)" strokeWidth="1.4"/>
                        <circle cx="80" cy="80" r="53" fill="none" stroke="rgba(60,35,0,.16)" strokeWidth=".8"/>
                        <circle cx="80" cy="80" r="80" fill="url(#ss2)"/>
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: DF, fontWeight: 600, fontSize: "clamp(2.6rem,6.5vw,4.4rem)", letterSpacing: ".14em", color: "rgba(28,14,0,.80)", lineHeight: 1, marginLeft: ".14em", textShadow: "0 1px 0 rgba(255,240,160,.42),0 -1px 4px rgba(0,0,0,.28)" }}>
                          {initials}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {sealState !== "gone" && (
                  <p style={{ fontFamily: BF, fontSize: ".46rem", letterSpacing: ".36em", textTransform: "uppercase", color: INK_4, fontWeight: 500 }}>
                    {sealState === "burst" ? "Opening…" : "Press to enter"}
                  </p>
                )}
              </div>
            </div>

            {sealState === "gone" && (
              <div style={{ position: "absolute", bottom: 24, left: "50%", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, zIndex: 5, animation: "ci-bounce 2.5s ease-in-out infinite" }}>
                <span style={{ fontFamily: BF, fontSize: ".38rem", letterSpacing: ".44em", textTransform: "uppercase", color: INK_4 }}>Scroll</span>
                <div style={{ width: 1, height: 28, background: `linear-gradient(to bottom,${ROSE_M},transparent)` }} />
                <ChevronDown size={10} style={{ color: ROSE_M, marginTop: -5 }} />
              </div>
            )}
          </section>

          {/* Invite content */}
          <div id="invite-content">
            <div style={{ borderBottom: "1px solid rgba(190,45,69,.10)", background: "rgba(253,250,247,.95)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", padding: "clamp(.875rem,2vh,1.125rem) clamp(1.25rem,5vw,5rem)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                <span style={{ fontFamily: DF, fontSize: "clamp(.875rem,2.5vw,1.05rem)", fontWeight: 700, color: INK, letterSpacing: ".35em", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {brideFirst} &amp; {groomFirst}
                </span>
                <span style={{ fontFamily: BF, fontSize: ".60rem", letterSpacing: ".28em", textTransform: "uppercase", color: INK_4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {weddingDate ?? ""}{", "}{venueName ?? ""}
                </span>
              </div>
            </div>

            <section style={{ background: "#F1E9E0", borderBottom: "1px solid rgba(190,45,69,.10)", padding: "clamp(3.5rem,8vh,6rem) clamp(1.5rem,6vw,5rem)", position: "relative", overflow: "hidden" }}>
              <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 55% at 15% 50%,rgba(190,45,69,.04) 0%,transparent 60%)" }} />
              <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
                <p style={{ fontFamily: BF, fontSize: ".5rem", letterSpacing: ".46em", textTransform: "uppercase", color: ROSE, fontWeight: 700, marginBottom: "clamp(1.75rem,4vh,3rem)" }}>
                  A personal welcome
                </p>
                <div style={{ borderLeft: "3px solid rgba(190,45,69,.24)", paddingLeft: "clamp(1.25rem,3.5vw,2.25rem)" }}>
                  <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: "clamp(1rem,2.4vw,1.18rem)", color: INK, lineHeight: 1.95, marginBottom: ".5em" }}>Dear {guestLabel},</p>
                  <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: "clamp(1rem,2.4vw,1.18rem)", color: INK_3, lineHeight: 1.95 }}>
                    {brideFirst} and {groomFirst} warmly invite you to witness and celebrate their union —
                    first at the Holy Matrimony at <em>Divine Mercy Church, Kelambakkam</em> at 3 in the afternoon,
                    and then as the sun sets over the Bay of Bengal, at the Shoreline Reception at{" "}
                    <em>Blue Bay Beach Resort, Mahabalipuram</em>.
                    You are not just a guest — you are part of the story that brought them here.
                  </p>
                </div>
                <div style={{ marginTop: "clamp(1.75rem,4vh,3rem)", display: "flex", alignItems: "center", gap: "clamp(.875rem,2.5vw,1.5rem)" }}>
                  <div style={{ width: "min(40px,10%)", height: 1, background: "linear-gradient(to right,rgba(190,45,69,.36),transparent)", flexShrink: 0 }} />
                  <p style={{ fontFamily: DF, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(.95rem,2.2vw,1.1rem)", color: INK_3, letterSpacing: ".02em" }}>
                    With love, {brideFirst} &amp; {groomFirst}
                  </p>
                </div>
              </div>
            </section>

            {children}
          </div>
        </div>
      )}
    </>
  );
}

export default CinematicInvite;
