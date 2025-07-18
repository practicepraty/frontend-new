import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': [
        {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        },
        {
          target: 'http://localhost:8001',
          changeOrigin: true,
          secure: false
        },
        {
          target: 'http://localhost:8002',
          changeOrigin: true,
          secure: false
        },
        {
          target: 'http://localhost:8003',
          changeOrigin: true,
          secure: false
        },
        {
          target: 'http://localhost:8004',
          changeOrigin: true,
          secure: false
        }
      ]
    }
  }
})
