import { useEffect, useState } from "react";

export default function Billing() {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState("demo");

  useEffect(() => {
    loadPlans();
    loadEntitlement();
  }, []);

  const loadPlans = async () => {
    const res = await fetch("/api/v2/billing/plans");
    const data = await res.json();
    setPlans(data.plans || []);
  };

  const loadEntitlement = async () => {
    const res = await fetch(`/api/v2/billing/entitlements?user_id=${userId}`);
    const data = await res.json();
    setCurrentPlan(data);
  };

  const setEntitlement = async (plan) => {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("plan", plan);
    await fetch("/api/v2/billing/entitlements", { method: "POST", body: formData });
    await loadEntitlement();
  };

  return (
    <div>
      <h3 className="text-white text-xl font-semibold mb-4">Subscription Plans</h3>
      {error && <div className="text-red-400 text-sm mb-3">⚠️ {error}</div>}

      {currentPlan && (
        <div className="bg-cosmic-violet/20 border border-cosmic-violet/40 rounded-xl p-4 mb-6 backdrop-blur-sm">
          <div className="text-white font-semibold">Current: {currentPlan.plan === "free" ? "Cosmic Cadet" : currentPlan.plan === "pro" ? "Nebula Knight" : currentPlan.plan.toUpperCase()}</div>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-2 gap-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`bg-white/10 border rounded-xl p-6 backdrop-blur-sm hover:border-cosmic-neon-cyan/50 transition-all ${
              p.price === 0 ? "border-white/20" : "border-cosmic-violet/50"
            }`}
          >
            <div className="text-white text-xl font-semibold mb-2 bg-gradient-to-r from-cosmic-violet to-cosmic-neon-cyan bg-clip-text text-transparent">{p.name}</div>
            <div className="text-white text-3xl font-bold mb-4">
              ${p.price}
              {p.price > 0 && <span className="text-sm">/month</span>}
            </div>
            <ul className="space-y-2 mb-4">
              {p.features.map((f, i) => (
                <li key={i} className="text-gray-300 text-sm">✓ {f}</li>
              ))}
            </ul>
            <button
              onClick={() => setEntitlement(p.id)}
              className="w-full bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-semibold py-2 rounded-lg transition-all shadow-lg shadow-cosmic-violet/30"
            >
              {currentPlan?.plan === p.id ? "Current Plan" : "Select"}
            </button>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="mt-6 bg-cosmic-deep-blue/10 border border-cosmic-neon-cyan/30 rounded-xl p-4 text-cosmic-neon-cyan/80 text-sm backdrop-blur-sm">
        ℹ️ Demo mode: set plan via test endpoint. Production uses Stripe checkout sessions.
      </div>
    </div>
  );
}

