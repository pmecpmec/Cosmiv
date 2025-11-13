/**
 * TensorStax-inspired Hero Section
 * Clean, professional, minimal design
 */

import { motion } from 'framer-motion'

export default function TensorStaxHero({ onGetStarted }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 px-4">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-pure-black via-pure-black to-pure-black/95" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-6 leading-tight tracking-tight"
          >
            Gaming montages that
            <br />
            <span className="font-normal">build themselves</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-lg md:text-xl text-white/60 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Designed for creators, our platform leverages AI to automatically detect highlights, 
            edit clips, and generate montages—seamlessly integrating with your gaming platforms.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white text-black font-medium text-sm tracking-wide hover:bg-white/90 transition-all rounded-sm"
            >
              Get Started
            </button>
            <button className="px-8 py-4 border border-white/20 text-white font-medium text-sm tracking-wide hover:border-white/40 hover:bg-white/5 transition-all rounded-sm">
              Book a Demo
            </button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 flex flex-col items-center gap-2 text-white/40 text-xs tracking-wider"
          >
            <span>(Scroll Down)</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1.5"
            >
              <div className="w-1 h-1.5 bg-white/40 rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


