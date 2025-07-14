// src/components/ComponentErrorBoundary.tsx
import { ErrorBoundary } from "react-error-boundary";

interface ComponentErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
    componentName?: string;
}

function SimpleErrorFallback({ resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    return (
        <div style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9'
        }}>
            <p>This component failed to load</p>
            <button onClick={resetErrorBoundary}>Retry</button>
        </div>
    );
}

export function ComponentErrorBoundary({
    children,
    fallback: Fallback = SimpleErrorFallback,
    componentName = 'Component'
}: ComponentErrorBoundaryProps) {
    return (
        <ErrorBoundary
            FallbackComponent={Fallback}
            onError={(error) => {
                console.error(`${componentName} error:`, error);

                // Log component-specific errors
                if (process.env.NODE_ENV === 'production') {
                    // Send to analytics with component context
                    // analytics.track('component_error', {
                    //   component: componentName,
                    //   error: error.message,
                    //   stack: error.stack
                    // });
                }
            }}
        >
            {children}
        </ErrorBoundary>
    );
}