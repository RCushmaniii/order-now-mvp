/**
 * @file src/examples/loggingExamples.ts
 * @description Logging integration examples and patterns for YapaNow components
 * @author YapaNow Development Team
 * @created 2025-01-19
 * 
 * This file serves as a reference guide for implementing logging throughout the application.
 * It demonstrates best practices and common patterns for different scenarios.
 * 
 * DO NOT IMPORT THIS FILE IN PRODUCTION CODE - It's for reference only.
 * Copy and adapt the patterns shown here into your actual components.
 */

import { logger } from '../services/logger';

/**
 * ============================================
 * SECTION 1: PAGE COMPONENT LOGGING PATTERNS
 * ============================================
 * Shows how to add logging to page-level components
 */

/**
 * Example: Order page with comprehensive logging
 * File location: src/pages/OrderPage.tsx
 */
export const orderPageLoggingPattern = {
    /**
     * Log page views with relevant context
     * Use 'info' level for important user navigation events
     */
    logPageView: (storeId: string) => {
        logger.info('Order page viewed', {
            storeId,
            timestamp: new Date().toISOString(),
            referrer: document.referrer,
            // Only log non-sensitive browser info
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });
    },

    /**
     * Log user interactions with cart
     * Use 'debug' level for detailed interaction tracking
     */
    logCartInteraction: (action: 'add' | 'remove' | 'update', item: { id: string; name: string; price: number; quantity: number }) => {
        logger.debug('Cart interaction', {
            action,
            itemId: item.id,
            itemName: item.name,
            price: item.price,
            quantity: item.quantity,
            // Calculate the impact on cart total
            valueChange: action === 'remove' ? -item.price * item.quantity : item.price * item.quantity
        });
    },

    /**
     * Log order submission with error handling
     * Demonstrates the withErrorLogging wrapper pattern
     */
    submitOrderWithLogging: async (orderData: { storeId: string; items: unknown[]; total: number; paymentMethod: string }) => {
        try {
            const startTime = performance.now();

            // Log the attempt
            logger.info('Order submission started', {
                storeId: orderData.storeId,
                itemCount: orderData.items.length,
                totalAmount: orderData.total,
                // Don't log sensitive payment details
                paymentMethod: orderData.paymentMethod
            });

            // Simulate order processing
            const result = await processOrder(orderData);

            // Log success with performance metrics
            logger.info('Order submitted successfully', {
                orderId: result.orderId,
                processingTime: performance.now() - startTime,
                // Include business metrics
                averageItemPrice: orderData.total / orderData.items.length
            });

            return result;
        } catch (error) {
            logger.error('Order submission failed', {
                storeId: orderData.storeId,
                error: error instanceof Error ? error.message : 'Unknown error',
                component: 'OrderPage',
                operation: 'submitOrder'
            });
            throw error;
        }
    }
};

/**
 * ============================================
 * SECTION 2: SERVICE INTEGRATION LOGGING
 * ============================================
 * Patterns for external service integrations
 */

/**
 * WhatsApp integration logging patterns
 * File location: src/services/whatsapp.ts
 */
export const whatsAppLoggingPatterns = {
    /**
     * Log outgoing WhatsApp messages
     * Include message metadata but not content
     */
    sendMessage: async (orderData: { orderId: string; customerPhone: string }) => {
        const correlationId = generateCorrelationId();

        logger.info('WhatsApp message queued', {
            correlationId,
            orderId: orderData.orderId,
            recipientPhone: maskPhoneNumber(orderData.customerPhone),
            messageType: 'order_confirmation',
            queueTime: new Date().toISOString()
        });

        try {
            const result = await sendWhatsAppMessage(orderData);

            logger.info('WhatsApp message sent', {
                correlationId,
                messageId: result.messageId,
                deliveryStatus: result.status,
                provider: 'twilio', // or your provider
                sendTime: new Date().toISOString()
            });

            return result;
        } catch (error) {
            logger.error('WhatsApp send failed', {
                correlationId,
                orderId: orderData.orderId,
                error: error instanceof Error ? error.message : 'Unknown error',
                // Include retry information
                willRetry: true,
                retryAfter: 60 // seconds
            });
            throw error;
        }
    },

    /**
     * Log incoming webhook events
     * Handle different event types appropriately
     */
    handleWebhook: (event: { id: string; type: string; messageId: string; timestamp: string; error?: { code: string; message: string; permanent?: boolean }; recipient?: string }) => {
        const baseContext = {
            eventId: event.id,
            eventType: event.type,
            messageId: event.messageId,
            timestamp: event.timestamp
        };

        switch (event.type) {
            case 'delivered':
                // Use debug for routine events
                logger.debug('WhatsApp message delivered', baseContext);
                break;

            case 'read':
                // Track engagement metrics
                logger.debug('WhatsApp message read', {
                    ...baseContext,
                    timeToRead: calculateTimeToRead(event)
                });
                break;

            case 'failed':
                // Always log failures as errors
                logger.error('WhatsApp delivery failed', {
                    ...baseContext,
                    errorCode: event.error?.code,
                    errorMessage: event.error?.message,
                    recipientPhone: maskPhoneNumber(event.recipient || 'unknown'),
                    // Include actionable information
                    requiresManualIntervention: event.error?.permanent === true
                });
                break;
        }
    }
};

/**
 * ============================================
 * SECTION 3: PERFORMANCE MONITORING
 * ============================================
 * Track and log performance metrics
 */

/**
 * Performance monitoring utilities
 * Use these patterns to identify bottlenecks
 */
export const performanceLogging = {
    /**
     * Custom hook to monitor component render performance
     * File location: src/hooks/usePerformanceLogging.ts
     */
    useRenderPerformance: (componentName: string, threshold = 16.67) => {
        // Tracks render time and logs slow renders
        const renderStart = performance.now();

        // Use in useEffect cleanup
        return () => {
            const renderTime = performance.now() - renderStart;

            if (renderTime > threshold) {
                logger.warn('Slow render detected', {
                    component: componentName,
                    renderTime: Math.round(renderTime * 100) / 100, // Round to 2 decimals
                    threshold,
                    // Help identify the cause
                    exceedBy: Math.round((renderTime - threshold) * 100) / 100
                });
            }
        };
    },

    /**
     * Wrap API calls with performance tracking
     * Automatically logs slow responses
     */
    trackApiPerformance: async (
        url: string,
        options?: RequestInit,
        slowThreshold = 1000
    ) => {
        const startTime = performance.now();
        const method = options?.method || 'GET';

        try {
            logger.debug('API request started', { url, method });

            const response = await fetch(url, options);
            const duration = performance.now() - startTime;

            // Log based on performance
            const logData = {
                url,
                method,
                status: response.status,
                duration: Math.round(duration),
                slow: duration > slowThreshold
            };

            if (duration > slowThreshold) {
                logger.warn('Slow API response', logData);
            } else {
                logger.debug('API request completed', logData);
            }

            return response;
        } catch (error) {
            const duration = performance.now() - startTime;

            logger.error('API request failed', {
                url,
                method,
                duration: Math.round(duration),
                error: error instanceof Error ? error.message : 'Unknown error',
                // Network errors vs server errors
                networkError: !navigator.onLine
            });

            throw error;
        }
    }
};

/**
 * ============================================
 * SECTION 4: USER BEHAVIOR ANALYTICS
 * ============================================
 * Track user interactions for business insights
 */

/**
 * Analytics logging patterns
 * Use these to understand user behavior
 */
export const analyticsLogging = {
    /**
     * Track generic events with consistent structure
     */
    trackEvent: (
        category: string,
        action: string,
        label?: string,
        value?: number
    ) => {
        logger.info('Analytics event', {
            category,
            action,
            label,
            value,
            // Add session context
            sessionId: getSessionId(),
            timestamp: new Date().toISOString(),
            // Track user journey
            pageDepth: getPageDepth()
        });
    },

    /**
     * Track e-commerce specific events
     */
    trackEcommerce: {
        viewProduct: (product: { id: string; name: string; category: string; price: number; inventory: number }) => {
            logger.info('Product viewed', {
                event: 'view_item',
                productId: product.id,
                productName: product.name,
                category: product.category,
                price: product.price,
                // Business metrics
                inStock: product.inventory > 0,
                viewSource: document.referrer ? 'external' : 'internal'
            });
        },

        addToCart: (product: { id: string; name: string; price: number }, quantity: number) => {
            logger.info('Add to cart', {
                event: 'add_to_cart',
                productId: product.id,
                productName: product.name,
                quantity,
                value: product.price * quantity,
                // Track cart state
                cartItemCount: getCurrentCartCount() + 1,
                cartValue: getCurrentCartValue() + (product.price * quantity)
            });
        },

        checkout: (cart: { items: unknown[]; total: number; promoCode?: string; isGuest?: boolean }) => {
            logger.info('Checkout initiated', {
                event: 'begin_checkout',
                itemCount: cart.items.length,
                totalValue: cart.total,
                // Useful business metrics
                averageItemValue: cart.total / cart.items.length,
                hasPromoCode: !!cart.promoCode,
                checkoutMethod: cart.isGuest ? 'guest' : 'user'
            });
        }
    }
};

/**
 * ============================================
 * SECTION 5: ERROR RECOVERY PATTERNS
 * ============================================
 * Advanced error handling with logging
 */

/**
 * Retry logic with comprehensive logging
 */
export const errorRecoveryPatterns = {
    /**
     * Retry failed operations with exponential backoff
     * Logs each attempt and final outcome
     */
    retryWithLogging: async <T>(
        operation: () => Promise<T>,
        options: {
            maxRetries?: number;
            backoffMs?: number;
            context?: Record<string, unknown>;
        } = {}
    ): Promise<T> => {
        const { maxRetries = 3, backoffMs = 1000, context = {} } = options;
        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 1) {
                    logger.debug('Retrying operation', {
                        attempt,
                        maxRetries,
                        previousError: lastError!.message,
                        ...context
                    });
                }

                return await operation();
            } catch (error) {
                lastError = error as Error;

                const isLastAttempt = attempt === maxRetries;
                const nextDelay = Math.min(backoffMs * Math.pow(2, attempt - 1), 30000); // Cap at 30s

                logger.warn('Operation failed', {
                    attempt,
                    maxRetries,
                    error: lastError.message,
                    willRetry: !isLastAttempt,
                    nextRetryIn: isLastAttempt ? null : nextDelay,
                    ...context
                });

                if (!isLastAttempt) {
                    await new Promise(resolve => setTimeout(resolve, nextDelay));
                }
            }
        }

        logger.error('Operation failed after all retries', {
            totalAttempts: maxRetries,
            finalError: lastError!.message,
            ...context
        });

        throw lastError!;
    },

    /**
     * Circuit breaker pattern with logging
     * Prevents cascading failures
     */
    createCircuitBreaker: (
        name: string,
        options: {
            failureThreshold?: number;
            resetTimeMs?: number;
        } = {}
    ) => {
        const { failureThreshold = 5, resetTimeMs = 60000 } = options;
        let failures = 0;
        let lastFailureTime = 0;
        let state: 'closed' | 'open' | 'half-open' = 'closed';

        return async <T>(operation: () => Promise<T>): Promise<T> => {
            // Check if circuit should be reset
            if (state === 'open' && Date.now() - lastFailureTime > resetTimeMs) {
                state = 'half-open';
                logger.info('Circuit breaker half-open', { name, failures });
            }

            if (state === 'open') {
                const error = new Error(`Circuit breaker is open for ${name}`);
                logger.warn('Circuit breaker rejected request', {
                    name,
                    state,
                    failures,
                    timeUntilReset: resetTimeMs - (Date.now() - lastFailureTime)
                });
                throw error;
            }

            try {
                const result = await operation();

                if (state === 'half-open') {
                    state = 'closed';
                    failures = 0;
                    logger.info('Circuit breaker closed', { name });
                }

                return result;
            } catch (error) {
                failures++;
                lastFailureTime = Date.now();

                if (failures >= failureThreshold) {
                    state = 'open';
                    logger.error('Circuit breaker opened', {
                        name,
                        failures,
                        threshold: failureThreshold,
                        willResetAt: new Date(Date.now() + resetTimeMs).toISOString()
                    });
                }

                throw error;
            }
        };
    }
};

/**
 * ============================================
 * UTILITY FUNCTIONS
 * ============================================
 * Helper functions used in the examples above
 */

// Generate unique correlation IDs for tracking related events
function generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Mask sensitive data for logging
function maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 4) return '***';
    return `${phone.substring(0, 3)}***${phone.substring(phone.length - 2)}`;
}

// Calculate time between message sent and read
function calculateTimeToRead(event: { timestamp: string; sentAt?: string }): number {
    // Implementation depends on your event structure
    if (event.sentAt) {
        return new Date(event.timestamp).getTime() - new Date(event.sentAt).getTime();
    }
    return 0;
}

// Session tracking utilities (implement based on your needs)
function getSessionId(): string {
    // Implement session tracking
    return 'session-' + Date.now();
}

function getPageDepth(): number {
    // Track how deep user is in the flow
    return window.history.length;
}

function getCurrentCartCount(): number {
    // Get from your state management
    return 0;
}

function getCurrentCartValue(): number {
    // Get from your state management
    return 0;
}

// Placeholder for actual implementations
async function processOrder(orderData: { storeId: string; items: unknown[]; total: number }): Promise<{ orderId: string }> {
    // Your actual order processing logic
    console.log('Processing order for store:', orderData.storeId, 'with total:', orderData.total);
    return { orderId: 'ORD-' + Date.now() };
}

async function sendWhatsAppMessage(orderData: { orderId: string; customerPhone: string }): Promise<{ messageId: string; status: string }> {
    // Your actual WhatsApp sending logic
    console.log('Sending WhatsApp message for order:', orderData.orderId, 'to:', orderData.customerPhone);
    return { messageId: 'MSG-' + Date.now(), status: 'sent' };
}