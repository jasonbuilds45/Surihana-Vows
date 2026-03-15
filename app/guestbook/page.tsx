import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GuestMessageForm } from "@/components/guestbook/GuestMessageForm";
import { MessageList } from "@/components/guestbook/MessageList";
import { TimeCapsuleForm } from "@/components/vault/TimeCapsuleForm";
import { PageHero } from "@/components/layout/PageHero";
import { weddingConfig } from "@/lib/config";
import { getGuestMessages } from "@/modules/premium/guestbook-system";

export const metadata: Metadata = { title: `Guestbook — ${weddingConfig.celebrationTitle}` };

const ROSE = "#C0364A";
const INK  = "#1A1012";
const INK3 = "#7A5460";
const BF   = "var(--font-body), -apple-system, system-ui, sans-serif";
const DF   = "var(--font-display), Georgia, serif";

export default async function GuestbookPage() {
  const msgs = await getGuestMessages();
  const bf   = weddingConfig.brideName.split(" ")[0]!;
  const gf   = weddingConfig.groomName.split(" ")[0]!;

  return (
    <div style={{ background: "#FFFFFF" }}>
      <PageHero
        eyebrow="Guestbook"
        title={<>Leave your<br />blessing ✨</>}
        subtitle={`A word, a wish, a memory — stays with ${bf} and ${gf} forever.`}
        variant="rose"
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem clamp(1.25rem,5vw,4rem) 6rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "3rem", alignItems: "start", marginBottom: "5rem" }} className="rsvp-grid">
          <GuestMessageForm weddingId={weddingConfig.id} />
          <div>
            <p style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: INK3, marginBottom: "1.25rem", fontFamily: BF }}>
              {msgs.length} blessing{msgs.length !== 1 ? "s" : ""} received
            </p>
            <MessageList messages={msgs} />
          </div>
        </div>

        <div style={{ height: 1, background: "#E4D8D4", marginBottom: "4rem" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }} className="rsvp-grid">
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: ROSE, marginBottom: "1rem", fontFamily: BF }}>
              Time Capsule
            </p>
            <h2 style={{ fontFamily: DF, fontSize: "clamp(1.75rem, 4vw, 3.25rem)", fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.025em", color: INK, marginBottom: "1.25rem" }}>
              Write for<br />years from now.
            </h2>
            <p style={{ fontSize: "1rem", color: "#3D2530", lineHeight: 1.72, maxWidth: "36rem", fontFamily: BF }}>
              Seal a message for {bf} &amp; {gf} that unlocks on their 5th anniversary, when they move, or any date you choose.
            </p>
          </div>
          <TimeCapsuleForm weddingDate={weddingConfig.weddingDate} brideName={weddingConfig.brideName} groomName={weddingConfig.groomName} />
        </div>
      </div>

      <style>{`@media(max-width:768px){.rsvp-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
