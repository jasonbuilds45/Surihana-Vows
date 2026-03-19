"use client";

/**
 * TravelPageClient — Light theme, editorial design, 3D card interactions
 *
 * Design: luxury travel editorial, fully using platform CSS variables.
 * Light cream background (var(--bg)), warm surfaces, rose + gold accents.
 * Cards have 3D perspective tilt on hover and smooth elevation shadows.
 */

import { useState, useRef, MouseEvent } from "react";
import {
  Plane, TrainFront, Bus, Car,
  Phone, MapPin, HeartPulse, ShieldCheck,
  Hotel, Sun, Cloud, CloudRain, Wind, Thermometer,
  ChevronDown, ArrowUpRight,
} from "lucide-react";
import { NearbyEssentials } from "@/components/invitation/NearbyEssentials";
import type { EssentialItem } from "@/components/invitation/NearbyEssentials";

// ── Types ──────────────────────────────────────────────────────────────────
interface TravelSection {
  id: string; title: string; description: string; link: string;
  category?: string | null; icon?: string | null;
}
interface FAQItem    { question: string; answer: string; }
interface GuideProps {
  sections: TravelSection[]; essentials: EssentialItem[];
  faq: FAQItem[]; arrivalTips: string[];
}

// ── 3D tilt card hook ─────────────────────────────────────────────────────
// Tracks mouse position relative to the card and applies a subtle
// perspective tilt. Works on any card that spreads the returned props.
function useTilt(strength = 8) {
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5;  // -0.5 → +0.5
    const y = (e.clientY - top)  / height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(6px)`;
    el.style.boxShadow = `
      ${-x * 12}px ${y * 12 + 8}px 32px rgba(15,10,11,.12),
      ${-x * 6}px  ${y * 6  + 4}px 16px rgba(190,45,69,.07)
    `;
  }

  function onMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(700px) rotateY(0deg) rotateX(0deg) translateZ(0)";
    el.style.boxShadow = "var(--sh-sm)";
  }

  return { ref, onMouseMove, onMouseLeave };
}

// ── Eyebrow ────────────────────────────────────────────────────────────────
function Eyebrow({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <p style={{
      fontFamily: "var(--font-body),'Manrope',sans-serif",
      fontSize: ".52rem", letterSpacing: ".44em",
      textTransform: "uppercase",
      color: gold ? "var(--gold)" : "var(--rose)",
      fontWeight: 700, marginBottom: ".625rem",
    }}>
      {children}
    </p>
  );
}

// ── Section heading ────────────────────────────────────────────────────────
function SectionHead({ eyebrow, title, gold }: { eyebrow: string; title: string; gold?: boolean }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <Eyebrow gold={gold}>{eyebrow}</Eyebrow>
      <h2 style={{
        fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif",
        fontWeight: 300, fontSize: "clamp(1.75rem,4vw,2.75rem)",
        color: "var(--ink)", lineHeight: 1.1, letterSpacing: "-.02em",
        marginBottom: "1.25rem",
      }}>
        {title}
      </h2>
      {/* Hairline rule */}
      <div style={{
        height: 1,
        background: gold
          ? "linear-gradient(90deg, transparent, var(--gold-l) 30%, var(--gold-l) 70%, transparent)"
          : "linear-gradient(90deg, transparent, var(--rose-mid) 30%, var(--rose-mid) 70%, transparent)",
      }} />
    </div>
  );
}

// ── Weather widget ─────────────────────────────────────────────────────────
const FORECAST = [
  { day: "Fri", hi: 29, lo: 23, Icon: Sun      },
  { day: "Sat", hi: 28, lo: 22, Icon: Cloud     },
  { day: "Sun", hi: 30, lo: 24, Icon: Sun       },
  { day: "Mon", hi: 27, lo: 22, Icon: CloudRain },
  { day: "Tue", hi: 28, lo: 23, Icon: Cloud     },
];

function WeatherWidget() {
  return (
    <div style={{
      borderRadius: "var(--r-lg)", overflow: "hidden",
      boxShadow: "var(--sh-md)",
      border: "1px solid var(--bdr)",
    }}>
      {/* Dark header — intentional contrast inside the light page */}
      <div style={{
        background: "linear-gradient(135deg, var(--bg-ink) 0%, var(--bg-ink-2) 55%, var(--bg-ink) 100%)",
        padding: "1.75rem 2rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--rose) 30%, var(--rose) 70%, transparent)" }} />
        <div aria-hidden style={{ position: "absolute", top: "-20%", right: "-5%", width: "55%", height: "140%", borderRadius: "50%", background: "radial-gradient(circle, rgba(190,45,69,.08) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: ".50rem", letterSpacing: ".36em", textTransform: "uppercase", color: "rgba(240,190,198,.60)", fontWeight: 700, marginBottom: ".5rem" }}>
              Mahabalipuram, Chennai
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: ".5rem", marginBottom: ".25rem" }}>
              <span style={{ fontFamily: "var(--font-display),'Cormorant Garamond',serif", fontSize: "3.25rem", fontWeight: 600, color: "#fff", lineHeight: 1 }}>29°C</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "rgba(255,255,255,.45)" }}>/ 84°F</span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: ".80rem", color: "rgba(255,255,255,.55)" }}>Sunny · May 2026</p>
          </div>
          <Sun size={48} style={{ color: "rgba(232,180,12,.55)", flexShrink: 0, marginTop: 2 }} />
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: ".75rem", marginTop: "1.5rem", paddingTop: "1.25rem",
          borderTop: "1px solid rgba(255,255,255,.08)",
        }}>
          {[
            { Icon: Thermometer, label: "Humidity", value: "72%" },
            { Icon: Wind,        label: "Wind",     value: "14 km/h" },
            { Icon: Cloud,       label: "UV index", value: "8 High" },
          ].map(({ Icon, label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <Icon size={13} style={{ margin: "0 auto .25rem", color: "rgba(240,190,198,.50)" }} />
              <p style={{ fontFamily: "var(--font-body)", fontSize: ".46rem", letterSpacing: ".20em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: ".2rem" }}>{label}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: ".80rem", fontWeight: 700, color: "rgba(255,255,255,.80)" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-day forecast — light surface */}
      <div style={{
        background: "var(--bg-warm)",
        padding: "1.125rem 2rem",
        display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: ".5rem",
      }}>
        {FORECAST.map(({ day, hi, lo, Icon }) => (
          <div key={day} style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: ".56rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: ".375rem" }}>{day}</p>
            <Icon size={18} style={{ margin: "0 auto .375rem", color: "var(--rose)" }} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: ".80rem", fontWeight: 700, color: "var(--ink)" }}>{hi}°</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: ".70rem", color: "var(--ink-4)" }}>{lo}°</p>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div style={{
        background: "var(--bg-linen)",
        padding: ".875rem 2rem",
        borderTop: "1px solid var(--bdr)",
      }}>
        <p style={{ fontFamily: "var(--font-display),'Cormorant Garamond',serif", fontStyle: "italic", fontSize: ".9rem", color: "var(--ink-3)", lineHeight: 1.65, margin: 0 }}>
          May evenings near the coast can be breezy — pack a light layer for outdoor events after sunset.
        </p>
      </div>
    </div>
  );
}

// ── Transport card (3D tilt) ───────────────────────────────────────────────
const TRANSPORT = [
  { Icon: Plane,      title: "By air",   desc: "Chennai International Airport (MAA) — 50–60 km from the venue. Pre-booked transfers available on request." },
  { Icon: TrainFront, title: "By train", desc: "Chennai Central or Egmore. Local trains run to Chengalpattu, 15 km from the venue." },
  { Icon: Bus,        title: "By bus",   desc: "SETC and private coaches on East Coast Road. Nearest stop is 500 m from the venue gate." },
  { Icon: Car,        title: "By road",  desc: "Take East Coast Road (ECR) south from Chennai. GPS: Blue Bay Beach Resort, Mahabalipuram." },
];

function TransportCard({ Icon, title, desc }: { Icon: React.ElementType; title: string; desc: string }) {
  const tilt = useTilt(6);
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={{
        display: "flex", alignItems: "flex-start", gap: "1.25rem",
        padding: "1.375rem 1.5rem",
        background: "#fff",
        borderRadius: "var(--r-md)",
        border: "1px solid var(--bdr)",
        boxShadow: "var(--sh-sm)",
        transition: "transform var(--t-med) var(--expo), box-shadow var(--t-med) var(--expo)",
        willChange: "transform",
      }}
    >
      {/* Icon with soft rose inner glow */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: "var(--rose-pale)",
        border: "1px solid var(--rose-mid)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.8), 0 2px 6px rgba(190,45,69,.12)",
      }}>
        <Icon size={18} style={{ color: "var(--rose)" }} />
      </div>
      <div>
        <p style={{ fontFamily: "var(--font-display),'Cormorant Garamond',serif", fontSize: "1.075rem", fontWeight: 600, color: "var(--ink)", marginBottom: ".25rem" }}>{title}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: ".82rem", color: "var(--ink-3)", lineHeight: 1.65 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Hotel card (3D tilt + shimmer) ─────────────────────────────────────────
const HOTELS = [
  { name: "Radisson Blu Temple Bay",  dist: "3 km",   stars: 5, tag: "Preferred rate",  tagColor: "rose" as const },
  { name: "GRT Temple Bay Resort",    dist: "2 km",   stars: 5, tag: "Beachfront",      tagColor: "gold" as const },
  { name: "Sea Hawk Resort",          dist: "1.5 km", stars: 4, tag: "Budget-friendly", tagColor: "neutral" as const },
  { name: "The Ideal Beach Resort",   dist: "4 km",   stars: 4, tag: "Family suites",   tagColor: "neutral" as const },
];

function HotelCard({ name, dist, stars, tag, tagColor }: typeof HOTELS[0]) {
  const tilt = useTilt(7);
  const tagStyles = {
    rose:    { color: "var(--rose)",    bg: "var(--rose-pale)",  bd: "var(--rose-mid)" },
    gold:    { color: "var(--gold)",    bg: "var(--gold-pale)",  bd: "var(--gold-mid)" },
    neutral: { color: "var(--ink-3)",   bg: "var(--bg-linen)",   bd: "var(--bdr-warm)" },
  }[tagColor];

  return (
    <a
      href={`https://www.google.com/search?q=${encodeURIComponent(name + " Mahabalipuram")}`}
      target="_blank" rel="noreferrer"
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        style={{
          display: "flex", flexDirection: "column", gap: "1rem",
          padding: "1.5rem",
          background: "#fff",
          borderRadius: "var(--r-lg)",
          border: "1px solid var(--bdr)",
          boxShadow: "var(--sh-sm)",
          transition: "transform var(--t-med) var(--expo), box-shadow var(--t-med) var(--expo)",
          willChange: "transform",
          height: "100%",
          // Shimmer highlight — top edge catches the light as card tilts
          backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0) 60%, rgba(255,255,255,.55) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".5rem" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: "var(--rose-pale)", border: "1px solid var(--rose-mid)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.9), 0 2px 6px rgba(190,45,69,.10)",
          }}>
            <Hotel size={18} style={{ color: "var(--rose)" }} />
          </div>
          <span style={{
            fontFamily: "var(--font-body)", fontSize: ".50rem", fontWeight: 700,
            letterSpacing: ".16em", textTransform: "uppercase",
            color: tagStyles.color,
            background: tagStyles.bg,
            border: `1px solid ${tagStyles.bd}`,
            padding: "3px 10px", borderRadius: 999, flexShrink: 0,
          }}>
            {tag}
          </span>
        </div>

        <div>
          <p style={{ fontFamily: "var(--font-display),'Cormorant Garamond',serif", fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.2, marginBottom: ".375rem" }}>{name}</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: ".78rem", color: "var(--ink-4)" }}>{dist} from venue</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: ".82rem", color: "var(--gold)", marginTop: ".25rem", letterSpacing: ".04em" }}>{"★".repeat(stars)}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: "auto" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: ".68rem", fontWeight: 600, color: "var(--rose)" }}>Search availability</span>
          <ArrowUpRight size={11} style={{ color: "var(--rose)" }} />
        </div>
      </div>
    </a>
  );
}

// ── Contact card (3D tilt) ─────────────────────────────────────────────────
const HELP_CONTACTS = [
  { Icon: Phone,       label: "Wedding Coordinator",  value: "+91 98765 43210",      href: "tel:+919876543210",            note: "Available 8 AM – 10 PM" },
  { Icon: MapPin,      label: "Venue Contact",        value: "Blue Bay Resort",       href: "tel:+914427473000",            note: "+91 44 2747 3000" },
  { Icon: HeartPulse,  label: "Medical Emergency",    value: "108 Ambulance",         href: "tel:108",                     note: "24 × 7 emergency" },
  { Icon: ShieldCheck, label: "Police",               value: "100",                   href: "tel:100",                     note: "Mahabalipuram station" },
  { Icon: Car,         label: "Cab / Rideshare",      value: "Ola / Uber",            href: "https://www.olacabs.com",     note: "Service available locally" },
  { Icon: Phone,       label: "Family Helpline",      value: "family@surihana.vows",  href: "mailto:family@surihana.vows", note: "For any assistance" },
];

function ContactCard({ Icon, label, value, href, note }: typeof HELP_CONTACTS[0]) {
  const tilt = useTilt(5);
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
      style={{ textDecoration: "none" }}>
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        style={{
          display: "flex", alignItems: "flex-start", gap: "1rem",
          padding: "1.25rem 1.375rem",
          background: "#fff",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--bdr)",
          boxShadow: "var(--sh-sm)",
          transition: "transform var(--t-med) var(--expo), box-shadow var(--t-med) var(--expo)",
          willChange: "transform",
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 11, flexShrink: 0,
          background: "var(--rose-pale)", border: "1px solid var(--rose-mid)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.9), 0 2px 6px rgba(190,45,69,.10)",
        }}>
          <Icon size={17} style={{ color: "var(--rose)" }} />
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: ".50rem", letterSpacing: ".20em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 600, marginBottom: ".2rem" }}>{label}</p>
          <p style={{ fontFamily: "var(--font-display),'Cormorant Garamond',serif", fontSize: "1rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.1, marginBottom: ".2rem" }}>{value}</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: ".75rem", color: "var(--ink-3)" }}>{note}</p>
        </div>
      </div>
    </a>
  );
}

// ── FAQ accordion ──────────────────────────────────────────────────────────
function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{
      background: "#fff", borderRadius: "var(--r-lg)",
      border: "1px solid var(--bdr)",
      boxShadow: "var(--sh-sm)",
      overflow: "hidden",
    }}>
      {items.map((item, i) => (
        <div key={item.question} style={{ borderBottom: i < items.length - 1 ? "1px solid var(--bg-linen)" : "none" }}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: "1rem",
              padding: "1.25rem 1.5rem",
              background: open === i ? "var(--bg-warm)" : "transparent",
              border: "none", cursor: "pointer", textAlign: "left",
              transition: "background var(--t-fast)",
            }}
          >
            <span style={{ fontFamily: "var(--font-display),'Cormorant Garamond',serif", fontSize: "1.05rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>
              {item.question}
            </span>
            <ChevronDown
              size={16}
              style={{
                color: "var(--rose)", flexShrink: 0,
                transition: "transform var(--t-med) var(--expo)",
                transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>
          {open === i && (
            <div style={{ padding: "0 1.5rem 1.375rem" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: ".875rem", color: "var(--ink-2)", lineHeight: 1.72 }}>
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Arrival tip card (3D tilt) ─────────────────────────────────────────────
function ArrivalTipCard({ tip, index }: { tip: string; index: number }) {
  const tilt = useTilt(5);
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={{
        display: "flex", alignItems: "flex-start", gap: "1.125rem",
        padding: "1.125rem 1.375rem",
        background: "#fff",
        borderRadius: "var(--r-md)",
        border: "1px solid var(--bdr)",
        boxShadow: "var(--sh-sm)",
        transition: "transform var(--t-med) var(--expo), box-shadow var(--t-med) var(--expo)",
        willChange: "transform",
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: "var(--rose-pale)", border: "1.5px solid var(--rose-mid)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-body)", fontSize: ".68rem", fontWeight: 700, color: "var(--rose)",
        boxShadow: "0 2px 6px rgba(190,45,69,.12)",
      }}>
        {index + 1}
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: ".875rem", color: "var(--ink-2)", lineHeight: 1.70, paddingTop: 3 }}>{tip}</p>
    </div>
  );
}

// ── Travel notes card ──────────────────────────────────────────────────────
function TravelNoteCard({ section }: { section: TravelSection }) {
  const tilt = useTilt(6);
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={{
        background: "#fff", borderRadius: "var(--r-lg)", padding: "1.75rem",
        border: "1px solid var(--bdr)",
        boxShadow: "var(--sh-sm)",
        transition: "transform var(--t-med) var(--expo), box-shadow var(--t-med) var(--expo)",
        willChange: "transform",
        display: "flex", flexDirection: "column", gap: ".875rem",
      }}
    >
      <Eyebrow>{section.category ?? "Travel note"}</Eyebrow>
      <h3 style={{ fontFamily: "var(--font-display),'Cormorant Garamond',serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.2 }}>{section.title}</h3>
      <p style={{ fontFamily: "var(--font-body)", fontSize: ".875rem", color: "var(--ink-2)", lineHeight: 1.7, flex: 1 }}>{section.description}</p>
      <a href={section.link} target="_blank" rel="noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: ".72rem", fontWeight: 600, color: "var(--rose)", textDecoration: "none" }}>
        Open map <ArrowUpRight size={11} />
      </a>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════
export function TravelPageClient({ sections, essentials, faq, arrivalTips }: GuideProps) {
  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <style>{`
        @keyframes tr-rise {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tr-line {from{transform:scaleX(0)}to{transform:scaleX(1)}}
        .tr-0{opacity:0;animation:tr-rise .8s .10s var(--expo) forwards}
        .tr-1{opacity:0;animation:tr-rise .8s .22s var(--expo) forwards}
        .tr-2{opacity:0;animation:tr-rise .8s .34s var(--expo) forwards}
        .tr-3{opacity:0;animation:tr-rise .8s .46s var(--expo) forwards}
        .tr-grid-2  {display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start}
        .tr-grid-faq{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start}
        @media(max-width:768px){
          .tr-grid-2,.tr-grid-faq{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ── HERO — light theme with warm surface + decorative elements ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg, var(--bg) 0%, var(--bg-warm) 50%, var(--bg-linen) 100%)",
        padding: "clamp(4rem,10vh,7rem) var(--pad-x) clamp(3rem,7vh,5rem)",
        borderBottom: "1px solid var(--bdr)",
      }}>
        {/* Decorative corner lines — envelope motif */}
        <svg aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: .25 }} preserveAspectRatio="none">
          <line x1="0" y1="0" x2="100" y2="100" stroke="var(--rose-mid)" strokeWidth=".8" />
          <line x1="0" y1="0" x2="0"   y2="70"  stroke="var(--rose-mid)" strokeWidth=".5" />
          <line x1="0" y1="0" x2="70"  y2="0"   stroke="var(--rose-mid)" strokeWidth=".5" />
          <line x1="100%" y1="100%" x2="calc(100% - 100px)" y2="calc(100% - 100px)" stroke="var(--gold-mid)" strokeWidth=".8" />
          <line x1="100%" y1="100%" x2="100%"              y2="calc(100% - 70px)"   stroke="var(--gold-mid)" strokeWidth=".5" />
          <line x1="100%" y1="100%" x2="calc(100% - 70px)" y2="100%"               stroke="var(--gold-mid)" strokeWidth=".5" />
        </svg>

        {/* Ambient blush glow top-left */}
        <div aria-hidden style={{ position: "absolute", top: "-10%", left: "-5%", width: "40%", height: "70%", borderRadius: "50%", background: "radial-gradient(circle, rgba(190,45,69,.05) 0%, transparent 65%)", pointerEvents: "none" }} />
        {/* Gold bloom bottom-right */}
        <div aria-hidden style={{ position: "absolute", bottom: "0%", right: "5%", width: "35%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,120,8,.04) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", position: "relative" }}>

          {/* Eyebrow line */}
          <div className="tr-0" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.75rem" }}>
            <div style={{ width: 24, height: 1, background: "linear-gradient(to right, transparent, var(--rose-mid))" }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: ".46rem", letterSpacing: ".52em", textTransform: "uppercase", color: "var(--rose)", fontWeight: 700 }}>
              Marion &amp; Livingston · 20 May 2026
            </span>
          </div>

          {/* Headline */}
          <h1 className="tr-1" style={{
            fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif",
            fontWeight: 300, fontSize: "clamp(3.5rem,9vw,7.5rem)",
            lineHeight: .88, letterSpacing: "-.03em",
            color: "var(--ink)",
            marginBottom: "clamp(1.25rem,3vh,2rem)",
          }}>
            Getting<br />
            <em style={{ color: "var(--rose)" }}>here.</em>
          </h1>

          {/* Subtitle */}
          <p className="tr-2" style={{
            fontFamily: "var(--font-display),'Cormorant Garamond',serif",
            fontStyle: "italic", fontSize: "clamp(1rem,2.4vw,1.2rem)",
            color: "var(--ink-3)", maxWidth: "38rem",
            lineHeight: 1.78, marginBottom: "2.25rem",
          }}>
            Transport, hotels, weather and everything you need to arrive rested and stay close to the celebration.
          </p>

          {/* Venue chips */}
          <div className="tr-3" style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
            {[
              { label: "Divine Mercy Church · Kelambakkam",    time: "3 PM", rose: true  },
              { label: "Blue Bay Beach Resort · Mahabalipuram", time: "6 PM", rose: false },
            ].map(({ label, time, rose }) => (
              <span key={label} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 16px", borderRadius: 999,
                background: rose ? "var(--rose-pale)" : "var(--gold-pale)",
                border: `1px solid ${rose ? "var(--rose-mid)" : "var(--gold-mid)"}`,
                fontFamily: "var(--font-body)", fontSize: ".65rem", fontWeight: 600,
                color: rose ? "var(--rose)" : "var(--gold)", letterSpacing: ".03em",
                boxShadow: rose ? "0 2px 8px rgba(190,45,69,.10)" : "0 2px 8px rgba(168,120,8,.10)",
              }}>
                <span style={{ fontWeight: 800 }}>{time}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "clamp(3rem,7vh,5rem) var(--pad-x) clamp(4rem,10vh,7rem)" }}>

        {/* ── Weather + Transport ── */}
        <section style={{ marginBottom: "clamp(3.5rem,8vh,5.5rem)" }}>
          <SectionHead eyebrow="Conditions & getting here" title="Weather & transport" />
          <div className="tr-grid-2">
            <WeatherWidget />
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {TRANSPORT.map(t => <TransportCard key={t.title} {...t} />)}
            </div>
          </div>
        </section>

        {/* ── Hotels ── */}
        <section style={{ marginBottom: "clamp(3.5rem,8vh,5.5rem)" }}>
          <SectionHead eyebrow="Where to stay" title="Recommended hotels" gold />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "1.25rem" }}>
            {HOTELS.map(h => <HotelCard key={h.name} {...h} />)}
          </div>
        </section>

        {/* ── Travel notes from DB ── */}
        {sections.length > 0 && (
          <section style={{ marginBottom: "clamp(3.5rem,8vh,5.5rem)" }}>
            <SectionHead eyebrow="Travel notes" title="Things to know" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.25rem" }}>
              {sections.map(s => <TravelNoteCard key={s.id} section={s} />)}
            </div>
          </section>
        )}

        {/* ── Arrival tips + FAQ ── */}
        {(arrivalTips.length > 0 || faq.length > 0) && (
          <section style={{ marginBottom: "clamp(3.5rem,8vh,5.5rem)" }}>
            <div className="tr-grid-faq">
              {arrivalTips.length > 0 && (
                <div>
                  <SectionHead eyebrow="On arrival" title="Arrival tips" />
                  <div style={{ display: "flex", flexDirection: "column", gap: ".875rem" }}>
                    {arrivalTips.map((tip, i) => <ArrivalTipCard key={tip} tip={tip} index={i} />)}
                  </div>
                </div>
              )}
              {faq.length > 0 && (
                <div>
                  <SectionHead eyebrow="Questions" title="Frequently asked" gold />
                  <FAQAccordion items={faq} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Emergency contacts ── */}
        <section style={{ marginBottom: "clamp(3.5rem,8vh,5.5rem)" }}>
          <SectionHead eyebrow="Help & emergency" title="Contact us" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: "1rem" }}>
            {HELP_CONTACTS.map(c => <ContactCard key={c.label} {...c} />)}
          </div>
        </section>

        {/* ── Nearby essentials ── */}
        {essentials.length > 0 && (
          <section>
            <SectionHead eyebrow="Near the venue" title="Nearby essentials" gold />
            <NearbyEssentials items={essentials} />
          </section>
        )}

      </div>

      {/* ── Footer strip ── */}
      <div style={{
        borderTop: "1px solid var(--bdr)",
        padding: "1.75rem var(--pad-x)",
        background: "var(--bg-linen)",
        display: "flex", flexWrap: "wrap",
        alignItems: "center", justifyContent: "space-between", gap: "1rem",
      }}>
        <p style={{ fontFamily: "var(--font-display),'Cormorant Garamond',serif", fontStyle: "italic", fontSize: ".95rem", color: "var(--ink-3)" }}>
          Questions? Reach us at{" "}
          <a href="mailto:family@surihana.vows" style={{ color: "var(--rose)", textDecoration: "none", fontWeight: 600 }}>family@surihana.vows</a>
        </p>
        <span style={{
          fontFamily: "var(--font-body)", fontSize: ".46rem", letterSpacing: ".38em",
          textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 600,
        }}>
          Marion &amp; Livingston · 20 · 05 · 2026
        </span>
      </div>
    </div>
  );
}
