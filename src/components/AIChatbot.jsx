import { useState, useRef, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

export default function AIChatbot() {
  const { getAuthHeaders } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm Cosmiv's AI assistant. I can help you with questions about the platform, video editing, subscriptions, and more. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setLoading(true)

    // Add user message to UI
    const newUserMessage = { role: "user", content: userMessage }
    setMessages((prev) => [...prev, newUserMessage])

    try {
      const headers = getAuthHeaders()
      const response = await fetch("/api/v2/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
            message: userMessage,
            conversation_id: conversationId,
          }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()
      
      // Add AI response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ])
      
      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-pure-black border-2 border-pure-white/20">
      {/* Header */}
      <div className="bg-pure-white/5 px-6 py-4 border-b-2 border-pure-white/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pure-white/10 border-2 border-pure-white/20 flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="text-pure-white font-black tracking-poppr">A I   A S S I S T A N T</h3>
            <p className="text-xs text-pure-white/50 font-bold tracking-wide">Ask me anything about Cosmiv</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] border-2 px-5 py-4 ${
                  msg.role === "user"
                    ? "bg-pure-white text-pure-black border-pure-white"
                    : "bg-pure-white/5 text-pure-white border-pure-white/20"
                }`}
              >
                <p className="text-xs font-black uppercase tracking-wide mb-2 opacity-75">{msg.role}</p>
                <p className="text-base font-bold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-pure-white/5 border-2 border-pure-white/20 px-5 py-4">
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-pure-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-pure-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-pure-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
              <p className="text-xs text-pure-white/50 font-bold tracking-wide mt-2">T H I N K I N G . . .</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t-2 border-pure-white/20 bg-pure-black p-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-1 bg-pure-black border-2 border-pure-white/20 px-6 py-4 text-pure-white placeholder-pure-white/30 focus:outline-none focus:border-pure-white font-bold tracking-wide disabled:opacity-50"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-pure-white text-pure-black px-8 py-4 border-2 border-pure-white font-black hover:opacity-90 transition-opacity tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            S E N D
          </button>
        </div>
      </div>
    </div>
  )
}

