import { NextRequest, NextResponse } from "next/server";
import { detectDeviceType } from "@/lib/inviteTracker";
import { getRsvpOverview, submitRsvp } from "@/modules/elegant/rsvp-system";
import { recordInviteEvent } from "@/modules/premium/analytics";

function isValidRsvpPayload(payload: Record<string, unknown>) {
  return (
    typeof payload.attending === "boolean" &&
    typeof payload.guestCount === "number" &&
    payload.guestCount >= 1 &&
    payload.guestCount <= 10 &&
    (payload.guestId === undefined || typeof payload.guestId === "string") &&
    (payload.inviteCode === undefined || typeof payload.inviteCode === "string") &&
    (payload.message === undefined || typeof payload.message === "string")
  );
}

export async function GET() {
  try {
    const data = await getRsvpOverview();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load RSVPs."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    if (!isValidRsvpPayload(payload)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid RSVP payload."
        },
        { status: 400 }
      );
    }

    const result = await submitRsvp({
      guestId: payload.guestId as string | undefined,
      inviteCode: payload.inviteCode as string | undefined,
      guestName: payload.guestName as string | undefined,
      attending: payload.attending as boolean,
      guestCount: payload.guestCount as number,
      message: payload.message as string | undefined
    });

    if (result.success) {
      await recordInviteEvent({
        action: "rsvp_submitted",
        guestId: result.data?.guest_id,
        inviteCode: payload.inviteCode as string | undefined,
        device: detectDeviceType(request.headers.get("user-agent"))
      });
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to submit RSVP."
      },
      { status: 500 }
    );
  }
}
