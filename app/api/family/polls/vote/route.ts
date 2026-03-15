// POST /api/family/polls/vote — cast a vote on a family poll

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import { getConfiguredSupabaseClient, shouldFallbackToDemoData } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/family")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: { pollId?: string; answer?: string };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  const { pollId, answer } = body;
  if (!pollId || !answer?.trim()) {
    return NextResponse.json(
      { success: false, message: "pollId and answer are required." },
      { status: 400 }
    );
  }

  const client = getConfiguredSupabaseClient(true);
  if (!client) {
    return NextResponse.json({ success: true, demoMode: true });
  }

  const payload = {
    id: crypto.randomUUID(),
    poll_id: pollId,
    voter_email: session.email,
    answer: answer.trim(),
    created_at: new Date().toISOString()
  };

  const { error } = await client.from("family_poll_votes").insert(payload);

  if (error) {
    // Unique constraint violation = already voted
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, message: "You have already voted on this poll.", alreadyVoted: true },
        { status: 409 }
      );
    }
    if (shouldFallbackToDemoData(error)) {
      return NextResponse.json({ success: true, demoMode: true });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
