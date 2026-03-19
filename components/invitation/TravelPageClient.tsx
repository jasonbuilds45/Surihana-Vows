"use client";

/**
 * TravelPageClient — v3
 *
 * Design: "A letter from the coast"
 * Light theme, editorially rich, fully mobile-optimised.
 *
 * Hero: full-bleed boarding-pass style with large kinetic type,
 *       decorative ink flourishes, and a venue timeline strip.
 * Layout: single-column on mobile, adaptive grid on desktop.
 * Interaction: soft lift on hover (desktop only), accessible accordion.
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
import { weddingConfig } from "@/lib/config";
import { formatDate, formatTime } from "@/utils/formatDate";

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

// ── Design tokens (local) ────────────────────────────────────────────────────
const DF   = "var(--font-display),'Cormorant Garamond',Georgia,serif";
const BF   = "var(--font-body),'Manrope',system-ui,sans-serif";
const ROSE = "var(--rose)";
const GOLD = "var(--gold)";
const INK  = "var(--ink)";

// ── Hover lift (desktop only) ────────────────────────────────────────────────
function lift(el: HTMLElement, on: boolean) {
  if (window.matchMedia("(hover:hover)").matches) {
    el.style.transform  = on ? "translateY(-3px)" : "";
    el.style.boxShadow  = on ? "var(--sh-lg)" : "";
  }
}

// ── Eyebrow label ────────────────────────────────────────────────────────────
function Eyebrow({ children, gold, center }: { children: React.ReactNode; gold?: boolean; center?: boolean }) {
  return (
    <p style={{
      fontFamily: BF, fontSize: ".52rem", letterSpacing: ".44em",
      textTransform: "uppercase", color: gold ? GOLD : ROSE,
      fontWeight: 700, marginBottom: ".5rem",
      textAlign: center ? "center" : undefined,
    }}>
      {children}
    </p>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SH({ eyebrow, title, sub, gold, center }: {
  eyebrow: string; title: string; sub?: string; gold?: boolean; center?: boolean;
}) {
  return (
    <div style={{ marginBottom: "2rem", textAlign: center ? "center" : undefined }}>
      <Eyebrow gold={gold} center={center}>{eyebrow}</Eyebrow>
      <h2 style={{
        fontFamily: DF, fontWeight: 300,
        fontSize: "clamp(1.75rem,4vw,2.75rem)",
        color: INK, lineHeight: 1.05, letterSpacing: "-.025em",
      }}>
        {title}
      </h2>
      {sub && (
        <p style={{
          fontFamily: BF, fontSize: ".88rem", color: "var(--ink-3)",
          lineHeight: 1.72, maxWidth: "38rem", marginTop: ".625rem",
          marginLeft: center ? "auto" : undefined,
          marginRight: center ? "auto" : undefined,
        }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Glass card wrapper ───────────────────────────────────────────────────────
function GCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,.82)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,.75)",
      borderRadius: "var(--r-xl)",
      boxShadow: "var(--sh-sm)",
      backgroundImage: "var(--noise),linear-gradient(rgba(255,255,255,.82),rgba(255,255,255,.82))",
      transition: "transform .2s var(--expo),box-shadow .2s var(--smooth)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── ✦ Divider ─────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem",
      margin: "clamp(3rem,6vh,4.5rem) 0" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right,transparent,var(--rose-mid))" }} />
      <span style={{ fontFamily: DF, fontSize: "1rem", color: ROSE }}>✦</span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left,transparent,var(--rose-mid))" }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HERO
// Two-zone layout: left = editorial headline block, right = venue + nav panel
// Light parchment background with warm radial blooms. No dark sections.
// ════════════════════════════════════════════════════════════════════════════
function Hero() {
  return (
    <>
      <style>{`
        @keyframes h-rise { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes h-fade { from{opacity:0} to{opacity:1} }
        @keyframes h-line { from{transform:scaleX(0)} to{transform:scaleX(1)} }

        .h-0{opacity:0;animation:h-rise .80s .05s cubic-bezier(.16,1,.3,1) forwards}
        .h-1{opacity:0;animation:h-rise .85s .18s cubic-bezier(.16,1,.3,1) forwards}
        .h-2{opacity:0;animation:h-rise .80s .30s cubic-bezier(.16,1,.3,1) forwards}
        .h-3{opacity:0;animation:h-rise .75s .44s cubic-bezier(.16,1,.3,1) forwards}
        .h-4{opacity:0;animation:h-fade .70s .60s ease forwards}
        .h-rule{
          opacity:0;transform-origin:left;
          animation:h-line .75s .90s ease forwards;
        }

        /* Right panel venue rows */
        .h-venue-row{
          display:flex;align-items:center;gap:1rem;
          padding:.875rem 1.125rem;
          border-radius:14px;
          transition:background .18s;
        }
        .h-venue-row:hover{ background:rgba(255,255,255,.65); }

        /* Anchor nav strip */
        .h-nav-link{
          display:inline-flex;align-items:center;gap:5px;
          padding:.4rem .875rem;border-radius:999px;
          font-family:var(--font-body),'Manrope',sans-serif;
          font-size:.60rem;font-weight:600;letter-spacing:.08em;
          color:var(--ink-3);text-decoration:none;
          border:1px solid transparent;
          transition:color .16s,border-color .16s,background .16s;
          white-space:nowrap;
        }
        .h-nav-link:hover{
          color:var(--rose);
          border-color:var(--rose-mid);
          background:var(--rose-pale);
        }

        /* Two-column layout — stacks on mobile */
        .h-layout{
          display:grid;
          grid-template-columns:1fr auto;
          gap:clamp(2rem,5vw,5rem);
          align-items:center;
        }
        @media(max-width:720px){
          .h-layout{ grid-template-columns:1fr!important; gap:2rem!important; }
          .h-right{ border-left:none!important; padding-left:0!important; }
        }
      `}</style>

      {/* Outer wrapper — warm parchment, not .page-hero generic */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(158deg,#FEF9F4 0%,#FAF3EA 55%,#FEF9F4 100%)",
        borderBottom: "1px solid rgba(190,45,69,.09)",
      }}>

        {/* Ambient background blooms */}
        <div aria-hidden style={{ position:"absolute",inset:0,pointerEvents:"none",
          background:`
            radial-gradient(ellipse 55% 65% at 100% 0%,   rgba(190,45,69,.065) 0%,transparent 60%),
            radial-gradient(ellipse 40% 50% at 0%   100%, rgba(168,120,8,.050) 0%,transparent 55%)
          ` }} />

        {/* Top accent rule */}
        <div aria-hidden style={{ position:"absolute",top:0,left:0,right:0,height:2,
          background:"linear-gradient(90deg,transparent,var(--rose-mid) 25%,var(--rose) 50%,var(--rose-mid) 75%,transparent)" }} />

        {/* Content — top padding accounts for the 68px fixed navbar */}
        <div style={{
          maxWidth: "var(--max-w)", margin: "0 auto",
          padding: "clamp(5rem,10vh,7rem) var(--pad-x) clamp(3rem,7vh,5rem)",
          position: "relative", zIndex: 1,
        }}>
          <div className="h-layout">

            {/* ── LEFT: Headline block ──────────────────────────────────── */}
            <div style={{ minWidth: 0 }}>

              {/* Eyebrow */}
              <div className="h-0" style={{ display:"flex",alignItems:"center",
                gap:10, marginBottom:"1.5rem" }}>
                <div style={{ width:20,height:1,
                  background:"linear-gradient(to right,var(--rose),transparent)" }} />
                <span style={{ fontFamily:BF,fontSize:".44rem",letterSpacing:".50em",
                  textTransform:"uppercase",color:ROSE,fontWeight:700 }}>
                  Marion &amp; Livingston &nbsp;&middot;&nbsp; 20 May 2026
                </span>
              </div>

              {/* Headline */}
              <h1 className="h-1" style={{
                fontFamily: DF, fontWeight: 300, margin: 0,
                fontSize: "clamp(3.25rem,9vw,7rem)",
                lineHeight: .86, letterSpacing: "-.04em", color: INK,
              }}>
                Getting
              </h1>
              <h1 className="h-1" style={{
                fontFamily: DF, fontWeight: 300, fontStyle: "italic", margin: 0,
                fontSize: "clamp(3.25rem,9vw,7rem)",
                lineHeight: .88, letterSpacing: "-.04em", color: ROSE,
                marginBottom: "clamp(1rem,3vh,1.75rem)",
              }}>
                there.
              </h1>

              {/* Animated hairline */}
              <div className="h-rule" style={{
                height:1,width:"min(80px,18%)",
                background:"linear-gradient(to right,var(--rose),var(--rose-mid),transparent)",
                marginBottom:"1.375rem",
              }} />

              {/* Subtitle */}
              <p className="h-2" style={{
                fontFamily: DF, fontStyle: "italic",
                fontSize: "clamp(.95rem,1.6vw,1.125rem)",
                color: "var(--ink-3)", lineHeight: 1.82,
                maxWidth: "30rem", marginBottom: "2.25rem",
              }}>
                Two beautiful venues. One coastal road between them.
                Everything you need to arrive rested and ready.
              </p>

              {/* Page nav strip */}
              <div className="h-4" style={{ display:"flex",flexWrap:"wrap",gap:".375rem" }}>
                <span style={{ fontFamily:BF,fontSize:".44rem",letterSpacing:".32em",
                  textTransform:"uppercase",color:"var(--ink-4)",fontWeight:600,
                  alignSelf:"center",paddingRight:".25rem" }}>Jump to</span>
                {[
                  { label:"Getting here", href:"#transport" },
                  { label:"Hotels",       href:"#hotels"    },
                  { label:"Dress code",   href:"#dresscode" },
                  { label:"FAQ",          href:"#faq"       },
                  { label:"Help",         href:"#help"      },
                ].map(({ label, href }) => (
                  <a key={href} href={href} className="h-nav-link">{label}</a>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Venue + details panel ─────────────────────────── */}
            <div className="h-right" style={{
              minWidth: "clamp(220px,28vw,320px)",
              borderLeft: "1px solid rgba(190,45,69,.10)",
              paddingLeft: "clamp(1.5rem,3vw,3rem)",
            }}>

              {/* Panel label */}
              <p className="h-3" style={{ fontFamily:BF,fontSize:".44rem",letterSpacing:".38em",
                textTransform:"uppercase",color:"var(--ink-4)",fontWeight:600,
                marginBottom:"1rem" }}>
                The day
              </p>

              {/* Venue rows — rose then gold */}
              <div className="h-3" style={{ display:"flex",flexDirection:"column",gap:".5rem",
                marginBottom:"1.5rem" }}>

                {/* Church */}
                <a href="https://share.google/SCdoX1GZAvGSlOIrQ"
                  target="_blank" rel="noreferrer"
                  className="h-venue-row"
                  style={{ textDecoration:"none",
                    background:"var(--rose-pale)",
                    border:"1px solid var(--rose-mid)" }}>
                  {/* Time badge */}
                  <div style={{ flexShrink:0,
                    width:48,height:48,borderRadius:12,
                    background:ROSE,
                    display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",
                    boxShadow:"0 3px 10px rgba(190,45,69,.28)" }}>
                    <span style={{ fontFamily:BF,fontSize:".70rem",fontWeight:800,
                      color:"#fff",lineHeight:1 }}>3</span>
                    <span style={{ fontFamily:BF,fontSize:".42rem",fontWeight:600,
                      color:"rgba(255,255,255,.75)",letterSpacing:".06em" }}>PM</span>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontFamily:DF,fontSize:"1rem",fontWeight:600,
                      color:INK,lineHeight:1.15,marginBottom:".15rem" }}>
                      Divine Mercy Church
                    </p>
                    <p style={{ fontFamily:BF,fontSize:".68rem",
                      color:"var(--ink-3)",overflow:"hidden",
                      textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                      Kelambakkam, Chennai
                    </p>
                  </div>
                  <Navigation size={13} style={{ color:ROSE,flexShrink:0,opacity:.6 }} />
                </a>

                {/* Resort */}
                <a href="https://maps.app.goo.gl/vu56aH1Jvp29gSuu7"
                  target="_blank" rel="noreferrer"
                  className="h-venue-row"
                  style={{ textDecoration:"none",
                    background:"var(--gold-pale)",
                    border:"1px solid rgba(168,120,8,.22)" }}>
                  <div style={{ flexShrink:0,
                    width:48,height:48,borderRadius:12,
                    background:GOLD,
                    display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",
                    boxShadow:"0 3px 10px rgba(168,120,8,.24)" }}>
                    <span style={{ fontFamily:BF,fontSize:".70rem",fontWeight:800,
                      color:"#fff",lineHeight:1 }}>6</span>
                    <span style={{ fontFamily:BF,fontSize:".42rem",fontWeight:600,
                      color:"rgba(255,255,255,.75)",letterSpacing:".06em" }}>PM</span>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontFamily:DF,fontSize:"1rem",fontWeight:600,
                      color:INK,lineHeight:1.15,marginBottom:".15rem" }}>
                      Blue Bay Beach Resort
                    </p>
                    <p style={{ fontFamily:BF,fontSize:".68rem",
                      color:"var(--ink-3)",overflow:"hidden",
                      textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                      Mahabalipuram, ECR
                    </p>
                  </div>
                  <Navigation size={13} style={{ color:GOLD,flexShrink:0,opacity:.6 }} />
                </a>
              </div>

              {/* Key facts */}
              <div className="h-4" style={{ display:"flex",flexDirection:"column",gap:".5rem" }}>
                {[
                  { label:"Between venues", value:"15 km · ECR"     },
                  { label:"From airport",   value:"50 – 60 km"     },
                  { label:"Date",           value:"Wed, 20 May 2026" },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display:"flex",alignItems:"baseline",
                    justifyContent:"space-between",gap:".75rem",
                    padding:".5rem 0",
                    borderBottom:"1px solid rgba(190,45,69,.07)",
                  }}>
                    <span style={{ fontFamily:BF,fontSize:".58rem",letterSpacing:".12em",
                      textTransform:"uppercase",color:"var(--ink-4)",fontWeight:600,
                      flexShrink:0 }}>{label}</span>
                    <span style={{ fontFamily:DF,fontSize:".9rem",
                      color:INK,fontWeight:600,textAlign:"right" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// JOURNEY MAP (route card)
// ════════════════════════════════════════════════════════════════════════════
function JourneyCard() {
  return (
    <div style={{
      borderRadius: "var(--r-xl)", overflow: "hidden",
      border: "1px solid var(--bdr-md)", boxShadow: "var(--sh-lg)",
    }}>
      {/* Dark header */}
      <div style={{
        background: "linear-gradient(150deg,#0F0A0B 0%,#1C1214 60%,#0F0A0B 100%)",
        padding: "2rem 2rem 0", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:2,
          background:"linear-gradient(90deg,transparent,var(--rose) 30%,var(--gold-l) 50%,var(--rose) 70%,transparent)" }} />
        <div aria-hidden style={{ position:"absolute",top:"-20%",right:"-5%",width:"45%",height:"150%",
          borderRadius:"50%",background:"radial-gradient(circle,rgba(190,45,69,.09) 0%,transparent 65%)",pointerEvents:"none" }} />

        <p style={{ fontFamily:BF,fontSize:".46rem",letterSpacing:".40em",textTransform:"uppercase",
          color:"rgba(240,190,198,.55)",fontWeight:700,marginBottom:"1.375rem",position:"relative",zIndex:1 }}>
          The route · 20 May 2026
        </p>

        {/* Two venues + road */}
        <div style={{ display:"flex",alignItems:"flex-end",gap:0,position:"relative",zIndex:1 }}>
          <div style={{ flex:1,paddingBottom:"1.75rem" }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,
              padding:"3px 10px",borderRadius:999,
              background:"rgba(190,45,69,.18)",border:"1px solid rgba(190,45,69,.35)",
              marginBottom:".75rem" }}>
              <div style={{ width:5,height:5,borderRadius:"50%",background:ROSE }} />
              <span style={{ fontFamily:BF,fontSize:".46rem",letterSpacing:".22em",
                textTransform:"uppercase",color:ROSE,fontWeight:700 }}>3:00 PM</span>
            </div>
            <h3 style={{ fontFamily:DF,fontSize:"clamp(1.1rem,2.5vw,1.5rem)",fontWeight:600,
              color:"#fff",lineHeight:1.1,marginBottom:".4rem" }}>
              Divine Mercy<br/>Church
            </h3>
            <p style={{ fontFamily:BF,fontSize:".72rem",color:"rgba(255,255,255,.42)" }}>
              Kelambakkam, Chennai
            </p>
          </div>

          {/* Road */}
          <div style={{ width:"clamp(70px,14%,130px)",display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:".5rem",paddingBottom:"1.75rem" }}>
            <div style={{ position:"relative",width:"100%",height:2 }}>
              <div style={{ position:"absolute",inset:0,
                background:"repeating-linear-gradient(90deg,rgba(255,255,255,.22) 0,rgba(255,255,255,.22) 7px,transparent 7px,transparent 14px)" }} />
              <div style={{ position:"absolute",right:-1,top:"50%",transform:"translateY(-50%)",
                width:0,height:0,borderTop:"4px solid transparent",borderBottom:"4px solid transparent",
                borderLeft:"6px solid rgba(255,255,255,.30)" }} />
            </div>
            <p style={{ fontFamily:BF,fontSize:".46rem",letterSpacing:".14em",textTransform:"uppercase",
              color:"rgba(255,255,255,.28)",textAlign:"center",lineHeight:1.4 }}>
              15 km
            </p>
          </div>

          <div style={{ flex:1,paddingBottom:"1.75rem",textAlign:"right" }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,
              padding:"3px 10px",borderRadius:999,
              background:"rgba(168,120,8,.20)",border:"1px solid rgba(168,120,8,.38)",
              marginBottom:".75rem" }}>
              <span style={{ fontFamily:BF,fontSize:".46rem",letterSpacing:".22em",
                textTransform:"uppercase",color:"var(--gold-l)",fontWeight:700 }}>6:00 PM</span>
              <div style={{ width:5,height:5,borderRadius:"50%",background:GOLD }} />
            </div>
            <h3 style={{ fontFamily:DF,fontSize:"clamp(1.1rem,2.5vw,1.5rem)",fontWeight:600,
              color:"#fff",lineHeight:1.1,marginBottom:".4rem" }}>
              Blue Bay<br/>Beach Resort
            </h3>
            <p style={{ fontFamily:BF,fontSize:".72rem",color:"rgba(255,255,255,.42)" }}>
              Mahabalipuram, ECR
            </p>
          </div>
        </div>
      </div>

      {/* Map links */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",background:"var(--bg-warm)" }}>
        {[
          { label:"Church directions",  href:"https://share.google/SCdoX1GZAvGSlOIrQ",     rose:true  },
          { label:"Resort directions",  href:"https://maps.app.goo.gl/vu56aH1Jvp29gSuu7", rose:false },
        ].map(({ label, href, rose },i) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" style={{
            display:"flex",alignItems:"center",justifyContent:"center",gap:6,
            padding:"1rem",borderTop:"1px solid var(--bdr)",
            borderRight: i===0 ? "1px solid var(--bdr)" : "none",
            fontFamily:BF,fontSize:".64rem",fontWeight:700,letterSpacing:".12em",
            textTransform:"uppercase",color:rose?ROSE:GOLD,textDecoration:"none",
            transition:"background .18s",
          }}
            onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=rose?"var(--rose-pale)":"var(--gold-pale)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background="transparent";}}
          >
            <Navigation size={11}/>{label}
          </a>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// WEATHER
// ════════════════════════════════════════════════════════════════════════════
const FORECAST = [
  { day:"Fri",hi:33,lo:26,Icon:Sun       },
  { day:"Sat",hi:32,lo:25,Icon:Cloud     },
  { day:"Sun",hi:34,lo:27,Icon:Sun       },
  { day:"Mon",hi:30,lo:24,Icon:CloudRain },
  { day:"Tue",hi:31,lo:25,Icon:Cloud     },
];

function WeatherCard() {
  return (
    <div style={{ borderRadius:"var(--r-xl)",overflow:"hidden",border:"1px solid var(--bdr)",boxShadow:"var(--sh-md)" }}>
      <div style={{
        background:"linear-gradient(140deg,#12080C 0%,#1E1218 60%,#12080C 100%)",
        padding:"1.75rem 1.75rem 1.25rem",position:"relative",overflow:"hidden",
      }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:2,
          background:"linear-gradient(90deg,transparent,var(--rose) 40%,var(--gold-l) 50%,var(--rose) 60%,transparent)" }} />
        <div aria-hidden style={{ position:"absolute",inset:0,
          background:"radial-gradient(ellipse 55% 70% at 80% 25%,rgba(190,45,69,.09) 0%,transparent 65%)",pointerEvents:"none" }} />
        <div style={{ position:"relative",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"1rem" }}>
          <div>
            <p style={{ fontFamily:BF,fontSize:".44rem",letterSpacing:".36em",textTransform:"uppercase",
              color:"rgba(240,190,198,.50)",fontWeight:700,marginBottom:".5rem" }}>
              Mahabalipuram · May
            </p>
            <div style={{ display:"flex",alignItems:"baseline",gap:".5rem",marginBottom:".2rem" }}>
              <span style={{ fontFamily:DF,fontSize:"clamp(2rem,5vw,2.75rem)",fontWeight:600,color:"#fff",lineHeight:1 }}>34°C</span>
              <span style={{ fontFamily:BF,fontSize:".75rem",color:"rgba(255,255,255,.35)" }}>/ 93°F</span>
            </div>
            <p style={{ fontFamily:BF,fontSize:".75rem",color:"rgba(255,255,255,.42)" }}>Hot · Coastal evening breeze</p>
          </div>
          <Sun size={36} style={{ color:"rgba(240,190,198,.35)",flexShrink:0 }} />
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:".5rem",
          marginTop:"1.125rem",paddingTop:"1rem",borderTop:"1px solid rgba(255,255,255,.07)" }}>
          {[
            { Icon:Thermometer,label:"Humidity",value:"75%" },
            { Icon:Wind,       label:"Wind",    value:"16 km/h" },
            { Icon:Cloud,      label:"UV",      value:"9 Very High" },
          ].map(({ Icon,label,value }) => (
            <div key={label} style={{ textAlign:"center" }}>
              <Icon size={10} style={{ margin:"0 auto .2rem",color:"rgba(240,190,198,.45)" }} />
              <p style={{ fontFamily:BF,fontSize:".42rem",letterSpacing:".2em",textTransform:"uppercase",
                color:"rgba(255,255,255,.28)",marginBottom:".1rem" }}>{label}</p>
              <p style={{ fontFamily:BF,fontSize:".7rem",fontWeight:700,color:"rgba(255,255,255,.72)" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-day */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",background:"var(--bg-warm)",borderBottom:"1px solid var(--bdr)" }}>
        {FORECAST.map(({ day,hi,lo,Icon }) => (
          <div key={day} style={{ textAlign:"center",padding:".75rem .25rem" }}>
            <p style={{ fontFamily:BF,fontSize:".48rem",letterSpacing:".14em",textTransform:"uppercase",
              color:"var(--ink-3)",marginBottom:".3rem" }}>{day}</p>
            <Icon size={14} style={{ margin:"0 auto .3rem",color:ROSE }} />
            <p style={{ fontFamily:BF,fontSize:".75rem",fontWeight:700,color:INK }}>{hi}°</p>
            <p style={{ fontFamily:BF,fontSize:".66rem",color:"var(--ink-4)" }}>{lo}°</p>
          </div>
        ))}
      </div>
      <div style={{ padding:".75rem 1.25rem",background:"var(--bg-linen)" }}>
        <p style={{ fontFamily:DF,fontStyle:"italic",fontSize:".875rem",color:"var(--ink-3)",lineHeight:1.6,margin:0 }}>
          May evenings at the coast cool down beautifully — bring a light layer after sunset.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TRANSPORT
// ════════════════════════════════════════════════════════════════════════════
const TRANSPORT = [
  { Icon:Plane,      rose:true,  title:"By air",   desc:"Chennai International (MAA) is 50–60 km away. Pre-book Ola Outstation or Uber Intercity for a smooth transfer." },
  { Icon:TrainFront, rose:false, title:"By train", desc:"Chennai Central or Egmore. Local trains reach Chengalpattu (~15 km from venue). An auto covers the last stretch." },
  { Icon:Bus,        rose:true,  title:"By bus",   desc:"SETC and private coaches run along East Coast Road (ECR). Nearest stop is ~500 m from the venue gate." },
  { Icon:Car,        rose:false, title:"By road",  desc:"Take ECR south from Chennai. GPS: Blue Bay Beach Resort, Mahabalipuram. A scenic coastal evening drive." },
];

function TransportCard({ Icon, title, desc, rose }: typeof TRANSPORT[0]) {
  const accent = rose ? ROSE : GOLD;
  const bg     = rose ? "var(--rose-pale)" : "var(--gold-pale)";
  const bd     = rose ? "var(--rose-mid)"  : "rgba(168,120,8,.30)";
  return (
    <GCard style={{ padding:"1.375rem 1.5rem",display:"flex",alignItems:"flex-start",gap:"1.125rem" }}
      {...{ onMouseEnter:(e:React.MouseEvent<HTMLDivElement>)=>lift(e.currentTarget,true),
            onMouseLeave:(e:React.MouseEvent<HTMLDivElement>)=>lift(e.currentTarget,false) }}>
      <div style={{ width:42,height:42,borderRadius:"var(--r-sm)",flexShrink:0,
        background:bg,border:`1px solid ${bd}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
        <Icon size={17} style={{ color:accent }} />
      </div>
      <div>
        <p style={{ fontFamily:DF,fontSize:"1rem",fontWeight:600,color:INK,marginBottom:".3rem" }}>{title}</p>
        <p style={{ fontFamily:BF,fontSize:".82rem",color:"var(--ink-3)",lineHeight:1.65 }}>{desc}</p>
      </div>
    </GCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HOTELS
// ════════════════════════════════════════════════════════════════════════════
const HOTELS = [
  { name:"Radisson Blu Temple Bay", dist:"3 km",   stars:5, tag:"Preferred",     rose:true  },
  { name:"GRT Temple Bay Resort",   dist:"2 km",   stars:5, tag:"Beachfront",    rose:false },
  { name:"Sea Hawk Resort",         dist:"1.5 km", stars:4, tag:"Mid-range",     rose:false },
  { name:"The Ideal Beach Resort",  dist:"4 km",   stars:4, tag:"Family suites", rose:false },
];

function HotelCard({ name, dist, stars, tag, rose }: typeof HOTELS[0]) {
  const accent  = rose ? ROSE : GOLD;
  const accentBg = rose ? "var(--rose-pale)" : "var(--gold-pale)";
  const accentBd = rose ? "var(--rose-mid)"  : "rgba(168,120,8,.28)";
  return (
    <a href={`https://www.google.com/search?q=${encodeURIComponent(name+" Mahabalipuram")}`}
      target="_blank" rel="noreferrer"
      style={{
        display:"flex",flexDirection:"column",gap:".875rem",padding:"1.375rem",
        background:"rgba(255,255,255,.82)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
        borderRadius:"var(--r-xl)",border:"1px solid rgba(255,255,255,.75)",
        boxShadow:"var(--sh-sm)",textDecoration:"none",
        backgroundImage:"var(--noise),linear-gradient(rgba(255,255,255,.82),rgba(255,255,255,.82))",
        transition:"transform .18s var(--expo),box-shadow .18s var(--smooth)",
      }}
      onMouseEnter={e=>{if(window.matchMedia("(hover:hover)").matches){const el=e.currentTarget as HTMLAnchorElement;el.style.transform="translateY(-3px)";el.style.boxShadow="var(--sh-lg)";}}}
      onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.transform="";el.style.boxShadow="var(--sh-sm)";}}>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:".5rem" }}>
        <div style={{ width:34,height:34,borderRadius:"var(--r-sm)",flexShrink:0,
          background:accentBg,border:`1px solid ${accentBd}`,
          display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Building2 size={14} style={{ color:accent }} />
        </div>
        <span style={{ fontFamily:BF,fontSize:".46rem",fontWeight:700,letterSpacing:".14em",
          textTransform:"uppercase",color:accent,background:accentBg,
          border:`1px solid ${accentBd}`,padding:"3px 9px",borderRadius:999,flexShrink:0 }}>
          {tag}
        </span>
      </div>
      <div>
        <p style={{ fontFamily:DF,fontSize:"1rem",fontWeight:600,color:INK,lineHeight:1.2,marginBottom:".25rem" }}>{name}</p>
        <p style={{ fontFamily:BF,fontSize:".7rem",color:"var(--ink-4)" }}>{dist} from venue</p>
        <p style={{ fontFamily:BF,fontSize:".75rem",color:GOLD,marginTop:".25rem" }}>{"★".repeat(stars)}</p>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:"auto" }}>
        <span style={{ fontFamily:BF,fontSize:".62rem",fontWeight:700,color:accent,letterSpacing:".06em" }}>Check availability</span>
        <ArrowUpRight size={10} style={{ color:accent }} />
      </div>
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DRESS CODE BANNER
// ════════════════════════════════════════════════════════════════════════════
const SWATCHES = [
  { label:"Ivory",     bg:"#F8F4EF" },
  { label:"Champagne", bg:"#F0D99A" },
  { label:"Soft gold", bg:"#D4A84B" },
  { label:"Sage",      bg:"#9AAF9B" },
  { label:"Dusty rose",bg:"#E8B4B8" },
];

function DressCodeCard() {
  return (
    <div style={{ borderRadius:"var(--r-xl)",overflow:"hidden",border:"1px solid var(--bdr)",boxShadow:"var(--sh-md)" }}>
      <div style={{
        background:"linear-gradient(140deg,#0F0A0B 0%,#1C1214 60%,#0F0A0B 100%)",
        padding:"1.75rem 2rem",position:"relative",overflow:"hidden",
      }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:2,
          background:"linear-gradient(90deg,transparent,var(--gold) 40%,var(--gold-l) 50%,var(--gold) 60%,transparent)" }} />
        <p style={{ fontFamily:BF,fontSize:".44rem",letterSpacing:".40em",textTransform:"uppercase",
          color:"rgba(232,196,80,.55)",fontWeight:700,marginBottom:".875rem" }}>
          Beach reception dress code
        </p>
        <h3 style={{ fontFamily:DF,fontStyle:"italic",fontWeight:300,
          fontSize:"clamp(1.375rem,3vw,2rem)",color:"#fff",lineHeight:1.1,marginBottom:".5rem" }}>
          Coastal elegance.
        </h3>
        <p style={{ fontFamily:BF,fontSize:".8rem",color:"rgba(255,255,255,.46)",lineHeight:1.6 }}>
          Whites, creams, champagnes, soft golds, and greens. Flowing fabrics welcome.
        </p>
      </div>
      <div style={{ display:"flex",background:"var(--bg-warm)",borderBottom:"1px solid var(--bdr)" }}>
        {SWATCHES.map(({ label, bg }, i) => (
          <div key={label} style={{ flex:1,display:"flex",flexDirection:"column",
            alignItems:"center",padding:"1rem .375rem .875rem",gap:".5rem",
            borderRight:i<SWATCHES.length-1?"1px solid var(--bdr)":"none" }}>
            <div style={{ width:32,height:32,borderRadius:"50%",background:bg,
              border:"2px solid rgba(255,255,255,.80)",boxShadow:"0 2px 6px rgba(15,10,11,.10)" }} />
            <p style={{ fontFamily:BF,fontSize:".46rem",textAlign:"center",
              color:"var(--ink-3)",lineHeight:1.3 }}>{label}</p>
          </div>
        ))}
      </div>
      <div style={{ padding:".75rem 1.375rem",background:"var(--bg-linen)" }}>
        <p style={{ fontFamily:DF,fontStyle:"italic",fontSize:".85rem",color:"var(--ink-3)",margin:0,lineHeight:1.6 }}>
          Wedges and block heels recommended — reception is on a beach lawn.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TRAVEL NOTES (DB)
// ════════════════════════════════════════════════════════════════════════════
function TravelNoteCard({ section }: { section: TravelSection }) {
  return (
    <GCard style={{ padding:"1.625rem",display:"flex",flexDirection:"column",gap:".875rem" }}
      {...{ onMouseEnter:(e:React.MouseEvent<HTMLDivElement>)=>lift(e.currentTarget,true),
            onMouseLeave:(e:React.MouseEvent<HTMLDivElement>)=>lift(e.currentTarget,false) }}>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:".5rem" }}>
        <Eyebrow>{section.category ?? "Travel note"}</Eyebrow>
        <div style={{ width:30,height:30,borderRadius:"var(--r-sm)",flexShrink:0,
          background:"var(--rose-pale)",border:"1px solid var(--rose-mid)",
          display:"flex",alignItems:"center",justifyContent:"center" }}>
          <MapPin size={13} style={{ color:ROSE }} />
        </div>
      </div>
      <h3 style={{ fontFamily:DF,fontSize:"1.15rem",fontWeight:600,color:INK,lineHeight:1.2 }}>{section.title}</h3>
      <p style={{ fontFamily:BF,fontSize:".84rem",color:"var(--ink-2)",lineHeight:1.72,flex:1 }}>{section.description}</p>
      <a href={section.link} target="_blank" rel="noreferrer"
        style={{ display:"inline-flex",alignItems:"center",gap:4,fontFamily:BF,
          fontSize:".68rem",fontWeight:700,color:ROSE,textDecoration:"none",letterSpacing:".06em" }}>
        Open in maps <ExternalLink size={10} />
      </a>
    </GCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ARRIVAL TIMELINE
// ════════════════════════════════════════════════════════════════════════════
function ArrivalTimeline({ tips }: { tips: string[] }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:0,position:"relative",paddingLeft:"2rem" }}>
      <div style={{ position:"absolute",left:".5625rem",top:9,bottom:9,width:1,
        background:`linear-gradient(to bottom,${ROSE} 0%,var(--rose-mid) 70%,transparent 100%)` }} />
      {tips.map((tip, i) => (
        <div key={i} style={{ display:"flex",gap:"1rem",paddingBottom:i<tips.length-1?"1.125rem":0 }}>
          <div style={{ position:"absolute",left:0,width:18,height:18,borderRadius:"50%",marginTop:1,flexShrink:0,zIndex:1,
            background:i===0?ROSE:"var(--bg-warm)",
            border:`2px solid ${i===0?ROSE:"var(--rose-mid)"}`,
            display:"flex",alignItems:"center",justifyContent:"center" }}>
            {i===0
              ? <div style={{ width:6,height:6,borderRadius:"50%",background:"#fff" }} />
              : <span style={{ fontFamily:BF,fontSize:".42rem",fontWeight:700,color:ROSE }}>{i+1}</span>
            }
          </div>
          <p style={{ fontFamily:BF,fontSize:".875rem",color:"var(--ink-2)",lineHeight:1.72 }}>{tip}</p>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FAQ ACCORDION
// ════════════════════════════════════════════════════════════════════════════
function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <GCard style={{ overflow:"hidden" }}>
      {items.map((item, i) => (
        <div key={i} style={{ borderBottom:i<items.length-1?"1px solid var(--bdr)":"none" }}>
          <button type="button" onClick={() => setOpen(open===i?null:i)}
            style={{ width:"100%",display:"flex",alignItems:"flex-start",justifyContent:"space-between",
              gap:"1rem",padding:"1.125rem 1.375rem",background:open===i?"var(--bg-warm)":"none",
              border:"none",cursor:"pointer",textAlign:"left",transition:"background .18s" }}
            onMouseEnter={e=>{if(open!==i)(e.currentTarget as HTMLButtonElement).style.background="var(--bg-linen)";}}
            onMouseLeave={e=>{if(open!==i)(e.currentTarget as HTMLButtonElement).style.background="none";}}>
            <span style={{ fontFamily:DF,fontSize:"1rem",fontWeight:600,color:INK,lineHeight:1.3,flex:1 }}>
              {item.question}
            </span>
            <div style={{ width:24,height:24,borderRadius:"50%",flexShrink:0,marginTop:2,
              background:open===i?ROSE:"var(--rose-pale)",border:"1px solid var(--rose-mid)",
              display:"flex",alignItems:"center",justifyContent:"center",transition:"background .18s" }}>
              <ChevronDown size={12} style={{ color:open===i?"#fff":ROSE,
                transition:"transform .22s var(--expo)",
                transform:open===i?"rotate(180deg)":"none" }} />
            </div>
          </button>
          {open===i && (
            <div style={{ padding:"0 1.375rem 1.125rem",background:"var(--bg-warm)" }}>
              <p style={{ fontFamily:BF,fontSize:".875rem",color:"var(--ink-2)",lineHeight:1.72 }}>
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </GCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONTACT TILES
// ════════════════════════════════════════════════════════════════════════════
const CONTACTS = [
  { Icon:Phone,       label:"Wedding coordination", value:"+91 98765 43210",    href:"tel:+919876543210",           note:"8 AM – 10 PM"         },
  { Icon:MapPin,      label:"Venue",                value:"Blue Bay Resort",     href:"tel:+914427473000",           note:"+91 44 2747 3000"     },
  { Icon:HeartPulse,  label:"Medical emergency",    value:"108 Ambulance",       href:"tel:108",                    note:"24 × 7"               },
  { Icon:ShieldCheck, label:"Police",               value:"100",                 href:"tel:100",                    note:"Mahabalipuram station" },
  { Icon:Car,         label:"Cab / rideshare",      value:"Ola · Uber",          href:"https://www.olacabs.com",    note:"Available locally"    },
  { Icon:Phone,       label:"Family helpline",      value:"jason454a@gmail.com", href:"mailto:jason454a@gmail.com", note:"Any assistance"       },
];

function ContactTile({ Icon, label, value, href, note }: typeof CONTACTS[0]) {
  return (
    <a href={href} target={href.startsWith("http")?"_blank":undefined} rel="noreferrer"
      style={{ display:"flex",alignItems:"center",gap:".875rem",
        padding:"1rem 1.125rem",
        background:"rgba(255,255,255,.82)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",
        borderRadius:"var(--r-lg)",border:"1px solid rgba(255,255,255,.72)",
        boxShadow:"var(--sh-xs)",textDecoration:"none",
        backgroundImage:"var(--noise),linear-gradient(rgba(255,255,255,.82),rgba(255,255,255,.82))",
        transition:"transform .18s var(--expo),box-shadow .18s var(--smooth)",
      }}
      onMouseEnter={e=>{if(window.matchMedia("(hover:hover)").matches){const el=e.currentTarget as HTMLAnchorElement;el.style.transform="translateY(-2px)";el.style.boxShadow="var(--sh-sm)";}}}
      onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.transform="";el.style.boxShadow="var(--sh-xs)";}}>
      <div style={{ width:38,height:38,borderRadius:"var(--r-sm)",flexShrink:0,
        background:"var(--rose-pale)",border:"1px solid var(--rose-mid)",
        display:"flex",alignItems:"center",justifyContent:"center" }}>
        <Icon size={15} style={{ color:ROSE }} />
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontFamily:BF,fontSize:".46rem",letterSpacing:".20em",textTransform:"uppercase",
          color:"var(--ink-4)",fontWeight:600,marginBottom:".15rem" }}>{label}</p>
        <p style={{ fontFamily:DF,fontSize:".95rem",fontWeight:600,color:INK,lineHeight:1.1,
          marginBottom:".15rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{value}</p>
        <p style={{ fontFamily:BF,fontSize:".68rem",color:"var(--ink-3)" }}>{note}</p>
      </div>
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════
export function TravelPageClient({ sections, essentials, faq, arrivalTips }: GuideProps) {
  return (
    <div style={{ background:"var(--bg)",color:INK,minHeight:"100vh" }}>
      <style>{`
        .tr-g2  { display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start }
        .tr-g3  { display:grid;grid-template-columns:repeat(3,1fr);gap:1rem }
        .tr-g4  { display:grid;grid-template-columns:repeat(4,1fr);gap:1rem }
        .tr-ga  { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.125rem }
        .tr-gac { display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem }
        .tr-h   { display:grid;grid-template-columns:1fr 1fr;gap:1rem }

        @media(max-width:860px){
          .tr-g2{grid-template-columns:1fr!important;gap:1.5rem!important}
        }
        @media(max-width:600px){
          .tr-g3,.tr-g4,.tr-h{grid-template-columns:1fr 1fr!important}
          .tr-ga,.tr-gac{grid-template-columns:1fr!important}
        }
        @media(max-width:400px){
          .tr-g3,.tr-g4,.tr-h{grid-template-columns:1fr!important}
        }

        [id]{scroll-margin-top:5rem}
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:"var(--max-w)",margin:"0 auto",
        padding:"clamp(3rem,6vh,5rem) var(--pad-x) clamp(4rem,8vh,6rem)" }}>

        {/* 1 ── Route + Weather ── */}
        <section>
          <SH eyebrow="The route" title="Church to coast"
            sub="Two venues, 15 km apart on the East Coast Road. The evening drive along ECR is one of Chennai's most scenic stretches." />
          <div className="tr-g2">
            <JourneyCard />
            <WeatherCard />
          </div>
        </section>

        <Divider />

        {/* 2 ── Getting here ── */}
        <section id="transport">
          <SH eyebrow="Getting here" title="How to arrive"
            sub="Chennai is well connected by air, rail, and road. All routes converge on East Coast Road." />
          <div className="tr-g2">
            {TRANSPORT.map(t => <TransportCard key={t.title} {...t} />)}
          </div>
        </section>

        <Divider />

        {/* 3 ── Hotels + Dress code ── */}
        <section id="hotels">
          <div className="tr-g2" style={{ alignItems:"start" }}>
            <div id="dresscode">
              <SH eyebrow="Where to stay" title="Hotels nearby" />
              <div className="tr-h">
                {HOTELS.map(h => <HotelCard key={h.name} {...h} />)}
              </div>
            </div>
            <div>
              <SH eyebrow="What to wear" title="Dress code" gold />
              <DressCodeCard />
            </div>
          </div>
        </section>

        {/* DB travel notes */}
        {sections.length > 0 && (
          <>
            <Divider />
            <section>
              <SH eyebrow="From the couple" title="Things to know" />
              <div className="tr-ga">
                {sections.map(s => <TravelNoteCard key={s.id} section={s} />)}
              </div>
            </section>
          </>
        )}

        <Divider />

        {/* 4 ── Arrival tips + FAQ ── */}
        <section id="faq">
          <div className="tr-g2">
            {arrivalTips.length > 0 && (
              <div>
                <SH eyebrow="On arrival" title="Arrival tips" />
                <ArrivalTimeline tips={arrivalTips} />
              </div>
            )}
            {faq.length > 0 && (
              <div>
                <SH eyebrow="Questions" title="FAQ" />
                <FAQ items={faq} />
              </div>
            )}
          </div>
        </section>

        <Divider />

        {/* 5 ── Contacts ── */}
        <section id="help">
          <SH eyebrow="Help &amp; emergency" title="We're here for you"
            sub="Save these before your journey. The family helpline is available throughout the celebration day." />
          <div className="tr-gac">
            {CONTACTS.map(c => <ContactTile key={c.label} {...c} />)}
          </div>
        </section>

        {/* 6 ── Nearby essentials ── */}
        {essentials.length > 0 && (
          <>
            <Divider />
            <section>
              <SH eyebrow="Near the venue" title="Nearby essentials"
                sub="Hospital, pharmacy, police, and transport links within a short distance of both venues." />
              <NearbyEssentials items={essentials} />
            </section>
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop:"1px solid var(--bdr)",padding:"1.75rem var(--pad-x)",
        background:"var(--bg-warm)",display:"flex",flexWrap:"wrap",
        alignItems:"center",justifyContent:"space-between",gap:"1rem" }}>
        <p style={{ fontFamily:DF,fontStyle:"italic",fontSize:".9rem",color:"var(--ink-3)" }}>
          Questions?{" "}
          <a href="mailto:jason454a@gmail.com"
            style={{ color:ROSE,fontWeight:600,textDecoration:"none" }}>
            jason454a@gmail.com
          </a>
        </p>
        <span style={{ fontFamily:BF,fontSize:".44rem",letterSpacing:".36em",
          textTransform:"uppercase",color:"var(--ink-4)",fontWeight:600 }}>
          Marion &amp; Livingston · 20 · 05 · 2026
        </span>
      </div>
    </div>
  );
}
