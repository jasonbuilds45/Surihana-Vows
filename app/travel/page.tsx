import type { Metadata } from "next";
import { TravelPageClient } from "@/components/invitation/TravelPageClient";
import { weddingConfig } from "@/lib/config";
import { getTravelGuide } from "@/modules/premium/travel-guide";

export const metadata: Metadata = { title: `Travel — ${weddingConfig.celebrationTitle}` };

export default async function TravelPage() {
  const guide = await getTravelGuide();
  return (
    <TravelPageClient
      sections={guide.sections.map((s) => ({
        id:          String(s.id),
        title:       s.title,
        description: s.description,
        link:        s.link,
        category:    s.category ?? null,
        icon:        s.icon     ?? null,
      }))}
      essentials={guide.essentials.map((e) => ({
        id:          String(e.id),
        title:       e.title,
        description: e.description,
        link:        e.link,
        icon:        e.icon     ?? null,
        category:    e.category ?? null,
      }))}
      faq={guide.faq}
      arrivalTips={guide.arrivalTips}
    />
  );
}
