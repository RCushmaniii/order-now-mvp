# YapaNow API Documentation

## Overview

YapaNow integrates with multiple APIs and services to provide a comprehensive ordering platform. This document covers the payment processing, error handling, and integration patterns used throughout the application.

## Payment Processing API

### Stripe Integration

YapaNow uses Stripe for secure payment processing with enhanced error handling and timeout protection.

#### Configuration

```typescript
// Environment Variables Required
VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY=pk_test_your_key_here

// Stripe Initialization
const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY,
    {
        apiVersion: '2023-10-16',
        locale: 'auto'
    }
);
```

#### Payment Flow

1. **Environment Validation**: Automatic validation on app startup
2. **Stripe Loading**: 10-second timeout with graceful fallback
3. **Payment Processing**: Comprehensive error handling with bilingual messages
4. **Order Persistence**: Automatic storage across multiple fallback methods

#### Error Handling

##### PaymentError Class

```typescript
export class PaymentError extends Error {
    public readonly code?: string;
    public readonly statusCode?: number;

    constructor(message: string, code?: string, statusCode?: number) {
        super(message);
        this.name = 'PaymentError';
        this.code = code;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, PaymentError.prototype);
    }
}
```

##### Error Codes

| Code | Description | User Message (EN) | User Message (ES) |
|------|-------------|-------------------|-------------------|
| `STRIPE_TIMEOUT` | Payment system loading timeout | Payment system loading timeout | Tiempo de carga agotado para el sistema de pagos |
| `STRIPE_LOAD_ERROR` | Network error loading Stripe | Failed to load payment system. Please check your internet connection. | No se pudo cargar el sistema de pagos. Verifique su conexión a internet. |
| `STRIPE_CONFIG_MISSING` | Missing environment configuration | Payment configuration incomplete. Please contact support. | Configuración de pagos incompleta. Contacte al administrador. |
| `STRIPE_UNAVAILABLE` | Payment system unavailable | Payment system unavailable. Please try again later. | Sistema de pagos no disponible. Por favor intente más tarde. |

#### Usage Example

```typescript
try {
    const stripe = await Promise.race([
        stripePromise,
        new Promise<null>((_, reject) => {
            setTimeout(() => {
                reject(new PaymentError(
                    isAcademicServices 
                        ? 'Tiempo de carga agotado para el sistema de pagos'
                        : 'Payment system loading timeout',
                    'STRIPE_TIMEOUT'
                ));
            }, 10000);
        })
    ]);
    
    if (!stripe) {
        throw new PaymentError(
            'Payment system unavailable',
            'STRIPE_UNAVAILABLE'
        );
    }
    
    // Process payment...
    
} catch (error) {
    if (error instanceof PaymentError) {
        console.error(`Payment Error [${error.code}]:`, error.message);
        setError(error.message);
    }
}
```

## Order Validation API

### OrderValidationError Class

```typescript
export class OrderValidationError extends Error {
    public readonly field?: string;
    public readonly code?: string;

    constructor(message: string, field?: string, code?: string) {
        super(message);
        this.name = 'OrderValidationError';
        this.field = field;
        this.code = code;
        Object.setPrototypeOf(this, OrderValidationError.prototype);
    }
}
```

### Validation Methods

#### Cart Validation

```typescript
const validateCart = (cart: CartItem[]): void => {
    if (!cart || cart.length === 0) {
        throw new OrderValidationError(
            'Cart cannot be empty',
            'cart',
            'EMPTY_CART'
        );
    }
    
    cart.forEach((item, index) => {
        if (!item.id || !item.name || item.quantity <= 0) {
            throw new OrderValidationError(
                `Invalid item at position ${index}`,
                `cart[${index}]`,
                'INVALID_ITEM'
            );
        }
    });
};
```

#### Form Validation

```typescript
const validateOrderForm = (): void => {
    const errors = Object.keys(formValidationErrors);
    if (errors.length > 0) {
        const firstError = formValidationErrors[errors[0]];
        throw new OrderValidationError(
            firstError,
            errors[0],
            'VALIDATION_FAILED'
        );
    }
};
```

## Persistent Storage API

### Storage Methods

YapaNow uses multiple fallback storage methods for order persistence:

1. **SessionStorage** (primary)
2. **LocalStorage** (fallback)
3. **URL Hash** (final fallback)

```typescript
interface PendingOrderData {
    order_id: string;
    customer_name: string;
    customer_phone: string;
    store_id: string;
    items: CartItem[];
    total_amount: number;
    payment_method: string;
    timestamp: number;
    delivery_address: string;
    special_instructions?: string;
}

class PersistentStorage {
    static saveOrderData(data: PendingOrderData): boolean {
        // Implementation with multiple fallback methods
    }
    
    static getOrderData(): PendingOrderData | null {
        // Retrieval with fallback chain
    }
    
    static clearOrderData(): void {
        // Clear from all storage methods
    }
}
```

## WhatsApp Integration API

### Service Configuration

```typescript
interface WhatsAppConfig {
    phoneNumber: string;
    businessName: string;
    enableNotifications: boolean;
}

interface WhatsAppMessage {
    to: string;
    message: string;
    orderData?: PendingOrderData;
}
```

### Message Templates

#### Order Confirmation (Spanish - Academic Services)

```typescript
const academicOrderTemplate = (orderData: PendingOrderData) => `
🎓 *Nueva Solicitud de Servicio Académico*

👤 *Cliente:* ${orderData.customer_name}
📱 *Teléfono:* ${orderData.customer_phone}
📋 *ID de Orden:* ${orderData.order_id}

*Servicios Solicitados:*
${orderData.items.map(item => `• ${item.name} (${item.quantity}x)`).join('\n')}

💰 *Total:* $${orderData.total_amount}
📍 *Dirección:* ${orderData.delivery_address}

${orderData.special_instructions ? `📝 *Instrucciones:* ${orderData.special_instructions}` : ''}

⏰ *Fecha:* ${new Date().toLocaleString('es-ES')}
`;
```

#### Order Confirmation (English - Restaurant)

```typescript
const restaurantOrderTemplate = (orderData: PendingOrderData) => `
🍽️ *New Food Order*

👤 *Customer:* ${orderData.customer_name}
📱 *Phone:* ${orderData.customer_phone}
📋 *Order ID:* ${orderData.order_id}

*Items Ordered:*
${orderData.items.map(item => `• ${item.name} (${item.quantity}x) - $${item.price}`).join('\n')}

💰 *Total:* $${orderData.total_amount}
📍 *Delivery Address:* ${orderData.delivery_address}

${orderData.special_instructions ? `📝 *Special Instructions:* ${orderData.special_instructions}` : ''}

⏰ *Order Time:* ${new Date().toLocaleString('en-US')}
`;
```

## Environment Configuration

### Required Environment Variables

```bash
# Stripe Configuration
VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY=pk_test_your_stripe_key

# WhatsApp Configuration (Future)
VITE_WHATSAPP_PHONE_NUMBER=+1234567890
VITE_WHATSAPP_BUSINESS_NAME="YapaNow"

# Error Reporting (Future)
VITE_SENTRY_DSN=your_sentry_dsn
VITE_ERROR_REPORTING_ENABLED=true
```

### Validation Rules

- Stripe keys must start with `pk_test_` (sandbox) or `pk_live_` (production)
- Phone numbers must be in international format (+country code)
- All environment variables prefixed with `VITE_` are exposed to frontend

## Error Monitoring

### Development Logging

```typescript
// Enhanced logging in development mode
if (import.meta.env.DEV) {
    console.log('🔧 Stripe Key Check:', {
        keyExists: !!stripeKey,
        keyPrefix: stripeKey ? stripeKey.substring(0, 7) + '...' : 'N/A',
        keyValid: stripeKey?.startsWith('pk_') || false
    });
}
```

### Production Error Reporting

```typescript
// Future implementation with Sentry
if (import.meta.env.PROD && error instanceof PaymentError) {
    Sentry.captureException(error, {
        tags: {
            errorType: 'payment',
            errorCode: error.code
        },
        extra: {
            orderData: sanitizedOrderData
        }
    });
}
```

## Testing

### Error Simulation

```typescript
// Test payment timeout
const simulateTimeout = () => {
    throw new PaymentError(
        'Simulated timeout error',
        'STRIPE_TIMEOUT'
    );
};

// Test validation error
const simulateValidationError = () => {
    throw new OrderValidationError(
        'Required field missing',
        'customer_name',
        'REQUIRED_FIELD'
    );
};
```

### Manual Testing Checklist

- [ ] Test with missing Stripe key
- [ ] Test with invalid Stripe key format
- [ ] Test payment timeout scenario
- [ ] Test network connectivity issues
- [ ] Test form validation errors
- [ ] Test cart validation errors
- [ ] Test bilingual error messages
- [ ] Test persistent storage fallbacks

## Security Considerations

### API Key Management

- Never commit real API keys to version control
- Use different keys for development and production
- Validate key formats on application startup
- Monitor for key usage and potential breaches

### Error Information

- Sanitize error messages before logging
- Never expose sensitive data in error responses
- Use error codes instead of detailed messages in production
- Implement rate limiting for error reporting

## Support

For API-related issues:

1. Check environment variable configuration
2. Verify network connectivity
3. Review console logs for detailed error information
4. Test with intentional errors to verify error handling
5. Contact development team for integration support