import { motion } from 'framer-motion'

export default function LoadingScreen() {
  // Animated waveform
  const Waveform = () => {
    const bars = Array.from({ length: 20 }, (_, i) => i)
    
    return (
      <div className="flex items-end justify-center gap-1 h-16">
        {bars.map((i) => (
          <motion.div
            key={i}
            className="w-1 bg-pure-white"
            initial={{ height: 10 }}
            animate={{
              height: [10, 40, 10],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.05,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    )
  }

  // Neural network nodes
  const NeuralNetwork = () => {
    const nodes = Array.from({ length: 12 }, (_, i) => i)
    
    return (
      <div className="relative w-32 h-32">
        {nodes.map((i) => {
          const angle = (i / nodes.length) * Math.PI * 2
          const radius = 50
          const x = Math.cos(angle) * radius + 64
          const y = Math.sin(angle) * radius + 64
          
          return (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-pure-white"
              style={{ left: x, top: y }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          )
        })}
      </div>
    )
  }

  // Glowing logo
  const GlowingLogo = () => {
    return (
      <motion.div
        className="relative"
        animate={{
          filter: [
            "drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))",
            "drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))",
            "drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div
          className="text-6xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          🎬
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-pure-black flex items-center justify-center z-50"
    >
      <div className="text-center">
        {/* Glowing Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <GlowingLogo />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black text-pure-white mb-4 tracking-poppr"
        >
          A I D I T O R
        </motion.h1>

        {/* Neural Network Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <NeuralNetwork />
        </motion.div>

        {/* Waveform Animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Waveform />
        </motion.div>

        {/* Loading Text */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-pure-white/50 mt-8 font-black tracking-wide"
        >
          I N I T I A L I Z I N G   A I   E N G I N E . . .
        </motion.p>
      </div>
    </motion.div>
  )
}

