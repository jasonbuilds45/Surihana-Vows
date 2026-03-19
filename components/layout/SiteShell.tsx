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
  "/",          // landing page — full screen, no chrome
  "/invite/",   // guest cinematic experience
  "/family",    // family vault
  "/admin",     // admin dashboard
  "/vault/",    // magic-link redirect bridge
  "/login",     // login page — no chrome
  "/squad/",    // squad proposal — private, unbranded
];

export function SiteShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  // Suppress if the current path matches any suppressed prefix.
  // Prefixes ending in "/" are treated as directory prefixes.
  // Prefixes without trailing "/" match the exact path or any sub-path.
  const suppress = SHELL_SUPPRESSED_PREFIXES.some((prefix) => {
    if (prefix.endsWith("/")) {
      // e.g. "/squad/" matches "/squad/anything"
      return pathname === prefix.slice(0, -1) || pathname.startsWith(prefix);
    }
    // e.g. "/family" matches "/family" and "/family/anything"
    return pathname === prefix || pathname.startsWith(prefix + "/");
  });

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
