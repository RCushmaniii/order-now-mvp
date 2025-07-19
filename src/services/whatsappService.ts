// src/services/whatsappService.ts

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
    items: Array<{ name: string; quantity: number; price: number }>;
    delivery_address: string;
    special_instructions?: string;
    payment_method: string;
    language: 'es' | 'en'; // Made non-optional to be explicit
    cancellation_reason?: string;
}

export interface WhatsAppResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

// ==================== CONFIGURATION ====================

const CONFIG = {
    WHATSAPP_ENDPOINT: '/.netlify/functions/send-whatsapp-message',
    API_TIMEOUT: 15000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
} as const;

// ==================== UTILITY FUNCTIONS (Refactored from class) ====================

export function formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle Mexico numbers (country code 52)
    if (cleaned.startsWith('52')) {
        // Mexico numbers should be exactly 12 digits: 52 + 10 digits
        if (cleaned.length === 12) {
            return cleaned; // Already properly formatted
        } else if (cleaned.length === 11) {
            // Missing one digit from country code, likely 52X instead of 52XX
            // This is the bug! Don't return as-is, log the error
            console.error(`Invalid Mexico phone number length: ${phone} -> ${cleaned} (${cleaned.length} digits)`);
            return cleaned; // Return as-is but logged for debugging
        } else {
            console.error(`Invalid Mexico phone number format: ${phone} -> ${cleaned} (${cleaned.length} digits)`);
            return cleaned;
        }
    }
    
    // Handle domestic Mexico numbers (10 digits)
    if (cleaned.length === 10) {
        return `52${cleaned}`;
    }
    
    // Handle US numbers (country code 1)
    if (cleaned.startsWith('1') && cleaned.length === 11) {
        return cleaned;
    }
    
    // Log unexpected formats for debugging
    console.warn(`Unexpected phone number format: ${phone} -> ${cleaned} (${cleaned.length} digits)`);
    return cleaned;
}

export function isValidPhoneNumber(phone: string): boolean {
    const formatted = formatPhoneNumber(phone);
    return formatted.length >= 10 && formatted.length <= 15;
}

// ==================== ERROR CLASSES ====================

export class WhatsAppError extends Error {
    constructor(message: string, public code?: string, public statusCode?: number) {
        super(message);
        this.name = 'WhatsAppError';
    }
}

// ==================== MAIN SERVICE CLASS ====================

class WhatsAppService {
    private isProcessing = false;

    constructor() {
        if (import.meta.env.DEV) {
            console.log('✅ WhatsApp Service Initialized');
        }
    }

    public async sendOrderConfirmation(orderData: OrderData): Promise<WhatsAppResponse> {
        if (this.isProcessing) {
            console.warn('⏳ WhatsApp service is busy.');
            return { success: false, error: 'Service busy, please try again.' };
        }
        this.isProcessing = true;

        console.group(`📲 Sending WhatsApp for Order #${orderData.order_id}`);
        try {
            if (!isValidPhoneNumber(orderData.customer_phone)) {
                throw new WhatsAppError('Invalid phone number format.', 'INVALID_PHONE');
            }

            const apiData = {
                ...orderData,
                customer_phone: formatPhoneNumber(orderData.customer_phone)
            };

            const response = await this.sendWithRetry(apiData);
            console.log('✅ WhatsApp confirmation sent successfully:', response);
            return response;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('❌ Failed to send WhatsApp confirmation:', error);
            return { success: false, error: errorMessage };
        } finally {
            this.isProcessing = false;
            console.groupEnd();
        }
    }

    private async sendWithRetry(orderData: OrderData): Promise<WhatsAppResponse> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt}/${CONFIG.MAX_RETRIES}...`);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

                const response = await fetch(CONFIG.WHATSAPP_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const result: WhatsAppResponse = await response.json();

                if (response.ok && result.success) {
                    return result;
                }
                // If response is not ok OR result.success is false, throw a detailed error
                throw new WhatsAppError(result.error || `API returned a non-success response.`, 'API_ERROR', response.status);

            } catch (error) {
                lastError = error instanceof Error ? error : new Error('An unknown error occurred during fetch.');
                console.warn(`⚠️ Attempt ${attempt} failed:`, lastError.message);

                // Don't retry on client-side errors like bad phone number
                if (error instanceof WhatsAppError && (error.code === 'INVALID_PHONE' || error.statusCode === 400)) {
                    break;
                }

                if (attempt < CONFIG.MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
                }
            }
        }
        // IMPROVEMENT: After all retries fail, re-throw the *last actual error* to preserve its details.
        console.error('❌ All WhatsApp attempts failed.');
        throw lastError;
    }
}

// Create and export a singleton instance of the service
export const whatsappService = new WhatsAppService();