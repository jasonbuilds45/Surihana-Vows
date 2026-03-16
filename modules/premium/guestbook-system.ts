import { DEMO_WEDDING_ID, demoMessages } from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { GuestBookSubmission, GuestMessageRow } from "@/lib/types";

export async function getGuestMessages(
  weddingId = DEMO_WEDDING_ID,
  limit = 12
): Promise<GuestMessageRow[]> {
  const client = getConfiguredSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from("guest_messages")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return demoMessages
          .filter((message) => message.wedding_id === weddingId)
          .slice(0, limit);
      }

      throw new Error(error.message);
    }

    return (data as GuestMessageRow[] | null) ?? [];
  }

  return demoMessages
    .filter((message) => message.wedding_id === weddingId)
    .slice(0, limit);
}

export async function submitGuestMessage(input: GuestBookSubmission) {
  const messagePayload: GuestMessageRow & { media_url?: string; media_type?: string } = {
    id:         crypto.randomUUID(),
    guest_name: input.guestName.trim(),
    message:    input.message.trim(),
    wedding_id: input.weddingId ?? DEMO_WEDDING_ID,
    created_at: new Date().toISOString(),
    ...(input.mediaUrl  ? { media_url:  input.mediaUrl }  : {}),
    ...(input.mediaType ? { media_type: input.mediaType } : {}),
  };

  const client = getConfiguredSupabaseClient(true);

  if (!client) {
    return {
      success: true,
      message: "Message stored in demo mode.",
      data: messagePayload,
      demoMode: true
    };
  }

  const { data, error } = await client
    .from("guest_messages")
    .insert(messagePayload)
    .select("*")
    .maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return {
        success: true,
        message: "Message stored in demo mode.",
        data: messagePayload,
        demoMode: true
      };
    }

    throw new Error(error.message);
  }

  return {
    success: true,
    message: "Message added to the guestbook.",
    data: (data as GuestMessageRow | null) ?? messagePayload
  };
}
