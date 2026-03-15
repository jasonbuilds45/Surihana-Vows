"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import classNames from "classnames";
import { Container } from "@/components/layout/Container";
import { weddingConfig } from "@/lib/config";

// ─────────────────────────────────────────────────────────────────────────────
// GuestNavbar — minimal navigation shown on /invite/[guest] and the live hub.
//
// Deliberately exposes ONLY guest-relevant links.
// Admin, Family Vault, and Login links must NEVER appear here — they break the
// cinematic illusion and signal backend infrastructure guests should not see.
// ─────────────────────────────────────────────────────────────────────────────

const GUEST_LINKS = [
  { label: "Story",     href: "#story"     },
  { label: "Events",    href: "#events"    },
  { label: "RSVP",      href: "#rsvp"      },
  { label: "Travel",    href: "#travel"    },
  { label: "Guestbook", href: "/guestbook" },
  { label: "Gallery",   href: "/gallery"   },
];

export function GuestNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isLive = pathname === "/live";

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-stone-950/85 backdrop-blur-xl">
      <Container className="flex items-center justify-between py-4">
        {/* Brand — couple names only, no platform name */}
        <div className="flex flex-col">
          <span className="font-display text-base uppercase tracking-[0.35em] text-white">
            {weddingConfig.brideName.split(" ")[0]} &amp; {weddingConfig.groomName.split(" ")[0]}
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            {weddingConfig.weddingDate} · {weddingConfig.venueName}
          </span>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle navigation"
          className="rounded-full border border-white/20 p-2 text-white/70 lg:hidden"
          onClick={() => setIsOpen((v) => !v)}
          type="button"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {isLive ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-4 py-2 text-xs uppercase tracking-[0.24em] text-rose-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
              Live now
            </span>
          ) : null}
          {GUEST_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </Container>

      {/* Mobile menu */}
      {isOpen ? (
        <div className="border-t border-white/10 bg-stone-950/95 lg:hidden">
          <Container className="grid gap-1 py-4">
            {isLive ? (
              <span className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-rose-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
                Live now
              </span>
            ) : null}
            {GUEST_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </Container>
        </div>
      ) : null}
    </header>
  );
}

export default GuestNavbar;
