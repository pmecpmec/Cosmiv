export default function SpaceLoader({ size = 300, showText = true, text = "L O A D I N G . . ." }) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Space Loader Container */}
      <div 
        className="relative rounded-full overflow-hidden"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: 'radial-gradient(circle at center, #1a1a2e 0%, #0f0f1e 50%, #080810 100%)',
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.6), inset 0 0 50px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Stars Container */}
        <div className="absolute inset-0" style={{ perspective: '1000px' }}>
          {/* Near Stars */}
          <div 
            className="absolute inset-0 opacity-80 animate-stars-rotate-20"
            style={{
              backgroundImage: 'radial-gradient(1px 1px at 20% 30%, white 100%, transparent), radial-gradient(1px 1px at 60% 70%, white 100%, transparent), radial-gradient(1px 1px at 40% 50%, white 100%, transparent), radial-gradient(1px 1px at 80% 20%, white 100%, transparent), radial-gradient(1px 1px at 10% 80%, white 100%, transparent)',
              backgroundSize: '200px 200px',
            }}
          />
          
          {/* Mid Stars */}
          <div 
            className="absolute inset-0 opacity-60 animate-stars-rotate-30"
            style={{
              backgroundImage: 'radial-gradient(1px 1px at 30% 40%, white 100%, transparent), radial-gradient(1px 1px at 70% 60%, white 100%, transparent), radial-gradient(1px 1px at 50% 30%, white 100%, transparent), radial-gradient(1px 1px at 90% 70%, white 100%, transparent)',
              backgroundSize: '150px 150px',
            }}
          />
          
          {/* Far Stars */}
          <div 
            className="absolute inset-0 opacity-40 animate-stars-rotate-40"
            style={{
              backgroundImage: 'radial-gradient(1px 1px at 25% 35%, white 100%, transparent), radial-gradient(1px 1px at 75% 65%, white 100%, transparent), radial-gradient(1px 1px at 45% 55%, white 100%, transparent)',
              backgroundSize: '100px 100px',
            }}
          />
        </div>

        {/* Meteors */}
        <div className="absolute inset-0">
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full blur-[1px] top-[20%] -left-[20%] animate-meteor-move-1" style={{ transformOrigin: 'center' }}>
            <div className="absolute top-1/2 right-0 w-5 h-px bg-gradient-to-l from-white to-transparent -translate-y-1/2 rotate-45" />
          </div>
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full blur-[1px] top-[40%] -left-[20%] animate-meteor-move-2" style={{ transformOrigin: 'center' }}>
            <div className="absolute top-1/2 right-0 w-5 h-px bg-gradient-to-l from-white to-transparent -translate-y-1/2 rotate-45" />
          </div>
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full blur-[1px] top-[60%] -left-[20%] animate-meteor-move-3" style={{ transformOrigin: 'center' }}>
            <div className="absolute top-1/2 right-0 w-5 h-px bg-gradient-to-l from-white to-transparent -translate-y-1/2 rotate-45" />
          </div>
        </div>

        {/* Astronaut */}
        <div className="absolute left-1/2 top-1/2 w-[70px] h-[90px] -translate-x-1/2 -translate-y-1/2 animate-astronaut-float">
          {/* Helmet */}
          <div 
            className="absolute w-[45px] h-[45px] rounded-full top-0 left-1/2 -translate-x-1/2"
            style={{
              background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
              boxShadow: 'inset -3px -3px 8px rgba(0, 0, 0, 0.2), 2px 2px 4px rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Helmet Glass */}
            <div 
              className="absolute w-[35px] h-[25px] top-3 left-[5px] overflow-hidden"
              style={{
                borderRadius: '50% 50% 45% 45%',
                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 0, 255, 0.1))',
              }}
            >
              {/* Inner Glass */}
              <div 
                className="absolute inset-0.5 animate-glass-shine"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)',
                  borderRadius: 'inherit',
                }}
              />
            </div>
            
            {/* Helmet Reflection */}
            <div 
              className="absolute w-[15px] h-[15px] rounded-full top-0.5 left-0.5 animate-reflection-move"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 70%)',
              }}
            />
            
            {/* Antenna */}
            <div className="absolute w-[3px] h-[15px] bg-gray-300 top-[-12px] left-1/2 -translate-x-1/2">
              <div className="absolute w-1.5 h-1.5 bg-red-500 rounded-full top-[-3px] left-1/2 -translate-x-1/2 animate-antenna-blink" />
            </div>
          </div>

          {/* Body */}
          <div 
            className="absolute w-[45px] h-[55px] rounded-[25px] top-10 left-1/2 -translate-x-1/2 overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
              boxShadow: 'inset -4px -4px 8px rgba(0, 0, 0, 0.2), 2px 2px 4px rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Suit Pattern */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 50%, rgba(0, 0, 0, 0.05) 50%), linear-gradient(0deg, transparent 50%, rgba(0, 0, 0, 0.05) 50%)',
                backgroundSize: '4px 4px',
              }}
            />
          </div>
        </div>

        {/* Loading Container */}
        {showText && (
          <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 w-[80%] text-center">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/10 rounded-sm mb-2.5 overflow-hidden">
              <div 
                className="h-full w-[30%] rounded-sm animate-progress-shimmer"
                style={{
                  background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.8))',
                }}
              />
            </div>
            
            {/* Loading Text */}
            <div 
              className="text-white/80 font-mono text-sm tracking-[2px]"
              style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                fontFamily: '"Courier New", monospace',
              }}
            >
              {text}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

