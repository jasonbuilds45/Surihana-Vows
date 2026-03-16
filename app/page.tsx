import Link from "next/link";
import type { Metadata } from "next";
import { weddingConfig } from "@/lib/config";
import { getSlideshowPhotos } from "@/modules/premium/photo-gallery";
import { formatDate } from "@/utils/formatDate";

export const metadata: Metadata = {
  title: `${weddingConfig.brideName} & ${weddingConfig.groomName} | ${weddingConfig.celebrationTitle}`,
  description: weddingConfig.heroSubtitle,
};

const BF = "var(--font-body), system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";
const STRIPE = "linear-gradient(90deg,#D94F62 0%,#C0364A 25%,#B8820A 50%,#C0364A 75%,#D94F62 100%)";

export default async function HomePage() {
  const slides = getSlideshowPhotos();
  const hero =
    slides[0]?.imageUrl ??
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80";

  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;

  return (
    <div style={{ minHeight: "100dvh", background: "#0e0809", color: "#fff", overflowX: "hidden" }}>
      {/* ── Full-bleed hero image ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden
      />

      {/* ── Gradient overlay ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(14,8,9,.30) 0%, rgba(14,8,9,.15) 35%, rgba(14,8,9,.65) 70%, rgba(14,8,9,.97) 100%)",
        }}
        aria-hidden
      />

      {/* ── Top stripe ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: STRIPE, zIndex: 10 }} />

      {/* ── Main content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "3rem clamp(1.5rem, 6vw, 5rem) 5rem",
          textAlign: "center",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: ".625rem",
            padding: "6px 20px",
            borderRadius: 999,
            marginBottom: "2rem",
            background: "rgba(255,255,255,.10)",
            border: "1px solid rgba(255,255,255,.20)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#F5C5CB",
            }}
          />
          <span
            style={{
              fontSize: ".62rem",
              letterSpacing: ".30em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.85)",
              fontFamily: BF,
              fontWeight: 600,
            }}
          >
            {formatDate(weddingConfig.weddingDate)} &nbsp;·&nbsp; {weddingConfig.venueCity}
          </span>
        </div>

        {/* Couple names */}
        <h1
          style={{
            fontFamily: DF,
            fontSize: "clamp(3.5rem, 14vw, 9rem)",
            fontWeight: 700,
            lineHeight: 0.88,
            letterSpacing: "-.03em",
            color: "#fff",
            marginBottom: ".25em",
            textShadow: "0 2px 24px rgba(0,0,0,.35)",
          }}
        >
          {bf}
        </h1>
        <h1
          style={{
            fontFamily: DF,
            fontSize: "clamp(3.5rem, 14vw, 9rem)",
            fontWeight: 700,
            lineHeight: 0.88,
            letterSpacing: "-.03em",
            color: "#F5C5CB",
            marginBottom: ".6em",
            textShadow: "0 2px 24px rgba(0,0,0,.35)",
          }}
        >
          &amp; {gf}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(.875rem, 1.8vw, 1.0625rem)",
            color: "rgba(255,255,255,.65)",
            maxWidth: "34rem",
            lineHeight: 1.80,
            marginBottom: "2.75rem",
            fontFamily: BF,
          }}
        >
          {weddingConfig.heroSubtitle}
        </p>

        {/* CTA */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
          <Link
            href="/invite/john-family"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "15px 36px",
              borderRadius: 999,
              background: "#C0364A",
              color: "#fff",
              fontSize: ".9375rem",
              fontWeight: 700,
              fontFamily: BF,
              textDecoration: "none",
              letterSpacing: ".08em",
              boxShadow: "0 8px 32px rgba(192,54,74,.40)",
              transition: "transform .18s, box-shadow .18s",
            }}
          >
            Open Invitation
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>

          <Link
            href="/rsvp"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "15px 28px",
              borderRadius: 999,
              background: "rgba(255,255,255,.10)",
              color: "rgba(255,255,255,.88)",
              fontSize: ".9rem",
              fontWeight: 600,
              fontFamily: BF,
              textDecoration: "none",
              border: "1.5px solid rgba(255,255,255,.22)",
              backdropFilter: "blur(8px)",
              letterSpacing: ".04em",
            }}
          >
            RSVP
          </Link>
        </div>

        {/* Bottom strip — date · venue · dress code */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 3,
            background: "rgba(14,8,9,.80)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,.07)",
            display: "flex",
            justifyContent: "center",
            gap: "clamp(1.5rem,5vw,3.5rem)",
            padding: "1rem clamp(1.25rem,5vw,4rem)",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Date",  value: formatDate(weddingConfig.weddingDate) },
            { label: "Venue", value: weddingConfig.venueName },
            { label: "Dress", value: weddingConfig.dressCode.split(",")[0]! },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: ".48rem", letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(255,255,255,.32)", fontFamily: BF, fontWeight: 600, marginBottom: 3 }}>
                {label}
              </p>
              <p style={{ fontSize: ".78rem", color: "rgba(255,255,255,.82)", fontFamily: BF, fontWeight: 600 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom stripe ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 2, background: STRIPE, zIndex: 10 }} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        h1, p, a, div[style*="inline-flex"] {
          animation: fadeUp .7s ease both;
        }
      `}</style>
    </div>
  );
}
