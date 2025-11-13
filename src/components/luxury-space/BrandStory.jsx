/**
 * Brand Story / Philosophy Section
 * Split-screen with image and text
 */

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export default function BrandStory() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="philosophy" className="py-32 px-6 md:px-20 bg-[#0B0C10]">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl">
        {/* Image/Video */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative h-[600px] rounded-lg overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200"
            alt="Brand Story"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,255,247,0.1)] to-transparent"></div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="p-8 md:p-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-semibold text-[#FFD700] mb-10"
          >
            Our Philosophy
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-sans text-lg text-[#C0C0C0] leading-relaxed mb-8"
          >
            Where luxury meets the cosmos, we craft experiences that transcend earthly boundaries. Every detail is meticulously designed to evoke wonder, elegance, and the infinite possibilities of space.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="w-16 h-0.5 bg-gradient-to-r from-[#FFD700] to-[#00FFF7] my-8"
          />
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
            className="font-sans text-lg text-[#C0C0C0] leading-relaxed"
          >
            We believe in creating not just products, but legacies. Each piece is a testament to human ingenuity and the eternal quest for excellence that reaches beyond the stars.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

