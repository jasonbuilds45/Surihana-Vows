import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyAuthToken } from "@/lib/auth";
import { DEMO_WEDDING_ID } from "@/lib/demo-data";
import { listGuestLinks } from "@/modules/elegant/guest-links";
import { getRsvpOverview } from "@/modules/elegant/rsvp-system";

export const runtime = "nodejs";

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const token = extractToken(request);
  const session = token ? await verifyAuthToken(token) : null;
  if (!session) {
    return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 403 });
  }

  try {
    const weddingId = request.nextUrl.searchParams.get("weddingId") ?? DEMO_WEDDING_ID;
    const guests = await listGuestLinks(weddingId);
    const rsvps = await getRsvpOverview(guests.map((guest) => guest.id));
    const rsvpByGuestId = new Map(rsvps.map((response) => [response.guest_id, response]));
    const lines = [
      [
        "guest_name",
        "family_name",
        "phone",
        "invite_code",
        "invite_link",
        "invite_opened",
        "attending",
        "guest_count",
        "message",
        "submitted_at"
      ].join(","),
      ...guests.map((guest) => {
        const response = rsvpByGuestId.get(guest.id);
        return [
          escapeCsvValue(guest.guest_name),
          escapeCsvValue(guest.family_name),
          escapeCsvValue(guest.phone),
          escapeCsvValue(guest.invite_code),
          escapeCsvValue(guest.inviteLink),
          escapeCsvValue(guest.invite_opened),
          escapeCsvValue(response?.attending ?? ""),
          escapeCsvValue(response?.guest_count ?? ""),
          escapeCsvValue(response?.message ?? ""),
          escapeCsvValue(response?.submitted_at ?? "")
        ].join(",");
      })
    ];

    return new NextResponse(lines.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="surihana-rsvp-export.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to export RSVP data."
      },
      { status: 500 }
    );
  }
}
