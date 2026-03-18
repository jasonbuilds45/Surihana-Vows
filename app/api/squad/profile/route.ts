import { NextRequest, NextResponse } from "next/server";
import { saveSquadProfile } from "@/modules/squad/squad-system";
import { getProposalByCode } from "@/modules/squad/squad-system";
import { uploadFileToBucket } from "@/lib/storage";
import { buildVaultUrl } from "@/lib/magicLink";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { createHash } from "node:crypto";

function sha256(v: string) {
  return createHash("sha256").update(v).digest("hex");
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/squad/profile
//
// Multipart form. Public route — code is the auth token.
//
// Fields:
//   code            — proposal_code (required)
//   full_name       — required
//   phone           — required
//   dress_size      — optional
//   dietary         — optional
//   emergency_name  — optional
//   emergency_phone — optional
//   photo           — optional File (image)
//
// Returns: { success, vaultUrl } on success
// ─────────────────────────────────────────────────────────────────────────────

async function provisionVaultAndGetUrl(email: string): Promise<string | null> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return null;

  const normalizedEmail = email.toLowerCase();

  // Find or create the family_users row
  const { data: existing } = await client
    .from("family_users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  let userId: string;

  if (existing) {
    userId = existing.id;
  } else {
    const newId = crypto.randomUUID();
    const { error } = await client.from("family_users").insert({
      id:            newId,
      email:         normalizedEmail,
      role:          "squad",
      password_hash: null,
      created_at:    new Date().toISOString(),
    });
    if (error && !shouldFallbackToDemoData(error)) throw new Error(error.message);
    userId = newId;
  }

  // Generate a 30-day vault token
  const rawToken  = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const tokenHash = sha256(rawToken);

  const { error: linkErr } = await client.from("family_magic_links").insert({
    id:             crypto.randomUUID(),
    family_user_id: userId,
    email:          normalizedEmail,
    token_hash:     tokenHash,
    redirect_to:    "/family",
    expires_at:     new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at:     new Date().toISOString(),
  });

  if (linkErr && !shouldFallbackToDemoData(linkErr)) throw new Error(linkErr.message);

  return buildVaultUrl(rawToken, "/family");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const code          = String(formData.get("code")          ?? "").trim();
    const full_name     = String(formData.get("full_name")     ?? "").trim();
    const phone         = String(formData.get("phone")         ?? "").trim();
    const dress_size      = String(formData.get("dress_size")    ?? "").trim() || null;
    const emergency_name  = String(formData.get("emergency_name")  ?? "").trim() || null;
    const emergency_phone = String(formData.get("emergency_phone") ?? "").trim() || null;
    const photoFile     = formData.get("photo");

    if (!code || !full_name || !phone) {
      return NextResponse.json(
        { success: false, message: "code, full_name and phone are required." },
        { status: 400 }
      );
    }

    // Validate proposal exists and is accepted
    const proposal = await getProposalByCode(code);
    if (!proposal) {
      return NextResponse.json(
        { success: false, message: "Proposal not found." },
        { status: 404 }
      );
    }
    if (!proposal.accepted) {
      return NextResponse.json(
        { success: false, message: "Proposal has not been accepted yet." },
        { status: 403 }
      );
    }

    // Upload photo if provided
    let photo_url: string | null = null;
    if (photoFile instanceof File && photoFile.size > 0) {
      if (!photoFile.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, message: "Only image files are accepted for the photo." },
          { status: 400 }
        );
      }
      if (photoFile.size > 8 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: "Photo must be 8MB or smaller." },
          { status: 400 }
        );
      }
      const upload = await uploadFileToBucket({
        bucket: "guest-uploads",
        file: photoFile,
        folder: `${proposal.wedding_id}/squad-profiles`,
      });
      photo_url = upload.publicUrl;
    }

    // Save profile to DB
    const saveResult = await saveSquadProfile(code, {
      full_name,
      phone,
      photo_url,
      dress_size,
      emergency_name,
      emergency_phone,
    });

    if (!saveResult.success) {
      return NextResponse.json(saveResult, { status: 500 });
    }

    // Provision vault access and get direct login URL
    let vaultUrl: string | null = null;
    if (proposal.email) {
      vaultUrl = await provisionVaultAndGetUrl(proposal.email);
    }

    return NextResponse.json({ success: true, vaultUrl });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Error." },
      { status: 500 }
    );
  }
}
