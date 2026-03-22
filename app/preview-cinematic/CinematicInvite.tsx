"use client";

/**
 * CinematicInvite — Elegant Light Edition
 *
 * FLOW:
 *   Scene 0 · OVERTURE  — Warm ivory. Gold line draws. Title + names breathe in slowly.
 *   ↓ Heart transition  — Petals / heart motif wipes to hero
 *   HERO                — Light, warm full-bleed photo. Wax seal CTA.
 *
 * THEME: Light, warm, intimate — ivory + rose + soft gold
 */

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/* ── Palette — warm light theme ──────────────────────────────────────────── */
const CREAM  = "#FAF6F1";          // warm ivory background
const CREAM2 = "#F3EBE0";          // slightly deeper linen
const ROSE   = "#BE2D45";
const ROSE_L = "#D44860";
const ROSE_P = "rgba(190,45,69,0.08)";
const GOLD   = "#B8860A";
const GOLD_L = "#D4A020";
const INK    = "#1A0C0E";
const INK_2  = "#3D1F26";
const INK_3  = "#7A4A52";
const INK_4  = "#AA8888";

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

/* ── Scene timing ─────────────────────────────────────────────────────────── */
const OVERTURE_HOLD = 5200;   // how long the overture shows before transitioning
const HEART_DUR     = 1400;   // heart transition duration ms

/* ── Props ───────────────────────────────────────────────────────────────── */
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

type Phase = "overture" | "heart" | "hero";

/* ── Floating petal canvas ───────────────────────────────────────────────── */
function PetalCanvas() {
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

    /* Small oval petals drifting gently */
    const petals = Array.from({ length: 28 }, () => ({
      x:     Math.random() * (canvas.width  || 800),
      y:     Math.random() * (canvas.height || 600),
      rx:    Math.random() * 5 + 3,
      ry:    Math.random() * 3 + 1.5,
      rot:   Math.random() * Math.PI * 2,
      vx:    (Math.random() - 0.5) * 0.22,
      vy:    Math.random() * 0.18 + 0.08,  // drift downward slowly
      vrot:  (Math.random() - 0.5) * 0.012,
      alpha: Math.random() * 0.22 + 0.06,
      hue:   Math.random() > 0.5 ? "rgba(190,45,69," : "rgba(212,172,50,",
    }));

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of petals) {
        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.vrot;
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = `${p.hue}${p.alpha.toFixed(2)})`;
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
    />
  );
}

/* ── SVG Heart burst overlay (transition) ───────────────────────────────── */
function HeartBurst({ active }: { active: boolean }) {
  if (!active) return null;

  /* 12 hearts scattered at different sizes / positions / delays */
  const hearts = [
    { x: "50%", y: "50%", size: 120, delay: 0,    dur: 900  },
    { x: "30%", y: "40%", size: 60,  delay: 80,   dur: 800  },
    { x: "70%", y: "40%", size: 60,  delay: 120,  dur: 800  },
    { x: "20%", y: "60%", size: 40,  delay: 160,  dur: 750  },
    { x: "80%", y: "60%", size: 40,  delay: 200,  dur: 750  },
    { x: "50%", y: "25%", size: 50,  delay: 100,  dur: 820  },
    { x: "50%", y: "75%", size: 50,  delay: 140,  dur: 820  },
    { x: "15%", y: "30%", size: 28,  delay: 220,  dur: 700  },
    { x: "85%", y: "30%", size: 28,  delay: 260,  dur: 700  },
    { x: "10%", y: "70%", size: 22,  delay: 300,  dur: 680  },
    { x: "90%", y: "70%", size: 22,  delay: 340,  dur: 680  },
    { x: "50%", y: "50%", size: 220, delay: 0,    dur: 1100 },
  ];

  return (
    <div aria-hidden style={{
      position: "fixed", inset: 0, zIndex: 9998,
      display: "flex", alignItems: "center", justifyContent: "center",
      pointerEvents: "none",
    }}>
      {/* White wash underneath */}
      <div style={{
        position: "absolute", inset: 0,
        background: CREAM,
        animation: `heartWash ${HEART_DUR}ms ease forwards`,
      }} />

      {hearts.map((h, i) => (
        <svg
          key={i}
          viewBox="0 0 100 90"
          style={{
            position: "absolute",
            left:   h.x,
            top:    h.y,
            width:  h.size,
            height: h.size * 0.9,
            transform: "translate(-50%,-50%)",
            animation: `heartPop ${h.dur}ms ${h.delay}ms cubic-bezier(.34,1.56,.64,1) both`,
            opacity: 0,
          }}
        >
          <path
            d="M50 82 C50 82 6 52 6 28 C6 14 17 5 29 5 C37 5 44 9 50 17 C56 9 63 5 71 5 C83 5 94 14 94 28 C94 52 50 82 50 82Z"
            fill={i % 3 === 0 ? ROSE : i % 3 === 1 ? GOLD_L : ROSE_L}
            opacity={i === hearts.length - 1 ? 0.07 : 0.55 - i * 0.02}
          />
        </svg>
      ))}
    </div>
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
  const [phase,     setPhase]     = useState<Phase>("overture");
  const [heartOn,   setHeartOn]   = useState(false);
  const [heroVis,   setHeroVis]   = useState(false);
  const [sealState, setSealState] = useState<"idle"|"hover"|"burst"|"gone">("idle");

  const heroRef = useRef<HTMLElement | null>(null);
  const timer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;
  const initials   = useMemo(
    () => `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase(),
    [brideName, groomName]
  );

  const storageKey = `surihana-intro:${inviteCode}`;
  const cookieName = `invite_intro_seen_${inviteCode}`;

  /* ── Scroll lock ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow    = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow    = "";
      document.body.style.touchAction = "";
    };
  }, []);

  /* ── Mount / returning visitor ── */
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const seen = document.cookie.split(";").some(c => c.trim().startsWith(`${cookieName}=`))
               || sessionStorage.getItem(storageKey) === "entered";
    if (seen) {
      setPhase("hero");
      setTimeout(() => setHeroVis(true), 80);
      return;
    }
    /* Auto-advance after overture hold */
    timer.current = setTimeout(() => goToHero(), OVERTURE_HOLD);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookieName, storageKey]);

  /* ── Hero parallax ── */
  useEffect(() => {
    if (phase !== "hero" || typeof window === "undefined") return;
    const fn = () => {
      const el = heroRef.current?.querySelector<HTMLElement>(".ci-par");
      if (el) el.style.transform = `scale(1.08) translateY(${window.scrollY * 0.16}px)`;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [phase]);

  function markVisited() {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(storageKey, "entered");
    const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${cookieName}=1; expires=${exp}; path=/; SameSite=Lax`;
  }

  function goToHero() {
    if (timer.current) clearTimeout(timer.current);
    markVisited();
    /* Heart burst transition */
    setHeartOn(true);
    setTimeout(() => {
      setHeartOn(false);
      setPhase("hero");
      requestAnimationFrame(() => requestAnimationFrame(() => setHeroVis(true)));
    }, HEART_DUR);
  }

  function handleSealClick() {
    if (sealState !== "idle" && sealState !== "hover") return;
    setSealState("burst");
    setTimeout(() => {
      setSealState("gone");
      document.body.style.overflow    = "";
      document.body.style.touchAction = "";
      document.getElementById("invite-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 520);
  }

  if (!mounted) return <div style={{ minHeight: "100dvh", background: CREAM }}>{children}</div>;

  return (
    <>
      <style>{`
        /* ── Keyframes ── */
        @keyframes ci-fade    { from{opacity:0}                               to{opacity:1} }
        @keyframes ci-up      { from{opacity:0;transform:translateY(1.75rem)} to{opacity:1;transform:none} }
        @keyframes ci-line-x  { from{transform:scaleX(0)}                     to{transform:scaleX(1)} }
        @keyframes ci-line-y  { from{transform:scaleY(0)}                     to{transform:scaleY(1)} }
        @keyframes ci-grain   { 0%{transform:translate(0,0)} 50%{transform:translate(-1%,-1%)} 100%{transform:translate(1%,1%)} }
        @keyframes ci-bounce  { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(9px)} }

        /* Heart burst transition */
        @keyframes heartWash  { 0%{opacity:0} 30%{opacity:1} 75%{opacity:1} 100%{opacity:0} }
        @keyframes heartPop   { 0%{opacity:0;transform:translate(-50%,-50%) scale(0) rotate(-15deg)}
                                55%{opacity:1;transform:translate(-50%,-50%) scale(1.12) rotate(3deg)}
                                80%{opacity:.85;transform:translate(-50%,-50%) scale(.95) rotate(-1deg)}
                               100%{opacity:0;transform:translate(-50%,-50%) scale(1.3) rotate(2deg)} }

        /* Overture content stagger */
        @keyframes ci-nameA   { from{opacity:0;transform:translateX(-3rem) skewX(-4deg)} to{opacity:1;transform:none} }
        @keyframes ci-nameB   { from{opacity:0;transform:translateX( 3rem) skewX( 4deg)} to{opacity:1;transform:none} }
        @keyframes ci-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }

        .ov-0 { opacity:0; animation: ci-line-x 1.1s 0.2s ease          forwards }
        .ov-1 { opacity:0; animation: ci-fade   0.9s 0.7s ease          forwards }
        .ov-2 { opacity:0; animation: ci-nameA  1.2s 1.1s cubic-bezier(.16,1,.3,1) forwards }
        .ov-3 { opacity:0; animation: ci-fade   0.7s 1.4s ease          forwards }
        .ov-4 { opacity:0; animation: ci-nameB  1.2s 1.6s cubic-bezier(.16,1,.3,1) forwards }
        .ov-5 { opacity:0; animation: ci-fade   0.8s 2.2s ease          forwards }
        .ov-6 { opacity:0; animation: ci-up     0.9s 2.6s cubic-bezier(.22,1,.36,1) forwards }
        .ov-7 { opacity:0; animation: ci-up     0.8s 3.0s cubic-bezier(.22,1,.36,1) forwards }
        .ov-8 { opacity:0; animation: ci-line-x 0.9s 3.4s ease          forwards }

        /* Hero stagger */
        .hv .h0{opacity:0;animation:ci-fade .8s .00s ease           forwards}
        .hv .h1{opacity:0;animation:ci-up   1.1s .12s cubic-bezier(.16,1,.3,1) forwards}
        .hv .h2{opacity:0;animation:ci-fade .7s .26s ease           forwards}
        .hv .h3{opacity:0;animation:ci-up   1.1s .38s cubic-bezier(.16,1,.3,1) forwards}
        .hv .h4{opacity:0;animation:ci-fade .8s .52s ease           forwards}
        .hv .h5{opacity:0;animation:ci-up   .9s .66s cubic-bezier(.22,1,.36,1) forwards}
        .hv .h6{opacity:0;animation:ci-fade .8s .80s ease           forwards}
        .hv .h7{opacity:0;animation:ci-up   .8s 1.05s cubic-bezier(.34,1.56,.64,1) forwards}

        /* Seal */
        @keyframes ci-seal-pulse {
          0%,100%{box-shadow:0 12px 36px rgba(26,12,14,.18),0 0 0 0 rgba(190,45,69,0)}
          50%    {box-shadow:0 16px 48px rgba(26,12,14,.22),0 0 0 18px rgba(190,45,69,.10)}
        }
        @keyframes ci-seal-hover  { to{transform:translateY(-5px) scale(1.06) rotate(2deg)} }
        @keyframes ci-seal-burst  {
          0%  {transform:scale(1);opacity:1}
          30% {transform:scale(1.22) rotate(-5deg);opacity:.85}
          60% {transform:scale(.70) rotate(10deg);opacity:.35}
          100%{transform:scale(0) rotate(22deg);opacity:0}
        }
        @keyframes ci-ring1 { to{transform:scale(3.0);opacity:0} }
        @keyframes ci-ring2 { to{transform:scale(4.2);opacity:0} }

        .ci-skip {
          position:absolute; top:20px; right:20px; zIndex:12;
          display:inline-flex; align-items:center; gap:6px;
          padding:6px 16px; background:transparent; border:1px solid rgba(26,12,14,.14);
          border-radius:999px;
          font-family:${BF}; font-size:.50rem; font-weight:500;
          letter-spacing:.26em; text-transform:uppercase;
          color:rgba(26,12,14,.35); cursor:pointer;
          transition:all .2s ease;
          opacity:0; animation:ci-fade .5s 3.5s ease forwards;
        }
        .ci-skip:hover { color:${ROSE}; border-color:${ROSE}; background:rgba(190,45,69,.05); }

        /* Skip tap area on mobile */
        @media(max-width:520px){
          .h-name{ font-size:clamp(3rem,13vw,7.5rem)!important }
          .ci-seal-wrap{ width:clamp(110px,28vw,150px)!important; height:clamp(110px,28vw,150px)!important }
          .ov-name{ font-size:clamp(3.5rem,16vw,7rem)!important; letter-spacing:-.02em!important }
        }
      `}</style>

      {/* ── Heart burst overlay (sits on top of everything during transition) ── */}
      <HeartBurst active={heartOn} />

      {/* ════════════════════════════════════════════════════════════════
          OVERTURE — warm ivory, light, elegant
      ════════════════════════════════════════════════════════════════ */}
      {phase === "overture" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: CREAM, overflow: "hidden",
        }}>
          {/* Floating petals */}
          <PetalCanvas />

          {/* Warm radial bloom centre */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
            background: `
              radial-gradient(ellipse 60% 55% at 50% 50%, rgba(190,45,69,.05) 0%, transparent 65%),
              radial-gradient(ellipse 80% 70% at 50% 50%, rgba(212,172,50,.04) 0%, transparent 70%)
            `,
          }} />

          {/* Rose TL bloom */}
          <div aria-hidden style={{
            position: "absolute", top: "-20%", left: "-10%",
            width: "55%", height: "65%", borderRadius: "50%", zIndex: 0, pointerEvents: "none",
            background: "radial-gradient(circle, rgba(190,45,69,.06) 0%, transparent 62%)",
          }} />
          {/* Gold BR bloom */}
          <div aria-hidden style={{
            position: "absolute", bottom: "-15%", right: "-8%",
            width: "50%", height: "60%", borderRadius: "50%", zIndex: 0, pointerEvents: "none",
            background: "radial-gradient(circle, rgba(212,172,50,.06) 0%, transparent 62%)",
          }} />

          {/* Very subtle grain */}
          <svg aria-hidden style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            zIndex: 2, pointerEvents: "none", opacity: .12,
            animation: "ci-grain 0.2s steps(1) infinite",
          }}>
            <filter id="lg">
              <feTurbulence type="fractalNoise" baseFrequency=".70" numOctaves="4" stitchTiles="stitch"/>
              <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#lg)" opacity=".08"/>
          </svg>

          {/* Skip */}
          <button type="button" className="ci-skip" onClick={goToHero}>
            Skip ›
          </button>

          {/* ── Content — centred ── */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 5,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "clamp(48px,10vh,100px) clamp(28px,8vw,100px)",
            textAlign: "center",
          }}>

            {/* Top gold hairline */}
            <div className="ov-0" style={{
              width: "min(200px,32%)", height: 1,
              background: `linear-gradient(to right,transparent,${GOLD},rgba(212,172,50,.55),${GOLD},transparent)`,
              transformOrigin: "center",
              marginBottom: "clamp(2rem,5vh,4rem)",
            }} />

            {/* Celebration label */}
            <p className="ov-1" style={{
              fontFamily: BF, fontSize: "clamp(.46rem,1.0vw,.62rem)",
              fontWeight: 700, letterSpacing: ".65em", textTransform: "uppercase",
              background: `linear-gradient(90deg,rgba(184,134,10,.55),rgba(212,172,50,1) 50%,rgba(184,134,10,.55))`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              marginBottom: "clamp(1.5rem,4vh,3rem)",
            }}>
              {title}
            </p>

            {/* Bride name — slides from left */}
            <h1 className="ov-2 ov-name" style={{
            fontFamily: DF, fontWeight: 300,
            fontSize: "clamp(4rem,12vw,10.5rem)",
            lineHeight: .86, letterSpacing: "-.04em",
            color: "var(--name-bride-light)", margin: 0,
            }}>
            {brideName}
            </h1>

            {/* Ampersand */}
            <p className="ov-3" style={{
            fontFamily: DF, fontStyle: "italic", fontWeight: 300,
            fontSize: "clamp(1.1rem,3vw,2.4rem)",
            color: ROSE, letterSpacing: ".12em", lineHeight: 1.1,
            margin: "clamp(.25rem,.8vh,.75rem) 0",
            }}>
            &amp;
            </p>

            {/* Groom name — slides from right */}
            <h1 className="ov-4 ov-name" style={{
            fontFamily: DF, fontWeight: 300,
            fontSize: "clamp(4rem,12vw,10.5rem)",
            lineHeight: .86, letterSpacing: "-.04em",
            color: "var(--name-groom-light)", margin: 0,
            }}>
            {groomName}
            </h1>

            {/* Subtitle */}
            <p className="ov-5" style={{
              fontFamily: DF, fontStyle: "italic", fontWeight: 300,
              fontSize: "clamp(.9rem,2.2vw,1.25rem)",
              color: INK_3, letterSpacing: ".05em", lineHeight: 1.7,
              maxWidth: "28rem", marginTop: "clamp(1.25rem,3vh,2.5rem)",
            }}>
              {subtitle}
            </p>

            {/* Date */}
            {weddingDate && (
              <p className="ov-6" style={{
                fontFamily: BF, fontSize: "clamp(.52rem,1.1vw,.68rem)",
                fontWeight: 600, letterSpacing: ".40em", textTransform: "uppercase",
                color: `rgba(184,134,10,.72)`,
                marginTop: "clamp(.875rem,2vh,1.75rem)",
              }}>
                {weddingDate}
              </p>
            )}

            {/* "Tap to continue" hint */}
            <button
              type="button"
              onClick={goToHero}
              className="ov-7"
              style={{
                background: "none", border: "none", cursor: "pointer",
                marginTop: "clamp(1.25rem,3vh,2.5rem)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem",
              }}
            >
              <span style={{
                fontFamily: BF, fontSize: ".46rem", letterSpacing: ".36em",
                textTransform: "uppercase", color: INK_4, fontWeight: 500,
              }}>
                Open your invitation
              </span>
              {/* Small animated heart */}
              <svg width="18" height="16" viewBox="0 0 100 90" aria-hidden style={{
                animation: "ci-seal-pulse 2.5s ease-in-out infinite",
              }}>
                <path
                  d="M50 82 C50 82 6 52 6 28 C6 14 17 5 29 5 C37 5 44 9 50 17 C56 9 63 5 71 5 C83 5 94 14 94 28 C94 52 50 82 50 82Z"
                  fill={ROSE} opacity=".65"
                />
              </svg>
            </button>

            {/* Bottom rose-gold rule */}
            <div className="ov-8" style={{
              width: "min(140px,24%)", height: 1,
              background: `linear-gradient(to right,transparent,rgba(190,45,69,.45),rgba(212,172,50,.40),transparent)`,
              transformOrigin: "center",
              marginTop: "clamp(2rem,5vh,4rem)",
            }} />
          </div>

          {/* 1px bottom progress line */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
            background: "rgba(26,12,14,.06)",
          }}>
            <div style={{
              position: "absolute", inset: "0 auto 0 0",
              background: `linear-gradient(to right,${ROSE},${GOLD_L})`,
              animation: `ci-line-x ${OVERTURE_HOLD}ms linear forwards`,
            }} />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          HERO — light, warm
      ════════════════════════════════════════════════════════════════ */}
      {phase === "hero" && (
        <div className={heroVis ? "hv" : ""}>
          <section ref={heroRef} style={{
            position: "relative", minHeight: "100dvh",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center", overflow: "hidden",
            background: CREAM2,
          }}>
            {/* Photo — light desaturate, warm tone */}
            {heroPhotoUrl && (
              <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
                <div className="ci-par" style={{
                  position: "absolute", inset: "-10%",
                  backgroundImage: `url(${heroPhotoUrl})`,
                  backgroundSize: "cover", backgroundPosition: "center top",
                  filter: "saturate(.28) brightness(.62) contrast(1.04) sepia(.12)",
                  willChange: "transform", transform: "scale(1.08) translateY(0)",
                }} />
              </div>
            )}

            {/* Light overlays — warm ivory wash */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 1,
              background: "linear-gradient(to bottom,rgba(250,246,241,.52) 0%,rgba(250,246,241,.22) 35%,rgba(250,246,241,.50) 68%,rgba(250,246,241,.92) 100%)",
            }} />
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 2,
              background: "radial-gradient(ellipse 78% 72% at 50% 46%,transparent 22%,rgba(250,246,241,.62) 100%)",
            }} />
            {/* Rose top bloom */}
            <div aria-hidden style={{
              position: "absolute", top: "-14%", left: "-8%",
              width: "54%", height: "66%", borderRadius: "50%",
              background: "radial-gradient(circle,rgba(190,45,69,.06) 0%,transparent 65%)",
              zIndex: 2, pointerEvents: "none",
            }} />
            {/* Gold bottom bloom */}
            <div aria-hidden style={{
              position: "absolute", bottom: "-8%", right: "-5%",
              width: "46%", height: "54%", borderRadius: "50%",
              background: "radial-gradient(circle,rgba(184,134,10,.05) 0%,transparent 65%)",
              zIndex: 2, pointerEvents: "none",
            }} />

            {/* Top accent stripe — rose-gold */}
            <div aria-hidden style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 3,
              background: "linear-gradient(90deg,transparent 5%,rgba(190,45,69,.45) 28%,rgba(184,134,10,.65) 50%,rgba(190,45,69,.45) 72%,transparent 95%)",
            }} />

            {/* Content */}
            <div style={{
              position: "relative", zIndex: 5,
              padding: "clamp(4.5rem,8vh,7rem) clamp(1.25rem,5vw,3rem) clamp(3.5rem,6vh,5rem)",
              maxWidth: 860, width: "100%",
            }}>

              {/* Title tag */}
              <div className="h0" style={{
                display: "flex", alignItems: "center", gap: 14,
                justifyContent: "center", marginBottom: "clamp(1.25rem,3vh,2.5rem)",
              }}>
                <div style={{ flex: 1, maxWidth: 52, height: 1, background: "linear-gradient(to right,transparent,rgba(190,45,69,.40))" }} />
                <span style={{
                  fontFamily: BF, fontSize: ".42rem", fontWeight: 700,
                  letterSpacing: ".52em", textTransform: "uppercase",
                  color: "rgba(190,45,69,.75)",
                }}>
                  {title}
                </span>
                <div style={{ flex: 1, maxWidth: 52, height: 1, background: "linear-gradient(to left,transparent,rgba(190,45,69,.40))" }} />
              </div>

              {/* Bride */}
              <h1 className="h1 h-name" style={{
                fontFamily: DF, fontWeight: 300,
                fontSize: "clamp(3.5rem,14vw,11.5rem)",
                lineHeight: .84, letterSpacing: "-.04em",
                color: "var(--name-bride-light)", marginBottom: ".04em",
              }}>
                {brideFirst}
              </h1>

              <p className="h2" style={{
                fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                fontSize: "clamp(1rem,3vw,2.2rem)",
                color: ROSE, letterSpacing: ".14em", lineHeight: 1.2, marginBottom: ".04em",
              }}>
                &amp;
              </p>

              {/* Groom — soft warm gold */}
              <h1 className="h3 h-name" style={{
                fontFamily: DF, fontWeight: 300,
                fontSize: "clamp(3.5rem,14vw,11.5rem)",
                lineHeight: .84, letterSpacing: "-.04em",
                color: "var(--name-groom-light)", marginBottom: "clamp(1rem,2.5vh,2.5rem)",
              }}>
                {groomFirst}
              </h1>

              {/* Gold hairline */}
              <div className="h4" style={{
                width: "min(200px,44%)", height: 1, margin: "0 auto clamp(.875rem,2vh,2.25rem)",
                background: "linear-gradient(90deg,transparent,rgba(184,134,10,.55) 38%,rgba(184,134,10,.55) 62%,transparent)",
              }} />

              {/* Date */}
              {weddingDate && (
                <p className="h5" style={{
                  fontFamily: BF, fontSize: ".72rem", fontWeight: 600,
                  letterSpacing: ".38em", textTransform: "uppercase",
                  color: `rgba(184,134,10,.80)`,
                  marginBottom: "clamp(.75rem,1.5vh,1.375rem)",
                }}>
                  {weddingDate}
                </p>
              )}

              {/* Venue pills — light glass */}
              <div className="h5" style={{
                display: "flex", flexWrap: "wrap",
                justifyContent: "center", gap: ".625rem",
                marginBottom: "clamp(1.25rem,3vh,3rem)",
              }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "7px 18px", borderRadius: 999,
                  background: "rgba(190,45,69,.07)",
                  border: "1px solid rgba(190,45,69,.22)",
                  backdropFilter: "blur(8px)",
                  fontFamily: BF, fontSize: ".62rem", fontWeight: 600,
                  color: INK_2, letterSpacing: ".04em",
                }}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <line x1="5" y1="0" x2="5" y2="10" stroke={ROSE} strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="1" y1="3.5" x2="9" y2="3.5" stroke={ROSE} strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Divine Mercy Church
                  <span style={{ color: ROSE, fontWeight: 700 }}>· 3 PM</span>
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "7px 18px", borderRadius: 999,
                  background: "rgba(184,134,10,.07)",
                  border: "1px solid rgba(184,134,10,.28)",
                  backdropFilter: "blur(8px)",
                  fontFamily: BF, fontSize: ".62rem", fontWeight: 600,
                  color: INK_2, letterSpacing: ".04em",
                }}>
                  <svg width="14" height="7" viewBox="0 0 14 7" fill="none" aria-hidden>
                    <path d="M0.5 4 Q2 1 3.5 4 Q5 7 6.5 4 Q8 1 9.5 4 Q11 7 12.5 4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                  Blue Bay Beach Resort
                  <span style={{ color: GOLD, fontWeight: 700 }}>· 6 PM</span>
                </span>
              </div>

              {/* Guest tag */}
              <div className="h6" style={{ marginBottom: "clamp(1.25rem,3vh,3.5rem)" }}>
                <span style={{
                  display: "inline-block",
                  padding: "8px 26px", borderRadius: 999,
                  border: "1px solid rgba(26,12,14,.12)",
                  background: "rgba(26,12,14,.04)",
                  backdropFilter: "blur(12px)",
                  fontFamily: DF, fontStyle: "italic",
                  fontSize: "clamp(.78rem,1.9vw,.92rem)",
                  color: INK_3, letterSpacing: ".04em",
                }}>
                  A personal invitation for {guestLabel}
                </span>
              </div>

              {/* Wax seal */}
              <div className="h7" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>

                  {sealState === "burst" && (
                    <>
                      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1.5px solid ${ROSE_L}`, animation: "ci-ring1 .52s ease forwards", pointerEvents: "none" }} />
                      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid rgba(184,134,10,.45)`, animation: "ci-ring2 .65s .08s ease forwards", pointerEvents: "none" }} />
                    </>
                  )}

                  {sealState !== "gone" && (
                    <div
                      className="ci-seal-wrap"
                      onClick={handleSealClick}
                      onMouseEnter={() => { if (sealState === "idle") setSealState("hover"); }}
                      onMouseLeave={() => { if (sealState === "hover") setSealState("idle"); }}
                      style={{
                        position: "relative",
                        width: "clamp(130px,22vw,172px)",
                        height: "clamp(130px,22vw,172px)",
                        borderRadius: "50%", overflow: "hidden", cursor: "pointer",
                        boxShadow: sealState === "burst"
                          ? "none"
                          : "0 8px 32px rgba(26,12,14,.16), 0 2px 8px rgba(26,12,14,.10)",
                        animation:
                          sealState === "idle"  ? "ci-seal-pulse 3.8s 1.2s ease-in-out infinite" :
                          sealState === "hover" ? "ci-seal-hover .3s ease forwards" :
                          sealState === "burst" ? "ci-seal-burst .52s ease forwards" : "none",
                      }}
                    >
                      <svg viewBox="0 0 160 160" width="100%" height="100%" style={{ display: "block" }} aria-hidden>
                        <defs>
                          <radialGradient id="sgL" cx="38%" cy="34%" r="68%">
                            <stop offset="0%"   stopColor="#F5D47A"/>
                            <stop offset="35%"  stopColor="#C9960A"/>
                            <stop offset="68%"  stopColor="#9E7205"/>
                            <stop offset="100%" stopColor="#5C3D01"/>
                          </radialGradient>
                          <radialGradient id="ssL" cx="34%" cy="28%" r="52%">
                            <stop offset="0%"   stopColor="rgba(255,248,210,.35)"/>
                            <stop offset="100%" stopColor="rgba(255,248,210,0)"/>
                          </radialGradient>
                        </defs>
                        <circle cx="80" cy="80" r="80" fill="url(#sgL)"/>
                        {Array.from({ length: 16 }, (_, i) => {
                          const a = (i / 16) * Math.PI * 2;
                          return <line key={i}
                            x1={80+64*Math.cos(a)} y1={80+64*Math.sin(a)}
                            x2={80+79*Math.cos(a)} y2={80+79*Math.sin(a)}
                            stroke="rgba(60,35,0,.28)" strokeWidth="1.4"/>;
                        })}
                        <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(60,35,0,.26)" strokeWidth="1.4"/>
                        <circle cx="80" cy="80" r="53" fill="none" stroke="rgba(60,35,0,.16)" strokeWidth=".8"/>
                        <circle cx="80" cy="80" r="80" fill="url(#ssL)"/>
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{
                          fontFamily: DF, fontWeight: 600,
                          fontSize: "clamp(2.6rem,6.5vw,4.4rem)",
                          letterSpacing: ".14em", color: "rgba(28,14,0,.80)",
                          lineHeight: 1, marginLeft: ".14em",
                          textShadow: "0 1px 0 rgba(255,240,160,.42),0 -1px 4px rgba(0,0,0,.22)",
                        }}>
                          {initials}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {sealState !== "gone" && (
                  <p style={{
                    fontFamily: BF, fontSize: ".46rem",
                    letterSpacing: ".36em", textTransform: "uppercase",
                    color: INK_4, fontWeight: 500,
                  }}>
                    {sealState === "burst" ? "Opening…" : "Press to enter"}
                  </p>
                )}
              </div>
            </div>

            {/* Scroll cue */}
            {sealState === "gone" && (
              <div style={{
                position: "absolute", bottom: 24, left: "50%",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                zIndex: 5, animation: "ci-bounce 2.5s ease-in-out infinite",
              }}>
                <span style={{ fontFamily: BF, fontSize: ".38rem", letterSpacing: ".44em", textTransform: "uppercase", color: INK_4 }}>Scroll</span>
                <div style={{ width: 1, height: 28, background: `linear-gradient(to bottom,${ROSE},transparent)` }} />
                <ChevronDown size={10} style={{ color: ROSE, marginTop: -5 }} />
              </div>
            )}
          </section>

          {/* ── Invite content ── */}
          <div id="invite-content">
            <div style={{
              borderBottom: "1px solid rgba(190,45,69,.10)",
              background: "rgba(253,250,247,.97)",
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
              padding: "clamp(.875rem,2vh,1.125rem) clamp(1.25rem,5vw,5rem)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "1rem", flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                <span style={{ fontFamily: DF, fontSize: "clamp(.875rem,2.5vw,1.05rem)", fontWeight: 700, color: INK, letterSpacing: ".35em", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {brideFirst} &amp; {groomFirst}
                </span>
                <span style={{ fontFamily: BF, fontSize: ".60rem", letterSpacing: ".28em", textTransform: "uppercase", color: INK_4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {weddingDate ?? ""}{", "}{venueName ?? ""}
                </span>
              </div>
            </div>

            <section style={{
              background: "#F1E9E0",
              borderBottom: "1px solid rgba(190,45,69,.10)",
              padding: "clamp(3.5rem,8vh,6rem) clamp(1.5rem,6vw,5rem)",
              position: "relative", overflow: "hidden",
            }}>
              <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 55% at 15% 50%,rgba(190,45,69,.04) 0%,transparent 60%)" }} />
              <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
                <p style={{ fontFamily: BF, fontSize: ".5rem", letterSpacing: ".46em", textTransform: "uppercase", color: ROSE, fontWeight: 700, marginBottom: "clamp(1.75rem,4vh,3rem)" }}>
                  A personal welcome
                </p>
                <div style={{ borderLeft: "3px solid rgba(190,45,69,.24)", paddingLeft: "clamp(1.25rem,3.5vw,2.25rem)" }}>
                  <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: "clamp(1rem,2.4vw,1.18rem)", color: INK, lineHeight: 1.95, marginBottom: ".5em" }}>
                    Dear {guestLabel},
                  </p>
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
