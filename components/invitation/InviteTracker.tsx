"use client";

import { useEffect } from "react";

interface InviteTrackerProps {
  inviteCode: string;
  guestId?: string;
}

export function InviteTracker({ inviteCode, guestId }: InviteTrackerProps) {
  useEffect(() => {
    void fetch("/api/track-invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "invite_opened",
        inviteCode,
        guestId
      })
    });
  }, [guestId, inviteCode]);

  return null;
}

export default InviteTracker;
