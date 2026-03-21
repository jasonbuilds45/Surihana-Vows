/**
 * /preview-cinematic
 * Entry point — dynamic import prevents SSR touching Three.js at all.
 */
import dynamic from "next/dynamic";

const CinematicInvite = dynamic(
  () => import("./CinematicInvite"),
  {
    ssr: false,
    loading: () => (
      <div style={{
        position: "fixed", inset: 0, background: "#FAF6F0",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "1.5rem",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "1.5px solid rgba(190,45,69,.25)",
          borderTopColor: "#BE2D45",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif",
          fontStyle: "italic", fontSize: "1.1rem",
          color: "rgba(26,13,10,.50)", letterSpacing: ".06em",
        }}>Preparing your invitation…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    ),
  }
);

export default function PreviewCinematicPage() {
  return <CinematicInvite />;
}
