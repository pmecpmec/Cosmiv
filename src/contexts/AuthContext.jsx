import { createContext, useContext, useState, useEffect } from 'react'

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
      const formData = new FormData()
      formData.append('username_or_email', usernameOrEmail)
      formData.append('password', password)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Login failed' }))
        throw new Error(error.detail || 'Login failed')
      }

      const data = await response.json()
      
      // Store token and user
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('auth_refresh_token', data.refresh_token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      setToken(data.access_token)
      setUser(data.user)
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (username, email, password) => {
    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('email', email)
      formData.append('password', password)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Registration failed' }))
        throw new Error(error.detail || 'Registration failed')
      }

      const data = await response.json()
      
      // Store token and user
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('auth_refresh_token', data.refresh_token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      setToken(data.access_token)
      setUser(data.user)
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
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

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        logout()
        return null
      }

      const data = await response.json()
      localStorage.setItem('auth_token', data.access_token)
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

