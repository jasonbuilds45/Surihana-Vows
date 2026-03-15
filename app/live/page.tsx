import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getLivestreamBundle } from "@/modules/luxury/livestream";
import { LiveHubClient } from "@/app/live/LiveHubClient";
import { weddingConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Live — ${weddingConfig.celebrationTitle}`,
  description: `Follow ${weddingConfig.brideName} & ${weddingConfig.groomName}'s wedding day in real time.`
};

export default async function LivePage() {
  const bundle = await getLivestreamBundle();

  return (
    <Container>
      <LiveHubClient allowGuestUploads initialBundle={bundle} />
    </Container>
  );
}
