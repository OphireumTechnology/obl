import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Ignore third-party wallet / extension connection errors
    if (
      error.message?.includes('MetaMask') ||
      error.message?.includes('Failed to connect to MetaMask') ||
      error.stack?.includes('chrome-extension')
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (
      error.message?.includes('MetaMask') ||
      error.message?.includes('Failed to connect to MetaMask') ||
      error.stack?.includes('chrome-extension')
    ) {
      return;
    }
    console.error('Uncaught React application error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 p-6 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-[#C91432] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Application Notice</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00008F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
