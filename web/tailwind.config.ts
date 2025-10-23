import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-heading)", "var(--font-sans)", "sans-serif"],
      },
      colors: {
        brand: {
          25: "#f4f7ff",
          50: "#e7efff",
          100: "#d1e3ff",
          200: "#a6c4ff",
          300: "#7ea6ff",
          400: "#4d84ff",
          500: "#2563eb",
          600: "#1d4fd7",
          700: "#1e3fa3",
        },
        glass: {
          DEFAULT: "rgba(255,255,255,0.65)",
          strong: "rgba(255,255,255,0.85)",
        },
      },
      boxShadow: {
        card: "0 25px 60px -30px rgba(15, 23, 42, 0.25)",
        nav: "0 20px 45px -25px rgba(15, 23, 42, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
