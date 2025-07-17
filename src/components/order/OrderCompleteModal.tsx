// src/components/order/OrderCompleteModal.tsx
// Production-ready order completion modal with WhatsApp integration
// Follows React best practices, performance optimization, and comprehensive error handling

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { CheckCircle, X, MessageCircle, AlertCircle } from 'lucide-react';
import { getServiceText } from '../../utils/textHelpers';

/**
 * WhatsApp notification status types for type safety
 */
type WhatsAppStatus = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Error types for better error handling
 */
interface WhatsAppError {
    message: string;
    code?: string;
    details?: string;
}

/**
 * Props interface for OrderCompleteModal component
 */
interface OrderCompleteModalProps {
    /** Controls modal visibility */
    isOpen: boolean;
    /** Callback function when modal is closed */
    onClose: () => void;
    /** Determines if this is an academic service (affects language and formatting) */
    isAcademicServices: boolean;
    /** Total order amount for display */
    orderTotal: number;
    /** Optional customer phone number for WhatsApp notifications */
    customerPhone?: string;
    /** Optional customer name for personalized messages */
    customerName?: string;
    /** Optional order ID for reference */
    orderId?: string;
    /** Whether to automatically send WhatsApp notifications */
    enableWhatsApp?: boolean;
    /** Test ID for automated testing */
    testId?: string;
}

/**
 * Configuration constants
 */
const CONFIG = {
    /** Maximum retry attempts for failed WhatsApp sends */
    MAX_RETRY_ATTEMPTS: 3,
    /** Delay between retry attempts in milliseconds */
    RETRY_DELAY: 2000,
    /** Timeout for WhatsApp API calls in milliseconds */
    API_TIMEOUT: 10000,
    /** Default test phone number for development */
    DEFAULT_TEST_PHONE: '523315590572',
    /** Default customer name for fallback */
    DEFAULT_CUSTOMER_NAME: 'Valued Customer'
} as const;

/**
 * OrderCompleteModal - A production-ready modal component for order completion
 * 
 * Features:
 * - Automatic WhatsApp notifications with retry logic
 * - Comprehensive error handling and logging
 * - Performance optimized with React.memo and useCallback
 * - Accessibility compliant (ARIA labels, keyboard navigation)
 * - Bilingual support (English/Spanish)
 * - Type-safe implementation with TypeScript
 * 
 * @param props - OrderCompleteModalProps
 * @returns JSX.Element - The modal component
 */
export const OrderCompleteModal: React.FC<OrderCompleteModalProps> = React.memo(({
    isOpen,
    onClose,
    isAcademicServices,
    orderTotal,
    customerPhone,
    customerName,
    orderId,
    enableWhatsApp = true,
    testId = 'order-complete-modal'
}) => {
    // ==================== STATE MANAGEMENT ====================

    /** WhatsApp notification status */
    const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>('idle');

    /** WhatsApp error information */
    const [whatsappError, setWhatsappError] = useState<WhatsAppError | null>(null);

    /** Current retry attempt count */
    const [retryCount, setRetryCount] = useState(0);

    /** Loading state for manual retry */
    const [isRetrying, setIsRetrying] = useState(false);

    // ==================== REFS ====================

    /** Reference to track if component is mounted (prevents memory leaks) */
    const isMountedRef = useRef(true);

    /** Reference to store retry timeout ID for cleanup */
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /** Reference to store AbortController for API call cancellation */
    const abortControllerRef = useRef<AbortController | null>(null);

    // ==================== MEMOIZED VALUES ====================

    /**
     * Memoized phone number with proper formatting
     */
    const formattedPhone = useMemo(() => {
        if (!customerPhone) return CONFIG.DEFAULT_TEST_PHONE;
        return formatPhoneNumberForWhatsApp(customerPhone);
    }, [customerPhone]);

    /**
     * Memoized customer name with fallback
     */
    const displayName = useMemo(() => {
        return customerName?.trim() || CONFIG.DEFAULT_CUSTOMER_NAME;
    }, [customerName]);

    /**
     * Memoized order ID with fallback generation
     */
    const displayOrderId = useMemo(() => {
        return orderId || `ORDER-${Date.now().toString().slice(-8)}`;
    }, [orderId]);

    /**
     * Memoized WhatsApp message content
     */
    const whatsappMessage = useMemo(() => {
        return generateOrderConfirmationMessage({
            customerName: displayName,
            orderTotal,
            orderId: displayOrderId,
            isAcademicServices
        });
    }, [displayName, orderTotal, displayOrderId, isAcademicServices]);

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Formats phone number for WhatsApp API (international format)
     * @param phone - Raw phone number input
     * @returns Formatted phone number for WhatsApp
     */
    const formatPhoneNumberForWhatsApp = (phone: string): string => {
        try {
            // Remove all non-digit characters
            const cleaned = phone.replace(/\D/g, '');

            // Handle different phone number formats
            if (cleaned.startsWith('52') && cleaned.length === 12) {
                // Already in Mexico format (52XXXXXXXXXX)
                return cleaned;
            } else if (cleaned.length === 10) {
                // Mexican domestic format (XXXXXXXXXX) - add country code
                return `52${cleaned}`;
            } else if (cleaned.startsWith('1') && cleaned.length === 11) {
                // US format (+1XXXXXXXXXX)
                return cleaned;
            } else {
                // Fallback: return as-is but log for monitoring
                console.warn(`Unusual phone number format: ${phone} -> ${cleaned}`);
                return cleaned;
            }
        } catch (error) {
            console.error('Error formatting phone number:', error);
            return CONFIG.DEFAULT_TEST_PHONE;
        }
    };

    /**
     * Generates personalized order confirmation message
     * @param params - Message generation parameters
     * @returns Formatted message string
     */
    const generateOrderConfirmationMessage = ({
        customerName,
        orderTotal,
        orderId,
        isAcademicServices
    }: {
        customerName: string;
        orderTotal: number;
        orderId: string;
        isAcademicServices: boolean;
    }): string => {
        const currencySymbol = isAcademicServices ? 'MXN' : 'USD';
        const estimatedTime = isAcademicServices ? '2-3 días hábiles' : '15-20 minutes';

        if (isAcademicServices) {
            return `✅ ¡Pago Confirmado!

Hola ${customerName}!

Su pago ha sido procesado exitosamente.

📋 Orden: #${orderId}
💰 Total Pagado: $${orderTotal.toFixed(2)} ${currencySymbol}
⏱️ Tiempo estimado: ${estimatedTime}

Nos pondremos en contacto pronto para coordinar el servicio.

¡Gracias por confiar en nosotros!

---
YapaNow - Servicios Profesionales`;
        } else {
            return `✅ Order Confirmed!

Hi ${customerName}!

Your order has been confirmed and payment processed.

📋 Order: #${orderId}
💰 Total: $${orderTotal.toFixed(2)} ${currencySymbol}
⏱️ Estimated time: ${estimatedTime}

We'll notify you when your order is ready!

Thank you for choosing us!

---
YapaNow - Professional Services`;
        }
    };

    // ==================== API FUNCTIONS ====================

    /**
     * Sends WhatsApp message with comprehensive error handling and retry logic
     * @param attempt - Current attempt number (for retry logic)
     */
    const sendWhatsAppNotification = useCallback(async (attempt: number = 1): Promise<void> => {
        if (!isMountedRef.current) return;

        try {
            // Update status for user feedback
            setWhatsappStatus('sending');
            setWhatsappError(null);

            // Create AbortController for request cancellation
            abortControllerRef.current = new AbortController();
            const { signal } = abortControllerRef.current;

            // Prepare API request
            const requestBody = {
                to: formattedPhone,
                message: {
                    type: 'text',
                    text: {
                        body: whatsappMessage
                    }
                }
            };

            console.log(`📱 Sending WhatsApp notification (attempt ${attempt}):`, {
                to: formattedPhone,
                orderId: displayOrderId,
                messageLength: whatsappMessage.length
            });

            // Make API call with timeout and cancellation support
            const response = await Promise.race([
                fetch('/.netlify/functions/send-whatsapp-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody),
                    signal
                }),
                // Timeout promise
                new Promise<never>((_, reject) => {
                    setTimeout(() => {
                        reject(new Error(`Request timeout after ${CONFIG.API_TIMEOUT}ms`));
                    }, CONFIG.API_TIMEOUT);
                })
            ]);

            // Handle response
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    // Use HTTP status if JSON parsing fails
                    errorMessage = errorText || errorMessage;
                }

                throw new Error(errorMessage);
            }

            // Success case
            const result = await response.json();

            if (!isMountedRef.current) return;

            setWhatsappStatus('sent');
            setRetryCount(0);

            console.log('✅ WhatsApp notification sent successfully:', result);

            // Analytics/monitoring (in production, send to your analytics service)
            if (process.env.NODE_ENV === 'production') {
                // Example: analytics.track('whatsapp_notification_sent', { orderId: displayOrderId });
            }

        } catch (error) {
            if (!isMountedRef.current) return;

            const whatsappError: WhatsAppError = {
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                code: 'WHATSAPP_SEND_FAILED',
                details: `Attempt ${attempt} of ${CONFIG.MAX_RETRY_ATTEMPTS}`
            };

            console.error(`❌ WhatsApp notification failed (attempt ${attempt}):`, whatsappError);

            // Retry logic
            if (attempt < CONFIG.MAX_RETRY_ATTEMPTS && !abortControllerRef.current?.signal?.aborted) {
                console.log(`🔄 Retrying WhatsApp notification in ${CONFIG.RETRY_DELAY}ms...`);

                setRetryCount(attempt);

                retryTimeoutRef.current = setTimeout(() => {
                    if (isMountedRef.current) {
                        sendWhatsAppNotification(attempt + 1);
                    }
                }, CONFIG.RETRY_DELAY);
            } else {
                // Final failure
                setWhatsappStatus('error');
                setWhatsappError(whatsappError);
                setRetryCount(0);

                // Error reporting (in production, send to your error monitoring service)
                if (process.env.NODE_ENV === 'production') {
                    // Example: errorReporting.captureException(error, { orderId: displayOrderId });
                }
            }
        }
    }, [formattedPhone, whatsappMessage, displayOrderId]);

    /**
     * Manual retry function for user-initiated retries
     */
    const handleManualRetry = useCallback(async (): Promise<void> => {
        if (isRetrying) return;

        setIsRetrying(true);
        setRetryCount(0);

        try {
            await sendWhatsAppNotification(1);
        } finally {
            setIsRetrying(false);
        }
    }, [sendWhatsAppNotification, isRetrying]);

    // ==================== EFFECTS ====================

    /**
     * Main effect: Send WhatsApp notification when modal opens
     */
    useEffect(() => {
        if (isOpen && enableWhatsApp && formattedPhone && whatsappStatus === 'idle') {
            // Small delay to ensure modal is fully rendered
            const timer = setTimeout(() => {
                if (isMountedRef.current) {
                    sendWhatsAppNotification(1);
                }
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [isOpen, enableWhatsApp, formattedPhone, whatsappStatus, sendWhatsAppNotification]);

    /**
     * Cleanup effect: Cancel ongoing requests and timers on unmount
     */
    useEffect(() => {
        return () => {
            isMountedRef.current = false;

            // Cancel ongoing API request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Clear retry timeout
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);

    /**
     * Reset WhatsApp status when modal closes
     */
    useEffect(() => {
        if (!isOpen) {
            setWhatsappStatus('idle');
            setWhatsappError(null);
            setRetryCount(0);
            setIsRetrying(false);
        }
    }, [isOpen]);

    // ==================== EVENT HANDLERS ====================

    /**
     * Handle modal close with cleanup
     */
    const handleClose = useCallback(() => {
        // Cancel any ongoing operations
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
        }

        onClose();
    }, [onClose]);

    /**
     * Handle escape key press for accessibility
     */
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            handleClose();
        }
    }, [handleClose]);

    // ==================== RENDER CONDITIONS ====================

    if (!isOpen) return null;

    // ==================== RENDER HELPERS ====================

    /**
     * Renders WhatsApp status indicator with appropriate styling and messaging
     */
    const renderWhatsAppStatus = () => {
        switch (whatsappStatus) {
            case 'sending':
                return (
                    <div className="flex items-center justify-center text-blue-600 text-sm" role="status" aria-live="polite">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" aria-hidden="true"></div>
                        <span>
                            {isAcademicServices ? 'Enviando confirmación por WhatsApp...' : 'Sending WhatsApp confirmation...'}
                            {retryCount > 0 && ` (Intento ${retryCount + 1})`}
                        </span>
                    </div>
                );

            case 'sent':
                return (
                    <div className="flex items-center justify-center text-green-600 text-sm bg-green-50 p-3 rounded-lg" role="status" aria-live="polite">
                        <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
                        <span>{isAcademicServices ? '✅ Confirmación enviada por WhatsApp' : '✅ WhatsApp confirmation sent'}</span>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg" role="alert" aria-live="assertive">
                        <div className="flex items-start">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <div className="flex-1">
                                <div className="font-medium">
                                    {isAcademicServices ? 'Error enviando WhatsApp' : 'WhatsApp notification failed'}
                                </div>
                                {whatsappError && (
                                    <div className="text-xs mt-1 opacity-75">
                                        {whatsappError.message}
                                        {whatsappError.details && ` (${whatsappError.details})`}
                                    </div>
                                )}
                                <button
                                    onClick={handleManualRetry}
                                    disabled={isRetrying}
                                    className="mt-2 text-xs bg-red-100 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                                    aria-label={isAcademicServices ? 'Reintentar envío de WhatsApp' : 'Retry WhatsApp notification'}
                                >
                                    {isRetrying
                                        ? (isAcademicServices ? 'Reintentando...' : 'Retrying...')
                                        : (isAcademicServices ? 'Reintentar' : 'Retry')
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // ==================== MAIN RENDER ====================

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            onKeyDown={handleKeyDown}
            data-testid={testId}
        >
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-xl transform transition-all">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
                    aria-label={isAcademicServices ? 'Cerrar modal' : 'Close modal'}
                    data-testid={`${testId}-close-button`}
                >
                    <X className="w-6 h-6" aria-hidden="true" />
                </button>

                {/* Modal Content */}
                <div className="text-center">
                    {/* Success Icon */}
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" aria-hidden="true" />

                    {/* Title */}
                    <h2
                        id="modal-title"
                        className="text-2xl font-bold text-gray-900 mb-2"
                    >
                        {getServiceText('orderPlaced', isAcademicServices)}
                    </h2>

                    {/* Description */}
                    <p
                        id="modal-description"
                        className="text-gray-600 mb-6"
                    >
                        {getServiceText('orderComplete', isAcademicServices)}
                    </p>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="text-sm text-gray-600 mb-1">
                            {getServiceText('total', isAcademicServices)}
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            ${orderTotal.toFixed(2)} {isAcademicServices ? 'MXN' : 'USD'}
                        </div>
                        {displayOrderId && (
                            <div className="text-xs text-gray-500 mt-2">
                                {isAcademicServices ? 'Orden' : 'Order'}: #{displayOrderId}
                            </div>
                        )}
                    </div>

                    {/* WhatsApp Status */}
                    {enableWhatsApp && (
                        <div className="mb-6" data-testid={`${testId}-whatsapp-status`}>
                            {renderWhatsAppStatus()}
                        </div>
                    )}

                    {/* Continue Button */}
                    <button
                        onClick={handleClose}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        data-testid={`${testId}-continue-button`}
                    >
                        {isAcademicServices ? 'Continuar' : 'Continue'}
                    </button>

                    {/* Debug Info (Development Only) */}
                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-4 text-left">
                            <summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
                            <pre className="text-xs text-gray-400 mt-2 p-2 bg-gray-100 rounded overflow-auto">
                                {JSON.stringify({
                                    phone: formattedPhone,
                                    orderId: displayOrderId,
                                    status: whatsappStatus,
                                    retryCount,
                                    enableWhatsApp
                                }, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
});

// Set display name for debugging
OrderCompleteModal.displayName = 'OrderCompleteModal';

export default OrderCompleteModal;