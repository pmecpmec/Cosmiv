/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cosmic: {
          violet: "#8B5CF6",      // Primary violet
          "deep-blue": "#1E3A8A",  // Deep blue
          "neon-cyan": "#00FFFF",  // Neon cyan
          purple: "#A855F7",       // Purple accent
          pink: "#EC4899",         // Pink accent
          space: "#0A0A1A",        // Deep space background
        },
        "pure-black": "#000000",
        "pure-white": "#FFFFFF",
        "bw-gray": {
          1: "#1a1a1a",
          2: "#2a2a2a",
          3: "#3a3a3a",
          4: "#4a4a4a",
        },
        purple: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        primary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      fontWeight: {
        black: 900,
      },
      letterSpacing: {
        poppr: "0.1em",
        wide: "0.05em",
        tight: "-0.02em",
      },
      spacing: {
        section: "8rem",
        hero: "12rem",
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #1E3A8A 50%, #00FFFF 100%)',
        'space-gradient': 'linear-gradient(to bottom, #0A0A1A 0%, #1A0A2E 50%, #0A1A2A 100%)',
      },
    },
  },
  plugins: [],
};
