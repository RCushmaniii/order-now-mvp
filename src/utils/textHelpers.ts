export const getServiceText = (key: string, isAcademicServices: boolean): string => {
    if (isAcademicServices) {
        const academicTexts: { [key: string]: string } = {
            'cart': 'Servicios Solicitados',
            'addToCart': 'Solicitar Servicio',
            'placeOrder': 'Proceder al Pago',
            'orderPlaced': '¡Pago Exitoso!',
            'orderComplete': 'Gracias por su pago. Nos pondremos en contacto pronto para coordinar el servicio.',
            'deliveryAddress': 'Información de Contacto',
            'specialInstructions': 'Detalles Adicionales',
            'specialPlaceholder': '¿Algún detalle específico sobre el servicio requerido?',
            'total': 'Total a Pagar:',
            'loading': 'Procesando pago...',
            'cartEmpty': 'No hay servicios seleccionados',
            'min': 'días hábiles',
            'payment': 'Método de Pago',
            'loadingMenu': 'Cargando servicios...',
            'unavailable': 'No Disponible',
            'payWithStripe': 'Pagar con Tarjeta',
            'paymentSecure': 'Pago 100% Seguro',
            'submitOrder': 'Enviar Solicitud'
        };
        return academicTexts[key] || key;
    }

    const restaurantTexts: { [key: string]: string } = {
        'cart': 'Your Order',
        'addToCart': 'Add to Cart',
        'placeOrder': 'Proceed to Payment',
        'orderPlaced': 'Payment Successful!',
        'orderComplete': 'Thank you for your payment. We\'ll notify you when your order is ready.',
        'deliveryAddress': 'Delivery Address',
        'specialInstructions': 'Special Instructions',
        'specialPlaceholder': 'Any special requests?',
        'total': 'Total:',
        'loading': 'Processing payment...',
        'cartEmpty': 'Your cart is empty',
        'min': 'min',
        'payment': 'Payment Method',
        'loadingMenu': 'Loading menu...',
        'unavailable': 'Unavailable',
        'payWithStripe': 'Pay with Card',
        'paymentSecure': '100% Secure Payment',
        'submitOrder': 'Place Order'
    };
    return restaurantTexts[key] || key;
};

export const formatPrice = (price: number, isAcademicServices: boolean): string => {
    if (isAcademicServices) {
        return `$${price.toLocaleString('es-MX')} MXN`;
    }
    return `$${price.toFixed(2)}`;
};
