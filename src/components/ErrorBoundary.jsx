import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-pure-black text-pure-white">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-display text-gradient-broken">
              Something went wrong
            </h1>
            <p className="text-cosmic-neon-cyan">
              {this.state.error?.message || String(this.state.error) || 'An unexpected error occurred'}
            </p>
            {this.state.error?.stack && (
              <details className="mt-4 text-left max-w-2xl">
                <summary className="cursor-pointer text-pure-white/60 text-sm">Error Details</summary>
                <pre className="mt-2 text-xs text-pure-white/40 overflow-auto bg-black/50 p-4 rounded">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
              }}
              className="px-6 py-3 bg-cosmic-violet rounded-lg hover:glow-neon transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary



