import { travelConfig } from "@/lib/config";
import { DEMO_WEDDING_ID, demoTravelInfo } from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { TravelInfoRow } from "@/lib/types";

// Re-export the row type enriched with the new optional columns so pages
// can access category/icon without casting.
export type TravelSection = TravelInfoRow & {
  category?: "hotel" | "transport" | "essentials" | "local" | "general" | null;
  icon?: string | null;
};

export async function getTravelGuide(weddingId = DEMO_WEDDING_ID) {
  const client = getConfiguredSupabaseClient();
  let sections: TravelSection[] = demoTravelInfo.filter((section) => section.wedding_id === weddingId);

  if (client) {
    const { data, error } = await client.from("travel_info").select("*").eq("wedding_id", weddingId);
    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return {
          sections,
          essentials: travelConfig.essentials ?? [],
          faq: travelConfig.faq,
          arrivalTips: travelConfig.arrivalTips
        };
      }

      throw new Error(error.message);
    }

    sections = (data as TravelSection[] | null) ?? sections;
  }

  // Merge config essentials with any DB rows tagged as essentials
  const dbEssentials = sections.filter((s) => s.category === "essentials");
  const configEssentials = travelConfig.essentials ?? [];
  const essentials = dbEssentials.length > 0 ? dbEssentials : configEssentials;

  return {
    sections: sections.filter((s) => s.category !== "essentials"),
    essentials,
    faq: travelConfig.faq,
    arrivalTips: travelConfig.arrivalTips
  };
}
