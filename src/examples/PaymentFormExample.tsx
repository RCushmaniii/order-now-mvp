/**
 * @file src/examples/PaymentFormExample.tsx
 * @description Example implementation of Stripe integration with error boundaries
 * @author YapaNow Development Team
 * 
 * This file demonstrates how to properly integrate Stripe payments with
 * the StripeErrorBoundary and useStripe hook for robust error handling.
 * 
 * DO NOT IMPORT THIS FILE IN PRODUCTION CODE - It's for reference only.
 * Copy and adapt the patterns shown here into your actual payment components.
 */

import React, { useState } from 'react';
import StripeErrorBoundary from '../components/StripeErrorBoundary';
import { useStripe } from '../hooks/useStripe';
import { logger } from '../services/logger';

/**
 * Example payment form component with comprehensive error handling
 * Demonstrates proper Stripe integration patterns
 */
function PaymentFormExample() {
  const { stripe, loading, error } = useStripe();
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#17c076]"></div>
          <span className="text-gray-600">Loading payment system...</span>
        </div>
      </div>
    );
  }

  // Handle Stripe initialization errors
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Payment System Unavailable</h3>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
            <div className="mt-3">
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Try reloading the page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!stripe) {
      logger.error('Stripe not initialized for payment');
      return;
    }

    setProcessing(true);
    logger.info('Payment process started');

    try {
      // Example payment processing logic
      // In a real implementation, you would:
      // 1. Create payment intent on your server
      // 2. Confirm payment with Stripe
      // 3. Handle the result

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      setPaymentStatus('success');
      logger.info('Payment completed successfully');

    } catch (error) {
      setPaymentStatus('error');
      logger.error('Payment failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <StripeErrorBoundary>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>

        {/* Payment Status Messages */}
        {paymentStatus === 'success' && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-medium">Payment successful!</span>
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-red-800 font-medium">Payment failed. Please try again.</span>
            </div>
          </div>
        )}

        {/* Payment Form */}
        <div className="space-y-4">
          {/* Card Element Placeholder */}
          <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">
              Card element would be rendered here using Stripe Elements
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>$25.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>$2.50</span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>$27.50</span>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={processing || paymentStatus === 'success'}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              processing || paymentStatus === 'success'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#17c076] hover:bg-[#14a366] text-white'
            }`}
          >
            {processing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : paymentStatus === 'success' ? (
              'Payment Complete'
            ) : (
              'Pay $27.50'
            )}
          </button>
        </div>

        {/* Development Info */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs font-semibold text-yellow-800 mb-1">Development Mode</p>
            <p className="text-xs text-yellow-700">
              This is a demo payment form. Stripe integration status: {stripe ? 'Ready' : 'Not loaded'}
            </p>
          </div>
        )}
      </div>
    </StripeErrorBoundary>
  );
}

export default PaymentFormExample;

/*
 * ============================================
 * INTEGRATION PATTERNS
 * ============================================
 * 
 * 1. BASIC USAGE:
 * 
 * import StripeErrorBoundary from '../components/StripeErrorBoundary';
 * import { useStripe } from '../hooks/useStripe';
 * 
 * function MyPaymentComponent() {
 *   const { stripe, loading, error } = useStripe();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return (
 *     <StripeErrorBoundary>
 *       // Your payment form
 *     </StripeErrorBoundary>
 *   );
 * }
 * 
 * 2. WITH CONDITIONAL RENDERING:
 * 
 * function ConditionalPayment({ showPayment }) {
 *   const { stripe, loading, error } = useStripe();
 *   
 *   if (!showPayment) return <div>Payment not required</div>;
 *   
 *   return (
 *     <StripeErrorBoundary>
 *       {loading ? (
 *         <PaymentSkeleton />
 *       ) : error ? (
 *         <PaymentError error={error} />
 *       ) : (
 *         <PaymentForm stripe={stripe} />
 *       )}
 *     </StripeErrorBoundary>
 *   );
 * }
 * 
 * 3. WITH LOGGING INTEGRATION:
 * 
 * import { logger } from '../services/logger';
 * 
 * function PaymentWithLogging() {
 *   const { stripe, loading, error } = useStripe();
 *   
 *   useEffect(() => {
 *     if (error) {
 *       logger.error('Stripe initialization failed', {
 *         error: error.message,
 *         component: 'PaymentWithLogging'
 *       });
 *     } else if (stripe) {
 *       logger.info('Stripe ready for payments');
 *     }
 *   }, [stripe, error]);
 *   
 *   return (
 *     <StripeErrorBoundary>
 *       // Payment component
 *     </StripeErrorBoundary>
 *   );
 * }
 */
