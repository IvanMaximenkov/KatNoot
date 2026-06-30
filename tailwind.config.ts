import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "rgb(var(--app-bg) / <alpha-value>)",
          text: "rgb(var(--app-text) / <alpha-value>)",
          muted: "rgb(var(--app-muted) / <alpha-value>)",
          card: "rgb(var(--app-card) / <alpha-value>)",
          stroke: "rgb(var(--app-stroke) / <alpha-value>)",
          accent: "rgb(var(--app-accent) / <alpha-value>)",
          accentText: "rgb(var(--app-accent-text) / <alpha-value>)"
        }
      },
      boxShadow: {
        soft: "0 16px 40px rgb(15 23 42 / 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
