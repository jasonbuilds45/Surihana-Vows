import { eventsConfig, galleryConfig, travelConfig, weddingConfig } from "@/lib/config";
import type {
  EventRow,
  FamilyPostRow,
  FamilyUserRow,
  GuestMessageRow,
  GuestRow,
  InviteAnalyticsRow,
  PhotoRow,
  RSVPRow,
  TravelInfoRow,
  VideoRow,
  WeddingRow
} from "@/lib/types";

const createdAt = "2026-03-12T08:30:00.000Z";
export const DEMO_WEDDING_ID = weddingConfig.id;

export const demoWedding: WeddingRow = {
  id: DEMO_WEDDING_ID,
  bride_name: weddingConfig.brideName,
  groom_name: weddingConfig.groomName,
  wedding_date: weddingConfig.weddingDate,
  venue_name: weddingConfig.venueName,
  created_at: createdAt,
  // Phase 3 — 005_schema_additions.sql columns
  venue_address: weddingConfig.venueAddress,
  venue_city: weddingConfig.venueCity,
  contact_email: weddingConfig.contactEmail,
  dress_code: weddingConfig.dressCode
};

export const demoGuests: GuestRow[] = [
  {
    id: "f6b4132b-e29b-430d-88d7-a5f0f4ca0011",
    wedding_id: DEMO_WEDDING_ID,
    guest_name: "John",
    family_name: "Family",
    phone: "+1 555 0101",
    invite_code: "john-family",
    invite_opened: true,
    device_type: "mobile",
    opened_at: "2026-03-01T10:20:00.000Z",
    guest_role: "bride_side",
    city: "Chennai",
    country: "India"
  },
  {
    id: "f6b4132b-e29b-430d-88d7-a5f0f4ca0012",
    wedding_id: DEMO_WEDDING_ID,
    guest_name: "Aisha",
    family_name: "and Omar",
    phone: "+1 555 0102",
    invite_code: "aisha-and-omar",
    invite_opened: true,
    device_type: "desktop",
    opened_at: "2026-03-03T18:15:00.000Z",
    guest_role: "friends",
    city: "Dubai",
    country: "UAE"
  },
  {
    id: "f6b4132b-e29b-430d-88d7-a5f0f4ca0013",
    wedding_id: DEMO_WEDDING_ID,
    guest_name: "Meera",
    family_name: "Singh",
    phone: "+1 555 0103",
    invite_code: "meera-singh",
    invite_opened: false,
    device_type: null,
    opened_at: null,
    guest_role: "groom_side",
    city: "Bangalore",
    country: "India"
  },
  {
    id: "f6b4132b-e29b-430d-88d7-a5f0f4ca0014",
    wedding_id: DEMO_WEDDING_ID,
    guest_name: "Daniel",
    family_name: "Harper",
    phone: "+1 555 0104",
    invite_code: "daniel-harper",
    invite_opened: true,
    device_type: "tablet",
    opened_at: "2026-03-05T07:45:00.000Z",
    guest_role: "vip",
    city: "Singapore",
    country: "Singapore"
  }
];

export const demoRsvps: RSVPRow[] = [
  {
    id: "9de5a4f6-bfb5-45cb-a1d8-3e93d8ef0011",
    guest_id: demoGuests[0].id,
    attending: true,
    guest_count: 4,
    message: "We would not miss this for the world.",
    submitted_at: "2026-03-02T12:00:00.000Z"
  },
  {
    id: "9de5a4f6-bfb5-45cb-a1d8-3e93d8ef0012",
    guest_id: demoGuests[1].id,
    attending: true,
    guest_count: 2,
    message: "Saving the date and packing our dancing shoes.",
    submitted_at: "2026-03-04T14:20:00.000Z"
  },
  {
    id: "9de5a4f6-bfb5-45cb-a1d8-3e93d8ef0013",
    guest_id: demoGuests[3].id,
    attending: false,
    guest_count: 1,
    message: "Cheering for you both from afar.",
    submitted_at: "2026-03-06T09:10:00.000Z"
  }
];

export const demoEvents: EventRow[] = eventsConfig.map((event, index) => ({
  id: `cc51faab-13a2-4f00-95fe-2200a2a4101${index}`,
  wedding_id: DEMO_WEDDING_ID,
  event_name: event.eventName,
  date: event.date,
  time: event.time,
  venue: event.venue,
  map_link: event.mapLink,
  description: event.description ?? null,
  dress_code: event.dressCode ?? null
}));

export const demoMessages: GuestMessageRow[] = [
  {
    id: "6fe9b092-9175-4fd0-bfd9-3cf719a80011",
    guest_name: "Priya & Aarav",
    message: "Your story already feels like a film we want to watch forever.",
    wedding_id: DEMO_WEDDING_ID,
    created_at: "2026-03-09T11:25:00.000Z"
  },
  {
    id: "6fe9b092-9175-4fd0-bfd9-3cf719a80012",
    guest_name: "Nani",
    message: "May your home always sound like laughter after rain.",
    wedding_id: DEMO_WEDDING_ID,
    created_at: "2026-03-10T07:45:00.000Z"
  },
  {
    id: "6fe9b092-9175-4fd0-bfd9-3cf719a80013",
    guest_name: "Elena",
    message: "Counting down to celebrating under the Jaipur sky with you both.",
    wedding_id: DEMO_WEDDING_ID,
    created_at: "2026-03-11T18:40:00.000Z"
  }
];

export const demoPhotos: PhotoRow[] = galleryConfig.slideshow.map((slide, index) => ({
  id: `2a574f80-f6c5-4f8f-9d68-118fcb2f001${index}`,
  wedding_id: DEMO_WEDDING_ID,
  image_url: slide.imageUrl,
  uploaded_by: index % 2 === 0 ? "Studio Lumiere" : "Family Archive",
  category: slide.category,
  created_at: `2026-03-${String(4 + index).padStart(2, "0")}T10:00:00.000Z`,
  is_approved: true
}));

export const demoVideos: VideoRow[] = [
  {
    id: "2b7f4a9d-6d70-49c4-b3e8-583f1e290011",
    wedding_id: DEMO_WEDDING_ID,
    title: "Save the Date Teaser",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    created_at: "2026-03-05T06:00:00.000Z"
  },
  {
    id: "2b7f4a9d-6d70-49c4-b3e8-583f1e290012",
    wedding_id: DEMO_WEDDING_ID,
    title: "Family Blessings Montage",
    video_url: "https://www.youtube.com/embed/ysz5S6PUM-U",
    created_at: "2026-03-07T06:00:00.000Z"
  }
];

export const demoTravelInfo: TravelInfoRow[] = travelConfig.sections.map((section, index) => ({
  id: `c21f67df-71ca-4448-9e1b-a41fb7c1001${index}`,
  wedding_id: DEMO_WEDDING_ID,
  title: section.title,
  description: section.description,
  link: section.link,
  category: null,
  icon: null
}));

export const demoAnalytics: InviteAnalyticsRow[] = [
  {
    id: "4d1afef9-4be8-4df4-8b0c-6f1acba20011",
    guest_id: demoGuests[0].id,
    action: "invite_opened",
    device: "mobile",
    timestamp: "2026-03-01T10:20:00.000Z"
  },
  {
    id: "4d1afef9-4be8-4df4-8b0c-6f1acba20012",
    guest_id: demoGuests[1].id,
    action: "invite_opened",
    device: "desktop",
    timestamp: "2026-03-03T18:15:00.000Z"
  },
  {
    id: "4d1afef9-4be8-4df4-8b0c-6f1acba20013",
    guest_id: demoGuests[0].id,
    action: "rsvp_submitted",
    device: "mobile",
    timestamp: "2026-03-02T12:00:00.000Z"
  },
  {
    id: "4d1afef9-4be8-4df4-8b0c-6f1acba20014",
    guest_id: demoGuests[3].id,
    action: "invite_opened",
    device: "tablet",
    timestamp: "2026-03-05T07:45:00.000Z"
  }
];

export const demoFamilyUsers: FamilyUserRow[] = [
  {
    id: "7b8be0a1-3b7b-425e-90c4-b3d6539b0011",
    email: "family@surihana.vows",
    role: "family",
    password_hash: null,
    created_at: createdAt
  },
  {
    id: "7b8be0a1-3b7b-425e-90c4-b3d6539b0012",
    email: "admin@surihana.vows",
    role: "admin",
    password_hash: null,
    created_at: createdAt
  }
];

export const demoFamilyPosts: FamilyPostRow[] = [
  {
    id: "31f1806f-47cf-4296-848f-b77cf3310011",
    wedding_id: DEMO_WEDDING_ID,
    title: "The First Blessing Dinner",
    content:
      "Three generations gathered around a table of jasmine and cardamom tea, sharing stories from weddings past and promises for the one ahead.",
    media_url: demoPhotos[0]?.image_url ?? null,
    created_at: "2026-02-01T09:00:00.000Z",
    posted_by: "family@surihana.vows",
    post_type: "blessing"
  },
  {
    id: "31f1806f-47cf-4296-848f-b77cf3310012",
    wedding_id: DEMO_WEDDING_ID,
    title: "Letters Before Sunrise",
    content:
      "Hana and Suriya exchanged letters the morning after their engagement dinner, a ritual that became the heartbeat of this celebration.",
    media_url: demoPhotos[1]?.image_url ?? null,
    created_at: "2026-02-14T09:00:00.000Z",
    posted_by: "family@surihana.vows",
    post_type: "memory"
  },
  {
    id: "31f1806f-47cf-4296-848f-b77cf3310013",
    wedding_id: DEMO_WEDDING_ID,
    title: "Home Video Archive",
    content:
      "A restored reel from their first road trip now lives in the vault alongside the messages that shaped their next chapter.",
    media_url: demoPhotos[2]?.image_url ?? null,
    created_at: "2026-03-01T09:00:00.000Z",
    posted_by: "family@surihana.vows",
    post_type: "milestone"
  }
];
