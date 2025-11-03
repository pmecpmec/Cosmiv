/**
 * Planet3DBackground.jsx
 * 
 * A lightweight, performant 3D rotating planet background component for Cosmiv.
 * Uses React Three Fiber for efficient 3D rendering with minimal dependencies.
 * 
 * Features:
 * - Slow continuous rotation (even when idle/AFK)
 * - Low-poly geometry for performance
 * - Procedural gradient texture matching Cosmiv theme
 * - Subtle starfield particles
 * - Soft ambient lighting
 * - Non-intrusive background (pointer-events: none)
 * 
 * Performance optimizations:
 * - Low polygon count (32 segments for sphere)
 * - Efficient shader materials
 * - RequestAnimationFrame-based animation
 * - Minimal re-renders
 */

import { useRef, useMemo } from 'react'
import { useFrame, Canvas } from '@react-three/fiber'
import { Sphere, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Cosmiv color palette
const COLORS = {
  violet: '#8B5CF6',      // Cosmic violet
  deepBlue: '#1E3A8A',    // Deep blue
  neonCyan: '#00FFFF',    // Neon cyan
  pink: '#FF0080',        // Glitch pink
  dark: '#0A1A2A',        // Dark teal-blue background
}

/**
 * Planet component - Low-poly sphere with gradient material
 */
function Planet() {
  const meshRef = useRef()
  const materialRef = useRef()
  
  // Create custom shader material with Cosmiv gradient colors
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(COLORS.violet) },
        color2: { value: new THREE.Color(COLORS.deepBlue) },
        color3: { value: new THREE.Color(COLORS.neonCyan) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Create gradient based on surface normal (latitude effect)
          float latitude = dot(vNormal, vec3(0.0, 1.0, 0.0));
          
          // Mix colors based on latitude for gradient effect
          vec3 color = mix(color2, color1, (latitude + 1.0) * 0.5);
          
          // Add subtle animation with time
          float pulse = sin(time * 0.5) * 0.1 + 0.9;
          color *= pulse;
          
          // Add slight rim lighting effect (edge glow)
          float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          rim = pow(rim, 2.0);
          color += color3 * rim * 0.3;
          
          gl_FragColor = vec4(color, 0.85);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })
  }, [])

  // Slow continuous rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate on Y axis (vertical) - slow and continuous
      meshRef.current.rotation.y += delta * 0.05 // Slow rotation
      
      // Update shader time uniform for subtle animation
      if (material.uniforms && material.uniforms.time) {
        material.uniforms.time.value += delta
      }
    }
  })

  return (
    <Sphere ref={meshRef} args={[2, 32, 32]} position={[0, 0, -3]}>
      <primitive object={material} attach="material" ref={materialRef} />
    </Sphere>
  )
}

/**
 * Atmospheric glow around the planet
 */
function Atmosphere() {
  const glowRef = useRef()
  
  useFrame((state, delta) => {
    if (glowRef.current) {
      // Rotate slightly slower than planet for depth
      glowRef.current.rotation.y += delta * 0.03
    }
  })

  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: COLORS.violet,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    })
  }, [])

  return (
    <Sphere ref={glowRef} args={[2.3, 32, 32]} position={[0, 0, -3]}>
      <primitive object={glowMaterial} attach="material" />
    </Sphere>
  )
}

/**
 * Ambient light and subtle directional light for depth
 */
function Lighting() {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.4} color={COLORS.violet} />
      
      {/* Subtle directional light from top-left */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.6}
        color={COLORS.neonCyan}
        castShadow={false}
      />
      
      {/* Rim light for edge definition */}
      <pointLight
        position={[-5, 0, -3]}
        intensity={0.3}
        color={COLORS.pink}
      />
    </>
  )
}

/**
 * Starfield background using @react-three/drei Stars component
 * Lightweight and optimized
 */
function Starfield() {
  return (
    <Stars
      radius={100}
      depth={50}
      count={3000}
      factor={4}
      saturation={0.5}
      fade
      speed={0.2}
    />
  )
}

/**
 * Main 3D Planet Background Component
 * 
 * Usage:
 * <Planet3DBackground />
 * 
 * This component renders a full-screen 3D scene with:
 * - Rotating planet with Cosmiv-themed gradient
 * - Atmospheric glow
 * - Starfield background
 * - Soft ambient lighting
 * 
 * The component is designed to be non-intrusive:
 * - pointer-events: none (doesn't block UI interactions)
 * - Fixed positioning behind all content
 * - Responsive to window size
 * - Performance optimized for 60fps
 */
export default function Planet3DBackground() {
  return (
    <div
      className="fixed inset-0 w-full h-full -z-10"
      style={{
        pointerEvents: 'none', // Don't block UI interactions
        background: `linear-gradient(to bottom, ${COLORS.dark} 0%, #0D1E2E 30%, #0A0F1A 70%, ${COLORS.dark} 100%)`,
      }}
    >
      {/* React Three Fiber Canvas */}
      <div className="w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ alpha: true, antialias: false }} // Disable antialiasing for performance
          dpr={[1, 2]} // Limit pixel ratio for performance on high-DPI displays
          style={{ width: '100%', height: '100%' }}
        >
          {/* Scene contents */}
          <Lighting />
          <Starfield />
          <Planet />
          <Atmosphere />
        </Canvas>
      </div>
    </div>
  )
}

