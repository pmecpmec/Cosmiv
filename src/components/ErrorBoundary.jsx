import { Component } from 'react'
import { useToast } from '../contexts/ToastContext'

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

function ErrorFallback({ error, errorInfo, onReset }) {
  return (
    <div className="min-h-screen bg-pure-black text-pure-white flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full broken-planet-card rounded-2xl p-8 border-2 border-red-500">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-black gradient-text-cosmic mb-4 tracking-poppr">
            S O M E T H I N G   W E N T   W R O N G
          </h2>
          <p className="text-pure-white/70 font-bold tracking-wide mb-6">
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-pure-black/50 border border-red-500/50 rounded">
            <p className="text-red-400 font-black text-sm mb-2 tracking-wide uppercase">
              Error Details:
            </p>
            <p className="text-pure-white/80 font-bold text-xs font-mono break-all">
              {error.toString()}
            </p>
          </div>
        )}

        {process.env.NODE_ENV === 'development' && errorInfo && (
          <details className="mb-6 p-4 bg-pure-black/50 border border-white/20 rounded">
            <summary className="text-pure-white/70 font-black text-sm cursor-pointer tracking-wide uppercase mb-2">
              Stack Trace (Dev Only)
            </summary>
            <pre className="text-pure-white/60 text-xs font-mono overflow-auto max-h-64">
              {errorInfo.componentStack}
            </pre>
          </details>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white font-black border-2 border-cosmic-neon-cyan/50 hover:neon-glow-cyan transition-all tracking-wide neon-glow"
          >
            T R Y   A G A I N
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-pure-black border-2 border-pure-white/30 hover:border-pure-white/50 text-pure-white font-black transition-all tracking-wide"
          >
            G O   H O M E
          </button>
        </div>
      </div>
    </div>
  )
}

// Export a wrapper that uses Toast (if available)
export default function ErrorBoundary({ children }) {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>
}

