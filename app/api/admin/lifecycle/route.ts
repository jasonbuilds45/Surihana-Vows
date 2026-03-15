import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

type Stage = "invitation" | "live" | "vault";

function isValidStage(value: unknown): value is Stage {
  return value === "invitation" || value === "live" || value === "vault";
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/api/admin")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: { weddingId?: string; stage?: Stage | null };
  try {
    body = await request.json() as { weddingId?: string; stage?: Stage | null };
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  const { weddingId, stage } = body;
  if (!weddingId) {
    return NextResponse.json({ success: false, message: "weddingId is required." }, { status: 400 });
  }

  if (stage !== null && stage !== undefined && !isValidStage(stage)) {
    return NextResponse.json(
      { success: false, message: "stage must be 'invitation', 'live', 'vault', or null." },
      { status: 400 }
    );
  }

  const client = getConfiguredSupabaseClient(true);

  // Demo mode — no Supabase
  if (!client) {
    return NextResponse.json({
      success: true,
      stage: stage ?? null,
      message: "Stage override saved (demo mode — no DB write).",
      demoMode: true
    });
  }

  if (stage === null || stage === undefined) {
    // Delete the override so automatic schedule resumes
    const { error } = await client
      .from("wedding_stage_overrides")
      .delete()
      .eq("wedding_id", weddingId);

    if (error && !shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, stage: null });
  }

  // Upsert the override
  const { error } = await client
    .from("wedding_stage_overrides")
    .upsert(
      {
        wedding_id: weddingId,
        stage,
        private_mode: stage === "vault",
        updated_at: new Date().toISOString()
      },
      { onConflict: "wedding_id" }
    );

  if (error && !shouldFallbackToDemoData(error)) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, stage });
}
