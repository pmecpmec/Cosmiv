import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { AnimatedForm, AnimatedContainer } from './ui/AnimatedContainer'

export default function Login({ onSwitchToRegister }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { showError, showSuccess } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await login(usernameOrEmail, password)
    
    setLoading(false)
    
    if (!result.success) {
      const errorMsg = result.error || 'Login failed'
      setError(errorMsg)
      showError(errorMsg)
    } else {
      showSuccess('Login successful!')
    }
  }

  return (
    <AnimatedContainer className="broken-planet-card rounded-2xl p-12 max-w-md mx-auto float">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-black gradient-text-cosmic mb-4 text-center tracking-poppr"
      >
        W E L C O M E   B A C K
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-pure-white/70 text-center mb-8 font-bold tracking-wide"
      >
        Sign in to your account
      </motion.p>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 border-2 border-pure-white bg-pure-white text-pure-black"
        >
          <p className="font-black tracking-wide">⚠️ {error}</p>
        </motion.div>
      )}

      <AnimatedForm delay={0.3} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">
            Username or Email
          </label>
          <input
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            className="w-full px-6 py-4 min-h-[44px] text-base bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="Enter your username or email"
            disabled={loading}
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-6 py-4 min-h-[44px] text-base bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="Enter your password"
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black py-4 border-2 border-cosmic-neon-cyan/50 hover:neon-glow-cyan transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed neon-glow chromatic-aberration"
        >
          {loading ? 'S I G N I N G   I N . . .' : 'S I G N   I N'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-pure-white/60 text-sm font-bold">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-pure-white font-black underline tracking-wide hover:opacity-75"
          >
            R E G I S T E R   H E R E
          </button>
        </p>
      </div>
    </div>
  )
}

