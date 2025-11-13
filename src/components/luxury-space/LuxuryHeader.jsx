/**
 * Luxury Header Component
 * Transparent nav with elegant logo and navigation
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function LuxuryHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'COLLECTIONS', href: '#collections' },
    { label: 'PHILOSOPHY', href: '#philosophy' },
    { label: 'PRODUCTS', href: '#products' },
    { label: 'CONTACT', href: '#contact' },
  ]

  return (
    <header className="w-full h-20 flex items-center justify-between px-6 md:px-12 border-b border-[rgba(0,255,247,0.1)] backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="font-serif text-2xl md:text-3xl tracking-[0.15em] text-[#F5F5F5] font-light"
      >
        COSMIV
      </motion.div>

      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item, i) => (
          <motion.a
            key={item.label}
            href={item.href}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="font-sans text-sm font-medium tracking-[0.1em] uppercase text-[#C0C0C0] hover:text-[#00FFF7] transition-all relative group"
          >
            {item.label}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00FFF7] group-hover:w-full transition-all duration-300"></span>
          </motion.a>
        ))}
      </nav>

      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-6 md:px-8 py-2 md:py-3 border border-[#00FFF7] text-[#00FFF7] font-sans text-xs md:text-sm uppercase tracking-[0.1em] hover:bg-[rgba(0,255,247,0.1)] hover:shadow-[0_0_20px_rgba(0,255,247,0.5)] transition-all"
      >
        RESERVE NOW
      </motion.button>
    </header>
  )
}

