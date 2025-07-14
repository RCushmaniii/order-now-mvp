// src/components/ErrorBoundary.tsx
import { ErrorBoundary } from "react-error-boundary";

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-4">
                        We're sorry, but something unexpected happened. Please try again.
                    </p>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <details className="mb-4 p-3 bg-red-50 rounded-lg">
                        <summary className="cursor-pointer text-sm font-medium text-red-800 mb-2">
                            Error details (development only)
                        </summary>
                        <pre className="text-xs text-red-700 overflow-auto whitespace-pre-wrap">
                            {error.message}
                            {error.stack && (
                                <>
                                    {'\n\n'}
                                    {error.stack}
                                </>
                            )}
                        </pre>
                    </details>
                )}

                <div className="flex space-x-3">
                    <button
                        onClick={resetErrorBoundary}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors transform hover:scale-105 active:scale-95"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        Refresh page
                    </button>
                </div>
            </div>
        </div>
    );
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(error, info) => {
                // Development logging
                console.error('Error caught by boundary:', error);
                console.error('Error info:', info);

                // Production error reporting
                if (process.env.NODE_ENV === 'production') {
                    // Send to error tracking service
                    // Example: Sentry.captureException(error, { extra: info });
                }
            }}
            onReset={() => {
                // Optional: Clear any error-related state
                // You can add custom reset logic here
            }}
        >
            {children}
        </ErrorBoundary>
    );
}