// ─────────────────────────────────────────────────────────────────────────────
// app/vault/[token]/page.tsx
//
// Family magic-link landing page.
//
// The couple sends family members a link like:
//   https://surihana.vows/vault/eyJhbGci...
//
// This page receives that token, immediately forwards it to the magic-link
// API endpoint which validates it and issues a session cookie, then redirects
// to /family.
//
// The page itself is never actually *seen* — it's a transparent bridge.
// The loading state is purely for the ~300ms between render and redirect.
//
// If the token is invalid or expired a clear error is shown with a link to
// request a fresh one via /login.
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { weddingConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Family vault access — ${weddingConfig.celebrationTitle}`,
  robots: { index: false, follow: false }
};

interface VaultTokenPageProps {
  params: { token: string };
  searchParams: { redirect?: string };
}

export default function VaultTokenPage({ params, searchParams }: VaultTokenPageProps) {
  const redirectTo = searchParams.redirect ?? "/family";

  // Build the API URL and redirect server-side — the browser never sees the
  // raw token in a client-side fetch; it's passed as a query param to the
  // same-origin API which validates it and sets an httpOnly cookie.
  const apiUrl =
    `/api/auth/magic-link?token=${encodeURIComponent(params.token)}` +
    `&redirect=${encodeURIComponent(redirectTo)}`;

  redirect(apiUrl);
}
