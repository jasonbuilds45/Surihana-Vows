import { Sparkles } from "lucide-react";

interface DressCodeCardProps {
  dressCode: string;
  brideName: string;
  groomName: string;
}

const DF = "'Cormorant Garamond',var(--font-display),Georgia,serif";
const BF = "'Manrope',var(--font-body),system-ui,sans-serif";

// Palette swatches that reflect the actual dress code
const SWATCHES = [
  { label: "Ivory",      hex: "#F5F0E8" },
  { label: "Cream",      hex: "#EDE0C8" },
  { label: "Soft gold",  hex: "#C9A84C" },
  { label: "Sage",       hex: "#8FA888" },
  { label: "Champagne",  hex: "#D4B896" },
];

export function DressCodeCard({ dressCode, brideName, groomName }: DressCodeCardProps) {
  if (!dressCode?.trim()) return null;
  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];

  return (
    <div style={{
      borderRadius: 24,
      overflow: "hidden",
      boxShadow: "0 4px 24px rgba(15,10,11,.07), 0 1px 4px rgba(190,45,69,.05)",
      border: "1px solid rgba(190,45,69,.09)",
    }}>

      {/* ── Dark header ── */}
      <div style={{
        background: "linear-gradient(140deg,#0F0A0B 0%,#1C1214 55%,#0F0A0B 100%)",
        padding: "clamp(1.5rem,4vw,2.25rem) clamp(1.5rem,4vw,2.5rem)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Top accent stripe */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent,var(--gold,#A87808) 35%,var(--gold-l,#C9960A) 50%,var(--gold,#A87808) 65%,transparent)",
        }} />
        {/* Ambient bloom */}
        <div aria-hidden style={{
          position: "absolute", top: "-30%", right: "-5%",
          width: "50%", height: "160%", borderRadius: "50%",
          background: "radial-gradient(circle,rgba(168,120,8,.10) 0%,transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{
            fontFamily: BF, fontSize: ".44rem", letterSpacing: ".42em",
            textTransform: "uppercase", color: "rgba(232,196,80,.60)",
            fontWeight: 700, marginBottom: ".75rem",
          }}>
            Dress code
          </p>
          <h2 style={{
            fontFamily: DF, fontStyle: "italic", fontWeight: 300,
            fontSize: "clamp(1.75rem,4vw,2.5rem)",
            color: "#fff", lineHeight: 1.1, marginBottom: ".625rem",
          }}>
            {dressCode.split(".")[0]}.
          </h2>
          <p style={{
            fontFamily: BF, fontSize: ".82rem",
            color: "rgba(255,255,255,.48)", lineHeight: 1.65,
            maxWidth: "36rem",
          }}>
            {brideFirst} &amp; {groomFirst} would love to see you dressed for the
            occasion — a little effort means the world on a day like this.
          </p>
        </div>
      </div>

      {/* ── Colour swatches ── */}
      <div style={{
        display: "flex",
        background: "var(--bg-warm,#F8F3EE)",
        borderBottom: "1px solid rgba(190,45,69,.07)",
      }}>
        {SWATCHES.map(({ label, hex }, i) => (
          <div key={label} style={{
            flex: 1,
            display: "flex", flexDirection: "column",
            alignItems: "center",
            padding: "1rem .375rem .875rem",
            gap: ".5rem",
            borderRight: i < SWATCHES.length - 1
              ? "1px solid rgba(190,45,69,.06)"
              : "none",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: hex,
              border: "2px solid rgba(255,255,255,.85)",
              boxShadow: "0 2px 8px rgba(15,10,11,.10)",
            }} />
            <p style={{
              fontFamily: BF, fontSize: ".46rem",
              letterSpacing: ".12em", textAlign: "center",
              color: "var(--ink-3,#72504A)", lineHeight: 1.3,
            }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Venue-specific notes ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        background: "var(--bg,#FDFAF7)",
      }}>
        {[
          {
            time: "3 PM · Ceremony",
            note: "Formal attire. The church is air-conditioned.",
            rose: true,
          },
          {
            time: "6 PM · Reception",
            note: "Coastal elegance. Wedges recommended on the lawn.",
            rose: false,
          },
        ].map(({ time, note, rose }, i) => (
          <div key={time} style={{
            padding: "1.125rem 1.25rem",
            borderTop: "1px solid rgba(190,45,69,.07)",
            borderRight: i === 0 ? "1px solid rgba(190,45,69,.07)" : "none",
          }}>
            <p style={{
              fontFamily: BF, fontSize: ".50rem", fontWeight: 700,
              letterSpacing: ".18em", textTransform: "uppercase",
              color: rose ? "var(--rose,#BE2D45)" : "var(--gold,#A87808)",
              marginBottom: ".375rem",
            }}>
              {time}
            </p>
            <p style={{
              fontFamily: DF, fontStyle: "italic",
              fontSize: ".9rem", color: "var(--ink-3,#72504A)",
              lineHeight: 1.6,
            }}>
              {note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DressCodeCard;
