// src/pages/OrderSuccess.tsx (Updated with WhatsApp integration)
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, MessageCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { whatsappService, OrderData, WhatsAppUtils } from '../services/whatsappService';

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

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');

    // State management
    const [orderData, setOrderData] = useState<OrderSuccessData | null>(null);
    const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [whatsappError, setWhatsappError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [storeInfo, setStoreInfo] = useState<any>(null);

    useEffect(() => {
        handleOrderSuccess();
    }, [sessionId]);

    /**
     * Handle the order success flow
     */
    const handleOrderSuccess = async () => {
        try {
            setIsProcessing(true);

            // Get order data from session storage (set in OrderPage before Stripe redirect)
            const pendingOrderData = sessionStorage.getItem('pendingOrderData');

            if (!pendingOrderData) {
                console.warn('No pending order data found');
                return;
            }

            const orderInfo: OrderSuccessData = JSON.parse(pendingOrderData);
            setOrderData(orderInfo);

            // Get store information
            const store = await getStoreInfo(orderInfo.store_id);
            setStoreInfo(store);

            // Send WhatsApp notifications
            await sendWhatsAppNotifications(orderInfo, store);

            // Clear the session storage
            sessionStorage.removeItem('pendingOrderData');

        } catch (error) {
            console.error('Error processing order success:', error);
            setWhatsappStatus('error');
            setWhatsappError('Error al procesar la confirmación de orden');
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * Get store information (mock data for now)
     */
    const getStoreInfo = async (storeId: string) => {
        // Mock store data - replace with actual API call
        const stores: { [key: string]: any } = {
            'dra-veronica-rosas': {
                name: 'Dra. Verónica Carolina Rosas Espinoza',
                address: 'Zapopan, Jalisco, México',
                phone: '+52 33 1234-5678',
                type: 'academic'
            },
            'bella-italia': {
                name: 'Bella Italia',
                address: '123 Main St, City, State 12345',
                phone: '+1 555 123-4567',
                type: 'restaurant'
            }
        };

        return stores[storeId] || {
            name: 'Unknown Store',
            address: 'Address not available',
            phone: '',
            type: 'restaurant'
        };
    };

    /**
     * Send WhatsApp notifications for successful payment
     */
    const sendWhatsAppNotifications = async (orderInfo: OrderSuccessData, store: any) => {
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
                estimated_time: WhatsAppUtils.getEstimatedTime(store.type),
                items: orderInfo.items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                delivery_address: 'Address from order', // Would come from full order data
                special_instructions: '',
                payment_method: orderInfo.payment_method,
                language: isAcademicServices ? 'es' : 'en'
            };

            // Send customer confirmation
            console.log('Sending WhatsApp confirmation to customer...');
            const customerResponse = await whatsappService.sendOrderConfirmation(whatsappOrderData);

            if (!customerResponse.success) {
                throw new Error(`Customer notification failed: ${customerResponse.error}`);
            }

            // Send business notification
            if (store.phone) {
                console.log('Sending WhatsApp notification to business...');
                const businessResponse = await whatsappService.sendBusinessNotification(
                    whatsappOrderData,
                    WhatsAppUtils.formatPhoneNumber(store.phone)
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
            setWhatsappError(error instanceof Error ? error.message : 'Error enviando notificaciones');
        }
    };

    /**
     * Format price based on currency
     */
    const formatPrice = (amount: number, currency: string = 'USD') => {
        if (currency === 'MXN') {
            return `$${amount.toLocaleString('es-MX')} MXN`;
        }
        return `$${amount.toFixed(2)}`;
    };

    /**
     * Get appropriate text based on store type
     */
    const getText = (key: string) => {
        const isAcademicServices = storeInfo?.type === 'academic';

        const texts: { [key: string]: { es: string; en: string } } = {
            orderConfirmed: {
                es: '¡Pago Exitoso!',
                en: 'Payment Successful!'
            },
            thankYou: {
                es: 'Gracias por su pago. Nos pondremos en contacto pronto para coordinar el servicio.',
                en: 'Thank you for your payment. We\'ll notify you when your order is ready.'
            },
            orderNumber: {
                es: 'Número de Orden',
                en: 'Order Number'
            },
            whatsappSent: {
                es: '✅ Notificaciones enviadas por WhatsApp',
                en: '✅ WhatsApp notifications sent'
            },
            whatsappSending: {
                es: 'Enviando notificaciones por WhatsApp...',
                en: 'Sending WhatsApp notifications...'
            },
            whatsappError: {
                es: 'Error enviando notificaciones WhatsApp',
                en: 'Error sending WhatsApp notifications'
            },
            backToHome: {
                es: 'Volver al Inicio',
                en: 'Back to Home'
            },
            newOrder: {
                es: 'Solicitar Otros Servicios',
                en: 'Place Another Order'
            }
        };

        const language = isAcademicServices ? 'es' : 'en';
        return texts[key]?.[language] || key;
    };

    if (isProcessing) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ece5dd' }}>
                <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2">Procesando orden...</h2>
                    <p className="text-gray-600">Confirmando pago y enviando notificaciones</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ece5dd' }}>
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-lg">
                {/* Success Icon */}
                <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#25d366' }} />

                {/* Main Message */}
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#23272a' }}>
                    {getText('orderConfirmed')}
                </h1>

                <p className="mb-6" style={{ color: '#23272a', opacity: 0.8 }}>
                    {getText('thankYou')}
                </p>

                {/* Order Information */}
                {orderData && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <div className="text-sm text-gray-600 mb-2">{getText('orderNumber')}:</div>
                        <div className="font-mono text-lg font-semibold text-gray-800 mb-3">
                            #{orderData.order_id.slice(-8).toUpperCase()}
                        </div>

                        <div className="text-sm text-gray-600 mb-2">Total:</div>
                        <div className="text-xl font-bold text-green-600">
                            {formatPrice(orderData.total_amount, storeInfo?.type === 'academic' ? 'MXN' : 'USD')}
                        </div>

                        {storeInfo && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-sm font-medium text-gray-800">{storeInfo.name}</div>
                                <div className="text-xs text-gray-600">{storeInfo.address}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* WhatsApp Status */}
                <div className="mb-6">
                    {whatsappStatus === 'sending' && (
                        <div className="flex items-center justify-center text-blue-600 text-sm">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            {getText('whatsappSending')}
                        </div>
                    )}

                    {whatsappStatus === 'sent' && (
                        <div className="flex items-center justify-center text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {getText('whatsappSent')}
                        </div>
                    )}

                    {whatsappStatus === 'error' && (
                        <div className="flex items-center justify-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <div>
                                <div>{getText('whatsappError')}</div>
                                {whatsappError && (
                                    <div className="text-xs mt-1 opacity-75">{whatsappError}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/')}
                        style={{ backgroundColor: '#34b7f1' }}
                        className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        {getText('backToHome')}
                    </button>

                    {orderData && (
                        <button
                            onClick={() => navigate(`/order/${orderData.store_id}`)}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {getText('newOrder')}
                        </button>
                    )}
                </div>

                {/* WhatsApp Service Status */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 flex items-center justify-center">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Powered by WhatsApp Business API
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;