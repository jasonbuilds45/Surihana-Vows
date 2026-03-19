"use client";

/**
 * TravelPageClient — Light theme redesign
 *
 * Matches the platform's 2026 warm-cream design system exactly:
 * — CSS variable tokens from globals.css throughout
 * — Glass cards with backdrop-filter + noise grain
 * — 3D perspective tilt on transport + hotel cards (mouse-follow)
 * — Multi-layer directional shadows (--sh-* tokens)
 * — Light-sweep button animations
 * — Page hero uses the .page-hero vocabulary (cream bg, rose radial blooms)
 */

import { useState, useRef, useCallback } from "react";
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

// ── 3D tilt card hook ──────────────────────────────────────────────────────
function useTilt(strength = 12) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5;  // -0.5 … 0.5
    const y = (e.clientY - top)  / height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(8px)`;
    el.style.boxShadow = `
      ${-x * 16}px ${y * 16}px 40px rgba(15,10,11,.13),
      ${-x * 8}px ${y * 8}px 20px rgba(190,45,69,.07),
      0 2px 8px rgba(15,10,11,.06)
    `;
  }, [strength]);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)";
    el.style.boxShadow = "";
  }, []);

  return { ref, onMove, onLeave };
}

// ── Shared eyebrow ─────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "var(--font-body),'Manrope',sans-serif",
      fontSize: ".52rem", letterSpacing: ".42em",
      textTransform: "uppercase", color: "var(--rose)",
      fontWeight: 700, marginBottom: ".5rem",
    }}>
      {children}
    </p>
  );
}

// ── Section heading ────────────────────────────────────────────────────────
function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 style={{
        fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif",
        fontWeight: 300, fontSize: "clamp(1.75rem,4vw,2.75rem)",
        color: "var(--ink)", lineHeight: 1.1, letterSpacing: "-.02em",
        marginBottom: ".875rem",
      }}>
        {title}
      </h2>
      {/* Rose hairline rule */}
      <div style={{
        height: 1,
        background: "linear-gradient(90deg, var(--rose) 0%, var(--rose-mid) 40%, transparent 100%)",
        width: "min(160px,40%)",
      }} />
    </div>
  );
}

// ── Weather ────────────────────────────────────────────────────────────────
const FORECAST = [
  { day: "Fri", hi: 29, lo: 23, Icon: Sun      },
  { day: "Sat", hi: 28, lo: 22, Icon: Cloud     },
  { day: "Sun", hi: 30, lo: 24, Icon: Sun       },
  { day: "Mon", hi: 27, lo: 22, Icon: CloudRain },
  { day: "Tue", hi: 28, lo: 23, Icon: Cloud     },
];

function WeatherCard() {
  return (
    <div style={{
      borderRadius: "var(--r-xl)", overflow: "hidden",
      boxShadow: "var(--sh-lg)",
      border: "1px solid var(--bdr)",
    }}>
      {/* Dark header — the one accent-dark element in the page */}
      <div style={{
        background: "linear-gradient(135deg, var(--bg-ink) 0%, var(--bg-ink-2) 55%, var(--bg-ink) 100%)",
        padding: "1.75rem 2rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--rose) 30%, var(--gold-l) 50%, var(--rose) 70%, transparent)" }} />
        <div aria-hidden style={{ position: "absolute", top: "-20%", right: "-5%", width: "55%", height: "140%", borderRadius: "50%", background: "radial-gradient(circle, rgba(190,45,69,.10) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".48rem", letterSpacing: ".38em", textTransform: "uppercase", color: "rgba(240,190,198,.65)", fontWeight: 700, marginBottom: ".5rem" }}>
              Mahabalipuram · May
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: ".5rem", marginBottom: ".25rem" }}>
              <span style={{ fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif", fontSize: "clamp(2.5rem,7vw,3.5rem)", fontWeight: 600, color: "#fff", lineHeight: 1 }}>29°C</span>
              <span style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".875rem", color: "rgba(255,255,255,.45)" }}>/ 84°F</span>
            </div>
            <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".8rem", color: "rgba(255,255,255,.55)" }}>Sunny · Coastal breeze</p>
          </div>
          <Sun size={48} style={{ color: "rgba(240,190,198,.55)", flexShrink: 0, marginTop: 4 }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".75rem", marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          {[
            { Icon: Thermometer, label: "Humidity", value: "72%" },
            { Icon: Wind,        label: "Wind",     value: "14 km/h" },
            { Icon: Cloud,       label: "UV",       value: "8 High" },
          ].map(({ Icon, label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <Icon size={13} style={{ margin: "0 auto .25rem", color: "rgba(240,190,198,.50)" }} />
              <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".46rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: ".15rem" }}>{label}</p>
              <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".8rem", fontWeight: 700, color: "rgba(255,255,255,.82)" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-day forecast — warm surface */}
      <div style={{
        background: "var(--bg-warm)",
        padding: "1.25rem 2rem",
        display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: ".5rem",
        borderBottom: "1px solid var(--bdr)",
      }}>
        {FORECAST.map(({ day, hi, lo, Icon }) => (
          <div key={day} style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".56rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: ".375rem" }}>{day}</p>
            <Icon size={18} style={{ margin: "0 auto .375rem", color: "var(--rose)" }} />
            <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".8rem", fontWeight: 700, color: "var(--ink)" }}>{hi}°</p>
            <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".72rem", color: "var(--ink-4)" }}>{lo}°</p>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div style={{ background: "var(--bg-linen)", padding: "1rem 2rem" }}>
        <p style={{ fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif", fontStyle: "italic", fontSize: ".9rem", color: "var(--ink-3)", lineHeight: 1.65, margin: 0 }}>
          May evenings near the coast can be breezy. Pack a light layer for outdoor events after sunset.
        </p>
      </div>
    </div>
  );
}

// ── Transport cards — 3D tilt ──────────────────────────────────────────────
const TRANSPORT = [
  { Icon: Plane,      title: "By air",   desc: "Chennai International Airport (MAA) — 50–60 km from the venue. Pre-booked transfers available on request." },
  { Icon: TrainFront, title: "By train", desc: "Chennai Central or Egmore. Local trains run to Chengalpattu, 15 km from the venue." },
  { Icon: Bus,        title: "By bus",   desc: "SETC and private coaches on East Coast Road. Nearest stop is 500 m from the venue gate." },
  { Icon: Car,        title: "By road",  desc: "Take East Coast Road (ECR) south from Chennai. GPS: Blue Bay Beach Resort, Mahabalipuram." },
];

function TransportCard({ Icon, title, desc }: typeof TRANSPORT[0]) {
  const { ref, onMove, onLeave } = useTilt(8);
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        display: "flex", alignItems: "flex-start", gap: "1.25rem",
        padding: "1.375rem 1.5rem",
        background: "rgba(255,255,255,0.80)",
        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        borderRadius: "var(--r-lg)",
        border: "1px solid rgba(255,255,255,0.72)",
        boxShadow: "var(--sh-sm)",
        transition: "transform 0.18s var(--expo), box-shadow 0.18s var(--smooth)",
        transformStyle: "preserve-3d",
        cursor: "default",
        // Subtle grain
        backgroundImage: "var(--noise), linear-gradient(rgba(255,255,255,.80), rgba(255,255,255,.80))",
      }}
    >
      {/* Icon — lifts in 3D */}
      <div style={{
        width: 44, height: 44, borderRadius: "var(--r-sm)", flexShrink: 0,
        background: "var(--rose-pale)",
        border: "1px solid var(--rose-mid)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: "translateZ(14px)",
        boxShadow: "0 4px 12px rgba(190,45,69,.14)",
      }}>
        <Icon size={19} style={{ color: "var(--rose)" }} />
      </div>
      <div style={{ transform: "translateZ(6px)" }}>
        <p style={{ fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif", fontSize: "1.05rem", fontWeight: 600, color: "var(--ink)", marginBottom: ".3rem" }}>{title}</p>
        <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".82rem", color: "var(--ink-3)", lineHeight: 1.65 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Hotel cards — 3D tilt ──────────────────────────────────────────────────
const HOTELS = [
  { name: "Radisson Blu Temple Bay", dist: "3 km",   stars: 5, tag: "Preferred rate",  tagRose: true,  tagGold: false },
  { name: "GRT Temple Bay Resort",   dist: "2 km",   stars: 5, tag: "Beachfront",      tagRose: false, tagGold: true  },
  { name: "Sea Hawk Resort",         dist: "1.5 km", stars: 4, tag: "Budget-friendly", tagRose: false, tagGold: false },
  { name: "The Ideal Beach Resort",  dist: "4 km",   stars: 4, tag: "Family suites",   tagRose: false, tagGold: false },
];

function HotelCard({ name, dist, stars, tag, tagRose, tagGold }: typeof HOTELS[0]) {
  const { ref, onMove, onLeave } = useTilt(10);
  const tagColor  = tagRose ? "var(--rose)"   : tagGold ? "var(--gold)"   : "var(--ink-3)";
  const tagBg     = tagRose ? "var(--rose-pale)" : tagGold ? "var(--gold-pale)" : "var(--bg-linen)";
  const tagBorder = tagRose ? "var(--rose-mid)"  : tagGold ? "rgba(168,120,8,.22)"  : "var(--bdr-warm)";

  return (
    <a
      href={`https://www.google.com/search?q=${encodeURIComponent(name + " Mahabalipuram")}`}
      target="_blank" rel="noreferrer"
      ref={ref as unknown as React.RefObject<HTMLAnchorElement>}
      onMouseMove={onMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      onMouseLeave={onLeave as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      style={{
        display: "flex", flexDirection: "column", gap: "1rem",
        padding: "1.5rem",
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(14px) saturate(150%)",
        WebkitBackdropFilter: "blur(14px) saturate(150%)",
        borderRadius: "var(--r-xl)",
        border: "1px solid rgba(255,255,255,0.75)",
        boxShadow: "var(--sh-sm)",
        textDecoration: "none",
        transformStyle: "preserve-3d",
        transition: "transform 0.18s var(--expo), box-shadow 0.18s var(--smooth)",
        backgroundImage: "var(--noise), linear-gradient(rgba(255,255,255,.82), rgba(255,255,255,.82))",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".5rem", transform: "translateZ(6px)" }}>
        <Hotel size={20} style={{ color: "var(--rose)", flexShrink: 0, marginTop: 2 }} />
        <span style={{
          fontFamily: "var(--font-body),'Manrope',sans-serif",
          fontSize: ".50rem", fontWeight: 700,
          letterSpacing: ".16em", textTransform: "uppercase",
          color: tagColor, background: tagBg,
          border: `1px solid ${tagBorder}`,
          padding: "3px 10px", borderRadius: 999, flexShrink: 0,
        }}>
          {tag}
        </span>
      </div>
      <div style={{ transform: "translateZ(10px)" }}>
        <p style={{ fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif", fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.2, marginBottom: ".3rem" }}>{name}</p>
        <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".78rem", color: "var(--ink-4)" }}>{dist} from venue</p>
        <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".82rem", color: "var(--gold)", marginTop: ".25rem", letterSpacing: ".04em" }}>{"★".repeat(stars)}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: "auto", transform: "translateZ(6px)" }}>
        <span style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".68rem", fontWeight: 600, color: "var(--rose)" }}>Search availability</span>
        <ArrowUpRight size={12} style={{ color: "var(--rose)" }} />
      </div>
    </a>
  );
}

// ── Help contacts ──────────────────────────────────────────────────────────
const HELP_CONTACTS = [
  { Icon: Phone,       label: "Wedding Coordinator", value: "+91 98765 43210",      href: "tel:+919876543210",            note: "Available 8 AM – 10 PM"    },
  { Icon: MapPin,      label: "Venue Contact",        value: "Blue Bay Resort",      href: "tel:+914427473000",            note: "+91 44 2747 3000"           },
  { Icon: HeartPulse,  label: "Medical Emergency",    value: "108 Ambulance",        href: "tel:108",                     note: "24 × 7 emergency"          },
  { Icon: ShieldCheck, label: "Police",               value: "100",                  href: "tel:100",                     note: "Mahabalipuram station"      },
  { Icon: Car,         label: "Cab / Rideshare",      value: "Ola / Uber",           href: "https://www.olacabs.com",     note: "Service available locally" },
  { Icon: Phone,       label: "Family Helpline",      value: "family@surihana.vows", href: "mailto:family@surihana.vows", note: "For any assistance"        },
];

function ContactCard({ Icon, label, value, href, note }: typeof HELP_CONTACTS[0]) {
  const { ref, onMove, onLeave } = useTilt(6);
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
      ref={ref as unknown as React.RefObject<HTMLAnchorElement>}
      onMouseMove={onMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      onMouseLeave={onLeave as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      style={{
        display: "flex", alignItems: "flex-start", gap: "1rem",
        padding: "1.25rem 1.375rem",
        background: "rgba(255,255,255,0.80)",
        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        borderRadius: "var(--r-lg)",
        border: "1px solid rgba(255,255,255,0.72)",
        boxShadow: "var(--sh-sm)",
        textDecoration: "none",
        transformStyle: "preserve-3d",
        transition: "transform 0.18s var(--expo), box-shadow 0.18s var(--smooth)",
        backgroundImage: "var(--noise), linear-gradient(rgba(255,255,255,.80), rgba(255,255,255,.80))",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: "var(--r-sm)", flexShrink: 0,
        background: "var(--rose-pale)", border: "1px solid var(--rose-mid)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: "translateZ(12px)",
        boxShadow: "0 3px 10px rgba(190,45,69,.12)",
      }}>
        <Icon size={17} style={{ color: "var(--rose)" }} />
      </div>
      <div style={{ transform: "translateZ(6px)" }}>
        <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".50rem", letterSpacing: ".20em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 600, marginBottom: ".2rem" }}>{label}</p>
        <p style={{ fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif", fontSize: "1rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.1, marginBottom: ".2rem" }}>{value}</p>
        <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".75rem", color: "var(--ink-3)" }}>{note}</p>
      </div>
    </a>
  );
}

// ── FAQ accordion ──────────────────────────────────────────────────────────
function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{
      background: "rgba(255,255,255,0.80)",
      backdropFilter: "blur(12px) saturate(140%)",
      WebkitBackdropFilter: "blur(12px) saturate(140%)",
      borderRadius: "var(--r-xl)",
      border: "1px solid rgba(255,255,255,0.72)",
      boxShadow: "var(--sh-md)",
      overflow: "hidden",
      backgroundImage: "var(--noise), linear-gradient(rgba(255,255,255,.80), rgba(255,255,255,.80))",
    }}>
      {items.map((item, i) => (
        <div key={item.question} style={{ borderBottom: i < items.length - 1 ? "1px solid var(--bdr)" : "none" }}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: "1rem",
              padding: "1.25rem 1.5rem",
              background: open === i ? "var(--bg-warm)" : "none",
              border: "none", cursor: "pointer", textAlign: "left",
              transition: "background 0.18s ease",
            }}
          >
            <span style={{ fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif", fontSize: "1.05rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>
              {item.question}
            </span>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: open === i ? "var(--rose)" : "var(--rose-pale)",
              border: "1px solid var(--rose-mid)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.18s ease",
            }}>
              <ChevronDown
                size={14}
                style={{
                  color: open === i ? "#fff" : "var(--rose)",
                  transition: "transform .22s var(--expo)",
                  transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </div>
          </button>
          {open === i && (
            <div style={{ padding: "0 1.5rem 1.25rem", background: "var(--bg-warm)" }}>
              <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".875rem", color: "var(--ink-2)", lineHeight: 1.72 }}>
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
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "var(--r-md)",
          border: "1px solid rgba(255,255,255,0.72)",
          boxShadow: "var(--sh-xs)",
          backgroundImage: "var(--noise), linear-gradient(rgba(255,255,255,.78), rgba(255,255,255,.78))",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "var(--rose-pale)", border: "1.5px solid var(--rose-mid)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".68rem", fontWeight: 700, color: "var(--rose)",
          }}>
            {i + 1}
          </div>
          <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".875rem", color: "var(--ink-2)", lineHeight: 1.70, paddingTop: 3 }}>{tip}</p>
        </div>
      ))}
    </div>
  );
}

// ── Travel notes ───────────────────────────────────────────────────────────
function TravelNotes({ sections }: { sections: TravelSection[] }) {
  if (!sections.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.25rem" }}>
      {sections.map(s => (
        <div key={s.id} style={{
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(12px) saturate(140%)",
          WebkitBackdropFilter: "blur(12px) saturate(140%)",
          borderRadius: "var(--r-xl)", padding: "1.75rem",
          border: "1px solid rgba(255,255,255,0.72)",
          boxShadow: "var(--sh-sm)",
          display: "flex", flexDirection: "column", gap: ".875rem",
          backgroundImage: "var(--noise), linear-gradient(rgba(255,255,255,.80), rgba(255,255,255,.80))",
          transition: "transform var(--t-med) var(--expo), box-shadow var(--t-med) var(--smooth)",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--sh-float)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--sh-sm)"; }}
        >
          <Eyebrow>{s.category ?? "Travel note"}</Eyebrow>
          <h3 style={{ fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.2 }}>{s.title}</h3>
          <p style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".875rem", color: "var(--ink-2)", lineHeight: 1.7, flex: 1 }}>{s.description}</p>
          <a href={s.link} target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".72rem", fontWeight: 600, color: "var(--rose)", textDecoration: "none" }}>
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
    <div style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <style>{`
        @keyframes tr-up {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        .tr-0{opacity:0;animation:tr-up .8s .05s cubic-bezier(.16,1,.3,1) forwards}
        .tr-1{opacity:0;animation:tr-up .8s .18s cubic-bezier(.16,1,.3,1) forwards}
        .tr-2{opacity:0;animation:tr-up .8s .30s cubic-bezier(.16,1,.3,1) forwards}
        .tr-3{opacity:0;animation:tr-up .8s .44s cubic-bezier(.16,1,.3,1) forwards}
        .tr-g2{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start}
        .tr-gfaq{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start}
        @media(max-width:768px){
          .tr-g2{grid-template-columns:1fr!important}
          .tr-gfaq{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ── HERO — matches .page-hero vocabulary ── */}
      <div className="page-hero" style={{ padding: "clamp(4rem,10vh,7rem) var(--pad-x) clamp(3rem,8vh,5rem)" }}>
        <div className="page-hero-inner">

          {/* Eyebrow */}
          <div className="tr-0" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.75rem" }}>
            <div style={{ width: 20, height: 1, background: "linear-gradient(to right, transparent, var(--rose-mid))" }} />
            <span style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".46rem", letterSpacing: ".52em", textTransform: "uppercase", color: "var(--rose)", fontWeight: 700 }}>
              Marion &amp; Livingston · 20 May 2026
            </span>
          </div>

          {/* Headline */}
          <h1 className="tr-1" style={{
            fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif",
            fontWeight: 300, fontSize: "clamp(3rem,9vw,7.5rem)",
            lineHeight: .88, letterSpacing: "-.03em",
            color: "var(--ink)", marginBottom: "clamp(1rem,2.5vh,1.75rem)",
          }}>
            Getting<br />
            <em style={{ color: "var(--rose)" }}>here.</em>
          </h1>

          {/* Subtitle */}
          <p className="tr-2" style={{
            fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif",
            fontStyle: "italic",
            fontSize: "clamp(1rem,2.2vw,1.2rem)",
            color: "var(--ink-3)", maxWidth: "36rem",
            lineHeight: 1.78, marginBottom: "2rem",
          }}>
            Transport, hotels, weather and everything you need to arrive rested and stay close to the celebration.
          </p>

          {/* Venue chips */}
          <div className="tr-3" style={{ display: "flex", flexWrap: "wrap", gap: ".625rem" }}>
            {[
              { label: "Divine Mercy Church · Kelambakkam", time: "3 PM", rose: true  },
              { label: "Blue Bay Beach Resort · Mahabalipuram", time: "6 PM", rose: false },
            ].map(({ label, time, rose }) => (
              <span key={label} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "5px 14px", borderRadius: 999,
                background: rose ? "var(--rose-pale)" : "var(--gold-pale)",
                border: `1px solid ${rose ? "var(--rose-mid)" : "rgba(168,120,8,.22)"}`,
                fontFamily: "var(--font-body),'Manrope',sans-serif",
                fontSize: ".64rem", fontWeight: 600,
                color: "var(--ink-2)", letterSpacing: ".03em",
              }}>
                <span style={{ color: rose ? "var(--rose)" : "var(--gold)", fontWeight: 700 }}>{time}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "clamp(3rem,7vh,5rem) var(--pad-x) clamp(4rem,10vh,7rem)" }}>

        {/* ── Weather + Transport ── */}
        <section style={{ marginBottom: "clamp(4rem,8vh,6rem)" }}>
          <SectionHead eyebrow="Conditions & getting here" title="Weather & transport" />
          <div className="tr-g2">
            <WeatherCard />
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {TRANSPORT.map(t => <TransportCard key={t.title} {...t} />)}
            </div>
          </div>
        </section>

        {/* ── Hotels ── */}
        <section style={{ marginBottom: "clamp(4rem,8vh,6rem)" }}>
          <SectionHead eyebrow="Where to stay" title="Recommended hotels" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "1.25rem" }}>
            {HOTELS.map(h => <HotelCard key={h.name} {...h} />)}
          </div>
        </section>

        {/* ── Travel notes from DB ── */}
        {sections.length > 0 && (
          <section style={{ marginBottom: "clamp(4rem,8vh,6rem)" }}>
            <SectionHead eyebrow="Travel notes" title="Things to know" />
            <TravelNotes sections={sections} />
          </section>
        )}

        {/* ── Arrival tips + FAQ ── */}
        {(arrivalTips.length > 0 || faq.length > 0) && (
          <section style={{ marginBottom: "clamp(4rem,8vh,6rem)" }}>
            <div className="tr-gfaq">
              {arrivalTips.length > 0 && (
                <div>
                  <SectionHead eyebrow="On arrival" title="Arrival tips" />
                  <ArrivalTips tips={arrivalTips} />
                </div>
              )}
              {faq.length > 0 && (
                <div>
                  <SectionHead eyebrow="Questions" title="Frequently asked" />
                  <FAQAccordion items={faq} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Emergency contacts ── */}
        <section style={{ marginBottom: "clamp(4rem,8vh,6rem)" }}>
          <SectionHead eyebrow="Help & emergency" title="Contact us" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: "1rem" }}>
            {HELP_CONTACTS.map(c => <ContactCard key={c.label} {...c} />)}
          </div>
        </section>

        {/* ── Nearby essentials ── */}
        {essentials.length > 0 && (
          <section>
            <SectionHead eyebrow="Near the venue" title="Nearby essentials" />
            <NearbyEssentials items={essentials} />
          </section>
        )}

      </div>

      {/* ── Footer strip ── */}
      <div style={{
        borderTop: "1px solid var(--bdr)",
        padding: "2rem var(--pad-x)",
        background: "var(--bg-warm)",
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: "1rem",
      }}>
        <p style={{ fontFamily: "var(--font-display),'Cormorant Garamond',Georgia,serif", fontStyle: "italic", fontSize: ".95rem", color: "var(--ink-3)" }}>
          Questions?{" "}
          <a href="mailto:family@surihana.vows" style={{ color: "var(--rose)", fontWeight: 600 }}>family@surihana.vows</a>
        </p>
        <span style={{ fontFamily: "var(--font-body),'Manrope',sans-serif", fontSize: ".46rem", letterSpacing: ".38em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 600 }}>
          Marion &amp; Livingston · 20 · 05 · 2026
        </span>
      </div>
    </div>
  );
}
