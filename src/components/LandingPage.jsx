import { useState, lazy, Suspense } from 'react'
import ScrollReveal from './ScrollReveal'
import { motion } from 'framer-motion'
import Planet3DBackground from './Planet3DBackground'
import useEasterEggs from '../hooks/useEasterEggs'
import { InlineLoader } from './ui/LoadingOverlay'
import HeroParticles from './HeroParticles'
import AnimatedHeroText from './AnimatedHeroText'
import FloatingElements from './FloatingElements'
import StatsCounter from './StatsCounter'
import InteractiveDemo from './InteractiveDemo'
import ParallaxSection from './ParallaxSection'
import EnhancedHero from './EnhancedHero'
import TensorStaxLandingPage from './TensorStaxLandingPage'

// Lazy load the game (it's a hidden feature)
const CosmicGame = lazy(() => import('./game/CosmicGame'))

export default function LandingPage({ onGetStarted }) {
  const [showGame, setShowGame] = useState(false)
  
  // Easter egg handlers
  const { handleConstellationClick, handleLogoClick } = useEasterEggs(() => {
    setShowGame(true)
  })
  const pipelineSteps = [
    { icon: "📤", title: "Upload Clips", description: "Import from Steam, Xbox, PS, or Switch" },
    { icon: "🧠", title: "AI Detection", description: "Automatically detects highlights and action moments" },
    { icon: "✂️", title: "Smart Editing", description: "Applies montage styles, cuts, and effects" },
    { icon: "🎵", title: "AI Music", description: "Generates dynamic soundtracks synced to beats" },
    { icon: "🚫", title: "Auto-Censor", description: "Removes profanity automatically" },
    { icon: "📹", title: "Multi-Format", description: "Exports 16:9 and 9:16 for all platforms" },
  ]

  const features = [
    { icon: "⚡", title: "Lightning Fast", description: "Process clips in seconds, not hours" },
    { icon: "🎯", title: "AI-Powered", description: "Advanced ML detects the best moments" },
    { icon: "📱", title: "Auto-Post", description: "Share to TikTok, YouTube, Instagram automatically" },
    { icon: "💰", title: "Monetize", description: "Free, Pro, and Creator+ tiers available" },
  ]


  // Use TensorStax-inspired design
  return <TensorStaxLandingPage onGetStarted={onGetStarted} />
}

