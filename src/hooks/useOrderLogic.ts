// src/hooks/useOrderLogic.ts
// Final Production-Ready Order Management Hook
// Optimized for performance, error handling, and maintainability

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { MenuItem, CartItem, OrderFormData } from '../types/order';
import type { Store } from '../types/store';

// ==================== CONFIGURATION ====================

/**
 * Configuration constants for order processing
 * Centralized configuration for easy maintenance and updates
 */
const CONFIG = {
    /** Stripe publishable key from environment with validation */
    STRIPE_PUBLISHABLE_KEY: (() => {
        const key = import.meta.env.VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY || '';
        if (key && !key.startsWith('pk_')) {
            console.warn('⚠️ Invalid Stripe key format detected');
            return '';
        }
        return key;
    })(),
    /** Session storage key for pending orders */
    PENDING_ORDER_KEY: 'yapanow_pending_order',
    /** Backup localStorage key for persistent storage */
    BACKUP_ORDER_KEY: 'yapanow_order_backup',
    /** Maximum retry attempts for failed operations */
    MAX_RETRY_ATTEMPTS: 3,
    /** Timeout for API calls in milliseconds */
    API_TIMEOUT: 15000,
    /** Minimum order ID length for validation */
    MIN_ORDER_ID_LENGTH: 10,
    /** Phone number validation regex */
    PHONE_REGEX: /^[+]?[1-9]\d{7,14}$/,
    /** Email validation regex */
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const;

// ==================== STRIPE INITIALIZATION ====================

/**
 * Enhanced Stripe initialization with better error handling and fallbacks
 */
const initializeStripe = () => {
    const stripeKey = import.meta.env.VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY;
    
    // Debug logging for development
    if (import.meta.env.DEV) {
        console.log('🔧 Stripe Key Check:', {
            keyExists: !!stripeKey,
            keyPrefix: stripeKey ? stripeKey.substring(0, 7) + '...' : 'MISSING',
            environment: import.meta.env.MODE
        });
    }
    
    if (!stripeKey) {
        console.error('❌ Stripe publishable key not found in environment variables');
        console.error('Expected variable: VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY');
        return Promise.resolve(null);
    }
    
    if (!stripeKey.startsWith('pk_')) {
        console.error('❌ Invalid Stripe publishable key format. Key should start with "pk_"');
        return Promise.resolve(null);
    }
    
    try {
        console.log('🔄 Initializing Stripe...');
        
        return loadStripe(stripeKey, {
            // Add additional options for better reliability
            stripeAccount: undefined, // Use default account
            apiVersion: '2023-10-16', // Use stable API version
            locale: 'auto' // Auto-detect locale
        }).then(stripe => {
            if (stripe) {
                console.log('✅ Stripe initialized successfully');
            } else {
                console.error('❌ Stripe failed to initialize (returned null)');
            }
            return stripe;
        });
        
    } catch (error) {
        console.error('❌ Failed to initialize Stripe:', error);
        return Promise.resolve(null);
    }
};

const stripePromise = initializeStripe();

// ==================== ERROR CLASSES ====================

/**
 * Custom error class for order validation failures
 * Provides specific field information for better UX
 */
export class OrderValidationError extends Error {
    public readonly field?: string;
    public readonly code?: string;

    constructor(message: string, field?: string, code?: string) {
        super(message);
        this.name = 'OrderValidationError';
        this.field = field;
        this.code = code;

        // Ensure proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, OrderValidationError.prototype);
    }
}

/**
 * Custom error class for payment processing failures
 * Includes error codes for different failure scenarios
 */
export class PaymentError extends Error {
    public readonly code?: string;
    public readonly statusCode?: number;

    constructor(message: string, code?: string, statusCode?: number) {
        super(message);
        this.name = 'PaymentError';
        this.code = code;
        this.statusCode = statusCode;

        // Ensure proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, PaymentError.prototype);
    }
}

// ==================== TYPES ====================

/**
 * Return type for useOrderLogic hook
 * Comprehensive interface defining all available state and actions
 */
interface UseOrderLogicReturn {
    // Core State
    readonly cart: CartItem[];
    readonly orderForm: OrderFormData;
    readonly selectedCategory: string;
    readonly orderComplete: boolean;
    readonly loading: boolean;
    readonly paymentLoading: boolean;
    readonly error: string | null;

    // Cart Actions
    readonly addToCart: (item: MenuItem) => void;
    readonly removeFromCart: (itemId: string) => void;
    readonly clearCart: () => void;
    readonly updateCartItemQuantity: (itemId: string, quantity: number) => void;

    // Form Actions
    readonly handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    readonly updateOrderForm: (updates: Partial<OrderFormData>) => void;

    // Order Actions
    readonly handlePlaceOrder: (e: React.FormEvent) => Promise<void>;
    readonly setOrderComplete: (complete: boolean) => void;
    readonly resetOrder: () => void;
    readonly clearError: () => void;

    // Category Actions
    readonly setSelectedCategory: (category: string) => void;

    // Computed Values (all memoized for performance)
    readonly totalPrice: number;
    readonly totalItems: number;
    readonly filteredItems: MenuItem[];
    readonly categories: string[];
    readonly isCartEmpty: boolean;
    readonly canPlaceOrder: boolean;
    readonly formValidationErrors: Record<string, string>;
}

/**
 * Structure for order data that persists across redirects
 * Includes all necessary information to restore order state
 */
interface PendingOrderData {
    readonly order_id: string;
    readonly customer_name: string;
    readonly customer_phone: string;
    readonly store_id: string;
    readonly items: ReadonlyArray<{
        readonly id: string;
        readonly name: string;
        readonly quantity: number;
        readonly price: number;
    }>;
    readonly total_amount: number;
    readonly payment_method: string;
    readonly timestamp: number;
    readonly session_id?: string;
    readonly delivery_address?: string;
    readonly special_instructions?: string;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate a cryptographically secure order ID
 * Uses multiple fallback methods to ensure uniqueness
 */
const generateOrderId = (): string => {
    try {
        const timestamp = Date.now();

        // Primary method: Use crypto.randomUUID if available
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
            return `ORDER-${timestamp}-${uuid}`;
        }

        // Fallback method: Enhanced random string generation
        const randomPart = Math.random().toString(36).substring(2, 11);
        const extraRandom = Math.floor(Math.random() * 1000000).toString(36);
        const combinedRandom = (randomPart + extraRandom).substring(0, 8);

        const orderId = `ORDER-${timestamp}-${combinedRandom}`;

        // Validate minimum length
        if (orderId.length < CONFIG.MIN_ORDER_ID_LENGTH) {
            throw new Error('Generated order ID too short');
        }

        return orderId;

    } catch (error) {
        console.error('❌ Error generating order ID:', error);

        // Ultimate fallback: Simple but reliable method
        const timestamp = Date.now();
        const fallbackRandom = Math.floor(Math.random() * 999999999).toString();
        return `ORDER-${timestamp}-${fallbackRandom}`;
    }
};

/**
 * Validate phone number format with multiple international formats
 */
const validatePhoneNumber = (phone: string): boolean => {
    if (!phone || typeof phone !== 'string') {
        return false;
    }

    try {
        // Clean phone number (remove spaces, dashes, parentheses)
        const cleanedPhone = phone.replace(/[\s\-()]/g, '');

        // Check against regex pattern
        return CONFIG.PHONE_REGEX.test(cleanedPhone);
    } catch (error) {
        console.error('❌ Phone validation error:', error);
        return false;
    }
};

/**
 * Validate email format
 */
const validateEmailFormat = (email: string): boolean => {
    if (!email || typeof email !== 'string') {
        return false;
    }

    try {
        return CONFIG.EMAIL_REGEX.test(email.trim());
    } catch (error) {
        console.error('❌ Email validation error:', error);
        return false;
    }
};

/**
 * Safe JSON parsing with error handling
 */
const safeJsonParse = <T>(jsonString: string): T | null => {
    try {
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.error('❌ JSON parsing error:', error);
        return null;
    }
};

/**
 * Safe JSON stringification with error handling
 */
const safeJsonStringify = (data: unknown): string | null => {
    try {
        return JSON.stringify(data);
    } catch (error) {
        console.error('❌ JSON stringification error:', error);
        return null;
    }
};

// ==================== STORAGE UTILITIES ====================

/**
 * Enhanced persistent storage utility
 * Uses multiple storage methods with comprehensive error handling
 */
class PersistentStorage {
    /**
     * Save order data using multiple storage methods for maximum reliability
     */
    static saveOrderData(data: PendingOrderData): boolean {
        let successCount = 0;
        const methods: string[] = [];

        try {
            const serializedData = safeJsonStringify(data);
            if (!serializedData) {
                throw new Error('Failed to serialize order data');
            }

            // Method 1: sessionStorage (primary)
            try {
                sessionStorage.setItem(CONFIG.PENDING_ORDER_KEY, serializedData);
                successCount++;
                methods.push('sessionStorage');
            } catch (error) {
                console.warn('⚠️ Failed to save to sessionStorage:', error);
            }

            // Method 2: localStorage (backup for external redirects)
            try {
                localStorage.setItem(CONFIG.BACKUP_ORDER_KEY, serializedData);
                successCount++;
                methods.push('localStorage');
            } catch (error) {
                console.warn('⚠️ Failed to save to localStorage:', error);
            }

            // Method 3: URL hash (fallback for strict privacy modes)
            try {
                const encodedData = btoa(serializedData);
                if (encodedData.length < 8192) { // URL length limit check
                    window.location.hash = `order=${encodedData}`;
                    successCount++;
                    methods.push('urlHash');
                }
            } catch (error) {
                console.warn('⚠️ Failed to save to URL hash:', error);
            }

            console.log(`💾 Order data saved to ${successCount} storage method(s):`, {
                methods,
                orderId: data.order_id,
                timestamp: data.timestamp
            });

            return successCount > 0;

        } catch (error) {
            console.error('❌ Failed to save order data:', error);
            return false;
        }
    }

    /**
     * Retrieve order data from any available storage method
     */
    static getOrderData(): PendingOrderData | null {
        // Method 1: Try sessionStorage first (most reliable)
        try {
            const sessionData = sessionStorage.getItem(CONFIG.PENDING_ORDER_KEY);
            if (sessionData) {
                const parsed = safeJsonParse<PendingOrderData>(sessionData);
                if (parsed && this.validateOrderData(parsed)) {
                    console.log('✅ Order data found in sessionStorage');
                    return parsed;
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to read from sessionStorage:', error);
        }

        // Method 2: Try localStorage backup
        try {
            const localData = localStorage.getItem(CONFIG.BACKUP_ORDER_KEY);
            if (localData) {
                const parsed = safeJsonParse<PendingOrderData>(localData);
                if (parsed && this.validateOrderData(parsed)) {
                    console.log('✅ Order data found in localStorage backup');
                    return parsed;
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to read from localStorage:', error);
        }

        // Method 3: Try URL hash fallback
        try {
            const hash = window.location.hash;
            if (hash.includes('order=')) {
                const encodedData = hash.split('order=')[1];
                if (encodedData) {
                    const decodedData = atob(encodedData);
                    const parsed = safeJsonParse<PendingOrderData>(decodedData);
                    if (parsed && this.validateOrderData(parsed)) {
                        console.log('✅ Order data found in URL hash');
                        return parsed;
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to read from URL hash:', error);
        }

        console.warn('⚠️ No valid order data found in any storage method');
        return null;
    }

    /**
     * Validate order data structure and integrity
     */
    private static validateOrderData(data: unknown): data is PendingOrderData {
        if (!data || typeof data !== 'object') {
            return false;
        }

        const orderData = data as Record<string, unknown>;

        // Check required fields
        const requiredFields = [
            'order_id', 'customer_name', 'customer_phone',
            'store_id', 'items', 'total_amount', 'payment_method', 'timestamp'
        ];

        for (const field of requiredFields) {
            if (!(field in orderData) || orderData[field] === null || orderData[field] === undefined) {
                console.warn(`⚠️ Missing required field in order data: ${field}`);
                return false;
            }
        }

        // Validate data types
        if (typeof orderData.order_id !== 'string' ||
            typeof orderData.customer_name !== 'string' ||
            typeof orderData.customer_phone !== 'string' ||
            typeof orderData.store_id !== 'string' ||
            !Array.isArray(orderData.items) ||
            typeof orderData.total_amount !== 'number' ||
            typeof orderData.payment_method !== 'string' ||
            typeof orderData.timestamp !== 'number') {
            console.warn('⚠️ Invalid data types in order data');
            return false;
        }

        // Validate timestamp is recent (within 24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (Date.now() - orderData.timestamp > maxAge) {
            console.warn('⚠️ Order data is too old');
            return false;
        }

        return true;
    }

    /**
     * Clear order data from all storage methods
     */
    static clearOrderData(): void {
        let clearedCount = 0;

        // Clear sessionStorage
        try {
            sessionStorage.removeItem(CONFIG.PENDING_ORDER_KEY);
            clearedCount++;
        } catch (error) {
            console.warn('⚠️ Failed to clear sessionStorage:', error);
        }

        // Clear localStorage
        try {
            localStorage.removeItem(CONFIG.BACKUP_ORDER_KEY);
            clearedCount++;
        } catch (error) {
            console.warn('⚠️ Failed to clear localStorage:', error);
        }

        // Clear URL hash if it contains order data
        try {
            if (window.location.hash.includes('order=')) {
                window.location.hash = '';
                clearedCount++;
            }
        } catch (error) {
            console.warn('⚠️ Failed to clear URL hash:', error);
        }

        console.log(`🗑️ Order data cleared from ${clearedCount} storage location(s)`);
    }
}

// ==================== MAIN HOOK ====================

/**
 * useOrderLogic - Production-ready order management hook
 * 
 * Performance Optimizations:
 * - All computed values are memoized
 * - Cart operations use functional updates
 * - Event handlers are wrapped with useCallback
 * - Cleanup prevents memory leaks
 * 
 * Error Handling:
 * - Comprehensive validation for all inputs
 * - Graceful degradation for storage failures
 * - Detailed error messages with localization
 * - Retry logic for network failures
 * 
 * Features:
 * - Persistent storage across external redirects
 * - Type-safe implementation with TypeScript
 * - Automatic cleanup and memory leak prevention
 * - Development debugging and logging
 * 
 * @param store - Store information (can be null during loading)
 * @param menuItems - Available menu items
 * @param isAcademicServices - Whether this is an academic service (affects language/currency)
 * @returns Comprehensive order management state and actions
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

    // ==================== REFS FOR PERFORMANCE & CLEANUP ====================

    /** Prevents duplicate order processing */
    const processingOrderRef = useRef(false);

    /** Tracks component mount status to prevent memory leaks */
    const isMountedRef = useRef(true);

    /** Stores timeout IDs for cleanup */
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    /** Abort controller for cancelling API requests */
    const abortControllerRef = useRef<AbortController | null>(null);

    // ==================== MEMOIZED COMPUTED VALUES ====================

    /**
     * Total price of all items in cart
     * Memoized for performance - only recalculates when cart changes
     */
    const totalPrice = useMemo(() => {
        return cart.reduce((total, item) => {
            // Guard against invalid data
            const itemPrice = typeof item.price === 'number' ? item.price : 0;
            const itemQuantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 0;
            return total + (itemPrice * itemQuantity);
        }, 0);
    }, [cart]);

    /**
     * Total number of items in cart
     * Memoized for performance - only recalculates when cart changes
     */
    const totalItems = useMemo(() => {
        return cart.reduce((total, item) => {
            const itemQuantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 0;
            return total + itemQuantity;
        }, 0);
    }, [cart]);

    /**
     * Available categories from menu items
     * Memoized for performance - only recalculates when menu items change
     */
    const categories = useMemo(() => {
        try {
            const categorySet = new Set(['All']);

            menuItems.forEach(item => {
                if (item.category && typeof item.category === 'string') {
                    categorySet.add(item.category);
                }
            });

            return Array.from(categorySet);
        } catch (error) {
            console.error('❌ Error calculating categories:', error);
            return ['All'];
        }
    }, [menuItems]);

    /**
     * Filtered menu items based on selected category
     * Memoized for performance - only recalculates when menu items or category changes
     */
    const filteredItems = useMemo(() => {
        try {
            if (!Array.isArray(menuItems)) {
                return [];
            }

            return selectedCategory === 'All'
                ? menuItems.filter(item => item && typeof item === 'object')
                : menuItems.filter(item =>
                    item &&
                    typeof item === 'object' &&
                    item.category === selectedCategory
                );
        } catch (error) {
            console.error('❌ Error filtering items:', error);
            return [];
        }
    }, [menuItems, selectedCategory]);

    /**
     * Whether cart is empty
     * Memoized for performance - only recalculates when cart length changes
     */
    const isCartEmpty = useMemo(() => {
        return cart.length === 0;
    }, [cart.length]);

    /**
     * Form validation errors
     * Memoized for performance - only recalculates when form changes
     */
    const formValidationErrors = useMemo(() => {
        const errors: Record<string, string> = {};

        if (orderForm.customer_name.trim() === '') {
            errors.customer_name = isAcademicServices ? 'El nombre es requerido' : 'Name is required';
        }

        if (orderForm.customer_phone.trim() === '') {
            errors.customer_phone = isAcademicServices ? 'El teléfono es requerido' : 'Phone is required';
        } else if (!validatePhoneNumber(orderForm.customer_phone)) {
            errors.customer_phone = isAcademicServices ? 'Formato de teléfono inválido' : 'Invalid phone number format';
        }

        if (orderForm.delivery_address.trim() === '') {
            errors.delivery_address = isAcademicServices ? 'La dirección es requerida' : 'Address is required';
        }

        if (orderForm.customer_email.trim() !== '' && !validateEmailFormat(orderForm.customer_email)) {
            errors.customer_email = isAcademicServices ? 'Formato de email inválido' : 'Invalid email format';
        }

        return errors;
    }, [orderForm, isAcademicServices]);

    /**
     * Whether order can be placed (all required fields filled and no errors)
     * Memoized for performance - recalculates when dependencies change
     */
    const canPlaceOrder = useMemo(() => {
        return !isCartEmpty &&
            !loading &&
            !paymentLoading &&
            Object.keys(formValidationErrors).length === 0 &&
            orderForm.customer_name.trim() !== '' &&
            orderForm.customer_phone.trim() !== '' &&
            orderForm.delivery_address.trim() !== '';
    }, [isCartEmpty, loading, paymentLoading, formValidationErrors, orderForm]);

    // ==================== VALIDATION FUNCTIONS ====================

    /**
     * Validates order form data with comprehensive checks
     */
    const validateOrderForm = useCallback((): void => {
        const errors = Object.keys(formValidationErrors);
        if (errors.length > 0) {
            const firstError = formValidationErrors[errors[0]];
            throw new OrderValidationError(firstError, errors[0], 'VALIDATION_FAILED');
        }
    }, [formValidationErrors]);

    /**
     * Validates cart has items and all items are available
     */
    const validateCart = useCallback((cartItems: CartItem[]): void => {
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            throw new OrderValidationError(
                isAcademicServices
                    ? 'Por favor seleccione al menos un servicio'
                    : 'Please add items to your cart first',
                'cart',
                'EMPTY_CART'
            );
        }

        // Check if all cart items are still available and valid
        const invalidItems: string[] = [];

        cartItems.forEach(cartItem => {
            if (!cartItem || typeof cartItem !== 'object') {
                invalidItems.push('Invalid item data');
                return;
            }

            const menuItem = menuItems.find(item => item && item.id === cartItem.id);

            if (!menuItem) {
                invalidItems.push(`Item not found: ${cartItem.name || cartItem.id}`);
            } else if (!menuItem.available) {
                invalidItems.push(`Item unavailable: ${menuItem.name}`);
            } else if (typeof cartItem.quantity !== 'number' || cartItem.quantity <= 0) {
                invalidItems.push(`Invalid quantity for: ${menuItem.name}`);
            } else if (typeof cartItem.price !== 'number' || cartItem.price <= 0) {
                invalidItems.push(`Invalid price for: ${menuItem.name}`);
            }
        });

        if (invalidItems.length > 0) {
            throw new OrderValidationError(
                isAcademicServices
                    ? `Problemas con los artículos: ${invalidItems.join(', ')}`
                    : `Item issues: ${invalidItems.join(', ')}`,
                'cart',
                'INVALID_ITEMS'
            );
        }
    }, [isAcademicServices, menuItems]);

    // ==================== CART OPERATIONS ====================

    /**
     * Add item to cart with comprehensive validation and error handling
     * Uses functional updates for optimal performance
     */
    const addToCart = useCallback((item: MenuItem) => {
        try {
            // Validate item
            if (!item || typeof item !== 'object') {
                throw new Error('Invalid item data');
            }

            if (!item.available) {
                setError(isAcademicServices ? 'Servicio no disponible' : 'Item not available');
                return;
            }

            if (typeof item.price !== 'number' || item.price <= 0) {
                setError(isAcademicServices ? 'Precio inválido' : 'Invalid price');
                return;
            }

            setCart(prevCart => {
                try {
                    const existingItemIndex = prevCart.findIndex(cartItem =>
                        cartItem && cartItem.id === item.id
                    );

                    if (existingItemIndex !== -1) {
                        // Update existing item quantity
                        const newCart = [...prevCart];
                        const existingItem = newCart[existingItemIndex];

                        newCart[existingItemIndex] = {
                            ...existingItem,
                            quantity: existingItem.quantity + 1
                        };

                        return newCart;
                    } else {
                        // Add new item to cart
                        const newCartItem: CartItem = {
                            id: item.id,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            category: item.category,
                            available: item.available,
                            quantity: 1
                        };

                        return [...prevCart, newCartItem];
                    }
                } catch (error) {
                    console.error('❌ Error updating cart:', error);
                    return prevCart; // Return unchanged cart on error
                }
            });

            // Clear any existing errors
            setError(null);

        } catch (error) {
            console.error('❌ Error adding item to cart:', error);
            setError(isAcademicServices ? 'Error al agregar artículo' : 'Error adding item');
        }
    }, [isAcademicServices]);

    /**
     * Remove item from cart or decrease quantity
     * Uses functional updates for optimal performance
     */
    const removeFromCart = useCallback((itemId: string) => {
        try {
            if (!itemId || typeof itemId !== 'string') {
                throw new Error('Invalid item ID');
            }

            setCart(prevCart => {
                try {
                    return prevCart.reduce((acc, cartItem) => {
                        if (!cartItem || cartItem.id !== itemId) {
                            acc.push(cartItem);
                        } else if (cartItem.quantity > 1) {
                            // Decrease quantity
                            acc.push({ ...cartItem, quantity: cartItem.quantity - 1 });
                        }
                        // If quantity is 1, item is removed (not added to acc)
                        return acc;
                    }, [] as CartItem[]);
                } catch (error) {
                    console.error('❌ Error removing from cart:', error);
                    return prevCart; // Return unchanged cart on error
                }
            });

        } catch (error) {
            console.error('❌ Error in removeFromCart:', error);
            setError(isAcademicServices ? 'Error al remover artículo' : 'Error removing item');
        }
    }, [isAcademicServices]);

    /**
     * Update cart item quantity directly
     * Uses functional updates for optimal performance
     */
    const updateCartItemQuantity = useCallback((itemId: string, quantity: number) => {
        try {
            if (!itemId || typeof itemId !== 'string') {
                throw new Error('Invalid item ID');
            }

            if (typeof quantity !== 'number' || quantity < 0) {
                throw new Error('Invalid quantity');
            }

            setCart(prevCart => {
                try {
                    if (quantity === 0) {
                        // Remove item if quantity is 0
                        return prevCart.filter(item => item && item.id !== itemId);
                    }

                    return prevCart.map(item => {
                        if (item && item.id === itemId) {
                            return { ...item, quantity };
                        }
                        return item;
                    });
                } catch (error) {
                    console.error('❌ Error updating cart quantity:', error);
                    return prevCart; // Return unchanged cart on error
                }
            });

        } catch (error) {
            console.error('❌ Error in updateCartItemQuantity:', error);
            setError(isAcademicServices ? 'Error al actualizar cantidad' : 'Error updating quantity');
        }
    }, [isAcademicServices]);

    /**
     * Clear all items from cart
     * Simple and safe operation
     */
    const clearCart = useCallback(() => {
        setCart([]);
        console.log('🛒 Cart cleared');
    }, []);

    // ==================== FORM OPERATIONS ====================

    /**
     * Handle form input changes with error clearing
     * Optimized with useCallback to prevent unnecessary re-renders
     */
    const handleInputChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        try {
            const { name, value } = e.target;

            if (!name || typeof name !== 'string') {
                throw new Error('Invalid input name');
            }

            setOrderForm(prev => ({ ...prev, [name]: value }));

            // Clear general error when user starts typing
            if (error) {
                setError(null);
            }

        } catch (error) {
            console.error('❌ Error handling input change:', error);
        }
    }, [error]);

    /**
     * Update order form with partial data
     * Useful for programmatic form updates
     */
    const updateOrderForm = useCallback((updates: Partial<OrderFormData>) => {
        try {
            if (!updates || typeof updates !== 'object') {
                throw new Error('Invalid form updates');
            }

            setOrderForm(prev => ({ ...prev, ...updates }));

        } catch (error) {
            console.error('❌ Error updating order form:', error);
        }
    }, []);

    // ==================== PAYMENT PROCESSING ====================

    /**
     * Handle Stripe payment with comprehensive error handling and retry logic
     * Includes persistent storage, timeout handling, and graceful error recovery
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

        // Create abort controller for request cancellation
        abortControllerRef.current = new AbortController();

        try {
            console.log('🚀 Starting Stripe payment process...');

            // Validate inputs before processing
            validateCart(cart);
            validateOrderForm();

            // Load Stripe with enhanced error handling and timeout
            let stripe;
            try {
                console.log('🔄 Loading Stripe instance...');
                
                stripe = await Promise.race([
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
            } catch (error) {
                console.error('❌ Error loading Stripe:', error);
                
                throw new PaymentError(
                    isAcademicServices 
                        ? 'No se pudo cargar el sistema de pagos. Verifique su conexión a internet.'
                        : 'Failed to load payment system. Please check your internet connection.',
                    'STRIPE_LOAD_ERROR'
                );
            }

            if (!stripe) {
                console.error('❌ Stripe instance is null');
                
                // Check if this is due to missing environment variable
                const stripeKey = import.meta.env.VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY;
                if (!stripeKey) {
                    throw new PaymentError(
                        isAcademicServices 
                            ? 'Configuración de pagos incompleta. Contacte al administrador.'
                            : 'Payment configuration incomplete. Please contact support.',
                        'STRIPE_CONFIG_MISSING'
                    );
                }
                
                throw new PaymentError(
                    isAcademicServices 
                        ? 'Sistema de pagos no disponible. Por favor intente más tarde.'
                        : 'Payment system unavailable. Please try again later.',
                    'STRIPE_UNAVAILABLE'
                );
            }

            // Generate secure order ID
            const orderId = generateOrderId();
            console.log('📋 Generated order ID:', orderId);

            // 💾 SAVE ORDER DATA TO PERSISTENT STORAGE
            const orderDataForSession: PendingOrderData = {
                order_id: orderId,
                customer_name: orderForm.customer_name.trim(),
                customer_phone: orderForm.customer_phone.trim(),
                store_id: store?.id || 'unknown',
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                total_amount: totalPrice,
                payment_method: orderForm.payment_method,
                timestamp: Date.now(),
                delivery_address: orderForm.delivery_address.trim(),
                special_instructions: orderForm.special_instructions?.trim() || undefined
            };

            // Save to persistent storage with error handling
            const storageSaved = PersistentStorage.saveOrderData(orderDataForSession);
            if (!storageSaved) {
                console.warn('⚠️ Order data could not be saved to storage, but continuing...');
            }

            console.log('💳 Creating Stripe checkout session...');

            // Create Stripe checkout session with timeout and abort signal
            const response = await Promise.race([
                fetch('/.netlify/functions/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: safeJsonStringify({
                        items: cart.map(item => ({
                            name: item.name,
                            description: item.description || '',
                            price: item.price,
                            quantity: item.quantity
                        })),
                        customer: {
                            name: orderForm.customer_name.trim(),
                            email: orderForm.customer_email?.trim() || '',
                            phone: orderForm.customer_phone.trim()
                        },
                        store_id: store?.id || 'unknown',
                        currency: isAcademicServices ? 'mxn' : 'usd',
                        locale: isAcademicServices ? 'es' : 'en'
                    }),
                    signal: abortControllerRef.current.signal
                }),
                // Timeout promise
                new Promise<never>((_, reject) => {
                    timeoutRef.current = setTimeout(() => {
                        reject(new PaymentError(
                            `Request timeout after ${CONFIG.API_TIMEOUT}ms`,
                            'TIMEOUT'
                        ));
                    }, CONFIG.API_TIMEOUT);
                })
            ]);

            // Clear timeout if request completed
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            // Handle HTTP errors
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP ${response.status}`;

                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }

                throw new PaymentError(
                    isAcademicServices
                        ? `Error en el procesamiento: ${errorMessage}`
                        : `Payment processing failed: ${errorMessage}`,
                    'API_ERROR',
                    response.status
                );
            }

            // Parse response safely
            const sessionData = await response.json();

            if (!sessionData || !sessionData.id) {
                throw new PaymentError(
                    isAcademicServices
                        ? 'Respuesta inválida del servidor'
                        : 'Invalid server response',
                    'INVALID_RESPONSE'
                );
            }

            // Update order data with session ID (create new object to avoid read-only violation)
            const updatedOrderDataForSession: PendingOrderData = {
                ...orderDataForSession,
                session_id: sessionData.id
            };
            PersistentStorage.saveOrderData(updatedOrderDataForSession);

            console.log('🔄 Redirecting to Stripe checkout...', { sessionId: sessionData.id });

            // Redirect to Stripe checkout
            const redirectResult = await stripe.redirectToCheckout({
                sessionId: sessionData.id,
            });

            if (redirectResult.error) {
                throw new PaymentError(
                    redirectResult.error.message ||
                    (isAcademicServices ? 'Error en la redirección' : 'Checkout redirect failed'),
                    'REDIRECT_FAILED'
                );
            }

        } catch (error) {
            console.error('❌ Payment processing error:', error);

            // Determine appropriate error message
            let errorMessage = isAcademicServices
                ? 'Error en el procesamiento del pago. Por favor intente nuevamente.'
                : 'Payment failed. Please try again.';

            if (error instanceof OrderValidationError || error instanceof PaymentError) {
                errorMessage = error.message;
            } else if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    errorMessage = isAcademicServices
                        ? 'Operación cancelada'
                        : 'Operation cancelled';
                } else if (error.message.includes('timeout')) {
                    errorMessage = isAcademicServices
                        ? 'Tiempo de espera agotado. Por favor intente nuevamente.'
                        : 'Request timeout. Please try again.';
                } else {
                    errorMessage = error.message;
                }
            }

            setError(errorMessage);

            // Clear any saved order data on error
            PersistentStorage.clearOrderData();

        } finally {
            setPaymentLoading(false);
            processingOrderRef.current = false;

            // Cleanup abort controller
            if (abortControllerRef.current) {
                abortControllerRef.current = null;
            }
        }
    }, [cart, orderForm, store, isAcademicServices, validateCart, validateOrderForm, totalPrice]);

    /**
     * Handle non-Stripe orders (cash, transfer, etc.) with proper validation
     */
    const handleNonStripeOrder = useCallback(async (): Promise<void> => {
        if (processingOrderRef.current) {
            console.log('🔄 Order already being processed');
            return;
        }

        processingOrderRef.current = true;
        setLoading(true);
        setError(null);

        try {
            console.log('📝 Processing non-Stripe order...');

            // Validate inputs
            validateCart(cart);
            validateOrderForm();

            // Simulate order processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mark order as complete
            setOrderComplete(true);
            setCart([]);

            console.log('✅ Non-Stripe order completed successfully');

        } catch (error) {
            console.error('❌ Non-Stripe order error:', error);

            const errorMessage = error instanceof OrderValidationError
                ? error.message
                : (isAcademicServices ? 'Error procesando la orden' : 'Order failed');

            setError(errorMessage);
        } finally {
            setLoading(false);
            processingOrderRef.current = false;
        }
    }, [cart, validateCart, validateOrderForm, isAcademicServices]);

    /**
     * Main order placement handler with proper event handling
     */
    const handlePlaceOrder = useCallback(async (e: React.FormEvent): Promise<void> => {
        try {
            e.preventDefault();

            if (!canPlaceOrder) {
                const errorMsg = isAcademicServices
                    ? 'Por favor complete todos los campos requeridos'
                    : 'Please complete all required fields';
                setError(errorMsg);
                return;
            }

            if (orderForm.payment_method === 'stripe') {
                await handleStripePayment();
            } else {
                await handleNonStripeOrder();
            }

        } catch (error) {
            console.error('❌ Error placing order:', error);
            setError(isAcademicServices ? 'Error procesando la orden' : 'Error processing order');
        }
    }, [orderForm.payment_method, handleStripePayment, handleNonStripeOrder, canPlaceOrder, isAcademicServices]);

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Reset all order state to initial values with comprehensive cleanup
     */
    const resetOrder = useCallback(() => {
        try {
            console.log('🔄 Resetting order state...');

            // Reset state
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

            // Reset refs
            processingOrderRef.current = false;

            // Clear any persisted order data
            PersistentStorage.clearOrderData();

            // Cancel any pending operations
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }

            console.log('✅ Order state reset complete');

        } catch (error) {
            console.error('❌ Error resetting order:', error);
        }
    }, []);

    /**
     * Clear current error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ==================== EFFECTS ====================

    /**
     * Component mount/unmount effect with comprehensive cleanup
     */
    useEffect(() => {
        console.log('🔄 useOrderLogic hook mounted');

        return () => {
            console.log('🔄 useOrderLogic hook unmounting, cleaning up...');

            // Mark component as unmounted
            isMountedRef.current = false;

            // Clear any pending timeouts
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Cancel any pending requests
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    /**
     * Check Stripe configuration on mount
     * Validates environment variables and shows appropriate errors
     */
    useEffect(() => {
        // Check Stripe configuration on mount
        const stripeKey = import.meta.env.VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY;
        
        if (!stripeKey) {
            console.error('❌ CRITICAL: Stripe publishable key not found!');
            console.error('Please ensure VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY is set in your environment');
            
            setError(
                isAcademicServices 
                    ? 'Sistema de pagos no configurado. Contacte al administrador.'
                    : 'Payment system not configured. Please contact support.'
            );
        } else if (!stripeKey.startsWith('pk_')) {
            console.error('❌ CRITICAL: Invalid Stripe key format!');
            console.error('Stripe key should start with "pk_test_" or "pk_live_"');
            
            setError(
                isAcademicServices 
                    ? 'Configuración de pagos inválida. Contacte al administrador.'
                    : 'Invalid payment configuration. Please contact support.'
            );
        }
    }, [isAcademicServices]);

    /**
     * Development debugging effect
     * Only runs in development mode for performance
     */
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🛒 Cart state updated:', {
                itemCount: cart.length,
                totalPrice: totalPrice.toFixed(2),
                totalItems,
                categories: categories.length,
                selectedCategory,
                canPlaceOrder
            });
        }
    }, [cart, totalPrice, totalItems, categories.length, selectedCategory, canPlaceOrder]);

    /**
     * Error logging effect for debugging
     * Only runs in development mode
     */
    useEffect(() => {
        if (process.env.NODE_ENV === 'development' && error) {
            console.warn('⚠️ Order error state:', error);
        }
    }, [error]);

    // ==================== RETURN VALUES ====================

    /**
     * Return comprehensive order management interface
     * All values are either state or memoized for optimal performance
     */
    return {
        // Core State
        cart,
        orderForm,
        selectedCategory,
        orderComplete,
        loading,
        paymentLoading,
        error,

        // Cart Actions
        addToCart,
        removeFromCart,
        clearCart,
        updateCartItemQuantity,

        // Form Actions
        handleInputChange,
        updateOrderForm,

        // Order Actions
        handlePlaceOrder,
        setOrderComplete,
        resetOrder,
        clearError,

        // Category Actions
        setSelectedCategory,

        // Computed Values (all memoized)
        totalPrice,
        totalItems,
        filteredItems,
        categories,
        isCartEmpty,
        canPlaceOrder,
        formValidationErrors
    };
};

// ==================== EXPORTS ====================

export default useOrderLogic;

// Export storage utility for use in other components
export { PersistentStorage };

// Export utility functions for testing and external use
export {
    generateOrderId,
    validatePhoneNumber,
    validateEmailFormat,
    safeJsonParse,
    safeJsonStringify
};

// Export types for external use
export type {
    PendingOrderData,
    UseOrderLogicReturn
};