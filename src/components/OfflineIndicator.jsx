import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOffline(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Show offline indicator if already offline
    if (!navigator.onLine) {
      setShowOffline(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {showOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-16 left-0 right-0 z-50 bg-red-500/90 backdrop-blur-lg border-b border-red-400 text-white px-4 py-3"
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📶</span>
              <div>
                <div className="font-semibold">You're offline</div>
                <div className="text-sm opacity-90">
                  Some features may be limited. Your data will sync when you reconnect.
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowOffline(false)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-all"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

