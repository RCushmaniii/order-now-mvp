/**
 * @file src/components/StripeErrorBoundary.tsx
 * @description Handles missing Stripe integration gracefully
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../services/logger';

interface Props {
    children: ReactNode;
}

interface State {
    hasStripeError: boolean;
    stripeLoadFailed: boolean;
}

class StripeErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasStripeError: false,
        stripeLoadFailed: false
    };

    componentDidMount() {
        // Check if Stripe is available
        this.checkStripeAvailability();

        // Listen for script loading errors
        window.addEventListener('error', this.handleResourceError, true);
    }

    componentWillUnmount() {
        window.removeEventListener('error', this.handleResourceError, true);
    }

    checkStripeAvailability = () => {
        // Check if Stripe should be loaded
        const shouldHaveStripe = document.querySelector('script[src*="stripe"]');

        if (shouldHaveStripe && typeof (window as unknown as { Stripe?: unknown }).Stripe === 'undefined') {
            logger.warn('Stripe script tag found but Stripe not loaded', {
                scriptSrc: shouldHaveStripe.getAttribute('src'),
                timestamp: new Date().toISOString()
            });

            // Give it some time to load
            setTimeout(() => {
                if (typeof (window as unknown as { Stripe?: unknown }).Stripe === 'undefined') {
                    this.setState({ stripeLoadFailed: true });
                    logger.error('Stripe failed to load after timeout');
                }
            }, 5000);
        }
    };

    handleResourceError = (event: ErrorEvent) => {
        const target = event.target as HTMLElement;

        // Check if it's a Stripe-related resource
        if (target instanceof HTMLScriptElement && target.src?.includes('stripe')) {
            logger.error('Stripe resource failed to load', {
                src: target.src,
                message: event.message,
                timestamp: new Date().toISOString()
            });

            this.setState({ stripeLoadFailed: true });

            // Prevent the error from bubbling up
            event.preventDefault();
        }
    };

    public static getDerivedStateFromError(error: Error): State {
        if (error.message.includes('Stripe')) {
            return { hasStripeError: true, stripeLoadFailed: true };
        }
        return { hasStripeError: false, stripeLoadFailed: false };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (error.message.includes('Stripe')) {
            logger.error('Stripe integration error caught', {
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack
            });
        }
    }

    public render() {
        if (this.state.hasStripeError || this.state.stripeLoadFailed) {
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="max-w-md w-full bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Payment System Temporarily Unavailable
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                        We're having trouble loading our payment system. This might be due to:
                                    </p>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li>Network connectivity issues</li>
                                        <li>Ad blocker or privacy extensions</li>
                                        <li>Temporary service disruption</li>
                                    </ul>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                                    >
                                        Try reloading the page
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default StripeErrorBoundary;