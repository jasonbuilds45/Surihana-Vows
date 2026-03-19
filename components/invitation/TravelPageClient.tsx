"use client";

/**
 * TravelPageClient — v4  "The Journey Edition"
 *
 * Hero redesign goals:
 *  — Light but ALIVE: parchment-warm background, not sterile white
 *  — Large editorial typography with real visual weight
 *  — Boarding-pass strip becomes a proper centrepiece, not an afterthought
 *  — Delicate ink-drawn ornaments (SVG) add craft without darkness
 *  — Every section fully mobile-first; no horizontal overflow anywhere
 */

import { useState } from "react";
import {
  Plane, TrainFront, Bus, Car,
  Phone, MapPin, HeartPulse, ShieldCheck,
  ChevronDown, Navigation, ExternalLink, Building2,
  Sun, Cloud, CloudRain, Wind, Thermometer,
} from "lucide-react";
import { NearbyEssentials } from "@/components/invitation/NearbyEssentials";
import type { EssentialItem } from "@/components/invitation/NearbyEssentials";

// ── Types ────────────────────────────────────────────────────────────────────
interface TravelSection { id: string; title: string; description: string; link: string; category?: string | null; icon?: string | null }
interface FAQItem        { question: string; answer: string }
interface GuideProps     { sections: TravelSection[]; essentials: EssentialItem[]; faq: FAQItem[]; arrivalTips: string[] }

// ── Tokens ───────────────────────────────────────────────────────────────────
const DF   = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF   = "var(--font-body),'Manrope',system-ui,sans-serif";
const ROSE = "var(--rose)";
const GOLD = "var(--gold)";
const INK  = "var(--ink)";

// ── Hover lift – desktop only ────────────────────────────────────────────────
function lift(el: HTMLElement, on: boolean) {
  if (typeof window !== "undefined" && window.matchMedia("(hover:hover)").matches) {
    el.style.transform = on ? "translateY(-3px)" : "";
    el.style.boxShadow = on ? "var(--sh-lg)" : "";
  }
}

// ── Eyebrow ───────────────────────────────────────────────────────────────────
function Eyebrow({ c, gold }: { c: React.ReactNode; gold?: boolean }) {
  return (
    <p style={{ fontFamily: BF, fontSize: ".50rem", letterSpacing: ".44em", textTransform: "uppercase",
      color: gold ? GOLD : ROSE, fontWeight: 700, marginBottom: ".5rem" }}>
      {c}
    </p>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SH({ ey, ti, sub, gold }: { ey: string; ti: string; sub?: string; gold?: boolean }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <Eyebrow c={ey} gold={gold} />
      <h2 style={{ fontFamily: DF, fontWeight: 300, fontSize: "clamp(1.75rem,4vw,2.75rem)",
        color: INK, lineHeight: 1.05, letterSpacing: "-.025em" }}>
        {ti}
      </h2>
      {sub && <p style={{ fontFamily: BF, fontSize: ".875rem", color: "var(--ink-3)",
        lineHeight: 1.72, maxWidth: "38rem", marginTop: ".625rem" }}>{sub}</p>}
    </div>
  );
}

// ── Glass card ────────────────────────────────────────────────────────────────
function G({ children, s }: { children: React.ReactNode; s?: React.CSSProperties }) {
  return (
    <div style={{ background: "rgba(255,255,255,.84)", backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.76)",
      borderRadius: "var(--r-xl)", boxShadow: "var(--sh-sm)",
      backgroundImage: "var(--noise),linear-gradient(rgba(255,255,255,.84),rgba(255,255,255,.84))",
      transition: "transform .2s var(--expo),box-shadow .2s var(--smooth)", ...s }}>
      {children}
    </div>
  );
}

// ── ✦ Divider ─────────────────────────────────────────────────────────────────
function Div() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: ".875rem",
      margin: "clamp(2.75rem,5.5vh,4rem) 0" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right,transparent,var(--rose-mid))" }} />
      <span style={{ fontFamily: DF, fontSize: ".875rem", color: "var(--rose-mid)", lineHeight: 1 }}>✦</span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left,transparent,var(--rose-mid))" }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HERO
// Design brief: full-bleed parchment field with large ink typography,
// decorative SVG line art, boarding-pass as a hero card, not a footnote.
// ════════════════════════════════════════════════════════════════════════════
function Hero() {
  return (
    <>
      <style>{`
        /* ── keyframes ── */
        @keyframes hUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes hIn  { from{opacity:0} to{opacity:1} }
        @keyframes hGrw { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
        @keyframes hDsh { to{stroke-dashoffset:-20} }
        @keyframes hFlt { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

        /* ── entrance classes ── */
        .he-0{opacity:0;animation:hUp .85s .06s cubic-bezier(.16,1,.3,1) forwards}
        .he-1{opacity:0;animation:hUp .90s .20s cubic-bezier(.16,1,.3,1) forwards}
        .he-2{opacity:0;animation:hUp .85s .34s cubic-bezier(.16,1,.3,1) forwards}
        .he-3{opacity:0;animation:hUp .80s .50s cubic-bezier(.16,1,.3,1) forwards}
        .he-4{opacity:0;animation:hIn .75s .66s ease forwards}
        .he-ln{opacity:0;transform-origin:left;animation:hGrw .8s .90s ease forwards}

        /* ── boarding pass ── */
        .bp-wrap{
          display:flex;align-items:stretch;
          border-radius:16px;overflow:hidden;
          border:1.5px solid rgba(190,45,69,.20);
          box-shadow:0 4px 24px rgba(15,10,11,.07),0 1px 4px rgba(190,45,69,.06),inset 0 1px 0 rgba(255,255,255,.90);
        }
        .bp-venue{flex:1;padding:1.375rem 1.5rem}
        .bp-sep{
          width:72px;flex-shrink:0;
          background:rgba(255,255,255,.60);
          border-left:1.5px dashed rgba(190,45,69,.18);
          border-right:1.5px dashed rgba(190,45,69,.18);
          display:flex;flex-direction:column;align-items:center;
          justify-content:center;gap:.5rem;padding:.875rem .5rem;
        }
        @media(max-width:400px){
          .bp-sep{width:52px}
          .bp-venue{padding:1.125rem 1rem}
        }

        /* ── anchor pills ── */
        .anc-pill{
          display:inline-flex;align-items:center;
          padding:.5rem 1rem;border-radius:999px;
          background:rgba(255,255,255,.70);
          border:1px solid rgba(190,45,69,.18);
          font-family:var(--font-body),'Manrope',sans-serif;
          font-size:.65rem;font-weight:600;letter-spacing:.06em;
          color:var(--ink-2);text-decoration:none;
          transition:background .18s,border-color .18s,color .18s;
          white-space:nowrap;
        }
        .anc-pill:hover{
          background:var(--rose-pale);
          border-color:var(--rose-mid);
          color:var(--rose);
        }

        /* ── hero ornament float (desktop) ── */
        @media(hover:hover){
          .he-orn{animation:hFlt 7s ease-in-out infinite}
        }
      `}</style>

      <div style={{
        position: "relative", overflow: "hidden",
        /* Warm parchment — not flat white */
        background: "linear-gradient(160deg, #FDF8F2 0%, #FAF4EC 55%, #FDF8F2 100%)",
        borderBottom: "1px solid rgba(190,45,69,.10)",
      }}>

        {/* ── Background layer: mesh blooms ──────────────────────────────── */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 70% at 90% 10%, rgba(190,45,69,.07) 0%, transparent 60%),
            radial-gradient(ellipse 45% 55% at 5% 90%,  rgba(168,120,8,.06)  0%, transparent 55%),
            radial-gradient(ellipse 30% 40% at 50% 50%, rgba(190,45,69,.03) 0%, transparent 60%)
          ` }} />

        {/* ── Decorative SVG ink ornaments ───────────────────────────────── */}
        {/* Top-right: large calligraphic flourish */}
        <svg aria-hidden className="he-orn" style={{
          position: "absolute", top: 0, right: 0,
          width: "clamp(160px,28vw,340px)", height: "auto",
          opacity: .055, pointerEvents: "none",
        }} viewBox="0 0 340 340" fill="none">
          {/* Organic flourish curves */}
          <path d="M340 0 C280 60 220 40 180 100 C140 160 160 240 100 280 C60 310 20 320 0 340"
            stroke="var(--rose)" strokeWidth="1" fill="none" />
          <path d="M340 40 C290 90 240 70 200 130 C170 175 185 250 130 285"
            stroke="var(--rose)" strokeWidth=".6" fill="none" strokeDasharray="4 6" />
          <circle cx="340" cy="0"  r="3" fill="var(--rose)" />
          <circle cx="100" cy="280" r="2" fill="var(--rose)" opacity=".5" />
          {/* Corner diamond */}
          <polygon points="320,20 330,30 320,40 310,30" fill="none"
            stroke="var(--rose)" strokeWidth=".8" />
        </svg>

        {/* Bottom-left: smaller mirror flourish */}
        <svg aria-hidden style={{
          position: "absolute", bottom: 0, left: 0,
          width: "clamp(100px,18vw,200px)", height: "auto",
          opacity: .045, pointerEvents: "none",
        }} viewBox="0 0 200 200" fill="none">
          <path d="M0 200 C40 160 80 170 110 120 C140 70 130 30 200 0"
            stroke="var(--gold)" strokeWidth=".8" fill="none" />
          <path d="M0 170 C50 140 80 155 115 105"
            stroke="var(--gold)" strokeWidth=".5" fill="none" strokeDasharray="3 5" />
          <polygon points="10,188 18,196 10,204 2,196" fill="none"
            stroke="var(--gold)" strokeWidth=".7" />
        </svg>

        {/* Horizontal rule at top */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent 0%,var(--rose-mid) 20%,var(--rose) 50%,var(--rose-mid) 80%,transparent 100%)",
        }} />

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto",
          padding: "clamp(3.5rem,9vh,6rem) var(--pad-x) clamp(2.5rem,6vh,4rem)",
          position: "relative", zIndex: 1 }}>

          {/* Row layout on ≥768: type left, boarding-pass right */}
          <div style={{ display: "flex", gap: "clamp(2rem,5vw,5rem)",
            alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* ── LEFT: Editorial content block ───────────────────────── */}
            <div style={{ flex: "1 1 min(100%,440px)", minWidth: 0 }}>

              {/* Occasion tag — ruled line + label */}
              <div className="he-0" style={{ display: "flex", alignItems: "center",
                gap: 12, marginBottom: "2rem" }}>
                <div style={{ width: 32, height: 1,
                  background: "linear-gradient(to right,var(--rose),transparent)" }} />
                <span style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".52em",
                  textTransform: "uppercase", color: ROSE, fontWeight: 700 }}>
                  Travel guide · Marion &amp; Livingston
                </span>
              </div>

              {/* Headline — stacked with mixed weight/style */}
              <div className="he-1" style={{ marginBottom: "clamp(1rem,2.5vh,1.75rem)" }}>
                {/* "Getting" — ink, light weight, very large */}
                <h1 style={{ fontFamily: DF, fontWeight: 300, margin: 0,
                  fontSize: "clamp(3.5rem,10vw,7.5rem)",
                  lineHeight: .84, letterSpacing: "-.04em", color: INK,
                  display: "block" }}>
                  Getting
                </h1>

                {/* "there" — rose italic with animated wave underline + date chip inline */}
                <div style={{ display: "flex", alignItems: "flex-end",
                  gap: "clamp(.5rem,2vw,1.25rem)", flexWrap: "wrap" }}>
                  <div style={{ position: "relative" }}>
                    <h1 style={{ fontFamily: DF, fontStyle: "italic", fontWeight: 300, margin: 0,
                      fontSize: "clamp(3.5rem,10vw,7.5rem)",
                      lineHeight: .88, letterSpacing: "-.04em", color: ROSE }}>
                      there.
                    </h1>
                    {/* Animated wave underline */}
                    <svg viewBox="0 0 300 14" fill="none" aria-hidden
                      style={{ position: "absolute", left: 0, bottom: "-6px",
                        width: "100%", overflow: "visible" }}>
                      <path d="M2 10 Q40 2 80 9 Q120 16 160 8 Q200 2 240 9 Q270 14 298 6"
                        stroke="var(--rose)" strokeWidth="1.5" strokeLinecap="round"
                        strokeDasharray="6 4" fill="none"
                        style={{ animation: "hDsh 2.8s linear infinite" }} />
                    </svg>
                  </div>
                  {/* Date chip — sits beside "there." at baseline */}
                  <div style={{ paddingBottom: ".5rem",
                    display: "flex", flexDirection: "column", gap: ".2rem" }}>
                    <span style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".30em",
                      textTransform: "uppercase", color: ROSE, fontWeight: 700,
                      display: "block" }}>20 · 05 · 2026</span>
                    <span style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".82rem",
                      color: "var(--ink-4)", display: "block" }}>Chennai, India</span>
                  </div>
                </div>
              </div>

              {/* Animated hairline rule */}
              <div className="he-ln" style={{ height: 1, width: "min(100px,22%)", marginBottom: "1.75rem",
                background: "linear-gradient(to right,var(--rose),var(--rose-mid),transparent)" }} />

              {/* Venue timeline — vertical spine with two nodes */}
              <div className="he-2" style={{ position: "relative", paddingLeft: "1.625rem",
                marginBottom: "2rem" }}>
                {/* Spine */}
                <div style={{ position: "absolute", left: ".3rem", top: 6, bottom: 6, width: 1,
                  background: "linear-gradient(to bottom,var(--rose) 0%,var(--rose-mid) 55%,var(--gold) 100%)" }} />

                {/* Node A — Church */}
                <div style={{ marginBottom: "1.125rem" }}>
                  <div style={{ position: "absolute", left: 0, width: 10, height: 10,
                    borderRadius: "50%", background: ROSE,
                    boxShadow: "0 0 0 3px var(--rose-pale)", marginTop: 2 }} />
                  <div style={{ display: "flex", alignItems: "baseline",
                    gap: ".625rem", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: BF, fontSize: ".56rem", fontWeight: 700,
                      letterSpacing: ".14em", textTransform: "uppercase",
                      color: ROSE, flexShrink: 0 }}>3:00 PM</span>
                    <span style={{ fontFamily: DF, fontSize: "1.1rem", fontWeight: 600,
                      color: INK, lineHeight: 1.1 }}>Divine Mercy Church</span>
                  </div>
                  <p style={{ fontFamily: BF, fontSize: ".76rem", color: "var(--ink-4)",
                    marginTop: ".15rem" }}>Kelambakkam, Chennai</p>
                </div>

                {/* Node B — Resort */}
                <div>
                  <div style={{ position: "absolute", left: 0, width: 10, height: 10,
                    borderRadius: "50%", background: GOLD,
                    boxShadow: "0 0 0 3px var(--gold-pale)", marginTop: 2 }} />
                  <div style={{ display: "flex", alignItems: "baseline",
                    gap: ".625rem", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: BF, fontSize: ".56rem", fontWeight: 700,
                      letterSpacing: ".14em", textTransform: "uppercase",
                      color: GOLD, flexShrink: 0 }}>6:00 PM</span>
                    <span style={{ fontFamily: DF, fontSize: "1.1rem", fontWeight: 600,
                      color: INK, lineHeight: 1.1 }}>Blue Bay Beach Resort</span>
                  </div>
                  <p style={{ fontFamily: BF, fontSize: ".76rem", color: "var(--ink-4)",
                    marginTop: ".15rem" }}>Mahabalipuram, ECR</p>
                </div>
              </div>

              {/* Stat strip — 3 key facts */}
              <div className="he-3" style={{ display: "flex", flexWrap: "wrap",
                gap: ".75rem", marginBottom: "2rem" }}>
                {[
                  { value: "15 km",     label: "between venues",  rose: true  },
                  { value: "50–60 km",  label: "from airport",    rose: false },
                  { value: "~40 km",    label: "from Chennai city", rose: false },
                ].map(({ value, label, rose }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column",
                    padding: ".625rem 1rem", borderRadius: 12,
                    background: rose ? "var(--rose-pale)" : "rgba(255,255,255,.70)",
                    border: `1px solid ${rose ? "var(--rose-mid)" : "var(--bdr-md)"}`,
                    backdropFilter: "blur(8px)", gap: ".1rem" }}>
                    <span style={{ fontFamily: DF, fontSize: "1.25rem", fontWeight: 600,
                      color: rose ? ROSE : INK, lineHeight: 1 }}>{value}</span>
                    <span style={{ fontFamily: BF, fontSize: ".58rem", letterSpacing: ".12em",
                      textTransform: "uppercase", color: "var(--ink-4)",
                      fontWeight: 600 }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Page navigation — inline list, not floating pills */}
              <div className="he-4">
                <p style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".38em",
                  textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 600,
                  marginBottom: ".625rem" }}>On this page</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
                  {[
                    { label: "Getting here",  href: "#transport" },
                    { label: "Where to stay", href: "#hotels"    },
                    { label: "Dress code",    href: "#dresscode" },
                    { label: "FAQ",           href: "#faq"       },
                    { label: "Help",          href: "#help"      },
                  ].map(({ label, href }) => (
                    <a key={href} href={href} className="anc-pill">{label}</a>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Boarding-pass card ─────────────────────────────── */}
            <div className="he-3" style={{ flex: "1 1 min(100%,360px)", minWidth: 0 }}>

              {/* Card wrapper — slight rotation for editorial feel */}
              <div style={{
                background: "rgba(255,255,255,.92)",
                backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                borderRadius: 20, overflow: "hidden",
                boxShadow: "0 8px 40px rgba(15,10,11,.09),0 2px 8px rgba(190,45,69,.07),inset 0 1px 0 rgba(255,255,255,1)",
                border: "1.5px solid rgba(190,45,69,.12)",
                position: "relative",
              }}>

                {/* Card top stripe */}
                <div style={{ height: 3,
                  background: "linear-gradient(90deg,var(--rose) 0%,var(--rose-mid) 40%,var(--gold) 50%,var(--rose-mid) 60%,var(--rose) 100%)" }} />

                {/* Date header */}
                <div style={{ padding: "1.125rem 1.5rem .875rem",
                  borderBottom: "1px solid rgba(190,45,69,.08)",
                  display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".38em",
                      textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 600,
                      marginBottom: ".2rem" }}>
                      Wedding day
                    </p>
                    <p style={{ fontFamily: DF, fontSize: "1.1rem", fontWeight: 600, color: INK, lineHeight: 1 }}>
                      Wednesday, 20 May 2026
                    </p>
                  </div>
                  {/* Decorative compass rose */}
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden
                    style={{ opacity: .18, flexShrink: 0 }}>
                    <circle cx="16" cy="16" r="14" stroke="var(--rose)" strokeWidth="1" />
                    <circle cx="16" cy="16" r="9"  stroke="var(--rose)" strokeWidth=".6" />
                    <line x1="16" y1="2"  x2="16" y2="30" stroke="var(--rose)" strokeWidth=".8" />
                    <line x1="2"  y1="16" x2="30" y2="16" stroke="var(--rose)" strokeWidth=".8" />
                    <polygon points="16,4 17.2,14 16,13 14.8,14" fill="var(--rose)" />
                  </svg>
                </div>

                {/* Venue strip — the boarding pass section */}
                <div className="bp-wrap" style={{ margin: "1rem 1.25rem" }}>

                  {/* Church */}
                  <div className="bp-venue" style={{ background: "var(--rose-pale)" }}>
                    <p style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".30em",
                      textTransform: "uppercase", color: ROSE, fontWeight: 700,
                      marginBottom: ".625rem" }}>
                      Ceremony
                    </p>
                    <p style={{ fontFamily: DF, fontSize: "clamp(.95rem,2.2vw,1.2rem)",
                      fontWeight: 600, color: INK, lineHeight: 1.15, marginBottom: ".375rem" }}>
                      Divine Mercy<br />Church
                    </p>
                    <p style={{ fontFamily: BF, fontSize: ".68rem", color: "var(--ink-3)",
                      marginBottom: ".625rem" }}>
                      Kelambakkam, Chennai
                    </p>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 999,
                      background: ROSE, boxShadow: "0 2px 8px rgba(190,45,69,.30)" }}>
                      <span style={{ fontFamily: BF, fontSize: ".52rem", fontWeight: 700,
                        letterSpacing: ".10em", color: "#fff" }}>3:00 PM</span>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="bp-sep">
                    <Car size={13} style={{ color: "var(--ink-4)" }} />
                    <p style={{ fontFamily: BF, fontSize: ".46rem", letterSpacing: ".12em",
                      textTransform: "uppercase", color: "var(--ink-4)",
                      textAlign: "center", lineHeight: 1.5 }}>
                      15 km<br />ECR
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {[0,1,2,3].map(i => (
                        <div key={i} style={{ width: 3, height: 3, borderRadius: "50%",
                          background: i===1||i===2 ? ROSE : "var(--rose-mid)",
                          opacity: i===1||i===2 ? 1 : .4 }} />
                      ))}
                    </div>
                  </div>

                  {/* Resort */}
                  <div className="bp-venue" style={{ background: "var(--gold-pale)" }}>
                    <p style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".30em",
                      textTransform: "uppercase", color: GOLD, fontWeight: 700,
                      marginBottom: ".625rem" }}>
                      Reception
                    </p>
                    <p style={{ fontFamily: DF, fontSize: "clamp(.95rem,2.2vw,1.2rem)",
                      fontWeight: 600, color: INK, lineHeight: 1.15, marginBottom: ".375rem" }}>
                      Blue Bay<br />Beach Resort
                    </p>
                    <p style={{ fontFamily: BF, fontSize: ".68rem", color: "var(--ink-3)",
                      marginBottom: ".625rem" }}>
                      Mahabalipuram
                    </p>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 999,
                      background: GOLD, boxShadow: "0 2px 8px rgba(168,120,8,.28)" }}>
                      <span style={{ fontFamily: BF, fontSize: ".52rem", fontWeight: 700,
                        letterSpacing: ".10em", color: "#fff" }}>6:00 PM</span>
                    </div>
                  </div>
                </div>

                {/* Map links */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                  borderTop: "1px solid rgba(190,45,69,.08)",
                  margin: "0 0 0 0" }}>
                  {[
                    { label: "Church directions",  href: "https://share.google/SCdoX1GZAvGSlOIrQ",     rose: true  },
                    { label: "Resort directions",  href: "https://maps.app.goo.gl/vu56aH1Jvp29gSuu7", rose: false },
                  ].map(({ label, href, rose }, i) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer" style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: ".875rem .75rem",
                      borderRight: i === 0 ? "1px solid rgba(190,45,69,.08)" : "none",
                      fontFamily: BF, fontSize: ".58rem", fontWeight: 700,
                      letterSpacing: ".10em", textTransform: "uppercase",
                      color: rose ? ROSE : GOLD, textDecoration: "none",
                      transition: "background .18s",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = rose ? "var(--rose-pale)" : "var(--gold-pale)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                    >
                      <Navigation size={10} />{label}
                    </a>
                  ))}
                </div>

                {/* Bottom stripe */}
                <div style={{ height: 2,
                  background: "linear-gradient(90deg,var(--rose) 0%,var(--gold) 50%,var(--rose) 100%)" }} />
              </div>

              {/* Floating note under card */}
              <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".82rem",
                color: "var(--ink-4)", textAlign: "center", marginTop: ".875rem",
                lineHeight: 1.6 }}>
                Both venues are 15 km apart along the scenic East Coast Road.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// WEATHER
// ════════════════════════════════════════════════════════════════════════════
const FORECAST = [
  { day: "Fri", hi: 33, lo: 26, Icon: Sun       },
  { day: "Sat", hi: 32, lo: 25, Icon: Cloud     },
  { day: "Sun", hi: 34, lo: 27, Icon: Sun       },
  { day: "Mon", hi: 30, lo: 24, Icon: CloudRain },
  { day: "Tue", hi: 31, lo: 25, Icon: Cloud     },
];

function WeatherCard() {
  return (
    <div style={{ borderRadius: "var(--r-xl)", overflow: "hidden",
      border: "1px solid var(--bdr)", boxShadow: "var(--sh-md)" }}>
      <div style={{ background: "linear-gradient(140deg,#12080C 0%,#1E1218 60%,#12080C 100%)",
        padding: "1.625rem 1.75rem 1.25rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent,var(--rose) 40%,var(--gold-l) 50%,var(--rose) 60%,transparent)" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 55% 70% at 80% 25%,rgba(190,45,69,.09) 0%,transparent 65%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: ".75rem" }}>
          <div>
            <p style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".36em",
              textTransform: "uppercase", color: "rgba(240,190,198,.50)",
              fontWeight: 700, marginBottom: ".5rem" }}>
              Mahabalipuram · May
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: ".5rem", marginBottom: ".2rem" }}>
              <span style={{ fontFamily: DF, fontSize: "clamp(2rem,5vw,2.75rem)", fontWeight: 600,
                color: "#fff", lineHeight: 1 }}>34°C</span>
              <span style={{ fontFamily: BF, fontSize: ".72rem", color: "rgba(255,255,255,.35)" }}>/ 93°F</span>
            </div>
            <p style={{ fontFamily: BF, fontSize: ".72rem", color: "rgba(255,255,255,.42)" }}>
              Hot · Coastal evening breeze
            </p>
          </div>
          <Sun size={34} style={{ color: "rgba(240,190,198,.35)", flexShrink: 0 }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".5rem",
          marginTop: "1.125rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,.07)" }}>
          {[
            { Icon: Thermometer, label: "Humidity", value: "75%"          },
            { Icon: Wind,        label: "Wind",     value: "16 km/h"      },
            { Icon: Cloud,       label: "UV",       value: "9 Very High"  },
          ].map(({ Icon, label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <Icon size={10} style={{ margin: "0 auto .2rem", color: "rgba(240,190,198,.45)" }} />
              <p style={{ fontFamily: BF, fontSize: ".42rem", letterSpacing: ".2em",
                textTransform: "uppercase", color: "rgba(255,255,255,.28)", marginBottom: ".1rem" }}>{label}</p>
              <p style={{ fontFamily: BF, fontSize: ".70rem", fontWeight: 700, color: "rgba(255,255,255,.72)" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)",
        background: "var(--bg-warm)", borderBottom: "1px solid var(--bdr)" }}>
        {FORECAST.map(({ day, hi, lo, Icon }) => (
          <div key={day} style={{ textAlign: "center", padding: ".75rem .25rem" }}>
            <p style={{ fontFamily: BF, fontSize: ".46rem", letterSpacing: ".14em",
              textTransform: "uppercase", color: "var(--ink-3)", marginBottom: ".3rem" }}>{day}</p>
            <Icon size={14} style={{ margin: "0 auto .3rem", color: ROSE }} />
            <p style={{ fontFamily: BF, fontSize: ".75rem", fontWeight: 700, color: INK }}>{hi}°</p>
            <p style={{ fontFamily: BF, fontSize: ".64rem", color: "var(--ink-4)" }}>{lo}°</p>
          </div>
        ))}
      </div>

      <div style={{ padding: ".75rem 1.25rem", background: "var(--bg-linen)" }}>
        <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".875rem",
          color: "var(--ink-3)", lineHeight: 1.6, margin: 0 }}>
          May evenings near the coast cool beautifully — pack a light layer for after sunset.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TRANSPORT
// ════════════════════════════════════════════════════════════════════════════
const TRANSPORT = [
  { Icon: Plane,      rose: true,  title: "By air",   desc: "Chennai International (MAA) — 50–60 km away. Pre-book Ola Outstation or Uber Intercity for a reliable transfer on the day." },
  { Icon: TrainFront, rose: false, title: "By train", desc: "Chennai Central or Egmore to Chengalpattu (~15 km from the venue). Auto-rickshaws and cabs are plentiful at the station." },
  { Icon: Bus,        rose: true,  title: "By bus",   desc: "SETC and private coaches run along East Coast Road (ECR). The nearest stop is around 500 m from the venue gate." },
  { Icon: Car,        rose: false, title: "By road",  desc: "Take ECR south from Chennai city. GPS: Blue Bay Beach Resort, Mahabalipuram. A scenic coastal evening drive." },
];

function TransportCard({ Icon, title, desc, rose }: typeof TRANSPORT[0]) {
  const ac = rose ? ROSE : GOLD;
  const bg = rose ? "var(--rose-pale)" : "var(--gold-pale)";
  const bd = rose ? "var(--rose-mid)"  : "rgba(168,120,8,.30)";
  return (
    <G s={{ padding: "1.25rem 1.375rem", display: "flex", alignItems: "flex-start", gap: "1rem" }}
      {...{
        onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => lift(e.currentTarget, true),
        onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => lift(e.currentTarget, false),
      }}>
      <div style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", flexShrink: 0,
        background: bg, border: `1px solid ${bd}`,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} style={{ color: ac }} />
      </div>
      <div>
        <p style={{ fontFamily: DF, fontSize: ".975rem", fontWeight: 600, color: INK, marginBottom: ".25rem" }}>{title}</p>
        <p style={{ fontFamily: BF, fontSize: ".82rem", color: "var(--ink-3)", lineHeight: 1.65 }}>{desc}</p>
      </div>
    </G>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HOTELS
// ════════════════════════════════════════════════════════════════════════════
const HOTELS = [
  { name: "Radisson Blu Temple Bay", dist: "3 km",   stars: 5, tag: "Preferred",     rose: true  },
  { name: "GRT Temple Bay Resort",   dist: "2 km",   stars: 5, tag: "Beachfront",    rose: false },
  { name: "Sea Hawk Resort",         dist: "1.5 km", stars: 4, tag: "Mid-range",     rose: false },
  { name: "The Ideal Beach Resort",  dist: "4 km",   stars: 4, tag: "Family suites", rose: false },
];

function HotelCard({ name, dist, stars, tag, rose }: typeof HOTELS[0]) {
  const ac  = rose ? ROSE : GOLD;
  const aBg = rose ? "var(--rose-pale)" : "var(--gold-pale)";
  const aBd = rose ? "var(--rose-mid)"  : "rgba(168,120,8,.28)";
  return (
    <a href={`https://www.google.com/search?q=${encodeURIComponent(name + " Mahabalipuram")}`}
      target="_blank" rel="noreferrer"
      style={{ display: "flex", flexDirection: "column", gap: ".875rem", padding: "1.25rem",
        background: "rgba(255,255,255,.84)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderRadius: "var(--r-xl)", border: "1px solid rgba(255,255,255,.76)",
        boxShadow: "var(--sh-sm)", textDecoration: "none",
        backgroundImage: "var(--noise),linear-gradient(rgba(255,255,255,.84),rgba(255,255,255,.84))",
        transition: "transform .18s var(--expo),box-shadow .18s var(--smooth)" }}
      onMouseEnter={e => { if (typeof window !== "undefined" && window.matchMedia("(hover:hover)").matches) { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "var(--sh-lg)"; } }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = "var(--sh-sm)"; }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".5rem" }}>
        <div style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", flexShrink: 0,
          background: aBg, border: `1px solid ${aBd}`,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Building2 size={14} style={{ color: ac }} />
        </div>
        <span style={{ fontFamily: BF, fontSize: ".44rem", fontWeight: 700, letterSpacing: ".14em",
          textTransform: "uppercase", color: ac, background: aBg,
          border: `1px solid ${aBd}`, padding: "3px 9px", borderRadius: 999, flexShrink: 0 }}>
          {tag}
        </span>
      </div>
      <div>
        <p style={{ fontFamily: DF, fontSize: ".975rem", fontWeight: 600, color: INK, lineHeight: 1.2, marginBottom: ".25rem" }}>{name}</p>
        <p style={{ fontFamily: BF, fontSize: ".70rem", color: "var(--ink-4)" }}>{dist} from venue</p>
        <p style={{ fontFamily: BF, fontSize: ".72rem", color: GOLD, marginTop: ".2rem" }}>{"★".repeat(stars)}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: "auto" }}>
        <span style={{ fontFamily: BF, fontSize: ".60rem", fontWeight: 700, color: ac, letterSpacing: ".06em" }}>Check availability</span>
        <ExternalLink size={10} style={{ color: ac }} />
      </div>
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DRESS CODE
// ════════════════════════════════════════════════════════════════════════════
const SWATCHES = [
  { label: "Ivory",      bg: "#F8F4EF" },
  { label: "Champagne",  bg: "#F0D99A" },
  { label: "Soft gold",  bg: "#D4A84B" },
  { label: "Sage",       bg: "#9AAF9B" },
  { label: "Dusty rose", bg: "#E8B4B8" },
];

function DressCode() {
  return (
    <div style={{ borderRadius: "var(--r-xl)", overflow: "hidden",
      border: "1px solid var(--bdr)", boxShadow: "var(--sh-md)" }}>
      <div style={{ background: "linear-gradient(140deg,#0F0A0B 0%,#1C1214 60%,#0F0A0B 100%)",
        padding: "1.625rem 1.75rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent,var(--gold) 40%,var(--gold-l) 50%,var(--gold) 60%,transparent)" }} />
        <p style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".40em",
          textTransform: "uppercase", color: "rgba(232,196,80,.55)", fontWeight: 700, marginBottom: ".75rem" }}>
          Beach reception dress code
        </p>
        <h3 style={{ fontFamily: DF, fontStyle: "italic", fontWeight: 300,
          fontSize: "clamp(1.375rem,3vw,2rem)", color: "#fff", lineHeight: 1.1, marginBottom: ".5rem" }}>
          Coastal elegance.
        </h3>
        <p style={{ fontFamily: BF, fontSize: ".78rem", color: "rgba(255,255,255,.46)", lineHeight: 1.6 }}>
          Whites, creams, champagnes, soft golds, and greens. Flowing fabrics welcome.
        </p>
      </div>
      <div style={{ display: "flex", background: "var(--bg-warm)", borderBottom: "1px solid var(--bdr)" }}>
        {SWATCHES.map(({ label, bg }, i) => (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", padding: ".875rem .375rem .75rem", gap: ".5rem",
            borderRight: i < SWATCHES.length - 1 ? "1px solid var(--bdr)" : "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: bg,
              border: "2px solid rgba(255,255,255,.80)", boxShadow: "0 2px 6px rgba(15,10,11,.10)" }} />
            <p style={{ fontFamily: BF, fontSize: ".42rem", textAlign: "center",
              color: "var(--ink-3)", lineHeight: 1.3 }}>{label}</p>
          </div>
        ))}
      </div>
      <div style={{ padding: ".75rem 1.25rem", background: "var(--bg-linen)" }}>
        <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".85rem",
          color: "var(--ink-3)", margin: 0, lineHeight: 1.6 }}>
          Wedges and block heels recommended — the reception is on a beach lawn.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TRAVEL NOTES (DB)
// ════════════════════════════════════════════════════════════════════════════
function NoteCard({ s }: { s: TravelSection }) {
  return (
    <G s={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: ".875rem" }}
      {...{
        onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => lift(e.currentTarget, true),
        onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => lift(e.currentTarget, false),
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".5rem" }}>
        <Eyebrow c={s.category ?? "Travel note"} />
        <div style={{ width: 28, height: 28, borderRadius: "var(--r-sm)", flexShrink: 0,
          background: "var(--rose-pale)", border: "1px solid var(--rose-mid)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MapPin size={12} style={{ color: ROSE }} />
        </div>
      </div>
      <h3 style={{ fontFamily: DF, fontSize: "1.1rem", fontWeight: 600, color: INK, lineHeight: 1.2 }}>{s.title}</h3>
      <p style={{ fontFamily: BF, fontSize: ".84rem", color: "var(--ink-2)", lineHeight: 1.72, flex: 1 }}>{s.description}</p>
      <a href={s.link} target="_blank" rel="noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: BF,
          fontSize: ".66rem", fontWeight: 700, color: ROSE, textDecoration: "none", letterSpacing: ".06em" }}>
        Open in maps <ExternalLink size={10} />
      </a>
    </G>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ARRIVAL TIMELINE
// ════════════════════════════════════════════════════════════════════════════
function ArrivalTimeline({ tips }: { tips: string[] }) {
  return (
    <div style={{ position: "relative", paddingLeft: "2rem" }}>
      <div style={{ position: "absolute", left: ".5rem", top: 9, bottom: 9, width: 1,
        background: `linear-gradient(to bottom,${ROSE} 0%,var(--rose-mid) 65%,transparent 100%)` }} />
      {tips.map((tip, i) => (
        <div key={i} style={{ display: "flex", gap: ".875rem",
          paddingBottom: i < tips.length - 1 ? "1.125rem" : 0 }}>
          <div style={{ position: "absolute", left: 0, width: 18, height: 18, borderRadius: "50%",
            marginTop: 1, flexShrink: 0, zIndex: 1,
            background: i === 0 ? ROSE : "var(--bg-warm)",
            border: `2px solid ${i === 0 ? ROSE : "var(--rose-mid)"}`,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            {i === 0
              ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
              : <span style={{ fontFamily: BF, fontSize: ".40rem", fontWeight: 700, color: ROSE }}>{i + 1}</span>}
          </div>
          <p style={{ fontFamily: BF, fontSize: ".875rem", color: "var(--ink-2)", lineHeight: 1.72 }}>{tip}</p>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FAQ
// ════════════════════════════════════════════════════════════════════════════
function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <G s={{ overflow: "hidden" }}>
      {items.map((item, i) => (
        <div key={i} style={{ borderBottom: i < items.length - 1 ? "1px solid var(--bdr)" : "none" }}>
          <button type="button" onClick={() => setOpen(open === i ? null : i)}
            style={{ width: "100%", display: "flex", alignItems: "flex-start",
              justifyContent: "space-between", gap: "1rem",
              padding: "1.125rem 1.375rem",
              background: open === i ? "var(--bg-warm)" : "none",
              border: "none", cursor: "pointer", textAlign: "left", transition: "background .18s",
              WebkitTapHighlightColor: "transparent" }}
            onMouseEnter={e => { if (open !== i)(e.currentTarget as HTMLButtonElement).style.background = "var(--bg-linen)"; }}
            onMouseLeave={e => { if (open !== i)(e.currentTarget as HTMLButtonElement).style.background = "none"; }}>
            <span style={{ fontFamily: DF, fontSize: "1rem", fontWeight: 600, color: INK, lineHeight: 1.3, flex: 1 }}>
              {item.question}
            </span>
            <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 2,
              background: open === i ? ROSE : "var(--rose-pale)", border: "1px solid var(--rose-mid)",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "background .18s" }}>
              <ChevronDown size={12} style={{ color: open === i ? "#fff" : ROSE,
                transition: "transform .22s var(--expo)",
                transform: open === i ? "rotate(180deg)" : "none" }} />
            </div>
          </button>
          {open === i && (
            <div style={{ padding: "0 1.375rem 1.125rem", background: "var(--bg-warm)" }}>
              <p style={{ fontFamily: BF, fontSize: ".875rem", color: "var(--ink-2)", lineHeight: 1.72 }}>
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </G>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONTACTS
// ════════════════════════════════════════════════════════════════════════════
const CONTACTS = [
  { Icon: Phone,       label: "Wedding coordination", value: "+91 98765 43210",     href: "tel:+919876543210",           note: "8 AM – 10 PM"        },
  { Icon: MapPin,      label: "Venue",                value: "Blue Bay Resort",      href: "tel:+914427473000",           note: "+91 44 2747 3000"    },
  { Icon: HeartPulse,  label: "Medical emergency",    value: "108 Ambulance",        href: "tel:108",                    note: "24 × 7"              },
  { Icon: ShieldCheck, label: "Police",               value: "100",                  href: "tel:100",                    note: "Mahabalipuram"       },
  { Icon: Car,         label: "Cab / rideshare",      value: "Ola · Uber",           href: "https://www.olacabs.com",    note: "Available locally"   },
  { Icon: Phone,       label: "Family helpline",      value: "jason454a@gmail.com",  href: "mailto:jason454a@gmail.com", note: "Any assistance"      },
];

function ContactTile({ Icon, label, value, href, note }: typeof CONTACTS[0]) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
      style={{ display: "flex", alignItems: "center", gap: ".875rem",
        padding: ".875rem 1rem",
        background: "rgba(255,255,255,.84)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        borderRadius: "var(--r-lg)", border: "1px solid rgba(255,255,255,.72)",
        boxShadow: "var(--sh-xs)", textDecoration: "none",
        backgroundImage: "var(--noise),linear-gradient(rgba(255,255,255,.84),rgba(255,255,255,.84))",
        transition: "transform .18s var(--expo),box-shadow .18s var(--smooth)",
        WebkitTapHighlightColor: "transparent" }}
      onMouseEnter={e => { if (typeof window !== "undefined" && window.matchMedia("(hover:hover)").matches) { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "var(--sh-sm)"; } }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = "var(--sh-xs)"; }}>
      <div style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", flexShrink: 0,
        background: "var(--rose-pale)", border: "1px solid var(--rose-mid)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} style={{ color: ROSE }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".20em",
          textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 600, marginBottom: ".15rem" }}>{label}</p>
        <p style={{ fontFamily: DF, fontSize: ".925rem", fontWeight: 600, color: INK, lineHeight: 1.1,
          marginBottom: ".15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
        <p style={{ fontFamily: BF, fontSize: ".66rem", color: "var(--ink-3)" }}>{note}</p>
      </div>
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════
export function TravelPageClient({ sections, essentials, faq, arrivalTips }: GuideProps) {
  return (
    <div style={{ background: "var(--bg)", color: INK, minHeight: "100vh" }}>
      <style>{`
        /* ── Grid helpers ── */
        .tr-2 { display:grid; grid-template-columns:1fr 1fr;       gap:1.5rem; align-items:start }
        .tr-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem }
        .tr-a { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.125rem }
        .tr-c { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:.875rem }

        /* Hotels nested grid — 2×2 on desktop, 1 col on mobile */
        .tr-h { display:grid; grid-template-columns:1fr 1fr; gap:1rem }

        @media(max-width:860px){
          .tr-2 { grid-template-columns:1fr !important; gap:1.25rem !important }
        }
        @media(max-width:600px){
          .tr-4 { grid-template-columns:1fr 1fr !important }
          .tr-a { grid-template-columns:1fr !important }
          .tr-c { grid-template-columns:1fr !important }
          .tr-h { grid-template-columns:1fr !important }
        }
        @media(max-width:380px){
          .tr-4 { grid-template-columns:1fr !important }
        }

        /* Scroll offset for sticky nav */
        [id] { scroll-margin-top:5rem }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto",
        padding: "clamp(3rem,6vh,5rem) var(--pad-x) clamp(4rem,8vh,6rem)" }}>

        {/* 1 ── Getting here: Weather + Transport ─────────────────────── */}
        <section id="transport">
          <SH ey="Getting here" ti="How to arrive"
            sub="Chennai is well connected by air, rail, and road. The East Coast Road is your gateway to both venues." />
          <div className="tr-2">
            {/* Left — weather */}
            <WeatherCard />
            {/* Right — transport 2×2 grid */}
            <div className="tr-h">
              {TRANSPORT.map(t => <TransportCard key={t.title} {...t} />)}
            </div>
          </div>
        </section>

        <Div />

        {/* 3 ── Hotels + Dress code ──────────────────────────────────────── */}
        <section id="hotels">
          <div className="tr-2" style={{ alignItems: "start" }}>
            <div id="dresscode">
              <SH ey="Where to stay" ti="Hotels nearby" />
              <div className="tr-h">
                {HOTELS.map(h => <HotelCard key={h.name} {...h} />)}
              </div>
            </div>
            <div>
              <SH ey="What to wear" ti="Dress code" gold />
              <DressCode />
            </div>
          </div>
        </section>

        {/* DB travel notes */}
        {sections.length > 0 && (
          <>
            <Div />
            <section>
              <SH ey="From the couple" ti="Things to know" />
              <div className="tr-a">
                {sections.map(s => <NoteCard key={s.id} s={s} />)}
              </div>
            </section>
          </>
        )}

        <Div />

        {/* 4 ── Arrival tips + FAQ ───────────────────────────────────────── */}
        <section id="faq">
          <div className="tr-2">
            {arrivalTips.length > 0 && (
              <div>
                <SH ey="On arrival" ti="Arrival tips" />
                <ArrivalTimeline tips={arrivalTips} />
              </div>
            )}
            {faq.length > 0 && (
              <div>
                <SH ey="Questions" ti="FAQ" />
                <FAQ items={faq} />
              </div>
            )}
          </div>
        </section>

        <Div />

        {/* 5 ── Contacts ─────────────────────────────────────────────────── */}
        <section id="help">
          <SH ey="Help &amp; emergency" ti="We're here for you"
            sub="Save these before your journey. The family helpline is available throughout the celebration day." />
          <div className="tr-c">
            {CONTACTS.map(c => <ContactTile key={c.label} {...c} />)}
          </div>
        </section>

        {/* 6 ── Nearby essentials ────────────────────────────────────────── */}
        {essentials.length > 0 && (
          <>
            <Div />
            <section>
              <SH ey="Near the venue" ti="Nearby essentials"
                sub="Hospital, pharmacy, police, and transport links within a short distance of both venues." />
              <NearbyEssentials items={essentials} />
            </section>
          </>
        )}
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid var(--bdr)", padding: "1.625rem var(--pad-x)",
        background: "var(--bg-warm)", display: "flex", flexWrap: "wrap",
        alignItems: "center", justifyContent: "space-between", gap: ".875rem" }}>
        <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".875rem", color: "var(--ink-3)" }}>
          Questions?{" "}
          <a href="mailto:jason454a@gmail.com"
            style={{ color: ROSE, fontWeight: 600, textDecoration: "none" }}>
            jason454a@gmail.com
          </a>
        </p>
        <span style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".36em",
          textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 600 }}>
          Marion &amp; Livingston · 20 · 05 · 2026
        </span>
      </div>
    </div>
  );
}
