import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Calendar, Heart, MapPin } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { CoupleNames } from "@/components/invitation/CoupleNames";
import { EventCard } from "@/components/invitation/EventCard";
import { InviteTracker } from "@/components/invitation/InviteTracker";
import { StorySection } from "@/components/invitation/StorySection";
import { WeddingDate } from "@/components/invitation/WeddingDate";
import { CinematicIntro } from "@/components/invitation/CinematicIntro";
import { DressCodeCard } from "@/components/invitation/DressCodeCard";
import { GuestRoleBadge } from "@/components/invitation/GuestRoleBadge";
import { NearbyEssentials } from "@/components/invitation/NearbyEssentials";
import { PredictionGame } from "@/components/invitation/PredictionGame";
import { RitualGuide } from "@/components/invitation/RitualGuide";
import { WeddingTimeline } from "@/components/invitation/WeddingTimeline";
import { LiveHubClient } from "@/app/live/LiveHubClient";
import { RSVPForm } from "@/components/rsvp/RSVPForm";
import { GuestMessageForm } from "@/components/guestbook/GuestMessageForm";
import { MessageList } from "@/components/guestbook/MessageList";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { weddingConfig, predictionsConfig } from "@/lib/config";
import { generateInviteUrl } from "@/utils/generateInviteLink";
import { getInviteBundle } from "@/modules/elegant/invitation-engine";
import { getGuestMessages } from "@/modules/premium/guestbook-system";
import { getFamilyVaultBundle } from "@/modules/luxury/family-vault";
import { resolveLifecycleStage } from "@/modules/luxury/lifecycle-orchestrator";
import { getLivestreamBundle } from "@/modules/luxury/livestream";
import { formatDate, formatTime } from "@/utils/formatDate";

interface InvitePageProps { params: { guest: string } }

export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const invite = await getInviteBundle(params.guest);
  if (!invite) return { title: "Invite not found | Surihana Vows" };
  const guestLabel = `${invite.guest.guest_name}${invite.guest.family_name ? ` ${invite.guest.family_name}` : ""}`;
  return {
    title: `${guestLabel} | ${weddingConfig.celebrationTitle}`,
    description: weddingConfig.heroSubtitle,
    openGraph: { title: `${guestLabel} | ${weddingConfig.celebrationTitle}`, description: weddingConfig.heroSubtitle, url: generateInviteUrl(invite.guest.invite_code) },
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const invite = await getInviteBundle(params.guest);
  if (!invite) notFound();

  const stage = await resolveLifecycleStage({ weddingId: invite.wedding.id, weddingDate: invite.wedding.wedding_date });
  const inviteUrl = generateInviteUrl(invite.guest.invite_code);
  const guestLabel = `${invite.guest.guest_name}${invite.guest.family_name ? ` ${invite.guest.family_name}` : ""}`;
  const brideFirst = invite.wedding.bride_name.split(" ")[0];
  const groomFirst = invite.wedding.groom_name.split(" ")[0];

  // ── LIVE stage ─────────────────────────────────────────────────────────────
  if (stage.stage === "live") {
    const liveBundle = await getLivestreamBundle(invite.wedding.id);
    return (
      <div className="pb-20">
        <InviteTracker guestId={invite.guest.id} inviteCode={invite.guest.invite_code} />
        <Container>
          <LiveHubClient allowGuestUploads initialBundle={liveBundle} />
        </Container>
      </div>
    );
  }

  // ── VAULT stage ────────────────────────────────────────────────────────────
  if (stage.stage === "vault") {
    const session = await getSessionFromCookieStore(cookies());
    if (!session || !roleCanAccess(session.role, "/family")) {
      redirect(`/login?redirect=${encodeURIComponent(`/invite/${invite.guest.invite_code}`)}`);
    }
    const familyVault = await getFamilyVaultBundle(invite.wedding.id);
    return (
      <div style={{ background: "var(--color-background)" }}>
        <InviteTracker guestId={invite.guest.id} inviteCode={invite.guest.invite_code} />
        <Container className="space-y-8 py-10 lg:py-14">
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }}>
            <p className="section-label" style={{ color: "var(--color-accent)" }}>Private archive</p>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl" style={{ color: "var(--color-text-primary)" }}>
              Welcome back.
            </h1>
            <p className="mt-2 text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
              This invitation has become the private family memory vault for {brideFirst} &amp; {groomFirst}.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {familyVault.posts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                {post.media_url && <div className="relative h-52"><Image alt={post.title} fill className="object-cover" src={post.media_url} sizes="50vw" /></div>}
                <div className="p-5 space-y-2">
                  <p className="section-label" style={{ color: "var(--color-accent)" }}>Memory</p>
                  <h2 className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>{post.title}</h2>
                  <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>{post.content}</p>
                </div>
              </article>
            ))}
          </div>
          <PhotoGrid photos={familyVault.photos} />
        </Container>
      </div>
    );
  }

  // ── INVITATION stage ───────────────────────────────────────────────────────
  const guestMessages = await getGuestMessages(invite.wedding.id);
  const travelEssentials = invite.travelInfo.filter((i) => i.category === "essentials");
  const travelGeneral = invite.travelInfo.filter((i) => i.category !== "essentials");

  return (
    <CinematicIntro
      brideName={invite.wedding.bride_name}
      groomName={invite.wedding.groom_name}
      guestLabel={guestLabel}
      inviteCode={invite.guest.invite_code}
      subtitle={weddingConfig.heroSubtitle}
      title={weddingConfig.celebrationTitle}
    >
      <InviteTracker guestId={invite.guest.id} inviteCode={invite.guest.invite_code} />

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, var(--color-surface) 0%, var(--color-surface-muted) 100%)", borderBottom: "1px solid var(--color-border)" }}
      >
        {/* Soft top ornament */}
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: "linear-gradient(90deg, transparent, var(--color-accent-soft), var(--color-accent-gold), var(--color-accent-soft), transparent)" }}
        />

        <Container className="py-12 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr,380px] lg:items-start">
            {/* Left — couple info */}
            <div className="space-y-6">
              {/* For label + role badge */}
              <div className="flex flex-wrap items-center gap-3">
                <p className="section-label" style={{ color: "var(--color-text-muted)" }}>
                  For {guestLabel}
                </p>
                <GuestRoleBadge
                  role={invite.guest.guest_role}
                  brideName={invite.wedding.bride_name}
                  groomName={invite.wedding.groom_name}
                />
              </div>

              {/* Names */}
              <CoupleNames
                brideName={invite.wedding.bride_name}
                groomName={invite.wedding.groom_name}
              />

              {/* Subtitle */}
              <p
                className="text-base leading-8 max-w-lg"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {weddingConfig.heroSubtitle}
              </p>

              {/* Key details row — great for mobile */}
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <div
                  className="flex items-center gap-2.5 rounded-xl px-4 py-3"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-xs)" }}
                >
                  <Calendar className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} />
                  <div>
                    <p className="section-label" style={{ color: "var(--color-text-muted)", fontSize: "0.55rem" }}>Date</p>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{formatDate(invite.wedding.wedding_date)}</p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2.5 rounded-xl px-4 py-3"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-xs)" }}
                >
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} />
                  <div>
                    <p className="section-label" style={{ color: "var(--color-text-muted)", fontSize: "0.55rem" }}>Venue</p>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{invite.wedding.venue_name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{weddingConfig.venueCity}</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="#rsvp"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm uppercase font-medium transition"
                  style={{ letterSpacing: "0.22em", background: "var(--color-accent)", color: "#fff", boxShadow: "0 8px 24px rgba(138,90,68,0.3)" }}
                >
                  RSVP now
                </a>
                <a
                  href="#events"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm uppercase transition"
                  style={{ letterSpacing: "0.22em", background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", boxShadow: "var(--shadow-xs)" }}
                >
                  View events
                </a>
              </div>
            </div>

            {/* Right — countdown card */}
            <WeddingDate
              date={invite.wedding.wedding_date}
              time={weddingConfig.weddingTime}
              venueName={invite.wedding.venue_name}
            />
          </div>
        </Container>
      </section>

      {/* ── STORY ─────────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-background)" }}>
        <Container className="py-14">
          <StorySection quote={weddingConfig.introQuote} story={invite.story} />
        </Container>
      </section>

      {/* ── EVENTS ────────────────────────────────────────────────────────────── */}
      <section id="events" style={{ background: "var(--color-surface-muted)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
        <Container className="py-14 space-y-8">
          <div className="space-y-2">
            <p className="section-label" style={{ color: "var(--color-accent)" }}>Your itinerary</p>
            <h2 className="font-display text-3xl sm:text-4xl" style={{ color: "var(--color-text-primary)" }}>
              The wedding weekend
            </h2>
            <p className="text-sm leading-7 max-w-lg" style={{ color: "var(--color-text-secondary)" }}>
              Three days of ceremony, celebration, and togetherness in {weddingConfig.venueCity}.
            </p>
          </div>

          {/* Timeline strip — always visible */}
          <WeddingTimeline events={invite.events} weddingDate={invite.wedding.wedding_date} />

          {/* Full event cards */}
          <div className="grid gap-5">
            {invite.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </Container>
      </section>

      {/* ── DRESS CODE ────────────────────────────────────────────────────────── */}
      {(invite.wedding.dress_code ?? weddingConfig.dressCode) ? (
        <section style={{ background: "var(--color-background)" }}>
          <Container className="py-10">
            <DressCodeCard
              dressCode={invite.wedding.dress_code ?? weddingConfig.dressCode}
              brideName={invite.wedding.bride_name}
              groomName={invite.wedding.groom_name}
            />
          </Container>
        </section>
      ) : null}

      {/* ── RITUAL GUIDE ──────────────────────────────────────────────────────── */}
      {weddingConfig.rituals?.length ? (
        <section style={{ background: "var(--color-surface-muted)", borderTop: "1px solid var(--color-border)" }}>
          <Container className="py-14">
            <RitualGuide
              rituals={weddingConfig.rituals}
              brideName={invite.wedding.bride_name}
              groomName={invite.wedding.groom_name}
            />
          </Container>
        </section>
      ) : null}

      {/* ── RSVP ──────────────────────────────────────────────────────────────── */}
      <section id="rsvp" style={{ background: "var(--color-background)", borderTop: "1px solid var(--color-border)" }}>
        <Container className="py-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            {/* Left copy */}
            <div className="space-y-5">
              <div>
                <p className="section-label" style={{ color: "var(--color-accent)" }}>Your response</p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl" style={{ color: "var(--color-text-primary)" }}>
                  Will you be there?
                </h2>
                <p className="mt-3 text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
                  Let {brideFirst} and {groomFirst} know you&apos;re coming so they can plan every detail with care.
                </p>
              </div>

              {/* Quick event summary */}
              <div
                className="rounded-2xl p-5 space-y-3"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}
              >
                <p className="section-label" style={{ color: "var(--color-accent)" }}>Key ceremony</p>
                <p className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>
                  {invite.wedding.venue_name}
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {formatDate(invite.wedding.wedding_date)} · {formatTime(weddingConfig.weddingTime)}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {weddingConfig.venueAddress}, {weddingConfig.venueCity}
                </p>
                <a
                  href={weddingConfig.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs uppercase transition"
                  style={{ letterSpacing: "0.22em", color: "var(--color-accent)" }}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Get directions
                </a>
              </div>
            </div>

            {/* Right — RSVP form */}
            <RSVPForm
              guest={{
                id: invite.guest.id,
                guestName: invite.guest.guest_name,
                familyName: invite.guest.family_name,
                inviteCode: invite.guest.invite_code,
              }}
              weddingId={invite.wedding.id}
            />
          </div>
        </Container>
      </section>

      {/* ── PREDICTIONS ───────────────────────────────────────────────────────── */}
      {predictionsConfig.enabled ? (
        <section style={{ background: "var(--color-surface-muted)", borderTop: "1px solid var(--color-border)" }}>
          <Container className="py-14 space-y-6">
            <div>
              <p className="section-label" style={{ color: "var(--color-accent)" }}>Before the big day</p>
              <h2 className="mt-2 font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>Make your predictions.</h2>
              <p className="mt-2 text-sm leading-7 max-w-md" style={{ color: "var(--color-text-secondary)" }}>
                Guess what happens at the wedding. Results revealed after the reception.
              </p>
            </div>
            <PredictionGame
              questions={predictionsConfig.questions}
              guestName={invite.guest.guest_name}
              brideName={invite.wedding.bride_name}
              groomName={invite.wedding.groom_name}
              predictionsPageUrl="/predictions"
            />
          </Container>
        </section>
      ) : null}

      {/* ── TRAVEL ────────────────────────────────────────────────────────────── */}
      {travelGeneral.length > 0 && (
        <section style={{ background: "var(--color-background)", borderTop: "1px solid var(--color-border)" }}>
          <Container className="py-14 space-y-8">
            <div>
              <p className="section-label" style={{ color: "var(--color-accent)" }}>Getting here</p>
              <h2 className="mt-2 font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>Everything you need before you arrive.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {travelGeneral.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl p-5 space-y-2 transition"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-xs)", display: "block" }}
                >
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{item.title}</p>
                  <p className="text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>{item.description}</p>
                  <span className="text-xs uppercase" style={{ letterSpacing: "0.22em", color: "var(--color-accent)" }}>View →</span>
                </a>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── NEARBY ESSENTIALS ─────────────────────────────────────────────────── */}
      {travelEssentials.length > 0 && (
        <section style={{ background: "var(--color-surface-muted)", borderTop: "1px solid var(--color-border)" }}>
          <Container className="py-14">
            <NearbyEssentials
              items={travelEssentials.map((i) => ({ id: i.id, title: i.title, description: i.description, link: i.link, icon: i.icon ?? null, category: i.category ?? null }))}
            />
          </Container>
        </section>
      )}

      {/* ── GUESTBOOK ─────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-background)", borderTop: "1px solid var(--color-border)" }}>
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
              <GuestMessageForm weddingId={invite.wedding.id} />
            </div>
            <div className="space-y-4">
              <p className="section-label" style={{ color: "var(--color-accent)" }}>
                {guestMessages.length} message{guestMessages.length !== 1 ? "s" : ""} received
              </p>
              <MessageList messages={guestMessages.slice(0, 5)} />
              {guestMessages.length > 5 && (
                <Link
                  href="/guestbook"
                  className="inline-flex items-center gap-1.5 text-sm"
                  style={{ color: "var(--color-accent)" }}
                >
                  Read all messages <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ── FOOTER FAREWELL ───────────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--color-surface-muted)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <Container className="py-12 text-center space-y-4">
          <div
            className="mx-auto grid h-14 w-14 place-items-center rounded-full"
            style={{ background: "rgba(138,90,68,0.08)", border: "1px solid rgba(212,179,155,0.4)" }}
          >
            <Heart className="h-6 w-6" style={{ color: "var(--color-accent-soft)" }} />
          </div>
          <p
            className="font-display text-xl"
            style={{ color: "var(--color-text-primary)", letterSpacing: "0.06em" }}
          >
            {brideFirst} &amp; {groomFirst}
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {formatDate(invite.wedding.wedding_date)} · {invite.wedding.venue_name}
          </p>
          <p
            className="section-label mt-4"
            style={{ color: "var(--color-text-muted)" }}
          >
            {weddingConfig.celebrationTitle}
          </p>
        </Container>
      </section>
    </CinematicIntro>
  );
}