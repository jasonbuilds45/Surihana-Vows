import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./modules/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./themes/**/*.css",
    "./styles/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        /* ── Static wedding palette ───────────────────────────────────── */
        "w-pink":     "#e8376a",
        "w-pink-l":   "#ff6090",
        "w-peony":    "#c2185b",
        "w-peach":    "#fb7185",
        "w-lavender": "#8b5cf6",
        "w-sky":      "#0ea5e9",
        "w-sage":     "#10b981",
        "w-amber":    "#f59e0b",
        "w-coral":    "#f97316",
        "w-gold":     "#fbbf24",
        "w-ink":      "#1a0820",
        "w-white":    "#ffffff",

        /* Legacy compat */
        canvas:      "#ffffff",
        sand:        "#fff5f7",
        ink:         "#1a0820",
        bronze:      "#e8376a",
        rosewood:    "#c2185b",
        champagne:   "#fde68a",
        gold:        "#f59e0b",
        blush:       "#fb7185",
        rose:        "#e8376a",
        sage:        "#10b981",
        plum:        "#8b5cf6",

        /* CSS-variable-driven tokens */
        theme: {
          bg:            "var(--color-background)",
          surface:       "var(--color-surface)",
          muted:         "var(--color-surface-pink)",
          accent:        "var(--color-primary)",
          "accent-soft": "var(--color-peach-light)",
          primary:       "var(--color-text-primary)",
          secondary:     "var(--color-text-secondary)",
          hint:          "var(--color-text-muted)",
          inverse:       "#ffffff",
          border:        "var(--color-border)",
        }
      },

      fontFamily: {
        display: ["var(--font-display)"],
        body:    ["var(--font-body)"],
      },

      boxShadow: {
        soft:           "0 6px 24px rgba(180,50,100,0.11)",
        card:           "0 6px 24px rgba(180,50,100,0.11)",
        "theme-soft":   "var(--shadow-soft)",
        "theme-card":   "var(--shadow-card)",
        "glow-pink":    "0 0 32px rgba(232,55,106,0.28)",
        "glow-lavender":"0 0 32px rgba(139,92,246,0.25)",
        "glow-sage":    "0 0 32px rgba(16,185,129,0.22)",
        "glow-gold":    "0 0 32px rgba(245,158,11,0.28)",
      },

      backgroundImage: {
        "hero-radial": "var(--gradient-hero)",
        "hero-radial-warm": "radial-gradient(circle at top left, #fff0f4, #ffffff 60%)",
        "gradient-wedding": "linear-gradient(135deg, #e8376a 0%, #c2185b 40%, #8b5cf6 100%)",
        "gradient-sunset":  "linear-gradient(135deg, #fb7185 0%, #e8376a 50%, #f59e0b 100%)",
        "gradient-bloom":   "linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8eaf6 100%)",
      },

      animation: {
        "fade-up":    "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":    "fadeIn 0.5s ease both",
        "scale-in":   "scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "float":      "float 6s ease-in-out infinite",
        "heartbeat":  "heartbeat 2s ease-in-out infinite",
        "slide-down": "slideDown 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "marquee":    "marquee 30s linear infinite",
      },
    }
  },
  plugins: []
};

export default config;
