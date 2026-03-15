import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { weddingConfig, predictionsConfig } from "@/lib/config";
import { checkRateLimit, rateLimitHeaders, getClientIp } from "@/lib/rateLimit";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";
import type { GuestPredictionRow, PredictionResult } from "@/lib/types";

// Rate limit: 10 votes per IP per hour (5 questions × 1 vote each, with headroom)
const VOTE_RATE_LIMIT = {
  name: "predictions-vote",
  maxRequests: 10,
  windowMs: 60 * 60 * 1000
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/predictions — Returns vote tallies.
// Results are hidden (empty tallies) until predictionsConfig.revealAfter.
// This prevents guests from seeing live vote counts and gaming the reveal.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!predictionsConfig.enabled) {
    return NextResponse.json({ success: true, data: [], revealed: false });
  }

  const now = new Date();
  const revealAfter = new Date(predictionsConfig.revealAfter);
  const isRevealed = now >= revealAfter;

  const client = getConfiguredSupabaseClient();
  let rows: GuestPredictionRow[] = [];

  if (client) {
    const { data, error } = await client
      .from("guest_predictions")
      .select("question_id, answer")
      .eq("wedding_id", weddingConfig.id);

    if (error && !shouldFallbackToDemoData(error)) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    rows = (data as GuestPredictionRow[] | null) ?? [];
  }

  const results: PredictionResult[] = predictionsConfig.questions.map((q) => {
    const questionVotes = rows.filter((r) => r.question_id === q.id);
    const totalVotes = questionVotes.length;

    const optionCounts = new Map<string, number>();
    for (const opt of q.options) optionCounts.set(opt.value, 0);
    for (const row of questionVotes) {
      optionCounts.set(row.answer, (optionCounts.get(row.answer) ?? 0) + 1);
    }

    const maxVotes = Math.max(...Array.from(optionCounts.values()), 0);

    return {
      questionId: q.id,
      question: q.question,
      emoji: q.emoji,
      totalVotes,
      options: q.options.map((opt) => {
        const votes = isRevealed ? (optionCounts.get(opt.value) ?? 0) : 0;
        const percentage = isRevealed && totalVotes > 0
          ? Math.round((votes / totalVotes) * 100)
          : 0;
        return {
          value: opt.value,
          label: opt.label,
          votes,
          percentage,
          isLeading: isRevealed && votes === maxVotes && votes > 0
        };
      })
    };
  });

  return NextResponse.json(
    { success: true, data: results, revealed: isRevealed, revealAfter: predictionsConfig.revealAfter },
    {
      headers: {
        // Short cache: results change with votes but don't need real-time precision
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60"
      }
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/predictions — Submit a vote.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  if (!predictionsConfig.enabled) {
    return NextResponse.json(
      { success: false, message: "Predictions are not enabled for this wedding." },
      { status: 403 }
    );
  }

  const limit = checkRateLimit(request, VOTE_RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many votes. Please wait before trying again." },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const questionId = typeof body.questionId === "string" ? body.questionId.trim() : "";
    const answer = typeof body.answer === "string" ? body.answer.trim() : "";
    const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "Guest";

    const question = predictionsConfig.questions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { success: false, message: "Invalid question." },
        { status: 400 }
      );
    }

    const validAnswer = question.options.find((o) => o.value === answer);
    if (!validAnswer) {
      return NextResponse.json(
        { success: false, message: "Invalid answer option." },
        { status: 400 }
      );
    }

    // Build a stable guest identifier from name + IP (SHA-256, first 16 chars).
    // This prevents duplicate votes per question while keeping guests anonymous.
    const ip = getClientIp(request);
    const guestIdentifier = createHash("sha256")
      .update(`${guestName.toLowerCase()}:${ip}:${weddingConfig.id}`)
      .digest("hex")
      .slice(0, 16);

    const payload: GuestPredictionRow = {
      id: crypto.randomUUID(),
      wedding_id: weddingConfig.id,
      question_id: questionId,
      answer,
      guest_name: guestName.length >= 2 ? guestName : "Guest",
      guest_identifier: guestIdentifier,
      created_at: new Date().toISOString()
    };

    const client = getConfiguredSupabaseClient(true);
    if (!client) {
      return NextResponse.json({ success: true, message: "Vote recorded in demo mode.", demoMode: true });
    }

    const { error } = await client.from("guest_predictions").insert(payload);

    if (error) {
      // Unique constraint violation = already voted on this question
      if (error.code === "23505") {
        return NextResponse.json(
          { success: false, message: "You have already voted on this question." },
          { status: 409 }
        );
      }
      if (shouldFallbackToDemoData(error)) {
        return NextResponse.json({ success: true, message: "Vote recorded in demo mode.", demoMode: true });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, message: "Vote cast!" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to save vote." },
      { status: 500 }
    );
  }
}
