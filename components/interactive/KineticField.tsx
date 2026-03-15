"use client";

/**
 * KineticField — form field with variable-font weight kinetics
 *
 * • Label floats up with spring animation on focus
 * • Text weight increases as user types (500→700 at ~20 chars)
 * • Neumorphic recessed styling — element sits IN the surface
 * • OKLCH rim glow on focus
 * • Character count animates in when near limit
 */

import { type InputHTMLAttributes, type TextareaHTMLAttributes, useId, useRef, useState } from "react";

interface BaseProps {
  label: string;
  maxLength?: number;
  accentColor?: string;
}

interface KineticInputProps extends BaseProps, Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {}
interface KineticTextAreaProps extends BaseProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  rows?: number;
}

function getWeight(value: string, max = 60): number {
  const ratio = Math.min(value.length / max, 1);
  return 400 + Math.round(ratio * 300); // 400 → 700
}

const labelStyle = (focused: boolean, filled: boolean, accent: string): React.CSSProperties => ({
  position: "absolute",
  left: "1.25rem",
  top: focused || filled ? "0.55rem" : "50%",
  transform: focused || filled ? "none" : "translateY(-50%)",
  fontSize: focused || filled ? "0.5rem" : "0.9rem",
  fontWeight: 700,
  letterSpacing: focused || filled ? "0.22em" : "0.04em",
  textTransform: focused || filled ? "uppercase" : "none",
  color: focused ? accent : "var(--c-ink-3)",
  fontFamily: "var(--font-body), sans-serif",
  pointerEvents: "none",
  transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
  zIndex: 2,
});

const fieldContainerStyle: React.CSSProperties = {
  position: "relative",
};

function buildFieldStyle(focused: boolean, accent: string): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    background: "linear-gradient(145deg, oklch(94% 0.012 50) 0%, var(--c-canvas) 100%)",
    border: "none",
    borderRadius: 14,
    padding: "1.5rem 1.25rem 0.6rem",
    color: "var(--c-ink)",
    fontFamily: "var(--font-body), sans-serif",
    fontSize: "0.9375rem",
    lineHeight: 1.5,
    outline: "none",
    /* Neumorphic recessed inset */
    boxShadow: focused
      ? `inset 2px 2px 6px oklch(80% 0.015 50 / 0.30),
         inset -1px -1px 4px oklch(100% 0 0 / 0.55),
         0 0 0 2px ${accent}28,
         0 0 0 1.5px ${accent},
         0 0 20px ${accent}18`
      : `inset 3px 3px 8px oklch(80% 0.015 50 / 0.40),
         inset -2px -2px 6px oklch(100% 0 0 / 0.65),
         0 0 0 1.5px oklch(85% 0.015 40 / 0.20)`,
    transition: "box-shadow 0.25s ease, font-weight 0.5s ease",
    willChange: "box-shadow",
  };
}

export function KineticInput({
  label,
  maxLength,
  accentColor = "var(--c-primary)",
  value = "",
  onChange,
  ...props
}: KineticInputProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const val = String(value);
  const filled = val.length > 0;
  const weight = getWeight(val, 40);

  return (
    <div style={fieldContainerStyle}>
      <label htmlFor={id} style={labelStyle(focused, filled, accentColor)}>{label}</label>
      <input
        {...props}
        id={id}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
        style={{
          ...buildFieldStyle(focused, accentColor),
          fontWeight: weight,
          ...props.style,
        }}
      />
      {maxLength && focused && val.length > maxLength * 0.6 && (
        <span
          style={{
            position: "absolute",
            right: "1rem",
            bottom: "0.6rem",
            fontSize: "0.55rem",
            letterSpacing: "0.12em",
            color: val.length >= maxLength ? "oklch(58% 0.22 25)" : "var(--c-ink-4)",
            fontFamily: "var(--font-body), sans-serif",
            transition: "color 0.2s",
          }}
        >
          {val.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

export function KineticTextArea({
  label,
  maxLength,
  accentColor = "var(--c-primary)",
  rows = 4,
  value = "",
  onChange,
  ...props
}: KineticTextAreaProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const val = String(value);
  const filled = val.length > 0;
  const weight = getWeight(val, 120);

  return (
    <div style={fieldContainerStyle}>
      <label htmlFor={id} style={labelStyle(focused, filled, accentColor)}>{label}</label>
      <textarea
        {...props}
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
        style={{
          ...buildFieldStyle(focused, accentColor),
          fontWeight: weight,
          resize: "none",
          paddingTop: "1.75rem",
          ...props.style,
        }}
      />
      {maxLength && focused && val.length > maxLength * 0.6 && (
        <span
          style={{
            position: "absolute",
            right: "1rem",
            bottom: "0.6rem",
            fontSize: "0.55rem",
            letterSpacing: "0.12em",
            color: val.length >= maxLength ? "oklch(58% 0.22 25)" : "var(--c-ink-4)",
            fontFamily: "var(--font-body), sans-serif",
          }}
        >
          {val.length}/{maxLength}
        </span>
      )}
    </div>
  );
}
