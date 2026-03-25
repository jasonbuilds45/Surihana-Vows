import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Clock, Heart, Images, Lock, PenLine, Shield, Sparkles, Video } from "lucide-react";
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
import { getSessionFromCookieStore, isSquadOrAbove, roleCanAccess } from "@/lib/auth";
import { weddingConfig } from "@/lib/config";
import { getFamilyVaultBundle } from "@/modules/luxury/family-vault";
import { getTimeCapsules } from "@/modules/luxury/time-capsule";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { formatDate } from "@/utils/formatDate";
import type { PhotoRow } from "@/lib/types";
import type { VaultAlbum } from "@/components/vault/VaultPhotoAlbums";

async function getVaultAlbums(weddingId: string): Promise<{ albums: VaultAlbum[]; albumPhotos: PhotoRow[] }> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return { albums: [], albumPhotos: [] };

  const [{ data: albums, error: albumError }, { data: photos }] = await Promise.all([
    client.from("photo_albums" as never).select("*").eq("wedding_id", weddingId).order("sort_order"),
    client
      .from("photos")
      .select("id, image_url, uploaded_by, category, created_at, is_approved, album_id")
      .eq("wedding_id", weddingId)
      .eq("is_approved", true)
      .not("album_id" as never, "is", null)
      .order("created_at", { ascending: false }),
  ]);

  if (albumError && !shouldFallbackToDemoData(albumError)) return { albums: [], albumPhotos: [] };

  const photoList = (photos ?? []) as Array<Record<string, unknown>>;
  const countMap: Record<string, number> = {};
  for (const photo of photoList) {
    const albumId = photo.album_id as string | null;
    if (albumId) countMap[albumId] = (countMap[albumId] ?? 0) + 1;
  }

  const enrichedAlbums = ((albums ?? []) as Array<Record<string, unknown>>).map((album) => ({
    id: album.id as string,
    album_name: album.album_name as string,
    description: (album.description as string) ?? null,
    cover_photo: (album.cover_photo as string) ?? null,
    is_public: album.is_public as boolean,
    sort_order: album.sort_order as number,
    photo_count: countMap[album.id as string] ?? 0,
  }));

  return { albums: enrichedAlbums, albumPhotos: photoList as unknown as PhotoRow[] };
}

function formatArchiveDate(value?: string | null) {
  if (!value) return "Recently added";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recently added"
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatPostType(value?: string | null) {
  if (!value) return "Memory";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function initials(value?: string | null) {
  if (!value) return "SV";
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function SectionIntro({
  eyebrow,
  title,
  subtitle,
  inverse = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  inverse?: boolean;
}) {
  return (
    <div style={{ maxWidth: 720 }}>
      <p style={{ fontSize: ".6rem", letterSpacing: ".42em", textTransform: "uppercase", color: inverse ? "rgba(255,236,229,.7)" : "var(--color-accent)", marginBottom: ".55rem" }}>{eyebrow}</p>
      <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,4vw,3rem)", color: inverse ? "#fff" : "var(--color-text-primary)", lineHeight: 1.02 }}>{title}</h2>
      {subtitle && <p className="text-sm leading-7" style={{ color: inverse ? "rgba(255,255,255,.72)" : "var(--color-text-secondary)", marginTop: ".75rem" }}>{subtitle}</p>}
    </div>
  );
}

function MemoryCard({
  post,
  featured = false,
}: {
  post: { id: string; title: string; content: string; media_url: string | null; post_type: string | null; posted_by: string | null; created_at: string };
  featured?: boolean;
}) {
  return (
    <article style={{ borderRadius: 26, overflow: "hidden", background: "rgba(255,255,255,.84)", border: "1px solid rgba(190,45,69,.10)", boxShadow: "0 18px 42px rgba(26,12,14,.08)" }}>
      {post.media_url && (
        <div style={{ position: "relative", height: featured ? 300 : 210 }}>
          <Image alt={post.title} src={post.media_url} fill className="object-cover" sizes={featured ? "(max-width: 1024px) 100vw, 55vw" : "(max-width: 1024px) 100vw, 30vw"} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(24,12,14,.55) 0%, transparent 58%)" }} />
        </div>
      )}
      <div style={{ padding: featured ? "1.45rem" : "1.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".8rem", flexWrap: "wrap", marginBottom: ".85rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: ".75rem" }}>
            <div style={{ width: featured ? 44 : 38, height: featured ? 44 : 38, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(190,45,69,.16), rgba(212,184,150,.30))", border: "1px solid rgba(190,45,69,.10)", fontFamily: "var(--font-display),Georgia,serif", fontWeight: 700 }}>{initials(post.posted_by ?? post.title)}</div>
            <div>
              <p style={{ fontSize: ".56rem", letterSpacing: ".28em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: ".2rem" }}>{formatPostType(post.post_type)}</p>
              <p style={{ fontSize: ".85rem", color: "var(--color-text-secondary)" }}>{post.posted_by ?? "Family archive"} / {formatArchiveDate(post.created_at)}</p>
            </div>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "7px 12px", background: "rgba(255,255,255,.72)", border: "1px solid rgba(190,45,69,.10)", color: "var(--color-text-secondary)", fontSize: ".62rem", letterSpacing: ".18em", textTransform: "uppercase" }}><Heart size={12} style={{ color: "var(--color-accent)" }} /> Saved</span>
        </div>
        <h3 className="font-display" style={{ fontSize: featured ? "clamp(1.6rem,3vw,2.3rem)" : "1.28rem", color: "var(--color-text-primary)", lineHeight: 1.05, marginBottom: ".75rem" }}>{post.title}</h3>
        <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)", fontSize: featured ? ".98rem" : ".9rem" }}>{post.content}</p>
      </div>
    </article>
  );
}

export default async function FamilyPage() {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/family")) redirect("/login?hint=vault&redirect=%2Ffamily");

  const isSquad = isSquadOrAbove(session.role);
  const [familyVault, capsules, { albums, albumPhotos }] = await Promise.all([
    getFamilyVaultBundle(),
    getTimeCapsules(weddingConfig.id),
    getVaultAlbums(weddingConfig.id),
  ]);

  const revealedCapsules = capsules.filter((capsule) => capsule.isRevealed);
  const lockedCapsules = capsules.filter((capsule) => !capsule.isRevealed);
  const brideFirst = weddingConfig.brideName.split(" ")[0];
  const groomFirst = weddingConfig.groomName.split(" ")[0];
  const heroImages = Array.from(new Set([...albums.map((album) => album.cover_photo).filter(Boolean), ...familyVault.photos.map((photo) => photo.image_url)])).slice(0, 4) as string[];
  const featuredPost = familyVault.posts[0] ?? null;
  const sidePosts = familyVault.posts.slice(1, 4);
  const mainHeroImage = heroImages[0] ?? featuredPost?.media_url ?? familyVault.photos[0]?.image_url ?? null;
  const collageImages = [
    heroImages[1] ?? familyVault.photos[1]?.image_url ?? null,
    heroImages[2] ?? familyVault.photos[2]?.image_url ?? null,
    heroImages[3] ?? familyVault.photos[3]?.image_url ?? null,
  ];
  const timelinePreview = familyVault.timeline.slice(0, 5);
  const featuredVideos = familyVault.videos.slice(0, 2);
  const recentPhotos = familyVault.photos.slice(0, 12);
  const timelineAccent = [
    "linear-gradient(135deg, rgba(190,45,69,.14), rgba(212,184,150,.16))",
    "linear-gradient(135deg, rgba(212,184,150,.18), rgba(190,45,69,.08))",
    "linear-gradient(135deg, rgba(100,98,255,.08), rgba(190,45,69,.12))",
    "linear-gradient(135deg, rgba(56,189,248,.10), rgba(190,45,69,.10))",
    "linear-gradient(135deg, rgba(245,158,11,.14), rgba(190,45,69,.08))",
  ];

  return (
    <ElderModeWrapper>
      <style>{`
        .vault-page{background:radial-gradient(circle at top right,rgba(190,45,69,.06),transparent 24%),radial-gradient(circle at 12% 38%,rgba(212,184,150,.11),transparent 26%),linear-gradient(180deg,#fffdfb 0%,#f7efe8 38%,#fcf8f4 100%)}
        .vault-hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);gap:1.4rem;padding:clamp(1.35rem,3vw,2rem);border-radius:34px;overflow:hidden;background:radial-gradient(circle at top left,rgba(255,241,232,.16),transparent 34%),radial-gradient(circle at bottom right,rgba(190,45,69,.18),transparent 28%),linear-gradient(140deg,#17080a 0%,#241014 46%,#3c1720 100%);border:1px solid rgba(255,255,255,.08);box-shadow:0 34px 80px rgba(14,4,8,.28)}
        .vault-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.85rem;margin-top:1.7rem}
        .vault-metric{border-radius:22px;padding:.95rem 1rem;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.10)}
        .vault-tags{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:1.4rem}
        .vault-tag{display:inline-flex;align-items:center;gap:.45rem;padding:.68rem .9rem;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.78);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}
        .vault-collage{display:grid;grid-template-columns:1.1fr .8fr;gap:.85rem;min-height:500px}
        .vault-collage-main,.vault-collage-card{position:relative;border-radius:26px;overflow:hidden;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.08)}
        .vault-collage-stack{display:grid;gap:.85rem;grid-template-rows:1fr 1fr}
        .vault-surface{padding:clamp(1.25rem,2.2vw,1.8rem);border-radius:30px;background:rgba(255,255,255,.74);border:1px solid rgba(190,45,69,.10);box-shadow:0 24px 56px rgba(26,12,14,.08);backdrop-filter:blur(10px)}
        .vault-feed{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(300px,.9fr);gap:1rem}
        .vault-stack{display:grid;gap:1rem}
        .vault-duo{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.95fr);gap:1rem}
        .vault-capsules{background:radial-gradient(circle at top left,rgba(212,72,96,.16),transparent 26%),radial-gradient(circle at bottom right,rgba(201,150,10,.10),transparent 24%),linear-gradient(160deg,#18090c 0%,#241014 42%,#120609 100%)}
        .vault-dark-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:22px;padding:.95rem 1rem;color:rgba(255,255,255,.72);backdrop-filter:blur(10px)}
        .vault-composer{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:1rem}
        .vault-squad{border-radius:34px;padding:clamp(1.4rem,2.6vw,2rem);background:radial-gradient(circle at top right,rgba(190,45,69,.09),transparent 28%),linear-gradient(180deg,rgba(255,255,255,.84),rgba(248,243,238,.92));border:1px solid rgba(190,45,69,.10);box-shadow:0 28px 60px rgba(26,12,14,.08)}
        .vault-poll-wrap{padding:clamp(1.1rem,2.4vw,1.6rem);border-radius:32px;background:radial-gradient(circle at top left,rgba(212,184,150,.16),transparent 20%),rgba(255,255,255,.66);border:1px solid rgba(190,45,69,.08);box-shadow:0 20px 48px rgba(26,12,14,.08)}
        @media (max-width:1100px){.vault-hero,.vault-feed,.vault-duo,.vault-composer{grid-template-columns:1fr}.vault-collage{min-height:380px}}
        @media (max-width:760px){.vault-metrics{grid-template-columns:1fr}.vault-collage{grid-template-columns:1fr;min-height:auto}.vault-collage-main{min-height:280px}.vault-collage-stack{grid-template-columns:1fr 1fr;grid-template-rows:auto}.vault-feed{grid-template-columns:1fr}}
      `}</style>

      <div className="vault-page">
        <CapsuleUnlockBanner capsules={capsules} />
        <Container className="pt-5 pb-8 sm:pt-8 sm:pb-10">
          <section className="vault-hero">
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.4rem" }}>
              <div>
                <p style={{ fontSize: ".64rem", letterSpacing: ".42em", textTransform: "uppercase", color: "rgba(255,235,230,.72)", marginBottom: ".9rem" }}>
                  Family vault / {formatDate(familyVault.wedding.wedding_date)} / {familyVault.wedding.venue_name}
                </p>
                <h1 className="font-display" style={{ fontSize: "clamp(2.6rem,7vw,5.75rem)", lineHeight: ".95", color: "#fff", maxWidth: 720 }}>
                  The wedding now lives like a memory feed.
                </h1>
                <p className="text-base leading-8" style={{ color: "rgba(255,244,240,.76)", maxWidth: 650, marginTop: "1rem" }}>
                  A private archive for {brideFirst} and {groomFirst}, with family stories, albums, films, and sealed messages that keep unfolding long after the celebration ends.
                </p>
              </div>

              <div className="vault-tags">
                <span className="vault-tag"><Sparkles size={14} /> Private archive</span>
                <span className="vault-tag"><Images size={14} /> {albums.length} curated album{albums.length === 1 ? "" : "s"}</span>
                <span className="vault-tag"><Lock size={14} /> Invite-only family access</span>
                {isSquad ? <span className="vault-tag"><Shield size={14} /> Squad access enabled</span> : null}
              </div>

              <div className="vault-metrics">
                <div className="vault-metric">
                  <p style={{ fontSize: ".62rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,236,229,.62)" }}>Stories saved</p>
                  <p className="font-display" style={{ fontSize: "2rem", color: "#fff", marginTop: ".35rem" }}>{familyVault.posts.length}</p>
                  <p style={{ fontSize: ".84rem", color: "rgba(255,244,240,.68)", marginTop: ".25rem" }}>Messages and blessings from the people closest to them.</p>
                </div>
                <div className="vault-metric">
                  <p style={{ fontSize: ".62rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,236,229,.62)" }}>Media moments</p>
                  <p className="font-display" style={{ fontSize: "2rem", color: "#fff", marginTop: ".35rem" }}>{familyVault.photos.length + familyVault.videos.length}</p>
                  <p style={{ fontSize: ".84rem", color: "rgba(255,244,240,.68)", marginTop: ".25rem" }}>Photos, films, and galleries building the family archive.</p>
                </div>
                <div className="vault-metric">
                  <p style={{ fontSize: ".62rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,236,229,.62)" }}>Capsules waiting</p>
                  <p className="font-display" style={{ fontSize: "2rem", color: "#fff", marginTop: ".35rem" }}>{lockedCapsules.length}</p>
                  <p style={{ fontSize: ".84rem", color: "rgba(255,244,240,.68)", marginTop: ".25rem" }}>{revealedCapsules.length} already open, with more set aside for future anniversaries.</p>
                </div>
              </div>
            </div>

            <div className="vault-collage">
              <div className="vault-collage-main" style={{ minHeight: 500 }}>
                {mainHeroImage ? (
                  <>
                    <Image alt={`${brideFirst} and ${groomFirst} family vault`} src={mainHeroImage} fill className="object-cover" sizes="(max-width: 1100px) 100vw, 40vw" />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(16,8,10,.86) 0%, rgba(16,8,10,.08) 60%)" }} />
                  </>
                ) : (
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02))" }} />
                )}

                <div style={{ position: "absolute", inset: "auto 0 0 0", padding: "1.4rem" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "8px 12px", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.14)", color: "rgba(255,246,242,.86)", fontSize: ".62rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: ".85rem" }}>
                    <Heart size={12} /> Featured memory
                  </div>
                  <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,4vw,3rem)", color: "#fff", lineHeight: 1.02 }}>
                    {featuredPost?.title ?? "The family archive is ready for the first chapter."}
                  </h2>
                  <p className="text-sm leading-7" style={{ color: "rgba(255,245,241,.72)", marginTop: ".7rem", maxWidth: 500 }}>
                    {featuredPost?.content ?? "Once memories begin arriving, this surface turns into a living record of the wedding and everything that follows after it."}
                  </p>
                </div>
              </div>

              <div className="vault-collage-stack">
                {collageImages.map((image, index) => (
                  <div key={`hero-image-${index}`} className="vault-collage-card" style={{ minHeight: 0 }}>
                    {image ? (
                      <>
                        <Image alt={`Family vault collage ${index + 1}`} src={image} fill className="object-cover" sizes="(max-width: 760px) 50vw, 20vw" />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(18,9,12,.78) 0%, rgba(18,9,12,.08) 64%)" }} />
                      </>
                    ) : (
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.02))" }} />
                    )}
                    <div style={{ position: "absolute", inset: "auto 0 0 0", padding: "1rem" }}>
                      <p style={{ fontSize: ".56rem", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,238,233,.62)", marginBottom: ".32rem" }}>
                        {index === 0 ? "Albums" : index === 1 ? "Family feed" : "Sealed for later"}
                      </p>
                      <p className="font-display" style={{ fontSize: "1.15rem", color: "#fff" }}>
                        {index === 0 ? `${albums.length} visual chapters` : index === 1 ? `${familyVault.posts.length} saved stories` : `${capsules.length} future messages`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Container>

        <VaultNav isSquad={isSquad} />

        <Container className="space-y-8 py-8 sm:space-y-10 sm:py-10 lg:py-12">
          <section id="memories" style={{ scrollMarginTop: "8rem" }} className="space-y-6">
            <SectionIntro
              eyebrow="Memory feed"
              title="Stories from the celebration, arranged with more presence."
              subtitle="Instead of reading like a utility page, the family vault now opens as a visual feed of blessings, photos, and posts that feel worth revisiting."
            />

            {featuredPost ? (
              <div className="vault-feed">
                <MemoryCard post={featuredPost} featured />
                <div className="vault-stack">
                  {sidePosts.length ? sidePosts.map((post) => <MemoryCard key={post.id} post={post} />) : (
                    <div className="vault-surface" style={{ display: "grid", gap: ".9rem", alignContent: "start" }}>
                      <div style={{ display: "inline-flex", width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center", background: "rgba(190,45,69,.08)", color: "var(--color-accent)" }}>
                        <PenLine size={18} />
                      </div>
                      <div>
                        <p style={{ fontSize: ".6rem", letterSpacing: ".36em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: ".5rem" }}>Archive open</p>
                        <h3 className="font-display" style={{ fontSize: "2rem", color: "var(--color-text-primary)", lineHeight: 1.04 }}>The next story belongs here.</h3>
                      </div>
                      <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
                        Once more family members add blessings, anniversary notes, and wedding-day memories, they will appear here as a layered feed.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="vault-surface" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
                <div style={{ width: 56, height: 56, borderRadius: 20, display: "grid", placeItems: "center", margin: "0 auto 1rem", background: "rgba(190,45,69,.08)", color: "var(--color-accent)" }}>
                  <Heart size={24} />
                </div>
                <h3 className="font-display" style={{ fontSize: "2rem", color: "var(--color-text-primary)" }}>The archive is ready for its first post.</h3>
                <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)", maxWidth: 520, margin: ".85rem auto 0" }}>
                  Family stories will appear here as a polished feed once the couple or their loved ones start adding memories.
                </p>
              </div>
            )}

            <div className="vault-composer">
              <div className="vault-surface" style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
                <p style={{ fontSize: ".6rem", letterSpacing: ".36em", textTransform: "uppercase", color: "var(--color-accent)" }}>Add your voice</p>
                <h3 className="font-display" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "var(--color-text-primary)", lineHeight: 1.02 }}>
                  Help the vault feel alive, not archived away.
                </h3>
                <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
                  Share a blessing, an anniversary note, or a small wedding-day detail. The goal is to make this feel like an intimate social archive the family keeps returning to.
                </p>

                <div className="vault-stack">
                  <div style={{ borderRadius: 24, padding: "1rem 1.1rem", background: "linear-gradient(135deg, rgba(190,45,69,.08), rgba(212,184,150,.14))", border: "1px solid rgba(190,45,69,.08)" }}>
                    <p style={{ fontSize: ".58rem", letterSpacing: ".28em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: ".45rem" }}>What belongs here</p>
                    <p style={{ fontSize: ".92rem", lineHeight: 1.7, color: "var(--color-text-secondary)" }}>
                      Ceremony memories, candid stories, blessings from elders, and the kind of family moments that would never fit inside a formal gallery.
                    </p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: ".7rem" }}>
                    {[
                      { label: "Feed entries", value: familyVault.posts.length },
                      { label: "Photos", value: familyVault.photos.length },
                      { label: "Films", value: familyVault.videos.length },
                    ].map((item) => (
                      <div key={item.label} style={{ borderRadius: 20, padding: ".95rem", background: "rgba(255,255,255,.8)", border: "1px solid rgba(190,45,69,.08)" }}>
                        <p className="font-display" style={{ fontSize: "1.6rem", color: "var(--color-text-primary)" }}>{item.value}</p>
                        <p style={{ fontSize: ".72rem", color: "var(--color-text-muted)", marginTop: ".25rem" }}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <FamilyPostForm weddingId={weddingConfig.id} authorEmail={session.email} />
            </div>
          </section>

          <section id="timeline" style={{ scrollMarginTop: "8rem" }} className="space-y-6">
            <SectionIntro
              eyebrow="Timeline and film"
              title="The archive should flow through time, not stop at the wedding."
              subtitle="This section ties together the years ahead with highlight films and anniversary milestones so the vault feels like a living continuation of the story."
            />

            <div className="vault-duo">
              <div className="vault-surface">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
                  <div>
                    <p style={{ fontSize: ".58rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: ".45rem" }}>Anniversary reel</p>
                    <h3 className="font-display" style={{ fontSize: "2rem", color: "var(--color-text-primary)", lineHeight: 1.04 }}>A timeline with emotional weight.</h3>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "8px 12px", background: "rgba(190,45,69,.06)", border: "1px solid rgba(190,45,69,.10)", color: "var(--color-text-secondary)", fontSize: ".62rem", letterSpacing: ".18em", textTransform: "uppercase" }}>
                    <Clock size={12} style={{ color: "var(--color-accent)" }} /> {timelinePreview.length} moments previewed
                  </span>
                </div>

                <div className="vault-stack">
                  {timelinePreview.map((entry, index) => (
                    <article key={`${entry.year}-${entry.title}`} style={{ display: "grid", gridTemplateColumns: "72px minmax(0, 1fr)", gap: "1rem", padding: "1rem", borderRadius: 22, background: timelineAccent[index % timelineAccent.length], border: "1px solid rgba(190,45,69,.08)" }}>
                      <div style={{ borderRadius: 18, padding: ".8rem .75rem", background: "rgba(255,255,255,.82)", border: "1px solid rgba(190,45,69,.08)", textAlign: "center" }}>
                        <p className="font-display" style={{ fontSize: "1.45rem", color: "var(--color-text-primary)", lineHeight: 1 }}>{entry.year}</p>
                        <p style={{ fontSize: ".56rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--color-text-muted)", marginTop: ".35rem" }}>Archive</p>
                      </div>
                      <div>
                        <p style={{ fontSize: ".58rem", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: ".35rem" }}>Chapter {index + 1}</p>
                        <h4 className="font-display" style={{ fontSize: "1.3rem", color: "var(--color-text-primary)", lineHeight: 1.06 }}>{entry.title}</h4>
                        <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)", marginTop: ".5rem" }}>{entry.detail}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="vault-stack">
                <div className="vault-surface">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <p style={{ fontSize: ".58rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: ".45rem" }}>Highlight film</p>
                      <h3 className="font-display" style={{ fontSize: "1.9rem", color: "var(--color-text-primary)", lineHeight: 1.05 }}>A more cinematic corner of the vault.</h3>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "8px 12px", background: "rgba(190,45,69,.06)", border: "1px solid rgba(190,45,69,.10)", color: "var(--color-text-secondary)", fontSize: ".62rem", letterSpacing: ".18em", textTransform: "uppercase" }}>
                      <Video size={12} style={{ color: "var(--color-accent)" }} /> {familyVault.videos.length} film{familyVault.videos.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {featuredVideos.length ? (
                    <div className="vault-stack">
                      {featuredVideos.map((video) => (
                        <article key={video.id} style={{ borderRadius: 24, overflow: "hidden", background: "#12080a", border: "1px solid rgba(190,45,69,.12)", boxShadow: "0 20px 40px rgba(15,6,9,.12)" }}>
                          <div style={{ position: "relative", paddingTop: "56.25%" }}>
                            <iframe
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                              src={video.video_url}
                              title={video.title}
                              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                            />
                          </div>
                          <div style={{ padding: "1rem 1.1rem", color: "#fff" }}>
                            <p style={{ fontSize: ".58rem", letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(255,230,222,.54)", marginBottom: ".35rem" }}>Film saved</p>
                            <h4 className="font-display" style={{ fontSize: "1.4rem", lineHeight: 1.04 }}>{video.title}</h4>
                            <p style={{ fontSize: ".84rem", color: "rgba(255,240,236,.68)", marginTop: ".45rem" }}>{formatArchiveDate(video.created_at)}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div style={{ borderRadius: 24, padding: "2rem 1.25rem", background: "linear-gradient(160deg, rgba(25,10,12,.96), rgba(47,18,24,.94))", color: "#fff", border: "1px solid rgba(255,255,255,.08)" }}>
                      <p style={{ fontSize: ".58rem", letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(255,230,222,.54)", marginBottom: ".45rem" }}>Coming soon</p>
                      <h4 className="font-display" style={{ fontSize: "1.8rem", lineHeight: 1.06 }}>The highlight film has room to land beautifully.</h4>
                      <p className="text-sm leading-7" style={{ color: "rgba(255,240,236,.72)", marginTop: ".8rem" }}>
                        Once the couple adds a film, this panel turns into the cinematic anchor for the post-wedding archive.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="photos" style={{ scrollMarginTop: "8rem" }} className="space-y-6">
            <SectionIntro
              eyebrow="Albums and gallery"
              title="Photo browsing should feel closer to a curated social gallery."
              subtitle="Albums now sit inside a stronger editorial frame, while the latest photos stay easy to scan like a modern post-wedding feed."
            />

            <div className="vault-duo">
              <div className="vault-surface">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontSize: ".58rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: ".45rem" }}>Album shelf</p>
                    <h3 className="font-display" style={{ fontSize: "2rem", color: "var(--color-text-primary)", lineHeight: 1.04 }}>Curated chapters from the vault.</h3>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "8px 12px", background: "rgba(190,45,69,.06)", border: "1px solid rgba(190,45,69,.10)", color: "var(--color-text-secondary)", fontSize: ".62rem", letterSpacing: ".18em", textTransform: "uppercase" }}>
                    <Images size={12} style={{ color: "var(--color-accent)" }} /> {albumPhotos.length} album photo{albumPhotos.length === 1 ? "" : "s"}
                  </span>
                </div>

                <VaultPhotoAlbums albums={albums} photos={albumPhotos} />
              </div>

              <div className="vault-surface">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontSize: ".58rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: ".45rem" }}>Latest captures</p>
                    <h3 className="font-display" style={{ fontSize: "2rem", color: "var(--color-text-primary)", lineHeight: 1.04 }}>A livelier scroll of the celebration.</h3>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "8px 12px", background: "rgba(190,45,69,.06)", border: "1px solid rgba(190,45,69,.10)", color: "var(--color-text-secondary)", fontSize: ".62rem", letterSpacing: ".18em", textTransform: "uppercase" }}>
                    <Sparkles size={12} style={{ color: "var(--color-accent)" }} /> {recentPhotos.length} shown now
                  </span>
                </div>

                <PhotoGrid photos={recentPhotos} />
              </div>
            </div>
          </section>

          <section id="capsules" style={{ scrollMarginTop: "8rem" }} className="space-y-6">
            <div className="vault-surface vault-capsules" style={{ color: "#fff" }}>
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <SectionIntro
                  eyebrow="Time capsules"
                  title="Messages for future anniversaries deserve a more cinematic stage."
                  subtitle="Sealed notes, delayed reveals, and video capsules are one of the most emotional parts of the platform, so this section now leads with more atmosphere and clearer hierarchy."
                  inverse
                />

                <div className="vault-metrics">
                  <div className="vault-dark-card">
                    <p style={{ fontSize: ".58rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,236,229,.54)" }}>Sealed</p>
                    <p className="font-display" style={{ fontSize: "2rem", color: "#fff", marginTop: ".4rem" }}>{lockedCapsules.length}</p>
                    <p style={{ fontSize: ".84rem", marginTop: ".25rem" }}>Messages waiting quietly for future reveal dates.</p>
                  </div>
                  <div className="vault-dark-card">
                    <p style={{ fontSize: ".58rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,236,229,.54)" }}>Revealed</p>
                    <p className="font-display" style={{ fontSize: "2rem", color: "#fff", marginTop: ".4rem" }}>{revealedCapsules.length}</p>
                    <p style={{ fontSize: ".84rem", marginTop: ".25rem" }}>Already opened and folded into the family archive.</p>
                  </div>
                  <div className="vault-dark-card">
                    <p style={{ fontSize: ".58rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,236,229,.54)" }}>Future films</p>
                    <p className="font-display" style={{ fontSize: "2rem", color: "#fff", marginTop: ".4rem" }}>{familyVault.videos.length}</p>
                    <p style={{ fontSize: ".84rem", marginTop: ".25rem" }}>Video messages and highlight films saved alongside the written archive.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="vault-composer">
              <div className="vault-stack">
                <TimeCapsuleForm
                  weddingDate={weddingConfig.weddingDate}
                  brideName={weddingConfig.brideName}
                  groomName={weddingConfig.groomName}
                />
                <VideoTimeCapsuleForm
                  weddingDate={weddingConfig.weddingDate}
                  brideName={weddingConfig.brideName}
                  groomName={weddingConfig.groomName}
                />
              </div>

              <div className="vault-surface">
                <VaultCapsuleSection capsules={capsules} />
              </div>
            </div>
          </section>

          <section id="polls" style={{ scrollMarginTop: "8rem" }}>
            <div className="vault-poll-wrap">
              <FamilyPolls
                weddingId={weddingConfig.id}
                isAdmin={session.role === "admin"}
                voterEmail={session.email}
              />
            </div>
          </section>

          {isSquad ? (
            <section id="squad" style={{ scrollMarginTop: "8rem" }} className="vault-squad">
              <SectionIntro
                eyebrow="Squad hub"
                title="A sharper backstage layer for the people helping keep the vault alive."
                subtitle="This gives the squad a dedicated visual zone inside the family archive, with quick prompts for posting, collecting, and keeping the wedding story active after the event."
              />

              <div className="vault-duo" style={{ marginTop: "1.5rem" }}>
                <div className="vault-stack">
                  <div style={{ borderRadius: 26, padding: "1.2rem", background: "linear-gradient(135deg, rgba(190,45,69,.08), rgba(212,184,150,.16))", border: "1px solid rgba(190,45,69,.08)" }}>
                    <p style={{ fontSize: ".58rem", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: ".5rem" }}>Squad focus</p>
                    <h3 className="font-display" style={{ fontSize: "1.9rem", lineHeight: 1.04, color: "var(--color-text-primary)" }}>Keep the feed moving while the memories are fresh.</h3>
                    <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)", marginTop: ".7rem" }}>
                      Share candid moments, help pull standout photos into albums, and make sure the post-wedding experience feels active instead of forgotten.
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: ".8rem" }}>
                    {[
                      { icon: PenLine, label: "Post a recap", detail: "Add a moment from the wedding day that the couple will want to revisit." },
                      { icon: Images, label: "Curate albums", detail: "Group the best photos into visual chapters that feel intentional." },
                      { icon: Clock, label: "Watch reveals", detail: "Keep an eye on future capsule unlocks and anniversaries." },
                    ].map(({ icon: Icon, label, detail }) => (
                      <div key={label} style={{ borderRadius: 22, padding: "1rem", background: "rgba(255,255,255,.82)", border: "1px solid rgba(190,45,69,.08)" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(190,45,69,.08)", color: "var(--color-accent)", marginBottom: ".8rem" }}>
                          <Icon size={18} />
                        </div>
                        <p className="font-display" style={{ fontSize: "1.1rem", color: "var(--color-text-primary)", marginBottom: ".35rem" }}>{label}</p>
                        <p style={{ fontSize: ".82rem", lineHeight: 1.6, color: "var(--color-text-secondary)" }}>{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="vault-stack">
                  <div style={{ position: "relative", minHeight: 320, borderRadius: 28, overflow: "hidden", background: "linear-gradient(140deg, rgba(190,45,69,.16), rgba(212,184,150,.18))", border: "1px solid rgba(190,45,69,.08)" }}>
                    {mainHeroImage ? (
                      <>
                        <Image alt="Squad vault preview" src={mainHeroImage} fill className="object-cover" sizes="(max-width: 1100px) 100vw, 30vw" />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,10,12,.84), rgba(20,10,12,.08))" }} />
                      </>
                    ) : null}
                    <div style={{ position: "absolute", inset: "auto 0 0 0", padding: "1.2rem", color: "#fff" }}>
                      <p style={{ fontSize: ".58rem", letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(255,235,230,.6)", marginBottom: ".35rem" }}>Signed in as</p>
                      <h3 className="font-display" style={{ fontSize: "1.8rem", lineHeight: 1.04 }}>{session.role === "admin" ? "Admin view" : "Squad access"}</h3>
                      <p style={{ fontSize: ".88rem", color: "rgba(255,242,238,.72)", marginTop: ".45rem" }}>{session.email}</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: ".8rem" }}>
                    {[
                      { value: recentPhotos.length, label: "Recent photos" },
                      { value: capsules.length, label: "Capsules tracked" },
                      { value: albums.length, label: "Albums live" },
                      { value: familyVault.posts.length, label: "Stories posted" },
                    ].map((item) => (
                      <div key={item.label} style={{ borderRadius: 22, padding: "1rem", background: "rgba(255,255,255,.82)", border: "1px solid rgba(190,45,69,.08)" }}>
                        <p className="font-display" style={{ fontSize: "1.8rem", color: "var(--color-text-primary)" }}>{item.value}</p>
                        <p style={{ fontSize: ".72rem", color: "var(--color-text-muted)", marginTop: ".25rem" }}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </Container>
      </div>
    </ElderModeWrapper>
  );
}
