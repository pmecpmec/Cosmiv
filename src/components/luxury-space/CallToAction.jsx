/**
 * Call to Action Section
 * Centered CTA with blurred background
 */

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export default function CallToAction() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative h-[500px] flex items-center justify-center overflow-hidden">
      {/* Blurred Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1920"
          alt="CTA Background"
          className="w-full h-full object-cover blur-sm scale-110"
        />
        <div className="absolute inset-0 bg-[rgba(11,12,16,0.7)]"></div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1 }}
        className="relative z-10 text-center px-6"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          className="px-16 py-6 border-2 border-[#00FFF7] text-[#00FFF7] font-sans uppercase tracking-[0.15em] text-lg hover:bg-[rgba(0,255,247,0.1)] hover:shadow-[0_0_60px_rgba(0,255,247,0.8)] transition-all relative overflow-hidden group"
        >
          <span className="relative z-10">RESERVE YOURS NOW</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.button>
      </motion.div>
    </section>
  )
}

