import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Fix for some libraries that expect process.env
    'process.env': {},
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@stripe/stripe-js']
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          stripe: ['@stripe/stripe-js']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
