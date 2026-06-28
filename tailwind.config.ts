import type { Config } from "tailwindcss";

// Charte « Luxe Discret » LCB BAT.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marine: {
          DEFAULT: "#0B1F3B",
          900: "#0B1F3B",
          800: "#12294B",
          700: "#1B3A66",
          50: "#EEF2F8",
        },
        or: {
          DEFAULT: "#C8A96A",
          dark: "#A98A4B",
          light: "#E2CE9F",
        },
        creme: "#FBF8F2",
      },
      fontFamily: {
        sans: [
          "Noto Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
