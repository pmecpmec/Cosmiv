import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header({ activeTab, setActiveTab }) {
  const { user, logout, isAdmin } = useAuth()
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRefs = useRef({})

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
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id)
  }

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    setOpenDropdown(null)
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900/90 via-purple-800/90 to-purple-900/90 backdrop-blur-sm border-b-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleTabClick("home")}
          >
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-100 tracking-poppr">
              A I D I T O R
            </span>
          </motion.div>

          {/* Main Navigation - Only essential tabs visible */}
          <nav className="flex items-center gap-2">
            {/* Main tabs */}
            {mainTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 text-sm font-black transition-all border-b-2 tracking-wide ${
                  activeTab === tab.id
                    ? "border-purple-300 text-purple-200 bg-purple-700/30 shadow-lg shadow-purple-500/30"
                    : "border-transparent text-purple-200/70 hover:text-purple-100 hover:border-purple-400/50 hover:bg-purple-800/20"
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
                      ? "border-purple-300/50 text-purple-200 bg-purple-700/20"
                      : "border-transparent text-purple-200/70 hover:text-purple-100 hover:border-purple-400/50 hover:bg-purple-800/20"
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

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {openDropdown === dropdown.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 border-2 border-purple-500/50 min-w-[200px] shadow-2xl shadow-purple-900/50 backdrop-blur-sm"
                    >
                      {dropdown.tabs.map((tab, index) => (
                        <motion.button
                          key={tab.id}
                          onClick={() => handleTabClick(tab.id)}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 4, backgroundColor: "rgba(168, 85, 247, 0.2)" }}
                          className={`w-full px-4 py-3 text-left text-sm font-black tracking-wide border-b border-purple-700/30 last:border-0 flex items-center gap-3 transition-all ${
                            activeTab === tab.id
                              ? "text-purple-100 bg-purple-700/30 border-l-4 border-l-purple-300 shadow-sm"
                              : "text-purple-200/70 hover:text-purple-100 hover:bg-purple-800/30"
                          }`}
                        >
                          <span className="text-lg">{tab.icon}</span>
                          <span>{tab.label}</span>
                          {activeTab === tab.id && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto text-purple-300"
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

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-3 px-3 py-1 border-2 border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer bg-purple-900/20"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleTabClick("dashboard")}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-sm font-black border-2 border-purple-400/50 shadow-lg shadow-purple-500/30">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-purple-100 text-sm font-black leading-tight">{user?.username}</span>
                {isAdmin && (
                  <span className="text-purple-300/70 text-xs font-bold">ADMIN</span>
                )}
              </div>
            </motion.div>
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-purple-50 font-black border-2 border-purple-400/50 transition-all tracking-wide shadow-lg shadow-purple-500/30"
            >
              LOGOUT
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
