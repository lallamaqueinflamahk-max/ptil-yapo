import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        yapo: {
          white: "#FFFFFF",
          blue: "#1E3A8A",
          "blue-light": "#3B82F6",
          orange: "#F59E0B",
          "orange-light": "#FBBF24",
          gray: "#F3F4F6",
          "gray-dark": "#E5E7EB",
        },
        dash: {
          blue: "#0F172A",
          green: "#047857",
          yellow: "#B45309",
          red: "#B91C1C",
          muted: "#64748B",
        },
        /* Semántico: estado/riesgo/control. Uso: KPIs, mapas, tablas, alertas. */
        semantic: {
          control: "var(--semantic-control)",
          "control-hover": "var(--semantic-control-hover)",
          success: "var(--semantic-success)",
          "success-bg": "var(--semantic-success-bg)",
          "success-border": "var(--semantic-success-border)",
          warning: "var(--semantic-warning)",
          "warning-bg": "var(--semantic-warning-bg)",
          "warning-border": "var(--semantic-warning-border)",
          danger: "var(--semantic-danger)",
          "danger-bg": "var(--semantic-danger-bg)",
          "danger-border": "var(--semantic-danger-border)",
          neutral: "var(--semantic-neutral)",
          "neutral-bg": "var(--semantic-neutral-bg)",
          "neutral-border": "var(--semantic-neutral-border)",
        },
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        "card-active": "0 2px 4px -1px rgb(0 0 0 / 0.06)",
      },
      minHeight: {
        "btn-touch": "56px",
      },
      transitionDuration: {
        "dashboard": "200ms",
      },
    },
  },
  plugins: [],
};
export default config;
