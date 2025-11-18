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
  const [showLoading, setShowLoading] = useState(true)
  const { user, loading } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (showLoading || loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-pure-black">
      <CosmicBackground />
      <div className="relative z-10">
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
  const basename = import.meta.env.BASE_URL || '/Cosmiv/'
  
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



