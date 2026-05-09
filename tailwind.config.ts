import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#f7f8fa",
        foreground: "#1f2937",
        muted: "#667085",
        "muted-foreground": "#98a2b3",
        border: "#e4e7ec",
        card: "#ffffff",
        "card-foreground": "#1f2937",
        primary: "#2563eb",
        success: "#168255",
        warning: "#b54708",
        danger: "#b42318",
        accent: "#0f766e"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(16, 24, 40, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
