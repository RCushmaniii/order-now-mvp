import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
});

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Verify authentication
        const token = event.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return { statusCode: 401, body: 'Unauthorized' };
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return { statusCode: 401, body: 'Invalid token' };
        }

        const { storeId, email, businessName } = JSON.parse(event.body || '{}');

        // Check if store already has a Stripe account
        const { data: store } = await supabase
            .from('stores')
            .select('stripe_account_id')
            .eq('id', storeId)
            .single();

        let accountId = store?.stripe_account_id;

        if (!accountId) {
            // Create new Stripe Connect account
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'MX',
                email: email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: 'individual', // or 'company'
                business_profile: {
                    name: businessName,
                },
            });

            accountId = account.id;

            // Save Stripe account ID to database
            await supabase
                .from('stores')
                .update({ stripe_account_id: accountId })
                .eq('id', storeId);
        }

        // Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.URL}/onboarding?stripe_onboarding=refresh`,
            return_url: `${process.env.URL}/onboarding?stripe_onboarding=complete`,
            type: 'account_onboarding',
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ url: accountLink.url }),
        };
    } catch (error) {
        console.error('Error creating Stripe account:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create Stripe account' }),
        };
    }
};