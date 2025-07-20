// src/pages/admin/MenuManagement.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Star,
    Package,
    Filter,
    MoreVertical,
    X,
    Save
} from 'lucide-react';

// TypeScript interfaces
interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    available: boolean;
    featured: boolean;
    ingredients?: string[];
    allergens?: string[];
    created_at: string;
    updated_at: string;
}

interface Category {
    id: string;
    name: string;
    display_order: number;
    active: boolean;
}

const MenuManagement: React.FC = () => {
    // State management
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saveStatus, setSaveStatus] = useState<string>('');

    // Mock data - replace with Supabase calls
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setCategories([
                { id: '1', name: 'Appetizers', display_order: 1, active: true },
                { id: '2', name: 'Main Courses', display_order: 2, active: true },
                { id: '3', name: 'Desserts', display_order: 3, active: true },
                { id: '4', name: 'Beverages', display_order: 4, active: true },
                { id: '5', name: 'Academic Services', display_order: 5, active: true },
            ]);

            setMenuItems([
                {
                    id: '1',
                    name: 'Margherita Pizza',
                    description: 'Fresh tomatoes, mozzarella cheese, basil leaves',
                    price: 15.99,
                    category: 'Main Courses',
                    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop',
                    available: true,
                    featured: true,
                    ingredients: ['Tomatoes', 'Mozzarella', 'Basil', 'Olive Oil'],
                    allergens: ['Dairy', 'Gluten'],
                    created_at: '2024-01-01T10:00:00Z',
                    updated_at: '2024-01-01T10:00:00Z'
                },
                {
                    id: '2',
                    name: 'Caesar Salad',
                    description: 'Crisp romaine lettuce with our signature dressing',
                    price: 12.50,
                    category: 'Appetizers',
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
                    available: true,
                    featured: false,
                    ingredients: ['Romaine', 'Parmesan', 'Croutons', 'Caesar Dressing'],
                    allergens: ['Dairy', 'Gluten'],
                    created_at: '2024-01-01T10:00:00Z',
                    updated_at: '2024-01-01T10:00:00Z'
                },
                {
                    id: '3',
                    name: 'Biology Consultation',
                    description: 'Professional consultation on biodiversity and conservation',
                    price: 150.00,
                    category: 'Academic Services',
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
                    available: true,
                    featured: true,
                    created_at: '2024-01-01T10:00:00Z',
                    updated_at: '2024-01-01T10:00:00Z'
                },
                {
                    id: '4',
                    name: 'Tiramisu',
                    description: 'Classic Italian dessert with coffee and mascarpone',
                    price: 8.99,
                    category: 'Desserts',
                    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop',
                    available: false,
                    featured: false,
                    allergens: ['Dairy', 'Eggs'],
                    created_at: '2024-01-01T10:00:00Z',
                    updated_at: '2024-01-01T10:00:00Z'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter menu items
    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Handle item actions
    const handleToggleAvailability = async (itemId: string) => {
        setMenuItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, available: !item.available } : item
        ));
        setSaveStatus('Availability updated');
        setTimeout(() => setSaveStatus(''), 2000);
    };

    const handleToggleFeatured = async (itemId: string) => {
        setMenuItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, featured: !item.featured } : item
        ));
        setSaveStatus('Featured status updated');
        setTimeout(() => setSaveStatus(''), 2000);
    };

    const handleDeleteItem = async (itemId: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setMenuItems(prev => prev.filter(item => item.id !== itemId));
            setSaveStatus('Item deleted');
            setTimeout(() => setSaveStatus(''), 2000);
        }
    };

    const handleEditItem = (item: MenuItem) => {
        setEditingItem(item);
        setShowAddModal(true);
    };

    const handleSaveItem = async (itemData: Partial<MenuItem>) => {
        if (editingItem) {
            // Update existing item
            setMenuItems(prev => prev.map(item =>
                item.id === editingItem.id
                    ? { ...item, ...itemData, updated_at: new Date().toISOString() }
                    : item
            ));
            setSaveStatus('Item updated successfully');
        } else {
            // Add new item
            const newItem: MenuItem = {
                id: Date.now().toString(),
                name: itemData.name || '',
                description: itemData.description || '',
                price: itemData.price || 0,
                category: itemData.category || 'Main Courses',
                image: itemData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
                available: true,
                featured: false,
                ingredients: itemData.ingredients || [],
                allergens: itemData.allergens || [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            setMenuItems(prev => [newItem, ...prev]);
            setSaveStatus('Item added successfully');
        }

        setShowAddModal(false);
        setEditingItem(null);
        setTimeout(() => setSaveStatus(''), 3000);
    };

    // Statistics
    const stats = {
        total: menuItems.length,
        available: menuItems.filter(item => item.available).length,
        featured: menuItems.filter(item => item.featured).length,
        categories: categories.filter(cat => cat.active).length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading menu items...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                            <p className="text-gray-600 mt-1">Manage your products, services, and menu items</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/admin/dashboard"
                                className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                            >
                                ← Back to Dashboard
                            </Link>
                            <button
                                onClick={() => {
                                    setEditingItem(null);
                                    setShowAddModal(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add New Item</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Status Message */}
            {saveStatus && (
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        {saveStatus}
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <Package className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Items</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <Eye className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <Star className="w-8 h-8 text-yellow-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Featured</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <Filter className="w-8 h-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Categories</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search menu items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium text-gray-700">Category:</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.name}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            {/* Item Image */}
                            <div className="relative h-48 bg-gray-200">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    {item.featured && (
                                        <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                            ⭐ Featured
                                        </span>
                                    )}
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.available
                                            ? 'bg-green-500 text-white'
                                            : 'bg-red-500 text-white'
                                        }`}>
                                        {item.available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            </div>

                            {/* Item Details */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                                    <div className="relative ml-2">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-2xl font-bold text-gray-900">
                                        ${item.price.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {item.category}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleToggleAvailability(item.id)}
                                            className={`p-2 rounded-lg transition-colors ${item.available
                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                }`}
                                            title={item.available ? 'Mark Unavailable' : 'Mark Available'}
                                        >
                                            {item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleToggleFeatured(item.id)}
                                            className={`p-2 rounded-lg transition-colors ${item.featured
                                                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            title={item.featured ? 'Remove from Featured' : 'Add to Featured'}
                                        >
                                            <Star className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleEditItem(item)}
                                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                            title="Edit Item"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                            title="Delete Item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || selectedCategory !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Get started by adding your first menu item'
                            }
                        </p>
                        <button
                            onClick={() => {
                                setEditingItem(null);
                                setShowAddModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Add Your First Item
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <AddEditModal
                    item={editingItem}
                    categories={categories}
                    onSave={handleSaveItem}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingItem(null);
                    }}
                />
            )}
        </div>
    );
};

// Add/Edit Modal Component
interface AddEditModalProps {
    item: MenuItem | null;
    categories: Category[];
    onSave: (item: Partial<MenuItem>) => void;
    onClose: () => void;
}

const AddEditModal: React.FC<AddEditModalProps> = ({ item, categories, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price || 0,
        category: item?.category || 'Main Courses',
        image: item?.image || '',
        ingredients: item?.ingredients?.join(', ') || '',
        allergens: item?.allergens?.join(', ') || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
            allergens: formData.allergens.split(',').map(a => a.trim()).filter(Boolean)
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Item Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter item name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price *
                            </label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe your item..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {categories.map(category => (
                                    <option key={category.id} value={category.name}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image URL
                            </label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>

                    {/* Optional Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ingredients (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.ingredients}
                                onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="tomato, cheese, basil"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Allergens (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.allergens}
                                onChange={(e) => setFormData(prev => ({ ...prev, allergens: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="dairy, gluten, nuts"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>{item ? 'Update Item' : 'Add Item'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuManagement;