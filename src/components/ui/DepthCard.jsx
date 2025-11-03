/**
 * DepthCard Component
 * Combines glassmorphism and neumorphism with depth effects
 * Features layered shadows, backdrop blur, and 3D appearance
 */

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function DepthCard({ 
  children, 
  className = '',
  depth = 'medium', // 'subtle', 'medium', 'strong'
  interactive = true,
  ...props 
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const depthStyles = {
    subtle: {
      backdrop: 'bg-white/5 backdrop-blur-sm',
      shadow: 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-1px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]',
      border: 'border border-white/10',
    },
    medium: {
      backdrop: 'bg-white/8 backdrop-blur-md',
      shadow: 'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4),0_4px_6px_-2px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.15)]',
      border: 'border border-white/15',
    },
    strong: {
      backdrop: 'bg-white/10 backdrop-blur-lg',
      shadow: 'shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.4),inset_0_4px_0_rgba(255,255,255,0.2)]',
      border: 'border-2 border-white/20',
    },
  }

  const style = depthStyles[depth]

  const handleMouseMove = (e) => {
    if (!interactive) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20
    setMousePosition({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 })
  }

  const baseClasses = `rounded-xl ${style.backdrop} ${style.shadow} ${style.border} ${className}`

  if (interactive) {
    return (
      <motion.div
        className={baseClasses}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: mousePosition.y * 0.5,
          rotateY: mousePosition.x * 0.5,
          scale: 1,
        }}
        whileHover={{
          scale: 1.02,
          z: 50,
        }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
        style={{ transformStyle: 'preserve-3d' }}
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

