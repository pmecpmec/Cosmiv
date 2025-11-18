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

      const response = await apiClient.get('/auth/me')
      if (response.data) {
        setUser(response.data)
      }
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password })
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
          // FastAPI validation errors are arrays
          errorMessage = detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ')
        } else if (typeof detail === 'string') {
          errorMessage = detail
        } else if (detail.message) {
          errorMessage = detail.message
        } else {
          errorMessage = JSON.stringify(detail)
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
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

      const response = await apiClient.post('/auth/register', { 
        email, 
        password, 
        username 
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
          // FastAPI validation errors are arrays
          errorMessage = detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ')
        } else if (typeof detail === 'string') {
          errorMessage = detail
        } else if (detail.message) {
          errorMessage = detail.message
        } else {
          errorMessage = JSON.stringify(detail)
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
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
