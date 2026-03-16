import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Clock, Heart, Lock } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { TimeCapsuleCardComponent } from "@/components/vault/TimeCapsuleCard";
import { TimeCapsuleForm } from "@/components/vault/TimeCapsuleForm";
import { VideoTimeCapsuleForm } from "@/components/vault/VideoTimeCapsuleForm";
import { FamilyPostForm } from "@/components/vault/FamilyPostForm";
import { FamilyPolls } from "@/components/vault/FamilyPolls";
import { ElderModeWrapper } from "@/components/vault/ElderMode";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { weddingConfig } from "@/lib/config";
import { getFamilyVaultBundle } from "@/modules/luxury/family-vault";
import { getTimeCapsules } from "@/modules/luxury/time-capsule";
import { formatDate } from "@/utils/formatDate";

export default async function FamilyPage() {
  const session = await getSessionFromCookieStore(cookies());
  // Both admin and family roles can access the family vault
  if (!session) {
    redirect("/login?hint=vault&redirect=%2Ffamily");
  }
  if (session.role !== "admin" && session.role !== "family") {
    redirect("/login?hint=vault&redirect=%2Ffamily");
  }

  const [familyVault, capsules] = await Promise.all([
    getFamilyVaultBundle(),
    getTimeCapsules(weddingConfig.id),
  ]);

  const revealedCapsules = capsules.filter((c) => c.isRevealed);
  const lockedCapsules = capsules.filter((c) => !c.isRevealed);
  const brideFirst = weddingConfig.brideName.split(" ")[0];
  const groomFirst = weddingConfig.groomName.split(" ")[0];

  const cardStyle = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "1.25rem",
    boxShadow: "var(--shadow-sm)",
  };

  return (
    <ElderModeWrapper>
      {/* ── WELCOME HERO ──────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(160deg, var(--color-surface) 0%, var(--color-surface-muted) 100%)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {/* Rose gold stripe */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--color-accent-soft), transparent)" }} />
        <Container className="py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="space-y-2">
              <p
                style={{ fontSize: "0.6rem", letterSpacing: "0.45em", textTransform: "uppercase", color: "var(--color-accent)" }}
              >
                Private family vault
              </p>
              <h1
                className="font-display"
                style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)", color: "var(--color-text-primary)", letterSpacing: "0.04em", lineHeight: 1.2 }}
              >
                {brideFirst} &amp; {groomFirst}
              </h1>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {formatDate(weddingConfig.weddingDate)} · {weddingConfig.venueName}
              </p>
            </div>

            {/* Stats strip */}
            {capsules.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Sealed messages", value: lockedCapsules.length, icon: Lock },
                  { label: "Open memories",   value: revealedCapsules.length, icon: Heart },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-xs)" }}
                  >
                    <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent-soft)" }} />
                    <div>
                      <p className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>{value}</p>
                      <p style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ── FAMILY POSTS ──────────────────────────────────────────────────── */}
      {familyVault.posts.length > 0 && (
        <section style={{ background: "var(--color-background)", borderBottom: "1px solid var(--color-border)" }}>
          <Container className="py-12 space-y-6">
            <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>
              Family memories
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {familyVault.posts.map((post) => (
                <article key={post.id} className="overflow-hidden" style={cardStyle}>
                  {post.media_url && (
                    <div className="relative h-52">
                      <Image alt={post.title} src={post.media_url} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <p style={{ fontSize: "0.6rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                      {post.post_type ?? "Memory"}
                    </p>
                    <h2 className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>{post.title}</h2>
                    <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>{post.content}</p>
                    {post.posted_by && (
                      <p className="text-xs pt-1" style={{ color: "var(--color-text-muted)" }}>— {post.posted_by}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── ANNIVERSARY TIMELINE + VIDEOS ─────────────────────────────────── */}
      {(familyVault.timeline.length > 0 || familyVault.videos.length > 0) && (
        <section style={{ background: "var(--color-surface-muted)", borderBottom: "1px solid var(--color-border)" }}>
          <Container className="py-12">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Timeline */}
              {familyVault.timeline.length > 0 && (
                <div className="space-y-4">
                  <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                    Anniversary timeline
                  </p>
                  <div className="space-y-3">
                    {familyVault.timeline.map((item, i) => (
                      <div
                        key={item.year}
                        className="flex gap-4"
                      >
                        {/* Year indicator */}
                        <div className="flex flex-col items-center">
                          <div
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-medium"
                            style={{ background: i === 0 ? "var(--color-accent)" : "var(--color-surface)", border: `1px solid ${i === 0 ? "var(--color-accent)" : "var(--color-border)"}`, color: i === 0 ? "#fff" : "var(--color-text-muted)" }}
                          >
                            {item.year.toString().slice(2)}
                          </div>
                          {i < familyVault.timeline.length - 1 && (
                            <div className="mt-1 w-px flex-1" style={{ background: "var(--color-border)", minHeight: 20 }} />
                          )}
                        </div>
                        <div className="pb-4 space-y-1 min-w-0">
                          <p className="font-display text-lg" style={{ color: "var(--color-text-primary)" }}>{item.title}</p>
                          <p className="text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {familyVault.videos.length > 0 && (
                <div className="space-y-4">
                  <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                    Family videos
                  </p>
                  <div className="space-y-4">
                    {familyVault.videos.map((video) => (
                      <div key={video.id} className="overflow-hidden rounded-2xl" style={cardStyle}>
                        <div className="aspect-video">
                          <iframe
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full border-0"
                            src={video.video_url}
                            title={video.title}
                          />
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{video.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ── PHOTO GALLERY ─────────────────────────────────────────────────── */}
      {familyVault.photos.length > 0 && (
        <section style={{ background: "var(--color-background)", borderBottom: "1px solid var(--color-border)" }}>
          <Container className="py-12 space-y-5">
            <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>
              Photo archive
            </p>
            <PhotoGrid photos={familyVault.photos} />
          </Container>
        </section>
      )}

      {/* ── TIME CAPSULES ─────────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-surface-muted)", borderBottom: "1px solid var(--color-border)" }}>
        <Container className="py-12 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                Time capsule messages
              </p>
              <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>
                Words written for years ahead.
              </h2>
              <p className="text-sm leading-6 max-w-lg" style={{ color: "var(--color-text-secondary)" }}>
                Sealed on your wedding day. Each unlocks on the date its author chose.
              </p>
            </div>
            {capsules.length > 0 && (
              <span
                className="rounded-full px-4 py-1.5 text-xs uppercase"
                style={{ letterSpacing: "0.22em", background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
              >
                {capsules.length} total · {lockedCapsules.length} sealed · {revealedCapsules.length} open
              </span>
            )}
          </div>

          {capsules.length === 0 ? (
            <div
              className="rounded-2xl py-12 text-center"
              style={{ background: "var(--color-surface)", border: "1px dashed var(--color-border)" }}
            >
              <Clock className="mx-auto h-8 w-8 mb-3" style={{ color: "var(--color-accent-soft)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                No time capsules yet. Guests can seal messages using the form below.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...revealedCapsules, ...lockedCapsules].map((capsule) => (
                <TimeCapsuleCardComponent key={capsule.id} capsule={capsule} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ── POLLS ─────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-background)", borderBottom: "1px solid var(--color-border)" }}>
        <Container className="py-12">
          <FamilyPolls
            weddingId={weddingConfig.id}
            isAdmin={session.role === "admin"}
            voterEmail={session.email}
          />
        </Container>
      </section>

      {/* ── ADD A MEMORY ──────────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-surface-muted)", borderBottom: "1px solid var(--color-border)" }}>
        <Container className="py-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-3">
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                Contribute to the archive
              </p>
              <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>
                Add your memory.
              </h2>
              <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
                As a family member you can contribute memories, blessings, and milestones to the permanent vault archive.
                Your name will be attached to every entry you leave.
              </p>
            </div>
            <FamilyPostForm weddingId={weddingConfig.id} authorEmail={session.email} />
          </div>
        </Container>
      </section>

      {/* ── SEAL A TIME CAPSULE ────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-background)" }}>
        <Container className="py-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-3">
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                Seal a message for the future
              </p>
              <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>
                Write a message for years ahead.
              </h2>
              <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
                Leave a note for {brideFirst} and {groomFirst} to open on an anniversary, a life milestone,
                or a date of your choosing. It will stay sealed until that moment.
              </p>
            </div>
            <TimeCapsuleForm
              weddingDate={weddingConfig.weddingDate}
              brideName={weddingConfig.brideName}
              groomName={weddingConfig.groomName}
            />
          </div>
        </Container>
      </section>

      {/* ── VIDEO TIME CAPSULE ─────────────────────────────────────── */}
      <section style={{ background: "var(--color-surface-muted)", borderBottom: "1px solid var(--color-border)" }}>
        <Container className="py-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-3">
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                Seal a video memory
              </p>
              <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>
                Leave a video for the future.
              </h2>
              <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
                Paste a YouTube or Vimeo link. Your video message will stay sealed until the reveal date you choose — perfect for anniversaries.
              </p>
            </div>
            <VideoTimeCapsuleForm
              weddingDate={weddingConfig.weddingDate}
              brideName={weddingConfig.brideName}
              groomName={weddingConfig.groomName}
            />
          </div>
        </Container>
      </section>
    </ElderModeWrapper>
  );
}
