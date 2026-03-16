import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyAuthToken } from "@/lib/auth";
import { DEMO_WEDDING_ID } from "@/lib/demo-data";
import { deleteGuestRecord, updateGuestRecord } from "@/modules/elegant/guest-links";

export const runtime = "nodejs";

interface GuestRouteProps {
  params: { id: string };
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

async function getAdminSession(request: NextRequest) {
  const token = extractToken(request); // reads cookie OR Authorization: Bearer header
  if (!token) return null;
  const session = await verifyAuthToken(token);
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function PATCH(request: NextRequest, { params }: GuestRouteProps) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const guestName = normalizeOptionalString(payload.guestName)?.trim() ?? "";

    if (guestName.length < 2) {
      return NextResponse.json({ success: false, message: "Guest name must be at least 2 characters long." }, { status: 400 });
    }

    const rawRole = normalizeOptionalString(payload.guestRole);
    const validRoles = ["family", "friends", "bride_side", "groom_side", "vip"] as const;
    type GuestRole = typeof validRoles[number];
    const guestRole = payload.guestRole === undefined
      ? undefined
      : validRoles.includes(rawRole as GuestRole) ? (rawRole as GuestRole) : null;

    const data = await updateGuestRecord(params.id, {
      weddingId: normalizeOptionalString(payload.weddingId) ?? DEMO_WEDDING_ID,
      guestName,
      familyName: normalizeOptionalString(payload.familyName),
      phone: normalizeOptionalString(payload.phone),
      regenerateInviteCode: Boolean(payload.regenerateInviteCode),
      guestRole,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update guest.";
    return NextResponse.json({ success: false, message }, { status: message === "Guest not found." ? 404 : 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: GuestRouteProps) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }

    const data = await deleteGuestRecord(params.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete guest.";
    return NextResponse.json({ success: false, message }, { status: message === "Guest not found." ? 404 : 500 });
  }
}
