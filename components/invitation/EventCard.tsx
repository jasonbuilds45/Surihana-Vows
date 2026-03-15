import { CalendarDays, Clock3, Map, MapPin } from "lucide-react";
import type { EventRow } from "@/lib/types";
import { formatDate, formatTime } from "@/utils/formatDate";
import { MapButtons } from "@/components/navigation/MapButtons";
import { CalendarButton } from "@/components/navigation/CalendarButton";
import { Badge, GoldStripe, SectionLabel } from "@/components/ui";

interface EventCardProps {
  event: EventRow & { description?: string; dressCode?: string };
}

function buildOsmEmbedUrl(venueName: string) {
  return `https://www.openstreetmap.org/export/embed.html?layer=mapnik&query=${encodeURIComponent(venueName)}`;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <article
      className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
      style={{ background: "#ffffff", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }}
    >
      <GoldStripe />

      <div className="p-6 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <SectionLabel>Event</SectionLabel>
            <h3 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)", letterSpacing: "0.02em" }}>
              {event.event_name}
            </h3>
          </div>
          {event.dressCode && (
            <Badge variant="gold">{event.dressCode}</Badge>
          )}
        </div>

        {event.description && (
          <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>{event.description}</p>
        )}

        {/* Info chips */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: CalendarDays, label: "Date",  value: formatDate(event.date) },
            { icon: Clock3,       label: "Time",  value: formatTime(event.time) },
            { icon: MapPin,       label: "Venue", value: event.venue },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl p-4 space-y-2"
              style={{ background: "var(--color-surface-soft)", border: "1px solid var(--color-border)" }}
            >
              <Icon className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
              <p style={{ fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>
                {label}
              </p>
              <p className="text-xs font-semibold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Map embed */}
        {event.venue && (
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--color-border)" }}>
            <div
              className="flex items-center gap-2 px-4 py-2.5"
              style={{ background: "var(--color-surface-soft)", borderBottom: "1px solid var(--color-border)" }}
            >
              <Map className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>
                {event.venue}
              </p>
            </div>
            <iframe
              className="h-52 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={buildOsmEmbedUrl(event.venue)}
              title={`Map of ${event.venue}`}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <MapButtons mapLink={event.map_link} venueName={event.venue} />
          <CalendarButton
            date={event.date}
            time={event.time}
            description={event.description ?? ""}
            title={event.event_name}
            venue={event.venue}
          />
        </div>
      </div>

      <GoldStripe thin />
    </article>
  );
}

export default EventCard;
