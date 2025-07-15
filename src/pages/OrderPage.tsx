import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Check, Clock, Star } from 'lucide-react';

// Types
interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url?: string;
    available: boolean;
    rating?: number;
    prep_time?: number;
}

interface CartItem extends MenuItem {
    quantity: number;
}

interface Store {
    id: string;
    name: string;
    description: string;
    logo_url?: string;
    phone?: string;
    address?: string;
    hours?: string;
    rating?: number;
}

interface OrderFormData {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    delivery_address: string;
    payment_method: string;
    special_instructions: string;
}

const OrderPage: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const [store, setStore] = useState<Store | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [orderComplete, setOrderComplete] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [showCart, setShowCart] = useState(false);
    const [orderForm, setOrderForm] = useState<OrderFormData>({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        delivery_address: '',
        payment_method: 'cash',
        special_instructions: ''
    });

    // Mock data for demonstration
    useEffect(() => {
        const mockStore: Store = {
            id: storeId || '1',
            name: 'Bella Italia',
            description: 'Authentic Italian cuisine made with love',
            logo_url: 'https://via.placeholder.com/100x100?text=BI',
            phone: '+1 (555) 123-4567',
            address: '123 Main St, City, State 12345',
            hours: 'Mon-Sun: 11:00 AM - 10:00 PM',
            rating: 4.5
        };

        const mockMenuItems: MenuItem[] = [
            {
                id: '1',
                name: 'Margherita Pizza',
                description: 'Fresh tomatoes, mozzarella, basil',
                price: 14.99,
                category: 'Pizza',
                image_url: 'https://via.placeholder.com/300x200?text=Pizza',
                available: true,
                rating: 4.8,
                prep_time: 15
            },
            {
                id: '2',
                name: 'Chicken Alfredo',
                description: 'Creamy pasta with grilled chicken',
                price: 16.99,
                category: 'Pasta',
                image_url: 'https://via.placeholder.com/300x200?text=Pasta',
                available: true,
                rating: 4.6,
                prep_time: 12
            },
            {
                id: '3',
                name: 'Caesar Salad',
                description: 'Fresh romaine lettuce with Caesar dressing',
                price: 10.99,
                category: 'Salads',
                image_url: 'https://via.placeholder.com/300x200?text=Salad',
                available: true,
                rating: 4.3,
                prep_time: 8
            },
            {
                id: '4',
                name: 'Pepperoni Pizza',
                description: 'Classic pepperoni with mozzarella',
                price: 16.99,
                category: 'Pizza',
                image_url: 'https://via.placeholder.com/300x200?text=Pepperoni',
                available: true,
                rating: 4.7,
                prep_time: 15
            },
            {
                id: '5',
                name: 'Tiramisu',
                description: 'Classic Italian dessert',
                price: 7.99,
                category: 'Desserts',
                image_url: 'https://via.placeholder.com/300x200?text=Tiramisu',
                available: true,
                rating: 4.9,
                prep_time: 5
            }
        ];

        setStore(mockStore);
        setMenuItems(mockMenuItems);
        setLoading(false);
    }, [storeId]);

    const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

    const filteredItems = selectedCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    const addToCart = (item: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
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
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setOrderForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert('Please add items to your cart first');
            return;
        }

        // Simulate API call
        setLoading(true);

        try {
            // Here you would make the actual API call
            const orderData = {
                store_id: storeId,
                customer_name: orderForm.customer_name,
                customer_phone: orderForm.customer_phone,
                customer_email: orderForm.customer_email,
                delivery_address: orderForm.delivery_address,
                payment_method: orderForm.payment_method,
                special_instructions: orderForm.special_instructions,
                items: cart.map(item => ({
                    menu_item_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                total_amount: getTotalPrice(),
                status: 'pending'
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Order placed:', orderData);
            setOrderComplete(true);
            setCart([]);
            setShowCart(false);
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Error placing order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading menu...</p>
                </div>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                    <p className="text-gray-600 mb-6">Thank you for your order. We'll notify you when it's ready.</p>
                    <button
                        onClick={() => {
                            setOrderComplete(false);
                            setOrderForm({
                                customer_name: '',
                                customer_phone: '',
                                customer_email: '',
                                delivery_address: '',
                                payment_method: 'cash',
                                special_instructions: ''
                            });
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Place Another Order
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            {store?.logo_url && (
                                <img src={store.logo_url} alt={store.name} className="h-10 w-10 rounded-full mr-3" />
                            )}
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">{store?.name}</h1>
                                <p className="text-sm text-gray-500">{store?.description}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCart(!showCart)}
                            className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Cart ({getTotalItems()})
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                    {getTotalItems()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Store Info */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span>{store?.rating} rating</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{store?.hours}</span>
                        </div>
                        <div>
                            <span>{store?.phone}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
                                    <div className="flex flex-col md:flex-row">
                                        {item.image_url && (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full md:w-48 h-32 object-cover rounded-lg mb-4 md:mb-0 md:mr-6"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                                <span className="text-lg font-bold text-green-600">${item.price.toFixed(2)}</span>
                                            </div>
                                            <p className="text-gray-600 mb-3">{item.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    {item.rating && (
                                                        <div className="flex items-center mr-4">
                                                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                                            <span>{item.rating}</span>
                                                        </div>
                                                    )}
                                                    {item.prep_time && (
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            <span>{item.prep_time} min</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {cart.find(cartItem => cartItem.id === item.id) ? (
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="w-8 text-center font-medium">
                                                                {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                                                            </span>
                                                            <button
                                                                onClick={() => addToCart(item)}
                                                                className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => addToCart(item)}
                                                            disabled={!item.available}
                                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${item.available
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            {item.available ? 'Add to Cart' : 'Unavailable'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cart/Order Form Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Order</h3>

                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                            ) : (
                                <div>
                                    {/* Cart Items */}
                                    <div className="space-y-3 mb-6">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                    <p className="text-sm text-gray-600">${item.price.toFixed(2)} × {item.quantity}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addToCart(item)}
                                                        className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div className="border-t pt-4 mb-6">
                                        <div className="flex justify-between items-center text-lg font-semibold">
                                            <span>Total:</span>
                                            <span className="text-green-600">${getTotalPrice().toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Order Form */}
                                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="customer_name"
                                                value={orderForm.customer_name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone *
                                            </label>
                                            <input
                                                type="tel"
                                                name="customer_phone"
                                                value={orderForm.customer_phone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="customer_email"
                                                value={orderForm.customer_email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Address *
                                            </label>
                                            <textarea
                                                name="delivery_address"
                                                value={orderForm.delivery_address}
                                                onChange={handleInputChange}
                                                required
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Payment Method
                                            </label>
                                            <select
                                                name="payment_method"
                                                value={orderForm.payment_method}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="cash">Cash on Delivery</option>
                                                <option value="card">Credit Card</option>
                                                <option value="paypal">PayPal</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Special Instructions
                                            </label>
                                            <textarea
                                                name="special_instructions"
                                                value={orderForm.special_instructions}
                                                onChange={handleInputChange}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Any special requests?"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${loading
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700'
                                                } text-white`}
                                        >
                                            {loading ? 'Placing Order...' : 'Place Order'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;