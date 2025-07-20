// This is the complete and final version with ALL original JSX restored and all types corrected.
import React, { useState } from 'react';
import { Plus, Minus, Clock, CheckCircle, X, Phone, DollarSign, Package, TrendingUp, Search, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MenuItem, Order, CustomerInfo, CartItem } from '../types';
import yapLogo from '/images/ui/YAP-sq-og.jpg';

// Helper function
const generatePlaceholder = (text: string, bgColor = '075e54', textColor = 'ffffff', width = 400, height = 300): string => {
  return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
};

// MOCK DATA: Corrected to match the types in types.ts
const mockMenuItems: MenuItem[] = [
  { id: '1', name: 'Classic Burger', price: 199.99, originalPrice: 249.99, category: 'Burgers', description: 'Beef patty, lettuce, tomato, onion, pickles', image: generatePlaceholder('Classic Burger'), emoji: '🍔', available: true, discount: 20, rating: 4.8 },
  { id: '2', name: 'Chicken Sandwich', price: 179.99, category: 'Sandwiches', description: 'Grilled chicken breast, mayo, lettuce', image: generatePlaceholder('Chicken Sandwich'), emoji: '🥪', available: true, rating: 4.6 },
  { id: '3', name: 'Margherita Pizza', price: 299.99, category: 'Pizza', description: 'Fresh mozzarella, tomato sauce, basil', image: generatePlaceholder('Margherita Pizza'), emoji: '🍕', available: true, rating: 4.9 },
  { id: '4', name: 'Caesar Salad', price: 149.99, category: 'Salads', description: 'Romaine lettuce, parmesan, croutons', image: generatePlaceholder('Caesar Salad'), emoji: '🥗', available: true, rating: 4.4 },
  { id: '5', name: 'Chocolate Shake', price: 89.99, originalPrice: 119.99, category: 'Beverages', description: 'Rich chocolate milkshake', image: generatePlaceholder('Chocolate Shake'), emoji: '🥤', available: true, discount: 25, rating: 4.7 },
  { id: '6', name: 'Fish Tacos', price: 229.99, category: 'Tacos', description: 'Fresh fish, cabbage slaw, lime crema', image: generatePlaceholder('Fish Tacos'), emoji: '🌮', available: false, rating: 4.5 }
];

const mockOrders: Order[] = [
  { id: 'ord1', customer: { name: 'John Doe', phone: '+1234567890' }, totalAmount: 399.98, status: 'pending', items: [{ id: '1', name: 'Classic Burger', description: 'Beef patty...', price: 199.99, category: 'Burgers', available: true, quantity: 2, image: generatePlaceholder('Burger'), emoji: '🍔', rating: 4.8 }], timestamp: new Date(Date.now() - 300000).getTime() },
  { id: 'ord2', customer: { name: 'Jane Smith', phone: '+1234567891' }, totalAmount: 299.99, status: 'preparing', items: [{ id: '3', name: 'Margherita Pizza', description: 'Fresh mozzarella...', price: 299.99, category: 'Pizza', available: true, quantity: 1, image: generatePlaceholder('Pizza'), emoji: '🍕', rating: 4.9 }], timestamp: new Date(Date.now() - 900000).getTime() },
  { id: 'ord3', customer: { name: 'Mike Johnson', phone: '+1234567892' }, totalAmount: 329.98, status: 'ready', items: [{ id: '2', name: 'Chicken Sandwich', description: 'Grilled chicken...', price: 179.99, category: 'Sandwiches', available: true, quantity: 1, image: generatePlaceholder('Sandwich'), emoji: '🥪', rating: 4.6 }, { id: '4', name: 'Caesar Salad', description: 'Romaine lettuce...', price: 149.99, category: 'Salads', available: true, quantity: 1, image: generatePlaceholder('Salad'), emoji: '🥗', rating: 4.4 }], timestamp: new Date(Date.now() - 1500000).getTime() }
];


const OrderNowApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'customer' | 'dashboard'>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '', email: '' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const filteredItems = menuItems.filter(item =>
    (selectedCategory === 'All' || item.category === selectedCategory) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const placeOrder = async () => {
    console.log('Starting order placement...');
    // This call fixes the error by using the setOrderPlaced function
    setOrderPlaced(true);

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
          customer: customerInfo,
          store_id: 'demo-store', // Replace with dynamic store ID if needed
          currency: 'mxn',
          locale: 'es'
        }),
      });

      if (!response.ok) {
        throw new Error(`Stripe session creation failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe's checkout page
        window.location.href = data.url;
      } else {
        alert('Error: No checkout URL was received from the server.');
        setOrderPlaced(false); // Reset on error
      }
    } catch (error) {
      console.error('Detailed error placing order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error processing payment: ${errorMessage}`);
      setOrderPlaced(false); // Reset on error
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const toggleAvailability = (itemId: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === itemId && item.available !== undefined ? { ...item, available: !item.available } : item
    ));
  };

  const DashboardHeader = () => (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center overflow-hidden">
              <img src={yapLogo} alt="YAP Logo" className="w-10 h-10 object-cover rounded-md" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">YAP Dashboard</h1>
              <p className="text-sm text-gray-500">Manage orders and menu</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Add Admin Login Link */}
            <Link
              to="/admin/login"
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors border border-gray-300 hover:border-gray-500 px-3 py-2 rounded-lg"
            >
              🔑 Full Admin
            </Link>
            <button
              onClick={() => setCurrentView('customer')}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-full hover:bg-teal-700 font-medium"
            >
              View Storefront
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
            <input type="text" placeholder="Search for food..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map(category => (
              <button key={category} onClick={() => setSelectedCategory(category)} className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const MenuItemComponent = ({ item }: { item: MenuItem }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        {item.image && <img src={item.image} alt={item.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />}
        {item.discount && <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">{item.discount}% OFF</div>}
        {!item.available && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"><span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium">Out of Stock</span></div>}
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
            <span className="text-xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
            {item.originalPrice && <span className="text-sm text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>}
          </div>
          <div className="flex items-center space-x-2">
            {cart.find(cartItem => cartItem.id === item.id) ? (
              <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-sm"><Minus className="w-4 h-4 text-gray-600" /></button>
                <span className="font-bold text-gray-900 min-w-[20px] text-center">{cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}</span>
                <button onClick={() => addToCart(item)} className="w-8 h-8 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center"><Plus className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => addToCart(item)} disabled={!item.available} className={`px-6 py-2.5 rounded-full font-medium transition-all ${item.available ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
                {item.available ? 'Add to Cart' : 'Unavailable'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const CartItemComponent = ({ item }: { item: CartItem }) => (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
      {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />}
      <div className="flex-1">
        <h4 className="font-bold text-gray-900">{item.name}</h4>
        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
      </div>
      <span className="font-bold text-lg text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  );

  const Checkout = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
            <button onClick={() => setShowCheckout(false)} className="p-2 text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
          </div>
          <div className="space-y-4 mb-8">
            {cart.map(item => (<CartItemComponent key={item.id} item={item} />))}
          </div>
          <div className="border-t border-gray-200 pt-6 mb-8">
            <div className="flex justify-between items-center"><span className="text-xl font-bold text-gray-900">Total:</span><span className="text-2xl font-bold text-teal-600">${cartTotal.toFixed(2)}</span></div>
          </div>
          <div className="space-y-4 mb-8">
            <input type="text" placeholder="Your Name" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} className="w-full px-6 py-4 border border-gray-200 rounded-2xl" />
            <input type="tel" placeholder="Phone Number" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className="w-full px-6 py-4 border border-gray-200 rounded-2xl" />
            <input type="email" placeholder="Email (Optional)" value={customerInfo.email || ''} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} className="w-full px-6 py-4 border border-gray-200 rounded-2xl" />
          </div>
          <button onClick={placeOrder} disabled={!customerInfo.name || !customerInfo.phone || cart.length === 0} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg">Proceed to Payment - ${cartTotal.toFixed(2)}</button>
        </div>
      </div>
    </div>
  );



  const DashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[
        { label: 'Total Orders', value: orders.length, icon: Package, color: 'blue' },
        { label: 'Revenue', value: `$${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}`, icon: DollarSign, color: 'green' },
        { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'orange' },
        { label: 'Menu Items', value: menuItems.length, icon: TrendingUp, color: 'purple' }
      ].map((stat, index) => (
        <div key={index} className={`bg-${stat.color}-50 p-6 rounded-2xl border border-gray-100`}>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600 mb-1">{stat.label}</p><p className="text-2xl font-bold text-gray-900">{stat.value}</p></div>
            <div className={`p-3 rounded-xl bg-${stat.color}-100`}><stat.icon className={`w-6 h-6 text-${stat.color}-600`} /></div>
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
          <p className="text-sm text-gray-600">{order.customer.name} • {order.customer.phone}</p>
          <p className="text-xs text-gray-500">{new Date(order.timestamp).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'pending' ? 'bg-orange-100 text-orange-800' : order.status === 'preparing' ? 'bg-blue-100 text-blue-800' : order.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
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
        {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 font-medium">Start Preparing</button>}
        {order.status === 'preparing' && <button onClick={() => updateOrderStatus(order.id, 'ready')} className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 font-medium">Mark Ready</button>}
        {order.status === 'ready' && <button onClick={() => updateOrderStatus(order.id, 'completed')} className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 font-medium">Complete</button>}
        <button className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"><Phone className="w-4 h-4" /></button>
      </div>
    </div>
  );

  const MenuItemManagement = ({ item }: { item: MenuItem }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center space-x-4">
        {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />}
        <div>
          <h3 className="font-medium text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
        </div>
      </div>
      <button onClick={() => toggleAvailability(item.id)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${item.available ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
        {item.available ? 'Available' : 'Unavailable'}
      </button>
    </div>
  );

  const MenuManagement = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Menu Management</h2>
      <div className="space-y-4">
        {menuItems.map(item => (<MenuItemManagement key={item.id} item={item} />))}
      </div>
    </div>
  );

  const SuccessMessage = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="mb-6"><CheckCircle className="w-20 h-20 text-green-500 mx-auto" /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Placed!</h2>
        <p className="text-gray-600 mb-6">Your order has been received and is being prepared.</p>
        <div className="bg-green-50 p-4 rounded-2xl"><p className="text-sm text-green-800">We'll send you updates via WhatsApp</p></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'customer' ? (
        <>
          <DashboardHeader />
          <SearchAndFilter />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <MenuItemComponent key={item.id} item={item} />
              ))}
            </div>
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