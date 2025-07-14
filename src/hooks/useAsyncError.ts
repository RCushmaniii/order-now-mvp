// src/hooks/useAsyncError.ts
import { useCallback } from 'react';

export function useAsyncError() {
    const throwError = useCallback((error: Error) => {
        throw error;
    }, []);

    return throwError;
}

// Usage example in components with async operations:
/*
In your React component (TSX file):

function MyComponent() {
    const throwError = useAsyncError();

    const handleAsyncOperation = async () => {
        try {
            const result = await someAsyncFunction();
            // Handle success
        } catch (error) {
            // This will be caught by the error boundary
            throwError(error as Error);
        }
    };

    return <button onClick={handleAsyncOperation}>Do async thing</button>;
}
*/