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
    },
  },
  // Copy public files (manifest, sw.js, icons) to dist
  publicDir: "public",
});
