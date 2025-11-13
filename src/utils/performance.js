/**
 * Performance Utilities
 * Functions to manage will-change, lazy loading, and performance optimizations
 */

/**
 * Dynamically manage will-change property
 * Adds will-change when element is about to animate, removes it after
 */
export function manageWillChange(element, properties = ['transform', 'opacity'], duration = 300) {
  if (!element) return

  // Add will-change
  if (typeof properties === 'string') {
    element.style.willChange = properties
  } else {
    element.style.willChange = properties.join(', ')
  }

  // Remove will-change after animation
  setTimeout(() => {
    element.style.willChange = 'auto'
  }, duration)

  return () => {
    element.style.willChange = 'auto'
  }
}

/**
 * Enable GPU acceleration for element
 */
export function enableGPUAcceleration(element) {
  if (!element) return

  element.style.transform = 'translateZ(0)'
  element.style.webkitTransform = 'translateZ(0)'
  element.style.backfaceVisibility = 'hidden'
  element.style.webkitBackfaceVisibility = 'hidden'
  element.style.perspective = '1000px'
  element.style.webkitPerspective = '1000px'

  return element
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImages(imageSelector = 'img[data-src]') {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
            img.classList.add('loaded')
            observer.unobserve(img)
          }
        }
      })
    }, {
      rootMargin: '50px',
    })

    document.querySelectorAll(imageSelector).forEach((img) => {
      imageObserver.observe(img)
    })
  }
}

/**
 * Debounce function for performance
 */
export function debounce(func, wait = 100) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance
 */
export function throttle(func, limit = 100) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Disable animations if user prefers reduced motion
 */
export function handleReducedMotion() {
  if (prefersReducedMotion()) {
    document.documentElement.classList.add('reduced-motion')
    // Disable all CSS animations
    const style = document.createElement('style')
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `
    document.head.appendChild(style)
  }
}

/**
 * Optimize scroll performance
 */
export function optimizeScroll(container) {
  if (!container) container = document.documentElement

  container.style.contain = 'layout style paint'
  container.style.willChange = 'scroll-position'

  // Use passive event listeners for scroll
  let ticking = false

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        // Scroll handling logic here
        ticking = false
      })
      ticking = true
    }
  }

  container.addEventListener('scroll', handleScroll, { passive: true })

  return () => {
    container.removeEventListener('scroll', handleScroll)
  }
}

/**
 * Preload critical resources
 */
export function preloadResource(href, as = 'style', crossorigin = false) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (crossorigin) {
    link.crossOrigin = 'anonymous'
  }
  document.head.appendChild(link)
}

/**
 * Initialize performance optimizations on page load
 */
export function initPerformanceOptimizations() {
  // Only run in browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  try {
    // Handle reduced motion
    handleReducedMotion()

    // Lazy load images
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        lazyLoadImages()
      })
    } else {
      lazyLoadImages()
    }

    // Optimize scroll
    optimizeScroll()

    // Enable GPU acceleration for animated elements
    document.querySelectorAll('.animate-float, .animate-cosmic-glow, .card-3d').forEach((el) => {
      enableGPUAcceleration(el)
    })

    // Monitor performance
    if ('PerformanceObserver' in window) {
      try {
        const perfObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Log long tasks
            if (entry.entryType === 'longtask') {
              console.warn('Long task detected:', entry.duration)
            }
          }
        })
        perfObserver.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // PerformanceObserver not fully supported
      }
    }
  } catch (error) {
    console.error('Performance optimization error:', error)
  }
}

/**
 * Request animation frame wrapper
 */
export function requestAnimationFrame(callback) {
  if ('requestAnimationFrame' in window) {
    return window.requestAnimationFrame(callback)
  }
  return setTimeout(callback, 1000 / 60)
}

/**
 * Cancel animation frame wrapper
 */
export function cancelAnimationFrame(id) {
  if ('cancelAnimationFrame' in window) {
    return window.cancelAnimationFrame(id)
  }
  return clearTimeout(id)
}

