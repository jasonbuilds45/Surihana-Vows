// =============================================================================
// modules/luxury/time-capsule.ts
//
// Wedding Time Capsule — data layer.
//
// Handles reading, writing, and revealing time capsules. All public-facing
// reads filter to revealed capsules only. The family vault server page uses
// the admin client (bypasses RLS) to show locked capsules with countdown UI.
//
// Unlock flow:
//   1. Page-load check: getTimeCapsules() always calls revealDueCapsules()
//      first, which flips is_revealed = true for any capsule whose
//      unlock_date <= now(). This catches couples who open the vault without
//      the pg_cron job running.
//   2. pg_cron daily job (007_time_capsule.sql): runs at 07:00 UTC, same
//      UPDATE query. Catches cases where nobody opens the vault that day.
//   3. Notification emails: sent by dispatchCapsuleNotifications() after reveal,
//      using the existing emailSender.ts abstraction.
// =============================================================================

import { weddingConfig } from "@/lib/config";
import { DEMO_WEDDING_ID } from "@/lib/demo-data";
import { buildCapsuleUnlockEmail, sendEmail } from "@/lib/emailSender";
import { getConfiguredSupabaseClient, getSupabaseAdminClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { TimeCapsuleCard, TimeCapsulePostType, TimeCapsuleRow } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function daysUntil(isoDate: string): number {
  const ms = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function buildUnlockLabel(row: TimeCapsuleRow, weddingDate: string): string {
  const unlock = new Date(row.unlock_date);

  if (row.post_type === "anniversary") {
    const wYear = new Date(weddingDate).getFullYear();
    const years = unlock.getFullYear() - wYear;
    const suffix =
      years === 1 ? "st" : years === 2 ? "nd" : years === 3 ? "rd" : "th";
    return `${years}${suffix} Anniversary`;
  }

  if (row.post_type === "life_event") {
    // For life events the author encodes the label in the first line of message
    // prefixed with "📍 ". Fall back to formatted date if not present.
    const firstLine = row.message.split("\n")[0] ?? "";
    const match = firstLine.match(/^📍\s+(.+)/);
    if (match) return match[1];
  }

  return unlock.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function toTimeCapsuleCard(row: TimeCapsuleRow, weddingDate: string): TimeCapsuleCard {
  return {
    id: row.id,
    authorName: row.author_name,
    message: row.message,
    mediaUrl: row.media_url,
    postType: row.post_type,
    unlockDate: row.unlock_date,
    isRevealed: row.is_revealed,
    unlockLabel: buildUnlockLabel(row, weddingDate),
    daysRemaining: row.is_revealed ? 0 : daysUntil(row.unlock_date)
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// revealDueCapsules
// Marks all capsules whose unlock_date <= now() as revealed.
// Called on every vault page load — idempotent, cheap (indexed query).
// ─────────────────────────────────────────────────────────────────────────────
async function revealDueCapsules(weddingId: string): Promise<TimeCapsuleRow[]> {
  const adminClient = getSupabaseAdminClient();
  if (!adminClient) return [];

  const { data, error } = await adminClient
    .from("time_capsules")
    .update({ is_revealed: true })
    .eq("wedding_id", weddingId)
    .lte("unlock_date", new Date().toISOString())
    .eq("is_revealed", false)
    .select("*");

  if (error) {
    if (shouldFallbackToDemoData(error)) return [];
    console.error("[time-capsule] revealDueCapsules error:", error.message);
    return [];
  }

  return (data as TimeCapsuleRow[] | null) ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// dispatchCapsuleNotifications
// Sends unlock notification emails for newly revealed capsules.
// Only called after revealDueCapsules() returns rows.
// ─────────────────────────────────────────────────────────────────────────────
async function dispatchCapsuleNotifications(
  newlyRevealed: TimeCapsuleRow[]
): Promise<void> {
  if (newlyRevealed.length === 0) return;

  const adminClient = getSupabaseAdminClient();
  const emailTargets = newlyRevealed.filter((r) => r.author_email);
  const coupleEmail = weddingConfig.contactEmail;

  // Always notify the couple
  const recipients = new Set<string>([coupleEmail]);
  for (const row of emailTargets) {
    if (row.author_email) recipients.add(row.author_email);
  }

  const notifyIds = newlyRevealed.map((r) => r.id);

  for (const email of recipients) {
    const payload = buildCapsuleUnlockEmail({
      to: email,
      count: newlyRevealed.length,
      brideName: weddingConfig.brideName,
      groomName: weddingConfig.groomName,
      vaultUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/family`
    });
    await sendEmail(payload);
  }

  // Mark notifications as sent so we don't fire again
  if (adminClient && notifyIds.length > 0) {
    await adminClient
      .from("time_capsules")
      .update({ notify_sent: true })
      .in("id", notifyIds)
      .eq("notify_sent", false);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getTimeCapsules  (main read — called by family vault page)
//
// Returns ALL capsules for the wedding (revealed + locked) enriched as
// TimeCapsuleCard. Uses admin client to bypass RLS so the vault can show
// locked capsules with countdown UI to authenticated family users.
// ─────────────────────────────────────────────────────────────────────────────
export async function getTimeCapsules(
  weddingId = DEMO_WEDDING_ID
): Promise<TimeCapsuleCard[]> {
  // 1. Page-load reveal check
  const newlyRevealed = await revealDueCapsules(weddingId);
  if (newlyRevealed.length > 0) {
    void dispatchCapsuleNotifications(newlyRevealed);
  }

  // 2. Fetch all capsules (admin client bypasses RLS)
  const adminClient = getSupabaseAdminClient();
  if (!adminClient) return demoCapsules(weddingId);

  const { data, error } = await adminClient
    .from("time_capsules")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("unlock_date", { ascending: true });

  if (error) {
    if (shouldFallbackToDemoData(error)) return demoCapsules(weddingId);
    throw new Error(error.message);
  }

  const rows = (data as TimeCapsuleRow[] | null) ?? [];
  return rows.map((r) => toTimeCapsuleCard(r, weddingConfig.weddingDate));
}

// ─────────────────────────────────────────────────────────────────────────────
// submitTimeCapsule  (called by the public POST API route)
// ─────────────────────────────────────────────────────────────────────────────
export async function submitTimeCapsule(input: {
  weddingId: string;
  authorName: string;
  authorEmail?: string | null;
  message: string;
  mediaUrl?: string | null;
  postType: TimeCapsulePostType;
  unlockDate: string;
}): Promise<{ success: boolean; message: string; demoMode?: boolean }> {
  const payload: TimeCapsuleRow = {
    id: crypto.randomUUID(),
    wedding_id: input.weddingId,
    author_name: input.authorName.trim(),
    author_email: input.authorEmail?.trim() || null,
    message: input.message.trim(),
    media_url: input.mediaUrl ?? null,
    post_type: input.postType,
    unlock_date: input.unlockDate,
    is_revealed: false,
    notify_sent: false,
    created_at: new Date().toISOString()
  };

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return { success: true, message: "Capsule stored in demo mode.", demoMode: true };
  }

  const { error } = await client.from("time_capsules").insert(payload);

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return { success: true, message: "Capsule stored in demo mode.", demoMode: true };
    }
    throw new Error(error.message);
  }

  return {
    success: true,
    message: "Your message has been sealed. It will open on " +
      new Date(input.unlockDate).toLocaleDateString("en-US", {
        day: "numeric", month: "long", year: "numeric"
      }) + "."
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo capsules — shown when Supabase is not configured
// ─────────────────────────────────────────────────────────────────────────────
function demoCapsules(weddingId: string): TimeCapsuleCard[] {
  const base = new Date(weddingConfig.weddingDate);

  return [
    {
      id: "demo-capsule-1",
      authorName: "Mom & Dad",
      message: "We wrote this on the morning of your wedding. Open it slowly, together, when the world feels quieter than it does today.",
      mediaUrl: null,
      postType: "anniversary",
      unlockDate: new Date(base.getFullYear() + 5, base.getMonth(), base.getDate()).toISOString(),
      isRevealed: false,
      unlockLabel: "5th Anniversary",
      daysRemaining: 365 * 5
    },
    {
      id: "demo-capsule-2",
      authorName: "Your friends from that airport lounge",
      message: "We promised we'd write something funny. We did. You're going to laugh. Or maybe cry. Probably both.",
      mediaUrl: null,
      postType: "timed",
      unlockDate: new Date(base.getFullYear() + 1, 0, 1).toISOString(),
      isRevealed: false,
      unlockLabel: "1 January " + (base.getFullYear() + 1),
      daysRemaining: 180
    },
    {
      id: "demo-capsule-3",
      authorName: "Nani",
      message: "May your home always smell like food and sound like laughter. This message has always been for you — from the day you were born.",
      mediaUrl: null,
      postType: "life_event",
      unlockDate: new Date(base.getFullYear(), base.getMonth(), base.getDate()).toISOString(),
      isRevealed: true,
      unlockLabel: "Wedding Day",
      daysRemaining: 0
    }
  ];
}
