import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppErrorBoundary } from './components/ErrorBoundary';
import OrderNowApp from './components/OrderNowApp';
import OrderPage from './pages/OrderPage';
import OrderSuccess from './pages/OrderSuccess';
import MarketingPage from './pages/MarketingPage';
import StoreDirectory from './pages/StoreDirectory';

// Import your logos - adjust paths as needed
import viteLogo from '/vite.svg';
import reactLogo from './assets/react.svg';

// Test component that will trigger error boundary
function TestErrorBoundary() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error("This error will be caught by the error boundary!");
  }

  return (
    <button
      onClick={() => setShouldError(true)}
      className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
    >
      Test Error Boundary (Will show fallback UI)
    </button>
  );
}

function HomePage() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-800">Order Now MVP</h1>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/marketing"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Marketing
                </Link>
                <Link
                  to="/stores"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Store Directory
                </Link>
                <Link
                  to="/order/dra-veronica-rosas"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Dr. Verónica
                </Link>
                <Link
                  to="/order/bella-italia"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Order Food
                </Link>
                {/* Add link to the new OrderNowApp */}
                <Link
                  to="/order-now"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Order Now Demo
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-8 mb-6">
            <a href="https://vite.dev" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
              <img src={viteLogo} className="logo w-16 h-16" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
              <img src={reactLogo} className="logo react w-16 h-16" alt="React logo" />
            </a>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 inline-block">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              YapaNow - Multi-Channel Ordering Platform
            </h1>
            <p className="text-gray-600">Restaurants • Academic Services • Professional Consultations</p>
            <p className="text-sm text-gray-500 mt-2">Vite + React + Tailwind + Supabase ✅</p>
          </div>
        </div>

        {/* Quick Demo Section */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
          {/* Dr. Verónica Demo */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🦎 Academic Services</h2>
            <p className="text-gray-600 mb-6">
              Experience Dr. Verónica's professional biology consulting platform with Facebook integration.
            </p>
            <button
              onClick={() => navigate('/order/dra-veronica-rosas')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors transform hover:scale-105 active:scale-95 w-full mb-4"
            >
              🚀 Solicitar Servicios
            </button>
            <div className="text-sm text-gray-500">
              <p>✅ Spanish interface</p>
              <p>✅ Academic service catalog</p>
              <p>✅ Facebook deep link ready</p>
              <p>✅ Mexican peso pricing</p>
            </div>
          </div>

          {/* Restaurant Demo */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🍕 Restaurant Orders</h2>
            <p className="text-gray-600 mb-6">
              Traditional restaurant ordering experience with real-time cart updates.
            </p>
            <button
              onClick={() => navigate('/order/bella-italia')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors transform hover:scale-105 active:scale-95 w-full mb-4"
            >
              🚀 Order Food Now
            </button>
            <div className="text-sm text-gray-500">
              <p>✅ Multi-restaurant support</p>
              <p>✅ Real-time cart updates</p>
              <p>✅ Payment integration ready</p>
              <p>✅ Database connected</p>
            </div>
          </div>

          {/* New OrderNowApp Demo */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎨 Modern Order UI</h2>
            <p className="text-gray-600 mb-6">
              Experience the new modern ordering interface with WhatsApp-inspired design.
            </p>
            <button
              onClick={() => navigate('/order-now')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-colors transform hover:scale-105 active:scale-95 w-full mb-4"
            >
              🚀 Try Modern UI
            </button>
            <div className="text-sm text-gray-500">
              <p>✅ WhatsApp design language</p>
              <p>✅ Modern card layouts</p>
              <p>✅ Stripe integration ready</p>
              <p>✅ Admin dashboard included</p>
            </div>
          </div>
        </div>

        {/* Platform Features */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 Platform Features</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Multi-business support (restaurants, services, consulting)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Facebook deep link integration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">WhatsApp messaging ready</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Real-time order management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Multi-language support (EN/ES)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Professional service catalogs</span>
              </div>
            </div>
          </div>

          {/* Development Tools Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🛠️ Dev Tools</h2>
            <div className="text-center">
              <div className="text-6xl font-bold text-indigo-600 mb-4">{count}</div>
              <div className="space-x-2">
                <button
                  onClick={() => setCount((count) => count + 1)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => setCount(0)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            {/* Error Boundary Test Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Error Boundary Tests</h3>
              <div className="space-y-2">
                <TestErrorBoundary />
              </div>
            </div>
          </div>
        </div>

        {/* Facebook Integration Demo */}
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📱 Facebook Integration Test</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Dr. Verónica's Facebook Button</h3>
              <p className="text-sm text-blue-600 mb-3">Simulates clicking "Solicitar Servicios" from Facebook</p>
              <div className="bg-white p-3 rounded border border-blue-200">
                <code className="text-xs text-gray-600">
                  https://yapanow.netlify.app/order/dra-veronica-rosas
                </code>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Restaurant Facebook Button</h3>
              <p className="text-sm text-green-600 mb-3">Simulates clicking "Order Now" from Facebook</p>
              <div className="bg-white p-3 rounded border border-green-200">
                <code className="text-xs text-gray-600">
                  https://yapanow.netlify.app/order/bella-italia
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">🎯 Implementation Status</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <h4 className="font-semibold text-green-800">✅ Completed</h4>
                <ul className="text-sm text-green-600 mt-2 space-y-1">
                  <li>• Multi-business platform architecture</li>
                  <li>• Dr. Verónica's academic services</li>
                  <li>• Facebook deep link integration</li>
                  <li>• Store directory system</li>
                  <li>• Spanish/English interfaces</li>
                  <li>• Modern OrderNowApp UI</li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-800">🚧 Next Steps</h4>
                <ul className="text-sm text-blue-600 mt-2 space-y-1">
                  <li>• Connect real Supabase data</li>
                  <li>• Add payment processing</li>
                  <li>• Build store owner dashboard</li>
                  <li>• Implement WhatsApp notifications</li>
                  <li>• Add real image uploads</li>
                  <li>• Production deployment optimization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="flex justify-center space-x-4 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              Vite + React
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
              Supabase
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              Tailwind CSS
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Multi-Language
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              Facebook Ready
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
              Modern UI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/stores" element={<StoreDirectory />} />
          <Route path="/order/:storeId" element={<OrderPage />} />
          {/* New route for the modern OrderNowApp */}
          <Route path="/order-now" element={<OrderNowApp />} />
          {/* Success page for Stripe redirects */}
          <Route path="/order/success" element={<OrderSuccess />} />
          {/* Legacy route for backward compatibility */}
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </Router>
    </AppErrorBoundary>
  );
}

export default App;