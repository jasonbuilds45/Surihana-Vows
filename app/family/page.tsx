import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Clock, Heart, Lock, Images, PenLine, Video } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { TimeCapsuleForm } from "@/components/vault/TimeCapsuleForm";
import { VideoTimeCapsuleForm } from "@/components/vault/VideoTimeCapsuleForm";
import { FamilyPostForm } from "@/components/vault/FamilyPostForm";
import { FamilyPolls } from "@/components/vault/FamilyPolls";
import { ElderModeWrapper } from "@/components/vault/ElderMode";
import { CapsuleUnlockBanner } from "@/components/vault/CapsuleUnlockBanner";
import { VaultPhotoAlbums } from "@/components/vault/VaultPhotoAlbums";
import { VaultCapsuleSection } from "@/components/vault/VaultCapsuleSection";
import { VaultNav } from "@/components/vault/VaultNav";
import { getSessionFromCookieStore, roleCanAccess, isSquadOrAbove } from "@/lib/auth";
import { weddingConfig } from "@/lib/config";
import { getFamilyVaultBundle } from "@/modules/luxury/family-vault";
import { getTimeCapsules } from "@/modules/luxury/time-capsule";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { formatDate } from "@/utils/formatDate";
import type { PhotoRow } from "@/lib/types";
import type { VaultAlbum } from "@/components/vault/VaultPhotoAlbums";

// ─────────────────────────────────────────────────────────────────────────────
// Fetch albums + album photos for the vault
// ─────────────────────────────────────────────────────────────────────────────
async function getVaultAlbums(weddingId: string): Promise<{ albums: VaultAlbum[]; albumPhotos: PhotoRow[] }> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return { albums: [], albumPhotos: [] };

  const [{ data: albums, error: albumErr }, { data: photos }] = await Promise.all([
    client
      .from("photo_albums" as never)
      .select("*")
      .eq("wedding_id", weddingId)
      .order("sort_order"),
    client
      .from("photos")
      .select("id, image_url, uploaded_by, category, created_at, is_approved, album_id")
      .eq("wedding_id", weddingId)
      .eq("is_approved", true)
      .not("album_id" as never, "is", null)
      .order("created_at", { ascending: false }),
  ]);

  if (albumErr && !shouldFallbackToDemoData(albumErr)) return { albums: [], albumPhotos: [] };

  const photoList = (photos ?? []) as Array<Record<string, unknown>>;
  const countMap: Record<string, number> = {};
  for (const p of photoList) {
    const aid = p.album_id as string | null;
    if (aid) countMap[aid] = (countMap[aid] ?? 0) + 1;
  }

  const enriched = ((albums ?? []) as Array<Record<string, unknown>>).map(a => ({
    id:          a.id as string,
    album_name:  a.album_name as string,
    description: (a.description as string) ?? null,
    cover_photo: (a.cover_photo as string) ?? null,
    is_public:   a.is_public as boolean,
    sort_order:  a.sort_order as number,
    photo_count: countMap[a.id as string] ?? 0,
  }));

  return { albums: enriched, albumPhotos: photoList as unknown as PhotoRow[] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default async function FamilyPage() {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/family")) {
    redirect("/login?hint=vault&redirect=%2Ffamily");
  }

  const isSquad = isSquadOrAbove(session.role);

  const [familyVault, capsules, { albums, albumPhotos }] = await Promise.all([
    getFamilyVaultBundle(),
    getTimeCapsules(weddingConfig.id),
    getVaultAlbums(weddingConfig.id),
  ]);

  const revealedCapsules = capsules.filter(c => c.isRevealed);
  const lockedCapsules   = capsules.filter(c => !c.isRevealed);
  const brideFirst       = weddingConfig.brideName.split(" ")[0];
  const groomFirst       = weddingConfig.groomName.split(" ")[0];

  // ── Shared card style ──────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background:   "var(--color-surface)",
    border:       "1px solid var(--color-border)",
    borderRadius: "1.25rem",
    boxShadow:    "var(--shadow-sm)",
  };

  // ── Section header helper ──────────────────────────────────────────────────
  function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
    return (
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ fontSize: ".6rem", letterSpacing: ".42em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: "var(--font-body),sans-serif", marginBottom: ".375rem" }}>
          {eyebrow}
        </p>
        <h2 className="font-display" style={{ fontSize: "clamp(1.5rem,3.5vw,2.25rem)", color: "var(--color-text-primary)", lineHeight: 1.2 }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm leading-7 max-w-lg" style={{ color: "var(--color-text-secondary)", marginTop: ".5rem" }}>
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <ElderModeWrapper>
      {/* ── Unlock banner (client component, shows when capsules newly reveal) */}
      <CapsuleUnlockBanner capsules={capsules} />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(160deg, var(--color-surface) 0%, var(--color-surface-muted) 100%)", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--color-accent-soft), transparent)" }} />
        <Container className="py-8 sm:py-10">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "1.25rem" }}>
            {/* Names + date */}
            <div>
              <p style={{ fontSize: ".58rem", letterSpacing: ".45em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: "var(--font-body),sans-serif", marginBottom: ".5rem" }}>
                Private family vault
              </p>
              <h1 className="font-display" style={{ fontSize: "clamp(1.75rem, 6vw, 2.75rem)", color: "var(--color-text-primary)", lineHeight: 1.15, letterSpacing: ".03em" }}>
                {brideFirst} &amp; {groomFirst}
              </h1>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)", marginTop: ".375rem" }}>
                {formatDate(weddingConfig.weddingDate)} · {weddingConfig.venueCity}
              </p>
            </div>

            {/* Stat chips */}
            {capsules.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
                {[
                  { label: "Sealed",   value: lockedCapsules.length,   icon: Lock },
                  { label: "Revealed", value: revealedCapsules.length, icon: Heart },
                  { label: "Albums",   value: albums.length,           icon: Images },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: ".625rem", padding: ".625rem 1rem", borderRadius: 14, background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-xs)" }}>
                    <Icon size={14} style={{ color: "var(--color-accent-soft)", flexShrink: 0 }} />
                    <div>
                      <p className="font-display" style={{ fontSize: "1.25rem", color: "var(--color-text-primary)", lineHeight: 1 }}>{value}</p>
                      <p style={{ fontSize: ".55rem", letterSpacing: ".28em", textTransform: "uppercase", color: "var(--color-text-muted)", fontFamily: "var(--font-body),sans-serif" }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>

        {/* ── Sticky tab nav (client component) */}
        <VaultNav />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION: MEMORIES (Family posts)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="memories" style={{ background: "var(--color-background)", borderBottom: "1px solid var(--color-border)", scrollMarginTop: "7rem" }}>
        <Container className="py-12">
          <SectionHeader eyebrow="Family memories" title="From the vault." subtitle="Stories, blessings, and milestones contributed by family members." />

          {familyVault.posts.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", background: "var(--color-surface-muted)", borderRadius: 18, border: "1px dashed var(--color-border)" }}>
              <PenLine size={28} style={{ color: "var(--color-accent-soft)", margin: "0 auto .875rem" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No memories yet. Add the first one below.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {familyVault.posts.map(post => (
                <article key={post.id} className="overflow-hidden" style={card}>
                  {post.media_url && (
                    <div className="relative h-52">
                      <Image alt={post.title} src={post.media_url} fill className="object-cover" sizes="(max-width:640px) 100vw, 50vw" />
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <p style={{ fontSize: ".58rem", letterSpacing: ".36em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: "var(--font-body),sans-serif" }}>
                      {post.post_type ?? "Memory"}
                    </p>
                    <h3 className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>{post.title}</h3>
                    <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>{post.content}</p>
                    {post.posted_by && (
                      <p className="text-xs pt-1" style={{ color: "var(--color-text-muted)" }}>— {post.posted_by}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Add a memory form — squad only */}
          {isSquad ? (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr,1.1fr] lg:items-start">
              <div>
                <p style={{ fontSize: ".58rem", letterSpacing: ".42em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: "var(--font-body),sans-serif", marginBottom: ".5rem" }}>Contribute to the archive</p>
                <h3 className="font-display text-2xl" style={{ color: "var(--color-text-primary)", marginBottom: ".625rem" }}>Add your memory.</h3>
                <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
                  As part of the squad you can contribute memories, blessings, and milestones to the permanent vault archive.
                </p>
              </div>
              <FamilyPostForm weddingId={weddingConfig.id} authorEmail={session.email} />
            </div>
          ) : (
            <div className="mt-8 rounded-2xl p-5" style={{ background: "var(--color-surface-muted)", border: "1px solid var(--color-border)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body),sans-serif" }}>
                Memory posts are written by the bridal and groom squads. You can leave a blessing in the guestbook from the main invitation.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION: TIMELINE + VIDEOS
      ═══════════════════════════════════════════════════════════════════════ */}
      {(familyVault.timeline.length > 0 || familyVault.videos.length > 0) && (
        <section id="timeline" style={{ background: "var(--color-surface-muted)", borderBottom: "1px solid var(--color-border)", scrollMarginTop: "7rem" }}>
          <Container className="py-12">
            <div className="grid gap-10 lg:grid-cols-2">
              {/* Timeline */}
              {familyVault.timeline.length > 0 && (
                <div>
                  <SectionHeader eyebrow="Anniversary timeline" title="Years ahead." />
                  <div className="space-y-3">
                    {familyVault.timeline.map((item, i) => (
                      <div key={item.year} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: ".75rem", fontWeight: 600, background: i === 0 ? "var(--color-accent)" : "var(--color-surface)", border: `1px solid ${i === 0 ? "var(--color-accent)" : "var(--color-border)"}`, color: i === 0 ? "#fff" : "var(--color-text-muted)" }}>
                            {item.year.toString().slice(2)}
                          </div>
                          {i < familyVault.timeline.length - 1 && (
                            <div style={{ width: 1, flex: 1, minHeight: 20, marginTop: 4, background: "var(--color-border)" }} />
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
                <div>
                  <SectionHeader eyebrow="Family videos" title="Watch together." />
                  <div className="space-y-4">
                    {familyVault.videos.map(video => (
                      <div key={video.id} className="overflow-hidden rounded-2xl" style={card}>
                        <div className="aspect-video">
                          <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full border-0" src={video.video_url} title={video.title} />
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

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION: PHOTO ALBUMS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="photos" style={{ background: "var(--color-background)", borderBottom: "1px solid var(--color-border)", scrollMarginTop: "3.5rem" }}>
        <Container className="py-12">
          <SectionHeader
            eyebrow="Photo albums"
            title="The archive."
            subtitle="Every album from the wedding, organised and downloadable."
          />
          <VaultPhotoAlbums albums={albums} photos={albumPhotos} />

          {/* All photos fallback (unassigned / no albums) */}
          {albums.length === 0 && familyVault.photos.length > 0 && (
            <>
              <div style={{ marginTop: "2rem" }}>
                <SectionHeader eyebrow="Photo archive" title="All photos." />
                <PhotoGrid photos={familyVault.photos} />
              </div>
            </>
          )}
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION: SQUAD HUB (squad role only)
      ═══════════════════════════════════════════════════════════════════════ */}
      {isSquad && (
        <section id="squad" style={{ background: "var(--color-background)", borderBottom: "1px solid var(--color-border)", scrollMarginTop: "3.5rem" }}>
          <Container className="py-12 space-y-8">
            <SectionHeader
              eyebrow="Squad hub"
              title="Your role in the celebration."
              subtitle={`Everything you need to know as part of ${brideFirst} \u0026 ${groomFirst}'s squad.`}
            />

            {/* Role responsibilities */}
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  title: "The Ceremony — 3:00 PM",
                  icon: "✝️",
                  color: "#BE2D45",
                  bg: "rgba(190,45,69,.05)",
                  bd: "rgba(190,45,69,.14)",
                  items: [
                    "Arrive at Divine Mercy Church by 2:30 PM",
                    "Coordinate with the couple on processional order",
                    "Stand beside the couple at the altar during vows",
                    "Formal attire — details shared by the couple directly",
                  ],
                },
                {
                  title: "The Reception — 6:00 PM",
                  icon: "🌊",
                  color: "#A87808",
                  bg: "rgba(168,120,8,.05)",
                  bd: "rgba(168,120,8,.14)",
                  items: [
                    "Move to Blue Bay Beach Resort after the ceremony",
                    "Assist in welcoming guests to the reception",
                    "Be present for first dances and toasts",
                    "Coastal elegance dress code — whites, creams, soft golds",
                  ],
                },
              ].map(({ title, icon, color, bg, bd, items }) => (
                <div key={title} style={{ padding: "1.25rem 1.5rem", borderRadius: 18, background: bg, border: `1px solid ${bd}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "1.4rem" }}>{icon}</span>
                    <p className="font-display" style={{ fontSize: "1.1rem", color, fontWeight: 600 }}>{title}</p>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: ".5rem" }}>
                    {items.map(item => (
                      <li key={item} style={{ display: "flex", gap: ".625rem", alignItems: "flex-start" }}>
                        <span style={{ color, fontWeight: 700, flexShrink: 0, marginTop: ".1em" }}>‣</span>
                        <p className="text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Day timeline */}
            <div style={{ padding: "1.5rem", borderRadius: 18, background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <p style={{ fontSize: ".58rem", letterSpacing: ".38em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: "var(--font-body),sans-serif", marginBottom: "1.25rem", fontWeight: 700 }}>Day timeline — 20 May 2026</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { time: "2:30 PM", event: "Squad arrives at Divine Mercy Church", note: "Kelambakkam", rose: true },
                  { time: "3:00 PM", event: "Holy Matrimony ceremony begins", note: "Be seated by 2:55 PM", rose: true },
                  { time: "~5:00 PM", event: "Ceremony ends — photos with the couple", note: "Churchyard", rose: false },
                  { time: "~5:30 PM", event: "Travel to Blue Bay Beach Resort", note: "Mahabalipuram (~45 min)", rose: false },
                  { time: "6:00 PM", event: "Shoreline Reception begins", note: "Blue Bay Beach Resort", rose: false },
                  { time: "Late evening", event: "Dinner, toasts, and dancing", note: "Stay as long as you like", rose: false },
                ].map(({ time, event, note, rose }, i, arr) => (
                  <div key={time} style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 2 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: rose ? "#BE2D45" : "#A87808", flexShrink: 0 }} />
                      {i < arr.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 20, background: "var(--color-border)", margin: "3px 0" }} />}
                    </div>
                    <div style={{ paddingBottom: i < arr.length - 1 ? "1rem" : 0 }}>
                      <p style={{ fontFamily: "var(--font-body),sans-serif", fontSize: ".62rem", fontWeight: 700, color: rose ? "#BE2D45" : "#A87808", letterSpacing: ".1em", marginBottom: ".2rem" }}>{time}</p>
                      <p className="font-display" style={{ fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: ".15rem" }}>{event}</p>
                      <p style={{ fontSize: ".78rem", color: "var(--color-text-muted)", fontFamily: "var(--font-body),sans-serif" }}>{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact the couple */}
            <div style={{ padding: "1.25rem 1.5rem", borderRadius: 18, background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <div>
                <p className="font-display" style={{ fontSize: "1.1rem", color: "var(--color-text-primary)", marginBottom: ".25rem" }}>Questions or adjustments?</p>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Reach out to {brideFirst} or {groomFirst} directly.</p>
              </div>
              <a
                href={`mailto:${weddingConfig.contactEmail}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "10px 22px", borderRadius: 999,
                  background: "var(--color-accent)", color: "#fff",
                  fontFamily: "var(--font-body),sans-serif", fontSize: ".72rem",
                  fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                Get in touch
              </a>
            </div>
          </Container>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION: TIME CAPSULES
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="capsules" style={{ background: "var(--color-surface-muted)", borderBottom: "1px solid var(--color-border)", scrollMarginTop: "3.5rem" }}>
        <Container className="py-12">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <p style={{ fontSize: ".6rem", letterSpacing: ".42em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: "var(--font-body),sans-serif", marginBottom: ".375rem" }}>Time capsule messages</p>
              <h2 className="font-display" style={{ fontSize: "clamp(1.5rem,3.5vw,2.25rem)", color: "var(--color-text-primary)", lineHeight: 1.2 }}>Words written for years ahead.</h2>
              <p className="text-sm leading-6 max-w-lg" style={{ color: "var(--color-text-secondary)", marginTop: ".5rem" }}>Sealed on your wedding day. Each unlocks on the date its author chose.</p>
            </div>
            {capsules.length > 0 && (
              <span style={{ padding: "6px 16px", borderRadius: 999, background: "var(--color-surface)", border: "1px solid var(--color-border)", fontSize: ".65rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--color-text-muted)", fontFamily: "var(--font-body),sans-serif" }}>
                {capsules.length} total · {lockedCapsules.length} sealed · {revealedCapsules.length} open
              </span>
            )}
          </div>

          {capsules.length === 0 ? (
            <div className="rounded-2xl py-12 text-center" style={{ background: "var(--color-surface)", border: "1px dashed var(--color-border)" }}>
              <Clock size={28} style={{ color: "var(--color-accent-soft)", margin: "0 auto .875rem" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                No time capsules yet. Use the forms below to seal the first message.
              </p>
            </div>
          ) : (
            <VaultCapsuleSection capsules={capsules} />
          )}

          {/* Seal forms */}
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            {/* Text capsule */}
            <div>
              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontSize: ".58rem", letterSpacing: ".42em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: "var(--font-body),sans-serif", marginBottom: ".375rem" }}>Seal a message for the future</p>
                <h3 className="font-display text-2xl" style={{ color: "var(--color-text-primary)", marginBottom: ".5rem" }}>Write a message for years ahead.</h3>
                <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
                  Leave a note for {brideFirst} and {groomFirst} to open on an anniversary, a life milestone, or a date of your choosing.
                </p>
              </div>
              <TimeCapsuleForm weddingDate={weddingConfig.weddingDate} brideName={weddingConfig.brideName} groomName={weddingConfig.groomName} />
            </div>
            {/* Video capsule */}
            <div>
              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontSize: ".58rem", letterSpacing: ".42em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: "var(--font-body),sans-serif", marginBottom: ".375rem" }}>Seal a video memory</p>
                <h3 className="font-display text-2xl" style={{ color: "var(--color-text-primary)", marginBottom: ".5rem" }}>Leave a video for the future.</h3>
                <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
                  Paste a YouTube or Vimeo link. Your video stays sealed until the reveal date you choose.
                </p>
              </div>
              <VideoTimeCapsuleForm weddingDate={weddingConfig.weddingDate} brideName={weddingConfig.brideName} groomName={weddingConfig.groomName} />
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION: POLLS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="polls" style={{ background: "var(--color-background)", scrollMarginTop: "7rem" }}>
        <Container className="py-12">
          <FamilyPolls weddingId={weddingConfig.id} isAdmin={session.role === "admin"} voterEmail={session.email} />
        </Container>
      </section>
    </ElderModeWrapper>
  );
}
