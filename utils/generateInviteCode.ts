import { buildInviteCode } from "@/utils/guestParser";

export function generateInviteCode(
  guestName: string,
  familyName?: string | null,
  existingCodes: string[] = []
) {
  const normalizedExisting = new Set(existingCodes.map((code) => code.trim().toLowerCase()));
  const baseCode = buildInviteCode(guestName, familyName ?? undefined) || crypto.randomUUID().split("-")[0];

  if (!normalizedExisting.has(baseCode)) {
    return baseCode;
  }

  return `${baseCode}-${crypto.randomUUID().split("-")[0]}`;
}

export default generateInviteCode;
