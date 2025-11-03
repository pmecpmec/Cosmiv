/**
 * NeumorphicCard Component
 * Neumorphism effect with soft shadows and depth
 * Creates the appearance of elements being extruded from or pressed into the background
 */

import { motion } from 'framer-motion'

export default function NeumorphicCard({ 
  children, 
  className = '',
  variant = 'raised', // 'raised', 'pressed', 'flat'
  color = 'dark', // 'dark', 'light'
  hover = true,
  ...props 
}) {
  const colorClasses = {
    dark: {
      raised: 'bg-bw-gray-1 shadow-[8px_8px_16px_#0a0a0a,-8px_-8px_16px_#1a1a1a]',
      pressed: 'bg-bw-gray-1 shadow-[inset_8px_8px_16px_#0a0a0a,inset_-8px_-8px_16px_#1a1a1a]',
      flat: 'bg-bw-gray-1 shadow-[4px_4px_8px_#0a0a0a,-4px_-4px_8px_#1a1a1a]',
    },
    light: {
      raised: 'bg-white/10 shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.1)]',
      pressed: 'bg-white/10 shadow-[inset_8px_8px_16px_rgba(0,0,0,0.3),inset_-8px_-8px_16px_rgba(255,255,255,0.1)]',
      flat: 'bg-white/10 shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.1)]',
    },
  }

  const baseClasses = `rounded-xl ${colorClasses[color][variant]} ${className}`

  if (hover) {
    return (
      <motion.div
        className={baseClasses}
        whileHover={{
          scale: 1.02,
          boxShadow: variant === 'raised'
            ? '12px 12px 24px #0a0a0a, -12px -12px 24px #1a1a1a'
            : 'inset 12px 12px 24px #0a0a0a, inset -12px -12px 24px #1a1a1a',
        }}
        whileTap={{
          scale: 0.98,
          boxShadow: 'inset 8px 8px 16px #0a0a0a, inset -8px -8px 16px #1a1a1a',
        }}
        transition={{ duration: 0.2 }}
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

