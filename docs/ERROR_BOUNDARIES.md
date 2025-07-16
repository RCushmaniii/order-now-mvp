# Error Boundary Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install react-error-boundary
```

### 2. Create Error Boundary Files

Create the following files in your project:

```
src/
├── components/
│   ├── ErrorBoundary.tsx
│   └── ComponentErrorBoundary.tsx
├── hooks/
│   └── useAsyncError.ts
└── utils/
    └── errorReporting.ts
```

### 3. Basic Setup (5 minutes)

1. **Copy the ErrorBoundary component** from the guide into `src/components/ErrorBoundary.tsx`

2. **Wrap your app** in `src/main.tsx` or `src/App.tsx`:

```tsx
import { AppErrorBoundary } from "./components/ErrorBoundary";
import App from "./App";

function AppWithErrorBoundary() {
  return (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}

export default AppWithErrorBoundary;
```

3. **Test it works** by adding a temporary error in any component:

```tsx
function TestComponent() {
  throw new Error("Test error boundary");
  return <div>This won't render</div>;
}
```

### 4. Advanced Setup (15 minutes)

1. **Add component-level boundaries** for better error isolation
2. **Set up async error handling** using the `useAsyncError` hook
3. **Configure error reporting** for production monitoring

## Project Structure

```
src/
├── components/
│   ├── ErrorBoundary.tsx              # Main app-level error boundary
│   ├── ComponentErrorBoundary.tsx     # Reusable component-level boundary
│   └── EnvironmentErrorBoundary.tsx   # Environment-specific fallbacks
├── hooks/
│   └── useAsyncError.ts              # Hook for async error handling
├── utils/
│   └── errorReporting.ts             # Error reporting utilities
└── styles/
    └── error-boundary.css            # Error boundary styles
```

## Configuration Options

### Environment Variables

Add these to your `.env` files:

```bash
# .env.development
REACT_APP_ERROR_REPORTING=false

# .env.production
REACT_APP_ERROR_REPORTING=true
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

### TypeScript Configuration

If using TypeScript, add these types to your `src/types/index.ts`:

```typescript
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  componentName?: string;
}

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}
```

## Implementation Checklist

### Basic Implementation
- [ ] Install `react-error-boundary`
- [ ] Create `ErrorBoundary.tsx` component
- [ ] Wrap app root with error boundary
- [ ] Test with intentional error
- [ ] Add basic error logging

### Advanced Implementation
- [ ] Create component-level error boundaries
- [ ] Add async error handling hook
- [ ] Set up error reporting service
- [ ] Add environment-specific fallbacks
- [ ] Style error fallback components
- [ ] Add error recovery mechanisms

### Production Readiness
- [ ] Configure error reporting (Sentry, LogRocket, etc.)
- [ ] Add user-friendly error messages
- [ ] Test error boundaries in different scenarios
- [ ] Set up error monitoring alerts
- [ ] Document error handling patterns for team

## Common Use Cases

### 1. E-commerce App

```tsx
function ProductPage() {
  return (
    <div>
      <ComponentErrorBoundary componentName="ProductDetails">
        <ProductDetails productId={id} />
      </ComponentErrorBoundary>
      
      <ComponentErrorBoundary componentName="Reviews">
        <ProductReviews productId={id} />
      </ComponentErrorBoundary>
      
      <ComponentErrorBoundary componentName="Recommendations">
        <ProductRecommendations productId={id} />
      </ComponentErrorBoundary>
    </div>
  );
}
```

### 2. Dashboard App

```tsx
function Dashboard() {
  return (
    <div className="dashboard">
      <ComponentErrorBoundary componentName="Analytics">
        <AnalyticsWidget />
      </ComponentErrorBoundary>
      
      <ComponentErrorBoundary componentName="UserActivity">
        <UserActivityFeed />
      </ComponentErrorBoundary>
    </div>
  );
}
```

### 3. Form-heavy App

```tsx
function UserRegistration() {
  return (
    <ComponentErrorBoundary componentName="RegistrationForm">
      <RegistrationForm onSubmit={handleSubmit} />
    </ComponentErrorBoundary>
  );
}
```

## Error Reporting Services

### Sentry Setup

```bash
npm install @sentry/react
```

```tsx
// src/utils/errorReporting.ts
import * as Sentry from "@sentry/react";

export function initErrorReporting() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.NODE_ENV,
    });
  }
}

export function reportError(error: Error, errorInfo: any) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: errorInfo,
      tags: { section: 'error_boundary' }
    });
  }
}
```

### LogRocket Setup

```bash
npm install logrocket
```

```tsx
// src/utils/errorReporting.ts
import LogRocket from 'logrocket';

export function initErrorReporting() {
  if (process.env.NODE_ENV === 'production') {
    LogRocket.init('your-app-id');
  }
}

export function reportError(error: Error, errorInfo: any) {
  if (process.env.NODE_ENV === 'production') {
    LogRocket.captureException(error);
  }
}
```

## Testing Error Boundaries

### Manual Testing

Add these test components for development:

```tsx
// src/components/ErrorTest.tsx
export function ErrorTest() {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error("Intentional test error");
  }
  
  return (
    <button onClick={() => setShouldError(true)}>
      Trigger Error
    </button>
  );
}
```

### Jest Testing

```tsx
// src/components/__tests__/ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

test('displays error fallback when child throws', () => {
  render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

## Performance Considerations

- Error boundaries add minimal overhead
- Avoid wrapping every single component
- Use component-level boundaries strategically
- Consider lazy loading for error reporting services

## Troubleshooting

### Common Issues

1. **Error boundary not catching errors**: Make sure errors are in render methods, not event handlers
2. **Infinite error loops**: Check that error boundary component itself doesn't throw
3. **Development vs production behavior**: Error boundaries behave differently in development mode

### Debug Mode

Add this to temporarily show more error details:

```tsx
const DEBUG_ERRORS = process.env.NODE_ENV === 'development';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      {DEBUG_ERRORS && <pre>{error.stack}</pre>}
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}
```

## Next Steps

1. **Monitor errors**: Set up dashboards to track error frequency
2. **User feedback**: Add error reporting forms for user context
3. **Performance**: Monitor error boundary impact on app performance
4. **Team training**: Document error handling patterns for your team

## Resources

- [React Error Boundary Documentation](https://reactjs.org/docs/error-boundaries.html)
- [react-error-boundary Package](https://github.com/bvaughn/react-error-boundary)
- [Error Reporting Best Practices](https://blog.sentry.io/2019/02/26/error-monitoring-crash-reporting-best-practices/)

## Support

If you run into issues:
1. Check the console for error messages
2. Verify error boundaries are properly imported
3. Test with intentional errors first
4. Check that async errors use the `useAsyncError` hook