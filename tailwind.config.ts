import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "var(--accent)",
          dark: "var(--primary-strong)",
        },
        primary: {
          DEFAULT: "var(--accent)",
          dark: "var(--primary-strong)",
        },
        secondary: {
          DEFAULT: "var(--text-secondary)",
          dark: "var(--text-primary)",
        },
        background: "var(--background)",
        surface: "var(--surface)",
        surfaceMuted: "var(--surface-muted)",
        surfaceElevated: "var(--surface-elevated)",
        border: "var(--border)",
        text: {
          DEFAULT: "var(--text-primary)",
          muted: "var(--text-secondary)",
        },
        success: "var(--success)",
        danger: {
          DEFAULT: "var(--error)",
          dark: "var(--error)",
        },
        warning: "var(--warning)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Text",
          "-apple-system",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-strong": "var(--shadow-card-strong)",
      },
    },
  },
  plugins: [],
};
export default config;
