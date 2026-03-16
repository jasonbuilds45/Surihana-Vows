// Client-side token manager
// Reads the session token from cookie or localStorage.
// This works around Vercel preview URL cookie domain mismatches.

const STORAGE_KEY = "surihana_token";

/** Store token in localStorage for Authorization header fallback */
export function storeToken(token: string) {
  try { localStorage.setItem(STORAGE_KEY, token); } catch { /* ignore */ }
}

/** Get token — tries cookie first, then localStorage */
export function getStoredToken(): string | null {
  // Try reading the cookie directly (works when httpOnly=false)
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)surihana_session=([^;]+)`));
    if (match?.[1]) return decodeURIComponent(match[1]);
  } catch { /* ignore */ }

  // Fall back to localStorage
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

/** Clear stored token on logout */
export function clearToken() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  try {
    document.cookie = "surihana_session=; max-age=0; path=/";
  } catch { /* ignore */ }
}

/** Build fetch options that always include the session token */
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });
}
