import { NextRequest, NextResponse } from "next/server";
import {
  acceptProposal,
  declineProposal,
  getProposalByCode,
} from "@/modules/squad/squad-system";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { issueFamilyMagicLink } from "@/lib/magicLink";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/squad/accept
//
// Public route — no session auth required.
// The proposal_code itself is the authentication token.
//
// Body:
//   { code: string; response: "accept" | "decline"; note?: string }
//
// On accept:
//   1. Mark proposal accepted in DB
//   2. If proposal has an email → upsert family_users row + send vault magic link
//   3. Return { success, vaultSent: boolean, needsManualGrant: boolean }
//
// On decline:
//   1. Mark proposal declined in DB
// ─────────────────────────────────────────────────────────────────────────────

async function ensureFamilyUser(email: string): Promise<void> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return; // demo mode — skip

  // Check if a family_users row already exists for this email
  const { data: existing, error: lookupErr } = await client
    .from("family_users")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (lookupErr && !shouldFallbackToDemoData(lookupErr)) {
    throw new Error(lookupErr.message);
  }

  // If not already a member, create the row with squad role
  if (!existing) {
    const { error: insertErr } = await client
      .from("family_users")
      .insert({
        id:            crypto.randomUUID(),
        email:         email.toLowerCase(),
        role:          "squad",        // squad > family — gets full vault + squad hub
        password_hash: null,           // magic-link only — no password
        created_at:    new Date().toISOString(),
      });

    if (insertErr && !shouldFallbackToDemoData(insertErr)) {
      throw new Error(insertErr.message);
    }
  }
  // If they already exist, their existing role is kept (could be "admin")
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;
  const code     = typeof body.code     === "string" ? body.code.trim()  : "";
  const response = typeof body.response === "string" ? body.response     : "";
  const note     = typeof body.note     === "string" ? body.note.trim()  : undefined;

  if (!code) {
    return NextResponse.json(
      { success: false, message: "code is required." },
      { status: 400 }
    );
  }

  // ── accept ─────────────────────────────────────────────────────────────────
  if (response === "accept") {
    // 1. Mark accepted
    const result = await acceptProposal(code, note);
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    // 2. Fetch the full proposal to get the email
    let vaultSent      = false;
    let needsManualGrant = false;

    try {
      const proposal = await getProposalByCode(code);

      if (proposal?.email) {
        // 3a. Ensure a family_users row exists for this person
        await ensureFamilyUser(proposal.email);

        // 3b. Send them a vault magic link — same mechanism as FamilyInviteManager
        await issueFamilyMagicLink(proposal.email, "/family");

        vaultSent = true;
      } else {
        // No email stored — couple must grant access manually
        needsManualGrant = true;
      }
    } catch (err) {
      // Vault access failure is non-fatal — acceptance itself already recorded.
      // The admin panel will show needsManualGrant = true as a fallback.
      console.error("[squad/accept] Vault provisioning failed:", err);
      needsManualGrant = true;
    }

    return NextResponse.json({
      success:          true,
      message:          vaultSent
        ? "Accepted. Vault access link sent."
        : "Accepted. Grant vault access manually in the admin panel.",
      vaultSent,
      needsManualGrant,
    });
  }

  // ── decline ────────────────────────────────────────────────────────────────
  if (response === "decline") {
    const result = await declineProposal(code);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  }

  // ── opened (fire-and-forget tracking call from the client) ─────────────────
  // The client fires this when the seal is pressed — not a real action, just
  // tracked via markProposalOpened. We return 200 silently.
  if (response === "opened") {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, message: "response must be accept, decline, or opened." },
    { status: 400 }
  );
}
