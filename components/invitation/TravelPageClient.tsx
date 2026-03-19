"use client";

/**
 * TravelPageClient — Redesigned
 *
 * Design philosophy: "A journey worth making"
 * — The page feels like a beautifully printed travel itinerary
 * — Two-venue journey is the visual anchor: Church → Reception as a road
 * — Scannable, editorial, warm — not a data dump
 * — Every section has a clear emotional register
 */

import { useState, useRef, useCallback } from "react";
import {
  Plane, TrainFront, Bus, Car,
  Phone, MapPin, HeartPulse, ShieldCheck,
  ChevronDown, ArrowUpRight, Navigation,
  Sun, Cloud, CloudRain, Wind, Thermometer,
  Clock, ExternalLink, Building2,
} from "lucide-react";
import { NearbyEssentials } from "@/components/invitation/NearbyEssentials";
import type { EssentialItem } from "@/components/invitation/NearbyEssentials";

// ── Types ────────────────────────────────────────────────────────────────────
interface TravelSection {
  id: string; title: string; description: string; link: string;
  category?: string | null; icon?: string | null;
}
interface FAQItem    { question: string; answer: string }
interface GuideProps {
  sections: TravelSection[]; essentials: EssentialItem[];
  faq: FAQItem[]; arrivalTips: string[];
}

// ── Tilt hook ────────────────────────────────────────────────────────────────
function useTilt(strength = 8) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5;
    const y = (e.clientY - top)  / height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale3d(1.02,1.02,1.02)`;
  }, [strength]);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = "";
  }, []);
  return { ref, onMove, onLeave };
}

// ── Shared primitives ────────────────────────────────────────────────────────
const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";
const ROSE = "var(--rose)"; const GOLD = "var(--gold)"; const INK = "var(--ink)";

function Eyebrow({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <p style={{ fontFamily: BF, fontSize: ".52rem", letterSpacing: ".44em", textTransform: "uppercase",
      color: gold ? GOLD : ROSE, fontWeight: 700, marginBottom: ".5rem" }}>
      {children}
    </p>
  );
}

function SectionHead({ eyebrow, title, subtitle, gold }: { eyebrow: string; title: string; subtitle?: string; gold?: boolean }) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <Eyebrow gold={gold}>{eyebrow}</Eyebrow>
      <h2 style={{ fontFamily: DF, fontWeight: 300,
        fontSize: "clamp(1.875rem,4vw,3rem)", color: INK, lineHeight: 1.05,
        letterSpacing: "-.025em", marginBottom: subtitle ? ".875rem" : 0 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontFamily: BF, fontSize: ".9rem", color: "var(--ink-3)", lineHeight: 1.72, maxWidth: "40rem", marginTop: ".625rem" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── Journey map — the centrepiece ────────────────────────────────────────────
function JourneyMap() {
  return (
    <div style={{
      borderRadius: "var(--r-xl)", overflow: "hidden",
      border: "1px solid var(--bdr)",
      boxShadow: "var(--sh-lg)",
    }}>
      {/* Dark cinematic header */}
      <div style={{
        background: "linear-gradient(150deg, #0F0A0B 0%, #1C1214 55%, #0F0A0B 100%)",
        padding: "2.5rem 2.5rem 0",
        position: "relative", overflow: "hidden",
      }}>
        {/* Top stripe */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent,var(--rose) 30%,var(--gold-l) 50%,var(--rose) 70%,transparent)" }} />

        {/* Ambient glow blobs */}
        <div aria-hidden style={{ position: "absolute", top: "-30%", left: "20%", width: "40%", height: "160%",
          borderRadius: "50%", background: "radial-gradient(circle,rgba(190,45,69,.10) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "20%", right: "-5%", width: "30%", height: "80%",
          borderRadius: "50%", background: "radial-gradient(circle,rgba(168,120,8,.08) 0%,transparent 65%)", pointerEvents: "none" }} />

        {/* Label */}
        <p style={{ fontFamily: BF, fontSize: ".48rem", letterSpacing: ".44em", textTransform: "uppercase",
          color: "rgba(240,190,198,.55)", fontWeight: 700, marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
          The journey · 20 May 2026
        </p>

        {/* Two venues connected by a road */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, position: "relative", zIndex: 1 }}>

          {/* Venue A — Church */}
          <div style={{ flex: 1, paddingBottom: "2rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 999,
              background: "rgba(190,45,69,.18)", border: "1px solid rgba(190,45,69,.35)",
              marginBottom: "1rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--rose)" }} />
              <span style={{ fontFamily: BF, fontSize: ".50rem", letterSpacing: ".22em", textTransform: "uppercase",
                color: "var(--rose)", fontWeight: 700 }}>3:00 PM</span>
            </div>
            <h3 style={{ fontFamily: DF, fontSize: "clamp(1.25rem,3vw,1.75rem)", fontWeight: 600,
              color: "#fff", lineHeight: 1.1, marginBottom: ".5rem" }}>
              Divine Mercy<br/>Church
            </h3>
            <p style={{ fontFamily: BF, fontSize: ".78rem", color: "rgba(255,255,255,.45)", lineHeight: 1.5 }}>
              Kelambakkam, Chennai
            </p>
          </div>

          {/* Road connector */}
          <div style={{ width: "clamp(80px,18%,160px)", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "flex-end", paddingBottom: "2rem", gap: ".75rem" }}>
            {/* Dashed road line */}
            <div style={{ position: "relative", width: "100%", height: 2, flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0,
                background: "repeating-linear-gradient(90deg,rgba(255,255,255,.25) 0,rgba(255,255,255,.25) 8px,transparent 8px,transparent 16px)" }} />
              {/* Arrow head */}
              <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
                width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent",
                borderLeft: "8px solid rgba(255,255,255,.35)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".25rem" }}>
              <Car size={13} style={{ color: "rgba(255,255,255,.35)" }} />
              <p style={{ fontFamily: BF, fontSize: ".48rem", letterSpacing: ".18em", textTransform: "uppercase",
                color: "rgba(255,255,255,.28)", textAlign: "center", lineHeight: 1.4 }}>
                15 km<br/>ECR
              </p>
            </div>
          </div>

          {/* Venue B — Reception */}
          <div style={{ flex: 1, paddingBottom: "2rem", textAlign: "right" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 999,
              background: "rgba(168,120,8,.18)", border: "1px solid rgba(168,120,8,.35)",
              marginBottom: "1rem" }}>
              <span style={{ fontFamily: BF, fontSize: ".50rem", letterSpacing: ".22em", textTransform: "uppercase",
                color: "var(--gold-l)", fontWeight: 700 }}>6:00 PM</span>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)" }} />
            </div>
            <h3 style={{ fontFamily: DF, fontSize: "clamp(1.25rem,3vw,1.75rem)", fontWeight: 600,
              color: "#fff", lineHeight: 1.1, marginBottom: ".5rem" }}>
              Blue Bay<br/>Beach Resort
            </h3>
            <p style={{ fontFamily: BF, fontSize: ".78rem", color: "rgba(255,255,255,.45)", lineHeight: 1.5 }}>
              Mahabalipuram, ECR
            </p>
          </div>
        </div>
      </div>

      {/* Map links strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg-warm)" }}>
        {[
          { label: "Church directions", href: "https://share.google/SCdoX1GZAvGSlOIrQ", rose: true },
          { label: "Resort directions",  href: "https://maps.app.goo.gl/vu56aH1Jvp29gSuu7", rose: false },
        ].map(({ label, href, rose }, i) => (
          <a key={label} href={href} target="_blank" rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "1.125rem",
              borderTop: "1px solid var(--bdr)",
              borderRight: i === 0 ? "1px solid var(--bdr)" : "none",
              fontFamily: BF, fontSize: ".65rem", fontWeight: 700, letterSpacing: ".14em",
              textTransform: "uppercase", color: rose ? "var(--rose)" : "var(--gold)",
              textDecoration: "none",
              transition: "background .18s ease",
              background: "transparent",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = rose ? "var(--rose-pale)" : "var(--gold-pale)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
          >
            <Navigation size={11} />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Travel notes — from DB/config ────────────────────────────────────────────
function TravelNoteCard({ section }: { section: TravelSection }) {
  const { ref, onMove, onLeave } = useTilt(6);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{
        background: "rgba(255,255,255,.80)", backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "var(--r-xl)", padding: "1.75rem",
        border: "1px solid rgba(255,255,255,.72)",
        boxShadow: "var(--sh-sm)", display: "flex", flexDirection: "column", gap: "1rem",
        transformStyle: "preserve-3d",
        transition: "transform .18s var(--expo), box-shadow .18s var(--smooth)",
        backgroundImage: "var(--noise), linear-gradient(rgba(255,255,255,.80), rgba(255,255,255,.80))",
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".5rem" }}>
        <Eyebrow>{section.category ?? "Travel note"}</Eyebrow>
        <div style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", flexShrink: 0,
          background: "var(--rose-pale)", border: "1px solid var(--rose-mid)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MapPin size={14} style={{ color: ROSE }} />
        </div>
      </div>
      <h3 style={{ fontFamily: DF, fontSize: "1.2rem", fontWeight: 600, color: INK, lineHeight: 1.2 }}>
        {section.title}
      </h3>
      <p style={{ fontFamily: BF, fontSize: ".875rem", color: "var(--ink-2)", lineHeight: 1.72, flex: 1 }}>
        {section.description}
      </p>
      <a href={section.link} target="_blank" rel="noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: BF,
          fontSize: ".72rem", fontWeight: 700, color: ROSE, textDecoration: "none",
          letterSpacing: ".08em" }}>
        Open in maps <ExternalLink size={10} />
      </a>
    </div>
  );
}

// ── Transport pills ───────────────────────────────────────────────────────────
const TRANSPORT = [
  { Icon: Plane,      title: "By air",    color: "var(--rose)", bg: "var(--rose-pale)", bd: "var(--rose-mid)",
    desc: "Chennai International (MAA) is your closest airport — 50–60 km from the venues via OMR/ECR. Pre-book Ola or Uber Outstation in advance." },
  { Icon: TrainFront, title: "By train",  color: "var(--gold)", bg: "var(--gold-pale)", bd: "rgba(168,120,8,.30)",
    desc: "Chennai Central or Egmore. Local trains run to Chengalpattu, ~15 km from the resort. An auto or cab covers the last stretch." },
  { Icon: Bus,        title: "By bus",    color: "var(--rose)", bg: "var(--rose-pale)", bd: "var(--rose-mid)",
    desc: "SETC and private coaches run along East Coast Road (ECR). The nearest stop is roughly 500 m from the venue gate." },
  { Icon: Car,        title: "By road",   color: "var(--gold)", bg: "var(--gold-pale)", bd: "rgba(168,120,8,.30)",
    desc: "Take ECR south from Chennai. GPS: Blue Bay Beach Resort, Mahabalipuram. A scenic evening coastal drive on a good day." },
];

function TransportRow({ Icon, title, desc, color, bg, bd }: typeof TRANSPORT[0]) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "1.25rem",
      padding: "1.375rem 1.5rem",
      background: "rgba(255,255,255,.80)", backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderRadius: "var(--r-lg)",
      border: "1px solid rgba(255,255,255,.72)",
      boxShadow: "var(--sh-xs)",
      transition: "transform .2s var(--expo), box-shadow .2s var(--smooth)",
      backgroundImage: "var(--noise), linear-gradient(rgba(255,255,255,.80),rgba(255,255,255,.80))",
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "var(--sh-md)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ""; el.style.boxShadow = "var(--sh-xs)"; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: "var(--r-sm)", flexShrink: 0,
        background: bg, border: `1px solid ${bd}`,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p style={{ fontFamily: DF, fontSize: "1.05rem", fontWeight: 600, color: INK, marginBottom: ".3rem" }}>
          {title}
        </p>
        <p style={{ fontFamily: BF, fontSize: ".82rem", color: "var(--ink-3)", lineHeight: 1.65 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Weather widget ────────────────────────────────────────────────────────────
const FORECAST = [
  { day: "Fri", hi: 33, lo: 26, Icon: Sun },
  { day: "Sat", hi: 32, lo: 25, Icon: Cloud },
  { day: "Sun", hi: 34, lo: 27, Icon: Sun },
  { day: "Mon", hi: 30, lo: 24, Icon: CloudRain },
  { day: "Tue", hi: 31, lo: 25, Icon: Cloud },
];

function WeatherWidget() {
  return (
    <div style={{
      borderRadius: "var(--r-xl)", overflow: "hidden",
      border: "1px solid var(--bdr)", boxShadow: "var(--sh-md)",
    }}>
      {/* Compact dark header */}
      <div style={{
        background: "linear-gradient(140deg,#12080C 0%,#1E1218 60%,#12080C 100%)",
        padding: "1.75rem 2rem", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent,var(--rose) 40%,var(--gold-l) 50%,var(--rose) 60%,transparent)" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 80% at 80% 30%,rgba(190,45,69,.09) 0%,transparent 65%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: BF, fontSize: ".46rem", letterSpacing: ".38em", textTransform: "uppercase",
              color: "rgba(240,190,198,.55)", fontWeight: 700, marginBottom: ".625rem" }}>
              Mahabalipuram · May 2026
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: ".5rem", marginBottom: ".25rem" }}>
              <span style={{ fontFamily: DF, fontSize: "clamp(2.25rem,6vw,3rem)", fontWeight: 600, color: "#fff", lineHeight: 1 }}>
                34°C
              </span>
              <span style={{ fontFamily: BF, fontSize: ".8rem", color: "rgba(255,255,255,.40)" }}>/ 93°F</span>
            </div>
            <p style={{ fontFamily: BF, fontSize: ".78rem", color: "rgba(255,255,255,.45)" }}>
              Hot &amp; sunny · Coastal evening breeze
            </p>
          </div>
          <Sun size={40} style={{ color: "rgba(240,190,198,.40)", flexShrink: 0 }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".5rem",
          marginTop: "1.25rem", paddingTop: "1.125rem", borderTop: "1px solid rgba(255,255,255,.07)" }}>
          {[
            { Icon: Thermometer, label: "Humidity", value: "75%" },
            { Icon: Wind,        label: "Wind",     value: "16 km/h" },
            { Icon: Cloud,       label: "UV",       value: "9 — Very high" },
          ].map(({ Icon, label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <Icon size={11} style={{ margin: "0 auto .2rem", color: "rgba(240,190,198,.45)" }} />
              <p style={{ fontFamily: BF, fontSize: ".44rem", letterSpacing: ".2em", textTransform: "uppercase",
                color: "rgba(255,255,255,.30)", marginBottom: ".15rem" }}>{label}</p>
              <p style={{ fontFamily: BF, fontSize: ".72rem", fontWeight: 700, color: "rgba(255,255,255,.75)" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-day strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)",
        background: "var(--bg-warm)", borderBottom: "1px solid var(--bdr)" }}>
        {FORECAST.map(({ day, hi, lo, Icon }) => (
          <div key={day} style={{ textAlign: "center", padding: ".875rem .25rem" }}>
            <p style={{ fontFamily: BF, fontSize: ".52rem", letterSpacing: ".16em", textTransform: "uppercase",
              color: "var(--ink-3)", marginBottom: ".375rem" }}>{day}</p>
            <Icon size={16} style={{ margin: "0 auto .375rem", color: ROSE }} />
            <p style={{ fontFamily: BF, fontSize: ".78rem", fontWeight: 700, color: INK }}>{hi}°</p>
            <p style={{ fontFamily: BF, fontSize: ".68rem", color: "var(--ink-4)" }}>{lo}°</p>
          </div>
        ))}
      </div>

      {/* Advisory */}
      <div style={{ padding: ".875rem 1.5rem", background: "var(--bg-linen)" }}>
        <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".875rem",
          color: "var(--ink-3)", lineHeight: 1.65, margin: 0 }}>
          May evenings at the coast cool down beautifully — pack a light layer for after sunset.
        </p>
      </div>
    </div>
  );
}

// ── Hotels grid ───────────────────────────────────────────────────────────────
const HOTELS = [
  { name: "Radisson Blu Temple Bay", dist: "3 km", stars: 5, tag: "Preferred",     rose: true  },
  { name: "GRT Temple Bay Resort",   dist: "2 km", stars: 5, tag: "Beachfront",    rose: false },
  { name: "Sea Hawk Resort",         dist: "1.5 km", stars: 4, tag: "Mid-range",   rose: false },
  { name: "The Ideal Beach Resort",  dist: "4 km", stars: 4, tag: "Family suites", rose: false },
];

function HotelCard({ name, dist, stars, tag, rose }: typeof HOTELS[0]) {
  const { ref, onMove, onLeave } = useTilt(9);
  const accent  = rose ? "var(--rose)"     : "var(--gold)";
  const accentBg = rose ? "var(--rose-pale)": "var(--gold-pale)";
  const accentBd = rose ? "var(--rose-mid)" : "rgba(168,120,8,.28)";

  return (
    <a href={`https://www.google.com/search?q=${encodeURIComponent(name+" Mahabalipuram")}`}
      target="_blank" rel="noreferrer"
      ref={ref as unknown as React.RefObject<HTMLAnchorElement>}
      onMouseMove={onMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      onMouseLeave={onLeave as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      style={{
        display: "flex", flexDirection: "column", gap: ".875rem",
        padding: "1.5rem", textDecoration: "none",
        background: "rgba(255,255,255,.82)", backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderRadius: "var(--r-xl)", border: "1px solid rgba(255,255,255,.75)",
        boxShadow: "var(--sh-sm)", transformStyle: "preserve-3d",
        transition: "transform .18s var(--expo), box-shadow .18s var(--smooth)",
        backgroundImage: "var(--noise), linear-gradient(rgba(255,255,255,.82),rgba(255,255,255,.82))",
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".5rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: "var(--r-sm)", flexShrink: 0,
          background: accentBg, border: `1px solid ${accentBd}`,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Building2 size={15} style={{ color: accent }} />
        </div>
        <span style={{ fontFamily: BF, fontSize: ".50rem", fontWeight: 700, letterSpacing: ".14em",
          textTransform: "uppercase", color: accent,
          background: accentBg, border: `1px solid ${accentBd}`,
          padding: "3px 10px", borderRadius: 999 }}>
          {tag}
        </span>
      </div>
      <div>
        <p style={{ fontFamily: DF, fontSize: "1.05rem", fontWeight: 600, color: INK, lineHeight: 1.2, marginBottom: ".25rem" }}>
          {name}
        </p>
        <p style={{ fontFamily: BF, fontSize: ".72rem", color: "var(--ink-4)" }}>{dist} from venue</p>
        <p style={{ fontFamily: BF, fontSize: ".78rem", color: "var(--gold)", marginTop: ".25rem", letterSpacing: ".02em" }}>
          {"★".repeat(stars)}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: "auto" }}>
        <span style={{ fontFamily: BF, fontSize: ".65rem", fontWeight: 700, color: accent }}>
          Check availability
        </span>
        <ArrowUpRight size={11} style={{ color: accent }} />
      </div>
    </a>
  );
}

// ── Arrival tips — timeline style ─────────────────────────────────────────────
function ArrivalTimeline({ tips }: { tips: string[] }) {
  return (
    <div style={{ position: "relative", paddingLeft: "2rem" }}>
      {/* Vertical spine */}
      <div style={{ position: "absolute", left: ".5625rem", top: 8, bottom: 8, width: 1,
        background: "linear-gradient(to bottom,var(--rose-mid),var(--rose-mid) 80%,transparent)" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {tips.map((tip, i) => (
          <div key={tip} style={{ display: "flex", alignItems: "flex-start", gap: "1.125rem" }}>
            {/* Dot on spine */}
            <div style={{ position: "absolute", left: 0, width: 18, height: 18, borderRadius: "50%",
              background: i === 0 ? ROSE : "var(--bg-warm)",
              border: `2px solid ${i === 0 ? ROSE : "var(--rose-mid)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginTop: 1, flexShrink: 0, zIndex: 1 }}>
              {i === 0 && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
              {i > 0 && <span style={{ fontFamily: BF, fontSize: ".46rem", fontWeight: 700, color: ROSE }}>{i+1}</span>}
            </div>

            {/* Tip text */}
            <div style={{ paddingLeft: 0 }}>
              <p style={{ fontFamily: BF, fontSize: ".875rem", color: "var(--ink-2)", lineHeight: 1.70 }}>
                {tip}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────
function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div style={{
      background: "rgba(255,255,255,.80)", backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderRadius: "var(--r-xl)", border: "1px solid rgba(255,255,255,.72)",
      boxShadow: "var(--sh-md)", overflow: "hidden",
      backgroundImage: "var(--noise), linear-gradient(rgba(255,255,255,.80),rgba(255,255,255,.80))",
    }}>
      {items.map((item, i) => (
        <div key={item.question}
          style={{ borderBottom: i < items.length - 1 ? "1px solid var(--bdr)" : "none" }}>
          <button type="button"
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%", display: "flex", alignItems: "flex-start",
              justifyContent: "space-between", gap: "1rem",
              padding: "1.25rem 1.5rem", background: "none",
              border: "none", cursor: "pointer", textAlign: "left",
              transition: "background .18s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-warm)"; }}
            onMouseLeave={e => { if (open !== i) (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
          >
            <span style={{ fontFamily: DF, fontSize: "1.05rem", fontWeight: 600, color: INK, lineHeight: 1.3, flex: 1 }}>
              {item.question}
            </span>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
              background: open === i ? ROSE : "var(--rose-pale)",
              border: "1px solid var(--rose-mid)", marginTop: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background .18s",
            }}>
              <ChevronDown size={13} style={{
                color: open === i ? "#fff" : ROSE,
                transition: "transform .22s var(--expo)",
                transform: open === i ? "rotate(180deg)" : "none",
              }} />
            </div>
          </button>
          {open === i && (
            <div style={{ padding: "0 1.5rem 1.375rem" }}>
              <p style={{ fontFamily: BF, fontSize: ".875rem", color: "var(--ink-2)", lineHeight: 1.72 }}>
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Contact cards ─────────────────────────────────────────────────────────────
const CONTACTS = [
  { Icon: Phone,       label: "Wedding coordination", value: "+91 98765 43210", href: "tel:+919876543210", note: "8 AM – 10 PM" },
  { Icon: MapPin,      label: "Venue",                value: "Blue Bay Resort",  href: "tel:+914427473000", note: "+91 44 2747 3000" },
  { Icon: HeartPulse,  label: "Medical emergency",    value: "108 Ambulance",    href: "tel:108",           note: "24 × 7" },
  { Icon: ShieldCheck, label: "Police",               value: "100",              href: "tel:100",           note: "Mahabalipuram station" },
  { Icon: Car,         label: "Cab / rideshare",      value: "Ola · Uber",       href: "https://www.olacabs.com", note: "Available locally" },
  { Icon: Phone,       label: "Family helpline",      value: "jason454a@gmail.com", href: "mailto:jason454a@gmail.com", note: "Any assistance" },
];

function ContactTile({ Icon, label, value, href, note }: typeof CONTACTS[0]) {
  const isExternal = href.startsWith("http");
  return (
    <a href={href} target={isExternal ? "_blank" : undefined} rel="noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: "1rem",
        padding: "1.125rem 1.25rem",
        background: "rgba(255,255,255,.80)", backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRadius: "var(--r-lg)", border: "1px solid rgba(255,255,255,.72)",
        boxShadow: "var(--sh-xs)", textDecoration: "none",
        transition: "transform .18s var(--expo), box-shadow .18s var(--smooth), background .18s",
        backgroundImage: "var(--noise), linear-gradient(rgba(255,255,255,.80),rgba(255,255,255,.80))",
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "var(--sh-sm)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = "var(--sh-xs)"; }}
    >
      <div style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", flexShrink: 0,
        background: "var(--rose-pale)", border: "1px solid var(--rose-mid)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} style={{ color: ROSE }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: BF, fontSize: ".50rem", letterSpacing: ".20em", textTransform: "uppercase",
          color: "var(--ink-4)", fontWeight: 600, marginBottom: ".2rem" }}>
          {label}
        </p>
        <p style={{ fontFamily: DF, fontSize: ".975rem", fontWeight: 600, color: INK, lineHeight: 1.1,
          marginBottom: ".15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value}
        </p>
        <p style={{ fontFamily: BF, fontSize: ".72rem", color: "var(--ink-3)" }}>{note}</p>
      </div>
    </a>
  );
}

// ── Dress code banner ─────────────────────────────────────────────────────────
function DressCodeBanner() {
  const swatches = [
    { label: "Ivory", bg: "#F8F4EF" },
    { label: "Champagne", bg: "#F2E2C0" },
    { label: "Soft gold", bg: "#D4A84B" },
    { label: "Sage", bg: "#9AAF9B" },
    { label: "Dusty rose", bg: "#E8B4B8" },
  ];

  return (
    <div style={{
      borderRadius: "var(--r-xl)", overflow: "hidden",
      border: "1px solid var(--bdr)", boxShadow: "var(--sh-md)",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(140deg,#0F0A0B 0%,#1C1214 60%,#0F0A0B 100%)",
        padding: "2rem 2.5rem", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent,var(--gold) 40%,var(--gold-l) 50%,var(--gold) 60%,transparent)" }} />
        <p style={{ fontFamily: BF, fontSize: ".48rem", letterSpacing: ".42em", textTransform: "uppercase",
          color: "rgba(232,196,80,.60)", fontWeight: 700, marginBottom: ".875rem" }}>
          Beach reception dress code
        </p>
        <h3 style={{ fontFamily: DF, fontStyle: "italic", fontWeight: 300,
          fontSize: "clamp(1.5rem,3.5vw,2.25rem)", color: "#fff", lineHeight: 1.1, marginBottom: ".5rem" }}>
          Coastal elegance.
        </h3>
        <p style={{ fontFamily: BF, fontSize: ".82rem", color: "rgba(255,255,255,.50)", lineHeight: 1.6 }}>
          Whites, creams, champagnes, soft golds and greens. Flowing fabrics welcome.
        </p>
      </div>
      {/* Swatches */}
      <div style={{ display: "flex", background: "var(--bg-warm)" }}>
        {swatches.map(({ label, bg }) => (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            padding: "1.25rem .5rem .875rem", gap: ".625rem",
            borderRight: label !== swatches[swatches.length-1].label ? "1px solid var(--bdr)" : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: bg,
              border: "2px solid rgba(255,255,255,.80)",
              boxShadow: "0 2px 8px rgba(15,10,11,.12)" }} />
            <p style={{ fontFamily: BF, fontSize: ".52rem", textAlign: "center",
              color: "var(--ink-3)", lineHeight: 1.3 }}>{label}</p>
          </div>
        ))}
      </div>
      {/* Note */}
      <div style={{ padding: ".875rem 1.5rem", background: "var(--bg-linen)",
        borderTop: "1px solid var(--bdr)" }}>
        <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".875rem", color: "var(--ink-3)", margin: 0, lineHeight: 1.65 }}>
          Wedges and block heels recommended — the reception is on a beach lawn.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════
export function TravelPageClient({ sections, essentials, faq, arrivalTips }: GuideProps) {
  return (
    <div style={{ background: "var(--bg)", color: INK, minHeight: "100vh" }}>
      <style>{`
        @keyframes tr-up { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        .tr-0{opacity:0;animation:tr-up .85s .05s cubic-bezier(.16,1,.3,1) forwards}
        .tr-1{opacity:0;animation:tr-up .85s .18s cubic-bezier(.16,1,.3,1) forwards}
        .tr-2{opacity:0;animation:tr-up .85s .30s cubic-bezier(.16,1,.3,1) forwards}
        .tr-3{opacity:0;animation:tr-up .80s .44s cubic-bezier(.16,1,.3,1) forwards}
        .tr-4{opacity:0;animation:tr-up .80s .58s cubic-bezier(.16,1,.3,1) forwards}

        .tr-col2 { display:grid; grid-template-columns:1fr 1fr; gap:2.5rem; align-items:start; }
        .tr-col3 { display:grid; grid-template-columns:repeat(3,1fr); gap:1.125rem; }
        .tr-col4 { display:grid; grid-template-columns:repeat(4,1fr); gap:1.125rem; }

        @media(max-width:900px) {
          .tr-col2 { grid-template-columns:1fr !important; gap:2rem !important; }
          .tr-col3 { grid-template-columns:1fr 1fr !important; }
          .tr-col4 { grid-template-columns:1fr 1fr !important; }
        }
        @media(max-width:520px) {
          .tr-col3 { grid-template-columns:1fr !important; }
          .tr-col4 { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="page-hero" style={{ paddingBottom: "clamp(3rem,6vh,4.5rem)" }}>
        <div className="page-hero-inner">

          {/* Couple + date eyebrow */}
          <div className="tr-0" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
            <div style={{ width: 24, height: 1, background: `linear-gradient(to right,transparent,var(--rose-mid))` }} />
            <span style={{ fontFamily: BF, fontSize: ".46rem", letterSpacing: ".50em", textTransform: "uppercase",
              color: ROSE, fontWeight: 700 }}>
              Marion &amp; Livingston · 20 May 2026 · Chennai
            </span>
          </div>

          {/* Main headline */}
          <h1 className="tr-1" style={{
            fontFamily: DF, fontWeight: 300,
            fontSize: "clamp(3.5rem,10vw,8rem)",
            lineHeight: .86, letterSpacing: "-.035em",
            color: INK, marginBottom: "clamp(.875rem,2.5vh,1.5rem)",
          }}>
            Getting<br/><em style={{ color: ROSE }}>there.</em>
          </h1>

          {/* Subtitle */}
          <p className="tr-2" style={{
            fontFamily: DF, fontStyle: "italic",
            fontSize: "clamp(1rem,2vw,1.25rem)",
            color: "var(--ink-3)", maxWidth: "38rem",
            lineHeight: 1.75, marginBottom: "2rem",
          }}>
            Two beautiful venues. One coastal road between them.
            Everything you need to arrive rested and ready.
          </p>

          {/* Venue chips */}
          <div className="tr-3" style={{ display: "flex", flexWrap: "wrap", gap: ".625rem", marginBottom: "2.5rem" }}>
            {[
              { label: "Divine Mercy Church, Kelambakkam", time: "3 PM", rose: true  },
              { label: "Blue Bay Beach Resort, Mahabalipuram", time: "6 PM", rose: false },
            ].map(({ label, time, rose }) => (
              <span key={label} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "6px 16px", borderRadius: 999,
                background: rose ? "var(--rose-pale)" : "var(--gold-pale)",
                border: `1px solid ${rose ? "var(--rose-mid)" : "rgba(168,120,8,.25)"}`,
                fontFamily: BF, fontSize: ".65rem", fontWeight: 600, color: "var(--ink-2)",
              }}>
                <span style={{ color: rose ? ROSE : GOLD, fontWeight: 700 }}>{time}</span>
                {label}
              </span>
            ))}
          </div>

          {/* Quick links */}
          <div className="tr-4" style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
            <a href="#transport" className="btn-ghost" style={{ padding: ".625rem 1.25rem", fontSize: ".72rem", letterSpacing: ".1em" }}>
              Getting here ↓
            </a>
            <a href="#hotels" className="btn-ghost" style={{ padding: ".625rem 1.25rem", fontSize: ".72rem", letterSpacing: ".1em" }}>
              Where to stay ↓
            </a>
            <a href="#faq" className="btn-ghost" style={{ padding: ".625rem 1.25rem", fontSize: ".72rem", letterSpacing: ".1em" }}>
              FAQ ↓
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENT
      ═══════════════════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto",
        padding: "clamp(3rem,6vh,5rem) var(--pad-x) clamp(4rem,8vh,6rem)" }}>

        {/* ── 1. JOURNEY MAP + WEATHER ── */}
        <section style={{ marginBottom: "clamp(4rem,8vh,6rem)" }}>
          <SectionHead
            eyebrow="The route"
            title="Church to coast"
            subtitle="Two venues, 15 km apart on the East Coast Road. The evening drive along ECR is one of the nicest stretches of road in Chennai."
          />
          <div className="tr-col2">
            <JourneyMap />
            <WeatherWidget />
          </div>
        </section>

        {/* ── 2. TRANSPORT ── */}
        <section id="transport" style={{ marginBottom: "clamp(4rem,8vh,6rem)", scrollMarginTop: "5rem" }}>
          <SectionHead
            eyebrow="Getting here"
            title="How to arrive"
            subtitle="Chennai is well connected by air, rail, and road. All routes converge on East Coast Road."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1rem" }}>
            {TRANSPORT.map(t => <TransportRow key={t.title} {...t} />)}
          </div>
        </section>

        {/* ── 3. DRESS CODE + HOTELS ── */}
        <section id="hotels" style={{ marginBottom: "clamp(4rem,8vh,6rem)", scrollMarginTop: "5rem" }}>
          <SectionHead eyebrow="Stay & dress" title="Hotels nearby" />
          <div className="tr-col2" style={{ marginBottom: "2rem" }}>
            <div>
              <p style={{ fontFamily: BF, fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase",
                color: "var(--ink-4)", fontWeight: 600, marginBottom: "1rem" }}>
                Recommended stays
              </p>
              <div className="tr-col2" style={{ gap: "1rem" }}>
                {HOTELS.map(h => <HotelCard key={h.name} {...h} />)}
              </div>
            </div>
            <DressCodeBanner />
          </div>
        </section>

        {/* ── 4. TRAVEL NOTES from DB ── */}
        {sections.length > 0 && (
          <section style={{ marginBottom: "clamp(4rem,8vh,6rem)" }}>
            <SectionHead eyebrow="From the couple" title="Things to know" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.25rem" }}>
              {sections.map(s => <TravelNoteCard key={s.id} section={s} />)}
            </div>
          </section>
        )}

        {/* ── 5. ARRIVAL TIPS + FAQ ── */}
        {(arrivalTips.length > 0 || faq.length > 0) && (
          <section id="faq" style={{ marginBottom: "clamp(4rem,8vh,6rem)", scrollMarginTop: "5rem" }}>
            <SectionHead eyebrow="Before you arrive" title="Tips &amp; questions" />
            <div className="tr-col2">
              {arrivalTips.length > 0 && (
                <div>
                  <p style={{ fontFamily: BF, fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase",
                    color: "var(--ink-4)", fontWeight: 600, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 7 }}>
                    <Clock size={12} style={{ color: ROSE }} />
                    On arrival
                  </p>
                  <ArrivalTimeline tips={arrivalTips} />
                </div>
              )}
              {faq.length > 0 && (
                <div>
                  <p style={{ fontFamily: BF, fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase",
                    color: "var(--ink-4)", fontWeight: 600, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 7 }}>
                    <ChevronDown size={12} style={{ color: ROSE }} />
                    Frequently asked
                  </p>
                  <FAQAccordion items={faq} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 6. CONTACTS ── */}
        <section style={{ marginBottom: essentials.length > 0 ? "clamp(4rem,8vh,6rem)" : 0 }}>
          <SectionHead
            eyebrow="Help &amp; emergency"
            title="We're here for you"
            subtitle="Save these before your journey. We are available throughout the day."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
            {CONTACTS.map(c => <ContactTile key={c.label} {...c} />)}
          </div>
        </section>

        {/* ── 7. NEARBY ESSENTIALS ── */}
        {essentials.length > 0 && (
          <section>
            <SectionHead
              eyebrow="Near the venue"
              title="Nearby essentials"
              subtitle="Pharmacy, hospital, transport links and more within a short distance."
            />
            <NearbyEssentials items={essentials} />
          </section>
        )}

      </div>

      {/* ── FOOTER STRIP ── */}
      <div style={{
        borderTop: "1px solid var(--bdr)",
        padding: "2rem var(--pad-x)",
        background: "var(--bg-warm)",
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: "1rem",
      }}>
        <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".95rem", color: "var(--ink-3)" }}>
          Questions about the journey?{" "}
          <a href="mailto:jason454a@gmail.com"
            style={{ color: ROSE, fontWeight: 600, textDecoration: "none" }}>
            jason454a@gmail.com
          </a>
        </p>
        <span style={{ fontFamily: BF, fontSize: ".46rem", letterSpacing: ".38em",
          textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 600 }}>
          Marion &amp; Livingston · 20 · 05 · 2026
        </span>
      </div>
    </div>
  );
}
