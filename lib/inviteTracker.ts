import { demoGuests } from "@/lib/demo-data";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

export function detectDeviceType(userAgent?: string | null) {
  if (!userAgent) {
    return "unknown";
  }

  const normalized = userAgent.toLowerCase();
  if (normalized.includes("mobile")) {
    return "mobile";
  }
  if (normalized.includes("tablet") || normalized.includes("ipad")) {
    return "tablet";
  }

  return "desktop";
}

async function resolveGuestId(inviteCode?: string, guestId?: string) {
  if (guestId) {
    return guestId;
  }

  if (!inviteCode) {
    return null;
  }

  const client = getConfiguredSupabaseClient(true);

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

export async function trackInviteAction(params: {
  action: string;
  inviteCode?: string;
  guestId?: string;
  device?: string | null;
}) {
  const client = getConfiguredSupabaseClient(true);
  const guestId = await resolveGuestId(params.inviteCode, params.guestId);
  const device = params.device ?? "unknown";

  if (!guestId) {
    return {
      success: false,
      message: "Guest not found"
    };
  }

  if (!client) {
    return {
      success: true,
      demoMode: true,
      message: "Tracked in demo mode",
      guestId
    };
  }

  const timestamp = new Date().toISOString();
  const insertAnalytics = client.from("invite_analytics").insert({
    guest_id: guestId,
    action: params.action,
    device,
    timestamp
  });

  const updates =
    params.action === "invite_opened"
      ? client
          .from("guests")
          .update({
            invite_opened: true,
            device_type: device,
            opened_at: timestamp
          })
          .eq("id", guestId)
      : Promise.resolve({ error: null });

  const [analyticsResult, updateResult] = await Promise.all([insertAnalytics, updates]);

  if (analyticsResult.error) {
    if (shouldFallbackToDemoData(analyticsResult.error)) {
      return {
        success: true,
        guestId,
        demoMode: true,
        message: "Tracked in demo mode"
      };
    }

    throw new Error(analyticsResult.error.message);
  }

  if (updateResult && "error" in updateResult && updateResult.error) {
    if (shouldFallbackToDemoData(updateResult.error)) {
      return {
        success: true,
        guestId,
        demoMode: true,
        message: "Tracked in demo mode"
      };
    }

    throw new Error(updateResult.error.message);
  }

  return {
    success: true,
    guestId,
    demoMode: false,
    message: "Invite event tracked"
  };
}
