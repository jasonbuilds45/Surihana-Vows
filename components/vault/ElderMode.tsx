"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Type } from "lucide-react";

interface ElderModeContextValue { elderMode: boolean; toggleElderMode: () => void; }
const ElderModeContext = createContext<ElderModeContextValue>({ elderMode: false, toggleElderMode: () => undefined });

export function ElderModeProvider({ children }: { children: ReactNode }) {
  const [elderMode, setElderMode] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("surihana-elder-mode") === "1") setElderMode(true);
  }, []);
  function toggleElderMode() {
    setElderMode((prev) => { const next = !prev; sessionStorage.setItem("surihana-elder-mode", next ? "1" : "0"); return next; });
  }
  return <ElderModeContext.Provider value={{ elderMode, toggleElderMode }}>{children}</ElderModeContext.Provider>;
}

export function useElderMode() { return useContext(ElderModeContext); }

export function ElderModeToggle() {
  const { elderMode, toggleElderMode } = useElderMode();
  return (
    <button
      type="button"
      onClick={toggleElderMode}
      title={elderMode ? "Switch to normal view" : "Switch to simplified larger text"}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs uppercase transition"
      style={{
        letterSpacing: "0.22em",
        background: elderMode ? "rgba(138,90,68,0.08)" : "var(--color-surface)",
        border: `1px solid ${elderMode ? "rgba(212,179,155,0.5)" : "var(--color-border)"}`,
        color: elderMode ? "var(--color-accent)" : "var(--color-text-muted)",
      }}
    >
      <Type className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{elderMode ? "Large text on" : "Large text"}</span>
    </button>
  );
}

export function ElderModeWrapper({ children }: { children: ReactNode }) {
  const { elderMode } = useElderMode();
  return (
    <div
      className={elderMode
        ? "[&_p]:!text-lg [&_p]:!leading-9 [&_h1]:!text-5xl [&_h2]:!text-4xl [&_h3]:!text-3xl [&_.text-sm]:!text-base [&_.text-xs]:!text-sm"
        : ""
      }
    >
      {children}
    </div>
  );
}
