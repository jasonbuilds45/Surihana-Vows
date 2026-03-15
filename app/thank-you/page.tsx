import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { GoldStripe, SectionDivider, BtnLink } from "@/components/ui";
import { weddingConfig } from "@/lib/config";
import { formatDate } from "@/utils/formatDate";

export const metadata = {
  title: `Thank you — ${weddingConfig.celebrationTitle}`,
  description: `A personal note from ${weddingConfig.brideName} and ${weddingConfig.groomName}.`,
};

const DEFAULT_MESSAGE =
  "Thank you for celebrating with us. Your presence — whether beside us in person or with us in spirit — made this day everything we had hoped for and more.";

export default function ThankYouPage() {
  const { brideName, groomName, celebrationTitle, weddingDate, venueCity, thankYouMessage, contactEmail } = weddingConfig;
  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];
  const message = thankYouMessage?.trim() || DEFAULT_MESSAGE;

  return (
    <div style={{ background: "#ffffff", minHeight: "calc(100dvh - 4rem)" }}>
      <GoldStripe />

      <Container className="py-20 lg:py-28">
        <div className="max-w-2xl mx-auto text-center space-y-10">

          {/* Top ornament */}
          <SectionDivider />

          {/* Eyebrow */}
          <div className="space-y-5">
            <p style={{ fontSize: "0.625rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              {celebrationTitle}
            </p>
            <h1 className="font-display" style={{ fontSize: "clamp(2.5rem, 7vw, 4rem)", color: "var(--color-text-primary)", lineHeight: 1.15, letterSpacing: "0.02em" }}>
              With all our love,<br />thank you.
            </h1>
            <p style={{ fontSize: "0.625rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              {brideFirst} &amp; {groomFirst} · {formatDate(weddingDate)} · {venueCity}
            </p>
          </div>

          {/* Gold divider */}
          <div className="flex items-center justify-center gap-4">
            <div style={{ width: 48, height: 1, background: "linear-gradient(90deg, transparent, var(--color-champagne-deep))" }} />
            <span className="font-display text-lg" style={{ color: "var(--color-champagne-deep)" }}>✦</span>
            <div style={{ width: 48, height: 1, background: "linear-gradient(90deg, var(--color-champagne-deep), transparent)" }} />
          </div>

          {/* Message */}
          <blockquote
            className="font-display"
            style={{ fontSize: "clamp(1.25rem, 3.5vw, 1.75rem)", color: "var(--color-text-secondary)", lineHeight: 1.7, fontStyle: "italic" }}
          >
            &ldquo;{message}&rdquo;
          </blockquote>
          <p className="font-display text-xl" style={{ color: "var(--color-text-muted)" }}>
            — {brideFirst} &amp; {groomFirst}
          </p>

          {/* Bottom ornament */}
          <SectionDivider />

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <BtnLink href="/gallery" variant="primary" size="md">
              Browse the gallery
              <ArrowRight className="h-4 w-4" />
            </BtnLink>
            <BtnLink href="/archive" variant="secondary" size="md">
              Read every message
            </BtnLink>
            <Link
              href="/guestbook"
              className="text-sm font-medium"
              style={{ color: "var(--color-text-muted)", textDecoration: "underline", textUnderlineOffset: 4 }}
            >
              Leave a note
            </Link>
          </div>

          {/* Fine print */}
          <p className="text-xs leading-6 max-w-sm mx-auto" style={{ color: "var(--color-text-muted)" }}>
            This page will remain here as a keepsake. Contact{" "}
            <a href={`mailto:${contactEmail}`} style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
              {contactEmail}
            </a>{" "}
            for family vault access.
          </p>
        </div>
      </Container>

      <GoldStripe thin />
    </div>
  );
}
