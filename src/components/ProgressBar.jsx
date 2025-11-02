import { useEffect, useState } from "react";

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
      <div className="w-full bg-pure-white/10 border-2 border-pure-white/20 h-4 overflow-hidden">
        <div
          className="h-full bg-pure-white transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${displayProgress}%` }}
        >
          <div className="absolute inset-0 bg-pure-black/20 animate-pulse"></div>
        </div>
      </div>
      {!isComplete && (
        <p className="text-xs text-pure-white/50 mt-3 text-center font-bold tracking-wide">
          Analyzing scenes, selecting highlights...
        </p>
      )}
    </div>
  );
}

