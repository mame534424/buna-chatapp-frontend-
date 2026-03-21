import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  define: {
    global: "window", // Polyfill `global` as `window`
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },

  },
  server: {
    proxy: {
      '/api': {
        target: 'http://10.41.45.140:8080', // your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})