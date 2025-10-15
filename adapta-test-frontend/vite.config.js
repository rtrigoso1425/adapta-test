import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // <-- AÑADE ESTA LÍNEA

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src"),
    },
  },
})