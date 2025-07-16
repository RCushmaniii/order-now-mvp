// netlify/functions/send-whatsapp-message.mjs
// Sends WhatsApp messages to customers and store owners

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        };
    }

    try {
        const { messageType, orderData, recipientPhone, customMessage } = JSON.parse(event.body);

        console.log('Sending WhatsApp message:', { messageType, recipientPhone });

        let messageResult;

        switch (messageType) {
            case 'order_confirmation':
                messageResult = await sendOrderConfirmation(orderData, recipientPhone);
                break;
            case 'order_status_update':
                messageResult = await sendOrderStatusUpdate(orderData, recipientPhone);
                break;
            case 'business_notification':
                messageResult = await sendBusinessNotification(orderData, recipientPhone);
                break;
            case 'custom_message':
                messageResult = await sendCustomMessage(customMessage, recipientPhone);
                break;
            default:
                throw new Error(`Unknown message type: ${messageType}`);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                messageId: messageResult.messages[0].id,
                timestamp: new Date().toISOString()
            }),
        };

    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Failed to send message'
            }),
        };
    }
}

async function sendOrderConfirmation(orderData, customerPhone) {
    const message = {
        type: 'template',
        template: {
            name: 'order_confirmation', // Create this template in WhatsApp Manager
            language: {
                code: orderData.language || 'es'
            },
            components: [
                {
                    type: 'header',
                    parameters: [
                        {
                            type: 'text',
                            text: orderData.store_name
                        }
                    ]
                },
                {
                    type: 'body',
                    parameters: [
                        {
                            type: 'text',
                            text: orderData.customer_name
                        },
                        {
                            type: 'text',
                            text: `#${orderData.order_id}`
                        },
                        {
                            type: 'text',
                            text: formatPrice(orderData.total_amount, orderData.currency)
                        },
                        {
                            type: 'text',
                            text: orderData.estimated_time || '15-20 minutos'
                        }
                    ]
                }
            ]
        }
    };

    return await sendMessage(customerPhone, message);
}

async function sendOrderStatusUpdate(orderData, customerPhone) {
    const statusMessages = {
        'confirmed': {
            es: `✅ *Orden Confirmada*\n\n¡Hola ${orderData.customer_name}!\n\nTu orden #${orderData.order_id} ha sido confirmada.\n\n📋 *Resumen:*\n${formatOrderItems(orderData.items)}\n\n💰 *Total:* ${formatPrice(orderData.total_amount, orderData.currency)}\n\n🕐 *Tiempo estimado:* ${orderData.estimated_time || '15-20 minutos'}\n\n📍 *${orderData.store_name}*\n${orderData.store_address}\n\n¡Gracias por tu orden!`,
            en: `✅ *Order Confirmed*\n\nHi ${orderData.customer_name}!\n\nYour order #${orderData.order_id} has been confirmed.\n\n📋 *Summary:*\n${formatOrderItems(orderData.items)}\n\n💰 *Total:* ${formatPrice(orderData.total_amount, orderData.currency)}\n\n🕐 *Estimated time:* ${orderData.estimated_time || '15-20 minutes'}\n\n📍 *${orderData.store_name}*\n${orderData.store_address}\n\nThank you for your order!`
        },
        'preparing': {
            es: `👨‍🍳 *Preparando tu Orden*\n\n¡Hola ${orderData.customer_name}!\n\nTu orden #${orderData.order_id} se está preparando.\n\n🕐 *Tiempo estimado:* ${orderData.estimated_time || '10-15 minutos'}\n\n📍 *${orderData.store_name}*\n${orderData.store_address}`,
            en: `👨‍🍳 *Preparing Your Order*\n\nHi ${orderData.customer_name}!\n\nYour order #${orderData.order_id} is being prepared.\n\n🕐 *Estimated time:* ${orderData.estimated_time || '10-15 minutes'}\n\n📍 *${orderData.store_name}*\n${orderData.store_address}`
        },
        'ready': {
            es: `🎉 *¡Orden Lista!*\n\n¡Hola ${orderData.customer_name}!\n\nTu orden #${orderData.order_id} está lista para recoger.\n\n📍 *Recoger en:*\n${orderData.store_name}\n${orderData.store_address}\n\n💰 *Total:* ${formatPrice(orderData.total_amount, orderData.currency)}\n\n¡Te esperamos!`,
            en: `🎉 *Order Ready!*\n\nHi ${orderData.customer_name}!\n\nYour order #${orderData.order_id} is ready for pickup.\n\n📍 *Pick up at:*\n${orderData.store_name}\n${orderData.store_address}\n\n💰 *Total:* ${formatPrice(orderData.total_amount, orderData.currency)}\n\nWe're waiting for you!`
        },
        'completed': {
            es: `⭐ *Orden Completada*\n\n¡Gracias ${orderData.customer_name}!\n\nTu orden #${orderData.order_id} ha sido completada.\n\n¡Esperamos que hayas disfrutado tu comida!\n\n${orderData.store_name}\n\n¿Te gustaría calificar tu experiencia?`,
            en: `⭐ *Order Completed*\n\nThank you ${orderData.customer_name}!\n\nYour order #${orderData.order_id} has been completed.\n\nWe hope you enjoyed your meal!\n\n${orderData.store_name}\n\nWould you like to rate your experience?`
        },
        'cancelled': {
            es: `❌ *Orden Cancelada*\n\nHola ${orderData.customer_name},\n\nLamentamos informarte que tu orden #${orderData.order_id} ha sido cancelada.\n\n${orderData.cancellation_reason || 'Razón no especificada'}\n\nSi tienes preguntas, contacta directamente al restaurante.\n\n${orderData.store_name}\n${orderData.store_phone}`,
            en: `❌ *Order Cancelled*\n\nHi ${orderData.customer_name},\n\nWe're sorry to inform you that your order #${orderData.order_id} has been cancelled.\n\n${orderData.cancellation_reason || 'No reason specified'}\n\nIf you have questions, please contact the restaurant directly.\n\n${orderData.store_name}\n${orderData.store_phone}`
        }
    };

    const language = orderData.language || 'es';
    const messageText = statusMessages[orderData.status]?.[language] ||
        `Tu orden #${orderData.order_id} tiene estado: ${orderData.status}`;

    const message = {
        type: 'text',
        text: {
            body: messageText
        }
    };

    return await sendMessage(customerPhone, message);
}

async function sendBusinessNotification(orderData, businessPhone) {
    const messageText = `🆕 *Nueva Orden Recibida*\n\n📋 *Orden #${orderData.order_id}*\n\n👤 *Cliente:* ${orderData.customer_name}\n📞 *Teléfono:* ${orderData.customer_phone}\n\n🛍️ *Productos:*\n${formatOrderItems(orderData.items)}\n\n💰 *Total:* ${formatPrice(orderData.total_amount, orderData.currency)}\n\n📍 *Entrega:* ${orderData.delivery_address}\n\n📝 *Instrucciones:* ${orderData.special_instructions || 'Ninguna'}\n\n💳 *Método de pago:* ${orderData.payment_method}\n\n---\n*Responde a este mensaje para actualizar el estado de la orden*`;

    const message = {
        type: 'text',
        text: {
            body: messageText
        }
    };

    return await sendMessage(businessPhone, message);
}

async function sendCustomMessage(messageText, recipientPhone) {
    const message = {
        type: 'text',
        text: {
            body: messageText
        }
    };

    return await sendMessage(recipientPhone, message);
}

async function sendMessage(to, message) {
    const url = `${process.env.WHATSAPP_API_BASE_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhoneNumber(to),
        ...message
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`WhatsApp API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        console.log('Message sent successfully:', result);
        return result;

    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}

function cleanPhoneNumber(phone) {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Add country code if missing (default to Mexico +52)
    if (cleaned.length === 10) {
        return `52${cleaned}`;
    }

    if (cleaned.length === 12 && cleaned.startsWith('52')) {
        return cleaned;
    }

    return cleaned;
}

function formatPrice(amount, currency = 'MXN') {
    const currencySymbols = {
        'MXN': '$',
        'USD': '$',
        'EUR': '€'
    };

    const symbol = currencySymbols[currency.toUpperCase()] || '$';
    return `${symbol}${amount.toLocaleString()}`;
}

function formatOrderItems(items) {
    if (!items || !Array.isArray(items)) {
        return 'Items not available';
    }

    return items.map(item =>
        `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
    ).join('\n');
}