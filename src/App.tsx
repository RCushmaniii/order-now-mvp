import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AppErrorBoundary } from './components/ErrorBoundary'

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

function AppContent() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
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
              Vite + React + Tailwind ✅
            </h1>
            <p className="text-gray-600">Now with beautiful styling!</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Counter Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Interactive Counter</h2>
            <div className="text-center">
              <div className="text-6xl font-bold text-indigo-600 mb-4">{count}</div>
              <button
                onClick={() => setCount((count) => count + 1)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors transform hover:scale-105 active:scale-95"
              >
                Increment Count
              </button>
              <button
                onClick={() => setCount(0)}
                className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Error Boundary Test Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Error Boundary Tests</h3>
              <div className="space-y-2">
                <TestErrorBoundary />
                <button
                  onClick={() => {
                    try {
                      throw new Error("Event handler error - won't be caught by error boundary");
                    } catch (error) {
                      console.error("Event handler error caught:", error);
                      alert("Event handler error caught! Check console.");
                    }
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Test Event Handler Error (Won't crash app)
                </button>
              </div>
            </div>
          </div>

          {/* Feature Showcase */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tailwind Features</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Responsive Design</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Hover Effects</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">Smooth Transitions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-gray-700">Custom Components</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Boxes */}
        <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Tailwind is working perfectly.</span>
          </div>
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
            <strong className="font-bold">Info:</strong>
            <span className="block sm:inline"> Edit <code className="bg-blue-200 px-1 rounded">src/App.tsx</code> to test HMR.</span>
          </div>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
            <strong className="font-bold">Tip:</strong>
            <span className="block sm:inline"> Try different Tailwind classes!</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Click on the Vite and React logos to learn more
          </p>
          <div className="flex justify-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              Vite
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
              React
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              Tailwind CSS
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
      <AppContent />
    </AppErrorBoundary>
  )
}

export default App