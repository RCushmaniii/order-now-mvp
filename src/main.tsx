import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Log important environment variables in development mode for debugging
if (import.meta.env.MODE === 'development') {
  console.log("WhatsApp API (Frontend):", import.meta.env.VITE_WHATSAPP_API_BASE_URL);
  console.log("Stripe Key:", import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
