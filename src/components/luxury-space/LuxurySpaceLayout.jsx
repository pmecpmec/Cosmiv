/**
 * Luxury Space Brand Website - Main Layout Component
 * Premium, cinematic, emotionally engaging layout
 */

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import LuxuryHeader from './LuxuryHeader'
import LuxuryHero from './LuxuryHero'
import FeatureHighlights from './FeatureHighlights'
import CollectionsGallery from './CollectionsGallery'
import BrandStory from './BrandStory'
import Testimonials from './Testimonials'
import ProductDetails from './ProductDetails'
import CallToAction from './CallToAction'
import LuxuryFooter from './LuxuryFooter'

export default function LuxurySpaceLayout() {
  const { scrollYProgress } = useScroll()
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95])
  const headerBackground = useTransform(
    scrollYProgress,
    [0, 0.1],
    ['rgba(11, 12, 16, 0)', 'rgba(11, 12, 16, 0.9)']
  )

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5]">
      {/* Header */}
      <motion.div
        style={{ opacity: headerOpacity, backgroundColor: headerBackground }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <LuxuryHeader />
      </motion.div>

      {/* Hero Section */}
      <LuxuryHero />

      {/* Feature Highlights */}
      <FeatureHighlights />

      {/* Collections Gallery */}
      <CollectionsGallery />

      {/* Brand Story */}
      <BrandStory />

      {/* Testimonials */}
      <Testimonials />

      {/* Product Details */}
      <ProductDetails />

      {/* Call to Action */}
      <CallToAction />

      {/* Footer */}
      <LuxuryFooter />
    </div>
  )
}

