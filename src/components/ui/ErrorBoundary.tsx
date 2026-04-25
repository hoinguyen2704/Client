import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import i18n from '@/i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {i18n.t('errorBoundary.title', { ns: 'common' })}
              </h2>
              <p className="text-muted text-md">
                {i18n.t('errorBoundary.description', { ns: 'common' })}
              </p>
            </div>
            {this.state.error && (
              <details className="text-left bg-slate-100 dark:bg-slate-900 rounded-xl p-4 text-sm text-muted">
                <summary className="cursor-pointer font-medium mb-2">
                  {i18n.t('errorBoundary.details', { ns: 'common' })}
                </summary>
                <pre className="overflow-auto whitespace-pre-wrap">{this.state.error.message}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
            >
              {i18n.t('errorBoundary.reload', { ns: 'common' })}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
