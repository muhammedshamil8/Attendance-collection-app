import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  optimizeDeps: {
    exclude: ['blip-ds/loader']
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        'sw': 'sw.js' 
      }
    }
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
