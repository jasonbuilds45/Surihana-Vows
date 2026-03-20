import type { Metadata } from "next";
import { MessageSquareHeart, Hourglass } from "lucide-react";
import { GuestMessageForm } from "@/components/guestbook/GuestMessageForm";
import { MessageList } from "@/components/guestbook/MessageList";
import { TimeCapsuleForm } from "@/components/vault/TimeCapsuleForm";
import { LuxuryPageHero } from "@/components/layout/LuxuryPageHero";
import { weddingConfig } from "@/lib/config";
import { getGuestMessages } from "@/modules/premium/guestbook-system";

export const metadata: Metadata = {
  title: `Guestbook — ${weddingConfig.celebrationTitle}`,
  description: "Leave a blessing, a wish, or a memory for Marion & Livingston.",
};

const DF = "'Cormorant Garamond',var(--font-display),Georgia,serif";
const BF = "'Manrope',var(--font-body),system-ui,sans-serif";
const ROSE = "var(--rose,#BE2D45)";
const INK  = "var(--ink,#120B0E)";
const INK3 = "var(--ink-3,#72504A)";

export default async function GuestbookPage() {
  const msgs = await getGuestMessages();
  const bf   = weddingConfig.brideName.split(" ")[0]!;
  const gf   = weddingConfig.groomName.split(" ")[0]!;

  return (
    <div style={{ background: "var(--bg,#FDFAF7)", minHeight: "100vh" }}>

      <LuxuryPageHero
        eyebrow="Guestbook"
        letter="G"
        title={
          <>
            Leave your<br />
            <em style={{ color: "rgba(255,255,255,.88)", fontStyle: "italic" }}>blessing.</em>
          </>
        }
        subtitle={`A word, a wish, a memory — it will stay with ${bf} and ${gf} long after the day is over.`}
        below={
          /* Stat chips */
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".625rem" }}>
            {[
              { val: `${msgs.length}`, label: msgs.length === 1 ? "blessing received" : "blessings received" },
              { val: "Forever",        label: "kept by the couple" },
            ].map(({ val, label }) => (
              <div key={label} style={{
                display: "inline-flex", alignItems: "baseline", gap: 7,
                padding: "6px 14px", borderRadius: 999,
                background: "rgba(255,255,255,.14)",
                border: "1px solid rgba(255,255,255,.28)",
                backdropFilter: "blur(8px)",
              }}>
                <span style={{ fontFamily: DF, fontSize: ".95rem", fontWeight: 600, color: "#fff" }}>{val}</span>
                <span style={{ fontFamily: BF, fontSize: ".56rem", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.58)" }}>{label}</span>
              </div>
            ))}
          </div>
        }
      />

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div style={{
        maxWidth: "var(--max-w,1320px)", margin: "0 auto",
        padding: "clamp(3rem,6vh,5rem) var(--pad-x,clamp(1.25rem,5vw,5rem)) clamp(4rem,8vh,6rem)",
      }}>

        {/* ── Section 1: Write + Read ── */}
        <div style={{ marginBottom: "clamp(2.5rem,5vh,4rem)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ".5rem" }}>
            <MessageSquareHeart size={15} style={{ color: ROSE }} />
            <p style={{
              fontFamily: BF, fontSize: ".46rem", letterSpacing: ".40em",
              textTransform: "uppercase", color: ROSE, fontWeight: 700,
            }}>
              Write a blessing
            </p>
          </div>
          <h2 style={{
            fontFamily: DF, fontWeight: 300,
            fontSize: "clamp(1.75rem,4vw,2.75rem)",
            color: INK, lineHeight: 1.05, letterSpacing: "-.025em",
            marginBottom: "clamp(1.5rem,3vh,2.5rem)",
          }}>
            Words they will carry forever.
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1.1fr .9fr",
            gap: "clamp(1.5rem,4vw,3rem)",
            alignItems: "start",
          }}
            className="gb-grid">
            <GuestMessageForm weddingId={weddingConfig.id} />
            <div>
              <p style={{
                fontFamily: BF, fontSize: ".56rem", fontWeight: 600,
                letterSpacing: ".18em", textTransform: "uppercase",
                color: INK3, marginBottom: "1.25rem",
              }}>
                {msgs.length} blessing{msgs.length !== 1 ? "s" : ""} received
              </p>
              <MessageList messages={msgs} />
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "1rem",
          margin: "clamp(2.5rem,5vh,4rem) 0",
        }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to right,transparent,var(--rose-mid,#F0BEC6))" }} />
          <span style={{ fontFamily: DF, fontSize: ".875rem", color: "var(--rose-mid,#F0BEC6)" }}>✦</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to left,transparent,var(--rose-mid,#F0BEC6))" }} />
        </div>

        {/* ── Section 2: Time Capsule ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ".5rem" }}>
            <Hourglass size={15} style={{ color: "var(--gold,#A87808)" }} />
            <p style={{
              fontFamily: BF, fontSize: ".46rem", letterSpacing: ".40em",
              textTransform: "uppercase", color: "var(--gold,#A87808)", fontWeight: 700,
            }}>
              Time capsule
            </p>
          </div>
          <h2 style={{
            fontFamily: DF, fontWeight: 300,
            fontSize: "clamp(1.75rem,4vw,2.75rem)",
            color: INK, lineHeight: 1.05, letterSpacing: "-.025em",
            marginBottom: ".625rem",
          }}>
            Write for years from now.
          </h2>
          <p style={{
            fontFamily: BF, fontSize: ".875rem",
            color: INK3, lineHeight: 1.72,
            maxWidth: "36rem", marginBottom: "clamp(1.5rem,3vh,2.5rem)",
          }}>
            Seal a message for {bf} &amp; {gf} that unlocks on their 5th anniversary,
            when they move, or any date you choose. A gift that arrives in the future.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(1.5rem,4vw,3rem)",
            alignItems: "start",
          }}
            className="gb-grid">
            {/* Left: explainer card */}
            <div style={{
              borderRadius: 20, overflow: "hidden",
              border: "1px solid rgba(168,120,8,.12)",
              boxShadow: "0 2px 12px rgba(15,10,11,.05)",
            }}>
              <div style={{
                background: "linear-gradient(140deg,#0F0A0B 0%,#1C1214 55%,#0F0A0B 100%)",
                padding: "clamp(1.5rem,4vw,2.25rem)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: "linear-gradient(90deg,transparent,rgba(168,120,8,.65) 40%,rgba(201,150,10,.85) 50%,rgba(168,120,8,.65) 60%,transparent)",
                }} />
                <p style={{
                  fontFamily: BF, fontSize: ".44rem", letterSpacing: ".38em",
                  textTransform: "uppercase", color: "rgba(232,196,80,.55)",
                  fontWeight: 700, marginBottom: ".75rem",
                }}>
                  How it works
                </p>
                <h3 style={{
                  fontFamily: DF, fontStyle: "italic", fontWeight: 300,
                  fontSize: "clamp(1.375rem,3vw,2rem)",
                  color: "#fff", lineHeight: 1.1, marginBottom: ".875rem",
                }}>
                  A letter sealed in time.
                </h3>
                <p style={{ fontFamily: BF, fontSize: ".80rem", color: "rgba(255,255,255,.46)", lineHeight: 1.70 }}>
                  Write something honest — what you wish for them, a prediction,
                  a memory of today. Choose when it opens. They won&apos;t see it
                  until that moment arrives.
                </p>
              </div>
              <div style={{ background: "var(--bg-linen,#F1E9E0)", padding: "1.125rem 1.375rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: ".625rem" }}>
                  {[
                    { when: "5th anniversary", note: "A message from the day it all began" },
                    { when: "1st home together", note: "Something to open when you move in" },
                    { when: "Any date you choose", note: "Your moment, your choice" },
                  ].map(({ when, note }) => (
                    <div key={when} style={{ display: "flex", gap: ".75rem", alignItems: "flex-start" }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                        background: "rgba(168,120,8,.50)",
                      }} />
                      <div>
                        <p style={{ fontFamily: DF, fontSize: ".9rem", fontWeight: 600, color: INK, lineHeight: 1.1, marginBottom: ".15rem" }}>{when}</p>
                        <p style={{ fontFamily: BF, fontSize: ".72rem", color: INK3 }}>{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <TimeCapsuleForm
              weddingDate={weddingConfig.weddingDate}
              brideName={weddingConfig.brideName}
              groomName={weddingConfig.groomName}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .gb-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}
