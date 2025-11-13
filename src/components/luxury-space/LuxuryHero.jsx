/**
 * Luxury Hero Section
 * Fullscreen cinematic hero with tagline and CTA
 */

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function LuxuryHero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1920)',
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(11,12,16,0.4)] via-[rgba(16,18,43,0.6)] to-[rgba(0,255,247,0.1)]" />
        
        {/* Subtle light rays */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[rgba(0,255,247,0.1)] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[rgba(168,85,247,0.1)] rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      {/* Particles/Shimmer */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#00FFF7] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className="font-serif text-[clamp(3rem,8vw,7rem)] font-bold tracking-[0.05em] text-[#F5F5F5] mb-6"
          style={{
            textShadow: '0 0 40px rgba(255, 215, 0, 0.3), 0 0 80px rgba(0, 255, 247, 0.2)',
          }}
        >
          ELEVATE BEYOND EARTH
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
          className="font-sans text-[clamp(1.25rem,2vw,1.75rem)] font-light tracking-[0.05em] text-[#C0C0C0] mb-12"
        >
          Where luxury meets the cosmos
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.9, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          className="px-12 py-5 border-2 border-[#00FFF7] text-[#00FFF7] font-sans uppercase tracking-[0.1em] text-lg hover:bg-[rgba(0,255,247,0.15)] hover:shadow-[0_0_30px_rgba(0,255,247,0.6),0_0_60px_rgba(168,85,247,0.4)] transition-all"
        >
          EXPLORE COLLECTION
        </motion.button>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-[#00FFF7] rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-3 bg-[#00FFF7] rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

