import { NextRequest, NextResponse } from "next/server";
import { acceptProposal, declineProposal } from "@/modules/squad/squad-system";

// POST /api/squad/accept
// Body: { code: string; response: "accept" | "decline"; note?: string }
// Public route — no auth required (the code IS the auth)
export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;
  const code     = typeof body.code     === "string" ? body.code.trim()     : "";
  const response = typeof body.response === "string" ? body.response        : "";
  const note     = typeof body.note     === "string" ? body.note.trim()     : undefined;

  if (!code) {
    return NextResponse.json({ success: false, message: "code is required." }, { status: 400 });
  }

  if (response === "accept") {
    const result = await acceptProposal(code, note);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  }

  if (response === "decline") {
    const result = await declineProposal(code);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  }

  return NextResponse.json(
    { success: false, message: "response must be accept or decline." },
    { status: 400 }
  );
}
