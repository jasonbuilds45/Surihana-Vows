import type { Metadata } from "next";
import { EventCard } from "@/components/invitation/EventCard";
import { WeddingTimeline } from "@/components/invitation/WeddingTimeline";
import { PageHero } from "@/components/layout/PageHero";
import { weddingConfig } from "@/lib/config";
import { getWeddingEvents } from "@/modules/elegant/event-display";

export const metadata: Metadata = { title: `Events — ${weddingConfig.celebrationTitle}` };

export default async function EventsPage() {
  const events = await getWeddingEvents();
  return (
    <div style={{ background: "#FFFFFF" }}>
      <PageHero
        eyebrow="Wedding weekend"
        title={<>Three days,<br />forever memories.</>}
        subtitle="Every event, every venue, every detail — with maps, dress codes, and one-tap calendar saves."
        variant="white"
      />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem clamp(1.25rem,5vw,4rem) 6rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        <WeddingTimeline events={events} weddingDate={weddingConfig.weddingDate} />
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {events.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </div>
    </div>
  );
}
