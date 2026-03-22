"use client";

/**
 * Navbar — Floating pill, always visible
 *
 * Rules:
 *  1. Always rendered as a centred floating pill — never full-width bar
 *  2. NEVER hides on scroll. Always visible. Always accessible.
 *  3. Homepage: dark-glass ghost over hero → white glass pill after 32px scroll
 *  4. All other pages: white glass pill from the moment the page loads
 *  5. Inner pages show a ← back chevron beside the logo for easy navigation
 *  6. Active link marked with a rose dot indicator
 *  7. Mobile: hamburger → slide-down drawer that stays inside the pill shape
 *  8. Suppressed only on routes that have their own full-chrome layouts:
 *     /family, /admin, /vault/, /squad/, /login
 *     NOTE: /invite/ is NOT suppressed — guests need the nav while viewing invites
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ChevronLeft } from "lucide-react";
import { weddingConfig } from "@/lib/config";
import { readInvitePath, saveInvitePath } from "@/lib/client/invite-context";

// ── Routes that have their own full-page chrome — hide Navbar entirely ─────
const SUPPRESS_PREFIXES = [
  "/family",
  "/admin",
  "/vault/",
  "/squad/",
  "/login",
];

// ── Primary nav links ─────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Story",       href: "/story"       },
  { label: "Events",      href: "/events"       },
  { label: "Gallery",     href: "/gallery"      },
  { label: "Travel",      href: "/travel"       },
  { label: "Guestbook",   href: "/guestbook"    },
  { label: "Predictions", href: "/predictions"  },
];

// ── Back-destination map — where the ← arrow goes from each route ────────────
// Every inner page has a logical "parent". Defaults to "/" if not listed.
const BACK_MAP: Record<string, string> = {
  "/story":       "/",
  "/events":      "/",
  "/gallery":     "/",
  "/travel":      "/",
  "/guestbook":   "/",
  "/predictions": "/",
  "/rsvp":        "/",
  "/thank-you":   "/",
  "/live":        "/",
};

function getBackHref(pathname: string): string | null {
  // Exact match first
  if (BACK_MAP[pathname]) return BACK_MAP[pathname];
  // Sub-path match (e.g. /invite/abc123 → /)
  for (const [prefix, dest] of Object.entries(BACK_MAP)) {
    if (pathname.startsWith(prefix + "/")) return dest;
  }
  // Invite sub-paths always go home
  if (pathname.startsWith("/invite/")) return "/";
  // Home itself — no back button
  if (pathname === "/") return null;
  // Any other deep path — go up one level
  const parts = pathname.split("/").filter(Boolean);
  return parts.length > 1 ? "/" + parts.slice(0, -1).join("/") : "/";
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const ROSE = "#BE2D45";
const INK2 = "#362030";
const DF   = "'Cormorant Garamond',var(--font-display),Georgia,serif";
const BF   = "'Manrope',var(--font-body),system-ui,sans-serif";

export function Navbar() {
  const pathname = usePathname();

  const [open,       setOpen]       = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [inviteHref, setInviteHref] = useState<string | null>(null);

  // ── Scroll — only affects visual state, NEVER hides the nav ───────────────
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 32); }
    onScroll(); // set initial state
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Save invite path so we can link back to it ────────────────────────────
  useEffect(() => {
    if (pathname.startsWith("/invite/")) {
      saveInvitePath(pathname);
      setInviteHref(pathname);
    } else {
      setInviteHref(readInvitePath());
    }
  }, [pathname]);

  // ── Close drawer on navigation ────────────────────────────────────────────
  useEffect(() => { setOpen(false); }, [pathname]);

  // ── Suppression ───────────────────────────────────────────────────────────
  if (SUPPRESS_PREFIXES.some(p => pathname.startsWith(p))) return null;

  // ── State derivations ─────────────────────────────────────────────────────
  const isHome   = pathname === "/";
  const ghost    = isHome && !scrolled && !open;
  const backHref = getBackHref(pathname);

  // Prepend invitation link if one was saved from a previous visit
  const links = inviteHref
    ? [{ label: "Invitation", href: inviteHref }, ...NAV_LINKS]
    : NAV_LINKS;

  // ── Pill visual tokens (all transitions driven by CSS) ────────────────────
  const pillBg  = ghost ? "rgba(12,6,10,0.38)"      : "rgba(255,255,255,0.94)";
  const pillBdr = ghost ? "rgba(255,255,255,0.16)"   : "rgba(190,45,69,0.11)";
  const pillSh  = ghost
    ? "0 8px 32px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.08)"
    : "0 4px 24px rgba(15,10,11,0.09), 0 1px 3px rgba(15,10,11,0.05), inset 0 1px 0 rgba(255,255,255,0.85)";
  const textCol = ghost ? "rgba(255,255,255,0.84)"   : INK2;
  const logoCol = ghost ? "rgba(255,255,255,0.96)"   : "#120B0E";
  const subCol  = ghost ? "rgba(255,255,255,0.42)"   : "#72504A";

  return (
    <>
      <style>{`
        /* ── Pill transitions ─────────────────────── */
        .nav-pill {
          transition:
            background    .40s cubic-bezier(.16,1,.3,1),
            border-color  .40s cubic-bezier(.16,1,.3,1),
            box-shadow    .40s cubic-bezier(.16,1,.3,1);
        }

        /* ── Nav link ────────────────────────────── */
        .nav-a {
          display:inline-flex;align-items:center;
          padding:5px 12px;border-radius:999px;
          font-family:${BF};font-size:.79rem;font-weight:500;
          letter-spacing:.005em;text-decoration:none;
          white-space:nowrap;
          transition:color .15s,background .15s;
          position:relative;
        }
        .nav-a:hover { background:rgba(190,45,69,.07); }
        .nav-a.ghost:hover { background:rgba(255,255,255,.12); }

        /* Active state — rose text + dot below */
        .nav-a.active {
          font-weight:600;
        }
        .nav-a.active::after {
          content:'';
          position:absolute;bottom:1px;left:50%;
          transform:translateX(-50%);
          width:4px;height:4px;border-radius:50%;
          background:${ROSE};
        }

        /* ── Back button ──────────────────────────── */
        .nav-back {
          display:inline-flex;align-items:center;gap:3px;
          padding:5px 10px 5px 6px;border-radius:999px;
          font-family:${BF};font-size:.74rem;font-weight:500;
          text-decoration:none;white-space:nowrap;
          transition:background .15s,color .15s;
          flex-shrink:0;
        }
        .nav-back:hover { background:rgba(190,45,69,.07); }
        .nav-back.ghost:hover { background:rgba(255,255,255,.12); }

        /* ── Mobile link ──────────────────────────── */
        .mob-a {
          display:flex;align-items:center;
          padding:10px 14px;border-radius:12px;
          font-family:${BF};font-size:.9375rem;font-weight:500;
          text-decoration:none;color:${INK2};
          transition:background .14s,color .14s;
        }
        .mob-a:hover  { background:rgba(190,45,69,.06);color:${ROSE}; }
        .mob-a.active { background:rgba(190,45,69,.08);color:${ROSE};font-weight:600; }

        /* ── Mobile drawer animation ──────────────── */
        @keyframes drawer-drop {
          from { opacity:0;transform:translateY(-8px) }
          to   { opacity:1;transform:translateY(0) }
        }
        .mob-drawer { animation:drawer-drop .28s cubic-bezier(.16,1,.3,1) both; }
      `}</style>

      {/* ── Fixed outer shell — pointer-events none so page is always clickable ── */}
      <header style={{
        position:      "fixed",
        inset:         "0 0 auto 0",
        zIndex:        100,
        padding:       "10px clamp(.75rem,2.5vw,2rem) 0",
        pointerEvents: "none",
        // Never translateY — always visible
      }}>

        {/* ── THE PILL ───────────────────────────────────────────────────── */}
        <div
          className="nav-pill"
          style={{
            maxWidth:             "1160px",
            margin:               "0 auto",
            background:           pillBg,
            backdropFilter:       "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            border:               `1px solid ${pillBdr}`,
            borderRadius:         open ? "24px" : "999px",
            boxShadow:            pillSh,
            pointerEvents:        "auto",
            transition:           "border-radius .25s ease, background .40s ease, border-color .40s ease, box-shadow .40s ease",
            overflow:             "hidden",
          }}
        >
          {/* ── Main pill row ────────────────────────────────────────────── */}
          <div style={{
            height:         56,
            padding:        "0 clamp(.625rem,1.5vw,1.25rem)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            gap:            ".75rem",
          }}>

            {/* LEFT: back button (inner pages) + logo ─────────────────── */}
            <div style={{ display:"flex", alignItems:"center", gap:".375rem", flexShrink:0 }}>

              {/* ← Back — visible on all pages except home */}
              {backHref && !isHome && (
                <Link href={backHref}
                  className={`nav-back${ghost ? " ghost" : ""}`}
                  style={{ color: ghost ? "rgba(255,255,255,.75)" : "#72504A" }}
                  aria-label="Go back">
                  <ChevronLeft size={15} strokeWidth={2} />
                  <span style={{ display:"none" }} className="sm:block">Back</span>
                </Link>
              )}

              {/* Logo */}
              <Link href="/"
                style={{ display:"flex", alignItems:"center", gap:".55rem", textDecoration:"none" }}>
                {/* Monogram disc */}
                <div style={{
                  width:34, height:34, borderRadius:"50%", flexShrink:0,
                  display:"grid", placeItems:"center",
                  background: ghost
                    ? "rgba(255,255,255,.13)"
                    : "linear-gradient(135deg,rgba(190,45,69,.11),rgba(168,120,8,.07))",
                  border: ghost
                    ? "1px solid rgba(255,255,255,.25)"
                    : "1px solid rgba(190,45,69,.22)",
                  boxShadow: ghost ? "none" : "0 2px 8px rgba(190,45,69,.10)",
                  transition: "all .35s ease",
                }}>
                  <span style={{
                    fontFamily: DF, fontSize:".80rem", fontWeight:700,
                    color: ghost ? "rgba(255,255,255,.92)" : ROSE,
                    transition: "color .35s ease",
                  }}>
                    {(weddingConfig.brideName[0] ?? "H")}{(weddingConfig.groomName[0] ?? "S")}
                  </span>
                </div>

                {/* Name + subtitle — hidden on small screens to save space */}
                <div style={{ lineHeight:1, display:"flex", flexDirection:"column", gap:3 }}
                  className="hidden sm:flex">
                  <span style={{
                    fontFamily: DF, fontSize:".92rem", fontWeight:700,
                    letterSpacing:"-.01em",
                    transition:"color .35s ease", whiteSpace:"nowrap",
                  }}>
                    <span style={{ color: ghost ? "var(--name-bride)" : "var(--name-bride-light)" }}>
                      {weddingConfig.brideName.split(" ")[0]}
                    </span>
                    {" "}&amp;{" "}
                    <span style={{ color: ghost ? "var(--name-groom)" : "var(--name-groom-light)" }}>
                      {weddingConfig.groomName.split(" ")[0]}
                    </span>
                  </span>
                  <span style={{
                    fontFamily: BF, fontSize:".42rem", letterSpacing:".26em",
                    textTransform:"uppercase", color:subCol,
                    transition:"color .35s ease",
                  }}>
                    {weddingConfig.celebrationTitle}
                  </span>
                </div>
              </Link>
            </div>

            {/* CENTRE: desktop nav links ──────────────────────────────── */}
            <nav
              className="hidden lg:flex"
              style={{ alignItems:"center", gap:".1rem", flex:1, justifyContent:"center" }}
              aria-label="Main navigation">
              {links.map(({ label, href }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link key={href} href={href}
                    className={`nav-a${active ? " active" : ""}${ghost ? " ghost" : ""}`}
                    style={{ color: active ? ROSE : textCol }}>
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT: RSVP + hamburger ────────────────────────────────── */}
            <div style={{ display:"flex", alignItems:"center", gap:".4rem", flexShrink:0 }}>

              {/* RSVP pill */}
              <Link href="/rsvp"
                className="hidden sm:inline-flex"
                style={{
                  alignItems:"center",
                  padding:"7px 17px", borderRadius:999,
                  background:"linear-gradient(135deg,#D44860 0%,#BE2D45 100%)",
                  color:"#fff",
                  fontFamily:BF, fontSize:".75rem", fontWeight:700,
                  letterSpacing:".01em", textDecoration:"none",
                  boxShadow:"0 3px 12px rgba(190,45,69,.28)",
                  transition:"transform .16s,box-shadow .16s,filter .16s",
                  whiteSpace:"nowrap",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-1px)";
                  el.style.boxShadow = "0 6px 18px rgba(190,45,69,.36)";
                  el.style.filter    = "brightness(1.05)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "";
                  el.style.boxShadow = "0 3px 12px rgba(190,45,69,.28)";
                  el.style.filter    = "";
                }}>
                RSVP
              </Link>

              {/* Hamburger — tablet/mobile */}
              <button
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen(v => !v)}
                className="lg:hidden"
                style={{
                  width:36, height:36, borderRadius:"50%",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background: ghost ? "rgba(255,255,255,.13)" : "rgba(190,45,69,.06)",
                  border: ghost ? "1px solid rgba(255,255,255,.22)" : "1px solid rgba(190,45,69,.12)",
                  color: ghost ? "rgba(255,255,255,.88)" : INK2,
                  cursor:"pointer", transition:"all .16s ease", flexShrink:0,
                }}>
                {open ? <X size={15} strokeWidth={2} /> : <Menu size={15} strokeWidth={2} />}
              </button>
            </div>
          </div>

          {/* ── Mobile drawer — slides down inside the pill ──────────── */}
          {open && (
            <div className="mob-drawer lg:hidden"
              style={{ padding:"0 .75rem .875rem" }}>

              {/* Separator */}
              <div style={{
                height:1, margin:"0 .5rem .75rem",
                background: ghost ? "rgba(255,255,255,.10)" : "rgba(190,45,69,.07)",
              }} />

              {/* Nav links */}
              <nav style={{ display:"flex", flexDirection:"column", gap:".2rem",
                marginBottom:".75rem" }} aria-label="Mobile navigation">
                {links.map(({ label, href }) => {
                  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                  return (
                    <Link key={href} href={href}
                      onClick={() => setOpen(false)}
                      className={`mob-a${active ? " active" : ""}`}>
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* RSVP full-width */}
              <Link href="/rsvp" onClick={() => setOpen(false)}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"center",
                  padding:"11px", borderRadius:12,
                  background:"linear-gradient(135deg,#D44860 0%,#BE2D45 100%)",
                  color:"#fff", fontFamily:BF, fontSize:".9375rem",
                  fontWeight:700, textDecoration:"none",
                  boxShadow:"0 4px 14px rgba(190,45,69,.24)",
                }}>
                RSVP Now
              </Link>
            </div>
          )}
        </div>

        {/* Subtle accent line beneath pill — non-home pages only */}
        {!isHome && (
          <div style={{
            maxWidth:"1160px", margin:"5px auto 0",
            height:1, borderRadius:999,
            background:"linear-gradient(90deg,transparent 5%,rgba(190,45,69,.15) 35%,rgba(168,120,8,.18) 50%,rgba(190,45,69,.15) 65%,transparent 95%)",
            transition:"opacity .40s ease",
            opacity: scrolled ? 0 : 1,
          }} />
        )}
      </header>

      {/* Body spacer — prevents content from hiding under the fixed pill */}
      {!isHome && <div style={{ height: 78 }} aria-hidden />}
    </>
  );
}

export default Navbar;
