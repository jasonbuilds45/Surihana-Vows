"use client";

/**
 * CinematicIntro — The Negative Space Edit
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * DESIGN LANGUAGE: "Quiet Luxury / Maison Architecture"
 *
 * Reference points: Celine SS24 campaign, Bottega Veneta lookbooks,
 * The Row brand identity. Extreme typographic scale. Maximum negative space.
 * No decoration — the type IS the design.
 *
 * PHASE 1 · TITLE SEQUENCE
 *   No particles, no borders, no gradients.
 *   Each scene is a single typographic idea given the whole screen.
 *
 *   Scene 0 — BLACK SCREEN. One word slides in from the left in 9rem+ display
 *             type. "Marion." Full stop. Holds. Then cuts.
 *   Scene 1 — Same treatment. "Livingston." Right-aligned. Cuts.
 *   Scene 2 — Both names together, stacked, extreme scale. Barely fit.
 *             A single hairline rose line slides in between them vertically.
 *   Scene 3 — Date. Set in a monospaced tabular style — each digit on its own
 *             baseline — like a departure board or a watch crystal.
 *   Scene 4 — Venue. Italic, slow, 4rem+. Fills the bottom third.
 *             "Divine Mercy Church" letterforms tracked wide.
 *   Scene 5 — Countdown. Three columns. Days. Hours. Min. Ultra-minimal.
 *
 * PHASE 2 · THE LOCKED PANEL
 *   The hero photo appears full-bleed behind a full-screen frosted glass panel.
 *   The panel is split horizontally — top half and bottom half — with the
 *   guest name printed in the center gap as if embossed on both surfaces.
 *   No card. No envelope. No seal.
 *
 *   The monogram lockup sits in the center: a perfect square with hairline
 *   borders, the initials inside in a large display face. Feels like a
 *   perfume bottle label — Chanel, Hermès.
 *
 *   CTA: a single thin underlined text link "Open" that ripples on hover.
 *   No button. No background. Just the word and a line beneath it.
 *
 *   On click: the two frosted panels slide apart (top slides up, bottom slides
 *   down), revealing the full photo, which then zooms slightly as it transitions
 *   to Phase 3.
 *
 * PHASE 3 · UNVEIL
 *   Full-bleed photo. Dark overlay. White type only.
 *   Name in extreme scale again — 10rem+ — over the photo.
 *   Minimal, dark, cinematic.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SkipForward, VolumeX, Volume2 } from "lucide-react";

// ── Platform tokens ────────────────────────────────────────────────────────
const ROSE      = "#BE2D45";
const ROSE_L    = "#D44860";
const ROSE_MID  = "#F0BEC6";
const ROSE_PALE = "#FBEBEE";
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
const BDR_MD    = "rgba(190,45,69,0.18)";

// Title sequence: near-black, not pure black — slightly warm
const VOID = "#0A0608";

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

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

type Phase = "title" | "panel" | "unveil";

// ── Deterministic data ─────────────────────────────────────────────────────
const SCENE_HOLD = [2600, 2600, 3000, 2800, 2800, 3000];
const CROSSFADE  = 600;

// ── Countdown ─────────────────────────────────────────────────────────────
function useCountdown(target?: string) {
  const [vals, setVals] = useState({ d: 0, h: 0, m: 0, label: "" });
  useEffect(() => {
    if (!target) return;
    function tick() {
      const ms = new Date(target).getTime() - Date.now();
      if (ms <= 0) { setVals({ d:0,h:0,m:0, label:"Today" }); return; }
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const label = d > 1 ? `${d} days away` : d === 1 ? `Tomorrow` : `${h}h ${m}m`;
      setVals({ d, h, m, label });
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [target]);
  return vals;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

// ═══════════════════════════════════════════════════════════════════════════
export function CinematicIntro({
  inviteCode, guestLabel, brideName, groomName,
  title, subtitle, weddingDate, venueName, venueCity,
  heroPhotoUrl, audioSrc = "/audio/wedding-theme.mp3", children,
}: CinematicIntroProps) {

  const [mounted,      setMounted]      = useState(false);
  const [phase,        setPhase]        = useState<Phase>("title");
  const [scene,        setScene]        = useState(0);
  const [sceneVis,     setSceneVis]     = useState(true);
  const [leaving,      setLeaving]      = useState(false);
  const [unveiled,     setUnveiled]     = useState(false);
  const [muted,        setMuted]        = useState(true);
  const [audioAvail,   setAudioAvail]   = useState<boolean | null>(audioSrc ? null : false);

  // Panel split state
  const [panelState,   setPanelState]   = useState<"closed"|"opening"|"open">("closed");

  // Open-link hover ripple
  const [ripple,       setRipple]       = useState<{x:number;y:number;k:number}|null>(null);

  const audioRef   = useRef<HTMLAudioElement|null>(null);
  const sceneTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const heroRef    = useRef<HTMLElement|null>(null);
  const rippleKey  = useRef(0);

  const storageKey = `surihana-intro:${inviteCode}`;
  const cookieName = `invite_intro_seen_${inviteCode}`;

  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;
  const initials   = useMemo(
    () => `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase(),
    [brideName, groomName]
  );
  const countdown  = useCountdown(weddingDate);

  // ── Mount / returning visitor ──────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const hasCookie  = document.cookie.split(";").some(c => c.trim().startsWith(`${cookieName}=`));
    const hasSession = sessionStorage.getItem(storageKey) === "entered";
    if (hasCookie || hasSession) {
      setPhase("unveil");
      setTimeout(() => setUnveiled(true), 80);
    }
  }, [cookieName, storageKey]);

  // ── Parallax ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "unveil" || typeof window === "undefined") return;
    const fn = () => {
      const ph = heroRef.current?.querySelector<HTMLElement>(".ci-par");
      if (ph) ph.style.transform = `scale(1.08) translateY(${window.scrollY * 0.22}px)`;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [phase]);

  // ── Scene auto-advance ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "title") return;
    const hold = SCENE_HOLD[scene] ?? 2800;
    sceneTimer.current = setTimeout(() => {
      setSceneVis(false);
      setTimeout(() => {
        if (scene < SCENE_HOLD.length - 1) { setScene(s => s + 1); setSceneVis(true); }
        else goToPanel();
      }, CROSSFADE);
    }, hold);
    return () => { if (sceneTimer.current) clearTimeout(sceneTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, phase]);

  // ── Audio ──────────────────────────────────────────────────────────────
  const setAudioRef = useCallback((el: HTMLAudioElement|null) => {
    audioRef.current = el;
    if (!el) return;
    el.addEventListener("canplaythrough", () => setAudioAvail(true), { once: true });
    el.addEventListener("error",          () => setAudioAvail(false), { once: true });
    if (el.readyState >= 3) setAudioAvail(true);
  }, []);

  function toggleAudio() {
    if (!audioRef.current || !audioAvail) return;
    setMuted(v => {
      const next = !v;
      if (audioRef.current) {
        audioRef.current.muted = next;
        if (!next) void audioRef.current.play().catch(() => undefined);
      }
      return next;
    });
  }

  // ── Transitions ────────────────────────────────────────────────────────
  function fadeOut(cb: () => void, ms = 900) {
    setLeaving(true);
    setTimeout(() => { setLeaving(false); cb(); }, ms);
  }

  function goToPanel() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    fadeOut(() => setPhase("panel"));
  }

  function skipToPanel() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    setSceneVis(false);
    fadeOut(() => setPhase("panel"), 600);
  }

  function openInvite(e?: React.MouseEvent) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "entered");
      const exp = new Date(Date.now() + 30*24*60*60*1000).toUTCString();
      document.cookie = `${cookieName}=1; expires=${exp}; path=/; SameSite=Lax`;
    }
    if (audioRef.current) audioRef.current.pause();
    setPanelState("opening");
    setTimeout(() => {
      setPanelState("open");
      fadeOut(() => {
        setPhase("unveil");
        requestAnimationFrame(() => requestAnimationFrame(() => setUnveiled(true)));
      }, 950);
    }, 680);
  }

  function handleOpenMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    rippleKey.current++;
    setRipple({ x: e.clientX - r.left, y: e.clientY - r.top, k: rippleKey.current });
  }

  if (!mounted) return <div style={{ minHeight:"100dvh", background:VOID }}>{children}</div>;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ── primitives ── */
        @keyframes ci-in-left  { from{opacity:0;transform:translateX(-8vw)} to{opacity:1;transform:translateX(0)} }
        @keyframes ci-in-right { from{opacity:0;transform:translateX(8vw)}  to{opacity:1;transform:translateX(0)} }
        @keyframes ci-in-up    { from{opacity:0;transform:translateY(4rem)} to{opacity:1;transform:translateY(0)} }
        @keyframes ci-in-down  { from{opacity:0;transform:translateY(-3rem)} to{opacity:1;transform:translateY(0)} }
        @keyframes ci-fade     { from{opacity:0} to{opacity:1} }
        @keyframes ci-line-x   { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes ci-line-y   { from{transform:scaleY(0)} to{transform:scaleY(1)} }

        /* ── title sequence ── */
        .t-phase { transition: opacity .9s cubic-bezier(.4,0,.2,1); }
        .t-leaving { opacity:0!important; pointer-events:none; }

        /* ── skip / controls ── */
        .ci-ctrl {
          display:inline-flex;align-items:center;gap:5px;
          padding:6px 14px;
          border:none;background:transparent;
          color:rgba(255,255,255,.38);
          font-family:${BF};font-size:.58rem;font-weight:500;
          letter-spacing:.22em;text-transform:uppercase;cursor:pointer;
          transition:color .2s ease;
        }
        .ci-ctrl:hover { color:rgba(255,255,255,.75); }

        /* ── panel split ── */
        .ci-panel-top {
          position:absolute; inset:0 0 50% 0; z-index:4;
          transition:transform .72s cubic-bezier(.76,0,.24,1);
          will-change:transform;
        }
        .ci-panel-bot {
          position:absolute; inset:50% 0 0 0; z-index:4;
          transition:transform .72s cubic-bezier(.76,0,.24,1);
          will-change:transform;
        }
        .panel-opening .ci-panel-top { transform:translateY(-102%); }
        .panel-opening .ci-panel-bot { transform:translateY(102%); }

        /* ── open link ripple ── */
        @keyframes ci-ripple { 0%{transform:scale(0);opacity:.35} 100%{transform:scale(2.8);opacity:0} }

        /* ── monogram lockup ── */
        @keyframes ci-mono-in {
          0%  {opacity:0;transform:scale(.88) rotate(-2deg)}
          60% {opacity:1;transform:scale(1.02) rotate(.5deg)}
          100%{opacity:1;transform:scale(1) rotate(0deg)}
        }

        /* ── panel glass shimmer ── */
        @keyframes ci-glass-shimmer {
          0%  {background-position:200% 50%}
          100%{background-position:-200% 50%}
        }

        /* ── unveil hero ── */
        .uv { }
        .uv .u0{opacity:0;animation:ci-fade   .8s .00s ease forwards}
        .uv .u1{opacity:0;animation:ci-in-up  1.1s .14s cubic-bezier(.16,1,.3,1) forwards}
        .uv .u2{opacity:0;animation:ci-fade   .7s .28s ease forwards}
        .uv .u3{opacity:0;animation:ci-in-up  1.1s .40s cubic-bezier(.16,1,.3,1) forwards}
        .uv .u4{opacity:0;animation:ci-fade   .8s .56s ease forwards;transform-origin:center}
        .uv .u5{opacity:0;animation:ci-in-up  .9s .70s cubic-bezier(.22,1,.36,1) forwards}
        .uv .u6{opacity:0;animation:ci-in-up  .85s .84s cubic-bezier(.22,1,.36,1) forwards}
        .uv .u7{opacity:0;animation:ci-in-up  .80s .98s cubic-bezier(.22,1,.36,1) forwards}

        /* ── scroll bounce ── */
        @keyframes ci-bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)}}

        /* ── unveil view link ── */
        .uv-link {
          display:inline-flex;align-items:center;gap:8px;
          padding:0 0 3px 0;
          background:none;border:none;
          border-bottom:1px solid rgba(255,255,255,.45);
          color:rgba(255,255,255,.88);
          font-family:${BF};font-size:.72rem;font-weight:500;
          letter-spacing:.22em;text-transform:uppercase;
          text-decoration:none;cursor:pointer;
          transition:color .25s ease,border-color .25s ease;
        }
        .uv-link:hover{color:#fff;border-color:rgba(255,255,255,.9)}

        /* ── mobile ── */
        @media(max-width:520px){
          .t-name-solo{font-size:clamp(5rem,22vw,9rem)!important;letter-spacing:-.02em!important}
          .t-name-pair{font-size:clamp(4rem,18vw,7.5rem)!important}
          .t-date{font-size:clamp(2.8rem,13vw,5.5rem)!important}
          .uv-name{font-size:clamp(3.5rem,15vw,8rem)!important}
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 1 · TITLE SEQUENCE
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "title" && (
        <div
          className={`t-phase${leaving ? " t-leaving" : ""}`}
          style={{
            position:"fixed", inset:0, zIndex:9999,
            background: VOID,
            overflow:"hidden",
          }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* Very subtle warm centre glow — barely there */}
          <div aria-hidden style={{
            position:"absolute", inset:0, pointerEvents:"none",
            background:"radial-gradient(ellipse 60% 50% at 50% 50%, rgba(190,45,69,.06) 0%, transparent 70%)",
          }} />

          {/* Controls */}
          {scene >= 1 && (
            <div style={{
              position:"absolute", top:20, right:20, zIndex:10,
              display:"flex", gap:6,
              opacity:0, animation:"ci-fade .6s .2s ease forwards",
            }}>
              {audioAvail === true && (
                <button type="button" onClick={toggleAudio} className="ci-ctrl">
                  {muted
                    ? <VolumeX size={11}/>
                    : <span style={{display:"inline-flex",alignItems:"flex-end",gap:2,height:11}}>
                        {[8,11,6].map((h,i) => (
                          <span key={i} style={{
                            width:2,height:h,borderRadius:1,
                            background:"rgba(255,255,255,.55)",
                            transformOrigin:"bottom",
                            animation:`ci-bar${i+1} .7s ${i*.1}s ease-in-out infinite`,
                          }}/>
                        ))}
                      </span>
                  }
                  {muted?"Sound":"Live"}
                </button>
              )}
              <button type="button" onClick={skipToPanel} className="ci-ctrl">
                <SkipForward size={10}/> Skip
              </button>
            </div>
          )}

          {/* ── SCENE STAGE ── */}
          <div style={{
            position:"absolute", inset:0,
            display:"flex", flexDirection:"column",
            justifyContent:"center",
            padding:"clamp(40px,8vh,96px) clamp(32px,6vw,88px)",
            opacity: sceneVis ? 1 : 0,
            transition:`opacity ${CROSSFADE}ms cubic-bezier(.4,0,.2,1)`,
          }}>

            {/* Scene 0 — Bride name solo, left-aligned */}
            {scene === 0 && (
              <div>
                <p style={{
                  fontFamily:BF, fontSize:".5rem",
                  letterSpacing:".55em", textTransform:"uppercase",
                  color:"rgba(190,45,69,.65)", fontWeight:700,
                  marginBottom:"clamp(1.5rem,4vh,3rem)",
                  opacity:0, animation:"ci-fade .6s .1s ease forwards",
                }}>
                  {title}
                </p>
                <h1 className="t-name-solo" style={{
                  fontFamily:DF,
                  fontSize:"clamp(6rem,17vw,13rem)",
                  fontWeight:300, lineHeight:.88,
                  letterSpacing:"-.035em",
                  color:"#FFFFFF",
                  margin:0, padding:0,
                  opacity:0,
                  animation:"ci-in-left 1.0s .2s cubic-bezier(.16,1,.3,1) forwards",
                }}>
                  {brideFirst}.
                </h1>
                <div style={{
                  marginTop:"clamp(1.5rem,4vh,3rem)",
                  width:"min(90px,20%)", height:"1px",
                  background:`linear-gradient(to right, ${ROSE}, transparent)`,
                  transformOrigin:"left",
                  opacity:0, animation:"ci-line-x .9s .9s ease forwards",
                }}/>
              </div>
            )}

            {/* Scene 1 — Groom name solo, right-aligned */}
            {scene === 1 && (
              <div style={{ textAlign:"right" }}>
                <p style={{
                  fontFamily:BF, fontSize:".5rem",
                  letterSpacing:".55em", textTransform:"uppercase",
                  color:`rgba(201,150,10,.65)`, fontWeight:700,
                  marginBottom:"clamp(1.5rem,4vh,3rem)",
                  opacity:0, animation:"ci-fade .6s .1s ease forwards",
                }}>
                  {title}
                </p>
                <h1 className="t-name-solo" style={{
                  fontFamily:DF,
                  fontSize:"clamp(6rem,17vw,13rem)",
                  fontWeight:300, lineHeight:.88,
                  letterSpacing:"-.035em",
                  color:"rgba(232,188,20,.92)",
                  margin:0, padding:0,
                  opacity:0,
                  animation:"ci-in-right 1.0s .2s cubic-bezier(.16,1,.3,1) forwards",
                }}>
                  {groomFirst}.
                </h1>
                <div style={{
                  marginTop:"clamp(1.5rem,4vh,3rem)",
                  width:"min(90px,20%)", height:"1px",
                  marginLeft:"auto",
                  background:`linear-gradient(to left, rgba(201,150,10,.7), transparent)`,
                  transformOrigin:"right",
                  opacity:0, animation:"ci-line-x .9s .9s ease forwards",
                }}/>
              </div>
            )}

            {/* Scene 2 — Both names, extreme scale, with vertical line */}
            {scene === 2 && (
              <div style={{ position:"relative" }}>
                {/* Vertical divider line */}
                <div aria-hidden style={{
                  position:"absolute",
                  left:"calc(50% - 0.5px)", top:0, bottom:0,
                  width:1,
                  background:`linear-gradient(to bottom, transparent 0%, ${ROSE} 20%, rgba(190,45,69,.6) 50%, transparent 100%)`,
                  transformOrigin:"center top",
                  opacity:0, animation:"ci-line-y 1.0s .7s ease forwards",
                }}/>

                <div style={{
                  display:"grid",
                  gridTemplateColumns:"1fr 1fr",
                  gap:0,
                }}>
                  {/* Left — bride */}
                  <div style={{ paddingRight:"clamp(1.5rem,4vw,3rem)", borderRight:"none" }}>
                    <h1 className="t-name-pair" style={{
                      fontFamily:DF,
                      fontSize:"clamp(4.5rem,12vw,10rem)",
                      fontWeight:300, lineHeight:.86,
                      letterSpacing:"-.03em",
                      color:"#FFFFFF",
                      textAlign:"right",
                      opacity:0,
                      animation:"ci-in-left 1.0s .1s cubic-bezier(.16,1,.3,1) forwards",
                    }}>
                      {brideFirst}
                    </h1>
                  </div>
                  {/* Right — groom */}
                  <div style={{ paddingLeft:"clamp(1.5rem,4vw,3rem)" }}>
                    <h1 className="t-name-pair" style={{
                      fontFamily:DF,
                      fontSize:"clamp(4.5rem,12vw,10rem)",
                      fontWeight:300, lineHeight:.86,
                      letterSpacing:"-.03em",
                      color:"rgba(232,188,20,.90)",
                      textAlign:"left",
                      opacity:0,
                      animation:"ci-in-right 1.0s .22s cubic-bezier(.16,1,.3,1) forwards",
                    }}>
                      {groomFirst}
                    </h1>
                  </div>
                </div>

                {/* Ampersand — dead centre */}
                <p style={{
                  position:"absolute", left:"50%", top:"50%",
                  transform:"translate(-50%,-50%)",
                  fontFamily:DF, fontStyle:"italic", fontWeight:300,
                  fontSize:"clamp(1rem,3vw,2rem)",
                  color:"rgba(190,45,69,.75)",
                  letterSpacing:".06em", lineHeight:1,
                  zIndex:2,
                  opacity:0, animation:"ci-fade .7s .85s ease forwards",
                }}>
                  &amp;
                </p>
              </div>
            )}

            {/* Scene 3 — Date as tabular display */}
            {scene === 3 && (
              <div>
                <p style={{
                  fontFamily:BF, fontSize:".5rem",
                  letterSpacing:".55em", textTransform:"uppercase",
                  color:"rgba(255,255,255,.28)", fontWeight:500,
                  marginBottom:"clamp(2rem,5vh,4rem)",
                  opacity:0, animation:"ci-fade .6s .1s ease forwards",
                }}>
                  The date
                </p>
                {weddingDate ? (
                  <div style={{
                    opacity:0, animation:"ci-in-up 1.0s .2s cubic-bezier(.16,1,.3,1) forwards",
                  }}>
                    {/* Break date into readable parts */}
                    <div style={{
                      display:"flex", alignItems:"baseline",
                      gap:"clamp(.75rem,2.5vw,2rem)",
                    }}>
                      {weddingDate.split(" ").map((word, i) => (
                        <span key={i} className="t-date" style={{
                          fontFamily:DF, fontWeight:300,
                          fontSize:"clamp(3.5rem,11vw,9rem)",
                          letterSpacing:"-.02em", lineHeight:.9,
                          color: i === 0 ? "rgba(255,255,255,.35)"
                               : i === 1 ? "#FFFFFF"
                               : "rgba(255,255,255,.35)",
                        }}>
                          {word}
                        </span>
                      ))}
                    </div>
                    {countdown.label && (
                      <p style={{
                        marginTop:"clamp(1.5rem,3vh,2.5rem)",
                        fontFamily:BF, fontSize:".55rem",
                        letterSpacing:".42em", textTransform:"uppercase",
                        color:"rgba(201,150,10,.65)", fontWeight:500,
                        opacity:0, animation:"ci-fade .6s .9s ease forwards",
                      }}>
                        {countdown.label}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Scene 4 — Venue, italic, bottom-anchored */}
            {scene === 4 && (
              <div style={{
                position:"absolute",
                bottom:"clamp(80px,14vh,140px)",
                left:"clamp(32px,6vw,88px)",
                right:"clamp(32px,6vw,88px)",
              }}>
                <p style={{
                  fontFamily:BF, fontSize:".48rem",
                  letterSpacing:".52em", textTransform:"uppercase",
                  color:"rgba(255,255,255,.28)", fontWeight:500,
                  marginBottom:"clamp(1rem,2.5vh,2rem)",
                  opacity:0, animation:"ci-fade .6s .1s ease forwards",
                }}>
                  The venue
                </p>
                {venueName && (
                  <p style={{
                    fontFamily:DF, fontStyle:"italic", fontWeight:300,
                    fontSize:"clamp(2.5rem,7.5vw,6.5rem)",
                    letterSpacing:".02em", lineHeight:.92,
                    color:"rgba(255,255,255,.88)",
                    opacity:0,
                    animation:"ci-in-up 1.1s .2s cubic-bezier(.16,1,.3,1) forwards",
                  }}>
                    {venueName}
                  </p>
                )}
                {venueCity && (
                  <p style={{
                    marginTop:"clamp(.75rem,1.5vh,1.25rem)",
                    fontFamily:BF, fontSize:".62rem",
                    letterSpacing:".28em", textTransform:"uppercase",
                    color:"rgba(201,150,10,.60)", fontWeight:500,
                    opacity:0, animation:"ci-fade .7s .8s ease forwards",
                  }}>
                    {venueCity}
                  </p>
                )}
              </div>
            )}

            {/* Scene 5 — Countdown columns */}
            {scene === 5 && (
              <div>
                <p style={{
                  fontFamily:BF, fontSize:".5rem",
                  letterSpacing:".55em", textTransform:"uppercase",
                  color:"rgba(255,255,255,.25)", fontWeight:500,
                  marginBottom:"clamp(2.5rem,6vh,5rem)",
                  opacity:0, animation:"ci-fade .6s .1s ease forwards",
                }}>
                  Until the ceremony
                </p>
                <div style={{
                  display:"flex", alignItems:"flex-start",
                  gap:"clamp(2rem,6vw,5rem)",
                  opacity:0, animation:"ci-in-up 1.0s .2s cubic-bezier(.16,1,.3,1) forwards",
                }}>
                  {[
                    { n: countdown.d, label:"Days",    highlight: true  },
                    { n: countdown.h, label:"Hours",   highlight: false },
                    { n: countdown.m, label:"Minutes", highlight: false },
                  ].map(({ n, label, highlight }) => (
                    <div key={label}>
                      {/* Number */}
                      <div style={{
                        fontFamily:DF, fontWeight:300,
                        fontSize:"clamp(4rem,12vw,10rem)",
                        lineHeight:.88,
                        letterSpacing:"-.03em",
                        color: highlight ? "#FFFFFF" : "rgba(255,255,255,.32)",
                      }}>
                        {pad(n)}
                      </div>
                      {/* Label */}
                      <div style={{
                        marginTop:".75rem",
                        fontFamily:BF, fontSize:".46rem",
                        letterSpacing:".44em", textTransform:"uppercase",
                        color: highlight ? "rgba(190,45,69,.7)" : "rgba(255,255,255,.18)",
                        fontWeight:600,
                      }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Progress line */}
          <div style={{
            position:"absolute", bottom:"clamp(32px,5vh,52px)",
            left:"clamp(32px,6vw,88px)", right:"clamp(32px,6vw,88px)",
            height:1, background:"rgba(255,255,255,.08)",
            borderRadius:1,
          }}>
            <div style={{
              position:"absolute", inset:"0 auto 0 0",
              background: scene < 2 ? ROSE : `rgba(201,150,10,.8)`,
              borderRadius:1,
              animation:`ci-prog-fill ${SCENE_HOLD[scene] ?? 2800}ms linear forwards`,
            }}/>
          </div>
          <style>{`@keyframes ci-prog-fill{from{width:0}to{width:100%}}`}</style>

          {/* Scene count */}
          <div style={{
            position:"absolute", bottom:"clamp(28px,4.5vh,46px)", right:"clamp(32px,6vw,88px)",
            fontFamily:BF, fontSize:".44rem", letterSpacing:".30em",
            color:"rgba(255,255,255,.18)", textTransform:"uppercase",
          }}>
            {String(scene+1).padStart(2,"0")} / {String(SCENE_HOLD.length).padStart(2,"0")}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 2 · THE LOCKED PANEL
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "panel" && (
        <div
          className={`t-phase${leaving ? " t-leaving" : ""}`}
          style={{ position:"fixed", inset:0, zIndex:9999, overflow:"hidden" }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* ── Full-bleed hero photo behind the panel ── */}
          {heroPhotoUrl && (
            <div aria-hidden style={{ position:"absolute", inset:0, zIndex:0 }}>
              <div style={{
                position:"absolute", inset:"-6%",
                backgroundImage:`url(${heroPhotoUrl})`,
                backgroundSize:"cover", backgroundPosition:"center center",
                filter:"saturate(.30) brightness(.55) contrast(1.08)",
              }}/>
            </div>
          )}
          {/* Dark tint for legibility */}
          <div aria-hidden style={{
            position:"absolute", inset:0, zIndex:1,
            background:"rgba(8,5,7,.62)",
          }}/>

          {/* Skip button */}
          <button type="button" onClick={openInvite}
            className="ci-ctrl"
            style={{
              position:"absolute", top:16, right:16, zIndex:20,
              opacity:0, animation:"ci-fade .5s .4s ease forwards",
            }}
          >
            <SkipForward size={10}/> Skip
          </button>

          {/* ── PANEL WRAPPER ── */}
          <div
            className={panelState === "opening" || panelState === "open" ? "panel-opening" : ""}
            style={{ position:"absolute", inset:0, zIndex:2 }}
          >

            {/* TOP PANEL — frosted glass */}
            <div className="ci-panel-top" style={{
              background:"rgba(253,250,247,.88)",
              backdropFilter:"blur(28px) saturate(160%)",
              WebkitBackdropFilter:"blur(28px) saturate(160%)",
            }}>
              {/* Subtle noise grain on panel */}
              <div aria-hidden style={{
                position:"absolute", inset:0, opacity:.6,
                backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
              }}/>
              {/* Bottom hairline */}
              <div style={{
                position:"absolute", bottom:0, left:0, right:0, height:1,
                background:`linear-gradient(90deg, transparent 0%, rgba(190,45,69,.25) 30%, rgba(201,150,10,.35) 50%, rgba(190,45,69,.25) 70%, transparent 100%)`,
              }}/>
            </div>

            {/* BOTTOM PANEL — frosted glass */}
            <div className="ci-panel-bot" style={{
              background:"rgba(253,250,247,.88)",
              backdropFilter:"blur(28px) saturate(160%)",
              WebkitBackdropFilter:"blur(28px) saturate(160%)",
            }}>
              <div aria-hidden style={{
                position:"absolute", inset:0, opacity:.6,
                backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
              }}/>
              {/* Top hairline */}
              <div style={{
                position:"absolute", top:0, left:0, right:0, height:1,
                background:`linear-gradient(90deg, transparent 0%, rgba(190,45,69,.25) 30%, rgba(201,150,10,.35) 50%, rgba(190,45,69,.25) 70%, transparent 100%)`,
              }}/>
            </div>
          </div>

          {/* ── CENTER CONTENT (sits between the two panels, z above them) ── */}
          <div style={{
            position:"absolute", inset:0, zIndex:6,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            padding:"0 24px",
            pointerEvents: panelState === "opening" || panelState === "open" ? "none" : "auto",
          }}>

            {/* Addressed-to — sits above the lockup */}
            <div style={{
              textAlign:"center", marginBottom:"clamp(2rem,4vh,3.5rem)",
              opacity:0, animation:"ci-in-down .9s .3s cubic-bezier(.22,1,.36,1) forwards",
            }}>
              <p style={{
                fontFamily:BF, fontSize:".5rem",
                letterSpacing:".52em", textTransform:"uppercase",
                color:INK_3, fontWeight:600,
                marginBottom:".5rem",
              }}>
                A personal invitation for
              </p>
              <p style={{
                fontFamily:DF, fontWeight:600,
                fontSize:"clamp(1.6rem,5vw,2.2rem)",
                color:INK, letterSpacing:".02em", lineHeight:1.15,
              }}>
                {guestLabel}
              </p>
            </div>

            {/* ── MONOGRAM LOCKUP ── */}
            <div style={{
              opacity:0,
              animation:"ci-mono-in 1.1s .6s cubic-bezier(.34,1.56,.64,1) forwards",
            }}>
              {/* Outer square — hairline */}
              <div style={{
                position:"relative",
                width:"clamp(140px,25vw,188px)",
                height:"clamp(140px,25vw,188px)",
                border:`1px solid rgba(190,45,69,.28)`,
              }}>
                {/* Inner square inset */}
                <div style={{
                  position:"absolute",
                  inset:8,
                  border:`1px solid rgba(168,120,8,.18)`,
                }}/>
                {/* Corner accents — solid rose squares at each corner */}
                {[
                  {top:-3,left:-3},{top:-3,right:-3},
                  {bottom:-3,left:-3},{bottom:-3,right:-3},
                ].map((pos,i) => (
                  <div key={i} style={{
                    position:"absolute", ...pos,
                    width:5, height:5,
                    background:ROSE,
                  }}/>
                ))}
                {/* Monogram */}
                <div style={{
                  position:"absolute", inset:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <span style={{
                    fontFamily:DF, fontWeight:300,
                    fontSize:"clamp(3.5rem,9vw,6rem)",
                    letterSpacing:".18em",
                    color:INK, lineHeight:1,
                    marginLeft:".18em", /* optical spacing for kerning */
                  }}>
                    {initials}
                  </span>
                </div>
              </div>
            </div>

            {/* Date + venue below lockup */}
            <div style={{
              textAlign:"center",
              marginTop:"clamp(2rem,4vh,3.5rem)",
              opacity:0, animation:"ci-in-up .9s .9s cubic-bezier(.22,1,.36,1) forwards",
            }}>
              {weddingDate && (
                <p style={{
                  fontFamily:DF, fontWeight:400,
                  fontSize:"clamp(1rem,2.5vw,1.4rem)",
                  color:INK_2, letterSpacing:".06em", marginBottom:".375rem",
                }}>
                  {weddingDate}
                </p>
              )}
              {(venueName || venueCity) && (
                <p style={{
                  fontFamily:BF, fontSize:".6rem",
                  letterSpacing:".28em", textTransform:"uppercase",
                  color:INK_3, fontWeight:500,
                }}>
                  {[venueName, venueCity].filter(Boolean).join("  ·  ")}
                </p>
              )}
              {weddingDate && countdown.label && (
                <div style={{
                  display:"inline-flex", alignItems:"center", gap:7,
                  marginTop:".875rem",
                  padding:"5px 16px", borderRadius:999,
                  background:"rgba(190,45,69,.06)",
                  border:`1px solid rgba(190,45,69,.12)`,
                }}>
                  <span style={{
                    width:5, height:5, borderRadius:"50%",
                    background:ROSE, flexShrink:0,
                    boxShadow:`0 0 6px ${ROSE}`,
                  }}/>
                  <span style={{
                    fontFamily:BF, fontSize:".62rem",
                    letterSpacing:".12em", color:INK_3, fontWeight:500,
                  }}>
                    {countdown.label}
                  </span>
                </div>
              )}
            </div>

            {/* ── OPEN LINK ── */}
            <div style={{
              marginTop:"clamp(2.5rem,5vh,4rem)",
              opacity:0, animation:"ci-in-up .85s 1.15s cubic-bezier(.22,1,.36,1) forwards",
            }}>
              <button
                type="button"
                onClick={openInvite}
                onMouseEnter={handleOpenMouseEnter}
                style={{
                  position:"relative",
                  display:"inline-flex", alignItems:"center", gap:10,
                  padding:"2px 0 6px 0",
                  background:"none", border:"none",
                  borderBottom:`1.5px solid ${INK_3}`,
                  color:INK,
                  fontFamily:BF, fontSize:".7rem", fontWeight:600,
                  letterSpacing:".28em", textTransform:"uppercase",
                  cursor:"pointer",
                  overflow:"hidden",
                  transition:"color .25s ease, border-color .25s ease",
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = ROSE;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = ROSE;
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = INK;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = INK_3;
                }}
              >
                {/* Ripple */}
                {ripple && (
                  <span
                    key={ripple.k}
                    aria-hidden
                    style={{
                      position:"absolute",
                      left:ripple.x, top:ripple.y,
                      width:80, height:80,
                      borderRadius:"50%",
                      background:"rgba(190,45,69,.12)",
                      transform:"translate(-50%,-50%) scale(0)",
                      animation:"ci-ripple .6s ease forwards",
                      pointerEvents:"none",
                    }}
                  />
                )}
                Open your invitation
                <span style={{ fontSize:".75rem", color:"inherit", opacity:.7 }}>→</span>
              </button>

              <p style={{
                marginTop:"1.125rem", textAlign:"center",
                fontFamily:BF, fontSize:".56rem",
                color:INK_4, letterSpacing:".12em", lineHeight:1.7,
              }}>
                {subtitle}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 3 · UNVEIL
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "unveil" && (
        <div className={unveiled ? "uv" : ""}>
          <section
            ref={heroRef}
            style={{
              position:"relative",
              minHeight:"100dvh",
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
              textAlign:"center",
              overflow:"hidden",
              background:VOID,
            }}
          >
            {/* Photo */}
            {heroPhotoUrl && (
              <div aria-hidden style={{ position:"absolute", inset:0, zIndex:0, overflow:"hidden" }}>
                <div className="ci-par" style={{
                  position:"absolute", inset:"-10%",
                  backgroundImage:`url(${heroPhotoUrl})`,
                  backgroundSize:"cover", backgroundPosition:"center",
                  filter:"saturate(.35) brightness(.50) contrast(1.1)",
                  willChange:"transform",
                  transform:"scale(1.08) translateY(0)",
                }}/>
              </div>
            )}

            {/* Overlay — dark, not washed out */}
            <div aria-hidden style={{
              position:"absolute", inset:0, zIndex:1,
              background:`linear-gradient(to bottom,
                rgba(8,5,7,.70) 0%,
                rgba(8,5,7,.30) 30%,
                rgba(8,5,7,.28) 60%,
                rgba(8,5,7,.78) 100%
              )`,
            }}/>

            {/* Vignette */}
            <div aria-hidden style={{
              position:"absolute", inset:0, zIndex:2,
              background:"radial-gradient(ellipse 85% 75% at 50% 50%, transparent 30%, rgba(0,0,0,.55) 100%)",
            }}/>

            {/* Content */}
            <div style={{
              position:"relative", zIndex:5,
              padding:"7rem 1.5rem 9rem",
              maxWidth:800, width:"100%",
            }}>

              {/* Eyebrow */}
              <div className="u0" style={{
                display:"flex", alignItems:"center", gap:14,
                justifyContent:"center", marginBottom:"2.5rem",
              }}>
                <div style={{ width:32, height:1, background:`rgba(190,45,69,.55)` }}/>
                <span style={{
                  fontFamily:BF, fontSize:".46rem", letterSpacing:".56em",
                  textTransform:"uppercase", color:"rgba(190,45,69,.75)", fontWeight:700,
                }}>
                  {title}
                </span>
                <div style={{ width:32, height:1, background:"rgba(190,45,69,.55)" }}/>
              </div>

              {/* Bride */}
              <h1 className="u1 uv-name" style={{
                fontFamily:DF,
                fontSize:"clamp(4.5rem,14vw,11rem)",
                fontWeight:300, lineHeight:.84,
                letterSpacing:"-.04em",
                color:"#FFFFFF",
                marginBottom:".06em",
              }}>
                {brideFirst}
              </h1>

              {/* & */}
              <p className="u2" style={{
                fontFamily:DF, fontStyle:"italic", fontWeight:300,
                fontSize:"clamp(1.2rem,3.5vw,2.5rem)",
                color:"rgba(190,45,69,.80)",
                letterSpacing:".12em", lineHeight:1.2,
                marginBottom:".06em",
              }}>
                &amp;
              </p>

              {/* Groom */}
              <h1 className="u3 uv-name" style={{
                fontFamily:DF,
                fontSize:"clamp(4.5rem,14vw,11rem)",
                fontWeight:300, lineHeight:.84,
                letterSpacing:"-.04em",
                color:"rgba(232,188,20,.88)",
                marginBottom:"2.25rem",
              }}>
                {groomFirst}
              </h1>

              {/* Thin drawing rule */}
              <div className="u4" style={{
                width:"min(200px,44%)", height:1, margin:"0 auto 2.25rem",
                background:`linear-gradient(90deg, transparent, rgba(190,45,69,.55), transparent)`,
                transformOrigin:"center",
              }}/>

              {/* Date · Venue */}
              <div className="u5" style={{
                display:"flex", flexWrap:"wrap", alignItems:"center",
                justifyContent:"center", gap:".6rem",
                marginBottom:"1.5rem",
              }}>
                {weddingDate && (
                  <span style={{
                    fontFamily:BF, fontSize:".85rem", fontWeight:500,
                    color:"rgba(255,255,255,.85)", letterSpacing:".06em",
                  }}>
                    {weddingDate}
                  </span>
                )}
                {venueName && (
                  <>
                    <span aria-hidden style={{ width:3,height:3,borderRadius:"50%",background:"rgba(190,45,69,.6)",display:"inline-block" }}/>
                    <span style={{ fontFamily:BF, fontSize:".82rem", color:"rgba(255,255,255,.55)", letterSpacing:".04em" }}>
                      {venueName}
                    </span>
                  </>
                )}
                {venueCity && (
                  <>
                    <span aria-hidden style={{ width:3,height:3,borderRadius:"50%",background:"rgba(190,45,69,.35)",display:"inline-block" }}/>
                    <span style={{ fontFamily:BF, fontSize:".82rem", color:"rgba(255,255,255,.38)", letterSpacing:".04em" }}>
                      {venueCity}
                    </span>
                  </>
                )}
              </div>

              {/* Personal tag */}
              <div className="u6" style={{ marginBottom:"2.75rem" }}>
                <span style={{
                  display:"inline-block",
                  padding:"6px 22px",
                  border:`1px solid rgba(255,255,255,.18)`,
                  borderRadius:999,
                  fontFamily:DF, fontStyle:"italic",
                  fontSize:"clamp(.82rem,2vw,.96rem)",
                  color:"rgba(255,255,255,.65)",
                  letterSpacing:".03em",
                }}>
                  A personal invitation for {guestLabel}
                </span>
              </div>

              {/* CTA */}
              <div className="u7">
                <a href="#invite-content" className="uv-link">
                  View invitation
                </a>
              </div>
            </div>

            {/* Scroll cue */}
            <div style={{
              position:"absolute", bottom:24, left:"50%",
              display:"flex", flexDirection:"column", alignItems:"center", gap:7,
              zIndex:5,
              animation:"ci-bounce 2.5s 2.5s ease-in-out infinite",
            }}>
              <span style={{
                fontFamily:BF, fontSize:".42rem", letterSpacing:".44em",
                textTransform:"uppercase", color:"rgba(255,255,255,.28)",
              }}>
                Scroll
              </span>
              <div style={{ width:1, height:32, background:"linear-gradient(to bottom, rgba(255,255,255,.35), transparent)" }}/>
              <ChevronDown size={11} style={{ color:"rgba(255,255,255,.30)", marginTop:-6 }}/>
            </div>
          </section>

          <div id="invite-content">{children}</div>
        </div>
      )}
    </>
  );
}

export default CinematicIntro;
