export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  UPLOAD: {
    UPLOAD: '/upload',
    STATUS: '/upload/status',
    DOWNLOAD: '/upload/download',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    JOBS: '/dashboard/jobs',
  },
}



