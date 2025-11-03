import { useState, useEffect, Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import CosmicBackground from './components/CosmicBackground'
import Login from './components/Login'
import Register from './components/Register'
import Header from './components/Header'
import LoadingScreen from './components/LoadingScreen'
import OfflineIndicator from './components/OfflineIndicator'
import UpdateNotification from './components/UpdateNotification'
import { InlineLoader } from './components/ui/LoadingOverlay'
import ScrollProgress from './components/ScrollProgress'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'

// Lazy load heavy components to reduce initial bundle size
const UploadForm = lazy(() => import('./components/UploadForm'))
const Dashboard = lazy(() => import('./components/Dashboard'))
const Analytics = lazy(() => import('./components/Analytics'))
const Accounts = lazy(() => import('./components/Accounts'))
const Billing = lazy(() => import('./components/Billing'))
const Social = lazy(() => import('./components/Social'))
const LandingPage = lazy(() => import('./components/LandingPage'))
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const WeeklyMontages = lazy(() => import('./components/WeeklyMontages'))
const AIChatbot = lazy(() => import('./components/AIChatbot'))
const Feed = lazy(() => import('./components/Feed'))
const Communities = lazy(() => import('./components/Communities'))
const AIAdminPanel = lazy(() => import('./components/AIAdminPanel'))

function AppContent() {
  const [activeTab, setActiveTab] = useState("home")
  const [authMode, setAuthMode] = useState("login") // "login" or "register"
  const [showLoading, setShowLoading] = useState(true)
  const { user, loading, logout, isAuthenticated } = useAuth()

  // Show loading screen initially
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 2000) // Show for 2 seconds
    return () => clearTimeout(timer)
  }, [])

  // Show loading screen
  if (showLoading) {
    return <LoadingScreen />
  }

  // Show auth pages if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-pure-black flex items-center justify-center">
        <div className="text-pure-white text-xl font-black tracking-wide">L O A D I N G . . .</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-pure-black flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black gradient-text-cosmic mb-6 tracking-poppr chromatic-aberration">
              🌌   C O S M I V
            </h1>
            <p className="text-xl text-pure-white/70 font-bold tracking-wide">
              A I - P O W E R E D   G A M I N G   M O N T A G E   P L A T F O R M
            </p>
          </div>
          {authMode === "login" ? (
            <Login onSwitchToRegister={() => setAuthMode("register")} />
          ) : (
            <Register onSwitchToLogin={() => setAuthMode("login")} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-pure-black text-pure-white">
      <ScrollProgress />
      <CosmicBackground />
      {/* Fixed Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* PWA Indicators */}
      <OfflineIndicator />
      <UpdateNotification />

      {/* Main Content */}
      <div className="pt-16">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Suspense fallback={<InlineLoader message="Loading..." />}>
                <LandingPage onGetStarted={() => setActiveTab("upload")} />
              </Suspense>
            </motion.div>
          )}
          {activeTab === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 py-16"
            >
              <div className="max-w-3xl mx-auto">
                <Suspense fallback={<InlineLoader message="Loading upload form..." />}>
                  <UploadForm />
                </Suspense>
              </div>
            </motion.div>
          )}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 py-16"
            >
              <Suspense fallback={<InlineLoader message="Loading dashboard..." />}>
                <Dashboard />
              </Suspense>
            </motion.div>
          )}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 py-16"
            >
              <Suspense fallback={<InlineLoader message="Loading analytics..." />}>
                <Analytics />
              </Suspense>
            </motion.div>
          )}
          {activeTab === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Suspense fallback={<InlineLoader message="Loading feed..." />}>
                <Feed />
              </Suspense>
            </motion.div>
          )}
          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 py-16"
            >
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">🤖 AI Assistant</h2>
                  <p className="text-gray-300">Ask me anything about Cosmiv, get help, or chat!</p>
                </div>
                <div className="h-[600px]">
                  <Suspense fallback={<InlineLoader message="Loading AI assistant..." />}>
                    <AIChatbot />
                  </Suspense>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === "communities" && (
            <motion.div
              key="communities"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pt-16"
            >
              <Suspense fallback={<InlineLoader message="Loading communities..." />}>
                <Communities />
              </Suspense>
            </motion.div>
          )}
          {activeTab === "accounts" && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 py-16"
            >
              <Suspense fallback={<InlineLoader message="Loading accounts..." />}>
                <Accounts />
              </Suspense>
            </motion.div>
          )}
          {activeTab === "billing" && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 py-16"
            >
              <Suspense fallback={<InlineLoader message="Loading billing..." />}>
                <Billing />
              </Suspense>
            </motion.div>
          )}
          {activeTab === "social" && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 py-16"
            >
              <Suspense fallback={<InlineLoader message="Loading social..." />}>
                <Social />
              </Suspense>
            </motion.div>
          )}
          {activeTab === "weekly" && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 py-16"
            >
              <Suspense fallback={<InlineLoader message="Loading weekly montages..." />}>
                <WeeklyMontages />
              </Suspense>
            </motion.div>
          )}
          {activeTab === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 py-16"
            >
              <Suspense fallback={<InlineLoader message="Loading admin dashboard..." />}>
                <AdminDashboard />
              </Suspense>
            </motion.div>
          )}
          {activeTab === "ai-admin" && (
            <motion.div
              key="ai-admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 py-16"
            >
              <Suspense fallback={<InlineLoader message="Loading AI admin panel..." />}>
                <AIAdminPanel />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

