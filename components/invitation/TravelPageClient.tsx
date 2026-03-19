"use client";

/**
 * TravelPageClient — Redesigned
 *
 * Design language: "A luxury travel editorial"
 * — Dark ink on warm cream, generous whitespace, editorial section breaks.
 * — Cormorant Garamond display headings at dramatic scale.
 * — Cards with subtle depth, no heavy borders — shadow and surface separation.
 * — Sections feel like pages in a beautifully printed travel guide.
 */

import { useState } from "react";
import {
  Plane, TrainFront, Bus, Car,
  Phone, MapPin, HeartPulse, ShieldCheck,
  Hotel, Sun, Cloud, CloudRain, Wind, Thermometer,
  ChevronDown, ArrowUpRight,
} from "lucide-react";
import { NearbyEssentials } from "@/components/invitation/NearbyEssentials";
import type { EssentialItem } from "@/components/invitation/NearbyEssentials";

// ── Design tokens ──────────────────────────────────────────────────────────
const ROSE      = "#BE2D45";
const ROSE_L    = "#D44860";
const ROSE_PALE = "#FBEBEE";
const ROSE_MID  = "#F0BEC6";
const GOLD      = "#A87808";
const GOLD_L    = "#C9960A";
const GOLD_PALE = "#FBF2DC";
const INK       = "#120B0E";
const INK_2     = "#2E1A1F";
const INK_3     = "#72504A";
const INK_4     = "#A88888";
const CREAM     = "#FDFAF7";
const PAPER     = "#F8F3EE";
const PAPER_2   = "#F1E9E0";
const PARCHMENT = "#EDE0D0";
const WHITE     = "#FFFFFF";

const DF = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF = "var(--font-body),'Manrope',system-ui,sans-serif";

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

// ── Section label (shared eyebrow style) ──────────────────────────────────
function Eyebrow({ children, color = ROSE }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{
      fontFamily: BF, fontSize: ".52rem", letterSpacing: ".42em",
      textTransform: "uppercase", color, fontWeight: 700,
      marginBottom: ".625rem",
    }}>
      {children}
    </p>
  );
}

// ── Thin rule ─────────────────────────────────────────────────────────────
function Rule({ gold }: { gold?: boolean }) {
  return (
    <div style={{
      height: 1, marginBottom: "2.5rem",
      background: gold
        ? `linear-gradient(90deg, transparent, ${GOLD_L} 30%, ${GOLD_L} 70%, transparent)`
        : `linear-gradient(90deg, transparent, ${ROSE_MID} 30%, ${ROSE_MID} 70%, transparent)`,
    }} />
  );
}

// ── Weather ────────────────────────────────────────────────────────────────
const FORECAST = [
  { day: "Fri", hi: 29, lo: 23, Icon: Sun,       label: "Sunny"        },
  { day: "Sat", hi: 28, lo: 22, Icon: Cloud,      label: "Partly cloudy" },
  { day: "Sun", hi: 30, lo: 24, Icon: Sun,        label: "Sunny"        },
  { day: "Mon", hi: 27, lo: 22, Icon: CloudRain,  label: "Light rain"   },
  { day: "Tue", hi: 28, lo: 23, Icon: Cloud,      label: "Cloudy"       },
];

function WeatherWidget() {
  return (
    <div style={{
      borderRadius: 24, overflow: "hidden",
      boxShadow: "0 2px 8px rgba(18,11,14,.06), 0 12px 40px rgba(18,11,14,.08)",
      border: `1px solid ${PARCHMENT}`,
    }}>
      {/* Dark header */}
      <div style={{
        background: `linear-gradient(135deg, #1A0308 0%, #2C0910 55%, #1A0308 100%)`,
        padding: "clamp(1.5rem,4vw,2.25rem)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Top stripe */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${ROSE} 30%, ${ROSE} 70%, transparent)` }} />
        {/* Ambient glow */}
        <div aria-hidden style={{ position: "absolute", top: "-30%", right: "-10%", width: "60%", height: "160%", borderRadius: "50%", background: "rgba(190,45,69,.08)", pointerEvents: "none" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <Eyebrow color="rgba(240,190,198,.60)">Mahabalipuram, Chennai</Eyebrow>
            <div style={{ display: "flex", alignItems: "baseline", gap: ".5rem", marginBottom: ".375rem" }}>
              <span style={{ fontFamily: DF, fontSize: "clamp(3rem,8vw,4rem)", fontWeight: 600, color: WHITE, lineHeight: 1 }}>29°C</span>
              <span style={{ fontFamily: BF, fontSize: ".9rem", color: "rgba(255,255,255,.50)" }}>/ 84°F</span>
            </div>
            <p style={{ fontFamily: BF, fontSize: ".82rem", color: "rgba(255,255,255,.60)" }}>Sunny · May</p>
          </div>
          <Sun size={52} style={{ color: "rgba(240,190,198,.55)", flexShrink: 0, marginTop: 4 }} />
        </div>

        {/* Stats row */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: ".75rem", marginTop: "1.5rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid rgba(255,255,255,.10)",
        }}>
          {[
            { Icon: Thermometer, label: "Humidity", value: "72%" },
            { Icon: Wind,        label: "Wind",     value: "14 km/h" },
            { Icon: Cloud,       label: "UV index", value: "8 High" },
          ].map(({ Icon, label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <Icon size={14} style={{ margin: "0 auto .25rem", color: "rgba(240,190,198,.55)" }} />
              <p style={{ fontFamily: BF, fontSize: ".48rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.38)", marginBottom: ".2rem" }}>{label}</p>
              <p style={{ fontFamily: BF, fontSize: ".82rem", fontWeight: 700, color: "rgba(255,255,255,.85)" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-day forecast */}
      <div style={{ background: PAPER, padding: "1.25rem clamp(1.5rem,4vw,2.25rem)", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: ".5rem" }}>
        {FORECAST.map(({ day, hi, lo, Icon }) => (
          <div key={day} style={{ textAlign: "center" }}>
            <p style={{ fontFamily: BF, fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: INK_3, marginBottom: ".375rem" }}>{day}</p>
            <Icon size={20} style={{ margin: "0 auto .375rem", color: ROSE }} />
            <p style={{ fontFamily: BF, fontSize: ".82rem", fontWeight: 700, color: INK }}>{hi}°</p>
            <p style={{ fontFamily: BF, fontSize: ".72rem", color: INK_4 }}>{lo}°</p>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div style={{ background: PAPER_2, padding: "1rem clamp(1.5rem,4vw,2.25rem)", borderTop: `1px solid ${PARCHMENT}` }}>
        <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".9rem", color: INK_3, lineHeight: 1.65, margin: 0 }}>
          May evenings near the coast can be breezy. Pack a light layer for outdoor events after sunset.
        </p>
      </div>
    </div>
  );
}

// ── Transport ──────────────────────────────────────────────────────────────
const TRANSPORT = [
  { Icon: Plane,      title: "By air",   desc: "Chennai International Airport (MAA) — 50–60 km from the venue. Pre-booked transfers available on request." },
  { Icon: TrainFront, title: "By train", desc: "Chennai Central or Egmore. Local trains run to Chengalpattu, 15 km from the venue." },
  { Icon: Bus,        title: "By bus",   desc: "SETC and private coaches on East Coast Road. Nearest stop is 500 m from the venue gate." },
  { Icon: Car,        title: "By road",  desc: "Take East Coast Road (ECR) south from Chennai. GPS: Blue Bay Beach Resort, Mahabalipuram." },
];

function TransportGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {TRANSPORT.map(({ Icon, title, desc }) => (
        <div key={title} style={{
          display: "flex", alignItems: "flex-start", gap: "1.25rem",
          padding: "1.25rem 1.5rem",
          background: WHITE,
          borderRadius: 18,
          border: `1px solid ${PARCHMENT}`,
          boxShadow: "0 1px 4px rgba(18,11,14,.04), 0 4px 16px rgba(18,11,14,.05)",
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: ROSE_PALE, border: `1px solid ${ROSE_MID}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={18} style={{ color: ROSE }} />
          </div>
          <div>
            <p style={{ fontFamily: DF, fontSize: "1.05rem", fontWeight: 600, color: INK, marginBottom: ".25rem" }}>{title}</p>
            <p style={{ fontFamily: BF, fontSize: ".82rem", color: INK_3, lineHeight: 1.65 }}>{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Hotels ─────────────────────────────────────────────────────────────────
const HOTELS = [
  { name: "Radisson Blu Temple Bay",  dist: "3 km",   stars: 5, tag: "Preferred rate",  tagColor: ROSE },
  { name: "GRT Temple Bay Resort",    dist: "2 km",   stars: 5, tag: "Beachfront",      tagColor: GOLD },
  { name: "Sea Hawk Resort",          dist: "1.5 km", stars: 4, tag: "Budget-friendly", tagColor: INK_3 },
  { name: "The Ideal Beach Resort",   dist: "4 km",   stars: 4, tag: "Family suites",   tagColor: INK_3 },
];

function HotelGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "1.25rem" }}>
      {HOTELS.map(({ name, dist, stars, tag, tagColor }) => (
        <a
          key={name}
          href={`https://www.google.com/search?q=${encodeURIComponent(name + " Mahabalipuram")}`}
          target="_blank" rel="noreferrer"
          style={{
            display: "flex", flexDirection: "column", gap: "1rem",
            padding: "1.5rem",
            background: WHITE,
            borderRadius: 20,
            border: `1px solid ${PARCHMENT}`,
            boxShadow: "0 1px 4px rgba(18,11,14,.04), 0 4px 16px rgba(18,11,14,.05)",
            textDecoration: "none",
            transition: "transform .18s ease, box-shadow .18s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(18,11,14,.06), 0 16px 48px rgba(18,11,14,.10)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 1px 4px rgba(18,11,14,.04), 0 4px 16px rgba(18,11,14,.05)";
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".5rem" }}>
            <Hotel size={20} style={{ color: ROSE, flexShrink: 0, marginTop: 2 }} />
            <span style={{
              fontFamily: BF, fontSize: ".50rem", fontWeight: 700,
              letterSpacing: ".16em", textTransform: "uppercase",
              color: tagColor,
              background: tagColor === ROSE ? ROSE_PALE : tagColor === GOLD ? GOLD_PALE : PAPER_2,
              border: `1px solid ${tagColor === ROSE ? ROSE_MID : tagColor === GOLD ? "rgba(168,120,8,.20)" : PARCHMENT}`,
              padding: "3px 10px", borderRadius: 999,
              flexShrink: 0,
            }}>
              {tag}
            </span>
          </div>
          <div>
            <p style={{ fontFamily: DF, fontSize: "1.1rem", fontWeight: 600, color: INK, lineHeight: 1.2, marginBottom: ".375rem" }}>{name}</p>
            <p style={{ fontFamily: BF, fontSize: ".78rem", color: INK_4 }}>{dist} from venue</p>
            <p style={{ fontFamily: BF, fontSize: ".82rem", color: GOLD, marginTop: ".25rem", letterSpacing: ".04em" }}>{"★".repeat(stars)}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: "auto" }}>
            <span style={{ fontFamily: BF, fontSize: ".68rem", fontWeight: 600, color: ROSE }}>Search availability</span>
            <ArrowUpRight size={12} style={{ color: ROSE }} />
          </div>
        </a>
      ))}
    </div>
  );
}

// ── Help contacts ──────────────────────────────────────────────────────────
const HELP_CONTACTS = [
  { Icon: Phone,       label: "Wedding Coordinator",     value: "+91 98765 43210",       href: "tel:+919876543210",             note: "Available 8 AM – 10 PM" },
  { Icon: MapPin,      label: "Venue Contact",           value: "Blue Bay Resort",        href: "tel:+914427473000",             note: "+91 44 2747 3000" },
  { Icon: HeartPulse,  label: "Medical Emergency",       value: "108 Ambulance",          href: "tel:108",                      note: "24 × 7 emergency" },
  { Icon: ShieldCheck, label: "Police",                  value: "100",                    href: "tel:100",                      note: "Mahabalipuram station" },
  { Icon: Car,         label: "Cab / Rideshare",         value: "Ola / Uber",             href: "https://www.olacabs.com",      note: "Service available locally" },
  { Icon: Phone,       label: "Family Helpline",         value: "family@surihana.vows",   href: "mailto:family@surihana.vows",  note: "For any assistance" },
];

function HelpContactsGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: "1rem" }}>
      {HELP_CONTACTS.map(({ Icon, label, value, href, note }) => (
        <a
          key={label} href={href}
          target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
          style={{
            display: "flex", alignItems: "flex-start", gap: "1rem",
            padding: "1.25rem 1.375rem",
            background: WHITE,
            borderRadius: 18,
            border: `1px solid ${PARCHMENT}`,
            boxShadow: "0 1px 4px rgba(18,11,14,.04)",
            textDecoration: "none",
            transition: "transform .18s, box-shadow .18s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(18,11,14,.06), 0 12px 32px rgba(18,11,14,.09)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 1px 4px rgba(18,11,14,.04)";
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: ROSE_PALE, border: `1px solid ${ROSE_MID}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={17} style={{ color: ROSE }} />
          </div>
          <div>
            <p style={{ fontFamily: BF, fontSize: ".52rem", letterSpacing: ".20em", textTransform: "uppercase", color: INK_4, fontWeight: 600, marginBottom: ".2rem" }}>{label}</p>
            <p style={{ fontFamily: DF, fontSize: "1rem", fontWeight: 600, color: INK, lineHeight: 1.1, marginBottom: ".2rem" }}>{value}</p>
            <p style={{ fontFamily: BF, fontSize: ".75rem", color: INK_3 }}>{note}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────
function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{
      background: WHITE, borderRadius: 20,
      border: `1px solid ${PARCHMENT}`,
      boxShadow: "0 1px 4px rgba(18,11,14,.04), 0 4px 16px rgba(18,11,14,.05)",
      overflow: "hidden",
    }}>
      {items.map((item, i) => (
        <div key={item.question} style={{ borderBottom: i < items.length - 1 ? `1px solid ${PAPER_2}` : "none" }}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: "1rem",
              padding: "1.25rem 1.5rem",
              background: "none", border: "none", cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ fontFamily: DF, fontSize: "1.05rem", fontWeight: 600, color: INK, lineHeight: 1.3 }}>
              {item.question}
            </span>
            <ChevronDown
              size={16}
              style={{
                color: ROSE, flexShrink: 0,
                transition: "transform .22s ease",
                transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>
          {open === i && (
            <div style={{ padding: "0 1.5rem 1.25rem" }}>
              <p style={{ fontFamily: BF, fontSize: ".875rem", color: INK_2, lineHeight: 1.72 }}>
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Arrival tips ───────────────────────────────────────────────────────────
function ArrivalTips({ tips }: { tips: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".875rem" }}>
      {tips.map((tip, i) => (
        <div key={tip} style={{
          display: "flex", alignItems: "flex-start", gap: "1.125rem",
          padding: "1.125rem 1.375rem",
          background: WHITE,
          borderRadius: 16,
          border: `1px solid ${PARCHMENT}`,
          boxShadow: "0 1px 4px rgba(18,11,14,.04)",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: ROSE_PALE, border: `1.5px solid ${ROSE_MID}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: BF, fontSize: ".68rem", fontWeight: 700, color: ROSE,
          }}>
            {i + 1}
          </div>
          <p style={{ fontFamily: BF, fontSize: ".875rem", color: INK_2, lineHeight: 1.70, paddingTop: 4 }}>{tip}</p>
        </div>
      ))}
    </div>
  );
}

// ── Travel notes from DB ────────────────────────────────────────────────────
function TravelNotes({ sections }: { sections: TravelSection[] }) {
  if (!sections.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.25rem" }}>
      {sections.map(s => (
        <div key={s.id} style={{
          background: WHITE, borderRadius: 20, padding: "1.75rem",
          border: `1px solid ${PARCHMENT}`,
          boxShadow: "0 1px 4px rgba(18,11,14,.04), 0 4px 16px rgba(18,11,14,.05)",
          display: "flex", flexDirection: "column", gap: ".875rem",
        }}>
          <Eyebrow>{s.category ?? "Travel note"}</Eyebrow>
          <h3 style={{ fontFamily: DF, fontSize: "1.2rem", fontWeight: 600, color: INK, lineHeight: 1.2 }}>{s.title}</h3>
          <p style={{ fontFamily: BF, fontSize: ".875rem", color: INK_2, lineHeight: 1.7, flex: 1 }}>{s.description}</p>
          <a href={s.link} target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: BF, fontSize: ".72rem", fontWeight: 600, color: ROSE, textDecoration: "none" }}>
            Open map <ArrowUpRight size={11} />
          </a>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════
export function TravelPageClient({ sections, essentials, faq, arrivalTips }: GuideProps) {
  return (
    <div style={{ background: CREAM, color: INK, minHeight: "100vh" }}>
      <style>{`
        @keyframes tr-fade  {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tr-line  {from{transform:scaleX(0)}to{transform:scaleX(1)}}
        .tr-in-0{opacity:0;animation:tr-fade .8s .1s cubic-bezier(.16,1,.3,1) forwards}
        .tr-in-1{opacity:0;animation:tr-fade .8s .25s cubic-bezier(.16,1,.3,1) forwards}
        .tr-in-2{opacity:0;animation:tr-fade .8s .40s cubic-bezier(.16,1,.3,1) forwards}
        .tr-in-3{opacity:0;animation:tr-fade .8s .55s cubic-bezier(.16,1,.3,1) forwards}
        .tr-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start}
        .tr-grid-faq{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start}
        @media(max-width:768px){
          .tr-grid-2{grid-template-columns:1fr!important}
          .tr-grid-faq{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(160deg, #0D0608 0%, #1A0308 45%, #0D0608 100%)`,
        padding: "clamp(5rem,12vh,8rem) clamp(1.5rem,6vw,5rem) clamp(4rem,10vh,6rem)",
      }}>
        {/* Top accent stripe */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${ROSE} 25%, ${GOLD} 50%, ${ROSE} 75%, transparent)` }} />

        {/* Ambient bloom */}
        <div aria-hidden style={{ position: "absolute", top: "10%", right: "8%", width: "45%", height: "80%", borderRadius: "50%", background: "radial-gradient(circle, rgba(190,45,69,.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: "0%", left: "5%", width: "35%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,120,8,.05) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          {/* Eyebrow */}
          <div className="tr-in-0" style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem",
          }}>
            <div style={{ width: 24, height: 1, background: `linear-gradient(to right, transparent, ${ROSE_MID})` }} />
            <span style={{ fontFamily: BF, fontSize: ".48rem", letterSpacing: ".52em", textTransform: "uppercase", color: `rgba(240,190,198,.70)`, fontWeight: 700 }}>
              Marion &amp; Livingston · 20 May 2026
            </span>
          </div>

          {/* Headline */}
          <h1 className="tr-in-1" style={{
            fontFamily: DF, fontWeight: 300,
            fontSize: "clamp(3.5rem,10vw,8rem)",
            lineHeight: .88, letterSpacing: "-.03em",
            color: WHITE, marginBottom: "clamp(1.25rem,3vh,2rem)",
          }}>
            Getting<br />
            <em style={{ color: `rgba(240,190,198,.90)` }}>here.</em>
          </h1>

          {/* Subtitle */}
          <p className="tr-in-2" style={{
            fontFamily: DF, fontStyle: "italic",
            fontSize: "clamp(1rem,2.5vw,1.25rem)",
            color: "rgba(255,255,255,.55)",
            maxWidth: "38rem", lineHeight: 1.78,
            marginBottom: "2.5rem",
          }}>
            Transport, hotels, weather and everything you need to arrive rested and stay close to the celebration.
          </p>

          {/* Venue chips */}
          <div className="tr-in-3" style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
            {[
              { label: "Divine Mercy Church · Kelambakkam", time: "3 PM", accent: ROSE_L, bg: "rgba(190,45,69,.14)", bd: "rgba(190,45,69,.28)" },
              { label: "Blue Bay Beach Resort · Mahabalipuram", time: "6 PM", accent: GOLD_L, bg: "rgba(168,120,8,.14)", bd: "rgba(168,120,8,.28)" },
            ].map(({ label, time, accent, bg, bd }) => (
              <span key={label} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 16px", borderRadius: 999,
                background: bg, border: `1px solid ${bd}`,
                fontFamily: BF, fontSize: ".65rem", fontWeight: 600,
                color: "rgba(255,255,255,.80)", letterSpacing: ".03em",
              }}>
                <span style={{ color: accent, fontWeight: 700 }}>{time}</span>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to bottom, transparent, ${CREAM})` }} />
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(3rem,8vh,5rem) clamp(1.5rem,6vw,5rem) clamp(4rem,10vh,7rem)" }}>

        {/* ── Weather + Transport ── */}
        <section style={{ marginBottom: "clamp(4rem,8vh,6rem)" }}>
          <Eyebrow>Conditions &amp; getting here</Eyebrow>
          <h2 style={{ fontFamily: DF, fontWeight: 300, fontSize: "clamp(2rem,5vw,3rem)", color: INK, lineHeight: 1.1, marginBottom: "2rem", letterSpacing: "-.02em" }}>
            Weather &amp; transport
          </h2>
          <Rule />
          <div className="tr-grid-2">
            <WeatherWidget />
            <TransportGrid />
          </div>
        </section>

        {/* ── Hotels ── */}
        <section style={{ marginBottom: "clamp(4rem,8vh,6rem)" }}>
          <Eyebrow>Where to stay</Eyebrow>
          <h2 style={{ fontFamily: DF, fontWeight: 300, fontSize: "clamp(2rem,5vw,3rem)", color: INK, lineHeight: 1.1, marginBottom: "2rem", letterSpacing: "-.02em" }}>
            Recommended hotels
          </h2>
          <Rule gold />
          <HotelGrid />
        </section>

        {/* ── Travel notes from DB ── */}
        {sections.length > 0 && (
          <section style={{ marginBottom: "clamp(4rem,8vh,6rem)" }}>
            <Eyebrow>Travel notes</Eyebrow>
            <h2 style={{ fontFamily: DF, fontWeight: 300, fontSize: "clamp(2rem,5vw,3rem)", color: INK, lineHeight: 1.1, marginBottom: "2rem", letterSpacing: "-.02em" }}>
              Things to know
            </h2>
            <Rule />
            <TravelNotes sections={sections} />
          </section>
        )}

        {/* ── Arrival tips + FAQ ── */}
        {(arrivalTips.length > 0 || faq.length > 0) && (
          <section style={{ marginBottom: "clamp(4rem,8vh,6rem)" }}>
            <div className="tr-grid-faq">
              {arrivalTips.length > 0 && (
                <div>
                  <Eyebrow>On arrival</Eyebrow>
                  <h2 style={{ fontFamily: DF, fontWeight: 300, fontSize: "clamp(1.75rem,4vw,2.5rem)", color: INK, lineHeight: 1.1, marginBottom: "2rem", letterSpacing: "-.02em" }}>
                    Arrival tips
                  </h2>
                  <Rule />
                  <ArrivalTips tips={arrivalTips} />
                </div>
              )}
              {faq.length > 0 && (
                <div>
                  <Eyebrow>Questions</Eyebrow>
                  <h2 style={{ fontFamily: DF, fontWeight: 300, fontSize: "clamp(1.75rem,4vw,2.5rem)", color: INK, lineHeight: 1.1, marginBottom: "2rem", letterSpacing: "-.02em" }}>
                    Frequently asked
                  </h2>
                  <Rule gold />
                  <FAQAccordion items={faq} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Emergency contacts ── */}
        <section style={{ marginBottom: "clamp(4rem,8vh,6rem)" }}>
          <Eyebrow>Help &amp; emergency</Eyebrow>
          <h2 style={{ fontFamily: DF, fontWeight: 300, fontSize: "clamp(2rem,5vw,3rem)", color: INK, lineHeight: 1.1, marginBottom: "2rem", letterSpacing: "-.02em" }}>
            Contact us
          </h2>
          <Rule />
          <HelpContactsGrid />
        </section>

        {/* ── Nearby essentials ── */}
        {essentials.length > 0 && (
          <section>
            <Eyebrow>Near the venue</Eyebrow>
            <h2 style={{ fontFamily: DF, fontWeight: 300, fontSize: "clamp(2rem,5vw,3rem)", color: INK, lineHeight: 1.1, marginBottom: "2rem", letterSpacing: "-.02em" }}>
              Nearby essentials
            </h2>
            <Rule gold />
            <NearbyEssentials items={essentials} />
          </section>
        )}

      </div>

      {/* ── Footer strip ── */}
      <div style={{
        borderTop: `1px solid ${PARCHMENT}`,
        padding: "2rem clamp(1.5rem,6vw,5rem)",
        background: PAPER,
        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem",
      }}>
        <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: ".95rem", color: INK_3 }}>
          Questions? Reach us at{" "}
          <a href="mailto:family@surihana.vows" style={{ color: ROSE, textDecoration: "none", fontWeight: 600 }}>family@surihana.vows</a>
        </p>
        <span style={{
          fontFamily: BF, fontSize: ".48rem", letterSpacing: ".38em",
          textTransform: "uppercase", color: INK_4, fontWeight: 600,
        }}>
          Marion &amp; Livingston · 20 · 05 · 2026
        </span>
      </div>
    </div>
  );
}
