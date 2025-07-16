import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Store, Clock, CheckCircle, X, MessageCircle, Phone, DollarSign, Package, TrendingUp, Search, Star } from 'lucide-react';
import type { MenuItem, Order, CustomerInfo, CartItem } from '../types';
import yapLogo from '/images/ui/YAP-sq-og.jpg';


// Function to generate placeholder images
const generatePlaceholder = (text: string, bgColor: string = '075e54', textColor: string = 'ffffff', width: number = 400, height: number = 300): string => {
  return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
};



// Mock data for demonstration with generated placeholder images
const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Classic Burger',
    price: 12.99,
    originalPrice: 15.99,
    category: 'Burgers',
    description: 'Beef patty, lettuce, tomato, onion, pickles',
    image: generatePlaceholder('Classic Burger', '8B4513', 'ffffff'),
    emoji: '🍔',
    available: true,
    discount: 20,
    rating: 4.8
  },
  {
    id: 2,
    name: 'Chicken Sandwich',
    price: 11.99,
    category: 'Sandwiches',
    description: 'Grilled chicken breast, mayo, lettuce',
    image: generatePlaceholder('Chicken Sandwich', 'D2691E', 'ffffff'),
    emoji: '🥪',
    available: true,
    rating: 4.6
  },
  {
    id: 3,
    name: 'Margherita Pizza',
    price: 15.99,
    category: 'Pizza',
    description: 'Fresh mozzarella, tomato sauce, basil',
    image: generatePlaceholder('Margherita Pizza', 'FF6347', 'ffffff'),
    emoji: '🍕',
    available: true,
    rating: 4.9
  },
  {
    id: 4,
    name: 'Caesar Salad',
    price: 9.99,
    category: 'Salads',
    description: 'Romaine lettuce, parmesan, croutons',
    image: generatePlaceholder('Caesar Salad', '228B22', 'ffffff'),
    emoji: '🥗',
    available: true,
    rating: 4.4
  },
  {
    id: 5,
    name: 'Chocolate Shake',
    price: 5.99,
    originalPrice: 7.99,
    category: 'Beverages',
    description: 'Rich chocolate milkshake',
    image: generatePlaceholder('Chocolate Shake', '8B4513', 'ffffff'),
    emoji: '🥤',
    available: true,
    discount: 25,
    rating: 4.7
  },
  {
    id: 6,
    name: 'Fish Tacos',
    price: 13.99,
    category: 'Tacos',
    description: 'Fresh fish, cabbage slaw, lime crema',
    image: generatePlaceholder('Fish Tacos', 'FF8C00', 'ffffff'),
    emoji: '🌮',
    available: false,
    rating: 4.5
  }
];

const mockOrders: Order[] = [
  { id: 1, customerName: 'John Doe', phone: '+1234567890', total: 28.97, status: 'pending', items: [{ name: 'Classic Burger', quantity: 2, price: 12.99 }], timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 2, customerName: 'Jane Smith', phone: '+1234567891', total: 15.99, status: 'preparing', items: [{ name: 'Margherita Pizza', quantity: 1, price: 15.99 }], timestamp: new Date(Date.now() - 1000 * 60 * 15) },
  { id: 3, customerName: 'Mike Johnson', phone: '+1234567892', total: 21.98, status: 'ready', items: [{ name: 'Chicken Sandwich', quantity: 1, price: 11.99 }, { name: 'Caesar Salad', quantity: 1, price: 9.99 }], timestamp: new Date(Date.now() - 1000 * 60 * 25) }
];

interface OrderNowAppProps {
  initialStoreId?: string;
}

const OrderNowApp: React.FC<OrderNowAppProps> = () => {
  const [currentView, setCurrentView] = useState<'customer' | 'dashboard'>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '', email: '' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: number) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Place order with Stripe integration
  const placeOrder = async () => {
    try {
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: item.quantity
          })),
          customer: {
            name: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.email
          },
          store_id: 'demo-store',
          currency: 'mxn',
          locale: 'es'
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        alert('Error creating checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing payment');
    }
  };

  const updateOrderStatus = (orderId: number, newStatus: Order['status']) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const toggleAvailability = (itemId: number) => {
    setMenuItems(menuItems.map(item =>
      item.id === itemId ? { ...item, available: !item.available } : item
    ));
  };

  // Customer View Components
  const CustomerHeader = () => (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Updated logo section */}
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={yapLogo}
                alt="YAP Logo"
                className="w-10 h-10 object-cover rounded-md"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">YAP Now</h1>
              <p className="text-sm text-gray-500">Fresh food delivered fast</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Store className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCheckout(true)}
              className="relative bg-teal-600 text-white px-6 py-2.5 rounded-full hover:bg-teal-700 transition-colors flex items-center space-x-2 font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>${cartTotal.toFixed(2)}</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  const SearchAndFilter = () => (
    <div className="bg-white border-b border-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for food..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const MenuItem = ({ item }: { item: MenuItem }) => {
    const [imageError, setImageError] = useState(false);

    // Fallback to emoji-based placeholder if image fails
    const handleImageError = () => {
      setImageError(true);
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="relative">
          {!imageError ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
              <span className="text-6xl">{item.emoji}</span>
            </div>
          )}
          {item.discount && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {item.discount}% OFF
            </div>
          )}
          {!item.available && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">{item.rating}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">${item.price}</span>
              {item.originalPrice && (
                <span className="text-sm text-gray-400 line-through">${item.originalPrice}</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {cart.find(cartItem => cartItem.id === item.id) ? (
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-sm transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="font-bold text-gray-900 min-w-[20px] text-center">
                    {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-8 h-8 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(item)}
                  disabled={!item.available}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all ${item.available
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {item.available ? 'Add to Cart' : 'Unavailable'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CartItemComponent = ({ item }: { item: CartItem }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
        {!imageError ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 object-cover rounded-xl"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">{item.emoji}</span>
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{item.name}</h4>
          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
        </div>
        <span className="font-bold text-lg text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    );
  };

  const Checkout = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
            <button
              onClick={() => setShowCheckout(false)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-8">
            {cart.map(item => (
              <CartItemComponent key={item.id} item={item} />
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-teal-600">${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <input
              type="text"
              placeholder="Your Name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email (Optional)"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={placeOrder}
            disabled={!customerInfo.name || !customerInfo.phone || cart.length === 0}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Proceed to Payment - ${cartTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );

  // Dashboard Components
  const DashboardHeader = () => (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Updated logo section */}
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={yapLogo}
                alt="YAP Logo"
                className="w-10 h-10 object-cover rounded-md"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">YAP Dashboard</h1>
              <p className="text-sm text-gray-500">Manage orders and menu</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('customer')}
            className="bg-teal-600 text-white px-6 py-2.5 rounded-full hover:bg-teal-700 transition-colors font-medium"
          >
            View Storefront
          </button>
        </div>
      </div>
    </header>
  );

  const DashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[
        { label: 'Total Orders', value: orders.length, icon: Package, color: 'blue', bgColor: 'bg-blue-50' },
        { label: 'Revenue', value: `$${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`, icon: DollarSign, color: 'green', bgColor: 'bg-green-50' },
        { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'orange', bgColor: 'bg-orange-50' },
        { label: 'Menu Items', value: menuItems.length, icon: TrendingUp, color: 'purple', bgColor: 'bg-purple-50' }
      ].map((stat, index) => (
        <div key={index} className={`${stat.bgColor} p-6 rounded-2xl border border-gray-100`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const OrderCard = ({ order }: { order: Order }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Order #{order.id}</h3>
          <p className="text-sm text-gray-600">{order.customerName} • {order.phone}</p>
          <p className="text-xs text-gray-500">{order.timestamp.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
              order.status === 'ready' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
            }`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-700">{item.quantity}x {item.name}</span>
            <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex space-x-3">
        {order.status === 'pending' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Start Preparing
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'ready')}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            Mark Ready
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'completed')}
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-colors font-medium"
          >
            Complete
          </button>
        )}
        <button className="px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors">
          <MessageCircle className="w-4 h-4" />
        </button>
        <button className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
          <Phone className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Separate component for menu item management to avoid hook issues
  const MenuItemManagement = ({ item }: { item: MenuItem }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center space-x-4">
          {!imageError ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">{item.emoji}</span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-600">${item.price}</p>
          </div>
        </div>
        <button
          onClick={() => toggleAvailability(item.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${item.available
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
        >
          {item.available ? 'Available' : 'Unavailable'}
        </button>
      </div>
    );
  };

  const MenuManagement = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Menu Management</h2>
      <div className="space-y-4">
        {menuItems.map(item => (
          <MenuItemManagement key={item.id} item={item} />
        ))}
      </div>
    </div>
  );

  const SuccessMessage = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Placed!</h2>
        <p className="text-gray-600 mb-6">Your order has been received and is being prepared.</p>
        <div className="bg-green-50 p-4 rounded-2xl">
          <p className="text-sm text-green-800">We'll send you updates via WhatsApp</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'customer' ? (
        <>
          <CustomerHeader />
          <SearchAndFilter />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <MenuItem key={item.id} item={item} />
              ))}
            </div>
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No items found matching your search.</p>
              </div>
            )}
          </main>
          {showCheckout && <Checkout />}
          {orderPlaced && <SuccessMessage />}
        </>
      ) : (
        <>
          <DashboardHeader />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <DashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
              <div>
                <MenuManagement />
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default OrderNowApp;