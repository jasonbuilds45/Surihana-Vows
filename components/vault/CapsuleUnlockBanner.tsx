"use client";

/**
 * CapsuleUnlockBanner
 * Fixed bottom banner shown when one or more capsules have just unlocked.
 * Dismissed per-session via sessionStorage so it only shows once per visit.
 */

import { useEffect, useState } from "react";
import { LockOpen, X } from "lucide-react";
import type { TimeCapsuleCard } from "@/lib/types";

interface CapsuleUnlockBannerProps {
  capsules: TimeCapsuleCard[];
}

const STORAGE_KEY = "surihana-seen-unlocked";

export function CapsuleUnlockBanner({ capsules }: CapsuleUnlockBannerProps) {
  const [visible, setVisible] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<TimeCapsuleCard[]>([]);

  useEffect(() => {
    // Find revealed capsules that the user hasn't been notified about yet
    const seenRaw = sessionStorage.getItem(STORAGE_KEY);
    const seen: string[] = seenRaw ? (JSON.parse(seenRaw) as string[]) : [];

    const fresh = capsules.filter(c => c.isRevealed && !seen.includes(c.id));
    if (fresh.length === 0) return;

    setNewlyUnlocked(fresh);
    setVisible(true);

    // Mark all revealed capsules as seen so banner doesn't reappear this session
    const allRevealedIds = capsules.filter(c => c.isRevealed).map(c => c.id);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allRevealedIds));
  }, [capsules]);

  if (!visible || newlyUnlocked.length === 0) return null;

  const count = newlyUnlocked.length;
  const label = count === 1
    ? `A message from ${newlyUnlocked[0]!.authorName} has just unlocked`
    : `${count} time capsules have just unlocked`;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.25rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "calc(100% - 2rem)",
        maxWidth: 520,
        background: "linear-gradient(135deg, #1A0C10 0%, #2A1218 100%)",
        border: "1px solid rgba(245,197,203,0.25)",
        borderRadius: 18,
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem 1.25rem",
        animation: "slideUp .35s cubic-bezier(.22,1,.36,1)",
      }}
    >
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>

      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
        background: "rgba(245,197,203,0.12)", border: "1px solid rgba(245,197,203,0.25)",
        display: "grid", placeItems: "center",
      }}>
        <LockOpen size={18} style={{ color: "#F5C5CB" }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(245,197,203,.65)", fontFamily: "var(--font-body),sans-serif", marginBottom: ".2rem" }}>
          Capsule unlocked
        </p>
        <p style={{ fontSize: ".9rem", color: "#fff", fontFamily: "var(--font-display),Georgia,serif", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </p>
        <p style={{ fontSize: ".75rem", color: "rgba(255,255,255,.45)", fontFamily: "var(--font-body),sans-serif", marginTop: ".125rem" }}>
          Scroll down to read {count === 1 ? "it" : "them"}.
        </p>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => setVisible(false)}
        style={{ padding: 6, borderRadius: 9999, background: "rgba(255,255,255,.08)", border: "none", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}
      >
        <X size={15} style={{ color: "rgba(255,255,255,.55)" }} />
      </button>
    </div>
  );
}

export default CapsuleUnlockBanner;
