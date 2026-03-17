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

"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SkipForward, Volume2, VolumeX } from "lucide-react";

/**
 * CinematicIntro — The "Lead Engineer" Edition
 * Focused on: Structural performance, Design Hierarchy, and Luxurious Polish.
 */

// ── Design Tokens ──────────────────────────────────────────────────────────
const BRAND = {
  ROSE: "#C0364A",
  GOLD: "#B8820A",
  GOLD_GLOW: "rgba(184, 130, 10, 0.3)",
  ONYX: "#0A0608",
  LINEN: "#F4EFE9",
  TEXT_MAIN: "#1A1012",
  TEXT_MUTED: "#7A5460",
  WHITE_SOFT: "#FAF8F6"
};

const FONTS = {
  DISPLAY: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
  BODY: "var(--font-body), system-ui, -apple-system, sans-serif"
};

interface CinematicIntroProps {
  inviteCode: string;
  guestLabel: string;
  brideName: string;
  groomName: string;
  title: string;
  subtitle: string;
  weddingDate?: string;
  venueName?: string;
  venueCity?: string;
  heroPhotoUrl?: string;
  audioSrc?: string | null;
  children: ReactNode;
}

type Phase = "teaser" | "envelope" | "hero";

export function CinematicIntro({
  inviteCode, guestLabel, brideName, groomName,
  title, subtitle, weddingDate, venueName, venueCity,
  heroPhotoUrl, audioSrc = "/audio/wedding-theme.mp3", children,
}: CinematicIntroProps) {

  const [isMounted, setIsMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("teaser");
  const [scene, setScene] = useState(0);
  const [sceneVisible, setSceneVisible] = useState(true);
  const [phaseLeaving, setPhaseLeaving] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const storageKey = `invite-intro-seen-${inviteCode}`;

  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];
  const initials = `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase();

  // ── Logic: Persistent State ──────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    const hasSeen = sessionStorage.getItem(storageKey);
    if (hasSeen) {
      setPhase("hero");
      setHeroVisible(true);
    }
  }, [storageKey]);

  // ── Scene Sequencing ─────────────────────────────────────────────────────
  const SCENE_HOLD = [3500, 3000, 3000, 3000, 3500];
  
  useEffect(() => {
    if (phase !== "teaser") return;
    const timer = setTimeout(() => {
      setSceneVisible(false);
      setTimeout(() => {
        if (scene < SCENE_HOLD.length - 1) {
          setScene(s => s + 1);
          setSceneVisible(true);
        } else {
          transitionToPhase("envelope");
        }
      }, 1000); // Crossfade duration
    }, SCENE_HOLD[scene]);
    return () => clearTimeout(timer);
  }, [scene, phase]);

  const transitionToPhase = (next: Phase) => {
    setPhaseLeaving(true);
    setTimeout(() => {
      setPhase(next);
      setPhaseLeaving(false);
      if (next === "hero") setHeroVisible(true);
    }, 800);
  };

  const handleOpen = () => {
    setEnvelopeOpen(true);
    sessionStorage.setItem(storageKey, "true");
    setTimeout(() => transitionToPhase("hero"), 800);
  };

  if (!isMounted) return <div style={{ background: BRAND.ONYX, minHeight: "100dvh" }} />;

  return (
    <>
      <style>{`
        @keyframes subtleZoom { from { transform: scale(1); } to { transform: scale(1.05); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        
        .luxury-text {
          background: linear-gradient(to bottom, #fff 0%, #d4a020 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .glass-ui {
          backdrop-filter: blur(8px);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .envelope-button {
          background: ${BRAND.ROSE};
          transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          box-shadow: 0 10px 30px -10px ${BRAND.ROSE};
        }

        .envelope-button:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 20px 40px -10px ${BRAND.ROSE};
          filter: brightness(1.1);
        }
      `}</style>

      {/* PHASE 1: TEASER */}
      {phase === "teaser" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000, background: BRAND.ONYX,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: phaseLeaving ? 0 : 1, transition: "opacity 1s ease"
        }}>
          {/* Background Ambient Texture */}
          <div style={{
            position: "absolute", inset: 0, 
            background: "radial-gradient(circle at center, #1a1012 0%, #0a0608 100%)",
            opacity: 0.6
          }} />

          {/* Skip Control */}
          <button 
            onClick={() => transitionToPhase("envelope")}
            className="glass-ui"
            style={{
              position: "absolute", top: "2rem", right: "2rem", zIndex: 10,
              padding: "0.5rem 1rem", color: BRAND.GOLD, borderRadius: "20px",
              fontSize: "0.7rem", letterSpacing: "2px", cursor: "pointer"
            }}
          >
            SKIP INTRO
          </button>

          <div style={{
            textAlign: "center", zIndex: 5, transition: "all 1s ease",
            opacity: sceneVisible ? 1 : 0, transform: sceneVisible ? "translateY(0)" : "translateY(10px)"
          }}>
            {scene === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontFamily: FONTS.BODY, fontSize: "0.7rem", letterSpacing: "6px", color: BRAND.GOLD }}>{title}</span>
                <div style={{ width: "40px", height: "1px", background: BRAND.GOLD }} />
                <h2 style={{ fontFamily: FONTS.DISPLAY, fontStyle: "italic", fontSize: "2rem", color: "#fff" }}>{subtitle}</h2>
              </div>
            )}

            {scene === 1 && (
               <h1 style={{ fontFamily: FONTS.DISPLAY, fontSize: "clamp(3rem, 10vw, 7rem)", color: "#fff" }}>{brideFirst}</h1>
            )}

            {scene === 2 && (
               <h1 style={{ fontFamily: FONTS.DISPLAY, fontSize: "clamp(3rem, 10vw, 7rem)", color: BRAND.GOLD }}>{groomFirst}</h1>
            )}

            {scene === 3 && (
               <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontFamily: FONTS.DISPLAY, fontSize: "3rem", color: "#fff" }}>{brideFirst}</span>
                  <span style={{ fontFamily: FONTS.DISPLAY, fontStyle: "italic", fontSize: "1.5rem", color: BRAND.GOLD }}>&</span>
                  <span style={{ fontFamily: FONTS.DISPLAY, fontSize: "3rem", color: "#fff" }}>{groomFirst}</span>
               </div>
            )}

            {scene === 4 && (
              <div style={{ animation: "subtleZoom 10s infinite alternate" }}>
                <p style={{ fontFamily: FONTS.BODY, letterSpacing: "4px", color: BRAND.GOLD, marginBottom: "1rem" }}>SAVE THE DATE</p>
                <h2 style={{ fontFamily: FONTS.DISPLAY, fontSize: "2.5rem", color: "#fff" }}>{weddingDate}</h2>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 2: ENVELOPE */}
      {phase === "envelope" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000, background: BRAND.LINEN,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: phaseLeaving ? 0 : 1, transition: "opacity 0.8s ease"
        }}>
          <div style={{ width: "90%", maxWidth: "420px", textAlign: "center" }}>
            <p style={{ fontFamily: FONTS.DISPLAY, fontStyle: "italic", color: BRAND.TEXT_MUTED, marginBottom: "0.5rem" }}>
              Especially for
            </p>
            <h2 style={{ fontFamily: FONTS.DISPLAY, fontSize: "2rem", marginBottom: "3rem" }}>{guestLabel}</h2>
            
            <div style={{
              background: "#fff", padding: "3rem 2rem", borderRadius: "8px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.05)", position: "relative",
              border: "1px solid rgba(0,0,0,0.03)",
              transform: envelopeOpen ? "translateY(-100vh) rotate(-5deg)" : "translateY(0)",
              transition: "transform 1s cubic-bezier(0.19, 1, 0.22, 1)"
            }}>
              <div style={{ 
                width: "60px", height: "60px", borderRadius: "50%", background: BRAND.GOLD,
                margin: "0 auto 2rem", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: "bold", fontSize: "1.2rem", boxShadow: `0 0 20px ${BRAND.GOLD_GLOW}`
              }}>
                {initials}
              </div>
              <button 
                onClick={handleOpen}
                className="envelope-button"
                style={{
                  width: "100%", padding: "1.25rem", color: "#fff", border: "none",
                  borderRadius: "4px", cursor: "pointer", fontFamily: FONTS.BODY,
                  fontSize: "0.8rem", letterSpacing: "3px", fontWeight: 600
                }}
              >
                OPEN INVITATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: MAIN HERO CONTENT */}
      <main style={{ 
        opacity: heroVisible ? 1 : 0, 
        transform: heroVisible ? "translateY(0)" : "translateY(20px)",
        transition: "all 1.2s cubic-bezier(0.19, 1, 0.22, 1)"
      }}>
        {children}
      </main>
    </>
  );
}