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
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #1E3A8A 50%, #00FFFF 100%)',
        'space-gradient': 'linear-gradient(to bottom, #0A0A1A 0%, #1A0A2E 50%, #0A1A2A 100%)',
      },
    },
  },
  plugins: [],
};
