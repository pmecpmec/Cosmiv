/**
 * API Configuration
 * Supports different base URLs for development, GitHub Pages, and production
 */
const getApiBaseUrl = () => {
  // Check for explicit API URL in environment variable (for GitHub Pages/production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In development, use relative paths (proxy via Vite)
  if (import.meta.env.DEV) {
    return "";
  }

  // For GitHub Pages, default to a placeholder (should be set via env var)
  // In production, this should point to your deployed backend
  return import.meta.env.VITE_API_BASE_URL || "https://your-backend-api.com";
};

export const API_BASE_URL = getApiBaseUrl();

export const apiUrl = (path) => {
  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If API_BASE_URL is empty (dev mode), return relative path
  if (!API_BASE_URL || API_BASE_URL === "") {
    return `/api${cleanPath}`;
  }

  // Otherwise, prepend API base URL
  return `${API_BASE_URL}${cleanPath}`;
};
