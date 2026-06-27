import { Component } from 'react'
import { isChunkLoadError } from '../lib/lazyWithRetry'

/**
 * Per-window error boundary so a crashed app window doesn't take down the desktop.
 */
export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '', isChunkError: false }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message ?? 'Unknown error',
      isChunkError: isChunkLoadError(error),
    }
  }

  componentDidCatch(error, info) {
    // Silent in production; log in dev
    if (import.meta.env.DEV) {
      console.error('[AppErrorBoundary]', error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 12,
          color: '#636366',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 14,
          padding: 24,
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 32 }}>⚠️</span>
          <p style={{ margin: 0, fontWeight: 600, color: '#1c1c1e' }}>
            {this.state.isChunkError ? 'Update available' : 'This app crashed'}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#8e8e93', maxWidth: 280 }}>
            {this.state.isChunkError
              ? 'A newer version of this site was deployed. Reload to load the latest files.'
              : this.state.errorMessage || 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => {
              if (this.state.isChunkError) {
                window.location.reload()
                return
              }
              this.setState({ hasError: false, errorMessage: '', isChunkError: false })
            }}
            style={{
              marginTop: 8,
              padding: '6px 20px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.12)',
              background: '#f2f2f7',
              color: '#1c1c1e',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {this.state.isChunkError ? 'Reload' : 'Retry'}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
