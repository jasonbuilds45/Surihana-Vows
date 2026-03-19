"use client";

/**
 * Navbar — Floating pill design
 *
 * Behaviour:
 *  — Always renders as a centred floating pill (never full-width)
 *  — Homepage: ghost/transparent over the hero, transitions to solid pill on scroll
 *  — All other pages: solid pill from page load, always visible
 *  — Hides on scroll-down (desktop only, >160px), reappears on scroll-up
 *  — Mobile: hamburger → full-width bottom-rounded drawer
 *  — Active link shown with rose tint + dot indicator
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { weddingConfig } from "@/lib/config";
import { readInvitePath, saveInvitePath } from "@/lib/client/invite-context";

// Pages that have their own navigation chrome — suppress entirely
const SUPPRESS_PREFIXES = ["/family", "/admin", "/vault/", "/squad/", "/invite/"];

const NAV_LINKS = [
  { label: "Story",       href: "/story"       },
  { label: "Events",      href: "/events"       },
  { label: "Gallery",     href: "/gallery"      },
  { label: "Travel",      href: "/travel"       },
  { label: "Guestbook",   href: "/guestbook"    },
  { label: "Predictions", href: "/predictions"  },
];

// ── Tokens ────────────────────────────────────────────────────────────────────
const ROSE       = "#BE2D45";
const INK        = "#120B0E";
const INK2       = "#362030";
const INK3       = "#72504A";
const BF         = "'Manrope',var(--font-body),system-ui,sans-serif";
const DF         = "'Cormorant Garamond',var(--font-display),Georgia,serif";

export function Navbar() {
  const pathname = usePathname();

  const [open,       setOpen]       = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [hidden,     setHidden]     = useState(false);
  const [inviteHref, setInviteHref] = useState<string | null>(null);
  const lastY = useRef(0);

  // ── Scroll handling ────────────────────────────────────────────────────────
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 32);
      // Auto-hide only on wide screens — never on mobile (hamburger menu)
      if (window.innerWidth >= 1024) {
        setHidden(y > lastY.current && y > 160 && !open);
      } else {
        setHidden(false);
      }
      lastY.current = y;
    }
    // Set initial state without waiting for a scroll event
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  // ── Invite path memory ─────────────────────────────────────────────────────
  useEffect(() => {
    if (pathname.startsWith("/invite/")) {
      saveInvitePath(pathname);
      setInviteHref(pathname);
      return;
    }
    setInviteHref(readInvitePath());
  }, [pathname]);

  // ── Close mobile drawer on route change ────────────────────────────────────
  useEffect(() => { setOpen(false); }, [pathname]);

  // ── Suppressed routes ──────────────────────────────────────────────────────
  const suppressed = SUPPRESS_PREFIXES.some(p => pathname.startsWith(p));
  if (suppressed) return null;

  const isHome = pathname === "/";

  // Ghost: fully transparent — only on homepage before any scroll
  const ghost = isHome && !scrolled && !open;

  // Nav links — optionally prepend the saved invite link
  const links = inviteHref
    ? [{ label: "Invitation", href: inviteHref }, ...NAV_LINKS]
    : NAV_LINKS;

  // ── Visual states ──────────────────────────────────────────────────────────
  // Pill is ALWAYS shown — the only difference is opacity/colour
  const pillBg     = ghost ? "rgba(10,5,8,0.30)"       : "rgba(255,255,255,0.92)";
  const pillBorder = ghost ? "rgba(255,255,255,0.18)"  : "rgba(190,45,69,0.12)";
  const pillShadow = ghost
    ? "0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10)"
    : "0 4px 32px rgba(15,10,11,0.10), 0 1px 4px rgba(15,10,11,0.06), inset 0 1px 0 rgba(255,255,255,0.80)";
  const linkColor  = ghost ? "rgba(255,255,255,0.82)"  : INK2;
  const logoColor  = ghost ? "rgba(255,255,255,0.95)"  : INK;
  const subColor   = ghost ? "rgba(255,255,255,0.45)"  : INK3;

  return (
    <>
      <style>{`
        /* ── Keyframes ─────────────────────────────── */
        @keyframes nav-slide-down {
          from { opacity:0; transform:translateY(-10px) }
          to   { opacity:1; transform:translateY(0) }
        }
        @keyframes drawer-in {
          from { opacity:0; transform:translateY(-6px) scale(.98) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }

        /* ── Nav link hover / active ───────────────── */
        .nav-lnk {
          display:inline-flex;align-items:center;
          padding:6px 13px;border-radius:999px;
          font-family:${BF};font-size:.80rem;font-weight:500;
          letter-spacing:.01em;text-decoration:none;
          transition:color .16s,background .16s;
          position:relative;white-space:nowrap;
        }
        .nav-lnk:hover  { background:rgba(190,45,69,.07); }
        .nav-lnk.active { font-weight:600; }

        /* Active dot */
        .nav-lnk.active::after {
          content:'';position:absolute;
          bottom:2px;left:50%;transform:translateX(-50%);
          width:4px;height:4px;border-radius:50%;
          background:${ROSE};
        }

        /* ── Mobile drawer link ────────────────────── */
        .mob-lnk {
          display:flex;align-items:center;
          padding:11px 14px;border-radius:14px;
          font-family:${BF};font-size:.9375rem;font-weight:500;
          text-decoration:none;
          color:${INK2};
          transition:background .15s,color .15s;
        }
        .mob-lnk:hover  { background:rgba(190,45,69,.06);color:${ROSE} }
        .mob-lnk.active { background:rgba(190,45,69,.08);color:${ROSE};font-weight:600 }
      `}</style>

      {/* ── HEADER wrapper — fixed, full-width, pointer-events none so page is clickable ── */}
      <header style={{
        position:   "fixed",
        inset:      "0 0 auto 0",
        zIndex:     100,
        padding:    "10px clamp(.875rem,2.5vw,2rem) 0",
        transform:  hidden ? "translateY(-120%)" : "translateY(0)",
        transition: "transform .50s cubic-bezier(.16,1,.3,1)",
        pointerEvents: "none",
      }}>

        {/* ── Floating pill ──────────────────────────────────────────────── */}
        <div style={{
          maxWidth:    "1200px",
          margin:      "0 auto",
          background:  pillBg,
          backdropFilter:       "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border:       `1px solid ${pillBorder}`,
          borderRadius: "999px",
          boxShadow:    pillShadow,
          transition:   "background .40s ease, border-color .40s ease, box-shadow .40s ease",
          pointerEvents: "auto",
          overflow:      "visible",
        }}>
          <div style={{
            height:  56,
            padding: "0 clamp(.875rem,2vw,1.5rem)",
            display: "flex",
            alignItems:      "center",
            justifyContent:  "space-between",
            gap: "1rem",
          }}>

            {/* ── Logo ──────────────────────────────────────────────────── */}
            <Link href="/" style={{ display:"flex",alignItems:"center",gap:".6rem",
              textDecoration:"none",flexShrink:0 }}>
              {/* Monogram badge */}
              <div style={{
                width:34,height:34,borderRadius:"50%",flexShrink:0,
                display:"grid",placeItems:"center",
                background: ghost
                  ? "rgba(255,255,255,.14)"
                  : "linear-gradient(135deg,rgba(190,45,69,.12),rgba(168,120,8,.08))",
                border: ghost
                  ? "1px solid rgba(255,255,255,.28)"
                  : "1px solid rgba(190,45,69,.20)",
                boxShadow: ghost ? "none" : "0 2px 8px rgba(190,45,69,.12)",
                transition: "all .35s ease",
              }}>
                <span style={{
                  fontFamily: DF,
                  fontSize: ".82rem", fontWeight: 700,
                  color: ghost ? "rgba(255,255,255,.92)" : ROSE,
                  letterSpacing: ".02em",
                }}>
                  {(weddingConfig.brideName[0] ?? "M")}{(weddingConfig.groomName[0] ?? "L")}
                </span>
              </div>

              {/* Name + tagline — hidden on very small screens */}
              <div style={{ lineHeight:1, display:"flex", flexDirection:"column", gap:3 }}>
                <span style={{ fontFamily:DF, fontSize:".975rem", fontWeight:700,
                  color:logoColor, letterSpacing:"-.01em",
                  transition:"color .35s ease", whiteSpace:"nowrap" }}>
                  {weddingConfig.brideName.split(" ")[0]} &amp; {weddingConfig.groomName.split(" ")[0]}
                </span>
                <span style={{ fontFamily:BF, fontSize:".44rem", letterSpacing:".28em",
                  textTransform:"uppercase", color:subColor,
                  transition:"color .35s ease" }}>
                  {weddingConfig.celebrationTitle}
                </span>
              </div>
            </Link>

            {/* ── Desktop nav links ─────────────────────────────────────── */}
            <nav style={{ display:"flex",alignItems:"center",gap:".1rem",
              flex:1, justifyContent:"center" }}
              className="hidden lg:flex">
              {links.map(({ label, href }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link key={href} href={href}
                    className={`nav-lnk${active ? " active" : ""}`}
                    style={{ color: active ? ROSE : linkColor }}>
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right: RSVP + hamburger ───────────────────────────────── */}
            <div style={{ display:"flex",alignItems:"center",gap:".5rem",flexShrink:0 }}>

              {/* RSVP pill */}
              <Link href="/rsvp"
                className="hidden sm:inline-flex"
                style={{
                  alignItems:"center",
                  padding: "7px 18px", borderRadius: 999,
                  background: "linear-gradient(135deg,#D44860 0%,#BE2D45 100%)",
                  color: "#fff",
                  fontFamily: BF, fontSize: ".76rem", fontWeight: 700,
                  letterSpacing: ".01em", textDecoration: "none",
                  boxShadow: "0 3px 14px rgba(190,45,69,.30),0 1px 4px rgba(190,45,69,.18)",
                  transition: "transform .18s,box-shadow .18s,filter .18s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform  = "translateY(-1px) scale(1.02)";
                  el.style.boxShadow  = "0 6px 20px rgba(190,45,69,.38),0 2px 8px rgba(190,45,69,.22)";
                  el.style.filter     = "brightness(1.04)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform  = "";
                  el.style.boxShadow  = "0 3px 14px rgba(190,45,69,.30),0 1px 4px rgba(190,45,69,.18)";
                  el.style.filter     = "";
                }}>
                RSVP
              </Link>

              {/* Hamburger — mobile / tablet */}
              <button
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen(v => !v)}
                className="lg:hidden"
                style={{
                  width:36, height:36, borderRadius:"50%",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background: ghost ? "rgba(255,255,255,.14)" : "rgba(190,45,69,.06)",
                  border: ghost ? "1px solid rgba(255,255,255,.25)" : "1px solid rgba(190,45,69,.14)",
                  color: ghost ? "#fff" : INK2,
                  backdropFilter: "blur(8px)",
                  transition: "all .18s ease",
                  cursor: "pointer",
                  flexShrink: 0,
                }}>
                {open ? <X size={15} /> : <Menu size={15} />}
              </button>
            </div>
          </div>

          {/* ── Mobile drawer (inside pill container so it inherits border-radius context) ── */}
          {open && (
            <div
              className="lg:hidden"
              style={{
                padding: "0 .75rem 1rem",
                animation: "drawer-in .30s cubic-bezier(.16,1,.3,1) both",
              }}>
              {/* Separator */}
              <div style={{ height:1, margin:"0 .5rem .875rem",
                background:"rgba(190,45,69,.08)" }} />

              {/* Nav links */}
              <nav style={{ display:"flex",flexDirection:"column",gap:".2rem",marginBottom:".875rem" }}>
                {links.map(({ label, href }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link key={href} href={href}
                      onClick={() => setOpen(false)}
                      className={`mob-lnk${active ? " active" : ""}`}>
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* RSVP full-width */}
              <Link href="/rsvp" onClick={() => setOpen(false)}
                style={{
                  display:"flex",alignItems:"center",justifyContent:"center",
                  padding:"12px", borderRadius:14,
                  background:"linear-gradient(135deg,#D44860 0%,#BE2D45 100%)",
                  color:"#fff", fontFamily:BF, fontSize:".9375rem",
                  fontWeight:700, textDecoration:"none",
                  boxShadow:"0 4px 16px rgba(190,45,69,.26)",
                }}>
                RSVP Now
              </Link>
            </div>
          )}
        </div>

        {/* Rose-gold accent line below the pill — non-home, non-scrolled */}
        {!isHome && !scrolled && (
          <div style={{
            maxWidth:"1200px", margin:"6px auto 0",
            height:1, borderRadius:999,
            background:"linear-gradient(90deg,transparent 5%,rgba(190,45,69,.20) 30%,rgba(168,120,8,.28) 50%,rgba(190,45,69,.20) 70%,transparent 95%)",
          }} />
        )}
      </header>

      {/* Body spacer — keeps content from hiding under the fixed pill */}
      {!isHome && (
        <div style={{ height: 76 }} />
      )}
    </>
  );
}

export default Navbar;
