import type { Metadata } from "next";
import { SlideShow } from "@/components/gallery/SlideShow";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { DownloadAlbumButton } from "@/components/gallery/DownloadAlbumButton";
import { LuxuryPageHero } from "@/components/layout/LuxuryPageHero";
import { weddingConfig } from "@/lib/config";
import { getGalleryPhotos, getSlideshowPhotos } from "@/modules/premium/photo-gallery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Gallery — ${weddingConfig.celebrationTitle}`,
  description: "Every frame from Marion & Livingston's wedding — curated and downloadable.",
};

const DF = "'Cormorant Garamond',var(--font-display),Georgia,serif";
const BF = "'Manrope',var(--font-body),system-ui,sans-serif";
const ROSE = "var(--rose,#BE2D45)";
const INK  = "var(--ink,#120B0E)";

export default async function GalleryPage() {
  const [photos, slides] = await Promise.all([
    getGalleryPhotos(weddingConfig.id),
    Promise.resolve(getSlideshowPhotos()),
  ]);

  return (
    <div style={{ background: "var(--bg,#FDFAF7)", minHeight: "100vh" }}>

      <LuxuryPageHero
        eyebrow="Gallery"
        letter="G"
        title={
          <>
            Every frame,<br />
            <em style={{ color: "rgba(255,255,255,.88)" }}>preserved.</em>
          </>
        }
        subtitle="Professional photography and candid moments — curated, downloadable, and kept forever."
        below={
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".625rem" }}>
            {[
              { val: `${photos.length}`, label: photos.length === 1 ? "photograph" : "photographs" },
              { val: "Full res", label: "download available" },
            ].map(({ val, label }) => (
              <div key={label} style={{
                display: "inline-flex", alignItems: "baseline", gap: 7,
                padding: "6px 14px", borderRadius: 999,
                background: "rgba(255,255,255,.14)",
                border: "1px solid rgba(255,255,255,.28)",
                backdropFilter: "blur(8px)",
              }}>
                <span style={{ fontFamily: DF, fontSize: ".95rem", fontWeight: 600, color: "#fff" }}>{val}</span>
                <span style={{ fontFamily: BF, fontSize: ".56rem", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.58)" }}>{label}</span>
              </div>
            ))}
          </div>
        }
      />

      {/* Slideshow */}
      <div style={{
        maxWidth: "var(--max-w,1320px)", margin: "0 auto",
        padding: "clamp(2.5rem,5vh,4rem) var(--pad-x,clamp(1.25rem,5vw,5rem)) 0",
      }}>
        <SlideShow slides={slides} />
      </div>

      {/* Download banner */}
      <div style={{
        maxWidth: "var(--max-w,1320px)", margin: "0 auto",
        padding: "clamp(1.5rem,3vh,2.5rem) var(--pad-x,clamp(1.25rem,5vw,5rem))",
      }}>
        <div style={{
          borderRadius: 20, overflow: "hidden",
          border: "1px solid rgba(190,45,69,.10)",
          boxShadow: "0 2px 12px rgba(15,10,11,.05)",
        }}>
          <div style={{
            background: "linear-gradient(140deg,#0F0A0B 0%,#1C1214 55%,#0F0A0B 100%)",
            padding: "clamp(1.25rem,3vw,1.875rem) clamp(1.5rem,4vw,2.25rem)",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg,transparent,rgba(190,45,69,.50) 30%,rgba(201,150,10,.70) 50%,rgba(190,45,69,.50) 70%,transparent)" }} />
            <div>
              <p style={{ fontFamily: BF, fontSize: ".46rem", letterSpacing: ".36em",
                textTransform: "uppercase", color: "rgba(240,190,198,.55)",
                fontWeight: 700, marginBottom: ".5rem" }}>Full album</p>
              <h3 style={{ fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                fontSize: "clamp(1.1rem,2.5vw,1.5rem)", color: "rgba(255,252,248,.90)", lineHeight: 1.1 }}>
                Take every memory home.
              </h3>
            </div>
            <DownloadAlbumButton weddingId={weddingConfig.id} />
          </div>
        </div>
      </div>

      {/* Photo grid */}
      <div style={{
        maxWidth: "var(--max-w,1320px)", margin: "0 auto",
        padding: "clamp(1.5rem,3vh,2.5rem) var(--pad-x,clamp(1.25rem,5vw,5rem)) clamp(4rem,8vh,6rem)",
      }}>
        <div style={{ marginBottom: "clamp(1.5rem,3vh,2.25rem)" }}>
          <p style={{ fontFamily: BF, fontSize: ".46rem", letterSpacing: ".40em",
            textTransform: "uppercase", color: ROSE, fontWeight: 700, marginBottom: ".4rem" }}>
            All photographs
          </p>
          <h2 style={{ fontFamily: DF, fontWeight: 300,
            fontSize: "clamp(1.5rem,3vw,2.25rem)", color: INK,
            lineHeight: 1.05, letterSpacing: "-.025em" }}>
            The full collection.
          </h2>
        </div>
        <PhotoGrid photos={photos} />
      </div>
    </div>
  );
}
