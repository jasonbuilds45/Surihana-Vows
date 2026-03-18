import { CalendarDays, Clock3, MapPin, ExternalLink, Navigation } from "lucide-react";
import type { EventRow } from "@/lib/types";
import { formatDate, formatTime } from "@/utils/formatDate";
import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { CalendarButton } from "@/components/navigation/CalendarButton";

interface EventCardProps {
  event: EventRow & { description?: string | null; dressCode?: string | null };
}

// ── Venue identity config ──────────────────────────────────────────────────
// Keyed by event id from events.json so each venue gets its own visual DNA.
const VENUE_CONFIG: Record<string, {
  label:    string;
  time:     string;
  accent:   string;
  accentBg: string;
  accentBd: string;
  muted:    string;
  icon:     React.ReactNode;
  motif:    React.ReactNode;
}> = {
  "church-wedding": {
    label:    "Holy Matrimony",
    time:     "3:00 PM",
    accent:   "#BE2D45",
    accentBg: "rgba(190,45,69,.06)",
    accentBd: "rgba(190,45,69,.16)",
    muted:    "rgba(190,45,69,.55)",
    // Cross SVG mark
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <line x1="9" y1="1" x2="9" y2="17" stroke="#BE2D45" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="3" y1="6" x2="15" y2="6" stroke="#BE2D45" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    // Subtle arch motif — top of card
    motif: (
      <svg width="100%" height="48" viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden>
        <path d="M0 48 Q200 0 400 48" fill="none" stroke="rgba(190,45,69,.08)" strokeWidth="1.5" />
        <path d="M40 48 Q200 8 360 48" fill="none" stroke="rgba(190,45,69,.05)" strokeWidth="1" />
      </svg>
    ),
  },
  "beach-reception": {
    label:    "Shoreline Reception",
    time:     "6:00 PM",
    accent:   "#A87808",
    accentBg: "rgba(168,120,8,.06)",
    accentBd: "rgba(168,120,8,.16)",
    muted:    "rgba(168,120,8,.55)",
    // Wave SVG mark
    icon: (
      <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden>
        <path d="M1 7 Q4 2 7 7 Q10 12 13 7 Q16 2 19 7 Q20.5 9.5 22 7" stroke="#A87808" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M1 11 Q4 6 7 11 Q10 16 13 11 Q16 6 19 11" stroke="rgba(168,120,8,.35)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      </svg>
    ),
    // Wave motif — bottom of card
    motif: (
      <svg width="100%" height="48" viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden>
        <path d="M0 24 Q50 8 100 24 Q150 40 200 24 Q250 8 300 24 Q350 40 400 24 L400 48 L0 48Z" fill="rgba(168,120,8,.04)" />
        <path d="M0 30 Q50 14 100 30 Q150 46 200 30 Q250 14 300 30 Q350 46 400 30" fill="none" stroke="rgba(168,120,8,.08)" strokeWidth="1" />
      </svg>
    ),
  },
};

// Fallback for unknown events
const DEFAULT_CONFIG = {
  label:    "Event",
  time:     "",
  accent:   "var(--color-accent)",
  accentBg: "rgba(190,45,69,.06)",
  accentBd: "rgba(190,45,69,.14)",
  muted:    "rgba(190,45,69,.50)",
  icon:     <CalendarDays size={16} />,
  motif:    null,
};

export function EventCard({ event }: EventCardProps) {
  const cfg = VENUE_CONFIG[event.id] ?? DEFAULT_CONFIG;
  const isBeach = event.id === "beach-reception";
  const isChurch = event.id === "church-wedding";

  return (
    <ScrollReveal variant="fade">
      <article
        style={{
          position: "relative",
          borderRadius: 24,
          overflow: "hidden",
          background: "#FFFFFF",
          border: "1px solid var(--color-border)",
          boxShadow: `
            0 1px 2px rgba(18,11,14,.04),
            0 4px 12px rgba(18,11,14,.06),
            0 12px 32px rgba(18,11,14,.07),
            0 2px 16px ${cfg.accentBg}
          `,
          transition: "box-shadow .3s ease, transform .3s ease",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow = `
            0 2px 4px rgba(18,11,14,.05),
            0 8px 20px rgba(18,11,14,.09),
            0 20px 48px rgba(18,11,14,.10),
            0 4px 24px ${cfg.accentBg}
          `;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = `
            0 1px 2px rgba(18,11,14,.04),
            0 4px 12px rgba(18,11,14,.06),
            0 12px 32px rgba(18,11,14,.07),
            0 2px 16px ${cfg.accentBg}
          `;
        }}
      >
        {/* Top accent stripe — thicker, gradient */}
        <div style={{
          height: 4,
          background: isChurch
            ? "linear-gradient(90deg, transparent, #D44860 20%, #BE2D45 50%, #D44860 80%, transparent)"
            : "linear-gradient(90deg, transparent, #C9960A 20%, #A87808 50%, #C9960A 80%, transparent)",
        }} />

        {/* Motif overlay */}
        <div style={{ position: "absolute", top: 4, left: 0, right: 0, zIndex: 0, pointerEvents: "none" }}>
          {cfg.motif}
        </div>

        <div style={{ padding: "clamp(1.5rem,4vw,2.25rem)", position: "relative", zIndex: 1 }}>

          {/* ── HEADER ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              {/* Icon mark */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: cfg.accentBg,
                border: `1px solid ${cfg.accentBd}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {cfg.icon}
              </div>
              <div>
                <p style={{
                  fontFamily: "var(--font-body,'Manrope',sans-serif)",
                  fontSize: ".52rem", letterSpacing: ".38em", textTransform: "uppercase",
                  color: cfg.muted, fontWeight: 700, marginBottom: ".3rem",
                }}>
                  {isChurch ? "Sacred Ceremony" : "Evening Celebration"}
                </p>
                <h3 style={{
                  fontFamily: "var(--font-display,'Cormorant Garamond',Georgia,serif)",
                  fontSize: "clamp(1.5rem,4vw,2rem)",
                  fontWeight: 600, lineHeight: 1,
                  color: "var(--color-text-primary)",
                  letterSpacing: "-.01em",
                }}>
                  {event.event_name}
                </h3>
              </div>
            </div>

            {/* Dress code badge */}
            {event.dressCode && (
              <div style={{
                padding: "5px 13px", borderRadius: 999, flexShrink: 0,
                background: cfg.accentBg,
                border: `1px solid ${cfg.accentBd}`,
                fontFamily: "var(--font-body,'Manrope',sans-serif)",
                fontSize: ".56rem", letterSpacing: ".22em",
                textTransform: "uppercase", color: cfg.accent, fontWeight: 600,
                display: "none", // shown at sm+ via the block below
              }}
                className="hidden sm:block"
              >
                {isChurch ? "Formal Attire" : "Coastal Elegance"}
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p style={{
              fontFamily: "var(--font-display,'Cormorant Garamond',Georgia,serif)",
              fontStyle: "italic",
              fontSize: "clamp(.95rem,2vw,1.05rem)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.85,
              marginBottom: "1.625rem",
              paddingLeft: "1px",
            }}>
              {event.description}
            </p>
          )}

          {/* ── TIME + DATE + VENUE chips ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: ".625rem",
            marginBottom: "1.625rem",
          }}>
            {/* Time */}
            <div style={{
              padding: "1rem",
              borderRadius: 14,
              background: cfg.accentBg,
              border: `1px solid ${cfg.accentBd}`,
            }}>
              <Clock3 size={14} style={{ color: cfg.accent, marginBottom: ".5rem" }} />
              <p style={{
                fontFamily: "var(--font-body,'Manrope',sans-serif)",
                fontSize: ".50rem", letterSpacing: ".30em",
                textTransform: "uppercase", color: cfg.muted,
                fontWeight: 700, marginBottom: ".35rem",
              }}>
                Time
              </p>
              <p style={{
                fontFamily: "var(--font-display,'Cormorant Garamond',Georgia,serif)",
                fontSize: "1.25rem", fontWeight: 600,
                color: "var(--color-text-primary)", lineHeight: 1,
              }}>
                {formatTime(event.time)}
              </p>
            </div>

            {/* Date */}
            <div style={{
              padding: "1rem",
              borderRadius: 14,
              background: "var(--color-surface-soft,#F8F3EE)",
              border: "1px solid var(--color-border)",
            }}>
              <CalendarDays size={14} style={{ color: "var(--color-text-muted)", marginBottom: ".5rem" }} />
              <p style={{
                fontFamily: "var(--font-body,'Manrope',sans-serif)",
                fontSize: ".50rem", letterSpacing: ".30em",
                textTransform: "uppercase", color: "var(--color-text-muted)",
                fontWeight: 700, marginBottom: ".35rem",
              }}>
                Date
              </p>
              <p style={{
                fontFamily: "var(--font-display,'Cormorant Garamond',Georgia,serif)",
                fontSize: "1.1rem", fontWeight: 600,
                color: "var(--color-text-primary)", lineHeight: 1.2,
              }}>
                {formatDate(event.date)}
              </p>
            </div>

            {/* Venue short name */}
            <div style={{
              padding: "1rem",
              borderRadius: 14,
              background: "var(--color-surface-soft,#F8F3EE)",
              border: "1px solid var(--color-border)",
              gridColumn: "1 / -1",
            }}>
              <MapPin size={14} style={{ color: "var(--color-text-muted)", marginBottom: ".5rem" }} />
              <p style={{
                fontFamily: "var(--font-body,'Manrope',sans-serif)",
                fontSize: ".50rem", letterSpacing: ".30em",
                textTransform: "uppercase", color: "var(--color-text-muted)",
                fontWeight: 700, marginBottom: ".35rem",
              }}>
                Location
              </p>
              <p style={{
                fontFamily: "var(--font-display,'Cormorant Garamond',Georgia,serif)",
                fontSize: "clamp(.95rem,2vw,1.1rem)", fontWeight: 600,
                color: "var(--color-text-primary)", lineHeight: 1.35,
              }}>
                {event.venue}
              </p>
            </div>
          </div>

          {/* ── DRESS CODE (mobile, full width) ── */}
          {event.dressCode && (
            <div
              className="sm:hidden"
              style={{
                padding: ".875rem 1rem",
                borderRadius: 12, marginBottom: "1.5rem",
                background: cfg.accentBg,
                border: `1px solid ${cfg.accentBd}`,
              }}
            >
              <p style={{
                fontFamily: "var(--font-body,'Manrope',sans-serif)",
                fontSize: ".50rem", letterSpacing: ".28em",
                textTransform: "uppercase", color: cfg.muted,
                fontWeight: 700, marginBottom: ".4rem",
              }}>
                Dress Code
              </p>
              <p style={{
                fontFamily: "var(--font-display,'Cormorant Garamond',Georgia,serif)",
                fontStyle: "italic",
                fontSize: ".95rem", color: "var(--color-text-secondary)",
                lineHeight: 1.65,
              }}>
                {event.dressCode}
              </p>
            </div>
          )}

          {/* ── DRESS CODE (desktop, full) ── */}
          {event.dressCode && (
            <div
              className="hidden sm:block"
              style={{
                padding: "1rem 1.125rem",
                borderRadius: 12, marginBottom: "1.5rem",
                background: cfg.accentBg,
                border: `1px solid ${cfg.accentBd}`,
              }}
            >
              <p style={{
                fontFamily: "var(--font-body,'Manrope',sans-serif)",
                fontSize: ".50rem", letterSpacing: ".28em",
                textTransform: "uppercase", color: cfg.muted,
                fontWeight: 700, marginBottom: ".4rem",
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

          {/* ── MAP EMBED ── */}
          {event.venue && (
            <div style={{
              borderRadius: 16, overflow: "hidden",
              border: `1px solid ${cfg.accentBd}`,
              marginBottom: "1.5rem",
              boxShadow: `0 2px 12px ${cfg.accentBg}`,
            }}>
              {/* Map header bar */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: ".625rem 1rem",
                background: cfg.accentBg,
                borderBottom: `1px solid ${cfg.accentBd}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                  <MapPin size={12} style={{ color: cfg.accent }} />
                  <p style={{
                    fontFamily: "var(--font-body,'Manrope',sans-serif)",
                    fontSize: ".52rem", letterSpacing: ".24em",
                    textTransform: "uppercase", color: cfg.muted, fontWeight: 600,
                  }}>
                    {isChurch ? "Divine Mercy Church" : "Blue Bay Beach Resort"}
                  </p>
                </div>
                {event.map_link && (
                  <a
                    href={event.map_link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontFamily: "var(--font-body,'Manrope',sans-serif)",
                      fontSize: ".50rem", letterSpacing: ".22em",
                      textTransform: "uppercase", color: cfg.accent, fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Open <ExternalLink size={10} />
                  </a>
                )}
              </div>

              {/* OSM Embed */}
              <iframe
                style={{ width: "100%", height: 200, border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&query=${encodeURIComponent(event.venue)}`}
                title={`Map of ${event.venue}`}
              />
            </div>
          )}

          {/* ── ACTION BUTTONS ── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".625rem", alignItems: "center" }}>
            {/* Directions button */}
            {event.map_link && (
              <a
                href={event.map_link}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "10px 20px", borderRadius: 999,
                  background: cfg.accent, color: "#fff",
                  fontFamily: "var(--font-body,'Manrope',sans-serif)",
                  fontSize: ".62rem", fontWeight: 600,
                  letterSpacing: ".18em", textTransform: "uppercase",
                  textDecoration: "none",
                  boxShadow: `0 6px 20px ${cfg.accentBg}, 0 2px 8px rgba(0,0,0,.10)`,
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

            {/* Add to calendar */}
            <div style={{ flexShrink: 0 }}>
              <CalendarButton
                date={event.date}
                time={event.time}
                description={event.description ?? ""}
                title={event.event_name}
                venue={event.venue}
              />
            </div>
          </div>

        </div>

        {/* Bottom accent stripe */}
        <div style={{
          height: 3,
          background: isChurch
            ? "linear-gradient(90deg, transparent, rgba(190,45,69,.35) 30%, rgba(190,45,69,.55) 50%, rgba(190,45,69,.35) 70%, transparent)"
            : "linear-gradient(90deg, transparent, rgba(168,120,8,.35) 30%, rgba(168,120,8,.55) 50%, rgba(168,120,8,.35) 70%, transparent)",
        }} />
      </article>
    </ScrollReveal>
  );
}

export default EventCard;
