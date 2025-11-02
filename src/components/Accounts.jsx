import { useEffect, useState } from "react"
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function Accounts() {
  const { user, getAuthHeaders } = useAuth()
  const [providers, setProviders] = useState([])
  const [links, setLinks] = useState([])
  const [clips, setClips] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    // Check for OAuth callback success/error
    const params = new URLSearchParams(window.location.search)
    const successParam = params.get('success')
    const errorParam = params.get('error')
    
    if (successParam) {
      setSuccess(`${successParam.toUpperCase()} account linked successfully!`)
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
      loadLinks()
    }
    
    if (errorParam) {
      setError(`Failed to link account: ${errorParam}`)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    loadProviders()
    loadLinks()
    loadClips()
  }, [])

  const loadProviders = async () => {
    try {
      const res = await fetch("/api/v2/accounts/providers")
      if (!res.ok) throw new Error('Failed to load providers')
      const data = await res.json()
      setProviders(data.providers || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const loadLinks = async () => {
    try {
      const headers = getAuthHeaders()
      const res = await fetch("/api/v2/accounts/links", { headers })
      if (!res.ok) throw new Error('Failed to load links')
      const data = await res.json()
      setLinks(data.links || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const loadClips = async () => {
    try {
      const headers = getAuthHeaders()
      const res = await fetch("/api/v2/accounts/clips?limit=20", { headers })
      if (!res.ok) throw new Error('Failed to load clips')
      const data = await res.json()
      setClips(data.clips || [])
    } catch (err) {
      // Silently fail for clips
    }
  }

  const linkProvider = async (provider) => {
    setLoading(true)
    setError(null)
    try {
      // Redirect to OAuth endpoint
      const headers = getAuthHeaders()
      const res = await fetch(`/api/v2/accounts/oauth/${provider}`, { 
        headers,
        redirect: 'manual' // Don't follow redirect automatically
      })
      
      // Get redirect URL from response
      if (res.status === 307 || res.status === 302) {
        const redirectUrl = res.headers.get('Location')
        if (redirectUrl) {
          window.location.href = redirectUrl
        } else {
          throw new Error('No redirect URL received')
        }
      } else {
        // If mock mode, might return JSON
        const data = await res.json()
        if (data.auth_url) {
          window.location.href = data.auth_url
        } else {
          throw new Error('Invalid OAuth response')
        }
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const unlinkProvider = async (provider) => {
    if (!confirm(`Unlink ${provider} account?`)) return
    
    setLoading(true)
    try {
      const headers = getAuthHeaders()
      const res = await fetch(`/api/v2/accounts/links/${provider}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) throw new Error('Failed to unlink')
      await loadLinks()
      await loadClips()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const syncNow = async (provider = null) => {
    setSyncing(true)
    try {
      const headers = getAuthHeaders()
      const formData = new FormData()
      if (provider) formData.append("provider", provider)
      
      const res = await fetch("/api/v2/accounts/sync", {
        method: "POST",
        headers,
        body: formData,
      })
      if (!res.ok) throw new Error('Sync failed')
      
      alert('Sync started! Your clips will appear shortly.')
      setTimeout(() => loadClips(), 3000) // Reload clips after a delay
    } catch (err) {
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }

  const linkedIds = links.map((l) => l.provider)
  const linkedMap = {}
  links.forEach(link => {
    linkedMap[link.provider] = link
  })

  return (
    <div className="bg-pure-white/5 border-2 border-pure-white/20 p-12">
      <h2 className="text-4xl font-black text-pure-white mb-12 tracking-poppr">🎮   G A M E   A C C O U N T   L I N K I N G</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-300">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-xl text-green-300">
          ✅ {success}
        </div>
      )}

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {providers.map((p) => {
          const isLinked = linkedIds.includes(p.id)
          const linkInfo = linkedMap[p.id]
          const isExpired = linkInfo && linkInfo.expires_at && new Date(linkInfo.expires_at) < new Date()
          
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className={`${p.color || 'bg-pure-white/5'} border-2 p-6 ${
                isLinked ? 'border-pure-white bg-pure-white text-pure-black' : 'border-pure-white/20 bg-pure-white/5 text-pure-white'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{p.icon || '🎮'}</span>
                  <div>
                    <div className="font-black text-lg tracking-wide uppercase">{p.name}</div>
                    <div className="text-pure-white/70 text-sm font-bold mt-1">{p.description}</div>
                    {isLinked && (
                      <div className="text-xs mt-2 font-black tracking-wide">
                        ✓ Linked as {linkInfo?.platform_username || 'User'}
                      </div>
                    )}
                    {isExpired && (
                      <div className="text-xs mt-2 font-black tracking-wide">
                        ⚠️ Token expired - re-link needed
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {isLinked ? (
                  <>
                    <button
                      onClick={() => syncNow(p.id)}
                      disabled={syncing}
                      className="flex-1 px-6 py-3 bg-pure-black text-pure-white border-2 border-pure-white font-black tracking-wide disabled:opacity-50 transition-opacity hover:opacity-90"
                    >
                      {syncing ? '⏳   S Y N C I N G . . .' : '🔄   S Y N C   N O W'}
                    </button>
                    <button
                      onClick={() => unlinkProvider(p.id)}
                      disabled={loading}
                      className="px-6 py-3 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide disabled:opacity-50 transition-opacity hover:opacity-90"
                    >
                      U N L I N K
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => linkProvider(p.id)}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide disabled:opacity-50 transition-opacity hover:opacity-90"
                  >
                    {loading ? 'C O N N E C T I N G . . .' : '🔗   L I N K   A C C O U N T'}
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Discovered Clips */}
      {clips.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-pure-white text-2xl font-black tracking-poppr">📹   D I S C O V E R E D   C L I P S</h3>
            <button
              onClick={() => syncNow()}
              disabled={syncing}
              className="px-6 py-3 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide disabled:opacity-50 transition-opacity hover:opacity-90"
            >
              {syncing ? '⏳   S Y N C I N G . . .' : '🔄   S Y N C   A L L'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="bg-pure-white/5 border-2 border-pure-white/20 p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {clip.provider === 'steam' ? '🎮' :
                     clip.provider === 'xbox' ? '🟢' :
                     clip.provider === 'playstation' ? '🔵' : '🔴'}
                  </span>
                  <div className="text-pure-white font-black text-sm truncate tracking-wide">
                    {clip.title || `Clip ${clip.external_id.slice(-8)}`}
                  </div>
                </div>
                {clip.url && (
                  <a
                    href={clip.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pure-white text-xs font-black underline tracking-wide hover:opacity-75 mt-2 block"
                  >
                    V I E W   O R I G I N A L →
                  </a>
                )}
                <div className="text-pure-white/50 text-xs mt-2 font-bold">
                  {new Date(clip.discovered_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {links.length > 0 && clips.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📭</div>
          <div className="text-pure-white mb-4 font-black text-xl tracking-wide">N O   C L I P S   D I S C O V E R E D   Y E T</div>
          <div className="text-pure-white/60 text-sm mb-8 font-bold">
            Clips are synced automatically every 30 minutes, or click "Sync Now" to sync immediately.
          </div>
          <button
            onClick={() => syncNow()}
            disabled={syncing}
            className="px-8 py-4 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            {syncing ? '⏳   S Y N C I N G . . .' : '🔄   S Y N C   A L L   C L I P S   N O W'}
          </button>
        </div>
      )}

      {links.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-6">🎮</div>
          <div className="text-pure-white text-3xl mb-4 font-black tracking-poppr">N O   A C C O U N T S   L I N K E D</div>
          <div className="text-pure-white/60 font-bold">
            Link your gaming accounts to automatically discover and import your gameplay clips.
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-blue-200 text-sm">
        ℹ️ <strong>How it works:</strong> Click "Link Account" to authenticate with your gaming platform. 
        Clips are automatically discovered and synced every 30 minutes. You can also manually sync anytime.
      </div>
    </div>
  )
}
