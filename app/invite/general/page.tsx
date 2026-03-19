import type { Metadata } from "next";
import { Heart, MapPin, Calendar } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { CinematicIntro } from "@/components/invitation/CinematicIntro";
import { StorySection } from "@/components/invitation/StorySection";
import { WeddingDate } from "@/components/invitation/WeddingDate";
import { EventCard } from "@/components/invitation/EventCard";
import { DressCodeCard } from "@/components/invitation/DressCodeCard";
import { RitualGuide } from "@/components/invitation/RitualGuide";
import { MessageList } from "@/components/guestbook/MessageList";
import { GuestMessageForm } from "@/components/guestbook/GuestMessageForm";
import { GalleryPreview } from "@/components/invitation/GalleryPreview";
import { weddingConfig } from "@/lib/config";
import { getGuestMessages } from "@/modules/premium/guestbook-system";
import { getGalleryPhotos } from "@/modules/premium/photo-gallery";
import { getWeddingEvents } from "@/modules/elegant/event-display";
import { formatDate } from "@/utils/formatDate";

// ── The fixed general invite URL ───────────────────────────────────────────
// This is the URL shared when a guest forwards the wedding to someone
// outside the original guest list. It shows the full experience but
// carries no personalised identity, no RSVP form, no invite tracking.
const GENERAL_INVITE_URL =
  `${(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")}/invite/general`;

export const metadata: Metadata = {
  title: `${weddingConfig.celebrationTitle} | Marion & Livingston`,
  description: weddingConfig.heroSubtitle,
  openGraph: {
    title: `You're invited — Marion & Livingston`,
    description: weddingConfig.heroSubtitle,
    url: GENERAL_INVITE_URL,
  },
};

const WEDDING_ID = weddingConfig.id;
const brideFirst = weddingConfig.brideName.split(" ")[0]!;
const groomFirst = weddingConfig.groomName.split(" ")[0]!;

export default async function GeneralInvitePage() {
  const [guestMessages, galleryPhotos, events] = await Promise.all([
    getGuestMessages(WEDDING_ID),
    getGalleryPhotos(WEDDING_ID),
    getWeddingEvents(),
  ]);

  const heroPhoto =
    (await import("@/modules/premium/photo-gallery").then((m) => m.getSlideshowPhotos()))[0]?.imageUrl ??
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85";

  return (
    <CinematicIntro
      brideName={weddingConfig.brideName}
      groomName={weddingConfig.groomName}
      guestLabel="our beloved guests"
      inviteCode="general"
      subtitle={weddingConfig.heroSubtitle}
      title={weddingConfig.celebrationTitle}
      weddingDate={formatDate(weddingConfig.weddingDate)}
      venueName={weddingConfig.venueName}
      venueCity={weddingConfig.venueCity}
      heroPhotoUrl={heroPhoto}
      audioSrc={null}
    >
      {/* ── WELCOME STRIP ─────────────────────────────────────────────────── */}
      <section
        id="invite-welcome"
        style={{
          background: "linear-gradient(160deg, var(--color-surface) 0%, var(--color-surface-muted) 100%)",
          borderBottom: "1px solid var(--color-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute", inset: "0 0 auto 0", height: 3,
            background: "linear-gradient(90deg, transparent, var(--color-accent-soft), var(--color-accent-gold), var(--color-accent-soft), transparent)",
          }}
        />
        <Container className="py-10 sm:py-12">
          <div className="flex flex-wrap items-start justify-between gap-8 lg:flex-nowrap">

            <div className="space-y-4 min-w-0">
              <p className="section-label" style={{ color: "var(--color-text-muted)" }}>
                You&apos;re invited to celebrate
              </p>

              <div className="space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} />
                  <div>
                    <p className="text-base font-medium leading-snug" style={{ color: "var(--color-text-primary)" }}>
                      {weddingConfig.venueName}
                    </p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{weddingConfig.venueAddress}</p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{weddingConfig.venueCity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 pl-px">
                  <Calendar className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    {formatDate(weddingConfig.weddingDate)} · {weddingConfig.weddingTime} IST
                  </p>
                </div>
              </div>

              <p className="text-sm leading-7 max-w-md" style={{ color: "var(--color-text-secondary)" }}>
                {weddingConfig.heroSubtitle}
              </p>

              <a
                href="#events"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium uppercase transition"
                style={{
                  letterSpacing: "0.18em",
                  background: "var(--color-accent)",
                  color: "#fff",
                  boxShadow: "0 8px 24px rgba(138,90,68,0.28)",
                  textDecoration: "none",
                }}
              >
                View the celebration
              </a>
            </div>

            <div className="w-full lg:w-auto lg:min-w-[340px] shrink-0">
              <WeddingDate
                date={weddingConfig.weddingDate}
                time={weddingConfig.weddingTime}
                venueName={weddingConfig.venueName}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ── STORY ─────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-background)" }}>
        <Container className="py-14">
          <StorySection
            quote={weddingConfig.introQuote}
            story={weddingConfig.story.map(
              (s: { year: string; title: string; description: string; imageUrl?: string }, i: number) => ({
                id: `story-${i}`,
                wedding_id: WEDDING_ID,
                year: s.year,
                title: s.title,
                description: s.description,
                image_url: s.imageUrl ?? null,
                sort_order: i,
              })
            )}
          />
        </Container>
      </section>

      {/* ── EVENTS ────────────────────────────────────────────────────────── */}
      <section
        id="events"
        style={{
          background: "var(--color-surface-muted)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
          scrollMarginTop: "6rem",
        }}
      >
        <Container className="py-14">
          <div className="space-y-2 mb-10">
            <p className="section-label" style={{ color: "var(--color-accent)" }}>The celebration</p>
            <h2 className="font-display text-3xl sm:text-4xl" style={{ color: "var(--color-text-primary)" }}>
              Two venues. One unforgettable day.
            </h2>
            <p className="text-sm leading-7 max-w-lg" style={{ color: "var(--color-text-secondary)" }}>
              {formatDate(weddingConfig.weddingDate)} · {weddingConfig.venueCity} — an afternoon of vows
              and an evening of celebration.
            </p>
          </div>

          {/* Desktop timeline connector */}
          <div className="hidden lg:flex items-center gap-0 mb-10">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div style={{ width:40,height:40,borderRadius:10,background:"rgba(190,45,69,.08)",border:"1.5px solid rgba(190,45,69,.25)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <line x1="9" y1="1" x2="9" y2="17" stroke="#BE2D45" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="6" x2="15" y2="6" stroke="#BE2D45" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize:".5rem",letterSpacing:".32em",textTransform:"uppercase",color:"rgba(190,45,69,.65)",fontWeight:700 }}>3:00 PM</p>
                <p style={{ fontSize:".8rem",fontWeight:600,color:"var(--color-text-primary)",fontFamily:"var(--font-display,'Cormorant Garamond',serif)" }}>Divine Mercy Church</p>
              </div>
            </div>
            <div style={{ flex:1,display:"flex",alignItems:"center",margin:"0 1rem" }}>
              <div style={{ flex:1,height:1,background:"linear-gradient(to right, rgba(190,45,69,.30), rgba(168,120,8,.30))" }}/>
              <div style={{ margin:"0 .75rem",padding:"4px 12px",borderRadius:999,background:"var(--color-surface)",border:"1px solid var(--color-border)",fontSize:".48rem",letterSpacing:".28em",textTransform:"uppercase",color:"var(--color-text-muted)",fontWeight:600,whiteSpace:"nowrap" }}>
                Then at sunset
              </div>
              <div style={{ flex:1,height:1,background:"linear-gradient(to right, rgba(168,120,8,.30), rgba(168,120,8,.60))" }}/>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div style={{ width:40,height:40,borderRadius:10,background:"rgba(168,120,8,.08)",border:"1.5px solid rgba(168,120,8,.25)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width="20" height="12" viewBox="0 0 22 14" fill="none" aria-hidden>
                  <path d="M1 7 Q4 2 7 7 Q10 12 13 7 Q16 2 19 7 Q20.5 9.5 22 7" stroke="#A87808" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize:".5rem",letterSpacing:".32em",textTransform:"uppercase",color:"rgba(168,120,8,.65)",fontWeight:700 }}>6:00 PM</p>
                <p style={{ fontSize:".8rem",fontWeight:600,color:"var(--color-text-primary)",fontFamily:"var(--font-display,'Cormorant Garamond',serif)" }}>Blue Bay Beach Resort</p>
              </div>
            </div>
          </div>

          {/* Mobile timeline */}
          <div className="flex lg:hidden items-center gap-4 mb-8 overflow-x-auto pb-1">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div style={{ width:8,height:8,borderRadius:"50%",background:"#BE2D45" }}/>
              <span style={{ fontSize:".65rem",fontWeight:600,color:"var(--color-text-primary)",whiteSpace:"nowrap" }}>3 PM · Church</span>
            </div>
            <div style={{ flex:1,minWidth:24,height:1,background:"linear-gradient(to right, rgba(190,45,69,.4), rgba(168,120,8,.4))" }}/>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div style={{ width:8,height:8,borderRadius:"50%",background:"#A87808" }}/>
              <span style={{ fontSize:".65rem",fontWeight:600,color:"var(--color-text-primary)",whiteSpace:"nowrap" }}>6 PM · Beach Resort</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </Container>
      </section>

      {/* ── DRESS CODE ────────────────────────────────────────────────────── */}
      {weddingConfig.dressCode && (
        <section style={{ background: "var(--color-background)" }}>
          <Container className="py-10">
            <DressCodeCard
              dressCode={weddingConfig.dressCode}
              brideName={weddingConfig.brideName}
              groomName={weddingConfig.groomName}
            />
          </Container>
        </section>
      )}

      {/* ── RITUAL GUIDE ──────────────────────────────────────────────────── */}
      {weddingConfig.rituals?.length ? (
        <section style={{ background: "var(--color-surface-muted)", borderTop: "1px solid var(--color-border)" }}>
          <Container className="py-14">
            <RitualGuide
              rituals={weddingConfig.rituals}
              brideName={weddingConfig.brideName}
              groomName={weddingConfig.groomName}
            />
          </Container>
        </section>
      ) : null}

      {/* ── RSVP NUDGE — no form here, just a contact prompt ─────────────── */}
      <section style={{ background: "var(--color-background)", borderTop: "1px solid var(--color-border)" }}>
        <Container className="py-14">
          <div
            className="rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <p className="section-label" style={{ color: "var(--color-accent)" }}>Attending?</p>
            <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>
              Let us know you&apos;re coming
            </h2>
            <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
              This is a shared invitation. To RSVP, please contact{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>{brideFirst}</strong> or{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>{groomFirst}</strong> directly —
              or ask the person who shared this with you to send you your own personalised link.
            </p>
            <a
              href={`mailto:${weddingConfig.contactEmail}`}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium uppercase transition"
              style={{
                letterSpacing: "0.18em",
                background: "var(--color-accent)",
                color: "#fff",
                boxShadow: "0 8px 24px rgba(138,90,68,0.28)",
                textDecoration: "none",
              }}
            >
              Get in touch
            </a>
          </div>
        </Container>
      </section>

      {/* ── GUESTBOOK ─────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-surface-muted)", borderTop: "1px solid var(--color-border)" }}>
        <Container className="py-14 space-y-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-5">
              <div>
                <p className="section-label" style={{ color: "var(--color-accent)" }}>Guestbook</p>
                <h2 className="mt-2 font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>
                  Leave a blessing for them.
                </h2>
                <p className="mt-2 text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
                  A word, a wish, a memory — it will stay with {brideFirst} and {groomFirst} forever.
                </p>
              </div>
              <GuestMessageForm weddingId={WEDDING_ID} />
            </div>
            <div className="space-y-4">
              <p className="section-label" style={{ color: "var(--color-accent)" }}>
                {guestMessages.length} message{guestMessages.length !== 1 ? "s" : ""} received
              </p>
              <MessageList messages={guestMessages.slice(0, 5)} />
            </div>
          </div>
        </Container>
      </section>

      {/* ── GALLERY ───────────────────────────────────────────────────────── */}
      {galleryPhotos.length > 0 && (
        <GalleryPreview photos={galleryPhotos} />
      )}

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-surface-muted)", borderTop: "1px solid var(--color-border)" }}>
        <Container className="py-12 text-center space-y-4">
          <div
            className="mx-auto grid h-14 w-14 place-items-center rounded-full"
            style={{ background: "rgba(138,90,68,0.08)", border: "1px solid rgba(212,179,155,0.4)" }}
          >
            <Heart className="h-6 w-6" style={{ color: "var(--color-accent-soft)" }} />
          </div>
          <p className="font-display text-xl" style={{ color: "var(--color-text-primary)", letterSpacing: "0.06em" }}>
            {brideFirst} &amp; {groomFirst}
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {formatDate(weddingConfig.weddingDate)} · {weddingConfig.venueName}
          </p>
          <p className="section-label mt-4" style={{ color: "var(--color-text-muted)" }}>
            {weddingConfig.celebrationTitle}
          </p>
        </Container>
      </section>
    </CinematicIntro>
  );
}
