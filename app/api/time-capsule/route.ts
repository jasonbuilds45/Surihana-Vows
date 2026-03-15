import { NextRequest, NextResponse } from "next/server";
import { weddingConfig } from "@/lib/config";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { submitTimeCapsule } from "@/modules/luxury/time-capsule";
import type { TimeCapsulePostType } from "@/lib/types";

// Rate limit: 3 capsules per IP per hour — generous but prevents spam.
const CAPSULE_RATE_LIMIT = {
  name: "time-capsule-submit",
  maxRequests: 3,
  windowMs: 60 * 60 * 1000
} as const;

const VALID_POST_TYPES: TimeCapsulePostType[] = ["anniversary", "life_event", "timed", "video"];

function isValidUnlockDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  if (isNaN(date.getTime())) return false;
  // Must be in the future (at least 1 hour from now)
  return date.getTime() > Date.now() + 60 * 60 * 1000;
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, CAPSULE_RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many capsules. Please wait before submitting again." },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const authorName = typeof body.authorName === "string" ? body.authorName.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const postType = body.postType as TimeCapsulePostType;
    const unlockDate = body.unlockDate;
    const authorEmail =
      typeof body.authorEmail === "string" && body.authorEmail.trim()
        ? body.authorEmail.trim()
        : null;

    if (authorName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Author name must be at least 2 characters." },
        { status: 400 }
      );
    }
    if (message.length < 10) {
      return NextResponse.json(
        { success: false, message: "Message must be at least 10 characters." },
        { status: 400 }
      );
    }
    if (!VALID_POST_TYPES.includes(postType)) {
      return NextResponse.json(
        { success: false, message: "Invalid post type." },
        { status: 400 }
      );
    }
    if (!isValidUnlockDate(unlockDate)) {
      return NextResponse.json(
        { success: false, message: "Unlock date must be a valid future date." },
        { status: 400 }
      );
    }

    const result = await submitTimeCapsule({
      weddingId: weddingConfig.id,
      authorName,
      authorEmail,
      message,
      postType,
      unlockDate: new Date(unlockDate as string).toISOString()
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to save time capsule."
      },
      { status: 500 }
    );
  }
}
