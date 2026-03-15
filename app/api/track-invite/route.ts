import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { detectDeviceType, trackInviteAction } from "@/lib/inviteTracker";

const VALID_ACTIONS = ["invite_opened", "rsvp_submitted", "page_view"] as const;

// Rate limit: 30 tracking events per IP per minute.
// This is generous enough for legitimate guest usage but blocks automated abuse.
const TRACK_RATE_LIMIT = {
  name: "track-invite",
  maxRequests: 30,
  windowMs: 60 * 1000
} as const;

export async function POST(request: NextRequest) {
  // Apply rate limit before processing the body.
  const limit = checkRateLimit(request, TRACK_RATE_LIMIT);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many tracking requests."
      },
      {
        status: 429,
        headers: rateLimitHeaders(limit)
      }
    );
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const action = String(payload.action ?? "");
    const inviteCode = payload.inviteCode ? String(payload.inviteCode) : undefined;
    const guestId = payload.guestId ? String(payload.guestId) : undefined;

    if (!VALID_ACTIONS.includes(action as (typeof VALID_ACTIONS)[number]) || (!inviteCode && !guestId)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid action and guest reference are required."
        },
        { status: 400 }
      );
    }

    const result = await trackInviteAction({
      action,
      inviteCode,
      guestId,
      device: detectDeviceType(request.headers.get("user-agent"))
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 404
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to track invite event."
      },
      { status: 500 }
    );
  }
}
