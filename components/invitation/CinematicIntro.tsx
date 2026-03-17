"use client";

/**
 * CinematicIntro — 10/10 luxury rebuild
 *
 * ═══ FLOW ════════════════════════════════════════════════════════════════════
 *
 *  PHASE 1 · TEASER   (auto-plays ~14 s, no interaction)
 *    A slow, emotionally-paced cinematic sequence on a deep dark canvas.
 *    Five scenes crossfade into each other:
 *      0 → celebration title + ornamental rule draw
 *      1 → "The bride" label + Marion sweeps up large
 *      2 → "&" + "The groom" label + Livingston sweeps up
 *      3 → "Together forever" italic quote + date + venue
 *      4 → Full reveal — both names side by side + gold particles peak
 *    Progress bar at bottom. Skip button top-right from scene 1.
 *    Automatically dissolves into Phase 2.
 *
 *  PHASE 2 · ENVELOPE  (interactive, warm platform theme)
 *    A physical-feeling sealed envelope is centred on a warm linen screen.
 *    The wax seal bears the couple's initials and pulses gently.
 *    Guest name written elegantly above the envelope.
 *    ONE large "Open your invitation" CTA below — this is the moment.
 *    Clicking it triggers an upward unfold animation then dissolves to hero.
 *
 *  PHASE 3 · HERO  (full-viewport, dark, photo backdrop)
 *    Staggered reveal of couple names, date, venue, personal tag, CTA.
 *    Scroll hint bounces at the bottom.
 *    The full invite page content scrolls beneath.
 *
 *  RETURNING GUESTS
 *    30-day cookie + sessionStorage → skip to Phase 3 hero instantly.
 *
 * ═════════════════════════════════════════════════════════════════════════════
 */

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SkipForward, Volume2, VolumeX } from "lucide-react";

// ── Platform design tokens ─────────────────────────────────────────────────
const ROSE   = "#C0364A";
const ROSE_H = "#A82C3E";
const GOLD   = "#B8820A";
const GOLD_L = "#D4A020";
const GOLD_P = "rgba(184,130,10,.12)";
const INK    = "#1A1012";
const INK2   = "#3D2530";
const INK3   = "#7A5460";
const WARM   = "#FAF8F6";
const LINEN  = "#F4EFE9";
const BDR    = "#E4D8D4";
const BDR_M  = "#D0C0BC";
const ONYX   = "#0A0608";
const CREAM  = "#F0E8DC";

const DF = "var(--font-display), 'Cormorant Garamond', Georgia, serif";
const BF = "var(--font-body), system-ui, -apple-system, sans-serif";

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

type Phase = "teaser" | "envelope" | "hero";

// ── Stable particles (deterministic so no hydration mismatch) ────────────
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id:    i,
  left:  `${4 + (i * 4.2) % 92}%`,
  size:  1.5 + (i % 4) * 0.8,
  dur:   12 + (i % 7) * 2.5,
  delay: (i * 1.3) % 9,
}));

// ── Scene config ───────────────────────────────────────────────────────────
// Each scene stays on screen for this many ms before crossfading to next
const SCENE_HOLD = [3000, 2800, 2800, 2600, 3000]; // 5 scenes, ~15 s total
const CROSSFADE  = 800;  // ms for scene crossfade

// ═══════════════════════════════════════════════════════════════════════════
export function CinematicIntro({
  inviteCode, guestLabel, brideName, groomName,
  title, subtitle, weddingDate, venueName, venueCity,
  heroPhotoUrl, audioSrc = "/audio/wedding-theme.mp3", children,
}: CinematicIntroProps) {

  const [isMounted,    setIsMounted]    = useState(false);
  const [phase,        setPhase]        = useState<Phase>("teaser");
  const [scene,        setScene]        = useState(0);          // teaser scene 0-4
  const [sceneVisible, setSceneVisible] = useState(true);       // controls crossfade
  const [phaseLeaving, setPhaseLeaving] = useState(false);      // phase fade-out
  const [heroVisible,  setHeroVisible]  = useState(false);
  const [isMuted,      setIsMuted]      = useState(true);
  const [audioAvail,   setAudioAvail]   = useState<boolean | null>(audioSrc ? null : false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);      // envelope unfold anim

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const sceneTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageKey  = `surihana-intro:${inviteCode}`;
  const cookieName  = `invite_intro_seen_${inviteCode}`;

  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;
  const initials   = useMemo(() =>
    `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase(),
    [brideName, groomName]
  );

  // ── Mount — check returning visitor ──────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === "undefined") return;
    const hasCookie  = document.cookie.split(";").some(c => c.trim().startsWith(`${cookieName}=`));
    const hasSession = sessionStorage.getItem(storageKey) === "entered";
    if (hasCookie || hasSession) {
      setPhase("hero");
      setTimeout(() => setHeroVisible(true), 100);
    }
  }, [cookieName, storageKey]);

  // ── Teaser auto-advance ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "teaser") return;
    const hold = SCENE_HOLD[scene] ?? 3000;
    sceneTimer.current = setTimeout(() => {
      // Fade current scene out
      setSceneVisible(false);
      setTimeout(() => {
        if (scene < SCENE_HOLD.length - 1) {
          setScene(s => s + 1);
          setSceneVisible(true);
        } else {
          // Last scene done → go to envelope
          goToEnvelope();
        }
      }, CROSSFADE);
    }, hold);
    return () => { if (sceneTimer.current) clearTimeout(sceneTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, phase]);

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
  function fadePhaseOut(cb: () => void) {
    setPhaseLeaving(true);
    setTimeout(() => {
      setPhaseLeaving(false);
      cb();
    }, 800);
  }

  function goToEnvelope() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    fadePhaseOut(() => setPhase("envelope"));
  }

  function skipToEnvelope() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    setSceneVisible(false);
    fadePhaseOut(() => {
      setPhase("envelope");
    });
  }

  function openInvitation() {
    // Persist
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "entered");
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${cookieName}=1; expires=${expires}; path=/; SameSite=Lax`;
    }
    if (audioRef.current) audioRef.current.pause();
    // Trigger envelope open animation first, then transition
    setEnvelopeOpen(true);
    setTimeout(() => {
      fadePhaseOut(() => {
        setPhase("hero");
        requestAnimationFrame(() => requestAnimationFrame(() => setHeroVisible(true)));
      });
    }, 600);
  }

  // ── SSR guard ──────────────────────────────────────────────────────────────
  if (!isMounted) {
    return (
      <div style={{ minHeight: "100dvh", background: ONYX }}>
        {children}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ═══ KEYFRAMES ═══════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Core animation primitives ── */
        @keyframes ci-fadeIn  { from{opacity:0}                              to{opacity:1} }
        @keyframes ci-fadeOut { from{opacity:1}                              to{opacity:0} }
        @keyframes ci-riseIn  { from{opacity:0;transform:translateY(32px)}   to{opacity:1;transform:translateY(0)} }
        @keyframes ci-sinkIn  { from{opacity:0;transform:translateY(-24px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes ci-scaleIn { from{opacity:0;transform:scale(.92)}         to{opacity:1;transform:scale(1)} }
        @keyframes ci-lineGrow{ from{transform:scaleX(0)}                    to{transform:scaleX(1)} }
        @keyframes ci-lineGrowFade { from{transform:scaleX(0);opacity:0}     to{transform:scaleX(1);opacity:1} }

        /* ── Ambient / atmosphere ── */
        @keyframes ci-glow    { 0%,100%{opacity:.35} 50%{opacity:.65} }
        @keyframes ci-breathe { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:.8;transform:scale(1.04)} }
        @keyframes ci-zoom    { 0%{transform:scale(1.00)} 100%{transform:scale(1.08)} }

        /* ── Particles ── */
        @keyframes ci-rise {
          0%  {transform:translateY(108vh) scale(.4);opacity:0}
          6%  {opacity:.5}
          88% {opacity:.15}
          100%{transform:translateY(-5vh) scale(1.15);opacity:0}
        }

        /* ── Envelope unfold ── */
        @keyframes ci-flapOpen {
          0%  {transform:rotateX(0deg)}
          100%{transform:rotateX(-180deg)}
        }
        @keyframes ci-cardRise {
          0%  {opacity:0;transform:translateY(40px) scale(.96)}
          100%{opacity:1;transform:translateY(0) scale(1)}
        }

        /* ── Wax seal pulse ── */
        @keyframes ci-sealGlow {
          0%,100%{box-shadow:0 0 0 0 rgba(184,130,10,0),0 6px 24px rgba(0,0,0,.4)}
          50%    {box-shadow:0 0 0 10px rgba(184,130,10,.12),0 6px 24px rgba(0,0,0,.45)}
        }

        /* ── Scroll bounce ── */
        @keyframes ci-bounce {
          0%,100%{transform:translateX(-50%) translateY(0)}
          50%    {transform:translateX(-50%) translateY(8px)}
        }

        /* ── Hero reveals ── */
        .ci-h0,.ci-h1,.ci-h2,.ci-h3,.ci-h4,.ci-h5,.ci-h6,.ci-h7,.ci-h8 { opacity:0; }
        .ci-vis .ci-h0 { animation:ci-riseIn .9s .05s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h1 { animation:ci-riseIn 1.0s .22s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h2 { animation:ci-riseIn 1.0s .40s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h3 { animation:ci-riseIn 1.0s .58s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h4 { animation:ci-riseIn .9s  .74s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h5 { animation:ci-riseIn .9s  .90s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h6 { animation:ci-riseIn .9s 1.06s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h7 { animation:ci-riseIn .8s 1.20s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h8 { animation:ci-riseIn .8s 1.34s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-hl {
          transform-origin:center;
          animation:ci-lineGrowFade 1.1s .46s ease forwards;
        }

        /* ── Phase fade transition ── */
        .ci-phase { transition:opacity .8s ease; }
        .ci-leaving { opacity:0 !important; pointer-events:none; }

        /* ── Envelope / card button ── */
        .ci-open-btn {
          width:100%;
          padding:17px;
          background:${ROSE};
          border:none;
          border-radius:14px;
          color:#fff;
          font-family:${BF};
          font-size:.82rem;
          font-weight:700;
          letter-spacing:.22em;
          text-transform:uppercase;
          cursor:pointer;
          box-shadow:0 10px 32px rgba(192,54,74,.30);
          transition:background .22s ease, transform .18s ease, box-shadow .20s ease;
          position:relative;
          overflow:hidden;
        }
        .ci-open-btn:hover {
          background:${ROSE_H};
          transform:translateY(-2px);
          box-shadow:0 16px 40px rgba(192,54,74,.38);
        }
        .ci-open-btn:active {
          transform:translateY(0);
        }
        /* Shimmer sweep on button */
        .ci-open-btn::after {
          content:'';
          position:absolute;
          inset:0;
          background:linear-gradient(105deg, transparent 40%, rgba(255,255,255,.18) 50%, transparent 60%);
          background-size:200% 100%;
          background-position:200% 0;
          animation:ci-btnShimmer 2.8s 1.2s ease infinite;
        }
        @keyframes ci-btnShimmer {
          0%  {background-position:200% 0}
          40% {background-position:-200% 0}
          100%{background-position:-200% 0}
        }

        /* Mobile safety */
        @media (max-width:480px) {
          .ci-scene-text { font-size:clamp(3.2rem,15vw,6rem) !important; }
          .ci-card-pad { padding:1.5rem !important; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 1 · TEASER
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "teaser" && (
        <div
          className={`ci-phase${phaseLeaving ? " ci-leaving" : ""}`}
          style={{
            position:"fixed", inset:0, zIndex:9999,
            background:ONYX,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            overflow:"hidden",
          }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* Atmospheric radial glow — platform rose + gold */}
          <div aria-hidden style={{
            position:"absolute", inset:0,
            background:`
              radial-gradient(ellipse 80% 55% at 22% 32%, rgba(192,54,74,.10) 0%, transparent 60%),
              radial-gradient(ellipse 70% 50% at 82% 72%, rgba(184,130,10,.09) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 50% 50%, rgba(80,20,30,.15) 0%, transparent 70%)
            `,
            animation:"ci-breathe 10s ease-in-out infinite",
          }} />

          {/* Letterbox bars — cinematic 2.35:1 feel */}
          <div aria-hidden style={{
            position:"absolute", top:0, left:0, right:0,
            height:"clamp(44px,8.5vh,86px)",
            background:"linear-gradient(to bottom, rgba(5,3,2,.97), rgba(5,3,2,.55))",
            zIndex:6,
          }} />
          <div aria-hidden style={{
            position:"absolute", bottom:0, left:0, right:0,
            height:"clamp(44px,8.5vh,86px)",
            background:"linear-gradient(to top, rgba(5,3,2,.97), rgba(5,3,2,.55))",
            zIndex:6,
          }} />

          {/* Radial vignette */}
          <div aria-hidden style={{
            position:"absolute", inset:0,
            background:"radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.68) 100%)",
            zIndex:3,
          }} />

          {/* Gold particle field */}
          {PARTICLES.map(p => (
            <div key={p.id} aria-hidden style={{
              position:"absolute", bottom:"-8px", left:p.left,
              width:p.size, height:p.size, borderRadius:"50%",
              background:GOLD_L, opacity:0,
              animation:`ci-rise ${p.dur}s ${p.delay}s linear infinite`,
            }} />
          ))}

          {/* Controls — appear from scene 1 */}
          {scene >= 1 && (
            <div style={{
              position:"absolute", top:"clamp(48px,9.5vh,92px)", right:16, zIndex:10,
              display:"flex", gap:8,
              opacity:0, animation:"ci-fadeIn .8s .3s ease forwards",
            }}>
              {audioAvail === true && (
                <button type="button" onClick={toggleMusic} style={{
                  display:"flex", alignItems:"center", gap:5, padding:"7px 13px",
                  background:"transparent", border:"1px solid rgba(184,130,10,.28)",
                  borderRadius:2, color:"rgba(184,130,10,.58)", fontSize:10,
                  letterSpacing:".28em", textTransform:"uppercase", fontFamily:BF, cursor:"pointer",
                }}>
                  {isMuted ? <VolumeX size={12}/> : <Volume2 size={12}/>}
                  {isMuted ? "Music" : "Mute"}
                </button>
              )}
              <button type="button" onClick={skipToEnvelope} style={{
                display:"flex", alignItems:"center", gap:5, padding:"7px 13px",
                background:"transparent", border:"1px solid rgba(184,130,10,.20)",
                borderRadius:2, color:"rgba(184,130,10,.42)", fontSize:10,
                letterSpacing:".28em", textTransform:"uppercase", fontFamily:BF, cursor:"pointer",
              }}>
                <SkipForward size={11}/> Skip
              </button>
            </div>
          )}

          {/* ── SCENE STAGE ── */}
          <div style={{
            position:"relative", zIndex:5,
            textAlign:"center", padding:"0 clamp(20px,6vw,80px)",
            width:"100%", maxWidth:700,
            opacity: sceneVisible ? 1 : 0,
            transition:`opacity ${CROSSFADE}ms ease`,
          }}>

            {/* Scene 0 — Title reveal */}
            {scene === 0 && (
              <div style={{ animation:"ci-scaleIn 1.2s .1s cubic-bezier(.22,1,.36,1) both", opacity:0 }}>
                <p style={{
                  fontFamily:BF, fontSize:"clamp(.5rem,1.4vw,.62rem)",
                  letterSpacing:".52em", textTransform:"uppercase",
                  color:`rgba(184,130,10,.72)`, fontWeight:700, marginBottom:"1.75rem",
                }}>
                  {title}
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:18, justifyContent:"center", marginBottom:"1.75rem" }}>
                  <div style={{
                    flex:1, maxWidth:90, height:1,
                    background:`linear-gradient(to right, transparent, ${GOLD})`,
                    transformOrigin:"left",
                    animation:"ci-lineGrow 1.2s .6s ease both",
                  }} />
                  <span style={{ color:GOLD, fontSize:18, lineHeight:1 }}>✦</span>
                  <div style={{
                    flex:1, maxWidth:90, height:1,
                    background:`linear-gradient(to left, transparent, ${GOLD})`,
                    transformOrigin:"right",
                    animation:"ci-lineGrow 1.2s .6s ease both",
                  }} />
                </div>
                <p style={{
                  fontFamily:DF, fontStyle:"italic", fontWeight:300,
                  fontSize:"clamp(1.1rem,3.2vw,1.6rem)",
                  color:"rgba(240,232,220,.52)", letterSpacing:".04em",
                  animation:"ci-riseIn 1s .8s ease both", opacity:0,
                }}>
                  A love story worth celebrating
                </p>
              </div>
            )}

            {/* Scene 1 — Bride */}
            {scene === 1 && (
              <div>
                <p style={{
                  fontFamily:BF, fontSize:"clamp(.46rem,1.1vw,.56rem)",
                  letterSpacing:".46em", textTransform:"uppercase",
                  color:"rgba(192,54,74,.62)", marginBottom:".875rem",
                  animation:"ci-sinkIn .9s .1s ease both", opacity:0,
                }}>
                  The bride
                </p>
                <h1 className="ci-scene-text" style={{
                  fontFamily:DF,
                  fontSize:"clamp(4rem,13vw,8.5rem)",
                  fontWeight:700, lineHeight:.87, letterSpacing:"-0.03em",
                  color:"#FFFFFF",
                  textShadow:"0 4px 60px rgba(0,0,0,.65), 0 0 100px rgba(192,54,74,.14)",
                  animation:"ci-riseIn 1.1s .2s cubic-bezier(.22,1,.36,1) both",
                  opacity:0,
                }}>
                  {brideFirst}
                </h1>
                <div style={{
                  width:"min(180px,40%)", height:1, margin:"1.5rem auto 0",
                  background:`linear-gradient(90deg, transparent, rgba(192,54,74,.6), transparent)`,
                  transformOrigin:"center",
                  animation:"ci-lineGrowFade 1s .8s ease both",
                  opacity:0,
                }} />
              </div>
            )}

            {/* Scene 2 — Groom */}
            {scene === 2 && (
              <div>
                <p style={{
                  fontFamily:BF, fontSize:"clamp(.46rem,1.1vw,.56rem)",
                  letterSpacing:".46em", textTransform:"uppercase",
                  color:`rgba(184,130,10,.62)`, marginBottom:".875rem",
                  animation:"ci-sinkIn .9s .1s ease both", opacity:0,
                }}>
                  &amp; the groom
                </p>
                <h1 className="ci-scene-text" style={{
                  fontFamily:DF,
                  fontSize:"clamp(4rem,13vw,8.5rem)",
                  fontWeight:700, lineHeight:.87, letterSpacing:"-0.03em",
                  color:"#E8D5B0",
                  textShadow:"0 4px 60px rgba(0,0,0,.55), 0 0 100px rgba(184,130,10,.22)",
                  animation:"ci-riseIn 1.1s .2s cubic-bezier(.22,1,.36,1) both",
                  opacity:0,
                }}>
                  {groomFirst}
                </h1>
                <div style={{
                  width:"min(180px,40%)", height:1, margin:"1.5rem auto 0",
                  background:`linear-gradient(90deg, transparent, rgba(184,130,10,.6), transparent)`,
                  transformOrigin:"center",
                  animation:"ci-lineGrowFade 1s .8s ease both",
                  opacity:0,
                }} />
              </div>
            )}

            {/* Scene 3 — Together forever */}
            {scene === 3 && (
              <div>
                <p style={{
                  fontFamily:DF, fontStyle:"italic", fontWeight:300,
                  fontSize:"clamp(1rem,2.8vw,1.4rem)",
                  color:"rgba(240,232,220,.55)", letterSpacing:".06em",
                  marginBottom:"1rem",
                  animation:"ci-fadeIn 1.4s .1s ease both", opacity:0,
                }}>
                  Together forever
                </p>
                <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:".2em",
                  animation:"ci-riseIn 1.1s .3s cubic-bezier(.22,1,.36,1) both", opacity:0 }}>
                  <span style={{
                    fontFamily:DF, fontSize:"clamp(3rem,9vw,6.5rem)",
                    fontWeight:700, lineHeight:.9, letterSpacing:"-0.025em", color:"#FFFFFF",
                  }}>{brideFirst}</span>
                  <span style={{
                    fontFamily:DF, fontStyle:"italic", fontWeight:300,
                    fontSize:"clamp(1.5rem,4.5vw,3rem)", color:GOLD_L,
                    letterSpacing:".1em", lineHeight:1,
                    padding:"0 .15em",
                  }}>&amp;</span>
                  <span style={{
                    fontFamily:DF, fontSize:"clamp(3rem,9vw,6.5rem)",
                    fontWeight:700, lineHeight:.9, letterSpacing:"-0.025em", color:"#E8D5B0",
                  }}>{groomFirst}</span>
                </div>
              </div>
            )}

            {/* Scene 4 — Date & Venue */}
            {scene === 4 && (
              <div>
                <p style={{
                  fontFamily:DF, fontStyle:"italic",
                  fontSize:"clamp(1rem,2.5vw,1.3rem)",
                  color:"rgba(240,232,220,.50)", letterSpacing:".05em",
                  marginBottom:"1.25rem",
                  animation:"ci-fadeIn 1.2s .1s ease both", opacity:0,
                }}>
                  invite you to witness their union
                </p>
                {weddingDate && (
                  <p style={{
                    fontFamily:DF, fontWeight:300,
                    fontSize:"clamp(1.6rem,5.5vw,3.2rem)",
                    color:"#FFFFFF", letterSpacing:".04em", lineHeight:1.15,
                    marginBottom:".625rem",
                    animation:"ci-riseIn 1s .35s cubic-bezier(.22,1,.36,1) both", opacity:0,
                  }}>
                    {weddingDate}
                  </p>
                )}
                {(venueName || venueCity) && (
                  <p style={{
                    fontFamily:BF, fontSize:"clamp(.78rem,1.8vw,.9rem)",
                    color:`rgba(184,130,10,.78)`, letterSpacing:".12em",
                    marginBottom:"1.5rem",
                    animation:"ci-riseIn .9s .6s ease both", opacity:0,
                  }}>
                    {[venueName, venueCity].filter(Boolean).join("  ·  ")}
                  </p>
                )}
                <div style={{
                  width:"min(220px,50%)", height:1, margin:"0 auto",
                  background:`linear-gradient(90deg, transparent, ${GOLD_L}, transparent)`,
                  transformOrigin:"center",
                  animation:"ci-lineGrowFade 1.2s .85s ease both",
                  opacity:0,
                }} />
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div style={{
            position:"absolute", bottom:"clamp(52px,10vh,96px)", left:"50%",
            transform:"translateX(-50%)", display:"flex", gap:6, zIndex:7,
          }}>
            {SCENE_HOLD.map((_, i) => (
              <div key={i} style={{
                height:3, borderRadius:2,
                width: i === scene ? 28 : (i < scene ? 10 : 8),
                background: i <= scene ? GOLD : `rgba(184,130,10,.22)`,
                transition:"all .5s ease",
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
            position:"fixed", inset:0, zIndex:9999,
            background:LINEN,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            overflowY:"auto",
            WebkitOverflowScrolling:"touch",
            padding:"clamp(56px,10vh,80px) 20px clamp(32px,5vh,56px)",
          }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* Warm bloom */}
          <div aria-hidden style={{
            position:"fixed", inset:0, pointerEvents:"none",
            background:`
              radial-gradient(ellipse 70% 55% at 20% 22%, rgba(192,54,74,.04) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 82% 80%, rgba(184,130,10,.04) 0%, transparent 55%)
            `,
          }} />

          {/* Skip button */}
          <button type="button" onClick={openInvitation} style={{
            position:"fixed", top:14, right:14, zIndex:10,
            display:"flex", alignItems:"center", gap:5,
            padding:"7px 13px", background:"transparent",
            border:`1px solid ${BDR_M}`, borderRadius:2,
            color:INK3, fontSize:10, letterSpacing:".28em",
            textTransform:"uppercase", fontFamily:BF, cursor:"pointer",
            opacity:0, animation:"ci-fadeIn .6s .6s ease forwards",
          }}>
            <SkipForward size={11}/> Skip
          </button>

          {/* ── ENVELOPE + CARD ── */}
          <div style={{
            width:"100%", maxWidth:460,
            display:"flex", flexDirection:"column", gap:0,
            opacity:0, animation:"ci-scaleIn .9s .15s cubic-bezier(.22,1,.36,1) forwards",
          }}>

            {/* Addressed-to label */}
            <div style={{
              textAlign:"center", marginBottom:"1.5rem",
              opacity:0, animation:"ci-fadeIn .8s .45s ease forwards",
            }}>
              <p style={{
                fontFamily:DF, fontStyle:"italic", fontWeight:300,
                fontSize:"clamp(.9rem,2.5vw,1.05rem)",
                color:INK3, letterSpacing:".04em",
              }}>
                A personal invitation for
              </p>
              <p style={{
                fontFamily:DF,
                fontSize:"clamp(1.3rem,4.5vw,1.85rem)",
                fontWeight:600, color:INK, letterSpacing:".02em", lineHeight:1.2,
                marginTop:".2rem",
              }}>
                {guestLabel}
              </p>
            </div>

            {/* THE CARD */}
            <div style={{
              background:"#FFFFFF",
              borderRadius:20,
              boxShadow:"0 24px 72px rgba(60,20,30,.14), 0 4px 18px rgba(60,20,30,.07)",
              overflow:"hidden",
              border:`1px solid ${BDR}`,
              /* Envelope unfold — flap lifts on open */
              transformOrigin:"top center",
              transform: envelopeOpen ? "perspective(1000px) rotateX(-4deg) scale(.97)" : "none",
              transition: "transform .6s cubic-bezier(.22,1,.36,1)",
            }}>

              {/* Top stripe — rose to gold */}
              <div style={{
                height:4,
                background:`linear-gradient(90deg, transparent 0%, ${ROSE} 20%, ${GOLD_L} 50%, ${ROSE} 80%, transparent 100%)`,
              }} />

              <div className="ci-card-pad" style={{ padding:"clamp(1.5rem,5vw,2.25rem)" }}>

                {/* Brand eyebrow */}
                <div style={{
                  display:"flex", alignItems:"center", gap:12,
                  justifyContent:"center", marginBottom:"1.625rem",
                  opacity:0, animation:"ci-fadeIn .8s .7s ease forwards",
                }}>
                  <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${BDR})` }} />
                  <span style={{
                    fontFamily:BF, fontSize:".5rem", letterSpacing:".46em",
                    textTransform:"uppercase", color:ROSE, fontWeight:700,
                  }}>
                    {title}
                  </span>
                  <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${BDR})` }} />
                </div>

                {/* Monogram seal */}
                <div style={{
                  display:"flex", justifyContent:"center", marginBottom:"1.5rem",
                  opacity:0, animation:"ci-scaleIn .9s .85s cubic-bezier(.22,1,.36,1) forwards",
                }}>
                  <div style={{
                    width:"clamp(68px,17vw,84px)", height:"clamp(68px,17vw,84px)",
                    borderRadius:"50%",
                    background:`radial-gradient(circle at 38% 36%, ${GOLD_L}, ${GOLD})`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    animation:"ci-sealGlow 3s 1.2s ease-in-out infinite",
                  }}>
                    <span style={{
                      fontFamily:DF, fontSize:"clamp(1.2rem,3.5vw,1.55rem)",
                      color:"#FFFDF9", fontWeight:700, letterSpacing:".06em",
                    }}>
                      {initials}
                    </span>
                  </div>
                </div>

                {/* Couple names */}
                <div style={{
                  textAlign:"center", marginBottom:"1.125rem",
                  opacity:0, animation:"ci-riseIn .9s 1.0s cubic-bezier(.22,1,.36,1) forwards",
                }}>
                  <h1 style={{
                    fontFamily:DF, fontSize:"clamp(1.8rem,6.5vw,2.9rem)",
                    fontWeight:700, lineHeight:.95, letterSpacing:"-0.025em", color:INK,
                    marginBottom:0,
                  }}>
                    {brideFirst}
                  </h1>
                  <p style={{
                    fontFamily:DF, fontStyle:"italic", fontWeight:300,
                    fontSize:"clamp(1.1rem,3.5vw,1.75rem)",
                    color:ROSE, lineHeight:1.25, margin:".1em 0",
                  }}>
                    &amp;
                  </p>
                  <h1 style={{
                    fontFamily:DF, fontSize:"clamp(1.8rem,6.5vw,2.9rem)",
                    fontWeight:700, lineHeight:.95, letterSpacing:"-0.025em", color:ROSE,
                  }}>
                    {groomFirst}
                  </h1>
                </div>

                {/* Gold ornamental rule */}
                <div style={{
                  display:"flex", alignItems:"center", gap:12,
                  justifyContent:"center", margin:"1.125rem 0",
                  opacity:0, animation:"ci-fadeIn .8s 1.1s ease forwards",
                }}>
                  <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, rgba(184,130,10,.45))` }} />
                  <span style={{ color:GOLD, fontSize:13, lineHeight:1 }}>✦</span>
                  <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, rgba(184,130,10,.45))` }} />
                </div>

                {/* Date + venue chips */}
                <div style={{
                  display:"flex", flexWrap:"wrap", justifyContent:"center",
                  gap:".5rem", marginBottom:"1.5rem",
                  opacity:0, animation:"ci-fadeIn .8s 1.2s ease forwards",
                }}>
                  {[
                    { text: weddingDate, rose: true },
                    { text: venueName,   rose: false },
                    { text: venueCity,   rose: false },
                  ].filter(x => x.text).map(({ text, rose: isRose }, i) => (
                    <span key={i} style={{
                      display:"inline-flex", alignItems:"center",
                      padding:"5px 14px", borderRadius:999,
                      background: isRose ? "rgba(192,54,74,.07)" : "rgba(184,130,10,.07)",
                      border:`1px solid ${isRose ? "rgba(192,54,74,.18)" : "rgba(184,130,10,.18)"}`,
                      color: isRose ? ROSE : GOLD,
                      fontSize:".75rem", fontFamily:BF, fontWeight:600, letterSpacing:".04em",
                    }}>
                      {text}
                    </span>
                  ))}
                </div>

                {/* Personal greeting */}
                <div style={{
                  background:LINEN,
                  border:`1px solid ${BDR}`,
                  borderRadius:12,
                  padding:"1rem 1.125rem",
                  marginBottom:"1.75rem",
                  opacity:0, animation:"ci-riseIn .9s 1.3s ease forwards",
                }}>
                  <p style={{
                    fontFamily:BF, fontSize:".55rem", letterSpacing:".32em",
                    textTransform:"uppercase", color:ROSE, fontWeight:700,
                    marginBottom:".5rem",
                  }}>
                    A personal welcome
                  </p>
                  <p style={{
                    fontFamily:DF, fontStyle:"italic",
                    fontSize:"clamp(.875rem,2.2vw,1rem)",
                    color:INK, lineHeight:1.75,
                  }}>
                    Dear {guestLabel},
                  </p>
                  <p style={{
                    fontFamily:DF, fontStyle:"italic",
                    fontSize:"clamp(.875rem,2.2vw,1rem)",
                    color:INK2, lineHeight:1.75, marginTop:".325rem",
                  }}>
                    {brideFirst} and {groomFirst} warmly invite you to witness
                    and celebrate their union. You are not just a guest — you
                    are part of the story that brought them here.
                  </p>
                </div>

                {/* ═══ THE ONE BUTTON ═══ */}
                <div style={{
                  opacity:0,
                  animation:"ci-riseIn .9s 1.55s cubic-bezier(.22,1,.36,1) forwards",
                }}>
                  <button
                    type="button"
                    className="ci-open-btn"
                    onClick={openInvitation}
                  >
                    Open your invitation
                  </button>

                  <p style={{
                    marginTop:".875rem", textAlign:"center",
                    fontFamily:BF, fontSize:".63rem", color:INK3, letterSpacing:".04em",
                  }}>
                    {subtitle}
                  </p>
                </div>

              </div>

              {/* Bottom stripe */}
              <div style={{
                height:4,
                background:`linear-gradient(90deg, transparent 0%, ${ROSE} 20%, ${GOLD_L} 50%, ${ROSE} 80%, transparent 100%)`,
              }} />
            </div>

            {/* Below-card ornament */}
            <p style={{
              marginTop:"1.375rem", textAlign:"center",
              fontFamily:BF, fontSize:".48rem", letterSpacing:".38em",
              textTransform:"uppercase", color:INK3, opacity:.55,
              opacity:0, animation:"ci-fadeIn .7s 1.8s ease forwards",
            } as React.CSSProperties}>
              {brideFirst} &amp; {groomFirst}  ·  {weddingDate ?? ""}
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 3 · HERO + PAGE CONTENT
      ════════════════════════════════════════════════════════════════════ */}
      {phase === "hero" && (
        <div className={heroVisible ? "ci-vis" : ""}>

          {/* ── FULL-VIEWPORT HERO ── */}
          <section style={{
            position:"relative",
            minHeight:"100dvh",
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            textAlign:"center",
            overflow:"hidden",
            background:ONYX,
          }}>
            {/* Background photo */}
            {heroPhotoUrl && (
              <div aria-hidden style={{ position:"absolute", inset:0, zIndex:0, overflow:"hidden" }}>
                <div style={{
                  position:"absolute", inset:"-7%",
                  backgroundImage:`url(${heroPhotoUrl})`,
                  backgroundSize:"cover", backgroundPosition:"center center",
                  filter:"saturate(.5) brightness(.38)",
                  animation:"ci-zoom 32s ease-in-out infinite alternate",
                }} />
              </div>
            )}

            {/* Layered overlays */}
            <div aria-hidden style={{
              position:"absolute", inset:0, zIndex:1,
              background:`
                radial-gradient(ellipse 85% 65% at 50% 44%, rgba(192,54,74,.055) 0%, transparent 65%),
                linear-gradient(to bottom,
                  rgba(10,6,8,.60) 0%,
                  rgba(10,6,8,.12) 30%,
                  rgba(10,6,8,.12) 68%,
                  rgba(10,6,8,.82) 100%
                )
              `,
            }} />
            <div aria-hidden style={{ position:"absolute",top:0,left:0,right:0,height:64, background:"linear-gradient(to bottom,rgba(5,3,2,.92),transparent)", zIndex:2 }} />
            <div aria-hidden style={{ position:"absolute",bottom:0,left:0,right:0,height:140, background:"linear-gradient(to top,rgba(5,3,2,.96),transparent)", zIndex:2 }} />

            {/* Content */}
            <div style={{ position:"relative", zIndex:5, padding:"5.5rem 1.5rem 7.5rem", maxWidth:700, width:"100%" }}>

              {/* Eyebrow */}
              <div className="ci-h0" style={{ display:"flex", alignItems:"center", gap:14, justifyContent:"center", marginBottom:"2rem" }}>
                <div style={{ width:40, height:1, background:`linear-gradient(to right, transparent, ${GOLD})` }} />
                <span style={{
                  fontFamily:BF, fontSize:".5rem", letterSpacing:".50em",
                  textTransform:"uppercase", color:`rgba(184,130,10,.85)`, fontWeight:700,
                }}>
                  {title}
                </span>
                <div style={{ width:40, height:1, background:`linear-gradient(to left, transparent, ${GOLD})` }} />
              </div>

              {/* Bride name */}
              <h1 className="ci-h1" style={{
                fontFamily:DF,
                fontSize:"clamp(3.5rem,12vw,8rem)",
                fontWeight:700, lineHeight:.87, letterSpacing:"-0.03em",
                color:"#FFFFFF",
                textShadow:"0 4px 48px rgba(0,0,0,.65), 0 0 100px rgba(192,54,74,.08)",
                marginBottom:".04em",
              }}>
                {brideFirst}
              </h1>

              {/* & */}
              <p className="ci-h2" style={{
                fontFamily:DF, fontSize:"clamp(1.5rem,4.5vw,3rem)",
                fontWeight:300, fontStyle:"italic",
                color:GOLD_L, letterSpacing:".08em", lineHeight:1.2, marginBottom:".04em",
              }}>
                &amp;
              </p>

              {/* Groom name */}
              <h1 className="ci-h3" style={{
                fontFamily:DF,
                fontSize:"clamp(3.5rem,12vw,8rem)",
                fontWeight:700, lineHeight:.87, letterSpacing:"-0.03em",
                color:"#E8D5B0",
                textShadow:"0 4px 48px rgba(0,0,0,.55), 0 0 80px rgba(184,130,10,.20)",
                marginBottom:"1.75rem",
              }}>
                {groomFirst}
              </h1>

              {/* Gold line */}
              <div className="ci-hl" style={{
                width:"min(250px,54%)", height:1, margin:"0 auto 1.75rem",
                background:`linear-gradient(90deg, transparent, ${GOLD_L}, transparent)`,
              }} />

              {/* Date · Venue · City */}
              <div className="ci-h4" style={{
                display:"flex", flexWrap:"wrap", alignItems:"center",
                justifyContent:"center", gap:".65rem", marginBottom:"1.25rem",
              }}>
                {weddingDate && (
                  <span style={{ fontFamily:BF, fontSize:".9rem", color:"rgba(240,232,220,.92)", letterSpacing:".05em", fontWeight:500 }}>
                    {weddingDate}
                  </span>
                )}
                {venueName && (
                  <>
                    <span aria-hidden style={{ width:3, height:3, borderRadius:"50%", background:GOLD, display:"inline-block", opacity:.6 }} />
                    <span style={{ fontFamily:BF, fontSize:".875rem", color:"rgba(240,232,220,.65)", letterSpacing:".04em" }}>
                      {venueName}
                    </span>
                  </>
                )}
                {venueCity && (
                  <>
                    <span aria-hidden style={{ width:3, height:3, borderRadius:"50%", background:GOLD, display:"inline-block", opacity:.4 }} />
                    <span style={{ fontFamily:BF, fontSize:".875rem", color:"rgba(240,232,220,.48)", letterSpacing:".04em" }}>
                      {venueCity}
                    </span>
                  </>
                )}
              </div>

              {/* Personal tag */}
              <div className="ci-h5" style={{ marginBottom:"2.5rem" }}>
                <span style={{
                  display:"inline-block", padding:"6px 20px",
                  border:"1px solid rgba(184,130,10,.32)", borderRadius:2,
                  fontFamily:DF, fontStyle:"italic",
                  fontSize:"clamp(.8rem,1.9vw,.95rem)",
                  color:"rgba(184,130,10,.78)", letterSpacing:".04em",
                }}>
                  A personal invitation for {guestLabel}
                </span>
              </div>

              {/* Scroll CTA */}
              <div className="ci-h6">
                <a
                  href="#invite-content"
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"13px 36px", background:"transparent",
                    border:`1px solid ${GOLD}`, color:GOLD,
                    fontFamily:BF, fontSize:".68rem", letterSpacing:".34em",
                    textTransform:"uppercase", textDecoration:"none",
                    borderRadius:2, transition:"all .35s ease",
                  }}
                  onMouseEnter={e => { const a=e.currentTarget; a.style.background=GOLD; a.style.color=ONYX; }}
                  onMouseLeave={e => { const a=e.currentTarget; a.style.background="transparent"; a.style.color=GOLD; }}
                >
                  View invitation
                </a>
              </div>
            </div>

            {/* Scroll hint */}
            <div className="ci-h8" style={{
              position:"absolute", bottom:26, left:"50%",
              display:"flex", flexDirection:"column", alignItems:"center", gap:7, zIndex:5,
              animation:"ci-bounce 2.2s 2s ease-in-out infinite",
            }}>
              <span style={{
                fontFamily:BF, fontSize:".44rem", letterSpacing:".40em",
                textTransform:"uppercase", color:"rgba(184,130,10,.52)",
              }}>
                Scroll
              </span>
              <div style={{ width:1, height:32, background:`linear-gradient(to bottom, ${GOLD}, transparent)`, opacity:.5 }} />
              <ChevronDown size={13} style={{ color:"rgba(184,130,10,.46)", marginTop:-6 }} />
            </div>
          </section>

          {/* ── INVITE PAGE CONTENT ── */}
          <div id="invite-content">
            {children}
          </div>
        </div>
      )}
    </>
  );
}

export default CinematicIntro;
