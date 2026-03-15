"use client";

import Link from "next/link";
import { ArrowRight, Plane, TrainFront, Bus, Phone, MapPin, Car, Cloud, Sun, CloudRain, Wind, Thermometer, Hotel, Clock, HeartPulse, ShieldCheck, ShoppingBag } from "lucide-react";
import { NearbyEssentials } from "@/components/invitation/NearbyEssentials";
import type { EssentialItem } from "@/components/invitation/NearbyEssentials";

/* ── Palette ── */
const R  = "#C0364A";
const W  = "#FFFFFF";
const I  = "#1A1012";
const I2 = "#3D2530";
const I3 = "#7A5460";
const BG = "#FAF8F6";
const LN = "#F4EFE9";
const BD = "#E4D8D4";
const BF = "var(--font-body), system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";

/* ── Types mirrored from server ── */
interface TravelSection {
  id: string;
  title: string;
  description: string;
  link: string;
  category?: string | null;
  icon?: string | null;
}

interface FAQItem    { question: string; answer: string; }
interface GuideProps {
  sections:     TravelSection[];
  essentials:   EssentialItem[];
  faq:          FAQItem[];
  arrivalTips:  string[];
}

/* ── Weather widget (Chennai static forecast) ── */
function WeatherWidget() {
  const days = [
    { day: "Fri",  hi: 29, lo: 23, icon: Sun,       label: "Sunny"      },
    { day: "Sat",  hi: 28, lo: 22, icon: Cloud,      label: "Partly cloudy" },
    { day: "Sun",  hi: 30, lo: 24, icon: Sun,        label: "Sunny"      },
    { day: "Mon",  hi: 27, lo: 22, icon: CloudRain,  label: "Light rain"  },
    { day: "Tue",  hi: 28, lo: 23, icon: Cloud,      label: "Cloudy"     },
  ];

  return (
    <div style={{ background: W, border: `1px solid ${BD}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(80,20,30,.07)" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${R} 0%, #8B1A2A 100%)`, padding: "1.5rem 2rem", color: W }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: ".6rem", letterSpacing: ".28em", textTransform: "uppercase", opacity: .70, fontFamily: BF, marginBottom: ".375rem" }}>Weather · Mahabalipuram, Chennai</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: ".5rem" }}>
              <span style={{ fontFamily: DF, fontSize: "3.5rem", fontWeight: 700, lineHeight: 1 }}>29°C</span>
              <span style={{ fontSize: "1rem", opacity: .75 }}>/ 84°F</span>
            </div>
            <p style={{ fontSize: ".9rem", opacity: .80, marginTop: ".25rem", fontFamily: BF }}>Sunny · December</p>
          </div>
          <Sun size={56} style={{ opacity: .80 }} />
        </div>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".75rem", marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,.18)" }}>
          {[
            { icon: Thermometer, label: "Humidity", value: "72%" },
            { icon: Wind,        label: "Wind",     value: "14 km/h" },
            { icon: Cloud,       label: "UV index", value: "8 High" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <Icon size={16} style={{ margin: "0 auto .25rem", opacity: .75 }} />
              <p style={{ fontSize: ".6rem", opacity: .60, letterSpacing: ".2em", textTransform: "uppercase", fontFamily: BF }}>{label}</p>
              <p style={{ fontSize: ".875rem", fontWeight: 600, fontFamily: BF }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-day forecast */}
      <div style={{ padding: "1.25rem 2rem", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: ".5rem" }}>
        {days.map(({ day, hi, lo, icon: Icon }) => (
          <div key={day} style={{ textAlign: "center" }}>
            <p style={{ fontSize: ".7rem", fontWeight: 600, color: I3, fontFamily: BF, marginBottom: ".375rem" }}>{day}</p>
            <Icon size={22} style={{ margin: "0 auto .375rem", color: R }} />
            <p style={{ fontSize: ".8rem", fontWeight: 700, color: I, fontFamily: BF }}>{hi}°</p>
            <p style={{ fontSize: ".72rem", color: I3, fontFamily: BF }}>{lo}°</p>
          </div>
        ))}
      </div>

      <div style={{ padding: ".75rem 2rem 1rem", borderTop: `1px solid ${BD}` }}>
        <p style={{ fontSize: ".72rem", color: I3, fontFamily: BF, lineHeight: 1.5 }}>
          December evenings near the coast can be breezy. Pack a light layer for outdoor events after 8 PM.
        </p>
      </div>
    </div>
  );
}

/* ── Wedding Help Contacts ── */
const HELP_CONTACTS = [
  { icon: Phone,       label: "Wedding Coordinator",  value: "+91 98765 43210", href: "tel:+919876543210",             note: "Available 8 AM – 10 PM" },
  { icon: MapPin,      label: "Venue Contact",         value: "Blue Bay Resort",  href: "tel:+914427473000",            note: "+91 44 2747 3000" },
  { icon: HeartPulse,  label: "Medical Emergency",     value: "108 Ambulance",    href: "tel:108",                     note: "24 × 7 emergency" },
  { icon: ShieldCheck, label: "Police",                value: "100",              href: "tel:100",                     note: "Mahabalipuram station" },
  { icon: Car,         label: "Cab / Rideshare",       value: "Ola / Uber",       href: "https://www.olacabs.com",     note: "Service available locally" },
  { icon: Phone,       label: "Family Helpline",       value: "family@surihana.vows", href: "mailto:family@surihana.vows", note: "For any assistance" },
];

function HelpContacts() {
  return (
    <div>
      <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: R, marginBottom: "1.25rem", fontFamily: BF }}>
        Wedding help contacts
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
        {HELP_CONTACTS.map(({ icon: Icon, label, value, href, note }) => (
          <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
            style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1.125rem 1.25rem", background: W, border: `1px solid ${BD}`, borderRadius: 16, textDecoration: "none", transition: "box-shadow .18s, transform .18s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(80,20,30,.10)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FDEAEC", border: "1px solid #F5C5CB", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon size={18} style={{ color: R }} />
            </div>
            <div>
              <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: I3, fontFamily: BF }}>{label}</p>
              <p style={{ fontSize: ".95rem", fontWeight: 700, color: I, fontFamily: BF, marginTop: 2 }}>{value}</p>
              <p style={{ fontSize: ".75rem", color: I3, fontFamily: BF, marginTop: 2 }}>{note}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── Transport cards ── */
const TRANSPORT = [
  { icon: Plane,       title: "By air",       desc: "Fly into Chennai International Airport (MAA). About 50–60 km to venue. Cabs and transfers available." },
  { icon: TrainFront,  title: "By train",     desc: "Arrive at Chennai Central or Egmore. Local trains also run to Chengalpattu (~15 km from venue)." },
  { icon: Bus,         title: "By bus",       desc: "SETC and private coaches run on East Coast Road. Nearest bus stop: 500 m from venue gate." },
  { icon: Car,         title: "By road",      desc: "Take East Coast Road (ECR) south from Chennai. GPS: Blue Bay Beach Resort, Mahabalipuram." },
];

/* ── FAQ accordion ── */
function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details style={{ borderBottom: `1px solid ${BD}` }}>
      <summary style={{ padding: "1rem 0", listStyle: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", fontFamily: BF, fontSize: ".9375rem", fontWeight: 600, color: I }}>
        {q}
        <span style={{ color: R, flexShrink: 0, fontSize: "1.25rem", lineHeight: 1, userSelect: "none" }}>+</span>
      </summary>
      <p style={{ paddingBottom: "1rem", fontSize: ".9rem", color: I2, lineHeight: 1.72, fontFamily: BF }}>{a}</p>
    </details>
  );
}

/* ── Arrival tip ── */
function ArrivalTip({ tip, i }: { tip: string; i: number }) {
  return (
    <div style={{ display: "flex", gap: "1rem", padding: "1rem", background: W, border: `1px solid ${BD}`, borderRadius: 14 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FDEAEC", border: "1px solid #F5C5CB", display: "grid", placeItems: "center", flexShrink: 0, fontFamily: DF, fontSize: ".85rem", fontWeight: 700, color: R }}>
        {i + 1}
      </div>
      <p style={{ fontSize: ".875rem", color: I2, lineHeight: 1.65, fontFamily: BF }}>{tip}</p>
    </div>
  );
}

/* ── Hotel section ── */
function HotelSection() {
  const hotels = [
    { name: "Radisson Blu Temple Bay",  dist: "3 km",  stars: 5, tag: "Preferred rate" },
    { name: "GRT Temple Bay Resort",    dist: "2 km",  stars: 5, tag: "Beachfront"     },
    { name: "Sea Hawk Resort",          dist: "1.5 km",stars: 4, tag: "Budget-friendly"},
    { name: "The Ideal Beach Resort",   dist: "4 km",  stars: 4, tag: "Family suites"  },
  ];
  return (
    <div>
      <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: R, marginBottom: "1.25rem", fontFamily: BF }}>
        Recommended hotels
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "1rem" }}>
        {hotels.map(({ name, dist, stars, tag }) => (
          <div key={name} style={{ background: W, border: `1px solid ${BD}`, borderRadius: 16, padding: "1.25rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Hotel size={20} style={{ color: R }} />
              <span style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: R, background: "#FDEAEC", padding: "3px 10px", borderRadius: 999, fontFamily: BF }}>{tag}</span>
            </div>
            <p style={{ fontFamily: DF, fontSize: "1.0625rem", fontWeight: 700, color: I, lineHeight: 1.2 }}>{name}</p>
            <p style={{ fontSize: ".8rem", color: I3, fontFamily: BF }}>{dist} from venue · {"★".repeat(stars)}</p>
            <a href={`https://www.google.com/search?q=${encodeURIComponent(name + " Mahabalipuram")}`} target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: ".75rem", fontWeight: 700, color: R, fontFamily: BF, textDecoration: "none", marginTop: ".25rem" }}>
              Search <ArrowRight size={11} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN CLIENT COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export function TravelPageClient({ sections, essentials, faq, arrivalTips }: GuideProps) {
  return (
    <div style={{ background: W, color: I }}>
      <style>{`@media(max-width:768px){.tg2{grid-template-columns:1fr!important}}`}</style>

      {/* Hero */}
      <div style={{ background: R, padding: "5rem clamp(1.25rem,5vw,4rem) 4rem", position: "relative", overflow: "hidden" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg,#D94F62,#C0364A 30%,#B8820A 60%,#C0364A 85%,#D94F62)", position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ position: "absolute", top: "20%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,.07),transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "rgba(255,255,255,.65)", marginBottom: "1.25rem", fontFamily: BF }}>Getting here</p>
          <h1 style={{ fontFamily: DF, fontSize: "clamp(2.5rem,8vw,6rem)", fontWeight: 700, lineHeight: .90, color: W, marginBottom: "1.25rem" }}>
            Arrive rested,<br /><em>stay close.</em>
          </h1>
          <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,.70)", maxWidth: "36rem", fontFamily: BF, lineHeight: 1.72 }}>
            Transport, hotels, weather, contacts and city recommendations so the journey feels as polished as the celebration.
          </p>
        </div>
        <div style={{ height: 3, background: "linear-gradient(90deg,#D94F62,#C0364A 30%,#B8820A 60%,#C0364A 85%,#D94F62)", position: "absolute", bottom: 0, left: 0, right: 0 }} />
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem clamp(1.25rem,5vw,4rem) 6rem", display: "flex", flexDirection: "column", gap: "4rem" }}>

        {/* Weather + Transport */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }} className="tg2">
          <WeatherWidget />
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: R, fontFamily: BF }}>Transport options</p>
            {TRANSPORT.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: "flex", gap: "1rem", padding: "1.25rem", background: BG, border: `1px solid ${BD}`, borderRadius: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FDEAEC", border: "1px solid #F5C5CB", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon size={18} style={{ color: R }} />
                </div>
                <div>
                  <p style={{ fontFamily: DF, fontSize: "1rem", fontWeight: 700, color: I, marginBottom: ".25rem" }}>{title}</p>
                  <p style={{ fontSize: ".85rem", color: I2, lineHeight: 1.6, fontFamily: BF }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hotels */}
        <HotelSection />

        {/* Travel sections from DB/config */}
        {sections.length > 0 && (
          <div>
            <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: R, marginBottom: "1.25rem", fontFamily: BF }}>Travel notes</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
              {sections.map((s) => (
                <div key={s.id} style={{ background: W, border: `1px solid ${BD}`, borderRadius: 20, padding: "2rem", display: "flex", flexDirection: "column", gap: ".875rem" }}>
                  <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".24em", textTransform: "uppercase", color: R, fontFamily: BF }}>Note</p>
                  <h3 style={{ fontFamily: DF, fontSize: "1.25rem", fontWeight: 700, color: I }}>{s.title}</h3>
                  <p style={{ fontSize: ".875rem", color: I2, lineHeight: 1.7, fontFamily: BF, flex: 1 }}>{s.description}</p>
                  <a href={s.link} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: ".8rem", fontWeight: 700, color: R, fontFamily: BF }}>
                    Open <ArrowRight size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Arrival tips + FAQ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }} className="tg2">
          {arrivalTips.length > 0 && (
            <div>
              <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: R, marginBottom: "1.25rem", fontFamily: BF }}>Arrival tips</p>
              <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                {arrivalTips.map((tip, i) => <ArrivalTip key={tip} tip={tip} i={i} />)}
              </div>
            </div>
          )}
          {faq.length > 0 && (
            <div>
              <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: R, marginBottom: "1.25rem", fontFamily: BF }}>FAQ</p>
              <div style={{ background: W, border: `1px solid ${BD}`, borderRadius: 20, padding: "0 1.5rem" }}>
                {faq.map((f) => <FAQItem key={f.question} q={f.question} a={f.answer} />)}
              </div>
            </div>
          )}
        </div>

        {/* Help contacts */}
        <HelpContacts />

        {/* Nearby essentials */}
        {essentials.length > 0 && <NearbyEssentials items={essentials} />}
      </div>
    </div>
  );
}
