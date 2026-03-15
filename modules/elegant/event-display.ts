import { eventsConfig } from "@/lib/config";
import { DEMO_WEDDING_ID, demoEvents } from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { EventRow } from "@/lib/types";

export interface DisplayEvent extends EventRow {
  description: string;
  dressCode?: string;
}

export async function getWeddingEvents(weddingId = DEMO_WEDDING_ID): Promise<DisplayEvent[]> {
  const client = getConfiguredSupabaseClient();
  let events: EventRow[] = demoEvents.filter((event) => event.wedding_id === weddingId);

  if (client) {
    const { data, error } = await client
      .from("events")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("date")
      .order("time");

    if (error) {
      if (shouldFallbackToDemoData(error)) {
        events = demoEvents.filter((event) => event.wedding_id === weddingId);
      } else {
        throw new Error(error.message);
      }
    } else {
      events = (data as EventRow[] | null) ?? events;
    }
  }

  return events.map((event) => {
    const configEvent =
      eventsConfig.find(
        (candidate) =>
          candidate.eventName === event.event_name &&
          candidate.date === event.date &&
          candidate.time === event.time
      ) ?? eventsConfig.find((candidate) => candidate.eventName === event.event_name);

    return {
      ...event,
      description: configEvent?.description ?? "",
      dressCode: configEvent?.dressCode
    };
  });
}

export async function groupEventsByDate(weddingId = DEMO_WEDDING_ID) {
  const events = await getWeddingEvents(weddingId);

  return events.reduce<Record<string, DisplayEvent[]>>((groups, event) => {
    groups[event.date] ??= [];
    groups[event.date].push(event);
    return groups;
  }, {});
}
