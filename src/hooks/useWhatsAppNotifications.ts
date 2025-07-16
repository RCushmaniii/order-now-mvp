// src/hooks/useWhatsAppNotifications.ts
import { useState, useCallback } from 'react';
import { whatsappService, type OrderData, WhatsAppUtils, type WhatsAppStatus } from '../services/whatsappService';
import type { OrderFormData, CartItem } from '../types/order';

interface StoreData {
    id?: string;
    name?: string;
    address?: string;
    phone?: string;
    type?: 'restaurant' | 'academic' | 'consulting';
}

interface OrderWithItems extends OrderFormData {
    order_id?: string;
    total_amount: number;
    items: CartItem[];
}

interface UseWhatsAppNotificationsReturn {
    whatsappEnabled: boolean;
    whatsappStatus: WhatsAppStatus;
    whatsappError: string | null;
    setWhatsappEnabled: (enabled: boolean) => void;
    sendOrderNotifications: (orderData: OrderWithItems, storeData: StoreData) => Promise<void>;
    resetWhatsAppStatus: () => void;
}

export const useWhatsAppNotifications = (): UseWhatsAppNotificationsReturn => {
    const [whatsappEnabled, setWhatsappEnabled] = useState(true);
    const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>('idle');
    const [whatsappError, setWhatsappError] = useState<string | null>(null);

    const sendOrderNotifications = useCallback(async (orderData: OrderWithItems, storeData: StoreData) => {
        if (!whatsappEnabled || !orderData.customer_phone) {
            return;
        }

        setWhatsappStatus('sending');
        setWhatsappError(null);

        try {
            const isAcademicServices = storeData?.type === 'academic' ||
                storeData?.id === 'dra-veronica-rosas';

            // Format order data for WhatsApp
            const whatsappOrderData: OrderData = {
                order_id: orderData.order_id || `ORDER-${Date.now()}`,
                customer_name: orderData.customer_name,
                customer_phone: WhatsAppUtils.formatPhoneNumber(orderData.customer_phone),
                store_name: storeData?.name || 'Unknown Store',
                store_address: storeData?.address || 'Address not available',
                store_phone: storeData?.phone || '',
                total_amount: orderData.total_amount,
                currency: isAcademicServices ? 'MXN' : 'USD',
                status: 'confirmed',
                estimated_time: WhatsAppUtils.getEstimatedTime(
                    isAcademicServices ? 'academic' : 'restaurant'
                ),
                items: orderData.items.map((item: CartItem) => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                delivery_address: orderData.delivery_address || 'Address not provided',
                special_instructions: orderData.special_instructions || '',
                payment_method: orderData.payment_method,
                language: isAcademicServices ? 'es' : 'en'
            };

            // Send customer confirmation
            console.log('Sending WhatsApp confirmation to customer...');
            const customerResponse = await whatsappService.sendOrderConfirmation(whatsappOrderData);

            if (!customerResponse.success) {
                throw new Error(`Customer notification failed: ${customerResponse.error}`);
            }

            // Send business notification if store has WhatsApp
            if (storeData?.phone) {
                console.log('Sending WhatsApp notification to business...');
                const businessResponse = await whatsappService.sendBusinessNotification(
                    whatsappOrderData,
                    WhatsAppUtils.formatPhoneNumber(storeData.phone)
                );

                if (!businessResponse.success) {
                    console.warn('Business notification failed:', businessResponse.error);
                    // Don't fail the whole process if business notification fails
                }
            }

            setWhatsappStatus('sent');

        } catch (error) {
            console.error('WhatsApp notification error:', error);
            setWhatsappStatus('error');
            setWhatsappError(error instanceof Error ? error.message : 'WhatsApp notification failed');
        }
    }, [whatsappEnabled]);

    const resetWhatsAppStatus = useCallback(() => {
        setWhatsappStatus('idle');
        setWhatsappError(null);
    }, []);

    return {
        whatsappEnabled,
        whatsappStatus,
        whatsappError,
        setWhatsappEnabled,
        sendOrderNotifications,
        resetWhatsAppStatus
    };
};