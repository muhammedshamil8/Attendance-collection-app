import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  optimizeDeps: {
    exclude: ['blip-ds/loader']
  },
  plugins: [react()],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        sw: path.resolve(__dirname, '/service-worker.ts')
      },
      output: {
        entryFileNames: 'service-worker.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
      
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
