import { motion } from 'framer-motion'

export default function Toast({ message, type = 'info', onClose }) {
  const colors = {
    info: 'bg-cosmic-deep-blue border-cosmic-neon-cyan',
    success: 'bg-green-900/20 border-green-400',
    error: 'bg-red-900/20 border-cosmic-glitch-pink',
    warning: 'bg-yellow-900/20 border-yellow-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`glass-effect ${colors[type]} rounded-lg p-4 min-w-[300px] shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-pure-white">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-pure-white/60 hover:text-pure-white transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}

