import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../contexts/ToastContext'

/**
 * Custom hook for Easter egg detection
 * Handles various Easter egg triggers to unlock the hidden game
 */
export function useEasterEggs(onGameUnlock) {
  const [typedSequence, setTypedSequence] = useState('')
  const [konamiCode, setKonamiCode] = useState([])
  const [constellationClicks, setConstellationClicks] = useState([])
  const [logoClicks, setLogoClicks] = useState(0)
  const { showSuccess, showInfo } = useToast()

  // Konami code sequence
  const KONAMI_SEQUENCE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ]

  // Typing detection (COSMIV)
  useEffect(() => {
    const handleKeyPress = (e) => {
      const char = e.key.toLowerCase()
      const sequence = 'cosmiv'
      
      setTypedSequence(prev => {
        const newSeq = (prev + char).slice(-sequence.length)
        
        if (newSeq === sequence) {
          showSuccess('🌌 Secret discovered! Opening Cosmic Defender...')
          setTimeout(() => {
            onGameUnlock()
          }, 500)
          return ''
        }
        
        return newSeq
      })
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onGameUnlock, showSuccess])

  // Konami code detection
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      setKonamiCode(prev => {
        const newCode = [...prev, e.key]
        const trimmed = newCode.slice(-KONAMI_SEQUENCE.length)
        
        // Check if sequence matches
        if (trimmed.length === KONAMI_SEQUENCE.length) {
          const matches = trimmed.every((key, i) => 
            key.toLowerCase() === KONAMI_SEQUENCE[i].toLowerCase()
          )
          
          if (matches) {
            showSuccess('🎮 Konami code activated!')
            setTimeout(() => {
              onGameUnlock()
            }, 500)
            return []
          }
        }
        
        return trimmed
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onGameUnlock, showSuccess])

  // Constellation pattern click handler
  const handleConstellationClick = useCallback((starId) => {
    const pattern = [0, 1, 2, 3, 4] // 5 stars in sequence
    
    setConstellationClicks(prev => {
      const newClicks = [...prev, starId]
      
      // Check if pattern matches
      if (newClicks.length === pattern.length) {
        const matches = newClicks.every((click, i) => click === pattern[i])
        
        if (matches) {
          showSuccess('⭐ Constellation unlocked! Opening game...')
          setTimeout(() => {
            onGameUnlock()
          }, 500)
          return []
        } else {
          // Reset if wrong
          return [starId]
        }
      }
      
      return newClicks
    })
  }, [onGameUnlock, showSuccess])

  // Logo triple-click handler
  const handleLogoClick = useCallback(() => {
    setLogoClicks(prev => {
      const newCount = prev + 1
      
      if (newCount >= 3) {
        showSuccess('🌌 Logo triple-tap! Opening secret...')
        setTimeout(() => {
          onGameUnlock()
        }, 500)
        return 0
      }
      
      // Reset after 2 seconds
      setTimeout(() => {
        setLogoClicks(0)
      }, 2000)
      
      return newCount
    })
  }, [onGameUnlock, showSuccess])

  return {
    handleConstellationClick,
    handleLogoClick,
  }
}

export default useEasterEggs

