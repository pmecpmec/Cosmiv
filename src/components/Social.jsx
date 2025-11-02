import { useState, useEffect } from "react"
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function Social() {
  const { getAuthHeaders } = useAuth()
  const [connections, setConnections] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('connect') // 'connect', 'post', 'history'
  const [jobId, setJobId] = useState("")
  const [weeklyMontageId, setWeeklyMontageId] = useState("")
  const [postingPlatform, setPostingPlatform] = useState("")
  const [caption, setCaption] = useState("")

  useEffect(() => {
    loadConnections()
    loadPosts()
  }, [])

  const loadConnections = async () => {
    try {
      const headers = getAuthHeaders()
      const res = await fetch('/api/v2/social/connections', { headers })
      if (!res.ok) throw new Error('Failed to load connections')
      const data = await res.json()
      setConnections(data.connections || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const loadPosts = async () => {
    try {
      const headers = getAuthHeaders()
      const res = await fetch('/api/v2/social/posts?limit=50', { headers })
      if (!res.ok) throw new Error('Failed to load posts')
      const data = await res.json()
      setPosts(data.posts || [])
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const connectPlatform = async (platform) => {
    // In production, this would redirect to OAuth flow
    // For now, show instructions
    const platformUrls = {
      tiktok: 'https://developers.tiktok.com/apps',
      youtube: 'https://console.cloud.google.com/apis/credentials',
      instagram: 'https://developers.facebook.com/apps',
    }
    
    alert(`To connect ${platform}:\n\n1. Get your OAuth token from:\n${platformUrls[platform]}\n\n2. Use the API endpoint:\nPOST /api/v2/social/connect\n\nwith platform=${platform} and access_token=YOUR_TOKEN\n\nFor now, this is manual. In production, we'll implement full OAuth flow.`)
  }

  const disconnectPlatform = async (platform) => {
    if (!confirm(`Disconnect ${platform}?`)) return
    
    try {
      const headers = getAuthHeaders()
      const res = await fetch(`/api/v2/social/connections/${platform}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) throw new Error('Failed to disconnect')
      loadConnections()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const toggleAutoPost = async (platform, currentValue) => {
    try {
      const headers = getAuthHeaders()
      const res = await fetch(`/api/v2/social/connections/${platform}/auto-post`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_post: !currentValue }),
      })
      if (!res.ok) throw new Error('Failed to update')
      loadConnections()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const schedulePost = async () => {
    if (!postingPlatform) {
      setError("Please select a platform")
      return
    }
    
    if (!jobId && !weeklyMontageId) {
      setError("Please enter either a Job ID or Weekly Montage ID")
      return
    }

    // Check if connected
    const connected = connections.find(c => c.platform === postingPlatform && c.is_active)
    if (!connected) {
      setError(`Not connected to ${postingPlatform}. Connect your account first.`)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const headers = getAuthHeaders()
      const formData = new FormData()
      if (jobId) formData.append("job_id", jobId)
      if (weeklyMontageId) formData.append("weekly_montage_id", weeklyMontageId)
      formData.append("platform", postingPlatform)
      formData.append("format", postingPlatform === "youtube" ? "landscape" : "portrait")
      if (caption) formData.append("caption", caption)

      const res = await fetch("/api/v2/social/post", {
        method: "POST",
        headers,
        body: formData,
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to schedule post')
      }
      
      const data = await res.json()
      alert(`✅ Post scheduled! Post ID: ${data.post_id}`)
      setJobId("")
      setWeeklyMontageId("")
      setCaption("")
      setPostingPlatform("")
      loadPosts()
      setActiveTab('history')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const platformInfo = {
    tiktok: { name: "TikTok", icon: "🎵", color: "bg-black text-white" },
    youtube: { name: "YouTube", icon: "▶️", color: "bg-red-600 text-white" },
    instagram: { name: "Instagram", icon: "📷", color: "bg-gradient-to-r from-purple-600 to-pink-600 text-white" },
  }

  if (loading && connections.length === 0) {
    return (
      <div className="bg-pure-white/5 border-2 border-pure-white/20 p-12">
        <div className="text-center text-pure-white font-black text-xl tracking-wide">L O A D I N G . . .</div>
      </div>
    )
  }

  return (
    <div className="bg-pure-white/5 border-2 border-pure-white/20 p-12">
      <h2 className="text-4xl font-black text-pure-white mb-12 tracking-poppr text-center">📱   S O C I A L   M E D I A</h2>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 border-b-2 border-pure-white/20">
        {['connect', 'post', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-black transition-all border-b-2 tracking-wide ${
              activeTab === tab
                ? 'border-pure-white text-pure-white bg-pure-white/10'
                : 'border-transparent text-pure-white/50 hover:text-pure-white hover:border-pure-white/30'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-6 border-2 border-pure-white bg-pure-white text-pure-black">
          <p className="font-black tracking-wide">⚠️ {error}</p>
        </div>
      )}

      {/* Connect Tab */}
      {activeTab === 'connect' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-pure-white text-2xl font-black mb-6 tracking-wide uppercase">Connected Platforms</h3>
          
          {connections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🔗</div>
              <div className="text-pure-white text-3xl mb-4 font-black tracking-poppr">N O   P L A T F O R M S   C O N N E C T E D</div>
              <div className="text-pure-white/60 mb-8 font-bold">Connect your social media accounts to enable auto-posting</div>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map(conn => {
                const info = platformInfo[conn.platform]
                return (
                  <div
                    key={conn.platform}
                    className="bg-pure-white/5 border-2 border-pure-white/20 p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{info.icon}</span>
                      <div>
                        <div className="font-black tracking-wide uppercase">{info.name}</div>
                        {conn.platform_username && (
                          <div className="text-sm font-bold mt-1">@{conn.platform_username}</div>
                        )}
                        <div className="text-xs font-black tracking-wide mt-2">
                          {conn.is_active ? '✅ Connected' : '❌ Disconnected'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAutoPost(conn.platform, conn.auto_post)}
                        className={`px-4 py-2 border-2 font-black tracking-wide text-sm ${
                          conn.auto_post
                            ? 'bg-pure-white text-pure-black border-pure-white'
                            : 'bg-pure-white/10 text-pure-white border-pure-white/20'
                        }`}
                      >
                        {conn.auto_post ? 'A U T O - P O S T   O N' : 'A U T O - P O S T   O F F'}
                      </button>
                      <button
                        onClick={() => disconnectPlatform(conn.platform)}
                        className="px-4 py-2 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide text-sm hover:opacity-90 transition-opacity"
                      >
                        D I S C O N N E C T
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-8 pt-8 border-t-2 border-pure-white/20">
            <h4 className="text-pure-white text-xl font-black mb-6 tracking-wide uppercase">Connect New Platform</h4>
            <div className="grid grid-cols-3 gap-4">
              {['tiktok', 'youtube', 'instagram'].map(platform => {
                const info = platformInfo[platform]
                const isConnected = connections.some(c => c.platform === platform && c.is_active)
                return (
                  <button
                    key={platform}
                    onClick={() => connectPlatform(platform)}
                    disabled={isConnected}
                    className="bg-pure-white/5 border-2 border-pure-white/20 p-8 font-black tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:border-pure-white hover:bg-pure-white hover:text-pure-black"
                  >
                    <div className="text-4xl mb-3">{info.icon}</div>
                    <div className="uppercase">{info.name}</div>
                    {isConnected && <div className="text-xs mt-2 font-black tracking-wide">✅ Connected</div>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-8 p-6 border-2 border-pure-white/20 bg-pure-white/5 text-pure-white">
            <div className="font-black mb-2 tracking-wide uppercase text-sm">ℹ️   O A U T H   S E T U P</div>
            <div className="font-bold text-sm">
              In production, clicking "Connect" will redirect to the platform's OAuth flow. 
              For development, you can manually connect via the API endpoint with your access token.
            </div>
          </div>
        </motion.div>
      )}

      {/* Post Tab */}
      {activeTab === 'post' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-white text-xl font-semibold mb-4">Schedule Post</h3>

          <div className="space-y-4">
            {/* Job ID or Weekly Montage ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Job ID (for completed renders)</label>
              <input
                type="text"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="e.g., job_abc123"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500"
              />
            </div>

            <div className="text-center text-gray-400">OR</div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Weekly Montage ID</label>
              <input
                type="number"
                value={weeklyMontageId}
                onChange={(e) => setWeeklyMontageId(e.target.value)}
                placeholder="e.g., 1"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500"
              />
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Platform</label>
              <div className="grid grid-cols-3 gap-4">
                {['tiktok', 'youtube', 'instagram'].map(platform => {
                  const info = platformInfo[platform]
                  const isConnected = connections.some(c => c.platform === platform && c.is_active)
                  return (
                    <button
                      key={platform}
                      onClick={() => setPostingPlatform(platform)}
                      disabled={!isConnected}
                      className={`${postingPlatform === platform ? 'border-pure-white bg-pure-white text-pure-black' : 'border-pure-white/20 bg-pure-white/5 text-pure-white'} border-2 p-6 font-black tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90`}
                    >
                      <div className="text-3xl mb-2">{info.icon}</div>
                      <div className="text-sm uppercase">{info.name}</div>
                      {!isConnected && <div className="text-xs mt-2 font-black tracking-wide">Not connected</div>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">Caption (optional)</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a custom caption... (default: auto-generated)"
                rows={3}
                className="w-full bg-pure-black border-2 border-pure-white/20 px-6 py-4 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-pure-white font-bold tracking-wide"
              />
            </div>

            {/* Submit */}
            <button
              onClick={schedulePost}
              disabled={loading || !postingPlatform || (!jobId && !weeklyMontageId)}
              className="w-full px-8 py-4 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'P O S T I N G . . .' : '📤   S C H E D U L E   P O S T'}
            </button>
          </div>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-white text-xl font-semibold mb-4">Post History</h3>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <div className="text-white text-xl mb-2">No Posts Yet</div>
              <div className="text-gray-400">Your scheduled and posted videos will appear here</div>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => {
                const info = platformInfo[post.platform]
                return (
                  <div
                    key={post.id}
                    className={`${info.color} rounded-xl p-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{info.icon}</span>
                        <div>
                          <div className="font-bold">{info.name}</div>
                          <div className="text-sm opacity-80 mt-1">{post.caption || 'No caption'}</div>
                          <div className="text-xs opacity-60 mt-2">
                            {post.posted_at 
                              ? `Posted: ${new Date(post.posted_at).toLocaleString()}`
                              : post.scheduled_at 
                                ? `Scheduled: ${new Date(post.scheduled_at).toLocaleString()}`
                                : `Created: ${new Date(post.created_at).toLocaleString()}`
                            }
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs mb-2 ${
                          post.status === 'posted' ? 'bg-green-500/20 text-green-200' :
                          post.status === 'failed' ? 'bg-red-500/20 text-red-200' :
                          'bg-yellow-500/20 text-yellow-200'
                        }`}>
                          {post.status.toUpperCase()}
                        </div>
                        {post.video_url && (
                          <a
                            href={post.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline opacity-80 hover:opacity-100"
                          >
                            View Post →
                          </a>
                        )}
                      </div>
                    </div>
                    {post.error && (
                      <div className="mt-2 text-xs text-red-200 bg-red-500/20 rounded p-2">
                        ⚠️ Error: {post.error}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
