// src/pages/OrderSuccess.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MessageCircle, AlertCircle, ArrowLeft, Smartphone, CheckCheck } from 'lucide-react';
import { useOrderProcessor } from '../hooks/useOrderProcessor';
import { logger } from '../services/logger';

const OrderSuccess: React.FC = () => {
    const navigate = useNavigate();
    const {
        orderData,
        whatsappStatus,
        whatsappError,
        isProcessing
    } = useOrderProcessor();

    // Log page view
    useEffect(() => {
        logger.info('Order success page viewed', {
            orderId: orderData?.order_id,
            customerName: orderData?.customer_name,
            totalAmount: orderData?.total_amount,
            hasOrderData: !!orderData
        });
    }, [orderData]);

    // Log WhatsApp status changes
    useEffect(() => {
        if (whatsappStatus) {
            const logData = {
                status: whatsappStatus,
                orderId: orderData?.order_id,
                customerPhone: orderData?.customer_phone
            };

            switch (whatsappStatus) {
                case 'sending':
                    logger.debug('WhatsApp notification sending', logData);
                    break;
                case 'sent':
                    logger.info('WhatsApp notification sent successfully', logData);
                    break;
                case 'error':
                    logger.error('WhatsApp notification failed', {
                        ...logData,
                        error: whatsappError,
                        errorType: 'whatsapp_notification_failure'
                    });
                    break;
                default:
                    logger.debug('WhatsApp status changed', logData);
            }
        }
    }, [whatsappStatus, whatsappError, orderData]);

    // Log navigation
    const handleBackToHome = () => {
        logger.debug('User navigating back to home from order success', {
            orderId: orderData?.order_id
        });
        navigate('/');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'sending':
                return <MessageCircle className="w-6 h-6 text-blue-500 animate-spin" />;
            case 'sent':
                return <CheckCheck className="w-6 h-6 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-6 h-6 text-red-500" />;
            default:
                return <Smartphone className="w-6 h-6 text-gray-400" />;
        }
    };

    const getStatusMessage = () => {
        switch (whatsappStatus) {
            case 'sending':
                return 'Enviando notificación de WhatsApp...';
            case 'sent':
                return '¡Notificación de WhatsApp enviada con éxito!';
            case 'error':
                return `Error al enviar WhatsApp: ${whatsappError || 'Error desconocido'}`;
            default:
                return 'Preparando notificación de WhatsApp...';
        }
    };

    // Handle missing order data
    if (!orderData) {
        logger.warn('Order success page accessed without order data', {
            referrer: document.referrer,
            url: window.location.href
        });

        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-center">
                            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                No se encontró información de la orden
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Por favor, vuelve a intentar realizar tu pedido.
                            </p>
                            <button
                                onClick={handleBackToHome}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Volver al Inicio</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                        <div className="text-left border-t pt-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Detalles de la Orden
                            </h3>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Orden:</span> {orderData.order_id}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Cliente:</span> {orderData.customer_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Total:</span> ${orderData.total_amount.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* WhatsApp Status */}
                        <div className="border-t pt-4 mt-4">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                {getStatusIcon(whatsappStatus)}
                                <span className="text-sm font-medium">WhatsApp</span>
                            </div>
                            <p className="text-xs text-gray-600">
                                {getStatusMessage()}
                            </p>
                        </div>

                        {/* Back to Home Button */}
                        <button
                            onClick={handleBackToHome}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors mt-6 flex items-center justify-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver al Inicio</span>
                        </button>
                    </div>
                </div>

                {/* Processing Indicator */}
                {isProcessing && (
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="text-sm text-gray-600 mt-3">
                                Procesando tu orden...
                            </p>
                        </div>
                    </div>
                )}

                {/* Debug Information - Only in Development */}
                {import.meta.env.DEV && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Debug mode active - Check console for detailed logs
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderSuccess;