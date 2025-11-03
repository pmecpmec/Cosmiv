/**
 * SearchBar Component
 * Global search with command palette (Cmd+K / Ctrl+K style)
 * Features fuzzy search, keyboard shortcuts, and smooth animations
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Mock search data - replace with actual API calls
const searchData = {
  jobs: [],
  users: [],
  content: [],
}

// Search result types
const RESULT_TYPES = {
  PAGE: 'page',
  ACTION: 'action',
  JOB: 'job',
  SETTING: 'setting',
}

// Available pages/actions for search
const searchableItems = [
  { id: 'home', type: RESULT_TYPES.PAGE, title: 'Home', icon: '🏠', path: '/' },
  { id: 'upload', type: RESULT_TYPES.PAGE, title: 'Upload Clips', icon: '📤', path: '/upload' },
  { id: 'dashboard', type: RESULT_TYPES.PAGE, title: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'analytics', type: RESULT_TYPES.PAGE, title: 'Analytics', icon: '📈', path: '/analytics' },
  { id: 'accounts', type: RESULT_TYPES.PAGE, title: 'Game Accounts', icon: '🎮', path: '/accounts' },
  { id: 'billing', type: RESULT_TYPES.PAGE, title: 'Billing', icon: '💳', path: '/billing' },
  { id: 'social', type: RESULT_TYPES.PAGE, title: 'Social', icon: '🔗', path: '/social' },
  { id: 'feed', type: RESULT_TYPES.PAGE, title: 'Feed', icon: '📰', path: '/feed' },
  { id: 'communities', type: RESULT_TYPES.PAGE, title: 'Communities', icon: '👥', path: '/communities' },
  { id: 'ai', type: RESULT_TYPES.PAGE, title: 'AI Assistant', icon: '🤖', path: '/ai' },
]

/**
 * Fuzzy search function
 */
function fuzzySearch(query, items) {
  if (!query) return items

  const lowerQuery = query.toLowerCase()
  const scored = items.map(item => {
    const lowerTitle = item.title.toLowerCase()
    const lowerKeywords = (item.keywords || '').toLowerCase()

    // Exact match
    if (lowerTitle === lowerQuery) return { ...item, score: 100 }
    // Starts with
    if (lowerTitle.startsWith(lowerQuery)) return { ...item, score: 80 }
    // Contains
    if (lowerTitle.includes(lowerQuery)) return { ...item, score: 60 }
    // Keywords match
    if (lowerKeywords.includes(lowerQuery)) return { ...item, score: 40 }
    // No match
    return null
  }).filter(item => item !== null)

  return scored.sort((a, b) => b.score - a.score).map(({ score, ...item }) => item)
}

/**
 * Highlight matching text in search results
 */
function HighlightText({ text, query }) {
  if (!query) return text

  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-cosmic-neon-cyan/30 font-black text-cosmic-neon-cyan">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  )
}

export default function SearchBar({ onSelectTab }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState([])
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  // Get recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cosmiv_recent_searches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  // Search results
  const results = fuzzySearch(query, searchableItems).slice(0, 8)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setQuery('')
      }

      // Arrow keys navigation
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
        }
        if (e.key === 'Enter' && results[selectedIndex]) {
          e.preventDefault()
          handleSelect(results[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex]
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, results.length])

  const handleSelect = (item) => {
    // Save to recent searches
    const updated = [item, ...recentSearches.filter(r => r.id !== item.id)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('cosmiv_recent_searches', JSON.stringify(updated))

    // Navigate or execute action
    if (item.path && onSelectTab) {
      onSelectTab(item.id)
    }

    // Close search
    setIsOpen(false)
    setQuery('')
  }

  const handleRecentSelect = (item) => {
    handleSelect(item)
  }

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white/70 hover:text-white transition-all text-sm font-bold"
        title="Search (Ctrl+K / Cmd+K)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 border border-white/20 rounded text-xs font-mono">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-pure-black/80 backdrop-blur-sm z-[9998]"
            />

            {/* Search Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-[9999]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass-intense rounded-xl shadow-2xl border border-white/20 overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-white/10">
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pages, actions, jobs..."
                    className="flex-1 bg-transparent text-white placeholder-white/50 outline-none font-bold text-lg"
                  />
                  <kbd className="hidden md:flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono text-white/70">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                  {query === '' && recentSearches.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs text-white/50 font-bold uppercase tracking-wide px-3 py-2">
                        Recent Searches
                      </div>
                      <div ref={resultsRef}>
                        {recentSearches.map((item, index) => (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleRecentSelect(item)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-left transition-colors"
                          >
                            <span className="text-xl">{item.icon}</span>
                            <span className="flex-1 text-white font-bold">{item.title}</span>
                            <span className="text-xs text-white/50">Recent</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {query !== '' && results.length === 0 && (
                    <div className="p-8 text-center">
                      <div className="text-4xl mb-4">🔍</div>
                      <div className="text-white/50 font-bold">No results found</div>
                      <div className="text-white/30 text-sm mt-2">Try a different search term</div>
                    </div>
                  )}

                  {query !== '' && results.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs text-white/50 font-bold uppercase tracking-wide px-3 py-2">
                        Results ({results.length})
                      </div>
                      <div ref={resultsRef}>
                        {results.map((item, index) => (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                              index === selectedIndex
                                ? 'bg-cosmic-neon-cyan/20 border border-cosmic-neon-cyan/50'
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <span className="text-xl">{item.icon}</span>
                            <div className="flex-1">
                              <div className="text-white font-bold">
                                <HighlightText text={item.title} query={query} />
                              </div>
                              {item.description && (
                                <div className="text-xs text-white/50 mt-1">{item.description}</div>
                              )}
                            </div>
                            {index === selectedIndex && (
                              <kbd className="text-xs bg-white/10 border border-white/20 rounded px-2 py-1 font-mono text-white/70">
                                ⏎
                              </kbd>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {query === '' && recentSearches.length === 0 && (
                    <div className="p-8 text-center">
                      <div className="text-4xl mb-4">✨</div>
                      <div className="text-white/50 font-bold mb-2">Start typing to search</div>
                      <div className="text-white/30 text-sm">Try searching for pages, actions, or jobs</div>
                      <div className="mt-6 flex flex-wrap gap-2 justify-center">
                        {searchableItems.slice(0, 4).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white font-bold transition-colors"
                          >
                            {item.icon} {item.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/5">
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-xs font-mono">↑↓</kbd>
                      <span>Navigate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-xs font-mono">⏎</kbd>
                      <span>Select</span>
                    </div>
                  </div>
                  <div className="text-xs text-white/50 font-bold">
                    Press <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded font-mono">ESC</kbd> to close
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

