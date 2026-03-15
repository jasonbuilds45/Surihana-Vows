import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getAnalyticsSnapshot, getRecentInviteActivity } from "@/modules/premium/analytics";

export async function GET(request: NextRequest) {
  // Analytics contains sensitive guest data (open rates, device breakdown,
  // attendance counts, recent activity). Require a valid family or admin session.
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const weddingId = request.nextUrl.searchParams.get("weddingId") ?? undefined;
    const [stats, recentActivity] = await Promise.all([
      getAnalyticsSnapshot(weddingId),
      getRecentInviteActivity(weddingId)
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          stats,
          recentActivity
        }
      },
      {
        headers: {
          // Analytics dashboards can tolerate slightly stale data.
          // A 30s CDN cache prevents hammering the DB on every admin refresh,
          // while stale-while-revalidate serves the cached copy instantly and
          // refreshes in the background within the next 60s.
          "Cache-Control": "private, s-maxage=30, stale-while-revalidate=60"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load analytics."
      },
      { status: 500 }
    );
  }
}
