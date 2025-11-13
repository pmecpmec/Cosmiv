import { useEffect, useRef } from 'react'

export default function CosmicBackground() {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const starsRef = useRef([])
  const sphereRef = useRef({ rotation: 0, yRotation: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    // Initialize stars - MUCH more stars for rich, visible starfield
    const initStars = () => {
      starsRef.current = []
      const starCount = 2000 // Increased from 500 to 2000 for dense starfield
      for (let i = 0; i < starCount; i++) {
        const starType = Math.random()
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: starType > 0.9 
            ? Math.random() * 2 + 1.5  // Bright stars (10%)
            : starType > 0.7 
            ? Math.random() * 1.5 + 1   // Medium stars (20%)
            : Math.random() * 1 + 0.5,  // Small stars (70%)
          opacity: starType > 0.9 
            ? Math.random() * 0.3 + 0.9  // Very bright (0.9-1.2)
            : starType > 0.7 
            ? Math.random() * 0.4 + 0.6  // Medium bright (0.6-1.0)
            : Math.random() * 0.5 + 0.4, // Dim but visible (0.4-0.9)
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: starType > 0.95 
            ? 'colored' // 5% colored stars
            : 'white',
          colorType: starType > 0.95 ? Math.floor(Math.random() * 4) : 0, // Store color type for consistency
        })
      }
    }
    initStars()

    // Draw nebula - deeper teal/blue-green cosmic background
    const drawNebula = (x, y, width, height, color1, color2, opacity) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, width)
      gradient.addColorStop(0, `rgba(${color1}, ${opacity})`)
      gradient.addColorStop(0.5, `rgba(${color2}, ${opacity * 0.5})`)
      gradient.addColorStop(1, `rgba(${color2}, 0)`)
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw the rotating translucent cosmic sphere (Broken Planet)
    const drawSphere = () => {
      const centerX = canvas.width * 0.5  // Center of screen
      const centerY = canvas.height * 0.5
      const radius = Math.min(canvas.width, canvas.height) * 0.25  // Larger sphere

      // Outer glow/atmosphere - multiple layers for depth
      const outerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.8)
      outerGlow.addColorStop(0, 'rgba(139, 92, 246, 0.3)')  // Cosmic violet
      outerGlow.addColorStop(0.3, 'rgba(255, 0, 128, 0.2)')   // Glitch pink
      outerGlow.addColorStop(0.6, 'rgba(0, 255, 255, 0.15)') // Neon cyan
      outerGlow.addColorStop(1, 'rgba(0, 255, 255, 0)')
      ctx.fillStyle = outerGlow
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2)
      ctx.fill()

      // Middle glow layer
      const midGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.4)
      midGlow.addColorStop(0, 'rgba(255, 0, 255, 0.4)')
      midGlow.addColorStop(0.5, 'rgba(0, 255, 255, 0.25)')
      midGlow.addColorStop(1, 'rgba(139, 92, 246, 0)')
      ctx.fillStyle = midGlow
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 1.4, 0, Math.PI * 2)
      ctx.fill()

      // Main sphere - translucent with gradient
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(sphereRef.current.rotation)
      
      // Create radial gradient for sphere base (purple to cyan)
      const sphereGradient = ctx.createRadialGradient(
        -radius * 0.3, -radius * 0.3, 0,
        0, 0, radius
      )
      sphereGradient.addColorStop(0, 'rgba(255, 0, 255, 0.7)')    // Hot pink center
      sphereGradient.addColorStop(0.3, 'rgba(139, 92, 246, 0.6)') // Cosmic violet
      sphereGradient.addColorStop(0.6, 'rgba(30, 58, 138, 0.5)') // Deep blue
      sphereGradient.addColorStop(1, 'rgba(0, 255, 255, 0.4)')    // Neon cyan edge

      // Draw translucent sphere
      ctx.fillStyle = sphereGradient
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw internal network/crack patterns - more complex
      ctx.strokeStyle = 'rgba(255, 0, 128, 0.8)' // Glitch pink for cracks
      ctx.lineWidth = 2
      ctx.shadowBlur = 15
      ctx.shadowColor = 'rgba(255, 0, 128, 1)'
      
      // More dramatic crack lines
      const cracks = [
        { start: { angle: -Math.PI / 6, dist: radius * 0.2 }, end: { angle: Math.PI / 4, dist: radius * 0.95 } },
        { start: { angle: Math.PI / 3, dist: radius * 0.3 }, end: { angle: -Math.PI / 4, dist: radius * 0.9 } },
        { start: { angle: Math.PI * 0.7, dist: radius * 0.25 }, end: { angle: Math.PI * 1.2, dist: radius * 0.85 } },
        { start: { angle: -Math.PI * 0.8, dist: radius * 0.35 }, end: { angle: Math.PI * 0.3, dist: radius * 0.88 } },
      ]
      
      const time = Date.now() * 0.001
      cracks.forEach((crack, idx) => {
        const glitchOffset = Math.sin(time * 2 + idx) * 1.5 // Subtle glitch animation
        
        const x1 = Math.cos(crack.start.angle) * crack.start.dist + glitchOffset
        const y1 = Math.sin(crack.start.angle) * crack.start.dist
        const x2 = Math.cos(crack.end.angle) * crack.end.dist + glitchOffset
        const y2 = Math.sin(crack.end.angle) * crack.end.dist
        
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      })
      
      ctx.shadowBlur = 0

      // Internal network lines - glowing cyan and purple
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)' // Neon cyan
      ctx.lineWidth = 1.5
      ctx.shadowBlur = 8
      ctx.shadowColor = 'rgba(0, 255, 255, 0.6)'
      
      // Longitude lines (vertical network)
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(
          Math.cos(angle) * radius * 0.25,
          Math.sin(angle) * radius * 0.25
        )
        ctx.lineTo(
          Math.cos(angle) * radius * 0.95,
          Math.sin(angle) * radius * 0.95
        )
        ctx.stroke()
      }

      // Latitude lines (horizontal network)
      for (let i = -4; i <= 4; i++) {
        const y = (i / 4) * radius * 0.75
        const xRadius = Math.sqrt(radius * radius - y * y)
        if (xRadius > 0) {
          ctx.beginPath()
          ctx.ellipse(0, y, xRadius, xRadius * 0.25, 0, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      ctx.shadowBlur = 0

      // Draw nodes/connection points - glowing
      const nodeCount = 32
      for (let i = 0; i < nodeCount; i++) {
        const lat = (Math.random() - 0.5) * Math.PI * 0.9
        const lon = (i / nodeCount) * Math.PI * 2 + sphereRef.current.rotation
        const x = Math.cos(lat) * Math.cos(lon) * radius * 0.75
        const y = Math.sin(lat) * radius * 0.75
        const z = Math.cos(lat) * Math.sin(lon) * radius * 0.75
        const scale = (z + radius) / (radius * 2)
        const opacity = 0.8 + scale * 0.2
        
        // Color based on position
        const nodeColor = scale > 0.6 
          ? `rgba(255, 0, 255, ${opacity})`  // Hot pink front
          : `rgba(0, 255, 255, ${opacity})`  // Neon cyan back
        
        ctx.fillStyle = nodeColor
        ctx.shadowBlur = 10 * scale
        ctx.shadowColor = nodeColor
        ctx.beginPath()
        ctx.arc(x, y, 4 * scale, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.shadowBlur = 0

      // Connect nodes with glowing lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)' // Cosmic violet
      ctx.lineWidth = 1.5
      ctx.shadowBlur = 5
      ctx.shadowColor = 'rgba(139, 92, 246, 0.5)'
      
      for (let i = 0; i < nodeCount; i += 3) {
        const lat1 = (Math.random() - 0.5) * Math.PI * 0.8
        const lon1 = (i / nodeCount) * Math.PI * 2 + sphereRef.current.rotation
        const x1 = Math.cos(lat1) * Math.cos(lon1) * radius * 0.75
        const y1 = Math.sin(lat1) * radius * 0.75

        const nextI = (i + 5) % nodeCount
        const lat2 = (Math.random() - 0.5) * Math.PI * 0.8
        const lon2 = (nextI / nodeCount) * Math.PI * 2 + sphereRef.current.rotation
        const x2 = Math.cos(lat2) * Math.cos(lon2) * radius * 0.75
        const y2 = Math.sin(lat2) * radius * 0.75

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      ctx.shadowBlur = 0
      ctx.restore()

      // Lens flare effects - bright white highlights
      const flare1 = ctx.createRadialGradient(
        centerX - radius * 0.5,
        centerY - radius * 0.4,
        0,
        centerX - radius * 0.5,
        centerY - radius * 0.4,
        radius * 0.6
      )
      flare1.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
      flare1.addColorStop(0.2, 'rgba(255, 150, 255, 0.6)')
      flare1.addColorStop(0.5, 'rgba(139, 92, 246, 0.3)')
      flare1.addColorStop(1, 'rgba(139, 92, 246, 0)')
      ctx.fillStyle = flare1
      ctx.beginPath()
      ctx.arc(centerX - radius * 0.5, centerY - radius * 0.4, radius * 0.6, 0, Math.PI * 2)
      ctx.fill()

      // Second lens flare
      const flare2 = ctx.createRadialGradient(
        centerX + radius * 0.4,
        centerY + radius * 0.3,
        0,
        centerX + radius * 0.4,
        centerY + radius * 0.3,
        radius * 0.5
      )
      flare2.addColorStop(0, 'rgba(255, 255, 255, 0.7)')
      flare2.addColorStop(0.3, 'rgba(0, 255, 255, 0.4)')
      flare2.addColorStop(1, 'rgba(0, 255, 255, 0)')
      ctx.fillStyle = flare2
      ctx.beginPath()
      ctx.arc(centerX + radius * 0.4, centerY + radius * 0.3, radius * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Animation loop
    const animate = () => {
      // Deep space black background - pure black for maximum star visibility
      ctx.fillStyle = '#000000'  // Pure black for maximum star contrast
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw subtle nebulae in deep teal/blue-green tones
      const time = Date.now() * 0.0001
      drawNebula(
        canvas.width * 0.15 + Math.sin(time) * 40,
        canvas.height * 0.3 + Math.cos(time * 0.7) * 30,
        canvas.width * 0.5,
        canvas.height * 0.5,
        '0, 100, 120',   // Deep teal
        '20, 50, 80',    // Dark blue-green
        0.15
      )
      drawNebula(
        canvas.width * 0.85 + Math.cos(time * 0.8) * 50,
        canvas.height * 0.7 + Math.sin(time * 0.5) * 40,
        canvas.width * 0.4,
        canvas.height * 0.4,
        '30, 80, 100',   // Medium teal
        '0, 50, 70',     // Deep blue-green
        0.12
      )
      drawNebula(
        canvas.width * 0.5,
        canvas.height * 0.2,
        canvas.width * 0.3,
        canvas.height * 0.3,
        '0, 150, 180',   // Bright teal
        '50, 100, 130',  // Blue-teal
        0.1
      )

      // Draw stars - MUCH more visible and prominent
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinkleOffset) * 0.2 + 0.8
        const currentOpacity = star.opacity * twinkle
        
        // Colored stars (5% of total)
        if (star.color === 'colored') {
          const colorChoices = [
            { rgb: '255, 0, 255', shadow: 'rgba(255, 0, 255, 0.8)' },   // Hot pink
            { rgb: '139, 92, 246', shadow: 'rgba(139, 92, 246, 0.8)' }, // Cosmic violet
            { rgb: '0, 255, 255', shadow: 'rgba(0, 255, 255, 0.8)' },    // Neon cyan
            { rgb: '255, 215, 0', shadow: 'rgba(255, 215, 0, 0.8)' },   // Galactic gold
          ]
          const color = colorChoices[star.colorType || 0] // Use stored color type
          
          // Glow effect for colored stars
          ctx.shadowBlur = star.radius * 3
          ctx.shadowColor = color.shadow
          ctx.fillStyle = `rgba(${color.rgb}, ${currentOpacity})`
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
          ctx.fill()
          
          // Outer glow ring
          ctx.shadowBlur = star.radius * 5
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius * 1.5, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // White stars - make them much brighter and more visible
          ctx.shadowBlur = star.radius > 1.5 ? star.radius * 2 : 0 // Glow for larger stars
          ctx.shadowColor = star.radius > 1.5 ? 'rgba(255, 255, 255, 0.5)' : 'transparent'
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Reset shadow
        ctx.shadowBlur = 0
      })
      
      // Add occasional shooting stars
      if (Math.random() > 0.998) {
        const startX = Math.random() * canvas.width
        const startY = Math.random() * canvas.height * 0.3
        const length = 100 + Math.random() * 50
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.lineWidth = 2
        ctx.shadowBlur = 10
        ctx.shadowColor = 'rgba(0, 255, 255, 0.8)'
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length)
        ctx.stroke()
        ctx.shadowBlur = 0
      }
      
      ctx.globalAlpha = 1

      // Draw rotating sphere
      sphereRef.current.rotation += 0.003  // Slow rotation
      sphereRef.current.yRotation += 0.001  // Subtle vertical rotation
      drawSphere()

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', setCanvasSize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full -z-10 scanlines">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          background: 'linear-gradient(to bottom, #0a1a2a 0%, #0d1e2e 30%, #0a0f1a 70%, #0a1a2a 100%)' 
        }}
      />
    </div>
  )
}
