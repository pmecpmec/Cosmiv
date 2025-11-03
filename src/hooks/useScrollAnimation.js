/**
 * useScrollAnimation Hook
 * 
 * Animates elements as they enter the viewport
 * Supports parallax scrolling and reveal animations
 */

import { useEffect, useRef, useState } from 'react'

/**
 * Hook to animate element when it enters viewport
 * 
 * @param {object} options
 * @param {string} options.threshold - Intersection threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection observer
 * @param {boolean} options.once - Animate only once (default: true)
 * @param {string} options.animation - Animation type ('fade', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'scale')
 */
export function useScrollAnimation(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = true,
    animation = 'fade',
  } = options

  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || (once && hasAnimated)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) {
            setHasAnimated(true)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, once, hasAnimated])

  const getAnimationClasses = () => {
    if (!isVisible) {
      switch (animation) {
        case 'slideUp':
          return 'opacity-0 translate-y-10'
        case 'slideDown':
          return 'opacity-0 -translate-y-10'
        case 'slideLeft':
          return 'opacity-0 translate-x-10'
        case 'slideRight':
          return 'opacity-0 -translate-x-10'
        case 'scale':
          return 'opacity-0 scale-95'
        case 'fade':
        default:
          return 'opacity-0'
      }
    }

    return 'opacity-100 translate-y-0 translate-x-0 scale-100'
  }

  return {
    ref,
    isVisible,
    animationClass: `${getAnimationClasses()} transition-all duration-700 ease-out`,
  }
}

/**
 * Hook for parallax scrolling effect
 * 
 * @param {number} speed - Parallax speed (0 = no movement, 1 = normal scroll)
 * @param {number} offset - Initial offset
 */
export function useParallax(speed = 0.5, offset = 0) {
  const [y, setY] = useState(offset)
  const ref = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const elementTop = rect.top + window.pageYOffset
      const windowHeight = window.innerHeight
      const scrollY = window.pageYOffset

      // Only animate when element is in viewport
      if (scrollY + windowHeight > elementTop && scrollY < elementTop + rect.height) {
        const parallaxY = (scrollY - elementTop) * speed + offset
        setY(parallaxY)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed, offset])

  return {
    ref,
    style: {
      transform: `translateY(${y}px)`,
    },
  }
}

/**
 * Hook for scroll progress indicator
 * 
 * @returns {number} Progress from 0 to 1
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollableHeight = documentHeight - windowHeight
      const currentProgress = scrollTop / scrollableHeight
      setProgress(Math.min(Math.max(currentProgress, 0), 1))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return progress
}

export default useScrollAnimation

