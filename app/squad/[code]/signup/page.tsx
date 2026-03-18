import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getProposalByCode } from "@/modules/squad/squad-system";
import { weddingConfig } from "@/lib/config";
import { SquadSignupClient } from "./SquadSignupClient";

interface Props { params: { code: string } }

export const metadata: Metadata = {
  title: "Complete your profile | Squad",
  robots: { index: false, follow: false },
};

export default async function SquadSignupPage({ params }: Props) {
  const proposal = await getProposalByCode(params.code);

  // Must exist and be accepted
  if (!proposal) notFound();
  if (!proposal.accepted) redirect(`/squad/${params.code}`);

  // Already completed — go straight to vault if we have a way in
  // (They may come back to this URL later — just show the form again)

  return (
    <SquadSignupClient
      proposal={proposal}
      brideName={weddingConfig.brideName}
      groomName={weddingConfig.groomName}
    />
  );
}
