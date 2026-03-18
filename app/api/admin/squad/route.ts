import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedSessionFromRequest } from "@/lib/auth";
import {
  getAllSquadProposals,
  createSquadProposal,
  deleteSquadProposal,
  type SquadRole,
} from "@/modules/squad/squad-system";

// GET /api/admin/squad — list all proposals
export async function GET(request: NextRequest) {
  const session = await getAuthorizedSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 401 });
  }

  try {
    const proposals = await getAllSquadProposals();
    return NextResponse.json({ success: true, data: proposals });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Error." },
      { status: 500 }
    );
  }
}

// POST /api/admin/squad — create or delete a proposal
export async function POST(request: NextRequest) {
  const session = await getAuthorizedSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = typeof body.action === "string" ? body.action : "create";

  // ── create ────────────────────────────────────────────────────────────────
  if (action === "create") {
    const name         = typeof body.name         === "string" ? body.name.trim()         : "";
    const email        = typeof body.email        === "string" ? body.email.trim()        : "";
    const squad_role   = typeof body.squad_role   === "string" ? body.squad_role          : "";
    const personal_note = typeof body.personal_note === "string" ? body.personal_note.trim() : "";

    if (!name || !squad_role || !personal_note) {
      return NextResponse.json(
        { success: false, message: "name, squad_role and personal_note are required." },
        { status: 400 }
      );
    }

    if (squad_role !== "bridesmaid" && squad_role !== "groomsman") {
      return NextResponse.json(
        { success: false, message: "squad_role must be bridesmaid or groomsman." },
        { status: 400 }
      );
    }

    try {
      const proposal = await createSquadProposal({
        name,
        email: email || null,
        squad_role: squad_role as SquadRole,
        personal_note,
      });
      return NextResponse.json({ success: true, data: proposal }, { status: 201 });
    } catch (err) {
      return NextResponse.json(
        { success: false, message: err instanceof Error ? err.message : "Error." },
        { status: 500 }
      );
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  if (action === "delete") {
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required." }, { status: 400 });
    }

    try {
      await deleteSquadProposal(id);
      return NextResponse.json({ success: true, message: "Proposal deleted." });
    } catch (err) {
      return NextResponse.json(
        { success: false, message: err instanceof Error ? err.message : "Error." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { success: false, message: `Unknown action: ${action}` },
    { status: 400 }
  );
}
