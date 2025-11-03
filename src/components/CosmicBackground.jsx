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

    // Initialize stars - more stars for richer background
    const initStars = () => {
      starsRef.current = []
      const starCount = 500
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
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
      // Deep teal/blue-green cosmic background
      ctx.fillStyle = '#0a1a2a'  // Dark teal-blue
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

      // Draw stars - more visible against darker background
      ctx.fillStyle = 'white'
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7
        ctx.globalAlpha = star.opacity * twinkle
        
        // Main star
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()

        // Occasional colored stars (purple/cyan/pink)
        if (Math.random() > 0.97) {
          const colorChoices = [
            '255, 0, 255',   // Hot pink
            '139, 92, 246',  // Cosmic violet
            '0, 255, 255',   // Neon cyan
          ]
          const color = colorChoices[Math.floor(Math.random() * colorChoices.length)]
          ctx.fillStyle = `rgba(${color}, ${star.opacity * twinkle * 0.9})`
          ctx.shadowBlur = 8
          ctx.shadowColor = `rgba(${color}, 0.8)`
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.fillStyle = 'white'
        }
      })
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
