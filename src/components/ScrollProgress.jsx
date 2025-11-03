/**
 * ScrollProgress Component
 * Visual indicator showing scroll progress through the page
 */

import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const [showProgress, setShowProgress] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  useEffect(() => {
    // Only show progress after scrolling a bit
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setShowProgress(latest > 0.05)
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  if (!showProgress) return null

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-[9999] origin-left"
      style={{ scaleX }}
    >
      {/* Gradient progress bar */}
      <div className="h-full w-full bg-gradient-to-r from-cosmic-violet via-cosmic-neon-cyan to-cosmic-purple relative overflow-hidden">
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0"
          animate={{
            boxShadow: [
              '0 0 10px rgba(139, 92, 246, 0.5)',
              '0 0 20px rgba(0, 255, 255, 0.8)',
              '0 0 10px rgba(139, 92, 246, 0.5)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </motion.div>
  )
}

