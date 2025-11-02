/**
 * PageSection Component - Poppr-inspired full-height sections
 * Creates immersive, full-screen sections with generous spacing
 */
export default function PageSection({ children, className = "", bg = "pure-black" }) {
  return (
    <section className={`min-h-screen flex items-center py-section px-4 bg-${bg} ${className}`}>
      <div className="container mx-auto w-full">
        {children}
      </div>
    </section>
  )
}

