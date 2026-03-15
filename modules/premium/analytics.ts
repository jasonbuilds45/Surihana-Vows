import { DEMO_WEDDING_ID, demoAnalytics, demoGuests, demoRsvps } from "@/lib/demo-data";
import { trackInviteAction } from "@/lib/inviteTracker";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { AnalyticsSnapshot, GuestRow, InviteActivityItem, InviteAnalyticsRow, RSVPRow } from "@/lib/types";

function buildDeviceBreakdown(rows: InviteAnalyticsRow[]) {
  return rows.reduce<Record<string, number>>((accumulator, row) => {
    const device = row.device ?? "unknown";
    accumulator[device] = (accumulator[device] ?? 0) + 1;
    return accumulator;
  }, {});
}

function buildAnalyticsSnapshot(
  guests: GuestRow[],
  responses: RSVPRow[],
  analyticsRows: InviteAnalyticsRow[]
): AnalyticsSnapshot {
  const openedInvites = guests.filter((guest) => guest.invite_opened).length;
  const attendingResponses = responses.filter((response) => response.attending);
  const declinedCount = responses.filter((response) => !response.attending).length;
  const attendanceGuests = attendingResponses.reduce((sum, response) => sum + response.guest_count, 0);
  const averagePartySize = attendingResponses.length > 0 ? attendanceGuests / attendingResponses.length : 0;

  return {
    totalGuests: guests.length,
    openedInvites,
    unopenedInvites: Math.max(guests.length - openedInvites, 0),
    openRate: guests.length > 0 ? openedInvites / guests.length : 0,
    totalResponses: responses.length,
    attendingCount: attendingResponses.length,
    declinedCount,
    pendingCount: Math.max(guests.length - responses.length, 0),
    attendanceGuests,
    averagePartySize,
    devices: buildDeviceBreakdown(analyticsRows)
  };
}

function buildInviteActivityItems(
  analyticsRows: InviteAnalyticsRow[],
  guests: GuestRow[],
  limit: number
): InviteActivityItem[] {
  const guestById = new Map(guests.map((guest) => [guest.id, guest]));

  return analyticsRows
    .slice()
    .sort((left, right) => (right.timestamp ?? "").localeCompare(left.timestamp ?? ""))
    .slice(0, limit)
    .map((row) => {
      const guest = guestById.get(row.guest_id);
      return {
        id: row.id,
        action: row.action,
        device: row.device,
        timestamp: row.timestamp,
        guestId: row.guest_id,
        guestName: guest ? `${guest.guest_name}${guest.family_name ? ` ${guest.family_name}` : ""}` : "Unknown guest"
      };
    });
}

async function loadWeddingAnalyticsState(weddingId: string) {
  const client = getConfiguredSupabaseClient();

  if (client) {
    const guestsResult = await client
      .from("guests")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("guest_name");

    if (guestsResult.error) {
      if (shouldFallbackToDemoData(guestsResult.error)) {
        const guests = demoGuests.filter((guest) => guest.wedding_id === weddingId);
        const guestIds = guests.map((guest) => guest.id);
        return {
          guests,
          responses: demoRsvps.filter((response) => guestIds.includes(response.guest_id)),
          analyticsRows: demoAnalytics.filter((row) => guestIds.includes(row.guest_id))
        };
      }

      throw new Error(guestsResult.error.message);
    }

    const guests = (guestsResult.data as GuestRow[] | null) ?? [];
    const guestIds = guests.map((guest) => guest.id);

    const [rsvpResult, analyticsResult] = await Promise.all([
      guestIds.length > 0 ? client.from("rsvp").select("*").in("guest_id", guestIds) : Promise.resolve({ data: [], error: null }),
      guestIds.length > 0
        ? client.from("invite_analytics").select("*").in("guest_id", guestIds)
        : Promise.resolve({ data: [], error: null })
    ]);

    if (rsvpResult.error) {
      if (shouldFallbackToDemoData(rsvpResult.error)) {
        return {
          guests,
          responses: demoRsvps.filter((response) => guestIds.includes(response.guest_id)),
          analyticsRows: demoAnalytics.filter((row) => guestIds.includes(row.guest_id))
        };
      }

      throw new Error(rsvpResult.error.message);
    }

    if (analyticsResult.error) {
      if (shouldFallbackToDemoData(analyticsResult.error)) {
        return {
          guests,
          responses: (rsvpResult.data as RSVPRow[] | null) ?? [],
          analyticsRows: demoAnalytics.filter((row) => guestIds.includes(row.guest_id))
        };
      }

      throw new Error(analyticsResult.error.message);
    }

    return {
      guests,
      responses: (rsvpResult.data as RSVPRow[] | null) ?? [],
      analyticsRows: (analyticsResult.data as InviteAnalyticsRow[] | null) ?? []
    };
  }

  const guests = demoGuests.filter((guest) => guest.wedding_id === weddingId);
  const guestIds = guests.map((guest) => guest.id);

  return {
    guests,
    responses: demoRsvps.filter((response) => guestIds.includes(response.guest_id)),
    analyticsRows: demoAnalytics.filter((row) => guestIds.includes(row.guest_id))
  };
}

export async function getAnalyticsSnapshot(weddingId = DEMO_WEDDING_ID) {
  const state = await loadWeddingAnalyticsState(weddingId);
  return buildAnalyticsSnapshot(state.guests, state.responses, state.analyticsRows);
}

export async function getRecentInviteActivity(weddingId = DEMO_WEDDING_ID, limit = 6) {
  const state = await loadWeddingAnalyticsState(weddingId);
  return buildInviteActivityItems(state.analyticsRows, state.guests, limit);
}

export async function recordInviteEvent(input: {
  action: string;
  inviteCode?: string;
  guestId?: string;
  device?: string | null;
}) {
  return trackInviteAction(input);
}
