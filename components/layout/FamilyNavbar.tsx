"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Lock } from "lucide-react";
import classNames from "classnames";
import { Container } from "@/components/layout/Container";
import { weddingConfig } from "@/lib/config";

// ─────────────────────────────────────────────────────────────────────────────
// FamilyNavbar — navigation shown inside /family.
//
// Shows vault sections only. No admin links exposed here.
// ─────────────────────────────────────────────────────────────────────────────

const FAMILY_LINKS = [
  { label: "Memories",     href: "/family"           },
  { label: "Timeline",     href: "/family#timeline"  },
  { label: "Time Capsules",href: "/family#capsules"  },
  { label: "Gallery",      href: "/gallery"          },
  { label: "Archive",      href: "/archive"          },
];

export function FamilyNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-[rgba(248,241,231,0.88)] backdrop-blur-xl">
      <Container className="flex items-center justify-between py-4">
        {/* Brand */}
        <Link href="/family" className="flex flex-col">
          <span className="font-display text-lg uppercase tracking-[0.35em] text-stone-900">
            {weddingConfig.celebrationTitle}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-stone-500">
            <Lock className="h-2.5 w-2.5" />
            Family vault
          </span>
        </Link>

        <button
          aria-label="Toggle navigation"
          className="rounded-full border border-stone-300 p-2 text-stone-700 lg:hidden"
          onClick={() => setIsOpen((v) => !v)}
          type="button"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="hidden items-center gap-2 lg:flex">
          {FAMILY_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={classNames(
                  "rounded-full px-4 py-2 text-sm transition",
                  active
                    ? "bg-stone-900 text-white"
                    : "text-stone-700 hover:bg-white/70 hover:text-stone-950"
                )}
              >
                {link.label}
              </a>
            );
          })}
          <a
            href="/logout"
            className="ml-2 rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-500 transition hover:border-stone-300 hover:text-stone-800"
          >
            Sign out
          </a>
        </nav>
      </Container>

      {isOpen ? (
        <div className="border-t border-white/40 bg-[rgba(255,250,245,0.95)] lg:hidden">
          <Container className="grid gap-2 py-4">
            {FAMILY_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-sm text-stone-700 transition hover:bg-stone-100"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/logout"
              className="mt-2 rounded-2xl px-4 py-3 text-sm text-stone-500 transition hover:bg-stone-100"
              onClick={() => setIsOpen(false)}
            >
              Sign out
            </a>
          </Container>
        </div>
      ) : null}
    </header>
  );
}

export default FamilyNavbar;
