import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Permite que o Vite sirva arquivos fora do root
      strict: false,
    },
  },
  build: {
    // Exclui a pasta api do build
    rollupOptions: {
      external: [/^\/api\//],
    },
  },
})
