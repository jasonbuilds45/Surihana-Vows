"use client";

/**
 * CoupleMessageVideo — Step 6
 * Guest-facing video greeting from the couple.
 * Supports YouTube, Vimeo, and direct video URLs.
 * Autoplay disabled. Play/mute controls. Lazy loaded.
 * No admin systems touched.
 */

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";

interface CoupleMessageVideoProps {
  videoUrl:   string;   // YouTube / Vimeo embed URL, or direct .mp4 URL
  title?:     string;
  subtitle?:  string;
  brideName:  string;
  groomName:  string;
}

const DF = "var(--font-display), Georgia, serif";
const BF = "var(--font-body), system-ui, sans-serif";

function getEmbedUrl(url: string, muted: boolean): string {
  // YouTube
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const id = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)?.[1] ?? "";
    return `https://www.youtube.com/embed/${id}?autoplay=0&mute=${muted ? 1 : 0}&rel=0&modestbranding=1`;
  }
  // Vimeo
  if (url.includes("vimeo.com")) {
    const id = url.match(/vimeo\.com\/(\d+)/)?.[1] ?? "";
    return `https://player.vimeo.com/video/${id}?autoplay=0&muted=${muted ? 1 : 0}&title=0&byline=0&portrait=0`;
  }
  return url;
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
}

export function CoupleMessageVideo({ videoUrl, title, subtitle, brideName, groomName }: CoupleMessageVideoProps) {
  const [visible, setVisible] = useState(false);
  const [muted,   setMuted]   = useState(true);
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);

  const bf = brideName.split(" ")[0]!;
  const gf = groomName.split(" ")[0]!;

  // Lazy load when in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const direct = isDirectVideo(videoUrl);

  return (
    <section
      ref={containerRef}
      style={{
        background: "linear-gradient(160deg, #1A0C10 0%, #2A1218 100%)",
        padding: "4rem clamp(1.25rem,6vw,5rem)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontSize: ".58rem", letterSpacing: ".42em", textTransform: "uppercase", color: "rgba(245,197,203,.65)", fontFamily: BF, marginBottom: ".5rem" }}>
            A message from the couple
          </p>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(1.5rem,4vw,2.5rem)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: ".5rem" }}>
            {title ?? `${bf} & ${gf} want to say hello.`}
          </h2>
          {subtitle && (
            <p style={{ fontSize: ".9rem", color: "rgba(255,255,255,.5)", fontFamily: BF }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Video frame */}
        <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.08)" }}>
          {visible ? (
            direct ? (
              /* Direct video file */
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  muted={muted}
                  playsInline
                  style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />
                <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 8 }}>
                  {!playing && (
                    <button
                      type="button"
                      onClick={() => videoRef.current?.play()}
                      style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,.9)", border: "none", display: "grid", placeItems: "center", cursor: "pointer" }}
                    >
                      <Play size={18} style={{ color: "#1A0C10", marginLeft: 2 }} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMuted(m => !m)}
                    style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,.45)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.2)", display: "grid", placeItems: "center", cursor: "pointer" }}
                  >
                    {muted ? <VolumeX size={14} style={{ color: "#fff" }} /> : <Volume2 size={14} style={{ color: "#fff" }} />}
                  </button>
                </div>
              </>
            ) : (
              /* Embed (YouTube / Vimeo) */
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src={getEmbedUrl(videoUrl, muted)}
                  title={title ?? `Message from ${bf} & ${gf}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                />
                {/* Mute toggle overlay */}
                <button
                  type="button"
                  onClick={() => setMuted(m => !m)}
                  style={{ position: "absolute", bottom: 12, right: 12, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,.45)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.2)", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 10 }}
                >
                  {muted ? <VolumeX size={14} style={{ color: "#fff" }} /> : <Volume2 size={14} style={{ color: "#fff" }} />}
                </button>
              </div>
            )
          ) : (
            /* Placeholder before load */
            <div style={{ aspectRatio: "16/9", background: "rgba(255,255,255,.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,.1)", display: "grid", placeItems: "center" }}>
                <Play size={22} style={{ color: "rgba(255,255,255,.6)", marginLeft: 3 }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CoupleMessageVideo;
