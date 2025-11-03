/**
 * Cosmic Defender - Hidden Mini Game
 * 
 * Access Methods:
 * 1. Type "COSMIV" anywhere on landing page
 * 2. Click constellation pattern (5 stars in sequence)
 * 3. Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
 * 4. Triple-click logo
 * 
 * Theme: Defend the Cosmiv planet from incoming asteroids
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

const GAME_WIDTH = 800
const GAME_HEIGHT = 600

// Game entities
class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = 40
    this.height = 40
    this.speed = 5
  }

  moveLeft() {
    this.x = Math.max(0, this.x - this.speed)
  }

  moveRight() {
    this.x = Math.min(GAME_WIDTH - this.width, this.x + this.speed)
  }

  draw(ctx) {
    // Draw player ship (simple triangle)
    ctx.fillStyle = '#00FFFF'
    ctx.strokeStyle = '#00FFFF'
    ctx.lineWidth = 2
    
    ctx.beginPath()
    ctx.moveTo(this.x + this.width / 2, this.y)
    ctx.lineTo(this.x, this.y + this.height)
    ctx.lineTo(this.x + this.width, this.y + this.height)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
}

class Asteroid {
  constructor(x, y, size = 30) {
    this.x = x
    this.y = y
    this.size = size
    this.speed = 2 + Math.random() * 2
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 0.1
  }

  update() {
    this.y += this.speed
    this.rotation += this.rotationSpeed
  }

  draw(ctx) {
    ctx.save()
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2)
    ctx.rotate(this.rotation)
    ctx.fillStyle = '#8B5CF6'
    ctx.strokeStyle = '#00FFFF'
    ctx.lineWidth = 2
    
    // Draw asteroid as polygon
    ctx.beginPath()
    const sides = 6
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides
      const x = Math.cos(angle) * this.size / 2
      const y = Math.sin(angle) * this.size / 2
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  isOffScreen() {
    return this.y > GAME_HEIGHT
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = 4
    this.height = 10
    this.speed = 8
  }

  update() {
    this.y -= this.speed
  }

  draw(ctx) {
    ctx.fillStyle = '#00FFFF'
    ctx.fillRect(this.x, this.y, this.width, this.height)
    
    // Glow effect
    ctx.shadowBlur = 10
    ctx.shadowColor = '#00FFFF'
    ctx.fillRect(this.x, this.y, this.width, this.height)
    ctx.shadowBlur = 0
  }

  isOffScreen() {
    return this.y < 0
  }
}

class Particle {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.vx = (Math.random() - 0.5) * 4
    this.vy = (Math.random() - 0.5) * 4
    this.life = 30
    this.maxLife = 30
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.life--
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife
    ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`
    ctx.fillRect(this.x, this.y, 4, 4)
  }

  isDead() {
    return this.life <= 0
  }
}

export default function CosmicGame({ onClose }) {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const { user } = useAuth()
  
  const [gameState, setGameState] = useState('menu') // 'menu', 'playing', 'gameover'
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('cosmicGameHighScore') || '0', 10)
  })
  const [gameObjects, setGameObjects] = useState({
    player: new Player(GAME_WIDTH / 2 - 20, GAME_HEIGHT - 60),
    asteroids: [],
    bullets: [],
    particles: [],
  })

  const keysRef = useRef({})

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (gameState === 'playing') {
          shoot()
        }
      }
    }

    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState])

  const shoot = useCallback(() => {
    setGameObjects(prev => ({
      ...prev,
      bullets: [
        ...prev.bullets,
        new Bullet(prev.player.x + prev.player.width / 2 - 2, prev.player.y),
      ],
    }))
  }, [])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setGameObjects({
      player: new Player(GAME_WIDTH / 2 - 20, GAME_HEIGHT - 60),
      asteroids: [],
      bullets: [],
      particles: [],
    })
  }

  const createParticles = (x, y, count = 10) => {
    const particles = []
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y))
    }
    return particles
  }

  // Use refs for game state to avoid async issues
  const gameStateRef = useRef(gameObjects)
  const scoreRef = useRef(score)
  
  useEffect(() => {
    gameStateRef.current = gameObjects
  }, [gameObjects])
  
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let frameCount = 0
    let lastShotTime = 0
    const shotCooldown = 200 // ms between shots

    const gameLoop = () => {
      frameCount++

      // Clear canvas
      ctx.fillStyle = '#0A0F1A'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

      // Draw stars background
      ctx.fillStyle = '#FFFFFF'
      for (let i = 0; i < 50; i++) {
        const x = (i * 37) % GAME_WIDTH
        const y = (frameCount + i * 23) % GAME_HEIGHT
        ctx.fillRect(x, y, 1, 1)
      }

      // Get current game state from ref
      const currentState = { ...gameStateRef.current }

      // Handle input
      if (keysRef.current['a'] || keysRef.current['arrowleft']) {
        currentState.player.moveLeft()
      }
      if (keysRef.current['d'] || keysRef.current['arrowright']) {
        currentState.player.moveRight()
      }

      // Handle shooting with cooldown
      const now = Date.now()
      if ((keysRef.current[' '] || keysRef.current['arrowup'] || keysRef.current['w']) && 
          (now - lastShotTime) > shotCooldown) {
        lastShotTime = now
        currentState.bullets.push(
          new Bullet(currentState.player.x + currentState.player.width / 2 - 2, currentState.player.y)
        )
      }

      // Update bullets
      currentState.bullets = currentState.bullets
        .map(bullet => {
          bullet.update()
          return bullet
        })
        .filter(bullet => !bullet.isOffScreen())

      // Spawn asteroids
      if (frameCount % 60 === 0) {
        currentState.asteroids.push(
          new Asteroid(Math.random() * (GAME_WIDTH - 30), -30)
        )
      }

      // Update asteroids
      currentState.asteroids = currentState.asteroids
        .map(asteroid => {
          asteroid.update()
          return asteroid
        })
        .filter(asteroid => !asteroid.isOffScreen())

      // Collision detection: bullets vs asteroids
      currentState.bullets = currentState.bullets.filter(bullet => {
        const hitAsteroid = currentState.asteroids.findIndex(asteroid => {
          return (
            bullet.x < asteroid.x + asteroid.size &&
            bullet.x + bullet.width > asteroid.x &&
            bullet.y < asteroid.y + asteroid.size &&
            bullet.y + bullet.height > asteroid.y
          )
        })

        if (hitAsteroid !== -1) {
          const asteroid = currentState.asteroids[hitAsteroid]
          const newScore = scoreRef.current + 10
          setScore(newScore)
          currentState.particles.push(...createParticles(asteroid.x, asteroid.y))
          currentState.asteroids.splice(hitAsteroid, 1)
          return false // Remove bullet
        }
        return true
      })

      // Collision detection: player vs asteroids
      const playerHit = currentState.asteroids.some(asteroid => {
        return (
          currentState.player.x < asteroid.x + asteroid.size &&
          currentState.player.x + currentState.player.width > asteroid.x &&
          currentState.player.y < asteroid.y + asteroid.size &&
          currentState.player.y + currentState.player.height > asteroid.y
        )
      })

      if (playerHit) {
        // Game over
        setGameState('gameover')
        const finalScore = scoreRef.current
        if (finalScore > highScore) {
          setHighScore(finalScore)
          localStorage.setItem('cosmicGameHighScore', finalScore.toString())
        }
        return
      }

      // Update particles
      currentState.particles = currentState.particles
        .map(particle => {
          particle.update()
          return particle
        })
        .filter(particle => !particle.isDead())

      // Update state
      gameStateRef.current = currentState
      setGameObjects(currentState)

      // Draw everything
      currentState.player.draw(ctx)
      currentState.bullets.forEach(bullet => bullet.draw(ctx))
      currentState.asteroids.forEach(asteroid => asteroid.draw(ctx))
      currentState.particles.forEach(particle => particle.draw(ctx))

      // Draw score
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '20px monospace'
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 30)
      ctx.fillText(`High Score: ${highScore}`, 10, 55)

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState, highScore])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-pure-black/95 backdrop-blur-md flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.()
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-pure-black border-2 border-cosmic-neon-cyan p-6 rounded-lg max-w-4xl w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black gradient-text-cosmic tracking-poppr">
              🌌 C O S M I C   D E F E N D E R
            </h2>
            <button
              onClick={onClose}
              className="text-pure-white/70 hover:text-pure-white text-2xl font-black"
            >
              ×
            </button>
          </div>

          {gameState === 'menu' && (
            <div className="text-center py-8">
              <p className="text-pure-white/70 mb-6 font-bold">
                Defend the Cosmiv planet from incoming asteroids!
              </p>
              <div className="text-pure-white/50 text-sm mb-6 space-y-2 font-bold">
                <p>Controls:</p>
                <p>A/D or ← → to move</p>
                <p>Space or ↑ to shoot</p>
              </div>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black border-2 border-cosmic-neon-cyan/50 hover:neon-glow-cyan transition-all tracking-wide neon-glow"
              >
                S T A R T   G A M E
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="text-center py-8">
              <p className="text-3xl font-black text-pure-white mb-4">G A M E   O V E R</p>
              <p className="text-pure-white/70 mb-2 font-bold">Final Score: {score}</p>
              <p className="text-pure-white/50 mb-6 font-bold">High Score: {highScore}</p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black border-2 border-cosmic-neon-cyan/50 hover:neon-glow-cyan transition-all tracking-wide neon-glow mr-4"
              >
                P L A Y   A G A I N
              </button>
              <button
                onClick={onClose}
                className="px-8 py-4 bg-pure-black border-2 border-pure-white/30 hover:border-pure-white/50 text-pure-white font-black transition-all tracking-wide"
              >
                C L O S E
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                className="border-2 border-cosmic-neon-cyan/50 rounded"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

