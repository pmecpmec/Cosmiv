/**
 * PageTransition Component
 * 
 * Provides smooth fade/slide transitions between page tabs
 * Includes cosmic particle trails and parallax effects
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },
  slideRight: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  slideDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  cosmic: {
    initial: { opacity: 0, scale: 0.8, rotateY: -15 },
    animate: { opacity: 1, scale: 1, rotateY: 0 },
    exit: { opacity: 0, scale: 1.1, rotateY: 15 },
  },
}

/**
 * PageTransition wrapper component
 * 
 * @param {React.ReactNode} children - Content to transition
 * @param {string} key - Unique key for AnimatePresence
 * @param {string} variant - Transition variant ('fade', 'slideLeft', 'slideRight', 'slideUp', 'slideDown', 'scale', 'cosmic')
 * @param {number} duration - Animation duration in seconds
 */
export function PageTransition({ 
  children, 
  key,
  variant = 'cosmic',
  duration = 0.3 
}) {
  const variants = transitionVariants[variant] || transitionVariants.cosmic

  return (
    <motion.div
      key={key}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ 
        duration,
        ease: [0.43, 0.13, 0.23, 0.96] // Custom easing for smooth motion
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

/**
 * StaggerContainer - Animates children with stagger effect
 * 
 * @param {React.ReactNode} children - Children to stagger
 * @param {number} staggerDelay - Delay between each child (seconds)
 */
export function StaggerContainer({ children, staggerDelay = 0.1 }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * StaggerItem - Individual item in a stagger animation
 */
export function StaggerItem({ children }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

/**
 * ParallaxContainer - Creates parallax scrolling effect
 * 
 * @param {React.ReactNode} children
 * @param {number} speed - Parallax speed multiplier (0-1, where 0 = no movement, 1 = normal scroll)
 */
export function ParallaxContainer({ children, speed = 0.5 }) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset
      setOffset(scrolled * speed)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div
      style={{
        transform: `translateY(${offset}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {children}
    </div>
  )
}

/**
 * ParticleTrail - Creates cosmic particle trail effect on navigation
 * 
 * @param {boolean} active - Whether to show particles
 */
export function ParticleTrail({ active }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    // Create particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 2 + 1,
    }))

    setParticles(newParticles)

    // Clear particles after animation
    const timer = setTimeout(() => {
      setParticles([])
    }, 3000)

    return () => clearTimeout(timer)
  }, [active])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cosmic-neon-cyan"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            boxShadow: `0 0 ${particle.size * 2}px rgba(0, 255, 255, ${particle.opacity})`,
          }}
          initial={{ 
            opacity: particle.opacity,
            scale: 0,
          }}
          animate={{ 
            opacity: 0,
            scale: 2,
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
          }}
          transition={{ 
            duration: particle.duration,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

export default PageTransition

