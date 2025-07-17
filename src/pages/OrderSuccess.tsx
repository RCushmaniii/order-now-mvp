import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MessageCircle, AlertCircle, ArrowLeft, Smartphone, CheckCheck } from 'lucide-react';
import { useOrderProcessor } from '../hooks/useOrderProcessor';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const {
        orderData,
        whatsappStatus,
        whatsappError,
        isProcessing,
        debugSteps,
        showDebug,
        setShowDebug
    } = useOrderProcessor();

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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-md mx-auto">
                {/* Success Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
                        <p className="text-gray-600 mb-6">
                            Gracias por tu pago. Te notificaremos cuando tu orden esté lista.
                        </p>

                        {orderData && (
                            <div className="text-left border-t pt-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Detalles de la Orden</h3>
                                <p className="text-sm text-gray-600">Orden: {orderData.order_id}</p>
                                <p className="text-sm text-gray-600">Cliente: {orderData.customer_name}</p>
                                <p className="text-sm text-gray-600">Total: ${orderData.total_amount.toFixed(2)}</p>
                            </div>
                        )}

                        <div className="border-t pt-4 mt-4">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                {getStatusIcon(whatsappStatus)}
                                <span className="text-sm font-medium">WhatsApp</span>
                            </div>
                            <p className="text-xs text-gray-600">{getStatusMessage()}</p>
                        </div>

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
                                        <span className={`w-2 h-2 rounded-full ${step.status === 'success' ? 'bg-green-500' : step.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                        <span className="font-mono text-gray-500">{step.timestamp}</span>
                                        <span className="font-semibold">{step.step}</span>
                                    </div>
                                    <p className="text-gray-600 ml-4 mt-1">{step.message}</p>
                                    {step.data ? (
                                        <pre className="ml-4 mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                            {JSON.stringify(step.data, null, 2)}
                                        </pre>
                                    ) : null}
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
            </div>
        </div>
    );
};

export default OrderSuccess;