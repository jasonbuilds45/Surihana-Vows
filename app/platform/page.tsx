// ─────────────────────────────────────────────────────────────────────────────
// app/platform/page.tsx — Platform demo / developer overview page
//
// Previously lived at / (the root). Moved here so the root URL serves the
// wedding experience rather than a product marketing page.
//
// Access at /platform — link from DEPLOY.md and internal docs only.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { ArrowRight, Heart, PlayCircle, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SlideShow } from "@/components/gallery/SlideShow";
import { StorySection } from "@/components/invitation/StorySection";
import { MessageList } from "@/components/guestbook/MessageList";
import { weddingConfig } from "@/lib/config";
import { getInvitationOverview } from "@/modules/elegant/invitation-engine";
import { getGuestMessages } from "@/modules/premium/guestbook-system";
import { getSlideshowPhotos } from "@/modules/premium/photo-gallery";
import { getHighlightVideo } from "@/modules/luxury/media-archive";
import { formatDate } from "@/utils/formatDate";

export const metadata: Metadata = {
  title: "Surihana Vows — Platform Overview",
  description:
    "A cinematic wedding invitation, live celebration hub, and private family archive built with Next.js and Supabase.",
  robots: { index: false } // Do not index the platform demo page
};

export default async function PlatformPage() {
  // Fetching all necessary data in parallel for better performance
  const [overview, guestMessages, slides, highlightVideo] = await Promise.all([
    getInvitationOverview(),
    getGuestMessages(),
    Promise.resolve(getSlideshowPhotos()),
    getHighlightVideo(weddingConfig.id, weddingConfig.highlightVideoUrl)
  ]);

  return (
    <div className="pb-20">
      <Container className="space-y-12 py-10 lg:py-14">

        {/* ── Platform Hero Section ────────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                {formatDate(overview.wedding.wedding_date)} · {overview.wedding.venue_name}
              </p>
              <h1 className="font-display text-5xl leading-tight text-stone-950 sm:text-6xl lg:text-7xl">
                {overview.highlights[0]}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-600">
                Surihana Vows is a Next.js wedding platform that starts as a tailored invitation,
                transforms into a live event hub, and finishes as a protected family memory vault.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/invite/john-family"
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm uppercase tracking-[0.28em] text-white transition hover:bg-stone-800"
              >
                Open sample invite
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/live"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm uppercase tracking-[0.28em] text-stone-900 transition hover:border-stone-400"
              >
                Explore live hub
                <PlayCircle className="h-4 w-4" />
              </Link>
            </div>

            {/* Platform Stages Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-[1.75rem] border border-white/60 bg-white/75 p-5 shadow-soft">
                <Heart className="h-5 w-5 text-stone-700" />
                <p className="mt-4 font-display text-2xl text-stone-950">Stage 1</p>
                <p className="mt-2 text-sm leading-7 text-stone-600">
                  Personalized invitation pages, guest links, RSVP workflows, maps, and story sections.
                </p>
              </article>
              <article className="rounded-[1.75rem] border border-white/60 bg-white/75 p-5 shadow-soft">
                <PlayCircle className="h-5 w-5 text-stone-700" />
                <p className="mt-4 font-display text-2xl text-stone-950">Stage 2</p>
                <p className="mt-2 text-sm leading-7 text-stone-600">
                  Livestreams, countdowns, live photo feeds, and real-time timeline moments.
                </p>
              </article>
              <article className="rounded-[1.75rem] border border-white/60 bg-white/75 p-5 shadow-soft">
                <ShieldCheck className="h-5 w-5 text-stone-700" />
                <p className="mt-4 font-display text-2xl text-stone-950">Stage 3</p>
                <p className="mt-2 text-sm leading-7 text-stone-600">
                  A secure family archive for anniversaries, media vaults, and preserved stories.
                </p>
              </article>
            </div>
          </div>

          <SlideShow slides={slides} />
        </div>

        {/* ── Story Section ────────────────────────────────────────────── */}
        <StorySection
          quote="An invitation should feel like entering a story, not filling out a form."
          story={overview.story}
        />

        {/* ── Highlight Video Section (Conditional) ─────────────────────── */}
        {highlightVideo ? (
          <section className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-stone-950 shadow-[0_24px_80px_rgba(73,45,34,0.18)]">
            <div className="grid lg:grid-cols-[0.42fr,0.58fr]">
              <div className="relative aspect-video lg:aspect-auto lg:min-h-[360px]">
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  src={highlightVideo.video_url}
                  title={highlightVideo.title}
                />
              </div>
              <div className="flex flex-col justify-center gap-6 px-10 py-10 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-stone-300">Highlight film</p>
                  <h2 className="mt-4 font-display text-4xl leading-[1.2] sm:text-5xl">
                    {highlightVideo.title}
                  </h2>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-stone-300">
                    A cinematic keepsake from {weddingConfig.brideName.split(" ")[0]} and{" "}
                    {weddingConfig.groomName.split(" ")[0]}&apos;s celebration in {weddingConfig.venueCity}.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs uppercase tracking-[0.28em] text-white transition hover:bg-white/15"
                    href="/gallery"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Full gallery
                  </Link>
                  <Link
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-xs uppercase tracking-[0.28em] text-white/60 transition hover:border-white/20 hover:text-white/80"
                    href="/family"
                  >
                    Family vault
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ── Guest Book Section ────────────────────────────────────────── */}
        <section className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="rounded-[2rem] border border-white/60 bg-stone-950 p-8 text-white shadow-[0_24px_80px_rgba(73,45,34,0.16)]">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-300">Guest messages</p>
            <h2 className="mt-4 font-display text-4xl">
              The tone of the celebration is already arriving.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-stone-300">
              The guestbook doubles as a live wall of blessings, creating a communal layer long
              before the ceremony begins.
            </p>
          </div>
          <MessageList messages={guestMessages} />
        </section>

        {/* ── Developer Shortcuts Footer ────────────────────────────────── */}
        <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Developer shortcuts</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { label: "Sample invite",    href: "/invite/john-family" },
              { label: "Live hub",         href: "/live" },
              { label: "Family vault",     href: "/family" },
              { label: "Admin dashboard",  href: "/admin" },
              { label: "Predictions",      href: "/predictions" },
              { label: "Gallery",          href: "/gallery" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-700 transition hover:border-stone-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </Container>
    </div>
  );
}
