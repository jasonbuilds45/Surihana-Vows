import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getLivestreamBundle } from "@/modules/luxury/livestream";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/live
//
// Returns the live wedding hub bundle for the LiveHubClient component.
//
// Access tiers:
//   family | admin  → full bundle (messages, photos, timeline, analytics,
//                      livestream URL, realtime activity feed)
//   unauthenticated → public-safe bundle (messages, photos, timeline only)
//                     Analytics and the private livestream embed URL are
//                     stripped — guests on /live or /invite/[guest] can still
//                     see the celebration feed without exposing RSVP counts,
//                     device breakdowns, or the embed source URL.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const isAuthenticated = session !== null;

  try {
    const weddingId = request.nextUrl.searchParams.get("weddingId") ?? undefined;
    const data = await getLivestreamBundle(weddingId);

    // Strip private fields for unauthenticated callers
    const payload = isAuthenticated
      ? data
      : {
          ...data,
          // Redact embed URL — guests see the public live page but not the raw
          // livestream source (prevents direct embedding on third-party sites)
          embedUrl: data.embedUrl ? "[authenticated]" : null,
          // Zero-out analytics — RSVP counts, device breakdown, invite opens
          // are internal-only information
          analytics: null,
          recentActivity: []
        };

    return NextResponse.json(
      { success: true, data: payload },
      {
        headers: {
          // Realtime endpoint — never allow caching
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load live hub data."
      },
      { status: 500 }
    );
  }
}
