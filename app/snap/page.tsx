import type { Metadata } from "next";
import { weddingConfig } from "@/lib/config";
import { SnapClient } from "./SnapClient";

export const metadata: Metadata = {
  title: `Share a photo — ${weddingConfig.brideName} & ${weddingConfig.groomName}`,
  description: `Capture and share a moment from ${weddingConfig.brideName} & ${weddingConfig.groomName}'s wedding.`,
};

export default function SnapPage() {
  return (
    <SnapClient
      weddingId={weddingConfig.id}
      brideName={weddingConfig.brideName}
      groomName={weddingConfig.groomName}
      weddingDate={weddingConfig.weddingDate}
    />
  );
}
