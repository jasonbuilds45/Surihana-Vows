import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  // Nuke the cookie with every possible attribute combination to ensure deletion
  response.cookies.set(AUTH_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
