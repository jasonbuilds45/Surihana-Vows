"use client";

/**
 * VaultNav — sticky horizontal tab bar for the family vault.
 * Highlights the active section based on scroll position using IntersectionObserver.
 * On mobile it horizontally scrolls so all tabs fit.
 */

import { useEffect, useRef, useState } from "react";
import { PenLine, Images, Clock, BarChart2, Film } from "lucide-react";

const TABS = [
  { id: "memories",  label: "Memories",  icon: PenLine },
  { id: "timeline",  label: "Timeline",  icon: Film },
  { id: "photos",    label: "Albums",    icon: Images },
  { id: "capsules",  label: "Capsules",  icon: Clock },
  { id: "polls",     label: "Polls",     icon: BarChart2 },
];

const BF   = "var(--font-body), system-ui, sans-serif";
const ROSE = "#C0364A";

export function VaultNav() {
  const [active, setActive] = useState("memories");
  const scrolling = useRef(false);

  // ── Highlight active section via IntersectionObserver ─────────────────────
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    TABS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting && !scrolling.current) {
            setActive(id);
          }
        },
        { threshold: 0.3, rootMargin: "-60px 0px -40% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  function scrollTo(id: string) {
    scrolling.current = true;
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => { scrolling.current = false; }, 900);
  }

  return (
    <nav
      style={{
        position:        "sticky",
        top:             "var(--vault-header-height, 57px)",
        zIndex:          40,
        background:      "rgba(250,248,246,0.92)",
        backdropFilter:  "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom:    "1px solid var(--color-border)",
        overflowX:       "auto",
        scrollbarWidth:  "none",
      }}
      className="hide-scrollbar"
    >
      <div style={{ display: "flex", gap: 0, minWidth: "max-content", padding: "0 1rem" }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              style={{
                display:       "inline-flex",
                alignItems:    "center",
                gap:           6,
                padding:       "14px 16px",
                cursor:        "pointer",
                background:    "transparent",
                border:        "none",
                borderBottom:  `2px solid ${isActive ? ROSE : "transparent"}`,
                color:         isActive ? ROSE : "var(--color-text-muted)",
                fontSize:      ".72rem",
                fontWeight:    isActive ? 700 : 500,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                fontFamily:    BF,
                transition:    "all .15s ease",
                flexShrink:    0,
                whiteSpace:    "nowrap",
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </nav>
  );
}

export default VaultNav;
