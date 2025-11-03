import { useEffect, useState } from "react"
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import api from '../utils/apiClient'
import { SkeletonList, SkeletonCard } from './ui/Skeleton'
import { InlineLoader } from './ui/LoadingOverlay'

export default function Accounts() {
  const { user } = useAuth()
  const { showError, showSuccess, showInfo } = useToast()
  const [providers, setProviders] = useState([])
  const [links, setLinks] = useState([])
  const [clips, setClips] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      setInitialLoading(true)
      
      // Check for OAuth callback success/error
      const params = new URLSearchParams(window.location.search)
      const successParam = params.get('success')
      const errorParam = params.get('error')
      
      if (successParam) {
        const successMsg = `${successParam.toUpperCase()} account linked successfully!`
        setSuccess(successMsg)
        showSuccess(successMsg)
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
      
      if (errorParam) {
        const errorMsg = `Failed to link account: ${errorParam}`
        setError(errorMsg)
        showError(errorMsg)
        window.history.replaceState({}, document.title, window.location.pathname)
      }
      
      // Load all data
      await Promise.all([
        loadProviders(),
        loadLinks(),
        loadClips(),
      ])
      
      setInitialLoading(false)
    }
    
    initialize()
  }, [])

  const loadProviders = async () => {
    try {
      const data = await api.get("/api/v2/accounts/providers", { requireAuth: false })
      setProviders(data.providers || [])
    } catch (err) {
      const errorMsg = err.message || 'Failed to load providers'
      setError(errorMsg)
      showError(errorMsg)
    }
  }

  const loadLinks = async () => {
    try {
      const data = await api.get("/api/v2/accounts/links")
      setLinks(data.links || [])
    } catch (err) {
      const errorMsg = err.message || 'Failed to load links'
      setError(errorMsg)
      showError(errorMsg)
    }
  }

  const loadClips = async () => {
    try {
      const data = await api.get("/api/v2/accounts/clips?limit=20")
      setClips(data.clips || [])
    } catch (err) {
      // Silently fail for clips
    }
  }

  const linkProvider = async (provider) => {
    setLoading(true)
    setError(null)
    try {
      // Use apiClient.raw for manual redirect handling
      const res = await api.raw(`/api/v2/accounts/oauth/${provider}`, {
        method: 'GET',
        requireAuth: true,
        redirect: 'manual', // Don't follow redirect automatically
      })
      
      // Get redirect URL from response
      if (res.status === 307 || res.status === 302) {
        const redirectUrl = res.headers.get('Location')
        if (redirectUrl) {
          window.location.href = redirectUrl
          return
        } else {
          throw new Error('No redirect URL received')
        }
      }
      
      // If not a redirect, try to parse as JSON (mock mode)
      const text = await res.text()
      try {
        const data = JSON.parse(text)
        if (data.auth_url) {
          window.location.href = data.auth_url
          return
        }
      } catch {
        // Not JSON, ignore
      }
      
      throw new Error('Invalid OAuth response')
    } catch (err) {
      const errorMsg = err.message || 'Failed to link provider'
      setError(errorMsg)
      showError(errorMsg)
      setLoading(false)
    }
  }

  const unlinkProvider = async (provider) => {
    if (!window.confirm(`Unlink ${provider} account?`)) return
    
    setLoading(true)
    try {
      await api.delete(`/api/v2/accounts/links/${provider}`)
      showSuccess(`${provider} account unlinked successfully`)
      await loadLinks()
      await loadClips()
    } catch (err) {
      const errorMsg = err.message || 'Failed to unlink provider'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const syncNow = async (provider = null) => {
    setSyncing(true)
    try {
      const formData = new FormData()
      if (provider) formData.append("provider", provider)
      
      await api.post("/api/v2/accounts/sync", formData, {
        headers: {}, // Don't set Content-Type for FormData
      })
      
      showInfo('Sync started! Your clips will appear shortly.')
      setTimeout(() => loadClips(), 3000) // Reload clips after a delay
    } catch (err) {
      const errorMsg = err.message || 'Sync failed'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setSyncing(false)
    }
  }

  const linkedIds = links.map((l) => l.provider)
  const linkedMap = {}
  links.forEach(link => {
    linkedMap[link.provider] = link
  })

  if (initialLoading) {
    return (
      <div className="bg-pure-white/5 border-2 border-pure-white/20 p-12">
        <h2 className="text-4xl font-black text-pure-white mb-12 tracking-poppr">🎮   G A M E   A C C O U N T   L I N K I N G</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      </div>
    )
  }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
