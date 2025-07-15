import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Book, Utensils, Briefcase, Star, ArrowRight } from 'lucide-react';

interface StoreData {
    id: string;
    name: string;
    type: string;
    description: string;
    image: string;
    rating: number;
    services: string[];
    location: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

const StoreDirectory = () => {
    const navigate = useNavigate();
    const stores: StoreData[] = [
        {
            id: 'dra-veronica-rosas',
            name: 'Dra. Verónica Carolina Rosas Espinoza',
            type: 'Academic Services',
            description: 'Bióloga especialista en biodiversidad, autora científica y consultora académica',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
            rating: 5.0,
            services: ['Estudios de Biodiversidad', 'Consultoría Ambiental', 'Conferencias', 'Publicaciones'],
            location: 'Zapopan, Jalisco, México',
            icon: Book,
            color: 'bg-green-100 text-green-600'
        },
        {
            id: 'bella-italia',
            name: 'Bella Italia',
            type: 'Restaurant',
            description: 'Authentic Italian cuisine made with love',
            image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=300&h=200&fit=crop',
            rating: 4.5,
            services: ['Pizza', 'Pasta', 'Salads', 'Desserts'],
            location: 'Downtown, City Center',
            icon: Utensils,
            color: 'bg-red-100 text-red-600'
        },
        {
            id: 'consulting-pro',
            name: 'ProConsult Business Solutions',
            type: 'Business Consulting',
            description: 'Strategic business consulting and digital transformation services',
            image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
            rating: 4.8,
            services: ['Strategy Consulting', 'Digital Transformation', 'Market Analysis', 'Training'],
            location: 'Business District',
            icon: Briefcase,
            color: 'bg-blue-100 text-blue-600'
        }
    ];

    const handleStoreClick = (storeId: string) => {
        // Use React Router navigation instead of window.location
        navigate(`/order/${storeId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">YapaNow</h1>
                        <p className="text-lg text-gray-600">Multi-Channel Ordering Platform</p>
                        <p className="text-sm text-gray-500 mt-2">Connecting businesses with customers through Facebook, WhatsApp, and direct web ordering</p>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-4">Discover Amazing Services & Products</h2>
                    <p className="text-xl mb-8">From academic expertise to delicious food - find what you need with just a click</p>
                    <div className="flex justify-center space-x-4 text-sm">
                        <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
                            <Store className="w-4 h-4 mr-2" />
                            <span>Multiple Businesses</span>
                        </div>
                        <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
                            <span>📱 Facebook Integration</span>
                        </div>
                        <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
                            <span>💬 WhatsApp Ready</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Stores */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Featured Partners</h3>
                        <p className="text-gray-600">Explore our diverse range of professional services and businesses</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stores.map((store) => {
                            const IconComponent = store.icon;
                            return (
                                <div key={store.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="relative">
                                        <img
                                            src={store.image}
                                            alt={store.name}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className={`absolute top-4 left-4 ${store.color} px-3 py-1 rounded-full flex items-center`}>
                                            <IconComponent className="w-4 h-4 mr-1" />
                                            <span className="text-sm font-medium">{store.type}</span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className="text-lg font-semibold text-gray-900 leading-tight">{store.name}</h4>
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                                <span className="text-sm font-medium text-gray-600">{store.rating}</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-4">{store.description}</p>

                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Featured Services:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {store.services.slice(0, 3).map((service, index) => (
                                                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                        {service}
                                                    </span>
                                                ))}
                                                {store.services.length > 3 && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                        +{store.services.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">{store.location}</span>
                                            <button
                                                onClick={() => handleStoreClick(store.id)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium"
                                            >
                                                {store.type === 'Academic Services' ? 'Solicitar Servicios' :
                                                    store.type === 'Restaurant' ? 'Order Now' : 'Get Quote'}
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Platform Features */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose YapaNow?</h3>
                        <p className="text-gray-600">Built for the modern multi-channel business world</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📱</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Facebook Integration</h4>
                            <p className="text-gray-600">Direct "Order Now" buttons that connect your Facebook page to instant ordering</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💬</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp Ready</h4>
                            <p className="text-gray-600">Future support for WhatsApp notifications and conversational ordering</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Orders</h4>
                            <p className="text-gray-600">Live dashboard for business owners to manage all incoming orders</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Business?</h3>
                    <p className="text-lg text-gray-300 mb-8">Join YapaNow and connect with customers across all channels</p>
                    <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                        <button className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Start Your Store
                        </button>
                        <button className="w-full sm:w-auto border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-gray-900 transition-colors font-medium">
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-gray-600">
                        <p>&copy; 2025 YapaNow. Multi-channel ordering platform for the modern business.</p>
                        <div className="mt-4 space-x-6">
                            <a href="#" className="hover:text-blue-600 transition-colors">Demo Stores</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">Features</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default StoreDirectory;