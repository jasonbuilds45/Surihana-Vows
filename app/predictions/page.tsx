import type { Metadata } from "next";
import { PredictionsBoard } from "@/components/invitation/PredictionsBoard";
import { PageHero } from "@/components/layout/PageHero";
import { weddingConfig, predictionsConfig } from "@/lib/config";

export const metadata: Metadata = { title: `Predictions — ${weddingConfig.celebrationTitle}` };
export const revalidate = 30;

const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BF   = "var(--font-body), -apple-system, system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";

export default function PredictionsPage() {
  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;
  const revealDate = new Date(predictionsConfig.revealAfter);

  if (!predictionsConfig.enabled) {
    return (
      <div style={{ background: "#FFFFFF", minHeight: "60dvh", display: "grid", placeItems: "center" }}>
        <p style={{ color: INK3, fontFamily: BF }}>Predictions are not enabled for this celebration.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#FFFFFF" }}>
      <PageHero
        eyebrow="Guest predictions"
        title={<>What will<br />happen? 🔮</>}
        subtitle={`Before ${bf} & ${gf} said their vows, guests made predictions. Results revealed after the reception.`}
        variant="warm"
        aside={
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F5C5CB", borderRadius: 20, padding: "1.5rem 2rem", minWidth: 220, boxShadow: "0 4px 16px rgba(192,54,74,0.12)" }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: ROSE, marginBottom: "0.75rem", fontFamily: BF }}>Results reveal</p>
            <p style={{ fontFamily: DF, fontSize: "1.25rem", fontWeight: 700, color: INK, lineHeight: 1.15, marginBottom: "0.25rem" }}>
              {revealDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p style={{ fontSize: "0.8rem", color: INK3, fontFamily: BF }}>
              {revealDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        }
      />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem clamp(1.25rem,5vw,4rem) 6rem" }}>
        <PredictionsBoard
          questions={predictionsConfig.questions}
          revealAfter={predictionsConfig.revealAfter}
          brideName={weddingConfig.brideName}
          groomName={weddingConfig.groomName}
        />
      </div>
    </div>
  );
}
