import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          coral: "#FF7A59",
          peach: "#FFB199",
          teal: "#00C2A8",
          sky: "#38BDF8",
          violet: "#8B5CF6",
          sunny: "#FFC542",
          ink: "#23223B",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(35, 34, 59, 0.25)",
        glow: "0 8px 24px -6px rgba(255, 122, 89, 0.45)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
