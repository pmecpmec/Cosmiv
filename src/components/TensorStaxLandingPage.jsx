/**
 * TensorStax-inspired Landing Page
 * Clean, professional, structured design
 */

import { useState, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { InlineLoader } from './ui/LoadingOverlay'
import TensorStaxHero from './TensorStaxHero'
import StarfieldBackground from './StarfieldBackground'

const CosmicGame = lazy(() => import('./game/CosmicGame'))

export default function TensorStaxLandingPage({ onGetStarted }) {
  const [showGame, setShowGame] = useState(false)

  const pipelineSteps = [
    {
      number: "01",
      title: "Upload your clips",
      description: "Connect your gaming platforms or upload clips directly. Support for Steam, Xbox, PlayStation, and Switch.",
    },
    {
      number: "02",
      title: "AI analyzes and plans",
      description: "Our AI detects highlights, analyzes gameplay patterns, and creates an editing plan tailored to your style.",
    },
    {
      number: "03",
      title: "Montage generated",
      description: "Automated editing, transitions, music sync, and multi-format export—all in seconds.",
    },
    {
      number: "04",
      title: "Verified and ready",
      description: "Every montage is validated before export. Preview, adjust, and share to TikTok, YouTube, or Instagram.",
    },
  ]

  const features = [
    {
      title: "Self-healing pipelines",
      description: "Detects issues, suggests fixes, and automatically optimizes your montages.",
      badge: "Autofix + git integration",
    },
    {
      title: "Generate models & tests",
      description: "Automatically generate editing styles, transitions, and quality checks with strong validation.",
      badge: "Auto Code Completion & Validation",
    },
    {
      title: "Compiler layer",
      description: "AI generates missing elements, validates structure, and ensures correctness before export.",
      badge: "Agent generates missing code blocks",
    },
    {
      title: "Data OS & observability",
      description: "Manage all your montages, clips, and exports in one centralized location.",
      badge: "Manage pipelines across all tools",
    },
  ]

  const integrations = [
    { name: "Steam", logo: "Steam" },
    { name: "Xbox", logo: "Xbox" },
    { name: "PlayStation", logo: "PlayStation" },
    { name: "Nintendo Switch", logo: "Switch" },
    { name: "TikTok", logo: "TikTok" },
    { name: "YouTube", logo: "YouTube" },
    { name: "Instagram", logo: "Instagram" },
  ]

  return (
    <div className="min-h-screen bg-pure-black text-white relative">
      <StarfieldBackground starCount={200} intensity="low" />
      
      {/* Hero Section */}
      <TensorStaxHero onGetStarted={onGetStarted} />

      {/* Active Integrations */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <p className="text-sm text-white/40 mb-8 tracking-wider uppercase">Active Integrations:</p>
          <div className="flex flex-wrap items-center gap-8">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-white/30 hover:text-white/60 transition-colors text-sm font-medium"
              >
                {integration.name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Numbered Steps */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-32">
            {pipelineSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Step Number */}
                <div className="lg:col-span-2">
                  <div className="text-6xl md:text-7xl font-light text-white/10">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-10">
                  <h3 className="text-3xl md:text-4xl font-light text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-white mb-16"
          >
            The agentic gaming OS
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/60 mb-16 max-w-2xl"
          >
            Your Gaming Stack, Supercharged
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border border-white/10 rounded-sm p-8 hover:border-white/20 transition-colors bg-white/5"
              >
                <div className="text-xs text-white/40 mb-3 tracking-wider uppercase">
                  {feature.badge}
                </div>
                <h3 className="text-2xl font-light text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-32 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-white mb-4"
          >
            Getting started is easy
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            {[
              {
                step: "1",
                title: "Connect your data",
                description: "Choose your source: Steam, Xbox, PlayStation, or upload clips directly. Configure access permissions.",
              },
              {
                step: "2",
                title: "Define your style",
                description: "Select editing preferences, montage style, and output format. Set your target duration and theme.",
              },
              {
                step: "3",
                title: "Invoke the agent",
                description: "AI reads your preferences, detects highlights, and generates your montage. Preview and export in seconds.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-sm text-white/40 mb-4 tracking-wider uppercase">
                  Step {item.step}.
                </div>
                <h3 className="text-2xl font-light text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-32 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-white mb-4"
          >
            Built-in security and compliance
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/60 mb-12 max-w-3xl"
          >
            Cosmiv secures every connection, pipeline, and runtime environment. 
            Credentials are never stored in code and are only accessed at runtime.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Secure Connections", desc: "Encrypted credentials, secure OAuth and token-based access" },
              { title: "Compliance-Ready", desc: "SOC2 Type 2, GDPR compliant" },
              { title: "Isolated environments", desc: "Containerized runtime per job or pipeline" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border border-white/10 rounded-sm p-6 bg-white/5"
              >
                <h3 className="text-xl font-light text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-white mb-6"
          >
            Pipelines that fix themselves. Validated before you deploy.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/60 mb-12"
          >
            Automated validation, instant testing, zero guesswork.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-black font-medium text-sm tracking-wide hover:bg-white/90 transition-all rounded-sm"
          >
            Get Started
          </motion.button>
        </div>
      </section>

      {/* Hidden Game Modal */}
      {showGame && (
        <Suspense fallback={<InlineLoader message="Loading game..." />}>
          <CosmicGame onClose={() => setShowGame(false)} />
        </Suspense>
      )}
    </div>
  )
}


