"use client";

/**
 * InvitationCard — Step 2
 * A luxury digital invitation card shown to guests immediately after the
 * cinematic intro and before the hero section. Screenshot-friendly, shareable.
 * All content driven from weddingConfig — no admin systems touched.
 */

import { Calendar, MapPin, Sparkles } from "lucide-react";
import { formatDate } from "@/utils/formatDate";

interface InvitationCardProps {
  brideName:    string;
  groomName:    string;
  weddingDate:  string;
  weddingTime:  string;
  venueName:    string;
  venueAddress: string;
  venueCity:    string;
  celebrationTitle: string;
  onExplore?: () => void;
}

const DF = "var(--font-display), Georgia, serif";
const BF = "var(--font-body), system-ui, sans-serif";

export function InvitationCard({
  brideName, groomName, weddingDate, weddingTime,
  venueName, venueAddress, venueCity, celebrationTitle, onExplore,
}: InvitationCardProps) {
  const bf = brideName.split(" ")[0]!;
  const gf = groomName.split(" ")[0]!;

  return (
    <section
      style={{
        background: "linear-gradient(160deg, #FAF6F0 0%, #FFF8F2 50%, #FAF0EC 100%)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        padding: "4rem clamp(1.5rem, 6vw, 5rem)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Paper texture radial */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,179,155,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Card frame */}
      <div style={{
        maxWidth: 560,
        margin: "0 auto",
        background: "#FFFCF8",
        border: "1px solid rgba(212,179,155,0.55)",
        borderRadius: 24,
        boxShadow: "0 8px 40px rgba(138,90,68,0.10), 0 2px 8px rgba(138,90,68,0.06)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Rose-gold top stripe */}
        <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #C0364A, #B8820A, #C0364A, transparent)" }} />

        <div style={{ padding: "2.5rem 2rem 2rem" }}>
          {/* Eyebrow */}
          <p style={{ fontSize: ".58rem", letterSpacing: ".42em", textTransform: "uppercase", color: "#C0364A", fontFamily: BF, fontWeight: 700, marginBottom: "1.25rem" }}>
            {celebrationTitle}
          </p>

          {/* Ornamental divider top */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(192,54,74,0.3))" }} />
            <Sparkles size={14} style={{ color: "#B8820A", flexShrink: 0 }} />
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(192,54,74,0.3), transparent)" }} />
          </div>

          {/* Couple names */}
          <h2 style={{
            fontFamily: DF,
            fontSize: "clamp(2.25rem, 7vw, 3.5rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#1A1012",
            marginBottom: "0.5rem",
          }}>
            {bf}
          </h2>
          <p style={{ fontFamily: DF, fontSize: "1rem", color: "rgba(192,54,74,0.5)", marginBottom: "0.25rem", letterSpacing: ".08em" }}>&amp;</p>
          <h2 style={{
            fontFamily: DF,
            fontSize: "clamp(2.25rem, 7vw, 3.5rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#1A1012",
            marginBottom: "1.75rem",
          }}>
            {gf}
          </h2>

          {/* Ornamental divider middle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "1.75rem" }}>
            <div style={{ width: 32, height: 1, background: "rgba(192,54,74,0.25)" }} />
            <span style={{ fontFamily: DF, fontSize: "1rem", color: "#B8820A" }}>✦</span>
            <div style={{ width: 32, height: 1, background: "rgba(192,54,74,0.25)" }} />
          </div>

          {/* Date + Venue details */}
          <div style={{ display: "flex", flexDirection: "column", gap: ".875rem", marginBottom: "2rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Calendar size={14} style={{ color: "#C0364A", flexShrink: 0 }} />
              <p style={{ fontFamily: BF, fontSize: ".9rem", color: "#3D2530" }}>
                {formatDate(weddingDate)} · {weddingTime} IST
              </p>
            </div>

            <div style={{ display: "inline-flex", alignItems: "flex-start", justifyContent: "center", gap: 8 }}>
              <MapPin size={14} style={{ color: "#C0364A", flexShrink: 0, marginTop: 2 }} />
              <div style={{ textAlign: "left" }}>
                <p style={{ fontFamily: BF, fontWeight: 600, fontSize: ".9rem", color: "#1A1012" }}>{venueName}</p>
                <p style={{ fontFamily: BF, fontSize: ".8rem", color: "#7A5460" }}>{venueAddress}</p>
                <p style={{ fontFamily: BF, fontSize: ".8rem", color: "#7A5460" }}>{venueCity}</p>
              </div>
            </div>
          </div>

          {/* Bottom ornamental divider */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "1.75rem" }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(212,179,155,0.5))" }} />
            <span style={{ fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase", color: "#B8820A", fontFamily: BF }}>Together</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(212,179,155,0.5), transparent)" }} />
          </div>

          {/* CTA button */}
          <a
            href="#events"
            onClick={onExplore}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 28px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #C0364A, #A82C3E)",
              color: "#fff",
              fontSize: ".8rem",
              fontWeight: 700,
              fontFamily: BF,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              textDecoration: "none",
              boxShadow: "0 6px 20px rgba(192,54,74,0.28)",
              transition: "transform .2s ease, box-shadow .2s ease",
            }}
          >
            Explore the wedding experience
          </a>
        </div>

        {/* Rose-gold bottom stripe */}
        <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #C0364A, #B8820A, #C0364A, transparent)" }} />
      </div>
    </section>
  );
}

export default InvitationCard;
