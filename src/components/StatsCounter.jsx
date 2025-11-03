/**
 * StatsCounter Component
 * Animated number counter that counts up on scroll
 * Perfect for impressive landing page statistics
 */

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * Single stat counter
 */
export function StatCounter({ 
  value, 
  label, 
  suffix = '', 
  prefix = '',
  duration = 2,
  decimals = 0 
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const hasCounted = useRef(false)

  useEffect(() => {
    if (!isInView || hasCounted.current) return

    hasCounted.current = true
    const startTime = Date.now()
    const startValue = 0
    const endValue = value

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      
      // Easing function (easeOutCubic)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * eased
      
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
      }
    }

    animate()
  }, [isInView, value, duration])

  const formatValue = (val) => {
    if (decimals === 0) {
      return Math.floor(val).toLocaleString()
    }
    return val.toFixed(decimals).toLocaleString()
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <motion.div
        className="text-5xl md:text-7xl font-black gradient-text-cosmic mb-4"
        animate={isInView ? {
          textShadow: [
            '0 0 20px rgba(139, 92, 246, 0.5)',
            '0 0 40px rgba(0, 255, 255, 0.7)',
            '0 0 20px rgba(139, 92, 246, 0.5)',
          ],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {prefix}{formatValue(displayValue)}{suffix}
      </motion.div>
      <div className="text-lg md:text-xl text-white/70 font-bold tracking-wide uppercase">
        {label}
      </div>
    </motion.div>
  )
}

/**
 * Stats grid container
 */
export default function StatsCounter({ stats = [] }) {
  if (!stats || stats.length === 0) {
    // Default stats if none provided
    stats = [
      { value: 10000, label: 'Videos Processed', suffix: '+' },
      { value: 5000, label: 'Active Creators', suffix: '+' },
      { value: 99.9, label: 'Uptime', suffix: '%', decimals: 1 },
      { value: 30, label: 'Processing Time', suffix: 's', prefix: '<' },
    ]
  }

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-pure-black/0 via-cosmic-violet/5 to-pure-black/0" />
      
      <div className="container mx-auto relative z-10">
        <motion.h2
          className="text-4xl md:text-6xl font-black gradient-text-cosmic text-center mb-16 tracking-poppr chromatic-aberration"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          C O S M I V   B Y   T H E   N U M B E R S
        </motion.h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCounter
              key={index}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix || ''}
              prefix={stat.prefix || ''}
              duration={stat.duration || 2}
              decimals={stat.decimals || 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

