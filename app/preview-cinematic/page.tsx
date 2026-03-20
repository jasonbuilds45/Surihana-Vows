"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { weddingConfig } from "@/lib/config";

const DISPLAY_FONT = "'Cormorant Garamond', Georgia, serif";
const BODY_FONT = "'Manrope', system-ui, sans-serif";
const SCENE_DURATION = 4800;

const brideFirst = weddingConfig.brideName.split(" ")[0] ?? weddingConfig.brideName;
const groomFirst = weddingConfig.groomName.split(" ")[0] ?? weddingConfig.groomName;
const initials = `${weddingConfig.brideName.charAt(0)}${weddingConfig.groomName.charAt(0)}`.toUpperCase();
const dateLabel = new Date(weddingConfig.weddingDate).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

type Scene = {
  id: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  body: string;
  chips: string[];
  accent: string;
  secondary: string;
  background: string;
  ambient: string;
  halo: string;
  beam: string;
  leftMaterial: string;
  rightMaterial: string;
  leftShift: number;
  rightShift: number;
  leftLean: number;
  rightLean: number;
};

const scenes: Scene[] = [
  {
    id: "opening",
    eyebrow: "3D cinematic sandbox",
    title: "A trailer cut from",
    titleAccent: "liquid color",
    subtitle: "The preview now behaves like a title sequence, not a flat invite mockup.",
    body:
      "The couple is rendered as a stylized 3D sculpture with luminous materials, floating glass planes, and saturated light. The scene shifts automatically like a short cinematic teaser.",
    chips: ["Iridescent", "Glass panels", "Auto-play"],
    accent: "#ff6f92",
    secondary: "#ffd56d",
    background:
      "radial-gradient(circle at 18% 18%, rgba(255,111,146,.2), transparent 28%), radial-gradient(circle at 82% 24%, rgba(88,108,255,.18), transparent 28%), linear-gradient(145deg, #08050d 0%, #12081a 46%, #030307 100%)",
    ambient:
      "radial-gradient(circle at 18% 18%, rgba(255,111,146,.42), transparent 24%), radial-gradient(circle at 82% 24%, rgba(88,108,255,.34), transparent 22%), radial-gradient(circle at 54% 82%, rgba(255,213,109,.18), transparent 30%)",
    halo: "conic-gradient(from 0deg, #ffd56d, #ff6f92, #7db9ff, #ffd56d)",
    beam: "linear-gradient(90deg, transparent, rgba(255,111,146,.85), rgba(255,213,109,.8), transparent)",
    leftMaterial: "linear-gradient(180deg, #ffe0ef 0%, #ff9ac4 18%, #d93b7f 48%, #651434 100%)",
    rightMaterial: "linear-gradient(180deg, #fff6d8 0%, #ffd56d 18%, #b57c1d 48%, #4e2e06 100%)",
    leftShift: -132,
    rightShift: 132,
    leftLean: -8,
    rightLean: 8,
  },
  {
    id: "orbit",
    eyebrow: `${brideFirst} and ${groomFirst}`,
    title: "Two forms in",
    titleAccent: "one orbit",
    subtitle: "The couple moves closer to the same halo, like fashion objects pulled into a single frame.",
    body:
      "This scene leans into the couple itself: one figure in rose satin, the other in cool chrome-blue, both floating above a stage that feels half chapel and half sci-fi runway.",
    chips: ["Facing silhouettes", "Orbit ring", "Stage lighting"],
    accent: "#88d7ff",
    secondary: "#ff7ed3",
    background:
      "radial-gradient(circle at 16% 18%, rgba(136,215,255,.2), transparent 26%), radial-gradient(circle at 84% 18%, rgba(255,126,211,.16), transparent 28%), linear-gradient(145deg, #040a12 0%, #091321 44%, #03050a 100%)",
    ambient:
      "radial-gradient(circle at 18% 18%, rgba(136,215,255,.42), transparent 24%), radial-gradient(circle at 84% 18%, rgba(255,126,211,.28), transparent 24%), radial-gradient(circle at 54% 82%, rgba(255,213,109,.16), transparent 30%)",
    halo: "conic-gradient(from 60deg, #88d7ff, #ff7ed3, #ffd56d, #88d7ff)",
    beam: "linear-gradient(90deg, transparent, rgba(136,215,255,.85), rgba(255,126,211,.74), transparent)",
    leftMaterial: "linear-gradient(180deg, #f2feff 0%, #9de0ff 18%, #2f86c9 48%, #07284a 100%)",
    rightMaterial: "linear-gradient(180deg, #fff1fb 0%, #fface4 18%, #e14eb3 48%, #681348 100%)",
    leftShift: -146,
    rightShift: 146,
    leftLean: -12,
    rightLean: 12,
  },
  {
    id: "date",
    eyebrow: dateLabel,
    title: "The city, the date,",
    titleAccent: "the reveal",
    subtitle: `${weddingConfig.venueCity} becomes part of the spectacle instead of a basic information card.`,
    body:
      "The middle beat slows down and turns the essentials into cinema. Date, city, and promise sit inside the same glowing environment so the information still feels grand.",
    chips: [weddingConfig.venueCity, weddingConfig.venueName, weddingConfig.receptionVenueName ?? "Reception"],
    accent: "#9df2b0",
    secondary: "#ffe27c",
    background:
      "radial-gradient(circle at 16% 18%, rgba(157,242,176,.18), transparent 26%), radial-gradient(circle at 84% 18%, rgba(255,226,124,.15), transparent 26%), linear-gradient(145deg, #06100b 0%, #0b1712 44%, #040705 100%)",
    ambient:
      "radial-gradient(circle at 18% 18%, rgba(157,242,176,.38), transparent 22%), radial-gradient(circle at 84% 18%, rgba(255,226,124,.24), transparent 22%), radial-gradient(circle at 54% 82%, rgba(125,185,255,.16), transparent 28%)",
    halo: "conic-gradient(from 90deg, #9df2b0, #7db9ff, #ffe27c, #9df2b0)",
    beam: "linear-gradient(90deg, transparent, rgba(157,242,176,.75), rgba(255,226,124,.75), transparent)",
    leftMaterial: "linear-gradient(180deg, #f0fff4 0%, #aef5bd 18%, #53cf72 48%, #164e24 100%)",
    rightMaterial: "linear-gradient(180deg, #fff8de 0%, #ffe27c 18%, #d0a62d 48%, #563402 100%)",
    leftShift: -136,
    rightShift: 136,
    leftLean: -9,
    rightLean: 7,
  },
  {
    id: "entry",
    eyebrow: "Final frame",
    title: "Open",
    titleAccent: "the invitation",
    subtitle: "The trailer ends on a real entry point rather than a dead-end concept screen.",
    body:
      "This last scene keeps the cinematic mood but points directly into the guest flow. It is still a preview page, but now it feels like a proper teaser for the invitation itself.",
    chips: ["Hero CTA", "Preview route", "Guest entry"],
    accent: "#ff8f74",
    secondary: "#ffe983",
    background:
      "radial-gradient(circle at 18% 18%, rgba(255,143,116,.18), transparent 26%), radial-gradient(circle at 82% 18%, rgba(255,233,131,.18), transparent 24%), linear-gradient(145deg, #0c0607 0%, #160b10 44%, #040304 100%)",
    ambient:
      "radial-gradient(circle at 18% 18%, rgba(255,143,116,.38), transparent 24%), radial-gradient(circle at 82% 18%, rgba(255,233,131,.22), transparent 22%), radial-gradient(circle at 54% 82%, rgba(255,111,146,.16), transparent 28%)",
    halo: "conic-gradient(from 120deg, #ff8f74, #ffe983, #ff7ec9, #ff8f74)",
    beam: "linear-gradient(90deg, transparent, rgba(255,143,116,.85), rgba(255,233,131,.75), transparent)",
    leftMaterial: "linear-gradient(180deg, #fff1ed 0%, #ffb7a2 18%, #ff7868 48%, #7a1c1c 100%)",
    rightMaterial: "linear-gradient(180deg, #fff8dd 0%, #ffe983 18%, #efb53b 48%, #603a01 100%)",
    leftShift: -132,
    rightShift: 132,
    leftLean: -7,
    rightLean: 7,
  },
];

function Figure({
  label,
  material,
  glow,
  shift,
  lean,
  isBride,
}: {
  label: string;
  material: string;
  glow: string;
  shift: number;
  lean: number;
  isBride: boolean;
}) {
  const style = {
    ["--figure-material" as string]: material,
    ["--figure-glow" as string]: glow,
    ["--figure-shift" as string]: `${shift}px`,
    ["--figure-lean" as string]: `${lean}deg`,
    ["--figure-yaw" as string]: `${isBride ? 18 : -18}deg`,
  } as CSSProperties;

  return (
    <div className={`pc-figure ${isBride ? "pc-bride" : "pc-groom"}`} style={style}>
      <div className="pc-figure-aura" />
      {isBride ? <div className="pc-veil" /> : <div className="pc-cape" />}
      <div className="pc-head" />
      <div className="pc-torso" />
      <div className="pc-arm left" />
      <div className="pc-arm right" />
      <div className="pc-lower" />
      <div className="pc-tag">{label}</div>
    </div>
  );
}

export default function PreviewCinematicPage() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSceneIndex((current) => (current + 1) % scenes.length);
    }, SCENE_DURATION);

    return () => window.clearTimeout(timeout);
  }, [sceneIndex, isPaused]);

  const scene = scenes[sceneIndex];
  const shellStyle = {
    background: scene.background,
    ["--ambient" as string]: scene.ambient,
    ["--accent" as string]: scene.accent,
    ["--secondary" as string]: scene.secondary,
    ["--halo" as string]: scene.halo,
    ["--beam" as string]: scene.beam,
  } as CSSProperties;

  return (
    <>
      <style>{`
        @keyframes pcFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-16px) } }
        @keyframes pcRotate { from { transform: translate(-50%, -50%) rotate(0deg) } to { transform: translate(-50%, -50%) rotate(360deg) } }
        @keyframes pcPulse { 0%,100% { opacity: .6; transform: scale(1) } 50% { opacity: 1; transform: scale(1.06) } }
        @keyframes pcProgress { from { transform: scaleX(0) } to { transform: scaleX(1) } }

        .pc-shell { min-height: 100vh; overflow: hidden; color: #fffdf7; position: relative; isolation: isolate; font-family: ${BODY_FONT}; }
        .pc-shell::before, .pc-shell::after { content: ""; position: absolute; inset: -10%; pointer-events: none; }
        .pc-shell::before { background: var(--ambient); filter: blur(20px); animation: pcFloat 14s ease-in-out infinite; }
        .pc-shell::after {
          background-image: linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
          background-size: 92px 92px;
          opacity: .08;
          mask-image: radial-gradient(circle at 50% 40%, black 0%, transparent 72%);
        }

        .pc-inner { min-height: 100vh; display: grid; grid-template-rows: auto 1fr auto; position: relative; z-index: 1; padding: 20px 24px 24px; }
        .pc-topbar, .pc-footer { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
        .pc-badge, .pc-button, .pc-link, .pc-chip, .pc-tag {
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.06);
          backdrop-filter: blur(16px);
          border-radius: 999px;
        }

        .pc-badge { display: inline-flex; align-items: center; gap: 10px; padding: 10px 14px; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: rgba(255,255,255,.78); }
        .pc-badge i { width: 8px; height: 8px; border-radius: 999px; background: var(--accent); box-shadow: 0 0 18px var(--accent); }
        .pc-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        .pc-button, .pc-link { min-height: 42px; padding: 0 16px; color: rgba(255,255,255,.9); font: 700 11px ${BODY_FONT}; letter-spacing: .22em; text-transform: uppercase; text-decoration: none; cursor: pointer; }
        .pc-link.primary { color: #1a0d10; background: linear-gradient(135deg, var(--secondary), var(--accent)); }

        .pc-main { display: grid; grid-template-columns: minmax(320px, 1fr) minmax(340px, 1.1fr); align-items: center; gap: clamp(28px, 4vw, 60px); }
        .pc-copy { max-width: 560px; }
        .pc-eyebrow { margin: 0 0 18px; color: rgba(255,255,255,.72); font-size: 11px; letter-spacing: .28em; text-transform: uppercase; display: inline-flex; align-items: center; gap: 14px; }
        .pc-eyebrow::before { content: ""; width: 56px; height: 1px; background: linear-gradient(90deg, transparent, var(--accent), transparent); }
        .pc-title { margin: 0; font-family: ${DISPLAY_FONT}; font-size: clamp(3rem, 6vw, 6.2rem); line-height: .92; letter-spacing: -.05em; max-width: 11ch; }
        .pc-title strong { color: var(--secondary); font-weight: 600; }
        .pc-subtitle { margin: 18px 0 0; color: rgba(255,255,255,.82); font-size: clamp(1rem, 1.4vw, 1.14rem); line-height: 1.6; max-width: 36rem; }
        .pc-body { margin: 18px 0 0; color: rgba(255,255,255,.66); font-size: 15px; line-height: 1.8; max-width: 35rem; }
        .pc-chip-row { display: flex; flex-wrap: wrap; gap: 12px; margin: 24px 0 0; }
        .pc-chip { padding: 10px 14px; color: rgba(255,255,255,.78); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }

        .pc-stage { position: relative; min-height: min(68vh, 720px); perspective: 2200px; display: flex; align-items: center; justify-content: center; }
        .pc-stage-box { position: relative; width: min(100%, 680px); aspect-ratio: 1 / 1.08; transform-style: preserve-3d; transform: rotateX(62deg) rotateZ(-14deg); }
        .pc-floor, .pc-floor-glow, .pc-panel, .pc-halo, .pc-beam { position: absolute; transform-style: preserve-3d; }
        .pc-floor {
          left: 12%; right: 12%; bottom: 8%; height: 36%; transform: translateZ(-140px) rotateX(88deg);
          background-image: linear-gradient(rgba(255,255,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.10) 1px, transparent 1px);
          background-size: 48px 48px; opacity: .28; mask-image: radial-gradient(circle at 50% 30%, black 0%, transparent 76%);
        }
        .pc-floor-glow { left: 18%; right: 18%; bottom: 11%; height: 22%; border-radius: 999px; background: radial-gradient(circle at 50% 50%, rgba(255,255,255,.18), transparent 66%); filter: blur(26px); }
        .pc-panel { top: 18%; width: 28%; height: 54%; border-radius: 30px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.08); box-shadow: inset 0 1px 0 rgba(255,255,255,.28), 0 24px 56px rgba(0,0,0,.26); }
        .pc-panel.left { left: 2%; transform: translate3d(-8px, 0, -80px) rotateY(32deg) rotateZ(-10deg); }
        .pc-panel.right { right: 2%; transform: translate3d(8px, 0, -56px) rotateY(-32deg) rotateZ(10deg); }
        .pc-halo { left: 50%; top: 36%; width: 44%; aspect-ratio: 1; border-radius: 999px; background: var(--halo); transform: translate(-50%, -50%); animation: pcRotate 18s linear infinite; }
        .pc-halo::before { content: ""; position: absolute; inset: 9%; border-radius: inherit; background: #06070c; }
        .pc-halo::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: var(--halo); filter: blur(18px); opacity: .36; z-index: -1; }
        .pc-beam { width: 34%; height: 12%; border-radius: 999px; filter: blur(6px); background: var(--beam); opacity: .78; animation: pcFloat 6s ease-in-out infinite; }
        .pc-beam.a { top: 14%; left: 32%; transform: translate3d(0,0,84px) rotateZ(-22deg); }
        .pc-beam.b { bottom: 24%; left: 16%; transform: translate3d(0,0,22px) rotateZ(18deg); animation-delay: -2s; }
        .pc-beam.c { top: 34%; right: 10%; transform: translate3d(0,0,120px) rotateZ(38deg); animation-delay: -1s; }

        .pc-figure { position: absolute; left: 50%; bottom: 18%; width: 174px; height: 360px; transform-style: preserve-3d; transform: translate3d(var(--figure-shift), 0, 60px) rotateY(var(--figure-yaw)) rotateZ(var(--figure-lean)); }
        .pc-figure-aura { position: absolute; inset: 18% 14%; border-radius: 999px; background: radial-gradient(circle at 50% 40%, var(--figure-glow), transparent 70%); filter: blur(20px); opacity: .68; }
        .pc-head, .pc-torso, .pc-arm, .pc-lower, .pc-veil, .pc-cape { position: absolute; transform-style: preserve-3d; }
        .pc-head { left: 50%; top: 0; width: 72px; height: 82px; transform: translateX(-50%) translateZ(32px); border-radius: 42% 42% 46% 46%; background: linear-gradient(180deg, rgba(255,255,255,.84), rgba(255,255,255,.38)); box-shadow: inset 0 1px 0 rgba(255,255,255,.72), 0 20px 34px rgba(0,0,0,.24); }
        .pc-torso { left: 50%; top: 88px; width: 108px; height: 126px; transform: translateX(-50%) translateZ(14px); border-radius: 42px 42px 26px 26px; background: var(--figure-material); box-shadow: inset 0 1px 0 rgba(255,255,255,.34), 0 22px 36px rgba(0,0,0,.28); }
        .pc-torso::before { content: ""; position: absolute; left: 50%; top: 14%; width: 2px; height: 58%; transform: translateX(-50%); background: linear-gradient(180deg, rgba(255,255,255,.8), rgba(255,255,255,.08)); }
        .pc-arm { top: 108px; width: 32px; height: 126px; border-radius: 999px; background: var(--figure-material); }
        .pc-arm.left { left: 18px; transform: rotateZ(18deg); }
        .pc-arm.right { right: 18px; transform: rotateZ(-18deg); }
        .pc-lower { left: 50%; bottom: 18px; width: 148px; height: 190px; transform: translateX(-50%); background: var(--figure-material); box-shadow: inset 0 1px 0 rgba(255,255,255,.26), 0 26px 38px rgba(0,0,0,.30); }
        .pc-bride .pc-lower { clip-path: polygon(18% 0, 82% 0, 100% 100%, 0 100%); border-radius: 34% 34% 16% 16%; }
        .pc-groom .pc-lower { width: 136px; height: 176px; clip-path: polygon(26% 0, 74% 0, 86% 100%, 14% 100%); border-radius: 24% 24% 12% 12%; }
        .pc-veil, .pc-cape { left: 50%; top: 20px; width: 146px; height: 204px; transform: translateX(-50%) translateZ(-8px); border-radius: 44% 44% 18% 18%; opacity: .58; }
        .pc-veil { background: linear-gradient(180deg, rgba(255,255,255,.86), rgba(255,255,255,.05)); clip-path: polygon(18% 0, 82% 0, 100% 100%, 0 100%); }
        .pc-cape { background: linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.02)); clip-path: polygon(30% 0, 70% 0, 92% 100%, 8% 100%); }
        .pc-tag { position: absolute; left: 50%; bottom: -24px; transform: translateX(-50%); padding: 7px 12px; color: rgba(255,255,255,.74); font-size: 10px; letter-spacing: .22em; text-transform: uppercase; white-space: nowrap; }

        .pc-footer { padding-top: 10px; align-items: end; }
        .pc-progress { display: grid; grid-template-columns: repeat(${scenes.length}, minmax(0, 1fr)); gap: 10px; flex: 1; }
        .pc-progress button { padding: 0; border: none; background: none; color: rgba(255,255,255,.62); text-align: left; cursor: pointer; }
        .pc-track { height: 4px; background: rgba(255,255,255,.12); border-radius: 999px; overflow: hidden; }
        .pc-fill { display: block; height: 100%; transform-origin: left; background: linear-gradient(90deg, var(--accent), var(--secondary)); }
        .pc-fill.active { animation: pcProgress ${SCENE_DURATION}ms linear both; }
        .pc-fill.complete { transform: scaleX(1); }
        .pc-fill.upcoming { transform: scaleX(0); }
        .pc-label { display: block; margin-top: 8px; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; }
        .pc-meta { text-align: right; }
        .pc-meta strong { display: block; font-family: ${DISPLAY_FONT}; font-size: clamp(1.2rem, 2.2vw, 2rem); letter-spacing: -.04em; }
        .pc-meta span { display: block; color: rgba(255,255,255,.52); font-size: 11px; letter-spacing: .22em; text-transform: uppercase; }

        @media (max-width: 1080px) {
          .pc-inner { padding: 18px 16px 18px; }
          .pc-main { grid-template-columns: 1fr; gap: 20px; }
          .pc-stage { min-height: 480px; order: 1; }
          .pc-copy { order: 2; max-width: none; }
          .pc-footer { flex-direction: column; align-items: flex-start; }
          .pc-meta { text-align: left; }
        }

        @media (max-width: 720px) {
          .pc-topbar { flex-direction: column; align-items: flex-start; }
          .pc-actions { width: 100%; justify-content: flex-start; }
          .pc-title { max-width: none; font-size: clamp(2.5rem, 13vw, 4.7rem); }
          .pc-stage { min-height: 400px; }
          .pc-stage-box { transform: rotateX(68deg) rotateZ(-10deg) scale(.92); }
          .pc-figure { width: 134px; height: 282px; }
          .pc-head { width: 54px; height: 62px; }
          .pc-torso { width: 82px; height: 96px; top: 68px; }
          .pc-arm { width: 24px; height: 86px; top: 84px; }
          .pc-lower { width: 116px; height: 138px; }
          .pc-groom .pc-lower { width: 108px; height: 132px; }
          .pc-veil, .pc-cape { width: 112px; height: 150px; }
          .pc-progress { width: 100%; }
        }
      `}</style>

      <div className="pc-shell" style={shellStyle}>
        <div className="pc-inner">
          <div className="pc-topbar">
            <div className="pc-badge">
              <i />
              cinematic preview
            </div>

            <div className="pc-actions">
              <button className="pc-button" type="button" onClick={() => setIsPaused((value) => !value)}>
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button
                className="pc-button"
                type="button"
                onClick={() => {
                  setSceneIndex(0);
                  setIsPaused(false);
                }}
              >
                Restart
              </button>
              <a className="pc-link primary" href="/invite/general">
                Open invite
              </a>
            </div>
          </div>

          <div className="pc-main">
            <section className="pc-copy">
              <p className="pc-eyebrow">{scene.eyebrow}</p>
              <h1 className="pc-title">
                {scene.title} <strong>{scene.titleAccent}</strong>
              </h1>
              <p className="pc-subtitle">{scene.subtitle}</p>
              <p className="pc-body">{scene.body}</p>

              <div className="pc-chip-row">
                {scene.chips.map((chip) => (
                  <span className="pc-chip" key={chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </section>

            <section className="pc-stage" aria-label="3D couple trailer preview">
              <div className="pc-stage-box">
                <div className="pc-floor" />
                <div className="pc-floor-glow" />
                <div className="pc-panel left" />
                <div className="pc-panel right" />
                <div className="pc-halo" />
                <div className="pc-beam a" />
                <div className="pc-beam b" />
                <div className="pc-beam c" />

                <Figure
                  label={brideFirst}
                  material={scene.leftMaterial}
                  glow={scene.accent}
                  shift={scene.leftShift}
                  lean={scene.leftLean}
                  isBride
                />
                <Figure
                  label={groomFirst}
                  material={scene.rightMaterial}
                  glow={scene.secondary}
                  shift={scene.rightShift}
                  lean={scene.rightLean}
                  isBride={false}
                />
              </div>
            </section>
          </div>

          <div className="pc-footer">
            <div className="pc-progress">
              {scenes.map((item, index) => {
                const state =
                  index < sceneIndex ? "complete" : index === sceneIndex ? "active" : "upcoming";

                return (
                  <button key={item.id} type="button" onClick={() => setSceneIndex(index)}>
                    <div className="pc-track">
                      <span
                        key={`${item.id}-${sceneIndex}-${isPaused ? "paused" : "running"}`}
                        className={`pc-fill ${state}`}
                        style={isPaused && index === sceneIndex ? { transform: "scaleX(1)", animation: "none" } : undefined}
                      />
                    </div>
                    <span className="pc-label">{item.eyebrow}</span>
                  </button>
                );
              })}
            </div>

            <div className="pc-meta">
              <strong>{initials}</strong>
              <span>{brideFirst} and {groomFirst}</span>
              <span>{dateLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
