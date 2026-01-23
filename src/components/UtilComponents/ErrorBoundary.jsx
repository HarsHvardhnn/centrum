import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

/**
 * Error Boundary Component to catch React errors
 * This prevents the entire app from crashing and shows a user-friendly error message
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, retryCount: 0 };
    this.retryTimeout = null;
  }

  static getDerivedStateFromError(error) {
    // Check if it's React error #300 (hydration/hooks mismatch)
    const isReactError300 = error?.message?.includes?.('Minified React error #300') || 
                            error?.toString?.()?.includes?.('Minified React error #300') ||
                            error?.message?.includes?.('error #300');
    
    if (isReactError300) {
      // For React error #300, mark for auto-refresh
      const retryCount = parseInt(sessionStorage.getItem('error300_retry') || '0', 10);
      
      // Prevent infinite refresh loop - max 2 retries
      if (retryCount < 2) {
        return { hasError: true, error, shouldAutoRefresh: true, retryCount };
      } else {
        // Too many retries, show error UI
        sessionStorage.removeItem('error300_retry');
        return { hasError: true, error, shouldAutoRefresh: false, retryCount };
      }
    }
    
    // For other errors, show fallback UI
    return { hasError: true, error, shouldAutoRefresh: false };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Check if it's React error #300
    const isReactError300 = error?.message?.includes?.('Minified React error #300') || 
                            error?.toString?.()?.includes?.('Minified React error #300') ||
                            errorInfo?.componentStack?.includes?.('error #300');
    
    if (isReactError300) {
      const retryCount = parseInt(sessionStorage.getItem('error300_retry') || '0', 10);
      
      if (retryCount < 2) {
        sessionStorage.setItem('error300_retry', String(retryCount + 1));
        setTimeout(() => {
          sessionStorage.removeItem('error300_retry');
        }, 30000);
        
        console.warn('React error #300 detected - auto-refreshing page...');
        
        // Auto-refresh immediately
        setTimeout(() => {
          window.location.reload();
        }, 100);
        
        // Set state to show loading UI
        this.setState({
          error,
          errorInfo,
          shouldAutoRefresh: true
        });
        return;
      }
    }
    
    // Log to error reporting service in production
    this.setState({
      error,
      errorInfo,
      shouldAutoRefresh: false
    });
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleReset = () => {
    // Clear retry count
    sessionStorage.removeItem('error300_retry');
    this.setState({ hasError: false, error: null, errorInfo: null, retryCount: 0 });
    // Reload the page to reset the app state
    window.location.href = '/';
  };

  handleAutoRetry = () => {
    // Clear retry count and reload
    sessionStorage.removeItem('error300_retry');
    window.location.reload();
  };

  componentDidMount() {
    // Auto-refresh for React error #300
    if (this.state.shouldAutoRefresh) {
      const retryCount = parseInt(sessionStorage.getItem('error300_retry') || '0', 10);
      if (retryCount < 2) {
        // Already handled in componentDidCatch, but ensure refresh happens
        setTimeout(() => {
          if (!document.hidden) { // Only refresh if page is visible
            window.location.reload();
          }
        }, 200);
      }
    }
    
    // Auto-retry for non-300 errors after a delay
    if (this.state.hasError && this.state.error && !this.state.shouldAutoRefresh) {
      // Auto-retry once after 3 seconds for other errors
      if (this.state.retryCount === 0) {
        this.retryTimeout = setTimeout(() => {
          this.setState(prev => ({ retryCount: prev.retryCount + 1 }));
          window.location.reload();
        }, 3000);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // If it's React error #300 and we should auto-refresh, show minimal UI while refreshing
      if (this.state.shouldAutoRefresh) {
        const retryCount = parseInt(sessionStorage.getItem('error300_retry') || '0', 10);
        if (retryCount < 2) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Przywracanie strony...</p>
              </div>
            </div>
          );
        }
      }
      
      // Custom fallback UI for other errors or after retry limit
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
              Przepraszamy, wystąpił nieoczekiwany błąd. Strona zostanie automatycznie odświeżona za chwilę.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleAutoRetry}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Odśwież teraz
              </button>
              <button
                onClick={this.handleReset}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Wróć do strony głównej
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
  
  // Check if it's React error #300
  const errorMessage = error?.message || error?.toString() || '';
  const isReactError300 = errorMessage.includes('Minified React error #300') || 
                          errorMessage.includes('error #300');
  
  // Auto-refresh for React error #300
  React.useEffect(() => {
    if (isReactError300) {
      const retryCount = parseInt(sessionStorage.getItem('error300_retry') || '0', 10);
      
      if (retryCount < 2) {
        sessionStorage.setItem('error300_retry', String(retryCount + 1));
        setTimeout(() => {
          sessionStorage.removeItem('error300_retry');
        }, 30000);
        
        // Auto-refresh immediately
        window.location.reload();
        return;
      }
    }
  }, [isReactError300]);

  // Show loading UI while refreshing for React error #300
  if (isReactError300) {
    const retryCount = parseInt(sessionStorage.getItem('error300_retry') || '0', 10);
    if (retryCount < 2) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Przywracanie strony...</p>
          </div>
        </div>
      );
    }
  }

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
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Odśwież stronę
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Wróć do strony głównej
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
