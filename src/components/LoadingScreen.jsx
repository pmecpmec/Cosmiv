import { motion } from 'framer-motion'
import AstronautLoadingScreen from './AstronautLoadingScreen'

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-pure-black z-50"
    >
      <AstronautLoadingScreen />
    </motion.div>
  )
}

