// POST /api/guestbook/upload
// Uploads guest message media (photo/video/audio) to Supabase Storage bucket "guest-messages".
// Returns the public URL. Non-blocking — guest message can still be submitted if upload fails.

import { NextRequest, NextResponse } from "next/server";
import { getConfiguredSupabaseClient } from "@/lib/supabaseClient";
import { checkRateLimit } from "@/lib/rateLimit";

const RATE_LIMIT = { name: "guestbook-upload", maxRequests: 5, windowMs: 60 * 60 * 1000 } as const;
const MAX_SIZE   = 50 * 1024 * 1024; // 50 MB
const BUCKET     = "guest-messages";

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp",
  "video/mp4", "video/quicktime",
  "audio/mpeg", "audio/mp4", "audio/x-m4a",
]);

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, message: "Too many uploads. Please wait before trying again." }, { status: 429 });
  }

  try {
    const formData  = await request.formData();
    const file      = formData.get("file") as File | null;
    const weddingId = formData.get("weddingId") as string | null;

    if (!file) return NextResponse.json({ success: false, message: "No file provided." }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ success: false, message: "Unsupported file type." }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ success: false, message: "File exceeds 50 MB limit." }, { status: 400 });

    const client = getConfiguredSupabaseClient(true);
    if (!client) {
      // Demo mode — return a placeholder URL
      return NextResponse.json({ success: true, url: "", demoMode: true });
    }

    const ext      = file.name.split(".").pop() ?? "bin";
    const path     = `${weddingId ?? "shared"}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const buffer   = await file.arrayBuffer();

    const { error: uploadError } = await client.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("[guestbook/upload]", uploadError.message);
      return NextResponse.json({ success: false, message: "Upload failed. Your message can still be submitted without media." }, { status: 500 });
    }

    const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ success: true, url: urlData.publicUrl });

  } catch (err) {
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : "Upload failed." }, { status: 500 });
  }
}
