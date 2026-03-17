import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { RSVPForm } from "@/components/rsvp/RSVPForm";
import { weddingConfig } from "@/lib/config";
import { formatDate, formatTime } from "@/utils/formatDate";

export const metadata: Metadata = { title: `RSVP — ${weddingConfig.celebrationTitle}` };

const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK2 = "#3D2530";
const INK3 = "#7A5460";
const BF   = "var(--font-body), -apple-system, system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";

export default function RSVPPage() {
  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;

  return (
    <div style={{ background: "#FFFFFF" }}>
      {/* Rose hero */}
      <div style={{ background: ROSE, padding: "5rem clamp(1.25rem,5vw,4rem) 4rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: "0 0 auto 0", height: 3, background: "linear-gradient(90deg,#D94F62,#C0364A 30%,#B8820A 60%,#C0364A 85%,#D94F62)" }} />
        <div aria-hidden style={{ position: "absolute", top: "20%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "1.25rem", fontFamily: BF }}>
            Confirm attendance
          </p>
          <h1 style={{ fontFamily: DF, fontSize: "clamp(2.5rem, 8vw, 6rem)", fontWeight: 700, lineHeight: 0.90, letterSpacing: "-0.03em", color: "#FFFFFF", marginBottom: "1.25rem" }}>
            Will you<br />join us?
          </h1>
          <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.70)", maxWidth: "36rem", fontFamily: BF, lineHeight: 1.72 }}>
            Let {bf} and {gf} know so every seat is reserved with care.
          </p>
        </div>
        <div style={{ position: "absolute", inset: "auto 0 0 0", height: 3, background: "linear-gradient(90deg,#D94F62,#C0364A 30%,#B8820A 60%,#C0364A 85%,#D94F62)" }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem clamp(1.25rem,5vw,4rem) 6rem", display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "3rem", alignItems: "start" }}
        className="rsvp-grid">

        {/* Venue info */}
        <div style={{ background: "#FAF8F6", borderRadius: 24, border: "1px solid #E4D8D4", overflow: "hidden", boxShadow: "0 4px 20px rgba(80,20,30,0.09)" }}>
          <div style={{ height: 3, background: "linear-gradient(90deg,#D94F62,#C0364A 30%,#B8820A 60%,#C0364A 85%,#D94F62)" }} />
          <div style={{ padding: "2.5rem" }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: ROSE, marginBottom: "0.875rem", fontFamily: BF }}>
              The celebration
            </p>
            <h2 style={{ fontFamily: DF, fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.02em", color: INK, marginBottom: "2rem" }}>
              {bf} &amp; {gf}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "2rem" }}>
              {[
                { label: "Date",       value: formatDate(weddingConfig.weddingDate) },
                { label: "Ceremony",   value: `3:00 PM · Divine Mercy Church, Kelambakkam` },
                { label: "Reception",  value: `6:00 PM · Blue Bay Beach Resort, Mahabalipuram` },
                { label: "City",       value: weddingConfig.venueCity },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "11px 16px", background: "#FFFFFF", borderRadius: 12, border: "1px solid #E4D8D4" }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: INK3, fontFamily: BF }}>{label}</span>
                  <span style={{ fontSize: "0.875rem", color: INK, fontFamily: BF, textAlign: "right", maxWidth: "60%", lineHeight: 1.4 }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <a href="https://share.google/SCdoX1GZAvGSlOIrQ" target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 999, background: "#FDEAEC", border: "1px solid #F5C5CB", color: ROSE, fontSize: "0.75rem", fontWeight: 700, textDecoration: "none", fontFamily: BF }}>
                <MapPin size={12} /> Church directions
              </a>
              <a href="https://maps.app.goo.gl/vu56aH1Jvp29gSuu7" target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 999, background: "#FDEAEC", border: "1px solid #F5C5CB", color: ROSE, fontSize: "0.75rem", fontWeight: 700, textDecoration: "none", fontFamily: BF }}>
                <MapPin size={12} /> Beach resort directions
              </a>
            </div>
          </div>
        </div>

        <RSVPForm weddingId={weddingConfig.id} />
      </div>

      <style>{`@media(max-width:768px){.rsvp-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
