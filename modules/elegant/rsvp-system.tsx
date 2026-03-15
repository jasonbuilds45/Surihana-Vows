import { demoGuests, demoRsvps } from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { RSVPRow, RSVPSubmission, RSVPSubmissionResult } from "@/lib/types";

async function resolveGuestId(guestId?: string, inviteCode?: string) {
  if (guestId) {
    return guestId;
  }

  if (!inviteCode) {
    return null;
  }

  const client = getConfiguredSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from("guests")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return demoGuests.find((guest) => guest.invite_code === inviteCode)?.id ?? null;
      }

      throw new Error(error.message);
    }

    return data?.id ?? null;
  }

  return demoGuests.find((guest) => guest.invite_code === inviteCode)?.id ?? null;
}

export async function submitRsvp(submission: RSVPSubmission): Promise<RSVPSubmissionResult> {
  if (submission.guestCount < 1 || submission.guestCount > 10) {
    return {
      success: false,
      message: "Guest count must be between 1 and 10."
    };
  }

  const guestId = await resolveGuestId(submission.guestId, submission.inviteCode);

  if (!guestId) {
    return {
      success: false,
      message: "Guest could not be found for this RSVP."
    };
  }

  const payload: RSVPRow = {
    id: crypto.randomUUID(),
    guest_id: guestId,
    attending: submission.attending,
    guest_count: submission.guestCount,
    message: submission.message?.trim() || null,
    submitted_at: new Date().toISOString()
  };

  const client = getConfiguredSupabaseClient(true);

  if (!client) {
    return {
      success: true,
      message: "RSVP saved in demo mode.",
      data: payload,
      demoMode: true
    };
  }

  const { data: existing, error: existingError } = await client
    .from("rsvp")
    .select("*")
    .eq("guest_id", guestId)
    .maybeSingle();

  if (existingError) {
    if (shouldFallbackToDemoData(existingError)) {
      return {
        success: true,
        message: "RSVP saved in demo mode.",
        data: payload,
        demoMode: true
      };
    }

    throw new Error(existingError.message);
  }

  if (existing) {
    const currentRsvp = existing as RSVPRow;
    const { data, error } = await client
      .from("rsvp")
      .update({
        attending: payload.attending,
        guest_count: payload.guest_count,
        message: payload.message,
        submitted_at: payload.submitted_at
      })
      .eq("id", currentRsvp.id)
      .select("*")
      .maybeSingle();

    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return {
          success: true,
          message: "RSVP updated in demo mode.",
          data: payload,
          demoMode: true
        };
      }

      throw new Error(error.message);
    }

    return {
      success: true,
      message: "RSVP updated successfully.",
      data: (data as RSVPRow | null) ?? payload
    };
  }

  const { data, error } = await client.from("rsvp").insert(payload).select("*").maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return {
        success: true,
        message: "RSVP saved in demo mode.",
        data: payload,
        demoMode: true
      };
    }

    throw new Error(error.message);
  }

  return {
    success: true,
    message: "RSVP submitted successfully.",
    data: (data as RSVPRow | null) ?? payload
  };
}

export async function getGuestRsvp(guestId: string) {
  const client = getConfiguredSupabaseClient();

  if (client) {
    const { data, error } = await client.from("rsvp").select("*").eq("guest_id", guestId).maybeSingle();
    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return demoRsvps.find((rsvp) => rsvp.guest_id === guestId) ?? null;
      }

      throw new Error(error.message);
    }

    return (data as RSVPRow | null) ?? null;
  }

  return demoRsvps.find((rsvp) => rsvp.guest_id === guestId) ?? null;
}

export async function getRsvpOverview(guestIds?: string[]): Promise<RSVPRow[]> {
  const client = getConfiguredSupabaseClient();

  if (client) {
    let query = client.from("rsvp").select("*");
    if (guestIds && guestIds.length > 0) {
      query = query.in("guest_id", guestIds);
    }

    const { data, error } = await query;
    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return guestIds && guestIds.length > 0
          ? demoRsvps.filter((response) => guestIds.includes(response.guest_id))
          : demoRsvps;
      }

      throw new Error(error.message);
    }

    return (data as RSVPRow[] | null) ?? [];
  }

  if (guestIds && guestIds.length > 0) {
    return demoRsvps.filter((response) => guestIds.includes(response.guest_id));
  }

  return demoRsvps;
}
