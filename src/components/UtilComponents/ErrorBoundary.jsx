import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

/**
 * Error Boundary Component to catch React errors
 * This prevents the entire app from crashing and shows a user-friendly error message
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Check if it's React error #300 (hydration/hooks mismatch)
    const isReactError300 = error?.message?.includes?.('Minified React error #300') || 
                            error?.toString?.()?.includes?.('Minified React error #300') ||
                            errorInfo?.componentStack?.includes?.('error #300');
    
    if (isReactError300) {
      // For React error #300, try to recover by forcing a full page reload
      console.warn('React error #300 detected - attempting recovery...');
      // Small delay to allow error boundary to render
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    
    // Log to error reporting service in production
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Reload the page to reset the app state
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Wystąpił błąd
            </h1>
            <p className="text-gray-600 mb-6">
              Przepraszamy, wystąpił nieoczekiwany błąd. Proszę spróbować odświeżyć stronę.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Wróć do strony głównej
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Odśwież stronę
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Szczegóły błędu (tylko w trybie deweloperskim)
                </summary>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Router Error Boundary for React Router errors
 */
export function RouterErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error.status === 404 ? 'Strona nie znaleziona' : 'Błąd'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error.status === 404
              ? 'Strona, której szukasz, nie istnieje.'
              : error.statusText || 'Wystąpił błąd podczas ładowania strony.'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Wróć do strony głównej
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Wystąpił błąd
        </h1>
        <p className="text-gray-600 mb-6">
          {error?.message || 'Nieoczekiwany błąd'}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Wróć do strony głównej
        </button>
      </div>
    </div>
  );
}

export default ErrorBoundary;
