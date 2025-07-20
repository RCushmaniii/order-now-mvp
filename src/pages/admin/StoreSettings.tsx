// src/pages/admin/StoreSettings.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Store,
    Save,
    Phone,
    Clock,
    Globe,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

interface StoreData {
    id: string;
    name: string;
    slug: string;
    description: string;
    phone: string;
    address: string;
    email?: string;
    website?: string;
    is_active: boolean;
    business_type: string;
    business_config: {
        hours?: {
            monday?: string;
            tuesday?: string;
            wednesday?: string;
            thursday?: string;
            friday?: string;
            saturday?: string;
            sunday?: string;
        };
        social_media?: {
            facebook?: string;
            instagram?: string;
            whatsapp?: string;
        };
        delivery_options?: {
            pickup: boolean;
            delivery: boolean;
            delivery_radius?: number;
            delivery_fee?: number;
        };
        payment_methods?: string[];
        special_instructions?: string;
    };
}

const StoreSettings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
    const [storeData, setStoreData] = useState<StoreData>({
        id: '',
        name: '',
        slug: '',
        description: '',
        phone: '',
        address: '',
        email: '',
        website: '',
        is_active: true,
        business_type: 'bookstore',
        business_config: {
            hours: {
                monday: '9:00 AM - 6:00 PM',
                tuesday: '9:00 AM - 6:00 PM',
                wednesday: '9:00 AM - 6:00 PM',
                thursday: '9:00 AM - 6:00 PM',
                friday: '9:00 AM - 6:00 PM',
                saturday: '10:00 AM - 4:00 PM',
                sunday: 'Closed'
            },
            social_media: {
                facebook: '',
                instagram: '',
                whatsapp: ''
            },
            delivery_options: {
                pickup: true,
                delivery: false,
                delivery_radius: 10,
                delivery_fee: 0
            },
            payment_methods: ['cash', 'card', 'transfer'],
            special_instructions: ''
        }
    });

    // Mock data - replace with Supabase calls
    useEffect(() => {
        setTimeout(() => {
            setStoreData({
                id: '1',
                name: 'Dr. Verduras Conservation Biology Books',
                slug: 'dr-verduras-conservation-biology-books',
                description: 'Libros especializados en biología de la conservación y estudios ecológicos - Specialized books on conservation biology and ecological studies',
                phone: '+523315590572',
                address: 'Guadalajara, Jalisco, México',
                email: 'info@drverduras.com',
                website: 'https://drverduras.com',
                is_active: true,
                business_type: 'bookstore',
                business_config: {
                    hours: {
                        monday: '9:00 AM - 6:00 PM',
                        tuesday: '9:00 AM - 6:00 PM',
                        wednesday: '9:00 AM - 6:00 PM',
                        thursday: '9:00 AM - 6:00 PM',
                        friday: '9:00 AM - 6:00 PM',
                        saturday: '10:00 AM - 4:00 PM',
                        sunday: 'Closed'
                    },
                    social_media: {
                        facebook: 'https://facebook.com/drverduras',
                        instagram: 'https://instagram.com/drverduras',
                        whatsapp: '+523315590572'
                    },
                    delivery_options: {
                        pickup: true,
                        delivery: true,
                        delivery_radius: 15,
                        delivery_fee: 50
                    },
                    payment_methods: ['cash', 'card', 'transfer', 'paypal'],
                    special_instructions: 'Especialistas en literatura científica y consultoría ambiental. Contactar por WhatsApp para servicios personalizados.'
                }
            });
            setLoading(false);
        }, 1000);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Mock save - replace with Supabase update
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setSaving(false);
        }
    };

    const updateStoreData = (field: keyof StoreData, value: string | boolean) => {
        setStoreData(prev => ({ ...prev, [field]: value }));
    };

    const updateBusinessConfig = (field: string, value: unknown) => {
        setStoreData(prev => ({
            ...prev,
            business_config: {
                ...prev.business_config,
                [field]: value
            }
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading store settings...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
                            <p className="text-gray-600 mt-1">Manage your store information and configuration</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/admin/dashboard"
                                className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                            >
                                ← Back to Dashboard
                            </Link>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Save Status */}
            {saveStatus && (
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className={`border px-4 py-3 rounded-lg flex items-center space-x-2 ${
                        saveStatus === 'success' 
                            ? 'bg-green-100 border-green-200 text-green-800' 
                            : 'bg-red-100 border-red-200 text-red-800'
                    }`}>
                        {saveStatus === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <span>
                            {saveStatus === 'success' 
                                ? 'Store settings saved successfully!' 
                                : 'Failed to save settings. Please try again.'
                            }
                        </span>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Settings */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Store className="w-6 h-6 mr-2" />
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Store Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={storeData.name}
                                        onChange={(e) => updateStoreData('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Your store name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Business Type
                                    </label>
                                    <select
                                        value={storeData.business_type}
                                        onChange={(e) => updateStoreData('business_type', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="bookstore">Bookstore</option>
                                        <option value="restaurant">Restaurant</option>
                                        <option value="retail">Retail</option>
                                        <option value="services">Services</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={storeData.description}
                                    onChange={(e) => updateStoreData('description', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe your business..."
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Phone className="w-6 h-6 mr-2" />
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={storeData.phone}
                                        onChange={(e) => updateStoreData('phone', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+52 33 1234 5678"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={storeData.email || ''}
                                        onChange={(e) => updateStoreData('email', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="info@yourstore.com"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={storeData.address}
                                        onChange={(e) => updateStoreData('address', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Your business address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={storeData.website || ''}
                                        onChange={(e) => updateStoreData('website', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://yourstore.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Business Hours */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Clock className="w-6 h-6 mr-2" />
                                Business Hours
                            </h2>
                            <div className="space-y-4">
                                {Object.entries(storeData.business_config.hours || {}).map(([day, hours]) => (
                                    <div key={day} className="flex items-center space-x-4">
                                        <div className="w-24">
                                            <label className="text-sm font-medium text-gray-700 capitalize">
                                                {day}
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={hours}
                                            onChange={(e) => updateBusinessConfig('hours', {
                                                ...storeData.business_config.hours,
                                                [day]: e.target.value
                                            })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="9:00 AM - 6:00 PM or Closed"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Globe className="w-6 h-6 mr-2" />
                                Social Media
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Facebook Page
                                    </label>
                                    <input
                                        type="url"
                                        value={storeData.business_config.social_media?.facebook || ''}
                                        onChange={(e) => updateBusinessConfig('social_media', {
                                            ...storeData.business_config.social_media,
                                            facebook: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://facebook.com/yourstore"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instagram
                                    </label>
                                    <input
                                        type="url"
                                        value={storeData.business_config.social_media?.instagram || ''}
                                        onChange={(e) => updateBusinessConfig('social_media', {
                                            ...storeData.business_config.social_media,
                                            instagram: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://instagram.com/yourstore"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        WhatsApp Business
                                    </label>
                                    <input
                                        type="tel"
                                        value={storeData.business_config.social_media?.whatsapp || ''}
                                        onChange={(e) => updateBusinessConfig('social_media', {
                                            ...storeData.business_config.social_media,
                                            whatsapp: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+52 33 1234 5678"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Store Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Status</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {storeData.is_active ? (
                                        <Eye className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <EyeOff className="w-5 h-5 text-red-600" />
                                    )}
                                    <span className={`font-medium ${
                                        storeData.is_active ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {storeData.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => updateStoreData('is_active', !storeData.is_active)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        storeData.is_active
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                    {storeData.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-3">
                                {storeData.is_active 
                                    ? 'Your store is visible to customers and accepting orders.'
                                    : 'Your store is hidden from customers and not accepting orders.'
                                }
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Store ID</span>
                                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                        #{storeData.id}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">URL Slug</span>
                                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                        {storeData.slug}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Business Type</span>
                                    <span className="capitalize font-medium">
                                        {storeData.business_type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Special Instructions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Instructions</h3>
                            <textarea
                                rows={4}
                                value={storeData.business_config.special_instructions || ''}
                                onChange={(e) => updateBusinessConfig('special_instructions', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Special instructions for customers..."
                            />
                            <p className="text-sm text-gray-600 mt-2">
                                These instructions will be shown to customers during checkout.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreSettings;
