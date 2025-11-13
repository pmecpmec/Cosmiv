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

    try {
      const result = await login(usernameOrEmail, password)
      
      if (!result.success) {
        const errorMsg = result.error || 'Login failed'
        setError(errorMsg)
        showError(errorMsg)
        console.error('Login failed:', result.error)
      } else {
        showSuccess('Login successful!')
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMsg = err.message || 'Login failed. Please check your connection.'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedContainer className="broken-planet-card rounded-2xl p-12 max-w-md mx-auto float">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-black gradient-text-cosmic mb-4 text-center tracking-poppr font-display"
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
          className="alert alert-error mb-6 border-2 border-error bg-error text-base-content"
        >
          <span className="font-black tracking-wide">⚠️ {error}</span>
        </motion.div>
      )}

      <AnimatedForm delay={0.3} onSubmit={handleSubmit} className="form-control space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm font-black text-pure-white tracking-wide uppercase">
              Username or Email
            </span>
          </label>
          <input
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            className="input input-bordered w-full px-6 py-4 min-h-[44px] text-base bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="Enter your username or email"
            disabled={loading}
            autoComplete="username"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm font-black text-pure-white tracking-wide uppercase">
              Password
            </span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input input-bordered w-full px-6 py-4 min-h-[44px] text-base bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="Enter your password"
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <div className="form-control mt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full min-h-[44px] bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black py-4 border-2 border-cosmic-neon-cyan/50 hover:neon-glow-cyan transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed neon-glow chromatic-aberration btn-magnetic btn-glow-pulse font-display"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                S I G N I N G   I N . . .
              </>
            ) : (
              'S I G N   I N'
            )}
          </button>
        </div>
      </AnimatedForm>

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
    </AnimatedContainer>
  )
}

