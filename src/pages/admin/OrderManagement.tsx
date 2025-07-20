// src/pages/admin/OrderManagement.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShoppingBag,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Search,
    Phone,
    Mail,
    DollarSign,
    Package,
    User
} from 'lucide-react';

interface Order {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    total_amount: number;
    status: 'pending' | 'paid' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    created_at: string;
    updated_at: string;
    notes?: string;
    items: OrderItem[];
}

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
}

const OrderManagement: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    // Mock data - replace with Supabase calls
    useEffect(() => {
        setTimeout(() => {
            const mockOrders: Order[] = [
                {
                    id: '1',
                    customer_name: 'Dr. María González',
                    customer_phone: '+523315590572',
                    customer_email: 'maria.gonzalez@universidad.edu.mx',
                    total_amount: 830.00,
                    status: 'delivered',
                    created_at: '2025-01-19T14:30:00Z',
                    updated_at: '2025-01-19T16:45:00Z',
                    notes: 'Pedido de libros para investigación universitaria - Biodiversidad + Conservation Biology',
                    items: [
                        { id: '1', name: 'Biodiversidad en Ecosistemas Tropicales', quantity: 1, price: 450.00 },
                        { id: '2', name: 'Conservation Biology: Field Methods', quantity: 1, price: 380.00 }
                    ]
                },
                {
                    id: '2',
                    customer_name: 'Prof. Carlos Mendoza',
                    customer_phone: '+523312345678',
                    customer_email: 'carlos.mendoza@iteso.mx',
                    total_amount: 2500.00,
                    status: 'pending',
                    created_at: '2025-01-19T13:15:00Z',
                    updated_at: '2025-01-19T13:15:00Z',
                    notes: 'Estudio ecológico para proyecto de conservación en la Sierra de Manantlán',
                    items: [
                        { id: '3', name: 'Estudio Ecológico Personalizado', quantity: 1, price: 2500.00 }
                    ]
                },
                {
                    id: '3',
                    customer_name: 'Ana Rodríguez',
                    customer_phone: '+523319876543',
                    customer_email: 'ana.rodriguez@estudiante.udg.mx',
                    total_amount: 470.00,
                    status: 'delivered',
                    created_at: '2025-01-19T11:20:00Z',
                    updated_at: '2025-01-19T12:30:00Z',
                    notes: 'Guía de campo + PDF metodologías para tesis de maestría',
                    items: [
                        { id: '4', name: 'Guía de Campo: Flora Nativa de Jalisco', quantity: 1, price: 320.00 },
                        { id: '5', name: 'PDF: Metodologías de Muestreo Ecológico', quantity: 1, price: 150.00 }
                    ]
                }
            ];
            setOrders(mockOrders);
            setFilteredOrders(mockOrders);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter orders
    useEffect(() => {
        let filtered = orders;
        
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(order => order.status === selectedStatus);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer_phone.includes(searchTerm) ||
                order.id.includes(searchTerm)
            );
        }
        
        setFilteredOrders(filtered);
    }, [orders, selectedStatus, searchTerm]);

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        setOrders(prev => prev.map(order =>
            order.id === orderId
                ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
                : order
        ));
    };

    const getStatusBadge = (status: Order['status']) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            paid: { color: 'bg-blue-100 text-blue-800', text: 'Paid' },
            preparing: { color: 'bg-purple-100 text-purple-800', text: 'Preparing' },
            ready: { color: 'bg-green-100 text-green-800', text: 'Ready' },
            delivered: { color: 'bg-gray-100 text-gray-800', text: 'Delivered' },
            cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
        };

        const config = statusConfig[status];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0)
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                            <p className="text-gray-600 mt-1">Track and manage customer orders</p>
                        </div>
                        <Link
                            to="/admin/dashboard"
                            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <Package className="w-6 h-6 text-purple-600" />
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Preparing</p>
                                <p className="text-xl font-bold text-gray-900">{stats.preparing}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Ready</p>
                                <p className="text-xl font-bold text-gray-900">{stats.ready}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <CheckCircle className="w-6 h-6 text-gray-600" />
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Delivered</p>
                                <p className="text-xl font-bold text-gray-900">{stats.delivered}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Revenue</p>
                                <p className="text-xl font-bold text-gray-900">${stats.totalRevenue.toFixed(0)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium text-gray-700">Status:</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Orders</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                                            <div className="text-sm text-gray-500">{order.items.length} items</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                                                    <div className="text-sm text-gray-500">{order.customer_phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">${order.total_amount.toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="preparing">Preparing</option>
                                                <option value="ready">Ready</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowOrderModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>View</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-600">
                                {searchTerm || selectedStatus !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Orders will appear here when customers place them'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Detail Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                                <button
                                    onClick={() => setShowOrderModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">{selectedOrder.customer_name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span>{selectedOrder.customer_phone}</span>
                                    </div>
                                    {selectedOrder.customer_email && (
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            <span>{selectedOrder.customer_email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                                        <span className="text-xl font-bold text-gray-900">${selectedOrder.total_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Notes */}
                            {selectedOrder.notes && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700">{selectedOrder.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Order Status */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Status</h3>
                                <div className="flex items-center justify-between">
                                    {getStatusBadge(selectedOrder.status)}
                                    <div className="text-sm text-gray-500">
                                        <p>Created: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                        <p>Updated: {new Date(selectedOrder.updated_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
