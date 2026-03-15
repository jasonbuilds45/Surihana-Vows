export function normalizeGuestSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function humanizeInviteCode(inviteCode: string) {
  return inviteCode
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseGuestSlug(inviteCode: string) {
  const humanized = humanizeInviteCode(inviteCode);
  const [guestName = "", ...familyParts] = humanized.split(" ");

  return {
    inviteCode,
    guestName,
    familyName: familyParts.join(" ") || null,
    label: humanized
  };
}

export function buildInviteCode(guestName: string, familyName?: string) {
  return normalizeGuestSlug([guestName, familyName].filter(Boolean).join(" "));
}
