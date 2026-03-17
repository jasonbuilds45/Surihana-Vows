"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Heart, Mail, MapPin, Calendar } from "lucide-react";
import { weddingConfig } from "@/lib/config";
import { formatDate } from "@/utils/formatDate";

const SUPPRESS = ["/family", "/admin", "/vault/"];

const NAV_COLS = [
  {
    title: "Celebrate",
    links: [
      { label: "Our Story",   href: "/story" },
      { label: "Events",      href: "/events" },
      { label: "Gallery",     href: "/gallery" },
      { label: "Predictions", href: "/predictions" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "RSVP",          href: "/rsvp" },
      { label: "Guestbook",     href: "/guestbook" },
      { label: "Travel guide",  href: "/travel" },
      { label: "Sample invite", href: "/invite/john-family" },
    ],
  },
];

const DF = "'Cormorant Garamond', var(--font-display), Georgia, serif";
const BF = "'Manrope', var(--font-body), system-ui, sans-serif";

export function Footer() {
  const pathname = usePathname();
  if (SUPPRESS.some(p => pathname === p || pathname.startsWith(p))) return null;

  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;

  return (
    <footer style={{ background: "#0F0A0B", position: "relative", overflow: "hidden" }}>

      {/* Mesh gradient atmosphere */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 65% 50% at 15% 25%, rgba(190,45,69,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 55% 45% at 85% 75%, rgba(168,120,8,0.08) 0%, transparent 55%),
          radial-gradient(ellipse 80% 60% at 50% 120%, rgba(190,45,69,0.07) 0%, transparent 50%)
        `,
      }} />

      {/* Noise grain */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        opacity: 1,
      }} />

      {/* Top accent line */}
      <div style={{
        height: 2,
        background: "linear-gradient(90deg, transparent 0%, rgba(190,45,69,0.7) 20%, rgba(168,120,8,0.8) 50%, rgba(190,45,69,0.7) 80%, transparent 100%)",
      }} />

      {/* Hero name block */}
      <div style={{ padding: "5.5rem var(--pad-x, 5rem) 0", maxWidth: "var(--max-w, 1320px)", margin: "0 auto" }}>
        <div style={{ paddingBottom: "3rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>

          {/* Eyebrow */}
          <p style={{
            fontFamily: BF,
            fontSize: "0.54rem",
            fontWeight: 700,
            letterSpacing: "0.36em",
            textTransform: "uppercase",
            color: "rgba(240,190,198,0.45)",
            marginBottom: "1.75rem",
          }}>
            ✦&ensp;{weddingConfig.celebrationTitle}
          </p>

          {/* Giant couple names */}
          <h2 style={{
            fontFamily: DF,
            fontSize: "clamp(3.2rem, 10vw, 7.5rem)",
            fontWeight: 700,
            lineHeight: 0.87,
            letterSpacing: "-0.035em",
            color: "#FDFAF7",
            marginBottom: "2.25rem",
          }}>
            {bf}&ensp;<span style={{ color: "rgba(190,45,69,0.60)", fontStyle: "italic", fontWeight: 300, fontSize: "0.7em" }}>&amp;</span>&ensp;{gf}
          </h2>

          {/* Detail chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
            {[
              { Icon: Calendar, text: formatDate(weddingConfig.weddingDate) },
              { Icon: MapPin,   text: `${weddingConfig.venueName}, ${weddingConfig.venueCity}` },
            ].map(({ Icon, text }) => (
              <span key={text} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "7px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "0.80rem",
                color: "rgba(255,255,255,0.52)",
                fontFamily: BF,
                backdropFilter: "blur(8px)",
              }}>
                <Icon size={12} style={{ color: "rgba(240,190,198,0.60)", flexShrink: 0 }} />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Links + CTA grid */}
      <div style={{
        padding: "3.5rem var(--pad-x, 5rem) 4.5rem",
        maxWidth: "var(--max-w, 1320px)",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr auto",
        gap: "3rem",
        alignItems: "start",
      }}
        className="footer-grid"
      >
        {NAV_COLS.map(col => (
          <div key={col.title}>
            <p style={{
              fontFamily: BF,
              fontSize: "0.54rem",
              fontWeight: 700,
              letterSpacing: "0.30em",
              textTransform: "uppercase",
              color: "rgba(240,190,198,0.38)",
              marginBottom: "1.375rem",
            }}>
              {col.title}
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {col.links.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.42)",
                    textDecoration: "none",
                    fontFamily: BF,
                    fontWeight: 500,
                    transition: "color 0.18s ease",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.90)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.42)")}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        ))}

        {/* Surihana Vows brand blurb */}
        <div>
          <p style={{
            fontFamily: BF,
            fontSize: "0.54rem",
            fontWeight: 700,
            letterSpacing: "0.30em",
            textTransform: "uppercase",
            color: "rgba(240,190,198,0.38)",
            marginBottom: "1.375rem",
          }}>
            Platform
          </p>
          <p style={{
            fontFamily: BF,
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.28)",
            lineHeight: 1.75,
            maxWidth: 200,
          }}>
            A cinematic wedding experience platform.
            Built with love for every celebration.
          </p>
        </div>

        {/* RSVP CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", alignSelf: "start" }}>
          <Link
            href="/rsvp"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 26px",
              borderRadius: 999,
              background: "linear-gradient(135deg, rgba(212,72,96,0.90) 0%, rgba(190,45,69,0.95) 100%)",
              color: "#FFFFFF",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.01em",
              textDecoration: "none",
              fontFamily: BF,
              boxShadow: "0 6px 24px rgba(190,45,69,0.28), inset 0 1px 0 rgba(255,255,255,0.12)",
              whiteSpace: "nowrap",
              transition: "all 0.22s ease",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.02)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(190,45,69,0.40)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(190,45,69,0.28), inset 0 1px 0 rgba(255,255,255,0.12)";
            }}
          >
            RSVP now <ArrowUpRight size={14} />
          </Link>

          <a
            href={`mailto:${weddingConfig.contactEmail}`}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.28)",
              textDecoration: "none",
              fontFamily: BF,
              transition: "color 0.18s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.28)")}
          >
            <Mail size={12} />
            {weddingConfig.contactEmail}
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "1.375rem var(--pad-x, 5rem)",
        maxWidth: "var(--max-w, 1320px)",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}>
        <p style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.20)", fontFamily: BF }}>
          © {new Date().getFullYear()} {weddingConfig.celebrationTitle} · All rights reserved
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Heart
            size={10}
            style={{ color: "rgba(190,45,69,0.55)", animation: "heartbeat 2.2s ease-in-out infinite" }}
          />
          <span style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.20)", fontFamily: BF }}>
            Made with love
          </span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div style={{
        height: 2,
        background: "linear-gradient(90deg, transparent 0%, rgba(190,45,69,0.5) 20%, rgba(168,120,8,0.6) 50%, rgba(190,45,69,0.5) 80%, transparent 100%)",
      }} />

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
        @keyframes heartbeat {
          0%,100%{transform:scale(1)}
          14%{transform:scale(1.10)}
          28%{transform:scale(1)}
          42%{transform:scale(1.07)}
        }
      `}</style>
    </footer>
  );
}

export default Footer;
