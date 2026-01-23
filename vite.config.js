import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-google-recaptcha-v3']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-helmet-async', 'sonner'],
          'form-vendor': ['formik', 'yup'],
          'auth-vendor': ['@react-oauth/google', 'react-google-recaptcha-v3'],
          // Large component chunks
          'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-image', '@tiptap/extension-link'],
          'calendar-vendor': ['react-big-calendar', 'date-fns'],
        },
        // Optimize chunk size warnings
        chunkSizeWarningLimit: 1000,
      },
    },
    // Increase chunk size limit
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (optional, can be disabled for smaller builds)
    sourcemap: false,
  },
})
