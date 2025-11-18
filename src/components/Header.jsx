import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-40 glass-effect border-b border-white/10"
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-black text-gradient-cosmic">
              COSMIV
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm text-pure-white/80 hover:text-pure-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/upload"
                  className="text-sm text-pure-white/80 hover:text-pure-white transition-colors"
                >
                  Upload
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-cosmic-neon-cyan">
                    {user?.username || user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm bg-cosmic-violet/20 hover:bg-cosmic-violet/40 rounded-lg transition-all border border-cosmic-violet/50"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-pure-white/80 hover:text-pure-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-cosmic-violet hover:glow-neon rounded-lg transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </motion.header>
  )
}
