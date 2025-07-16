import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ece5dd' }}>
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#25d366' }} />
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#23272a' }}>¡Pedido Confirmado!</h1>
                <p className="mb-6" style={{ color: '#23272a', opacity: 0.8 }}>
                    Tu pago se procesó exitosamente. Te enviaremos actualizaciones por WhatsApp.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{ backgroundColor: '#34b7f1' }}
                    className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default OrderSuccess;