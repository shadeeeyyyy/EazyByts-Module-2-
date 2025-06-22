import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Your frontend dev server port
    proxy: {
      // Proxy requests starting with /api to your backend
      '/api': {
        target: 'http://localhost:5000', // Your backend server URL
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,      // If your backend is not HTTPS, set this to false
        // rewrite: (path) => path.replace(/^\/api/, ''), // Optional: if your backend API does not have /api prefix
      },
    },
  },
});