import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { getGuestMessages, submitGuestMessage } from "@/modules/premium/guestbook-system";

// Rate limit: 5 messages per IP per hour.
const GUESTBOOK_RATE_LIMIT = {
  name: "guestbook-post",
  maxRequests: 5,
  windowMs: 60 * 60 * 1000
} as const;

function isValidGuestbookPayload(payload: Record<string, unknown>) {
  return (
    typeof payload.guestName === "string" &&
    payload.guestName.trim().length >= 2 &&
    typeof payload.message === "string" &&
    payload.message.trim().length >= 5
  );
}

export async function GET(request: NextRequest) {
  try {
    const weddingId = request.nextUrl.searchParams.get("weddingId") ?? undefined;
    const data = await getGuestMessages(weddingId);

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          // Guestbook is read frequently by all visitors. A short CDN cache
          // reduces DB load significantly during high-traffic moments (ceremony,
          // live hub). 10s is short enough that new messages appear quickly.
          // stale-while-revalidate serves instantly and refreshes in background.
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load guestbook messages."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limit before processing the body.
  const limit = checkRateLimit(request, GUESTBOOK_RATE_LIMIT);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many messages. Please wait before submitting again."
      },
      {
        status: 429,
        headers: rateLimitHeaders(limit)
      }
    );
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;

    if (!isValidGuestbookPayload(payload)) {
      return NextResponse.json(
        {
          success: false,
          message: "Guest name and message are required."
        },
        { status: 400 }
      );
    }

    const result = await submitGuestMessage({
      guestName: payload.guestName as string,
      message: payload.message as string,
      weddingId: payload.weddingId as string | undefined
    });

    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to add guestbook message."
      },
      { status: 500 }
    );
  }
}
