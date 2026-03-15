import { Container } from "@/components/layout/Container";
import { GoldStripe, SectionDivider, BtnLink, EmptyState } from "@/components/ui";
import { MessageSquare } from "lucide-react";
import { weddingConfig } from "@/lib/config";
import { getGuestMessages } from "@/modules/premium/guestbook-system";
import { formatDate } from "@/utils/formatDate";

export const metadata = {
  title: `Message archive — ${weddingConfig.celebrationTitle}`,
  description: `Every blessing and note left for ${weddingConfig.brideName} and ${weddingConfig.groomName}.`,
};

const MESSAGE_LIMIT = 500;

function getInitial(name: string) { return (name.trim()[0] ?? "?").toUpperCase(); }

const AVATAR_STYLES = [
  { bg: "var(--color-accent-light)",  border: "rgba(184,84,58,0.2)",   color: "var(--color-accent)" },
  { bg: "var(--color-rose-soft)",     border: "rgba(194,24,91,0.15)",  color: "var(--color-rose)" },
  { bg: "var(--color-gold-soft)",     border: "rgba(184,134,11,0.2)",  color: "var(--color-gold)" },
  { bg: "var(--color-blush-soft)",    border: "rgba(212,117,107,0.2)", color: "var(--color-blush)" },
  { bg: "var(--color-sage-soft)",     border: "rgba(107,142,110,0.2)", color: "var(--color-sage)" },
];

export default async function ArchivePage() {
  const messages = await getGuestMessages(weddingConfig.id, MESSAGE_LIMIT);
  const { brideName, groomName, celebrationTitle, weddingDate, venueCity } = weddingConfig;
  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];

  return (
    <div style={{ background: "#ffffff" }}>
      <GoldStripe />

      {/* Hero */}
      <div style={{ background: "var(--color-surface-soft)", borderBottom: "1px solid var(--color-border)" }}>
        <Container className="py-14 text-center">
          <div className="max-w-xl mx-auto space-y-4">
            <p style={{ fontSize: "0.625rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              {celebrationTitle}
            </p>
            <h1 className="font-display" style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", color: "var(--color-text-primary)", lineHeight: 1.15 }}>
              Every blessing, preserved.
            </h1>
            <p style={{ fontSize: "0.625rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              {brideFirst} &amp; {groomFirst} · {formatDate(weddingDate)} · {venueCity}
            </p>
            <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
              {messages.length === 0
                ? "No messages yet — this archive will fill as guests leave their blessings."
                : `${messages.length} message${messages.length === 1 ? "" : "s"} left by the people who made this celebration what it was.`}
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-14 lg:py-20">
        {messages.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-10 w-10" />}
            title="No messages yet"
            description="The archive will fill as guests leave their blessings at /guestbook"
          />
        ) : (
          /* Timeline */
          <ol className="relative max-w-2xl mx-auto">
            {/* Spine */}
            <div
              aria-hidden
              className="absolute top-0 bottom-0 w-px"
              style={{ left: "1.875rem", background: "var(--color-border)" }}
            />

            {messages.map((msg, i) => {
              const av = AVATAR_STYLES[i % AVATAR_STYLES.length]!;
              return (
                <li key={msg.id} className="relative mb-6 pl-16 last:mb-0">
                  {/* Avatar on spine */}
                  <div
                    className="absolute left-0 top-1 grid h-[3.75rem] w-[3.75rem] place-items-center rounded-full font-display text-lg font-bold"
                    style={{ background: av.bg, border: `1.5px solid ${av.border}`, color: av.color }}
                  >
                    {getInitial(msg.guest_name)}
                  </div>

                  {/* Message card */}
                  <article
                    className="rounded-2xl px-6 py-5 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--color-border)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
                      <p className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>
                        {msg.guest_name}
                      </p>
                      {msg.created_at && (
                        <time
                          dateTime={msg.created_at}
                          style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-text-muted)" }}
                        >
                          {new Date(msg.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </time>
                      )}
                    </div>
                    <blockquote className="text-sm leading-7" style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                      &ldquo;{msg.message}&rdquo;
                    </blockquote>
                  </article>
                </li>
              );
            })}
          </ol>
        )}

        {/* Footer CTAs */}
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <BtnLink href="/gallery" variant="primary" size="md">Browse the gallery</BtnLink>
          <BtnLink href="/guestbook" variant="secondary" size="md">Leave a message</BtnLink>
          <BtnLink href="/thank-you" variant="ghost" size="md">Thank-you note</BtnLink>
        </div>
      </Container>

      <GoldStripe thin />
    </div>
  );
}
