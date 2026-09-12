// src/components/ErrorBoundary.jsx
import React, { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] mb-4">
            <AlertCircle size={22} strokeWidth={2} />
          </div>
          <h2 className="font-heading font-bold text-lg text-text-1 mb-1">
            Something went wrong
          </h2>
          <p className="text-sm text-text-3 max-w-md mb-6 leading-relaxed">
            We encountered an unexpected issue while loading this section. You can try refreshing or returning to the home page.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-all duration-150 active:scale-95 shadow-sm"
            >
              <RefreshCw size={14} strokeWidth={2} />
              Try again
            </button>
            <a
              href="/home"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border text-text-2 text-sm font-semibold rounded-lg hover:bg-surface-2 transition-all duration-150"
            >
              <Home size={14} strokeWidth={2} />
              Back to Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

