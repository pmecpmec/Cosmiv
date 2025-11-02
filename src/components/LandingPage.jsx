import ScrollReveal from './ScrollReveal'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen bg-pure-black text-pure-white">
      {/* Hero Section */}
      <section className="pt-hero pb-hero px-4 min-h-screen flex items-center"
      >
        <div className="container mx-auto text-center">
          <ScrollReveal delay={0.2}>
            <h1 className="text-7xl md:text-9xl font-black gradient-text-cosmic mb-8 tracking-poppr chromatic-aberration">
              🌌 C O S M I V
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <p className="text-3xl md:text-4xl text-pure-white/80 mb-8 font-bold tracking-tight">
              AI-Powered Highlight Video Editor
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.6}>
            <p className="text-xl text-pure-white/60 mb-12 max-w-2xl mx-auto font-bold leading-relaxed">
              Transform your gameplay clips into viral montages automatically. 
              Upload, AI edits, and share - all in one platform.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.8}>
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black border-2 border-cosmic-neon-cyan/50 text-lg tracking-wide transition-all neon-glow hover:neon-glow-cyan chromatic-aberration"
            >
              G E T   S T A R T E D
            </motion.button>
          </ScrollReveal>
        </div>
      </section>

      {/* Pipeline Showcase */}
      <section className="py-section px-4 bg-pure-white/5 min-h-screen flex items-center"
      >
        <div className="container mx-auto">
          <ScrollReveal delay={0.2}>
            <h2 className="text-5xl md:text-6xl font-black text-pure-white text-center mb-20 tracking-poppr">
              H O W   I T   W O R K S
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {pipelineSteps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 0.1} direction="up">
                <motion.div 
                  className="broken-planet-card p-8 hover:border-cosmic-neon-cyan transition-all text-center relative group float"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-lg font-black text-cosmic-neon-cyan mb-2">{step.title}</h3>
                  <p className="text-sm text-white/70 font-bold">{step.description}</p>
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
            <h2 className="text-5xl md:text-6xl font-black text-pure-white text-center mb-20 tracking-poppr">
              W H Y   C H O O S E   A I D I T O R ?
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.15} direction="up">
                <motion.div 
                  className="broken-planet-card p-8 hover:border-cosmic-neon-cyan transition-all group float"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-black gradient-text-cosmic mb-2">{feature.title}</h3>
                <p className="text-white/60 font-bold">{feature.description}</p>
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
              <h2 className="text-4xl md:text-5xl font-black gradient-text-cosmic mb-6 tracking-poppr">
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

