import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
              <div className="animate-spin h-5 w-5 border-2 border-pure-white border-t-transparent"></div>
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
            boxShadow: displayProgress > 0 ? '0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(139, 92, 246, 0.3)' : 'none'
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          {/* Pulse effect */}
          {!isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
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

