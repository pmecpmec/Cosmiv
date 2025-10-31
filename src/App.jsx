import { useState } from 'react'
import UploadForm from './components/UploadForm'
import Dashboard from './components/Dashboard'
import Accounts from './components/Accounts'
import Billing from './components/Billing'
import Social from './components/Social'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState("upload")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎬 Aiditor
          </h1>
          <p className="text-xl text-gray-300">
            AI-Powered Highlight Video Editor
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex gap-2 border-b border-white/20">
            {[
              { id: "upload", label: "Upload", icon: "⬆️" },
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "accounts", label: "Accounts", icon: "🔗" },
              { id: "billing", label: "Billing", icon: "💳" },
              { id: "social", label: "Social", icon: "📱" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-purple-400 text-purple-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl mx-auto">
          {activeTab === "upload" && (
            <div className="max-w-3xl mx-auto">
              <UploadForm />
            </div>
          )}
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "accounts" && <Accounts />}
          {activeTab === "billing" && <Billing />}
          {activeTab === "social" && <Social />}
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  )
}

export default App

