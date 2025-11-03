/**
 * FloatingElements - Floating geometric shapes and cosmic debris
 * Adds depth and visual interest to the background
 */

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function FloatingElements({ count = 8 }) {
  const elements = useState(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 40 + 20,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      shape: Math.random() > 0.5 ? 'circle' : 'polygon',
    }))
  })[0]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute opacity-10"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.size}px`,
            height: `${element.size}px`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            rotate: [element.rotation, element.rotation + 360, element.rotation + 720],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: element.delay,
          }}
        >
          {element.shape === 'circle' ? (
            <div className="w-full h-full rounded-full border border-cosmic-neon-cyan/30 bg-gradient-to-br from-cosmic-violet/20 to-cosmic-neon-cyan/20" />
          ) : (
            <div className="w-full h-full border border-cosmic-violet/30 bg-gradient-to-br from-cosmic-neon-cyan/10 to-transparent"
              style={{
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}

