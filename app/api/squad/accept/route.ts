import { NextRequest, NextResponse } from "next/server";
import {
  acceptProposal,
  declineProposal,
  getProposalByCode,
} from "@/modules/squad/squad-system";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { buildVaultUrl } from "@/lib/magicLink";
import { createHash } from "node:crypto";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

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

/**
 * Ensure a squad family_users row exists, then generate a one-use vault
 * token and return the /vault/[token] URL so the proposal page can
 * show a direct "Enter your vault" button — no email required.
 */
async function provisionSquadAccess(email: string): Promise<string | null> {
  const client = getConfiguredSupabaseClient(true);
  if (!client) return null; // demo mode

  const normalizedEmail = email.toLowerCase();

  // 1. Ensure family_users row exists
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
    const { error: insertErr } = await client
      .from("family_users")
      .insert({
        id:            newId,
        email:         normalizedEmail,
        role:          "squad",
        password_hash: null,
        created_at:    new Date().toISOString(),
      });
    if (insertErr && !shouldFallbackToDemoData(insertErr)) {
      throw new Error(insertErr.message);
    }
    userId = newId;
  }

  // 2. Generate a single-use magic link token
  const rawToken  = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const tokenHash = sha256(rawToken);

  const { error: linkErr } = await client
    .from("family_magic_links")
    .insert({
      id:             crypto.randomUUID(),
      family_user_id: userId,
      email:          normalizedEmail,
      token_hash:     tokenHash,
      redirect_to:    "/family",
      expires_at:     new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      created_at:     new Date().toISOString(),
    });

  if (linkErr && !shouldFallbackToDemoData(linkErr)) {
    throw new Error(linkErr.message);
  }

  // 3. Return the /vault/[token] URL — tap it and you're in
  return buildVaultUrl(rawToken, "/family");
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

    // 2. Provision vault access and get a direct login URL
    let vaultUrl:       string | null = null;
    let needsManualGrant              = false;

    try {
      const proposal = await getProposalByCode(code);

      if (proposal?.email) {
        // Creates family_users row (squad role) + magic link token
        // Returns the /vault/[token] URL they can tap immediately
        vaultUrl = await provisionSquadAccess(proposal.email);
      } else {
        needsManualGrant = true;
      }
    } catch (err) {
      console.error("[squad/accept] Vault provisioning failed:", err);
      needsManualGrant = true;
    }

    return NextResponse.json({
      success:          true,
      vaultUrl,           // direct /vault/[token] URL — tap and you're in
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
