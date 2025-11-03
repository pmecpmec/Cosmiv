/**
 * HeroParticles - Animated particle effects for hero section
 * Creates floating cosmic particles that react to mouse movement
 */

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function HeroParticles({ count = 50 }) {
  const containerRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const particlesRef = useRef([])

  useEffect(() => {
    // Initialize particles
    particlesRef.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.3,
      delay: Math.random() * 2,
    }))

    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      return () => container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [count])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {particlesRef.current.map((particle) => {
        // Calculate distance from mouse for interaction
        const distanceFromMouse = Math.sqrt(
          Math.pow(mousePos.x - particle.x, 2) + Math.pow(mousePos.y - particle.y, 2)
        )
        const influence = Math.max(0, 50 - distanceFromMouse) / 50
        const offsetX = (mousePos.x - particle.x) * influence * 0.3
        const offsetY = (mousePos.y - particle.y) * influence * 0.3

        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-cosmic-neon-cyan"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              boxShadow: `0 0 ${particle.size * 2}px rgba(0, 255, 255, ${particle.opacity})`,
            }}
            animate={{
              x: offsetX,
              y: offsetY,
              opacity: [particle.opacity * 0.5, particle.opacity, particle.opacity * 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: particle.delay,
            }}
          />
        )
      })}
    </div>
  )
}

