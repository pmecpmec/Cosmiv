import { motion } from 'framer-motion'

/**
 * Base Skeleton component with cosmic shimmer animation
 */
function SkeletonBase({ className = '', width, height, rounded = 'rounded' }) {
  return (
    <motion.div
      className={`bg-pure-white/5 border border-cosmic-neon-cyan/20 ${rounded} overflow-hidden relative ${className}`}
      style={{ width, height }}
      animate={{
        background: [
          'linear-gradient(90deg, rgba(139,92,246,0.1) 0%, rgba(0,255,255,0.15) 50%, rgba(139,92,246,0.1) 100%)',
          'linear-gradient(90deg, rgba(0,255,255,0.15) 0%, rgba(139,92,246,0.2) 50%, rgba(0,255,255,0.15) 100%)',
          'linear-gradient(90deg, rgba(139,92,246,0.1) 0%, rgba(0,255,255,0.15) 50%, rgba(139,92,246,0.1) 100%)',
        ],
        boxShadow: [
          '0 0 5px rgba(139, 92, 246, 0.2)',
          '0 0 15px rgba(0, 255, 255, 0.3)',
          '0 0 5px rgba(139, 92, 246, 0.2)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div className="h-full w-full relative overflow-hidden">
        {/* Cosmic shimmer sweep */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cosmic-neon-cyan/40 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Pulse glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cosmic-violet/20 via-transparent to-cosmic-neon-cyan/20"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </motion.div>
  )
}

/**
 * Skeleton Card - for dashboard cards and info boxes
 */
export function SkeletonCard({ lines = 2 }) {
  return (
    <div className="broken-planet-card p-6 border-2 border-pure-white/20">
      <SkeletonBase height={20} width="60%" className="mb-4" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBase key={i} height={16} width={i === lines - 1 ? '80%' : '100%'} />
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton Table - for lists and tables
 */
export function SkeletonTable({ rows = 5, columns = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 items-center broken-planet-card p-4 border-2 border-pure-white/20">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <SkeletonBase
              key={colIdx}
              height={20}
              width={colIdx === 0 ? '40%' : colIdx === 1 ? '30%' : '20%'}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton Chart - for analytics charts
 */
export function SkeletonChart({ height = 200 }) {
  return (
    <div className="broken-planet-card p-6 border-2 border-pure-white/20">
      <SkeletonBase height={24} width="40%" className="mb-6" />
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const height = Math.random() * 60 + 40 // Random height between 40-100%
          return (
            <SkeletonBase
              key={i}
              height={`${height}%`}
              width="12%"
              rounded="rounded-t"
            />
          )
        })}
      </div>
      <div className="flex justify-between mt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonBase key={i} height={12} width="12%" />
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton Form - for form loading states
 */
export function SkeletonForm({ fields = 3 }) {
  return (
    <div className="space-y-6 broken-planet-card p-6 border-2 border-pure-white/20">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBase height={16} width="30%" />
          <SkeletonBase height={48} width="100%" rounded="rounded-lg" />
        </div>
      ))}
      <SkeletonBase height={48} width="40%" rounded="rounded-lg" className="mt-4" />
    </div>
  )
}

/**
 * Skeleton Job Item - for job list items
 */
export function SkeletonJobItem() {
  return (
    <div className="flex items-center justify-between broken-planet-card p-4 mb-3 border-2 border-pure-white/20">
      <div className="flex-1 space-y-2">
        <SkeletonBase height={16} width="40%" />
        <SkeletonBase height={14} width="60%" />
        <div className="flex gap-4">
          <SkeletonBase height={12} width="100px" />
          <SkeletonBase height={12} width="80px" />
        </div>
      </div>
      <div className="flex gap-2">
        <SkeletonBase height={36} width={80} rounded="rounded" />
        <SkeletonBase height={36} width={80} rounded="rounded" />
      </div>
    </div>
  )
}

/**
 * Skeleton List - for simple lists
 */
export function SkeletonList({ items = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 broken-planet-card p-4 border-2 border-pure-white/20">
          <SkeletonBase height={40} width={40} rounded="rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBase height={16} width="60%" />
            <SkeletonBase height={14} width="80%" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Generic skeleton component
 */
export default function Skeleton({ width, height, rounded = 'rounded', className = '' }) {
  return <SkeletonBase width={width} height={height} rounded={rounded} className={className} />
}

