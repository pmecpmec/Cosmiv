/**
 * AnimatedHeroText - Large animated text with cosmic effects
 * Features gradient animation, glow effects, and character-by-character reveal
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AnimatedHeroText({ 
  text, 
  className = '',
  delay = 0,
  stagger = 0.05 
}) {
  const [displayed, setDisplayed] = useState(false)
  const chars = text.split('')

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <motion.h1
      className={`${className} font-black gradient-text-cosmic tracking-poppr relative`}
      style={{
        textShadow: '0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(0, 255, 255, 0.3)',
      }}
    >
      {/* Glow overlay */}
      <motion.span
        className="absolute inset-0 blur-xl opacity-50"
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #00FFFF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {text}
      </motion.span>
      
      {/* Main text with character animation */}
      <span className="relative z-10">
        {chars.map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 50, rotateX: -90 }}
            animate={displayed ? { 
              opacity: 1, 
              y: 0, 
              rotateX: 0,
              textShadow: [
                '0 0 10px rgba(139, 92, 246, 0.5)',
                '0 0 30px rgba(0, 255, 255, 0.8)',
                '0 0 10px rgba(139, 92, 246, 0.5)',
              ],
            } : {}}
            transition={{
              duration: 0.5,
              delay: delay + i * stagger,
              ease: [0.43, 0.13, 0.23, 0.96],
            }}
            style={{ display: 'inline-block' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </span>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
          ease: 'easeInOut',
        }}
        style={{ pointerEvents: 'none' }}
      />
    </motion.h1>
  )
}

