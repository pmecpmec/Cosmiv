import ScrollReveal from './ScrollReveal'
import { motion } from 'framer-motion'
import CosmicBackground from './CosmicBackground'

export default function LandingPage({ onGetStarted }) {
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
      <CosmicBackground />
      {/* Hero Section - Enhanced */}
      <section className="pt-32 pb-hero px-4 min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Hero Content */}
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-hero font-black gradient-text-cosmic mb-6 tracking-poppr chromatic-aberration" style={{
              textShadow: '0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(0, 255, 255, 0.3)'
            }}>
              🌌 C O S M I V
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <p className="text-2xl md:text-4xl text-white/90 mb-6 font-bold tracking-tight">
              Launch Your Clips Into the Cosmos
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              AI-powered gaming montages in seconds. Upload clips, get viral highlights automatically.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <motion.button
              onClick={onGetStarted}
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                boxShadow: "0 0 30px rgba(139, 92, 246, 0.6), 0 0 50px rgba(0, 255, 255, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-5 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black border-2 border-cosmic-neon-cyan/50 text-lg tracking-wide transition-all neon-glow hover:neon-glow-cyan chromatic-aberration rounded-lg"
            >
              S T A R T   C R E A T I N G
            </motion.button>
            <motion.button
              onClick={() => {
                const nextSection = document.querySelector('.how-it-works');
                nextSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-5 bg-white/5 hover:bg-white/10 text-white font-bold border-2 border-white/20 hover:border-cosmic-neon-cyan/50 text-lg tracking-wide transition-all rounded-lg backdrop-blur-sm"
            >
              W A T C H   D E M O
            </motion.button>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 cursor-pointer group"
            onClick={() => {
              const nextSection = document.querySelector('.how-it-works');
              nextSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="text-white/60 text-xs font-bold tracking-wider uppercase group-hover:text-cosmic-neon-cyan transition-colors">
              Scroll
            </span>
            <div className="w-6 h-10 border-2 border-cosmic-neon-cyan/50 rounded-full flex items-start justify-center p-2 group-hover:border-cosmic-neon-cyan transition-colors">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-3 bg-cosmic-neon-cyan rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Pipeline Showcase */}
      <section className="how-it-works py-section px-4 bg-pure-white/5 min-h-screen flex items-center relative"
      >
        <div className="container mx-auto">
          <ScrollReveal delay={0.2}>
            <h2 className="text-section font-black gradient-text-cosmic text-center mb-20 tracking-poppr chromatic-aberration">
              H O W   I T   W O R K S
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {pipelineSteps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 0.1} direction="up">
                <motion.div 
                  className="broken-planet-card p-8 hover:border-cosmic-neon-cyan transition-all text-center relative group float"
                  whileHover={{ 
                    y: -8, 
                    scale: 1.03,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(139, 92, 246, 0.2), inset 0 0 20px rgba(0, 255, 255, 0.1)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div 
                    className="text-5xl mb-4"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {step.icon}
                  </motion.div>
                  <h3 className="text-lg font-black text-cosmic-neon-cyan mb-3 group-hover:gradient-text-cosmic transition-all">{step.title}</h3>
                  <p className="text-sm text-white/70 font-medium leading-relaxed">{step.description}</p>
                  {index < pipelineSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-cosmic-neon-cyan text-2xl font-black neon-glow-cyan">
                      →
                    </div>
                  )}
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-section px-4 min-h-screen flex items-center"
      >
        <div className="container mx-auto">
          <ScrollReveal delay={0.2}>
            <h2 className="text-section font-black gradient-text-cosmic text-center mb-20 tracking-poppr chromatic-aberration">
              W H Y   C H O O S E   C O S M I V ?
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.15} direction="up">
                <motion.div 
                  className="broken-planet-card p-8 hover:border-cosmic-neon-cyan transition-all group float relative overflow-hidden"
                  whileHover={{ 
                    y: -8, 
                    scale: 1.03,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(139, 92, 246, 0.2), inset 0 0 20px rgba(0, 255, 255, 0.1)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                  </div>
                  
                  <motion.div 
                    className="text-5xl mb-4 relative z-10"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-black gradient-text-cosmic mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-white/70 font-medium leading-relaxed relative z-10">{feature.description}</p>
              </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section px-4 min-h-screen flex items-center"
      >
        <div className="container mx-auto text-center">
          <ScrollReveal delay={0.3} direction="fade">
            <motion.div 
              className="broken-planet-card p-16 max-w-4xl mx-auto text-center float"
              whileHover={{ scale: 1.01 }}
            >
              <h2 className="text-section font-black gradient-text-cosmic mb-6 tracking-poppr chromatic-aberration">
                R E A D Y   T O   C R E A T E ?
              </h2>
              <p className="text-xl text-white/70 mb-12 font-bold leading-relaxed max-w-2xl mx-auto">
                Join thousands of creators transforming their gameplay into engaging montages.
              </p>
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black border-2 border-cosmic-neon-cyan/50 text-lg tracking-wide transition-all neon-glow hover:neon-glow-cyan chromatic-aberration"
              >
                S T A R T   C R E A T I N G   N O W
              </motion.button>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}

