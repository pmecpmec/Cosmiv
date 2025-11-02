import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

export default function Billing() {
  const { getAuthHeaders, user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check for Stripe success callback
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get("success");
    const sessionId = urlParams.get("session_id");
    
    if (successParam === "true" && sessionId) {
      handleCheckoutSuccess(sessionId);
    } else if (urlParams.get("canceled") === "true") {
      setError("Checkout was canceled");
    }
    
    loadPlans();
    loadEntitlement();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await fetch("/api/v2/billing/plans");
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      setError("Failed to load plans");
    }
  };

  const loadEntitlement = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch("/api/v2/billing/entitlements", { headers });
      const data = await res.json();
      setCurrentPlan(data);
    } catch (err) {
      setError("Failed to load current plan");
    }
  };

  const handleCheckout = async (planId) => {
    if (planId === "free") {
      // Free plan - just set it directly
      await setEntitlementDirect(planId);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = getAuthHeaders();
      const formData = new FormData();
      formData.append("plan", planId);

      const res = await fetch("/api/v2/billing/checkout", {
        method: "POST",
        headers: {
          ...headers,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Checkout failed" }));
        throw new Error(errorData.detail || "Failed to create checkout");
      }

      const data = await res.json();

      if (data.mode === "mock") {
        // Mock mode - simulate success
        await setEntitlementDirect(planId);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // Real Stripe - redirect to checkout
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      setError(err.message || "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutSuccess = async (sessionId) => {
    try {
      const headers = getAuthHeaders();
      const formData = new FormData();
      formData.append("session_id", sessionId);

      const res = await fetch("/api/v2/billing/checkout/success", {
        method: "POST",
        headers: {
          ...headers,
        },
        body: formData,
      });

      if (res.ok) {
        setSuccess(true);
        await loadEntitlement();
        // Clean URL
        window.history.replaceState({}, document.title, "/billing");
      }
    } catch (err) {
      setError("Failed to verify checkout");
    }
  };

  const setEntitlementDirect = async (plan) => {
    // Direct entitlement setting (for free plan or admin/testing)
    try {
      const headers = getAuthHeaders();
      const formData = new FormData();
      formData.append("user_id", user?.user_id || "");
      formData.append("plan", plan);

      await fetch("/api/v2/billing/entitlements", {
        method: "POST",
        headers: {
          ...headers,
        },
        body: formData,
      });

      await loadEntitlement();
    } catch (err) {
      setError("Failed to update plan");
    }
  };

  const getPlanHighlight = (planId) => {
    if (planId === "creator") return "border-pure-white bg-pure-white text-pure-black";
    if (planId === "pro") return "border-pure-white/50 bg-pure-white/10 text-pure-white";
    return "border-pure-white/20 bg-pure-white/5 text-pure-white";
  };

  return (
    <div className="broken-planet-card rounded-2xl p-12 float">
      <h2 className="text-4xl font-black gradient-text-cosmic mb-12 tracking-poppr text-center">💳   B I L L I N G   &   S U B S C R I P T I O N</h2>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 border-2 border-pure-white bg-pure-white text-pure-black"
        >
          <p className="font-black tracking-wide">⚠️ {error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 border-2 border-pure-white bg-pure-white text-pure-black"
        >
          <p className="font-black tracking-wide">✅ Subscription activated successfully!</p>
        </motion.div>
      )}

      {currentPlan && (
        <div className="mb-8 p-6 border-2 border-cosmic-neon-cyan/40 bg-cosmic-violet/20 text-pure-white backdrop-blur-sm neon-glow-cyan broken-planet-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-xl tracking-wide uppercase mb-2">
                Current Plan: {currentPlan.plan === "free" ? "Cosmic Cadet" : currentPlan.plan === "pro" ? "Nebula Knight" : currentPlan.plan === "creator" ? "Creator+" : currentPlan.plan.toUpperCase()}
              </div>
              {currentPlan.expires_at && (
                <div className="text-pure-white/70 text-sm mt-1 font-bold">
                  Expires: {new Date(currentPlan.expires_at).toLocaleDateString()}
                </div>
              )}
              {!currentPlan.is_active && (
                <div className="text-pure-white/70 text-sm mt-2 font-black tracking-wide">⚠️ Subscription expired</div>
              )}
            </div>
            {currentPlan.is_active && (
              <div className="px-4 py-2 bg-cosmic-neon-cyan text-pure-black border-2 border-cosmic-neon-cyan font-black tracking-wide text-sm">
                A C T I V E
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
            <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`border-2 p-8 relative broken-planet-card ${getPlanHighlight(p.id)}`}
          >
            {p.id === "creator" && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-cosmic-neon-cyan text-pure-black border-2 border-cosmic-neon-cyan font-black tracking-wide text-xs neon-glow-cyan">
                M O S T   P O P U L A R
              </div>
            )}
            
            <div className="text-3xl font-black mb-3 tracking-wide uppercase gradient-text-cosmic">{p.name === "Cosmic Cadet" ? "Cosmic Cadet" : p.name === "Nebula Knight" ? "Nebula Knight" : p.name}</div>
            <div className="text-5xl font-black mb-4">
              ${p.price}
              {p.price > 0 && <span className="text-xl opacity-70">/month</span>}
            </div>
            
            <ul className="space-y-3 mb-8 mt-6">
              {p.features.map((f, i) => (
                <li key={i} className="text-sm flex items-center gap-3 font-bold">
                  <span>✓</span> <span>{f}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleCheckout(p.id)}
              disabled={loading || currentPlan?.plan === p.id}
              className={`w-full font-black py-4 border-2 transition-all tracking-wide ${
                currentPlan?.plan === p.id
                  ? "bg-pure-white/20 text-pure-white/50 cursor-not-allowed border-pure-white/20"
                  : p.price === 0
                  ? "bg-pure-white/10 hover:bg-pure-white/20 text-pure-white border-pure-white/20 hover:opacity-90"
                  : "bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white border-cosmic-neon-cyan/50 hover:shadow-lg hover:shadow-cosmic-neon-cyan/30 neon-glow hover:neon-glow-cyan chromatic-aberration"
              }`}
            >
              {loading ? (
                "P R O C E S S I N G . . ."
              ) : currentPlan?.plan === p.id ? (
                "C U R R E N T   P L A N"
              ) : p.price === 0 ? (
                "S E L E C T   F R E E"
              ) : (
                `S U B S C R I B E   T O   ${p.name.toUpperCase()}`
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-8 p-6 border-2 border-cosmic-neon-cyan/30 bg-cosmic-deep-blue/10 text-cosmic-neon-cyan/90 backdrop-blur-sm broken-planet-card neon-glow-cyan">
        <div className="font-black mb-3 tracking-wide uppercase text-sm">ℹ️   P A Y M E N T   I N F O R M A T I O N</div>
        <div className="font-bold">
          {process.env.NODE_ENV === "production" ? (
            "Secure payments powered by Stripe. Your subscription will auto-renew monthly."
          ) : (
            "Demo mode: Stripe integration ready. Set STRIPE_SECRET_KEY to enable real payments."
          )}
        </div>
      </div>
    </div>
  );
}

