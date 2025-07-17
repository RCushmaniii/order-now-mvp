import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { z } from 'zod';

// Zod schema for validation
const orderDataSchema = z.object({
    order_id: z.string().min(1),
    customer_name: z.string().min(1),
    customer_phone: z.string().min(10),
    store_name: z.string().min(1),
    total_amount: z.number().positive(),
    currency: z.string().min(3).max(3),
    items: z.array(z.object({
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
    })).min(1),
    payment_method: z.string().min(1),
    language: z.enum(['es', 'en']).optional().default('en'),
    delivery_address: z.string().optional(),
    special_instructions: z.string().optional(),
    status: z.string().optional(),
});
type WhatsAppOrderData = z.infer<typeof orderDataSchema>;

// CONFIGURATION
const CONFIG = {
    WHATSAPP_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_API_URL: process.env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com/v20.0',
    // FIX: Use 'URL', a more reliable Netlify environment variable, to check for production.
    IS_PRODUCTION: process.env.URL?.includes('tienda.rfiiidev.com'),
    SITE_URL: process.env.URL || 'http://localhost:8888',
} as const;


// UTILITIES
function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('52')) return cleaned;
    if (cleaned.length === 10) return `52${cleaned}`;
    return cleaned;
}

function generateOrderMessage(orderData: WhatsAppOrderData): string {
    // This function remains the same as your previous version
    const { language, store_name, order_id, customer_name, customer_phone, items, total_amount, currency, payment_method, delivery_address } = orderData;
    const isSpanish = language === 'es';
    const totalString = `Total: $${total_amount.toFixed(2)} ${currency}`;
    const itemsList = items.map(item => `• ${item.name} x${item.quantity} - $${item.price.toFixed(2)}`).join('\n');
    if (isSpanish) {
        return `🎉 *¡Confirmación de Orden - ${store_name}!*

📋 *Orden #${order_id}*
👤 Cliente: ${customer_name}
📱 Teléfono: ${customer_phone}

📦 *Artículos Ordenados:*
${itemsList}

💰 *${totalString}*
💳 Método de pago: ${payment_method}

${delivery_address ? `📍 Dirección: ${delivery_address}` : ''}

✅ *Su orden ha sido confirmada y será procesada pronto.*

¡Gracias por elegirnos!
🌟 ${store_name}`;
    }
    return `🎉 *Order Confirmation - ${store_name}!*

📋 *Order #${order_id}*
👤 Customer: ${customer_name}
📱 Phone: ${customer_phone}

📦 *Items Ordered:*
${itemsList}

💰 *${totalString}*
💳 Payment method: ${payment_method}

${delivery_address ? `📍 Address: ${delivery_address}` : ''}

✅ *Your order has been confirmed and will be processed soon.*

Thank you for choosing us!
🌟 ${store_name}`;
}


// API CALL LOGIC
async function sendWhatsAppMessage(to: string, message: string) {
    console.log(`Attempting to send message to: ${to}`);

    // Test mode check now relies on the corrected IS_PRODUCTION flag
    if (!CONFIG.IS_PRODUCTION || !CONFIG.WHATSAPP_TOKEN) {
        console.warn('🧪 TEST MODE ENGAGED. No real message sent.');
        return { success: true, messageId: `test_msg_${Date.now()}`, testMode: true };
    }

    const url = `${CONFIG.WHATSAPP_API_URL}/${CONFIG.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const requestBody = { messaging_product: 'whatsapp', to, type: 'text', text: { body: message } };

    console.log('📡 Making REAL API call...');
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${CONFIG.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();
    if (!response.ok) {
        console.error('❌ WhatsApp API Error:', responseData);
        throw new Error(responseData.error?.message || `API Error: ${response.status}`);
    }

    console.log('✅ Message sent successfully via API.');
    return { success: true, messageId: responseData.messages?.[0]?.id, testMode: false };
}

// MAIN HANDLER
export const handler: Handler = async (event: HandlerEvent) => {
    try {
        if (event.httpMethod !== 'POST') return { statusCode: 405 };
        if (!event.body) return { statusCode: 400 };

        const validationResult = orderDataSchema.safeParse(JSON.parse(event.body));
        if (!validationResult.success) {
            console.error('❌ Zod validation failed:', validationResult.error.flatten());
            return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Invalid input.' }) };
        }

        const orderData = validationResult.data;
        const formattedPhone = formatPhoneNumber(orderData.customer_phone);

        // FIX: Pass the formatted phone number to the message generator
        const message = generateOrderMessage({ ...orderData, customer_phone: formattedPhone });

        // Pass the formatted phone number as the recipient
        const result = await sendWhatsAppMessage(formattedPhone, message);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('💥 Handler error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, error: 'Internal server error.' })
        };
    }
};