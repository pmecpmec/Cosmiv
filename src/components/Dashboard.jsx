import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../utils/apiClient'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    activeJobs: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Try to fetch stats from analytics endpoint
      const response = await apiClient.get('/analytics/summary')
      if (response.data) {
        setStats({
          totalVideos: response.data.total_jobs || 0,
          totalViews: response.data.success_jobs || 0, // Use successful jobs as views proxy
          activeJobs: (response.data.total_jobs || 0) - (response.data.success_jobs || 0) - (response.data.failed_jobs || 0),
        })
      }
    } catch (error) {
      // If endpoint doesn't exist, use default values
      console.error('Failed to fetch stats:', error)
      setStats({
        totalVideos: 0,
        totalViews: 0,
        activeJobs: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cosmic-neon-cyan">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-display text-gradient-cosmic mb-2">
            Dashboard
          </h1>
          <p className="text-pure-white/60 mb-8">
            Welcome back, {user?.username || user?.email}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Videos', value: stats.totalVideos, icon: '🎬' },
            { label: 'Total Views', value: stats.totalViews, icon: '👁️' },
            { label: 'Active Jobs', value: stats.activeJobs, icon: '⚡' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-effect p-6 rounded-xl"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-cosmic-neon-cyan mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-pure-white/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect p-8 rounded-xl"
        >
          <h2 className="text-2xl font-semibold mb-6 text-cosmic-neon-cyan">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/upload"
              className="px-6 py-3 bg-cosmic-violet hover:glow-neon rounded-lg transition-all"
            >
              Upload New Video
            </Link>
            <button className="px-6 py-3 glass-effect border border-cosmic-violet/50 hover:border-cosmic-violet rounded-lg transition-all">
              View History
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

