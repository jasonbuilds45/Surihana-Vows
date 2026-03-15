/**
 * POST /api/admin/story
 * Saves updated story beats to config/wedding.json
 * Protected: admin only
 */

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

interface StoryBeat {
  year:        string;
  title:       string;
  description: string;
  imageUrl:    string;
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/api/admin")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: { story?: StoryBeat[] };
  try {
    body = await request.json() as { story?: StoryBeat[] };
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  const { story } = body;
  if (!Array.isArray(story)) {
    return NextResponse.json({ success: false, message: "story must be an array." }, { status: 400 });
  }

  // Validate each beat
  const cleaned = story.map((beat) => ({
    year:        String(beat.year        ?? "").trim(),
    title:       String(beat.title       ?? "").trim(),
    description: String(beat.description ?? "").trim(),
    imageUrl:    String(beat.imageUrl    ?? "").trim(),
  }));

  try {
    const configPath = path.join(process.cwd(), "config", "wedding.json");
    const raw        = await fs.readFile(configPath, "utf-8");
    const config     = JSON.parse(raw) as Record<string, unknown>;

    config.story = cleaned;

    await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");

    return NextResponse.json({ success: true, message: "Story saved.", count: cleaned.length });
  } catch (err) {
    console.error("[POST /api/admin/story]", err);
    return NextResponse.json(
      { success: false, message: "Failed to write config file. Check server permissions." },
      { status: 500 }
    );
  }
}
