"use client";

import { MapPin } from "lucide-react";
import { CountdownDisplay } from "@/components/interactive/CountdownDisplay";
import { formatDate } from "@/utils/formatDate";

interface WeddingDateProps {
  date: string;
  time: string;
  venueName: string;
}

export function WeddingDate({ date, time, venueName }: WeddingDateProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div className="gold-stripe" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-1.5">
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600 }}>
            Wedding date
          </p>
          <p className="font-display text-2xl" style={{ color: "var(--color-text-primary)", letterSpacing: "0.04em" }}>
            {formatDate(date)}
          </p>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-accent-soft)" }} />
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {time} · {venueName}
            </p>
          </div>
        </div>

        {/* Countdown */}
        <CountdownDisplay targetDate={date} targetTime={time} />
      </div>
      <div className="gold-stripe" />
    </div>
  );
}

export default WeddingDate;
