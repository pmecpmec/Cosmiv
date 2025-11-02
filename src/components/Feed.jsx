import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"

export default function Feed() {
  const { getAuthHeaders } = useAuth()
  const [posts, setPosts] = useState([])
  const [feedType, setFeedType] = useState("for-you") // for-you, following, trending, new
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const feedEndRef = useRef(null)

  useEffect(() => {
    loadFeed()
  }, [feedType])

  const loadFeed = async () => {
    setLoading(true)
    setError(null)
    try {
      const headers = getAuthHeaders()
      const endpoint = `/api/v2/feed/${feedType}?limit=20`
      const response = await fetch(endpoint, { headers })
      
      if (!response.ok) throw new Error("Failed to load feed")
      
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      const headers = getAuthHeaders()
      const response = await fetch(`/api/v2/feed/posts/${postId}/like`, {
        method: "POST",
        headers,
      })
      
      if (response.ok) {
        const data = await response.json()
        setPosts(posts.map(p => 
          p.post_id === postId 
            ? { ...p, likes: data.likes, liked: data.liked }
            : p
        ))
      }
    } catch (err) {
      console.error("Failed to like post:", err)
    }
  }

  const trackView = async (postId) => {
    try {
      const headers = getAuthHeaders()
      await fetch(`/api/v2/feed/posts/${postId}/view`, {
        method: "POST",
        headers,
      })
    } catch (err) {
      // Silent fail
    }
  }

  const feedTabs = [
    { id: "for-you", label: "For You", icon: "🔥" },
    { id: "following", label: "Following", icon: "👥" },
    { id: "trending", label: "Trending", icon: "📈" },
    { id: "new", label: "New", icon: "🆕" },
  ]

  return (
    <div className="min-h-screen bg-pure-black text-pure-white">
      {/* Feed Tabs */}
      <div className="sticky top-16 z-40 bg-pure-black border-b-2 border-pure-white">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {feedTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFeedType(tab.id)}
                className={`px-8 py-4 text-sm font-black whitespace-nowrap border-b-2 transition-all tracking-wide ${
                  feedType === tab.id
                    ? "border-pure-white text-pure-white bg-pure-white/10"
                    : "border-transparent text-pure-white/50 hover:text-pure-white hover:border-pure-white/30"
                }`}
              >
                {tab.icon} {tab.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="container mx-auto px-4 py-section max-w-5xl">
        {loading && (
          <div className="text-center py-hero">
            <div className="text-pure-white/50 font-black text-xl tracking-wide">L O A D I N G   F E E D . . .</div>
          </div>
        )}

        {error && (
          <div className="text-center py-hero">
            <div className="text-pure-white font-black text-xl mb-6 tracking-wide">{error}</div>
            <button
              onClick={loadFeed}
              className="px-8 py-4 bg-pure-white text-pure-black font-black border-2 border-pure-white hover:opacity-90 transition-opacity tracking-wide"
            >
              R E T R Y
            </button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-hero">
            <div className="text-pure-white/50 text-2xl font-black mb-4 tracking-poppr">N O   P O S T S   Y E T</div>
            <div className="text-pure-white/30 text-lg mt-2 font-bold">Be the first to post!</div>
          </div>
        )}

        <div className="space-y-8">
          {posts.map((post, idx) => (
            <motion.div
              key={post.post_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-pure-white/5 border-2 border-pure-white/20 overflow-hidden mb-8"
              onViewportEnter={() => trackView(post.post_id)}
            >
              {/* Post Header */}
              <div className="p-4 border-b-2 border-pure-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-pure-white tracking-wide">@{post.user_id}</div>
                    <div className="text-xs text-pure-white/50 font-bold">{new Date(post.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Video/Thumbnail */}
              {post.video_path && (
                <div className="relative w-full aspect-video bg-black">
                  {post.thumbnail_path ? (
                    <img
                      src={post.thumbnail_path}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">🎬</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              )}

              {/* Caption */}
              {post.caption && (
                <div className="p-4">
                  <p className="text-pure-white">{post.caption}</p>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.hashtags.map((tag, i) => (
                        <span key={i} className="text-pure-white/80 text-sm font-bold">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="p-4 border-t-2 border-pure-white/20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post.post_id)}
                    className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                  >
                    <span className="text-2xl">❤️</span>
                    <span className="text-sm font-bold">{post.likes || 0}</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    <span className="text-sm font-bold">{post.comments || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔄</span>
                    <span className="text-sm font-bold">{post.shares || 0}</span>
                  </div>
                </div>
                <div className="text-sm text-pure-white/50 font-bold">
                  👁️ {post.views || 0}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div ref={feedEndRef} />
      </div>
    </div>
  )
}

