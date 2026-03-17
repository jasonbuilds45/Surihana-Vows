"use client";

/**
 * CinematicIntro — rebuilt
 *
 * Phase 1 (GATE):   Full-screen dark overlay. Sealed envelope addressed to
 *                   the guest. Tap wax seal → envelope opens → personal card
 *                   reveals → "Open invitation" button.
 *
 * Phase 2 (HERO):   After clicking "Open invitation", the overlay crossfades
 *                   out and a full-screen cinematic HERO fills the viewport —
 *                   couple names, date, venue, floating petals, ambient glow,
 *                   scroll-down hint. THIS is always the first thing guests
 *                   see after the gate, never a blank page.
 *
 * Phase 3 (SCROLL): The rest of the invite page scrolls naturally below the hero.
 *
 * Cookie + sessionStorage skip: returning guests skip Phase 1 and land
 * directly on Phase 2 (the hero), which then scrolls as normal.
 */

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { SkipForward, Volume2, VolumeX, ChevronDown } from "lucide-react";

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
  heroPhotoUrl?: string;
  audioSrc?:    string | null;
  children:     ReactNode;
}

// ─── tiny helpers ────────────────────────────────────────────────────────────
const BF = "var(--font-body), system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";
const GOLD   = "#C9A96E";
const IVORY  = "#FAF6F0";
const ONYX   = "#0E0C0A";
const CHARCOAL = "#2C2825";

export function CinematicIntro({
  inviteCode, guestLabel, brideName, groomName,
  title, subtitle, weddingDate, venueName, venueCity,
  heroPhotoUrl, audioSrc = "/audio/wedding-theme.mp3", children,
}: CinematicIntroProps) {

  // ── State ──────────────────────────────────────────────────────────────────
  // "gate"  → showing the envelope/wax-seal overlay
  // "hero"  → showing the full-screen cinematic hero (after gate is dismissed)
  // "done"  → hero has been scrolled past, normal page
  type Phase = "gate" | "hero" | "done";

  const [phase,        setPhase]        = useState<Phase>("gate");
  const [isMounted,    setIsMounted]    = useState(false);
  const [isOpen,       setIsOpen]       = useState(false);   // envelope opened
  const [canEnter,     setCanEnter]     = useState(false);   // "Open invitation" CTA shown
  const [gateLeaving,  setGateLeaving]  = useState(false);   // gate fade-out
  const [heroVisible,  setHeroVisible]  = useState(false);   // hero elements revealed
  const [isMuted,      setIsMuted]      = useState(true);
  const [audioAvail,   setAudioAvail]   = useState<boolean | null>(audioSrc ? null : false);

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const storageKey  = `surihana-intro:${inviteCode}`;
  const cookieName  = `invite_intro_seen_${inviteCode}`;

  const brideFirst = brideName.split(" ")[0]!;
  const groomFirst = groomName.split(" ")[0]!;
  const initials   = useMemo(() => `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase(), [brideName, groomName]);

  // ── Mount: check if returning visitor ─────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === "undefined") return;
    const hasCookie  = document.cookie.split(";").some(c => c.trim().startsWith(`${cookieName}=`));
    const hasSession = sessionStorage.getItem(storageKey) === "entered";
    if (hasCookie || hasSession) {
      // Skip gate, go straight to hero
      setPhase("hero");
      setTimeout(() => setHeroVisible(true), 80);
    }
  }, [cookieName, storageKey]);

  // ── Audio ref setup ────────────────────────────────────────────────────────
  const setAudioRef = useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el;
    if (!el) return;
    el.addEventListener("canplaythrough", () => setAudioAvail(true), { once: true });
    el.addEventListener("error",          () => setAudioAvail(false), { once: true });
    if (el.readyState >= 3) setAudioAvail(true);
  }, []);

  // ── Open envelope ──────────────────────────────────────────────────────────
  function openEnvelope() {
    setIsOpen(true);
    setTimeout(() => setCanEnter(true), 1200);
    if (audioRef.current && audioAvail) {
      audioRef.current.muted = isMuted;
      void audioRef.current.play().catch(() => undefined);
    }
  }

  // ── Enter: dismiss gate → show hero ───────────────────────────────────────
  function enter() {
    // Persist so returning visits skip gate
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "entered");
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${cookieName}=1; expires=${expires}; path=/; SameSite=Lax`;
    }
    if (audioRef.current) audioRef.current.pause();

    // Fade gate out
    setGateLeaving(true);
    setTimeout(() => {
      setPhase("hero");
      // Small rAF delay so hero is painted before we trigger its reveal
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setHeroVisible(true);
      }));
    }, 600);
  }

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

  // ── SSR guard ─────────────────────────────────────────────────────────────
  if (!isMounted) {
    // Don't render anything until client hydrates (avoids flicker)
    return <div style={{ minHeight: "100dvh" }}>{children}</div>;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ── Gate overlay ── */
        @keyframes ci-fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes ci-fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ci-scaleIn { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
        @keyframes ci-lineGrow{ from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
        @keyframes ci-ticker  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes ci-sealPulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,169,110,0)} 50%{box-shadow:0 0 28px 6px rgba(201,169,110,0.28)} }
        @keyframes ci-petalDrift {
          0%  {transform:translateY(105vh) translateX(0) rotate(0deg);opacity:0}
          5%  {opacity:.55}
          88% {opacity:.30}
          100%{transform:translateY(-8vh) translateX(30px) rotate(220deg);opacity:0}
        }
        @keyframes ci-scrollBounce {
          0%,100%{transform:translateX(-50%) translateY(0)}
          50%    {transform:translateX(-50%) translateY(7px)}
        }
        @keyframes ci-heroFadeUp {
          from{opacity:0;transform:translateY(22px)}
          to  {opacity:1;transform:translateY(0)}
        }
        @keyframes ci-heroLineGrow {
          from{transform:scaleX(0)}
          to  {transform:scaleX(1)}
        }
        @keyframes ci-glowPulse {
          0%,100%{opacity:.55} 50%{opacity:.85}
        }
        @keyframes ci-slowZoom {
          0%  {transform:scale(1.00)}
          100%{transform:scale(1.06)}
        }

        /* Gate leave */
        .ci-gate-leave { animation: ci-fadeIn .01s both; opacity:0; transition: opacity 0.6s ease !important; }
        .ci-gate-leaving { opacity:0 !important; }

        /* Hero element reveals — staggered */
        .ci-h0,.ci-h1,.ci-h2,.ci-h3,.ci-h4,.ci-h5,.ci-h6,.ci-h7 { opacity:0; }
        .ci-vis .ci-h0 { animation: ci-heroFadeUp 0.7s 0.05s ease forwards; }
        .ci-vis .ci-h1 { animation: ci-heroFadeUp 0.8s 0.2s  cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h2 { animation: ci-heroFadeUp 0.8s 0.38s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h3 { animation: ci-heroFadeUp 0.8s 0.54s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h4 { animation: ci-heroFadeUp 0.7s 0.70s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h5 { animation: ci-heroFadeUp 0.7s 0.86s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h6 { animation: ci-heroFadeUp 0.7s 1.00s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-h7 { animation: ci-heroFadeUp 0.7s 1.16s cubic-bezier(.22,1,.36,1) forwards; }
        .ci-vis .ci-line {
          transform-origin: center;
          animation: ci-heroLineGrow 0.9s 0.65s ease forwards;
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════════
          PHASE 1 — GATE OVERLAY
      ════════════════════════════════════════════════════════════ */}
      {phase === "gate" && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: ONYX,
            transition: "opacity 0.6s ease",
            opacity: gateLeaving ? 0 : 1,
            pointerEvents: gateLeaving ? "none" : "auto",
            overflow: "hidden",
          }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* Ambient radial glow */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            background: `
              radial-gradient(ellipse 80% 55% at 20% 30%, rgba(201,169,110,0.09) 0%, transparent 60%),
              radial-gradient(ellipse 70% 50% at 80% 70%, rgba(200,153,138,0.06) 0%, transparent 60%)
            `,
            animation: "ci-glowPulse 8s ease-in-out infinite",
          }} />

          {/* Letterbox bars */}
          <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: "clamp(36px,7vh,72px)", background: "linear-gradient(to bottom, rgba(5,3,2,0.96), rgba(5,3,2,0.65))", zIndex: 6 }} />
          <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "clamp(36px,7vh,72px)", background: "linear-gradient(to top, rgba(5,3,2,0.96), rgba(5,3,2,0.65))", zIndex: 6 }} />

          {/* Vignette */}
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.72) 100%)", zIndex: 4 }} />

          {/* Top controls */}
          <div style={{ position: "absolute", top: "clamp(40px,8vh,80px)", right: 16, zIndex: 10, display: "flex", gap: 8, animation: "ci-fadeIn 1s 1s ease both", opacity: 0 }}>
            {audioAvail === true && (
              <button
                type="button" onClick={toggleMusic}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 2, background: "transparent", border: `1px solid rgba(201,169,110,0.28)`, color: `rgba(201,169,110,0.55)`, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: BF, cursor: "pointer", transition: "all .3s" }}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                {isMuted ? "Music" : "Mute"}
              </button>
            )}
            <button
              type="button" onClick={enter}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 2, background: "transparent", border: `1px solid rgba(201,169,110,0.22)`, color: `rgba(201,169,110,0.42)`, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: BF, cursor: "pointer", transition: "all .3s" }}
            >
              <SkipForward size={12} />
              Skip
            </button>
          </div>

          {/* ── Envelope card ── */}
          <div style={{
            position: "relative", zIndex: 5,
            width: "100%", maxWidth: 520,
            padding: "0 20px",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 0,
          }}>

            {!isOpen ? (
              /* ── SEALED state ── */
              <div style={{ textAlign: "center", animation: "ci-scaleIn 0.8s 0.3s cubic-bezier(.22,1,.36,1) both", opacity: 0 }}>
                {/* Eyebrow */}
                <p style={{ fontSize: "0.52rem", letterSpacing: "0.44em", textTransform: "uppercase", color: `rgba(201,169,110,0.55)`, fontFamily: BF, fontWeight: 700, marginBottom: "1.5rem" }}>
                  A personal invitation
                </p>

                {/* "For [guest name]" */}
                <p style={{ fontFamily: DF, fontSize: "clamp(1.1rem,3.5vw,1.5rem)", color: "rgba(240,232,220,0.55)", fontStyle: "italic", marginBottom: "0.25rem" }}>
                  For
                </p>
                <p style={{ fontFamily: DF, fontSize: "clamp(1.6rem,6vw,2.8rem)", fontWeight: 600, color: "#F0E8DC", letterSpacing: "0.02em", lineHeight: 1.1, marginBottom: "2rem" }}>
                  {guestLabel}
                </p>

                {/* Ornamental rule */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2.5rem", justifyContent: "center" }}>
                  <div style={{ flex: 1, maxWidth: 80, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
                  <span style={{ color: GOLD, fontSize: 14 }}>✦</span>
                  <div style={{ flex: 1, maxWidth: 80, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
                </div>

                {/* Wax seal */}
                <button
                  type="button"
                  onClick={openEnvelope}
                  style={{
                    width: "clamp(88px,22vw,120px)", height: "clamp(88px,22vw,120px)",
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 38% 38%, #d4aa6e, #8a5c2a)`,
                    border: "none", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                    animation: "ci-sealPulse 3s ease-in-out infinite",
                    transition: "transform 0.22s ease",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <span style={{ fontFamily: DF, fontSize: "clamp(1.2rem,4vw,1.75rem)", color: "#FAF6F0", fontWeight: 700, letterSpacing: "0.06em", lineHeight: 1 }}>
                    {initials}
                  </span>
                  <span style={{ fontSize: "0.42rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(250,246,240,0.65)", fontFamily: BF }}>
                    tap to open
                  </span>
                </button>

                <p style={{ marginTop: "1.5rem", fontSize: "0.52rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(201,169,110,0.38)", fontFamily: BF }}>
                  sealed with love
                </p>
              </div>
            ) : (
              /* ── OPENED state ── */
              <div style={{ textAlign: "center", width: "100%", animation: "ci-fadeIn 0.5s ease both" }}>
                {/* Monogram circle */}
                <div style={{ animation: "ci-scaleIn 0.6s 0s ease both", opacity: 0 }}>
                  <div style={{
                    width: "clamp(72px,18vw,96px)", height: "clamp(72px,18vw,96px)",
                    borderRadius: "50%", margin: "0 auto 1.5rem",
                    background: "rgba(201,169,110,0.10)", border: `1px solid rgba(201,169,110,0.35)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 40px rgba(201,169,110,0.12)",
                  }}>
                    <span style={{ fontFamily: DF, fontSize: "clamp(1.2rem,3.5vw,1.6rem)", color: GOLD, letterSpacing: "0.1em" }}>
                      {initials}
                    </span>
                  </div>
                </div>

                {/* Couple names */}
                <div style={{ animation: "ci-fadeUp 0.7s 0.15s ease both", opacity: 0 }}>
                  <h1 style={{ fontFamily: DF, fontSize: "clamp(1.8rem,7vw,3rem)", fontWeight: 300, color: "#F0E8DC", lineHeight: 1.05, letterSpacing: "-0.01em" }}>
                    {brideFirst}
                    <span style={{ color: GOLD, fontStyle: "italic", fontWeight: 300, fontSize: "0.65em", margin: "0 0.3em" }}>&amp;</span>
                    {groomFirst}
                  </h1>
                </div>

                {/* Subtitle */}
                <div style={{ animation: "ci-fadeUp 0.7s 0.3s ease both", opacity: 0 }}>
                  <p style={{ fontFamily: BF, fontSize: "clamp(0.72rem,1.8vw,0.85rem)", color: "rgba(201,169,110,0.65)", letterSpacing: "0.06em", margin: "0.75rem 0 1.5rem" }}>
                    {subtitle}
                  </p>
                </div>

                {/* Gold rule */}
                <div style={{ animation: "ci-fadeIn 0.6s 0.4s ease both", opacity: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: "1.5rem" }}>
                    <div style={{ flex: 1, maxWidth: 60, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
                    <span style={{ color: GOLD, fontSize: 12 }}>✦</span>
                    <div style={{ flex: 1, maxWidth: 60, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
                  </div>
                </div>

                {/* Personal greeting */}
                <div style={{ animation: "ci-fadeUp 0.7s 0.45s ease both", opacity: 0 }}>
                  <div style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,110,0.18)",
                    borderRadius: 16, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", textAlign: "left",
                  }}>
                    <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: "clamp(0.85rem,2vw,1rem)", color: "rgba(240,232,220,0.82)", lineHeight: 1.75 }}>
                      Dear {guestLabel},
                    </p>
                    <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: "clamp(0.85rem,2vw,1rem)", color: "rgba(240,232,220,0.62)", lineHeight: 1.75, marginTop: "0.5rem" }}>
                      {brideFirst} and {groomFirst} warmly invite you to witness and
                      celebrate their union. You are not just a guest — you are part
                      of the story that brought them here.
                    </p>
                  </div>
                </div>

                {/* Enter CTA */}
                {canEnter && (
                  <div style={{ animation: "ci-scaleIn 0.6s 0s ease both" }}>
                    <button
                      type="button"
                      onClick={enter}
                      style={{
                        padding: "16px 48px", background: "transparent",
                        border: `1px solid ${GOLD}`, color: GOLD,
                        fontFamily: BF, fontSize: "0.7rem", letterSpacing: "0.36em",
                        textTransform: "uppercase", cursor: "pointer",
                        transition: "all 0.35s ease", borderRadius: 2,
                        position: "relative", overflow: "hidden",
                      }}
                      onMouseEnter={e => {
                        const btn = e.currentTarget;
                        btn.style.background = GOLD;
                        btn.style.color = ONYX;
                      }}
                      onMouseLeave={e => {
                        const btn = e.currentTarget;
                        btn.style.background = "transparent";
                        btn.style.color = GOLD;
                      }}
                    >
                      Open invitation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          PHASE 2 — CINEMATIC HERO (always first visible section)
          Rendered when phase === "hero" or "done"
      ════════════════════════════════════════════════════════════ */}
      {(phase === "hero" || phase === "done") && (
        <div className={heroVisible ? "ci-vis" : ""}>

          {/* Full-viewport hero */}
          <section style={{
            position: "relative",
            minHeight: "100dvh",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center",
            overflow: "hidden",
            background: ONYX,
          }}>

            {/* Background photo */}
            {heroPhotoUrl && (
              <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
                <div style={{
                  position: "absolute", inset: "-6%",
                  backgroundImage: `url(${heroPhotoUrl})`,
                  backgroundSize: "cover", backgroundPosition: "center center",
                  filter: "saturate(0.6) brightness(0.42)",
                  animation: "ci-slowZoom 30s ease-in-out infinite alternate",
                }} />
              </div>
            )}

            {/* Overlays */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 1,
              background: `
                radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,169,110,0.08) 0%, transparent 65%),
                linear-gradient(to bottom, rgba(14,12,10,0.55) 0%, rgba(14,12,10,0.15) 35%, rgba(14,12,10,0.15) 65%, rgba(14,12,10,0.75) 100%)
              `,
            }} />
            {/* Letterbox */}
            <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 56, background: "linear-gradient(to bottom, rgba(5,3,2,0.88), transparent)", zIndex: 2 }} />
            <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top, rgba(5,3,2,0.92), transparent)", zIndex: 2 }} />

            {/* Content */}
            <div style={{ position: "relative", zIndex: 5, padding: "5rem 1.5rem 7rem", maxWidth: 700, width: "100%" }}>

              {/* Eyebrow */}
              <div className="ci-h0" style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", marginBottom: "2rem" }}>
                <div style={{ width: 36, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
                <span style={{ fontFamily: BF, fontSize: "0.52rem", letterSpacing: "0.48em", textTransform: "uppercase", color: `rgba(201,169,110,0.80)`, fontWeight: 700 }}>
                  {title}
                </span>
                <div style={{ width: 36, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
              </div>

              {/* Bride name */}
              <h1 className="ci-h1" style={{
                fontFamily: DF,
                fontSize: "clamp(3.5rem,13vw,8rem)",
                fontWeight: 700, lineHeight: 0.87, letterSpacing: "-0.03em",
                color: "#FFFFFF",
                textShadow: "0 2px 40px rgba(0,0,0,0.6), 0 0 80px rgba(201,169,110,0.10)",
                marginBottom: "0.04em",
              }}>
                {brideFirst}
              </h1>

              {/* & */}
              <p className="ci-h2" style={{
                fontFamily: DF, fontSize: "clamp(1.6rem,4.5vw,3rem)",
                fontWeight: 300, fontStyle: "italic",
                color: GOLD, letterSpacing: "0.08em", lineHeight: 1.2, marginBottom: "0.04em",
              }}>
                &amp;
              </p>

              {/* Groom name */}
              <h1 className="ci-h3" style={{
                fontFamily: DF,
                fontSize: "clamp(3.5rem,13vw,8rem)",
                fontWeight: 700, lineHeight: 0.87, letterSpacing: "-0.03em",
                color: "#E8D5B0",
                textShadow: "0 2px 40px rgba(0,0,0,0.5), 0 0 60px rgba(201,169,110,0.18)",
                marginBottom: "1.75rem",
              }}>
                {groomFirst}
              </h1>

              {/* Gold rule */}
              <div className="ci-line" style={{
                width: "min(260px, 55%)", height: 1, margin: "0 auto 1.75rem",
                background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                transformOrigin: "center",
              }} />

              {/* Date · Venue · City */}
              <div className="ci-h4" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
                {weddingDate && (
                  <span style={{ fontFamily: BF, fontSize: "0.875rem", color: "rgba(240,232,220,0.88)", letterSpacing: "0.05em", fontWeight: 500 }}>
                    {weddingDate}
                  </span>
                )}
                {venueName && (
                  <>
                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: GOLD, display: "inline-block", opacity: 0.6 }} />
                    <span style={{ fontFamily: BF, fontSize: "0.875rem", color: "rgba(240,232,220,0.65)", letterSpacing: "0.04em" }}>
                      {venueName}
                    </span>
                  </>
                )}
                {venueCity && (
                  <>
                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: GOLD, display: "inline-block", opacity: 0.4 }} />
                    <span style={{ fontFamily: BF, fontSize: "0.875rem", color: "rgba(240,232,220,0.48)", letterSpacing: "0.04em" }}>
                      {venueCity}
                    </span>
                  </>
                )}
              </div>

              {/* Personalised "For [guest]" */}
              <div className="ci-h5" style={{ marginBottom: "2.25rem" }}>
                <span style={{
                  display: "inline-block", padding: "6px 20px",
                  border: "1px solid rgba(201,169,110,0.28)", borderRadius: 2,
                  fontFamily: DF, fontStyle: "italic",
                  fontSize: "clamp(0.8rem,1.8vw,0.95rem)",
                  color: "rgba(201,169,110,0.72)",
                  letterSpacing: "0.04em",
                }}>
                  A personal invitation for {guestLabel}
                </span>
              </div>

              {/* Scroll CTA */}
              <div className="ci-h6" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <a
                  href="#invite-content"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "13px 36px", background: "transparent",
                    border: `1px solid ${GOLD}`, color: GOLD,
                    fontFamily: BF, fontSize: "0.68rem", letterSpacing: "0.36em",
                    textTransform: "uppercase", textDecoration: "none",
                    borderRadius: 2, transition: "all 0.35s ease",
                  }}
                  onMouseEnter={e => { const a = e.currentTarget; a.style.background = GOLD; a.style.color = ONYX; }}
                  onMouseLeave={e => { const a = e.currentTarget; a.style.background = "transparent"; a.style.color = GOLD; }}
                >
                  View invitation
                </a>
              </div>
            </div>

            {/* Scroll-down hint */}
            <div className="ci-h7" style={{
              position: "absolute", bottom: 28, left: "50%",
              transform: "translateX(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              zIndex: 5,
              animation: heroVisible ? "ci-heroFadeUp 0.7s 1.3s ease forwards" : "none",
            }}>
              <span style={{ fontFamily: BF, fontSize: "0.46rem", letterSpacing: "0.38em", textTransform: "uppercase", color: `rgba(201,169,110,0.52)` }}>
                Scroll
              </span>
              <div style={{ width: 1, height: 32, background: `linear-gradient(to bottom, ${GOLD}, transparent)`, opacity: 0.55 }} />
              <ChevronDown size={14} style={{ color: `rgba(201,169,110,0.50)`, animation: "ci-scrollBounce 2s ease-in-out infinite" }} />
            </div>
          </section>

          {/* ── THE REST OF THE INVITE PAGE ── */}
          <div id="invite-content">
            {children}
          </div>

        </div>
      )}
    </>
  );
}

export default CinematicIntro;
