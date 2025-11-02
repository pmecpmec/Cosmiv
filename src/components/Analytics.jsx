import { useEffect, useState } from "react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useAuth } from '../contexts/AuthContext'

export default function Analytics() {
  const { getAuthHeaders } = useAuth()
  const [stats, setStats] = useState(null)
  const [timeSeries, setTimeSeries] = useState([])
  const [topStyles, setTopStyles] = useState([])
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const headers = getAuthHeaders()
      
      // Load user stats
      const statsRes = await fetch("/api/v2/analytics/user/stats", { headers })
      const statsData = await statsRes.json()
      setStats(statsData)
      
      // Load time series
      const tsRes = await fetch("/api/v2/analytics/time-series?days=7&metric=jobs", { headers })
      const tsData = await tsRes.json()
      setTimeSeries(tsData.data || [])
      
      // Load top styles
      const stylesRes = await fetch("/api/v2/analytics/styles/top?limit=5")
      const stylesData = await stylesRes.json()
      setTopStyles(stylesData.styles || [])
      
      // Load recommendation
      const recRes = await fetch("/api/v2/analytics/recommendations/style", { headers })
      const recData = await recRes.json()
      setRecommendation(recData)
      
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="text-white text-center">Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-pure-white/5 border-2 border-pure-white/20 p-12">
        <div className="border-2 border-pure-white bg-pure-white text-pure-black p-6 font-black tracking-wide">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-pure-white/5 border-2 border-pure-white/20 p-12">
        <h2 className="text-4xl font-black text-pure-white mb-12 tracking-poppr text-center">📊   A N A L Y T I C S   D A S H B O A R D</h2>
        
        {recommendation && recommendation.recommended_style && (
          <div className="mb-8 p-8 border-2 border-pure-white bg-pure-white text-pure-black">
            <div className="font-black mb-3 tracking-wide uppercase text-sm">✨   A I   R E C O M M E N D A T I O N</div>
            <div className="font-bold text-lg mb-2">
              Best style for you: <span className="font-black">{recommendation.recommended_style}</span>
            </div>
            <div className="text-sm mt-2 font-bold">{recommendation.reason}</div>
            {recommendation.performance_score && (
              <div className="text-sm mt-3 font-black tracking-wide">
                Performance Score: {recommendation.performance_score.toFixed(1)}/100
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard 
              label="Total Jobs" 
              value={stats.jobs?.total || 0}
              icon="🎬"
            />
            <StatCard 
              label="Success Rate" 
              value={`${(stats.jobs?.success_rate || 0).toFixed(1)}%`}
              icon="✅"
            />
            <StatCard 
              label="Total Views" 
              value={stats.engagement?.total_views || 0}
              icon="👁️"
            />
            <StatCard 
              label="Engagement" 
              value={`${(stats.engagement?.avg_engagement_rate || 0).toFixed(1)}%`}
              icon="❤️"
            />
          </div>
        )}

        {/* Job Stats Details */}
        {stats && stats.jobs && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-pure-white/5 border-2 border-pure-white/20 p-6">
              <div className="text-pure-white/70 text-sm mb-2 font-black tracking-wide uppercase">Successful</div>
              <div className="text-pure-white text-3xl font-black">{stats.jobs.successful}</div>
            </div>
            <div className="bg-pure-white/5 border-2 border-pure-white/20 p-6">
              <div className="text-pure-white/70 text-sm mb-2 font-black tracking-wide uppercase">Failed</div>
              <div className="text-pure-white text-3xl font-black">{stats.jobs.failed}</div>
            </div>
            <div className="bg-pure-white/5 border-2 border-pure-white/20 p-6">
              <div className="text-pure-white/70 text-sm mb-2 font-black tracking-wide uppercase">Avg Processing</div>
              <div className="text-pure-white text-3xl font-black">
                {stats.jobs.avg_processing_time 
                  ? `${(stats.jobs.avg_processing_time / 60).toFixed(1)}m`
                  : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Time Series Chart */}
        {timeSeries.length > 0 && (
          <div className="mb-6 bg-white/5 rounded-xl p-4">
            <div className="text-white font-semibold mb-4">Job Activity (Last 7 Days)</div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="date" stroke="#fff" tick={{ fill: '#fff' }} />
                <YAxis stroke="#fff" tick={{ fill: '#fff' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1e293b", 
                    border: "1px solid #ffffff30", 
                    borderRadius: "8px",
                    color: '#fff'
                  }} 
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Jobs Created"
                />
                <Line 
                  type="monotone" 
                  dataKey="success" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Successful"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Performing Styles */}
        {topStyles.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-white font-semibold mb-4">🏆 Top Performing Styles</div>
            <div className="space-y-2">
              {topStyles.map((style, idx) => (
                <div 
                  key={style.style_id}
                  className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">#{idx + 1}</div>
                    <div>
                      <div className="text-white font-semibold">{style.style_name || style.style_id}</div>
                      <div className="text-gray-400 text-xs">
                        {style.total_jobs} jobs • {style.avg_engagement_rate?.toFixed(1)}% engagement
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-400 font-bold">
                      {style.performance_score?.toFixed(0)}/100
                    </div>
                    <div className="text-gray-400 text-xs">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Engagement Breakdown */}
        {stats && stats.engagement && (
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-white font-semibold mb-4">💚 Engagement Breakdown</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">{stats.engagement.total_likes || 0}</div>
                <div className="text-gray-400 text-sm">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{stats.engagement.total_shares || 0}</div>
                <div className="text-gray-400 text-sm">Shares</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {stats.social?.total_posts || 0}
                </div>
                <div className="text-gray-400 text-sm">Posts</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <div className="text-gray-300 text-sm">{label}</div>
      </div>
      <div className="text-white text-2xl font-bold">{value}</div>
    </div>
  )
}

