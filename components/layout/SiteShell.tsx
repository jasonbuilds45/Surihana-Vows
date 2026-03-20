"use client";

import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/*
──────────────────────────────────────────────────────────────────────────────
SiteShell — global layout wrapper

Navbar is shown on EVERY public page — homepage, invite pages, story, travel,
gallery, etc. The Navbar component itself handles:
  • Ghost/transparent mode on the homepage hero
  • Suppressing itself on /family, /admin, /vault/, /squad/, /login

This shell ONLY suppresses Navbar+Footer for routes that have their own full
layout chrome (family vault, admin dashboard, vault bridge, squad proposals,
login). All guest-facing public pages get the floating navbar.
──────────────────────────────────────────────────────────────────────────────
*/

// Routes that render their OWN complete layout — no global chrome needed
const SHELL_SUPPRESSED_PREFIXES = [
  "/family",              // family vault — has its own header/footer
  "/admin",               // admin dashboard — has its own header
  "/vault/",              // magic-link redirect bridge — transparent redirect
  "/squad/",              // squad proposal — private cinematic experience
  "/login",               // login page — standalone
  "/preview-cinematic",   // sandbox test page — full-screen, no chrome
];

// Homepage suppressed separately — exact match only, no prefix bleed
const HOMEPAGE_EXACT = "/";

export function SiteShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  const isHomepage = pathname === HOMEPAGE_EXACT;

  const suppress = isHomepage || SHELL_SUPPRESSED_PREFIXES.some((prefix) => {
    if (prefix.endsWith("/")) {
      return pathname === prefix.slice(0, -1) || pathname.startsWith(prefix);
    }
    return pathname === prefix || pathname.startsWith(prefix + "/");
  });

  if (suppress) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
