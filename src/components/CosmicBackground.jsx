import { useEffect, useRef } from 'react'

export default function CosmicBackground() {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const starsRef = useRef([])
  const planetRef = useRef({ rotation: 0 })

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

    // Initialize stars
    const initStars = () => {
      starsRef.current = []
      const starCount = 300
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
        })
      }
    }
    initStars()

    // Draw nebula
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

    // Draw the lil planet
    const drawPlanet = () => {
      const centerX = canvas.width * 0.35
      const centerY = canvas.height * 0.5
      const radius = Math.min(canvas.width, canvas.height) * 0.15

      // Planet glow/atmosphere
      const glowGradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY,
        0,
        centerX,
        centerY,
        radius * 1.5
      )
      glowGradient.addColorStop(0, 'rgba(255, 0, 255, 0.4)')
      glowGradient.addColorStop(0.5, 'rgba(0, 191, 255, 0.2)')
      glowGradient.addColorStop(1, 'rgba(0, 191, 255, 0)')
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Planet sphere
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(planetRef.current.rotation)

      // Main planet gradient
      const planetGradient = ctx.createLinearGradient(-radius, 0, radius, 0)
      planetGradient.addColorStop(0, 'rgba(255, 0, 255, 0.8)')
      planetGradient.addColorStop(0.5, 'rgba(255, 20, 147, 0.7)')
      planetGradient.addColorStop(1, 'rgba(0, 191, 255, 0.8)')

      // Draw planet base
      ctx.fillStyle = planetGradient
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw grid/network pattern
      ctx.strokeStyle = 'rgba(255, 100, 255, 0.6)'
      ctx.lineWidth = 1.5
      
      // Longitude lines
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(
          Math.cos(angle) * radius * 0.3,
          Math.sin(angle) * radius * 0.3
        )
        ctx.lineTo(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius
        )
        ctx.stroke()
      }

      // Latitude lines
      for (let i = -3; i <= 3; i++) {
        const y = (i / 3) * radius * 0.7
        const xRadius = Math.sqrt(radius * radius - y * y)
        ctx.beginPath()
        ctx.ellipse(0, y, xRadius, xRadius * 0.3, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw nodes/connection points
      const nodeCount = 24
      ctx.fillStyle = 'rgba(255, 150, 255, 0.9)'
      for (let i = 0; i < nodeCount; i++) {
        const lat = (Math.random() - 0.5) * Math.PI * 0.8
        const lon = (i / nodeCount) * Math.PI * 2
        const x = Math.cos(lat) * Math.cos(lon) * radius * 0.8
        const y = Math.sin(lat) * radius * 0.8
        const z = Math.cos(lat) * Math.sin(lon) * radius * 0.8
        const scale = (z + radius) / (radius * 2)
        
        ctx.fillStyle = `rgba(${255 - z}, ${100 + z}, 255, ${0.7 + scale * 0.3})`
        ctx.beginPath()
        ctx.arc(x, y, 3 * scale, 0, Math.PI * 2)
        ctx.fill()
      }

      // Connect some nodes
      ctx.strokeStyle = 'rgba(255, 100, 255, 0.3)'
      ctx.lineWidth = 1
      for (let i = 0; i < nodeCount; i += 2) {
        const lat1 = (Math.random() - 0.5) * Math.PI * 0.8
        const lon1 = (i / nodeCount) * Math.PI * 2
        const x1 = Math.cos(lat1) * Math.cos(lon1) * radius * 0.8
        const y1 = Math.sin(lat1) * radius * 0.8

        const nextI = (i + 2) % nodeCount
        const lat2 = (Math.random() - 0.5) * Math.PI * 0.8
        const lon2 = (nextI / nodeCount) * Math.PI * 2
        const x2 = Math.cos(lat2) * Math.cos(lon2) * radius * 0.8
        const y2 = Math.sin(lat2) * radius * 0.8

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      // Lens flare effect
      ctx.restore()
      const flareGradient = ctx.createRadialGradient(
        centerX - radius * 0.6,
        centerY - radius * 0.3,
        0,
        centerX - radius * 0.6,
        centerY - radius * 0.3,
        radius * 0.8
      )
      flareGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      flareGradient.addColorStop(0.3, 'rgba(255, 150, 255, 0.4)')
      flareGradient.addColorStop(1, 'rgba(255, 150, 255, 0)')
      ctx.fillStyle = flareGradient
      ctx.beginPath()
      ctx.arc(centerX - radius * 0.6, centerY - radius * 0.3, radius * 0.8, 0, Math.PI * 2)
      ctx.fill()
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw nebulae
      const time = Date.now() * 0.0001
      drawNebula(
        canvas.width * 0.2 + Math.sin(time) * 30,
        canvas.height * 0.5 + Math.cos(time * 0.7) * 20,
        canvas.width * 0.4,
        canvas.height * 0.4,
        '138, 43, 226', // Purple
        '255, 20, 147', // Pink
        0.3
      )
      drawNebula(
        canvas.width * 0.8 + Math.cos(time * 0.8) * 40,
        canvas.height * 0.3 + Math.sin(time * 0.5) * 30,
        canvas.width * 0.3,
        canvas.height * 0.3,
        '0, 191, 255', // Blue
        '138, 43, 226', // Purple
        0.25
      )

      // Draw stars
      ctx.fillStyle = 'white'
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7
        ctx.globalAlpha = star.opacity * twinkle
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()

        // Occasional pink/blue stars
        if (Math.random() > 0.95) {
          const color = Math.random() > 0.5 ? '255, 150, 255' : '150, 200, 255'
          ctx.fillStyle = `rgba(${color}, ${star.opacity * twinkle * 0.8})`
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius * 1.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'white'
        }
      })
      ctx.globalAlpha = 1

      // Draw planet
      planetRef.current.rotation += 0.002
      drawPlanet()

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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ background: 'linear-gradient(to bottom, #0a0a1a 0%, #1a0a2e 50%, #0a1a2a 100%)' }}
    />
  )
}

