"use client";

/**
 * CinematicIntro — Merged Flow / Mobile-First Edition
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * PHASE FLOW (2 phases, not 3):
 *   Phase 1 · TITLE  — 6 scenes on a dark canvas, auto-advance ~16s
 *   Phase 2 · HERO   — Full-bleed photo. Monogram seal CTA sits over the image.
 *                       Clicking the seal bursts it and smooth-scrolls to content.
 *
 * WHAT CHANGED:
 *   • Merged "panel" + "unveil" into a single "hero" phase. No frosted panel
 *     screen. The guest name / monogram / CTA now live directly on the hero.
 *   • The "View invitation" link replaced with a Seal — a square monogram
 *     lockup that pulses gently. Click → burst animation → scroll to content.
 *   • Scene 2 (split names) now stacks vertically on mobile ≤520px.
 *   • Scene 4 (venue) truncates long names with a font-size clamp that
 *     scales aggressively on narrow screens.
 *   • Scene 5 (countdown) switches from a row to a 2×2 grid on mobile.
 *   • All eyebrow labels switch from letter-spacing .55em to .25em on mobile
 *     — prevents clipping.
 *   • Progress line and scene counter hidden on very small screens to save
 *     bottom chrome space.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SkipForward, VolumeX, Volume2 } from "lucide-react";
// GuestNavbar removed — the global floating Navbar pill handles all navigation

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
const VOID      = "#0A0608";

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

type Phase = "title" | "hero";

const SCENE_HOLD = [2600, 2600, 3000, 2800, 2800, 3000];
const CROSSFADE  = 600;

// ── Countdown ─────────────────────────────────────────────────────────────
function useCountdown(target?: string) {
  const [vals, setVals] = useState({ d: 0, h: 0, m: 0, label: "" });
  useEffect(() => {
    if (!target) return;
    const t: string = target;
    function tick() {
      const ms = new Date(t).getTime() - Date.now();
      if (ms <= 0) { setVals({ d: 0, h: 0, m: 0, label: "Today" }); return; }
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

  const [mounted,    setMounted]    = useState(false);
  const [phase,      setPhase]      = useState<Phase>("title");
  const [scene,      setScene]      = useState(0);
  const [sceneVis,   setSceneVis]   = useState(true);
  const [leaving,    setLeaving]    = useState(false);
  const [heroVis,    setHeroVis]    = useState(false);
  const [muted,      setMuted]      = useState(true);
  const [audioAvail, setAudioAvail] = useState<boolean | null>(audioSrc ? null : false);
  // Seal state: idle → hover → burst → gone
  const [sealState,  setSealState]  = useState<"idle" | "hover" | "burst" | "gone">("idle");

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const sceneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroRef    = useRef<HTMLElement | null>(null);

  const storageKey = `surihana-intro:${inviteCode}`;
  const cookieName = `invite_intro_seen_${inviteCode}`;

  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;
  const initials   = useMemo(
    () => `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase(),
    [brideName, groomName]
  );
  const countdown = useCountdown(weddingDate);

  // ── Mount + scroll lock ──────────────────────────────────────────────────
  // Scroll is locked from the very first render and stays locked through
  // the entire title sequence and hero phase.
  // Only the seal click unlocks it.
  // The cleanup always restores scroll so the body is never left stuck.
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow   = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow   = "";
      document.body.style.touchAction = "";
    };
  }, []);

  // ── Mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const hasCookie  = document.cookie.split(";").some(c => c.trim().startsWith(`${cookieName}=`));
    const hasSession = sessionStorage.getItem(storageKey) === "entered";
    if (hasCookie || hasSession) {
      // Returning visitor — still need to press the seal, so scroll stays locked
      setPhase("hero");
      setTimeout(() => setHeroVis(true), 80);
    }
  }, [cookieName, storageKey]);

  // ── Parallax ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "hero" || typeof window === "undefined") return;
    const fn = () => {
      const ph = heroRef.current?.querySelector<HTMLElement>(".ci-par");
      if (ph) ph.style.transform = `scale(1.08) translateY(${window.scrollY * 0.20}px)`;
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
        else goToHero();
      }, CROSSFADE);
    }, hold);
    return () => { if (sceneTimer.current) clearTimeout(sceneTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, phase]);

  // ── Audio ──────────────────────────────────────────────────────────────
  const setAudioRef = useCallback((el: HTMLAudioElement | null) => {
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

  function goToHero() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "entered");
      const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${cookieName}=1; expires=${exp}; path=/; SameSite=Lax`;
    }
    if (audioRef.current) audioRef.current.pause();
    fadeOut(() => {
      setPhase("hero");
      requestAnimationFrame(() => requestAnimationFrame(() => setHeroVis(true)));
    });
  }

  function skipToHero() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    setSceneVis(false);
    fadeOut(() => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(storageKey, "entered");
        const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${cookieName}=1; expires=${exp}; path=/; SameSite=Lax`;
      }
      if (audioRef.current) audioRef.current.pause();
      setPhase("hero");
      requestAnimationFrame(() => requestAnimationFrame(() => setHeroVis(true)));
    }, 600);
  }

  // ── Seal click ─────────────────────────────────────────────────────────
  function handleSealClick() {
    if (sealState !== "idle" && sealState !== "hover") return;
    setSealState("burst");
    setTimeout(() => {
      setSealState("gone");
      // ── Unlock scroll, then smooth-scroll to content ──
      document.body.style.overflow    = "";
      document.body.style.touchAction = "";
      const target = document.getElementById("invite-content");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 520);
  }

  if (!mounted) return <div style={{ minHeight: "100dvh", background: VOID }}>{children}</div>;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ── primitives ── */
        @keyframes ci-in-left  {from{opacity:0;transform:translateX(-8vw)} to{opacity:1;transform:translateX(0)}}
        @keyframes ci-in-right {from{opacity:0;transform:translateX(8vw)}  to{opacity:1;transform:translateX(0)}}
        @keyframes ci-in-up    {from{opacity:0;transform:translateY(3.5rem)} to{opacity:1;transform:translateY(0)}}
        @keyframes ci-in-down  {from{opacity:0;transform:translateY(-2.5rem)} to{opacity:1;transform:translateY(0)}}
        @keyframes ci-fade     {from{opacity:0} to{opacity:1}}
        @keyframes ci-line-x   {from{transform:scaleX(0)} to{transform:scaleX(1)}}
        @keyframes ci-line-y   {from{transform:scaleY(0)} to{transform:scaleY(1)}}

        .t-phase   {transition:opacity .9s cubic-bezier(.4,0,.2,1);}
        .t-leaving {opacity:0!important;pointer-events:none;}

        /* ── controls ── */
        .ci-ctrl {
          display:inline-flex;align-items:center;gap:5px;
          padding:6px 14px;border:none;background:transparent;
          color:rgba(255,255,255,.38);
          font-family:${BF};font-size:.58rem;font-weight:500;
          letter-spacing:.22em;text-transform:uppercase;cursor:pointer;
          transition:color .2s ease;
        }
        .ci-ctrl:hover{color:rgba(255,255,255,.80);}

        /* ── sound bars ── */
        @keyframes ci-bar1{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
        @keyframes ci-bar2{0%,100%{transform:scaleY(.65)}50%{transform:scaleY(.28)}}
        @keyframes ci-bar3{0%,100%{transform:scaleY(.45)}50%{transform:scaleY(.90)}}

        /* ── progress fill ── */
        @keyframes ci-prog-fill{from{width:0}to{width:100%}}

        /* ── hero stagger ── */
        .hv .h0{opacity:0;animation:ci-fade   .8s .00s ease forwards}
        .hv .h1{opacity:0;animation:ci-in-up  1.1s .14s cubic-bezier(.16,1,.3,1) forwards}
        .hv .h2{opacity:0;animation:ci-fade   .7s .28s ease forwards}
        .hv .h3{opacity:0;animation:ci-in-up  1.1s .40s cubic-bezier(.16,1,.3,1) forwards}
        .hv .h4{opacity:0;animation:ci-fade   .8s .56s ease forwards;transform-origin:center}
        .hv .h5{opacity:0;animation:ci-in-up  .9s .70s cubic-bezier(.22,1,.36,1) forwards}
        .hv .h6{opacity:0;animation:ci-in-up  .85s .84s cubic-bezier(.22,1,.36,1) forwards}
        /* Seal comes in last, after names are settled */
        .hv .h7{opacity:0;animation:ci-in-up  .80s 1.10s cubic-bezier(.34,1.56,.64,1) forwards}

        /* ── seal animations ── */
        @keyframes ci-seal-pulse {
          0%,100%{box-shadow:0 12px 36px rgba(0,0,0,.50),0 4px 10px rgba(0,0,0,.28),0 0 0 0 rgba(168,120,8,0)}
          50%    {box-shadow:0 14px 40px rgba(0,0,0,.55),0 4px 10px rgba(0,0,0,.28),0 0 0 16px rgba(168,120,8,.14)}
        }
        @keyframes ci-seal-hover {
          0%  {transform:translateY(0) scale(1) rotate(0deg)}
          100%{transform:translateY(-5px) scale(1.06) rotate(2deg)}
        }
        @keyframes ci-seal-burst {
          0%  {transform:scale(1);opacity:1;filter:brightness(1)}
          30% {transform:scale(1.22) rotate(-5deg);opacity:.85;filter:brightness(1.8)}
          60% {transform:scale(.70) rotate(10deg);opacity:.4;filter:brightness(2.5)}
          100%{transform:scale(0)  rotate(20deg);opacity:0;filter:brightness(3)}
        }
        @keyframes ci-burst-ring {
          0%  {transform:scale(0);opacity:.6}
          100%{transform:scale(3.2);opacity:0}
        }
        @keyframes ci-burst-ring2 {
          0%  {transform:scale(0);opacity:.4}
          100%{transform:scale(4.5);opacity:0}
        }

        /* ── scroll bounce ── */
        @keyframes ci-bounce{
          0%,100%{transform:translateX(-50%) translateY(0)}
          50%    {transform:translateX(-50%) translateY(8px)}
        }

        /* ═══════════════════════════════════════════════════════════════
           MOBILE OVERRIDES — applied at ≤520px
           All scenes re-tuned: smaller type, more padding, no overflow
        ═══════════════════════════════════════════════════════════════ */
        @media(max-width:520px){
          /* Scene 0 & 1 — solo name */
          .t-name-solo {
            font-size:clamp(3.8rem,18vw,7rem)!important;
            letter-spacing:-.02em!important;
            line-height:.90!important;
          }
          /* Scene 2 — hide vertical divider and stack names */
          .t-scene2-grid {
            display:flex!important;
            flex-direction:column!important;
            align-items:center!important;
            gap:0!important;
          }
          .t-scene2-grid > div {
            padding:0!important;
          }
          .t-scene2-grid .t-name-pair {
            text-align:center!important;
            font-size:clamp(3.5rem,16vw,6rem)!important;
          }
          .t-scene2-divider { display:none!important; }
          .t-scene2-amp {
            position:static!important;
            transform:none!important;
            display:block!important;
            text-align:center!important;
            font-size:clamp(1.2rem,6vw,2rem)!important;
            margin:.1em 0!important;
          }
          /* Scene 3 — date — each word smaller */
          .t-date {
            font-size:clamp(2.4rem,12vw,4.5rem)!important;
            letter-spacing:-.01em!important;
          }
          /* Scene 4 — venue — truncate and size down aggressively */
          .t-venue-name {
            font-size:clamp(1.8rem,8vw,3.5rem)!important;
            letter-spacing:.01em!important;
          }
          /* Scene 5 — countdown — wrap into 2×2 grid */
          .t-countdown-row {
            display:grid!important;
            grid-template-columns:1fr 1fr!important;
            gap:clamp(1.5rem,6vw,2.5rem) clamp(2rem,8vw,3.5rem)!important;
          }
          .t-countdown-num {
            font-size:clamp(3rem,14vw,6rem)!important;
          }
          /* Eyebrow labels — reduce letter-spacing so they don't clip */
          .t-eyebrow { letter-spacing:.22em!important; }
          /* Progress / counter — hide to save chrome */
          .t-progress-bar, .t-scene-counter { display:none!important; }
          /* Hero names */
          .h-name { font-size:clamp(3rem,14vw,7.5rem)!important; }
          /* Seal */
          .ci-seal-wrap {
            width:clamp(110px,28vw,150px)!important;
            height:clamp(110px,28vw,150px)!important;
          }
          .ci-seal-initials { font-size:clamp(2.2rem,8vw,3.5rem)!important; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 1 · TITLE SEQUENCE
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "title" && (
        <div
          className={`t-phase${leaving ? " t-leaving" : ""}`}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: VOID, overflow: "hidden" }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* Subtle warm glow */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(190,45,69,.06) 0%, transparent 70%)",
          }} />

          {/* Controls */}
          {scene >= 1 && (
            <div style={{
              position: "absolute", top: 16, right: 16, zIndex: 10,
              display: "flex", gap: 6,
              opacity: 0, animation: "ci-fade .6s .2s ease forwards",
            }}>
              {audioAvail === true && (
                <button type="button" onClick={toggleAudio} className="ci-ctrl">
                  {muted
                    ? <VolumeX size={11} />
                    : <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: 11 }}>
                        {[8, 11, 6].map((h, i) => (
                          <span key={i} style={{
                            width: 2, height: h, borderRadius: 1,
                            background: "rgba(255,255,255,.55)", transformOrigin: "bottom",
                            animation: `ci-bar${i + 1} .7s ${i * .1}s ease-in-out infinite`,
                          }} />
                        ))}
                      </span>
                  }
                  {muted ? "Sound" : "Live"}
                </button>
              )}
              <button type="button" onClick={skipToHero} className="ci-ctrl">
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

            {/* ── Scene 0: Bride, left-anchored ── */}
            {scene === 0 && (
              <div>
                <p className="t-eyebrow" style={{
                  fontFamily: BF, fontSize: ".5rem",
                  letterSpacing: ".52em", textTransform: "uppercase",
                  color: "rgba(190,45,69,.65)", fontWeight: 700,
                  marginBottom: "clamp(1.25rem,3.5vh,2.75rem)",
                  opacity: 0, animation: "ci-fade .6s .1s ease forwards",
                }}>
                  {title}
                </p>
                <h1 className="t-name-solo" style={{
                  fontFamily: DF,
                  fontSize: "clamp(5.5rem,16vw,13rem)",
                  fontWeight: 300, lineHeight: .88, letterSpacing: "-.03em",
                  color: "#FFFFFF", margin: 0, padding: 0,
                  opacity: 0, animation: "ci-in-left 1.0s .2s cubic-bezier(.16,1,.3,1) forwards",
                }}>
                  {brideFirst}.
                </h1>
                <div style={{
                  marginTop: "clamp(1.25rem,3.5vh,2.75rem)",
                  width: "min(80px,18%)", height: 1,
                  background: `linear-gradient(to right, ${ROSE}, transparent)`,
                  transformOrigin: "left",
                  opacity: 0, animation: "ci-line-x .9s .9s ease forwards",
                }} />
              </div>
            )}

            {/* ── Scene 1: Groom, right-anchored ── */}
            {scene === 1 && (
              <div style={{ textAlign: "right" }}>
                <p className="t-eyebrow" style={{
                  fontFamily: BF, fontSize: ".5rem",
                  letterSpacing: ".52em", textTransform: "uppercase",
                  color: "rgba(201,150,10,.65)", fontWeight: 700,
                  marginBottom: "clamp(1.25rem,3.5vh,2.75rem)",
                  opacity: 0, animation: "ci-fade .6s .1s ease forwards",
                }}>
                  {title}
                </p>
                <h1 className="t-name-solo" style={{
                  fontFamily: DF,
                  fontSize: "clamp(5.5rem,16vw,13rem)",
                  fontWeight: 300, lineHeight: .88, letterSpacing: "-.03em",
                  color: "rgba(232,188,20,.92)", margin: 0, padding: 0,
                  opacity: 0, animation: "ci-in-right 1.0s .2s cubic-bezier(.16,1,.3,1) forwards",
                }}>
                  {groomFirst}.
                </h1>
                <div style={{
                  marginTop: "clamp(1.25rem,3.5vh,2.75rem)",
                  width: "min(80px,18%)", height: 1, marginLeft: "auto",
                  background: "linear-gradient(to left, rgba(201,150,10,.7), transparent)",
                  transformOrigin: "right",
                  opacity: 0, animation: "ci-line-x .9s .9s ease forwards",
                }} />
              </div>
            )}

            {/* ── Scene 2: Both names — desktop split / mobile stack ── */}
            {scene === 2 && (
              <div style={{ position: "relative" }}>
                {/* Vertical divider (hidden on mobile via .t-scene2-divider) */}
                <div className="t-scene2-divider" aria-hidden style={{
                  position: "absolute",
                  left: "calc(50% - 0.5px)", top: 0, bottom: 0, width: 1,
                  background: `linear-gradient(to bottom, transparent 0%, ${ROSE} 20%, rgba(190,45,69,.5) 50%, transparent 100%)`,
                  transformOrigin: "center top",
                  opacity: 0, animation: "ci-line-y 1.0s .7s ease forwards",
                }} />

                {/* Ampersand (repositioned on mobile via .t-scene2-amp) */}
                <p className="t-scene2-amp" style={{
                  position: "absolute", left: "50%", top: "50%",
                  transform: "translate(-50%,-50%)",
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1rem,3vw,2rem)",
                  color: "rgba(190,45,69,.75)", letterSpacing: ".06em", lineHeight: 1,
                  zIndex: 2,
                  opacity: 0, animation: "ci-fade .7s .85s ease forwards",
                }}>
                  &amp;
                </p>

                <div className="t-scene2-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  <div style={{ paddingRight: "clamp(1.25rem,3.5vw,2.75rem)" }}>
                    <h1 className="t-name-pair" style={{
                      fontFamily: DF, fontSize: "clamp(4rem,11.5vw,10rem)",
                      fontWeight: 300, lineHeight: .86, letterSpacing: "-.03em",
                      color: "#FFFFFF", textAlign: "right",
                      opacity: 0, animation: "ci-in-left 1.0s .1s cubic-bezier(.16,1,.3,1) forwards",
                    }}>
                      {brideFirst}
                    </h1>
                  </div>
                  <div style={{ paddingLeft: "clamp(1.25rem,3.5vw,2.75rem)" }}>
                    <h1 className="t-name-pair" style={{
                      fontFamily: DF, fontSize: "clamp(4rem,11.5vw,10rem)",
                      fontWeight: 300, lineHeight: .86, letterSpacing: "-.03em",
                      color: "rgba(232,188,20,.90)", textAlign: "left",
                      opacity: 0, animation: "ci-in-right 1.0s .22s cubic-bezier(.16,1,.3,1) forwards",
                    }}>
                      {groomFirst}
                    </h1>
                  </div>
                </div>
              </div>
            )}

            {/* ── Scene 3: Date tabular ── */}
            {scene === 3 && (
              <div>
                <p className="t-eyebrow" style={{
                  fontFamily: BF, fontSize: ".5rem",
                  letterSpacing: ".52em", textTransform: "uppercase",
                  color: "rgba(255,255,255,.28)", fontWeight: 500,
                  marginBottom: "clamp(1.75rem,4.5vh,3.5rem)",
                  opacity: 0, animation: "ci-fade .6s .1s ease forwards",
                }}>
                  The date
                </p>
                {weddingDate && (
                  <div style={{ opacity: 0, animation: "ci-in-up 1.0s .2s cubic-bezier(.16,1,.3,1) forwards" }}>
                    <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "clamp(.5rem,2vw,1.75rem)" }}>
                      {weddingDate.split(" ").map((word, i) => (
                        <span key={i} className="t-date" style={{
                          fontFamily: DF, fontWeight: 300,
                          fontSize: "clamp(3rem,10vw,9rem)",
                          letterSpacing: "-.02em", lineHeight: .9,
                          color: i === 1 ? "#FFFFFF" : "rgba(255,255,255,.35)",
                        }}>
                          {word}
                        </span>
                      ))}
                    </div>
                    {countdown.label && (
                      <p className="t-eyebrow" style={{
                        marginTop: "clamp(1.25rem,2.5vh,2.25rem)",
                        fontFamily: BF, fontSize: ".52rem",
                        letterSpacing: ".38em", textTransform: "uppercase",
                        color: "rgba(201,150,10,.65)", fontWeight: 500,
                        opacity: 0, animation: "ci-fade .6s .9s ease forwards",
                      }}>
                        {countdown.label}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Scene 4: Both venues — cinematic split composition ── */}
            {scene === 4 && (
              <div style={{
                position: "absolute",
                bottom: "clamp(72px,12vh,130px)",
                left: "clamp(24px,6vw,80px)",
                right: "clamp(24px,6vw,80px)",
              }}>
                {/* Eyebrow */}
                <p className="t-eyebrow" style={{
                  fontFamily: BF, fontSize: ".48rem",
                  letterSpacing: ".42em", textTransform: "uppercase",
                  color: "rgba(255,255,255,.26)", fontWeight: 500,
                  marginBottom: "clamp(1.25rem,3vh,2.5rem)",
                  opacity: 0, animation: "ci-fade .6s .1s ease forwards",
                }}>
                  The venues
                  {venueCity ? ` · ${venueCity}` : ""}
                </p>

                {/* Both venues stacked */}
                <div style={{
                  display: "flex", flexDirection: "column",
                  gap: "clamp(.75rem,2vh,1.25rem)",
                  opacity: 0, animation: "ci-in-up 1.0s .22s cubic-bezier(.16,1,.3,1) forwards",
                }}>

                  {/* Church — rose accent */}
                  <div style={{ display: "flex", alignItems: "center", gap: "clamp(.625rem,2vw,1.25rem)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexShrink: 0 }}>
                      <span style={{
                        fontFamily: BF, fontSize: "clamp(.55rem,1.3vw,.68rem)",
                        fontWeight: 700, letterSpacing: ".12em",
                        color: "rgba(212,72,96,.80)", whiteSpace: "nowrap",
                      }}>3 PM</span>
                      <div style={{ width: "clamp(14px,2.5vw,24px)", height: 1, background: "rgba(212,72,96,.40)", flexShrink: 0 }} />
                    </div>
                    <p className="t-venue-name" style={{
                      fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                      fontSize: "clamp(1.5rem,5vw,4.5rem)",
                      letterSpacing: ".01em", lineHeight: 1,
                      color: "rgba(255,255,255,.92)",
                      overflowWrap: "break-word",
                    }}>
                      Divine Mercy Church
                    </p>
                  </div>

                  {/* Divider line */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: ".625rem",
                    opacity: 0, animation: "ci-fade .5s .65s ease forwards",
                  }}>
                    <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(255,255,255,.10), transparent)" }} />
                    <span style={{
                      fontFamily: BF, fontSize: ".42rem", letterSpacing: ".28em",
                      textTransform: "uppercase", color: "rgba(255,255,255,.18)", fontWeight: 500,
                    }}>then</span>
                    <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, rgba(255,255,255,.10), transparent)" }} />
                  </div>

                  {/* Beach — gold accent */}
                  <div style={{ display: "flex", alignItems: "center", gap: "clamp(.625rem,2vw,1.25rem)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexShrink: 0 }}>
                      <span style={{
                        fontFamily: BF, fontSize: "clamp(.55rem,1.3vw,.68rem)",
                        fontWeight: 700, letterSpacing: ".12em",
                        color: "rgba(201,150,10,.80)", whiteSpace: "nowrap",
                      }}>6 PM</span>
                      <div style={{ width: "clamp(14px,2.5vw,24px)", height: 1, background: "rgba(201,150,10,.40)", flexShrink: 0 }} />
                    </div>
                    <p className="t-venue-name" style={{
                      fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                      fontSize: "clamp(1.5rem,5vw,4.5rem)",
                      letterSpacing: ".01em", lineHeight: 1,
                      color: "rgba(232,188,20,.80)",
                      overflowWrap: "break-word",
                    }}>
                      Blue Bay Beach Resort
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* ── Scene 5: Countdown columns (2×2 grid on mobile) ── */}
            {scene === 5 && (
              <div>
                <p className="t-eyebrow" style={{
                  fontFamily: BF, fontSize: ".5rem",
                  letterSpacing: ".48em", textTransform: "uppercase",
                  color: "rgba(255,255,255,.25)", fontWeight: 500,
                  marginBottom: "clamp(2rem,5vh,4.5rem)",
                  opacity: 0, animation: "ci-fade .6s .1s ease forwards",
                }}>
                  Until the ceremony
                </p>
                <div className="t-countdown-row" style={{
                  display: "flex", alignItems: "flex-start",
                  gap: "clamp(1.75rem,5.5vw,4.5rem)",
                  opacity: 0, animation: "ci-in-up 1.0s .2s cubic-bezier(.16,1,.3,1) forwards",
                }}>
                  {[
                    { n: countdown.d, label: "Days",    hi: true  },
                    { n: countdown.h, label: "Hours",   hi: false },
                    { n: countdown.m, label: "Minutes", hi: false },
                  ].map(({ n, label, hi }) => (
                    <div key={label}>
                      <div className="t-countdown-num" style={{
                        fontFamily: DF, fontWeight: 300,
                        fontSize: "clamp(3.5rem,11vw,10rem)",
                        lineHeight: .88, letterSpacing: "-.03em",
                        color: hi ? "#FFFFFF" : "rgba(255,255,255,.30)",
                      }}>
                        {pad(n)}
                      </div>
                      <div className="t-eyebrow" style={{
                        marginTop: ".7rem",
                        fontFamily: BF, fontSize: ".44rem",
                        letterSpacing: ".40em", textTransform: "uppercase",
                        color: hi ? "rgba(190,45,69,.70)" : "rgba(255,255,255,.18)",
                        fontWeight: 600,
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
          <div className="t-progress-bar" style={{
            position: "absolute",
            bottom: "clamp(28px,4.5vh,48px)",
            left: "clamp(24px,6vw,80px)", right: "clamp(24px,6vw,80px)",
            height: 1, background: "rgba(255,255,255,.08)", borderRadius: 1,
          }}>
            <div style={{
              position: "absolute", inset: "0 auto 0 0",
              background: scene < 2 ? ROSE : "rgba(201,150,10,.8)",
              borderRadius: 1,
              animation: `ci-prog-fill ${SCENE_HOLD[scene] ?? 2800}ms linear forwards`,
            }} />
          </div>

          {/* Scene counter */}
          <div className="t-scene-counter" style={{
            position: "absolute",
            bottom: "clamp(24px,4vh,44px)", right: "clamp(24px,6vw,80px)",
            fontFamily: BF, fontSize: ".42rem", letterSpacing: ".28em",
            color: "rgba(255,255,255,.18)", textTransform: "uppercase",
          }}>
            {String(scene + 1).padStart(2, "0")} / {String(SCENE_HOLD.length).padStart(2, "0")}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 2 · HERO  (merged panel + unveil)
          The hero IS the invitation. The seal IS the CTA.
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "hero" && (
        <div className={heroVis ? "hv" : ""}>
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
            {/* Full-bleed photo — brighter, more saturated for light theme */}
            {heroPhotoUrl && (
              <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
                <div className="ci-par" style={{
                  position: "absolute", inset: "-10%",
                  backgroundImage: `url(${heroPhotoUrl})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  filter: "saturate(.55) brightness(.82) contrast(1.04)",
                  willChange: "transform",
                  transform: "scale(1.08) translateY(0)",
                }} />
              </div>
            )}

            {/* Warm cream wash — lets the photo read through, not drowned */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 1,
              background: `linear-gradient(to bottom,
                rgba(253,248,242,.88) 0%,
                rgba(253,248,242,.62) 18%,
                rgba(253,248,242,.52) 42%,
                rgba(253,248,242,.72) 68%,
                rgba(251,243,236,.96) 100%)`,
            }} />

            {/* Warm side vignette — not black, warm linen */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 2,
              background: "radial-gradient(ellipse 90% 78% at 50% 50%, transparent 35%, rgba(241,233,224,.45) 100%)",
            }} />

            {/* Subtle rose + gold ambient blooms */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
              background: `
                radial-gradient(ellipse 55% 44% at 12% 20%, rgba(190,45,69,.05) 0%, transparent 55%),
                radial-gradient(ellipse 45% 40% at 88% 80%, rgba(168,120,8,.04) 0%, transparent 50%)
              `,
            }} />

            {/* Content */}
            <div style={{
              position: "relative", zIndex: 5,
              padding: "7rem 1.5rem 9rem",
              maxWidth: 820, width: "100%",
            }}>

              {/* Eyebrow */}
              <div className="h0" style={{
                display: "flex", alignItems: "center", gap: 12,
                justifyContent: "center", marginBottom: "2.25rem",
              }}>
                <div style={{ width: 28, height: 1, background: `linear-gradient(to right, transparent, ${ROSE_MID})` }} />
                <span style={{
                  fontFamily: BF, fontSize: ".44rem", letterSpacing: ".50em",
                  textTransform: "uppercase", color: ROSE, fontWeight: 700,
                }}>
                  {title}
                </span>
                <div style={{ width: 28, height: 1, background: `linear-gradient(to left, transparent, ${ROSE_MID})` }} />
              </div>

              {/* Bride name — dark ink on light wash */}
              <h1 className="h1 h-name" style={{
                fontFamily: DF,
                fontSize: "clamp(4rem,13vw,11rem)",
                fontWeight: 300, lineHeight: .84, letterSpacing: "-.04em",
                color: INK, marginBottom: ".05em",
              }}>
                {brideFirst}
              </h1>

              {/* & */}
              <p className="h2" style={{
                fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                fontSize: "clamp(1.1rem,3.2vw,2.4rem)",
                color: ROSE,
                letterSpacing: ".12em", lineHeight: 1.2, marginBottom: ".05em",
              }}>
                &amp;
              </p>

              {/* Groom name */}
              <h1 className="h3 h-name" style={{
                fontFamily: DF,
                fontSize: "clamp(4rem,13vw,11rem)",
                fontWeight: 300, lineHeight: .84, letterSpacing: "-.04em",
                color: INK_2, marginBottom: "2rem",
              }}>
                {groomFirst}
              </h1>

              {/* Drawing rule */}
              <div className="h4" style={{
                width: "min(180px,40%)", height: 1, margin: "0 auto 2rem",
                background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)`,
                transformOrigin: "center",
              }} />

              {/* Date · both venues */}
              <div className="h5" style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: ".75rem", marginBottom: "1.375rem",
              }}>
                {/* Date row */}
                {weddingDate && (
                  <span style={{
                    fontFamily: BF, fontSize: ".82rem", fontWeight: 600,
                    color: INK, letterSpacing: ".05em",
                  }}>
                    {weddingDate}
                  </span>
                )}

                {/* Two venue chips — rose for church, gold for beach */}
                <div style={{
                  display: "flex", flexWrap: "wrap",
                  justifyContent: "center", gap: ".5rem",
                }}>
                  {/* Church */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 14px", borderRadius: 999,
                    background: "rgba(190,45,69,.07)",
                    border: "1px solid rgba(190,45,69,.18)",
                    fontFamily: BF, fontSize: ".62rem", fontWeight: 600,
                    color: INK_2, letterSpacing: ".03em",
                  }}>
                    {/* Cross micro-icon */}
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <line x1="5" y1="0" x2="5" y2="10" stroke={ROSE} strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="1" y1="3.5" x2="9" y2="3.5" stroke={ROSE} strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <span>Divine Mercy Church</span>
                    <span style={{ color: ROSE, fontWeight: 700, opacity: .8 }}>· 3 PM</span>
                  </span>

                  {/* Beach */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 14px", borderRadius: 999,
                    background: "rgba(168,120,8,.07)",
                    border: "1px solid rgba(168,120,8,.18)",
                    fontFamily: BF, fontSize: ".62rem", fontWeight: 600,
                    color: INK_2, letterSpacing: ".03em",
                  }}>
                    {/* Wave micro-icon */}
                    <svg width="14" height="7" viewBox="0 0 14 7" fill="none" aria-hidden>
                      <path d="M0.5 4 Q2 1 3.5 4 Q5 7 6.5 4 Q8 1 9.5 4 Q11 7 12.5 4" stroke={GOLD_L} strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    </svg>
                    <span>Blue Bay Beach Resort</span>
                    <span style={{ color: GOLD_L, fontWeight: 700, opacity: .85 }}>· 6 PM</span>
                  </span>
                </div>
              </div>

              {/* Guest tag */}
              <div className="h6" style={{ marginBottom: "clamp(2.5rem,5vh,3.5rem)" }}>
                <span style={{
                  display: "inline-block", padding: "6px 22px",
                  border: `1px solid ${BDR_MD}`, borderRadius: 999,
                  fontFamily: DF, fontStyle: "italic",
                  fontSize: "clamp(.78rem,1.9vw,.92rem)",
                  color: ROSE, letterSpacing: ".03em",
                  background: ROSE_PALE,
                }}>
                  A personal invitation for {guestLabel}
                </span>
              </div>

              {/* ── THE SEAL CTA ── */}
              <div className="h7" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>

                {/* Seal container */}
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>

                  {/* Burst rings — visible during burst state */}
                  {sealState === "burst" && (
                    <>
                      <div aria-hidden style={{
                        position: "absolute", inset: 0, borderRadius: "50%",
                        border: `1.5px solid ${ROSE_L}`,
                        animation: "ci-burst-ring .52s ease forwards",
                        pointerEvents: "none",
                      }} />
                      <div aria-hidden style={{
                        position: "absolute", inset: 0, borderRadius: "50%",
                        border: `1px solid rgba(201,150,10,.6)`,
                        animation: "ci-burst-ring2 .65s .08s ease forwards",
                        pointerEvents: "none",
                      }} />
                    </>
                  )}

                  {/* The seal itself */}
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
                        borderRadius: "50%",
                        overflow: "hidden",
                        cursor: "pointer",
                        // box-shadow on a border-radius:50% div is always
                        // circular — no rectangular filter region ever.
                        boxShadow: sealState === "burst"
                          ? "none"
                          : "0 12px 36px rgba(0,0,0,.52), 0 4px 10px rgba(0,0,0,.30), 0 1px 3px rgba(0,0,0,.18)",
                        animation:
                          sealState === "idle"  ? "ci-seal-pulse 3.8s 1.2s ease-in-out infinite" :
                          sealState === "hover" ? "ci-seal-hover .3s ease forwards" :
                          sealState === "burst" ? "ci-seal-burst .52s ease forwards" :
                          "none",
                      }}
                    >
                      {/*
                        WAX SEAL — SVG clipped by the parent div's border-radius:50%.
                        No filter on the SVG or any <g> — shadow lives on the
                        wrapper div via box-shadow so there is never a rectangular
                        compositing region. The SVG viewBox fills the div edge-to-edge
                        so the disc clips cleanly to the circle.
                      */}
                      <svg
                        viewBox="0 0 160 160"
                        width="100%" height="100%"
                        style={{ display: "block" }}
                        aria-hidden
                      >
                        <defs>
                          <radialGradient id="sealGold" cx="38%" cy="34%" r="68%">
                            <stop offset="0%"   stopColor="#F5D47A" />
                            <stop offset="35%"  stopColor="#C9960A" />
                            <stop offset="68%"  stopColor="#9E7205" />
                            <stop offset="100%" stopColor="#5C3D01" />
                          </radialGradient>
                          <radialGradient id="sealSheen" cx="34%" cy="28%" r="52%">
                            <stop offset="0%"   stopColor="rgba(255,248,210,.32)" />
                            <stop offset="100%" stopColor="rgba(255,248,210,0)" />
                          </radialGradient>
                        </defs>
                        {/* Wax body — fills to edge, clipped by parent div */}
                        <circle cx="80" cy="80" r="80" fill="url(#sealGold)" />
                        {/* 16 radial ridges */}
                        {Array.from({ length: 16 }, (_, i) => {
                          const a = (i / 16) * Math.PI * 2;
                          return (
                            <line
                              key={i}
                              x1={80 + 64 * Math.cos(a)} y1={80 + 64 * Math.sin(a)}
                              x2={80 + 79 * Math.cos(a)} y2={80 + 79 * Math.sin(a)}
                              stroke="rgba(60,35,0,.30)" strokeWidth="1.4"
                            />
                          );
                        })}
                        {/* Inner debossed border */}
                        <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(60,35,0,.28)" strokeWidth="1.4" />
                        {/* Second inner ring */}
                        <circle cx="80" cy="80" r="53" fill="none" stroke="rgba(60,35,0,.18)" strokeWidth=".8" />
                        {/* Dome sheen */}
                        <circle cx="80" cy="80" r="80" fill="url(#sealSheen)" />
                      </svg>
                      {/* Initials — overlay on top of SVG */}
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span className="ci-seal-initials" style={{
                          fontFamily: DF, fontWeight: 600,
                          fontSize: "clamp(2.6rem,6.5vw,4.4rem)",
                          letterSpacing: ".14em",
                          color: "rgba(28,14,0,.80)",
                          lineHeight: 1, marginLeft: ".14em",
                          textShadow: "0 1px 0 rgba(255,240,160,.45), 0 -1px 4px rgba(0,0,0,.30)",
                        }}>
                          {initials}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instruction label below seal */}
                {sealState !== "gone" && (
                  <p style={{
                    fontFamily: BF, fontSize: ".48rem",
                    letterSpacing: ".34em", textTransform: "uppercase",
                    color: INK_4, fontWeight: 500,
                  }}>
                    {sealState === "burst" ? "Opening…" : "Press to enter"}
                  </p>
                )}
              </div>
            </div>

            {/* Scroll cue — appears after seal is gone */}
            {sealState === "gone" && (
              <div style={{
                position: "absolute", bottom: 24, left: "50%",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                zIndex: 5, animation: "ci-bounce 2.5s ease-in-out infinite",
              }}>
                <span style={{
                  fontFamily: BF, fontSize: ".40rem", letterSpacing: ".42em",
                  textTransform: "uppercase", color: INK_4,
                }}>
                  Scroll
                </span>
                <div style={{ width: 1, height: 30, background: `linear-gradient(to bottom, ${ROSE_MID}, transparent)` }} />
                <ChevronDown size={11} style={{ color: ROSE_MID, marginTop: -5 }} />
              </div>
            )}
          </section>

          {/* ── PERSONAL MESSAGE ── first thing visible after seal pops ── */}
          <div id="invite-content">

            {/* ── Couple identity strip — anchors the guest after the seal ── */}
            <div style={{
              borderBottom: "1px solid rgba(190,45,69,.10)",
              background: "rgba(253,250,247,.94)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              padding: "clamp(.875rem,2vh,1.125rem) clamp(1.25rem,5vw,5rem)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                <span style={{
                  fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif",
                  fontSize: "clamp(.875rem,2.5vw,1.05rem)",
                  fontWeight: 700,
                  color: "var(--ink,#120B0E)",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {brideFirst} &amp; {groomFirst}
                </span>
                <span style={{
                  fontFamily: "var(--font-body),'Manrope',system-ui,sans-serif",
                  fontSize: ".60rem",
                  letterSpacing: ".28em",
                  textTransform: "uppercase",
                  color: "var(--ink-4,#A88888)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {weddingDate ?? ""}{", " }{venueName ?? ""}
                </span>
              </div>
            </div>

            <section style={{
              background: BG_LINEN,
              borderBottom: `1px solid rgba(190,45,69,.10)`,
              padding: "clamp(3.5rem,8vh,6rem) clamp(1.5rem,6vw,5rem)",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Warm ambient bloom */}
              <div aria-hidden style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 70% 55% at 15% 50%, rgba(190,45,69,.04) 0%, transparent 60%)",
              }} />

              <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>

                {/* Eyebrow */}
                <p style={{
                  fontFamily: BF, fontSize: ".5rem",
                  letterSpacing: ".46em", textTransform: "uppercase",
                  color: ROSE, fontWeight: 700,
                  marginBottom: "clamp(1.75rem,4vh,3rem)",
                }}>
                  A personal welcome
                </p>

                {/* Letter body — left-border rule, italic serif */}
                <div style={{
                  borderLeft: `3px solid rgba(190,45,69,.25)`,
                  paddingLeft: "clamp(1.25rem,3.5vw,2.25rem)",
                }}>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(1rem,2.4vw,1.18rem)",
                    color: INK, lineHeight: 1.95,
                    marginBottom: ".5em",
                  }}>
                    Dear {guestLabel},
                  </p>
                  <p style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(1rem,2.4vw,1.18rem)",
                    color: INK_2, lineHeight: 1.95,
                  }}>
                    {brideFirst} and {groomFirst} warmly invite you to witness
                    and celebrate their union — first at the Holy Matrimony at{" "}
                    <em>Divine Mercy Church, Kelambakkam</em> at 3 in the afternoon,
                    and then as the sun sets over the Bay of Bengal, at the Shoreline Reception
                    at <em>Blue Bay Beach Resort, Mahabalipuram</em>.
                    You are not just a guest — you are part of the story that brought them here.
                  </p>
                </div>

                {/* Signature */}
                <div style={{
                  marginTop: "clamp(1.75rem,4vh,3rem)",
                  display: "flex", alignItems: "center", gap: "clamp(.875rem,2.5vw,1.5rem)",
                }}>
                  <div style={{
                    width: "min(40px,10%)", height: 1,
                    background: `linear-gradient(to right, rgba(190,45,69,.38), transparent)`,
                    flexShrink: 0,
                  }} />
                  <p style={{
                    fontFamily: DF, fontStyle: "italic", fontWeight: 400,
                    fontSize: "clamp(.95rem,2.2vw,1.1rem)",
                    color: INK_3, letterSpacing: ".02em",
                  }}>
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

export default CinematicIntro;
