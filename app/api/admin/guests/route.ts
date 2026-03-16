import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedSessionFromRequest } from "@/lib/auth";
import { createGuestRecord, listGuestLinks } from "@/modules/elegant/guest-links";
import { DEMO_WEDDING_ID } from "@/lib/demo-data";

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthorizedSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required." }, { status: 403 });
    }

    const weddingId = request.nextUrl.searchParams.get("weddingId") ?? DEMO_WEDDING_ID;
    const data = await listGuestLinks(weddingId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load guests."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthorizedSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const weddingId = normalizeOptionalString(payload.weddingId) ?? DEMO_WEDDING_ID;
    const guestName = normalizeOptionalString(payload.guestName)?.trim() ?? "";

    if (guestName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Guest name must be at least 2 characters long."
        },
        { status: 400 }
      );
    }

    const rawRole = normalizeOptionalString(payload.guestRole);
    const validRoles = ["family", "friends", "bride_side", "groom_side", "vip"] as const;
    type GuestRole = typeof validRoles[number];
    const guestRole = validRoles.includes(rawRole as GuestRole) ? (rawRole as GuestRole) : null;

    const data = await createGuestRecord({
      weddingId,
      guestName,
      familyName: normalizeOptionalString(payload.familyName),
      phone: normalizeOptionalString(payload.phone),
      guestRole
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to create guest."
      },
      { status: 500 }
    );
  }
}
