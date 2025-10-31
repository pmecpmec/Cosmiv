import { useEffect, useState } from "react";

export default function Accounts() {
  const [providers, setProviders] = useState([]);
  const [links, setLinks] = useState([]);
  const [clips, setClips] = useState([]);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState("demo");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProviders();
    loadLinks();
  }, []);

  const loadProviders = async () => {
    const res = await fetch("/api/v2/accounts/providers");
    const data = await res.json();
    setProviders(data.providers || []);
  };

  const loadLinks = async () => {
    const res = await fetch(`/api/v2/accounts/links?user_id=${userId}`);
    const data = await res.json();
    setLinks(data.links || []);
  };

  const linkProvider = async (provider) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("provider", provider);
      formData.append("access_token", "mock-token");
      const res = await fetch("/api/v2/accounts/link", { method: "POST", body: formData });
      if (res.ok) {
        await loadLinks();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const syncNow = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      await fetch("/api/v2/accounts/sync", { method: "POST", body: formData });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const linkedIds = links.map((l) => l.provider);

  return (
    <div>
      <h3 className="text-white text-xl font-semibold mb-4">Game Account Linking</h3>
      {error && <div className="text-red-400 text-sm mb-3">⚠️ {error}</div>}

      {/* Providers grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {providers.map((p) => (
          <div
            key={p.id}
            className="bg-white/10 border border-white/20 rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <div className="text-white font-semibold">{p.name}</div>
              {linkedIds.includes(p.id) && (
                <div className="text-green-400 text-sm">✓ Linked</div>
              )}
            </div>
            <button
              onClick={() => linkProvider(p.id)}
              disabled={loading || linkedIds.includes(p.id)}
              className="px-3 py-1 bg-purple-500/70 hover:bg-purple-600 text-white rounded text-sm disabled:opacity-50"
            >
              {linkedIds.includes(p.id) ? "Linked" : "Link"}
            </button>
          </div>
        ))}
      </div>

      {/* Sync button */}
      {links.length > 0 && (
        <div className="mb-6">
          <button
            onClick={syncNow}
            disabled={loading}
            className="w-full bg-emerald-500/70 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? "⏳ Syncing..." : "🔄 Sync All Clips Now"}
          </button>
        </div>
      )}

      {/* Note */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-200 text-sm">
        ⚠️ Demo mode: using mock providers. Production would integrate real OAuth flows.
      </div>
    </div>
  );
}

