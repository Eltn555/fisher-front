import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/miniapp': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    allowedHosts: [
      'c975-82-215-102-185.ngrok-free.app'
    ]
  },
  build: {
    outDir: 'dist',
  },
})
