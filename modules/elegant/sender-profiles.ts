// modules/elegant/sender-profiles.ts
// Resolves a sender profile from a ?from= query parameter code.
// Used by both /invite/general and /invite/[guest] pages.

import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { SenderProfileRow } from "@/lib/types";

export type { SenderProfileRow };

/**
 * Resolves a sender profile from a URL-safe sender_code string.
 * Returns null when:
 *   - no code supplied (caller should render couple as host)
 *   - code not found in DB
 *   - Supabase not configured (demo mode)
 */
export async function getSenderProfile(
  senderCode: string | null | undefined,
  weddingId: string
): Promise<SenderProfileRow | null> {
  if (!senderCode?.trim()) return null;

  const client = getConfiguredSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from("sender_profiles")
    .select("*")
    .eq("sender_code", senderCode.trim())
    .eq("wedding_id", weddingId)
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) return null;
    console.error("[sender-profiles] lookup error:", error.message);
    return null;
  }

  return (data as SenderProfileRow | null) ?? null;
}

/**
 * Returns all sender profiles for a wedding (used in admin panel).
 */
export async function getAllSenderProfiles(
  weddingId: string
): Promise<SenderProfileRow[]> {
  const client = getConfiguredSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from("sender_profiles")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  if (error) {
    if (shouldFallbackToDemoData(error)) return [];
    console.error("[sender-profiles] fetch-all error:", error.message);
    return [];
  }

  return (data as SenderProfileRow[]) ?? [];
}

/**
 * Builds both invite URLs for a sender profile.
 * Generic:      /invite/general?from=<code>
 * Personalised: /invite/<guestCode>?from=<code>   (caller supplies guestCode)
 */
export function buildSenderUrls(
  senderCode: string,
  baseUrl: string,
  guestCode?: string
): { genericUrl: string; personalisedUrl: string | null } {
  const base = baseUrl.replace(/\/$/, "");
  return {
    genericUrl:      `${base}/invite/general?from=${encodeURIComponent(senderCode)}`,
    personalisedUrl: guestCode
      ? `${base}/invite/${encodeURIComponent(guestCode)}?from=${encodeURIComponent(senderCode)}`
      : null,
  };
}
