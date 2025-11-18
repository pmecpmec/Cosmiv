import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { motion } from 'framer-motion'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await register(email, password, username)
    
    if (result.success) {
      showToast('Account created!', 'success')
      navigate('/dashboard')
    } else {
      showToast(result.error || 'Registration failed', 'error')
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
          Sign Up
        </h1>
        <p className="text-pure-white/60 mb-8">
          Join the cosmic experience
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-pure-white/80 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cosmic-violet focus:glow-neon transition-all text-pure-white"
              placeholder="username"
            />
          </div>

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
              minLength={8}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cosmic-violet focus:glow-neon transition-all text-pure-white"
              placeholder="••••••••"
            />
            <p className="text-xs text-pure-white/50 mt-1">
              Password must be at least 8 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-cosmic-violet hover:glow-neon rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-pure-white/60">
          Already have an account?{' '}
          <Link to="/login" className="text-cosmic-neon-cyan hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
