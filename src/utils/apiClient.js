/**
 * Centralized API Client
 * Handles all API requests with authentication, error handling, and retry logic
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

// Helper to get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('auth_token')
}

// Helper to check if token is expired (simple check)
function isTokenExpired(token) {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= exp
  } catch {
    return true // Assume expired if we can't parse
  }
}

// Refresh token if needed
async function refreshToken() {
  const refreshToken = localStorage.getItem('auth_refresh_token')
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  try {
    const formData = new FormData()
    formData.append('refresh_token', refreshToken)

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    localStorage.setItem('auth_token', data.access_token)
    
    if (data.refresh_token) {
      localStorage.setItem('auth_refresh_token', data.refresh_token)
    }

    return data.access_token
  } catch (error) {
    // Clear tokens on refresh failure
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_user')
    throw error
  }
}

/**
 * Main API client function
 * @param {string} endpoint - API endpoint (e.g., '/api/v2/jobs')
 * @param {object} options - Fetch options
 * @param {boolean} options.requireAuth - Require authentication (default: true)
 * @param {number} options.retries - Number of retries on failure (default: 1)
 * @param {boolean} options.retryOn401 - Retry on 401 after token refresh (default: true)
 * @param {string} options.redirect - Redirect mode ('follow' | 'manual' | 'error')
 */
async function apiClient(endpoint, options = {}) {
  const {
    requireAuth = true,
    retries = 1,
    retryOn401 = true,
    ...fetchOptions
  } = options

  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = API_BASE_URL ? `${API_BASE_URL}${cleanEndpoint}` : cleanEndpoint

  // Get auth token if needed
  let token = requireAuth ? getAuthToken() : null

  // Check if token needs refresh
  if (token && isTokenExpired(token) && retryOn401) {
    try {
      token = await refreshToken()
    } catch (error) {
      // If refresh fails, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
      throw new Error('Session expired. Please login again.')
    }
  }

  // Prepare headers
  const headers = {
    ...fetchOptions.headers,
  }

  // Add auth header if needed
  if (requireAuth && token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Add Content-Type for JSON if body is object/string
  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    if (typeof fetchOptions.body === 'object') {
      headers['Content-Type'] = 'application/json'
      fetchOptions.body = JSON.stringify(fetchOptions.body)
    }
  }
  
  // If headers explicitly set Content-Type, respect it (for FormData handling)
  if (fetchOptions.headers && 'Content-Type' in fetchOptions.headers) {
    if (fetchOptions.headers['Content-Type'] === null || fetchOptions.headers['Content-Type'] === '') {
      delete headers['Content-Type']
    }
  }

  let lastError = null

  // Retry logic
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      // Handle 401 - try to refresh token once
      if (response.status === 401 && retryOn401 && requireAuth && attempt === 0) {
        try {
          const newToken = await refreshToken()
          headers['Authorization'] = `Bearer ${newToken}`
          // Retry the request with new token
          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers,
          })
          return await handleResponse(retryResponse, endpoint)
        } catch (refreshError) {
          // Clear auth and redirect
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_refresh_token')
          localStorage.removeItem('auth_user')
          throw new Error('Authentication failed. Please login again.')
        }
      }

      return await handleResponse(response, endpoint)
    } catch (error) {
      lastError = error
      
      // Don't retry on client errors (4xx) except 401
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 401) {
        throw error
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  throw lastError || new Error('Request failed after retries')
}

/**
 * Handle API response
 */
async function handleResponse(response, endpoint) {
  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null
  }

  // Parse JSON response
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json()
    
    if (!response.ok) {
      const error = new Error(data.detail || data.message || data.error || 'Request failed')
      error.status = response.status
      error.data = data
      throw error
    }
    
    return data
  }

  // Handle blob responses (e.g., file downloads)
  if (contentType && (contentType.includes('video') || contentType.includes('application/octet-stream'))) {
    if (!response.ok) {
      const error = new Error('Download failed')
      error.status = response.status
      throw error
    }
    return response.blob()
  }

  // Handle text responses
  const text = await response.text()
  if (!response.ok) {
    const error = new Error(text || 'Request failed')
    error.status = response.status
    throw error
  }

  return text
}

/**
 * Convenience methods
 */
export const api = {
  get: (endpoint, options = {}) =>
    apiClient(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, data = null, options = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    }),

  put: (endpoint, data = null, options = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'PUT',
      body: data,
    }),

  patch: (endpoint, data = null, options = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'PATCH',
      body: data,
    }),

  delete: (endpoint, options = {}) =>
    apiClient(endpoint, { ...options, method: 'DELETE' }),

  // Raw client for special cases (e.g., file uploads with progress)
  raw: apiClient,
}

export default api

