import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

/**
 * Premium Landing Page Component
 * 
 * Design Principles Applied:
 * - Clear above-the-fold with sharp headline, clean subtext, single CTA
 * - Strict visual hierarchy using spacing, sizing, and contrast
 * - Consistent typography with Space Grotesk
 * - Subtle micro-animations with natural easing
 * - Strict spacing scale (8px base unit)
 * - Fully responsive with mobile-first approach
 * - Minimal clutter, confident use of white space
 */
export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  // Animation variants for consistent, premium feel
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // Natural easing curve
      },
    },
  }

  return (
    <div className="min-h-screen bg-pure-black">
      {/* Hero Section - Above the Fold */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Main Headline - Sharp and Clear */}
            <motion.h1
              variants={itemVariants}
              className="text-display-2xl md:text-display-2xl mb-6 md:mb-8 font-bold text-pure-white"
            >
              Transform Clips Into
              <br />
              <span className="text-gradient-cosmic">Viral Montages</span>
            </motion.h1>
            
            {/* Subtext - Clean and Descriptive */}
            <motion.p
              variants={itemVariants}
              className="text-body-lg md:text-headline-sm text-pure-white/70 mb-4 md:mb-6 max-w-2xl mx-auto font-normal leading-relaxed"
            >
              AI-powered editing that automatically detects highlights, applies cinematic styles, 
              and renders professional montages—ready to share.
            </motion.p>

            {/* Single Strong CTA - No Clutter */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center mt-8 md:mt-12"
            >
              {isAuthenticated ? (
                <Link
                  to="/upload"
                  className="group relative inline-flex items-center justify-center px-8 py-4 md:px-10 md:py-5 bg-cosmic-violet hover:bg-cosmic-purple rounded-lg text-body-md md:text-body-lg font-semibold text-pure-white transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] focus:outline-none focus:ring-2 focus:ring-cosmic-violet focus:ring-offset-2 focus:ring-offset-pure-black"
                >
                  <span className="relative z-10">Start Creating</span>
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-cosmic-violet to-cosmic-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="group relative inline-flex items-center justify-center px-8 py-4 md:px-10 md:py-5 bg-cosmic-violet hover:bg-cosmic-purple rounded-lg text-body-md md:text-body-lg font-semibold text-pure-white transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] focus:outline-none focus:ring-2 focus:ring-cosmic-violet focus:ring-offset-2 focus:ring-offset-pure-black"
                >
                  <span className="relative z-10">Get Started Free</span>
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-cosmic-violet to-cosmic-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Below the Fold */}
      <section className="relative py-section px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="text-headline-xl md:text-display-lg mb-4 text-pure-white font-semibold">
              Everything You Need
            </h2>
            <p className="text-body-lg text-pure-white/60 max-w-2xl mx-auto">
              Professional editing tools powered by AI, designed for creators who want results fast.
            </p>
          </motion.div>

          {/* Features Grid - Responsive and Clean */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: 'AI Highlight Detection',
                description: 'Automatically identifies high-action moments using motion analysis, audio peaks, and scene detection.',
                icon: '🤖',
              },
              {
                title: 'Cinematic Styles',
                description: 'Choose from multiple editing styles—cinematic, esports, energetic—each with unique pacing and transitions.',
                icon: '🎨',
              },
              {
                title: 'Instant Rendering',
                description: 'Full pipeline from upload to finished video. No manual editing required.',
                icon: '🚀',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className="group relative p-8 md:p-10 rounded-xl bg-bw-gray-1/50 border border-white/5 hover:border-cosmic-violet/30 transition-all duration-300 hover:bg-bw-gray-1/70"
              >
                {/* Icon */}
                <div className="text-4xl md:text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-headline-md mb-3 text-pure-white font-semibold">
                  {feature.title}
                </h3>
                <p className="text-body-md text-pure-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
