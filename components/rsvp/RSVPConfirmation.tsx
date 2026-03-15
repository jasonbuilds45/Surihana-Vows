import { CheckCircle2, Heart } from "lucide-react";
import { GoldStripe } from "@/components/ui";

interface RSVPConfirmationProps {
  guestName?: string;
  attending: boolean;
  guestCount: number;
  message?: string;
  demoMode?: boolean;
}

export function RSVPConfirmation({ guestName, attending, guestCount, message, demoMode }: RSVPConfirmationProps) {
  const firstName = guestName?.split(" ")[0];
  return (
    <div
      className="rounded-2xl overflow-hidden text-center"
      style={{ background: "#ffffff", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-lg)" }}
    >
      <GoldStripe />
      <div className="p-10 space-y-5">
        {/* Icon */}
        <div
          className="mx-auto grid h-16 w-16 place-items-center rounded-full"
          style={{
            background: attending ? "var(--color-accent-light)" : "var(--color-surface-soft)",
            border: `1.5px solid ${attending ? "rgba(184,84,58,0.25)" : "var(--color-border)"}`,
          }}
        >
          {attending
            ? <Heart className="h-7 w-7" style={{ color: "var(--color-accent)" }} />
            : <CheckCircle2 className="h-7 w-7" style={{ color: "var(--color-text-muted)" }} />
          }
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>
            Thank you{firstName ? `, ${firstName}` : ""}.
          </h3>
          <p className="text-sm leading-7" style={{ color: "var(--color-text-secondary)" }}>
            {attending
              ? `We have reserved ${guestCount} seat${guestCount > 1 ? "s" : ""} for your party. We cannot wait to celebrate with you.`
              : "Your wishes have been noted. We will carry you in our hearts on the day."}
          </p>
        </div>

        {/* Echoed message */}
        {message && (
          <div
            className="rounded-xl px-5 py-4 text-sm italic leading-7 text-left"
            style={{
              background: "var(--color-surface-soft)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            &ldquo;{message}&rdquo;
          </div>
        )}

        {demoMode && (
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Demo mode
          </p>
        )}
      </div>
      <GoldStripe thin />
    </div>
  );
}

export default RSVPConfirmation;
