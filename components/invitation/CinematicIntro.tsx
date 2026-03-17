"use client";

/**
 * CinematicIntro — luxury redesign
 *
 * PHASE 1 · TEASER  (auto-playing, ~5 s, no interaction needed)
 *   Full-screen dark cinematic sequence. Particles rise. Couple names
 *   reveal dramatically word-by-word. Date & venue fade in. A gold line
 *   draws itself. After ~5 s the teaser dissolves automatically into
 *   the invitation card. Guest can skip at any time.
 *
 * PHASE 2 · INVITATION CARD  (interactive)
 *   Light, warm platform-themed card addressed to the guest.
 *   Monogram · couple names · personal greeting · date / venue · one
 *   single "Open invitation" button that enters the hero.
 *   No wax seal, no second gate — one clean action.
 *
 * PHASE 3 · HERO + CONTENT
 *   Full-viewport cinematic hero with background photo, staggered reveals,
 *   scroll hint. The rest of the invite page flows beneath it.
 *
 * SKIP / RETURN VISITS
 *   30-day cookie + sessionStorage skip Phase 1 & 2 entirely, landing
 *   straight on the hero.
 */

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SkipForward, Volume2, VolumeX } from "lucide-react";

// ─── Design tokens (warm platform palette) ───────────────────────────────────
const ROSE   = "#C0364A";
const GOLD   = "#B8820A";
const GOLD_L = "#D4A020";
const INK    = "#1A1012";
const INK2   = "#3D2530";
const INK3   = "#7A5460";
const WARM   = "#FAF8F6";
const LINEN  = "#F4EFE9";
const BDR    = "#E4D8D4";
const BDR_MD = "#D0C0BC";
const ONYX   = "#0E0C0A";           // dark teaser bg only

const DF = "var(--font-display), 'Cormorant Garamond', Georgia, serif";
const BF = "var(--font-body), system-ui, -apple-system, sans-serif";

// ─── Types ────────────────────────────────────────────────────────────────────
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

type Phase = "teaser" | "card" | "hero";

// ─── Particle helper ──────────────────────────────────────────────────────────
function makeParticles(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    left:  `${5 + Math.random() * 90}%`,
    size:  2 + Math.random() * 3,
    dur:   8 + Math.random() * 10,
    delay: Math.random() * 6,
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CinematicIntro({
  inviteCode, guestLabel, brideName, groomName,
  title, subtitle, weddingDate, venueName, venueCity,
  heroPhotoUrl, audioSrc = "/audio/wedding-theme.mp3", children,
}: CinematicIntroProps) {

  const [phase,       setPhase]       = useState<Phase>("teaser");
  const [isMounted,   setIsMounted]   = useState(false);
  const [leaving,     setLeaving]     = useState(false);   // cross-fade out
  const [heroVisible, setHeroVisible] = useState(false);
  const [isMuted,     setIsMuted]     = useState(true);
  const [audioAvail,  setAudioAvail]  = useState<boolean | null>(audioSrc ? null : false);

  // Teaser scene index (0-3)
  const [scene,    setScene]    = useState(0);
  const sceneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const storageKey = `surihana-intro:${inviteCode}`;
  const cookieName = `invite_intro_seen_${inviteCode}`;

  const brideFirst  = brideName.split(" ")[0]!;
  const groomFirst  = groomName.split(" ")[0]!;
  const initials    = useMemo(() => `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase(), [brideName, groomName]);
  const particles   = useMemo(() => makeParticles(18), []);

  // ── Mount / skip logic ────────────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === "undefined") return;
    const hasCookie  = document.cookie.split(";").some(c => c.trim().startsWith(`${cookieName}=`));
    const hasSession = sessionStorage.getItem(storageKey) === "entered";
    if (hasCookie || hasSession) {
      setPhase("hero");
      setTimeout(() => setHeroVisible(true), 80);
    }
  }, [cookieName, storageKey]);

  // ── Teaser auto-advance ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "teaser") return;
    // scene durations: 0→1.4s  1→1.4s  2→1.2s  3→1.0s  then card
    const DURATIONS = [1400, 1400, 1200, 1200];
    const dur = DURATIONS[scene] ?? 1200;
    sceneTimer.current = setTimeout(() => {
      if (scene < 3) {
        setScene(s => s + 1);
      } else {
        advanceToCard();
      }
    }, dur);
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

  // ── Cross-fade helper ─────────────────────────────────────────────────────
  function fadeOut(cb: () => void, ms = 700) {
    setLeaving(true);
    setTimeout(() => { setLeaving(false); cb(); }, ms);
  }

  // ── Teaser → Card ─────────────────────────────────────────────────────────
  function advanceToCard() {
    fadeOut(() => setPhase("card"));
  }

  // ── Card → Hero (the ONE "Open invitation" action) ────────────────────────
  function openInvitation() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "entered");
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${cookieName}=1; expires=${expires}; path=/; SameSite=Lax`;
    }
    if (audioRef.current) audioRef.current.pause();
    fadeOut(() => {
      setPhase("hero");
      requestAnimationFrame(() => requestAnimationFrame(() => setHeroVisible(true)));
    });
  }

  // ── Skip (any phase) ──────────────────────────────────────────────────────
  function skip() {
    if (sceneTimer.current) clearTimeout(sceneTimer.current);
    if (phase === "teaser") { fadeOut(() => setPhase("card")); return; }
    openInvitation();
  }

  // ── SSR guard ─────────────────────────────────────────────────────────────
  if (!isMounted) return <div style={{ minHeight: "100dvh" }}>{children}</div>;

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes ci-rise    { 0%{transform:translateY(110vh) scale(.5);opacity:0} 6%{opacity:.45} 90%{opacity:.18} 100%{transform:translateY(-6vh) scale(1.1);opacity:0} }
        @keyframes ci-fadeIn  { from{opacity:0}                                    to{opacity:1} }
        @keyframes ci-fadeUp  { from{opacity:0;transform:translateY(20px)}         to{opacity:1;transform:translateY(0)} }
        @keyframes ci-scaleUp { from{opacity:0;transform:scale(.9)}                to{opacity:1;transform:scale(1)} }
        @keyframes ci-lineGrow{ from{transform:scaleX(0);opacity:0}                to{transform:scaleX(1);opacity:1} }
        @keyframes ci-pulse   { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes ci-bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        @keyframes ci-zoom    { 0%{transform:scale(1)} 100%{transform:scale(1.07)} }
        @keyframes ci-glow    { 0%,100%{opacity:.4} 50%{opacity:.75} }

        /* Teaser text animations */
        .ci-word { display:inline-block; opacity:0; transform:translateY(16px); transition:opacity .6s ease, transform .6s ease; }
        .ci-word.ci-in { opacity:1; transform:translateY(0); }

        /* Hero reveals */
        .ci-h0,.ci-h1,.ci-h2,.ci-h3,.ci-h4,.ci-h5,.ci-h6,.ci-h7,.ci-h8 { opacity:0; }
        .ci-vis .ci-h0 { animation: ci-fadeUp .7s .05s ease forwards; }
        .ci-vis .ci-h1 { animation: ci-fadeUp .8s .20s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h2 { animation: ci-fadeUp .8s .36s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h3 { animation: ci-fadeUp .8s .52s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h4 { animation: ci-fadeUp .7s .68s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h5 { animation: ci-fadeUp .7s .82s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h6 { animation: ci-fadeUp .7s .96s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h7 { animation: ci-fadeUp .7s 1.1s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h8 { animation: ci-fadeUp .7s 1.24s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-hl { animation: ci-lineGrow .9s .42s ease forwards; transform-origin:center; }

        /* Cross-fade overlay transition */
        .ci-screen { transition: opacity .7s ease; }
        .ci-leaving { opacity:0 !important; pointer-events:none; }
      `}</style>

      {/* ════════════════════════════════════════════════════════════
          PHASE 1 — TEASER
      ════════════════════════════════════════════════════════════ */}
      {phase === "teaser" && (
        <div className={`ci-screen${leaving ? " ci-leaving" : ""}`} style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: ONYX,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* Ambient bloom */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            background: `
              radial-gradient(ellipse 75% 55% at 25% 35%, rgba(192,54,74,.08) 0%, transparent 60%),
              radial-gradient(ellipse 65% 50% at 80% 72%, rgba(184,130,10,.07) 0%, transparent 60%)
            `,
            animation: "ci-glow 8s ease-in-out infinite",
          }} />

          {/* Rising particles */}
          {particles.map(p => (
            <div key={p.id} aria-hidden style={{
              position: "absolute",
              bottom: "-10px",
              left: p.left,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: GOLD,
              opacity: 0,
              animation: `ci-rise ${p.dur}s ${p.delay}s linear infinite`,
            }} />
          ))}

          {/* Letterbox bars */}
          <div aria-hidden style={{ position:"absolute",top:0,left:0,right:0,height:"clamp(40px,8vh,80px)", background:"linear-gradient(to bottom, rgba(5,3,2,.96), rgba(5,3,2,.5))", zIndex:6 }} />
          <div aria-hidden style={{ position:"absolute",bottom:0,left:0,right:0,height:"clamp(40px,8vh,80px)", background:"linear-gradient(to top, rgba(5,3,2,.96), rgba(5,3,2,.5))", zIndex:6 }} />
          {/* Vignette */}
          <div aria-hidden style={{ position:"absolute",inset:0, background:"radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,.7) 100%)", zIndex:3 }} />

          {/* Skip + Music — top right */}
          <div style={{ position:"absolute", top:"clamp(44px,9vh,88px)", right:16, zIndex:10, display:"flex", gap:8, opacity:0, animation:"ci-fadeIn .8s 1.5s ease forwards" }}>
            {audioAvail === true && (
              <button type="button" onClick={toggleMusic} style={{
                display:"flex", alignItems:"center", gap:5,
                padding:"7px 13px", background:"transparent",
                border:"1px solid rgba(184,130,10,.30)", borderRadius:2,
                color:"rgba(184,130,10,.60)", fontSize:10, letterSpacing:".28em",
                textTransform:"uppercase", fontFamily:BF, cursor:"pointer",
              }}>
                {isMuted ? <VolumeX size={12}/> : <Volume2 size={12}/>}
                {isMuted ? "Music" : "Mute"}
              </button>
            )}
            <button type="button" onClick={skip} style={{
              display:"flex", alignItems:"center", gap:5,
              padding:"7px 13px", background:"transparent",
              border:"1px solid rgba(184,130,10,.22)", borderRadius:2,
              color:"rgba(184,130,10,.45)", fontSize:10, letterSpacing:".28em",
              textTransform:"uppercase", fontFamily:BF, cursor:"pointer",
            }}>
              <SkipForward size={11}/> Skip
            </button>
          </div>

          {/* ── TEASER STAGE ── */}
          <div style={{ position:"relative", zIndex:5, textAlign:"center", padding:"0 24px", width:"100%", maxWidth:640 }}>

            {/* Scene 0 — Celebration title */}
            {scene === 0 && (
              <div style={{ animation:"ci-scaleUp .7s .1s cubic-bezier(.22,1,.36,1) both", opacity:0 }}>
                <p style={{ fontFamily:BF, fontSize:"clamp(.5rem,1.5vw,.65rem)", letterSpacing:".48em", textTransform:"uppercase", color:`rgba(184,130,10,.7)`, marginBottom:"1.75rem", fontWeight:700 }}>
                  {title}
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:16, justifyContent:"center" }}>
                  <div style={{ flex:1, maxWidth:80, height:1, background:`linear-gradient(to right, transparent, ${GOLD})` }} />
                  <span style={{ color:GOLD, fontSize:16 }}>✦</span>
                  <div style={{ flex:1, maxWidth:80, height:1, background:`linear-gradient(to left, transparent, ${GOLD})` }} />
                </div>
              </div>
            )}

            {/* Scene 1 — Bride name */}
            {scene === 1 && (
              <div style={{ animation:"ci-fadeIn .3s ease both" }}>
                <p style={{ fontFamily:BF, fontSize:"clamp(.48rem,1.2vw,.58rem)", letterSpacing:".42em", textTransform:"uppercase", color:`rgba(184,130,10,.55)`, marginBottom:"1rem" }}>
                  The bride
                </p>
                <h1 style={{
                  fontFamily:DF,
                  fontSize:"clamp(4rem,14vw,9rem)",
                  fontWeight:700, lineHeight:.88, letterSpacing:"-0.03em",
                  color:"#FFFFFF",
                  textShadow:"0 2px 48px rgba(0,0,0,.6), 0 0 80px rgba(192,54,74,.12)",
                  animation:"ci-fadeUp .8s .08s cubic-bezier(.22,1,.36,1) both",
                }}>
                  {brideFirst}
                </h1>
              </div>
            )}

            {/* Scene 2 — Groom name */}
            {scene === 2 && (
              <div style={{ animation:"ci-fadeIn .3s ease both" }}>
                <p style={{ fontFamily:BF, fontSize:"clamp(.48rem,1.2vw,.58rem)", letterSpacing:".42em", textTransform:"uppercase", color:`rgba(184,130,10,.55)`, marginBottom:"1rem" }}>
                  &amp; the groom
                </p>
                <h1 style={{
                  fontFamily:DF,
                  fontSize:"clamp(4rem,14vw,9rem)",
                  fontWeight:700, lineHeight:.88, letterSpacing:"-0.03em",
                  color:"#E8D5B0",
                  textShadow:"0 2px 48px rgba(0,0,0,.55), 0 0 70px rgba(184,130,10,.2)",
                  animation:"ci-fadeUp .8s .08s cubic-bezier(.22,1,.36,1) both",
                }}>
                  {groomFirst}
                </h1>
              </div>
            )}

            {/* Scene 3 — Date + Venue */}
            {scene === 3 && (
              <div style={{ animation:"ci-fadeIn .3s ease both", textAlign:"center" }}>
                <p style={{ fontFamily:DF, fontStyle:"italic", fontSize:"clamp(1rem,3vw,1.5rem)", color:"rgba(240,232,220,.65)", marginBottom:".75rem", animation:"ci-fadeUp .7s .1s ease both" }}>
                  invite you to celebrate
                </p>
                {weddingDate && (
                  <p style={{ fontFamily:DF, fontSize:"clamp(1.5rem,5vw,3rem)", fontWeight:300, color:"#FFFFFF", letterSpacing:".04em", marginBottom:".5rem", animation:"ci-fadeUp .7s .3s ease both" }}>
                    {weddingDate}
                  </p>
                )}
                {(venueName || venueCity) && (
                  <p style={{ fontFamily:BF, fontSize:"clamp(.75rem,2vw,.9rem)", color:`rgba(184,130,10,.75)`, letterSpacing:".1em", animation:"ci-fadeUp .7s .5s ease both" }}>
                    {[venueName, venueCity].filter(Boolean).join(" · ")}
                  </p>
                )}
                <div style={{ width:"min(200px,50%)", height:1, margin:"1.5rem auto 0", background:`linear-gradient(90deg, transparent, ${GOLD}, transparent)`, transformOrigin:"center", animation:"ci-lineGrow .9s .7s ease both" }} />
              </div>
            )}

          </div>

          {/* Progress dots */}
          <div style={{ position:"absolute", bottom:"clamp(48px,9vh,90px)", left:"50%", transform:"translateX(-50%)", display:"flex", gap:8, zIndex:7 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: i === scene ? 20 : 6,
                height: 6, borderRadius: 3,
                background: i === scene ? GOLD : `rgba(184,130,10,.28)`,
                transition: "all .4s ease",
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          PHASE 2 — INVITATION CARD (warm platform theme)
      ════════════════════════════════════════════════════════════ */}
      {phase === "card" && (
        <div className={`ci-screen${leaving ? " ci-leaving" : ""}`} style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: LINEN,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          overflowY: "auto",
          padding: "60px 20px 40px",
        }}>
          {audioSrc && !audioRef.current && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* Soft radial bloom — platform accent */}
          <div aria-hidden style={{
            position: "fixed", inset: 0,
            background: `
              radial-gradient(ellipse 70% 50% at 25% 25%, rgba(192,54,74,.05) 0%, transparent 60%),
              radial-gradient(ellipse 60% 45% at 80% 75%, rgba(184,130,10,.04) 0%, transparent 55%)
            `,
            pointerEvents: "none",
          }} />

          {/* Skip */}
          <button type="button" onClick={skip} style={{
            position:"fixed", top:16, right:16, zIndex:10,
            display:"flex", alignItems:"center", gap:5,
            padding:"7px 13px", background:"transparent",
            border:`1px solid ${BDR_MD}`, borderRadius:2,
            color:INK3, fontSize:10, letterSpacing:".28em",
            textTransform:"uppercase", fontFamily:BF, cursor:"pointer",
            opacity:0, animation:"ci-fadeIn .6s .4s ease forwards",
          }}>
            <SkipForward size={11}/> Skip
          </button>

          {/* ── The card ── */}
          <div style={{
            width:"100%", maxWidth:480,
            background:"#FFFFFF",
            border:`1px solid ${BDR}`,
            borderRadius:24,
            boxShadow:"0 20px 64px rgba(80,20,30,.12), 0 4px 16px rgba(80,20,30,.06)",
            overflow:"hidden",
            opacity:0, animation:"ci-scaleUp .8s .2s cubic-bezier(.22,1,.36,1) forwards",
          }}>
            {/* Top rose-gold stripe */}
            <div style={{ height:3, background:`linear-gradient(90deg, transparent, ${ROSE}, ${GOLD}, ${ROSE}, transparent)` }} />

            <div style={{ padding:"clamp(1.75rem,5vw,2.5rem)" }}>

              {/* Celebration eyebrow */}
              <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center", marginBottom:"1.75rem" }}>
                <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${BDR})` }} />
                <span style={{ fontFamily:BF, fontSize:".5rem", letterSpacing:".44em", textTransform:"uppercase", color:ROSE, fontWeight:700 }}>
                  {title}
                </span>
                <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${BDR})` }} />
              </div>

              {/* Monogram */}
              <div style={{ display:"flex", justifyContent:"center", marginBottom:"1.5rem" }}>
                <div style={{
                  width:"clamp(64px,16vw,80px)", height:"clamp(64px,16vw,80px)",
                  borderRadius:"50%",
                  background:`radial-gradient(circle at 40% 38%, ${GOLD_L}, ${GOLD})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:`0 4px 20px rgba(184,130,10,.28)`,
                }}>
                  <span style={{ fontFamily:DF, fontSize:"clamp(1.2rem,3.5vw,1.6rem)", color:"#fff", fontWeight:700, letterSpacing:".06em" }}>
                    {initials}
                  </span>
                </div>
              </div>

              {/* Couple names */}
              <div style={{ textAlign:"center", marginBottom:"1.25rem" }}>
                <h1 style={{
                  fontFamily:DF,
                  fontSize:"clamp(1.75rem,6vw,2.75rem)",
                  fontWeight:700, lineHeight:1, letterSpacing:"-0.02em",
                  color:INK,
                }}>
                  {brideFirst}
                </h1>
                <p style={{ fontFamily:DF, fontStyle:"italic", fontSize:"clamp(1rem,3vw,1.5rem)", color:ROSE, lineHeight:1.3, margin:".1em 0" }}>
                  &amp;
                </p>
                <h1 style={{
                  fontFamily:DF,
                  fontSize:"clamp(1.75rem,6vw,2.75rem)",
                  fontWeight:700, lineHeight:1, letterSpacing:"-0.02em",
                  color:ROSE,
                }}>
                  {groomFirst}
                </h1>
              </div>

              {/* Gold rule */}
              <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center", margin:"1.25rem 0" }}>
                <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, rgba(184,130,10,.5))` }} />
                <span style={{ color:GOLD, fontSize:13 }}>✦</span>
                <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, rgba(184,130,10,.5))` }} />
              </div>

              {/* Date · Venue · City pills */}
              <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:".5rem", marginBottom:"1.5rem" }}>
                {[
                  weddingDate,
                  venueName,
                  venueCity,
                ].filter(Boolean).map((item, i) => (
                  <span key={i} style={{
                    display:"inline-flex", alignItems:"center",
                    padding:"5px 14px", borderRadius:999,
                    background:i === 0 ? `rgba(192,54,74,.07)` : `rgba(184,130,10,.07)`,
                    border:`1px solid ${i === 0 ? `rgba(192,54,74,.18)` : `rgba(184,130,10,.20)`}`,
                    color: i === 0 ? ROSE : GOLD,
                    fontSize:".75rem", fontFamily:BF, fontWeight:600, letterSpacing:".04em",
                  }}>
                    {item}
                  </span>
                ))}
              </div>

              {/* Personal greeting */}
              <div style={{
                background:LINEN,
                border:`1px solid ${BDR}`,
                borderRadius:14,
                padding:"1.125rem 1.25rem",
                marginBottom:"1.75rem",
              }}>
                <p style={{ fontFamily:BF, fontSize:".58rem", letterSpacing:".32em", textTransform:"uppercase", color:ROSE, fontWeight:700, marginBottom:".625rem" }}>
                  A personal welcome
                </p>
                <p style={{ fontFamily:DF, fontStyle:"italic", fontSize:"clamp(.875rem,2vw,1rem)", color:INK, lineHeight:1.75 }}>
                  Dear {guestLabel},
                </p>
                <p style={{ fontFamily:DF, fontStyle:"italic", fontSize:"clamp(.875rem,2vw,1rem)", color:INK2, lineHeight:1.75, marginTop:".375rem" }}>
                  {brideFirst} and {groomFirst} warmly invite you to witness
                  and celebrate their union. You are not just a guest — you
                  are part of the story that brought them here.
                </p>
              </div>

              {/* ONE action button */}
              <button
                type="button"
                onClick={openInvitation}
                style={{
                  width:"100%", padding:"16px",
                  background:ROSE,
                  border:"none", borderRadius:12,
                  color:"#FFFFFF",
                  fontFamily:BF, fontSize:".78rem", fontWeight:700,
                  letterSpacing:".22em", textTransform:"uppercase",
                  cursor:"pointer",
                  boxShadow:`0 8px 28px rgba(192,54,74,.28)`,
                  transition:"background .2s ease, transform .18s ease, box-shadow .18s ease",
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget;
                  b.style.background = "#A82C3E";
                  b.style.transform = "translateY(-2px)";
                  b.style.boxShadow = "0 12px 36px rgba(192,54,74,.36)";
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget;
                  b.style.background = ROSE;
                  b.style.transform = "";
                  b.style.boxShadow = `0 8px 28px rgba(192,54,74,.28)`;
                }}
              >
                Open invitation
              </button>

              {/* Subtitle below button */}
              <p style={{ marginTop:".875rem", textAlign:"center", fontFamily:BF, fontSize:".65rem", color:INK3, letterSpacing:".04em" }}>
                {subtitle}
              </p>

            </div>

            {/* Bottom rose-gold stripe */}
            <div style={{ height:3, background:`linear-gradient(90deg, transparent, ${ROSE}, ${GOLD}, ${ROSE}, transparent)` }} />
          </div>

          {/* Floating ornament below card */}
          <p style={{ marginTop:"1.5rem", fontFamily:BF, fontSize:".5rem", letterSpacing:".38em", textTransform:"uppercase", color:INK3, opacity:.65 }}>
            {brideFirst} &amp; {groomFirst} · {weddingDate ?? ""}
          </p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          PHASE 3 — CINEMATIC HERO + PAGE CONTENT
      ════════════════════════════════════════════════════════════ */}
      {phase === "hero" && (
        <div className={heroVisible ? "ci-vis" : ""}>

          <section style={{
            position:"relative",
            minHeight:"100dvh",
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            textAlign:"center",
            overflow:"hidden",
            background: ONYX,
          }}>
            {/* Background photo */}
            {heroPhotoUrl && (
              <div aria-hidden style={{ position:"absolute", inset:0, zIndex:0, overflow:"hidden" }}>
                <div style={{
                  position:"absolute", inset:"-6%",
                  backgroundImage:`url(${heroPhotoUrl})`,
                  backgroundSize:"cover", backgroundPosition:"center center",
                  filter:"saturate(.55) brightness(.40)",
                  animation:"ci-zoom 28s ease-in-out infinite alternate",
                }} />
              </div>
            )}

            {/* Overlays */}
            <div aria-hidden style={{
              position:"absolute", inset:0, zIndex:1,
              background:`
                radial-gradient(ellipse 80% 60% at 50% 42%, rgba(192,54,74,.06) 0%, transparent 65%),
                linear-gradient(to bottom, rgba(14,12,10,.55) 0%, rgba(14,12,10,.12) 35%, rgba(14,12,10,.12) 65%, rgba(14,12,10,.80) 100%)
              `,
            }} />
            <div aria-hidden style={{ position:"absolute",top:0,left:0,right:0,height:60, background:"linear-gradient(to bottom, rgba(5,3,2,.90), transparent)", zIndex:2 }} />
            <div aria-hidden style={{ position:"absolute",bottom:0,left:0,right:0,height:130, background:"linear-gradient(to top, rgba(5,3,2,.95), transparent)", zIndex:2 }} />

            {/* Content */}
            <div style={{ position:"relative", zIndex:5, padding:"5rem 1.5rem 7rem", maxWidth:680, width:"100%" }}>

              {/* Platform title eyebrow */}
              <div className="ci-h0" style={{ display:"flex", alignItems:"center", gap:14, justifyContent:"center", marginBottom:"2rem" }}>
                <div style={{ width:36, height:1, background:`linear-gradient(to right, transparent, ${GOLD})` }} />
                <span style={{ fontFamily:BF, fontSize:".5rem", letterSpacing:".48em", textTransform:"uppercase", color:`rgba(184,130,10,.82)`, fontWeight:700 }}>
                  {title}
                </span>
                <div style={{ width:36, height:1, background:`linear-gradient(to left, transparent, ${GOLD})` }} />
              </div>

              {/* Bride */}
              <h1 className="ci-h1" style={{
                fontFamily:DF, fontSize:"clamp(3.5rem,13vw,8rem)",
                fontWeight:700, lineHeight:.87, letterSpacing:"-0.03em",
                color:"#FFFFFF",
                textShadow:"0 2px 40px rgba(0,0,0,.6), 0 0 80px rgba(192,54,74,.08)",
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

              {/* Groom */}
              <h1 className="ci-h3" style={{
                fontFamily:DF, fontSize:"clamp(3.5rem,13vw,8rem)",
                fontWeight:700, lineHeight:.87, letterSpacing:"-0.03em",
                color:"#E8D5B0",
                textShadow:"0 2px 40px rgba(0,0,0,.5), 0 0 60px rgba(184,130,10,.18)",
                marginBottom:"1.75rem",
              }}>
                {groomFirst}
              </h1>

              {/* Gold rule */}
              <div className="ci-hl" style={{
                width:"min(240px,52%)", height:1, margin:"0 auto 1.75rem",
                background:`linear-gradient(90deg, transparent, ${GOLD_L}, transparent)`,
              }} />

              {/* Date · Venue */}
              <div className="ci-h4" style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:".6rem", marginBottom:"1.25rem" }}>
                {weddingDate && <span style={{ fontFamily:BF, fontSize:".875rem", color:"rgba(240,232,220,.90)", letterSpacing:".05em", fontWeight:500 }}>{weddingDate}</span>}
                {venueName && <>
                  <span aria-hidden style={{ width:3, height:3, borderRadius:"50%", background:GOLD, display:"inline-block", opacity:.6 }} />
                  <span style={{ fontFamily:BF, fontSize:".875rem", color:"rgba(240,232,220,.65)", letterSpacing:".04em" }}>{venueName}</span>
                </>}
                {venueCity && <>
                  <span aria-hidden style={{ width:3, height:3, borderRadius:"50%", background:GOLD, display:"inline-block", opacity:.4 }} />
                  <span style={{ fontFamily:BF, fontSize:".875rem", color:"rgba(240,232,220,.48)", letterSpacing:".04em" }}>{venueCity}</span>
                </>}
              </div>

              {/* Personal badge */}
              <div className="ci-h5" style={{ marginBottom:"2.25rem" }}>
                <span style={{
                  display:"inline-block", padding:"5px 18px",
                  border:`1px solid rgba(184,130,10,.30)`, borderRadius:2,
                  fontFamily:DF, fontStyle:"italic",
                  fontSize:"clamp(.78rem,1.8vw,.92rem)",
                  color:`rgba(184,130,10,.75)`,
                  letterSpacing:".04em",
                }}>
                  A personal invitation for {guestLabel}
                </span>
              </div>

              {/* Scroll CTA */}
              <div className="ci-h6">
                <a href="#invite-content" style={{
                  display:"inline-flex", alignItems:"center", gap:8,
                  padding:"12px 34px", background:"transparent",
                  border:`1px solid ${GOLD}`, color:GOLD,
                  fontFamily:BF, fontSize:".66rem", letterSpacing:".34em",
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
              position:"absolute", bottom:24, left:"50%", transform:"translateX(-50%)",
              display:"flex", flexDirection:"column", alignItems:"center", gap:6, zIndex:5,
            }}>
              <span style={{ fontFamily:BF, fontSize:".44rem", letterSpacing:".38em", textTransform:"uppercase", color:`rgba(184,130,10,.52)` }}>Scroll</span>
              <div style={{ width:1, height:30, background:`linear-gradient(to bottom, ${GOLD}, transparent)`, opacity:.5 }} />
              <ChevronDown size={13} style={{ color:`rgba(184,130,10,.48)`, animation:"ci-bounce 2s ease-in-out infinite" }} />
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
