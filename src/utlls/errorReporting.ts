// src/utils/errorReporting.ts
interface ErrorInfo {
    componentStack: string;
    errorBoundary?: string;
}

export function reportError(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'production') {
        // Sentry example
        // Sentry.captureException(error, {
        //   extra: errorInfo,
        //   tags: {
        //     section: 'error_boundary'
        //   }
        // });

        // Custom API example
        // fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     message: error.message,
        //     stack: error.stack,
        //     componentStack: errorInfo.componentStack,
        //     timestamp: new Date().toISOString(),
        //     userAgent: navigator.userAgent,
        //     url: window.location.href
        //   })
        // });
    }
}