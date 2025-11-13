import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function EpimindsLanding({ onGetStarted, onLogin }) {
  const heroRef = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    // Scroll-triggered animations
    const handleScroll = () => {
      // Add scroll-based animations here
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/icons/icon-192x192.svg" 
              alt="Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-semibold">Epiminds</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#careers" className="text-sm font-medium hover:text-gray-600 transition-colors">
              Careers
            </a>
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              Request Access
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="pt-24 pb-16 px-6 min-h-screen flex items-center justify-center"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Multi Agentic Teams for Marketing.
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <h2 className="text-4xl font-bold">Introducing</h2>
              <img 
                src="/icons/icon-192x192.svg" 
                alt="Lucy" 
                className="h-12 w-12"
              />
            </motion.div>
            <motion.button
              onClick={onGetStarted}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="px-8 py-4 bg-black text-white text-lg font-medium rounded-lg hover:bg-gray-800 transition-all hover:scale-105"
            >
              Request Access
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
              A Connected Network of AI Agents
            </h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The operating system for marketing.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Lucy orchestrates 20+ autonomous agents across data, creative, and strategy, 
              forming a synchronized system that learns, adapts, and executes like your best 
              marketing team, only faster.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-12 mt-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-lg shadow-sm"
            >
              <div className="h-48 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-gray-400">Analyze Image</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Analyze</h3>
              <p className="text-gray-600">
                Lucy dives into your data, uncovers insights, and explains performance in real time
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-lg shadow-sm"
            >
              <div className="h-48 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-gray-400">Execute Image</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Execute</h3>
              <p className="text-gray-600">
                Lucy can take action across every platform — adjusting budgets, optimizing ads, and launching updates.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chat Interface Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gray-50 rounded-2xl p-12"
          >
            <div className="space-y-6">
              {/* User Message */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="space-y-2">
                    {["Hi", "Lucy!", "Every", "Monday", "at", "9am,", "generate", "a", "weekly", "reports", "for", "all", "my", "clients", "and", "send", "me", "an", "email", "with", "a", "summary", "of", "the", "most", "important", "areas", "to", "look", "at."].map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="inline-block text-2xl font-bold mr-2"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="space-y-2">
                    {["Absolutely!", "I", "will", "handle", "the", "weekly", "reporting", "going", "forward.", "Task Created"].map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                        className="inline-block text-2xl font-bold mr-2 text-gray-600"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lucy Adapts Section */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-16 text-center"
          >
            Lucy Adapts to you.
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-4">Connected to Your Marketing Stack.</h3>
              <p className="text-gray-600">
                Lucy integrates with your entire marketing ecosystem — channels, CRMs, eCommerce, 
                analytics, data warehouses, and trend platforms — to deliver one holistic view of performance.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-4">Lucy Learns How You Work.</h3>
              <p className="text-gray-600">
                Upload playbooks, training docs, and client context — Lucy adapts to your agency's 
                methods and preferences. Over time, she mirrors how your team thinks and operates.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold mb-4">Native in Your Systems.</h3>
              <p className="text-gray-600">
                Lucy is built to act like a colleague, she works where you work. You can chat with 
                her in Slack or email her with questions or tasks.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <p className="text-2xl md:text-3xl font-medium mb-6 italic text-gray-800">
              "We've integrated Epiminds, a powerful stack of AI agents, into our advertising workflows. 
              It has really started transforming how our specialists work by automating analysis and 
              surfacing deep actionable insights, while we remain in control of strategic decisions."
            </p>
            <p className="text-lg font-semibold">John Axelsson, CEO of BBO</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Privacy", desc: "Your data, fully protected." },
              { title: "Control", desc: "You're always in charge." },
              { title: "Transparency", desc: "Clear actions, no black box." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white p-8 rounded-lg text-center"
              >
                <div className="h-16 w-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-400"
          >
            JOIN THE NEXT GENERATION OF MARKETING
          </motion.h3>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-8"
          >
            Request Early Access.
          </motion.h2>
          <motion.button
            onClick={onGetStarted}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="px-8 py-4 bg-white text-black text-lg font-medium rounded-lg hover:bg-gray-100 transition-all hover:scale-105"
          >
            Request Access
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <img 
            src="/icons/icon-192x192.svg" 
            alt="Logo" 
            className="h-8 w-8"
          />
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a href="#linkedin" className="hover:text-black transition-colors">Linkedin</a>
            <a href="#privacy" className="hover:text-black transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-black transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

