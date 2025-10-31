import { useState } from "react";

export default function Social() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState("");

  const schedulePost = async (platform) => {
    if (!jobId.trim()) {
      setError("Please enter a job ID");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("job_id", jobId);
      formData.append("platform", platform);
      const res = await fetch("/api/v2/social/post", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        alert(`Scheduled! ID: ${data.schedule_id}`);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-white text-xl font-semibold mb-4">Schedule Social Post</h3>
      {error && <div className="text-red-400 text-sm mb-3">⚠️ {error}</div>}

      {/* Job ID input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-2">Job ID</label>
        <input
          type="text"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          placeholder="Enter job_id from a completed render"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500"
        />
      </div>

      {/* Platforms grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {["tiktok", "youtube", "instagram"].map((p) => (
          <button
            key={p}
            onClick={() => schedulePost(p)}
            disabled={loading || !jobId.trim()}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-6 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Note */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-200 text-sm">
        ⚠️ Mock posting: in production integrates real APIs with auto-generated captions/hashtags via LLM.
      </div>
    </div>
  );
}

