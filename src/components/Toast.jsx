import { motion } from 'framer-motion'

const TOAST_VARIANTS = {
  success: {
    bg: 'bg-gradient-to-r from-green-600 to-emerald-600',
    border: 'border-green-400',
    icon: '✅',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-600 to-rose-600',
    border: 'border-red-400',
    icon: '❌',
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-600 to-amber-600',
    border: 'border-yellow-400',
    icon: '⚠️',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    border: 'border-blue-400',
    icon: 'ℹ️',
  },
}

export default function Toast({ message, type = 'info', onClose }) {
  const variant = TOAST_VARIANTS[type] || TOAST_VARIANTS.info

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`${variant.bg} border-2 ${variant.border} text-white px-6 py-4 rounded-lg shadow-2xl min-w-[300px] max-w-[500px] pointer-events-auto flex items-center justify-between gap-4 neon-glow`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3 flex-1">
        <span className="text-2xl">{variant.icon}</span>
        <p className="font-bold tracking-wide text-sm flex-1">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white font-black text-xl leading-none transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
        aria-label="Close notification"
      >
        ×
      </button>
    </motion.div>
  )
}

