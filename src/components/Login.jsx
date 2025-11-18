import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { motion } from 'framer-motion'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      showToast('Welcome back!', 'success')
      navigate('/dashboard')
    } else {
      showToast(result.error || 'Login failed', 'error')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-pure-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-effect p-8 rounded-2xl"
      >
        <h1 className="text-3xl font-display text-gradient-cosmic mb-2">
          Login
        </h1>
        <p className="text-pure-white/60 mb-8">
          Welcome back to Cosmiv
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-pure-white/80 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cosmic-violet focus:glow-neon transition-all text-pure-white"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-pure-white/80 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cosmic-violet focus:glow-neon transition-all text-pure-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-cosmic-violet hover:glow-neon rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-pure-white/60">
          Don't have an account?{' '}
          <Link to="/register" className="text-cosmic-neon-cyan hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}



