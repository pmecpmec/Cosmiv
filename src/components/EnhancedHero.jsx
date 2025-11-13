/**
 * EnhancedHero - Premium hero section with dynamic animations
 * Features:
 * - Slow-rotating cosmic orb
 * - Gradient beam sweep
 * - Enhanced particle system
 * - Magnetic button effects
 * - Parallax depth layers
 * - Smooth scroll indicators
 */

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import AnimatedHeroText from './AnimatedHeroText'
import HeroParticles from './HeroParticles'
import FloatingElements from './FloatingElements'

export default function EnhancedHero({ onGetStarted }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef(null)
  const orbRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Parallax transforms for depth
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Smooth spring animations
  const smoothY1 = useSpring(y1, { stiffness: 100, damping: 30 })
  const smoothY2 = useSpring(y2, { stiffness: 100, damping: 30 })
  const smoothY3 = useSpring(y3, { stiffness: 100, damping: 30 })

  // Mouse tracking for magnetic effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Magnetic button effect
  const MagneticButton = ({ children, onClick, className, delay = 0 }) => {
    const [hovered, setHovered] = useState(false)
    const buttonRef = useRef(null)

    return (
      <motion.button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={className}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay, type: 'spring', stiffness: 200 }}
        whileHover={{
          scale: 1.08,
          y: -4,
          transition: { type: 'spring', stiffness: 400, damping: 17 },
        }}
        whileTap={{ scale: 0.95 }}
        style={{
          x: hovered ? mousePos.x * 10 : 0,
          y: hovered ? mousePos.y * 10 : 0,
        }}
      >
        {children}
      </motion.button>
    )
  }

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-hero px-4"
    >
      {/* Parallax Background Layers */}
      <motion.div
        style={{ y: smoothY1, opacity }}
        className="absolute inset-0 -z-10"
      >
        {/* Deep space gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-pure-black via-cosmic-space to-pure-black" />
      </motion.div>

      {/* Slow-rotating Cosmic Orb */}
      <motion.div
        ref={orbRef}
        style={{ y: smoothY2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] -z-5 pointer-events-none"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.05, 1],
        }}
        transition={{
          rotate: {
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          },
          scale: {
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      >
        {/* Outer glow rings */}
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-cosmic-violet/30 via-cosmic-neon-cyan/20 to-transparent opacity-30 animate-pulse-glow" />
        <div className="absolute inset-0 rounded-full border-2 border-cosmic-neon-cyan/20 animate-spin-slow" />
        
        {/* Main orb with gradient */}
        <div className="absolute inset-[20%] rounded-full bg-gradient-to-br from-cosmic-violet/40 via-cosmic-purple/30 to-cosmic-neon-cyan/40 backdrop-blur-xl border border-cosmic-neon-cyan/30 shadow-[0_0_100px_rgba(139,92,246,0.5),0_0_200px_rgba(0,255,255,0.3)]" />
        
        {/* Inner core */}
        <motion.div
          className="absolute inset-[40%] rounded-full bg-gradient-to-br from-cosmic-hot-pink/60 to-cosmic-neon-cyan/60"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Gradient Beam Sweep Effect */}
      <motion.div
        style={{ y: smoothY3 }}
        className="absolute inset-0 -z-5 pointer-events-none overflow-hidden"
      >
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          animate={{
            background: [
              'linear-gradient(135deg, transparent 0%, rgba(139,92,246,0.1) 50%, transparent 100%)',
              'linear-gradient(225deg, transparent 0%, rgba(0,255,255,0.15) 50%, transparent 100%)',
              'linear-gradient(135deg, transparent 0%, rgba(139,92,246,0.1) 50%, transparent 100%)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Sweeping beam */}
        <motion.div
          className="absolute top-0 w-1/3 h-full bg-gradient-to-r from-transparent via-cosmic-neon-cyan/20 to-transparent blur-3xl"
          animate={{
            x: ['-100%', '400%'],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 2,
          }}
        />
      </motion.div>

      {/* Floating Elements */}
      <FloatingElements count={12} />

      {/* Enhanced Particles */}
      <HeroParticles count={60} />

      {/* Hero Content - Parallax Layer */}
      <motion.div
        style={{ y: smoothY3, opacity }}
        className="container mx-auto text-center relative z-10"
      >
        {/* Animated Logo with space font */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mb-6"
        >
          <AnimatedHeroText
            text="🌌 C O S M I V"
            className="text-6xl md:text-8xl lg:text-9xl cursor-pointer select-none font-display"
            delay={0.2}
            stagger={0.03}
          />
          <motion.div
            className="mt-2"
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <p className="text-xs md:text-sm text-cosmic-neon-cyan/50 font-bold tracking-widest font-exo">
              ✦ HIDDEN SECRETS AWAY ✦
            </p>
          </motion.div>
        </motion.div>

        {/* Animated Tagline with enhanced glow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
        >
          <motion.p
            className="text-3xl md:text-5xl lg:text-6xl text-white/95 mb-6 font-black tracking-tight font-display"
            animate={{
              textShadow: [
                '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(0, 255, 255, 0.7)',
                '0 0 40px rgba(0, 255, 255, 0.9), 0 0 60px rgba(139, 92, 246, 0.7)',
                '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(0, 255, 255, 0.7)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Launch Your Clips Into the Cosmos
          </motion.p>
        </motion.div>

        {/* Description with fade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: 'easeOut' }}
        >
          <p className="text-lg md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto font-bold leading-relaxed font-exo">
            AI-powered gaming montages in seconds. Upload clips, get viral highlights automatically.
          </p>
        </motion.div>

        {/* Enhanced CTA Buttons with Magnetic Effect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
          className="flex gap-6 justify-center flex-wrap"
        >
          <MagneticButton
            onClick={onGetStarted}
            delay={1.3}
            className="px-16 py-6 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black border-2 border-cosmic-neon-cyan/50 text-xl tracking-wide transition-all neon-glow hover:neon-glow-cyan chromatic-aberration rounded-lg relative overflow-hidden group font-display"
          >
            {/* Button glow effect */}
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
            <span className="relative z-10">S T A R T   C R E A T I N G</span>
          </MagneticButton>

          <MagneticButton
            onClick={() => {
              const nextSection = document.querySelector('.how-it-works')
              nextSection?.scrollIntoView({ behavior: 'smooth' })
            }}
            delay={1.4}
            className="px-16 py-6 bg-white/5 hover:bg-white/10 text-white font-bold border-2 border-white/20 hover:border-cosmic-neon-cyan/70 text-xl tracking-wide transition-all rounded-lg backdrop-blur-sm relative overflow-hidden group font-exo"
          >
            <span className="relative z-10">W A T C H   D E M O</span>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => {
            const nextSection = document.querySelector('.how-it-works')
            nextSection?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <span className="text-white/60 text-xs font-bold tracking-wider uppercase group-hover:text-cosmic-neon-cyan transition-colors font-exo">
            Scroll
          </span>
          <div className="w-6 h-10 border-2 border-cosmic-neon-cyan/50 rounded-full flex items-start justify-center p-2 group-hover:border-cosmic-neon-cyan transition-colors">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-3 bg-cosmic-neon-cyan rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

