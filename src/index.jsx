import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Ensure root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Render with error handling
try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (error) {
  console.error('Failed to render app:', error)
  // Fallback: show error message
  rootElement.innerHTML = `
    <div style="padding: 40px; color: white; background: black; text-align: center; font-family: system-ui;">
      <h1 style="color: #8B5CF6; margin-bottom: 20px;">COSMIV</h1>
      <p>Failed to load application. Please refresh the page.</p>
      <p style="color: #666; margin-top: 20px; font-size: 12px;">Error: ${error.message}</p>
    </div>
  `
}



