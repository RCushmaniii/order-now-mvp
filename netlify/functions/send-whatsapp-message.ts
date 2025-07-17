// netlify/functions/send-whatsapp.ts
import type { Handler, HandlerEvent } from '@netlify/functions';
import { z } from 'zod';

// ==================== CONFIGURATION & VALIDATION ====================

// Zod schema for validating incoming order data
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

// Type inference from the Zod schema
type WhatsAppOrderData = z.infer<typeof orderDataSchema>;

const CONFIG = {
    WHATSAPP_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_API_URL: process.env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com/v18.0',
    IS_PRODUCTION: process.env.NETLIFY_CONTEXT === 'production',
    SITE_URL: process.env.SITE_URL || 'http://localhost:8888',
    DEBUG: process.env.VITE_DEBUG_WHATSAPP === 'true'
} as const;

// Fail fast if required production environment variables are missing
if (CONFIG.IS_PRODUCTION && (!CONFIG.WHATSAPP_TOKEN || !CONFIG.WHATSAPP_PHONE_NUMBER_ID)) {
    console.error('❌ Critical Error: Missing required WhatsApp environment variables in production.');
    throw new Error('Server configuration error.');
}

// ==================== CUSTOM ERROR ====================

class ApiError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
    }
}

// ==================== UTILITIES ====================

/**
 * Formats a phone number for the WhatsApp API.
 */
function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('52')) return cleaned;
    if (cleaned.length === 10) return `52${cleaned}`; // Assumes Mexican number
    return cleaned;
}

/**
 * Generates a localized order confirmation message.
 */
function generateOrderMessage(orderData: WhatsAppOrderData): string {
    const { language, store_name, order_id, customer_name, customer_phone, items, total_amount, currency, payment_method, delivery_address, special_instructions } = orderData;

    const text = language === 'es' ? {
        title: `¡Confirmación de Orden - ${store_name}!`,
        order: `Orden #${order_id}`,
        customer: `Cliente: ${customer_name}`,
        phone: `Teléfono: ${customer_phone}`,
        items: `Artículos Ordenados:`,
        total: `Total: $${total_amount.toFixed(2)} ${currency}`,
        payment: `Método de pago: ${payment_method}`,
        address: delivery_address ? `📍 Dirección: ${delivery_address}` : '',
        instructions: special_instructions ? `📝 Instrucciones: ${special_instructions}` : '',
        status: `✅ Su orden ha sido confirmada y será procesada pronto.`,
        contact: `📞 Nos pondremos en contacto si necesitamos más información.`,
        thanks: `¡Gracias por elegirnos!`,
    } : {
        title: `Order Confirmation - ${store_name}!`,
        order: `Order #${order_id}`,
        customer: `Customer: ${customer_name}`,
        phone: `Phone: ${customer_phone}`,
        items: `Items Ordered:`,
        total: `Total: $${total_amount.toFixed(2)} ${currency}`,
        payment: `Payment method: ${payment_method}`,
        address: delivery_address ? `📍 Address: ${delivery_address}` : '',
        instructions: special_instructions ? `📝 Instructions: ${special_instructions}` : '',
        status: `✅ Your order has been confirmed and will be processed soon.`,
        contact: `📞 We'll contact you if we need any additional information.`,
        thanks: `Thank you for choosing us!`,
    };

    const itemsList = items.map(item => `• ${item.name} x${item.quantity} - $${item.price.toFixed(2)}`).join('\n');

    return [
        `🎉 *${text.title}*`,
        ``,
        `📋 *${text.order}*`,
        `👤 ${text.customer}`,
        `📱 ${text.phone}`,
        ``,
        `📦 *${text.items}*`,
        itemsList,
        ``,
        `💰 *${text.total}*`,
        `💳 ${text.payment}`,
        ``,
        text.address,
        text.instructions,
        ``,
        text.status,
        text.contact,
        ``,
        `${text.thanks}`,
        `🌟 ${store_name}`
    ].filter(line => line.trim() !== '').join('\n');
}

/**
 * Sends a message using the WhatsApp Business API.
 */
async function sendWhatsAppMessage(to: string, message: string) {
    console.group('📲 sendWhatsAppMessage');
    console.log(`Sending to: ${to}`);

    if (!CONFIG.IS_PRODUCTION || !CONFIG.WHATSAPP_TOKEN) {
        console.log('🧪 TEST MODE: WhatsApp message not sent. Preview:');
        console.log('--------------------------------------------------');
        console.log(message);
        console.log('--------------------------------------------------');
        console.groupEnd();
        return { success: true, messageId: `test_msg_${Date.now()}`, testMode: true };
    }

    const url = `${CONFIG.WHATSAPP_API_URL}/${CONFIG.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const requestBody = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CONFIG.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();
    console.log(`API Response Status: ${response.status}`);
    console.log('API Response Body:', responseData);

    if (!response.ok) {
        const errorMessage = responseData.error?.message || `WhatsApp API error (${response.status})`;
        console.error(`❌ API Error: ${errorMessage}`);
        console.groupEnd();
        throw new Error(errorMessage);
    }

    console.log('✅ Message sent successfully.');
    console.groupEnd();
    return { success: true, messageId: responseData.messages?.[0]?.id, testMode: false };
}

// ==================== MAIN HANDLER ====================

export const handler: Handler = async (event: HandlerEvent) => {
    console.log(`🚀 Function invoked: ${event.httpMethod} ${event.path}`);

    const headers = {
        'Access-Control-Allow-Origin': CONFIG.IS_PRODUCTION ? CONFIG.SITE_URL : '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    try {
        if (event.httpMethod === 'OPTIONS') {
            return { statusCode: 204, headers };
        }
        if (event.httpMethod !== 'POST') {
            throw new ApiError(405, 'Method Not Allowed');
        }
        if (!event.body) {
            throw new ApiError(400, 'Request body is required.');
        }

        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch {
            throw new ApiError(400, 'Invalid JSON format.');
        }

        const validationResult = orderDataSchema.safeParse(requestData);
        if (!validationResult.success) {
            console.error('❌ Validation failed:', validationResult.error.flatten());
            throw new ApiError(400, `Invalid input: ${validationResult.error.issues[0].message}`);
        }

        const orderData = validationResult.data;
        console.log(`📦 Validated order received: ${orderData.order_id}`);

        const formattedPhone = formatPhoneNumber(orderData.customer_phone);
        const message = generateOrderMessage(orderData);
        const result = await sendWhatsAppMessage(formattedPhone, message);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result) // The 'result' object already contains { success: true, ... }
        };

    } catch (error) {
        console.error('💥 Handler caught an error:', error);

        if (error instanceof ApiError) {
            return {
                statusCode: error.statusCode,
                headers,
                body: JSON.stringify({ success: false, error: error.message })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'An internal server error occurred.' })
        };
    }
};