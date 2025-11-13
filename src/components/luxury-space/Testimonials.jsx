/**
 * Testimonials / Clients Section
 * Carousel with smooth transitions
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const testimonials = [
  {
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    quote: 'An extraordinary experience that redefines luxury. Every detail speaks to perfection.',
    name: 'JOHN DOE',
    title: 'CEO, Stellar Industries',
  },
  {
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    quote: 'The craftsmanship is unparalleled. A true masterpiece of cosmic elegance.',
    name: 'JANE SMITH',
    title: 'Founder, Nebula Ventures',
  },
  {
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    quote: 'Beyond expectations. This is what luxury should feel like in the modern age.',
    name: 'MICHAEL CHEN',
    title: 'Creative Director, Galaxy Studios',
  },
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section ref={ref} className="py-32 px-6 md:px-20 bg-[#1C1E26]">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="font-serif text-[clamp(2.5rem,5vw,4rem)] uppercase tracking-[0.1em] text-[#F5F5F5] text-center mb-20"
      >
        TESTIMONIALS
      </motion.h2>

      <div className="max-w-5xl mx-auto">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-[#0B0C10] border border-[rgba(0,255,247,0.2)] rounded-xl p-12 md:p-16 flex flex-col md:flex-row gap-12 items-center"
            >
              <motion.img
                src={testimonials[currentIndex].photo}
                alt={testimonials[currentIndex].name}
                className="w-32 h-32 rounded-full border-4 border-[#00FFF7] object-cover"
                whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(0, 255, 247, 0.5)' }}
                transition={{ duration: 0.3 }}
              />
              <div className="flex-1">
                <p className="font-serif text-xl md:text-2xl italic text-[#F5F5F5] leading-relaxed mb-6">
                  "{testimonials[currentIndex].quote}"
                </p>
                <p className="font-sans text-sm uppercase tracking-[0.1em] text-[#00FFF7]">
                  — {testimonials[currentIndex].name}, {testimonials[currentIndex].title}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? 'bg-[#00FFF7] w-8'
                    : 'bg-[rgba(0,255,247,0.3)] hover:bg-[rgba(0,255,247,0.5)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

