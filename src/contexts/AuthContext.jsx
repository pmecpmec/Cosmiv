import { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '../utils/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      // Add timeout to prevent hanging if API is unavailable
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )
      
      const response = await Promise.race([
        apiClient.get('/auth/me'),
        timeoutPromise
      ])
      
      if (response?.data) {
        setUser(response.data)
      }
    } catch (error) {
      // Silently fail - user can still use the app without auth
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      // Validate inputs before sending
      if (!email || !email.trim()) {
        return { success: false, error: 'Email is required' }
      }
      if (!password || !password.trim()) {
        return { success: false, error: 'Password is required' }
      }
      
      const response = await apiClient.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password: password 
      })
      const { access_token, user_id } = response.data
      localStorage.setItem('token', access_token)
      
      // Fetch user data
      const userResponse = await apiClient.get('/auth/me')
      setUser(userResponse.data)
      
      return { success: true }
    } catch (error) {
      // Handle validation errors (array format) or simple error messages
      let errorMessage = 'Login failed'
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        if (Array.isArray(detail)) {
          // FastAPI validation errors are arrays with {type, loc, msg, input}
          errorMessage = detail.map(err => {
            const field = Array.isArray(err.loc) ? err.loc.slice(1).join('.') : 'field'
            return `${field}: ${err.msg || err.message || 'Invalid value'}`
          }).join(', ')
        } else if (typeof detail === 'string') {
          errorMessage = detail
        } else if (detail.message) {
          errorMessage = detail.message
        } else {
          errorMessage = 'Validation error'
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      console.error('Login error:', error.response?.status, error.response?.data || error.message)
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const register = async (email, password, username) => {
    try {
      if (password.length < 8) {
        return { 
          success: false, 
          error: 'Password must be at least 8 characters' 
        }
      }

      // Validate inputs before sending
      if (!email || !email.trim()) {
        return { success: false, error: 'Email is required' }
      }
      if (!password || !password.trim()) {
        return { success: false, error: 'Password is required' }
      }
      
      const response = await apiClient.post('/auth/register', { 
        email: email.trim().toLowerCase(), 
        password: password,
        username: username?.trim() || undefined
      })
      const { access_token, user_id } = response.data
      localStorage.setItem('token', access_token)
      
      // Fetch user data
      const userResponse = await apiClient.get('/auth/me')
      setUser(userResponse.data)
      
      return { success: true }
    } catch (error) {
      // Handle validation errors (array format) or simple error messages
      let errorMessage = 'Registration failed'
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        if (Array.isArray(detail)) {
          // FastAPI validation errors are arrays with {type, loc, msg, input}
          errorMessage = detail.map(err => {
            const field = Array.isArray(err.loc) ? err.loc.slice(1).join('.') : 'field'
            return `${field}: ${err.msg || err.message || 'Invalid value'}`
          }).join(', ')
        } else if (typeof detail === 'string') {
          errorMessage = detail
        } else if (detail.message) {
          errorMessage = detail.message
        } else {
          errorMessage = 'Validation error'
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      console.error('Registration error:', error.response?.status, error.response?.data || error.message)
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
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
