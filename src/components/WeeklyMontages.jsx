import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function WeeklyMontages() {
  const { getAuthHeaders, isAdmin } = useAuth()
  const [montages, setMontages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [featuredOnly, setFeaturedOnly] = useState(false)

  useEffect(() => {
    loadMontages()
  }, [featuredOnly])

  const loadMontages = async () => {
    try {
      const url = featuredOnly 
        ? '/api/v2/weekly-montages?featured_only=true'
        : '/api/v2/weekly-montages?limit=20'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load montages')
      const data = await res.json()
      setMontages(data.montages || [])
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const triggerCompilation = async () => {
    if (!confirm('Start weekly montage compilation? This will collect clips from the past week.')) {
      return
    }
    
    try {
      const headers = getAuthHeaders()
      const res = await fetch('/api/v2/weekly-montages/compile', {
        method: 'POST',
        headers,
      })
      if (!res.ok) throw new Error('Failed to trigger compilation')
      alert('Weekly montage compilation started! Check back in a few minutes.')
      loadMontages()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="text-center text-white">Loading weekly montages...</div>
      </div>
    )
  }

  return (
    <div className="bg-pure-white/5 border-2 border-pure-white/20 p-12">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-4xl font-black text-pure-white tracking-poppr">🎬   W E E K L Y   M O N T A G E S</h2>
        <div className="flex gap-4">
          {isAdmin && (
            <button
              onClick={triggerCompilation}
              className="px-6 py-3 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide hover:opacity-90 transition-opacity"
            >
              ⚡   C O M P I L E   N O W
            </button>
          )}
          <button
            onClick={() => setFeaturedOnly(!featuredOnly)}
            className={`px-6 py-3 border-2 font-black tracking-wide transition-opacity ${
              featuredOnly
                ? 'bg-pure-white text-pure-black border-pure-white'
                : 'bg-pure-white/10 text-pure-white border-pure-white/20 hover:bg-pure-white/20'
            }`}
          >
            {featuredOnly ? '⭐   F E A T U R E D   O N L Y' : 'S H O W   A L L'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-6 border-2 border-pure-white bg-pure-white text-pure-black">
          <p className="font-black tracking-wide">⚠️ {error}</p>
        </div>
      )}

      {montages.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">📹</div>
          <div className="text-pure-white text-3xl mb-4 font-black tracking-poppr">N O   W E E K L Y   M O N T A G E S   Y E T</div>
          <div className="text-pure-white/60 mb-8 font-bold">
            Weekly montages are compiled automatically every Monday from the best clips of the week.
          </div>
          {isAdmin && (
            <button
              onClick={triggerCompilation}
              className="mt-8 px-8 py-4 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide hover:opacity-90 transition-opacity"
            >
              C O M P I L E   F I R S T   M O N T A G E
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {montages.map((montage) => (
            <motion.div
              key={montage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`bg-pure-white/5 border-2 p-8 ${
                montage.is_featured
                  ? 'border-pure-white bg-pure-white text-pure-black'
                  : 'border-pure-white/20 text-pure-white'
              }`}
            >
              {montage.is_featured && (
                <div className="absolute -top-4 left-4 px-4 py-2 bg-pure-black text-pure-white border-2 border-pure-black font-black tracking-wide text-xs">
                  ⭐   F E A T U R E D
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="font-black text-xl mb-3 tracking-wide uppercase">{montage.title}</h3>
                <div className="text-sm font-bold opacity-70">
                  {new Date(montage.week_start).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm font-bold opacity-70">
                <div className="flex items-center gap-1">
                  <span>🎬</span>
                  <span>{montage.clip_count} clips</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{Math.round(montage.total_duration)}s</span>
                </div>
              </div>

              {montage.renders && Object.keys(montage.renders).length > 0 ? (
                <div className="space-y-2">
                  <video
                    src={montage.renders.landscape || montage.renders.portrait || Object.values(montage.renders)[0]}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: '200px' }}
                  />
                  <div className="flex gap-2">
                    {montage.renders.landscape && (
                      <a
                        href={montage.renders.landscape}
                        download
                        className="flex-1 px-4 py-3 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide text-sm text-center hover:opacity-90 transition-opacity"
                      >
                        📐   L A N D S C A P E
                      </a>
                    )}
                    {montage.renders.portrait && (
                      <a
                        href={montage.renders.portrait}
                        download
                        className="flex-1 px-4 py-3 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide text-sm text-center hover:opacity-90 transition-opacity"
                      >
                        📱   P O R T R A I T
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-pure-white/5 border-2 border-pure-white/20 p-12 text-center">
                  <div className="text-4xl mb-4">⏳</div>
                  <div className="text-sm font-black tracking-wide">R E N D E R I N G   I N   P R O G R E S S . . .</div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

