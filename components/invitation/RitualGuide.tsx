import type { RitualItem } from "@/lib/types";

interface RitualGuideProps {
  rituals: RitualItem[];
  brideName: string;
  groomName: string;
}

export function RitualGuide({ rituals, brideName, groomName }: RitualGuideProps) {
  if (!rituals?.length) return null;
  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>
          Ceremony guide
        </p>
        <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>
          The rituals that unite them.
        </h2>
        <p className="text-sm leading-7 max-w-lg" style={{ color: "var(--color-text-secondary)" }}>
          {brideFirst} and {groomFirst}&apos;s wedding follows Tamil Hindu traditions.
          A brief guide to help you follow along and appreciate each sacred moment.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rituals.map((ritual, index) => (
          <article
            key={ritual.title}
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div className="flex items-center gap-3">
              {ritual.emoji ? (
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl"
                  style={{ background: "rgba(138,90,68,0.07)", border: "1px solid rgba(212,179,155,0.3)" }}
                >
                  {ritual.emoji}
                </div>
              ) : (
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-lg"
                  style={{ background: "rgba(138,90,68,0.07)", border: "1px solid rgba(212,179,155,0.3)", color: "var(--color-accent-soft)" }}
                >
                  {index + 1}
                </div>
              )}
              <h3 className="font-display text-lg" style={{ color: "var(--color-text-primary)" }}>
                {ritual.title}
              </h3>
            </div>
            <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
              {ritual.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RitualGuide;
