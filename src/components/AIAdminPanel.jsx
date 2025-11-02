import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"

export default function AIAdminPanel() {
  const { getAuthHeaders, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState("content")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Content Renewal State
  const [contentType, setContentType] = useState("landing_hero")
  const [generatedContent, setGeneratedContent] = useState(null)
  
  // Code Generation State
  const [codeType, setCodeType] = useState("frontend")
  const [codeDescription, setCodeDescription] = useState("")
  const [generatedCode, setGeneratedCode] = useState(null)
  
  // UX Analysis State
  const [componentPath, setComponentPath] = useState("")
  const [uxAnalysis, setUxAnalysis] = useState(null)
  
  // Video Enhancement State
  const [jobId, setJobId] = useState("")
  const [enhancementType, setEnhancementType] = useState("captions")

  if (!isAdmin) {
    return (
      <div className="bg-pure-white/5 border-2 border-pure-white/20 p-12">
        <div className="text-pure-white font-black text-2xl tracking-poppr text-center">
          A D M I N   A C C E S S   R E Q U I R E D
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "content", label: "Content Renewal", icon: "📝" },
    { id: "code", label: "Code Generator", icon: "💻" },
    { id: "ux", label: "UX Analyzer", icon: "🎨" },
    { id: "video", label: "Video Enhancer", icon: "🎬" },
  ]

  const generateContent = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const headers = getAuthHeaders()
      const response = await fetch("/api/v2/ai/content/generate", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: contentType,
          context: null,
          style: null,
        }),
      })
      
      if (!response.ok) throw new Error("Failed to generate content")
      const data = await response.json()
      setGeneratedContent(data)
      setSuccess("Content generated successfully!")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateCode = async () => {
    if (!codeDescription.trim()) {
      setError("Please enter a description")
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const headers = getAuthHeaders()
      const endpoint = codeType === "frontend"
        ? "/api/v2/ai/code/generate-frontend"
        : "/api/v2/ai/code/generate-backend"
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          description: codeDescription,
          framework: codeType === "frontend" ? "react" : "fastapi",
          style_system: codeType === "frontend" ? "tailwind" : null,
        }),
      })
      
      if (!response.ok) throw new Error("Failed to generate code")
      const data = await response.json()
      setGeneratedCode(data)
      setSuccess("Code generated successfully!")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const analyzeComponent = async () => {
    if (!componentPath.trim()) {
      setError("Please enter a component path")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const headers = getAuthHeaders()
      const response = await fetch("/api/v2/ai/ux/analyze-component", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          component_path: componentPath,
          analysis_type: "general",
        }),
      })
      
      if (!response.ok) throw new Error("Failed to analyze component")
      const data = await response.json()
      setUxAnalysis(data)
      setSuccess("Component analyzed successfully!")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const enhanceVideo = async () => {
    if (!jobId.trim()) {
      setError("Please enter a job ID")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const headers = getAuthHeaders()
      const response = await fetch("/api/v2/ai/video/enhance", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          enhancement_type: enhancementType,
          input_video_path: `/jobs/${jobId}/video.mp4`,
          params: {},
        }),
      })
      
      if (!response.ok) throw new Error("Failed to enhance video")
      const data = await response.json()
      setSuccess(`Video enhancement started! ID: ${data.enhancement_id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-pure-white/5 border-2 border-pure-white/20 p-12">
      <h2 className="text-4xl font-black text-pure-white mb-12 tracking-poppr text-center">
        🤖   A I   A D M I N   P A N E L
      </h2>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 border-b-2 border-pure-white/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-black transition-all border-b-2 tracking-wide ${
              activeTab === tab.id
                ? "border-pure-white text-pure-white bg-pure-white/10"
                : "border-transparent text-pure-white/50 hover:text-pure-white hover:border-pure-white/30"
            }`}
          >
            {tab.icon} {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-6 border-2 border-pure-white bg-pure-white text-pure-black">
          <p className="font-black tracking-wide">⚠️ {error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-6 border-2 border-pure-white bg-pure-white text-pure-black">
          <p className="font-black tracking-wide">✅ {success}</p>
        </div>
      )}

      {/* Content Renewal Tab */}
      {activeTab === "content" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full bg-pure-black border-2 border-pure-white/20 px-6 py-4 text-pure-white focus:outline-none focus:border-pure-white font-bold tracking-wide"
            >
              <option value="landing_hero">Landing Hero</option>
              <option value="landing_features">Landing Features</option>
              <option value="landing_testimonials">Landing Testimonials</option>
              <option value="feature_descriptions">Feature Descriptions</option>
              <option value="blog_posts">Blog Posts</option>
            </select>
          </div>

          <button
            onClick={generateContent}
            disabled={loading}
            className="w-full px-8 py-4 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "G E N E R A T I N G . . ." : "G E N E R A T E   C O N T E N T"}
          </button>

          {generatedContent && (
            <div className="mt-8 p-8 border-2 border-pure-white/20 bg-pure-white/5">
              <h3 className="text-xl font-black text-pure-white mb-4 tracking-wide uppercase">Generated Content</h3>
              <pre className="text-pure-white/80 font-mono text-sm whitespace-pre-wrap">
                {JSON.stringify(generatedContent.content, null, 2)}
              </pre>
            </div>
          )}
        </motion.div>
      )}

      {/* Code Generator Tab */}
      {activeTab === "code" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">
              Code Type
            </label>
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setCodeType("frontend")}
                className={`px-6 py-3 border-2 font-black tracking-wide transition-opacity ${
                  codeType === "frontend"
                    ? "bg-pure-white text-pure-black border-pure-white"
                    : "bg-pure-white/10 text-pure-white border-pure-white/20"
                }`}
              >
                F R O N T E N D
              </button>
              <button
                onClick={() => setCodeType("backend")}
                className={`px-6 py-3 border-2 font-black tracking-wide transition-opacity ${
                  codeType === "backend"
                    ? "bg-pure-white text-pure-black border-pure-white"
                    : "bg-pure-white/10 text-pure-white border-pure-white/20"
                }`}
              >
                B A C K E N D
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">
              Description
            </label>
            <textarea
              value={codeDescription}
              onChange={(e) => setCodeDescription(e.target.value)}
              placeholder="Describe the component or endpoint you want to generate..."
              rows={5}
              className="w-full bg-pure-black border-2 border-pure-white/20 px-6 py-4 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-pure-white font-bold tracking-wide"
            />
          </div>

          <button
            onClick={generateCode}
            disabled={loading || !codeDescription.trim()}
            className="w-full px-8 py-4 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "G E N E R A T I N G . . ." : "G E N E R A T E   C O D E"}
          </button>

          {generatedCode && (
            <div className="mt-8 p-8 border-2 border-pure-white/20 bg-pure-white/5">
              <h3 className="text-xl font-black text-pure-white mb-4 tracking-wide uppercase">Generated Code</h3>
              <pre className="text-pure-white/80 font-mono text-sm overflow-x-auto">
                {generatedCode.code}
              </pre>
            </div>
          )}
        </motion.div>
      )}

      {/* UX Analyzer Tab */}
      {activeTab === "ux" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">
              Component Path
            </label>
            <input
              type="text"
              value={componentPath}
              onChange={(e) => setComponentPath(e.target.value)}
              placeholder="e.g., src/components/Header.jsx"
              className="w-full bg-pure-black border-2 border-pure-white/20 px-6 py-4 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-pure-white font-bold tracking-wide"
            />
          </div>

          <button
            onClick={analyzeComponent}
            disabled={loading || !componentPath.trim()}
            className="w-full px-8 py-4 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "A N A L Y Z I N G . . ." : "A N A L Y Z E   C O M P O N E N T"}
          </button>

          {uxAnalysis && (
            <div className="mt-8 p-8 border-2 border-pure-white/20 bg-pure-white/5">
              <h3 className="text-xl font-black text-pure-white mb-4 tracking-wide uppercase">Analysis Results</h3>
              <div className="space-y-4">
                <div>
                  <span className="font-black tracking-wide">Score: </span>
                  <span className="font-bold">{uxAnalysis.metrics?.score || "N/A"}/100</span>
                </div>
                {uxAnalysis.suggestions && (
                  <div>
                    <h4 className="font-black tracking-wide mb-2 uppercase">Suggestions:</h4>
                    <ul className="list-disc list-inside space-y-2 text-pure-white/80 font-bold">
                      {uxAnalysis.suggestions.slice(0, 5).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Video Enhancer Tab */}
      {activeTab === "video" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">
              Job ID
            </label>
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="Enter job ID to enhance"
              className="w-full bg-pure-black border-2 border-pure-white/20 px-6 py-4 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-pure-white font-bold tracking-wide"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-pure-white mb-3 tracking-wide uppercase">
              Enhancement Type
            </label>
            <select
              value={enhancementType}
              onChange={(e) => setEnhancementType(e.target.value)}
              className="w-full bg-pure-black border-2 border-pure-white/20 px-6 py-4 text-pure-white focus:outline-none focus:border-pure-white font-bold tracking-wide"
            >
              <option value="captions">Captions</option>
              <option value="transitions">Transitions</option>
              <option value="color_grade">Color Grading</option>
              <option value="effects">Effects</option>
              <option value="motion_graphics">Motion Graphics</option>
            </select>
          </div>

          <button
            onClick={enhanceVideo}
            disabled={loading || !jobId.trim()}
            className="w-full px-8 py-4 bg-pure-white text-pure-black border-2 border-pure-white font-black tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "E N H A N C I N G . . ." : "E N H A N C E   V I D E O"}
          </button>
        </motion.div>
      )}
    </div>
  )
}

