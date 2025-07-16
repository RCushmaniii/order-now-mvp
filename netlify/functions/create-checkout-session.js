// netlify/functions/create-checkout-session.js
// This creates a Netlify function for Stripe checkout

const stripe = require('stripe')(process.env.STRIPE_SANDBOX_SECRET_KEY);

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { items, customer, store_id, currency = 'mxn', locale = 'es' } = JSON.parse(event.body);

        // Create line items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                    description: item.description,
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents/centavos
            },
            quantity: item.quantity,
        }));

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            customer_email: customer.email,
            locale: locale,
            success_url: `${event.headers.origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${event.headers.origin}/order/dra-veronica-rosas`,
            metadata: {
                store_id: store_id,
                customer_name: customer.name,
                customer_phone: customer.phone,
            },
            // For Mexican businesses, collect billing address
            billing_address_collection: 'required',
            // Add customer details
            customer_creation: 'always',
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                id: session.id,
                url: session.url,
            }),
        };

    } catch (error) {
        console.error('Error creating checkout session:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message,
            }),
        };
    }
};