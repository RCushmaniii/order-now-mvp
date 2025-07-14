import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Clock, MapPin, Phone, CreditCard, Check } from 'lucide-react';

// Types for your database schema
interface Store {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
    stripe_account_id: string | null;
    owner_id: string;
    created_at?: string;
    updated_at?: string;
}

interface MenuItem {
    id: string;
    store_id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    category: string | null;
    is_available: boolean;
    sort_order: number | null;
    created_at?: string;
    updated_at?: string;
}

// Note: Order and OrderItem interfaces are defined here for future use
// when implementing order history and detailed order management features
// interface Order {
//     id: string;
//     store_id: string;
//     customer_name: string;
//     customer_phone: string;
//     customer_email: string | null;
//     total_amount: number;
//     status: string;
//     stripe_session_id: string | null;
//     stripe_payment_intent_id: string | null;
//     notes: string | null;
//     created_at?: string;
//     updated_at?: string;
// }

// interface OrderItem {
//     id: string;
//     order_id: string;
//     menu_item_id: string;
//     quantity: number;
//     unit_price: number;
//     total_price: number;
//     created_at?: string;
// }

interface CartItem extends MenuItem {
    quantity: number;
}

interface CustomerInfo {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
}

// Note: SupabaseResponse interface commented out as it's not currently used
// Will be needed when implementing more complex database operations
// interface SupabaseResponse<T> {
//     data: T[] | null;
//     error: unknown;
// }

import { supabase } from '../utils/supabase';

export default function RestaurantOrderingApp() {
    const [store, setStore] = useState<Store | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        customer_name: '',
        customer_phone: '',
        customer_email: ''
    });
    const [isOrdering, setIsOrdering] = useState<boolean>(false);
    const [orderComplete, setOrderComplete] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const storeSlug = new URLSearchParams(window.location.search).get('store') || 'tonys-pizza';
    const [storeId, setStoreId] = useState<string>('');

    // Add loadStoreData function declaration with proper dependency
    const loadStoreData = React.useCallback(async (): Promise<void> => {
        console.log('🔍 Loading store data for slug:', storeSlug);

        try {
            // Load store info using slug first
            const { data: storeData, error: storeError } = await supabase
                .from('stores')
                .select('*')
                .eq('slug', storeSlug)
                .eq('is_active', true)
                .single();

            console.log('📊 Store query result:', { storeData, storeError });

            if (storeError) {
                console.error('❌ Error loading store:', storeError);
                return;
            }

            if (storeData) {
                console.log('✅ Store found:', storeData.name);
                setStore(storeData);
                setStoreId(storeData.id); // Set the actual UUID for menu queries
            } else {
                console.log('❌ No store data returned');
            }

            // Load menu items using the store ID
            if (storeData?.id) {
                console.log('🍕 Loading menu items for store:', storeData.id);

                const { data: menuData, error: menuError } = await supabase
                    .from('menu_items')
                    .select('*')
                    .eq('store_id', storeData.id)
                    .eq('is_available', true)
                    .order('sort_order', { ascending: true });

                console.log('📋 Menu query result:', { menuData, menuError });

                if (menuError) {
                    console.error('❌ Error loading menu items:', menuError);
                    return;
                }

                if (menuData) {
                    console.log('✅ Menu items found:', menuData.length);
                    setMenuItems(menuData);
                }
            }
        } catch (error) {
            console.error('💥 Unexpected error loading store data:', error);
        } finally {
            setLoading(false);
        }
    }, [storeSlug]); // Add storeSlug as dependency

    useEffect(() => {
        loadStoreData();
    }, [loadStoreData]); // Now depends on loadStoreData

    const categories: string[] = ['All', ...new Set(menuItems.map(item => item.category).filter((cat): cat is string => cat !== null))];

    const filteredItems: MenuItem[] = selectedCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    const addToCart = (item: MenuItem): void => {
        setCart(prev => {
            const existingItem = prev.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prev.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string): void => {
        setCart(prev => {
            const existingItem = prev.find(cartItem => cartItem.id === itemId);
            if (existingItem && existingItem.quantity > 1) {
                return prev.map(cartItem =>
                    cartItem.id === itemId
                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                        : cartItem
                );
            }
            return prev.filter(cartItem => cartItem.id !== itemId);
        });
    };

    const getCartItemQuantity = (itemId: string): number => {
        const item = cart.find(cartItem => cartItem.id === itemId);
        return item ? item.quantity : 0;
    };

    const getTotalPrice = (): number => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handlePlaceOrder = async (): Promise<void> => {
        if (!customerInfo.customer_name || !customerInfo.customer_phone) {
            alert('Please fill in your name and phone number');
            return;
        }

        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        setIsOrdering(true);

        try {
            // Create order in orders table using the actual storeId
            const orderData = {
                store_id: storeId, // This will now be the real UUID
                customer_name: customerInfo.customer_name,
                customer_phone: customerInfo.customer_phone,
                customer_email: customerInfo.customer_email || null,
                total_amount: getTotalPrice(),
                status: 'pending',
                notes: null
            };

            const { data: orderResponse, error: orderError } = await supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single();

            if (orderError) {
                console.error('Error creating order:', orderError);
                alert('Error placing order. Please try again.');
                return;
            }

            if (orderResponse) {
                const orderId = orderResponse.id;

                // Create order items
                const orderItems = cart.map(item => ({
                    order_id: orderId,
                    menu_item_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.price * item.quantity
                }));

                const { error: orderItemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems);

                if (orderItemsError) {
                    console.error('Error creating order items:', orderItemsError);
                    alert('Error saving order details. Please contact the restaurant.');
                    return;
                }

                setOrderComplete(true);
                setCart([]);
                setCustomerInfo({
                    customer_name: '',
                    customer_phone: '',
                    customer_email: ''
                });
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Error placing order. Please try again.');
        } finally {
            setIsOrdering(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading menu...</p>
                </div>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for your order. You'll receive a confirmation call shortly.
                    </p>
                    <button
                        onClick={() => {
                            setOrderComplete(false);
                            window.location.reload();
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Place Another Order
                    </button>
                </div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Store not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
                            <p className="text-gray-600 mt-1">{store.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {store.address}
                                </div>
                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-1" />
                                    {store.phone}
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Open Now
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                                <ShoppingCart className="w-4 h-4" />
                                <span>{cart.length}</span>
                                <span className="font-semibold">${getTotalPrice().toFixed(2)}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Menu Section */}
                    <div className="lg:col-span-2">
                        {/* Category Filter */}
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-6">
                            {filteredItems.map(item => (
                                <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                                        <img
                                            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'}
                                            alt={item.name}
                                            className="w-full md:w-32 h-32 object-cover rounded-lg mb-4 md:mb-0"
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                                            <p className="text-gray-600 mt-1">{item.description || 'Delicious item'}</p>
                                            <p className="text-2xl font-bold text-blue-600 mt-2">${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-4 md:mt-0">
                                            {getCartItemQuantity(item.id) > 0 && (
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                            )}
                                            {getCartItemQuantity(item.id) > 0 && (
                                                <span className="w-8 text-center font-semibold">
                                                    {getCartItemQuantity(item.id)}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary & Checkout */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                            <h2 className="text-xl font-semibold mb-4">Your Order</h2>

                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-6">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        ${item.price.toFixed(2)} x {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addToCart(item)}
                                                        className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-4 mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold">Total:</span>
                                            <span className="text-2xl font-bold text-blue-600">
                                                ${getTotalPrice().toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customer Information */}
                                    <div className="space-y-4 mb-6">
                                        <h3 className="font-medium">Contact Information</h3>
                                        <input
                                            type="text"
                                            placeholder="Full Name *"
                                            value={customerInfo.customer_name}
                                            onChange={(e) => setCustomerInfo(prev => ({
                                                ...prev,
                                                customer_name: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number *"
                                            value={customerInfo.customer_phone}
                                            onChange={(e) => setCustomerInfo(prev => ({
                                                ...prev,
                                                customer_phone: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email (optional)"
                                            value={customerInfo.customer_email}
                                            onChange={(e) => setCustomerInfo(prev => ({
                                                ...prev,
                                                customer_email: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isOrdering}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {isOrdering ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Placing Order...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4" />
                                                <span>Place Order</span>
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}