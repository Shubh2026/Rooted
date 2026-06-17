'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Rooted ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-6">
          <div className="text-5xl">🌿</div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#E8EDE9] mb-2">Something went wrong</h2>
            <p className="text-sm text-[#A3C4B1] max-w-xs mx-auto">
              The forest encountered an unexpected error. Your progress is safe — try refreshing the page.
            </p>
            {this.state.error && (
              <pre className="mt-3 text-[10px] text-red-400/70 max-w-sm overflow-auto text-left bg-red-950/20 p-3 rounded-xl border border-red-900/30">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2 bg-forest-400 text-forest-950 font-bold text-sm rounded-full hover:bg-forest-300 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="px-5 py-2 bg-[#11261D] text-[#A3C4B1] font-bold text-sm rounded-full border border-[#2A4A3A] hover:bg-forest-800 transition-colors cursor-pointer"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
