/**
 * /preview-cinematic — Sandbox test page
 *
 * CONCEPT: Scroll-driven cinematic invitation.
 * Instead of auto-advancing timed scenes, the guest scrolls
 * (or swipes on mobile) through full-screen chapters.
 *
 * Each chapter is pinned full-screen. Scroll progress drives
 * a crossfade to the next. The seal/CTA appears on the final
 * chapter — same wax seal mechanic as the current trailer.
 *
 * CHAPTERS:
 *   0 · Title card        — "The Union" brand mark, slow letterform
 *   1 · Her name          — Marion, full-bleed, left anchor
 *   2 · His name          — Livingston, full-bleed, right anchor
 *   3 · The date          — tabular date, large numerals
 *   4 · The venues        — both venues stacked, church → coast
 *   5 · The word          — the intro quote, cinematic pull quote
 *   6 · The seal          — wax seal CTA, scroll unlocks
 *
 * This is a STANDALONE sandbox — no auth, no guest code, no DB.
 * Visit /preview-cinematic to test.
 * It is NOT linked from the navbar or any other page.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/lib/config";

// ── Tokens ────────────────────────────────────────────────────────────────────
const DF   = "'Cormorant Garamond',Georgia,serif";
const BF   = "'Manrope',system-ui,sans-serif";
const VOID = "#08050A";
const ROSE = "#BE2D45";
const GOLD = "#C9960A";

const BF_FIRST  = weddingConfig.brideName.split(" ")[0]!;
const GF_FIRST  = weddingConfig.groomName.split(" ")[0]!;
const INITIALS  = `${weddingConfig.brideName.charAt(0)}${weddingConfig.groomName.charAt(0)}`.toUpperCase();
const DATE_STR  = new Date(weddingConfig.weddingDate)
  .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const DAY_STR   = new Date(weddingConfig.weddingDate)
  .toLocaleDateString("en-GB", { weekday: "long" });

// ── Chapter definitions ───────────────────────────────────────────────────────
const CHAPTERS = [
  { id: "brand"   },
  { id: "bride"   },
  { id: "groom"   },
  { id: "date"    },
  { id: "venues"  },
  { id: "quote"   },
  { id: "seal"    },
] as const;

type ChapterId = typeof CHAPTERS[number]["id"];

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown() {
  const [days, setDays] = useState(0);
  useEffect(() => {
    const tick = () => {
      const ms = new Date(weddingConfig.weddingDate).getTime() - Date.now();
      setDays(Math.max(0, Math.floor(ms / 86400000)));
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);
  return days;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PreviewCinematic() {
  const [chapter, setChapter] = useState<ChapterId>("brand");
  const [fade,    setFade]    = useState(true);     // true = visible
  const [sealState, setSealState] = useState<"idle" | "burst" | "done">("idle");
  const [unlocked, setUnlocked]  = useState(false);
  const days = useCountdown();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Advance to next chapter ────────────────────────────────────────────────
  const advance = useCallback(() => {
    if (unlocked) return;
    const idx  = CHAPTERS.findIndex(c => c.id === chapter);
    const next = CHAPTERS[idx + 1];
    if (!next) return;

    setFade(false);
    timerRef.current = setTimeout(() => {
      setChapter(next.id);
      setFade(true);
    }, 500);
  }, [chapter, unlocked]);

  // ── Go back ────────────────────────────────────────────────────────────────
  const back = useCallback(() => {
    if (unlocked) return;
    const idx  = CHAPTERS.findIndex(c => c.id === chapter);
    const prev = CHAPTERS[idx - 1];
    if (!prev) return;

    setFade(false);
    timerRef.current = setTimeout(() => {
      setChapter(prev.id);
      setFade(true);
    }, 500);
  }, [chapter, unlocked]);

  // ── Keyboard + scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    let lastWheel = 0;

    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault(); advance();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault(); back();
      }
    }

    function onWheel(e: WheelEvent) {
      const now = Date.now();
      if (now - lastWheel < 700) return;
      lastWheel = now;
      if (e.deltaY > 30) advance();
      if (e.deltaY < -30) back();
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [advance, back]);

  // ── Touch swipe ────────────────────────────────────────────────────────────
  const touchStart = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0]!.clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const dy = touchStart.current - e.changedTouches[0]!.clientY;
    touchStart.current = null;
    if (dy > 50) advance();
    if (dy < -50) back();
  }

  // ── Seal click ─────────────────────────────────────────────────────────────
  function handleSeal() {
    if (sealState !== "idle") return;
    setSealState("burst");
    setTimeout(() => {
      setSealState("done");
      setUnlocked(true);
    }, 520);
  }

  // ── Progress ───────────────────────────────────────────────────────────────
  const idx      = CHAPTERS.findIndex(c => c.id === chapter);
  const total    = CHAPTERS.length;
  const isFirst  = idx === 0;
  const isLast   = chapter === "seal";

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // ── Scroll lock while trailer is running ───────────────────────────────────
  useEffect(() => {
    if (!unlocked) {
      document.body.style.overflow    = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow    = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow    = "";
      document.body.style.touchAction = "";
    };
  }, [unlocked]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes pc-up    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
        @keyframes pc-left  { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:none} }
        @keyframes pc-right { from{opacity:0;transform:translateX(32px)}  to{opacity:1;transform:none} }
        @keyframes pc-fade  { from{opacity:0} to{opacity:1} }
        @keyframes pc-line  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes pc-line-y{ from{transform:scaleY(0)} to{transform:scaleY(1)} }
        @keyframes pc-pulse {
          0%,100%{box-shadow:0 0 0 0 rgba(201,150,10,0),0 12px 36px rgba(0,0,0,.5)}
          50%    {box-shadow:0 0 0 18px rgba(201,150,10,.12),0 14px 40px rgba(0,0,0,.55)}
        }
        @keyframes pc-burst {
          0%  {transform:scale(1);opacity:1}
          40% {transform:scale(1.3) rotate(-6deg);opacity:.7;filter:brightness(2)}
          100%{transform:scale(0)  rotate(16deg);opacity:0;filter:brightness(3)}
        }
        @keyframes pc-ring {
          0%  {transform:scale(0);opacity:.6}
          100%{transform:scale(3.5);opacity:0}
        }
        @keyframes pc-bounce {
          0%,100%{transform:translateY(0)}
          50%    {transform:translateY(7px)}
        }
        @keyframes pc-slow-zoom {
          from{transform:scale(1.08)} to{transform:scale(1.0)}
        }
        .pc-in-up    { animation: pc-up    .85s cubic-bezier(.16,1,.3,1) both }
        .pc-in-left  { animation: pc-left  .90s cubic-bezier(.16,1,.3,1) both }
        .pc-in-right { animation: pc-right .90s cubic-bezier(.16,1,.3,1) both }
        .pc-in-fade  { animation: pc-fade  .70s ease both }

        /* stagger delays */
        .d0  { animation-delay: .00s }
        .d1  { animation-delay: .12s }
        .d2  { animation-delay: .24s }
        .d3  { animation-delay: .38s }
        .d4  { animation-delay: .52s }
        .d5  { animation-delay: .68s }

        /* nav arrow hint */
        .pc-hint { animation: pc-bounce 2.2s ease-in-out infinite }
      `}</style>

      {/* ── Full-screen stage ── */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position: "fixed", inset: 0,
          background: VOID,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          userSelect: "none",
          opacity: fade ? 1 : 0,
          transition: "opacity .5s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* ── Ambient background bloom — changes colour per chapter ── */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: chapter === "bride"
            ? `radial-gradient(ellipse 60% 55% at 15% 35%, rgba(190,45,69,.08) 0%, transparent 60%)`
            : chapter === "groom"
            ? `radial-gradient(ellipse 60% 55% at 85% 65%, rgba(201,150,10,.07) 0%, transparent 60%)`
            : `radial-gradient(ellipse 55% 50% at 50% 50%, rgba(190,45,69,.05) 0%, transparent 65%)`,
          transition: "background 1s ease",
        }} />

        {/* ════════════ CHAPTER CONTENT ════════════ */}
        <div style={{
          position: "relative", zIndex: 2,
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "clamp(2rem,6vw,6rem) clamp(1.5rem,6vw,7rem)",
        }}>

          {/* ── 0 · BRAND ── */}
          {chapter === "brand" && (
            <div style={{ textAlign: "center" }}>
              {/* Monogram */}
              <div className="pc-in-fade d0" style={{ marginBottom: "2rem" }}>
                <div style={{
                  width: "clamp(72px,14vw,108px)", height: "clamp(72px,14vw,108px)",
                  borderRadius: "50%", margin: "0 auto",
                  border: `1.5px solid rgba(201,150,10,.45)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 0 8px rgba(201,150,10,.04), 0 0 0 20px rgba(201,150,10,.02)",
                }}>
                  <span style={{
                    fontFamily: DF, fontSize: "clamp(1.8rem,5vw,3.2rem)",
                    fontWeight: 600, color: `rgba(201,150,10,.75)`,
                    letterSpacing: ".12em",
                  }}>{INITIALS}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="pc-in-up d1" style={{
                fontFamily: DF, fontWeight: 300,
                fontSize: "clamp(1rem,2.5vw,1.5rem)",
                color: "rgba(255,252,248,.55)",
                letterSpacing: ".55em", textTransform: "uppercase",
                marginBottom: "2.5rem",
              }}>
                {weddingConfig.celebrationTitle}
              </h1>

              {/* Rule */}
              <div className="pc-in-fade d2" style={{
                width: "min(120px,28%)", height: 1,
                background: `linear-gradient(to right, transparent, rgba(201,150,10,.55), transparent)`,
                margin: "0 auto 2.5rem",
              }} />

              {/* Names */}
              <p className="pc-in-up d3" style={{
                fontFamily: DF, fontStyle: "italic",
                fontSize: "clamp(1.5rem,4vw,3rem)",
                color: "rgba(255,252,248,.80)",
                letterSpacing: ".04em", lineHeight: 1.3,
              }}>
                {BF_FIRST} <span style={{ color: `rgba(190,45,69,.65)` }}>&amp;</span> {GF_FIRST}
              </p>

              {/* Date */}
              <p className="pc-in-fade d4" style={{
                fontFamily: BF, fontSize: ".60rem",
                letterSpacing: ".48em", textTransform: "uppercase",
                color: "rgba(255,255,255,.28)",
                marginTop: "1.5rem",
              }}>
                {DAY_STR} · {DATE_STR}
              </p>

              {/* Days count */}
              {days > 0 && (
                <p className="pc-in-fade d5" style={{
                  fontFamily: BF, fontSize: ".55rem",
                  letterSpacing: ".32em", textTransform: "uppercase",
                  color: `rgba(201,150,10,.50)`,
                  marginTop: ".875rem",
                }}>
                  {days} days away
                </p>
              )}
            </div>
          )}

          {/* ── 1 · BRIDE ── */}
          {chapter === "bride" && (
            <div style={{ width: "100%", maxWidth: "90vw" }}>
              {/* Eyebrow */}
              <p className="pc-in-fade d0" style={{
                fontFamily: BF, fontSize: ".46rem",
                letterSpacing: ".52em", textTransform: "uppercase",
                color: `rgba(190,45,69,.65)`, fontWeight: 700,
                marginBottom: "clamp(1.5rem,4vh,3rem)",
              }}>
                {weddingConfig.celebrationTitle}
              </p>

              {/* Name — enormous, bleeds edge */}
              <h1 className="pc-in-left d1" style={{
                fontFamily: DF, fontWeight: 300,
                fontSize: "clamp(5rem,18vw,16rem)",
                lineHeight: .82, letterSpacing: "-.04em",
                color: "#FFFFFF",
              }}>
                {BF_FIRST}.
              </h1>

              {/* Sub-name in full */}
              <p className="pc-in-fade d2" style={{
                fontFamily: BF, fontSize: "clamp(.70rem,1.4vw,.95rem)",
                letterSpacing: ".28em", textTransform: "uppercase",
                color: "rgba(255,255,255,.30)",
                marginTop: "clamp(.75rem,2vh,1.5rem)",
              }}>
                {weddingConfig.brideName}
              </p>

              {/* Rose rule */}
              <div className="pc-in-fade d3" style={{
                marginTop: "clamp(1rem,3vh,2rem)",
                width: "min(64px,16%)", height: 1,
                background: `linear-gradient(to right, ${ROSE}, transparent)`,
                transformOrigin: "left",
                animation: "pc-line .8s .5s ease both",
              }} />
            </div>
          )}

          {/* ── 2 · GROOM ── */}
          {chapter === "groom" && (
            <div style={{ width: "100%", maxWidth: "90vw", textAlign: "right", alignSelf: "center" }}>
              <p className="pc-in-fade d0" style={{
                fontFamily: BF, fontSize: ".46rem",
                letterSpacing: ".52em", textTransform: "uppercase",
                color: `rgba(201,150,10,.65)`, fontWeight: 700,
                marginBottom: "clamp(1.5rem,4vh,3rem)",
              }}>
                {weddingConfig.celebrationTitle}
              </p>

              <h1 className="pc-in-right d1" style={{
                fontFamily: DF, fontWeight: 300,
                fontSize: "clamp(5rem,18vw,16rem)",
                lineHeight: .82, letterSpacing: "-.04em",
                color: `rgba(232,188,20,.90)`,
              }}>
                {GF_FIRST}.
              </h1>

              <p className="pc-in-fade d2" style={{
                fontFamily: BF, fontSize: "clamp(.70rem,1.4vw,.95rem)",
                letterSpacing: ".28em", textTransform: "uppercase",
                color: "rgba(255,255,255,.30)",
                marginTop: "clamp(.75rem,2vh,1.5rem)",
              }}>
                {weddingConfig.groomName}
              </p>

              <div className="pc-in-fade d3" style={{
                marginTop: "clamp(1rem,3vh,2rem)",
                width: "min(64px,16%)", height: 1,
                marginLeft: "auto",
                background: `linear-gradient(to left, rgba(201,150,10,.70), transparent)`,
                transformOrigin: "right",
                animation: "pc-line .8s .5s ease both",
              }} />
            </div>
          )}

          {/* ── 3 · DATE ── */}
          {chapter === "date" && (
            <div>
              <p className="pc-in-fade d0" style={{
                fontFamily: BF, fontSize: ".46rem",
                letterSpacing: ".50em", textTransform: "uppercase",
                color: "rgba(255,255,255,.22)", fontWeight: 500,
                marginBottom: "clamp(2rem,5vh,4rem)",
              }}>
                The date
              </p>

              {/* Huge day number */}
              <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "clamp(.5rem,2vw,2rem)" }}>
                {["20", "May", "2026"].map((word, i) => (
                  <span key={word} className="pc-in-up" style={{
                    fontFamily: DF, fontWeight: 300,
                    fontSize: i === 1
                      ? "clamp(2.5rem,7vw,7rem)"
                      : "clamp(4rem,12vw,12rem)",
                    lineHeight: .88, letterSpacing: "-.03em",
                    color: i === 1
                      ? "#FFFFFF"
                      : "rgba(255,255,255,.28)",
                    animationDelay: `${i * .14}s`,
                  }}>
                    {word}
                  </span>
                ))}
              </div>

              {/* Day name */}
              <p className="pc-in-fade d3" style={{
                fontFamily: BF, fontSize: ".55rem",
                letterSpacing: ".44em", textTransform: "uppercase",
                color: `rgba(190,45,69,.60)`, fontWeight: 600,
                marginTop: "clamp(1.5rem,4vh,3rem)",
              }}>
                {DAY_STR} {days > 0 ? `· ${days} days from today` : "· Today"}
              </p>

              {/* Gold hairline */}
              <div className="pc-in-fade d4" style={{
                marginTop: "clamp(1.25rem,3vh,2.5rem)",
                width: "min(80px,20%)", height: 1,
                background: `linear-gradient(to right, rgba(201,150,10,.65), transparent)`,
              }} />
            </div>
          )}

          {/* ── 4 · VENUES ── */}
          {chapter === "venues" && (
            <div style={{ width: "100%", maxWidth: "clamp(320px,72vw,820px)" }}>
              <p className="pc-in-fade d0" style={{
                fontFamily: BF, fontSize: ".46rem",
                letterSpacing: ".48em", textTransform: "uppercase",
                color: "rgba(255,255,255,.22)", fontWeight: 500,
                marginBottom: "clamp(1.75rem,4vh,3.5rem)",
              }}>
                The venues · Chennai, Tamil Nadu
              </p>

              {/* Church */}
              <div className="pc-in-up d1" style={{
                display: "flex", alignItems: "flex-start",
                gap: "clamp(.75rem,2vw,1.5rem)",
                marginBottom: "clamp(1.25rem,3vh,2.25rem)",
              }}>
                <div style={{ flexShrink: 0 }}>
                  <span style={{
                    fontFamily: BF, fontSize: "clamp(.52rem,1.2vw,.68rem)",
                    fontWeight: 800, letterSpacing: ".14em",
                    color: `rgba(212,72,96,.85)`,
                  }}>3 PM</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    width: "clamp(18px,3vw,28px)", height: 1,
                    background: `rgba(190,45,69,.40)`,
                    marginBottom: ".625rem", marginTop: ".5em",
                  }} />
                  <p style={{
                    fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                    fontSize: "clamp(1.6rem,5vw,5rem)",
                    color: "rgba(255,255,255,.92)", lineHeight: 1.0,
                  }}>
                    Divine Mercy Church
                  </p>
                  <p style={{
                    fontFamily: BF, fontSize: ".68rem",
                    color: "rgba(255,255,255,.32)", marginTop: ".5rem",
                    letterSpacing: ".08em",
                  }}>
                    Kelambakkam, Chennai
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="pc-in-fade d2" style={{
                display: "flex", alignItems: "center", gap: ".75rem",
                marginBottom: "clamp(1.25rem,3vh,2.25rem)",
                paddingLeft: "clamp(2rem,4vw,4rem)",
              }}>
                <div style={{
                  width: 1, height: "clamp(28px,4vh,44px)",
                  background: `linear-gradient(to bottom, rgba(190,45,69,.30), rgba(201,150,10,.30))`,
                  animationDelay: ".3s",
                  animation: "pc-line-y .5s .3s ease both",
                }} />
                <span style={{
                  fontFamily: BF, fontSize: ".42rem",
                  letterSpacing: ".28em", textTransform: "uppercase",
                  color: "rgba(255,255,255,.18)", fontWeight: 500,
                }}>then</span>
              </div>

              {/* Resort */}
              <div className="pc-in-up d3" style={{
                display: "flex", alignItems: "flex-start",
                gap: "clamp(.75rem,2vw,1.5rem)",
              }}>
                <div style={{ flexShrink: 0 }}>
                  <span style={{
                    fontFamily: BF, fontSize: "clamp(.52rem,1.2vw,.68rem)",
                    fontWeight: 800, letterSpacing: ".14em",
                    color: `rgba(201,150,10,.85)`,
                  }}>6 PM</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    width: "clamp(18px,3vw,28px)", height: 1,
                    background: `rgba(201,150,10,.40)`,
                    marginBottom: ".625rem", marginTop: ".5em",
                  }} />
                  <p style={{
                    fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                    fontSize: "clamp(1.6rem,5vw,5rem)",
                    color: `rgba(232,188,20,.85)`, lineHeight: 1.0,
                  }}>
                    Blue Bay Beach Resort
                  </p>
                  <p style={{
                    fontFamily: BF, fontSize: ".68rem",
                    color: "rgba(255,255,255,.32)", marginTop: ".5rem",
                    letterSpacing: ".08em",
                  }}>
                    Mahabalipuram · on the Bay of Bengal
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── 5 · QUOTE ── */}
          {chapter === "quote" && (
            <div style={{ maxWidth: "clamp(280px,68vw,780px)", textAlign: "center" }}>
              {/* Opening quote mark */}
              <div className="pc-in-fade d0" style={{
                fontFamily: DF, fontSize: "clamp(3rem,8vw,7rem)",
                color: `rgba(190,45,69,.22)`, lineHeight: 1,
                marginBottom: "-1rem",
              }}>
                &ldquo;
              </div>

              {/* The quote */}
              <blockquote className="pc-in-up d1" style={{
                fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                fontSize: "clamp(1.1rem,2.8vw,2.25rem)",
                color: "rgba(255,252,248,.78)",
                lineHeight: 1.70, margin: 0,
              }}>
                {weddingConfig.introQuote}
              </blockquote>

              {/* Rule */}
              <div className="pc-in-fade d2" style={{
                width: "min(64px,18%)", height: 1, margin: "clamp(1.5rem,4vh,2.5rem) auto 0",
                background: `linear-gradient(to right, transparent, rgba(201,150,10,.55), transparent)`,
              }} />

              {/* Attribution */}
              <p className="pc-in-fade d3" style={{
                fontFamily: BF, fontSize: ".56rem",
                letterSpacing: ".38em", textTransform: "uppercase",
                color: "rgba(255,255,255,.22)",
                marginTop: "clamp(1rem,2.5vh,1.75rem)",
              }}>
                {BF_FIRST} &amp; {GF_FIRST}
              </p>
            </div>
          )}

          {/* ── 6 · SEAL ── */}
          {chapter === "seal" && (
            <div style={{ textAlign: "center" }}>
              {/* Invitation label */}
              <p className="pc-in-fade d0" style={{
                fontFamily: BF, fontSize: ".46rem",
                letterSpacing: ".52em", textTransform: "uppercase",
                color: "rgba(255,255,255,.35)", fontWeight: 600,
                marginBottom: "clamp(2rem,5vh,4rem)",
              }}>
                Your invitation
              </p>

              {/* Names */}
              <h2 className="pc-in-up d1" style={{
                fontFamily: DF, fontWeight: 300,
                fontSize: "clamp(2.2rem,7vw,6rem)",
                color: "#fff", lineHeight: .90,
                letterSpacing: "-.03em",
                marginBottom: "clamp(1.5rem,4vh,3rem)",
              }}>
                {BF_FIRST} <span style={{ color: `rgba(190,45,69,.65)` }}>&</span> {GF_FIRST}
              </h2>

              {/* Wax seal */}
              <div className="pc-in-fade d2" style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {/* Burst rings */}
                {sealState === "burst" && (
                  <>
                    <div aria-hidden style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      border: "1.5px solid rgba(201,150,10,.60)",
                      animation: "pc-ring .55s ease forwards",
                      pointerEvents: "none",
                    }} />
                    <div aria-hidden style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      border: "1px solid rgba(190,45,69,.45)",
                      animation: "pc-ring .70s .08s ease forwards",
                      pointerEvents: "none",
                    }} />
                  </>
                )}

                {sealState !== "done" && (
                  <div
                    onClick={handleSeal}
                    style={{
                      position: "relative",
                      width: "clamp(130px,22vw,172px)", height: "clamp(130px,22vw,172px)",
                      borderRadius: "50%", overflow: "hidden", cursor: "pointer",
                      animation: sealState === "idle"
                        ? "pc-pulse 3.8s 1.2s ease-in-out infinite"
                        : "pc-burst .52s ease forwards",
                    }}
                  >
                    <svg viewBox="0 0 160 160" width="100%" height="100%" style={{ display: "block" }} aria-hidden>
                      <defs>
                        <radialGradient id="sg" cx="38%" cy="34%" r="68%">
                          <stop offset="0%"   stopColor="#F5D47A" />
                          <stop offset="35%"  stopColor="#C9960A" />
                          <stop offset="68%"  stopColor="#9E7205" />
                          <stop offset="100%" stopColor="#5C3D01" />
                        </radialGradient>
                        <radialGradient id="sh" cx="34%" cy="28%" r="52%">
                          <stop offset="0%"   stopColor="rgba(255,248,210,.32)" />
                          <stop offset="100%" stopColor="rgba(255,248,210,0)" />
                        </radialGradient>
                      </defs>
                      <circle cx="80" cy="80" r="80" fill="url(#sg)" />
                      {Array.from({ length: 16 }, (_, i) => {
                        const a = (i / 16) * Math.PI * 2;
                        return (
                          <line key={i}
                            x1={80 + 64 * Math.cos(a)} y1={80 + 64 * Math.sin(a)}
                            x2={80 + 79 * Math.cos(a)} y2={80 + 79 * Math.sin(a)}
                            stroke="rgba(60,35,0,.30)" strokeWidth="1.4"
                          />
                        );
                      })}
                      <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(60,35,0,.28)" strokeWidth="1.4" />
                      <circle cx="80" cy="80" r="53" fill="none" stroke="rgba(60,35,0,.18)" strokeWidth=".8" />
                      <circle cx="80" cy="80" r="80" fill="url(#sh)" />
                    </svg>
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{
                        fontFamily: DF, fontWeight: 600,
                        fontSize: "clamp(2.4rem,6vw,4rem)",
                        letterSpacing: ".14em", color: "rgba(28,14,0,.80)",
                        lineHeight: 1, marginLeft: ".14em",
                        textShadow: "0 1px 0 rgba(255,240,160,.45)",
                      }}>{INITIALS}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Instruction */}
              {sealState !== "done" && (
                <p style={{
                  fontFamily: BF, fontSize: ".46rem",
                  letterSpacing: ".36em", textTransform: "uppercase",
                  color: "rgba(255,255,255,.32)", fontWeight: 500,
                  marginTop: "1.25rem",
                }}>
                  {sealState === "burst" ? "Opening…" : "Press the seal to enter"}
                </p>
              )}

              {/* Unlocked state */}
              {sealState === "done" && (
                <div>
                  <p className="pc-in-up d0" style={{
                    fontFamily: DF, fontStyle: "italic",
                    fontSize: "clamp(1rem,2.5vw,1.5rem)",
                    color: "rgba(255,255,255,.70)",
                    marginBottom: "2rem",
                  }}>
                    Welcome. Your invitation awaits.
                  </p>
                  <a href="/invite/general" style={{
                    display: "inline-flex", alignItems: "center", gap: ".625rem",
                    padding: "12px 28px", borderRadius: 999,
                    background: `linear-gradient(135deg, #D44860 0%, #BE2D45 100%)`,
                    color: "#fff", textDecoration: "none",
                    fontFamily: BF, fontSize: ".68rem", fontWeight: 700,
                    letterSpacing: ".18em", textTransform: "uppercase",
                    boxShadow: "0 4px 20px rgba(190,45,69,.35)",
                  }}>
                    View invitation →
                  </a>
                  <p style={{
                    fontFamily: BF, fontSize: ".56rem",
                    color: "rgba(255,255,255,.22)", marginTop: "1rem",
                    letterSpacing: ".18em",
                  }}>
                    (This sandbox opens /invite/general)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ════════════ NAVIGATION CHROME ════════════ */}

        {/* Progress dots */}
        <div style={{
          position: "absolute", bottom: "clamp(1.5rem,4vh,2.5rem)", left: "50%",
          transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: ".5rem",
          zIndex: 10,
        }}>
          {CHAPTERS.map((c, i) => (
            <div key={c.id} style={{
              width: i === idx ? 20 : 5, height: 5,
              borderRadius: 999,
              background: i === idx
                ? ROSE
                : i < idx
                ? "rgba(255,255,255,.35)"
                : "rgba(255,255,255,.14)",
              transition: "all .35s cubic-bezier(.34,1.56,.64,1)",
            }} />
          ))}
        </div>

        {/* Arrow hint — forward */}
        {!isLast && !unlocked && (
          <div className="pc-hint" style={{
            position: "absolute", bottom: "clamp(4rem,8vh,6rem)", right: "clamp(1.5rem,4vw,3rem)",
            zIndex: 10, cursor: "pointer",
          }} onClick={advance}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.30)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
        )}

        {/* Arrow — back */}
        {!isFirst && !unlocked && (
          <div style={{
            position: "absolute", bottom: "clamp(4rem,8vh,6rem)", left: "clamp(1.5rem,4vw,3rem)",
            zIndex: 10, cursor: "pointer", opacity: .35,
            transition: "opacity .2s",
          }} onClick={back}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.50)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </div>
        )}

        {/* Chapter label — top-right */}
        <div style={{
          position: "absolute", top: "clamp(1rem,2.5vh,1.75rem)", right: "clamp(1.25rem,3vw,2.5rem)",
          zIndex: 10,
          fontFamily: BF, fontSize: ".44rem",
          letterSpacing: ".28em", textTransform: "uppercase",
          color: "rgba(255,255,255,.18)",
        }}>
          {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>

        {/* Sandbox badge — top-left */}
        <div style={{
          position: "absolute", top: "clamp(1rem,2.5vh,1.75rem)", left: "clamp(1.25rem,3vw,2.5rem)",
          zIndex: 10,
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 999,
          background: "rgba(255,220,0,.10)", border: "1px solid rgba(255,220,0,.22)",
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#FFD700" }} />
          <span style={{
            fontFamily: BF, fontSize: ".44rem",
            letterSpacing: ".22em", textTransform: "uppercase",
            color: "rgba(255,215,0,.65)", fontWeight: 600,
          }}>Sandbox</span>
        </div>

        {/* Keyboard hint — fades after first chapter */}
        {chapter === "brand" && (
          <div className="pc-in-fade d5" style={{
            position: "absolute",
            bottom: "clamp(1.5rem,4vh,2.5rem)", left: "50%",
            transform: "translateX(-50%) translateY(30px)",
            fontFamily: BF, fontSize: ".42rem",
            letterSpacing: ".24em", textTransform: "uppercase",
            color: "rgba(255,255,255,.20)", whiteSpace: "nowrap",
            zIndex: 10,
          }}>
            Scroll · swipe · or press Space to advance
          </div>
        )}

      </div>
    </>
  );
}
