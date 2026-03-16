import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyAuthToken } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import { predictionsConfig } from "@/lib/config";
import { DEMO_WEDDING_ID } from "@/lib/demo-data";

export const runtime = "nodejs";

async function adminSession(req: NextRequest) {
  const token = extractToken(req);
  if (!token) return null;
  const s = await verifyAuthToken(token);
  return s?.role === "admin" ? s : null;
}

// GET /api/admin/predictions?weddingId=
export async function GET(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const weddingId = request.nextUrl.searchParams.get("weddingId") ?? DEMO_WEDDING_ID;
  const client = getConfiguredSupabaseClient(true);

  // If no DB, return questions from config file
  if (!client) {
    const questions = predictionsConfig.questions.map((q, i) => ({
      id: q.id, question: q.question, emoji: q.emoji, options: q.options,
      is_active: true, reveal_results: new Date() > new Date(predictionsConfig.revealAfter),
      sort_order: i, vote_counts: {}, total_votes: 0,
    }));
    return NextResponse.json({ success: true, data: questions, demoMode: true });
  }

  // Get questions
  const { data: questions, error } = await client
    .from("prediction_questions" as never)
    .select("*")
    .eq("wedding_id", weddingId)
    .order("sort_order");

  if (error) {
    if (shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: true, data: predictionsConfig.questions.map((q, i) => ({ id: q.id, question: q.question, emoji: q.emoji, options: q.options, is_active: true, reveal_results: false, sort_order: i, vote_counts: {}, total_votes: 0 })), demoMode: true });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  // Get vote counts from guest_predictions
  const { data: votes } = await client
    .from("guest_predictions")
    .select("question_id, answer")
    .eq("wedding_id", weddingId);

  const voteCounts: Record<string, Record<string, number>> = {};
  for (const vote of votes ?? []) {
    voteCounts[vote.question_id] ??= {};
    voteCounts[vote.question_id][vote.answer] = (voteCounts[vote.question_id][vote.answer] ?? 0) + 1;
  }

  const enriched = (questions as never[]).map((q: Record<string, unknown>) => ({
    ...q,
    vote_counts: voteCounts[q.id as string] ?? {},
    total_votes: Object.values(voteCounts[q.id as string] ?? {}).reduce((a: number, b) => a + (b as number), 0),
  }));

  return NextResponse.json({ success: true, data: enriched });
}

// POST /api/admin/predictions — create new question
export async function POST(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const body = await request.json() as { weddingId?: string; question?: string; emoji?: string; options?: unknown[] };
  const { weddingId = DEMO_WEDDING_ID, question, emoji = "🎯", options = [] } = body;
  if (!question?.trim() || (options as unknown[]).length < 2) {
    return NextResponse.json({ success: false, message: "question and at least 2 options required." }, { status: 400 });
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) return NextResponse.json({ success: true, data: { id: crypto.randomUUID(), question, emoji, options, is_active: true, reveal_results: false, sort_order: 0, vote_counts: {}, total_votes: 0 }, demoMode: true });

  const payload = {
    id: crypto.randomUUID(), wedding_id: weddingId,
    question: question.trim(), emoji: emoji.trim() || "🎯",
    options, is_active: true, reveal_results: false,
    sort_order: 0, created_at: new Date().toISOString(),
  };

  const { data, error } = await client.from("prediction_questions" as never).insert(payload as never).select("*").maybeSingle();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}
