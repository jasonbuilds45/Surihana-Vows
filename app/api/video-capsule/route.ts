/**
 * POST /api/video-capsule
 * Seals a video time capsule (YouTube / Vimeo link) for a future reveal date.
 * Writes to the time_capsules table, storing the video URL in the message field
 * as a structured JSON payload so the TimeCapsuleCard can render it.
 */

import { NextRequest, NextResponse } from "next/server";
import { weddingConfig } from "@/lib/config";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

const RATE_LIMIT = { name: "video-capsule-submit", maxRequests: 3, windowMs: 60 * 60 * 1000 } as const;

function isValidUrl(val: unknown): val is string {
  if (typeof val !== "string") return false;
  try {
    const u = new URL(val);
    return u.protocol === "https:" &&
      (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be") || u.hostname.includes("vimeo.com"));
  } catch { return false; }
}

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    // YouTube watch → embed
    if (u.hostname.includes("youtube.com") && u.pathname === "/watch") {
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : url;
    }
    // youtu.be short link
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.replace(/^\//, "");
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch { return url; }
}

function isValidFutureDate(val: unknown): val is string {
  if (typeof val !== "string") return false;
  const d = new Date(val);
  return !isNaN(d.getTime()) && d.getTime() > Date.now() + 60 * 60 * 1000;
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many submissions. Please wait before trying again." },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  const senderName = typeof body.senderName === "string" ? body.senderName.trim() : "";
  const videoUrl   = body.videoUrl;
  const title      = typeof body.title   === "string" ? body.title.trim()   : "";
  const message    = typeof body.message === "string" ? body.message.trim() : "";
  const revealDate = body.revealDate;

  if (senderName.length < 2) {
    return NextResponse.json({ success: false, message: "Please enter your name." }, { status: 400 });
  }
  if (!isValidUrl(videoUrl)) {
    return NextResponse.json({ success: false, message: "Please enter a valid YouTube or Vimeo URL." }, { status: 400 });
  }
  if (title.length < 2) {
    return NextResponse.json({ success: false, message: "Please enter a title for your video capsule." }, { status: 400 });
  }
  if (!isValidFutureDate(revealDate)) {
    return NextResponse.json({ success: false, message: "Reveal date must be a valid future date." }, { status: 400 });
  }

  const embedUrl = toEmbedUrl(videoUrl as string);

  // Store as structured JSON in the message field so TimeCapsuleCard can render it
  const capsulePayload = JSON.stringify({
    type:     "video",
    videoUrl: embedUrl,
    original: videoUrl,
    note:     message,
  });

  const row = {
    id:          crypto.randomUUID(),
    wedding_id:  weddingConfig.id,
    author_name: senderName,
    author_email: null,
    title,
    message:     capsulePayload,
    post_type:   "video" as const,
    unlock_date: new Date(revealDate as string).toISOString(),
    is_revealed: false,
    created_at:  new Date().toISOString(),
  };

  const client = getConfiguredSupabaseClient();
  if (!client) {
    // Demo mode — return success without DB write
    return NextResponse.json({ success: true, message: "Video capsule sealed.", demoMode: true }, { status: 201 });
  }

  const { error } = await client.from("time_capsules").insert(row);
  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: true, message: "Video capsule sealed.", demoMode: true }, { status: 201 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Video capsule sealed. It will unlock on the date you chose." }, { status: 201 });
}
