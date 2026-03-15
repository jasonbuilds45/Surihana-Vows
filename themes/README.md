# Surihana Vows — Theme System

Three production-ready palettes for the platform. Every wedding gets one.

---

## Available themes

| Folder | Name | Feel | Best for |
|---|---|---|---|
| `warm/` | **Warm** | Parchment, bronze, golden-hour | Default — Indian destination weddings, Rajasthan, jewel-toned events |
| `minimal/` | **Minimal** | Ivory, charcoal, cool white | Modern European, garden, courthouse weddings |
| `jewel/` | **Jewel** | Midnight indigo, marigold gold | Lavish night events, dark-mode bridal, high-contrast luxury |

---

## How it works

Each `theme.css` file defines a complete set of CSS custom properties scoped to a `[data-theme="<name>"]` attribute selector. The `warm` theme also targets `:root` so it applies without any attribute being set.

Every component in the codebase uses `var(--color-*)`, `var(--shadow-*)`, and `var(--gradient-hero)` rather than hardcoded values. Switching themes is therefore a single attribute change — no JSX edits required.

---

## Activating a theme

### Step 1 — Import the theme CSS

In `app/globals.css`, import the desired theme file:

```css
/* Default — already present */
@import "../themes/warm/theme.css";

/* Or replace with: */
@import "../themes/minimal/theme.css";
/* @import "../themes/jewel/theme.css"; */
```

### Step 2 — Set the `data-theme` attribute on `<html>`

In `app/layout.tsx`:

```tsx
<html lang="en" data-theme="minimal" className={`${displayFont.variable} ${bodyFont.variable}`}>
```

Valid values: `"warm"` | `"minimal"` | `"jewel"`

---

## Using theme tokens in components

### Via Tailwind utility classes (preferred)

```tsx
// Backgrounds
<div className="bg-theme-bg">          {/* var(--color-background) */}
<div className="bg-theme-surface">     {/* var(--color-surface)    */}

// Text
<p className="text-theme-primary">     {/* var(--color-text-primary)   */}
<p className="text-theme-secondary">   {/* var(--color-text-secondary) */}
<p className="text-theme-accent">      {/* var(--color-accent)         */}

// Borders
<div className="border-theme">         {/* var(--color-border)      */}
<div className="border-theme-accent">  {/* var(--color-accent)      */}

// Shadows
<div className="shadow-theme-soft">    {/* var(--shadow-soft) */}
<div className="shadow-theme-card">    {/* var(--shadow-card) */}
```

### Via CSS custom properties directly (for inline styles or non-Tailwind code)

```tsx
<div style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}>
```

### Via Tailwind arbitrary values (one-off cases)

```tsx
<div className="bg-[var(--color-surface-muted)]">
```

---

## CSS custom property reference

| Property | Warm default | Purpose |
|---|---|---|
| `--color-background` | `#f8f1e7` | Page background |
| `--color-surface` | `#fffaf5` | Card / panel backgrounds |
| `--color-surface-muted` | `#f0e8dc` | Subtle card variation |
| `--color-border` | `rgba(255,255,255,0.6)` | Card / divider borders |
| `--color-accent` | `#8a5a44` | Buttons, links, highlights |
| `--color-accent-soft` | `#d4b39b` | Decorative accents, dividers |
| `--color-accent-hover` | `#744834` | Hover states on accent elements |
| `--color-text-primary` | `#1c1917` | Body text, headings |
| `--color-text-secondary` | `#57534e` | Supporting text |
| `--color-text-muted` | `#a8a29e` | Timestamps, labels, hints |
| `--color-text-inverse` | `#ffffff` | Text on dark / accent backgrounds |
| `--gradient-hero` | warm radial | Full-bleed hero background |
| `--shadow-soft` | `0 24px 80px rgba(73,45,34,0.08)` | Card resting shadow |
| `--shadow-card` | `0 24px 80px rgba(73,45,34,0.16)` | Card elevated shadow |

---

## Adding a new theme

1. Create `themes/<name>/theme.css`
2. Define every property from the table above inside `[data-theme="<name>"] { ... }`
3. Import it in `app/globals.css`
4. Set `data-theme="<name>"` on `<html>`
5. Add a body override if needed (see `[data-theme="jewel"] body` in `styles/globals.css` for the dark-theme pattern)
