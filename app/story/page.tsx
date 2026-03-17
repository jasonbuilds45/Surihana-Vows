import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StorySection } from "@/components/invitation/StorySection";
import { PageHero } from "@/components/layout/PageHero";
import { weddingConfig } from "@/lib/config";
import { getInvitationOverview } from "@/modules/elegant/invitation-engine";

export const metadata: Metadata = { title: `Their Story — ${weddingConfig.celebrationTitle}` };

const ROSE = "#C0364A";
const INK  = "#1A1012";
const BF   = "var(--font-body), -apple-system, system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";

export default async function StoryPage() {
  const overview = await getInvitationOverview();
  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;

  return (
    <div style={{ background: "#FFFFFF" }}>
      <PageHero eyebrow="Their story" title={<>{bf} <em>&amp;</em> {gf}</>} subtitle={`"${weddingConfig.introQuote}"`} variant="dark" />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "5rem clamp(1.25rem,5vw,4rem)", display: "flex", flexDirection: "column", gap: "4rem" }}>
        <StorySection quote={weddingConfig.introQuote} story={overview.story} />

        {weddingConfig.highlights.length > 0 && (
          <div style={{ background: INK, borderRadius: 24, overflow: "hidden" }}>
            <div style={{ height: 3, background: "linear-gradient(90deg,#D94F62,#C0364A 30%,#B8820A 60%,#C0364A 85%,#D94F62)" }} />
            <div style={{ padding: "2.5rem" }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "#F5C5CB", marginBottom: "1.25rem", fontFamily: BF }}>
                What to look forward to
              </p>
              <h2 style={{ fontFamily: DF, fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "#FFFFFF", marginBottom: "2rem" }}>
                The celebration ahead
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "1rem" }}>
                {weddingConfig.highlights.map((h, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, padding: "1.25rem" }}>
                    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.65, fontFamily: BF }}>{h}</p>
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
