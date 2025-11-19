import axios from "axios";

// Use direct backend URL - backend CORS is configured for localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000, // 5 second timeout
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on network errors (API unavailable)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Only redirect if we're not already on login page
      if (window.location.pathname !== '/login' && !window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    }
    // For network errors or timeouts, don't block the app
    return Promise.reject(error);
  }
);

export { apiClient };
