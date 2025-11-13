import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import SearchBar from './SearchBar'

export default function Header({ activeTab, setActiveTab }) {
  const { user, logout, isAdmin } = useAuth()
  const [openDropdown, setOpenDropdown] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRefs = useRef({})
  const mobileMenuRef = useRef(null)

  // Organize tabs into logical groups
  const mainTabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "upload", label: "Upload", icon: "⬆️" },
    { id: "dashboard", label: "Dashboard", icon: "📊" },
  ]

  const contentTabs = [
    { id: "feed", label: "Feed", icon: "📱" },
    { id: "weekly", label: "Weekly Montages", icon: "🎬" },
    { id: "communities", label: "Communities", icon: "💬" },
  ]

  const toolsTabs = [
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "ai", label: "AI Chat", icon: "🤖" },
    ...(isAdmin ? [{ id: "ai-admin", label: "AI Admin", icon: "⚙️" }] : []),
  ]

  const settingsTabs = [
    { id: "accounts", label: "Accounts", icon: "🔗" },
    { id: "billing", label: "Billing", icon: "💳" },
    { id: "social", label: "Social", icon: "📱" },
    ...(isAdmin ? [{ id: "admin", label: "Admin", icon: "⚙️" }] : []),
  ]

  const dropdowns = [
    { id: "content", label: "Content", icon: "📺", tabs: contentTabs },
    { id: "tools", label: "Tools", icon: "🛠️", tabs: toolsTabs },
    { id: "settings", label: "Settings", icon: "⚙️", tabs: settingsTabs },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown) {
        const ref = dropdownRefs.current[openDropdown]
        if (ref && !ref.contains(event.target)) {
          setOpenDropdown(null)
        }
      }
      // Close mobile menu when clicking outside
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [openDropdown, mobileMenuOpen])
  
  // Close mobile menu when tab changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [activeTab])

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id)
  }

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    setOpenDropdown(null)
    setMobileMenuOpen(false)
  }
  
  // Get all tabs flattened for mobile menu
  const allTabs = [
    ...mainTabs,
    ...contentTabs,
    ...toolsTabs,
    ...settingsTabs,
  ]

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-cosmic-violet/90 via-cosmic-deep-blue/90 to-cosmic-violet/90 backdrop-blur-xl border-b-2 border-cosmic-neon-cyan/50 shadow-2xl shadow-cosmic-neon-cyan/40"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(30, 58, 138, 0.9) 50%, rgba(139, 92, 246, 0.9) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => handleTabClick("home")}
          >
            <span className="text-2xl">🌌</span>
            <span className="text-xl font-black gradient-text-cosmic tracking-poppr chromatic-aberration hidden sm:inline">
              C O S M I V
            </span>
            <span className="text-xl font-black gradient-text-cosmic tracking-poppr chromatic-aberration sm:hidden">
              C
            </span>
          </motion.div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-xs mx-4">
            <SearchBar onSelectTab={handleTabClick} />
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            className="md:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 p-2 border-2 border-cosmic-neon-cyan/50 hover:border-cosmic-neon-cyan transition-all rounded"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <motion.span
              animate={{
                rotate: mobileMenuOpen ? 45 : 0,
                y: mobileMenuOpen ? 8 : 0,
              }}
              className="w-6 h-0.5 bg-cosmic-neon-cyan transition-all"
            />
            <motion.span
              animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
              className="w-6 h-0.5 bg-cosmic-neon-cyan transition-all"
            />
            <motion.span
              animate={{
                rotate: mobileMenuOpen ? -45 : 0,
                y: mobileMenuOpen ? -8 : 0,
              }}
              className="w-6 h-0.5 bg-cosmic-neon-cyan transition-all"
            />
          </motion.button>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Main tabs */}
            {mainTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 text-sm font-black transition-all border-b-2 tracking-wide ${
                  activeTab === tab.id
                    ? "border-cosmic-neon-cyan text-cosmic-neon-cyan bg-cosmic-deep-blue/30 shadow-lg shadow-cosmic-neon-cyan/40 neon-glow-cyan"
                    : "border-transparent text-white/70 hover:text-cosmic-neon-cyan hover:border-cosmic-neon-cyan/50 hover:bg-cosmic-violet/20 chromatic-aberration"
                }`}
              >
                {tab.icon} {tab.label}
              </motion.button>
            ))}

            {/* Dropdowns */}
            {dropdowns.map((dropdown) => (
              <div
                key={dropdown.id}
                ref={(el) => (dropdownRefs.current[dropdown.id] = el)}
                className="relative"
              >
                <motion.button
                  onClick={() => toggleDropdown(dropdown.id)}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 text-sm font-black transition-all border-b-2 tracking-wide flex items-center gap-2 ${
                    dropdown.tabs.some(t => activeTab === t.id)
                      ? "border-cosmic-neon-cyan/50 text-cosmic-neon-cyan bg-cosmic-deep-blue/20 neon-glow-cyan"
                      : "border-transparent text-white/70 hover:text-cosmic-neon-cyan hover:border-cosmic-neon-cyan/50 hover:bg-cosmic-violet/20 chromatic-aberration"
                  }`}
                >
                  {dropdown.icon} {dropdown.label}
                  <motion.span
                    animate={{ rotate: openDropdown === dropdown.id ? 180 : 0 }}
                    className="text-xs"
                  >
                    ▼
                  </motion.span>
                </motion.button>

                {/* Dropdown Menu - Using daisyUI dropdown with custom styling */}
                <AnimatePresence>
                  {openDropdown === dropdown.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 bg-gradient-to-br from-cosmic-violet/95 via-cosmic-deep-blue/95 to-cosmic-violet/95 border-2 border-cosmic-neon-cyan/50 min-w-[200px] shadow-2xl shadow-cosmic-neon-cyan/30 backdrop-blur-md broken-planet-card"
                    >
                      {dropdown.tabs.map((tab, index) => (
                        <motion.button
                          key={tab.id}
                          onClick={() => handleTabClick(tab.id)}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 4, backgroundColor: "rgba(168, 85, 247, 0.2)" }}
                          className={`w-full px-4 py-3 text-left text-sm font-black tracking-wide border-b border-cosmic-neon-cyan/30 last:border-0 flex items-center gap-3 transition-all ${
                            activeTab === tab.id
                              ? "text-cosmic-neon-cyan bg-cosmic-deep-blue/30 border-l-4 border-l-cosmic-neon-cyan shadow-sm neon-glow-cyan"
                              : "text-white/70 hover:text-cosmic-neon-cyan hover:bg-cosmic-violet/30 chromatic-aberration"
                          }`}
                        >
                          <span className="text-lg">{tab.icon}</span>
                          <span>{tab.label}</span>
                          {activeTab === tab.id && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto text-cosmic-neon-cyan"
                            >
                              ✓
                            </motion.span>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* User Info & Logout - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <motion.div
              className="flex items-center gap-3 px-3 py-1 border-2 border-cosmic-neon-cyan/30 hover:border-cosmic-neon-cyan/50 transition-all cursor-pointer bg-cosmic-deep-blue/20 hover:neon-glow-cyan"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleTabClick("dashboard")}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-violet to-cosmic-neon-cyan flex items-center justify-center text-sm font-black border-2 border-cosmic-neon-cyan/50 shadow-lg shadow-cosmic-neon-cyan/30 neon-glow-cyan">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-cosmic-neon-cyan text-sm font-black leading-tight">{user?.username}</span>
                {isAdmin && (
                  <span className="text-cosmic-glitch-pink/70 text-xs font-bold">ADMIN</span>
                )}
              </div>
            </motion.div>
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black border-2 border-cosmic-neon-cyan/50 transition-all tracking-wide shadow-lg shadow-cosmic-neon-cyan/30 neon-glow hover:neon-glow-pink chromatic-aberration"
            >
              LOGOUT
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t-2 border-cosmic-neon-cyan/30 mt-2"
            >
              <div className="py-4 space-y-2 max-h-[calc(100vh-80px)] overflow-y-auto">
                {/* All Tabs */}
                {allTabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full px-4 py-3 text-left text-sm font-black tracking-wide flex items-center gap-3 transition-all min-h-[44px] ${
                      activeTab === tab.id
                        ? "text-cosmic-neon-cyan bg-cosmic-deep-blue/30 border-l-4 border-l-cosmic-neon-cyan neon-glow-cyan"
                        : "text-white/70 hover:text-cosmic-neon-cyan hover:bg-cosmic-violet/20"
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-cosmic-neon-cyan"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.button>
                ))}

                {/* Divider */}
                <div className="border-t border-cosmic-neon-cyan/30 my-2" />

                {/* User Info */}
                <motion.div
                  className="px-4 py-3 flex items-center gap-3 border-2 border-cosmic-neon-cyan/30 bg-cosmic-deep-blue/20"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabClick("dashboard")}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-violet to-cosmic-neon-cyan flex items-center justify-center text-sm font-black border-2 border-cosmic-neon-cyan/50 shadow-lg shadow-cosmic-neon-cyan/30 neon-glow-cyan">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-cosmic-neon-cyan text-sm font-black">{user?.username}</span>
                    {isAdmin && (
                      <span className="text-cosmic-glitch-pink/70 text-xs font-bold">ADMIN</span>
                    )}
                  </div>
                </motion.div>

                {/* Logout Button */}
                <motion.button
                  onClick={logout}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue text-white font-black border-2 border-cosmic-neon-cyan/50 transition-all tracking-wide min-h-[44px] neon-glow"
                >
                  LOGOUT
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
