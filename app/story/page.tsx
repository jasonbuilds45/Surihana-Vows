import type { Metadata } from "next";
import { StorySection } from "@/components/invitation/StorySection";
import { LuxuryPageHero } from "@/components/layout/LuxuryPageHero";
import { weddingConfig } from "@/lib/config";
import { getInvitationOverview } from "@/modules/elegant/invitation-engine";

export const metadata: Metadata = {
  title: `Their Story — ${weddingConfig.celebrationTitle}`,
  description: `How Marion Jemima and Livingston found each other — the full story.`,
};

const DF = "'Cormorant Garamond',var(--font-display),Georgia,serif";
const BF = "'Manrope',var(--font-body),system-ui,sans-serif";
const INK  = "var(--ink,#120B0E)";

export default async function StoryPage() {
  const overview = await getInvitationOverview();
  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;

  return (
    <div style={{ background: "var(--bg,#FDFAF7)", minHeight: "100vh" }}>

      <LuxuryPageHero
        eyebrow="Their story"
        letter="S"
        title={
          <>
            {bf} <em style={{ color: "rgba(190,45,69,.80)" }}>&amp;</em> {gf}
          </>
        }
        subtitle={`"${weddingConfig.introQuote}"`}
      />

      <div style={{
        maxWidth: "var(--max-w,1320px)", margin: "0 auto",
        padding: "clamp(3rem,6vh,5rem) var(--pad-x,clamp(1.25rem,5vw,5rem)) clamp(4rem,8vh,6rem)",
        display: "flex", flexDirection: "column", gap: "clamp(2.5rem,5vh,4rem)",
      }}>
        <StorySection quote={weddingConfig.introQuote} story={overview.story} />

        {weddingConfig.highlights.length > 0 && (
          <div style={{
            background: "linear-gradient(140deg,#0F0A0B 0%,#1C1214 55%,#0F0A0B 100%)",
            borderRadius: 24, overflow: "hidden",
            border: "1px solid rgba(190,45,69,.10)",
            boxShadow: "0 4px 24px rgba(15,10,11,.08)",
          }}>
            <div style={{ height: 2, background: "linear-gradient(90deg,transparent,rgba(190,45,69,.52) 28%,rgba(201,150,10,.75) 50%,rgba(190,45,69,.52) 72%,transparent)" }} />
            <div style={{ padding: "clamp(1.75rem,4vw,2.75rem)" }}>
              <p style={{
                fontFamily: BF, fontSize: ".46rem", letterSpacing: ".40em",
                textTransform: "uppercase", color: "rgba(240,190,198,.55)",
                fontWeight: 700, marginBottom: ".75rem",
              }}>
                What to look forward to
              </p>
              <h2 style={{
                fontFamily: DF, fontWeight: 300,
                fontSize: "clamp(1.5rem,3vw,2.5rem)",
                letterSpacing: "-.02em", color: "#FFFFFF",
                marginBottom: "clamp(1.25rem,3vh,2rem)",
              }}>
                The celebration ahead
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
                gap: "1rem",
              }}>
                {weddingConfig.highlights.map((h, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 14, padding: "1.25rem",
                    borderLeft: "3px solid rgba(190,45,69,.40)",
                  }}>
                    <p style={{ fontSize: ".9rem", color: "rgba(255,255,255,.80)", lineHeight: 1.65, fontFamily: BF }}>
                      {h}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
