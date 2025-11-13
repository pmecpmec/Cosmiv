import { useState, useEffect, Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import CosmicBackground from './components/CosmicBackground'
import StarfieldBackground from './components/StarfieldBackground'
import BackgroundComets from './components/BackgroundComets'
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
const PublicHomePage = lazy(() => import('./components/PublicHomePage'))

function AppContent() {
  const [activeTab, setActiveTab] = useState("home")
  const [authMode, setAuthMode] = useState("home") // "home", "login", or "register"
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
      <div className="min-h-screen bg-pure-black flex items-center justify-center relative">
        <BackgroundComets />
        <StarfieldBackground starCount={1000} intensity="medium" />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-pure-white text-xl font-black tracking-wide font-display relative z-10"
        >
          L O A D I N G . . .
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Show public home page with Plays of the Week
    return (
      <div className="min-h-screen relative bg-pure-black text-pure-white">
        <BackgroundComets />
        <CosmicBackground />
        <StarfieldBackground starCount={2000} intensity="high" />
        
        {/* Simple Header for Public Page */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-pure-black/80 backdrop-blur-lg border-b border-pure-white/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-2xl font-black gradient-text-cosmic tracking-poppr font-display">
              🌌   C O S M I V
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setAuthMode("login")}
                className="px-6 py-3 bg-pure-white/10 backdrop-blur-lg border-2 border-pure-white/30 hover:border-cosmic-neon-cyan text-pure-white font-black tracking-wide transition-all hover:bg-pure-white/20 text-sm"
              >
                S I G N   I N
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className="px-6 py-3 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white border-2 border-cosmic-neon-cyan/50 font-black tracking-wide transition-all hover:neon-glow-cyan text-sm"
              >
                S I G N   U P
              </button>
            </div>
          </div>
        </div>

        {/* Show Public Home Page or Auth based on authMode */}
        {authMode === "home" || (!authMode || authMode === "") ? (
          <Suspense fallback={<InlineLoader message="Loading..." />}>
            <PublicHomePage 
              onGetStarted={() => setAuthMode("register")}
              onLogin={() => setAuthMode("login")}
            />
          </Suspense>
        ) : (
          <div className="min-h-screen flex items-center justify-center px-4 py-16 relative pt-20">
            <div className="w-full max-w-md relative z-10">
              <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-5xl font-black gradient-text-cosmic mb-6 tracking-poppr font-display"
            >
              C O S M I V
            </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="text-xl text-pure-white/70 font-bold tracking-wide font-exo"
                >
                  A I - P O W E R E D   G A M I N G   M O N T A G E   P L A T F O R M
                </motion.p>
              </div>
              {authMode === "login" ? (
                <Login onSwitchToRegister={() => setAuthMode("register")} />
              ) : (
                <Register onSwitchToLogin={() => setAuthMode("login")} />
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-pure-black text-pure-white">
      <BackgroundComets />
      <ScrollProgress />
      <CosmicBackground />
      {/* Subtle starfield overlay - sparse and minimal */}
      <StarfieldBackground starCount={300} intensity="low" />
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
                  <h2 className="text-3xl font-bold text-white mb-2 font-display">🤖 AI Assistant</h2>
                  <p className="text-gray-300 font-exo">Ask me anything about Cosmiv, get help, or chat!</p>
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

