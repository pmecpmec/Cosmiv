import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"

export default function Communities() {
  const { getAuthHeaders, user } = useAuth()
  const [servers, setServers] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)
  const [channels, setChannels] = useState([])
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [showCreateServer, setShowCreateServer] = useState(false)
  const [newServerName, setNewServerName] = useState("")
  const [newServerDesc, setNewServerDesc] = useState("")

  useEffect(() => {
    loadServers()
  }, [])

  useEffect(() => {
    if (selectedServer) {
      loadChannels(selectedServer.server_id)
    }
  }, [selectedServer])

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.channel_id)
      // Poll for new messages every 2 seconds
      const interval = setInterval(() => {
        loadMessages(selectedChannel.channel_id)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [selectedChannel])

  const loadServers = async () => {
    try {
      const headers = getAuthHeaders()
      const response = await fetch("/api/v2/communities/servers", { headers })
      if (response.ok) {
        const data = await response.json()
        setServers(data.servers || [])
      }
    } catch (err) {
      console.error("Failed to load servers:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadChannels = async (serverId) => {
    try {
      const headers = getAuthHeaders()
      const response = await fetch(`/api/v2/communities/servers/${serverId}/channels`, { headers })
      if (response.ok) {
        const data = await response.json()
        setChannels(data.channels || [])
        if (data.channels && data.channels.length > 0) {
          setSelectedChannel(data.channels[0])
        }
      }
    } catch (err) {
      console.error("Failed to load channels:", err)
    }
  }

  const loadMessages = async (channelId) => {
    try {
      const headers = getAuthHeaders()
      const response = await fetch(`/api/v2/communities/channels/${channelId}/messages?limit=50`, { headers })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error("Failed to load messages:", err)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedChannel) return

    try {
      const headers = getAuthHeaders()
      const response = await fetch(`/api/v2/communities/channels/${selectedChannel.channel_id}/messages`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageInput,
        }),
      })

      if (response.ok) {
        setMessageInput("")
        loadMessages(selectedChannel.channel_id)
      }
    } catch (err) {
      console.error("Failed to send message:", err)
    }
  }

  const createServer = async () => {
    if (!newServerName.trim()) return

    try {
      const headers = getAuthHeaders()
      const response = await fetch("/api/v2/communities/servers", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newServerName,
          description: newServerDesc,
          server_type: "public",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setShowCreateServer(false)
        setNewServerName("")
        setNewServerDesc("")
        loadServers()
        // Select the new server
        const server = { server_id: data.server_id }
        setSelectedServer(server)
      }
    } catch (err) {
      console.error("Failed to create server:", err)
    }
  }

  const joinServer = async (serverId, inviteCode = null) => {
    try {
      const headers = getAuthHeaders()
      const response = await fetch(`/api/v2/communities/servers/${serverId}/join`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invite_code: inviteCode }),
      })

      if (response.ok) {
        loadServers()
      }
    } catch (err) {
      console.error("Failed to join server:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pure-black text-pure-white flex items-center justify-center">
        <div className="text-pure-white/50 font-bold">Loading communities...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pure-black text-pure-white flex">
      {/* Server Sidebar */}
      <div className="w-64 border-r-2 border-pure-white/20 bg-pure-black">
        <div className="p-6 border-b-2 border-pure-white/20">
          <h2 className="text-xl font-black mb-6 tracking-poppr">S E R V E R S</h2>
          <button
            onClick={() => setShowCreateServer(!showCreateServer)}
            className="w-full px-6 py-4 bg-pure-white text-pure-black font-black border-2 border-pure-white hover:opacity-90 transition-opacity tracking-wide"
          >
            +   C R E A T E   S E R V E R
          </button>
        </div>

        {showCreateServer && (
          <div className="p-6 border-b-2 border-pure-white/20">
            <input
              type="text"
              placeholder="Server name"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
              className="w-full px-4 py-3 bg-pure-black border-2 border-pure-white/20 text-pure-white mb-3 focus:border-pure-white focus:outline-none font-bold tracking-wide"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newServerDesc}
              onChange={(e) => setNewServerDesc(e.target.value)}
              className="w-full px-4 py-3 bg-pure-black border-2 border-pure-white/20 text-pure-white mb-4 focus:border-pure-white focus:outline-none font-bold"
            />
            <div className="flex gap-3">
              <button
                onClick={createServer}
                className="flex-1 px-6 py-3 bg-pure-white text-pure-black font-black hover:opacity-90 tracking-wide"
              >
                C R E A T E
              </button>
              <button
                onClick={() => setShowCreateServer(false)}
                className="flex-1 px-6 py-3 border-2 border-pure-white text-pure-white font-black hover:bg-pure-white hover:text-pure-black tracking-wide"
              >
                C A N C E L
              </button>
            </div>
          </div>
        )}

        <div className="p-2">
          {servers.map((server) => (
            <motion.button
              key={server.server_id}
              onClick={() => setSelectedServer(server)}
              whileHover={{ x: 4 }}
              className={`w-full text-left px-4 py-3 mb-1 font-bold transition-all ${
                selectedServer?.server_id === server.server_id
                  ? "bg-pure-white text-pure-black"
                  : "text-pure-white/70 hover:text-pure-white hover:bg-pure-white/5"
              }`}
            >
              <div className="font-black">{server.name}</div>
              <div className="text-xs opacity-75">{server.member_count} members</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Channel Sidebar */}
      {selectedServer && (
        <div className="w-64 border-r-2 border-pure-white/20 bg-pure-black">
          <div className="p-6 border-b-2 border-pure-white/20">
            <h3 className="text-lg font-black mb-2 tracking-wide">{selectedServer.name.toUpperCase()}</h3>
            <p className="text-sm text-pure-white/50 font-bold">{selectedServer.description}</p>
          </div>
          <div className="p-2">
            {channels.map((channel) => (
              <button
                key={channel.channel_id}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full text-left px-4 py-2 mb-1 font-bold transition-all ${
                  selectedChannel?.channel_id === channel.channel_id
                    ? "bg-pure-white/10 text-pure-white"
                    : "text-pure-white/50 hover:text-pure-white hover:bg-pure-white/5"
                }`}
              >
                {channel.channel_type === "text" && "💬 "}
                {channel.channel_type === "announcements" && "📢 "}
                {channel.channel_type === "video" && "🎬 "}
                {channel.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      {selectedChannel ? (
        <div className="flex-1 flex flex-col">
          {/* Channel Header */}
          <div className="p-6 border-b-2 border-pure-white/20">
            <h4 className="text-xl font-black mb-2 tracking-poppr">#   {selectedChannel.name.toUpperCase()}</h4>
            <p className="text-sm text-pure-white/50 font-bold">{selectedChannel.description}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-hero">
                <p className="text-pure-white/50 font-black text-xl tracking-poppr">N O   M E S S A G E S   Y E T</p>
                <p className="text-pure-white/30 font-bold mt-2">Start the conversation!</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.message_id} className="flex gap-3">
                <div className="w-10 h-10 bg-pure-white/10 flex items-center justify-center font-black">
                  👤
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-black text-pure-white tracking-wide">@{msg.user_id}</span>
                    <span className="text-xs text-pure-white/50 font-bold">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-pure-white font-bold leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-6 border-t-2 border-pure-white/20">
            <div className="flex gap-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message #${selectedChannel.name}`}
                className="flex-1 px-6 py-4 bg-pure-black border-2 border-pure-white/20 text-pure-white focus:border-pure-white focus:outline-none font-bold tracking-wide"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-pure-white text-pure-black font-black border-2 border-pure-white hover:opacity-90 transition-opacity tracking-wide"
              >
                S E N D
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-3xl font-black mb-4">SELECT A CHANNEL</h3>
            <p className="text-pure-white/50">Choose a server and channel to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}

