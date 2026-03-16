"use client";

/**
 * InviteTracker — Step 9
 * Enhanced: records open_count per invite_code in localStorage and sends
 * it with the tracking payload. If open_count > 50 the server can flag
 * the invite as suspicious. Access is never blocked.
 * Cookie-based dedup ensures we don't spam the API on every re-render.
 */

import { useEffect } from "react";

interface InviteTrackerProps {
  inviteCode: string;
  guestId?:   string;
}

const SESSION_KEY = (code: string) => `surihana-tracked:${code}`;
const COUNT_KEY   = (code: string) => `surihana-open-count:${code}`;

export function InviteTracker({ inviteCode, guestId }: InviteTrackerProps) {
  useEffect(() => {
    // Dedup per browser session — only track once per page load session
    const sKey = SESSION_KEY(inviteCode);
    if (sessionStorage.getItem(sKey)) return;
    sessionStorage.setItem(sKey, "1");

    // Increment persistent open count in localStorage
    const cKey      = COUNT_KEY(inviteCode);
    const prevCount = parseInt(localStorage.getItem(cKey) ?? "0", 10);
    const openCount = prevCount + 1;
    localStorage.setItem(cKey, String(openCount));

    void fetch("/api/track-invite", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        action:     "invite_opened",
        inviteCode,
        guestId,
        openCount,                    // Step 9 — server uses this to flag suspicious invites
        suspicious: openCount > 50,   // Pre-compute flag for the server
      }),
    });
  }, [guestId, inviteCode]);

  return null;
}

export default InviteTracker;
