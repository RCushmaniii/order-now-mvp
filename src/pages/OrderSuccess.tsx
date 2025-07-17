// src/pages/OrderSuccess.tsx
// FIXED: TypeScript-compliant version with all errors resolved

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, MessageCircle, AlertCircle, ArrowLeft, Smartphone, CheckCheck } from 'lucide-react';
import { whatsappService, OrderData, WhatsAppUtils } from '../services/whatsappService';

// ==================== INTERFACES ====================

interface StoreInfo {
    name: string;
    address: string;
    phone: string;
    type: 'academic' | 'restaurant' | 'consulting';
}

interface OrderSuccessData {
    order_id: string;
    customer_name: string;
    customer_phone: string;
    store_id: string;
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
    }>;
    total_amount: number;
    payment_method: string;
}

interface DebugStep {
    step: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    timestamp: string;
    data?: string | object | null;
}
// ==================== MAIN COMPONENT ====================

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');

    // ==================== STATE ====================

    const [orderData, setOrderData] = useState<OrderSuccessData | null>(null);
    const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [whatsappError, setWhatsappError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [, setStoreInfo] = useState<StoreInfo | null>(null);
    const [debugSteps, setDebugSteps] = useState<DebugStep[]>([]);
    const [showDebug, setShowDebug] = useState(true);

    // ==================== DEBUG UTILITIES ====================

    const addDebugStep = useCallback((step: string, status: 'pending' | 'success' | 'error', message: string, data?: unknown) => {
        const newStep: DebugStep = {
            step,
            status,
            message,
            timestamp: new Date().toLocaleTimeString(),
            data: data || null
        };

        console.log(`🔍 DEBUG [${status.toUpperCase()}] ${step}: ${message}`, data || '');

        setDebugSteps(prev => [...prev, newStep]);
    }, []);

    // ==================== STORAGE DEBUGGING ====================

    const debugStorage = useCallback(() => {
        addDebugStep('STORAGE_CHECK', 'pending', 'Checking all storage methods...');

        // Check sessionStorage
        const sessionData = sessionStorage.getItem('pendingOrderData');
        const altSessionData = sessionStorage.getItem('yapanow_pending_order');

        // Check localStorage
        const localData = localStorage.getItem('yapanow_order_backup');

        // Check URL hash
        const urlHash = window.location.hash;

        const storageDebug = {
            sessionStorage: {
                pendingOrderData: sessionData ? 'FOUND' : 'EMPTY',
                yapanow_pending_order: altSessionData ? 'FOUND' : 'EMPTY'
            },
            localStorage: {
                yapanow_order_backup: localData ? 'FOUND' : 'EMPTY'
            },
            url: {
                hash: urlHash || 'EMPTY',
                search: window.location.search || 'EMPTY',
                session_id: sessionId || 'EMPTY'
            },
            allKeys: {
                sessionStorage: Object.keys(sessionStorage),
                localStorage: Object.keys(localStorage)
            }
        };

        addDebugStep('STORAGE_CHECK', 'success', 'Storage analysis complete', storageDebug);

        // Try to extract order data from any source
        if (sessionData) {
            try {
                const parsed = JSON.parse(sessionData) as OrderSuccessData;
                addDebugStep('PARSE_SESSION', 'success', 'Found order data in sessionStorage', parsed);
                return parsed;
            } catch (error) {
                addDebugStep('PARSE_SESSION', 'error', 'Failed to parse sessionStorage data', error);
            }
        }

        if (altSessionData) {
            try {
                const parsed = JSON.parse(altSessionData) as OrderSuccessData;
                addDebugStep('PARSE_ALT_SESSION', 'success', 'Found order data in alt sessionStorage', parsed);
                return parsed;
            } catch (error) {
                addDebugStep('PARSE_ALT_SESSION', 'error', 'Failed to parse alt sessionStorage data', error);
            }
        }

        if (localData) {
            try {
                const parsed = JSON.parse(localData) as OrderSuccessData;
                addDebugStep('PARSE_LOCAL', 'success', 'Found order data in localStorage', parsed);
                return parsed;
            } catch (error) {
                addDebugStep('PARSE_LOCAL', 'error', 'Failed to parse localStorage data', error);
            }
        }

        addDebugStep('DATA_RECOVERY', 'error', 'No order data found in any storage location');
        return null;
    }, [addDebugStep, sessionId]);

    // ==================== MOCK DATA GENERATOR ====================

    const generateMockOrderData = useCallback((): OrderSuccessData => {
        const mockData: OrderSuccessData = {
            order_id: `MOCK-ORDER-${Date.now()}`,
            customer_name: 'Test Customer',
            customer_phone: '+523315590572', // Your phone number
            store_id: 'bella-italia',
            items: [
                { id: '1', name: 'Margherita Pizza', quantity: 1, price: 12.99 },
                { id: '2', name: 'Pasta Carbonara', quantity: 1, price: 10.99 }
            ],
            total_amount: 23.98,
            payment_method: 'Credit Card'
        };

        addDebugStep('MOCK_DATA', 'success', 'Generated mock order data for testing', mockData);
        return mockData;
    }, [addDebugStep]);

    // ==================== STORE INFO ====================

    const getStoreInfo = useCallback(async (storeId: string): Promise<StoreInfo> => {
        addDebugStep('STORE_INFO', 'pending', `Getting store info for: ${storeId}`);

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

        const store = stores[storeId] || {
            name: 'Unknown Store',
            address: 'Address not available',
            phone: '',
            type: 'restaurant' as const
        };

        addDebugStep('STORE_INFO', 'success', `Store info retrieved: ${store.name}`, store);
        return store;
    }, [addDebugStep]);

    // ==================== WHATSAPP INTEGRATION ====================

    const sendWhatsAppNotifications = useCallback(async (orderInfo: OrderSuccessData, store: StoreInfo) => {
        addDebugStep('WHATSAPP_START', 'pending', 'Starting WhatsApp notification process...');
        setWhatsappStatus('sending');
        setWhatsappError(null);

        try {
            const isAcademicServices = store.type === 'academic';

            // Format order data for WhatsApp
            const whatsappOrderData: OrderData = {
                order_id: orderInfo.order_id,
                customer_name: orderInfo.customer_name,
                customer_phone: WhatsAppUtils.formatPhoneNumber(orderInfo.customer_phone),
                store_name: store.name,
                store_address: store.address,
                store_phone: store.phone,
                total_amount: orderInfo.total_amount,
                currency: isAcademicServices ? 'MXN' : 'USD',
                status: 'confirmed',
                items: orderInfo.items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                delivery_address: store.address,
                special_instructions: '',
                payment_method: orderInfo.payment_method,
                language: isAcademicServices ? 'es' : 'en'
            };

            addDebugStep('WHATSAPP_DATA', 'success', 'WhatsApp order data prepared', whatsappOrderData);

            // Send customer notification
            addDebugStep('WHATSAPP_CUSTOMER', 'pending', `Sending to customer: ${whatsappOrderData.customer_phone}`);

            const customerResult = await whatsappService.sendOrderConfirmation(whatsappOrderData);

            if (customerResult.success) {
                addDebugStep('WHATSAPP_CUSTOMER', 'success', `Customer notification sent! Message ID: ${customerResult.messageId}`, customerResult);
                setWhatsappStatus('sent');
            } else {
                throw new Error(`Customer notification failed: ${customerResult.error}`);
            }

            // Optional: Send business notification
            if (store.phone) {
                addDebugStep('WHATSAPP_BUSINESS', 'pending', `Sending to business: ${store.phone}`);

                const businessResult = await whatsappService.sendBusinessNotification(whatsappOrderData, store.phone);

                if (businessResult.success) {
                    addDebugStep('WHATSAPP_BUSINESS', 'success', `Business notification sent! Message ID: ${businessResult.messageId}`, businessResult);
                } else {
                    addDebugStep('WHATSAPP_BUSINESS', 'error', `Business notification failed: ${businessResult.error}`, businessResult);
                }
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown WhatsApp error';
            addDebugStep('WHATSAPP_ERROR', 'error', errorMessage, error);
            setWhatsappStatus('error');
            setWhatsappError(errorMessage);
        }
    }, [addDebugStep]);

    // ==================== MAIN HANDLER ====================

    const handleOrderSuccess = useCallback(async () => {
        try {
            addDebugStep('INIT', 'pending', 'OrderSuccess component initialized');
            setIsProcessing(true);

            // Step 1: Debug storage
            let orderInfo = debugStorage();

            // Step 2: If no real data, use mock data for testing
            if (!orderInfo) {
                addDebugStep('FALLBACK', 'pending', 'No real order data found, using mock data for testing');
                orderInfo = generateMockOrderData();
            }

            setOrderData(orderInfo);

            // Step 3: Get store information
            const store = await getStoreInfo(orderInfo.store_id);
            setStoreInfo(store);

            // Step 4: Send WhatsApp notifications
            await sendWhatsAppNotifications(orderInfo, store);

            // Step 5: Cleanup
            addDebugStep('CLEANUP', 'success', 'Cleaning up storage...');
            sessionStorage.removeItem('pendingOrderData');
            sessionStorage.removeItem('yapanow_pending_order');
            localStorage.removeItem('yapanow_order_backup');

            addDebugStep('COMPLETE', 'success', 'Order success process completed successfully!');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            addDebugStep('FATAL_ERROR', 'error', `Fatal error: ${errorMessage}`, error);
            console.error('Error processing order success:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [debugStorage, generateMockOrderData, getStoreInfo, sendWhatsAppNotifications, addDebugStep]);

    // ==================== EFFECTS ====================

    useEffect(() => {
        handleOrderSuccess();
    }, [sessionId, handleOrderSuccess]);

    // ==================== RENDER HELPERS ====================

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'sending': return <MessageCircle className="w-6 h-6 text-blue-500 animate-spin" />;
            case 'sent': return <CheckCheck className="w-6 h-6 text-green-500" />;
            case 'error': return <AlertCircle className="w-6 h-6 text-red-500" />;
            default: return <Smartphone className="w-6 h-6 text-gray-400" />;
        }
    };

    const getStatusMessage = () => {
        switch (whatsappStatus) {
            case 'sending': return 'Enviando notificación de WhatsApp...';
            case 'sent': return '¡Notificación de WhatsApp enviada con éxito!';
            case 'error': return `Error al enviar WhatsApp: ${whatsappError}`;
            default: return 'Preparando notificación de WhatsApp...';
        }
    };

    // ==================== RENDER ====================

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-md mx-auto">

                {/* Success Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            ¡Pago Exitoso!
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Gracias por tu pago. Te notificaremos cuando tu orden esté lista.
                        </p>

                        {/* Order Details */}
                        {orderData && (
                            <div className="text-left border-t pt-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Detalles de la Orden</h3>
                                <p className="text-sm text-gray-600">Orden: {orderData.order_id}</p>
                                <p className="text-sm text-gray-600">Cliente: {orderData.customer_name}</p>
                                <p className="text-sm text-gray-600">Total: ${orderData.total_amount.toFixed(2)}</p>
                            </div>
                        )}

                        {/* WhatsApp Status */}
                        <div className="border-t pt-4 mt-4">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                {getStatusIcon(whatsappStatus)}
                                <span className="text-sm font-medium">WhatsApp</span>
                            </div>
                            <p className="text-xs text-gray-600">{getStatusMessage()}</p>
                        </div>

                        {/* Back Button */}
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors mt-6 flex items-center justify-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver al Inicio</span>
                        </button>
                    </div>
                </div>

                {/* Debug Panel */}
                {showDebug && (
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Debug Panel</h3>
                            <button
                                onClick={() => setShowDebug(false)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                Hide
                            </button>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {debugSteps.map((step, index) => (
                                <div key={index} className="text-xs border-b pb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className={`w-2 h-2 rounded-full ${step.status === 'success' ? 'bg-green-500' :
                                            step.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`} />
                                        <span className="font-mono text-gray-500">{step.timestamp}</span>
                                        <span className="font-semibold">{step.step}</span>
                                    </div>
                                    <p className="text-gray-600 ml-4 mt-1">{step.message}</p>
                                    {step.data && (
                                        <pre className="ml-4 mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                            {String(JSON.stringify(step.data, null, 2))}
                                        </pre>
                                    )}
                                </div>
                            ))}
                        </div>

                        {isProcessing && (
                            <div className="text-center mt-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-xs text-gray-500 mt-2">Processing...</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Show Debug Button */}
                {!showDebug && (
                    <button
                        onClick={() => setShowDebug(true)}
                        className="w-full text-xs text-gray-500 hover:text-gray-700 py-2"
                    >
                        Show Debug Panel
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderSuccess;