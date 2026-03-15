import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/photos?weddingId=...&approved=false
// Returns photos for the given wedding. Pass approved=false to list pending
// guest uploads, or approved=true to list already-approved photos.
// Requires admin session.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Admin access required." },
      { status: 401 }
    );
  }

  const weddingId = request.nextUrl.searchParams.get("weddingId");
  const approvedParam = request.nextUrl.searchParams.get("approved");

  if (!weddingId) {
    return NextResponse.json(
      { success: false, message: "weddingId is required." },
      { status: 400 }
    );
  }

  const client = getConfiguredSupabaseClient(true);

  if (!client) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    let query = client
      .from("photos")
      .select("id, wedding_id, image_url, uploaded_by, category, created_at, is_approved")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false });

    // Filter by approval status when the param is provided.
    if (approvedParam === "false") {
      query = query.eq("is_approved", false);
    } else if (approvedParam === "true") {
      query = query.eq("is_approved", true);
    }
    // No approvedParam → return all photos

    const { data, error } = await query;

    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return NextResponse.json({ success: true, data: [] });
      }

      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load photos."
      },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/photos
// Body: { photoId: string, isApproved: boolean }
// Approves or rejects a guest-uploaded photo.
// Requires admin session.
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Admin access required." },
      { status: 401 }
    );
  }

  let photoId: string;
  let isApproved: boolean;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    photoId = String(body.photoId ?? "").trim();
    isApproved = Boolean(body.isApproved);

    if (!photoId) {
      return NextResponse.json(
        { success: false, message: "photoId is required." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const client = getConfiguredSupabaseClient(true);

  if (!client) {
    return NextResponse.json({ success: true, demoMode: true });
  }

  try {
    if (isApproved) {
      // Approve: set is_approved = true
      const { error } = await client
        .from("photos")
        .update({ is_approved: true })
        .eq("id", photoId);

      if (error) {
        if (shouldFallbackToDemoData(error)) {
          return NextResponse.json({ success: true, demoMode: true });
        }

        throw new Error(error.message);
      }

      return NextResponse.json({ success: true, message: "Photo approved." });
    } else {
      // Reject: delete the photo row (and the storage object can be cleaned up
      // separately via a scheduled job — Phase 5+).
      const { error } = await client
        .from("photos")
        .delete()
        .eq("id", photoId);

      if (error) {
        if (shouldFallbackToDemoData(error)) {
          return NextResponse.json({ success: true, demoMode: true });
        }

        throw new Error(error.message);
      }

      return NextResponse.json({ success: true, message: "Photo rejected and removed." });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to update photo."
      },
      { status: 500 }
    );
  }
}
