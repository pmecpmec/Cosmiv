/**
 * Luxury Footer Component
 * 4-column layout with logo, nav, social, newsletter
 */

import { motion } from 'framer-motion'

export default function LuxuryFooter() {
  const navLinks = [
    { label: 'Collections', href: '#collections' },
    { label: 'Philosophy', href: '#philosophy' },
    { label: 'Products', href: '#products' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ]

  const socialLinks = [
    { icon: '📷', href: '#', label: 'Instagram' },
    { icon: '🐦', href: '#', label: 'Twitter' },
    { icon: '💼', href: '#', label: 'LinkedIn' },
    { icon: '📺', href: '#', label: 'YouTube' },
  ]

  return (
    <footer className="py-20 px-6 md:px-16 bg-[#0B0C10] border-t border-[rgba(0,255,247,0.1)]">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 max-w-7xl">
        {/* Logo */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-2xl text-[#F5F5F5] mb-4 tracking-[0.15em]"
          >
            COSMIV
          </motion.div>
          <p className="font-sans text-sm text-[#C0C0C0] leading-relaxed">
            Luxury space experiences crafted for the extraordinary.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-sans text-sm uppercase tracking-[0.1em] text-[#F5F5F5] mb-6 font-medium">
            NAVIGATION
          </h3>
          <ul className="space-y-3">
            {navLinks.map((link, i) => (
              <motion.li
                key={link.label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              >
                <a
                  href={link.href}
                  className="font-sans text-sm text-[#C0C0C0] hover:text-[#00FFF7] transition-colors"
                >
                  {link.label}
                </a>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="font-sans text-sm uppercase tracking-[0.1em] text-[#F5F5F5] mb-6 font-medium">
            FOLLOW US
          </h3>
          <div className="flex gap-4">
            {socialLinks.map((social, i) => (
              <motion.a
                key={social.label}
                href={social.href}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.2, y: -4 }}
                className="w-10 h-10 flex items-center justify-center text-2xl text-[#C0C0C0] hover:text-[#00FFF7] transition-colors"
                aria-label={social.label}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-sans text-sm uppercase tracking-[0.1em] text-[#F5F5F5] mb-6 font-medium">
            NEWSLETTER
          </h3>
          <form className="space-y-3">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 bg-[#1C1E26] border border-[rgba(0,255,247,0.2)] text-[#F5F5F5] rounded focus:outline-none focus:border-[#00FFF7] focus:shadow-[0_0_10px_rgba(0,255,247,0.3)] transition-all"
            />
            <button
              type="submit"
              className="w-full px-6 py-2 bg-[#00FFF7] text-[#0B0C10] font-sans font-bold uppercase tracking-[0.1em] hover:bg-[#00E6E0] transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center pt-8 border-t border-[rgba(0,255,247,0.1)]"
      >
        <p className="font-sans text-xs text-[#C0C0C0]">
          © 2024 Cosmiv. All rights reserved.
        </p>
      </motion.div>
    </footer>
  )
}

