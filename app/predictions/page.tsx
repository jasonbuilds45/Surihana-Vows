import type { Metadata } from "next";
import { PredictionsBoard } from "@/components/invitation/PredictionsBoard";
import { LuxuryPageHero } from "@/components/layout/LuxuryPageHero";
import { weddingConfig, predictionsConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Predictions — ${weddingConfig.celebrationTitle}`,
  description: "Guest predictions for the wedding day — results revealed after the reception.",
};
export const revalidate = 30;

const DF = "'Cormorant Garamond',var(--font-display),Georgia,serif";
const BF = "'Manrope',var(--font-body),system-ui,sans-serif";
const INK  = "var(--ink,#120B0E)";
const INK3 = "var(--ink-3,#72504A)";

export default function PredictionsPage() {
  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;
  const revealDate = new Date(predictionsConfig.revealAfter);

  if (!predictionsConfig.enabled) {
    return (
      <div style={{ background: "var(--bg,#FDFAF7)", minHeight: "60dvh", display: "grid", placeItems: "center" }}>
        <p style={{ color: INK3, fontFamily: BF }}>Predictions are not enabled for this celebration.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg,#FDFAF7)", minHeight: "100vh" }}>

      <LuxuryPageHero
        eyebrow="Guest predictions"
        letter="P"
        title={
          <>
            What will<br />
            <em style={{ color: "rgba(255,255,255,.88)" }}>happen?</em>
          </>
        }
        subtitle={`Before ${bf} & ${gf} said their vows, guests made their predictions. Results revealed after the reception.`}
        aside={
          /* Reveal date card */
          <div style={{
            borderRadius: 18, overflow: "hidden",
            border: "1px solid rgba(255,255,255,.22)",
            boxShadow: "0 8px 32px rgba(0,0,0,.22)",
            minWidth: 210, flexShrink: 0,
          }}>
            <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.40) 30%,rgba(255,255,255,.70) 50%,rgba(255,255,255,.40) 70%,transparent)" }} />
            <div style={{
              background: "rgba(255,255,255,.14)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              padding: "1.25rem 1.5rem",
            }}>
              <p style={{
                fontFamily: BF, fontSize: ".44rem", letterSpacing: ".36em",
                textTransform: "uppercase", color: "rgba(255,255,255,.60)",
                fontWeight: 700, marginBottom: ".625rem",
              }}>
                Results reveal
              </p>
              <p style={{
                fontFamily: DF, fontSize: "clamp(1.1rem,2.5vw,1.35rem)",
                fontWeight: 600, color: "#fff", lineHeight: 1.15,
                marginBottom: ".25rem",
              }}>
                {revealDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p style={{ fontFamily: BF, fontSize: ".72rem", color: "rgba(255,255,255,.50)" }}>
                {revealDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        }
      />

      <div style={{
        maxWidth: "var(--max-w,1320px)", margin: "0 auto",
        padding: "clamp(3rem,6vh,5rem) var(--pad-x,clamp(1.25rem,5vw,5rem)) clamp(4rem,8vh,6rem)",
      }}>
        <div style={{ marginBottom: "clamp(1.5rem,3vh,2.5rem)" }}>
          <p style={{
            fontFamily: BF, fontSize: ".46rem", letterSpacing: ".40em",
            textTransform: "uppercase", color: "var(--rose,#BE2D45)",
            fontWeight: 700, marginBottom: ".5rem",
          }}>
            Cast your predictions
          </p>
          <h2 style={{
            fontFamily: DF, fontWeight: 300,
            fontSize: "clamp(1.75rem,4vw,2.75rem)",
            color: INK, lineHeight: 1.05, letterSpacing: "-.025em",
            marginBottom: ".625rem",
          }}>
            Make your guesses.
          </h2>
          <p style={{
            fontFamily: BF, fontSize: ".875rem", color: INK3,
            lineHeight: 1.72, maxWidth: "36rem",
          }}>
            {predictionsConfig.questions.length} questions about the day.
            Your answers are locked until the reveal date — no peeking.
          </p>
        </div>

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
