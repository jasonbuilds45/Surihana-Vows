// ─────────────────────────────────────────────────────────────────────────────
// app/admin/layout.tsx
//
// Dedicated layout for all /admin/* routes.
//
// Provides a minimal admin-branded header. The global SiteShell suppresses
// the root Navbar/Footer here, so this is the only chrome admin users see.
//
// Header contains:
//   Left  — admin wordmark
//   Right — Family Vault · Logout
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { weddingConfig } from "@/lib/config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Admin header */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-stone-950">
        <Container className="flex items-center justify-between py-4">
          <Link href="/admin" className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.46em] text-stone-400">
              Admin dashboard
            </span>
            <span className="font-display text-lg uppercase tracking-[0.3em] text-white">
              {weddingConfig.celebrationTitle}
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/family"
              className="rounded-full border border-white/20 px-4 py-2 text-stone-300 transition hover:border-white/40 hover:text-white"
            >
              Family vault
            </Link>
            <Link
              href="/logout"
              className="rounded-full bg-white/10 px-4 py-2 text-white transition hover:bg-white/20"
            >
              Log out
            </Link>
          </nav>
        </Container>
      </header>

      <main>{children}</main>
    </div>
  );
}
