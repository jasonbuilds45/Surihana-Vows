import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedSessionFromRequest } from "@/lib/auth";
import { issueFamilyMagicLink } from "@/lib/magicLink";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { DEMO_WEDDING_ID } from "@/lib/demo-data";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/family
//
// Admin-only endpoint for managing family vault access.
//
// Actions:
//   invite  — upsert a family_user row + dispatch a /vault/[token] magic link
//   resend  — dispatch a fresh magic link to an existing family_user
//   remove  — delete the family_user row (revokes all future magic links)
//
// GET /api/admin/family — list all family_users for the dashboard
// ─────────────────────────────────────────────────────────────────────────────

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function GET(request: NextRequest) {
  const session = await getAuthorizedSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 401 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    // Demo mode — return the two hardcoded demo accounts
    return NextResponse.json({
      success: true,
      data: [
        { id: "demo-family-user", email: process.env.FAMILY_LOGIN_EMAIL ?? "family@demo.com", role: "family" },
        { id: "demo-admin-user",  email: process.env.ADMIN_LOGIN_EMAIL  ?? "admin@demo.com",  role: "admin"  }
      ]
    });
  }

  const { data, error } = await client
    .from("family_users")
    .select("id, email, role")
    .order("created_at", { ascending: true });

  if (error && !shouldFallbackToDemoData(error)) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await getAuthorizedSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = typeof body.action === "string" ? body.action : "";

  // ── invite ────────────────────────────────────────────────────────────────
  if (action === "invite") {
    const email = normalizeEmail(body.email);
    const role  = body.role === "admin" ? "admin" : "family";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "A valid email address is required." }, { status: 400 });
    }

    const client = getConfiguredSupabaseClient(true);
    let userId: string;

    if (client) {
      // Upsert the family_user row (idempotent — re-inviting an existing member
      // just sends a fresh link without duplicating the row)
      const existing = await client
        .from("family_users")
        .select("id, email, role")
        .eq("email", email)
        .maybeSingle();

      if (existing.error && !shouldFallbackToDemoData(existing.error)) {
        return NextResponse.json({ success: false, message: existing.error.message }, { status: 500 });
      }

      if (existing.data) {
        userId = existing.data.id;
      } else {
        const insert = await client.from("family_users").insert({
          id: crypto.randomUUID(),
          email,
          role,
          // password_hash intentionally null — this user authenticates via magic link only
          password_hash: null,
          created_at: new Date().toISOString()
        }).select("id").single();

        if (insert.error && !shouldFallbackToDemoData(insert.error)) {
          return NextResponse.json({ success: false, message: insert.error.message }, { status: 500 });
        }

        userId = insert.data?.id ?? `tmp-${Date.now()}`;
      }
    } else {
      // Demo mode — still dispatch the magic link (goes to emailSender console log)
      userId = `demo-${email}`;
    }

    // Dispatch the /vault/[token] magic link email
    try {
      await issueFamilyMagicLink(email, "/family");
    } catch (err) {
      // Magic link dispatch failure is non-fatal — the user still exists
      console.error("[admin/family] Magic link dispatch failed:", err);
    }

    return NextResponse.json(
      { success: true, message: `Vault access link sent to ${email}.`, data: { id: userId, email, role } },
      { status: 201 }
    );
  }

  // ── resend ────────────────────────────────────────────────────────────────
  if (action === "resend") {
    const email = normalizeEmail(body.email);
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
    }

    try {
      await issueFamilyMagicLink(email, "/family");
    } catch (err) {
      return NextResponse.json(
        { success: false, message: err instanceof Error ? err.message : "Unable to resend link." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: `Fresh vault link sent to ${email}.` });
  }

  // ── remove ────────────────────────────────────────────────────────────────
  if (action === "remove") {
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    if (!userId) {
      return NextResponse.json({ success: false, message: "userId is required." }, { status: 400 });
    }

    const client = getConfiguredSupabaseClient(true);
    if (!client) {
      return NextResponse.json({ success: true, message: "Removed (demo mode)." });
    }

    // Also invalidate any outstanding magic links for this user
    await client.from("family_magic_links").delete().eq("family_user_id", userId);

    const { error } = await client.from("family_users").delete().eq("id", userId);

    if (error && !shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Family member removed." });
  }

  return NextResponse.json({ success: false, message: `Unknown action: ${action}` }, { status: 400 });
}
