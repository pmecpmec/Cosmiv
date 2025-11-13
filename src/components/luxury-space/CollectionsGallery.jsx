/**
 * Collections / Gallery Section
 * Responsive grid with hover effects and lightbox
 */

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const galleryItems = [
  { image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800', caption: 'COLLECTION ONE' },
  { image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800', caption: 'COLLECTION TWO' },
  { image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800', caption: 'COLLECTION THREE' },
  { image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800', caption: 'COLLECTION FOUR' },
  { image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800', caption: 'COLLECTION FIVE' },
  { image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800', caption: 'COLLECTION SIX' },
  { image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800', caption: 'COLLECTION SEVEN' },
  { image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800', caption: 'COLLECTION EIGHT' },
]

export default function CollectionsGallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const openLightbox = (item) => {
    setSelectedImage(item)
    setLightboxOpen(true)
  }

  return (
    <>
      <section ref={ref} id="collections" className="py-32 px-6 md:px-20 bg-[#10122B]">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-serif text-[clamp(2.5rem,5vw,4rem)] uppercase tracking-[0.1em] text-[#F5F5F5] text-center mb-20"
        >
          COLLECTIONS
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {galleryItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="relative aspect-[4/3] rounded overflow-hidden group cursor-pointer"
              onClick={() => openLightbox(item)}
            >
              <motion.img
                src={item.image}
                alt={item.caption}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
              >
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-sans text-sm uppercase tracking-[0.1em] text-[#F5F5F5]">
                    {item.caption}
                  </p>
                </div>
              </motion.div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#00FFF7] group-hover:shadow-[0_0_20px_rgba(0,255,247,0.4)] transition-all"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[rgba(11,12,16,0.95)] flex items-center justify-center p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <motion.img
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            src={selectedImage.image}
            alt={selectedImage.caption}
            className="max-w-full max-h-full object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-4xl text-[#00FFF7] hover:text-[#FFD700] transition-colors"
          >
            ×
          </button>
        </motion.div>
      )}
    </>
  )
}

