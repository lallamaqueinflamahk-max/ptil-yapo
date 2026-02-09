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
      },
      minHeight: {
        "btn-touch": "56px",
      },
    },
  },
  plugins: [],
};
export default config;
