// src/components/EnvironmentErrorBoundary.tsx
import { ErrorBoundary } from "react-error-boundary";

function ProductionErrorFallback() {
    return (
        <div className="error-fallback-production">
            <h2>We're sorry, something went wrong</h2>
            <p>Our team has been notified and is working on a fix.</p>
            <button onClick={() => window.location.reload()}>
                Refresh page
            </button>
        </div>
    );
}

function DevelopmentErrorFallback({ error, resetErrorBoundary }: {
    error: Error;
    resetErrorBoundary: () => void;
}) {
    return (
        <div className="error-fallback-development">
            <h2>Development Error</h2>
            <pre>{error.stack}</pre>
            <button onClick={resetErrorBoundary}>Reset</button>
        </div>
    );
}

export function EnvironmentErrorBoundary({ children }: { children: React.ReactNode }) {
    const FallbackComponent = process.env.NODE_ENV === 'production'
        ? ProductionErrorFallback
        : DevelopmentErrorFallback;

    return (
        <ErrorBoundary FallbackComponent={FallbackComponent}>
            {children}
        </ErrorBoundary>
    );
}