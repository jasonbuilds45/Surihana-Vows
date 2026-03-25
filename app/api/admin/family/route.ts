import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedSessionFromRequest } from "@/lib/auth";
import { issueFamilySignupInvite } from "@/lib/family-signup";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

type FamilyRole = "family" | "squad" | "admin";

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeRole(value: unknown): FamilyRole {
  return value === "admin" || value === "squad" ? value : "family";
}

// POST /api/admin/family
//
// Admin-only endpoint for managing invite-only family access.
//
// Actions:
//   invite  - upsert a family_user row and send a private setup link
//   resend  - send a fresh setup link for an existing family_user
//   remove  - delete the family_user row and invalidate pending access links
//
// GET /api/admin/family - list all family_users for the dashboard

export async function GET(request: NextRequest) {
  const session = await getAuthorizedSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 401 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return NextResponse.json({
      success: true,
      data: [
        { id: "demo-family-user", email: process.env.FAMILY_LOGIN_EMAIL ?? "family@demo.com", role: "family" },
        { id: "demo-admin-user", email: process.env.ADMIN_LOGIN_EMAIL ?? "admin@demo.com", role: "admin" },
      ],
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

  if (action === "invite") {
    const email = normalizeEmail(body.email);
    const role = normalizeRole(body.role);

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "A valid email address is required." }, { status: 400 });
    }

    const client = getConfiguredSupabaseClient(true);
    let userId: string;
    let effectiveRole: FamilyRole = role;

    if (client) {
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
        effectiveRole = existing.data.role as FamilyRole;
      } else {
        const insert = await client
          .from("family_users")
          .insert({
            id: crypto.randomUUID(),
            email,
            role,
            password_hash: null,
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (insert.error && !shouldFallbackToDemoData(insert.error)) {
          return NextResponse.json({ success: false, message: insert.error.message }, { status: 500 });
        }

        userId = insert.data?.id ?? `tmp-${Date.now()}`;
      }
    } else {
      userId = `demo-${email}`;
    }

    try {
      await issueFamilySignupInvite(email);
    } catch (error) {
      console.error("[admin/family] Signup invite dispatch failed:", error);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Setup link sent to ${email}.`,
        data: { id: userId, email, role: effectiveRole },
      },
      { status: 201 }
    );
  }

  if (action === "resend") {
    const email = normalizeEmail(body.email);
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
    }

    try {
      await issueFamilySignupInvite(email);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error instanceof Error ? error.message : "Unable to resend setup link." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: `Fresh setup link sent to ${email}.` });
  }

  if (action === "remove") {
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    if (!userId) {
      return NextResponse.json({ success: false, message: "userId is required." }, { status: 400 });
    }

    const client = getConfiguredSupabaseClient(true);
    if (!client) {
      return NextResponse.json({ success: true, message: "Removed (demo mode)." });
    }

    const existingUser = await client
      .from("family_users")
      .select("email")
      .eq("id", userId)
      .maybeSingle();

    if (existingUser.error && !shouldFallbackToDemoData(existingUser.error)) {
      return NextResponse.json({ success: false, message: existingUser.error.message }, { status: 500 });
    }

    await client.from("family_magic_links").delete().eq("family_user_id", userId);

    if (existingUser.data?.email) {
      await client
        .from("invite_access_codes")
        .delete()
        .eq("email", existingUser.data.email.toLowerCase())
        .is("family_user_id", null)
        .is("role", null);
    }

    const { error } = await client.from("family_users").delete().eq("id", userId);

    if (error && !shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Family member removed." });
  }

  return NextResponse.json({ success: false, message: `Unknown action: ${action}` }, { status: 400 });
}
