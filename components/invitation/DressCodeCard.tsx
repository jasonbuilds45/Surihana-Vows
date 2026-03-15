import { Sparkles } from "lucide-react";

interface DressCodeCardProps {
  dressCode: string;
  brideName: string;
  groomName: string;
}

export function DressCodeCard({ dressCode, brideName, groomName }: DressCodeCardProps) {
  if (!dressCode?.trim()) return null;
  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];

  return (
    <div
      className="rounded-2xl flex items-start gap-5 p-5 sm:p-6"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Icon */}
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
        style={{ background: "rgba(138,90,68,0.08)", border: "1px solid rgba(212,179,155,0.35)" }}
      >
        <Sparkles className="h-5 w-5" style={{ color: "var(--color-accent-soft)" }} />
      </div>

      <div className="space-y-1.5">
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)" }}>
          Dress code
        </p>
        <p className="font-display text-xl sm:text-2xl" style={{ color: "var(--color-text-primary)", letterSpacing: "0.03em" }}>
          {dressCode}
        </p>
        <p className="text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>
          {brideFirst} &amp; {groomFirst} would love to see you dressed for the occasion.
        </p>
      </div>
    </div>
  );
}

export default DressCodeCard;
