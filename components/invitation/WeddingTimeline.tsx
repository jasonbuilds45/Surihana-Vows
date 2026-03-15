import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { EventRow } from "@/lib/types";
import { formatTime } from "@/utils/formatDate";

interface WeddingTimelineProps {
  events: EventRow[];
  weddingDate: string;
}

function getStatus(
  date: string,
  time: string,
  now: Date
): "completed" | "current" | "upcoming" {
  try {
    const d = new Date(`${date}T${time}`);
    const diff = d.getTime() - now.getTime();

    if (diff < -90 * 60 * 1000) return "completed";
    if (Math.abs(diff) <= 90 * 60 * 1000) return "current";

    return "upcoming";
  } catch {
    return "upcoming";
  }
}

export function WeddingTimeline({ events }: WeddingTimelineProps) {
  if (!events.length) return null;

  const now = new Date();

  const sorted = [...events].sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
  );

  return (
    <section
      className="rounded-3xl p-8 space-y-6"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Section label */}
      <p
        style={{
          fontSize: "0.6rem",
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
          fontWeight: 600,
        }}
      >
        Wedding timeline
      </p>

      <div className="relative">

        {/* Vertical line */}
        <div
          className="absolute left-4 top-3 bottom-3 w-px"
          style={{
            background: "linear-gradient(to bottom, transparent, var(--color-border), transparent)",
          }}
          aria-hidden
        />

        <ol className="space-y-5">

          {sorted.map((event) => {
            const status = getStatus(event.date, event.time, now);

            return (
              <li
                key={event.id}
                className="relative flex items-start gap-4 pl-12"
              >
                {/* Timeline marker */}
                <div
                  className="absolute left-0 top-1 grid h-9 w-9 place-items-center rounded-full"
                  style={{
                    background:
                      status === "current"
                        ? "var(--color-accent)"
                        : "var(--color-surface)",
                    border: `1px solid ${
                      status === "current"
                        ? "var(--color-accent)"
                        : "var(--color-border)"
                    }`,
                    boxShadow:
                      status === "current"
                        ? "0 0 14px rgba(138,90,68,0.35)"
                        : "none",
                  }}
                >
                  {status === "completed" ? (
                    <CheckCircle2
                      className="h-4 w-4"
                      style={{ color: "var(--color-text-muted)" }}
                    />
                  ) : status === "current" ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                  ) : (
                    <Circle
                      className="h-4 w-4"
                      style={{ color: "var(--color-border)" }}
                    />
                  )}
                </div>

                {/* Event card */}
                <div
                  className="flex-1 rounded-2xl px-4 py-3 space-y-1"
                  style={{
                    background:
                      status === "current"
                        ? "rgba(138,90,68,0.06)"
                        : "var(--color-surface-muted)",
                    border: `1px solid ${
                      status === "current"
                        ? "rgba(212,179,155,0.55)"
                        : "var(--color-border)"
                    }`,
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">

                    <p
                      className="text-sm font-medium"
                      style={{
                        color:
                          status === "completed"
                            ? "var(--color-text-muted)"
                            : "var(--color-text-primary)",
                      }}
                    >
                      {event.event_name}
                    </p>

                    <div className="flex items-center gap-2">

                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        <Clock className="h-3 w-3" />
                        {formatTime(event.time)}
                      </span>

                      {status === "current" && (
                        <span
                          className="rounded-full px-3 py-0.5 text-xs font-medium"
                          style={{
                            background: "var(--color-accent)",
                            color: "#fff",
                          }}
                        >
                          Now
                        </span>
                      )}
                    </div>
                  </div>

                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {event.venue}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default WeddingTimeline;
