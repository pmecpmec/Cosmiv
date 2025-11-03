import { motion, AnimatePresence } from 'framer-motion'
import { Spinner, OrbSpinner, ParticleSpinner } from './LoadingSpinner'

/**
 * Full-page loading overlay
 */
export function FullPageLoader({ message = 'Loading...', visible = true }) {
  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-pure-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div className="text-center relative">
          {/* Particle background effect */}
          <div className="absolute inset-0 -z-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cosmic-neon-cyan rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <OrbSpinner size="xl" className="mx-auto mb-6" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-pure-white font-black tracking-wide text-xl"
          >
            {message}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Inline loading overlay (for sections)
 */
export function InlineLoader({ message = 'Loading...', visible = true, className = '' }) {
  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`flex items-center justify-center py-12 ${className}`}
      >
        <div className="text-center relative">
          <ParticleSpinner size="lg" particles={8} className="mx-auto mb-4" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-pure-white/70 font-bold tracking-wide"
          >
            {message}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Button loading state
 */
export function ButtonLoader({ visible = false, size = 'sm' }) {
  if (!visible) return null

  return (
    <span className="inline-flex items-center">
      <Spinner size={size} className="mr-2" />
    </span>
  )
}

/**
 * Card loading overlay
 */
export function CardLoader({ visible = true, message = 'Loading...' }) {
  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="broken-planet-card p-12 border-2 border-cosmic-neon-cyan/30 flex items-center justify-center min-h-[200px] relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-cosmic-violet/10 via-transparent to-cosmic-neon-cyan/10"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="text-center relative z-10">
        <OrbSpinner size="lg" className="mx-auto mb-4" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-pure-white/70 font-bold tracking-wide"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  )
}

export default FullPageLoader

