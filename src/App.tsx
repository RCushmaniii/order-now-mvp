/**
 * @file App.tsx
 * @description Main application component with routing, error handling, and logging
 * @author YapaNow Development Team
 * @version 2.0.0
 */

import React, { useEffect, lazy, Suspense, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { logger } from './services/logger';
import LoggingErrorBoundary from './components/LoggingErrorBoundary';
import DebugPanel from './components/DebugPanel';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Feature {
  id: string;
  title: string;
  description: string;
  color: string;
  iconPath: string;
}

interface Demo {
  id: string;
  path: string;
  title: string;
  description: string;
  hoverColor: string;
}

interface Benefit {
  title: string;
  description: string;
}

interface FooterLink {
  title: string;
  links: Array<{
    text: string;
    href: string;
    internal: boolean;
  }>;
}

// Global type declarations
declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
  }
  
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

// ============================================
// LAZY LOADING FOR BETTER PERFORMANCE
// ============================================
// Lazy loaded components for better performance
const StoreDirectory = lazy(() => import('./pages/StoreDirectory'));
const OrderPage = lazy(() => import('./pages/OrderPage'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const OrderNowApp = lazy(() => import('./components/OrderNowApp'));
const MarketingPage = lazy(() => import('./pages/MarketingPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ============================================
// CONSTANTS AND CONFIGURATION
// ============================================
// Environment configuration
const SHOW_DEBUG_PANEL = import.meta.env.VITE_DEBUG_PANEL === 'true';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '2.0.0';
const ENVIRONMENT = import.meta.env.MODE;

// Performance monitoring thresholds
const PERFORMANCE_THRESHOLDS = {
  NAVIGATION: 100, // ms
  COMPONENT_RENDER: 16.67, // ms (60fps)
  API_RESPONSE: 1000, // ms
} as const;

// Design system colors
const COLORS = {
  primary: '#17c076',
  primaryHover: '#14a366',
  secondary: '#25d366',
  accent: '#4779ff',
  accentHover: '#3a64d8',
  background: '#f6f6f6',
  white: '#ffffff',
  black: '#000000',
  gray600: 'rgb(75 85 99)',
} as const;

// ============================================
// PERFORMANCE MONITORING HOOK
// ============================================
/**
 * Custom hook to monitor component render performance
 * Logs warnings for slow renders
 */
const useRenderPerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const renderTime = performance.now() - startTime;
      if (renderTime > PERFORMANCE_THRESHOLDS.COMPONENT_RENDER) {
        logger.warn('Slow component render detected', {
          component: componentName,
          renderTime: Math.round(renderTime * 100) / 100,
          threshold: PERFORMANCE_THRESHOLDS.COMPONENT_RENDER,
          exceedBy: Math.round((renderTime - PERFORMANCE_THRESHOLDS.COMPONENT_RENDER) * 100) / 100
        });
      }
    };
  });
};

// ============================================
// NAVIGATION TRACKING COMPONENT
// ============================================
/**
 * Tracks route changes for analytics and debugging
 * Monitors navigation performance
 */
const NavigationLogger = memo(({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    const navigationStartTime = performance.now();

    // Log navigation event with comprehensive context
    logger.info('Navigation occurred', {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      // Track navigation source
      navigationType: window.performance.navigation.type === 1 ? 'reload' : 'navigation',
      // User journey tracking
      previousPath: sessionStorage.getItem('previousPath') || 'direct',
      sessionDepth: parseInt(sessionStorage.getItem('pageViews') || '0') + 1
    });

    // Update session storage for journey tracking
    sessionStorage.setItem('previousPath', location.pathname);
    sessionStorage.setItem('pageViews', String(parseInt(sessionStorage.getItem('pageViews') || '0') + 1));

    // Monitor navigation performance
    requestAnimationFrame(() => {
      const navigationTime = performance.now() - navigationStartTime;
      if (navigationTime > PERFORMANCE_THRESHOLDS.NAVIGATION) {
        logger.warn('Slow navigation detected', {
          path: location.pathname,
          navigationTime: Math.round(navigationTime),
          threshold: PERFORMANCE_THRESHOLDS.NAVIGATION
        });
      }
    });

    // Page view analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return <>{children}</>;
});

NavigationLogger.displayName = 'NavigationLogger';

// ============================================
// LOADING FALLBACK COMPONENT
// ============================================
/**
 * Optimized loading component with performance tracking
 */
const LoadingFallback = memo(() => {
  useEffect(() => {
    logger.debug('Lazy component loading started');
    return () => {
      logger.debug('Lazy component loading completed');
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#17c076] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
});

LoadingFallback.displayName = 'LoadingFallback';

// ============================================
// NAVIGATION HEADER COMPONENT
// ============================================
/**
 * Memoized navigation header for better performance
 * Only re-renders when props change
 */
const NavigationHeader = memo(() => {
  useRenderPerformance('NavigationHeader');

  /**
   * Track navigation clicks for analytics
   */
  const handleNavClick = (destination: string, label: string) => {
    logger.info('Navigation link clicked', {
      destination,
      label,
      source: 'header',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with performance-optimized styling */}
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={() => handleNavClick('/', 'logo')}
            aria-label="YapaNow Home"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: COLORS.primary }}
            >
              <span className="text-white font-bold text-xl">Y</span>
            </div>
            <span className="text-xl font-bold text-black">YapaNow</span>
          </Link>

          {/* Desktop Navigation - using CSS for hover states instead of JS */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/stores"
              className="text-black hover:text-[#17c076] transition-colors font-medium"
              onClick={() => handleNavClick('/stores', 'store-directory')}
            >
              Store Directory
            </Link>
            <Link
              to="/marketing"
              className="text-black hover:text-[#17c076] transition-colors font-medium"
              onClick={() => handleNavClick('/marketing', 'for-businesses')}
            >
              For Businesses
            </Link>
            <div className="flex items-center space-x-3">
              <Link
                to="/order/bella-italia"
                className="bg-[#4779ff] hover:bg-[#3a64d8] text-white px-6 py-2 rounded-full font-medium transition-colors"
                onClick={() => handleNavClick('/order/bella-italia', 'order-food-cta')}
                aria-label="Order Food from Bella Italia"
              >
                Order Food
              </Link>
              <Link
                to="/order/dra-veronica-rosas"
                className="bg-[#17c076] hover:bg-[#14a366] text-white px-6 py-2 rounded-full font-medium transition-colors"
                onClick={() => handleNavClick('/order/dra-veronica-rosas', 'book-demo-cta')}
                aria-label="Book a demo with Dr. Verónica"
              >
                Book a Demo
              </Link>
            </div>
          </div>

          {/* Mobile menu button with accessibility */}
          <button
            className="md:hidden p-2"
            aria-label="Toggle mobile menu"
            onClick={() => logger.debug('Mobile menu toggled')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
});

NavigationHeader.displayName = 'NavigationHeader';

// ============================================
// MAIN APP COMPONENT
// ============================================
/**
 * Root application component
 * Handles global error boundaries, routing, and app-level monitoring
 */
function App() {
  useRenderPerformance('App');

  useEffect(() => {
    /**
     * Log comprehensive app initialization data
     * Useful for debugging environment-specific issues
     */
    const initData = {
      version: APP_VERSION,
      environment: ENVIRONMENT,
      logLevel: import.meta.env.VITE_LOG_LEVEL || 'default',
      debugPanel: SHOW_DEBUG_PANEL,
      timestamp: new Date().toISOString(),
      // Browser information for debugging
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      // Screen information for responsive debugging
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio
      },
      // Performance metrics
      performance: {
        memory: performance.memory ? {
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB',
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + 'MB'
        } : 'Not available',
        navigation: {
          type: performance.navigation.type,
          redirectCount: performance.navigation.redirectCount
        }
      }
    };

    logger.info('YapaNow application initialized', initData);

    /**
     * Global error handlers for comprehensive error tracking
     */

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise,
        stack: event.reason?.stack,
        message: event.reason?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });

      // Prevent default browser error handling in production
      if (ENVIRONMENT === 'production') {
        event.preventDefault();
      }
    };

    // Handle global errors
    const handleError = (event: ErrorEvent) => {
      logger.error('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    };

    // Monitor network status changes
    const handleOffline = () => {
      logger.warn('Application went offline', {
        timestamp: new Date().toISOString()
      });
    };

    const handleOnline = () => {
      logger.info('Application back online', {
        timestamp: new Date().toISOString(),
        downtime: sessionStorage.getItem('offlineTime')
          ? Date.now() - parseInt(sessionStorage.getItem('offlineTime') || '0')
          : 0
      });
      sessionStorage.removeItem('offlineTime');
    };

    // Monitor page visibility for performance tracking
    const handleVisibilityChange = () => {
      logger.debug('Page visibility changed', {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
        timestamp: new Date().toISOString()
      });

      if (document.hidden) {
        sessionStorage.setItem('hiddenTime', String(Date.now()));
      }
    };

    // Set up event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Log initial online status
    if (!navigator.onLine) {
      sessionStorage.setItem('offlineTime', String(Date.now()));
    }

    // Cleanup function
    return () => {
      logger.debug('App component unmounting, cleaning up listeners');
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty deps array - only run on mount

  return (
    <LoggingErrorBoundary>
      <Router>
        <NavigationLogger>
          <div className="min-h-screen bg-white">
            {/* Memoized header for better performance */}
            <NavigationHeader />

            {/* Main content with lazy loading */}
            <main role="main">
              <Suspense fallback={<LoadingFallback />}>
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
              </Suspense>
            </main>

            {/* Conditional debug panel rendering */}
            {SHOW_DEBUG_PANEL && (
              <Suspense fallback={null}>
                <DebugPanel />
              </Suspense>
            )}
          </div>
        </NavigationLogger>
      </Router>
    </LoggingErrorBoundary>
  );
}

// ============================================
// HOMEPAGE COMPONENT
// ============================================
/**
 * Homepage component with performance optimizations
 * Uses React.memo to prevent unnecessary re-renders
 */
const HomePage = memo(() => {
  useRenderPerformance('HomePage');

  useEffect(() => {
    // Track homepage analytics
    logger.info('Homepage viewed', {
      timestamp: new Date().toISOString(),
      sessionDepth: parseInt(sessionStorage.getItem('pageViews') || '1'),
      isFirstVisit: !localStorage.getItem('returningUser')
    });

    // Mark as returning user
    localStorage.setItem('returningUser', 'true');
  }, []);

  /**
   * Track CTA interactions with detailed context
   */
  const trackCTAClick = (button: string, location: string) => {
    logger.info('CTA button clicked', {
      button,
      location,
      timestamp: new Date().toISOString(),
      sessionDepth: parseInt(sessionStorage.getItem('pageViews') || '1')
    });
  };

  return (
    <div>
      {/* Hero Section with optimized rendering */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
            Manage Your Business, <span style={{ color: COLORS.primary }}>Your Way</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Connect with customers through Facebook, WhatsApp, and direct orders.
            The all-in-one platform for restaurants, consultants, and service providers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/order-now"
              className="bg-[#17c076] hover:bg-[#14a366] text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors inline-flex items-center justify-center"
              onClick={() => trackCTAClick('get-demo', 'hero')}
            >
              Get a Demo
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/stores"
              className="bg-white hover:bg-gray-50 text-black border-2 border-gray-200 px-8 py-4 rounded-full font-semibold text-lg transition-colors inline-flex items-center justify-center"
              onClick={() => trackCTAClick('see-pricing', 'hero')}
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid - using CSS Grid for better performance */}
      <section className="py-20 px-4" style={{ backgroundColor: COLORS.background }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-black mb-16">
            Everything You Need to <span style={{ color: COLORS.primary }}>Grow Your Business</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature cards with consistent structure */}
            {features.map((feature, index) => (
              <FeatureCard key={feature.id} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <DemoSection onDemoClick={trackCTAClick} />

      {/* CTA Section */}
      <CTASection onCTAClick={trackCTAClick} />

      {/* Footer */}
      <Footer />
    </div>
  );
});

HomePage.displayName = 'HomePage';

// ============================================
// FEATURE CARD COMPONENT
// ============================================
/**
 * Memoized feature card for performance
 */
const FeatureCard = memo(({ feature, index }: { feature: Feature; index: number }) => {
  useRenderPerformance(`FeatureCard-${index}`);

  const iconBackgroundStyle: React.CSSProperties = {
    backgroundColor: `${feature.color}20`
  };

  const iconStyle: React.CSSProperties = {
    color: feature.color
  };

  return (
    <div className="bg-white p-8 rounded-2xl hover:shadow-lg transition-shadow">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
        style={iconBackgroundStyle}
      >
        <svg className="w-8 h-8" style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.iconPath} />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-black mb-4">{feature.title}</h3>
      <p className="text-gray-600">{feature.description}</p>
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';

// ============================================
// DEMO SECTION COMPONENT
// ============================================
/**
 * Separated demo section for better code organization
 */
const DemoSection = memo(({ onDemoClick }: { onDemoClick: (demo: string, location: string) => void }) => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-black mb-6">
              See YapaNow in <span style={{ color: COLORS.primary }}>Action</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Experience our platform with these live demos. No sign-up required.
            </p>

            <div className="space-y-4">
              {demos.map((demo) => (
                <Link
                  key={demo.id}
                  to={demo.path}
                  className={`block p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-[${demo.hoverColor}] transition-colors group`}
                  onClick={() => onDemoClick(demo.id, 'demo-section')}
                >
                  <h3 className={`text-xl font-semibold text-black group-hover:text-[${demo.hoverColor}] transition-colors mb-2`}>
                    {demo.title}
                  </h3>
                  <p className="text-gray-600">{demo.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-[#f6f6f6] rounded-2xl p-8">
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <BenefitItem key={index} benefit={benefit} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

DemoSection.displayName = 'DemoSection';

// ============================================
// BENEFIT ITEM COMPONENT
// ============================================
const BenefitItem = memo(({ benefit }: { benefit: Benefit }) => (
  <div className="flex items-start space-x-4">
    <div className="w-12 h-12 bg-[#17c076] rounded-full flex items-center justify-center flex-shrink-0">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div>
      <h4 className="font-semibold text-black mb-1">{benefit.title}</h4>
      <p className="text-gray-600">{benefit.description}</p>
    </div>
  </div>
));

BenefitItem.displayName = 'BenefitItem';

// ============================================
// CTA SECTION COMPONENT
// ============================================
const CTASection = memo(({ onCTAClick }: { onCTAClick: (button: string, location: string) => void }) => (
  <section className="py-20 px-4" style={{ backgroundColor: COLORS.primary }}>
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl font-bold text-white mb-6">
        Ready to Transform Your Business?
      </h2>
      <p className="text-xl text-white opacity-90 mb-8">
        Join businesses already using YapaNow to connect with more customers.
      </p>
      <Link
        to="/order-now"
        className="bg-white hover:bg-gray-100 text-[#17c076] px-8 py-4 rounded-full font-semibold text-lg transition-colors inline-flex items-center"
        onClick={() => onCTAClick('start-trial', 'footer-cta')}
      >
        Start 14-Day Free Trial
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </section>
));

CTASection.displayName = 'CTASection';

// ============================================
// FOOTER COMPONENT
// ============================================
const Footer = memo(() => {
  const handleFooterClick = (link: string) => {
    logger.debug('Footer link clicked', { link });
  };

  return (
    <footer className="py-12 px-4 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-[#17c076] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Y</span>
              </div>
              <span className="text-xl font-bold text-black">YapaNow</span>
            </div>
            <p className="text-gray-600">
              The modern way to manage orders and connect with customers.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-black mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.text}>
                    {link.internal ? (
                      <Link
                        to={link.href}
                        className="text-gray-600 hover:text-[#17c076] transition-colors"
                        onClick={() => handleFooterClick(link.text)}
                      >
                        {link.text}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-gray-600 hover:text-[#17c076] transition-colors"
                        onClick={() => handleFooterClick(link.text)}
                      >
                        {link.text}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>&copy; 2025 YapaNow. All rights reserved. Built with React + Vite + Tailwind</p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

// ============================================
// 404 PAGE COMPONENT
// ============================================
/**
 * 404 page with comprehensive error tracking
 */
const NotFoundPage = memo(() => {
  useRenderPerformance('NotFoundPage');

  useEffect(() => {
    // Log 404 errors with context for debugging
    logger.warn('404 page accessed', {
      path: window.location.pathname,
      fullUrl: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      // Help identify broken links
      previousPath: sessionStorage.getItem('previousPath') || 'direct',
      // Track if it's a broken internal link
      isInternalLink: document.referrer.includes(window.location.hostname)
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#17c076] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-black mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="bg-[#17c076] hover:bg-[#14a366] text-white px-6 py-3 rounded-full font-medium transition-colors inline-flex items-center"
          onClick={() => logger.info('404 return home clicked')}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
});

NotFoundPage.displayName = 'NotFoundPage';

// ============================================
// DATA CONSTANTS
// ============================================
// Extracted data for better maintainability

const features: Feature[] = [
  {
    id: 'whatsapp',
    title: 'WhatsApp Integration',
    description: 'Connect with customers on their favorite platform. Send order confirmations and updates automatically.',
    color: COLORS.secondary,
    iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
    id: 'multi-channel',
    title: 'Multi-Channel Orders',
    description: 'Accept orders from Facebook, your website, or WhatsApp. All managed in one simple dashboard.',
    color: COLORS.accent,
    iconPath: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
  },
  {
    id: 'analytics',
    title: 'Real-Time Analytics',
    description: 'Track orders, revenue, and customer behavior. Make data-driven decisions to grow your business.',
    color: COLORS.primary,
    iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  }
];

const demos: Demo[] = [
  {
    id: 'academic-services',
    path: '/order/dra-veronica-rosas',
    title: 'Academic Services Demo',
    description: 'Dr. Verónica\'s biology consulting platform',
    hoverColor: COLORS.primary
  },
  {
    id: 'restaurant',
    path: '/order/bella-italia',
    title: 'Restaurant Demo',
    description: 'Full restaurant ordering experience',
    hoverColor: COLORS.accent
  },
  {
    id: 'modern-ui',
    path: '/order-now',
    title: 'Modern UI Demo',
    description: 'WhatsApp-inspired interface',
    hoverColor: COLORS.secondary
  }
];

const benefits: Benefit[] = [
  {
    title: 'Facebook Integration Ready',
    description: 'Direct "Order Now" buttons on your Facebook page'
  },
  {
    title: 'Multi-Language Support',
    description: 'English and Spanish interfaces included'
  },
  {
    title: 'Payment Processing',
    description: 'Stripe integration for secure payments'
  }
];

const footerLinks: FooterLink[] = [
  {
    title: 'Product',
    links: [
      { text: 'Store Directory', href: '/stores', internal: true },
      { text: 'Demo', href: '/order-now', internal: true },
      { text: 'Pricing', href: '#', internal: false }
    ]
  },
  {
    title: 'Company',
    links: [
      { text: 'For Businesses', href: '/marketing', internal: true },
      { text: 'About', href: '#', internal: false },
      { text: 'Contact', href: '#', internal: false }
    ]
  },
  {
    title: 'Connect',
    links: [
      { text: 'Facebook', href: '#', internal: false },
      { text: 'WhatsApp', href: '#', internal: false },
      { text: 'Support', href: '#', internal: false }
    ]
  }
];



// ============================================
// EXPORT
// ============================================
export default App;