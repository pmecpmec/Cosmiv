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
          // Broken Planet colors
          "glitch-pink": "#FF0080",  // Glitch effects, error states
          "hot-pink": "#FF00FF",     // Vibrant highlights, neon glows
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
        // Space-style fonts for cosmic aesthetic
        orbitron: [
          "Orbitron",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        exo: [
          "Exo 2",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        michroma: [
          "Michroma",
          "Orbitron",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        // Hero and display text
        display: [
          "Orbitron",
          "Michroma",
          "Inter",
          "system-ui",
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
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-1deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.5)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'float-cosmic': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'nebula-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'pulse-neon': {
          '0%, 100%': {
            textShadow: '0 0 5px #00FFFF, 0 0 10px #00FFFF, 0 0 15px #00FFFF, 0 0 20px #00FFFF',
          },
          '50%': {
            textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF, 0 0 40px #00FFFF, 0 0 50px #00FFFF',
          },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(0, 255, 255, 0.4)',
          },
        },
        'astronaut-float': {
          '0%, 100%': { transform: 'translate(-50%, -50%) translateY(-10px) rotate(-2deg)' },
          '50%': { transform: 'translate(-50%, -50%) translateY(10px) rotate(2deg)' },
        },
        'glass-shine': {
          '0%, 100%': { opacity: '0.3', transform: 'translateX(-100%) rotate(-45deg)' },
          '50%': { opacity: '0.8', transform: 'translateX(100%) rotate(-45deg)' },
        },
        'reflection-move': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(5px, 5px)' },
        },
        'antenna-blink': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'stars-rotate': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'progress-shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        shimmer: 'shimmer 2s infinite',
        twinkle: 'twinkle 2s ease-in-out infinite',
        'float-cosmic': 'float-cosmic 4s ease-in-out infinite',
        'nebula-shift': 'nebula-shift 10s ease infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'astronaut-float': 'astronaut-float 4s ease-in-out infinite',
        'glass-shine': 'glass-shine 3s ease-in-out infinite',
        'reflection-move': 'reflection-move 4s ease-in-out infinite',
        'antenna-blink': 'antenna-blink 1s ease-in-out infinite',
        'stars-rotate-20': 'stars-rotate 20s linear infinite',
        'stars-rotate-30': 'stars-rotate 30s linear infinite reverse',
        'stars-rotate-40': 'stars-rotate 40s linear infinite',
        'progress-shimmer': 'progress-shimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        cosmic: {
          "primary": "#8B5CF6",        // cosmic-violet
          "secondary": "#00FFFF",      // neon-cyan
          "accent": "#A855F7",         // cosmic-purple
          "neutral": "#1E3A8A",        // deep-blue
          "base-100": "#000000",       // pure-black
          "base-200": "#1a1a1a",       // bw-gray-1
          "base-300": "#2a2a2a",       // bw-gray-2
          "base-content": "#FFFFFF",   // pure-white
          "info": "#00FFFF",           // neon-cyan
          "success": "#00FFFF",        // neon-cyan for success
          "warning": "#EC4899",        // pink accent
          "error": "#FF0080",          // glitch-pink
        },
      },
    ],
    darkTheme: "cosmic",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
};
