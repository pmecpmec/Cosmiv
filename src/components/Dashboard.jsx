import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await fetch("/api/analytics/summary");
        const sData = await s.json();
        setSummary(sData);
        const j = await fetch("/api/v2/jobs");
        const jData = await j.json();
        setJobs(jData.jobs || []);
      } catch (e) {
        setError(e.message || "Failed to load dashboard");
      }
    };
    load();
  }, []);

  const downloadUrl = async (jobId, format) => {
    const r = await fetch(`/api/v2/jobs/${jobId}/download?format=${format}`);
    const d = await r.json();
    return d.url || d.path;
  };

  // Mock data for trend chart
  const chartData = [
    { date: "Mon", jobs: summary?.total_jobs || 0 },
    { date: "Tue", jobs: (summary?.total_jobs || 0) + 2 },
    { date: "Wed", jobs: (summary?.total_jobs || 0) + 4 },
    { date: "Thu", jobs: (summary?.total_jobs || 0) + 3 },
  ];

  return (
    <div>
      <h3 className="text-white text-xl font-semibold mb-4">Analytics Dashboard</h3>
      {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card label="Total Jobs" value={summary.total_jobs} />
          <Card label="Success" value={summary.success_jobs} />
          <Card label="Failed" value={summary.failed_jobs} />
        </div>
      )}

      {/* Trend Chart */}
      <div className="bg-white/10 border border-white/20 rounded-xl p-4 mb-6">
        <div className="text-white font-semibold mb-4">Job Activity Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="date" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #ffffff30", borderRadius: "8px" }} />
            <Line type="monotone" dataKey="jobs" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white/10 border border-white/20 rounded-xl p-4">
        <div className="text-white font-semibold mb-2">Recent Jobs</div>
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.job_id} className="flex items-center justify-between text-sm text-gray-300 bg-white/5 rounded-lg p-3">
              <div className="flex-1">
                <div className="text-white font-mono text-xs">{j.job_id}</div>
                <div>Status: <span className={j.status==="SUCCESS"?"text-green-400":"text-yellow-300"}>{j.status}</span></div>
              </div>
              <div className="flex gap-2">
                {["landscape","portrait"].map((fmt)=> (
                  <button key={fmt} onClick={async ()=>{ const u = await downloadUrl(j.job_id, fmt); window.open(u, "_blank"); }} className="px-3 py-1 bg-blue-500/70 hover:bg-blue-600 text-white rounded">
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {jobs.length===0 && <div className="text-gray-400 text-sm">No jobs yet.</div>}
        </div>
      </div>
    </div>
  );
}

function Card({label, value}){
  return (
    <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
      <div className="text-gray-300 text-xs">{label}</div>
      <div className="text-white text-2xl font-bold">{value}</div>
    </div>
  );
}
