/**
 * GlassCard Component
 * Glassmorphism effect with frosted glass appearance
 * Features backdrop blur, transparency, and subtle borders
 */

import { motion } from 'framer-motion'

export default function GlassCard({ 
  children, 
  className = '',
  variant = 'default', // 'default', 'subtle', 'intense', 'colored'
  hover = true,
  ...props 
}) {
  const variants = {
    default: 'bg-white/5 backdrop-blur-md border border-white/10',
    subtle: 'bg-white/3 backdrop-blur-sm border border-white/5',
    intense: 'bg-white/10 backdrop-blur-lg border border-white/20',
    colored: 'bg-gradient-to-br from-cosmic-violet/20 via-cosmic-neon-cyan/10 to-cosmic-purple/20 backdrop-blur-md border border-cosmic-neon-cyan/20',
  }

  const baseClasses = `rounded-xl ${variants[variant]} ${className}`

  if (hover) {
    return (
      <motion.div
        className={baseClasses}
        whileHover={{
          scale: 1.02,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          backgroundColor: variant === 'colored' 
            ? 'rgba(139, 92, 246, 0.25)' 
            : 'rgba(255, 255, 255, 0.08)',
        }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  )
}

