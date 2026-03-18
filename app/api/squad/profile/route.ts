import { NextRequest, NextResponse } from "next/server";
import { saveSquadProfile, getProposalByCode } from "@/modules/squad/squad-system";
import { uploadFileToBucket } from "@/lib/storage";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import {
  hashPassword,
  createAuthToken,
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/auth";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/squad/profile
//
// Multipart form. Public route — proposal_code is the auth token.
//
// Fields:
//   code            — proposal_code (required)
//   full_name       — required
//   phone           — required
//   email           — required  ← the squad member's own email for vault login
//   password        — required  ← chosen password for vault login
//   dress_size      — optional
//   emergency_name  — optional
//   emergency_phone — optional
//   photo           — optional File (image)
//
// On success:
//   - Saves profile fields to squad_proposals
//   - Creates / updates family_users row with email + hashed password + squad role
//   - Creates a session token, sets the auth cookie
//   - Returns { success: true } — client redirects to /family (already logged in)
// ─────────────────────────────────────────────────────────────────────────────

async function upsertSquadUser(
  email: string,
  password: string
): Promise<{ userId: string; email: string; role: "squad" }> {
  const client = getConfiguredSupabaseClient(true);

  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash    = await hashPassword(password);

  if (!client) {
    // Demo mode — return a fake user shape
    return { userId: "demo-squad-user", email: normalizedEmail, role: "squad" };
  }

  // Check if a family_users row already exists for this email
  const { data: existing } = await client
    .from("family_users")
    .select("id, role")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existing) {
    // Update the password (and keep their existing role — never downgrade admin)
    await client
      .from("family_users")
      .update({ password_hash: passwordHash })
      .eq("id", existing.id);

    return {
      userId: existing.id,
      email:  normalizedEmail,
      role:   (existing.role === "admin" ? "admin" : "squad") as "squad",
    };
  }

  // Create new row
  const newId = crypto.randomUUID();
  const { error } = await client.from("family_users").insert({
    id:            newId,
    email:         normalizedEmail,
    role:          "squad",
    password_hash: passwordHash,
    created_at:    new Date().toISOString(),
  });

  if (error && !shouldFallbackToDemoData(error)) {
    throw new Error(error.message);
  }

  return { userId: newId, email: normalizedEmail, role: "squad" };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const code            = String(formData.get("code")            ?? "").trim();
    const full_name       = String(formData.get("full_name")       ?? "").trim();
    const phone           = String(formData.get("phone")           ?? "").trim();
    const email           = String(formData.get("email")           ?? "").trim();
    const password        = String(formData.get("password")        ?? "").trim();
    const dress_size      = String(formData.get("dress_size")      ?? "").trim() || null;
    const emergency_name  = String(formData.get("emergency_name")  ?? "").trim() || null;
    const emergency_phone = String(formData.get("emergency_phone") ?? "").trim() || null;
    const photoFile       = formData.get("photo");

    // ── Validation ───────────────────────────────────────────────────────────
    if (!code || !full_name || !phone) {
      return NextResponse.json(
        { success: false, message: "Name and phone are required." },
        { status: 400 }
      );
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // ── Validate proposal ────────────────────────────────────────────────────
    const proposal = await getProposalByCode(code);
    if (!proposal) {
      return NextResponse.json({ success: false, message: "Proposal not found." }, { status: 404 });
    }

    // ── Upload photo ─────────────────────────────────────────────────────────
    let photo_url: string | null = null;
    if (photoFile instanceof File && photoFile.size > 0) {
      if (!photoFile.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, message: "Only image files are accepted." },
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
        file:   photoFile,
        folder: `${proposal.wedding_id}/squad-profiles`,
      });
      photo_url = upload.publicUrl;
    }

    // ── Save profile data ────────────────────────────────────────────────────
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

    // ── Create / update vault account with email + password ──────────────────
    const user = await upsertSquadUser(email, password);

    // ── Create session token and set auth cookie ─────────────────────────────
    // This logs them in immediately — they land in the vault already authenticated.
    const token = await createAuthToken({
      userId: user.userId,
      email:  user.email,
      role:   user.role,
    });

    const response = NextResponse.json({ success: true, redirectTo: "/family" });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: false,   // must be false so JS can read for Authorization header fallback
      maxAge:   SESSION_MAX_AGE,
      path:     "/",
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error("[squad/profile] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
