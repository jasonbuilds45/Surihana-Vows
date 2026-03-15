import type { Metadata } from "next";
import { SlideShow } from "@/components/gallery/SlideShow";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { DownloadAlbumButton } from "@/components/gallery/DownloadAlbumButton";
import { PageHero } from "@/components/layout/PageHero";
import { weddingConfig } from "@/lib/config";
import { getGalleryPhotos, getSlideshowPhotos } from "@/modules/premium/photo-gallery";

export const metadata: Metadata = { title: `Gallery — ${weddingConfig.celebrationTitle}` };

const ROSE = "#C0364A";
const INK  = "#1A1012";
const BF   = "var(--font-body), -apple-system, system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";

export default async function GalleryPage() {
  const [photos, slides] = await Promise.all([getGalleryPhotos(), Promise.resolve(getSlideshowPhotos())]);
  return (
    <div style={{ background: "#FFFFFF" }}>
      <PageHero eyebrow="Gallery" title={<>Every frame,<br /><em>preserved.</em></>} subtitle="Professional photography and candid moments — curated and downloadable." variant="warm" />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem clamp(1.25rem,5vw,4rem) 0" }}>
        <SlideShow slides={slides} />
      </div>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2.5rem clamp(1.25rem,5vw,4rem) 0" }}>
        <div style={{ background: "#FAF8F6", borderRadius: 20, border: "1px solid #E4D8D4", padding: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: ROSE, marginBottom: "0.5rem", fontFamily: BF }}>Full album</p>
            <h3 style={{ fontFamily: DF, fontSize: "1.5rem", fontWeight: 700, color: INK, letterSpacing: "-0.015em" }}>Take every memory home</h3>
          </div>
          <DownloadAlbumButton weddingId={weddingConfig.id} />
        </div>
      </div>
      <div style={{ padding: "2.5rem clamp(1.25rem,5vw,4rem) 6rem", maxWidth: "1280px", margin: "0 auto" }}>
        <PhotoGrid photos={photos} />
      </div>
    </div>
  );
}
