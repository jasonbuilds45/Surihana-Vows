import type { Metadata } from "next";
import { Calendar, MapPin, Clock, Navigation, Waves, Church } from "lucide-react";
import { EventCard } from "@/components/invitation/EventCard";
import { CalendarButton } from "@/components/navigation/CalendarButton";
import { weddingConfig } from "@/lib/config";
import { getWeddingEvents } from "@/modules/elegant/event-display";

export const metadata: Metadata = {
  title: `Events — ${weddingConfig.celebrationTitle}`,
  description: "The complete itinerary for Marion & Livingston's wedding day — ceremony, reception, venues, and everything you need to know.",
};

// ── Design tokens ─────────────────────────────────────────────────────────
const DF = "'Cormorant Garamond',var(--font-display),Georgia,serif";
const BF = "'Manrope',var(--font-body),system-ui,sans-serif";

export default async function EventsPage() {
  const events = await getWeddingEvents();

  // Sort by time so church always comes first
  const sorted = [...events].sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
  );

  const churchEvent = sorted.find(e => e.id === "church-wedding") ?? sorted[0];
  const beachEvent  = sorted.find(e => e.id !== "church-wedding") ?? sorted[1];

  return (
    <div style={{ background: "var(--bg,#FDFAF7)", minHeight: "100vh" }}>

      {/* ════════════════════════════════════════════════════════════════
          HERO — dark, cinematic, full-bleed
      ════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: "relative",
        background: "linear-gradient(160deg,#0A0608 0%,#120B0D 55%,#0A0608 100%)",
        overflow: "hidden",
        borderBottom: "1px solid rgba(190,45,69,.12)",
      }}>
        {/* Ambient blooms */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 70% at 90% 0%,   rgba(190,45,69,.09) 0%, transparent 55%),
            radial-gradient(ellipse 45% 55% at 0%  90%,  rgba(168,120,8,.07)  0%, transparent 50%),
            radial-gradient(ellipse 35% 45% at 50% 50%,  rgba(190,45,69,.03) 0%, transparent 60%)
          `,
        }} />

        {/* Top accent stripe */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent 5%,rgba(190,45,69,.50) 30%,rgba(201,150,10,.72) 50%,rgba(190,45,69,.50) 70%,transparent 95%)",
        }} />

        {/* Large decorative letterform */}
        <div aria-hidden style={{
          position: "absolute", right: "clamp(1rem,8vw,6rem)", top: "50%",
          transform: "translateY(-50%)",
          fontFamily: DF, fontSize: "clamp(14rem,30vw,28rem)",
          fontWeight: 300, lineHeight: 1,
          color: "rgba(255,255,255,.018)",
          letterSpacing: "-.04em", userSelect: "none", pointerEvents: "none",
        }}>
          W
        </div>

        <div style={{
          maxWidth: "var(--max-w,1320px)", margin: "0 auto",
          padding: "clamp(5rem,10vh,8rem) var(--pad-x,clamp(1.25rem,5vw,5rem)) clamp(4rem,8vh,6rem)",
          position: "relative", zIndex: 1,
        }}>

          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.75rem" }}>
            <div style={{ width: 24, height: 1, background: "rgba(190,45,69,.55)" }} />
            <span style={{
              fontFamily: BF, fontSize: ".46rem", letterSpacing: ".48em",
              textTransform: "uppercase", color: "rgba(190,45,69,.80)", fontWeight: 700,
            }}>
              Wednesday, 20 May 2026
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: DF, fontWeight: 300,
            fontSize: "clamp(3rem,8vw,7rem)",
            lineHeight: .88, letterSpacing: "-.035em",
            color: "rgba(255,252,248,.96)",
            marginBottom: "clamp(1.25rem,3vh,2rem)",
          }}>
            The wedding<br />
            <em style={{ color: "rgba(201,150,10,.85)" }}>itinerary.</em>
          </h1>

          {/* Subline */}
          <p style={{
            fontFamily: DF, fontStyle: "italic",
            fontSize: "clamp(1rem,1.8vw,1.2rem)",
            color: "rgba(255,255,255,.48)",
            lineHeight: 1.8, maxWidth: "38rem",
            marginBottom: "2.5rem",
          }}>
            Two sacred venues. One coastal road between them.
            From a church ceremony in the afternoon to a shoreline reception at sunset —
            this is the full story of the day.
          </p>

          {/* Day-at-a-glance strip */}
          <div style={{
            display: "flex", flexWrap: "wrap",
            alignItems: "stretch", gap: 0,
            maxWidth: "clamp(340px,80vw,620px)",
            borderRadius: 14, overflow: "hidden",
            border: "1px solid rgba(255,255,255,.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,.24)",
          }}>
            {/* Church block */}
            <div style={{
              flex: 1, minWidth: 140,
              padding: "1.125rem 1.375rem",
              background: "rgba(190,45,69,.12)",
              borderRight: "1px solid rgba(255,255,255,.06)",
            }}>
              <p style={{
                fontFamily: BF, fontSize: ".44rem", letterSpacing: ".28em",
                textTransform: "uppercase", color: "rgba(190,45,69,.75)",
                fontWeight: 700, marginBottom: ".375rem",
              }}>Ceremony</p>
              <p style={{
                fontFamily: DF, fontSize: "clamp(1.1rem,2.5vw,1.4rem)",
                fontWeight: 600, color: "rgba(255,252,248,.92)",
                lineHeight: 1.1, marginBottom: ".25rem",
              }}>3:00 PM</p>
              <p style={{ fontFamily: BF, fontSize: ".68rem", color: "rgba(255,255,255,.38)" }}>
                Kelambakkam
              </p>
            </div>

            {/* Connector */}
            <div style={{
              width: "clamp(52px,10vw,80px)", flexShrink: 0,
              background: "rgba(255,255,255,.04)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 4,
              padding: ".5rem",
            }}>
              <span style={{ fontFamily: BF, fontSize: ".46rem", color: "rgba(255,255,255,.22)", letterSpacing: ".12em" }}>15 km</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{
                    width: 3, height: 3, borderRadius: "50%",
                    background: i === 1 || i === 2 ? "rgba(201,150,10,.60)" : "rgba(255,255,255,.14)",
                  }} />
                ))}
              </div>
            </div>

            {/* Beach block */}
            <div style={{
              flex: 1, minWidth: 140,
              padding: "1.125rem 1.375rem",
              background: "rgba(168,120,8,.10)",
            }}>
              <p style={{
                fontFamily: BF, fontSize: ".44rem", letterSpacing: ".28em",
                textTransform: "uppercase", color: "rgba(201,150,10,.75)",
                fontWeight: 700, marginBottom: ".375rem",
              }}>Reception</p>
              <p style={{
                fontFamily: DF, fontSize: "clamp(1.1rem,2.5vw,1.4rem)",
                fontWeight: 600, color: "rgba(255,252,248,.92)",
                lineHeight: 1.1, marginBottom: ".25rem",
              }}>6:00 PM</p>
              <p style={{ fontFamily: BF, fontSize: ".68rem", color: "rgba(255,255,255,.38)" }}>
                Mahabalipuram
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DAY FLOW — editorial section explaining the day's narrative
      ════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: "var(--bg-warm,#F8F3EE)",
        borderBottom: "1px solid rgba(190,45,69,.08)",
      }}>
        <div style={{
          maxWidth: "var(--max-w,1320px)", margin: "0 auto",
          padding: "clamp(3rem,6vh,5rem) var(--pad-x,clamp(1.25rem,5vw,5rem))",
        }}>

          {/* Section head */}
          <div style={{ marginBottom: "clamp(2rem,4vh,3rem)" }}>
            <p style={{
              fontFamily: BF, fontSize: ".48rem", letterSpacing: ".40em",
              textTransform: "uppercase", color: "var(--rose,#BE2D45)",
              fontWeight: 700, marginBottom: ".5rem",
            }}>
              The day
            </p>
            <h2 style={{
              fontFamily: DF, fontWeight: 300,
              fontSize: "clamp(1.75rem,4vw,2.75rem)",
              color: "var(--ink,#120B0E)",
              lineHeight: 1.05, letterSpacing: "-.025em",
            }}>
              Two venues. One unforgettable day.
            </h2>
          </div>

          {/* Three-panel flow */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))",
            gap: "1px",
            background: "rgba(190,45,69,.08)",
            borderRadius: 16, overflow: "hidden",
            border: "1px solid rgba(190,45,69,.08)",
          }}>
            {[
              {
                num: "01",
                time: "3:00 PM",
                icon: <Church size={18} style={{ color: "var(--rose,#BE2D45)" }} />,
                title: "The Ceremony",
                venue: "Divine Mercy Church, Kelambakkam",
                desc: "Marion Jemima and Livingston exchange their vows before God and family in a Nuptial Mass. The exchange of rings, the unity candle, the final blessing — every ritual carries the weight of a promise made for life.",
                accent: "var(--rose,#BE2D45)",
                pale: "var(--rose-pale,#FBEBEE)",
                mapLink: weddingConfig.mapLink,
              },
              {
                num: "02",
                time: "5:00 PM",
                icon: <Navigation size={18} style={{ color: "var(--ink-3,#72504A)" }} />,
                title: "The Drive",
                venue: "East Coast Road · 15 km",
                desc: "The East Coast Road runs along the Bay of Bengal — arguably the most scenic stretch of road near Chennai. Your 25-minute coastal drive is part of the experience. Leave around 5 PM to arrive with the sunset.",
                accent: "var(--ink-3,#72504A)",
                pale: "rgba(114,80,74,.05)",
                mapLink: null,
              },
              {
                num: "03",
                time: "6:00 PM",
                icon: <Waves size={18} style={{ color: "var(--gold,#A87808)" }} />,
                title: "The Reception",
                venue: "Blue Bay Beach Resort, Mahabalipuram",
                desc: "As the sun sets over the Bay of Bengal, the celebration moves to the shore. An evening of food, music, and joy on the beach lawn — with the sea as your backdrop and the stars as your ceiling.",
                accent: "var(--gold,#A87808)",
                pale: "var(--gold-pale,#FBF2DC)",
                mapLink: weddingConfig.receptionMapLink,
              },
            ].map(({ num, time, icon, title, venue, desc, accent, pale, mapLink }) => (
              <div key={num} style={{
                background: "var(--bg-warm,#F8F3EE)",
                padding: "clamp(1.5rem,3.5vw,2.25rem)",
                display: "flex", flexDirection: "column", gap: "1rem",
              }}>
                {/* Number + time */}
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{
                    fontFamily: DF, fontSize: "3rem", fontWeight: 300, lineHeight: 1,
                    color: "rgba(190,45,69,.12)", letterSpacing: "-.02em",
                  }}>{num}</span>
                  <span style={{
                    fontFamily: BF, fontSize: ".58rem", fontWeight: 700,
                    letterSpacing: ".18em", textTransform: "uppercase",
                    color: accent,
                  }}>{time}</span>
                </div>

                {/* Icon + title */}
                <div style={{ display: "flex", alignItems: "center", gap: ".875rem" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: pale, border: `1px solid ${accent}22`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {icon}
                  </div>
                  <h3 style={{
                    fontFamily: DF, fontSize: "1.25rem", fontWeight: 600,
                    color: "var(--ink,#120B0E)", lineHeight: 1.1,
                  }}>{title}</h3>
                </div>

                {/* Venue */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <MapPin size={11} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
                  <p style={{
                    fontFamily: BF, fontSize: ".72rem", color: "var(--ink-3,#72504A)",
                    lineHeight: 1.4,
                  }}>{venue}</p>
                </div>

                {/* Hairline */}
                <div style={{ height: 1, background: `linear-gradient(to right,${accent}30,transparent)` }} />

                {/* Description */}
                <p style={{
                  fontFamily: DF, fontStyle: "italic",
                  fontSize: "clamp(.9rem,1.8vw,1rem)",
                  color: "var(--ink-3,#72504A)", lineHeight: 1.82, flex: 1,
                }}>{desc}</p>

                {/* Map link */}
                {mapLink && (
                  <a href={mapLink} target="_blank" rel="noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontFamily: BF, fontSize: ".60rem", fontWeight: 700,
                    letterSpacing: ".12em", textTransform: "uppercase",
                    color: accent, textDecoration: "none",
                    alignSelf: "flex-start",
                  }}>
                    <Navigation size={10} /> Get directions
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          PRACTICAL INFO — two columns: what to wear / what to expect
      ════════════════════════════════════════════════════════════════ */}
      <div style={{ borderBottom: "1px solid rgba(190,45,69,.07)" }}>
        <div style={{
          maxWidth: "var(--max-w,1320px)", margin: "0 auto",
          padding: "clamp(3rem,6vh,5rem) var(--pad-x,clamp(1.25rem,5vw,5rem))",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))",
          gap: "clamp(1.5rem,4vw,3rem)",
          alignItems: "start",
        }}>

          {/* Dress code */}
          <div>
            <p style={{
              fontFamily: BF, fontSize: ".48rem", letterSpacing: ".40em",
              textTransform: "uppercase", color: "var(--rose,#BE2D45)",
              fontWeight: 700, marginBottom: ".5rem",
            }}>What to wear</p>
            <h2 style={{
              fontFamily: DF, fontWeight: 300,
              fontSize: "clamp(1.5rem,3vw,2.25rem)",
              color: "var(--ink,#120B0E)",
              lineHeight: 1.05, marginBottom: "1.5rem",
            }}>
              Dress code
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                {
                  event: "Ceremony · 3 PM",
                  code: "Formal attire",
                  note: "The church is air-conditioned. Smart formals are ideal — sarees, churidars, suits, and dress shirts all welcome.",
                  rose: true,
                },
                {
                  event: "Reception · 6 PM",
                  code: "Coastal elegance",
                  note: "Whites, creams, soft golds, champagnes, and greens. The reception is on a beach lawn — wedges and block heels recommended over stilettos.",
                  rose: false,
                },
              ].map(({ event, code, note, rose }) => (
                <div key={event} style={{
                  borderRadius: 14, overflow: "hidden",
                  border: `1px solid ${rose ? "rgba(190,45,69,.10)" : "rgba(168,120,8,.10)"}`,
                  boxShadow: "0 1px 4px rgba(15,10,11,.04)",
                }}>
                  <div style={{
                    padding: ".75rem 1.125rem",
                    background: rose ? "var(--rose-pale,#FBEBEE)" : "var(--gold-pale,#FBF2DC)",
                    borderBottom: `1px solid ${rose ? "rgba(190,45,69,.08)" : "rgba(168,120,8,.08)"}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <span style={{
                      fontFamily: BF, fontSize: ".46rem", fontWeight: 700,
                      letterSpacing: ".16em", textTransform: "uppercase",
                      color: rose ? "var(--rose,#BE2D45)" : "var(--gold,#A87808)",
                    }}>{event}</span>
                    <span style={{
                      fontFamily: DF, fontStyle: "italic", fontSize: ".9rem",
                      color: "var(--ink,#120B0E)", fontWeight: 600,
                    }}>{code}</span>
                  </div>
                  <div style={{ padding: ".875rem 1.125rem", background: "var(--bg,#FDFAF7)" }}>
                    <p style={{
                      fontFamily: BF, fontSize: ".80rem",
                      color: "var(--ink-3,#72504A)", lineHeight: 1.7,
                    }}>{note}</p>
                  </div>
                </div>
              ))}

              {/* Colour palette */}
              <div style={{
                borderRadius: 14, padding: "1rem 1.125rem",
                background: "var(--bg-warm,#F8F3EE)",
                border: "1px solid rgba(190,45,69,.07)",
              }}>
                <p style={{
                  fontFamily: BF, fontSize: ".46rem", letterSpacing: ".28em",
                  textTransform: "uppercase", color: "var(--ink-4,#A88888)",
                  fontWeight: 600, marginBottom: ".75rem",
                }}>Reception palette</p>
                <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                  {[
                    { label: "Ivory",     hex: "#F5F0E8" },
                    { label: "Cream",     hex: "#EDE0C8" },
                    { label: "Gold",      hex: "#C9A84C" },
                    { label: "Sage",      hex: "#8FA888" },
                    { label: "Champagne", hex: "#D4B896" },
                  ].map(({ label, hex }) => (
                    <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", background: hex,
                        border: "2px solid rgba(255,255,255,.85)",
                        boxShadow: "0 2px 6px rgba(15,10,11,.10)",
                      }} />
                      <span style={{
                        fontFamily: BF, fontSize: ".42rem",
                        color: "var(--ink-4,#A88888)", textAlign: "center",
                      }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Need to know */}
          <div>
            <p style={{
              fontFamily: BF, fontSize: ".48rem", letterSpacing: ".40em",
              textTransform: "uppercase", color: "var(--gold,#A87808)",
              fontWeight: 700, marginBottom: ".5rem",
            }}>What to know</p>
            <h2 style={{
              fontFamily: DF, fontWeight: 300,
              fontSize: "clamp(1.5rem,3vw,2.25rem)",
              color: "var(--ink,#120B0E)",
              lineHeight: 1.05, marginBottom: "1.5rem",
            }}>
              Practical notes
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: ".875rem" }}>
              {[
                {
                  icon: <Clock size={14} />,
                  title: "Arrive 15 min early",
                  body: "The church ceremony begins promptly at 3:00 PM. Please arrive by 2:45 PM so you're seated before the processional.",
                  rose: true,
                },
                {
                  icon: <Navigation size={14} />,
                  title: "Plan your journey",
                  body: "The drive from the church to Blue Bay Beach Resort takes approximately 25–30 minutes via ECR. Leave by 5:00 PM to arrive comfortably for the 6:00 PM reception.",
                  rose: false,
                },
                {
                  icon: <MapPin size={14} />,
                  title: "Parking is available",
                  body: "Both venues have on-site parking. Blue Bay Beach Resort has a large lot — Ola and Uber are also readily available along ECR.",
                  rose: true,
                },
                {
                  icon: <Waves size={14} />,
                  title: "Beach lawn reception",
                  body: "The evening reception is outdoors on a manicured lawn by the sea. The weather in May is warm and humid, with a pleasant coastal breeze after sundown.",
                  rose: false,
                },
                {
                  icon: <Calendar size={14} />,
                  title: "Save the details",
                  body: "Use the calendar buttons below each event card to save both venues and timings directly to your phone calendar with one tap.",
                  rose: true,
                },
              ].map(({ icon, title, body, rose }) => (
                <div key={title} style={{
                  display: "flex", alignItems: "flex-start", gap: ".875rem",
                  padding: "1rem 1.125rem", borderRadius: 12,
                  background: "rgba(255,255,255,.80)",
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${rose ? "rgba(190,45,69,.09)" : "rgba(168,120,8,.09)"}`,
                  boxShadow: "0 1px 4px rgba(15,10,11,.04)",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: rose ? "var(--rose-pale,#FBEBEE)" : "var(--gold-pale,#FBF2DC)",
                    border: `1px solid ${rose ? "rgba(190,45,69,.14)" : "rgba(168,120,8,.14)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: rose ? "var(--rose,#BE2D45)" : "var(--gold,#A87808)",
                  }}>
                    {icon}
                  </div>
                  <div>
                    <p style={{
                      fontFamily: DF, fontSize: ".95rem", fontWeight: 600,
                      color: "var(--ink,#120B0E)", lineHeight: 1.2, marginBottom: ".3rem",
                    }}>{title}</p>
                    <p style={{
                      fontFamily: BF, fontSize: ".80rem",
                      color: "var(--ink-3,#72504A)", lineHeight: 1.68,
                    }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          EVENT CARDS — the full detail cards with maps + calendar
      ════════════════════════════════════════════════════════════════ */}
      <div>
        <div style={{
          maxWidth: "var(--max-w,1320px)", margin: "0 auto",
          padding: "clamp(3rem,6vh,5rem) var(--pad-x,clamp(1.25rem,5vw,5rem)) clamp(4rem,8vh,6rem)",
        }}>
          {/* Section head */}
          <div style={{ marginBottom: "clamp(2rem,4vh,3rem)" }}>
            <p style={{
              fontFamily: BF, fontSize: ".48rem", letterSpacing: ".40em",
              textTransform: "uppercase", color: "var(--rose,#BE2D45)",
              fontWeight: 700, marginBottom: ".5rem",
            }}>Full details</p>
            <h2 style={{
              fontFamily: DF, fontWeight: 300,
              fontSize: "clamp(1.75rem,4vw,2.75rem)",
              color: "var(--ink,#120B0E)",
              lineHeight: 1.05, letterSpacing: "-.025em",
            }}>
              Both events, everything you need.
            </h2>
            <p style={{
              fontFamily: BF, fontSize: ".875rem",
              color: "var(--ink-3,#72504A)",
              lineHeight: 1.72, maxWidth: "36rem", marginTop: ".625rem",
            }}>
              Maps, directions, and one-tap calendar saves — all below.
            </p>
          </div>

          {/* Event cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {sorted.map(e => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>

          {/* Bottom CTA strip */}
          <div style={{
            marginTop: "clamp(2.5rem,5vh,4rem)",
            padding: "clamp(1.5rem,4vw,2.25rem)",
            borderRadius: 20,
            background: "linear-gradient(140deg,#0F0A0B 0%,#1C1214 55%,#0F0A0B 100%)",
            border: "1px solid rgba(190,45,69,.12)",
            boxShadow: "0 4px 24px rgba(15,10,11,.08)",
            position: "relative", overflow: "hidden",
          }}>
            <div aria-hidden style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg,transparent,rgba(190,45,69,.50) 30%,rgba(201,150,10,.70) 50%,rgba(190,45,69,.50) 70%,transparent)",
            }} />
            <div style={{
              display: "flex", flexWrap: "wrap",
              alignItems: "center", justifyContent: "space-between",
              gap: "1.5rem", position: "relative", zIndex: 1,
            }}>
              <div>
                <p style={{
                  fontFamily: BF, fontSize: ".46rem", letterSpacing: ".36em",
                  textTransform: "uppercase", color: "rgba(240,190,198,.55)",
                  fontWeight: 700, marginBottom: ".5rem",
                }}>Need help getting here?</p>
                <p style={{
                  fontFamily: DF, fontStyle: "italic",
                  fontSize: "clamp(1rem,2.5vw,1.3rem)",
                  color: "rgba(255,252,248,.88)", lineHeight: 1.3,
                }}>
                  The travel page has everything — hotels, transport, weather, and arrival tips.
                </p>
              </div>
              <a href="/travel" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 22px", borderRadius: 999,
                background: "linear-gradient(135deg,#D44860 0%,#BE2D45 100%)",
                color: "#fff", fontFamily: BF, fontSize: ".68rem",
                fontWeight: 700, letterSpacing: ".14em",
                textTransform: "uppercase", textDecoration: "none",
                boxShadow: "0 4px 16px rgba(190,45,69,.32)",
                flexShrink: 0,
              }}>
                <Navigation size={12} />
                Travel guide
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
