import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdate(true)
      })

      // Global function for service worker to trigger
      window.showUpdateNotification = () => {
        setShowUpdate(true)
      }
    }
  }, [])

  const handleUpdate = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-16 left-0 right-0 z-50 bg-pure-white border-b-2 border-pure-black text-pure-black px-4 py-4"
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <div className="font-black tracking-wide uppercase">New Version Available</div>
                <div className="text-sm font-bold mt-1">
                  Click update to get the latest features and improvements.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUpdate(false)}
                className="px-4 py-2 bg-pure-black/10 hover:bg-pure-black/20 border-2 border-pure-black font-black tracking-wide text-sm transition-opacity"
              >
                L A T E R
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-pure-black text-pure-white border-2 border-pure-black hover:opacity-90 font-black tracking-wide text-sm transition-opacity"
              >
                U P D A T E
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

