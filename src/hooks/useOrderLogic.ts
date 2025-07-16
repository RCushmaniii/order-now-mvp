// src/hooks/useOrderLogic.ts
// ONLY React hook code - separated from WhatsApp service

import { useState, useCallback, useMemo, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { MenuItem, CartItem, OrderFormData } from '../types/order';
import type { Store } from '../types/store';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY);

// Error classes for this hook only
export class OrderValidationError extends Error {
    public field?: string;

    constructor(message: string, field?: string) {
        super(message);
        this.name = 'OrderValidationError';
        this.field = field;
    }
}

export class PaymentError extends Error {
    public code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.name = 'PaymentError';
        this.code = code;
    }
}

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

export const useOrderLogic = (
    store: Store | null,
    menuItems: MenuItem[],
    isAcademicServices: boolean
): UseOrderLogicReturn => {
    // State
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

    const processingOrderRef = useRef(false);

    // Memoized computed values
    const totalPrice = useMemo(() => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);

    const totalItems = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    const categories = useMemo(() => {
        return ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];
    }, [menuItems]);

    const filteredItems = useMemo(() => {
        return selectedCategory === 'All'
            ? menuItems
            : menuItems.filter(item => item.category === selectedCategory);
    }, [menuItems, selectedCategory]);

    const isCartEmpty = useMemo(() => {
        return cart.length === 0;
    }, [cart.length]);

    const canPlaceOrder = useMemo(() => {
        return !isCartEmpty &&
            !loading &&
            !paymentLoading &&
            orderForm.customer_name.trim() !== '' &&
            orderForm.customer_phone.trim() !== '' &&
            orderForm.delivery_address.trim() !== '';
    }, [isCartEmpty, loading, paymentLoading, orderForm]);

    // Validation functions
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
    }, [isAcademicServices]);

    const validateCart = useCallback((cartItems: CartItem[]): void => {
        if (cartItems.length === 0) {
            throw new OrderValidationError(
                isAcademicServices
                    ? 'Por favor seleccione al menos un servicio'
                    : 'Please add items to your cart first'
            );
        }
    }, [isAcademicServices]);

    // Cart operations
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

    const removeFromCart = useCallback((itemId: string) => {
        setCart(prevCart => {
            return prevCart.reduce((acc, cartItem) => {
                if (cartItem.id === itemId) {
                    if (cartItem.quantity > 1) {
                        acc.push({ ...cartItem, quantity: cartItem.quantity - 1 });
                    }
                } else {
                    acc.push(cartItem);
                }
                return acc;
            }, [] as CartItem[]);
        });
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const handleInputChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setOrderForm(prev => ({ ...prev, [name]: value }));
        if (error) {
            setError(null);
        }
    }, [error]);

    // Payment processing
    const handleStripePayment = useCallback(async (): Promise<void> => {
        if (processingOrderRef.current) return;

        processingOrderRef.current = true;
        setPaymentLoading(true);
        setError(null);

        try {
            validateCart(cart);
            validateOrderForm(orderForm);

            const stripe = await stripePromise;
            if (!stripe) {
                throw new PaymentError('Failed to load payment system');
            }

            const response = await fetch('/.netlify/functions/create-checkout-session', {
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
            });

            if (!response.ok) {
                throw new PaymentError('Payment processing failed');
            }

            const session = await response.json();

            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });

            if (result.error) {
                throw new PaymentError(result.error.message || 'Checkout failed');
            }

        } catch (error) {
            console.error('Payment error:', error);
            let errorMessage = 'Payment failed. Please try again.';

            if (error instanceof OrderValidationError || error instanceof PaymentError) {
                errorMessage = error.message;
            }

            setError(errorMessage);
        } finally {
            setPaymentLoading(false);
            processingOrderRef.current = false;
        }
    }, [cart, orderForm, store, isAcademicServices, validateCart, validateOrderForm]);

    const handleNonStripeOrder = useCallback(async (): Promise<void> => {
        if (processingOrderRef.current) return;

        processingOrderRef.current = true;
        setLoading(true);
        setError(null);

        try {
            validateCart(cart);
            validateOrderForm(orderForm);

            // Simulate order processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            setOrderComplete(true);
            setCart([]);

        } catch (error) {
            console.error('Order error:', error);
            setError(error instanceof OrderValidationError ? error.message : 'Order failed');
        } finally {
            setLoading(false);
            processingOrderRef.current = false;
        }
    }, [cart, orderForm, validateCart, validateOrderForm]);

    const handlePlaceOrder = useCallback(async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (orderForm.payment_method === 'stripe') {
            await handleStripePayment();
        } else {
            await handleNonStripeOrder();
        }
    }, [orderForm.payment_method, handleStripePayment, handleNonStripeOrder]);

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
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

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