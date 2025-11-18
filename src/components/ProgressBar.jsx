import { motion } from 'framer-motion'

export default function ProgressBar({ progress }) {
  return (
    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
        className="h-full bg-gradient-to-r from-cosmic-violet to-cosmic-neon-cyan glow-neon"
      />
    </div>
  )
}



