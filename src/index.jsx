import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerServiceWorker } from './utils/registerServiceWorker'
import { initPerformanceOptimizations } from './utils/performance'

// Initialize performance optimizations (with error handling)
try {
  initPerformanceOptimizations()
} catch (error) {
  console.error('Failed to initialize performance optimizations:', error)
}

// Render app with error boundary
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error)
  rootElement.innerHTML = '<div style="padding: 20px; color: white; background: black;">Error loading application. Please refresh the page.</div>'
}

// Register service worker for PWA (with error handling)
try {
  registerServiceWorker()
} catch (error) {
  console.error('Failed to register service worker:', error)
}

