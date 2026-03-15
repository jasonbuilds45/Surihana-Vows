/**
 * POST /api/admin/travel
 * Saves updated travel guide (sections, FAQ, arrivalTips) to config/travel.json
 * Protected: admin only
 */

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookieStore, roleCanAccess } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

interface Section { id: string; title: string; description: string; link: string; }
interface FAQ      { question: string; answer: string; }

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookieStore(cookies());
  if (!session || !roleCanAccess(session.role, "/api/admin")) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: { sections?: Section[]; faq?: FAQ[]; arrivalTips?: string[] };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  const { sections = [], faq = [], arrivalTips = [] } = body;

  if (!Array.isArray(sections) || !Array.isArray(faq) || !Array.isArray(arrivalTips)) {
    return NextResponse.json({ success: false, message: "sections, faq and arrivalTips must be arrays." }, { status: 400 });
  }

  const cleanedSections = sections.map((s) => ({
    title:       String(s.title       ?? "").trim(),
    description: String(s.description ?? "").trim(),
    link:        String(s.link        ?? "").trim(),
    linkLabel:   "Open",
  }));

  const cleanedFaq = faq.map((f) => ({
    question: String(f.question ?? "").trim(),
    answer:   String(f.answer   ?? "").trim(),
  }));

  const cleanedTips = arrivalTips.map((t) => String(t ?? "").trim()).filter(Boolean);

  try {
    const configPath = path.join(process.cwd(), "config", "travel.json");
    const raw        = await fs.readFile(configPath, "utf-8");
    const config     = JSON.parse(raw) as Record<string, unknown>;

    // Preserve essentials — only update the editable parts
    config.sections    = cleanedSections;
    config.faq         = cleanedFaq;
    config.arrivalTips = cleanedTips;

    await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");

    return NextResponse.json({
      success: true,
      message: "Travel guide saved.",
      counts: { sections: cleanedSections.length, faq: cleanedFaq.length, tips: cleanedTips.length },
    });
  } catch (err) {
    console.error("[POST /api/admin/travel]", err);
    return NextResponse.json(
      { success: false, message: "Failed to write config file. Check server permissions." },
      { status: 500 }
    );
  }
}
