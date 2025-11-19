import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingScreen from './components/LoadingScreen'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import UploadForm from './components/UploadForm'
import Login from './components/Login'
import Register from './components/Register'
import CosmicBackground from './components/CosmicBackground'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    // Show loading screen briefly, then always show content
    // Don't wait for auth - show landing page immediately
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 300) // Reduced to 300ms
    return () => clearTimeout(timer)
  }, [])

  // Always show content after brief loading - don't block on auth
  if (showLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-pure-black text-pure-white">
      <CosmicBackground />
      <div className="relative z-10 min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/upload" 
            element={user ? <UploadForm /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register />} 
          />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  // Get base path for GitHub Pages deployment
  // Vite sets BASE_URL during build, or detect from current path
  let basename = import.meta.env.BASE_URL || '/'
  
  // If BASE_URL is not set, try to detect from current location
  if (basename === '/' && typeof window !== 'undefined') {
    const pathParts = window.location.pathname.split('/').filter(p => p)
    if (pathParts.length > 0 && pathParts[0] !== 'index.html') {
      basename = `/${pathParts[0]}/`
    }
  }
  
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('App initializing:', { 
      basename, 
      BASE_URL: import.meta.env.BASE_URL,
      pathname: window.location.pathname 
    })
  }
  
  return (
    <ErrorBoundary>
      <Router
        basename={basename}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App



