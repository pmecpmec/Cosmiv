import { useState, lazy, Suspense } from 'react'
import ScrollReveal from './ScrollReveal'
import { motion } from 'framer-motion'
import Planet3DBackground from './Planet3DBackground'
import useEasterEggs from '../hooks/useEasterEggs'
import { InlineLoader } from './ui/LoadingOverlay'
import HeroParticles from './HeroParticles'
import AnimatedHeroText from './AnimatedHeroText'
import FloatingElements from './FloatingElements'
import StatsCounter from './StatsCounter'
import InteractiveDemo from './InteractiveDemo'
import ParallaxSection from './ParallaxSection'
import EnhancedHero from './EnhancedHero'

// Lazy load the game (it's a hidden feature)
const CosmicGame = lazy(() => import('./game/CosmicGame'))

export default function LandingPage({ onGetStarted }) {
  const [showGame, setShowGame] = useState(false)
  
  // Easter egg handlers
  const { handleConstellationClick, handleLogoClick } = useEasterEggs(() => {
    setShowGame(true)
  })
  const pipelineSteps = [
    { icon: "📤", title: "Upload Clips", description: "Import from Steam, Xbox, PS, or Switch" },
    { icon: "🧠", title: "AI Detection", description: "Automatically detects highlights and action moments" },
    { icon: "✂️", title: "Smart Editing", description: "Applies montage styles, cuts, and effects" },
    { icon: "🎵", title: "AI Music", description: "Generates dynamic soundtracks synced to beats" },
    { icon: "🚫", title: "Auto-Censor", description: "Removes profanity automatically" },
    { icon: "📹", title: "Multi-Format", description: "Exports 16:9 and 9:16 for all platforms" },
  ]

  const features = [
    { icon: "⚡", title: "Lightning Fast", description: "Process clips in seconds, not hours" },
    { icon: "🎯", title: "AI-Powered", description: "Advanced ML detects the best moments" },
    { icon: "📱", title: "Auto-Post", description: "Share to TikTok, YouTube, Instagram automatically" },
    { icon: "💰", title: "Monetize", description: "Free, Pro, and Creator+ tiers available" },
  ]


  return (
    <div className="min-h-screen bg-pure-black text-pure-white relative">
      <Planet3DBackground />
      {/* Enhanced Hero Section */}
      <EnhancedHero onGetStarted={onGetStarted} />

      {/* Pipeline Showcase - Enhanced with Parallax */}
      <ParallaxSection speed={0.3}>
        <section className="how-it-works py-section px-4 bg-pure-white/5 min-h-screen flex items-center relative overflow-hidden"
        >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-pure-black/0 via-cosmic-violet/5 to-pure-black/0 pointer-events-none" />
        
        <div className="container mx-auto relative z-10">
          <ScrollReveal delay={0.2}>
            <motion.h2 
              className="text-5xl md:text-7xl font-black gradient-text-cosmic text-center mb-20 tracking-poppr chromatic-aberration"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              H O W   I T   W O R K S
            </motion.h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {pipelineSteps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 0.1} direction="up">
                <motion.div 
                  className="broken-planet-card p-8 hover:border-cosmic-neon-cyan transition-all text-center relative group float card-3d overflow-hidden"
                  initial={{ opacity: 0, y: 50, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                  whileHover={{ 
                    y: -12, 
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: -5,
                    z: 20,
                    boxShadow: "0 30px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.4), 0 0 60px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.2)"
                  }}
                >
                  {/* Card glow on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-cosmic-violet/20 via-transparent to-cosmic-neon-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      opacity: [0, 0.3, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.2,
                    }}
                  />
                  
                  {/* Animated icon with rotation */}
                  <motion.div 
                    className="text-5xl md:text-6xl mb-6 relative z-10"
                    whileHover={{ 
                      scale: 1.3, 
                      rotate: [0, 10, -10, 0],
                      filter: 'brightness(1.5)',
                    }}
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2 + index * 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {step.icon}
                  </motion.div>
                  
                  <motion.h3 
                    className="text-xl font-black text-cosmic-neon-cyan mb-4 group-hover:gradient-text-cosmic transition-all relative z-10"
                    animate={{
                      textShadow: [
                        '0 0 10px rgba(0, 255, 255, 0.3)',
                        '0 0 20px rgba(139, 92, 246, 0.5)',
                        '0 0 10px rgba(0, 255, 255, 0.3)',
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.2,
                    }}
                  >
                    {step.title}
                  </motion.h3>
                  <p className="text-sm md:text-base text-white/70 font-medium leading-relaxed relative z-10">{step.description}</p>
                  
                  {/* Animated arrow connector */}
                  {index < pipelineSteps.length - 1 && (
                    <motion.div 
                      className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-cosmic-neon-cyan text-3xl font-black"
                      animate={{
                        x: [0, 5, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.2,
                      }}
                    >
                      →
                    </motion.div>
                  )}
                  
                  {/* Corner accent */}
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cosmic-neon-cyan/50 group-hover:border-cosmic-neon-cyan transition-colors" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cosmic-neon-cyan/50 group-hover:border-cosmic-neon-cyan transition-colors" />
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Enhanced */}
      <section className="py-section px-4 min-h-screen flex items-center relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cosmic-violet/10 via-transparent to-cosmic-neon-cyan/10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        <div className="container mx-auto relative z-10">
          <ScrollReveal delay={0.2}>
            <motion.h2 
              className="text-5xl md:text-7xl font-black gradient-text-cosmic text-center mb-20 tracking-poppr chromatic-aberration"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              W H Y   C H O O S E   C O S M I V ?
            </motion.h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.15} direction="up">
                <motion.div 
                  className="broken-planet-card p-10 hover:border-cosmic-neon-cyan transition-all group float relative overflow-hidden card-3d"
                  initial={{ opacity: 0, y: 60, rotateY: -20 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.15, type: "spring", stiffness: 250, damping: 20 }}
                  whileHover={{ 
                    y: -12, 
                    scale: 1.06,
                    rotateY: 5,
                    rotateX: -3,
                    z: 30,
                    boxShadow: "0 30px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(139, 92, 246, 0.5), 0 0 70px rgba(0, 255, 255, 0.4), inset 0 0 40px rgba(0, 255, 255, 0.2)"
                  }}
                >
                  {/* Enhanced shimmer effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                    animate={{
                      background: [
                        'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                        'linear-gradient(135deg, transparent 0%, rgba(0,255,255,0.2) 50%, transparent 100%)',
                        'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  
                  {/* Pulsing background glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-cosmic-violet/20 via-transparent to-cosmic-neon-cyan/20"
                    animate={{
                      opacity: [0.2, 0.5, 0.2],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.3,
                    }}
                  />
                  
                  {/* Animated icon with enhanced effects */}
                  <motion.div 
                    className="text-6xl md:text-7xl mb-6 relative z-10"
                    whileHover={{ 
                      scale: 1.4, 
                      rotate: [0, 15, -15, 0],
                      filter: 'brightness(1.8) drop-shadow(0 0 20px rgba(0, 255, 255, 0.8))',
                    }}
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3 + index * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                  
                  <motion.h3 
                    className="text-2xl font-black gradient-text-cosmic mb-4 relative z-10"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    {feature.title}
                  </motion.h3>
                  <p className="text-base text-white/70 font-medium leading-relaxed relative z-10">{feature.description}</p>
                  
                  {/* Glow border on hover */}
                  <motion.div
                    className="absolute inset-0 border-2 border-cosmic-neon-cyan/0 group-hover:border-cosmic-neon-cyan/50 rounded-lg transition-colors"
                    animate={{
                      boxShadow: [
                        '0 0 0px rgba(0, 255, 255, 0)',
                        '0 0 20px rgba(0, 255, 255, 0.3)',
                        '0 0 0px rgba(0, 255, 255, 0)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.2,
                    }}
                  />
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <StatsCounter />

      {/* Interactive Demo Section */}
      <InteractiveDemo autoPlay={true} interval={4000} />

      {/* CTA Section - Enhanced */}
      <section className="py-section px-4 min-h-screen flex items-center relative overflow-hidden"
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cosmic-violet/10 via-cosmic-deep-blue/10 to-cosmic-neon-cyan/10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal delay={0.3} direction="fade">
            <motion.div 
              className="broken-planet-card p-16 md:p-20 max-w-5xl mx-auto text-center float relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(139, 92, 246, 0.4), 0 0 100px rgba(0, 255, 255, 0.3)"
              }}
            >
              {/* Animated border glow */}
              <motion.div
                className="absolute inset-0 border-2 border-cosmic-neon-cyan/30 rounded-lg"
                animate={{
                  borderColor: [
                    'rgba(0, 255, 255, 0.3)',
                    'rgba(139, 92, 246, 0.6)',
                    'rgba(0, 255, 255, 0.3)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Background glow pulse */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cosmic-violet/20 via-transparent to-cosmic-neon-cyan/20"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              <motion.h2 
                className="text-4xl md:text-6xl font-black gradient-text-cosmic mb-8 tracking-poppr chromatic-aberration relative z-10"
                animate={{
                  textShadow: [
                    '0 0 30px rgba(139, 92, 246, 0.5)',
                    '0 0 50px rgba(0, 255, 255, 0.7)',
                    '0 0 30px rgba(139, 92, 246, 0.5)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                R E A D Y   T O   C R E A T E ?
              </motion.h2>
              <motion.p 
                className="text-xl md:text-2xl text-white/80 mb-12 font-bold leading-relaxed max-w-3xl mx-auto relative z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Join thousands of creators transforming their gameplay into engaging montages.
              </motion.p>
              <motion.button
                onClick={onGetStarted}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: 'spring' }}
                whileHover={{ 
                  scale: 1.1,
                  y: -4,
                  boxShadow: "0 0 50px rgba(139, 92, 246, 0.8), 0 0 80px rgba(0, 255, 255, 0.6), 0 15px 40px rgba(0, 0, 0, 0.6)"
                }}
                whileTap={{ scale: 0.95 }}
                className="px-16 py-6 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black border-2 border-cosmic-neon-cyan/50 text-xl tracking-wide transition-all neon-glow hover:neon-glow-cyan chromatic-aberration rounded-lg relative overflow-hidden group relative z-10"
              >
                {/* Button shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <span className="relative z-10">S T A R T   C R E A T I N G   N O W</span>
              </motion.button>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
      </ParallaxSection>

      {/* Hidden Constellation Pattern - Click stars in order */}
      <div className="fixed top-20 right-8 z-20 opacity-30 hover:opacity-60 transition-opacity cursor-pointer">
        {[0, 1, 2, 3, 4].map((id) => (
          <motion.div
            key={id}
            className="absolute w-3 h-3 bg-cosmic-neon-cyan rounded-full animate-twinkle"
            style={{
              left: `${id * 15}px`,
              top: `${id * 15}px`,
            }}
            whileHover={{ scale: 1.5 }}
            onClick={() => handleConstellationClick(id)}
            title="Click stars in order..."
          />
        ))}
      </div>

      {/* Hidden Game Modal */}
      {showGame && (
        <Suspense fallback={<InlineLoader message="Loading game..." />}>
          <CosmicGame onClose={() => setShowGame(false)} />
        </Suspense>
      )}
    </div>
  )
}

