/**
 * LoadingSpinner Component
 * Cosmic-themed loading spinner with particle effects
 */

import { motion } from 'framer-motion'

const sizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

/**
 * Cosmic spinner with rotating ring and particles
 */
export function Spinner({ size = 'md', className = '' }) {
  const sizeClass = sizeMap[size] || sizeMap.md

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0 border-2 border-cosmic-neon-cyan/50 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Inner pulsing ring */}
      <motion.div
        className="absolute inset-2 border-2 border-cosmic-violet/70 rounded-full"
        animate={{
          rotate: -360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Center pulsing dot */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-1 h-1 bg-cosmic-neon-cyan rounded-full" />
      </motion.div>
    </div>
  )
}

/**
 * Orb spinner - glowing cosmic orb
 */
export function OrbSpinner({ size = 'md', className = '' }) {
  const sizeClass = sizeMap[size] || sizeMap.md

  return (
    <motion.div
      className={`relative ${sizeClass} ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        boxShadow: [
          '0 0 10px rgba(139, 92, 246, 0.5)',
          '0 0 30px rgba(0, 255, 255, 0.8)',
          '0 0 10px rgba(139, 92, 246, 0.5)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-violet via-cosmic-neon-cyan to-cosmic-purple rounded-full" />
      <motion.div
        className="absolute inset-1 bg-pure-black rounded-full"
        animate={{
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  )
}

/**
 * Particle spinner - particles orbiting around center
 */
export function ParticleSpinner({ size = 'md', particles = 6, className = '' }) {
  const sizeClass = sizeMap[size] || sizeMap.md
  const radius = size === 'xl' ? 20 : size === 'lg' ? 16 : size === 'md' ? 12 : 8

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {Array.from({ length: particles }).map((_, i) => {
        const angle = (i * 360) / particles
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cosmic-neon-cyan rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: `${radius}px ${radius}px`,
            }}
            animate={{
              rotate: 360,
              x: Math.cos((angle * Math.PI) / 180) * radius - 2,
              y: Math.sin((angle * Math.PI) / 180) * radius - 2,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              delay: (i * 0.1),
            }}
          />
        )
      })}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1 h-1 bg-cosmic-violet rounded-full animate-pulse" />
      </div>
    </div>
  )
}

/**
 * Pulse spinner - simple pulsing effect
 */
export function PulseSpinner({ size = 'md', className = '' }) {
  const sizeClass = sizeMap[size] || sizeMap.md

  return (
    <motion.div
      className={`${sizeClass} bg-cosmic-neon-cyan rounded-full ${className}`}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1],
        boxShadow: [
          '0 0 0px rgba(0, 255, 255, 0.5)',
          '0 0 20px rgba(0, 255, 255, 0.8)',
          '0 0 0px rgba(0, 255, 255, 0.5)',
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export default Spinner
