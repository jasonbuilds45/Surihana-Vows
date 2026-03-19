"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { weddingConfig } from "@/lib/config";

const SUPPRESS = ["/family", "/admin", "/vault/"];

const NAV_LINKS = [
  { label: "Story",       href: "/story" },
  { label: "Events",      href: "/events" },
  { label: "Gallery",     href: "/gallery" },
  { label: "Travel",      href: "/travel" },
  { label: "Guestbook",   href: "/guestbook" },
  { label: "Predictions", href: "/predictions" },
];

export function Navbar() {
  const pathname  = usePathname();
  const [open,    setOpen]    = useState(false);
  const [scrolled,setScrolled]= useState(false);
  const [hidden,  setHidden]  = useState(false);
  const lastY = useRef(0);

  const suppressed = SUPPRESS.some(p => pathname.startsWith(p));
  const isHome     = pathname === "/";
  const bf = weddingConfig.brideName.split(" ")[0]!;
  const gf = weddingConfig.groomName.split(" ")[0]!;

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 48);
      setHidden(y > lastY.current && y > 160 && !open);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  if (suppressed) return null;

  const ghost = isHome && !scrolled && !open;

  // Nav bar uses a floating pill design when scrolled, full-width when not
  const navBg = ghost
    ? "transparent"
    : "rgba(255, 255, 255, 0.92)";

  const navBorder = ghost
    ? "none"
    : "1px solid rgba(190, 45, 69, 0.12)";

  return (
    <>
      <header
        style={{
          position: "fixed",
          inset: "0 0 auto 0",
          zIndex: 100,
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)",
          paddingTop: scrolled ? "10px" : 0,
          paddingLeft: scrolled ? "clamp(1rem,3vw,2.5rem)" : 0,
          paddingRight: scrolled ? "clamp(1rem,3vw,2.5rem)" : 0,
          pointerEvents: "none",
        }}
      >
        {/* Top rose-gold line — only when not scrolled on non-home pages */}
        {!scrolled && !isHome && (
          <div style={{
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(190,45,69,0.5), rgba(168,120,8,0.6), rgba(190,45,69,0.5), transparent)",
            pointerEvents: "none",
          }} />
        )}

        {/* Nav pill / bar */}
        <div
          style={{
            background: navBg,
            backdropFilter: ghost ? "none" : "blur(24px) saturate(180%)",
            WebkitBackdropFilter: ghost ? "none" : "blur(24px) saturate(180%)",
            border: navBorder,
            borderRadius: scrolled ? "999px" : 0,
            boxShadow: ghost
              ? "none"
              : scrolled
                ? "0 4px 24px rgba(15,10,11,0.07), 0 1px 4px rgba(15,10,11,0.04), inset 0 1px 0 rgba(255,255,255,0.70)"
                : "0 1px 0 rgba(190,45,69,0.08), 0 2px 12px rgba(15,10,11,0.05)",
            transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)",
            pointerEvents: "auto",
          }}
        >
          <div style={{
            maxWidth: scrolled ? "none" : "1320px",
            margin: "0 auto",
            padding: scrolled
              ? "0 clamp(1rem,2vw,1.75rem)"
              : "0 clamp(1.25rem,5vw,5rem)",
            height: scrolled ? 56 : 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
            transition: "height 0.35s ease, padding 0.35s ease",
          }}>

            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.7rem", textDecoration: "none", flexShrink: 0 }}>
              <div style={{
                width: scrolled ? 34 : 38,
                height: scrolled ? 34 : 38,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: ghost
                  ? "rgba(255,255,255,0.12)"
                  : "linear-gradient(135deg, rgba(190,45,69,0.10), rgba(168,120,8,0.08))",
                border: ghost
                  ? "1px solid rgba(255,255,255,0.25)"
                  : "1px solid rgba(190,45,69,0.18)",
                transition: "all 0.35s ease",
                boxShadow: ghost ? "none" : "0 2px 8px rgba(190,45,69,0.10)",
              }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', var(--font-display), serif",
                  fontSize: scrolled ? "0.82rem" : "0.88rem",
                  fontWeight: 700,
                  color: ghost ? "#fff" : "var(--rose, #BE2D45)",
                  letterSpacing: "0.02em",
                }}>
                  {bf[0]}{gf[0]}
                </span>
              </div>

              <div style={{ lineHeight: 1, display: scrolled ? "none" : "block" }}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', var(--font-display), serif",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: ghost ? "rgba(255,255,255,0.95)" : "var(--ink, #120B0E)",
                  letterSpacing: "-0.01em",
                }}>
                  {bf} &amp; {gf}
                </div>
                <div style={{
                  fontSize: "0.52rem",
                  letterSpacing: "0.30em",
                  textTransform: "uppercase",
                  color: ghost ? "rgba(255,255,255,0.45)" : "var(--ink-3, #72504A)",
                  marginTop: 3,
                  fontFamily: "'Manrope', var(--font-body), sans-serif",
                }}>
                  {weddingConfig.celebrationTitle}
                </div>
              </div>

              {/* Compact name when scrolled */}
              {scrolled && (
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--ink, #120B0E)",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}>
                  {bf} &amp; {gf}
                </span>
              )}
            </Link>

            {/* Desktop nav links */}
            <nav
              className="hidden lg:flex"
              style={{ gap: "0.1rem", alignItems: "center" }}
            >
              {NAV_LINKS.map(({ label, href }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      fontSize: "0.80rem",
                      fontWeight: active ? 600 : 500,
                      textDecoration: "none",
                      fontFamily: "'Manrope', var(--font-body), sans-serif",
                      letterSpacing: "0.01em",
                      color: active
                        ? "var(--rose, #BE2D45)"
                        : ghost
                        ? "rgba(255,255,255,0.78)"
                        : "var(--ink-2, #362030)",
                      background: active
                        ? "rgba(190,45,69,0.09)"
                        : "transparent",
                      transition: "all 0.18s ease",
                      position: "relative",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.color = ghost ? "#fff" : "var(--rose, #BE2D45)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(190,45,69,0.07)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.color = ghost ? "rgba(255,255,255,0.78)" : "var(--ink-2, #362030)";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* CTA + mobile toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
              {/* RSVP pill — desktop */}
              <Link
                href="/rsvp"
                className="hidden sm:inline-flex"
                style={{
                  padding: scrolled ? "8px 18px" : "9px 20px",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, var(--rose-lgt, #D44860) 0%, var(--rose, #BE2D45) 100%)",
                  color: "#FFFFFF",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontFamily: "'Manrope', sans-serif",
                  letterSpacing: "0.01em",
                  boxShadow: "0 4px 16px rgba(190,45,69,0.28), 0 1px 4px rgba(190,45,69,0.18)",
                  transition: "all 0.22s ease",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px) scale(1.02)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(190,45,69,0.38), 0 2px 8px rgba(190,45,69,0.22)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(190,45,69,0.28), 0 1px 4px rgba(190,45,69,0.18)";
                }}
              >
                RSVP
              </Link>

              {/* Mobile hamburger */}
              <button
                aria-label="Toggle navigation"
                onClick={() => setOpen(v => !v)}
                className="lg:hidden"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: ghost
                    ? "rgba(255,255,255,0.14)"
                    : "rgba(253,250,247,0.90)",
                  border: ghost
                    ? "1px solid rgba(255,255,255,0.22)"
                    : "1px solid rgba(190,45,69,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: ghost ? "#fff" : "var(--ink-2, #362030)",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.18s ease",
                }}
              >
                {open
                  ? <X size={16} />
                  : <Menu size={16} />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div
            className="lg:hidden"
            style={{
              marginTop: scrolled ? 8 : 0,
              background: "rgba(253,250,247,0.96)",
              backdropFilter: "blur(28px) saturate(200%)",
              WebkitBackdropFilter: "blur(28px) saturate(200%)",
              border: "1px solid rgba(190,45,69,0.09)",
              borderRadius: scrolled ? 24 : "0 0 24px 24px",
              padding: "1.25rem",
              boxShadow: "0 16px 48px rgba(15,10,11,0.10)",
              animation: "slideDown 0.35s cubic-bezier(0.16,1,0.3,1) both",
              pointerEvents: "auto",
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1rem" }}>
              {NAV_LINKS.map(({ label, href }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    style={{
                      padding: "11px 16px",
                      borderRadius: 14,
                      fontSize: "0.9375rem",
                      textDecoration: "none",
                      fontWeight: active ? 600 : 500,
                      fontFamily: "'Manrope', sans-serif",
                      color: active ? "var(--rose, #BE2D45)" : "var(--ink-2, #362030)",
                      background: active ? "rgba(190,45,69,0.07)" : "transparent",
                      transition: "all 0.15s ease",
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
                alignItems: "center",
                padding: "13px",
                borderRadius: 14,
                background: "linear-gradient(135deg, var(--rose-lgt, #D44860) 0%, var(--rose, #BE2D45) 100%)",
                color: "#FFFFFF",
                fontSize: "0.9375rem",
                fontWeight: 700,
                textDecoration: "none",
                fontFamily: "'Manrope', sans-serif",
                boxShadow: "0 6px 20px rgba(190,45,69,0.28)",
              }}
            >
              RSVP Now
            </Link>
          </div>
        )}
      </header>

      {/* Spacer for non-home pages */}
      {!isHome && <div style={{ height: 68 }} />}

      <style>{`
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </>
  );
}

export default Navbar;
