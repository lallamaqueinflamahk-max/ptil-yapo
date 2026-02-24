/**
 * SENTINEL360 — Tailwind CSS config
 * Fuente de verdad: app/design-tokens.css (--sentinel-*).
 * Listo para producción: colores semánticos, tipografía, spacing, sombras, animaciones.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ─── Colores semánticos (Design System: un color = un significado) ─── */
      colors: {
        semantic: {
          control: "var(--sentinel-color-control)",
          "control-hover": "var(--sentinel-color-control-hover)",
          "control-on": "var(--sentinel-color-control-on)",
          success: "var(--sentinel-color-success)",
          "success-bg": "var(--sentinel-color-success-bg)",
          "success-border": "var(--sentinel-color-success-border)",
          "success-on": "var(--sentinel-color-success-on)",
          warning: "var(--sentinel-color-warning)",
          "warning-bg": "var(--sentinel-color-warning-bg)",
          "warning-border": "var(--sentinel-color-warning-border)",
          "warning-on": "var(--sentinel-color-warning-on)",
          danger: "var(--sentinel-color-danger)",
          "danger-bg": "var(--sentinel-color-danger-bg)",
          "danger-border": "var(--sentinel-color-danger-border)",
          "danger-on": "var(--sentinel-color-danger-on)",
          neutral: "var(--sentinel-color-neutral)",
          "neutral-bg": "var(--sentinel-color-neutral-bg)",
          "neutral-border": "var(--sentinel-color-neutral-border)",
          "neutral-on": "var(--sentinel-color-neutral-on)",
        },
        /* Base UI: superficies, texto, bordes */
        surface: {
          DEFAULT: "var(--sentinel-color-surface)",
          alt: "var(--sentinel-color-surface-alt)",
        },
        sentinel: {
          "text-primary": "var(--sentinel-color-text-primary)",
          "text-secondary": "var(--sentinel-color-text-secondary)",
          "text-muted": "var(--sentinel-color-text-muted)",
          border: "var(--sentinel-color-border)",
          "border-strong": "var(--sentinel-color-border-strong)",
        },
        /* Brand (compatibilidad) */
        yapo: {
          white: "#FFFFFF",
          blue: "#1E3A8A",
          "blue-light": "#3B82F6",
          orange: "#F59E0B",
          "orange-light": "#FBBF24",
          gray: "#F3F4F6",
          "gray-dark": "#E5E7EB",
        },
      },

      /* ─── Tipografía ─── */
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        sentinel: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "sentinel-xs": ["var(--sentinel-font-size-xs)", { lineHeight: "var(--sentinel-line-height-normal)" }],
        "sentinel-sm": ["var(--sentinel-font-size-sm)", { lineHeight: "var(--sentinel-line-height-normal)" }],
        "sentinel-base": ["var(--sentinel-font-size-base)", { lineHeight: "var(--sentinel-line-height-normal)" }],
        "sentinel-lg": ["var(--sentinel-font-size-lg)", { lineHeight: "var(--sentinel-line-height-tight)" }],
        "sentinel-xl": ["var(--sentinel-font-size-xl)", { lineHeight: "var(--sentinel-line-height-tight)" }],
        "sentinel-2xl": ["var(--sentinel-font-size-2xl)", { lineHeight: "var(--sentinel-line-height-tight)" }],
        "sentinel-3xl": ["var(--sentinel-font-size-3xl)", { lineHeight: "var(--sentinel-line-height-tight)" }],
      },
      fontWeight: {
        normal: "var(--sentinel-font-weight-normal)",
        medium: "var(--sentinel-font-weight-medium)",
        semibold: "var(--sentinel-font-weight-semibold)",
        bold: "var(--sentinel-font-weight-bold)",
      },

      /* ─── Spacing (escala 4px, design tokens) ─── */
      spacing: {
        sentinel: {
          0: "var(--sentinel-space-0)",
          1: "var(--sentinel-space-1)",
          2: "var(--sentinel-space-2)",
          3: "var(--sentinel-space-3)",
          4: "var(--sentinel-space-4)",
          5: "var(--sentinel-space-5)",
          6: "var(--sentinel-space-6)",
          8: "var(--sentinel-space-8)",
          10: "var(--sentinel-space-10)",
          12: "var(--sentinel-space-12)",
        },
        "layout-mobile": "var(--sentinel-layout-padding-mobile)",
        "layout-desktop": "var(--sentinel-layout-padding-desktop)",
      },
      maxWidth: {
        "sentinel-container": "var(--sentinel-layout-max-width)",
      },

      /* ─── Border radius ─── */
      borderRadius: {
        sentinel: {
          none: "var(--sentinel-radius-none)",
          sm: "var(--sentinel-radius-sm)",
          md: "var(--sentinel-radius-md)",
          lg: "var(--sentinel-radius-lg)",
          xl: "var(--sentinel-radius-xl)",
          "2xl": "var(--sentinel-radius-2xl)",
          full: "var(--sentinel-radius-full)",
        },
      },

      /* ─── Sombras ─── */
      boxShadow: {
        card: "var(--sentinel-shadow-card)",
        "card-hover": "var(--sentinel-shadow-card-hover)",
        "card-active": "var(--sentinel-shadow-card-active)",
        button: "var(--sentinel-shadow-button)",
        "button-hover": "var(--sentinel-shadow-button-hover)",
        "focus-ring": "var(--sentinel-shadow-focus)",
      },

      /* ─── Transiciones y duraciones ─── */
      transitionDuration: {
        instant: "var(--sentinel-state-duration-instant)",
        fast: "var(--sentinel-state-duration-fast)",
        dashboard: "var(--sentinel-state-duration-normal)",
        normal: "var(--sentinel-state-duration-normal)",
        slow: "var(--sentinel-state-duration-slow)",
      },
      transitionTimingFunction: {
        "sentinel-out": "var(--sentinel-state-ease-out)",
        "sentinel-in-out": "var(--sentinel-state-ease-in-out)",
      },

      /* ─── Animaciones (KPI en vivo, anillo, etc.) ─── */
      keyframes: {
        "kpi-glow-pulse": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.95", filter: "brightness(1.08)" },
        },
        "kpi-ring-draw": {
          from: { strokeDasharray: "0 100" },
        },
        "logo-heartbeat": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        "kpi-glow-pulse": "kpi-glow-pulse 2.5s ease-in-out infinite",
        "kpi-live-dot": "kpi-glow-pulse 1.2s ease-in-out infinite",
        "logo-heartbeat": "logo-heartbeat 1.5s ease-in-out infinite",
      },

      /* Utilidades de producción ─── */
      minHeight: {
        "btn-touch": "56px",
      },
      ringWidth: {
        focus: "var(--sentinel-state-focus-ring-width)",
      },
      ringColor: {
        focus: "var(--sentinel-state-focus-ring-color)",
      },
      opacity: {
        disabled: "var(--sentinel-state-disabled-opacity)",
        loading: "var(--sentinel-state-loading-opacity)",
      },
      scale: {
        "hover-sentinel": "var(--sentinel-state-hover-scale)",
        "active-sentinel": "var(--sentinel-state-active-scale)",
      },
    },
  },
  plugins: [],
};
