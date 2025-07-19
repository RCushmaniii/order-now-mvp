/**
 * @file src/utils/stripeLoader.ts
 * @description Safe Stripe loading utility with proper TypeScript typing
 */

import { logger } from '../services/logger';

// Extend Window interface for Stripe without conflicts
declare global {
    interface Window {
        StripeLoader?: (key: string) => unknown;
    }
}

// Use unknown for Stripe to avoid type conflicts
interface StripeLoadResult {
    stripe: unknown | null;
    error: Error | null;
}

export async function loadStripe(publishableKey: string): Promise<StripeLoadResult> {
    try {
        // Check if Stripe is already loaded
        if (typeof (window as unknown as { Stripe?: (key: string) => unknown }).Stripe !== 'undefined') {
            logger.debug('Stripe already loaded');
            const stripeConstructor = (window as unknown as { Stripe: (key: string) => unknown }).Stripe;
            return {
                stripe: stripeConstructor(publishableKey),
                error: null
            };
        }

        // Try to load Stripe dynamically
        logger.debug('Loading Stripe dynamically');

        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;

            script.onload = () => {
                logger.info('Stripe loaded successfully');
                const stripeConstructor = (window as unknown as { Stripe?: (key: string) => unknown }).Stripe;
                if (stripeConstructor) {
                    resolve({
                        stripe: stripeConstructor(publishableKey),
                        error: null
                    });
                } else {
                    resolve({
                        stripe: null,
                        error: new Error('Stripe failed to initialize')
                    });
                }
            };

            script.onerror = (error) => {
                logger.error('Failed to load Stripe', { error });
                resolve({
                    stripe: null,
                    error: new Error('Failed to load Stripe payment system')
                });
            };

            document.head.appendChild(script);
        });
    } catch (error) {
        logger.error('Error in loadStripe', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return {
            stripe: null,
            error: error instanceof Error ? error : new Error('Unknown error loading Stripe')
        };
    }
}
