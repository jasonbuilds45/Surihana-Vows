import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProposalByCode, markProposalOpened } from "@/modules/squad/squad-system";
import { weddingConfig } from "@/lib/config";
import { SquadProposalClient } from "./SquadProposalClient";

interface Props { params: { code: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const proposal = await getProposalByCode(params.code);
  if (!proposal) return { title: "Invitation | Surihana Vows" };

  const brideFirst = weddingConfig.brideName.split(" ")[0]!;
  const groomFirst = weddingConfig.groomName.split(" ")[0]!;
  const role = proposal.squad_role === "bridesmaid" ? "Bridesmaid" : "Groomsman";

  return {
    title: `${proposal.name} — ${role} Proposal | ${brideFirst} & ${groomFirst}`,
    description: `A private proposal from ${brideFirst} & ${groomFirst}. Open to read.`,
    // Prevent indexing — this is a private personal proposal
    robots: { index: false, follow: false },
  };
}

export default async function SquadProposalPage({ params }: Props) {
  const proposal = await getProposalByCode(params.code);
  if (!proposal) notFound();

  // Mark as opened on first visit (non-blocking)
  if (!proposal.opened_at) {
    markProposalOpened(params.code).catch(() => undefined);
  }

  return (
    <SquadProposalClient
      proposal={proposal}
      brideName={weddingConfig.brideName}
      groomName={weddingConfig.groomName}
    />
  );
}
