import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'

/**
 * Premium Header Component
 * 
 * Design Principles Applied:
 * - Frictionless navigation with simple structure
 * - Consistent interactions and intuitive behavior
 * - Subtle micro-animations on hover and active states
 * - Clean, minimal design with proper spacing
 * - Pixel-perfect alignment and consistency
 */
export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Check if current path is active
  const isActive = (path) => location.pathname === path

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-pure-black/80 border-b border-white/5"
    >
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Clean and Simple */}
          <Link 
            to="/" 
            className="flex items-center group"
            aria-label="Cosmiv Home"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-headline-md md:text-headline-lg font-bold text-gradient-cosmic transition-all duration-300"
            >
              COSMIV
            </motion.span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6 md:gap-8">
            {isAuthenticated ? (
              <>
                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  className={`relative text-body-sm md:text-body-md font-medium transition-colors duration-200 ${
                    isActive('/dashboard')
                      ? 'text-pure-white'
                      : 'text-pure-white/70 hover:text-pure-white'
                  }`}
                >
                  Dashboard
                  {isActive('/dashboard') && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-cosmic-violet rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>

                {/* Upload Link */}
                <Link
                  to="/upload"
                  className={`relative text-body-sm md:text-body-md font-medium transition-colors duration-200 ${
                    isActive('/upload')
                      ? 'text-pure-white'
                      : 'text-pure-white/70 hover:text-pure-white'
                  }`}
                >
                  Upload
                  {isActive('/upload') && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-cosmic-violet rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>

                {/* User Info and Logout */}
                <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                  <span className="hidden md:inline text-body-sm text-cosmic-neon-cyan font-medium">
                    {user?.username || user?.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-body-sm font-medium text-pure-white/70 hover:text-pure-white bg-transparent hover:bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Login Link */}
                <Link
                  to="/login"
                  className={`text-body-sm md:text-body-md font-medium transition-colors duration-200 ${
                    isActive('/login')
                      ? 'text-pure-white'
                      : 'text-pure-white/70 hover:text-pure-white'
                  }`}
                >
                  Login
                </Link>

                {/* Sign Up CTA */}
                <Link
                  to="/register"
                  className="group relative px-5 py-2.5 md:px-6 md:py-3 text-body-sm md:text-body-md font-semibold text-pure-white bg-cosmic-violet hover:bg-cosmic-purple rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                >
                  <span className="relative z-10">Sign Up</span>
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-cosmic-violet to-cosmic-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </motion.header>
  )
}
