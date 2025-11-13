import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function PublicHomePage({ onGetStarted, onLogin }) {
  const [montages, setMontages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { scrollY } = useScroll()
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    loadMontages()
  }, [])

  const loadMontages = async () => {
    try {
      const res = await fetch('/api/v2/weekly-montages?limit=6&featured_only=true').catch(() => null)
      if (!res.ok) throw new Error('Failed to load montages')
      const data = await res.json()
      setMontages(data.montages || [])
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Hero Section with Glassmorphism */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 gradient-mesh-animated opacity-60"></div>
        
        {/* Floating orbs for depth */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 gradient-radial-glow rounded-full blur-3xl opacity-40"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 gradient-radial-glow rounded-full blur-3xl opacity-30"
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="text-center relative z-10 max-w-6xl mx-auto"
        >
          {/* Glassmorphic container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="backdrop-blur-xl bg-pure-white/5 border border-pure-white/20 rounded-3xl p-12 md:p-16 shadow-2xl"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(139, 92, 246, 0.2), inset 0 0 60px rgba(0, 255, 255, 0.1)'
            }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-8xl lg:text-9xl font-black text-gradient-animated mb-6 tracking-poppr font-display"
              style={{
                textShadow: '0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(0, 255, 255, 0.3)'
              }}
            >
              🌌 C O S M I V
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl lg:text-3xl text-pure-white/90 font-bold tracking-wide font-exo mb-4"
            >
              A I - P O W E R E D   G A M I N G   M O N T A G E   P L A T F O R M
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-base md:text-lg text-pure-white/70 font-medium tracking-wide mb-12 max-w-2xl mx-auto"
            >
              Transform your raw gameplay clips into cinematic highlights with AI-powered editing. 
              Automatic scene detection, smart transitions, and stunning visual effects.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              {onGetStarted && (
                <motion.button
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-10 py-5 bg-gradient-to-r from-cosmic-violet via-cosmic-purple to-cosmic-deep-blue text-white font-black tracking-wide text-lg rounded-xl overflow-hidden border-2 border-cosmic-neon-cyan/50"
                  style={{
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(0, 255, 255, 0.3)'
                  }}
                >
                  <span className="relative z-10">S T A R T   C R E A T I N G</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cosmic-neon-cyan/20 to-cosmic-violet/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              )}
              {onLogin && (
                <motion.button
                  onClick={onLogin}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-5 backdrop-blur-xl bg-pure-white/10 border-2 border-pure-white/30 hover:border-cosmic-neon-cyan text-pure-white font-black tracking-wide text-lg rounded-xl transition-all hover:bg-pure-white/20"
                  style={{
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  S I G N   I N
                </motion.button>
              )}
            </motion.div>

            {/* Feature highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { icon: '🤖', title: 'AI-Powered', desc: 'Smart scene detection' },
                { icon: '⚡', title: 'Lightning Fast', desc: 'Quick rendering' },
                { icon: '🎨', title: 'Cinematic', desc: 'Professional quality' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 + i * 0.1 }}
                  className="backdrop-blur-lg bg-pure-white/5 border border-pure-white/10 rounded-xl p-6 text-center"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <div className="font-black text-pure-white mb-2 tracking-wide">{feature.title}</div>
                  <div className="text-sm text-pure-white/70 font-medium">{feature.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-pure-white/60 text-sm font-bold tracking-wide"
          >
            ↓ S C R O L L
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Plays of the Week Section */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gradient-animated mb-6 tracking-poppr font-display">
              🎬 P L A Y S   O F   T H E   W E E K
            </h2>
            <p className="text-xl md:text-2xl text-pure-white/70 font-bold tracking-wide font-exo">
              T H E   B E S T   M O M E N T S   C O M P I L E D   A U T O M A T I C A L L Y
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="backdrop-blur-xl bg-pure-white/5 border border-pure-white/10 rounded-2xl p-8 animate-pulse">
                  <div className="bg-pure-white/10 h-64 rounded-xl mb-4"></div>
                  <div className="bg-pure-white/10 h-6 rounded mb-2"></div>
                  <div className="bg-pure-white/10 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">⚠️</div>
              <div className="text-pure-white text-2xl mb-4 font-black tracking-poppr">
                {error}
              </div>
            </div>
          ) : montages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📹</div>
              <div className="text-pure-white text-3xl mb-4 font-black tracking-poppr">
                N O   P L A Y S   Y E T
              </div>
              <div className="text-pure-white/60 mb-8 font-bold tracking-wide">
                Weekly montages are compiled automatically every Monday from the best clips of the week.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {montages.map((montage, index) => (
                <motion.div
                  key={montage.id}
                  initial={{ opacity: 0, y: 50, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1, 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  }}
                  whileHover={{ 
                    y: -12, 
                    scale: 1.02,
                    rotateY: 2,
                  }}
                  className="group relative backdrop-blur-xl bg-pure-white/5 border border-pure-white/20 rounded-2xl p-6 overflow-hidden transition-all duration-300"
                  style={{
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-cosmic-violet/20 via-transparent to-cosmic-neon-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                    style={{
                      filter: 'blur(20px)'
                    }}
                  />

                  {montage.is_featured && (
                    <div className="absolute -top-3 left-4 px-4 py-2 bg-gradient-to-r from-cosmic-violet to-cosmic-purple text-pure-white border-2 border-cosmic-neon-cyan font-black tracking-wide text-xs rounded-lg z-10 shadow-lg"
                      style={{
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
                      }}
                    >
                      ⭐ F E A T U R E D
                    </div>
                  )}

                  <div className="mb-4 relative z-10">
                    <h3 className="font-black text-xl mb-2 tracking-wide uppercase text-pure-white">
                      {montage.title || `Week of ${new Date(montage.week_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
                    </h3>
                    <div className="text-sm font-bold text-pure-white/60 tracking-wide">
                      {new Date(montage.week_start).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm font-bold text-pure-white/60 relative z-10">
                    <div className="flex items-center gap-1">
                      <span>🎬</span>
                      <span>{montage.clip_count} clips</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{Math.round(montage.total_duration)}s</span>
                    </div>
                  </div>

                  {montage.renders && Object.keys(montage.renders).length > 0 ? (
                    <div className="space-y-4 relative z-10">
                      <div className="relative overflow-hidden rounded-xl border-2 border-cosmic-neon-cyan/30 group-hover:border-cosmic-neon-cyan transition-all">
                        <video
                          src={montage.renders.landscape || montage.renders.portrait || Object.values(montage.renders)[0]}
                          controls
                          className="w-full"
                          style={{ maxHeight: '300px', objectFit: 'cover' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-pure-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                      <div className="flex gap-2">
                        {montage.renders.landscape && (
                          <a
                            href={montage.renders.landscape}
                            download
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white border-2 border-cosmic-neon-cyan/50 font-black tracking-wide text-sm text-center rounded-lg hover:shadow-lg transition-all"
                            style={{
                              boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
                            }}
                          >
                            📐 L A N D S C A P E
                          </a>
                        )}
                        {montage.renders.portrait && (
                          <a
                            href={montage.renders.portrait}
                            download
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white border-2 border-cosmic-neon-cyan/50 font-black tracking-wide text-sm text-center rounded-lg hover:shadow-lg transition-all"
                            style={{
                              boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
                            }}
                          >
                            📱 P O R T R A I T
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="backdrop-blur-lg bg-pure-white/5 border-2 border-cosmic-neon-cyan/20 p-12 text-center rounded-xl relative z-10">
                      <div className="text-4xl mb-4">⏳</div>
                      <div className="text-sm font-black tracking-wide text-pure-white/70">
                        R E N D E R I N G   I N   P R O G R E S S . . .
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-32 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="backdrop-blur-xl bg-pure-white/5 border border-pure-white/20 rounded-3xl p-12 md:p-16"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(139, 92, 246, 0.2)'
            }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gradient-animated mb-8 tracking-poppr font-display">
              R E A D Y   T O   C R E A T E ?
            </h2>
            <p className="text-xl md:text-2xl text-pure-white/70 font-bold tracking-wide font-exo mb-12">
              J O I N   T H E   C O S M I V   C O M M U N I T Y
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {onGetStarted && (
                <motion.button
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-12 py-6 bg-gradient-to-r from-cosmic-violet via-cosmic-purple to-cosmic-deep-blue text-white font-black tracking-wide text-xl rounded-xl border-2 border-cosmic-neon-cyan/50 transition-all"
                  style={{
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(0, 255, 255, 0.3)'
                  }}
                >
                  G E T   S T A R T E D
                </motion.button>
              )}
              {onLogin && (
                <motion.button
                  onClick={onLogin}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-12 py-6 backdrop-blur-xl bg-pure-white/10 border-2 border-pure-white/30 hover:border-cosmic-neon-cyan text-pure-white font-black tracking-wide text-xl rounded-xl transition-all hover:bg-pure-white/20"
                >
                  S I G N   I N
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
