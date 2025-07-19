/**
 * @file src/pages/NotFound.tsx
 * @description Custom 404 error page with logging and user-friendly design
 */

import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logger } from '../services/logger';

const NotFound: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Log 404 errors with comprehensive context for debugging
        logger.warn('404 page accessed', {
            path: location.pathname,
            fullUrl: window.location.href,
            search: location.search,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            // Help identify broken links
            previousPath: sessionStorage.getItem('previousPath') || 'direct',
            // Track if it's a broken internal link
            isInternalLink: document.referrer.includes(window.location.hostname),
            // User agent for debugging browser-specific issues
            userAgent: navigator.userAgent,
            // Check if it's a missing asset
            isAssetRequest: location.pathname.includes('.js') ||
                location.pathname.includes('.css') ||
                location.pathname.includes('.json') ||
                location.pathname.includes('/api/'),
            // Session information
            sessionDepth: parseInt(sessionStorage.getItem('pageViews') || '0')
        });

        // Track specific missing resources
        if (location.pathname.includes('stripe')) {
            logger.error('Stripe resource not found', {
                resource: location.pathname,
                message: 'Stripe integration file missing - check Stripe setup'
            });
        }
    }, [location]);

    // Popular pages for quick navigation
    const popularPages = [
        { path: '/stores', label: 'Store Directory', icon: '🏪' },
        { path: '/order/bella-italia', label: 'Order Food', icon: '🍕' },
        { path: '/order/dra-veronica-rosas', label: 'Book Consultation', icon: '🔬' },
        { path: '/order-now', label: 'Try Demo', icon: '✨' }
    ];

    const handleGoBack = () => {
        logger.debug('User clicked go back from 404');
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                {/* Error Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
                        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    {/* Error Code */}
                    <h1 className="text-7xl font-bold text-gray-900 mb-2">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>

                    {/* Error Message */}
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Sorry, we couldn't find the page you're looking for. It might have been moved,
                        deleted, or you may have typed the URL incorrectly.
                    </p>

                    {/* Attempted URL */}
                    <div className="bg-gray-100 rounded-lg p-3 mb-8 max-w-md mx-auto">
                        <p className="text-sm text-gray-500">You tried to access:</p>
                        <p className="text-sm font-mono text-gray-700 break-all">{location.pathname}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-[#17c076] hover:bg-[#14a366] text-white font-medium rounded-full transition-colors"
                        onClick={() => logger.info('404 return home clicked')}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Go to Homepage
                    </Link>

                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-full border-2 border-gray-300 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Go Back
                    </button>
                </div>

                {/* Popular Pages */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Pages</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {popularPages.map((page) => (
                            <Link
                                key={page.path}
                                to={page.path}
                                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                onClick={() => logger.info('404 popular page clicked', { destination: page.path })}
                            >
                                <span className="text-2xl mr-3">{page.icon}</span>
                                <span className="text-gray-700 group-hover:text-gray-900 font-medium">
                                    {page.label}
                                </span>
                                <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Help Section */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500 mb-2">
                        Still need help?
                    </p>
                    <div className="flex justify-center space-x-4 text-sm">
                        <a
                            href="#"
                            className="text-[#17c076] hover:text-[#14a366] font-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                logger.info('404 contact support clicked');
                            }}
                        >
                            Contact Support
                        </a>
                        <span className="text-gray-300">|</span>
                        <a
                            href="#"
                            className="text-[#17c076] hover:text-[#14a366] font-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                logger.info('404 report issue clicked');
                            }}
                        >
                            Report an Issue
                        </a>
                    </div>
                </div>

                {/* Development Info */}
                {import.meta.env.DEV && (
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-semibold text-yellow-800 mb-1">Development Mode</p>
                        <p className="text-xs text-yellow-700">
                            Check the console for detailed logging information about this 404 error.
                            Missing Stripe resources indicate Stripe integration needs to be configured.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotFound;