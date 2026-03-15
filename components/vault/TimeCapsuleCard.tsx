"use client";

import Image from "next/image";
import { Clock, Lock, LockOpen } from "lucide-react";
import type { TimeCapsuleCard as CapsuleData } from "@/lib/types";
import { ImageTransforms } from "@/lib/storage";

const TYPE_LABELS: Record<CapsuleData["postType"], string> = {
  anniversary: "Anniversary", life_event: "Life milestone",
  timed: "Sealed message", video: "Video message",
};

function fmt(days: number) {
  if (days === 0) return "Unlocked";
  if (days === 1) return "Unlocks tomorrow";
  if (days < 30) return `Unlocks in ${days} days`;
  const m = Math.round(days / 30);
  if (m < 12) return `Unlocks in ${m} month${m === 1 ? "" : "s"}`;
  const y = Math.round(days / 365);
  return `Unlocks in ${y} year${y === 1 ? "" : "s"}`;
}

function Locked({ capsule }: { capsule: CapsuleData }) {
  return (
    <article
      className="relative overflow-hidden rounded-2xl"
      style={{ background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-xs)" }}
    >
      {/* Subtle top stripe */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--color-accent-soft), transparent)" }} />

      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p style={{ fontSize: "0.55rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              {TYPE_LABELS[capsule.postType]}
            </p>
            <p className="mt-1 font-display text-lg" style={{ color: "var(--color-text-primary)" }}>
              {capsule.authorName}
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase shrink-0"
            style={{ letterSpacing: "0.2em", background: "rgba(253,230,138,0.3)", border: "1px solid rgba(252,211,77,0.4)", color: "#92400e" }}
          >
            <Lock className="h-3 w-3" />
            {capsule.unlockLabel}
          </span>
        </div>

        {/* Blurred preview */}
        <div className="rounded-xl px-4 py-3" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <p
            className="text-sm leading-6 select-none"
            style={{ color: "var(--color-text-muted)", filter: "blur(4px)", userSelect: "none" }}
          >
            {capsule.message.slice(0, 90).padEnd(90, "·")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-accent-soft)" }} />
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{fmt(capsule.daysRemaining)}</span>
        </div>
      </div>
    </article>
  );
}

function Revealed({ capsule }: { capsule: CapsuleData }) {
  const isVideo = capsule.postType === "video";
  return (
    <article className="overflow-hidden rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
      {capsule.mediaUrl && !isVideo && (
        <div className="relative h-44">
          <Image alt={`From ${capsule.authorName}`} src={ImageTransforms.medium(capsule.mediaUrl)} fill className="object-cover" sizes="50vw" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,25,23,0.5) 0%, transparent 50%)" }} />
        </div>
      )}
      {capsule.mediaUrl && isVideo && (
        <div className="aspect-video">
          <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full border-0" loading="lazy" src={capsule.mediaUrl} title={`Video from ${capsule.authorName}`} />
        </div>
      )}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p style={{ fontSize: "0.55rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>{TYPE_LABELS[capsule.postType]}</p>
            <p className="mt-1 font-display text-lg" style={{ color: "var(--color-text-primary)" }}>{capsule.authorName}</p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase shrink-0"
            style={{ letterSpacing: "0.2em", background: "rgba(167,243,208,0.3)", border: "1px solid rgba(110,231,183,0.4)", color: "#065f46" }}
          >
            <LockOpen className="h-3 w-3" />
            {capsule.unlockLabel}
          </span>
        </div>
        {capsule.message && (
          <blockquote className="border-l-2 pl-4 text-sm leading-7 italic" style={{ borderColor: "var(--color-accent-soft)", color: "var(--color-text-secondary)" }}>
            &ldquo;{capsule.message}&rdquo;
          </blockquote>
        )}
      </div>
    </article>
  );
}

export function TimeCapsuleCardComponent({ capsule }: { capsule: CapsuleData }) {
  return capsule.isRevealed ? <Revealed capsule={capsule} /> : <Locked capsule={capsule} />;
}

export default TimeCapsuleCardComponent;
