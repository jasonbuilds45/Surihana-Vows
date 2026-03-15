import { NextRequest, NextResponse } from "next/server";
import { galleryConfig } from "@/lib/config";
import { getConfiguredSupabaseClient } from "@/lib/supabaseClient";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/download-album?weddingId=...
//
// Two-path strategy:
//   1. Config URL (preferred for production): if gallery.json has a non-empty
//      downloadUrl, this endpoint issues a 302 redirect to that link.
//      Use a Google Drive "anyone with link can view" URL, a Dropbox shared
//      link, or any CDN URL pointing to a pre-prepared ZIP.
//
//   2. Supabase signed URL (fallback): if downloadUrl is absent, the route
//      attempts to generate a signed Supabase Storage URL for a pre-uploaded
//      ZIP at guest-uploads/{weddingId}/album.zip. The signed URL expires
//      after 1 hour so it can safely be shared without permanent access.
//
// If neither path is available this returns 404 with a clear message so the
// DownloadAlbumButton can show a "not yet available" state.
//
// No authentication required — the download link itself (Drive share link or
// Supabase signed URL) carries its own access control.
// ─────────────────────────────────────────────────────────────────────────────

const SIGNED_URL_EXPIRES_IN_SECONDS = 3600; // 1 hour

export async function GET(request: NextRequest) {
  const weddingId =
    request.nextUrl.searchParams.get("weddingId")?.trim() ?? "";

  // ── Path 1: configured external URL ────────────────────────────────────────
  const configuredUrl = galleryConfig.downloadUrl?.trim();

  if (configuredUrl) {
    return NextResponse.redirect(configuredUrl, { status: 302 });
  }

  // ── Path 2: Supabase Storage signed URL ────────────────────────────────────
  if (!weddingId) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Album download is not yet available. The couple will share it here after the wedding."
      },
      { status: 404 }
    );
  }

  const client = getConfiguredSupabaseClient(true);

  if (!client) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Album download is not yet available. The couple will share it here after the wedding."
      },
      { status: 404 }
    );
  }

  try {
    // The album ZIP must be manually uploaded to Supabase Storage at this path:
    // Bucket: guest-uploads  |  Path: {weddingId}/album.zip
    const { data, error } = await client.storage
      .from("guest-uploads")
      .createSignedUrl(`${weddingId}/album.zip`, SIGNED_URL_EXPIRES_IN_SECONDS);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Album download is not yet available. The couple will share it here after the wedding."
        },
        { status: 404 }
      );
    }

    // Redirect directly to the short-lived signed URL.
    return NextResponse.redirect(data.signedUrl, { status: 302 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to generate download link. Please try again shortly." },
      { status: 500 }
    );
  }
}
