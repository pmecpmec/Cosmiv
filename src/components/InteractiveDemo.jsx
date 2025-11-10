/**
 * InteractiveDemo Component
 * Animated workflow demonstration showing how Cosmiv works
 * Features step-by-step animation with interactive elements
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const workflowSteps = [
  {
    id: 1,
    title: 'Upload Your Clips',
    description: 'Drag and drop your gaming clips or import from Steam, Xbox, PS, or Switch',
    icon: '📤',
    color: 'from-cosmic-violet',
    duration: 3000,
  },
  {
    id: 2,
    title: 'AI Analysis',
    description: 'Our AI analyzes every frame to detect highlights, kills, and epic moments',
    icon: '🧠',
    color: 'from-cosmic-neon-cyan',
    duration: 4000,
  },
  {
    id: 3,
    title: 'Smart Editing',
    description: 'Automatically applies montage styles, transitions, and effects',
    icon: '✂️',
    color: 'from-cosmic-purple',
    duration: 3500,
  },
  {
    id: 4,
    title: 'Music Sync',
    description: 'AI-generated music perfectly synced to your gameplay beats',
    icon: '🎵',
    color: 'from-cosmic-deep-blue',
    duration: 3000,
  },
  {
    id: 5,
    title: 'Auto-Export',
    description: 'Export in multiple formats ready for TikTok, YouTube, and Instagram',
    icon: '🚀',
    color: 'from-cosmic-violet',
    duration: 3000,
  },
]

export default function InteractiveDemo({ autoPlay = true, interval = 4000 }) {
  const [activeStep, setActiveStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!autoPlay || isPaused) return

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, isPaused])

  const currentStep = workflowSteps[activeStep]

  return (
    <section className="py-24 px-4 relative overflow-hidden min-h-screen flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-pure-black/50 via-cosmic-violet/10 to-pure-black/50" />
      
      <div className="container mx-auto relative z-10">
        <motion.h2
          className="text-5xl md:text-7xl font-black gradient-text-cosmic text-center mb-16 tracking-poppr chromatic-aberration"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          S E E   I T   I N   A C T I O N
        </motion.h2>

        <div className="max-w-6xl mx-auto">
          {/* Main Demo Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Animated Step Display */}
            <div className="relative">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                className="cosmic-card p-12 relative overflow-hidden"
              >
                {/* Background glow */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${currentStep.color} to-cosmic-neon-cyan/20 opacity-30`}
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                <div className="relative z-10 text-center">
                  <motion.div
                    className="text-8xl mb-6"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
                  >
                    {currentStep.icon}
                  </motion.div>
                  
                  <motion.h3
                    className="text-3xl md:text-4xl font-black gradient-text-cosmic mb-4 tracking-poppr"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {currentStep.title}
                  </motion.h3>
                  
                  <motion.p
                    className="text-lg text-white/80 font-medium leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {currentStep.description}
                  </motion.p>
                </div>

                {/* Step indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {workflowSteps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === activeStep ? 'bg-cosmic-neon-cyan' : 'bg-white/20'
                      }`}
                      animate={{
                        scale: index === activeStep ? [1, 1.3, 1] : 1,
                        opacity: index === activeStep ? 1 : 0.3,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Timeline Steps */}
            <div className="space-y-6">
              {workflowSteps.map((step, index) => {
                const isActive = index === activeStep
                const isPast = index < activeStep

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                    onClick={() => {
                      setActiveStep(index)
                      setIsPaused(true)
                    }}
                  >
                    {/* Connection line */}
                    {index < workflowSteps.length - 1 && (
                      <div className="absolute left-8 top-16 w-0.5 h-full bg-white/10">
                        <motion.div
                          className="h-full bg-gradient-to-b from-cosmic-violet to-cosmic-neon-cyan"
                          initial={{ scaleY: 0 }}
                          animate={{
                            scaleY: isPast ? 1 : isActive ? [0, 1, 1] : 0,
                            transformOrigin: 'top',
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}

                    <motion.div
                      className={`cosmic-card p-6 cursor-pointer transition-all relative overflow-hidden group ${
                        isActive ? 'border-cosmic-neon-cyan border-2' : 'border-white/20'
                      }`}
                      whileHover={{
                        scale: 1.02,
                        x: 10,
                        borderColor: 'rgba(0, 255, 255, 0.5)',
                      }}
                      animate={{
                        boxShadow: isActive
                          ? [
                              '0 0 20px rgba(0, 255, 255, 0.3)',
                              '0 0 40px rgba(139, 92, 246, 0.5)',
                              '0 0 20px rgba(0, 255, 255, 0.3)',
                            ]
                          : 'none',
                      }}
                      transition={{
                        boxShadow: {
                          duration: 2,
                          repeat: isActive ? Infinity : 0,
                          ease: 'easeInOut',
                        },
                      }}
                    >
                      {/* Background glow for active step */}
                      {isActive && (
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${step.color} to-cosmic-neon-cyan/20 opacity-20`}
                          animate={{
                            opacity: [0.1, 0.3, 0.1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}

                      <div className="flex items-center gap-4 relative z-10">
                        {/* Step number circle */}
                        <motion.div
                          className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-black ${
                            isActive || isPast
                              ? 'border-cosmic-neon-cyan bg-cosmic-neon-cyan/10'
                              : 'border-white/30 bg-pure-black'
                          }`}
                          animate={{
                            scale: isActive ? [1, 1.1, 1] : 1,
                            rotate: isActive ? [0, 360] : 0,
                          }}
                          transition={{
                            duration: isActive ? 2 : 0.3,
                            repeat: isActive ? Infinity : 0,
                            ease: 'easeInOut',
                          }}
                        >
                          {isPast ? '✓' : step.id}
                        </motion.div>

                        {/* Step content */}
                        <div className="flex-1">
                          <motion.h4
                            className={`text-xl font-black mb-2 ${
                              isActive ? 'gradient-text-cosmic' : 'text-white/70'
                            }`}
                            animate={{
                              x: isActive ? [0, 5, 0] : 0,
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: isActive ? Infinity : 0,
                              ease: 'easeInOut',
                            }}
                          >
                            {step.title}
                          </motion.h4>
                          <p className="text-sm text-white/60 font-medium">
                            {step.description}
                          </p>
                        </div>

                        {/* Icon */}
                        <div className="text-3xl">{step.icon}</div>
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Controls */}
          <motion.div
            className="flex items-center justify-center gap-4 mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={() => setIsPaused(!isPaused)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black border-2 border-cosmic-neon-cyan/50 text-lg tracking-wide transition-all neon-glow hover:neon-glow-cyan rounded-lg"
            >
              {isPaused ? '▶️ P L A Y' : '⏸️ P A U S E'}
            </motion.button>
            <motion.button
              onClick={() => setActiveStep((prev) => (prev - 1 + workflowSteps.length) % workflowSteps.length)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold border-2 border-white/20 hover:border-cosmic-neon-cyan/50 text-lg tracking-wide transition-all rounded-lg"
            >
              ← P R E V
            </motion.button>
            <motion.button
              onClick={() => setActiveStep((prev) => (prev + 1) % workflowSteps.length)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold border-2 border-white/20 hover:border-cosmic-neon-cyan/50 text-lg tracking-wide transition-all rounded-lg"
            >
              N E X T →
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

