// src/components/ui/LoadingSpinner.tsx
// Optimized loading spinner component with performance improvements and comprehensive error handling

import React, { memo, useEffect, useState, useRef } from 'react';

/**
 * Props interface for the LoadingSpinner component
 */
interface LoadingSpinnerProps {
    /** Custom loading message to display */
    message?: string;
    /** Size variant for the spinner */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Color theme for the spinner */
    color?: 'blue' | 'green' | 'red' | 'gray' | 'purple';
    /** Whether to show the full-screen overlay */
    fullScreen?: boolean;
    /** Custom CSS classes for additional styling */
    className?: string;
    /** Timeout in milliseconds after which to show fallback */
    timeout?: number;
    /** Callback function when timeout is reached */
    onTimeout?: () => void;
    /** Whether to show a progress indicator */
    showProgress?: boolean;
    /** Current progress percentage (0-100) */
    progress?: number;
    /** Accessibility label for screen readers */
    ariaLabel?: string;
    /** Test ID for testing purposes */
    testId?: string;
    /** Whether to reduce motion for accessibility */
    reduceMotion?: boolean;
}

/**
 * Size configuration mapping for spinner dimensions
 */
const SIZE_CONFIG = {
    sm: { spinner: 'h-4 w-4', text: 'text-sm' },
    md: { spinner: 'h-8 w-8', text: 'text-base' },
    lg: { spinner: 'h-12 w-12', text: 'text-lg' },
    xl: { spinner: 'h-16 w-16', text: 'text-xl' }
} as const;

/**
 * Color configuration mapping for spinner themes
 */
const COLOR_CONFIG = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    gray: 'border-gray-600',
    purple: 'border-purple-600'
} as const;

/**
 * Default timeout duration in milliseconds
 */
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Optimized LoadingSpinner component with comprehensive error handling and accessibility features
 * 
 * Features:
 * - Performance optimized with React.memo
 * - Configurable size, color, and timeout
 * - Accessibility compliant with ARIA labels and reduced motion support
 * - Timeout handling with fallback messaging
 * - Progress indicator support
 * - Error boundary compatible
 * 
 * @param props - LoadingSpinner configuration props
 * @returns Memoized loading spinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
    message = 'Loading...',
    size = 'lg',
    color = 'blue',
    fullScreen = true,
    className = '',
    timeout = DEFAULT_TIMEOUT,
    onTimeout,
    showProgress = false,
    progress = 0,
    ariaLabel,
    testId = 'loading-spinner',
    reduceMotion = false
}) => {
    // ==================== STATE MANAGEMENT ====================

    /** Track if component has timed out */
    const [hasTimedOut, setHasTimedOut] = useState(false);

    /** Track if user prefers reduced motion */
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(reduceMotion);

    /** Ref to store timeout ID for cleanup */
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    /** Ref to track if component is mounted */
    const isMountedRef = useRef(true);

    // ==================== EFFECTS ====================

    /**
     * Effect to detect user's motion preferences and set up timeout
     */
    useEffect(() => {
        // Check for reduced motion preference
        try {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            setPrefersReducedMotion(mediaQuery.matches || reduceMotion);

            // Listen for changes in motion preference
            const handleChange = (e: MediaQueryListEvent) => {
                if (isMountedRef.current) {
                    setPrefersReducedMotion(e.matches || reduceMotion);
                }
            };

            mediaQuery.addEventListener('change', handleChange);

            // Cleanup listener
            return () => {
                mediaQuery.removeEventListener('change', handleChange);
            };
        } catch (error) {
            // Fallback if matchMedia is not supported
            console.warn('LoadingSpinner: matchMedia not supported, using fallback', error);
            setPrefersReducedMotion(reduceMotion);
        }
    }, [reduceMotion]);

    /**
     * Effect to handle timeout functionality
     */
    useEffect(() => {
        // Only set timeout if specified and greater than 0
        if (timeout > 0) {
            timeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                    setHasTimedOut(true);

                    // Call timeout callback if provided
                    if (onTimeout) {
                        try {
                            onTimeout();
                        } catch (error) {
                            console.error('LoadingSpinner: Error in onTimeout callback', error);
                        }
                    } else {
                        // Default timeout handling - log warning
                        console.warn(`LoadingSpinner: Component timed out after ${timeout}ms without onTimeout handler`);
                    }
                }
            }, timeout);
        }

        // Cleanup timeout on unmount
        return () => {
            isMountedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [timeout, onTimeout]);

    // ==================== COMPUTED VALUES ====================

    /**
     * Get size configuration based on size prop
     */
    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    /**
     * Get color configuration based on color prop
     */
    const colorConfig = COLOR_CONFIG[color] || COLOR_CONFIG.blue;

    /**
     * Generate spinner animation classes
     */
    const spinnerClasses = [
        'rounded-full border-2 border-t-transparent',
        sizeConfig.spinner,
        colorConfig,
        // Conditional animation based on motion preference
        prefersReducedMotion ? 'animate-pulse' : 'animate-spin'
    ].join(' ');

    /**
     * Generate container classes for layout
     */
    const containerClasses = [
        fullScreen ? 'min-h-screen' : 'min-h-32',
        'bg-gray-50 flex items-center justify-center',
        'transition-opacity duration-300',
        className
    ].join(' ');

    /**
     * Generate accessible aria label
     */
    const accessibleLabel = ariaLabel || `Loading: ${message}`;

    /**
     * Validate progress prop
     */
    const validProgress = Math.max(0, Math.min(100, progress || 0));

    // ==================== TIMEOUT HANDLING ====================

    /**
     * Render timeout fallback UI
     */
    if (hasTimedOut) {
        return (
            <div className={containerClasses} data-testid={`${testId}-timeout`}>
                <div className="text-center p-6 max-w-md">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl" role="img" aria-label="Warning">⚠️</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Taking longer than expected
                    </h3>
                    <p className="text-gray-600 mb-4">
                        This is taking longer than usual. Please check your connection or try again.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        aria-label="Reload page"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    // ==================== MAIN RENDER ====================

    return (
        <div
            className={containerClasses}
            role="status"
            aria-live="polite"
            aria-label={accessibleLabel}
            data-testid={testId}
        >
            <div className="text-center">
                {/* Main Spinner */}
                <div
                    className={spinnerClasses}
                    aria-hidden="true"
                />

                {/* Loading Message */}
                <p className={`text-gray-600 mt-4 ${sizeConfig.text}`}>
                    {message}
                </p>

                {/* Progress Indicator (Optional) */}
                {showProgress && (
                    <div className="w-64 bg-gray-200 rounded-full h-2 mt-4">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${colorConfig.replace('border-', 'bg-')}`}
                            style={{ width: `${validProgress}%` }}
                            role="progressbar"
                            aria-valuenow={validProgress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Loading progress: ${validProgress}%`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {validProgress}% complete
                        </p>
                    </div>
                )}

                {/* Reduced Motion Alternative */}
                {prefersReducedMotion && (
                    <p className="text-xs text-gray-500 mt-2">
                        Reduced motion mode active
                    </p>
                )}
            </div>
        </div>
    );
});

// Set display name for debugging
LoadingSpinner.displayName = 'LoadingSpinner';

// ==================== UTILITY COMPONENTS ====================

/**
 * Lightweight spinner for inline use
 */
export const InlineSpinner: React.FC<Pick<LoadingSpinnerProps, 'size' | 'color' | 'className'>> = memo(({
    size = 'sm',
    color = 'blue',
    className = ''
}) => {
    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.sm;
    const colorConfig = COLOR_CONFIG[color] || COLOR_CONFIG.blue;

    return (
        <div
            className={`animate-spin rounded-full border-2 border-t-transparent ${sizeConfig.spinner} ${colorConfig} ${className}`}
            role="status"
            aria-label="Loading"
            aria-hidden="true"
        />
    );
});

InlineSpinner.displayName = 'InlineSpinner';

/**
 * Button spinner for loading states in buttons
 */
export const ButtonSpinner: React.FC<{ className?: string }> = memo(({ className = '' }) => {
    return (
        <div
            className={`animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ${className}`}
            role="status"
            aria-label="Loading"
            aria-hidden="true"
        />
    );
});

ButtonSpinner.displayName = 'ButtonSpinner';

// ==================== HOOKS ====================

/**
 * Custom hook for managing loading states with timeout
 */
export const useLoadingWithTimeout = (
    initialLoading: boolean = false,
    timeoutMs: number = DEFAULT_TIMEOUT
) => {
    const [loading, setLoading] = useState(initialLoading);
    const [timedOut, setTimedOut] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const startLoading = () => {
        setLoading(true);
        setTimedOut(false);

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            setTimedOut(true);
        }, timeoutMs);
    };

    const stopLoading = () => {
        setLoading(false);
        setTimedOut(false);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        loading,
        timedOut,
        startLoading,
        stopLoading
    };
};

// ==================== ERROR BOUNDARY INTEGRATION ====================

/**
 * Error boundary fallback component with loading spinner theme
 */
export const LoadingErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = memo(({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-6 max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl" role="img" aria-label="Error">❌</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Something went wrong
                </h3>
                <p className="text-gray-600 mb-4">
                    {error.message || 'An unexpected error occurred while loading.'}
                </p>
                <button
                    onClick={resetErrorBoundary}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                    aria-label="Try again"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
});

LoadingErrorFallback.displayName = 'LoadingErrorFallback';

// ==================== EXPORTS ====================

export default LoadingSpinner;

// Type exports for external use
export type { LoadingSpinnerProps };

// ==================== EXAMPLE USAGE ====================

/*
// Basic usage
<LoadingSpinner message="Loading your order..." />

// With progress
<LoadingSpinner 
  message="Processing payment..." 
  showProgress={true}
  progress={75}
  color="green"
/>

// With timeout handling
<LoadingSpinner 
  message="Connecting to server..."
  timeout={10000}
  onTimeout={() => console.log('Connection timeout')}
/>

// Inline usage
<InlineSpinner size="sm" color="blue" />

// In buttons
<button disabled={loading}>
  {loading ? <ButtonSpinner /> : 'Submit'}
</button>

// With custom hook
const { loading, timedOut, startLoading, stopLoading } = useLoadingWithTimeout();

// Error boundary integration
<ErrorBoundary FallbackComponent={LoadingErrorFallback}>
  <YourComponent />
</ErrorBoundary>
*/