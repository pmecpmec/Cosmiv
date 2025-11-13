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
      const starCount = 400 // Sparse, subtle stars - not overwhelming
      for (let i = 0; i < starCount; i++) {
        const starType = Math.random()
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: starType > 0.95 
            ? Math.random() * 0.8 + 0.5  // Rare larger stars (5%) - still tiny
            : Math.random() * 0.5 + 0.3, // Most stars are very small (95%)
          opacity: starType > 0.95 
            ? Math.random() * 0.2 + 0.5  // Rare brighter stars (0.5-0.7)
            : Math.random() * 0.3 + 0.2, // Most stars are dim (0.2-0.5)
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: starType > 0.98 
            ? 'colored' // 2% colored stars - very rare, subtle
            : 'white',
          colorType: starType > 0.98 ? Math.floor(Math.random() * 3) : 0, // Only cyan, blue, purple
        })
      }
    }
    initStars()

    // Enhanced nebula drawing with multiple layers and swirling effects
    const drawNebula = (x, y, width, height, color1, color2, color3, opacity, rotation = 0) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      
      // Multiple gradient layers for depth
      const gradient1 = ctx.createRadialGradient(0, 0, 0, 0, 0, width * 0.6)
      gradient1.addColorStop(0, `rgba(${color1}, ${opacity})`)
      gradient1.addColorStop(0.4, `rgba(${color2}, ${opacity * 0.7})`)
      gradient1.addColorStop(0.7, `rgba(${color3}, ${opacity * 0.4})`)
      gradient1.addColorStop(1, 'transparent')
      
      ctx.fillStyle = gradient1
      ctx.beginPath()
      ctx.ellipse(0, 0, width * 0.6, height * 0.6, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Outer glow layer
      const gradient2 = ctx.createRadialGradient(0, 0, width * 0.4, 0, 0, width)
      gradient2.addColorStop(0, `rgba(${color2}, ${opacity * 0.3})`)
      gradient2.addColorStop(0.5, `rgba(${color3}, ${opacity * 0.2})`)
      gradient2.addColorStop(1, 'transparent')
      
      ctx.fillStyle = gradient2
      ctx.beginPath()
      ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    }
    
    // Draw swirling nebula clouds with noise
    const drawSwirlingNebula = (x, y, width, height, colors, opacity, time) => {
      ctx.save()
      ctx.translate(x, y)
      
      // Create swirling pattern using multiple overlapping ellipses
      const swirls = 3
      for (let i = 0; i < swirls; i++) {
        const angle = (time * 0.00005 + i * Math.PI * 2 / swirls) % (Math.PI * 2)
        const offsetX = Math.cos(angle) * width * 0.2
        const offsetY = Math.sin(angle) * height * 0.2
        
        const gradient = ctx.createRadialGradient(
          offsetX, offsetY, 0,
          offsetX, offsetY, width * (0.4 + i * 0.2)
        )
        gradient.addColorStop(0, `rgba(${colors[i % colors.length]}, ${opacity * (1 - i * 0.2)})`)
        gradient.addColorStop(0.5, `rgba(${colors[(i + 1) % colors.length]}, ${opacity * 0.5 * (1 - i * 0.2)})`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.ellipse(offsetX, offsetY, width * (0.5 - i * 0.1), height * (0.5 - i * 0.1), angle, 0, Math.PI * 2)
        ctx.fill()
      }
      
      ctx.restore()
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

      // Draw subtle, minimal nebula glows - very faint light streaks
      const time = Date.now()
      
      // Very subtle light streaks in upper corners - barely visible
      drawNebula(
        canvas.width * 0.1,
        canvas.height * 0.15,
        canvas.width * 0.4,
        canvas.height * 0.3,
        '100, 150, 255',  // Very faint blue
        '139, 92, 246',   // Very faint purple
        '100, 150, 255',  // Very faint blue
        0.08,  // Much lower opacity - barely visible
        time * 0.00001
      )
      
      drawNebula(
        canvas.width * 0.9,
        canvas.height * 0.2,
        canvas.width * 0.35,
        canvas.height * 0.25,
        '139, 92, 246',   // Very faint purple
        '100, 150, 255',  // Very faint blue
        '139, 92, 246',   // Very faint purple
        0.06,  // Even lower opacity
        time * -0.00001
      )

      // Draw stars - MUCH more visible and prominent
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinkleOffset) * 0.2 + 0.8
        const currentOpacity = star.opacity * twinkle
        
        // Colored stars (2% of total) - very rare, subtle
        if (star.color === 'colored') {
          const colorChoices = [
            { rgb: '100, 200, 255', shadow: 'rgba(100, 200, 255, 0.4)' }, // Subtle blue
            { rgb: '139, 92, 246', shadow: 'rgba(139, 92, 246, 0.4)' },    // Subtle purple
            { rgb: '100, 150, 255', shadow: 'rgba(100, 150, 255, 0.4)' },   // Subtle cyan-blue
          ]
          const color = colorChoices[star.colorType || 0]
          
          // Very subtle glow for colored stars
          ctx.shadowBlur = star.radius * 1.5
          ctx.shadowColor = color.shadow
          ctx.fillStyle = `rgba(${color.rgb}, ${currentOpacity * 0.6})` // Dimmer
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // White stars - subtle, tiny pinpricks
          ctx.shadowBlur = 0 // No glow - just tiny dots
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.7})` // Dimmer
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Reset shadow
        ctx.shadowBlur = 0
      })
      
      // No shooting stars - keep it minimal and clean
      
      ctx.globalAlpha = 1

      // Draw rotating sphere - make it much more subtle/optional
      sphereRef.current.rotation += 0.001  // Very slow rotation
      sphereRef.current.yRotation += 0.0005  // Very subtle vertical rotation
      // Make sphere very faint - almost invisible
      ctx.save()
      ctx.globalAlpha = 0.15  // Very faint sphere
      drawSphere()
      ctx.restore()

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
