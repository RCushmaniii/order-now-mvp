import React from 'react';
import { Link } from 'react-router-dom';

const MarketingPage: React.FC = () => {
    return (
        <div className="marketing-page">
          // Update the navigation section in MarketingPage.tsx
            <header className="fixed top-0 w-full bg-black/95 backdrop-blur-sm z-50 border-b border-white/10">
                <nav className="container mx-auto px-5 flex justify-between items-center py-4">
                    <Link to="/" className="text-2xl font-bold text-white">
                        YapaNow
                    </Link>
                    <div className="hidden md:flex space-x-8">
                        <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                        <a href="#demo" className="text-gray-300 hover:text-white transition-colors">Demo</a>
                        <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                        <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
                        {/* Add Admin Login Link */}
                        <Link
                            to="/admin/login"
                            className="text-gray-300 hover:text-white transition-colors border border-gray-500 hover:border-white px-3 py-1 rounded"
                        >
                            Admin
                        </Link>
                    </div>
                    <div className="flex space-x-4">
                        <Link
                            to="/stores"
                            className="bg-gradient-to-r from-gray-100 to-gray-200 text-black px-6 py-2 rounded-lg font-semibold hover:transform hover:-translate-y-1 transition-all duration-300"
                        >
                            Try Live Demo
                        </Link>
                        {/* Alternative: Admin button with icon */}
                        <Link
                            to="/admin/login"
                            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 border border-gray-600"
                        >
                            🔑 Admin
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-black to-gray-900 text-white pt-32 pb-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-30"></div>
                <div className="container mx-auto px-5 relative z-10">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        💡 From Facebook to Orders in Minutes
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-4xl mx-auto">
                        The multi-channel ordering platform that eliminates technical nightmares for small businesses.
                        Connect your Facebook page directly to instant ordering - no hosting, no domains, no headaches.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/stores"
                            className="bg-gradient-to-r from-gray-100 to-gray-200 text-black px-8 py-3 rounded-lg font-semibold hover:transform hover:-translate-y-1 transition-all duration-300"
                        >
                            See Live Demo
                        </Link>
                        <a
                            href="#features"
                            className="border-2 border-gray-300 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 hover:text-black transition-all duration-300"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="bg-gray-100 py-20 text-black">
                <div className="container mx-auto px-5">
                    <h2 className="text-4xl font-bold text-center mb-12">🚧 The Real-World Problem</h2>
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/70 p-8 rounded-xl border-l-4 border-gray-800">
                            <h3 className="text-2xl font-semibold mb-4">Technical Hurdles That Kill Small Business Dreams</h3>
                            <p className="mb-6">Setting up a simple "Order Now" button from Facebook to your store page requires:</p>
                            <ul className="space-y-3">
                                {[
                                    'Buy a domain (Namecheap, GoDaddy, etc.)',
                                    'Connect it to a web host (Netlify, Vercel, HostGator...)',
                                    'Configure DNS correctly — A records, CNAMEs, maybe SSL',
                                    'Create redirect rules or dynamic paths (e.g., /order/[store])',
                                    'Deal with weird Facebook edge cases and Meta formatting issues',
                                    'Worry about mobile loading times, HTTPS redirects, browser errors'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-red-500 mr-2">❌</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-black text-gray-100 p-8 rounded-xl mt-8 text-center">
                            <h3 className="text-2xl font-semibold mb-4">📉 Reality Check</h3>
                            <p className="text-lg">
                                The average small business in Mexico — a taquería, a nail salon, a local vet — is never going to finish this setup.
                                Most don't even know what DNS means. They just want something that works.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="bg-black text-gray-100 py-20">
                <div className="container mx-auto px-5">
                    <h2 className="text-4xl font-bold text-center mb-12">🧩 Our Solution: We Own the Complexity</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Instead of Complex Setup",
                                items: [
                                    "No domain purchasing required",
                                    "No hosting configuration",
                                    "No DNS management",
                                    "No technical knowledge needed"
                                ]
                            },
                            {
                                title: "We Give You Copy-Paste Links",
                                items: [
                                    "yapanow.netlify.app/order/your-business",
                                    "Works instantly across all platforms",
                                    "Facebook, Instagram, WhatsApp ready",
                                    "QR code compatible"
                                ]
                            },
                            {
                                title: "We Handle Everything",
                                items: [
                                    "Dynamic page generation",
                                    "Live data integration",
                                    "Performance optimization",
                                    "Mobile-first design"
                                ]
                            }
                        ].map((card, index) => (
                            <div key={index} className="bg-white/5 p-8 rounded-xl border border-white/10">
                                <h3 className="text-2xl font-semibold mb-4">{card.title}</h3>
                                <ul className="space-y-2">
                                    {card.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start">
                                            <span className="text-green-400 mr-2">✅</span>
                                            <span className="text-gray-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="bg-gray-100 py-20">
                <div className="container mx-auto px-5">
                    <h2 className="text-4xl font-bold text-center mb-12 text-black">✅ Multi-Channel Platform Features</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "🌐",
                                title: "Multi-Business Support",
                                description: "Restaurants, consulting, academic services, and more - all in one platform"
                            },
                            {
                                icon: "📱",
                                title: "Facebook Integration",
                                description: "Direct \"Order Now\" buttons that connect Facebook pages to instant ordering"
                            },
                            {
                                icon: "🌍",
                                title: "Bilingual Support",
                                description: "Spanish/English interfaces that adapt to your business type"
                            },
                            {
                                icon: "📋",
                                title: "Dynamic Ordering",
                                description: "Adaptive UI that changes based on business type - food orders vs. service requests"
                            },
                            {
                                icon: "💻",
                                title: "Modern Tech Stack",
                                description: "React, TypeScript, Tailwind CSS - built for performance and reliability"
                            },
                            {
                                icon: "🔄",
                                title: "Error Handling",
                                description: "Comprehensive error boundary system for 99.9% uptime"
                            }
                        ].map((feature, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl text-center shadow-lg hover:transform hover:-translate-y-2 transition-all duration-300">
                                <div className="text-5xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-4 text-black">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            <section id="demo" className="bg-black text-gray-100 py-20">
                <div className="container mx-auto px-5">
                    <h2 className="text-4xl font-bold text-center mb-12">🎯 Live Demo Businesses</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "🧬 Dr. Verónica (Academic Services)",
                                description: "Spanish interface for biology consulting services with professional service request system",
                                link: "/order/dra-veronica-rosas"
                            },
                            {
                                title: "🍕 Bella Italia (Restaurant)",
                                description: "Traditional food ordering interface with cart-based ordering system",
                                link: "/order/bella-italia"
                            },
                            {
                                title: "🏪 Store Directory",
                                description: "Browse all available businesses and services in our platform",
                                link: "/stores"
                            }
                        ].map((demo, index) => (
                            <div key={index} className="bg-white/5 p-8 rounded-xl border border-white/10">
                                <h3 className="text-2xl font-semibold mb-4">{demo.title}</h3>
                                <p className="text-gray-300 mb-6">{demo.description}</p>
                                <Link
                                    to={demo.link}
                                    className="inline-block bg-gray-100 text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 hover:transform hover:-translate-y-1 transition-all duration-300"
                                >
                                    View Demo
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="bg-gray-100 py-20">
                <div className="container mx-auto px-5">
                    <h2 className="text-4xl font-bold text-center mb-12 text-black">💰 Simple, Scalable Pricing</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Starter",
                                price: "Free",
                                description: "Get started instantly",
                                features: [
                                    "yapanow.netlify.app/your-store URL",
                                    "Facebook integration ready",
                                    "Basic ordering system",
                                    "Mobile-optimized",
                                    "Email support"
                                ],
                                cta: "Start Free",
                                link: "/stores"
                            },
                            {
                                name: "Professional",
                                price: "$29/mo",
                                description: "Perfect for growing businesses",
                                features: [
                                    "Custom domain (yourstore.com)",
                                    "White-label URLs",
                                    "Custom branding",
                                    "Analytics dashboard",
                                    "Priority support",
                                    "WhatsApp integration"
                                ],
                                cta: "Get Started",
                                link: "#contact",
                                featured: true
                            },
                            {
                                name: "Enterprise",
                                price: "Custom",
                                description: "For multiple locations",
                                features: [
                                    "Multiple store management",
                                    "Advanced analytics",
                                    "Custom integrations",
                                    "Dedicated support",
                                    "API access",
                                    "Training included"
                                ],
                                cta: "Contact Sales",
                                link: "#contact"
                            }
                        ].map((plan, index) => (
                            <div key={index} className={`bg-white p-8 rounded-xl text-center shadow-lg ${plan.featured ? 'transform scale-105 border-2 border-gray-800' : ''}`}>
                                <h3 className="text-2xl font-semibold mb-4 text-black">{plan.name}</h3>
                                <div className="text-4xl font-bold text-gray-800 mb-4">{plan.price}</div>
                                <p className="text-gray-600 mb-8">{plan.description}</p>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start justify-center">
                                            <span className="text-green-500 mr-2">✅</span>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to={plan.link}
                                    className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:transform hover:-translate-y-1 transition-all duration-300 inline-block"
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section id="contact" className="bg-gradient-to-br from-black to-gray-900 text-gray-100 py-20 text-center">
                <div className="container mx-auto px-5">
                    <h2 className="text-4xl font-bold mb-6">🔄 Ready to Eliminate the Tech Headaches?</h2>
                    <p className="text-xl mb-8 text-gray-300">
                        Join businesses that have already made the switch to instant, hassle-free ordering
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/stores"
                            className="bg-gradient-to-r from-gray-100 to-gray-200 text-black px-8 py-3 rounded-lg font-semibold hover:transform hover:-translate-y-1 transition-all duration-300"
                        >
                            Try Live Demo
                        </Link>
                        <Link
                            to="/stores"
                            className="border-2 border-gray-300 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 hover:text-black transition-all duration-300"
                        >
                            Browse Examples
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black text-gray-400 py-12 text-center">
                <div className="container mx-auto px-5">
                    <p>&copy; 2024 YapaNow. Connecting businesses with customers across all channels. 🚀</p>
                </div>
            </footer>
        </div>
    );
};

export default MarketingPage;