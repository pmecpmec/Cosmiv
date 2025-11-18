import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl md:text-9xl font-display font-black mb-6 text-gradient-cosmic"
          >
            COSMIV
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl md:text-4xl text-cosmic-neon-cyan mb-8 font-light"
          >
            AI-Powered Gaming Montages
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-pure-white/70 mb-12 max-w-2xl mx-auto"
          >
            Transform your raw gameplay clips into viral, AI-edited montages automatically.
            Upload, select style, and let AI create your next highlight reel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {isAuthenticated ? (
              <Link
                to="/upload"
                className="px-8 py-4 bg-cosmic-violet hover:glow-neon rounded-lg text-lg font-semibold transition-all"
              >
                Start Creating
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-cosmic-violet hover:glow-neon rounded-lg text-lg font-semibold transition-all"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 glass-effect border border-cosmic-violet/50 hover:border-cosmic-violet rounded-lg text-lg font-semibold transition-all"
                >
                  Login
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-display text-center mb-16 text-gradient-broken"
          >
            Features
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI Highlight Detection',
                description: 'Automatically finds high-action moments in your clips',
                icon: '🤖',
              },
              {
                title: 'Multiple Styles',
                description: 'Cinematic, gaming, energetic, and more editing styles',
                icon: '🎨',
              },
              {
                title: 'Auto Rendering',
                description: 'Full pipeline from upload to finished video',
                icon: '🚀',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-effect p-8 rounded-xl hover:glow-neon transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-cosmic-neon-cyan">
                  {feature.title}
                </h3>
                <p className="text-pure-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}



