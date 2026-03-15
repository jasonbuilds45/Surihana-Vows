"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Heart, Mail, MapPin, Calendar } from "lucide-react";
import { weddingConfig } from "@/lib/config";
import { formatDate } from "@/utils/formatDate";

const SUPPRESS = ["/family", "/admin", "/vault/"];

const NAV_COLS = [
  { title: "Celebrate", links: [
    { label: "Our Story",   href: "/story" },
    { label: "Events",      href: "/events" },
    { label: "Gallery",     href: "/gallery" },
    { label: "Predictions", href: "/predictions" },
  ]},
  { title: "Connect", links: [
    { label: "RSVP",          href: "/rsvp" },
    { label: "Guestbook",     href: "/guestbook" },
    { label: "Travel",        href: "/travel" },
    { label: "Sample Invite", href: "/invite/john-family" },
  ]},
];

const bodyFont = "var(--font-body), -apple-system, system-ui, sans-serif";
const dispFont = "var(--font-display), Georgia, serif";

export function Footer() {
  const pathname = usePathname();
  if (SUPPRESS.some((p) => pathname === p || pathname.startsWith(p))) return null;

  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;

  return (
    <footer style={{ background: "#1A1012", position: "relative", overflow: "hidden" }}>
      {/* Rose stripe */}
      <div style={{ height: 3, background: "linear-gradient(90deg, #D94F62 0%, #C0364A 25%, #B8820A 50%, #C0364A 75%, #D94F62 100%)" }} />

      {/* Atmospheric glow */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: "30%", width: 500, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(192,54,74,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Big couple names */}
      <div style={{ padding: "5rem clamp(1.25rem,5vw,4rem) 0", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ paddingBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(245,197,203,0.55)", marginBottom: "1.5rem", fontFamily: bodyFont }}>
            ◆ {weddingConfig.celebrationTitle}
          </p>
          <h2 style={{ fontFamily: dispFont, fontSize: "clamp(3rem, 9vw, 7rem)", fontWeight: 700, lineHeight: 0.88, letterSpacing: "-0.03em", color: "#FFFFFF", marginBottom: "2rem" }}>
            {bf}&nbsp;&amp;&nbsp;{gf}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {[
              { Icon: Calendar, text: formatDate(weddingConfig.weddingDate) },
              { Icon: MapPin,   text: `${weddingConfig.venueName}, ${weddingConfig.venueCity}` },
            ].map(({ Icon, text }) => (
              <span key={text} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", fontSize: "0.82rem", color: "rgba(255,255,255,0.60)", fontFamily: bodyFont }}>
                <Icon size={13} style={{ color: "#F5C5CB" }} />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Links + CTA */}
      <div style={{ padding: "3rem clamp(1.25rem,5vw,4rem) 4rem", maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "3rem", alignItems: "start" }}>
        {NAV_COLS.map((col) => (
          <div key={col.title}>
            <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(245,197,203,0.45)", marginBottom: "1.25rem", fontFamily: bodyFont }}>
              {col.title}
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {col.links.map(({ label, href }) => (
                <Link key={href} href={href} style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.50)", textDecoration: "none", fontFamily: bodyFont, transition: "color 0.18s ease" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.92)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.50)")}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        ))}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Link href="/rsvp" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 999, background: "#C0364A", color: "#FFFFFF", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.01em", textDecoration: "none", fontFamily: bodyFont, boxShadow: "0 6px 24px rgba(192,54,74,0.30)", whiteSpace: "nowrap", transition: "all 0.18s ease" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#A82C3E"; (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#C0364A"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          >
            RSVP now <ArrowUpRight size={15} />
          </Link>
          <a href={`mailto:${weddingConfig.contactEmail}`} style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", textDecoration: "none", fontFamily: bodyFont, transition: "color 0.18s ease" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.82)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)")}
          >
            {weddingConfig.contactEmail}
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem clamp(1.25rem,5vw,4rem)", maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", fontFamily: bodyFont }}>
          © {new Date().getFullYear()} {weddingConfig.celebrationTitle}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Heart size={11} className="animate-heartbeat" style={{ color: "#C0364A", opacity: 0.60 }} />
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", fontFamily: bodyFont }}>Made with love</span>
        </div>
      </div>

      {/* Bottom rose stripe */}
      <div style={{ height: 3, background: "linear-gradient(90deg, #D94F62 0%, #C0364A 25%, #B8820A 50%, #C0364A 75%, #D94F62 100%)" }} />
    </footer>
  );
}

export default Footer;
