// src/components/LoggingErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../services/logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class LoggingErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error with full context
        logger.error('Unhandled exception in React component', {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
            },
            errorInfo: {
                componentStack: errorInfo.componentStack,
            },
            // Add additional context that might be useful
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
        });
    }

    public render() {
        if (this.state.hasError) {
            // If a custom fallback is provided, use it
            if (this.props.fallback) {
                return <>{this.props.fallback}</>;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="mt-4 text-xl font-semibold text-center text-gray-900">
                            Something went wrong
                        </h1>
                        <p className="mt-2 text-sm text-center text-gray-600">
                            We've encountered an unexpected error. This incident has been logged and we'll look into it.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mt-4 text-xs text-gray-500">
                                <summary className="cursor-pointer">Error details (Development only)</summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                                    {this.state.error.message}
                                    {'\n\n'}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default LoggingErrorBoundary;