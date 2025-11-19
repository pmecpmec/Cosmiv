import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'

function CosmicScene() {
  return (
    <>
      <Stars 
        radius={300} 
        depth={60} 
        count={5000} 
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

export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 -z-0 opacity-30 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <CosmicScene />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-cosmic-space via-transparent to-cosmic-space" />
    </div>
  )
}
