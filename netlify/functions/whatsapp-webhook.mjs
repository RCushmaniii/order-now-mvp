// netlify/functions/whatsapp-webhook.mjs
// Handles incoming WhatsApp messages and webhook verification

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    try {
        // GET request - Webhook verification
        if (event.httpMethod === 'GET') {
            return handleWebhookVerification(event);
        }

        // POST request - Incoming WhatsApp message
        if (event.httpMethod === 'POST') {
            return await handleIncomingMessage(event);
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };

    } catch (error) {
        console.error('WhatsApp webhook error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
}

function handleWebhookVerification(event) {
    const mode = event.queryStringParameters?.['hub.mode'];
    const token = event.queryStringParameters?.['hub.verify_token'];
    const challenge = event.queryStringParameters?.['hub.challenge'];

    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('WhatsApp webhook verified successfully');
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/plain' },
            body: challenge,
        };
    } else {
        console.log('WhatsApp webhook verification failed');
        return {
            statusCode: 403,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Verification failed' }),
        };
    }
}

async function handleIncomingMessage(event) {
    const body = JSON.parse(event.body);

    console.log('Received WhatsApp webhook:', JSON.stringify(body, null, 2));

    // Check if it's a message
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
        const messages = body.entry[0].changes[0].value.messages;

        for (const message of messages) {
            await processIncomingMessage(message, body.entry[0].changes[0].value);
        }
    }

    // Check for status updates (delivery, read receipts)
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.statuses) {
        const statuses = body.entry[0].changes[0].value.statuses;

        for (const status of statuses) {
            await processStatusUpdate(status);
        }
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true }),
    };
}

async function processIncomingMessage(message, value) {
    const customerPhone = message.from;
    const messageText = message.text?.body || '';
    const messageId = message.id;
    const timestamp = message.timestamp;

    console.log(`Message from ${customerPhone}: ${messageText}`);

    // Check if this is a response to an order notification
    if (messageText.toLowerCase().includes('status') ||
        messageText.toLowerCase().includes('order') ||
        messageText.toLowerCase().includes('pedido')) {

        await handleOrderStatusQuery(customerPhone, messageText);
    }

    // Auto-reply for general messages
    if (messageText.toLowerCase().includes('help') ||
        messageText.toLowerCase().includes('ayuda')) {

        await sendAutoReply(customerPhone, 'help');
    }

    // Store message in database for customer service
    await storeIncomingMessage({
        messageId,
        customerPhone,
        messageText,
        timestamp: new Date(timestamp * 1000),
        processed: false
    });
}

async function processStatusUpdate(status) {
    const messageId = status.id;
    const statusType = status.status; // sent, delivered, read, failed
    const timestamp = status.timestamp;

    console.log(`Message ${messageId} status: ${statusType}`);

    // Update message status in database
    await updateMessageStatus(messageId, statusType, timestamp);
}

async function handleOrderStatusQuery(customerPhone, messageText) {
    try {
        // Find the customer's recent orders
        const recentOrders = await findRecentOrdersByPhone(customerPhone);

        if (recentOrders.length === 0) {
            await sendMessage(customerPhone, {
                type: 'text',
                text: {
                    body: 'No encontramos órdenes recientes para este número. Si tienes alguna pregunta, puedes contactar directamente al restaurante.'
                }
            });
            return;
        }

        const latestOrder = recentOrders[0];
        const statusMessage = getOrderStatusMessage(latestOrder);

        await sendMessage(customerPhone, {
            type: 'text',
            text: {
                body: statusMessage
            }
        });

    } catch (error) {
        console.error('Error handling order status query:', error);
        await sendMessage(customerPhone, {
            type: 'text',
            text: {
                body: 'Disculpa, hubo un error al consultar tu orden. Por favor intenta más tarde.'
            }
        });
    }
}

async function sendAutoReply(customerPhone, replyType) {
    const replies = {
        help: {
            es: `¡Hola! 👋 

Soy el asistente de YapaNow. Te puedo ayudar con:

• Estado de tu orden - escribe "estado" o "order status"
• Información de contacto del restaurante
• Preguntas sobre entregas

¿En qué puedo ayudarte?`,
            en: `Hello! 👋

I'm the YapaNow assistant. I can help you with:

• Order status - type "status" or "estado"
• Restaurant contact information
• Delivery questions

How can I help you?`
        }
    };

    await sendMessage(customerPhone, {
        type: 'text',
        text: {
            body: replies[replyType].es // Default to Spanish
        }
    });
}

async function sendMessage(to, message) {
    const url = `${process.env.WHATSAPP_API_BASE_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
        messaging_product: 'whatsapp',
        to: to,
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
            throw new Error(`WhatsApp API error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Message sent successfully:', result);
        return result;

    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}

function getOrderStatusMessage(order) {
    const statusMessages = {
        'pending': `🕐 Tu orden #${order.id} está pendiente de confirmación.\n\nTotal: $${order.total}\nRestaurante: ${order.store_name}`,
        'confirmed': `✅ Tu orden #${order.id} ha sido confirmada.\n\nEstamos preparando tu comida. Tiempo estimado: 15-20 minutos.\n\nTotal: $${order.total}`,
        'preparing': `👨‍🍳 Tu orden #${order.id} se está preparando.\n\nTiempo estimado: 10-15 minutos.\n\nTotal: $${order.total}`,
        'ready': `🎉 ¡Tu orden #${order.id} está lista!\n\nPuedes recogerla en: ${order.store_address}\n\nTotal: $${order.total}`,
        'completed': `⭐ Tu orden #${order.id} ha sido completada.\n\n¡Gracias por elegir ${order.store_name}!\n\nTotal: $${order.total}`,
        'cancelled': `❌ Tu orden #${order.id} ha sido cancelada.\n\nSi tienes preguntas, contacta al restaurante.\n\nTotal: $${order.total}`
    };

    return statusMessages[order.status] || `Tu orden #${order.id} tiene estado: ${order.status}`;
}

// Placeholder functions - implement based on your database
async function findRecentOrdersByPhone(phone) {
    // Implement database query to find orders by phone number
    // Return array of order objects
    return [];
}

async function storeIncomingMessage(messageData) {
    // Implement database storage for incoming messages
    console.log('Storing incoming message:', messageData);
}

async function updateMessageStatus(messageId, status, timestamp) {
    // Implement database update for message status
    console.log('Updating message status:', { messageId, status, timestamp });
}