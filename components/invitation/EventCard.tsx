import { CalendarDays, Clock3, MapPin, ExternalLink, Navigation } from "lucide-react";
import type { EventRow } from "@/lib/types";
import { formatDate, formatTime } from "@/utils/formatDate";
import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { CalendarButton } from "@/components/navigation/CalendarButton";

interface EventCardProps {
  event: EventRow & { description?: string | null; dressCode?: string | null };
}

// ── Per-venue visual DNA ───────────────────────────────────────────────────
const CHURCH = {
  timeLabel:    "3:00 PM",
  tagline:      "Sacred Ceremony",
  shortVenue:   "Divine Mercy Church",
  accentRgb:    "190,45,69",
  accent:       "#BE2D45",
  accentMid:    "#D44860",
  accentPale:   "#FBEBEE",
  accentBorder: "rgba(190,45,69,.18)",
  headerBg:     "linear-gradient(135deg, #1A0308 0%, #2E0811 40%, #1A050A 100%)",
  headerLine:   "rgba(190,45,69,.55)",
  // Cross SVG — used in the header
  symbol: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <line x1="14" y1="2"  x2="14" y2="26" stroke="rgba(240,190,198,.70)" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="4"  y1="9"  x2="24" y2="9"  stroke="rgba(240,190,198,.70)" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  // Arch motif rendered in card header
  motif: (
    <svg width="100%" height="56" viewBox="0 0 480 56" preserveAspectRatio="none" aria-hidden>
      <path d="M0 56 Q240 0 480 56" fill="none" stroke="rgba(240,190,198,.08)" strokeWidth="2"/>
      <path d="M60 56 Q240 12 420 56" fill="none" stroke="rgba(240,190,198,.05)" strokeWidth="1.2"/>
    </svg>
  ),
};

const BEACH = {
  timeLabel:    "6:00 PM",
  tagline:      "Shoreline Reception",
  shortVenue:   "Blue Bay Beach Resort",
  accentRgb:    "168,120,8",
  accent:       "#A87808",
  accentMid:    "#C9960A",
  accentPale:   "#FBF2DC",
  accentBorder: "rgba(168,120,8,.18)",
  headerBg:     "linear-gradient(135deg, #0A0800 0%, #1C1500 40%, #0D0B00 100%)",
  headerLine:   "rgba(168,120,8,.55)",
  // Wave SVG
  symbol: (
    <svg width="36" height="20" viewBox="0 0 36 20" fill="none" aria-hidden>
      <path d="M1 12 Q5 4 9 12 Q13 20 17 12 Q21 4 25 12 Q29 20 33 12" stroke="rgba(232,196,80,.65)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M1 17 Q5 9 9 17 Q13 25 17 17 Q21 9 25 17" stroke="rgba(232,196,80,.30)" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  // Wave fill motif
  motif: (
    <svg width="100%" height="56" viewBox="0 0 480 56" preserveAspectRatio="none" aria-hidden>
      <path d="M0 32 Q60 16 120 32 Q180 48 240 32 Q300 16 360 32 Q420 48 480 32 L480 56 L0 56Z" fill="rgba(232,196,80,.06)"/>
      <path d="M0 38 Q60 22 120 38 Q180 54 240 38 Q300 22 360 38 Q420 54 480 38" fill="none" stroke="rgba(232,196,80,.08)" strokeWidth="1.2"/>
    </svg>
  ),
};

export function EventCard({ event }: EventCardProps) {
  const isChurch = event.id === "church-wedding";
  const cfg = isChurch ? CHURCH : BEACH;

  return (
    <ScrollReveal variant="fade">
      <article style={{
        borderRadius: 20,
        overflow: "hidden",
        background: "#FFFFFF",
        border: `1px solid rgba(${cfg.accentRgb},.12)`,
        boxShadow: `
          0 1px 3px rgba(18,11,14,.05),
          0 4px 16px rgba(18,11,14,.07),
          0 16px 40px rgba(18,11,14,.08),
          0 0 0 0 rgba(${cfg.accentRgb},.0)
        `,
        transition: "box-shadow .28s ease, transform .28s ease",
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "translateY(-3px)";
          el.style.boxShadow = `0 2px 6px rgba(18,11,14,.06), 0 8px 24px rgba(18,11,14,.10), 0 24px 56px rgba(18,11,14,.10), 0 0 0 3px rgba(${cfg.accentRgb},.06)`;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = `0 1px 3px rgba(18,11,14,.05), 0 4px 16px rgba(18,11,14,.07), 0 16px 40px rgba(18,11,14,.08)`;
        }}
      >

        {/* ── DARK HEADER BAND ── */}
        <div style={{
          position: "relative", overflow: "hidden",
          background: cfg.headerBg,
          padding: "clamp(1.5rem,4vw,2.25rem) clamp(1.5rem,4vw,2.25rem) clamp(1.25rem,3vw,1.875rem)",
        }}>
          {/* Motif overlay */}
          <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
            {cfg.motif}
          </div>

          {/* Top accent hairline */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, transparent, ${cfg.accentMid} 30%, ${cfg.accent} 50%, ${cfg.accentMid} 70%, transparent)`,
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Tagline row */}
            <div style={{
              display: "flex", alignItems: "center", gap: "1rem",
              marginBottom: "clamp(1rem,2.5vw,1.5rem)",
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: `rgba(${cfg.accentRgb},.18)`,
                border: `1px solid rgba(${cfg.accentRgb},.28)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {cfg.symbol}
              </div>
              <div>
                <p style={{
                  fontFamily: "var(--font-body,'Manrope',sans-serif)",
                  fontSize: ".50rem", letterSpacing: ".38em",
                  textTransform: "uppercase", fontWeight: 700,
                  color: `rgba(${cfg.accentRgb},.70)`,
                  marginBottom: ".3rem",
                }}>
                  {cfg.tagline}
                </p>
                <h3 style={{
                  fontFamily: "var(--font-display,'Cormorant Garamond',Georgia,serif)",
                  fontSize: "clamp(1.5rem,4.5vw,2.1rem)",
                  fontWeight: 600, lineHeight: 1, letterSpacing: "-.01em",
                  color: "rgba(255,252,248,.94)",
                }}>
                  {event.event_name}
                </h3>
              </div>
            </div>

            {/* Time + short venue row */}
            <div style={{
              display: "flex", alignItems: "center",
              gap: "clamp(.75rem,2vw,1.25rem)",
              flexWrap: "wrap",
            }}>
              {/* Large time */}
              <span style={{
                fontFamily: "var(--font-display,'Cormorant Garamond',Georgia,serif)",
                fontSize: "clamp(2.8rem,8vw,5rem)",
                fontWeight: 300, lineHeight: 1, letterSpacing: "-.03em",
                color: "rgba(255,252,248,.92)",
              }}>
                {cfg.timeLabel}
              </span>

              {/* Divider */}
              <div style={{
                width: 1, height: "clamp(2.5rem,6vw,4rem)",
                background: `rgba(${cfg.accentRgb},.28)`, flexShrink: 0,
              }} />

              {/* Short venue */}
              <div>
                <p style={{
                  fontFamily: "var(--font-body,'Manrope',sans-serif)",
                  fontSize: ".5rem", letterSpacing: ".28em",
                  textTransform: "uppercase", fontWeight: 600,
                  color: `rgba(${cfg.accentRgb},.60)`,
                  marginBottom: ".25rem",
                }}>
                  Venue
                </p>
                <p style={{
                  fontFamily: "var(--font-display,'Cormorant Garamond',Georgia,serif)",
                  fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(.95rem,2.2vw,1.15rem)",
                  color: "rgba(255,252,248,.80)",
                  lineHeight: 1.3,
                }}>
                  {cfg.shortVenue}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ padding: "clamp(1.375rem,3.5vw,2rem)" }}>

          {/* Date chip + dress code */}
          <div style={{
            display: "flex", flexWrap: "wrap",
            alignItems: "flex-start", gap: ".625rem",
            marginBottom: "1.375rem",
          }}>
            {/* Date */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "6px 14px", borderRadius: 999,
              background: `rgba(${cfg.accentRgb},.06)`,
              border: `1px solid rgba(${cfg.accentRgb},.14)`,
            }}>
              <CalendarDays size={12} style={{ color: cfg.accent }} />
              <span style={{
                fontFamily: "var(--font-body,'Manrope',sans-serif)",
                fontSize: ".64rem", fontWeight: 600,
                color: "var(--color-text-primary)", letterSpacing: ".03em",
              }}>
                {formatDate(event.date)}
              </span>
            </div>

            {/* Full venue address */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "6px 14px", borderRadius: 999,
              background: "var(--color-surface-soft,#F8F3EE)",
              border: "1px solid var(--color-border)",
              flex: "1 1 180px",
            }}>
              <MapPin size={12} style={{ color: "var(--color-text-muted)" }} />
              <span style={{
                fontFamily: "var(--font-body,'Manrope',sans-serif)",
                fontSize: ".60rem", fontWeight: 500,
                color: "var(--color-text-secondary)", letterSpacing: ".02em",
              }}>
                {event.venue}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p style={{
              fontFamily: "var(--font-display,'Cormorant Garamond',Georgia,serif)",
              fontStyle: "italic",
              fontSize: "clamp(.95rem,2vw,1.06rem)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.88, marginBottom: "1.375rem",
            }}>
              {event.description}
            </p>
          )}

          {/* Dress code panel */}
          {event.dressCode && (
            <div style={{
              padding: "1rem 1.125rem",
              borderRadius: 12, marginBottom: "1.375rem",
              background: cfg.accentPale,
              border: `1px solid rgba(${cfg.accentRgb},.14)`,
              borderLeft: `3px solid ${cfg.accent}`,
            }}>
              <p style={{
                fontFamily: "var(--font-body,'Manrope',sans-serif)",
                fontSize: ".50rem", letterSpacing: ".28em",
                textTransform: "uppercase", color: cfg.accent,
                fontWeight: 700, marginBottom: ".5rem",
              }}>
                Dress Code
              </p>
              <p style={{
                fontFamily: "var(--font-display,'Cormorant Garamond',Georgia,serif)",
                fontStyle: "italic",
                fontSize: "clamp(.9rem,1.9vw,1.02rem)",
                color: "var(--color-text-secondary)", lineHeight: 1.75,
              }}>
                {event.dressCode}
              </p>
            </div>
          )}

          {/* Map embed */}
          {event.venue && (
            <div style={{
              borderRadius: 14, overflow: "hidden",
              border: `1px solid rgba(${cfg.accentRgb},.14)`,
              marginBottom: "1.375rem",
            }}>
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                padding: ".5rem 1rem",
                background: `rgba(${cfg.accentRgb},.05)`,
                borderBottom: `1px solid rgba(${cfg.accentRgb},.10)`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={11} style={{ color: cfg.accent }} />
                  <p style={{
                    fontFamily: "var(--font-body,'Manrope',sans-serif)",
                    fontSize: ".50rem", letterSpacing: ".22em",
                    textTransform: "uppercase",
                    color: `rgba(${cfg.accentRgb},.65)`, fontWeight: 600,
                  }}>
                    {cfg.shortVenue}
                  </p>
                </div>
                {event.map_link && (
                  <a href={event.map_link} target="_blank" rel="noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontFamily: "var(--font-body,'Manrope',sans-serif)",
                      fontSize: ".50rem", letterSpacing: ".20em",
                      textTransform: "uppercase", color: cfg.accent,
                      fontWeight: 600, textDecoration: "none",
                    }}>
                    Open <ExternalLink size={9} />
                  </a>
                )}
              </div>
              <iframe
                style={{ width: "100%", height: 188, border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&query=${encodeURIComponent(event.venue)}`}
                title={`Map of ${event.venue}`}
              />
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".625rem", alignItems: "center" }}>
            {event.map_link && (
              <a href={event.map_link} target="_blank" rel="noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "10px 22px", borderRadius: 999,
                  background: cfg.accent, color: "#fff",
                  fontFamily: "var(--font-body,'Manrope',sans-serif)",
                  fontSize: ".62rem", fontWeight: 600,
                  letterSpacing: ".18em", textTransform: "uppercase",
                  textDecoration: "none",
                  boxShadow: `0 6px 20px rgba(${cfg.accentRgb},.28), 0 2px 6px rgba(0,0,0,.10)`,
                  transition: "filter .18s ease, transform .18s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1.08)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
              >
                <Navigation size={12} />
                Get Directions
              </a>
            )}
            <CalendarButton
              date={event.date}
              time={event.time}
              description={event.description ?? ""}
              title={event.event_name}
              venue={event.venue}
            />
          </div>

        </div>

        {/* Bottom accent stripe */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, transparent, rgba(${cfg.accentRgb},.40) 30%, rgba(${cfg.accentRgb},.60) 50%, rgba(${cfg.accentRgb},.40) 70%, transparent)`,
        }} />

      </article>
    </ScrollReveal>
  );
}

export default EventCard;
