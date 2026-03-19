"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { weddingConfig } from "@/lib/config";
import { formatDate } from "@/utils/formatDate";

const PUBLIC_GUEST_LINKS = [
  { label: "Story",       href: "/story" },
  { label: "Events",      href: "/events" },
  { label: "Travel",      href: "/travel" },
  { label: "Guestbook",   href: "/guestbook" },
  { label: "Predictions", href: "/predictions" },
  { label: "Gallery",     href: "/gallery" },
] as const;

function NavItem({
  href,
  label,
  active,
  mobile = false,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  mobile?: boolean;
  onNavigate: () => void;
}) {
  const className = mobile
    ? "rounded-2xl px-4 py-3 text-sm transition"
    : "rounded-full px-4 py-2 text-sm transition";
  const style: CSSProperties = {
    color: active ? "var(--rose)" : "var(--ink-3)",
    background: active ? "rgba(190,45,69,.08)" : "transparent",
    textDecoration: "none",
    fontWeight: active ? 700 : 600,
    letterSpacing: mobile ? "0.01em" : "0.02em",
  };

  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} style={style} onClick={onNavigate}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style} onClick={onNavigate}>
      {label}
    </Link>
  );
}

export function GuestNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isInvite = pathname.startsWith("/invite/");
  const isPersonalInvite = isInvite && pathname !== "/invite/general";
  const inviteHref = isInvite ? pathname : "/invite/general";
  const rsvpHref = isPersonalInvite ? "#rsvp" : "/rsvp";
  const navLinks = [
    ...(isInvite ? [{ label: "Invitation", href: inviteHref }] : []),
    ...PUBLIC_GUEST_LINKS,
  ];

  function closeMenu() {
    setIsOpen(false);
  }

  function isActive(href: string) {
    return !href.startsWith("#") && pathname === href;
  }

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        borderColor: "rgba(190,45,69,.10)",
        background: "rgba(253,250,247,.88)",
      }}
    >
      <Container className="flex items-center justify-between gap-4 py-4">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-display text-base uppercase tracking-[0.35em]" style={{ color: "var(--ink)" }}>
            {weddingConfig.brideName.split(" ")[0]} &amp; {weddingConfig.groomName.split(" ")[0]}
          </span>
          <span className="truncate text-[10px] uppercase tracking-[0.3em]" style={{ color: "var(--ink-4)" }}>
            {formatDate(weddingConfig.weddingDate)} · {weddingConfig.venueName}
          </span>
        </div>

        <button
          aria-label="Toggle navigation"
          className="rounded-full border p-2 lg:hidden"
          style={{ borderColor: "rgba(190,45,69,.14)", color: "var(--ink-3)" }}
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              active={isActive(link.href)}
              onNavigate={closeMenu}
            />
          ))}
          <NavItem href={rsvpHref} label="RSVP" active={false} onNavigate={closeMenu} />
        </nav>
      </Container>

      {isOpen ? (
        <div
          className="border-t lg:hidden"
          style={{
            borderColor: "rgba(190,45,69,.10)",
            background: "rgba(253,250,247,.96)",
          }}
        >
          <Container className="grid gap-1 py-4">
            {navLinks.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                label={link.label}
                active={isActive(link.href)}
                mobile
                onNavigate={closeMenu}
              />
            ))}
            <NavItem href={rsvpHref} label="RSVP" active={false} mobile onNavigate={closeMenu} />
          </Container>
        </div>
      ) : null}
    </header>
  );
}

export default GuestNavbar;
