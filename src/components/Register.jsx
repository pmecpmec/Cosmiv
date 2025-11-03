import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { AnimatedForm, AnimatedContainer } from './ui/AnimatedContainer'

export default function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { showError, showSuccess } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      const errorMsg = 'Password must be at least 8 characters'
      setError(errorMsg)
      showError(errorMsg)
      return
    }

    if (password !== confirmPassword) {
      const errorMsg = 'Passwords do not match'
      setError(errorMsg)
      showError(errorMsg)
      return
    }

    setLoading(true)

    const result = await register(username, email, password)
    
    setLoading(false)
    
    if (!result.success) {
      const errorMsg = result.error || 'Registration failed'
      setError(errorMsg)
      showError(errorMsg)
    } else {
      showSuccess('Account created successfully!')
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
        C R E A T E   A C C O U N T
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-pure-white/70 text-center mb-8 font-bold tracking-wide"
      >
        Join Cosmiv today
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
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-6 py-4 min-h-[44px] text-base bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="Choose a username"
            disabled={loading}
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-6 py-4 min-h-[44px] text-base bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="Enter your email"
            disabled={loading}
            autoComplete="email"
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
            minLength={8}
            className="w-full px-6 py-4 min-h-[44px] text-base bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="At least 8 characters"
            disabled={loading}
            autoComplete="new-password"
          />
          <p className="text-xs text-pure-white/50 mt-2 font-bold">Must be at least 8 characters</p>
        </div>

        <div>
          <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-6 py-4 min-h-[44px] text-base bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="Confirm your password"
            disabled={loading}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black py-4 border-2 border-cosmic-neon-cyan/50 hover:neon-glow-cyan transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed neon-glow chromatic-aberration"
        >
          {loading ? 'C R E A T I N G   A C C O U N T . . .' : 'C R E A T E   A C C O U N T'}
        </button>
      </AnimatedForm>

      <div className="mt-6 text-center">
        <p className="text-pure-white/60 text-sm font-bold">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-pure-white font-black underline tracking-wide hover:opacity-75"
          >
            S I G N   I N   H E R E
          </button>
        </p>
      </div>
    </div>
  )
}

