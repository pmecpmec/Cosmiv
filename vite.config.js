import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages (set to repo name if deploying to GitHub Pages)
  // For local dev or custom domain, leave empty
  base:
    process.env.GITHUB_PAGES === "true"
      ? `/${
          process.env.REPO_NAME ||
          process.env.GITHUB_REPOSITORY?.split("/")[1] ||
          "Cosmiv"
        }/`
      : "/",
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    // Ensure service worker is included in build
    rollupOptions: {
      input: {
        main: "./index.html",
      },
      output: {
        // Manual chunk splitting for better caching and smaller initial bundle
        manualChunks: (id) => {
          // Vendor chunks - React must be first
          if (id.includes('node_modules')) {
            // React and React-DOM must be in the same chunk and load first
            if (id.includes('react') || id.includes('react-dom') || id.includes('react/jsx-runtime')) {
              return 'react-vendor'
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion'
            }
            if (id.includes('recharts')) {
              return 'recharts'
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor'
            }
            // Other node_modules
            return 'vendor'
          }
          // Component chunks
          if (id.includes('/components/Dashboard') || id.includes('/components/Analytics')) {
            return 'dashboard'
          }
          if (id.includes('/components/AdminDashboard') || id.includes('/components/AIAdminPanel')) {
            return 'admin'
          }
          if (id.includes('/components/Social') || id.includes('/components/Feed') || id.includes('/components/Communities')) {
            return 'social'
          }
          if (id.includes('/components/Accounts') || id.includes('/components/Billing')) {
            return 'settings'
          }
          if (id.includes('/components/game/')) {
            return 'game'
          }
        },
      },
    },
    // Increase chunk size warning limit since we're code splitting
    chunkSizeWarningLimit: 600,
  },
  // Copy public files (manifest, sw.js, icons) to dist
  publicDir: "public",
});
