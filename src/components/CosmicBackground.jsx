import { useEffect, Suspense, lazy, useState } from 'react'

// Lazy load Three.js components to prevent blocking
// Add safety checks and error handling
const ThreeBackground = lazy(() => {
  // Only load in browser environment
  if (typeof window === 'undefined') {
    return Promise.resolve({ default: () => null })
  }
  
  return Promise.all([
    import('@react-three/fiber'),
    import('@react-three/drei')
  ]).then(([fiberModule, drei]) => {
    const { Canvas } = fiberModule
    const { Stars, OrbitControls } = drei
    
    function CosmicScene() {
      return (
        <>
          <Stars 
            radius={300} 
            depth={60} 
            count={3000} 
            factor={7} 
            fade 
            speed={1}
          />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </>
      )
    }

    return {
      default: () => (
        <div className="fixed inset-0 -z-0 opacity-30 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <CosmicScene />
          </Canvas>
          <div className="absolute inset-0 bg-gradient-to-b from-cosmic-space via-transparent to-cosmic-space" />
        </div>
      )
    }
  }).catch((error) => {
    // Silently fail - fallback background will show instead
    console.warn('Three.js background failed to load:', error)
    return { default: () => null }
  })
})

export default function CosmicBackground() {
  const [shouldLoadThree, setShouldLoadThree] = useState(false)
  
  useEffect(() => {
    // Delay Three.js loading to ensure React is fully initialized
    // This prevents the "Cannot set properties of undefined (setting 'Children')" error
    const timer = setTimeout(() => {
      setShouldLoadThree(true)
    }, 200) // Small delay to ensure React is ready
    
    return () => clearTimeout(timer)
  }, [])
  
  // Always show fallback background immediately
  // Three.js will load in background if available
  return (
    <>
      {/* Fallback gradient background - always visible */}
      <div className="fixed inset-0 -z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic-space via-cosmic-deep-blue/20 to-cosmic-space" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
      </div>
      
      {/* Three.js background - loads asynchronously after React is ready */}
      {shouldLoadThree && (
        <Suspense fallback={null}>
          <ThreeBackground />
        </Suspense>
      )}
    </>
  )
}
