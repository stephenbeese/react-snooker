/**
 * ErrorBoundary component - Error handling wrapper
 */

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-8 m-8 text-center">
          <h2 className="text-red-800 text-xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-red-700 font-mono text-sm break-words">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
