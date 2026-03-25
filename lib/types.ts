import type { Database } from "@/lib/supabase.types";

export interface StoryBeat {
  year: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface WeddingStage {
  title: string;
  description: string;
}

export interface RitualItem {
  title: string;
  description: string;
  emoji?: string;
}

export interface WeddingConfig {
  id: string;
  brideName: string;
  groomName: string;
  celebrationTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  introQuote: string;
  weddingDate: string;
  weddingTime: string;
  weddingTime2: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  mapLink: string;
  receptionVenueName: string;
  receptionVenueAddress: string;
  receptionMapLink: string;
  dressCode: string;
  contactEmail: string;
  // Phase 4.2 — shown on /thank-you
  thankYouMessage?: string;
  // Phase 6.6 — optional YouTube / Vimeo embed URL pinned to the homepage.
  // When set, this URL is shown in the Highlight Video section above the
  // guestbook panel regardless of what is in the videos table.
  // When absent the first row from the videos table is used instead.
  // Leave unset (or set to "") to omit the section entirely in demo/pre-wedding.
  highlightVideoUrl?: string | null;
  palette: {
    background: string;
    surface: string;
    accent: string;
    accentSoft: string;
  };
  highlights: string[];
  story: StoryBeat[];
  stages: WeddingStage[];
  rituals?: RitualItem[];
}

export interface EventConfig {
  id: string;
  eventName: string;
  date: string;
  time: string;
  venue: string;
  mapLink: string;
  description: string;
  dressCode?: string;
}

export interface TravelSection {
  title: string;
  description: string;
  link: string;
  linkLabel: string;
}

export interface TravelFaq {
  question: string;
  answer: string;
}

export interface TravelEssentialItem {
  id: string;
  title: string;
  description: string;
  link: string;
  icon?: string | null;
  category: "essentials";
}

export interface TravelConfig {
  sections: TravelSection[];
  essentials?: TravelEssentialItem[];
  faq: TravelFaq[];
  arrivalTips: string[];
}

export interface GalleryCategoryConfig {
  title: string;
  category: string;
  coverImage: string;
  description: string;
}

export interface GallerySlideConfig {
  title: string;
  caption: string;
  imageUrl: string;
  category: string;
}

export interface GalleryConfig {
  featuredCategories: GalleryCategoryConfig[];
  slideshow: GallerySlideConfig[];
  // Phase 4.1 — Google Drive / Dropbox / signed URL for full album download.
  // Empty string = download feature disabled for this wedding.
  downloadUrl?: string;
}

export interface ThemeConfig {
  brand: {
    siteName: string;
    tagline: string;
  };
  navigation: Array<{
    label: string;
    href: string;
  }>;
  stages: Array<{
    stage: string;
    headline: string;
    description: string;
  }>;
}

// ── Database row type exports ─────────────────────────────────────────────────
export type WeddingRow         = Database["public"]["Tables"]["weddings"]["Row"];
export type GuestRow           = Database["public"]["Tables"]["guests"]["Row"];
export type RSVPRow            = Database["public"]["Tables"]["rsvp"]["Row"];
export type EventRow           = Database["public"]["Tables"]["events"]["Row"];
export type GuestMessageRow    = Database["public"]["Tables"]["guest_messages"]["Row"];
export type PhotoRow           = Database["public"]["Tables"]["photos"]["Row"];
export type VideoRow           = Database["public"]["Tables"]["videos"]["Row"];
export type TravelInfoRow      = Database["public"]["Tables"]["travel_info"]["Row"];
export type InviteAnalyticsRow = Database["public"]["Tables"]["invite_analytics"]["Row"];
export type FamilyUserRow      = Database["public"]["Tables"]["family_users"]["Row"];
export type FamilyPostRow            = Database["public"]["Tables"]["family_posts"]["Row"];
export type FamilyPostReactionRow    = Database["public"]["Tables"]["family_post_reactions"]["Row"];

// Phase 3.3 — previously missing tables, now fully typed
export type FamilyMagicLinkRow      = Database["public"]["Tables"]["family_magic_links"]["Row"];
export type InviteAccessCodeRow     = Database["public"]["Tables"]["invite_access_codes"]["Row"];
export type WeddingStageOverrideRow = Database["public"]["Tables"]["wedding_stage_overrides"]["Row"];

// Phase 7 — Time Capsule + Guest Journey
export type TimeCapsuleRow      = Database["public"]["Tables"]["time_capsules"]["Row"];
export type GuestPredictionRow  = Database["public"]["Tables"]["guest_predictions"]["Row"];

export type TimeCapsulePostType = TimeCapsuleRow["post_type"];

export type GuestRole = "family" | "friends" | "bride_side" | "groom_side" | "vip";

// ── Prediction config types (driven by config/predictions.json) ──────────────
export interface PredictionOption {
  value: string;
  label: string;
}

export interface PredictionQuestion {
  id: string;
  question: string;
  emoji: string;
  options: PredictionOption[];
}

export interface PredictionsConfig {
  /** Whether the game is enabled for this wedding */
  enabled: boolean;
  /**
   * ISO date-time after which results are shown publicly on /predictions.
   * Set to the reception end time. Before this, guests can vote but tallies
   * are hidden so the reveal feels magical during the event.
   */
  revealAfter: string;
  questions: PredictionQuestion[];
}

// ── Time Capsule view model (enriched for UI rendering) ──────────────────────
export interface TimeCapsuleCard {
  id: string;
  authorName: string;
  message: string;
  mediaUrl: string | null;
  postType: TimeCapsulePostType;
  unlockDate: string;
  isRevealed: boolean;
  /** Human-readable unlock label: "5th Anniversary", "1 January 2031", etc. */
  unlockLabel: string;
  /** Days remaining until unlock. 0 when revealed. */
  daysRemaining: number;
}

// ── Prediction results view model ────────────────────────────────────────────
export interface PredictionResult {
  questionId: string;
  question: string;
  emoji: string;
  options: Array<{
    value: string;
    label: string;
    votes: number;
    percentage: number;
    isLeading: boolean;
  }>;
  totalVotes: number;
}

// ── Application interfaces ────────────────────────────────────────────────────

export interface InviteBundle {
  wedding: WeddingRow;
  guest: GuestRow;
  events: EventRow[];
  story: StoryBeat[];
  travelInfo: TravelInfoRow[];
}

export interface RSVPSubmission {
  guestId?: string;
  inviteCode?: string;
  guestName?: string;
  attending: boolean;
  guestCount: number;
  message?: string;
}

export interface RSVPSubmissionResult {
  success: boolean;
  message: string;
  data?: RSVPRow;
  demoMode?: boolean;
}

export interface GuestBookSubmission {
  guestName:  string;
  message:    string;
  weddingId?: string;
  mediaUrl?:  string;
  mediaType?: "image" | "video" | "audio";
}

export interface UploadPhotoSubmission {
  file: File;
  uploadedBy: string;
  weddingId: string;
  category: string;
}

export interface AnalyticsSnapshot {
  totalGuests: number;
  openedInvites: number;
  unopenedInvites: number;
  openRate: number;
  totalResponses: number;
  attendingCount: number;
  declinedCount: number;
  pendingCount: number;
  attendanceGuests: number;
  averagePartySize: number;
  devices: Record<string, number>;
}

export interface InviteActivityItem {
  id: string;
  action: string;
  device: string | null;
  timestamp: string | null;
  guestId: string;
  guestName: string;
}

export interface LiveTimelineItem {
  time: string;
  title: string;
  description: string;
  status: "upcoming" | "live" | "completed";
}

export interface LivestreamBundle {
  weddingId: string;
  embedUrl: string | null;
  headline: string;
  description: string;
  countdownTarget: string;
  timeline: LiveTimelineItem[];
  livePhotos: PhotoRow[];
  guestMessages: GuestMessageRow[];
  /** null when returned to unauthenticated callers — analytics are admin-only */
  analytics: AnalyticsSnapshot | null;
  /** empty array for unauthenticated callers */
  recentActivity: InviteActivityItem[];
}

export interface GuestInviteRow extends GuestRow {
  invitePath: string;
  inviteLink: string;
  attending?: boolean | null;
  guestCount?: number | null;
}

export interface FamilyVaultBundle {
  wedding: WeddingRow;
  posts: FamilyPostRow[];
  photos: PhotoRow[];
  videos: VideoRow[];
  timeline: Array<{
    year: string;
    title: string;
    detail: string;
  }>;
}
