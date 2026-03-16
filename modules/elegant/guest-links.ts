import { DEMO_WEDDING_ID, demoGuests, demoRsvps } from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { GuestInviteRow, GuestRow, RSVPRow } from "@/lib/types";
import { generateInviteCode } from "@/utils/generateInviteCode";
import { generateInvitePath, generateInviteUrl } from "@/utils/generateInviteLink";
import { buildInviteCode, normalizeGuestSlug, parseGuestSlug } from "@/utils/guestParser";

export interface GuestMutationInput {
  weddingId: string;
  guestName: string;
  familyName?: string | null;
  phone?: string | null;
  guestRole?: "family" | "friends" | "bride_side" | "groom_side" | "vip" | null;
  regenerateInviteCode?: boolean;
}

function buildGuestInviteRow(guest: GuestRow, response?: RSVPRow | null): GuestInviteRow {
  return {
    ...guest,
    invitePath: generateInvitePath(guest.invite_code),
    inviteLink: generateInviteUrl(guest.invite_code),
    attending: response?.attending ?? null,
    guestCount: response?.guest_count ?? null
  };
}

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

async function getWeddingGuests(weddingId: string) {
  const client = getConfiguredSupabaseClient();
  let guests = demoGuests.filter((guest) => guest.wedding_id === weddingId);

  if (client) {
    const { data, error } = await client
      .from("guests")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("guest_name");

    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return guests;
      }

      throw new Error(error.message);
    }

    guests = (data as GuestRow[] | null) ?? guests;
  }

  return guests;
}

async function getWeddingRsvps(guestIds: string[]) {
  if (guestIds.length === 0) {
    return [] as RSVPRow[];
  }

  const client = getConfiguredSupabaseClient();
  let rsvps = demoRsvps.filter((response) => guestIds.includes(response.guest_id));

  if (client) {
    const { data, error } = await client.from("rsvp").select("*").in("guest_id", guestIds);
    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return rsvps;
      }

      throw new Error(error.message);
    }

    rsvps = (data as RSVPRow[] | null) ?? rsvps;
  }

  return rsvps;
}

async function getExistingInviteCodes(weddingId: string, excludeGuestId?: string) {
  const guests = await getWeddingGuests(weddingId);
  return guests
    .filter((guest) => guest.id !== excludeGuestId)
    .map((guest) => guest.invite_code);
}

function buildInviteCodeForGuest(
  guestName: string,
  familyName: string | null,
  existingCodes: string[],
  currentInviteCode?: string
) {
  const preferredCode = buildInviteCode(guestName, familyName ?? undefined);

  if (preferredCode && preferredCode === currentInviteCode) {
    return preferredCode;
  }

  return generateInviteCode(guestName, familyName, existingCodes);
}

function buildPreviewGuest(inviteCode: string): GuestRow | null {
  const normalizedCode = normalizeGuestSlug(inviteCode);
  if (normalizedCode !== "test" && normalizedCode !== "preview") {
    return null;
  }

  const parsed = parseGuestSlug(normalizedCode);

  return {
    id: `preview-${normalizedCode}`,
    wedding_id: DEMO_WEDDING_ID,
    guest_name: parsed.guestName || "Guest",
    family_name: parsed.familyName ?? "Preview",
    phone: null,
    invite_code: normalizedCode,
    invite_opened: false,
    device_type: null,
    opened_at: null,
    guest_role: null,
    city: null,
    country: null
  };
}

export async function getGuestByInviteCode(inviteCode: string) {
  const normalizedCode = normalizeGuestSlug(inviteCode);
  const client = getConfiguredSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from("guests")
      .select("*")
      .eq("invite_code", normalizedCode)
      .maybeSingle();

    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return demoGuests.find((guest) => guest.invite_code === normalizedCode) ?? null;
      }

      throw new Error(error.message);
    }

    return (data as GuestRow | null) ?? buildPreviewGuest(normalizedCode);
  }

  return demoGuests.find((guest) => guest.invite_code === normalizedCode) ?? buildPreviewGuest(normalizedCode);
}

export function createInviteCode(guestName: string, familyName?: string | null) {
  return buildInviteCode(guestName, familyName ?? undefined);
}

export async function listGuestLinks(weddingId = DEMO_WEDDING_ID): Promise<GuestInviteRow[]> {
  const guests = await getWeddingGuests(weddingId);
  const rsvps = await getWeddingRsvps(guests.map((guest) => guest.id));
  const rsvpByGuestId = new Map(rsvps.map((response) => [response.guest_id, response]));

  return guests.map((guest) => buildGuestInviteRow(guest, rsvpByGuestId.get(guest.id)));
}

export async function createGuestRecord(input: GuestMutationInput) {
  const guestName = input.guestName.trim();
  if (guestName.length < 2) {
    throw new Error("Guest name must be at least 2 characters long.");
  }

  const familyName = normalizeOptionalText(input.familyName);
  const phone = normalizeOptionalText(input.phone);
  const existingCodes = await getExistingInviteCodes(input.weddingId);
  const inviteCode = buildInviteCodeForGuest(guestName, familyName, existingCodes);

  const payload: GuestRow = {
    id: crypto.randomUUID(),
    wedding_id: input.weddingId,
    guest_name: guestName,
    family_name: familyName,
    phone,
    invite_code: inviteCode,
    invite_opened: false,
    device_type: null,
    opened_at: null,
    guest_role: input.guestRole ?? null
  };

  const client = getConfiguredSupabaseClient(true);

  if (!client) {
    return buildGuestInviteRow(payload);
  }

  const { data, error } = await client.from("guests").insert(payload).select("*").maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return buildGuestInviteRow(payload);
    }

    throw new Error(error.message);
  }

  return buildGuestInviteRow((data as GuestRow | null) ?? payload);
}

export async function updateGuestRecord(guestId: string, input: GuestMutationInput) {
  const client = getConfiguredSupabaseClient(true);
  const guestName = input.guestName.trim();
  if (guestName.length < 2) {
    throw new Error("Guest name must be at least 2 characters long.");
  }

  const familyName = normalizeOptionalText(input.familyName);
  const phone = normalizeOptionalText(input.phone);
  const existingCodes = await getExistingInviteCodes(input.weddingId, guestId);

  const existingGuest = client
    ? await client.from("guests").select("*").eq("id", guestId).maybeSingle()
    : {
        data:
          demoGuests.find((guest) => guest.id === guestId && guest.wedding_id === input.weddingId) ?? null,
        error: null
      };

  if (existingGuest.error) {
    if (shouldFallbackToDemoData(existingGuest.error)) {
      const demoGuest = demoGuests.find((guest) => guest.id === guestId && guest.wedding_id === input.weddingId);
      if (!demoGuest) {
        throw new Error("Guest not found.");
      }

      return buildGuestInviteRow({
        ...demoGuest,
        guest_name: guestName,
        family_name: familyName,
        phone,
        invite_code: input.regenerateInviteCode
          ? buildInviteCodeForGuest(guestName, familyName, existingCodes, demoGuest.invite_code)
          : demoGuest.invite_code
      });
    }

    throw new Error(existingGuest.error.message);
  }

  if (!existingGuest.data) {
    throw new Error("Guest not found.");
  }
  const currentGuest = existingGuest.data as GuestRow;
  const inviteCode =
    input.regenerateInviteCode || !currentGuest.invite_code
      ? buildInviteCodeForGuest(guestName, familyName, existingCodes, currentGuest.invite_code)
      : currentGuest.invite_code;

  const updates = {
    guest_name: guestName,
    family_name: familyName,
    phone,
    invite_code: inviteCode,
    guest_role: input.guestRole !== undefined ? (input.guestRole ?? null) : currentGuest.guest_role
  };

  if (!client) {
    return buildGuestInviteRow({
      ...currentGuest,
      ...updates
    });
  }

  const { data, error } = await client.from("guests").update(updates).eq("id", guestId).select("*").maybeSingle();

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return buildGuestInviteRow({
        ...currentGuest,
        ...updates
      });
    }

    throw new Error(error.message);
  }

  const rsvpResult = await client.from("rsvp").select("*").eq("guest_id", guestId).maybeSingle();
  if (rsvpResult.error) {
    if (shouldFallbackToDemoData(rsvpResult.error)) {
      return buildGuestInviteRow((data as GuestRow | null) ?? { ...currentGuest, ...updates });
    }

    throw new Error(rsvpResult.error.message);
  }

  return buildGuestInviteRow(
    (data as GuestRow | null) ?? { ...currentGuest, ...updates },
    (rsvpResult.data as RSVPRow | null) ?? null
  );
}

export async function deleteGuestRecord(guestId: string) {
  const client = getConfiguredSupabaseClient(true);

  if (!client) {
    return { success: true, guestId, demoMode: true };
  }

  const { error } = await client.from("guests").delete().eq("id", guestId);

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return { success: true, guestId, demoMode: true };
    }

    throw new Error(error.message);
  }

  return { success: true, guestId, demoMode: false };
}
