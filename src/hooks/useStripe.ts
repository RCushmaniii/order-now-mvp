/**
 * @file src/hooks/useStripe.ts
 * @description React hook for using Stripe safely with proper error handling
 */

import { useState, useEffect } from 'react';
import { logger } from '../services/logger';
import { loadStripe } from '../utils/stripeLoader';

interface UseStripeResult {
    stripe: unknown | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Hook for using Stripe safely with comprehensive error handling
 * @returns Object containing stripe instance, loading state, and error state
 */
export function useStripe(): UseStripeResult {
    const [stripe, setStripe] = useState<unknown | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
            logger.warn('Stripe publishable key not configured');
            setError(new Error('Payment system not configured'));
            setLoading(false);
            return;
        }

        loadStripe(publishableKey).then(result => {
            setStripe(result.stripe);
            setError(result.error);
            setLoading(false);

            if (result.error) {
                logger.error('Stripe initialization failed', {
                    error: result.error.message
                });
            } else if (result.stripe) {
                logger.info('Stripe initialized successfully');
            }
        });
    }, []);

    return { stripe, loading, error };
}
