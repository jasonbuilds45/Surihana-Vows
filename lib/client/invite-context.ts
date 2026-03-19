export const INVITE_PATH_STORAGE_KEY = "surihana:last-invite-path";

export function readInvitePath() {
  try {
    return sessionStorage.getItem(INVITE_PATH_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveInvitePath(pathname: string) {
  try {
    sessionStorage.setItem(INVITE_PATH_STORAGE_KEY, pathname);
  } catch {
    // Ignore storage failures so navigation never breaks rendering.
  }
}
