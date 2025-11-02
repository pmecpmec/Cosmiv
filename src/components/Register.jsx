import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const result = await register(username, email, password)
    
    setLoading(false)
    
    if (!result.success) {
      setError(result.error || 'Registration failed')
    }
  }

  return (
    <div className="broken-planet-card rounded-2xl p-12 max-w-md mx-auto float">
      <h2 className="text-4xl font-black gradient-text-cosmic mb-4 text-center tracking-poppr">C R E A T E   A C C O U N T</h2>
      <p className="text-pure-white/70 text-center mb-8 font-bold tracking-wide">Join Cosmiv today</p>

      {error && (
        <div className="mb-6 p-4 border-2 border-pure-white bg-pure-white text-pure-black">
          <p className="font-black tracking-wide">⚠️ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-6 py-4 bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="Choose a username"
            disabled={loading}
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
            className="w-full px-6 py-4 bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="Enter your email"
            disabled={loading}
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
            className="w-full px-6 py-4 bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="At least 8 characters"
            disabled={loading}
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
            className="w-full px-6 py-4 bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="Confirm your password"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black py-4 border-2 border-cosmic-neon-cyan/50 hover:neon-glow-cyan transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed neon-glow chromatic-aberration"
        >
          {loading ? 'C R E A T I N G   A C C O U N T . . .' : 'C R E A T E   A C C O U N T'}
        </button>
      </form>

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

