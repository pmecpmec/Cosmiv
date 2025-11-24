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
          "Space Grotesk",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        // Display and accent fonts
        display: [
          "Space Grotesk",
          "system-ui",
          "sans-serif",
        ],
      },
      // Premium typography scale - consistent vertical rhythm
      fontSize: {
        // Display sizes for hero headlines
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-xl': ['3.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        // Headline sizes
        'headline-xl': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg': ['1.875rem', { lineHeight: '1.35', letterSpacing: '0', fontWeight: '600' }],
        'headline-md': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'headline-sm': ['1.25rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '600' }],
        // Body text with consistent line height
        'body-lg': ['1.125rem', { lineHeight: '1.75', letterSpacing: '0' }],
        'body-md': ['1rem', { lineHeight: '1.75', letterSpacing: '0' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0' }],
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        black: 900,
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em',
        wider: '0.05em',
      },
      // Strict spacing scale - 8px base unit for consistency
      spacing: {
        // Base scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192
        '0.5': '0.125rem',   // 2px
        '1.5': '0.375rem',   // 6px
        '2.5': '0.625rem',   // 10px
        '3.5': '0.875rem',   // 14px
        '4.5': '1.125rem',   // 18px
        '5.5': '1.375rem',   // 22px
        '6.5': '1.625rem',   // 26px
        '7.5': '1.875rem',   // 30px
        'section': '8rem',   // 128px - section spacing
        'hero': '12rem',     // 192px - hero spacing
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
        // Premium micro-animations - subtle and natural
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
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
        // Premium animation utilities
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
