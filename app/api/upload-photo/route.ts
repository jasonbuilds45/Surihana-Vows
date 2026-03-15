import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { uploadFileToBucket } from "@/lib/storage";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

// Rate limit: 10 uploads per IP per 10 minutes.
// Authenticated users (family/admin) bypass the rate limit.
const UPLOAD_RATE_LIMIT = {
  name: "upload-photo",
  maxRequests: 10,
  windowMs: 10 * 60 * 1000
} as const;

function isAcceptedImage(file: File) {
  return file.type.startsWith("image/");
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    // Apply rate limiting only to unauthenticated (guest) uploads.
    if (!session) {
      const limit = checkRateLimit(request, UPLOAD_RATE_LIMIT);

      if (!limit.allowed) {
        return NextResponse.json(
          {
            success: false,
            message: "Too many uploads. Please wait a few minutes before trying again."
          },
          {
            status: 429,
            headers: rateLimitHeaders(limit)
          }
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const uploadedBy = String(formData.get("uploadedBy") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const weddingId = String(formData.get("weddingId") ?? "").trim();

    if (!(file instanceof File) || !uploadedBy || !category || !weddingId) {
      return NextResponse.json(
        {
          success: false,
          message: "File, uploader name, category, and wedding ID are required."
        },
        { status: 400 }
      );
    }

    if (!isAcceptedImage(file)) {
      return NextResponse.json(
        { success: false, message: "Only image uploads are supported." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Images must be 8MB or smaller." },
        { status: 400 }
      );
    }

    if (!session && uploadedBy.length < 2) {
      return NextResponse.json(
        { success: false, message: "Guest uploads must include a valid display name." },
        { status: 400 }
      );
    }

    const upload = await uploadFileToBucket({
      bucket: "guest-uploads",
      file,
      folder: `${weddingId}/${category}`
    });

    const client = getConfiguredSupabaseClient(true);

    if (client) {
      // ── Photo moderation (Phase 3.4) ──────────────────────────────────────
      // Authenticated admins/family upload as pre-approved (is_approved = true).
      // Unauthenticated guest uploads start as pending (is_approved = false)
      // and must be approved via the admin UploadManager before appearing
      // in the public gallery or live feed.
      const isAdminUpload = Boolean(session);

      const { error } = await client.from("photos").insert({
        id: crypto.randomUUID(),
        wedding_id: weddingId,
        image_url: upload.publicUrl,
        uploaded_by: uploadedBy,
        category,
        created_at: new Date().toISOString(),
        is_approved: isAdminUpload
      });

      if (error) {
        if (shouldFallbackToDemoData(error)) {
          return NextResponse.json({
            success: true,
            message: "Photo stored in demo mode.",
            url: upload.publicUrl,
            demoMode: true,
            uploadedBy,
            category
          });
        }

        throw new Error(error.message);
      }
    }

    const isAdminUpload = Boolean(session);
    const baseMessage = upload.demoMode
      ? "Photo stored in demo mode."
      : isAdminUpload
        ? "Photo uploaded and approved."
        : "Photo uploaded successfully. It will appear after admin approval.";

    return NextResponse.json({
      success: true,
      message: baseMessage,
      url: upload.publicUrl,
      demoMode: upload.demoMode,
      pending: !isAdminUpload,
      uploadedBy,
      category
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to upload photo."
      },
      { status: 500 }
    );
  }
}
