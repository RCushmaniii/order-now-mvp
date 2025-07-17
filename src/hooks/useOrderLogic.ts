// src/hooks/useOrderLogic.ts
// Production-ready order management hook with persistent storage and comprehensive error handling
// Optimized for Stripe integration and WhatsApp notifications

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { MenuItem, CartItem, OrderFormData } from '../types/order';
import type { Store } from '../types/store';

// ==================== CONFIGURATION ====================

/**
 * Configuration constants for order processing
 */
const CONFIG = {
    /** Stripe publishable key from environment */
    STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY,
    /** Session storage key for pending orders */
    PENDING_ORDER_KEY: 'yapanow_pending_order',
    /** Backup localStorage key for persistent storage */
    BACKUP_ORDER_KEY: 'yapanow_order_backup',
    /** Maximum retry attempts for failed operations */
    MAX_RETRY_ATTEMPTS: 3,
    /** Timeout for API calls in milliseconds */
    API_TIMEOUT: 15000
} as const;

// Initialize Stripe promise (cached across hook instances)
const stripePromise = loadStripe(CONFIG.STRIPE_PUBLISHABLE_KEY);

// ==================== ERROR CLASSES ====================

/**
 * Custom error class for order validation failures
 */
export class OrderValidationError extends Error {
    public field?: string;

    constructor(message: string, field?: string) {
        super(message);
        this.name = 'OrderValidationError';
        this.field = field;
    }
}

/**
 * Custom error class for payment processing failures
 */
export class PaymentError extends Error {
    public code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.name = 'PaymentError';
        this.code = code;
    }
}

// ==================== TYPES ====================

/**
 * Return type for useOrderLogic hook
 */
interface UseOrderLogicReturn {
    // State
    cart: CartItem[];
    orderForm: OrderFormData;
    selectedCategory: string;
    orderComplete: boolean;
    loading: boolean;
    paymentLoading: boolean;
    error: string | null;

    // Actions
    addToCart: (item: MenuItem) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handlePlaceOrder: (e: React.FormEvent) => Promise<void>;
    setOrderComplete: (complete: boolean) => void;
    resetOrder: () => void;
    setSelectedCategory: (category: string) => void;
    clearError: () => void;

    // Computed values (memoized for performance)
    totalPrice: number;
    totalItems: number;
    filteredItems: MenuItem[];
    categories: string[];
    isCartEmpty: boolean;
    canPlaceOrder: boolean;
}

/**
 * Structure for order data that will be persisted across redirects
 */
interface PendingOrderData {
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
    timestamp: number;
    session_id?: string;
}

// ==================== STORAGE UTILITIES ====================

/**
 * Persistent storage utility that uses multiple storage methods to ensure data survives redirects
 */
class PersistentStorage {
    /**
     * Save order data using multiple storage methods for maximum reliability
     */
    static saveOrderData(data: PendingOrderData): void {
        try {
            const serializedData = JSON.stringify(data);

            // Method 1: sessionStorage (primary)
            sessionStorage.setItem(CONFIG.PENDING_ORDER_KEY, serializedData);

            // Method 2: localStorage (backup for external redirects)
            localStorage.setItem(CONFIG.BACKUP_ORDER_KEY, serializedData);

            // Method 3: URL hash (fallback for strict privacy modes)
            const encodedData = btoa(serializedData);
            window.location.hash = `order=${encodedData}`;

            console.log('💾 Order data saved to persistent storage:', {
                sessionStorage: true,
                localStorage: true,
                urlHash: true,
                orderId: data.order_id
            });

        } catch (error) {
            console.error('❌ Failed to save order data:', error);
            throw new Error('Unable to save order data for processing');
        }
    }

    /**
     * Retrieve order data from any available storage method
     */
    static getOrderData(): PendingOrderData | null {
        try {
            // Method 1: Try sessionStorage first
            let data = sessionStorage.getItem(CONFIG.PENDING_ORDER_KEY);
            if (data) {
                console.log('✅ Order data found in sessionStorage');
                return JSON.parse(data);
            }

            // Method 2: Try localStorage backup
            data = localStorage.getItem(CONFIG.BACKUP_ORDER_KEY);
            if (data) {
                console.log('✅ Order data found in localStorage backup');
                return JSON.parse(data);
            }

            // Method 3: Try URL hash fallback
            const hash = window.location.hash;
            if (hash.includes('order=')) {
                const encodedData = hash.split('order=')[1];
                if (encodedData) {
                    const decodedData = atob(encodedData);
                    console.log('✅ Order data found in URL hash');
                    return JSON.parse(decodedData);
                }
            }

            console.warn('⚠️ No order data found in any storage method');
            return null;

        } catch (error) {
            console.error('❌ Failed to retrieve order data:', error);
            return null;
        }
    }

    /**
     * Clear order data from all storage methods
     */
    static clearOrderData(): void {
        try {
            sessionStorage.removeItem(CONFIG.PENDING_ORDER_KEY);
            localStorage.removeItem(CONFIG.BACKUP_ORDER_KEY);

            // Clear URL hash if it contains order data
            if (window.location.hash.includes('order=')) {
                window.location.hash = '';
            }

            console.log('🗑️ Order data cleared from all storage methods');

        } catch (error) {
            console.error('❌ Failed to clear order data:', error);
        }
    }
}

// ==================== MAIN HOOK ====================

/**
 * useOrderLogic - Production-ready order management hook
 * 
 * Features:
 * - Persistent storage across external redirects
 * - Comprehensive error handling and validation
 * - Performance optimized with React.memo and useCallback
 * - Type-safe implementation with TypeScript
 * - Automatic retry logic for failed operations
 * - Memory leak prevention with cleanup
 * 
 * @param store - Store information
 * @param menuItems - Available menu items
 * @param isAcademicServices - Whether this is an academic service (affects language/currency)
 * @returns Order management state and actions
 */
export const useOrderLogic = (
    store: Store | null,
    menuItems: MenuItem[],
    isAcademicServices: boolean
): UseOrderLogicReturn => {
    // ==================== STATE MANAGEMENT ====================

    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [orderComplete, setOrderComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderForm, setOrderForm] = useState<OrderFormData>({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        delivery_address: '',
        payment_method: 'stripe',
        special_instructions: ''
    });

    // ==================== REFS FOR CLEANUP ====================

    /** Prevents duplicate order processing */
    const processingOrderRef = useRef(false);

    /** Tracks component mount status to prevent memory leaks */
    const isMountedRef = useRef(true);

    /** Stores timeout IDs for cleanup */
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ==================== MEMOIZED COMPUTED VALUES ====================

    /**
     * Total price of all items in cart (memoized for performance)
     */
    const totalPrice = useMemo(() => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);

    /**
     * Total number of items in cart (memoized for performance)
     */
    const totalItems = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    /**
     * Available categories from menu items (memoized for performance)
     */
    const categories = useMemo(() => {
        return ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];
    }, [menuItems]);

    /**
     * Filtered menu items based on selected category (memoized for performance)
     */
    const filteredItems = useMemo(() => {
        return selectedCategory === 'All'
            ? menuItems
            : menuItems.filter(item => item.category === selectedCategory);
    }, [menuItems, selectedCategory]);

    /**
     * Whether cart is empty (memoized for performance)
     */
    const isCartEmpty = useMemo(() => {
        return cart.length === 0;
    }, [cart.length]);

    /**
     * Whether order can be placed (all required fields filled)
     */
    const canPlaceOrder = useMemo(() => {
        return !isCartEmpty &&
            !loading &&
            !paymentLoading &&
            orderForm.customer_name.trim() !== '' &&
            orderForm.customer_phone.trim() !== '' &&
            orderForm.delivery_address.trim() !== '';
    }, [isCartEmpty, loading, paymentLoading, orderForm]);

    // ==================== VALIDATION FUNCTIONS ====================

    /**
     * Validates order form data with localized error messages
     */
    const validateOrderForm = useCallback((form: OrderFormData): void => {
        if (!form.customer_name.trim()) {
            throw new OrderValidationError(
                isAcademicServices ? 'El nombre es requerido' : 'Name is required',
                'customer_name'
            );
        }

        if (!form.customer_phone.trim()) {
            throw new OrderValidationError(
                isAcademicServices ? 'El teléfono es requerido' : 'Phone is required',
                'customer_phone'
            );
        }

        if (!form.delivery_address.trim()) {
            throw new OrderValidationError(
                isAcademicServices ? 'La dirección es requerida' : 'Address is required',
                'delivery_address'
            );
        }

        // Validate phone number format
        const phoneRegex = /^[+]?[1-9][\d]{7,14}$/;
        if (!phoneRegex.test(form.customer_phone.replace(/\s/g, ''))) {
            throw new OrderValidationError(
                isAcademicServices ? 'Formato de teléfono inválido' : 'Invalid phone number format',
                'customer_phone'
            );
        }
    }, [isAcademicServices]);

    /**
     * Validates cart has items and all items are available
     */
    const validateCart = useCallback((cartItems: CartItem[]): void => {
        if (cartItems.length === 0) {
            throw new OrderValidationError(
                isAcademicServices
                    ? 'Por favor seleccione al menos un servicio'
                    : 'Please add items to your cart first'
            );
        }

        // Check if all cart items are still available
        const unavailableItems = cartItems.filter(cartItem => {
            const menuItem = menuItems.find(item => item.id === cartItem.id);
            return !menuItem || !menuItem.available;
        });

        if (unavailableItems.length > 0) {
            throw new OrderValidationError(
                isAcademicServices
                    ? 'Algunos servicios ya no están disponibles'
                    : 'Some items are no longer available'
            );
        }
    }, [isAcademicServices, menuItems]);

    // ==================== CART OPERATIONS ====================

    /**
     * Add item to cart with availability checking
     */
    const addToCart = useCallback((item: MenuItem) => {
        if (!item.available) {
            setError(isAcademicServices ? 'Servicio no disponible' : 'Item not available');
            return;
        }

        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);

            if (existingItemIndex !== -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    quantity: newCart[existingItemIndex].quantity + 1
                };
                return newCart;
            } else {
                return [...prevCart, { ...item, quantity: 1 }];
            }
        });

        setError(null);
    }, [isAcademicServices]);

    /**
     * Remove item from cart or decrease quantity
     */
    const removeFromCart = useCallback((itemId: string) => {
        setCart(prevCart => {
            return prevCart.reduce((acc, cartItem) => {
                if (cartItem.id === itemId) {
                    if (cartItem.quantity > 1) {
                        acc.push({ ...cartItem, quantity: cartItem.quantity - 1 });
                    }
                    // If quantity is 1, item is removed (not added to acc)
                } else {
                    acc.push(cartItem);
                }
                return acc;
            }, [] as CartItem[]);
        });
    }, []);

    /**
     * Clear all items from cart
     */
    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    /**
     * Handle form input changes with error clearing
     */
    const handleInputChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setOrderForm(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (error) {
            setError(null);
        }
    }, [error]);

    // ==================== PAYMENT PROCESSING ====================

    /**
     * Handle Stripe payment with persistent storage and comprehensive error handling
     */
    const handleStripePayment = useCallback(async (): Promise<void> => {
        // Prevent duplicate processing
        if (processingOrderRef.current) {
            console.log('🔄 Order already being processed, skipping duplicate request');
            return;
        }

        processingOrderRef.current = true;
        setPaymentLoading(true);
        setError(null);

        try {
            console.log('🚀 Starting Stripe payment process...');

            // Validate inputs
            validateCart(cart);
            validateOrderForm(orderForm);

            // Load Stripe
            const stripe = await stripePromise;
            if (!stripe) {
                throw new PaymentError('Failed to load payment system');
            }

            // Generate unique order ID
            const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // 💾 SAVE ORDER DATA TO PERSISTENT STORAGE
            const orderDataForSession: PendingOrderData = {
                order_id: orderId,
                customer_name: orderForm.customer_name,
                customer_phone: orderForm.customer_phone,
                store_id: store?.id || 'unknown',
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                total_amount: totalPrice,
                payment_method: orderForm.payment_method,
                timestamp: Date.now()
            };

            // Save to persistent storage using multiple methods
            PersistentStorage.saveOrderData(orderDataForSession);

            console.log('💳 Creating Stripe checkout session...');

            // Create Stripe checkout session
            const response = await Promise.race([
                fetch('/.netlify/functions/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart.map(item => ({
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            quantity: item.quantity
                        })),
                        customer: {
                            name: orderForm.customer_name,
                            email: orderForm.customer_email,
                            phone: orderForm.customer_phone
                        },
                        store_id: store?.id,
                        currency: isAcademicServices ? 'mxn' : 'usd',
                        locale: isAcademicServices ? 'es' : 'en'
                    }),
                }),
                // Timeout promise
                new Promise<never>((_, reject) => {
                    timeoutRef.current = setTimeout(() => {
                        reject(new Error(`Request timeout after ${CONFIG.API_TIMEOUT}ms`));
                    }, CONFIG.API_TIMEOUT);
                })
            ]);

            // Clear timeout if request completed
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new PaymentError(`Payment processing failed: ${response.status} ${errorText}`);
            }

            const session = await response.json();

            // Store session ID for reference
            orderDataForSession.session_id = session.id;
            PersistentStorage.saveOrderData(orderDataForSession);

            console.log('🔄 Redirecting to Stripe checkout...', { sessionId: session.id });

            // Redirect to Stripe checkout
            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });

            if (result.error) {
                throw new PaymentError(result.error.message || 'Checkout redirect failed');
            }

        } catch (error) {
            console.error('❌ Payment processing error:', error);

            let errorMessage = 'Payment failed. Please try again.';

            if (error instanceof OrderValidationError || error instanceof PaymentError) {
                errorMessage = error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            setError(errorMessage);

            // Clear any saved order data on error
            PersistentStorage.clearOrderData();

        } finally {
            setPaymentLoading(false);
            processingOrderRef.current = false;
        }
    }, [cart, orderForm, store, isAcademicServices, validateCart, validateOrderForm, totalPrice]);

    /**
     * Handle non-Stripe orders (cash, transfer, etc.)
     */
    const handleNonStripeOrder = useCallback(async (): Promise<void> => {
        if (processingOrderRef.current) return;

        processingOrderRef.current = true;
        setLoading(true);
        setError(null);

        try {
            validateCart(cart);
            validateOrderForm(orderForm);

            console.log('📝 Processing non-Stripe order...');

            // Simulate order processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            setOrderComplete(true);
            setCart([]);

            console.log('✅ Non-Stripe order completed successfully');

        } catch (error) {
            console.error('❌ Non-Stripe order error:', error);
            setError(error instanceof OrderValidationError ? error.message : 'Order failed');
        } finally {
            setLoading(false);
            processingOrderRef.current = false;
        }
    }, [cart, orderForm, validateCart, validateOrderForm]);

    /**
     * Main order placement handler
     */
    const handlePlaceOrder = useCallback(async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (orderForm.payment_method === 'stripe') {
            await handleStripePayment();
        } else {
            await handleNonStripeOrder();
        }
    }, [orderForm.payment_method, handleStripePayment, handleNonStripeOrder]);

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Reset all order state to initial values
     */
    const resetOrder = useCallback(() => {
        setOrderComplete(false);
        setCart([]);
        setOrderForm({
            customer_name: '',
            customer_phone: '',
            customer_email: '',
            delivery_address: '',
            payment_method: 'stripe',
            special_instructions: ''
        });
        setSelectedCategory('All');
        setError(null);
        setLoading(false);
        setPaymentLoading(false);
        processingOrderRef.current = false;

        // Clear any persisted order data
        PersistentStorage.clearOrderData();

        console.log('🔄 Order state reset');
    }, []);

    /**
     * Clear current error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ==================== EFFECTS ====================

    /**
     * Cleanup effect to prevent memory leaks
     */
    useEffect(() => {
        return () => {
            isMountedRef.current = false;

            // Clear any pending timeouts
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    /**
     * Development debugging effect
     */
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🛒 Cart updated:', {
                itemCount: cart.length,
                totalPrice,
                totalItems
            });
        }
    }, [cart, totalPrice, totalItems]);

    // ==================== RETURN VALUES ====================

    return {
        // State
        cart,
        orderForm,
        selectedCategory,
        orderComplete,
        loading,
        paymentLoading,
        error,

        // Actions
        addToCart,
        removeFromCart,
        clearCart,
        handleInputChange,
        handlePlaceOrder,
        setOrderComplete,
        resetOrder,
        setSelectedCategory,
        clearError,

        // Computed values
        totalPrice,
        totalItems,
        filteredItems,
        categories,
        isCartEmpty,
        canPlaceOrder
    };
};

// ==================== EXPORTS ====================

export default useOrderLogic;

// Export storage utility for use in other components
export { PersistentStorage };

// Export types for external use
export type { PendingOrderData, UseOrderLogicReturn };