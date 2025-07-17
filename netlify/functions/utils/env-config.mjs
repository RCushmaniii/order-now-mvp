/**
 * Environment configuration utility for Netlify functions
 * Loads environment variables from the appropriate .env file based on NODE_ENV
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve path to project root (3 levels up from utils folder)
const rootDir = resolve(__dirname, '../../..');

// Load environment variables based on NODE_ENV
dotenv.config({
  path: process.env.NODE_ENV === 'production'
    ? resolve(rootDir, '.env.production')
    : resolve(rootDir, '.env.development'),
});

// Log important configuration in non-production environments
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('WhatsApp API URL:', process.env.WHATSAPP_API_BASE_URL);
  console.log('Stripe Secret Key configured:', !!process.env.STRIPE_SECRET_KEY);
}

// Export environment variables for easy access
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  WHATSAPP_API_BASE_URL: process.env.WHATSAPP_API_BASE_URL,
  WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};

export default env;
