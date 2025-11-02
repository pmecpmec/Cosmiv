import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function AdminDashboard() {
  const { getAuthHeaders } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [analytics, setAnalytics] = useState(null)
  const [queue, setQueue] = useState(null)
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [montages, setMontages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [activeTab])

  const loadData = async () => {
    try {
      const headers = getAuthHeaders()
      
      if (activeTab === 'overview' || activeTab === 'analytics') {
        const res = await fetch('/api/admin/analytics', { headers })
        if (!res.ok) throw new Error('Failed to load analytics')
        setAnalytics(await res.json())
      }
      
      if (activeTab === 'overview' || activeTab === 'queue') {
        const res = await fetch('/api/admin/queue', { headers })
        if (!res.ok) throw new Error('Failed to load queue')
        setQueue(await res.json())
      }
      
      if (activeTab === 'users') {
        const url = userSearch 
          ? `/api/admin/users?search=${encodeURIComponent(userSearch)}&limit=100`
          : '/api/admin/users?limit=100'
        const res = await fetch(url, { headers })
        if (!res.ok) throw new Error('Failed to load users')
        const data = await res.json()
        setUsers(data.users || [])
      }
      
      if (activeTab === 'jobs') {
        const res = await fetch('/api/admin/jobs?limit=100', { headers })
        if (!res.ok) throw new Error('Failed to load jobs')
        const data = await res.json()
        setJobs(data.jobs || [])
      }
      
      if (activeTab === 'weekly') {
        const res = await fetch('/api/v2/weekly-montages?limit=50', { headers })
        if (!res.ok) throw new Error('Failed to load weekly montages')
        const data = await res.json()
        setMontages(data.montages || [])
      }
      
      setLoading(false)
      setError(null)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const toggleUserActive = async (userId, currentStatus) => {
    try {
      const headers = getAuthHeaders()
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })
      if (!res.ok) throw new Error('Failed to update user')
      loadData()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const toggleUserAdmin = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin access?`)) {
      return
    }
    try {
      const headers = getAuthHeaders()
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_admin: !currentStatus }),
      })
      if (!res.ok) throw new Error('Failed to update user')
      loadData()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'queue', label: 'AI Queue', icon: '⚙️' },
    { id: 'jobs', label: 'All Jobs', icon: '🎬' },
    { id: 'weekly', label: 'Weekly Montages', icon: '📹' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ]

  if (loading && !analytics && !queue) {
    return (
      <div className="bg-pure-white/5 border-2 border-pure-white/20 p-12">
        <div className="text-center text-pure-white font-black text-xl tracking-wide">L O A D I N G   A D M I N   D A S H B O A R D . . .</div>
      </div>
    )
  }

  return (
    <div className="bg-pure-white/5 border-2 border-pure-white/20 p-12">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-4xl font-black text-pure-white tracking-poppr">⚙️   A D M I N   D A S H B O A R D</h2>
        <button
          onClick={loadData}
          className="px-6 py-3 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide hover:opacity-90 transition-opacity"
        >
          🔄   R E F R E S H
        </button>
      </div>

      {error && (
        <div className="mb-6 p-6 border-2 border-pure-white bg-pure-white text-pure-black">
          <p className="font-black tracking-wide">⚠️ {error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 mb-8 border-b-2 border-pure-white/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-black transition-all border-b-2 tracking-wide ${
              activeTab === tab.id
                ? "border-pure-white text-pure-white bg-pure-white/10"
                : "border-transparent text-pure-white/50 hover:text-pure-white hover:border-pure-white/30"
            }`}
          >
            {tab.icon} {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={analytics.users?.total || 0} icon="👥" />
            <StatCard label="Active Users" value={analytics.users?.active || 0} icon="✅" />
            <StatCard label="Total Jobs" value={analytics.jobs?.total || 0} icon="🎬" />
            <StatCard 
              label="Success Rate" 
              value={`${(analytics.jobs?.success_rate || 0).toFixed(1)}%`} 
              icon="📊" 
            />
          </div>

          {/* Queue Status */}
          {queue && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-3">AI Queue Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Pending</div>
                  <div className="text-2xl font-bold text-yellow-400">{queue.pending?.total || 0}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Processing</div>
                  <div className="text-2xl font-bold text-blue-400">{queue.processing?.total || 0}</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-3">Recent Activity (24h)</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">New Jobs</div>
                <div className="text-xl font-bold text-white">{analytics.jobs?.recent_24h || 0}</div>
              </div>
              <div>
                <div className="text-gray-400">New Users</div>
                <div className="text-xl font-bold text-white">{analytics.users?.recent_24h || 0}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadData()}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
            />
            <button
              onClick={loadData}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
            >
              Search
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-2 text-gray-300">Username</th>
                  <th className="text-left p-2 text-gray-300">Email</th>
                  <th className="text-left p-2 text-gray-300">Status</th>
                  <th className="text-left p-2 text-gray-300">Admin</th>
                  <th className="text-left p-2 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} className="border-b border-white/10">
                    <td className="p-2 text-white">{user.username || 'N/A'}</td>
                    <td className="p-2 text-gray-400">{user.email || 'N/A'}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.is_active 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-2">
                      {user.is_admin && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleUserActive(user.user_id, user.is_active)}
                          className={`px-2 py-1 rounded text-xs ${
                            user.is_active
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          }`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => toggleUserAdmin(user.user_id, user.is_admin)}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs hover:bg-purple-500/30"
                        >
                          {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Queue Tab */}
      {activeTab === 'queue' && queue && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Pending Jobs */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              Pending Jobs ({queue.pending?.total || 0})
            </h3>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-h-64 overflow-y-auto">
              {queue.pending?.jobs?.length > 0 ? (
                queue.pending.jobs.map((job) => (
                  <div key={job.job_id} className="mb-2 p-2 bg-white/5 rounded">
                    <div className="text-white text-sm font-mono">{job.job_id}</div>
                    <div className="text-gray-400 text-xs">{job.target_duration}s • {new Date(job.created_at).toLocaleString()}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-4">No pending jobs</div>
              )}
            </div>
          </div>

          {/* Processing Jobs */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              Processing Jobs ({queue.processing?.total || 0})
            </h3>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-h-64 overflow-y-auto">
              {queue.processing?.jobs?.length > 0 ? (
                queue.processing.jobs.map((job) => {
                  const progress = job.progress ? JSON.parse(job.progress) : null
                  return (
                    <div key={job.job_id} className="mb-2 p-2 bg-white/5 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-white text-sm font-mono">{job.job_id}</div>
                        {progress && (
                          <div className="text-purple-400 text-xs">{progress.percentage}%</div>
                        )}
                      </div>
                      {progress && (
                        <div className="text-gray-400 text-xs mb-2">{progress.message}</div>
                      )}
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div
                          className="bg-purple-500 h-1 rounded-full transition-all"
                          style={{ width: `${progress?.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-gray-400 text-center py-4">No processing jobs</div>
              )}
            </div>
          </div>

          {/* Recent Failures */}
          {queue.recent_failures?.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Recent Failures</h3>
              <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20 max-h-64 overflow-y-auto">
                {queue.recent_failures.map((job) => (
                  <div key={job.job_id} className="mb-2 p-2 bg-red-500/10 rounded">
                    <div className="text-white text-sm font-mono">{job.job_id}</div>
                    <div className="text-red-300 text-xs mt-1">{job.error}</div>
                    <div className="text-gray-400 text-xs mt-1">{new Date(job.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-2 text-gray-300">Job ID</th>
                  <th className="text-left p-2 text-gray-300">Status</th>
                  <th className="text-left p-2 text-gray-300">Duration</th>
                  <th className="text-left p-2 text-gray-300">Created</th>
                  <th className="text-left p-2 text-gray-300">Progress</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const progress = job.progress ? JSON.parse(job.progress) : null
                  return (
                    <tr key={job.job_id} className="border-b border-white/10">
                      <td className="p-2 text-white font-mono text-xs">{job.job_id}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          job.status === 'SUCCESS' ? 'bg-green-500/20 text-green-300' :
                          job.status === 'FAILED' ? 'bg-red-500/20 text-red-300' :
                          job.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-2 text-gray-400">{job.target_duration}s</td>
                      <td className="p-2 text-gray-400 text-xs">{new Date(job.created_at).toLocaleString()}</td>
                      <td className="p-2">
                        {progress ? (
                          <div className="text-xs">
                            <div className="text-purple-400">{progress.percentage}%</div>
                            <div className="text-gray-500">{progress.stage}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Weekly Montages Tab */}
      {activeTab === 'weekly' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Weekly Montages</h3>
            <button
              onClick={async () => {
                if (!confirm('Trigger weekly montage compilation now?')) return
                try {
                  const headers = getAuthHeaders()
                  const res = await fetch('/api/v2/weekly-montages/compile', {
                    method: 'POST',
                    headers,
                  })
                  if (!res.ok) throw new Error('Failed to trigger compilation')
                  alert('Compilation started!')
                  loadData()
                } catch (err) {
                  alert(`Error: ${err.message}`)
                }
              }}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
            >
              ⚡ Compile Now
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-2 text-gray-300">Title</th>
                  <th className="text-left p-2 text-gray-300">Week</th>
                  <th className="text-left p-2 text-gray-300">Clips</th>
                  <th className="text-left p-2 text-gray-300">Duration</th>
                  <th className="text-left p-2 text-gray-300">Featured</th>
                  <th className="text-left p-2 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {montages.map((m) => (
                  <tr key={m.id} className="border-b border-white/10">
                    <td className="p-2 text-white">{m.title}</td>
                    <td className="p-2 text-gray-400 text-xs">
                      {new Date(m.week_start).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-gray-400">{m.clip_count}</td>
                    <td className="p-2 text-gray-400">{Math.round(m.total_duration)}s</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        m.is_featured 
                          ? 'bg-yellow-500/20 text-yellow-300' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {m.is_featured ? '⭐ Featured' : 'No'}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const headers = getAuthHeaders()
                              const res = await fetch(`/api/v2/weekly-montages/${m.id}/feature`, {
                                method: 'PATCH',
                                headers: { ...headers, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ is_featured: !m.is_featured }),
                              })
                              if (!res.ok) throw new Error('Failed to update')
                              loadData()
                            } catch (err) {
                              alert(`Error: ${err.message}`)
                            }
                          }}
                          className={`px-2 py-1 rounded text-xs ${
                            m.is_featured
                              ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                              : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                          }`}
                        >
                          {m.is_featured ? 'Unfeature' : 'Feature'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard label="Total Users" value={analytics.users?.total || 0} icon="👥" />
            <StatCard label="Active Users" value={analytics.users?.active || 0} icon="✅" />
            <StatCard label="Total Jobs" value={analytics.jobs?.total || 0} icon="🎬" />
            <StatCard label="Success Rate" value={`${(analytics.jobs?.success_rate || 0).toFixed(1)}%`} icon="📊" />
            <StatCard label="Free Tier" value={analytics.revenue?.free_tier || 0} icon="🆓" />
            <StatCard label="Pro Tier" value={analytics.revenue?.pro_tier || 0} icon="💎" />
          </div>

          {/* Chart Placeholder */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 h-64">
            <div className="text-center text-gray-400 py-16">
              Charts coming soon...
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/5 rounded-xl p-4 border border-white/10"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gray-400 text-sm mb-1">{label}</div>
          <div className="text-2xl font-bold text-white">{value}</div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </motion.div>
  )
}

