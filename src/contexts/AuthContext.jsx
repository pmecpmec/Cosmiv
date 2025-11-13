import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse stored user', e)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (usernameOrEmail, password) => {
    try {
      if (!usernameOrEmail || !password) {
        return { success: false, error: 'Username/email and password are required' }
      }

      const formData = new FormData()
      formData.append('username_or_email', usernameOrEmail.trim())
      formData.append('password', password)

      console.log('Attempting login for:', usernameOrEmail)

      // Use api client for better error handling
      const data = await api.post('/api/auth/login', formData, {
        requireAuth: false,
        headers: {}, // Don't set Content-Type for FormData
      })
      
      console.log('Login response received:', { hasToken: !!data.access_token, hasUser: !!data.user })
      
      if (!data.access_token) {
        return { success: false, error: 'No access token received from server' }
      }
      
      // Store token and user
      localStorage.setItem('auth_token', data.access_token)
      if (data.refresh_token) {
        localStorage.setItem('auth_refresh_token', data.refresh_token)
      }
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user))
        setUser(data.user)
      }
      
      setToken(data.access_token)
      
      return { success: true }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        stack: error.stack
      })
      
      // Provide more specific error messages
      let errorMessage = 'Login failed'
      if (error.status === 401) {
        errorMessage = 'Invalid username/email or password'
      } else if (error.status === 404) {
        errorMessage = 'Login endpoint not found. Is the backend running?'
      } else if (error.status === 0 || error.message?.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.'
      } else if (error.data?.detail) {
        errorMessage = error.data.detail
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const register = async (username, email, password) => {
    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('email', email)
      formData.append('password', password)

      // Use api client for better error handling
      const data = await api.post('/api/auth/register', formData, {
        requireAuth: false,
        headers: {}, // Don't set Content-Type for FormData
      })
      
      // Store token and user
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('auth_refresh_token', data.refresh_token)
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user))
        setUser(data.user)
      }
      
      setToken(data.access_token)
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('auth_refresh_token')
    if (!refreshToken) {
      logout()
      return null
    }

    try {
      const formData = new FormData()
      formData.append('refresh_token', refreshToken)

      const data = await api.post('/api/auth/refresh', formData, {
        requireAuth: false,
        headers: {},
      })

      localStorage.setItem('auth_token', data.access_token)
      if (data.refresh_token) {
        localStorage.setItem('auth_refresh_token', data.refresh_token)
      }
      setToken(data.access_token)
      return data.access_token
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return null
    }
  }

  // Get auth headers for API requests
  const getAuthHeaders = () => {
    if (!token) return {}
    return {
      'Authorization': `Bearer ${token}`,
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshAccessToken,
    getAuthHeaders,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.is_admin || false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

