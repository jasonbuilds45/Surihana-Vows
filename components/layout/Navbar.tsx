"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { weddingConfig } from "@/lib/config";

const SUPPRESS = ["/family", "/admin", "/vault/"];

const NAV_LINKS = [
  { label: "Story", href: "/story" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Travel", href: "/travel" },
  { label: "Guestbook", href: "/guestbook" },
  { label: "Predictions", href: "/predictions" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  const lastY = useRef(0);

  const suppressed = SUPPRESS.some((p) => pathname.startsWith(p));
  const isHome = pathname === "/";

  const brideFirst = weddingConfig.brideName.split(" ")[0];
  const groomFirst = weddingConfig.groomName.split(" ")[0];

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;

      setScrolled(y > 60);
      setHidden(y > lastY.current && y > 180 && !open);

      lastY.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  if (suppressed) return null;

  const ghost = isHome && !scrolled && !open;

  return (
    <>
      <header
        style={{
          position: "fixed",
          inset: "0 0 auto 0",
          zIndex: 100,
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Elegant accent stripe */}
        <div
          style={{
            height: 2,
            background:
              "linear-gradient(90deg, transparent, var(--color-accent-soft), var(--color-accent-gold), var(--color-accent-soft), transparent)",
          }}
        />

        {/* Main bar */}
        <div
          style={{
            background: ghost
              ? "transparent"
              : "rgba(255,255,255,0.92)",
            backdropFilter: ghost ? "none" : "blur(20px)",
            WebkitBackdropFilter: ghost ? "none" : "blur(20px)",
            borderBottom: ghost ? "none" : "1px solid var(--color-border)",
            transition: "all 0.35s ease",
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "0 clamp(1.25rem,5vw,4rem)",
              height: 70,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid var(--color-accent)",
                  background: ghost
                    ? "rgba(255,255,255,0.15)"
                    : "var(--color-accent-soft)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display), serif",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: ghost
                      ? "#ffffff"
                      : "var(--color-accent)",
                  }}
                >
                  {brideFirst[0]}
                  {groomFirst[0]}
                </span>
              </div>

              <div style={{ lineHeight: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display), serif",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: ghost
                      ? "rgba(255,255,255,0.95)"
                      : "var(--color-text-primary)",
                  }}
                >
                  {brideFirst} & {groomFirst}
                </div>

                <div
                  style={{
                    fontSize: "0.55rem",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: ghost
                      ? "rgba(255,255,255,0.5)"
                      : "var(--color-text-muted)",
                    marginTop: 2,
                  }}
                >
                  {weddingConfig.celebrationTitle}
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden lg:flex"
              style={{
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              {NAV_LINKS.map(({ label, href }) => {
                const active = pathname === href;

                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 999,
                      fontSize: "0.82rem",
                      fontWeight: active ? 600 : 500,
                      textDecoration: "none",
                      fontFamily: "var(--font-body), sans-serif",
                      color: active
                        ? "var(--color-accent)"
                        : ghost
                        ? "rgba(255,255,255,0.8)"
                        : "var(--color-text-secondary)",
                      background: active
                        ? "var(--color-accent-light)"
                        : "transparent",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link
                href="/rsvp"
                className="hidden sm:inline-flex"
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: "var(--color-accent)",
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontFamily: "var(--font-body), sans-serif",
                  boxShadow:
                    "0 6px 20px rgba(138,90,68,0.25)",
                }}
              >
                RSVP
              </Link>

              {/* Mobile toggle */}
              <button
                aria-label="Toggle menu"
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: ghost
                    ? "rgba(255,255,255,0.18)"
                    : "var(--color-surface-soft)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {open && (
          <div
            className="lg:hidden"
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid var(--color-border)",
              padding: "1.2rem clamp(1.25rem,5vw,4rem) 1.5rem",
            }}
          >
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
                marginBottom: "1rem",
              }}
            >
              {NAV_LINKS.map(({ label, href }) => {
                const active = pathname === href;

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      fontSize: "0.95rem",
                      textDecoration: "none",
                      fontWeight: active ? 600 : 500,
                      fontFamily: "var(--font-body), sans-serif",
                      color: active
                        ? "var(--color-accent)"
                        : "var(--color-text-secondary)",
                      background: active
                        ? "var(--color-accent-light)"
                        : "transparent",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/rsvp"
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "14px",
                borderRadius: 14,
                background: "var(--color-accent)",
                color: "#fff",
                fontSize: "0.95rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              RSVP Now
            </Link>
          </div>
        )}
      </header>

      {!isHome && <div style={{ height: 70 }} />}
    </>
  );
}

export default Navbar;
