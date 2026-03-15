import { buildInviteCode } from "@/utils/guestParser";

function normalizeSiteUrl(siteUrl: string) {
  return siteUrl.replace(/\/$/, "");
}

export function generateInvitePath(inviteCode: string) {
  return `/invite/${inviteCode}`;
}

export function generateInviteUrl(
  inviteCode: string,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
) {
  return `${normalizeSiteUrl(siteUrl)}${generateInvitePath(inviteCode)}`;
}

export function generateInviteLink(
  guestName: string,
  familyName?: string | null,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
) {
  return generateInviteUrl(buildInviteCode(guestName, familyName ?? undefined), siteUrl);
}
