import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "diario-bg": "#0A0A0A",
        "diario-surface": "#111111",
        "diario-card": "#161616",
        "diario-border": "#222222",
        "diario-accent": "#00E5FF",
        "diario-accent-dim": "#00B8CC",
        "diario-text": "#F0F0F0",
        "diario-muted": "#666666",
        "diario-subtle": "#333333",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      letterSpacing: {
        "editorial": "-0.02em",
        "wide-sm": "0.08em",
      },
    },
  },
  plugins: [],
};

export default config;
