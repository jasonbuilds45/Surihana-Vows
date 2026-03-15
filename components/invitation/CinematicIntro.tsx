"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SkipForward, Volume2, VolumeX } from "lucide-react";
import { VaultLock } from "@/components/interactive/VaultLock";
import { animateEnvelopeOpen } from "@/animations/premium/envelopeAnimation";
import { animateWaxSealTap } from "@/animations/premium/waxSealTap";
import { animateCoupleIllustration } from "@/animations/premium/coupleIllustration";
import { animateRingIntro } from "@/animations/luxury/ringIntro";
import { playCinematicSequence } from "@/animations/luxury/cinematicSequence";

interface CinematicIntroProps {
  inviteCode: string;
  guestLabel: string;
  brideName: string;
  groomName: string;
  title: string;
  subtitle: string;
  audioSrc?: string | null;
  children: ReactNode;
}

export function CinematicIntro({
  inviteCode, guestLabel, brideName, groomName,
  title, subtitle, audioSrc = "/audio/wedding-theme.mp3", children,
}: CinematicIntroProps) {
  const [hasEntered, setHasEntered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [canEnter, setCanEnter] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState<boolean | null>(audioSrc ? null : false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const envelopeRef = useRef<HTMLDivElement | null>(null);
  const sealRef = useRef<HTMLButtonElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const greetingRef = useRef<HTMLDivElement | null>(null);

  const initials = useMemo(() => `${brideName.charAt(0)}${groomName.charAt(0)}`.toUpperCase(), [brideName, groomName]);
  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];
  const storageKey = `surihana-intro:${inviteCode}`;

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey) === "entered") {
      setHasEntered(true);
    }
  }, [storageKey]);

  const setAudioRef = (el: HTMLAudioElement | null) => {
    audioRef.current = el;
    if (!el) return;
    el.addEventListener("canplaythrough", () => setAudioAvailable(true), { once: true });
    el.addEventListener("error", () => setAudioAvailable(false), { once: true });
    if (el.readyState >= 3) setAudioAvailable(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const teardown: Array<() => void> = [];
    const t = window.setTimeout(() => setCanEnter(true), 1400);
    if (headlineRef.current && subRef.current) {
      const c = playCinematicSequence({ backdrop: document.body, headline: headlineRef.current, subheadline: subRef.current });
      if (c) teardown.push(() => c.kill());
    }
    if (envelopeRef.current) { const e = animateEnvelopeOpen(envelopeRef.current); if (e) teardown.push(() => e.kill()); }
    if (ringRef.current) { const r = animateRingIntro(ringRef.current); if (r) teardown.push(() => r.kill()); }
    if (greetingRef.current) { const g = animateCoupleIllustration(greetingRef.current); if (g) teardown.push(() => g.kill()); }
    if (audioRef.current && audioAvailable) {
      audioRef.current.muted = isMuted;
      void audioRef.current.play().catch(() => undefined);
    }
    return () => { clearTimeout(t); teardown.forEach((fn) => fn()); };
  }, [isOpen, isMuted, audioAvailable]);

  function enter() {
    if (typeof window !== "undefined") sessionStorage.setItem(storageKey, "entered");
    if (audioRef.current) audioRef.current.pause();
    setHasEntered(true);
  }

  function openEnvelope() {
    if (sealRef.current) animateWaxSealTap(sealRef.current);
    setIsOpen(true);
  }

  function toggleMusic() {
    if (!audioRef.current || !audioAvailable) return;
    setIsMuted((v) => { const next = !v; if (audioRef.current) { audioRef.current.muted = next; if (!next) void audioRef.current.play().catch(() => undefined); } return next; });
  }

  return (
    <div className="relative">
      {isMounted && !hasEntered ? (
        <div
          className="fixed inset-0 z-[120] flex flex-col overflow-y-auto"
          style={{ background: "var(--color-background)" }}
        >
          {audioSrc && <audio loop preload="auto" ref={setAudioRef} src={audioSrc} />}

          {/* Soft top radial */}
          <div
            className="pointer-events-none fixed inset-x-0 top-0 h-64"
            style={{ background: "radial-gradient(ellipse 100% 100% at 50% 0%, rgba(212,179,155,0.18) 0%, transparent 100%)" }}
          />

          {/* Controls */}
          <div className="fixed top-0 right-0 z-10 flex items-center gap-2 p-4">
            {audioAvailable === true && (
              <button
                type="button" onClick={toggleMusic}
                className="flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] uppercase transition"
                style={{ letterSpacing: "0.26em", borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-muted)" }}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {isMuted ? "Music" : "Mute"}
              </button>
            )}
            <button
              type="button" onClick={enter}
              className="flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] uppercase transition"
              style={{ letterSpacing: "0.26em", borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-muted)" }}
            >
              <SkipForward className="h-3.5 w-3.5" />
              Skip
            </button>
          </div>

          {/* Envelope card — centred, mobile-first */}
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-24">
            <div
              ref={envelopeRef}
              className="w-full max-w-sm overflow-hidden rounded-3xl"
              style={{
                background: "linear-gradient(145deg, oklch(99% 0.004 65) 0%, var(--c-canvas) 40%, oklch(95% 0.010 55) 100%)",
                boxShadow: "12px 12px 28px oklch(80% 0.015 50 / 0.50), -10px -10px 24px oklch(100% 0 0 / 0.80), inset 0 1px 0 oklch(100% 0 0 / 0.60)",
              }}
            >
              {/* Rose gold top stripe */}
              <div style={{ height: 2, background: "linear-gradient(90deg, transparent, var(--color-accent-soft), var(--color-accent-gold), var(--color-accent-soft), transparent)" }} />

              <div className="p-7 sm:p-9 space-y-8">
                {/* Addressed to */}
                <div className="text-center space-y-1.5">
                  <p
                    className="section-label"
                    style={{ color: "var(--color-accent-soft)" }}
                  >
                    A personal invitation for
                  </p>
                  <p
                    className="font-display text-2xl"
                    style={{ color: "var(--color-text-primary)", letterSpacing: "0.04em" }}
                  >
                    {guestLabel}
                  </p>
                </div>

                {/* Wax seal — tap to open */}
                {!isOpen ? (
                  <div className="flex flex-col items-center gap-5">
                    <div className="flex items-center gap-3 w-full">
                      <div style={{ flex: 1, height: 1, background: "var(--c-border)" }} />
                      <span style={{ fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--c-ink-3)", fontFamily: "var(--font-body), sans-serif", fontWeight: 600 }}>sealed with love</span>
                      <div style={{ flex: 1, height: 1, background: "var(--c-border)" }} />
                    </div>

                    <VaultLock
                      initials={initials}
                      onOpen={openEnvelope}
                      label="Tap to open your invitation"
                    />
                  </div>
                ) : (
                  <div className="space-y-7 animate-fade-in">
                    {/* Monogram */}
                    <div className="flex justify-center" ref={ringRef}>
                      <div
                        className="grid h-20 w-20 place-items-center rounded-full"
                        style={{ border: "1px solid rgba(212,179,155,0.4)", background: "rgba(212,179,155,0.08)" }}
                      >
                        <span className="font-display text-2xl" style={{ color: "var(--color-accent-soft)", letterSpacing: "0.1em" }}>
                          {initials}
                        </span>
                      </div>
                    </div>

                    {/* Names */}
                    <div className="text-center space-y-2">
                      <h1
                        ref={headlineRef}
                        className="font-display"
                        style={{ fontSize: "clamp(1.75rem, 8vw, 2.75rem)", color: "var(--color-text-primary)", letterSpacing: "0.05em", lineHeight: 1.15 }}
                      >
                        {brideFirst} &amp; {groomFirst}
                      </h1>
                      <p
                        ref={subRef}
                        className="text-sm leading-7 px-2"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {subtitle}
                      </p>
                    </div>

                    {/* Personal greeting */}
                    <div
                      ref={greetingRef}
                      className="rounded-2xl p-5 space-y-3"
                      style={{ background: "var(--color-surface-muted)", border: "1px solid var(--color-border)" }}
                    >
                      <p className="section-label" style={{ color: "var(--color-accent)" }}>
                        A personal welcome
                      </p>
                      <p className="text-sm leading-7" style={{ color: "var(--color-text-primary)" }}>
                        Dear {guestLabel},
                      </p>
                      <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
                        {brideFirst} and {groomFirst} invite you to witness and celebrate their union.
                        You are not just a guest — you are part of the story that brought them here.
                      </p>
                    </div>

                    {/* Enter CTA */}
                    {canEnter && (
                      <button
                        type="button"
                        onClick={enter}
                        className="w-full rounded-full py-4 text-sm uppercase font-medium transition"
                        style={{
                          letterSpacing: "0.28em",
                          background: "var(--color-accent)",
                          color: "#fff",
                          boxShadow: "0 8px 28px rgba(138,90,68,0.35)",
                        }}
                      >
                        Open invitation
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom stripe */}
              <div style={{ height: 2, background: "linear-gradient(90deg, transparent, var(--color-accent-soft), var(--color-accent-gold), var(--color-accent-soft), transparent)" }} />
            </div>

            <p
              className="mt-8 section-label"
              style={{ color: "var(--color-text-muted)" }}
            >
              {title}
            </p>
          </div>
        </div>
      ) : null}

      <div className={hasEntered || !isMounted ? "opacity-100" : "pointer-events-none opacity-0"}>
        {children}
      </div>
    </div>
  );
}

export default CinematicIntro;
