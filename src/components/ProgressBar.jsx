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
      <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
        <span className="flex items-center gap-2">
          {isComplete ? (
            <>
              <span className="text-green-400">✓</span>
              <span>Complete!</span>
            </>
          ) : (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Processing...</span>
            </>
          )}
        </span>
        <span>{Math.round(displayProgress)}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${displayProgress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      {!isComplete && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Analyzing scenes, selecting highlights...
        </p>
      )}
    </div>
  );
}

