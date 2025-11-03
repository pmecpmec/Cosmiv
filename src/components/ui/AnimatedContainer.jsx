/**
 * AnimatedContainer - Reusable animation wrapper for components
 * Provides consistent entrance animations with stagger support
 */

import { motion } from 'framer-motion'

/**
 * Container with fade-in animation
 */
export function AnimatedContainer({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered list container - animates children with delay
 */
export function StaggeredList({ children, delay = 0.1, className = '' }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered item - individual item in staggered list
 */
export function StaggeredItem({ children, className = '' }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            duration: 0.4,
            ease: 'easeOut',
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Card with slide-in from bottom animation
 */
export function AnimatedCard({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      whileHover={{ 
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Button with pulse animation on mount
 */
export function AnimatedButton({ children, delay = 0, className = '', ...props }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay,
        type: 'spring',
        stiffness: 300,
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.95 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
}

/**
 * Form with fade-in animation
 */
export function AnimatedForm({ children, delay = 0, className = '' }) {
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.form>
  )
}

/**
 * Input with smooth entrance
 */
export function AnimatedInput({ delay = 0, className = '', ...props }) {
  return (
    <motion.input
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileFocus={{ 
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className={className}
      {...props}
    />
  )
}

export default AnimatedContainer

