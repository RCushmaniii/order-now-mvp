// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    TrendingUp,
    Users,
    Package,
    DollarSign,
    Clock,
    Eye,
    Store,
    Star,
    Bell,
    LogOut,
    BarChart3
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { logger } from '../../services/logger';

interface DashboardStats {
    totalOrders: number;
    todayOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    totalProducts: number;
    activeProducts: number;
    pendingOrders: number;
    completedOrders: number;
}

interface RecentOrder {
    id: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    items_count: number;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        todayOrders: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        totalProducts: 0,
        activeProducts: 0,
        pendingOrders: 0,
        completedOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [storeName, setStoreName] = useState('Your Store');

    const checkAuth = React.useCallback(async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                navigate('/admin/login');
                return;
            }

            // Get store information
            const { data: profile } = await supabase
                .from('profiles')
                .select('store_id')
                .eq('id', user.id)
                .single();

            if (profile?.store_id) {
                const { data: store } = await supabase
                    .from('stores')
                    .select('name')
                    .eq('id', profile.store_id)
                    .single();

                if (store) {
                    setStoreName(store.name);
                }
            }
        } catch (error) {
            logger.error('Auth check failed', { error: error as Error });
            navigate('/admin/login');
        }
    }, [navigate]);

    useEffect(() => {
        checkAuth();
        loadDashboardData();
    }, [checkAuth]);

    const loadDashboardData = async () => {
        try {
            // Mock data for demo - replace with real Supabase queries
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStats({
                totalOrders: 156,
                todayOrders: 12,
                totalRevenue: 8450.50,
                todayRevenue: 320.75,
                totalProducts: 24,
                activeProducts: 22,
                pendingOrders: 5,
                completedOrders: 151
            });

            setRecentOrders([
                {
                    id: '1',
                    customer_name: 'María González',
                    total_amount: 25.50,
                    status: 'pending',
                    created_at: '2024-01-20T14:30:00Z',
                    items_count: 3
                },
                {
                    id: '2',
                    customer_name: 'Carlos Ruiz',
                    total_amount: 45.00,
                    status: 'preparing',
                    created_at: '2024-01-20T13:15:00Z',
                    items_count: 2
                },
                {
                    id: '3',
                    customer_name: 'Ana Martínez',
                    total_amount: 18.75,
                    status: 'ready',
                    created_at: '2024-01-20T12:45:00Z',
                    items_count: 1
                },
                {
                    id: '4',
                    customer_name: 'Dr. Biology Student',
                    total_amount: 150.00,
                    status: 'completed',
                    created_at: '2024-01-20T11:20:00Z',
                    items_count: 1
                }
            ]);

            setLoading(false);
        } catch (error) {
            logger.error('Failed to load dashboard data', { error: error as Error });
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/admin/login');
        } catch (error) {
            logger.error('Logout failed', { error: error as Error });
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            preparing: { color: 'bg-blue-100 text-blue-800', text: 'Preparing' },
            ready: { color: 'bg-green-100 text-green-800', text: 'Ready' },
            completed: { color: 'bg-gray-100 text-gray-800', text: 'Completed' },
            cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-[#17c076] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">Y</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{storeName}</h1>
                                <p className="text-gray-600">Admin Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <Link
                                to="/"
                                className="text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center space-x-1"
                            >
                                <Eye className="w-4 h-4" />
                                <span>View Store</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center space-x-1"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back! 👋
                    </h2>
                    <p className="text-gray-600">
                        Here's what's happening with your business today.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <ShoppingBag className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                                <p className="text-xs text-green-600">+{stats.todayOrders} today</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                                <p className="text-xs text-green-600">+${stats.todayRevenue.toFixed(2)} today</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Products</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                                <p className="text-xs text-green-600">{stats.activeProducts} active</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                                <p className="text-xs text-gray-500">Need attention</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                            <div className="space-y-4">
                                <Link
                                    to="/admin/menu"
                                    className="w-full flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                                >
                                    <Package className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                                    <div className="ml-4">
                                        <p className="font-medium text-gray-900">Manage Menu</p>
                                        <p className="text-sm text-gray-600">Add, edit, or remove items</p>
                                    </div>
                                </Link>

                                <Link
                                    to="/admin/orders"
                                    className="w-full flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                                >
                                    <ShoppingBag className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
                                    <div className="ml-4">
                                        <p className="font-medium text-gray-900">View Orders</p>
                                        <p className="text-sm text-gray-600">Process and track orders</p>
                                    </div>
                                </Link>

                                <Link
                                    to="/admin/store"
                                    className="w-full flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                                >
                                    <Store className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
                                    <div className="ml-4">
                                        <p className="font-medium text-gray-900">Store Settings</p>
                                        <p className="text-sm text-gray-600">Update store information</p>
                                    </div>
                                </Link>

                                <Link
                                    to="/admin/analytics"
                                    className="w-full flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
                                >
                                    <BarChart3 className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform" />
                                    <div className="ml-4">
                                        <p className="font-medium text-gray-900">Analytics</p>
                                        <p className="text-sm text-gray-600">View performance metrics</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                                <Link
                                    to="/admin/orders"
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                                >
                                    View All →
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {recentOrders.map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Users className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{order.customer_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {order.items_count} item{order.items_count !== 1 ? 's' : ''} •
                                                    {new Date(order.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">${order.total_amount.toFixed(2)}</p>
                                                {getStatusBadge(order.status)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {recentOrders.length === 0 && (
                                <div className="text-center py-8">
                                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No recent orders</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-green-600">+15%</p>
                            <p className="text-sm text-gray-600">Sales vs last month</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-600">89</p>
                            <p className="text-sm text-gray-600">Active customers</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-purple-600">4.8</p>
                            <p className="text-sm text-gray-600">Average rating</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;