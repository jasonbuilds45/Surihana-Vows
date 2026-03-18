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

  // Unknown code → 404
  if (!proposal) notFound();

  // Explicitly declined → send back to proposal page
  if (proposal.accepted === false) {
    redirect(`/squad/${params.code}`);
  }

  // accepted === null (pending) or accepted === true — both show the form.
  //
  // Why allow pending here?
  // The "Complete your profile" button appears on the client immediately after
  // the person taps "Yes". There is a small window where the DB write from
  // /api/squad/accept has succeeded (the client received { success: true })
  // but the server-side fetch in this page might still see the old row due to
  // replication lag or cache. Redirecting back to /squad/[code] in that case
  // creates a confusing loop.
  //
  // The profile API route (/api/squad/profile) independently validates that
  // accepted === true before saving, so there's no security issue with showing
  // the form to someone whose acceptance hasn't propagated yet.

  return (
    <SquadSignupClient
      proposal={proposal}
      brideName={weddingConfig.brideName}
      groomName={weddingConfig.groomName}
    />
  );
}
