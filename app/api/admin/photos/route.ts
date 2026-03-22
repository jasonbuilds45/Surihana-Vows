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
// DELETE /api/admin/photos?photoId=...
// Permanently deletes any photo (approved or pending) by ID.
// Requires admin session.
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 401 });
  }

  const photoId = request.nextUrl.searchParams.get("photoId");
  if (!photoId) {
    return NextResponse.json({ success: false, message: "photoId is required." }, { status: 400 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, demoMode: true });

  try {
    const { error } = await client.from("photos").delete().eq("id", photoId);
    if (error) {
      if (shouldFallbackToDemoData(error)) return NextResponse.json({ success: true, demoMode: true });
      throw new Error(error.message);
    }
    return NextResponse.json({ success: true, message: "Photo deleted." });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Delete failed." },
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

  let category: string | undefined;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    photoId   = String(body.photoId ?? "").trim();
    isApproved = Boolean(body.isApproved);
    category  = body.category ? String(body.category) : undefined;

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
    // Build the update payload — always set is_approved, optionally update category
    const updatePayload: Record<string, unknown> = { is_approved: isApproved };
    if (category) updatePayload.category = category;

    const { error } = await client
      .from("photos")
      .update(updatePayload)
      .eq("id", photoId);

    if (error) {
      if (shouldFallbackToDemoData(error)) {
        return NextResponse.json({ success: true, demoMode: true });
      }
      throw new Error(error.message);
    }

    const msg = isApproved ? "Photo approved." : "Photo moved back to pending.";
    return NextResponse.json({ success: true, message: msg });

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
