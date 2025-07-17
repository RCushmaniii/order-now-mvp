// src/services/whatsappService.ts
// FIXED: Real WhatsApp integration with complete WhatsAppUtils

// ==================== TYPE DEFINITIONS ====================

export type WhatsAppStatus = 'idle' | 'sending' | 'sent' | 'error';

export interface OrderData {
    order_id: string;
    customer_name: string;
    customer_phone: string;
    store_name: string;
    store_address?: string;
    store_phone?: string;
    total_amount: number;
    currency: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    estimated_time?: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    delivery_address: string;
    special_instructions?: string;
    payment_method: string;
    language?: 'es' | 'en';
    cancellation_reason?: string;
}

export interface WhatsAppResponse {
    success: boolean;
    messageId?: string;
    timestamp?: string;
    error?: string;
    phone?: string;
}

// ==================== CONFIGURATION ====================

const CONFIG = {
    // API Endpoints
    WHATSAPP_ENDPOINT: '/send-whatsapp',

    // Timeout and retry settings
    API_TIMEOUT: 15000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,

    // Debug settings
    DEBUG_MODE: import.meta.env.DEV || import.meta.env.VITE_DEBUG_WHATSAPP === 'true'
} as const;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Enhanced phone number formatting for WhatsApp
 */
export class WhatsAppUtils {
    /**
     * Format phone number for WhatsApp API
     * Ensures proper country code and removes formatting
     */
    static formatPhoneNumber(phone: string): string {
        if (!phone) return '';

        // Remove all non-numeric characters
        const cleaned = phone.replace(/\D/g, '');

        // Mexico country code handling
        if (cleaned.startsWith('52')) {
            return cleaned; // Already has Mexico country code
        }

        if (cleaned.startsWith('33')) {
            return `52${cleaned}`; // Guadalajara area code, add Mexico code
        }

        if (cleaned.length === 10) {
            return `52${cleaned}`; // Assume Mexican number
        }

        return cleaned;
    }

    /**
     * Validate phone number format
     */
    static isValidPhoneNumber(phone: string): boolean {
        const formatted = this.formatPhoneNumber(phone);
        return formatted.length >= 10 && formatted.length <= 15;
    }

    /**
     * Detect language from store type or name
     */
    static detectLanguage(storeName: string, storeType?: string): 'es' | 'en' {
        const spanishIndicators = [
            'dra.', 'dr.', 'doctora', 'doctor',
            'verónica', 'veronica', 'rosas',
            'académico', 'academico', 'biología', 'biologia'
        ];

        const lowerName = storeName.toLowerCase();
        const hasSpanishIndicators = spanishIndicators.some(indicator =>
            lowerName.includes(indicator)
        );

        return (storeType === 'academic' || hasSpanishIndicators) ? 'es' : 'en';
    }

    /**
     * Get estimated delivery/completion time based on business type
     * FIXED: Added missing method that was causing TypeScript error
     */
    static getEstimatedTime(businessType: string): string {
        const timeEstimates: Record<string, string> = {
            'restaurant': '15-20 minutos',
            'academic': '2-3 días hábiles',
            'consulting': '1-2 días hábiles',
            'default': '15-30 minutos'
        };

        return timeEstimates[businessType] || timeEstimates.default;
    }
}

// ==================== ERROR CLASSES ====================

/**
 * Custom error class for WhatsApp API failures
 */
export class WhatsAppError extends Error {
    public code?: string;
    public statusCode?: number;

    constructor(message: string, code?: string, statusCode?: number) {
        super(message);
        this.name = 'WhatsAppError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

// ==================== MAIN SERVICE CLASS ====================

/**
 * WhatsApp Service Class - Real Implementation
 * Handles all WhatsApp Business API interactions
 */
class WhatsAppService {
    private isProcessing = false;
    private baseUrl: string;

    constructor() {
        // Set the base URL from environment variables or default to Netlify functions
        this.baseUrl = import.meta.env.VITE_WHATSAPP_API_BASE_URL || '/.netlify/functions';

        // Log important configuration in development mode
        if (import.meta.env.MODE === 'development') {
            console.log('WhatsApp Service initialized with base URL:', this.baseUrl);
        }
    }

    /**
     * Send order confirmation to customer with retry logic
     */
    async sendOrderConfirmation(orderData: OrderData): Promise<WhatsAppResponse> {
        if (this.isProcessing) {
            console.log('⏳ WhatsApp service already processing, please wait...');
            return { success: false, error: 'Service busy, please try again' };
        }

        this.isProcessing = true;

        try {
            console.log('📱 Sending WhatsApp order confirmation...');
            console.log('Order ID:', orderData.order_id);
            console.log('Customer:', orderData.customer_name);
            console.log('Phone:', orderData.customer_phone);

            // Validate phone number
            if (!WhatsAppUtils.isValidPhoneNumber(orderData.customer_phone)) {
                throw new WhatsAppError('Invalid phone number format', 'INVALID_PHONE');
            }

            // Detect language
            const language = orderData.language || WhatsAppUtils.detectLanguage(orderData.store_name);

            // Prepare the order data for the API
            const apiData = {
                ...orderData,
                language,
                customer_phone: WhatsAppUtils.formatPhoneNumber(orderData.customer_phone)
            };

            // Send to Netlify function with retry logic
            const response = await this.sendWithRetry(apiData);

            console.log('✅ WhatsApp confirmation sent successfully:', response);

            return response;

        } catch (error) {
            console.error('❌ Failed to send WhatsApp confirmation:', error);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Send notification to business about new order
     */
    async sendBusinessNotification(orderData: OrderData, businessPhone: string): Promise<WhatsAppResponse> {
        try {
            console.log('🏪 Sending business notification...');
            console.log('Business phone:', businessPhone);

            // Create business-specific order data
            const businessOrderData = {
                ...orderData,
                customer_phone: WhatsAppUtils.formatPhoneNumber(businessPhone),
                language: 'es' as const // Businesses typically prefer Spanish in Mexico
            };

            const response = await this.sendWithRetry(businessOrderData);

            console.log('✅ Business notification sent successfully');

            return response;

        } catch (error) {
            console.error('❌ Failed to send business notification:', error);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to notify business'
            };
        }
    }

    /**
     * Private method to send WhatsApp message with retry logic
     */
    private async sendWithRetry(orderData: OrderData): Promise<WhatsAppResponse> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
            try {
                console.log(`🔄 WhatsApp attempt ${attempt}/${CONFIG.MAX_RETRIES}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

                const response = await fetch(`${this.baseUrl}${CONFIG.WHATSAPP_ENDPOINT}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new WhatsAppError(
                        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
                        'API_ERROR',
                        response.status
                    );
                }

                const result: WhatsAppResponse = await response.json();

                if (result.success) {
                    console.log(`✅ WhatsApp sent successfully on attempt ${attempt}`);
                    return result;
                } else {
                    throw new WhatsAppError(result.error || 'Unknown API error', 'API_RESPONSE_ERROR');
                }

            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');

                console.warn(`⚠️ WhatsApp attempt ${attempt} failed:`, lastError.message);

                // Don't retry on certain errors
                if (error instanceof WhatsAppError &&
                    (error.code === 'INVALID_PHONE' || error.statusCode === 400)) {
                    break;
                }

                // Wait before retry (except on last attempt)
                if (attempt < CONFIG.MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
                }
            }
        }

        // All attempts failed
        throw new WhatsAppError(
            `Failed after ${CONFIG.MAX_RETRIES} attempts: ${lastError?.message}`,
            'MAX_RETRIES_EXCEEDED'
        );
    }

    /**
     * Test WhatsApp connectivity
     */
    async testConnection(): Promise<WhatsAppResponse> {
        const testOrder: OrderData = {
            order_id: `TEST-${Date.now()}`,
            customer_name: 'Test Customer',
            customer_phone: '+523315590572', // Your test phone
            store_name: 'YapaNow Test Store',
            total_amount: 1.00,
            currency: 'MXN',
            status: 'confirmed',
            items: [{ name: 'Test Item', quantity: 1, price: 1.00 }],
            delivery_address: 'Test Address',
            payment_method: 'Test Payment',
            language: 'en'
        };

        return this.sendOrderConfirmation(testOrder);
    }
}

// ==================== EXPORT ====================

// Create singleton instance
export const whatsappService = new WhatsAppService();

// Export default instance
export default whatsappService;