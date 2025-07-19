# YapaNow Logging and Error Handling System

## Overview

This document provides comprehensive guidance for using the YapaNow logging, error handling, and Stripe integration systems. The system is built with TypeScript strict mode compliance, production-ready error boundaries, and comprehensive monitoring capabilities.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Logger Service](#logger-service)
3. [Error Boundaries](#error-boundaries)
4. [Debug Panel](#debug-panel)
5. [Stripe Integration](#stripe-integration)
6. [Routing and 404 Handling](#routing-and-404-handling)
7. [Development Workflow](#development-workflow)
8. [Production Deployment](#production-deployment)

## System Architecture

The logging and error handling system consists of several interconnected components:

```
┌─────────────────────────────────────────────────────────────┐
│                     App.tsx (Root)                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            LoggingErrorBoundary                     │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │              Router                         │    │    │
│  │  │  ┌─────────────────────────────────────┐    │    │    │
│  │  │  │         Page Components             │    │    │    │
│  │  │  │  ┌─────────────────────────────┐    │    │    │    │
│  │  │  │  │    StripeErrorBoundary      │    │    │    │    │
│  │  │  │  │  ┌─────────────────────┐    │    │    │    │    │
│  │  │  │  │  │  Payment Components │    │    │    │    │    │
│  │  │  │  │  └─────────────────────┘    │    │    │    │    │
│  │  │  │  └─────────────────────────────┘    │    │    │    │
│  │  │  └─────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Logger Service │
                   └─────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │   Debug Panel   │
                   └─────────────────┘
```

## Logger Service

### Basic Usage

```typescript
import { logger } from '../services/logger';

// Log levels: debug, info, warn, error
logger.debug('Detailed debugging information');
logger.info('General information');
logger.warn('Warning conditions');
logger.error('Error conditions');
```

### Structured Logging

```typescript
// Always include context for better debugging
logger.info('User action performed', {
  userId: user.id,
  action: 'order_placed',
  orderId: order.id,
  timestamp: new Date().toISOString(),
  metadata: {
    storeId: store.id,
    totalAmount: order.total
  }
});
```

### Environment Configuration

Set these environment variables:

```env
# Development
VITE_LOG_LEVEL=debug
VITE_DEBUG_PANEL=true

# Production
VITE_LOG_LEVEL=info
VITE_DEBUG_PANEL=false
```

## Error Boundaries

### LoggingErrorBoundary

Wraps the entire application to catch unhandled React errors:

```typescript
// Already implemented in App.tsx
<LoggingErrorBoundary>
  <Router>
    {/* Your app content */}
  </Router>
</LoggingErrorBoundary>
```

### StripeErrorBoundary

Specifically handles Stripe-related errors:

```typescript
import StripeErrorBoundary from '../components/StripeErrorBoundary';

function PaymentPage() {
  return (
    <StripeErrorBoundary>
      <PaymentForm />
    </StripeErrorBoundary>
  );
}
```

## Debug Panel

### Features

- Real-time log monitoring in development
- Filter logs by level (debug, info, warn, error)
- Clear logs functionality
- Minimizable interface
- Automatic console interception

### Usage

The debug panel is automatically enabled in development when `VITE_DEBUG_PANEL=true`.

## Stripe Integration

### Safe Stripe Loading

```typescript
import { useStripe } from '../hooks/useStripe';
import StripeErrorBoundary from '../components/StripeErrorBoundary';

function PaymentComponent() {
  const { stripe, loading, error } = useStripe();

  if (loading) {
    return <div>Loading payment system...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Payment system unavailable: {error.message}</p>
      </div>
    );
  }

  return (
    <StripeErrorBoundary>
      {/* Your payment form here */}
    </StripeErrorBoundary>
  );
}
```

### Environment Variables

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

## Routing and 404 Handling

### Current Route Structure

```typescript
<Routes>
  {/* Homepage - eagerly loaded since it's the entry point */}
  <Route path="/" element={<HomePage />} />
  
  {/* Lazy loaded routes for better performance */}
  <Route path="/stores" element={<StoreDirectory />} />
  <Route path="/marketing" element={<MarketingPage />} />
  <Route path="/order/:storeId" element={<OrderPage />} />
  <Route path="/order-now/:storeId" element={<OrderNowApp />} />
  <Route path="/order-now" element={<Navigate to="/order-now/bella-italia" replace />} />
  <Route path="/order-success" element={<OrderSuccess />} />
  <Route path="/order/success" element={<OrderSuccess />} />
  
  {/* 404 catch-all route - must be last */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 404 Error Handling

The `NotFound` component provides:
- Comprehensive 404 error logging
- User-friendly error page
- Popular page suggestions
- Development debugging information

## Development Workflow

### 1. Adding New Components

```typescript
// Always wrap components with appropriate error boundaries
import { logger } from '../services/logger';

function NewComponent() {
  useEffect(() => {
    logger.info('Component mounted', { 
      component: 'NewComponent',
      timestamp: new Date().toISOString()
    });
  }, []);

  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### 2. Error Handling Patterns

```typescript
// Async operations
try {
  const result = await apiCall();
  logger.info('API call successful', { endpoint: '/api/data' });
} catch (error) {
  logger.error('API call failed', {
    endpoint: '/api/data',
    error: error instanceof Error ? error.message : 'Unknown error'
  });
}
```

### 3. Performance Monitoring

```typescript
// Track performance-critical operations
const startTime = performance.now();
await expensiveOperation();
const duration = performance.now() - startTime;

logger.info('Operation completed', {
  operation: 'expensiveOperation',
  duration: Math.round(duration),
  slow: duration > 1000
});
```

## Production Deployment

### Environment Variables

```env
# Required
VITE_LOG_LEVEL=info
VITE_DEBUG_PANEL=false
VITE_APP_VERSION=2.0.0

# Optional Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here

# WhatsApp (if using)
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
```

### Build Verification

```bash
# Ensure TypeScript compilation passes
npm run build

# Check for any remaining type errors
npm run type-check
```

### Monitoring

In production, logs are automatically:
- Formatted as compact JSON
- Filtered to info level and above
- Ready for log aggregation services

## Best Practices

### 1. Logging Guidelines

- **Use appropriate log levels**: debug for development, info for user actions, warn for recoverable issues, error for failures
- **Include context**: Always provide relevant metadata
- **Avoid sensitive data**: Never log passwords, tokens, or personal information
- **Use structured logging**: Consistent object format for better parsing

### 2. Error Handling

- **Fail gracefully**: Always provide fallback UI for errors
- **Log errors with context**: Include component name, user action, and relevant state
- **Use error boundaries**: Prevent entire app crashes from component errors
- **Handle async errors**: Wrap promises in try-catch blocks

### 3. Performance

- **Monitor slow operations**: Log operations that exceed thresholds
- **Use lazy loading**: Split code bundles for faster initial load
- **Implement proper loading states**: Provide feedback during async operations

## Troubleshooting

### Common Issues

1. **Stripe not loading**: Check network connectivity and API keys
2. **Debug panel not showing**: Verify `VITE_DEBUG_PANEL=true` in development
3. **404 errors not logged**: Ensure NotFound component is properly imported
4. **TypeScript errors**: Run `npm run type-check` to identify issues

### Debug Commands

```bash
# Check TypeScript compliance
npm run type-check

# Run development server with debug panel
VITE_DEBUG_PANEL=true npm run dev

# Build for production
npm run build
```

## Support

For questions or issues with the logging and error handling system:

1. Check the console for detailed error messages
2. Review the debug panel in development mode
3. Examine the log output for context
4. Refer to the example files in `src/examples/`

---

**Last Updated**: January 19, 2025  
**Version**: 2.0.0  
**Maintainer**: YapaNow Development Team
