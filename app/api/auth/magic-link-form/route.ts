import { NextRequest, NextResponse } from "next/server";
import { issueFamilyMagicLink } from "@/lib/magicLink";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email    = String(formData.get("email") ?? "").trim();
    const hint     = String(formData.get("hint")  ?? "");
    const redirectTo = hint === "couple" ? "/admin" : "/family";

    if (email) {
      await issueFamilyMagicLink(email, redirectTo);
    }

    return NextResponse.redirect(
      new URL(`/login?magic=sent&hint=${encodeURIComponent(hint)}`, request.url),
      303
    );
  } catch {
    return NextResponse.redirect(new URL("/login?error=magic-link", request.url), 303);
  }
}
