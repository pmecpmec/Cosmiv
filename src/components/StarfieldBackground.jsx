/**
 * StarfieldBackground - Enhanced visible starfield
 * Dense, bright stars with twinkling and shooting stars
 * Can be used standalone or alongside CosmicBackground
 */

import { useEffect, useRef } from 'react'

export default function StarfieldBackground({ 
  starCount = 2000,
  showShootingStars = true,
  showColoredStars = true,
  intensity = 'high' // 'low', 'medium', 'high'
}) {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const starsRef = useRef([])
  const shootingStarsRef = useRef([])

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

    // Intensity multipliers
    const intensityMultipliers = {
      low: { count: 0.5, opacity: 0.6, radius: 0.8 },
      medium: { count: 1, opacity: 0.8, radius: 1 },
      high: { count: 1.5, opacity: 1, radius: 1.2 },
    }
    const multiplier = intensityMultipliers[intensity]

    // Initialize stars
    const initStars = () => {
      starsRef.current = []
      const count = Math.floor(starCount * multiplier.count)
      
      for (let i = 0; i < count; i++) {
        const starType = Math.random()
        const isColored = showColoredStars && starType > 0.88 // 12% colored stars to match CosmicBackground
        
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: (starType > 0.9 
            ? Math.random() * 2 + 1.5  // Bright stars (10%)
            : starType > 0.7 
            ? Math.random() * 1.5 + 1   // Medium stars (20%)
            : Math.random() * 1 + 0.5) * multiplier.radius,  // Small stars (70%)
          opacity: (starType > 0.9 
            ? Math.random() * 0.3 + 0.9  // Very bright
            : starType > 0.7 
            ? Math.random() * 0.4 + 0.6  // Medium bright
            : Math.random() * 0.5 + 0.4) * multiplier.opacity, // Dim but visible
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: isColored ? 'colored' : 'white',
          colorType: isColored ? Math.floor(Math.random() * 6) : 0,
        })
      }
    }
    initStars()

    // Shooting star system
    const createShootingStar = () => {
      if (!showShootingStars) return
      
      shootingStarsRef.current.push({
        x: Math.random() * canvas.width,
        y: -20,
        length: 100 + Math.random() * 150,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.5,
        speed: 2 + Math.random() * 3,
        opacity: 1,
        life: 1,
      })
    }

    // Animation loop
    const animate = () => {
      // Pure black background for maximum star visibility
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinkleOffset) * 0.2 + 0.8
        const currentOpacity = star.opacity * twinkle
        
        if (star.color === 'colored') {
          const colorChoices = [
            { rgb: '0, 255, 255', shadow: 'rgba(0, 255, 255, 0.9)' },    // Neon cyan (most common)
            { rgb: '100, 200, 255', shadow: 'rgba(100, 200, 255, 0.9)' }, // Bright blue
            { rgb: '139, 92, 246', shadow: 'rgba(139, 92, 246, 0.9)' }, // Cosmic violet
            { rgb: '150, 100, 255', shadow: 'rgba(150, 100, 255, 0.9)' }, // Purple-cyan
            { rgb: '0, 200, 255', shadow: 'rgba(0, 200, 255, 0.9)' },   // Electric cyan
            { rgb: '50, 150, 255', shadow: 'rgba(50, 150, 255, 0.9)' },  // Sky blue
          ]
          const color = colorChoices[star.colorType]
          
          // Strong glow for colored stars
          ctx.shadowBlur = star.radius * 4
          ctx.shadowColor = color.shadow
          ctx.fillStyle = `rgba(${color.rgb}, ${currentOpacity})`
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
          ctx.fill()
          
          // Outer glow ring
          ctx.shadowBlur = star.radius * 6
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // White stars - bright and visible
          const glowSize = star.radius > 1.5 ? star.radius * 3 : star.radius * 1.5
          ctx.shadowBlur = glowSize
          ctx.shadowColor = `rgba(255, 255, 255, ${currentOpacity * 0.6})`
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
          ctx.fill()
        }
        
        ctx.shadowBlur = 0
      })

      // Draw shooting stars
      if (showShootingStars) {
        // Create new shooting star occasionally
        if (Math.random() > 0.995) {
          createShootingStar()
        }

        // Update and draw shooting stars
        shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
          star.x += Math.cos(star.angle) * star.speed
          star.y += Math.sin(star.angle) * star.speed
          star.life -= 0.02
          star.opacity = star.life

          if (star.life > 0 && star.y < canvas.height + 50) {
            // Draw shooting star with trail
            const gradient = ctx.createLinearGradient(
              star.x, star.y,
              star.x - Math.cos(star.angle) * star.length,
              star.y - Math.sin(star.angle) * star.length
            )
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`)
            gradient.addColorStop(0.5, `rgba(0, 255, 255, ${star.opacity * 0.6})`)
            gradient.addColorStop(1, 'transparent')

            ctx.strokeStyle = gradient
            ctx.lineWidth = 2
            ctx.shadowBlur = 15
            ctx.shadowColor = 'rgba(0, 255, 255, 0.8)'
            ctx.beginPath()
            ctx.moveTo(star.x, star.y)
            ctx.lineTo(
              star.x - Math.cos(star.angle) * star.length,
              star.y - Math.sin(star.angle) * star.length
            )
            ctx.stroke()
            ctx.shadowBlur = 0
            return true
          }
          return false
        })
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', setCanvasSize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [starCount, showShootingStars, showColoredStars, intensity])

  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          background: '#000000' // Pure black for maximum star visibility
        }}
      />
    </div>
  )
}

