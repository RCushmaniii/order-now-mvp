import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AppErrorBoundary } from './components/ErrorBoundary'
import OrderPage from './pages/OrderPage'

// Test component that will trigger error boundary
function TestErrorBoundary() {
  const [shouldError, setShouldError] = useState(false);
  if (shouldError) {
    throw new Error("This error will be caught by the error boundary!");
  }
  return (
    <button
      onClick={() => setShouldError(true)}
      className="w-full bg-red-500 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
    >
      Test Error Boundary (Will show fallback UI)
    </button>
  );
}

function HomePage() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

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
                  to="/order"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Order Now
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-8 mb-6">
            <a href="https://vite.dev" target="_blank" className="transition-transform hover:scale-110">
              <img src={viteLogo} className="logo w-16 h-16" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank" className="transition-transform hover:scale-110">
              <img src={reactLogo} className="logo react w-16 h-16" alt="React logo" />
            </a>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 inline-block">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Restaurant Ordering Platform
            </h1>
            <p className="text-gray-600">Vite + React + Tailwind + Supabase ✅</p>
          </div>
        </div>

        {/* Quick Demo Section */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🍕 Order Demo</h2>
            <p className="text-gray-600 mb-6">
              Click below to see the customer ordering experience that integrates with your Supabase database.
            </p>
            <button
              onClick={() => navigate('/order?store=tonys-pizza')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors transform hover:scale-105 active:scale-95 w-full"
            >
              🚀 Try Live Demo
            </button>
            <div className="mt-4 text-sm text-gray-500">
              <p>✅ Facebook "Order Now" button simulation</p>
              <p>✅ Real-time cart updates</p>
              <p>✅ Database integration ready</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 Platform Features</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Multi-tenant restaurant support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Direct Stripe payments to restaurants</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">Facebook/WhatsApp integration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Real-time order management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Development Tools Section */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Counter Card - for development testing */}
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

          {/* Next Steps */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">🎯 Next Steps</h2>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">1. Connect Supabase</h4>
                <p className="text-sm text-blue-600">Replace mock data with real database</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">2. Add Stripe Payments</h4>
                <p className="text-sm text-green-600">Direct payments to restaurant accounts</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800">3. Store Owner Dashboard</h4>
                <p className="text-sm text-purple-600">Real-time order management</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-800">4. Facebook Integration</h4>
                <p className="text-sm text-orange-600">Deep links and messaging</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="flex justify-center space-x-4">
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
              Stripe
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AppErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </Router>
    </AppErrorBoundary>
  )
}

export default App