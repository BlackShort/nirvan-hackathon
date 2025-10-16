import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Allow access from any IP address on the network
    port: 5173,      // Explicit port configuration
    strictPort: true, // Don't try other ports if 5173 is busy
  },
})