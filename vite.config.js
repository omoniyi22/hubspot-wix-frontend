// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/dashboard/pages/'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'https://hubspoty.onrender.com',
        changeOrigin: true,
      },
      '/auth': {
        target: 'https://hubspoty.onrender.com',
        changeOrigin: true,
      },
      '/webhook': {
        target: 'https://hubspoty.onrender.com',
        changeOrigin: true,
      },
    },
  },
})