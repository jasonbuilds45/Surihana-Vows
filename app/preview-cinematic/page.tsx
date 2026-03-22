/**
 * /preview-cinematic
 * Entry point — dynamic import prevents SSR touching Three.js at all.
 */
import dynamic from "next/dynamic";
import { weddingConfig } from "@/lib/config";

const CinematicInvite = dynamic(
  () => import("./CinematicInvite"),
  {
    ssr: false,
    loading: () => (
      <div style={{
        position: "fixed", inset: 0, background: "#050305",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "1.5rem",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "1.5px solid rgba(201,150,10,.25)",
          borderTopColor: "#C9960A",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif",
          fontStyle: "italic", fontSize: "1.1rem",
          color: "rgba(255,255,255,.40)", letterSpacing: ".06em",
        }}>
          Preparing your invitation…
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    ),
  }
);

export default function PreviewCinematicPage() {
  return (
    <CinematicInvite
      inviteCode="preview"
      guestLabel="Our Dearest Guest"
      brideName={weddingConfig.brideName}
      groomName={weddingConfig.groomName}
      title={weddingConfig.celebrationTitle}
      subtitle={weddingConfig.heroSubtitle}
      weddingDate={new Date(weddingConfig.weddingDate).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })}
      venueName={weddingConfig.venueName}
      venueCity={weddingConfig.venueCity}
      heroPhotoUrl="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80"
      audioSrc={null}
    >
      {/* Preview mode — no invite content body needed */}
      <div />
    </CinematicInvite>
  );
}
