/**
 * Product Details / Features Section
 * Two-column: 3D model and specs
 */

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'

const specs = [
  'Premium cosmic-grade materials',
  'Handcrafted by master artisans',
  'Limited edition numbering',
  'Lifetime warranty included',
  'Customizable configurations',
  'Exclusive collector\'s packaging',
]

export default function ProductDetails() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20
    setRotation({ x: -y, y: x })
  }

  return (
    <section ref={ref} id="products" className="py-32 px-6 md:px-20 bg-[#0B0C10]">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl">
        {/* 3D Model */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="h-[600px] bg-gradient-to-br from-[#10122B] to-[#0B0C10] rounded-lg flex items-center justify-center relative overflow-hidden border border-[rgba(0,255,247,0.2)]"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setRotation({ x: 0, y: 0 })}
        >
          {/* Placeholder for 3D model - Replace with Three.js or CSS 3D */}
          <motion.div
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            }}
            className="w-64 h-64 bg-gradient-to-br from-[#00FFF7] to-[#A855F7] rounded-full opacity-30 blur-3xl"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl text-[#00FFF7] opacity-50">3D MODEL</div>
          </div>
        </motion.div>

        {/* Specs */}
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
            className="font-serif text-[clamp(2rem,4vw,3rem)] uppercase tracking-[0.1em] text-[#F5F5F5] mb-12"
          >
            PRODUCT NAME
          </motion.h2>
          
          <ul className="space-y-6">
            {specs.map((spec, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
                className="font-sans text-lg text-[#C0C0C0] flex items-start"
              >
                <span className="text-[#00FFF7] mr-4 text-xl">✦</span>
                <span>{spec}</span>
              </motion.li>
            ))}
          </ul>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className="mt-12 px-12 py-5 border-2 border-[#00FFF7] text-[#00FFF7] font-sans uppercase tracking-[0.1em] text-lg hover:bg-[rgba(0,255,247,0.15)] hover:shadow-[0_0_30px_rgba(0,255,247,0.6)] transition-all"
          >
            REQUEST INFORMATION
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

