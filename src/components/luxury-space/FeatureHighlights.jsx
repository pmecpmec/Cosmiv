/**
 * Feature Highlights / USP Section
 * 3-4 horizontally aligned cards with hover effects
 */

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const features = [
  {
    icon: '✨',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
    title: 'PREMIUM MATERIALS',
    description: 'Crafted from the finest cosmic-grade materials',
  },
  {
    icon: '🌌',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
    title: 'LIMITED EDITION',
    description: 'Exclusive designs available in limited quantities',
  },
  {
    icon: '⭐',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
    title: 'EXPERT CRAFTSMANSHIP',
    description: 'Meticulously designed by master artisans',
  },
  {
    icon: '🚀',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
    title: 'COSMIC ELEGANCE',
    description: 'Where luxury meets the infinite cosmos',
  },
]

export default function FeatureHighlights() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="features" className="py-32 px-6 md:px-20 bg-[#0B0C10]">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="font-serif text-[clamp(2.5rem,5vw,4rem)] uppercase tracking-[0.1em] text-[#F5F5F5] text-center mb-20"
      >
        EXCEPTIONAL FEATURES
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className="bg-[#1C1E26] border border-[rgba(0,255,247,0.1)] rounded-lg p-10 h-[500px] overflow-hidden hover:border-[#00FFF7] hover:shadow-[0_0_30px_rgba(0,255,247,0.3)] transition-all group cursor-pointer"
          >
            <div className="h-[60%] mb-6 overflow-hidden rounded">
              <motion.img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <div className="text-5xl mb-6 text-[#00FFF7]">{feature.icon}</div>
            <h3 className="font-serif text-2xl uppercase tracking-[0.1em] text-[#F5F5F5] mb-3 font-semibold">
              {feature.title}
            </h3>
            <p className="font-sans text-base text-[#C0C0C0] leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

