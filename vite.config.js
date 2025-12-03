import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://finet-api.vercel.app',
        changeOrigin: true,
        secure: false,
      },
      '/wallet': {
        target: 'https://finet-api.vercel.app',
        changeOrigin: true,
        secure: false,
      },
      '/expense': {
        target: 'https://finet-api.vercel.app',
        changeOrigin: true,
        secure: false,
      },
      // Added User endpoint
      '/user': {
        target: 'https://finet-api.vercel.app',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})