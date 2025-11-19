import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Ensure root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Simple fallback component in case App fails
function FallbackApp() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'system-ui'
    }}>
      <h1 style={{ color: '#8B5CF6', fontSize: '48px', marginBottom: '20px', fontWeight: 'bold' }}>
        COSMIV
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '10px' }}>
        AI-Powered Gaming Montages
      </p>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Loading application...
      </p>
    </div>
  )
}

// Render with error handling
try {
  // Dynamically import App to catch any import errors
  import('./App').then(({ default: App }) => {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  }).catch((error) => {
    console.error('Failed to import App:', error)
    // Show fallback
    ReactDOM.createRoot(rootElement).render(<FallbackApp />)
  })
} catch (error) {
  console.error('Failed to render app:', error)
  // Fallback: show error message
  ReactDOM.createRoot(rootElement).render(
    <div style={{
      padding: '40px', 
      color: 'white', 
      background: 'black', 
      textAlign: 'center', 
      fontFamily: 'system-ui',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#8B5CF6', marginBottom: '20px', fontSize: '48px' }}>COSMIV</h1>
      <p style={{ fontSize: '18px', marginBottom: '10px' }}>Failed to load application.</p>
      <p style={{ color: '#666', marginTop: '20px', fontSize: '12px' }}>Error: {error.message}</p>
      <button 
        onClick={() => window.location.reload()} 
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: '#8B5CF6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Reload Page
      </button>
    </div>
  )
}



