import { env } from "@/lib/env";
import { DEMO_WEDDING_ID } from "@/lib/demo-data";
import { weddingConfig } from "@/lib/config";
import type { LiveTimelineItem, LivestreamBundle } from "@/lib/types";
import { getWeddingEvents } from "@/modules/elegant/event-display";
import { getAnalyticsSnapshot, getRecentInviteActivity } from "@/modules/premium/analytics";
import { getGuestMessages } from "@/modules/premium/guestbook-system";
import { getGalleryPhotos } from "@/modules/premium/photo-gallery";

function getEventStatus(date: string, time: string): LiveTimelineItem["status"] {
  const eventTime = new Date(`${date}T${time}:00`);
  const now = new Date();
  const diff = eventTime.getTime() - now.getTime();

  if (diff < -1000 * 60 * 120) {
    return "completed";
  }

  if (Math.abs(diff) <= 1000 * 60 * 120) {
    return "live";
  }

  return "upcoming";
}

export async function getLivestreamBundle(weddingId = DEMO_WEDDING_ID): Promise<LivestreamBundle> {
  const [events, photos, guestMessages, analytics, recentActivity] = await Promise.all([
    getWeddingEvents(weddingId),
    // Phase 3.4: only show approved photos in the live feed.
    // includeUnapproved defaults to false — no change needed here,
    // but the explicit comment documents the intent clearly.
    getGalleryPhotos(weddingId, undefined, false),
    getGuestMessages(weddingId, 6),
    getAnalyticsSnapshot(weddingId),
    getRecentInviteActivity(weddingId, 8)
  ]);

  const ceremony = events.find((event) => event.event_name.toLowerCase().includes("vows")) ?? events[0];
  const timeline = events.map<LiveTimelineItem>((event) => ({
    time: event.time,
    title: event.event_name,
    description: event.description ?? "",
    status: getEventStatus(event.date, event.time)
  }));

  return {
    weddingId,
    embedUrl: env.NEXT_PUBLIC_LIVESTREAM_URL || "",
    headline: `${weddingConfig.brideName.split(" ")[0]} & ${weddingConfig.groomName.split(" ")[0]} — Live`,
    description:
      `Follow the ceremony in real time, leave a note for the couple, and share in the celebration as ${weddingConfig.brideName.split(" ")[0]} and ${weddingConfig.groomName.split(" ")[0]} say their vows.`,
    countdownTarget: `${ceremony?.date ?? weddingConfig.weddingDate}T${ceremony?.time ?? weddingConfig.weddingTime}:00`,
    timeline,
    livePhotos: photos.slice(0, 6),
    guestMessages,
    analytics,
    recentActivity
  };
}
