"use client";

/**
 * EmbeddedEventMap — Step 3
 * Lazy-loaded Google Maps iframe for guest event cards.
 * Uses the existing mapLink / venue string — no admin systems touched.
 */

import { useEffect, useRef, useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";

interface EmbeddedEventMapProps {
  venueName: string;
  mapLink:   string;
}

const BF = "var(--font-body), system-ui, sans-serif";

export function EmbeddedEventMap({ venueName, mapLink }: EmbeddedEventMapProps) {
  const [loaded,  setLoaded]  = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy load: only inject the iframe when the element scrolls into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Build a Google Maps embed URL from the mapLink or venue name
  const embedQuery = encodeURIComponent(venueName);
  const embedSrc   = `https://www.google.com/maps/embed/v1/place?key=AIzaSyD-placeholder&q=${embedQuery}`;

  // Fallback static map when no API key — uses a search redirect instead
  const fallbackSrc = `https://maps.google.com/maps?q=${embedQuery}&output=embed&z=15`;

  return (
    <div ref={containerRef} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--color-border)", background: "var(--color-surface-muted)" }}>
      {/* Map frame */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%" /* 16:9 */, background: "#EDE0DC" }}>
        {visible ? (
          <iframe
            title={`Map — ${venueName}`}
            src={fallbackSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setLoaded(true)}
            style={{
              position:  "absolute",
              inset:     0,
              width:     "100%",
              height:    "100%",
              border:    "none",
              opacity:   loaded ? 1 : 0,
              transition: "opacity .4s ease",
            }}
          />
        ) : (
          /* Placeholder while not yet in viewport */
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
            <MapPin size={22} style={{ color: "var(--color-accent-soft)" }} />
            <p style={{ fontSize: ".72rem", color: "var(--color-text-muted)", fontFamily: BF }}>Map loading…</p>
          </div>
        )}
        {/* Loading shimmer */}
        {visible && !loaded && (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #EDE0DC 25%, #F5EDE8 50%, #EDE0DC 75%)", backgroundSize: "200% 100%", animation: "mapShimmer 1.5s infinite" }} />
        )}
      </div>

      {/* Open in Google Maps button */}
      <div style={{ padding: ".625rem 1rem", background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={12} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
          <p style={{ fontSize: ".78rem", color: "var(--color-text-secondary)", fontFamily: BF, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
            {venueName}
          </p>
        </div>
        <a
          href={mapLink}
          target="_blank"
          rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 999, background: "var(--color-accent)", color: "#fff", fontSize: ".68rem", fontWeight: 700, fontFamily: BF, letterSpacing: ".12em", textTransform: "uppercase", textDecoration: "none" }}
        >
          <ExternalLink size={11} /> Open in Google Maps
        </a>
      </div>

      <style>{`@keyframes mapShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

export default EmbeddedEventMap;
