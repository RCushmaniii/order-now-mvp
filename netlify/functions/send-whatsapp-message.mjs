// netlify/functions/send-whatsapp-message.mjs
// Complete WhatsApp Business API integration for YapaNow

import { env } from './utils/env-config.mjs';

// ==================== TYPES ====================

/**
 * @typedef {Object} WhatsAppOrderData
 * @property {string} order_id
 * @property {string} customer_name
 * @property {string} customer_phone
 * @property {string} store_name
 * @property {string} [store_address]
 * @property {string} [store_phone]
 * @property {number} total_amount
 * @property {string} currency
 * @property {Array<{name: string, quantity: number, price: number}>} items
 * @property {string} [delivery_address]
 * @property {string} [special_instructions]
 * @property {string} payment_method
 * @property {'es'|'en'} [language]
 */

/**
 * @typedef {Object} WhatsAppResponse
 * @property {boolean} success
 * @property {string} [messageId]
 * @property {string} [timestamp]
 * @property {string} [error]
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
    // WhatsApp Business API Configuration
    WHATSAPP_TOKEN: env.WHATSAPP_API_KEY || process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_API_URL: env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com/v18.0',

    // Test Configuration
    TEST_MODE: env.NODE_ENV !== 'production',
    TEST_CUSTOMER_PHONE: '+523315590572', // Your test phone

    // Message Configuration
    MAX_MESSAGE_LENGTH: 4096,
    RETRY_ATTEMPTS: 3,
    TIMEOUT: 10000
};

// ==================== UTILITIES ====================

/**
 * Format phone number for WhatsApp API (must include country code)
 */
/**
 * Format phone number for WhatsApp API (must include country code)
 * @param {string} phone - The phone number to format
 * @returns {string} Formatted phone number with country code
 */
function formatPhoneNumber(phone) {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // If starts with 52 (Mexico), keep as is
    if (cleaned.startsWith('52')) {
        return cleaned;
    }

    // If starts with 33 (Guadalajara), add Mexico country code
    if (cleaned.startsWith('33')) {
        return `52${cleaned}`;
    }

    // Default: assume it's a Mexican number
    if (cleaned.length === 10) {
        return `52${cleaned}`;
    }

    return cleaned;
}

/**
 * Generate order confirmation message in Spanish or English
 */
/**
 * Generate order confirmation message in Spanish or English
 * @param {WhatsAppOrderData} orderData - Order data to generate message from
 * @returns {string} Formatted message for WhatsApp
 */
function generateOrderMessage(orderData) {
    const isSpanish = orderData.language === 'es';

    if (isSpanish) {
        return `🎉 *¡Confirmación de Orden - ${orderData.store_name}!*

📋 *Orden #${orderData.order_id}*
👤 Cliente: ${orderData.customer_name}
📱 Teléfono: ${orderData.customer_phone}

📦 *Artículos Ordenados:*
${orderData.items.map(item =>
            `• ${item.name} x${item.quantity} - $${item.price.toFixed(2)}`
        ).join('\n')}

💰 *Total: $${orderData.total_amount.toFixed(2)} ${orderData.currency}*
💳 Método de pago: ${orderData.payment_method}

${orderData.delivery_address ? `📍 Dirección: ${orderData.delivery_address}` : ''}
${orderData.special_instructions ? `📝 Instrucciones: ${orderData.special_instructions}` : ''}

✅ *Su orden ha sido confirmada y será procesada pronto.*
📞 Nos pondremos en contacto si necesitamos más información.

¡Gracias por elegirnos!
🌟 ${orderData.store_name}`;
    }

    return `🎉 *Order Confirmation - ${orderData.store_name}!*

📋 *Order #${orderData.order_id}*
👤 Customer: ${orderData.customer_name}
📱 Phone: ${orderData.customer_phone}

📦 *Items Ordered:*
${orderData.items.map(item =>
        `• ${item.name} x${item.quantity} - $${item.price.toFixed(2)}`
    ).join('\n')}

💰 *Total: $${orderData.total_amount.toFixed(2)} ${orderData.currency}*
💳 Payment method: ${orderData.payment_method}

${orderData.delivery_address ? `📍 Address: ${orderData.delivery_address}` : ''}
${orderData.special_instructions ? `📝 Instructions: ${orderData.special_instructions}` : ''}

✅ *Your order has been confirmed and will be processed soon.*
📞 We'll contact you if we need any additional information.

Thank you for choosing us!
🌟 ${orderData.store_name}`;
}

/**
 * Send WhatsApp message via Meta Business API
 */
/**
 * Send WhatsApp message via Meta Business API
 * @param {string} to - Target phone number
 * @param {string} message - Message content
 * @returns {Promise<WhatsAppResponse>} Response from WhatsApp API
 */
async function sendWhatsAppMessage(to, message) {
    try {
        console.log(`📱 Sending WhatsApp message to ${to}`);

        // In test mode, just log the message
        if (CONFIG.TEST_MODE || !CONFIG.WHATSAPP_TOKEN) {
            console.log('🧪 TEST MODE - WhatsApp Message:');
            console.log(`To: ${to}`);
            console.log(`Message: ${message}`);

            return {
                success: true,
                messageId: `test_msg_${Date.now()}`,
                timestamp: new Date().toISOString()
            };
        }

        // Real WhatsApp API call
        const url = `${CONFIG.WHATSAPP_API_URL}/${CONFIG.WHATSAPP_PHONE_NUMBER_ID}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: {
                    body: message
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`WhatsApp API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();

        return {
            success: true,
            messageId: data.messages?.[0]?.id,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ WhatsApp send error:', error);

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown WhatsApp error'
        };
    }
}

// ==================== MAIN HANDLER ====================

/**
 * Netlify function handler for sending WhatsApp messages
 * @param {object} event - Netlify event object
 * @param {object} context - Netlify context
 * @returns {Promise<{statusCode: number, body: string, headers: object}>} HTTP response
 */
export const handler = async (event, context) => {

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse request body
        if (!event.body) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Request body is required' })
            };
        }

        /** @type {WhatsAppOrderData} */
        const orderData = JSON.parse(event.body);

        // Validate required fields
        if (!orderData.order_id || !orderData.customer_name || !orderData.customer_phone) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required fields: order_id, customer_name, customer_phone'
                })
            };
        }

        console.log('🚀 Processing WhatsApp notification for order:', orderData.order_id);

        // Format phone number
        const formattedPhone = formatPhoneNumber(orderData.customer_phone);

        // Generate message
        const message = generateOrderMessage(orderData);

        // Send WhatsApp message
        const result = await sendWhatsAppMessage(formattedPhone, message);

        if (result.success) {
            console.log(`✅ WhatsApp message sent successfully to ${formattedPhone}`);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    messageId: result.messageId,
                    timestamp: result.timestamp,
                    phone: formattedPhone
                })
            };
        } else {
            console.error(`❌ Failed to send WhatsApp message: ${result.error}`);

            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: result.error
                })
            };
        }

    } catch (error) {
        console.error('💥 Handler error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            })
        };
    }
};