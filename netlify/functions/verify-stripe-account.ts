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
        const token = event.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return { statusCode: 401, body: 'Unauthorized' };
        }

        const { storeId } = JSON.parse(event.body || '{}');

        // Get store's Stripe account ID
        const { data: store } = await supabase
            .from('stores')
            .select('stripe_account_id')
            .eq('id', storeId)
            .single();

        if (!store?.stripe_account_id) {
            return { statusCode: 404, body: 'Stripe account not found' };
        }

        // Check account status
        const account = await stripe.accounts.retrieve(store.stripe_account_id);

        // Update store with Stripe status
        await supabase
            .from('stores')
            .update({
                stripe_charges_enabled: account.charges_enabled,
                stripe_payouts_enabled: account.payouts_enabled,
                stripe_onboarding_completed: account.details_submitted,
                stripe_account_status: account.charges_enabled ? 'active' : 'pending',
                is_active: account.charges_enabled // Activate store when Stripe is ready
            })
            .eq('id', storeId);

        return {
            statusCode: 200,
            body: JSON.stringify({
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                detailsSubmitted: account.details_submitted,
                requirements: account.requirements
            }),
        };
    } catch (error) {
        console.error('Error verifying Stripe account:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to verify Stripe account' }),
        };
    }
};