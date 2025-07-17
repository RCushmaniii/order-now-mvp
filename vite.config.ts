import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build optimizations
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Generate source maps only in development
    sourcemap: false,
    
    // Rollup options for better compatibility
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          stripe: ['@stripe/stripe-js'],
          ui: ['@headlessui/react', '@heroicons/react', 'lucide-react']
        }
      }
    }
  },
  
  // Define global constants
  define: {
    // Define NODE_ENV for better tree shaking
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  
  // Server configuration for development
  server: {
    port: 3000,
    open: true,
    host: true
  },
  
  // Preview configuration
  preview: {
    port: 3000,
    open: true
  }
})
