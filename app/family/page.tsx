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
        .vault-page{background:radial-gradient(circle at top right,rgba(190,45,69,.05),transparent 24%),radial-gradient(circle at 12% 38%,rgba(212,184,150,.09),transparent 26%),linear-gradient(180deg,#fffdfb 0%,#f7efe8 38%,#fcf8f4 100%)}
        .vault-surface{padding:clamp(1.1rem,2vw,1.6rem);border-radius:24px;background:rgba(255,255,255,.80);border:1px solid rgba(190,45,69,.09);box-shadow:0 18px 42px rgba(26,12,14,.07);backdrop-filter:blur(10px)}
        .vault-stack{display:grid;gap:.85rem}
        .vault-duo{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.95fr);gap:.85rem}
        .vault-composer{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:.85rem}
        .vault-stories{display:flex;gap:.85rem;overflow-x:auto;padding:.75rem 0 .9rem;scrollbar-width:none;-webkit-overflow-scrolling:touch}
        .vault-stories::-webkit-scrollbar{display:none}
        .vault-story-item{flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:.4rem;cursor:pointer}
        .vault-story-ring{position:relative;width:66px;height:66px;border-radius:50%;padding:2.5px;background:linear-gradient(135deg,#BE2D45,#B8820A,#BE2D45);flex-shrink:0}
        .vault-story-ring.seen{background:linear-gradient(135deg,rgba(190,45,69,.22),rgba(184,130,10,.22))}
        .vault-story-inner{width:100%;height:100%;border-radius:50%;overflow:hidden;border:2.5px solid #fffdfb;position:relative;background:rgba(190,45,69,.08)}
        .vault-story-label{font-size:.56rem;letter-spacing:.06em;color:var(--color-text-muted);white-space:nowrap;max-width:64px;overflow:hidden;text-overflow:ellipsis;text-align:center}
        .vault-add-story{flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:.4rem;cursor:pointer}
        .vault-add-ring{width:66px;height:66px;border-radius:50%;border:2px dashed rgba(190,45,69,.28);display:grid;place-items:center;background:rgba(190,45,69,.04);position:relative}
        .vault-add-plus{position:absolute;bottom:0;right:0;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#BE2D45,#7E2032);display:grid;place-items:center;border:2px solid #fffdfb;color:#fff;font-size:14px;font-weight:700;line-height:1}
        .vault-post-card{background:rgba(255,255,255,.88);border:1px solid rgba(190,45,69,.09);border-radius:22px;overflow:hidden;box-shadow:0 12px 32px rgba(26,12,14,.07)}
        .vault-post-header{display:flex;align-items:center;gap:.75rem;padding:.85rem 1rem .7rem}
        .vault-post-avatar{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,rgba(190,45,69,.16),rgba(212,184,150,.28));border:1px solid rgba(190,45,69,.12);font-family:var(--font-display),Georgia,serif;font-weight:700;font-size:.9rem;flex-shrink:0}
        .vault-post-meta{flex:1;min-width:0}
        .vault-post-author{font-size:.82rem;font-weight:600;color:var(--color-text-primary);line-height:1.2}
        .vault-post-time{font-size:.62rem;letter-spacing:.08em;color:var(--color-text-muted);margin-top:.1rem}
        .vault-post-type{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:rgba(190,45,69,.06);border:1px solid rgba(190,45,69,.10);font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:var(--color-accent);flex-shrink:0}
        .vault-post-media{position:relative;width:100%}
        .vault-post-body{padding:.85rem 1rem}
        .vault-post-title{font-family:var(--font-display),Georgia,serif;font-size:1.18rem;color:var(--color-text-primary);line-height:1.08;margin-bottom:.45rem}
        .vault-post-content{font-size:.88rem;line-height:1.7;color:var(--color-text-secondary)}
        .vault-post-actions{display:flex;align-items:center;gap:.5rem;padding:.7rem 1rem .9rem;border-top:1px solid rgba(190,45,69,.06)}
        .vault-action-btn{display:inline-flex;align-items:center;gap:.35rem;padding:.45rem .8rem;border-radius:999px;background:rgba(190,45,69,.05);border:1px solid rgba(190,45,69,.09);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--color-text-secondary);cursor:pointer;transition:background .15s}
        .vault-action-btn:hover{background:rgba(190,45,69,.10)}
        .vault-feed-col{display:grid;gap:.85rem;max-width:620px;margin:0 auto}
        .vault-feed-wrap{display:grid;grid-template-columns:minmax(0,620px) minmax(280px,.42fr);gap:1.1rem;align-items:start}
        .vault-sidebar{display:grid;gap:.85rem;position:sticky;top:calc(var(--vault-header-height,57px) + 3.5rem)}
        .vault-capsules{background:radial-gradient(circle at top left,rgba(212,72,96,.16),transparent 26%),radial-gradient(circle at bottom right,rgba(201,150,10,.10),transparent 24%),linear-gradient(160deg,#18090c 0%,#241014 42%,#120609 100%);border-radius:28px;padding:clamp(1.2rem,2.4vw,1.8rem)}
        .vault-dark-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:.85rem .95rem;color:rgba(255,255,255,.72);backdrop-filter:blur(10px)}
        .vault-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem;margin-top:1.4rem}
        .vault-poll-wrap{padding:clamp(1rem,2.2vw,1.5rem);border-radius:26px;background:radial-gradient(circle at top left,rgba(212,184,150,.14),transparent 20%),rgba(255,255,255,.72);border:1px solid rgba(190,45,69,.08);box-shadow:0 16px 40px rgba(26,12,14,.07)}
        .vault-squad{border-radius:28px;padding:clamp(1.2rem,2.4vw,1.8rem);background:radial-gradient(circle at top right,rgba(190,45,69,.08),transparent 28%),linear-gradient(180deg,rgba(255,255,255,.84),rgba(248,243,238,.92));border:1px solid rgba(190,45,69,.09);box-shadow:0 22px 50px rgba(26,12,14,.07)}
        .vault-section-head{display:flex;align-items:baseline;justify-content:space-between;gap:.75rem;margin-bottom:1rem}
        .vault-eyebrow{font-size:.58rem;letter-spacing:.38em;text-transform:uppercase;color:var(--color-accent)}
        .vault-section-title{font-family:var(--font-display),Georgia,serif;font-size:clamp(1.5rem,3vw,2.2rem);color:var(--color-text-primary);line-height:1.04}
        @media(max-width:1024px){.vault-feed-wrap{grid-template-columns:1fr}.vault-sidebar{position:static}.vault-duo,.vault-composer{grid-template-columns:1fr}}
        @media(max-width:640px){.vault-metrics{grid-template-columns:1fr 1fr}.vault-metrics .vault-dark-card:last-child{grid-column:1/-1}}
      `}</style>

      <div className="vault-page">
        <CapsuleUnlockBanner capsules={capsules} />

        {/* ── Stories strip ── */}
        <div style={{ borderBottom: "1px solid rgba(190,45,69,.07)", background: "rgba(255,253,251,.96)", backdropFilter: "blur(10px)", position: "sticky", top: "calc(var(--vault-header-height,57px))", zIndex: 30 }}>
          <Container style={{ paddingTop: 0, paddingBottom: 0 }}>
            <div className="vault-stories">
              <div className="vault-add-story">
                <div className="vault-add-ring">
                  <Images size={22} color="rgba(190,45,69,.5)" />
                  <div className="vault-add-plus">+</div>
                </div>
                <span className="vault-story-label">Add photo</span>
              </div>
              {albums.slice(0, 10).map((album) => (
                <div key={album.id} className="vault-story-item">
                  <div className="vault-story-ring">
                    <div className="vault-story-inner">
                      {album.cover_photo ? (
                        <Image alt={album.album_name} src={album.cover_photo} fill className="object-cover" sizes="66px" />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "linear-gradient(135deg,rgba(190,45,69,.12),rgba(212,184,150,.18))" }}>
                          <Images size={18} color="rgba(190,45,69,.5)" />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="vault-story-label">{album.album_name}</span>
                </div>
              ))}
              {recentPhotos.slice(0, 6).map((photo, i) => (
                <div key={photo.id} className="vault-story-item">
                  <div className={`vault-story-ring${i > 1 ? " seen" : ""}`}>
                    <div className="vault-story-inner">
                      <Image alt="Family moment" src={photo.image_url} fill className="object-cover" sizes="66px" />
                    </div>
                  </div>
                  <span className="vault-story-label">{photo.uploaded_by?.split(" ")[0] ?? "Family"}</span>
                </div>
              ))}
            </div>
          </Container>
        </div>

        <VaultNav isSquad={isSquad} />

        <Container className="pt-5 pb-8 sm:pt-6 sm:pb-10">
          {/* ── Feed + Sidebar ── */}
          <section id="memories" style={{ scrollMarginTop: "9rem" }}>
            <div className="vault-feed-wrap">
              {/* Feed column */}
              <div className="vault-feed-col">
                {familyVault.posts.length === 0 ? (
                  <div className="vault-surface" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 18, display: "grid", placeItems: "center", margin: "0 auto .85rem", background: "rgba(190,45,69,.07)", color: "var(--color-accent)" }}>
                      <Heart size={22} />
                    </div>
                    <h3 className="font-display" style={{ fontSize: "1.6rem", color: "var(--color-text-primary)" }}>The feed is ready for its first memory.</h3>
                    <p style={{ fontSize: ".88rem", lineHeight: 1.7, color: "var(--color-text-secondary)", maxWidth: 440, margin: ".7rem auto 0" }}>
                      Family stories will appear here as a scrollable feed once the couple and their loved ones start adding memories.
                    </p>
                  </div>
                ) : (
                  familyVault.posts.map((post) => (
                    <article key={post.id} className="vault-post-card">
                      <div className="vault-post-header">
                        <div className="vault-post-avatar">{initials(post.posted_by ?? post.title)}</div>
                        <div className="vault-post-meta">
                          <p className="vault-post-author">{post.posted_by ?? "Family archive"}</p>
                          <p className="vault-post-time">{formatArchiveDate(post.created_at)}</p>
                        </div>
                        <span className="vault-post-type"><Heart size={10} /> {formatPostType(post.post_type)}</span>
                      </div>
                      {post.media_url && (
                        <div className="vault-post-media" style={{ aspectRatio: "4/3" }}>
                          <Image alt={post.title} src={post.media_url} fill className="object-cover" sizes="(max-width:1024px) 100vw,620px" />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,10,12,.3) 0%, transparent 50%)" }} />
                        </div>
                      )}
                      <div className="vault-post-body">
                        <h3 className="vault-post-title">{post.title}</h3>
                        <p className="vault-post-content">{post.content}</p>
                      </div>
                      <div className="vault-post-actions">
                        <button type="button" className="vault-action-btn"><Heart size={12} /> Save</button>
                        <button type="button" className="vault-action-btn"><Sparkles size={12} /> Bless</button>
                      </div>
                    </article>
                  ))
                )}
                {/* Post composer */}
                <div className="vault-surface">
                  <p className="vault-eyebrow" style={{ marginBottom: ".5rem" }}>Add your voice</p>
                  <h3 className="font-display" style={{ fontSize: "1.35rem", color: "var(--color-text-primary)", lineHeight: 1.06, marginBottom: ".8rem" }}>Share a memory or blessing</h3>
                  <FamilyPostForm weddingId={weddingConfig.id} authorEmail={session.email} />
                </div>
              </div>

              {/* Sidebar */}
              <div className="vault-sidebar">
                <div className="vault-surface">
                  <p className="vault-eyebrow" style={{ marginBottom: ".8rem" }}>Vault at a glance</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".65rem" }}>
                    {[
                      { label: "Stories", value: familyVault.posts.length, icon: PenLine },
                      { label: "Photos", value: familyVault.photos.length, icon: Images },
                      { label: "Films", value: familyVault.videos.length, icon: Video },
                      { label: "Capsules", value: capsules.length, icon: Lock },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} style={{ borderRadius: 16, padding: ".75rem", background: "rgba(190,45,69,.04)", border: "1px solid rgba(190,45,69,.08)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: ".3rem" }}>
                          <Icon size={13} color="var(--color-accent)" />
                          <p style={{ fontSize: ".6rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>{label}</p>
                        </div>
                        <p className="font-display" style={{ fontSize: "1.55rem", color: "var(--color-text-primary)" }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {recentPhotos.length > 0 && (
                  <div className="vault-surface">
                    <p className="vault-eyebrow" style={{ marginBottom: ".5rem" }}>Recent photos</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: ".45rem", marginTop: ".5rem" }}>
                      {recentPhotos.slice(0, 9).map((photo, i) => (
                        <div key={photo.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", background: "rgba(190,45,69,.06)" }}>
                          <Image alt={`Capture ${i + 1}`} src={photo.image_url} fill className="object-cover" sizes="100px" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {lockedCapsules.length > 0 && (
                  <div style={{ borderRadius: 20, padding: "1rem 1.1rem", background: "linear-gradient(140deg,#18090c,#241014)", border: "1px solid rgba(255,255,255,.08)", color: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: ".6rem" }}>
                      <Lock size={14} color="rgba(255,220,210,.7)" />
                      <p style={{ fontSize: ".6rem", letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(255,220,210,.7)" }}>Sealed capsules</p>
                    </div>
                    <p className="font-display" style={{ fontSize: "1.6rem", lineHeight: 1.04 }}>{lockedCapsules.length} message{lockedCapsules.length === 1 ? "" : "s"} waiting</p>
                    <p style={{ fontSize: ".82rem", color: "rgba(255,236,230,.62)", marginTop: ".4rem", lineHeight: 1.6 }}>Sealed for future anniversaries. They unlock automatically on the dates chosen.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Timeline & Film ── */}
          <section id="timeline" style={{ scrollMarginTop: "9rem", marginTop: "2rem" }} className="space-y-4">
            <div className="vault-section-head">
              <div>
                <p className="vault-eyebrow">Timeline &amp; film</p>
                <h2 className="vault-section-title">The archive grows beyond the wedding day.</h2>
              </div>
            </div>

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

          <section id="photos" style={{ scrollMarginTop: "9rem", marginTop: "2rem" }} className="space-y-4">
            <div className="vault-section-head">
              <div>
                <p className="vault-eyebrow">Albums &amp; gallery</p>
                <h2 className="vault-section-title">Photo albums, curated by chapter.</h2>
              </div>
              <span style={{ fontSize: ".62rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>{albums.length} album{albums.length === 1 ? "" : "s"}</span>
            </div>

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

          <section id="capsules" style={{ scrollMarginTop: "9rem", marginTop: "2rem" }} className="space-y-4">
            <div className="vault-capsules" style={{ color: "#fff" }}>
              <div style={{ display: "grid", gap: "1.2rem" }}>
                <div>
                  <p className="vault-eyebrow" style={{ color: "rgba(255,235,230,.7)" }}>Time capsules</p>
                  <h2 className="vault-section-title" style={{ color: "#fff", marginTop: ".4rem" }}>Messages sealed for future anniversaries.</h2>
                </div>

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

          <section id="polls" style={{ scrollMarginTop: "9rem", marginTop: "2rem" }}>
            <div className="vault-poll-wrap">
              <FamilyPolls
                weddingId={weddingConfig.id}
                isAdmin={session.role === "admin"}
                voterEmail={session.email}
              />
            </div>
          </section>

          {isSquad ? (
            <section id="squad" style={{ scrollMarginTop: "9rem", marginTop: "2rem" }} className="vault-squad">
              <div className="vault-section-head">
                <div>
                  <p className="vault-eyebrow">Squad hub</p>
                  <h2 className="vault-section-title">Backstage access for the inner circle.</h2>
                </div>
              </div>

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
