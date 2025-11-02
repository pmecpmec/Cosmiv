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
    
    // Track view for analytics
    try {
      await fetch(`/api/v2/analytics/track-view/${jobId}`, { method: "POST" });
    } catch (e) {
      // Silent fail
    }
    
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
      <h3 className="gradient-text-cosmic text-3xl font-black mb-8 tracking-poppr">A N A L Y T I C S   D A S H B O A R D</h3>
      {error && <div className="border-2 border-pure-white bg-pure-white text-pure-black p-4 mb-6 font-black tracking-wide">{error}</div>}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card label="Total Jobs" value={summary.total_jobs} />
          <Card label="Success" value={summary.success_jobs} />
          <Card label="Failed" value={summary.failed_jobs} />
        </div>
      )}

      {/* Trend Chart */}
      <div className="broken-planet-card p-6 mb-8">
        <div className="text-pure-white font-black mb-6 text-xl tracking-wide uppercase">Job Activity Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
            <XAxis dataKey="date" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: "#000000", border: "2px solid #ffffff", color: "#ffffff" }} />
            <Line type="monotone" dataKey="jobs" stroke="#ffffff" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Jobs */}
      <div className="broken-planet-card p-6">
        <div className="text-pure-white font-black mb-4 text-xl tracking-wide uppercase">Recent Jobs</div>
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.job_id} className="flex items-center justify-between text-sm text-pure-white/70 broken-planet-card p-4 mb-3">
              <div className="flex-1">
                <div className="text-pure-white font-black text-xs tracking-wide mb-1">{j.job_id}</div>
                <div className="font-bold">Status: <span className={j.status==="SUCCESS"?"text-pure-white":j.status==="FAILED"?"text-pure-white/50":"text-pure-white/70"}>{j.status}</span></div>
                <div className="text-xs text-pure-white/50 font-bold">Stage: {j.stage || "-"}</div>
                <div className="text-xs text-pure-white/50 font-bold">Progress: {typeof j.progress === "number" ? `${j.progress}%` : "-"}</div>
              </div>
              <div className="flex gap-2">
                {["landscape","portrait"].map((fmt)=> (
                  <button key={fmt} onClick={async ()=>{ const u = await downloadUrl(j.job_id, fmt); window.open(u, "_blank"); }} className="px-4 py-2 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black border-2 border-cosmic-neon-cyan/50 hover:neon-glow-cyan transition-all tracking-wide text-xs neon-glow chromatic-aberration">
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {jobs.length===0 && <div className="text-pure-white/50 font-bold tracking-wide">N O   J O B S   Y E T</div>}
        </div>
      </div>
    </div>
  );
}

function Card({label, value}){
  return (
    <div className="broken-planet-card p-6 text-center float">
      <div className="text-cosmic-neon-cyan/70 text-xs font-black tracking-wide uppercase mb-2">{label}</div>
      <div className="gradient-text-cosmic text-3xl font-black">{value}</div>
    </div>
  );
}
