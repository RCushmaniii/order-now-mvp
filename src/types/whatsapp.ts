export type WhatsAppStatus = 'idle' | 'sending' | 'sent' | 'error';

export interface WhatsAppNotification {
    orderId: string;
    customerPhone: string;
    businessPhone?: string;
    type: 'confirmation' | 'status_update' | 'business_alert';
    language: 'es' | 'en';
}
