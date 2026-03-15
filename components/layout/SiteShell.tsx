"use client";

import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/*
──────────────────────────────────────────────────────────────────────────────
SiteShell — global layout wrapper

Purpose
• Adds Navbar + Footer for public marketing pages
• Suppresses them for special layouts (invite, family, admin)

Design Improvements
• Ensures page fills full viewport height
• Prevents footer jumping
• Creates consistent vertical layout structure
──────────────────────────────────────────────────────────────────────────────
*/

const SHELL_SUPPRESSED_PREFIXES = [
  "/invite/",   // guest cinematic experience
  "/family",    // family vault
  "/admin",     // admin dashboard
  "/vault/",    // magic-link redirect bridge
];

export function SiteShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  const suppress = SHELL_SUPPRESSED_PREFIXES.some((prefix) =>
    pathname === prefix ||
    pathname.startsWith(prefix + "/") ||
    pathname === prefix.replace(/\/$/, "")
  );

  // Pages with their own layout (invite / family / admin)
  if (suppress) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <Navbar />

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}
