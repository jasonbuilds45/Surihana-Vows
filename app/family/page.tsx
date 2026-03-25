import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Camera, Clock, Images,
  Lock, PenLine, Video,
} from "lucide-react";
import { Container }            from "@/components/layout/Container";
import { TimeCapsuleForm }      from "@/components/vault/TimeCapsuleForm";
import { VideoTimeCapsuleForm } from "@/components/vault/VideoTimeCapsuleForm";
import { ElderModeWrapper }     from "@/components/vault/ElderMode";
import { CapsuleUnlockBanner }  from "@/components/vault/CapsuleUnlockBanner";
import { VaultPhotoAlbums }     from "@/components/vault/VaultPhotoAlbums";
import { VaultCapsuleSection }  from "@/components/vault/VaultCapsuleSection";
import { VaultNav }             from "@/components/vault/VaultNav";
import { FamilyFeed }           from "@/components/vault/FamilyFeed";
import { FamilyPolls }          from "@/components/vault/FamilyPolls";
import {
  getSessionFromCookieStore,
  isSquadOrAbove,
  roleCanAccess,
} from "@/lib/auth";
import { weddingConfig }        from "@/lib/config";
import { getFamilyVaultBundle } from "@/modules/luxury/family-vault";
import { getTimeCapsules }      from "@/modules/luxury/time-capsule";
import {
  getConfiguredSupabaseClient,
  shouldFallbackToDemoData,
} from "@/lib/supabaseClient";
import type { PhotoRow } from "@/lib/types";
import type { VaultAlbum } from "@/components/vault/VaultPhotoAlbums";

// ── Album helper ──────────────────────────────────────────────────────────────
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

  const enrichedAlbums = ((albums ?? []) as Array<Record<string, unknown>>).map(album => ({
    id:           album.id as string,
    album_name:   album.album_name as string,
    description:  (album.description as string) ?? null,
    cover_photo:  (album.cover_photo as string) ?? null,
    is_public:    album.is_public as boolean,
    sort_order:   album.sort_order as number,
    photo_count:  countMap[album.id as string] ?? 0,
  }));

  return { albums: enrichedAlbums, albumPhotos: photoList as unknown as PhotoRow[] };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(value?: string | null) {
  if (!value) return "SV";
  return value.split(/\s+/).filter(Boolean).slice(0,2).map(p => p[0]!.toUpperCase()).join("");
}

function formatDate(value?: string | null) {
  if (!value) return "Recently";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Recently"
    : d.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
export default async function FamilyPage() {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/family")) {
    redirect("/login?hint=vault&redirect=%2Ffamily");
  }

  const isSquad   = isSquadOrAbove(session.role);
  const authorName = session.email.split("@")[0] ?? "Family member";

  const [familyVault, capsules, { albums, albumPhotos }] = await Promise.all([
    getFamilyVaultBundle(),
    getTimeCapsules(weddingConfig.id),
    getVaultAlbums(weddingConfig.id),
  ]);

  const revealedCapsules  = capsules.filter(c => c.isRevealed);
  const lockedCapsules    = capsules.filter(c => !c.isRevealed);
  const recentPhotos      = familyVault.photos.slice(0, 12);
  const timelinePreview   = familyVault.timeline.slice(0, 5);
  const featuredVideos    = familyVault.videos.slice(0, 2);
  const bf                = weddingConfig.brideName.split(" ")[0]!;
  const gf                = weddingConfig.groomName.split(" ")[0]!;
  const mainHeroImage     = familyVault.photos[0]?.image_url ?? albums[0]?.cover_photo ?? null;

  const timelineAccent = [
    "linear-gradient(135deg,rgba(190,45,69,.12),rgba(212,184,150,.14))",
    "linear-gradient(135deg,rgba(212,184,150,.16),rgba(190,45,69,.08))",
    "linear-gradient(135deg,rgba(100,98,255,.08),rgba(190,45,69,.10))",
    "linear-gradient(135deg,rgba(56,189,248,.08),rgba(190,45,69,.08))",
    "linear-gradient(135deg,rgba(245,158,11,.12),rgba(190,45,69,.08))",
  ];

  return (
    <ElderModeWrapper>
      <style>{`
        /* ── Layout ── */
        .fv-page   { background: radial-gradient(circle at top right,rgba(190,45,69,.05),transparent 24%), radial-gradient(circle at 12% 38%,rgba(212,184,150,.08),transparent 26%), linear-gradient(180deg,#FFFDFB 0%,#F7EFE8 38%,#FCF8F4 100%); }
        .fv-grid   { display:grid; gap:1.1rem; grid-template-columns:1fr; }
        .fv-duo    { display:grid; gap:.9rem; }
        .fv-card   { background:#fff; border-radius:22px; border:1px solid rgba(190,45,69,.09); box-shadow:0 4px 22px rgba(26,12,14,.06); }
        .fv-inset  { background:rgba(250,246,240,.80); border-radius:18px; border:1px solid rgba(190,45,69,.08); padding:1rem 1.1rem; }

        /* ── Social feed layout: main + sticky sidebar ── */
        .fv-social { display:grid; gap:1.1rem; align-items:start; }

        /* ── Stories ── */
        .fv-stories      { display:flex; gap:.8rem; overflow-x:auto; padding:.7rem 0 .85rem; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
        .fv-stories::-webkit-scrollbar { display:none; }
        .fv-story-item   { flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:.35rem; cursor:pointer; }
        .fv-story-ring   { width:64px; height:64px; border-radius:50%; padding:2px; background:linear-gradient(135deg,#BE2D45,#B8820A); flex-shrink:0; }
        .fv-story-ring.seen { background:linear-gradient(135deg,rgba(190,45,69,.20),rgba(184,130,10,.20)); }
        .fv-story-inner  { width:100%; height:100%; border-radius:50%; overflow:hidden; border:2px solid #FFFDFB; position:relative; background:rgba(190,45,69,.06); }
        .fv-story-label  { font-size:.54rem; color:var(--color-text-muted); white-space:nowrap; max-width:62px; overflow:hidden; text-overflow:ellipsis; text-align:center; }
        .fv-add-story    { flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:.35rem; cursor:pointer; }
        .fv-add-ring     { width:64px; height:64px; border-radius:50%; border:2px dashed rgba(190,45,69,.28); display:grid; place-items:center; background:rgba(190,45,69,.04); position:relative; }
        .fv-add-plus     { position:absolute; bottom:1px; right:1px; width:20px; height:20px; border-radius:50%; background:linear-gradient(135deg,#BE2D45,#7E2032); display:grid; place-items:center; border:2px solid #FFFDFB; color:#fff; font-size:13px; font-weight:700; line-height:1; }

        /* ── Vault section ── */
        .fv-dark   { background:radial-gradient(circle at top left,rgba(212,72,96,.14),transparent 24%), radial-gradient(circle at bottom right,rgba(201,150,10,.08),transparent 22%), linear-gradient(160deg,#18090C 0%,#241014 42%,#120609 100%); border-radius:24px; padding:clamp(1.2rem,2.4vw,1.8rem); color:#fff; }
        .fv-metric { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.09); border-radius:16px; padding:.85rem .95rem; }
        .fv-metrics{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.7rem; margin-top:1.2rem; }
        .fv-poll   { border-radius:24px; background:radial-gradient(circle at top left,rgba(212,184,150,.12),transparent 20%),rgba(255,255,255,.72); border:1px solid rgba(190,45,69,.08); padding:clamp(1rem,2.2vw,1.5rem); box-shadow:0 14px 38px rgba(26,12,14,.06); }
        .fv-squad  { border-radius:24px; padding:clamp(1.2rem,2.4vw,1.8rem); background:radial-gradient(circle at top right,rgba(190,45,69,.07),transparent 28%),linear-gradient(180deg,rgba(255,255,255,.84),rgba(248,243,238,.92)); border:1px solid rgba(190,45,69,.08); box-shadow:0 20px 48px rgba(26,12,14,.06); }

        .fv-eyebrow { font-size:.58rem; letter-spacing:.38em; text-transform:uppercase; color:var(--color-accent); }
        .fv-section-title { font-family:var(--font-display),Georgia,serif; font-size:clamp(1.5rem,3vw,2.2rem); color:var(--color-text-primary); line-height:1.04; }
        .fv-scroll-margin { scroll-margin-top:9rem; }

        /* ── Responsive ── */
        @media(min-width:768px) {
          .fv-social { grid-template-columns:minmax(0,1fr) 300px; }
          .fv-duo    { grid-template-columns:1fr 1fr; }
        }
        @media(min-width:1100px) {
          .fv-social { grid-template-columns:minmax(0,580px) 300px; justify-content:center; }
        }
        @media(max-width:640px) {
          .fv-metrics { grid-template-columns:1fr 1fr; }
          .fv-metrics .fv-metric:last-child { grid-column:1/-1; }
        }
      `}</style>

      <div className="fv-page">
        <CapsuleUnlockBanner capsules={capsules} />

        {/* ── Stories strip (album thumbnails as story rings) ── */}
        <div style={{
          borderBottom:"1px solid rgba(190,45,69,.07)",
          background:"rgba(255,253,251,.96)",
          backdropFilter:"blur(10px)",
          position:"sticky",
          top:"calc(var(--vault-header-height,57px))",
          zIndex:30,
        }}>
          <Container className="py-0">
            <div className="fv-stories">
              {/* Add story CTA */}
              <div className="fv-add-story">
                <div className="fv-add-ring">
                  <Camera size={20} color="rgba(190,45,69,.5)"/>
                  <div className="fv-add-plus">+</div>
                </div>
                <span className="fv-story-label">Add photo</span>
              </div>

              {/* Albums as story rings */}
              {albums.slice(0, 8).map(album => (
                <div key={album.id} className="fv-story-item">
                  <div className="fv-story-ring">
                    <div className="fv-story-inner">
                      {album.cover_photo ? (
                        <Image alt={album.album_name} src={album.cover_photo} fill className="object-cover" sizes="64px"/>
                      ) : (
                        <div style={{ position:"absolute",inset:0,display:"grid",placeItems:"center",background:"linear-gradient(135deg,rgba(190,45,69,.10),rgba(212,184,150,.16))" }}>
                          <Images size={18} color="rgba(190,45,69,.5)"/>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="fv-story-label">{album.album_name}</span>
                </div>
              ))}

              {/* Recent photos as story rings */}
              {recentPhotos.slice(0, 6).map((photo, i) => (
                <div key={photo.id} className={`fv-story-item`}>
                  <div className={`fv-story-ring${i > 1 ? " seen" : ""}`}>
                    <div className="fv-story-inner">
                      <Image alt="Family" src={photo.image_url} fill className="object-cover" sizes="64px"/>
                    </div>
                  </div>
                  <span className="fv-story-label">{photo.uploaded_by?.split(" ")[0] ?? "Family"}</span>
                </div>
              ))}
            </div>
          </Container>
        </div>

        {/* ── Tab nav ── */}
        <VaultNav isSquad={isSquad}/>

        <Container className="pt-5 pb-10 sm:pt-6 sm:pb-14">

          {/* ════════════════════════════════════════════════
              MEMORIES  — social feed + sticky sidebar
          ════════════════════════════════════════════════ */}
          <section id="memories" className="fv-scroll-margin">
            <div className="fv-social">

              {/* ── Feed column ── */}
              <div>
                <FamilyFeed
                  initialPosts={familyVault.posts}
                  weddingId={weddingConfig.id}
                  authorEmail={session.email}
                  authorName={authorName}
                />
              </div>

              {/* ── Sticky sidebar ── */}
              <div style={{ position:"sticky", top:"calc(var(--vault-header-height,57px) + 4rem)", display:"flex", flexDirection:"column", gap:"1rem" }}>

                {/* Vault stats */}
                <div className="fv-card" style={{ padding:"1.1rem 1.25rem" }}>
                  <p className="fv-eyebrow" style={{ marginBottom:".75rem" }}>Vault at a glance</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".6rem" }}>
                    {[
                      { label:"Stories",  value:familyVault.posts.length,  icon:PenLine  },
                      { label:"Photos",   value:familyVault.photos.length,  icon:Images   },
                      { label:"Films",    value:familyVault.videos.length,  icon:Video    },
                      { label:"Capsules", value:capsules.length,            icon:Lock     },
                    ].map(({ label, value, icon:Icon }) => (
                      <div key={label} style={{ borderRadius:14,padding:".7rem .9rem",background:"rgba(190,45,69,.04)",border:"1px solid rgba(190,45,69,.08)" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:".25rem" }}>
                          <Icon size={12} color="var(--color-accent)"/>
                          <p style={{ fontSize:".58rem",letterSpacing:".18em",textTransform:"uppercase",color:"var(--color-text-muted)" }}>{label}</p>
                        </div>
                        <p className="font-display" style={{ fontSize:"1.5rem",color:"var(--color-text-primary)" }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent photos mini-grid */}
                {recentPhotos.length > 0 && (
                  <div className="fv-card" style={{ padding:"1.1rem 1.25rem" }}>
                    <p className="fv-eyebrow" style={{ marginBottom:".6rem" }}>Recent photos</p>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:".4rem" }}>
                      {recentPhotos.slice(0,9).map((photo, i) => (
                        <div key={photo.id} style={{ position:"relative",aspectRatio:"1",borderRadius:10,overflow:"hidden",background:"rgba(190,45,69,.06)" }}>
                          <Image alt={`Photo ${i+1}`} src={photo.image_url} fill className="object-cover" sizes="88px"/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sealed capsules widget */}
                {lockedCapsules.length > 0 && (
                  <div style={{ borderRadius:18,padding:"1rem 1.1rem",background:"linear-gradient(140deg,#18090C,#241014)",border:"1px solid rgba(255,255,255,.08)",color:"#fff" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:".55rem" }}>
                      <Lock size={13} color="rgba(255,220,210,.65)"/>
                      <p style={{ fontSize:".58rem",letterSpacing:".24em",textTransform:"uppercase",color:"rgba(255,220,210,.65)" }}>Sealed capsules</p>
                    </div>
                    <p className="font-display" style={{ fontSize:"1.55rem",lineHeight:1.05 }}>{lockedCapsules.length} message{lockedCapsules.length!==1?"s":""} waiting</p>
                    <p style={{ fontSize:".82rem",color:"rgba(255,236,230,.60)",marginTop:".38rem",lineHeight:1.6 }}>Sealed for future anniversaries. Unlock automatically.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════
              TIMELINE + FILM
          ════════════════════════════════════════════════ */}
          <section id="timeline" className="fv-scroll-margin" style={{ marginTop:"2.5rem" }}>
            <div style={{ display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:".75rem",marginBottom:"1.1rem" }}>
              <div>
                <p className="fv-eyebrow">Timeline &amp; film</p>
                <h2 className="fv-section-title">The archive grows beyond the wedding day.</h2>
              </div>
            </div>

            <div className="fv-duo">
              {/* Timeline */}
              <div className="fv-card" style={{ padding:"1.25rem" }}>
                <p className="fv-eyebrow" style={{ marginBottom:".5rem" }}>Anniversary reel</p>
                <h3 className="font-display" style={{ fontSize:"1.7rem",color:"var(--color-text-primary)",lineHeight:1.05,marginBottom:"1.1rem" }}>Moments with emotional weight.</h3>
                <div style={{ display:"grid",gap:".75rem" }}>
                  {timelinePreview.map((entry, i) => (
                    <article key={`${entry.year}-${i}`} style={{ display:"grid",gridTemplateColumns:"64px 1fr",gap:".875rem",padding:".9rem",borderRadius:18,background:timelineAccent[i%timelineAccent.length],border:"1px solid rgba(190,45,69,.07)" }}>
                      <div style={{ borderRadius:14,padding:".7rem .6rem",background:"rgba(255,255,255,.80)",border:"1px solid rgba(190,45,69,.07)",textAlign:"center" }}>
                        <p className="font-display" style={{ fontSize:"1.35rem",color:"var(--color-text-primary)",lineHeight:1 }}>{entry.year}</p>
                        <p style={{ fontSize:".52rem",letterSpacing:".16em",textTransform:"uppercase",color:"var(--color-text-muted)",marginTop:".3rem" }}>Archive</p>
                      </div>
                      <div>
                        <p style={{ fontSize:".54rem",letterSpacing:".22em",textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:".3rem" }}>Chapter {i+1}</p>
                        <h4 className="font-display" style={{ fontSize:"1.2rem",color:"var(--color-text-primary)",lineHeight:1.06 }}>{entry.title}</h4>
                        <p style={{ fontSize:".86rem",lineHeight:1.7,color:"var(--color-text-secondary)",marginTop:".45rem" }}>{entry.detail}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Highlight film */}
              <div className="fv-card" style={{ padding:"1.25rem" }}>
                <p className="fv-eyebrow" style={{ marginBottom:".5rem" }}>Highlight film</p>
                <h3 className="font-display" style={{ fontSize:"1.7rem",color:"var(--color-text-primary)",lineHeight:1.05,marginBottom:"1.1rem" }}>A cinematic corner of the vault.</h3>

                {featuredVideos.length ? (
                  <div style={{ display:"grid",gap:"1rem" }}>
                    {featuredVideos.map(video => (
                      <article key={video.id} style={{ borderRadius:20,overflow:"hidden",background:"#12080A",border:"1px solid rgba(190,45,69,.12)" }}>
                        <div style={{ position:"relative",paddingTop:"56.25%" }}>
                          <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" src={video.video_url} title={video.title} style={{ position:"absolute",inset:0,width:"100%",height:"100%",border:0 }}/>
                        </div>
                        <div style={{ padding:"1rem 1.1rem",color:"#fff" }}>
                          <p style={{ fontSize:".56rem",letterSpacing:".22em",textTransform:"uppercase",color:"rgba(255,230,222,.54)",marginBottom:".3rem" }}>Film saved</p>
                          <h4 className="font-display" style={{ fontSize:"1.35rem",lineHeight:1.04 }}>{video.title}</h4>
                          <p style={{ fontSize:".84rem",color:"rgba(255,240,236,.68)",marginTop:".4rem" }}>{formatDate(video.created_at)}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div style={{ borderRadius:20,padding:"2rem 1.25rem",background:"linear-gradient(160deg,rgba(25,10,12,.96),rgba(47,18,24,.94))",color:"#fff",border:"1px solid rgba(255,255,255,.07)" }}>
                    <p style={{ fontSize:".56rem",letterSpacing:".22em",textTransform:"uppercase",color:"rgba(255,230,222,.54)",marginBottom:".4rem" }}>Coming soon</p>
                    <h4 className="font-display" style={{ fontSize:"1.7rem",lineHeight:1.06 }}>The highlight film will land here.</h4>
                    <p style={{ fontSize:".88rem",lineHeight:1.7,color:"rgba(255,240,236,.68)",marginTop:".7rem" }}>Once the couple adds a film, this panel becomes the cinematic anchor of the post-wedding archive.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════
              PHOTOS
          ════════════════════════════════════════════════ */}
          <section id="photos" className="fv-scroll-margin" style={{ marginTop:"2.5rem" }}>
            <div style={{ display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:".75rem",marginBottom:"1.1rem" }}>
              <div>
                <p className="fv-eyebrow">Albums &amp; gallery</p>
                <h2 className="fv-section-title">Photo albums, curated by chapter.</h2>
              </div>
              <span style={{ fontSize:".62rem",letterSpacing:".18em",textTransform:"uppercase",color:"var(--color-text-muted)" }}>{albums.length} album{albums.length!==1?"s":""}</span>
            </div>

            <div className="fv-duo">
              <div className="fv-card" style={{ padding:"1.25rem" }}>
                <p className="fv-eyebrow" style={{ marginBottom:".5rem" }}>Album shelf</p>
                <h3 className="font-display" style={{ fontSize:"1.7rem",color:"var(--color-text-primary)",lineHeight:1.05,marginBottom:"1rem" }}>Curated chapters from the vault.</h3>
                <VaultPhotoAlbums albums={albums} photos={albumPhotos}/>
              </div>
              <div className="fv-card" style={{ padding:"1.25rem" }}>
                <p className="fv-eyebrow" style={{ marginBottom:".5rem" }}>Latest captures</p>
                <h3 className="font-display" style={{ fontSize:"1.7rem",color:"var(--color-text-primary)",lineHeight:1.05,marginBottom:"1rem" }}>A livelier scroll of the celebration.</h3>
                {recentPhotos.length === 0 ? (
                  <div style={{ textAlign:"center",padding:"2rem",borderRadius:16,background:"rgba(190,45,69,.04)",border:"1px dashed rgba(190,45,69,.14)" }}>
                    <Images size={28} style={{ margin:"0 auto .75rem",color:"rgba(190,45,69,.35)" }}/>
                    <p style={{ fontSize:".9rem",color:"var(--color-text-muted)" }}>No photos yet</p>
                  </div>
                ) : (
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:".6rem" }}>
                    {recentPhotos.map((photo,i) => (
                      <div key={photo.id} style={{ position:"relative",aspectRatio:i%5===0?"4/5":"1/1",borderRadius:14,overflow:"hidden",background:"rgba(190,45,69,.06)" }}>
                        <Image alt={photo.uploaded_by} src={photo.image_url} fill className="object-cover" sizes="(max-width:640px) 45vw, 160px"/>
                        <div style={{ position:"absolute",inset:"auto 0 0 0",padding:".5rem .6rem",background:"linear-gradient(to top,rgba(18,10,12,.72),transparent)" }}>
                          <p style={{ fontSize:".56rem",color:"rgba(255,240,235,.75)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{photo.uploaded_by}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════
              CAPSULES
          ════════════════════════════════════════════════ */}
          <section id="capsules" className="fv-scroll-margin" style={{ marginTop:"2.5rem" }}>
            {/* Dark header */}
            <div className="fv-dark" style={{ marginBottom:"1.1rem" }}>
              <p className="fv-eyebrow" style={{ color:"rgba(255,235,230,.7)" }}>Time capsules</p>
              <h2 className="fv-section-title" style={{ color:"#fff",marginTop:".35rem" }}>Messages sealed for future anniversaries.</h2>
              <div className="fv-metrics">
                {[
                  { label:"Sealed",    value:lockedCapsules.length,   note:"Waiting quietly for their reveal date." },
                  { label:"Revealed",  value:revealedCapsules.length,  note:"Opened and folded into the archive."   },
                  { label:"Films",     value:familyVault.videos.length,note:"Video messages alongside the written."  },
                ].map(({ label, value, note }) => (
                  <div key={label} className="fv-metric">
                    <p style={{ fontSize:".56rem",letterSpacing:".22em",textTransform:"uppercase",color:"rgba(255,236,229,.54)" }}>{label}</p>
                    <p className="font-display" style={{ fontSize:"1.9rem",color:"#fff",marginTop:".35rem" }}>{value}</p>
                    <p style={{ fontSize:".82rem",color:"rgba(255,236,230,.62)",marginTop:".2rem",lineHeight:1.6 }}>{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Composer + capsule grid */}
            <div className="fv-duo">
              <div style={{ display:"grid",gap:".85rem" }}>
                <TimeCapsuleForm weddingDate={weddingConfig.weddingDate} brideName={weddingConfig.brideName} groomName={weddingConfig.groomName}/>
                <VideoTimeCapsuleForm weddingDate={weddingConfig.weddingDate} brideName={weddingConfig.brideName} groomName={weddingConfig.groomName}/>
              </div>
              <div className="fv-card" style={{ padding:"1.25rem" }}>
                <VaultCapsuleSection capsules={capsules}/>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════
              POLLS
          ════════════════════════════════════════════════ */}
          <section id="polls" className="fv-scroll-margin" style={{ marginTop:"2.5rem" }}>
            <div className="fv-poll">
              <FamilyPolls
                weddingId={weddingConfig.id}
                isAdmin={session.role==="admin"}
                voterEmail={session.email}
              />
            </div>
          </section>

          {/* ════════════════════════════════════════════════
              SQUAD HUB
          ════════════════════════════════════════════════ */}
          {isSquad && (
            <section id="squad" className="fv-scroll-margin fv-squad" style={{ marginTop:"2.5rem" }}>
              <div style={{ display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:"1.25rem" }}>
                <div>
                  <p className="fv-eyebrow">Squad hub</p>
                  <h2 className="fv-section-title">Backstage access for the inner circle.</h2>
                </div>
              </div>

              <div className="fv-duo">
                {/* Left */}
                <div style={{ display:"grid",gap:".85rem" }}>
                  <div style={{ borderRadius:22,padding:"1.1rem",background:"linear-gradient(135deg,rgba(190,45,69,.07),rgba(212,184,150,.14))",border:"1px solid rgba(190,45,69,.07)" }}>
                    <p className="fv-eyebrow" style={{ marginBottom:".45rem" }}>Squad focus</p>
                    <h3 className="font-display" style={{ fontSize:"1.75rem",lineHeight:1.04,color:"var(--color-text-primary)" }}>Keep the feed moving while the memories are fresh.</h3>
                    <p style={{ fontSize:".88rem",lineHeight:1.7,color:"var(--color-text-secondary)",marginTop:".65rem" }}>Share candid moments, help curate albums, and ensure the post-wedding experience stays alive.</p>
                  </div>

                  <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:".75rem" }}>
                    {[
                      { icon:PenLine, label:"Post a recap",  note:"Add a moment from the day." },
                      { icon:Images,  label:"Curate albums", note:"Group photos into chapters." },
                      { icon:Clock,   label:"Watch reveals", note:"Track upcoming unlocks."     },
                    ].map(({ icon:Icon, label, note }) => (
                      <div key={label} style={{ borderRadius:20,padding:".9rem",background:"rgba(255,255,255,.80)",border:"1px solid rgba(190,45,69,.07)" }}>
                        <div style={{ width:36,height:36,borderRadius:12,display:"grid",placeItems:"center",background:"rgba(190,45,69,.07)",color:"var(--color-accent)",marginBottom:".7rem" }}>
                          <Icon size={16}/>
                        </div>
                        <p className="font-display" style={{ fontSize:"1rem",color:"var(--color-text-primary)",marginBottom:".28rem" }}>{label}</p>
                        <p style={{ fontSize:".80rem",lineHeight:1.6,color:"var(--color-text-secondary)" }}>{note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — hero photo + stats */}
                <div style={{ display:"grid",gap:".75rem" }}>
                  <div style={{ position:"relative",minHeight:260,borderRadius:24,overflow:"hidden",background:"linear-gradient(135deg,rgba(190,45,69,.10),rgba(212,184,150,.16))",border:"1px solid rgba(190,45,69,.07)" }}>
                    {mainHeroImage && (
                      <>
                        <Image alt="Vault" src={mainHeroImage} fill className="object-cover" sizes="(max-width:768px) 100vw,280px"/>
                        <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(20,10,12,.82),rgba(20,10,12,.06))" }}/>
                      </>
                    )}
                    <div style={{ position:"absolute",inset:"auto 0 0 0",padding:"1.1rem",color:"#fff" }}>
                      <p style={{ fontSize:".56rem",letterSpacing:".22em",textTransform:"uppercase",color:"rgba(255,235,230,.58)",marginBottom:".3rem" }}>Signed in as</p>
                      <h3 className="font-display" style={{ fontSize:"1.7rem",lineHeight:1.04 }}>{session.role==="admin"?"Admin view":"Squad access"}</h3>
                      <p style={{ fontSize:".86rem",color:"rgba(255,242,238,.70)",marginTop:".4rem" }}>{session.email}</p>
                    </div>
                  </div>

                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:".7rem" }}>
                    {[
                      { value:recentPhotos.length,       label:"Recent photos"   },
                      { value:capsules.length,           label:"Capsules tracked"},
                      { value:albums.length,             label:"Albums live"     },
                      { value:familyVault.posts.length,  label:"Stories posted"  },
                    ].map(item => (
                      <div key={item.label} style={{ borderRadius:18,padding:".85rem",background:"rgba(255,255,255,.78)",border:"1px solid rgba(190,45,69,.07)" }}>
                        <p className="font-display" style={{ fontSize:"1.7rem",color:"var(--color-text-primary)" }}>{item.value}</p>
                        <p style={{ fontSize:".70rem",color:"var(--color-text-muted)",marginTop:".22rem" }}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

        </Container>
      </div>
    </ElderModeWrapper>
  );
}
