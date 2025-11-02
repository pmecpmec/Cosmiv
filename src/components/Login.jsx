import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login({ onSwitchToRegister }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await login(usernameOrEmail, password)
    
    setLoading(false)
    
    if (!result.success) {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <div className="broken-planet-card rounded-2xl p-12 max-w-md mx-auto float">
      <h2 className="text-4xl font-black gradient-text-cosmic mb-4 text-center tracking-poppr">W E L C O M E   B A C K</h2>
      <p className="text-pure-white/70 text-center mb-8 font-bold tracking-wide">Sign in to your account</p>

      {error && (
        <div className="mb-6 p-4 border-2 border-pure-white bg-pure-white text-pure-black">
          <p className="font-black tracking-wide">⚠️ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">
            Username or Email
          </label>
          <input
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            className="w-full px-6 py-4 bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="Enter your username or email"
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
            className="w-full px-6 py-4 bg-pure-black border-2 border-cosmic-neon-cyan/30 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-cosmic-neon-cyan font-bold tracking-wide disabled:opacity-50 focus:neon-glow-cyan"
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black py-4 border-2 border-cosmic-neon-cyan/50 hover:neon-glow-cyan transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed neon-glow chromatic-aberration"
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

