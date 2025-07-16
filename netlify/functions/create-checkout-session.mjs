// netlify/functions/create-checkout-session.mjs
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SANDBOX_SECRET_KEY);

export async function handler(event, context) {
    // Enable CORS for all origins during development
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

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        };
    }

    try {
        // Parse request body
        const { items, customer, store_id, currency = 'mxn', locale = 'es' } = JSON.parse(event.body);

        console.log('Received request:', { items, customer, store_id, currency, locale });

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Items array is required');
        }

        if (!customer || !customer.name || !customer.phone) {
            throw new Error('Customer name and phone are required');
        }

        // Create line items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: currency.toLowerCase(),
                product_data: {
                    name: item.name,
                    description: item.description || '',
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents/centavos
            },
            quantity: item.quantity,
        }));

        console.log('Line items created:', lineItems);

        // Get the origin for redirect URLs
        const origin = event.headers.origin || event.headers.referer?.replace(/\/$/, '') || 'https://yapanow.netlify.app';

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            customer_email: customer.email || undefined,
            locale: locale === 'es' ? 'es' : 'auto',
            success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/order/${store_id}`,
            metadata: {
                store_id: store_id || 'unknown',
                customer_name: customer.name,
                customer_phone: customer.phone,
            },
            // For Mexican businesses, collect billing address
            billing_address_collection: 'auto',
            // Create customer record
            customer_creation: 'always',
        });

        console.log('Stripe session created:', session.id);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                id: session.id,
                url: session.url,
            }),
        };

    } catch (error) {
        console.error('Stripe checkout error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Internal server error',
            }),
        };
    }
}
