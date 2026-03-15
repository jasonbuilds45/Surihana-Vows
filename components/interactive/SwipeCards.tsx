"use client";

/**
 * SwipeCards — a horizontal swipeable card stack.
 * Used for story beats, events, features — feels like Tinder cards or an Apple TV carousel.
 * Touch + mouse drag supported.
 */

import { type ReactNode, useRef, useState } from "react";

interface SwipeCardsProps<T> {
  items: T[];
  renderCard: (item: T, index: number, isActive: boolean) => ReactNode;
  className?: string;
}

export function SwipeCards<T>({ items, renderCard, className = "" }: SwipeCardsProps<T>) {
  const [current, setCurrent] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  function handlePointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    setDragX(e.clientX - startX.current);
  }

  function handlePointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX < -60 && current < items.length - 1) {
      setCurrent((c) => c + 1);
    } else if (dragX > 60 && current > 0) {
      setCurrent((c) => c - 1);
    }
    setDragX(0);
  }

  const visibleItems = items.slice(0, Math.min(current + 3, items.length));

  return (
    <div className={`relative select-none ${className}`} style={{ userSelect: "none" }}>
      {/* Card stack */}
      <div
        className="relative"
        style={{ height: "100%", touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {visibleItems.map((item, i) => {
          const stackIndex = i - current;
          if (stackIndex < 0 || stackIndex > 2) return null;

          const isTop = stackIndex === 0;
          const offset = stackIndex * 12;
          const scale = 1 - stackIndex * 0.05;
          const opacity = 1 - stackIndex * 0.25;

          const translateX = isTop ? dragX : 0;
          const rotate = isTop ? (dragX / 20) : 0;

          return (
            <div
              key={i}
              style={{
                position: stackIndex === 0 ? "relative" : "absolute",
                top: stackIndex === 0 ? undefined : `${offset}px`,
                left: stackIndex === 0 ? undefined : "0",
                right: stackIndex === 0 ? undefined : "0",
                width: "100%",
                transform: `translateX(${translateX}px) rotate(${rotate}deg) scale(${scale})`,
                opacity,
                zIndex: 10 - stackIndex,
                transition: isDragging && isTop ? "none" : "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
                cursor: isTop ? "grab" : "default",
                willChange: "transform",
              }}
            >
              {renderCard(item, i, isTop)}
            </div>
          );
        })}
      </div>

      {/* Navigation dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setCurrent(i); setDragX(0); }}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 28 : 7,
              height: 7,
              background: i === current
                ? "var(--color-accent)"
                : i < current
                  ? "var(--color-champagne-deep)"
                  : "var(--color-border-medium)",
            }}
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>

      {/* Arrow controls */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none"
        style={{ top: 0, bottom: "3rem" }}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); if (current > 0) setCurrent((c) => c - 1); }}
          className="pointer-events-auto rounded-full flex items-center justify-center transition-all"
          style={{
            width: 40, height: 40,
            background: "rgba(255,255,255,0.92)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
            opacity: current > 0 ? 1 : 0.3,
            marginLeft: -20,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); if (current < items.length - 1) setCurrent((c) => c + 1); }}
          className="pointer-events-auto rounded-full flex items-center justify-center transition-all"
          style={{
            width: 40, height: 40,
            background: "rgba(255,255,255,0.92)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
            opacity: current < items.length - 1 ? 1 : 0.3,
            marginRight: -20,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
