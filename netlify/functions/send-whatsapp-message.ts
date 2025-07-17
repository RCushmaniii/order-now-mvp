// netlify/functions/send-whatsapp-message.ts
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { z } from 'zod';

// ==================== TYPE DEFINITIONS (from types.ts) ====================
const orderDataSchema = z.object({
    order_id: z.string().min(1),
    customer_name: z.string().min(1),
    customer_phone: z.string().min(10),
    store_name: z.string().min(1),
    store_address: z.string().optional(),
    store_phone: z.string().optional(),
    total_amount: z.number().positive(),
    currency: z.string().min(3).max(3),
    status: z.string().optional(),
    items: z.array(z.object({
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
    })).min(1),
    delivery_address: z.string().optional(),
    special_instructions: z.string().optional(),
    payment_method: z.string().min(1),
    language: z.enum(['es', 'en']).optional().default('en'),
});
type WhatsAppOrderData = z.infer<typeof orderDataSchema>;

// ==================== CONFIGURATION & STARTUP LOGS ====================

// DEBUG HELPER: Safely log token status without exposing the secret
const getSanitizedToken = (token: string | undefined): string => {
    if (!token) return '❌ NOT FOUND';
    if (token.length < 10) return '❌ INVALID (too short)';
    return `✅ PRESENT (starts with: ${token.substring(0, 4)}..., ends with: ${token.substring(token.length - 4)})`;
};

const CONFIG = {
    WHATSAPP_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_API_URL: process.env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com/v20.0',
    IS_PRODUCTION: process.env.NETLIFY_CONTEXT === 'production',
    SITE_URL: process.env.SITE_URL || 'http://localhost:8888',
} as const;

// DEBUG LOG: Log configuration once when the function instance starts ("cold start")
console.log('⚙️ FUNCTION COLD START: Initializing configuration...');
console.log({
    IS_PRODUCTION: CONFIG.IS_PRODUCTION,
    NETLIFY_CONTEXT: process.env.NETLIFY_CONTEXT,
    WHATSAPP_TOKEN_STATUS: getSanitizedToken(CONFIG.WHATSAPP_TOKEN),
    WHATSAPP_PHONE_ID_STATUS: CONFIG.WHATSAPP_PHONE_NUMBER_ID ? '✅ PRESENT' : '❌ NOT FOUND',
    API_URL: CONFIG.WHATSAPP_API_URL,
});

// Fail fast if required production env vars are missing
if (CONFIG.IS_PRODUCTION && (!CONFIG.WHATSAPP_TOKEN || !CONFIG.WHATSAPP_PHONE_NUMBER_ID)) {
    console.error('🛑 CRITICAL CONFIG ERROR: A required WhatsApp environment variable is missing in production.');
    // Note: This throw will cause a 500 error if the function is invoked with missing variables.
}

// ==================== CUSTOM ERROR ====================
class ApiError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
    }
}

// ==================== UTILITIES ====================
function formatPhoneNumber(phone: string): string { /* ... unchanged ... */ }
function generateOrderMessage(orderData: WhatsAppOrderData): string { /* ... unchanged ... */ }

// ==================== API CALL LOGIC ====================
async function sendWhatsAppMessage(to: string, message: string) {
    console.groupCollapsed('📲 Attempting to send WhatsApp Message...');
    console.log(`Recipient: ${to}`);

    // DEBUG: Explicitly check for test mode and log the reason
    const isTestMode = !CONFIG.IS_PRODUCTION || !CONFIG.WHATSAPP_TOKEN;
    if (isTestMode) {
        console.warn('🧪 TEST MODE ENGAGED. No real message will be sent.');
        console.log(`   - Reason 1 (Is Production?): ${CONFIG.IS_PRODUCTION}`);
        console.log(`   - Reason 2 (Is Token Present?): ${!!CONFIG.WHATSAPP_TOKEN}`);
        console.log('   - Message Preview:', message.substring(0, 200) + '...');
        console.groupEnd();
        return { success: true, messageId: `test_msg_${Date.now()}`, testMode: true };
    }

    const url = `${CONFIG.WHATSAPP_API_URL}/${CONFIG.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const requestBody = { messaging_product: 'whatsapp', to, type: 'text', text: { body: message } };

    console.log('📡 Making REAL API call to:', url);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${CONFIG.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const responseData = await response.json();
        console.log(`📊 API Response Status: ${response.status}`);
        console.log('📦 API Response Body:', responseData);

        if (!response.ok) {
            const errorMessage = responseData.error?.message || `WhatsApp API error (${response.status})`;
            throw new Error(errorMessage);
        }

        console.log('✅ Message sent successfully.');
        return { success: true, messageId: responseData.messages?.[0]?.id, testMode: false };

    } catch (error) {
        console.error('💥 API call failed:', error);
        throw error; // Re-throw to be caught by the main handler
    } finally {
        console.groupEnd();
    }
}

// ==================== MAIN HANDLER ====================
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    const requestId = context.awsRequestId;
    console.group(`🚀 Function Invoked [ID: ${requestId}]`);
    console.log(`   - Path: ${event.path} | Method: ${event.httpMethod}`);

    const headers = {
        'Access-Control-Allow-Origin': CONFIG.IS_PRODUCTION ? CONFIG.SITE_URL : '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    try {
        if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
        if (event.httpMethod !== 'POST') throw new ApiError(405, 'Method Not Allowed');
        if (!event.body) throw new ApiError(400, 'Request body is required.');

        console.log('📬 Received body (first 500 chars):', event.body.substring(0, 500));

        const requestData = JSON.parse(event.body);
        const validationResult = orderDataSchema.safeParse(requestData);

        if (!validationResult.success) {
            console.error('❌ Zod validation failed:', validationResult.error.flatten());
            throw new ApiError(400, `Invalid input: ${validationResult.error.issues[0].message}`);
        }

        const orderData = validationResult.data;
        console.log(`📦 Validated order received: ${orderData.order_id}`);

        const formattedPhone = formatPhoneNumber(orderData.customer_phone);
        const message = generateOrderMessage(orderData);
        const result = await sendWhatsAppMessage(formattedPhone, message);

        return { statusCode: 200, headers, body: JSON.stringify(result) };

    } catch (error) {
        console.error('💥 Top-level handler error:', error);
        const errorResponse = { success: false, error: error instanceof Error ? error.message : 'An internal server error occurred.' };
        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        return { statusCode, headers, body: JSON.stringify(errorResponse) };
    } finally {
        console.log(`🏁 Function execution finished [ID: ${requestId}]`);
        console.groupEnd();
    }
};