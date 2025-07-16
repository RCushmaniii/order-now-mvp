// src/services/whatsappService.ts
// WhatsApp service implementation

// Type definitions for WhatsApp integration
export type WhatsAppStatus = 'idle' | 'sending' | 'sent' | 'error';

export interface OrderData {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  store_name: string;
  store_address?: string;
  store_phone?: string;
  total_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  estimated_time?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  delivery_address: string;
  special_instructions?: string;
  payment_method: string;
  language?: 'es' | 'en';
  cancellation_reason?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  timestamp?: string;
  error?: string;
}

/**
 * WhatsApp Service Class
 * Provides methods to send WhatsApp notifications for orders
 */
class WhatsAppService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/.netlify/functions';
  }

  /**
   * Send order confirmation to customer
   * @param orderData Order data to send
   * @returns WhatsApp response with status
   */
  async sendOrderConfirmation(orderData: OrderData): Promise<WhatsAppResponse> {
    try {
      console.log('Sending order confirmation to customer:', orderData);
      
      // TODO: Replace with actual API call when ready
      // Mock implementation for now
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to send customer notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending confirmation'
      };
    }
  }

  /**
   * Send notification to business about new order
   * @param orderData Order data to send
   * @param businessPhone Business phone number
   * @returns WhatsApp response with status
   */
  async sendBusinessNotification(orderData: OrderData, businessPhone: string): Promise<WhatsAppResponse> {
    try {
      console.log('Sending business notification about order:', orderData);
      console.log('Using business phone:', businessPhone); // Using the parameter to avoid lint error
      
      // TODO: Replace with actual API call when ready
      // Mock implementation for now
      return {
        success: true,
        messageId: `msg_biz_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to send business notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending business notification'
      };
    }
  }
}

/**
 * WhatsApp Utilities
 * Helper functions for WhatsApp integration
 */
export const WhatsAppUtils = {
  /**
   * Format phone number to WhatsApp format with Mexico country code
   * @param phone Phone number to format
   * @returns Formatted phone number
   */
  formatPhoneNumber: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return `52${cleaned}`;
    }

    if (cleaned.length === 12 && cleaned.startsWith('52')) {
      return cleaned;
    }

    return cleaned;
  },

  /**
   * Get estimated delivery/completion time based on order type
   * @param orderType Type of order/business
   * @returns Localized time estimate
   */
  getEstimatedTime: (orderType: string): string => {
    const timeMap: Record<string, string> = {
      'restaurant': '15-20 minutos',
      'academic': '2-3 días hábiles',
      'consulting': '1-2 días hábiles',
      'default': '15-30 minutos'
    };

    return timeMap[orderType] || timeMap.default;
  }
};

// Export singleton instance
export const whatsappService = new WhatsAppService();