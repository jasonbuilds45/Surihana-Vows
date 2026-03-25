"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart2, Clock, Film, Images, PenLine, Shield } from "lucide-react";

const BASE_TABS = [
  { id: "memories", label: "Memories", icon: PenLine },
  { id: "timeline", label: "Timeline", icon: Film },
  { id: "photos", label: "Albums", icon: Images },
  { id: "capsules", label: "Capsules", icon: Clock },
  { id: "polls", label: "Polls", icon: BarChart2 },
];

const SQUAD_TAB = { id: "squad", label: "Squad Hub", icon: Shield };

const BF = "var(--font-body), system-ui, sans-serif";
const ROSE = "#BE2D45";
const ROSE_DARK = "#7E2032";
const GOLD = "#B8820A";
const GOLD_DARK = "#7A5800";

interface VaultNavProps {
  isSquad?: boolean;
}

export function VaultNav({ isSquad = false }: VaultNavProps) {
  const tabs = useMemo(() => (isSquad ? [...BASE_TABS, SQUAD_TAB] : BASE_TABS), [isSquad]);
  const [active, setActive] = useState("memories");
  const scrolling = useRef(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    tabs.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting && !scrolling.current) setActive(id);
        },
        { threshold: 0.32, rootMargin: "-80px 0px -45% 0px" }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [tabs]);

  function scrollTo(id: string) {
    scrolling.current = true;
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      scrolling.current = false;
    }, 900);
  }

  return (
    <nav
      className="hide-scrollbar"
      style={{
        position: "sticky",
        top: "var(--vault-header-height, 57px)",
        zIndex: 40,
        padding: ".9rem 0 1rem",
        background: "linear-gradient(180deg, rgba(252,248,244,.92), rgba(252,248,244,.74))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(190,45,69,.08)",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 1.25rem" }}>
        <div
          style={{
            display: "inline-flex",
            minWidth: "max-content",
            alignItems: "center",
            gap: ".45rem",
            padding: ".45rem",
            borderRadius: 999,
            background: "rgba(255,255,255,.78)",
            border: "1px solid rgba(190,45,69,.10)",
            boxShadow: "0 18px 34px rgba(26,12,14,.08)",
          }}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            const isSquadTab = id === "squad";
            const accent = isSquadTab ? GOLD : ROSE;
            const accentDark = isSquadTab ? GOLD_DARK : ROSE_DARK;

            return (
              <button
                key={id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => scrollTo(id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 16px",
                  cursor: "pointer",
                  borderRadius: 999,
                  border: `1px solid ${isActive ? "transparent" : "rgba(190,45,69,.08)"}`,
                  background: isActive
                    ? `linear-gradient(135deg, ${accent}, ${accentDark})`
                    : "rgba(255,255,255,.44)",
                  color: isActive ? "#fff" : "var(--color-text-secondary)",
                  fontSize: ".72rem",
                  fontWeight: isActive ? 700 : 600,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  fontFamily: BF,
                  transition: "transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease",
                  boxShadow: isActive ? "0 14px 28px rgba(26,12,14,.16)" : "none",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(event) => {
                  if (!isActive) event.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "none";
                }}
              >
                <Icon size={14} />
                {label}
                {!isActive && isSquadTab ? (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: GOLD,
                      opacity: 0.8,
                      flexShrink: 0,
                    }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <style>{".hide-scrollbar::-webkit-scrollbar{display:none}"}</style>
    </nav>
  );
}

export default VaultNav;
