import { eventsConfig, weddingConfig } from "@/lib/config";
import {
  DEMO_WEDDING_ID,
  demoTravelInfo,
  demoWedding
} from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { InviteBundle, WeddingRow } from "@/lib/types";
import { getWeddingEvents } from "@/modules/elegant/event-display";
import { getGuestByInviteCode } from "@/modules/elegant/guest-links";

// ─────────────────────────────────────────────────────────────────────────────
// getWeddingDetails
// Fetches the full wedding row from Supabase, including the new columns added
// in 005_schema_additions.sql (venue_address, venue_city, contact_email,
// dress_code). Falls back to demoWedding when Supabase is not configured or
// the row does not exist.
//
// Phase 3.2 change: when the DB row is returned, venue_address, venue_city,
// contact_email, and dress_code are now populated directly from the DB
// rather than coming only from config/wedding.json. The config.json values
// remain the fallback source for the demo mode object (demoWedding).
// ─────────────────────────────────────────────────────────────────────────────
export async function getWeddingDetails(weddingId = DEMO_WEDDING_ID): Promise<WeddingRow> {
  const client = getConfiguredSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from("weddings")
      .select("*")
      .eq("id", weddingId)
      .maybeSingle();

    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return demoWedding;
      }

      throw new Error(error.message);
    }

    if (data) {
      // DB row is returned as-is. The new optional columns (venue_address,
      // venue_city, contact_email, dress_code) will be null until populated
      // by the admin — callers should fall back to config values when null.
      return data as WeddingRow;
    }
  }

  return demoWedding;
}

export async function getInviteBundle(inviteCode: string): Promise<InviteBundle | null> {
  const guest = await getGuestByInviteCode(inviteCode);

  if (!guest) {
    return null;
  }

  const client = getConfiguredSupabaseClient();
  const wedding = await getWeddingDetails(guest.wedding_id);
  const events = await getWeddingEvents(guest.wedding_id);

  if (client) {
    const [travelResult] = await Promise.all([
      client.from("travel_info").select("*").eq("wedding_id", guest.wedding_id)
    ]);

    if (travelResult.error) {
      if (shouldFallbackToDemoData(travelResult.error)) {
        return {
          wedding,
          guest,
          events,
          story: weddingConfig.story,
          travelInfo: demoTravelInfo
        };
      }

      throw new Error(travelResult.error.message);
    }

    return {
      wedding,
      guest,
      events,
      story: weddingConfig.story,
      travelInfo: (travelResult.data as InviteBundle["travelInfo"] | null) ?? demoTravelInfo
    };
  }

  return {
    wedding,
    guest,
    events,
    story: weddingConfig.story,
    travelInfo: demoTravelInfo
  };
}

export async function getInvitationOverview() {
  const wedding = await getWeddingDetails();

  return {
    wedding,
    story: weddingConfig.story,
    stages: weddingConfig.stages,
    highlights: weddingConfig.highlights,
    featuredEvents: eventsConfig.slice(0, 3).map((event) => ({
      id: event.id,
      wedding_id: DEMO_WEDDING_ID,
      event_name: event.eventName,
      date: event.date,
      time: event.time,
      venue: event.venue,
      map_link: event.mapLink,
      // New DB columns — populated from config until admin updates the DB row
      description: event.description ?? null,
      dress_code: event.dressCode ?? null
    }))
  };
}
