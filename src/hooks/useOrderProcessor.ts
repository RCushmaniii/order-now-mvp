import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { whatsappService, type OrderData } from '../services/whatsappService';
import { type StoreInfo, type OrderSuccessData, type DebugStep } from '../types';

const serializeError = (error: unknown) => {
    if (error instanceof Error) {
        return { name: error.name, message: error.message, stack: error.stack };
    }
    return { message: 'An unknown error occurred.', data: String(error) };
};

export const useOrderProcessor = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    // All state is managed here, including WhatsApp status
    const [orderData, setOrderData] = useState<OrderSuccessData | null>(null);
    const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [whatsappError, setWhatsappError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [debugSteps, setDebugSteps] = useState<DebugStep[]>([]);
    const [showDebug, setShowDebug] = useState(true);

    // Debugging is now a local utility within the hook
    const addDebugStep = useCallback((step: string, status: 'pending' | 'success' | 'error', message: string, data?: unknown) => {
        const newStep: DebugStep = { step, status, message, timestamp: new Date().toLocaleTimeString(), data: data === undefined ? null : data };
        console.log(`🔍 DEBUG [${status.toUpperCase()}] ${step}: ${message}`, data || '');
        setDebugSteps(prev => [...prev, newStep]);
    }, []);

    useEffect(() => {
        const processOrder = async () => {
            addDebugStep('INIT', 'pending', 'Order processor initialized');
            setIsProcessing(true);

            try {
                // Step 1: Recover data from storage
                const sessionData = sessionStorage.getItem('yapanow_pending_order');
                if (!sessionData) {
                    throw new Error("Order data could not be found in session storage.");
                }
                const orderInfo = JSON.parse(sessionData) as OrderSuccessData;
                setOrderData(orderInfo);
                addDebugStep('PARSE_SESSION', 'success', 'Found order data', orderInfo);

                // Step 2: Get Store Info (assuming a static list for now)
                // TO (the complete list):
                const stores: Record<string, StoreInfo> = {
                    'dra-veronica-rosas': {
                        name: 'Dra. Verónica Carolina Rosas Espinoza',
                        address: 'Zapopan, Jalisco, México',
                        phone: '+52 33 1234-5678',
                        type: 'academic'
                    },
                    'bella-italia': {
                        name: 'Bella Italia',
                        address: 'Guadalajara, Jalisco, México',
                        phone: '+52 33 8765-4321',
                        type: 'restaurant'
                    }
                };
                const storeInfo = stores[orderInfo.store_id];
                if (!storeInfo) throw new Error(`Store with ID "${orderInfo.store_id}" not found.`);
                addDebugStep('STORE_INFO', 'success', `Store info retrieved: ${storeInfo.name}`, storeInfo);

                // Step 3: Send WhatsApp Notification
                setWhatsappStatus('sending');
                const customerOrderData: OrderData = {
                    order_id: orderInfo.order_id,
                    customer_name: orderInfo.customer_name,
                    customer_phone: orderInfo.customer_phone,
                    store_name: storeInfo.name,
                    total_amount: orderInfo.total_amount,
                    currency: 'USD',
                    status: 'confirmed',
                    items: orderInfo.items,
                    delivery_address: orderInfo.delivery_address || storeInfo.address,
                    payment_method: orderInfo.payment_method,
                    language: storeInfo.type === 'academic' ? 'es' : 'en',
                };

                const response = await whatsappService.sendOrderConfirmation(customerOrderData);
                if (!response.success) {
                    throw new Error(response.error || 'WhatsApp notification failed');
                }
                setWhatsappStatus('sent');
                addDebugStep('WHATSAPP_CUSTOMER', 'success', 'Customer notification sent!', response);

            } catch (error) {
                const serialized = serializeError(error);
                addDebugStep('FATAL_ERROR', 'error', serialized.message, serialized);
                setWhatsappStatus('error');
                setWhatsappError(serialized.message);
            } finally {
                addDebugStep('CLEANUP', 'pending', 'Cleaning up storage...');
                sessionStorage.removeItem('yapanow_pending_order');
                addDebugStep('COMPLETE', 'success', 'Order process finished.');
                setIsProcessing(false);
            }
        };

        processOrder();
    }, [sessionId, addDebugStep]);

    // The hook now returns all the state needed by the UI
    return { orderData, whatsappStatus, whatsappError, isProcessing, debugSteps, showDebug, setShowDebug };
};