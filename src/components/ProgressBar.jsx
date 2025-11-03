import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProgressBar({ progress, isProcessing, isComplete }) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (isComplete) {
      setDisplayProgress(100);
      return;
    }

    if (!isProcessing) {
      setDisplayProgress(0);
      return;
    }

    // Animate progress bar smoothly
    const timer = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= progress) return prev;
        return Math.min(prev + 2, progress);
      });
    }, 50);

    return () => clearInterval(timer);
  }, [progress, isProcessing, isComplete]);

  if (!isProcessing && !isComplete) {
    return null;
  }

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between text-sm text-pure-white mb-4 font-black tracking-wide">
        <span className="flex items-center gap-3">
          {isComplete ? (
            <>
              <span>✓</span>
              <span>C O M P L E T E !</span>
            </>
          ) : (
            <>
              <motion.div
                className="relative w-5 h-5"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute inset-0 border-2 border-cosmic-neon-cyan/50 border-t-cosmic-violet rounded-full"></div>
                <div className="absolute inset-1 border border-cosmic-neon-cyan/30 border-b-transparent rounded-full"></div>
              </motion.div>
              <span>P R O C E S S I N G . . .</span>
            </>
          )}
        </span>
        <span>{Math.round(displayProgress)}%</span>
      </div>
      <div className="w-full bg-cosmic-deep-blue/30 border-2 border-cosmic-neon-cyan/30 h-5 rounded-full overflow-hidden backdrop-blur-sm relative">
        <motion.div
          className="h-full bg-gradient-to-r from-cosmic-violet via-cosmic-neon-cyan to-cosmic-purple relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ 
            boxShadow: displayProgress > 0 
              ? `0 0 ${10 + displayProgress * 0.2}px rgba(0, 255, 255, 0.6), 
                 0 0 ${20 + displayProgress * 0.3}px rgba(139, 92, 246, 0.4),
                 inset 0 0 ${5 + displayProgress * 0.1}px rgba(139, 92, 246, 0.5)` 
              : 'none'
          }}
        >
          {/* Enhanced cosmic shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cosmic-neon-cyan/50 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          {/* Pulsing glow effect */}
          {!isComplete && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-cosmic-violet/30 via-transparent to-cosmic-neon-cyan/30"
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
          {/* Particle trail effect */}
          {isProcessing && !isComplete && (
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-0 w-1 h-full bg-cosmic-neon-cyan rounded-full"
                  style={{
                    left: `${displayProgress}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scaleY: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
      {!isComplete && (
        <p className="text-xs text-pure-white/50 mt-3 text-center font-bold tracking-wide">
          Analyzing scenes, selecting highlights...
        </p>
      )}
    </div>
  );
}

