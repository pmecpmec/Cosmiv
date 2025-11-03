import { useEffect, useCallback } from 'react'

/**
 * Custom hook for keyboard shortcuts
 * Supports Command Palette (Cmd+K / Ctrl+K) style shortcuts
 */
export function useKeyboardShortcuts(shortcuts = {}, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event) => {
      // Ignore if typing in input, textarea, or contenteditable
      const isInputFocused = 
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable

      if (isInputFocused) return

      const key = event.key.toLowerCase()
      const ctrlOrCmd = event.ctrlKey || event.metaKey
      const shift = event.shiftKey
      const alt = event.altKey

      // Create key combination string
      let combo = []
      if (ctrlOrCmd) combo.push('ctrl')
      if (alt) combo.push('alt')
      if (shift) combo.push('shift')
      combo.push(key)

      const comboString = combo.join('+')

      // Check for exact match
      if (shortcuts[comboString]) {
        event.preventDefault()
        shortcuts[comboString](event)
        return
      }

      // Check for single key
      if (shortcuts[key] && !ctrlOrCmd && !alt && !shift) {
        event.preventDefault()
        shortcuts[key](event)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts, enabled])
}

/**
 * Hook for command palette (Cmd+K / Ctrl+K)
 */
export function useCommandPalette(onOpen) {
  useKeyboardShortcuts({
    'ctrl+k': (e) => {
      e.preventDefault()
      onOpen()
    },
    'meta+k': (e) => {
      e.preventDefault()
      onOpen()
    },
  })
}

export default useKeyboardShortcuts

