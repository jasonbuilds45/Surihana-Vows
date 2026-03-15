"use client";

/**
 * MagneticButton — button that magnetically follows the cursor.
 * Used for primary CTAs throughout the platform.
 */

import { type ReactNode, useRef } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  strength?: number;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function MagneticButton({
  children,
  className = "",
  style,
  strength = 0.35,
  href,
  onClick,
  type = "button",
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    if (inner.current) inner.current.style.transform = `translate(${dx * 0.4}px, ${dy * 0.4}px)`;

    // Ripple highlight
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
    el.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
    if (inner.current) {
      inner.current.style.transform = "translate(0, 0)";
      inner.current.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
    }
  }

  function handleEnter() {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.15s ease";
    if (inner.current) inner.current.style.transition = "transform 0.15s ease";
  }

  const commonProps = {
    ref: ref as React.Ref<any>,
    className: `btn-magnetic ${className}`,
    style: { willChange: "transform", ...style },
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    onMouseEnter: handleEnter,
  };

  const content = <span ref={inner} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{children}</span>;

  if (href) {
    return (
      <a {...commonProps} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button {...commonProps} type={type} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}
